import { useState } from 'react';
import { DreamEditor } from '../components/DreamEditor';
import { DreamAnalysis } from '../components/DreamAnalysis';
import { FinalAnalysis } from '../components/FinalAnalysis';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDreamSubmit = async (dream: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: 'Error',
          description: 'Please sign in to save dreams.',
          variant: 'destructive',
        });
        return;
      }

      // Create a simple placeholder analysis
      const placeholderAnalysis = {
        initialAnalysis: "Dream recording saved successfully. The AI analysis feature is currently disabled.",
        questions: [
          "How did you feel during this dream?",
          "What do you think triggered this dream?",
          "Did any symbols or elements in the dream feel particularly significant to you?"
        ]
      };

      setAnalysis(placeholderAnalysis);
      setStep(2);

      // Save dream to database with user_id
      const { error: dbError } = await supabase
        .from('dreams')
        .insert({
          dream_content: dream,
          analysis: placeholderAnalysis,
          user_id: user.id
        });

      if (dbError) {
        console.error('Error saving dream:', dbError);
        toast({
          title: 'Error',
          description: 'Failed to save your dream. Please try again.',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Error saving dream:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your dream. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    try {
      // Create a simple placeholder final analysis
      const finalAnalysisText = "Thank you for reflecting on your dream. Your responses have been saved. The AI analysis feature is currently disabled.";
      setFinalAnalysis(finalAnalysisText);
      setStep(3);

    } catch (error) {
      console.error('Error processing answers:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your responses. Please try again.',
        variant: 'destructive',
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