import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DreamCardButtonsProps {
  dreamId: string;
  hasFinalAnalysis: boolean;
  loadingDreamId: string | null;
  handleViewAnalysis: (dreamId: string) => Promise<void>;
}

const DreamCardButtons = ({ 
  dreamId, 
  hasFinalAnalysis, 
  loadingDreamId,
  handleViewAnalysis 
}: DreamCardButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/dream/${dreamId}`);
        }}
        variant="default"
        className="bg-dream-purple hover:bg-dream-purple/90 text-white"
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        View Full Analysis
      </Button>
      
      {hasFinalAnalysis && (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewAnalysis(dreamId);
            }}
            variant="outline"
            disabled={loadingDreamId === dreamId}
            className="border-dream-purple text-dream-purple hover:bg-dream-purple/10"
          >
            {loadingDreamId === dreamId ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                See Final Analysis
              </>
            )}
          </Button>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dream/${dreamId}#final`);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Final Analysis
          </Button>
        </>
      )}
    </div>
  );
};

export default DreamCardButtons;