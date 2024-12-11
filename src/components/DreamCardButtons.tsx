import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UpgradePrompt } from './UpgradePrompt';
import { DreamAnalysisButtons } from './DreamAnalysisButtons';

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

  const handleAnalysisClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile?.subscription_tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to analyze more dreams and unlock all features!",
        variant: "default",
        action: <UpgradePrompt />
      });
      return;
    }
    await handleViewAnalysis(dreamId);
  };

  return (
    <div className="flex flex-wrap gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
      {hasFinalAnalysis && (
        <DreamAnalysisButtons
          dreamId={dreamId}
          loadingDreamId={loadingDreamId}
          handleViewAnalysis={() => handleViewAnalysis(dreamId)}
        />
      )}
    </div>
  );
};

export default DreamCardButtons;