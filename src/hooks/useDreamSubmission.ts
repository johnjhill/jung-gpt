import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DreamAnalysis } from '@/types/dreams';
import { 
  generateDreamSummary, 
  analyzeDreamContent 
} from '@/services/dreamSubmission';
import { saveDreamWithInitialAnalysis } from '@/services/dreamAnalysis';

export const useDreamSubmission = (
  setAnalysis: (analysis: DreamAnalysis) => void,
  setCurrentDreamId: (id: string) => void,
  setStep: (step: number) => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDreamSubmit = async (dream: string) => {
    try {
      console.log('Starting dream submission process...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const summary = await generateDreamSummary(dream);
      const analysisResponse = await analyzeDreamContent(dream);
      
      const initialAnalysis: DreamAnalysis = {
        initialAnalysis: analysisResponse.initialAnalysis,
        questions: analysisResponse.questions
      };
      
      const dreamRecord = await saveDreamWithInitialAnalysis(dream, user.id, initialAnalysis, summary);
      if (!dreamRecord) throw new Error('Failed to save dream');
      
      console.log('Dream saved successfully:', dreamRecord.id);
      await queryClient.invalidateQueries({ queryKey: ['dreams'] });
      await queryClient.invalidateQueries({ queryKey: ['dreamUsage'] });
      
      setCurrentDreamId(dreamRecord.id);
      setAnalysis(initialAnalysis);
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

  return { handleDreamSubmit };
};