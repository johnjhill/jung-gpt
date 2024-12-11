import { useState } from 'react';
import { DreamEditor } from '../components/DreamEditor';
import { DreamAnalysis } from '../components/DreamAnalysis';
import { FinalAnalysis } from '../components/FinalAnalysis';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { saveDreamWithInitialAnalysis, updateDreamWithFinalAnalysis } from '@/services/dreamAnalysis';
import { UsageTracker } from '@/components/UsageTracker';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bell } from 'lucide-react';

const Index = () => {
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ initialAnalysis: string; questions: string[] } | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(null);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { toast } = useToast();

  const generateDreamSummary = async (dreamContent: string) => {
    try {
      console.log('Generating dream summary...');
      const { data: response, error } = await supabase.functions.invoke('generateDreamSummary', {
        body: { dreamContent }
      });
      
      if (error) throw error;
      console.log('Generated summary:', response.summary);
      return response.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Dream Entry';
    }
  };

  const handleDreamSubmit = async (dream: string) => {
    try {
      console.log('Submitting dream for analysis:', dream);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate summary first
      const summary = await generateDreamSummary(dream);

      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { dreamContent: dream }
      });

      if (error) throw error;
      console.log('Received analysis:', response);
      
      const dreamRecord = await saveDreamWithInitialAnalysis(dream, user.id, response, summary);
      setCurrentDreamId(dreamRecord.id);
      setAnalysis(response);
      setStep(2);
    } catch (error) {
      console.error('Error analyzing dream:', error);
      toast({
        title: "Error",
        description: "Failed to analyze dream. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmit = async (answers: string[]) => {
    try {
      console.log('Submitting answers:', answers);
      
      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { 
          previousAnalysis: analysis,
          userAnswers: answers
        }
      });

      if (error) throw error;
      console.log('Received final analysis:', response);
      
      if (currentDreamId) {
        await updateDreamWithFinalAnalysis(currentDreamId, response.finalAnalysis, answers);
      }
      
      setFinalAnalysis(response.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    try {
      console.log('Skipping additional questions');
      
      const { data: response, error } = await supabase.functions.invoke('analyzeDream', {
        body: { 
          previousAnalysis: analysis,
          skipQuestions: true
        }
      });

      if (error) throw error;
      console.log('Received final analysis:', response);
      
      if (currentDreamId) {
        await updateDreamWithFinalAnalysis(currentDreamId, response.finalAnalysis, undefined, true);
      }
      
      setFinalAnalysis(response.finalAnalysis);
      setStep(3);
    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate final analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnalysis(null);
    setFinalAnalysis(null);
    setCurrentDreamId(null);
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-serif text-white mb-12 text-center">
        Dream Journal
      </h1>
      
      <div className="space-y-8 mb-12">
        <Collapsible
          open={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              <Bell className="mr-2 h-4 w-4" />
              Manage Journal Reminders
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <NotificationPreferences />
          </CollapsibleContent>
        </Collapsible>

        <UsageTracker />
        
        {step === 1 && <DreamEditor onSubmit={handleDreamSubmit} />}
        {step === 2 && <DreamAnalysis analysis={analysis} onAnswer={handleAnswerSubmit} onSkip={handleSkip} />}
        {step === 3 && <FinalAnalysis analysis={finalAnalysis} onReset={handleReset} />}
      </div>

      <Card className="bg-white/90 p-6 shadow-lg">
        <h2 className="text-2xl font-serif mb-4 text-gray-800">About Dream Analysis</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is">
            <AccordionTrigger className="text-lg font-medium">What is Dream Analysis?</AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed">
              Dream analysis is a method of psychological interpretation that helps uncover the hidden meanings and messages in our dreams. This app uses principles from Jungian psychology to analyze your dreams and provide meaningful insights into your subconscious mind.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="jungian">
            <AccordionTrigger className="text-lg font-medium">Jungian Dream Analysis</AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed">
              Carl Jung believed that dreams are a window into the unconscious mind, revealing universal symbols and archetypes that can help us understand ourselves better. Our analysis combines Jungian principles with modern psychological insights to help you explore the deeper meaning of your dreams.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-it-works">
            <AccordionTrigger className="text-lg font-medium">How Does It Work?</AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed">
              <ol className="list-decimal list-inside space-y-2">
                <li>Record your dream in detail using the editor below</li>
                <li>Our AI analyzes your dream using Jungian principles</li>
                <li>Answer follow-up questions to deepen the analysis</li>
                <li>Receive a comprehensive interpretation of your dream</li>
                <li>Track patterns and insights in your dream journal</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default Index;