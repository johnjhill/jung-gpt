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

  const analyzeDream = async (dream: string) => {
    try {
      console.log('Analyzing dream:', dream);
      const response = await fetch('https://ljjhnfmqtkscqbaqtcpe.supabase.co/functions/v1/analyze-dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Dream analysis failed:', errorData);
        throw new Error(errorData.error || 'Failed to analyze dream');
      }

      const data = await response.json();
      console.log('Analysis received:', data);
      
      setAnalysis({
        initialAnalysis: data.initialAnalysis,
        questions: data.followUpQuestions
      });
      setStep(2);
    } catch (error) {
      console.error('Error during dream analysis:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze dream. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDreamSubmit = async (dream: string) => {
    console.log('Dream submitted:', dream);
    await analyzeDream(dream);
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    try {
      console.log('Submitting answers:', answers);
      const response = await fetch('https://ljjhnfmqtkscqbaqtcpe.supabase.co/functions/v1/final-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Final analysis failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate final analysis');
      }

      const data = await response.json();
      console.log('Final analysis received:', data);
      
      setFinalAnalysis(data.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error during final analysis:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate final analysis. Please try again later.",
        variant: "destructive",
      });
    }
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