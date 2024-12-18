import { supabase } from "@/integrations/supabase/client";

export const generateDreamSummary = async (dreamContent: string) => {
  try {
    console.log('Generating dream summary...');
    const { data: response, error } = await supabase.functions.invoke('generateDreamSummary', {
      body: { dreamContent }
    });
    
    if (error) {
      console.error('Error in generateDreamSummary:', error);
      throw error;
    }
    
    console.log('Generated summary:', response.summary);
    return response.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Dream Entry';
  }
};

export const analyzeDreamContent = async (dreamContent: string) => {
  console.log('Submitting dream for analysis:', dreamContent);
  const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
    body: { dreamContent }
  });
  
  if (error) {
    console.error('Error in analyzeDreamContent:', error);
    throw error;
  }
  
  console.log('Received analysis:', response);
  return response;
};

export const generateFinalAnalysis = async (
  analysis: { initialAnalysis: string; questions: string[] },
  answers?: string[],
  skipQuestions?: boolean
) => {
  console.log('Generating final analysis...', {
    hasAnalysis: !!analysis,
    answersLength: answers?.length,
    skipQuestions
  });
  
  const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
    body: { 
      previousAnalysis: analysis,
      userAnswers: answers,
      skipQuestions
    }
  });

  if (error) {
    console.error('Error in generateFinalAnalysis:', error);
    throw error;
  }
  
  console.log('Received final analysis:', response);
  return response;
};