import { supabase } from "@/integrations/supabase/client";

export const saveDreamWithInitialAnalysis = async (
  dreamContent: string,
  userId: string,
  analysis: { initialAnalysis: string; questions: string[] },
  summary: string
) => {
  console.log('Saving dream with initial analysis...');
  const { data, error } = await supabase
    .from('dreams')
    .insert({
      user_id: userId,
      dream_content: dreamContent,
      analysis: analysis as unknown as JSON,
      summary: summary
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Dream saved:', data);
  return data;
};

export const updateDreamWithFinalAnalysis = async (
  dreamId: string,
  finalAnalysis: string,
  answers?: string[],
  skipped?: boolean
) => {
  console.log('Updating dream with final analysis...');
  const currentAnalysis = await getDreamAnalysis(dreamId);
  
  if (!currentAnalysis) {
    throw new Error('No analysis found for dream');
  }

  const updatedAnalysis = {
    ...currentAnalysis,
    finalAnalysis,
    answers: answers || [],
    skipped: skipped || false
  };

  const { data, error } = await supabase
    .from('dreams')
    .update({
      analysis: updatedAnalysis as unknown as JSON
    })
    .eq('id', dreamId)
    .select()
    .single();

  if (error) throw error;
  console.log('Dream updated:', data);
  return data;
};

const getDreamAnalysis = async (dreamId: string) => {
  const { data, error } = await supabase
    .from('dreams')
    .select('analysis')
    .eq('id', dreamId)
    .single();

  if (error) throw error;
  return data.analysis;
};