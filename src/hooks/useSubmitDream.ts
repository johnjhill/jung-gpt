import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateDreamSummary, analyzeDreamContent } from '@/services/dreamSubmission';
import { saveDreamWithInitialAnalysis } from '@/services/dreamAnalysis';

export const useSubmitDream = () => {
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitDream = async (dream: string) => {
    try {
      console.log('Submitting new dream...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const summary = await generateDreamSummary(dream);
      const analysisResponse = await analyzeDreamContent(dream);
      
      const dreamRecord = await saveDreamWithInitialAnalysis(dream, user.id, analysisResponse, summary);
      if (!dreamRecord) throw new Error('Failed to save dream');
      
      await queryClient.invalidateQueries({ queryKey: ['dreams'] });
      await queryClient.invalidateQueries({ queryKey: ['dreamUsage'] });
      
      setCurrentDreamId(dreamRecord.id);
      return { analysisResponse, dreamId: dreamRecord.id };
    } catch (error) {
      console.error('Error analyzing dream:', error);
      toast({
        title: "Error",
        description: "Failed to analyze dream. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    currentDreamId,
    submitDream
  };
};