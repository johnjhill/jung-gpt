import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { DreamAnalysis } from "@/types/dreams";

export const saveDreamWithInitialAnalysis = async (
  dreamContent: string,
  userId: string,
  analysis: DreamAnalysis,
  summary: string
) => {
  console.log('Saving dream with initial analysis...', { analysis });

  const analysisJson: Json = {
    initialAnalysis: analysis.initialAnalysis,
    questions: analysis.questions,
    answers: analysis.answers || null,
    finalAnalysis: analysis.finalAnalysis || null
  };

  const { data, error } = await supabase
    .from('dreams')
    .insert({
      user_id: userId,
      dream_content: dreamContent,
      analysis: analysisJson,
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
  console.log('Updating dream with final analysis...', { dreamId, updatedAnalysis });

  try {
    const analysisJson: Json = {
      initialAnalysis: updatedAnalysis.initialAnalysis,
      questions: updatedAnalysis.questions,
      answers: updatedAnalysis.answers || null,
      finalAnalysis: updatedAnalysis.finalAnalysis
    };

    console.log('Sending update to database with analysis:', analysisJson);
    
    const { error: updateError } = await supabase
      .from('dreams')
      .update({
        analysis: analysisJson,
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