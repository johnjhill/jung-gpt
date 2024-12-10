import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface DreamAnalysis {
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
  console.log('Saving dream with initial analysis:', { dreamContent, analysis, summary });
  
  const analysisJson = {
    initialAnalysis: analysis.initialAnalysis,
    questions: analysis.questions
  };

  const { data: dreamRecord, error: saveError } = await supabase
    .from('dreams')
    .insert({
      dream_content: dreamContent,
      user_id: userId,
      analysis: analysisJson as unknown as Json,
      summary: summary
    })
    .select()
    .single();

  if (saveError) throw saveError;
  console.log('Saved dream with initial analysis:', dreamRecord);
  
  return dreamRecord;
};

export const updateDreamWithFinalAnalysis = async (
  dreamId: string,
  finalAnalysis: string,
  answers?: string[],
  skipped?: boolean
) => {
  console.log('Updating dream with final analysis:', { dreamId, finalAnalysis, answers, skipped });
  
  const { data: currentDream, error: fetchError } = await supabase
    .from('dreams')
    .select('analysis')
    .eq('id', dreamId)
    .single();
    
  if (fetchError) throw fetchError;
  console.log('Current dream data:', currentDream);

  const currentAnalysis = currentDream.analysis as unknown as DreamAnalysis;
  const updatedAnalysis: DreamAnalysis = {
    initialAnalysis: currentAnalysis.initialAnalysis,
    questions: currentAnalysis.questions,
    finalAnalysis,
    ...(answers ? { answers } : {}),
    ...(skipped ? { skipped } : {})
  };

  const { error: updateError } = await supabase
    .from('dreams')
    .update({ analysis: updatedAnalysis as unknown as Json })
    .eq('id', dreamId);
    
  if (updateError) throw updateError;
  console.log('Successfully updated dream with final analysis');
  
  return { success: true };
};