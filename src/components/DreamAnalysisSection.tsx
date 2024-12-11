interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
}

interface DreamAnalysisSectionProps {
  analysis: DreamAnalysis;
  showFinalAnalysis: boolean;
}

export const DreamAnalysisSection = ({ analysis, showFinalAnalysis }: DreamAnalysisSectionProps) => {
  return (
    <div className="bg-white/90 rounded-lg p-8 shadow-lg space-y-8">
      <div className="prose prose-lg max-w-none">
        <section>
          <h2 className="text-2xl font-serif mb-4 text-dream-purple">Initial Analysis</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{analysis.initialAnalysis}</p>
        </section>
        
        {analysis.questions && analysis.answers && (
          <section className="mt-8">
            <h2 className="text-2xl font-serif mb-4 text-dream-purple">Exploration Questions</h2>
            <div className="space-y-4">
              {analysis.questions.map((question, index) => (
                <div key={index} className="bg-dream-lavender/20 p-4 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">{question}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{analysis.answers?.[index]}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {showFinalAnalysis && analysis.finalAnalysis && (
          <section className="mt-8" id="final">
            <h2 className="text-2xl font-serif mb-4 text-dream-purple">Final Analysis</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.finalAnalysis}</p>
          </section>
        )}
      </div>
    </div>
  );
};