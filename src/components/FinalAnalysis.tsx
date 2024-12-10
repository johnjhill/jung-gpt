import { Card } from './ui/card';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';

interface FinalAnalysisProps {
  analysis: string | null;
  onReset: () => void;
}

export const FinalAnalysis = ({ analysis, onReset }: FinalAnalysisProps) => {
  if (!analysis) return null;

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-serif text-dream-purple mb-4">Final Dream Analysis</h2>
      <div className="prose prose-lg mb-8">
        <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
      </div>
      <Button 
        onClick={onReset}
        className="w-full bg-dream-purple hover:bg-dream-purple/90 text-white gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Analyze Another Dream
      </Button>
    </Card>
  );
};