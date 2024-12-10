import { useState } from 'react';
import { DreamEditor } from '../components/DreamEditor';
import { DreamAnalysis } from '../components/DreamAnalysis';
import { FinalAnalysis } from '../components/FinalAnalysis';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDreamSubmit = async (dream: string) => {
    console.log('Dream submitted:', dream);
    // Placeholder for dream analysis
    setAnalysis({
      initialAnalysis: "This is a placeholder initial analysis.",
      questions: [
        "What emotions did you feel during the dream?",
        "Were there any recurring symbols or themes?",
        "How did the dream end?"
      ]
    });
    setStep(2);
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    console.log('Answers submitted:', answers);
    // Placeholder for final analysis
    setFinalAnalysis("This is a placeholder final analysis based on your responses.");
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dream-blue via-dream-purple to-dream-lavender">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-serif text-white text-center mb-12">
          Dream Analysis Journal
        </h1>
        
        <div className="space-y-8">
          {step === 1 && <DreamEditor onSubmit={handleDreamSubmit} />}
          {step === 2 && <DreamAnalysis analysis={analysis} onAnswer={handleAnswerSubmit} />}
          {step === 3 && <FinalAnalysis analysis={finalAnalysis} />}
        </div>
      </div>
    </div>
  );
};

export default Index;