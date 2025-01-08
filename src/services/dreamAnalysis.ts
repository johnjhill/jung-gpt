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
  console.log('Dream saved:', data);
  return data;
};

export const updateDreamWithFinalAnalysis = async (
  dreamId: string,
  finalAnalysis: string,
  answers?: string[],
  skipped?: boolean
): Promise<boolean> => {
  console.log('Updating dream with final analysis...', { 
    dreamId, 
    finalAnalysis, 
    answers, 
    skipped 
  });

  try {
    // First, fetch the current dream data
    const { data: currentDream, error: fetchError } = await supabase
      .from('dreams')
      .select('analysis')
      .eq('id', dreamId)
      .single();

    if (fetchError) {
      console.error('Error fetching dream:', fetchError);
      return false;
    }

    if (!currentDream || !currentDream.analysis) {
      console.error('No dream or analysis found:', dreamId);
      return false;
    }

    // Type check and validate the analysis object
    const currentAnalysis = currentDream.analysis as DreamAnalysis;
    
    console.log('Current analysis before update:', currentAnalysis);

    const updatedAnalysis: DreamAnalysis = {
      initialAnalysis: currentAnalysis.initialAnalysis,
      questions: currentAnalysis.questions,
      answers: answers || [],
      finalAnalysis: finalAnalysis,
      skipped: skipped || false
    };

    console.log('Saving updated analysis:', updatedAnalysis);

    // Update the dream with the new analysis
    const { error: updateError } = await supabase
      .from('dreams')
      .update({
        analysis: updatedAnalysis,
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