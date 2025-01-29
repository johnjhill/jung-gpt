import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DreamAnalysis } from '@/types/dreams';
import { generateFinalAnalysis } from '@/services/dreamSubmission';
import { updateDreamWithFinalAnalysis } from '@/services/dreamAnalysis';

export const useFinalAnalysis = (
  setFinalAnalysis: (analysis: string) => void,
  setStep: (step: number) => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAnswerSubmit = async (
    currentDreamId: string,
    analysis: DreamAnalysis,
    answers: string[]
  ) => {
    try {
      console.log('Starting final analysis generation with answers:', { answers });
      const response = await generateFinalAnalysis(analysis, answers);
      console.log('Final analysis response:', response);

      const updatedAnalysis: DreamAnalysis = {
        initialAnalysis: analysis.initialAnalysis,
        questions: analysis.questions,
        answers: answers,
        finalAnalysis: response.finalAnalysis
      };
      
      console.log('Attempting to save updated analysis:', updatedAnalysis);
      const success = await updateDreamWithFinalAnalysis(currentDreamId, updatedAnalysis);
      
      if (!success) {
        throw new Error('Failed to update dream with final analysis');
      }
      
      console.log('Dream updated successfully with final analysis');
      
      await queryClient.invalidateQueries({ queryKey: ['dreams'] });
      await queryClient.invalidateQueries({ queryKey: ['dream', currentDreamId] });
      
      setFinalAnalysis(response.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error in handleAnswerSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async (
    currentDreamId: string,
    analysis: DreamAnalysis
  ) => {
    try {
      console.log('Starting final analysis generation (skip mode)');
      const response = await generateFinalAnalysis(analysis, undefined, true);
      console.log('Final analysis response (skip mode):', response);
      
      const updatedAnalysis: DreamAnalysis = {
        initialAnalysis: analysis.initialAnalysis,
        questions: analysis.questions,
        finalAnalysis: response.finalAnalysis
      };
      
      console.log('Attempting to save skipped analysis:', updatedAnalysis);
      const success = await updateDreamWithFinalAnalysis(currentDreamId, updatedAnalysis);
      
      if (!success) {
        throw new Error('Failed to update dream with final analysis');
      }
      
      console.log('Dream updated successfully with skipped final analysis');
      
      await queryClient.invalidateQueries({ queryKey: ['dreams'] });
      await queryClient.invalidateQueries({ queryKey: ['dream', currentDreamId] });
      
      setFinalAnalysis(response.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error in handleSkip:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleAnswerSubmit, handleSkip };
};