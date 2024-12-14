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

  const { data: usageData } = useQuery({
    queryKey: ['dreamUsage'],
    queryFn: async () => {
      console.log('Fetching dream usage data...');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: dreams, error } = await supabase
        .from('dreams')
        .select('created_at')
        .gte('created_at', startOfMonth.toISOString());
        
      if (error) throw error;
      console.log('Dreams this month:', dreams?.length);
      
      return {
        count: dreams?.length || 0,
        limit: 3 // Free tier limit
      };
    }
  });

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

  const handleAnalysisGeneration = async (dreamIdParam: string) => {
    // Check usage limits only for generating new analyses
    if (!hasFinalAnalysis && 
        profile?.subscription_tier === 'free' && 
        usageData && 
        usageData.count >= usageData.limit) {
      toast({
        title: "Premium Feature",
        description: "You've reached your monthly limit. Upgrade to Premium to analyze more dreams!",
        variant: "default",
        action: <UpgradePrompt />
      });
      return;
    }
    
    await handleViewAnalysis(dreamIdParam);
  };

  return (
    <div className="flex flex-wrap gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
      <DreamAnalysisButtons
        dreamId={dreamId}
        loadingDreamId={loadingDreamId}
        handleViewAnalysis={handleAnalysisGeneration}
      />
    </div>
  );
};

export default DreamCardButtons;