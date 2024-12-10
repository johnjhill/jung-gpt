import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, FastForward } from 'lucide-react';

interface DreamAnalysisProps {
  analysis: {
    initialAnalysis: string;
    questions: string[];
  } | null;
  onAnswer: (answers: string[]) => void;
  onSkip: () => void;
}

export const DreamAnalysis = ({ analysis, onAnswer, onSkip }: DreamAnalysisProps) => {
  const [answers, setAnswers] = useState<string[]>(Array(3).fill(''));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  if (!analysis) return null;

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(answer => !answer.trim())) {
      return;
    }
    setIsProcessing(true);
    try {
      await onAnswer(answers);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await onSkip();
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-dream-purple mb-4">Initial Analysis</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{analysis.initialAnalysis}</p>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-serif text-dream-purple">Exploring Deeper</h3>
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={isSkipping}
            className="gap-2 text-dream-purple hover:text-dream-purple/90 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isSkipping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Skipping...
              </>
            ) : (
              <>
                <FastForward className="h-4 w-4" />
                Skip to Final Analysis
              </>
            )}
          </Button>
        </div>
        <div className="space-y-4">
          {analysis.questions.map((question, index) => (
            <div key={index} className="p-4 bg-dream-lavender/50 rounded-lg">
              <p className="text-gray-800 mb-2">{question}</p>
              <Textarea 
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Your response..."
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full bg-dream-purple hover:bg-dream-purple/90 text-white"
        disabled={answers.some(answer => !answer.trim()) || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Continue Analysis'
        )}
      </Button>
    </Card>
  );
};