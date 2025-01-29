import { useAnalysisState } from './useAnalysisState';
import { useDreamSubmission } from './useDreamSubmission';
import { useFinalAnalysis } from './useFinalAnalysis';

export const useDreamAnalysis = () => {
  const {
    step,
    setStep,
    analysis,
    setAnalysis,
    finalAnalysis,
    setFinalAnalysis,
    currentDreamId,
    setCurrentDreamId,
    resetState
  } = useAnalysisState();

  const { handleDreamSubmit } = useDreamSubmission(
    setAnalysis,
    setCurrentDreamId,
    setStep
  );

  const { handleAnswerSubmit, handleSkip } = useFinalAnalysis(
    setFinalAnalysis,
    setStep
  );

  return {
    step,
    analysis,
    finalAnalysis,
    handleDreamSubmit,
    handleAnswerSubmit: (answers: string[]) => {
      if (!analysis || !currentDreamId) {
        throw new Error('Missing required data for final analysis');
      }
      return handleAnswerSubmit(currentDreamId, analysis, answers);
    },
    handleSkip: () => {
      if (!analysis || !currentDreamId) {
        throw new Error('Missing required data for final analysis');
      }
      return handleSkip(currentDreamId, analysis);
    },
    handleReset: resetState
  };
};