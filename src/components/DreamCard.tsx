import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import DreamCardButtons from './DreamCardButtons';

interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
}

interface DreamCardProps {
  dream: {
    id: string;
    dream_content: string;
    analysis: DreamAnalysis | null;
    created_at: string;
    summary: string;
  };
  loadingDreamId: string | null;
  handleViewAnalysis: (dreamId: string) => Promise<void>;
}

const DreamCard = ({ dream, loadingDreamId, handleViewAnalysis }: DreamCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dream/${dream.id}`);
  };

  return (
    <Card 
      key={dream.id} 
      className="p-6 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-serif text-gray-900">{dream.summary}</h2>
        <p className="text-sm text-gray-500">
          {format(new Date(dream.created_at), 'MMMM d, yyyy')}
        </p>
      </div>
      <div className="prose prose-sm">
        <p className="text-gray-700 mb-4 line-clamp-3">{dream.dream_content}</p>
        
        {dream.analysis && (
          <div className="mt-4">
            {dream.analysis.finalAnalysis ? (
              <>
                <h4 className="text-lg font-serif mb-2 text-gray-900">Final Analysis</h4>
                <p className="text-gray-700 mb-6 line-clamp-4">
                  {dream.analysis.finalAnalysis}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-lg font-serif mb-2 text-gray-900">Initial Analysis</h4>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {dream.analysis.initialAnalysis}
                </p>
              </>
            )}
            
            <DreamCardButtons 
              dreamId={dream.id}
              hasFinalAnalysis={!!dream.analysis.finalAnalysis}
              loadingDreamId={loadingDreamId}
              handleViewAnalysis={handleViewAnalysis}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default DreamCard;