import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartBar, Crown, Lock, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export const UsageTracker = () => {
  const { toast } = useToast();
  
  const { data: usageData, refetch: refetchUsage } = useQuery({
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
        limit: 20 // Updated free tier limit
      };
    },
    refetchInterval: 5000, // Refetch every 5 seconds to keep usage up to date
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

  const handleUpgradeClick = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      console.log('Creating checkout session...');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
      });

      if (error) {
        throw error;
      }

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

  useEffect(() => {
    // Check if user has exceeded free tier limit
    if (profile?.subscription_tier === 'free' && usageData?.count >= usageData?.limit) {
      toast({
        title: "Free Tier Limit Reached",
        description: "You've reached your monthly limit for dream analysis. Upgrade to Premium to continue analyzing dreams!",
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
    }
  }, [usageData?.count, profile?.subscription_tier]);

  if (!usageData || !profile) return null;

  const isFreeTier = profile.subscription_tier === 'free';
  const usagePercentage = isFreeTier ? (usageData.count / usageData.limit) * 100 : 0;
  const shouldPromptUpgrade = isFreeTier && usagePercentage >= 66;
  const hasReachedLimit = isFreeTier && usageData.count >= usageData.limit;

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-dream-purple" />
          <h3 className="font-serif text-lg text-dream-purple">
            Dream Analysis Usage
          </h3>
        </div>
        {isFreeTier ? (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            Free Tier
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm text-dream-purple">
            <Crown className="h-4 w-4" />
            Premium
          </div>
        )}
      </div>
      
      {isFreeTier && (
        <>
          <div className="mb-2">
            <div className="text-sm text-gray-600 mb-1">
              {usageData.count} of {usageData.limit} dreams this month
              {hasReachedLimit && (
                <span className="text-red-500 ml-2">(Limit reached)</span>
              )}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full transition-all ${
                  hasReachedLimit ? 'bg-red-500' : 'bg-dream-purple'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
          
          {(shouldPromptUpgrade || hasReachedLimit) && (
            <div className="mt-4">
              <Button
                onClick={handleUpgradeClick}
                className="w-full bg-dream-purple hover:bg-dream-purple/90 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
