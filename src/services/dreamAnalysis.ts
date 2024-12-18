import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
  skipped?: boolean;
}

export const saveDreamWithInitialAnalysis = async (
  dreamContent: string,
  userId: string,
  analysis: { initialAnalysis: string; questions: string[] },
  summary: string
) => {
  console.log('Saving dream with initial analysis...');
  const analysisJson: DreamAnalysis = {
    initialAnalysis: analysis.initialAnalysis,
    questions: analysis.questions
  };

  const { data, error } = await supabase
    .from('dreams')
    .insert({
      user_id: userId,
      dream_content: dreamContent,
      analysis: analysisJson as unknown as Json,
      summary: summary,
      dream_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving dream:', error);
    throw error;
  }
  console.log('Dream saved:', data);
  return data;
};

export const updateDreamWithFinalAnalysis = async (
  dreamId: string,
  finalAnalysis: string,
  answers?: string[],
  skipped?: boolean
): Promise<boolean> => {
  console.log('Updating dream with final analysis...', { dreamId, finalAnalysis });
  try {
    // First, fetch the current dream record to get existing analysis
    const { data: currentDream, error: fetchError } = await supabase
      .from('dreams')
      .select('analysis')
      .eq('id', dreamId)
      .single();

    if (fetchError) throw fetchError;
    if (!currentDream) {
      console.error('No dream found with id:', dreamId);
      return false;
    }

    // Get the current analysis and update it with new data
    const currentAnalysis = currentDream.analysis as unknown as DreamAnalysis;
    const updatedAnalysis: DreamAnalysis = {
      ...currentAnalysis,
      finalAnalysis,
      answers: answers || [],
      skipped: skipped || false
    };

    console.log('Updating dream analysis:', updatedAnalysis);

    // Update the dream record with the new analysis
    const { error: updateError } = await supabase
      .from('dreams')
      .update({
        analysis: updatedAnalysis as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq('id', dreamId);

    if (updateError) {
      console.error('Error updating dream:', updateError);
      throw updateError;
    }
    
    console.log('Dream updated successfully with final analysis');
    return true;
  } catch (error) {
    console.error('Error updating dream:', error);
    return false;
  }
};