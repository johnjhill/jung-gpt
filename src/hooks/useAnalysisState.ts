import { useState } from 'react';
import { DreamAnalysis } from '@/types/dreams';

export const useAnalysisState = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);

  const resetState = () => {
    setStep(1);
    setAnalysis(null);
    setFinalAnalysis(null);
    setCurrentDreamId(null);
  };

  return {
    step,
    setStep,
    analysis,
    setAnalysis,
    finalAnalysis,
    setFinalAnalysis,
    currentDreamId,
    setCurrentDreamId,
    resetState,
  };
};