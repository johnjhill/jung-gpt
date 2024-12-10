import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SubscriptionBanner = ({ 
  subscriptionTier, 
  monthlyDreamCount 
}: { 
  subscriptionTier?: string;
  monthlyDreamCount?: number;
}) => {
  const { toast } = useToast();

  const handleUpgradeClick = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {}
      });

      if (error) throw error;

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (subscriptionTier === 'premium') return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-8">
      <div className="text-center">
        <p className="text-dream-purple">
          Free Plan: {3 - (monthlyDreamCount ?? 0)} dream analyses remaining this month
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Unlock unlimited dream analyses with Premium!
        </p>
        <Button 
          onClick={handleUpgradeClick}
          className="mt-3 bg-dream-purple hover:bg-dream-purple/90"
        >
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
};