import { Card } from './ui/card';

interface FinalAnalysisProps {
  analysis: string | null;
}

export const FinalAnalysis = ({ analysis }: FinalAnalysisProps) => {
  if (!analysis) return null;

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-serif text-dream-purple mb-4">Final Dream Analysis</h2>
      <div className="prose prose-lg">
        <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
      </div>
    </Card>
  );
};