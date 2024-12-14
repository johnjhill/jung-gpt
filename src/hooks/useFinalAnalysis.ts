import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { generateFinalAnalysis } from '@/services/dreamSubmission';
import { updateDreamWithFinalAnalysis } from '@/services/dreamAnalysis';

export const useFinalAnalysis = () => {
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateAnalysis = async (
    analysis: { initialAnalysis: string; questions: string[] },
    dreamId: string,
    answers?: string[],
    skip?: boolean
  ) => {
    try {
      console.log('Generating final analysis...');
      const response = await generateFinalAnalysis(analysis, answers, skip);
      
      console.log('Updating dream with final analysis:', response.finalAnalysis);
      const success = await updateDreamWithFinalAnalysis(dreamId, response.finalAnalysis, answers, skip);
      if (!success) throw new Error('Failed to update dream with final analysis');
      
      await queryClient.invalidateQueries({ queryKey: ['dreams'] });
      
      setFinalAnalysis(response.finalAnalysis);
      return response.finalAnalysis;
    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    finalAnalysis,
    generateAnalysis
  };
};