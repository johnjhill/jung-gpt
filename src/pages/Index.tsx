import { useState } from 'react';
import OpenAI from 'openai';
import { DreamEditor } from '../components/DreamEditor';
import { DreamAnalysis } from '../components/DreamAnalysis';
import { FinalAnalysis } from '../components/FinalAnalysis';
import { useToast } from '../hooks/use-toast';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const Index = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeDream = async (dream: string) => {
    try {
      console.log('Analyzing dream:', dream);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a dream analyst. Analyze the dream and provide an initial analysis followed by 3 follow-up questions to better understand the dream's meaning. Format your response as JSON with 'initialAnalysis' and 'followUpQuestions' fields."
          },
          {
            role: "user",
            content: dream
          }
        ],
        response_format: { type: "json_object" }
      });

      console.log('OpenAI response:', response);
      
      const result = JSON.parse(response.choices[0].message.content);
      
      setAnalysis({
        initialAnalysis: result.initialAnalysis,
        questions: result.followUpQuestions
      });
      setStep(2);
    } catch (error) {
      console.error('Error during dream analysis:', error);
      toast({
        title: "Error",
        description: "Failed to analyze dream. Please ensure your OpenAI API key is set and try again.",
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
      console.log('Processing answers:', answers);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a dream analyst. Based on the answers to follow-up questions, provide a final comprehensive analysis of the dream's meaning. Format your response as JSON with a 'finalAnalysis' field."
          },
          {
            role: "user",
            content: JSON.stringify({ answers })
          }
        ],
        response_format: { type: "json_object" }
      });

      console.log('Final analysis response:', response);
      
      const result = JSON.parse(response.choices[0].message.content);
      
      setFinalAnalysis(result.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error during final analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
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