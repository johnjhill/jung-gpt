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
    const { data: currentDream, error: fetchError } = await supabase
      .from('dreams')
      .select('analysis')
      .eq('id', dreamId)
      .single();

    if (fetchError || !currentDream) {
      console.error('No dream found with id:', dreamId);
      return false;
    }

    // Safely type cast the analysis data
    const analysis = currentDream.analysis as Json;
    if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
      console.error('Invalid analysis data structure');
      return false;
    }

    // Verify the analysis object has the required properties
    const currentAnalysis = analysis as unknown as DreamAnalysis;
    if (!currentAnalysis.initialAnalysis || !currentAnalysis.questions) {
      console.error('Analysis data missing required properties');
      return false;
    }

    const updatedAnalysis: DreamAnalysis = {
      ...currentAnalysis,
      finalAnalysis,
      answers: answers || [],
      skipped: skipped || false
    };

    console.log('Updating dream analysis:', updatedAnalysis);

    const { error: updateError } = await supabase
      .from('dreams')
      .update({
        analysis: updatedAnalysis as unknown as Json,
      })
      .eq('id', dreamId);

    if (updateError) {
      console.error('Error updating dream:', updateError);
      return false;
    }
    
    console.log('Dream updated successfully with final analysis');
    return true;
  } catch (error) {
    console.error('Error updating dream:', error);
    return false;
  }
};