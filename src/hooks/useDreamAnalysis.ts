import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateDreamSummary, 
  analyzeDreamContent, 
  generateFinalAnalysis 
} from '@/services/dreamSubmission';
import { 
  saveDreamWithInitialAnalysis, 
  updateDreamWithFinalAnalysis 
} from '@/services/dreamAnalysis';

export const useDreamAnalysis = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDreamSubmit = async (dream: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const summary = await generateDreamSummary(dream);
      const analysisResponse = await analyzeDreamContent(dream);
      
      const dreamRecord = await saveDreamWithInitialAnalysis(dream, user.id, analysisResponse, summary);
      if (!dreamRecord) throw new Error('Failed to save dream');
      
      await queryClient.invalidateQueries({ queryKey: ['dreamUsage'] });
      
      setCurrentDreamId(dreamRecord.id);
      setAnalysis(analysisResponse);
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
      const response = await generateFinalAnalysis(analysis!, answers);
      
      if (currentDreamId) {
        const success = await updateDreamWithFinalAnalysis(currentDreamId, response.finalAnalysis, answers);
        if (!success) throw new Error('Failed to update dream with final analysis');
      }
      
      await queryClient.invalidateQueries({ queryKey: ['dreamUsage'] });
      
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
      const response = await generateFinalAnalysis(analysis!, undefined, true);
      
      if (currentDreamId) {
        const success = await updateDreamWithFinalAnalysis(currentDreamId, response.finalAnalysis, undefined, true);
        if (!success) throw new Error('Failed to update dream with final analysis');
      }
      
      await queryClient.invalidateQueries({ queryKey: ['dreamUsage'] });
      
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

  return {
    step,
    analysis,
    finalAnalysis,
    handleDreamSubmit,
    handleAnswerSubmit,
    handleSkip,
    handleReset
  };
};