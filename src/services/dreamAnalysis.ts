import { supabase } from '@/integrations/supabase/client';

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
  analysis: { initialAnalysis: string; questions: string[] }
) => {
  console.log('Saving dream with initial analysis:', { dreamContent, analysis });
  
  const { data: dreamRecord, error: saveError } = await supabase
    .from('dreams')
    .insert({
      dream_content: dreamContent,
      user_id: userId,
      analysis: analysis as DreamAnalysis
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
  
  // First, get the current dream record to preserve existing analysis
  const { data: currentDream, error: fetchError } = await supabase
    .from('dreams')
    .select('analysis')
    .eq('id', dreamId)
    .single();
    
  if (fetchError) throw fetchError;
  console.log('Current dream data:', currentDream);

  const updatedAnalysis: DreamAnalysis = {
    initialAnalysis: currentDream.analysis?.initialAnalysis || '',
    questions: currentDream.analysis?.questions || [],
    finalAnalysis,
    ...(answers ? { answers } : {}),
    ...(skipped ? { skipped } : {})
  };

  const { error: updateError } = await supabase
    .from('dreams')
    .update({ analysis: updatedAnalysis })
    .eq('id', dreamId);
    
  if (updateError) throw updateError;
  console.log('Successfully updated dream with final analysis');
  
  return { success: true };
};