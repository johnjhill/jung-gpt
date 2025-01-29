import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
}

export const saveDreamWithInitialAnalysis = async (
  dreamContent: string,
  userId: string,
  analysis: DreamAnalysis,
  summary: string
) => {
  console.log('Saving dream with initial analysis...', { analysis });

  const { data, error } = await supabase
    .from('dreams')
    .insert({
      user_id: userId,
      dream_content: dreamContent,
      analysis: analysis as unknown as Json,
      summary: summary,
      dream_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving dream:', error);
    throw error;
  }
  console.log('Dream saved successfully:', data);
  return data;
};

export const updateDreamWithFinalAnalysis = async (
  dreamId: string,
  updatedAnalysis: DreamAnalysis
): Promise<boolean> => {
  console.log('Updating dream with analysis...', { 
    dreamId, 
    updatedAnalysis 
  });

  try {
    const { error: updateError } = await supabase
      .from('dreams')
      .update({
        analysis: updatedAnalysis as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq('id', dreamId);

    if (updateError) {
      console.error('Error updating dream with final analysis:', updateError);
      return false;
    }

    console.log('Successfully saved final analysis to database');
    return true;
  } catch (error) {
    console.error('Error in updateDreamWithFinalAnalysis:', error);
    return false;
  }
};