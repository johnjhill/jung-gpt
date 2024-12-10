import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const SubscriptionBanner = ({ 
  subscriptionTier, 
  monthlyDreamCount 
}: { 
  subscriptionTier?: string;
  monthlyDreamCount?: number;
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);
      console.log('Creating checkout session...');
      
      const { data: response, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { action: 'create-session' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!response?.url) {
        console.error('No URL in response:', response);
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout:', response.url);
      window.location.href = response.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Upgrade to Premium"}
        </Button>
      </div>
    </div>
  );
};