import { useState } from 'react';
import { DreamEditor } from './DreamEditor';
import { DreamAnalysis } from './DreamAnalysis';
import { FinalAnalysis } from './FinalAnalysis';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { saveDreamWithInitialAnalysis, updateDreamWithFinalAnalysis } from '@/services/dreamAnalysis';

export const DreamJournal = ({
  monthlyDreamCount,
  subscriptionTier,
}: {
  monthlyDreamCount?: number;
  subscriptionTier?: string;
}) => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateDreamSummary = async (dreamContent: string) => {
    try {
      console.log('Generating dream summary...');
      const { data: response, error } = await supabase.functions.invoke('generateDreamSummary', {
        body: { dreamContent }
      });
      
      if (error) throw error;
      console.log('Generated summary:', response.summary);
      return response.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Dream Entry';
    }
  };

  const handleDreamSubmit = async (dream: string) => {
    try {
      console.log('Submitting dream for analysis:', dream);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check subscription limits
      if (subscriptionTier === 'free' && (monthlyDreamCount ?? 0) >= 3) {
        toast({
          title: "Dream Analysis Limit Reached",
          description: "You've reached your monthly limit of 3 dream analyses. Upgrade to premium for unlimited analyses!",
          variant: "destructive",
        });
        return;
      }

      const summary = await generateDreamSummary(dream);
      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { dreamContent: dream }
      });

      if (error) throw error;
      console.log('Received analysis:', response);
      
      const dreamRecord = await saveDreamWithInitialAnalysis(dream, user.id, response, summary);
      setCurrentDreamId(dreamRecord.id);
      setAnalysis(response);
      setStep(2);
    } catch (error) {
      console.error('Error analyzing dream:', error);
      toast({
        title: "Error",
        description: "Failed to analyze dream. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    try {
      console.log('Submitting answers:', answers);
      
      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { 
          previousAnalysis: analysis,
          userAnswers: answers
        }
      });

      if (error) throw error;
      console.log('Received final analysis:', response);
      
      if (currentDreamId) {
        await updateDreamWithFinalAnalysis(currentDreamId, response.finalAnalysis, answers);
      }
      
      setFinalAnalysis(response.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    try {
      console.log('Skipping additional questions');
      
      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { 
          previousAnalysis: analysis,
          skipQuestions: true
        }
      });

      if (error) throw error;
      console.log('Received final analysis:', response);
      
      if (currentDreamId) {
        await updateDreamWithFinalAnalysis(currentDreamId, response.finalAnalysis, undefined, true);
      }
      
      setFinalAnalysis(response.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnalysis(null);
    setFinalAnalysis(null);
    setCurrentDreamId(null);
  };

  return (
    <div className="space-y-8">
      {step === 1 && <DreamEditor onSubmit={handleDreamSubmit} />}
      {step === 2 && <DreamAnalysis analysis={analysis} onAnswer={handleAnswerSubmit} onSkip={handleSkip} />}
      {step === 3 && <FinalAnalysis analysis={finalAnalysis} onReset={handleReset} />}
    </div>
  );
};