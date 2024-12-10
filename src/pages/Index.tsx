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
    // Mockup analysis for now - will be replaced with actual API call
    setAnalysis({
      initialAnalysis: "Your dream appears to contain several archetypal elements that Jung would find significant. The presence of [key symbols] suggests a connection to the collective unconscious...",
      questions: [
        "How did you feel about [symbol] in your dream?",
        "What personal associations do you have with [location]?",
        "Does this dream remind you of any past experiences?"
      ]
    });
    setStep(2);
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    // Mockup final analysis - will be replaced with actual API call
    setFinalAnalysis("Based on your responses and the initial dream content, this dream appears to be working through important aspects of your individuation process...");
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