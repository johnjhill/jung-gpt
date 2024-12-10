import { useState } from 'react';
import { DreamEditor } from '../components/DreamEditor';
import { DreamAnalysis } from '../components/DreamAnalysis';
import { FinalAnalysis } from '../components/FinalAnalysis';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

const Index = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDreamSubmit = async (dream: string) => {
    try {
      console.log('Submitting dream for analysis:', dream);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: dreamRecord, error: saveError } = await supabase
        .from('dreams')
        .insert({
          dream_content: dream,
          user_id: user.id
        })
        .select()
        .single();

      if (saveError) throw saveError;
      setCurrentDreamId(dreamRecord.id);
      
      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { dreamContent: dream }
      });

      if (error) throw error;
      console.log('Received analysis:', response);
      
      await supabase
        .from('dreams')
        .update({ 
          analysis: { 
            initialAnalysis: response.initialAnalysis,
            questions: response.questions
          }
        })
        .eq('id', dreamRecord.id);
      
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
        const { error: updateError } = await supabase
          .from('dreams')
          .update({ 
            analysis: { 
              ...analysis,
              answers,
              finalAnalysis: response.finalAnalysis
            }
          })
          .eq('id', currentDreamId);
          
        if (updateError) throw updateError;
        console.log('Saved final analysis to database');
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
        const { error: updateError } = await supabase
          .from('dreams')
          .update({ 
            analysis: { 
              ...analysis,
              skipped: true,
              finalAnalysis: response.finalAnalysis
            }
          })
          .eq('id', currentDreamId);
          
        if (updateError) throw updateError;
        console.log('Saved final analysis to database');
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
    <div className="min-h-screen bg-gradient-to-b from-dream-blue via-dream-purple to-dream-lavender">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-white">
            Dream Analysis Journal
          </h1>
          <Link to="/history">
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" />
              Dream History
            </Button>
          </Link>
        </div>
        
        <div className="space-y-8">
          {step === 1 && <DreamEditor onSubmit={handleDreamSubmit} />}
          {step === 2 && <DreamAnalysis analysis={analysis} onAnswer={handleAnswerSubmit} onSkip={handleSkip} />}
          {step === 3 && <FinalAnalysis analysis={finalAnalysis} onReset={handleReset} />}
        </div>
      </div>
    </div>
  );
};

export default Index;