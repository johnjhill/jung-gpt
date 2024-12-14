import { useState } from 'react';
import { useSubmitDream } from './useSubmitDream';
import { useFinalAnalysis } from './useFinalAnalysis';

export const useDreamAnalysis = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  
  const { currentDreamId, submitDream } = useSubmitDream();
  const { finalAnalysis, generateAnalysis } = useFinalAnalysis();

  const handleDreamSubmit = async (dream: string) => {
    const { analysisResponse } = await submitDream(dream);
    setAnalysis(analysisResponse);
    setStep(2);
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    if (!analysis || !currentDreamId) return;
    await generateAnalysis(analysis, currentDreamId, answers);
    setStep(3);
  };

  const handleSkip = async () => {
    if (!analysis || !currentDreamId) return;
    await generateAnalysis(analysis, currentDreamId, undefined, true);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setAnalysis(null);
  };

  return {
    step,
    analysis,
    finalAnalysis,
    handleDreamSubmit,
    handleAnswerSubmit,
    handleSkip,
    handleReset
  };
};