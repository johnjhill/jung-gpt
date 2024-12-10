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
          description: 'Please sign in to analyze dreams.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { dream }
      });

      if (error) {
        console.error('Dream analysis error:', error);
        
        // Check if it's the service unavailable error
        if (error.status === 503) {
          toast({
            title: 'Service Unavailable',
            description: 'The dream analysis service is temporarily unavailable. Please try again later.',
            variant: 'destructive',
            duration: 5000,
          });
          return;
        }

        // Handle other errors
        toast({
          title: 'Error',
          description: 'Failed to analyze your dream. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Dream analysis response:', data);
      setAnalysis(data);
      setStep(2);

      // Save dream to database with user_id
      const { error: dbError } = await supabase
        .from('dreams')
        .insert({
          dream_content: dream,
          analysis: data,
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
      console.error('Error analyzing dream:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze your dream. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    try {
      // Combine the initial analysis and answers for final analysis
      const prompt = `Based on the initial dream analysis: "${analysis?.initialAnalysis}" 
        and the dreamer's responses to follow-up questions:
        ${analysis?.questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n')}
        
        Please provide a final, comprehensive analysis of the dream's meaning and significance.`;

      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { dream: prompt }
      });

      if (error) {
        // Check if it's the service unavailable error
        if (error.status === 503) {
          toast({
            title: 'Service Unavailable',
            description: 'The dream analysis service is temporarily unavailable. Please try again later.',
            variant: 'destructive',
            duration: 5000,
          });
          return;
        }

        throw error;
      }

      const finalAnalysisText = data.initialAnalysis; // Use the initial analysis field for the final response
      setFinalAnalysis(finalAnalysisText);
      setStep(3);

    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate final analysis. Please try again.',
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