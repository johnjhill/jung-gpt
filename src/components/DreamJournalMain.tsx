import { DreamEditor } from './DreamEditor';
import { DreamAnalysis } from './DreamAnalysis';
import { FinalAnalysis } from './FinalAnalysis';
import { useDreamAnalysis } from '@/hooks/useDreamAnalysis';

export const DreamJournalMain = () => {
  const {
    step,
    analysis,
    finalAnalysis,
    handleDreamSubmit,
    handleAnswerSubmit,
    handleSkip,
    handleReset
  } = useDreamAnalysis();

  return (
    <div className="space-y-8 mb-12">
      {step === 1 && <DreamEditor onSubmit={handleDreamSubmit} />}
      {step === 2 && <DreamAnalysis analysis={analysis} onAnswer={handleAnswerSubmit} onSkip={handleSkip} />}
      {step === 3 && <FinalAnalysis analysis={finalAnalysis} onReset={handleReset} />}
    </div>
  );
};