import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, BookOpen, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const handleUpgradeClick = async () => {
    try {
      console.log('Starting checkout process...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
      });

      if (error) throw error;

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  const handleAnalysisClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile?.subscription_tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to analyze more dreams and unlock all features!",
        variant: "default",
        action: (
          <Button 
            onClick={handleUpgradeClick}
            className="bg-dream-purple hover:bg-dream-purple/90 text-white gap-2"
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Button>
        ),
      });
      return;
    }
    await handleViewAnalysis(dreamId);
  };

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
            onClick={handleAnalysisClick}
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
        </>
      )}
    </div>
  );
};

export default DreamCardButtons;