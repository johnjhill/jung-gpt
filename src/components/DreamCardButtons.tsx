import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UpgradePrompt } from './UpgradePrompt';
import { DreamAnalysisButtons } from './DreamAnalysisButtons';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDreamUsage } from '@/hooks/useDreamUsage';

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: usageData } = useDreamUsage();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      console.log('Fetching user profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      console.log('User subscription tier:', data.subscription_tier);
      
      return data;
    }
  });

  const handleAnalysisClick = async () => {
    if (!hasFinalAnalysis && profile?.subscription_tier === 'free' && usageData && usageData.count >= usageData.limit) {
      toast({
        title: "Premium Feature",
        description: "You've reached your monthly limit. Upgrade to Premium to analyze more dreams!",
        variant: "default",
        action: <UpgradePrompt />
      });
      return;
    }
    await handleViewAnalysis(dreamId);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dream/${dreamId}`);
  };

  return (
    <div className="flex flex-wrap gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
      <Button
        onClick={handleViewDetails}
        variant="default"
        className="bg-dream-purple hover:bg-dream-purple/90 text-white"
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        View Dream Details
      </Button>

      {hasFinalAnalysis && (
        <DreamAnalysisButtons
          dreamId={dreamId}
          loadingDreamId={loadingDreamId}
          handleViewAnalysis={handleAnalysisClick}
        />
      )}
    </div>
  );
};

export default DreamCardButtons;