import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartBar, Crown, Lock } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export const UsageTracker = () => {
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

  const handleUpgradeClick = () => {
    // For now, just show a toast. This would be replaced with actual upgrade flow
    toast({
      title: "Upgrade Coming Soon",
      description: "The upgrade feature will be available soon!",
    });
  };

  if (!usageData || !profile) return null;

  const isFreeTier = profile.subscription_tier === 'free';
  const usagePercentage = isFreeTier ? (usageData.count / usageData.limit) * 100 : 0;
  const shouldPromptUpgrade = isFreeTier && usagePercentage >= 66;

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
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-dream-purple rounded-full transition-all"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
          
          {shouldPromptUpgrade && (
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