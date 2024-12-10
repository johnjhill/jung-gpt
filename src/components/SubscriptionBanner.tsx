import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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
    setIsLoading(true);
    try {
      console.log('Starting checkout process...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      const { data: response, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!response) {
        console.error('No response received from function');
        throw new Error('No response received from server');
      }

      if (!response.url) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response from server');
      }

      console.log('Redirecting to checkout:', response.url);
      
      // Force a full page reload and redirect
      window.location.replace(response.url);
      
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating checkout...
            </>
          ) : (
            'Upgrade to Premium'
          )}
        </Button>
      </div>
    </div>
  );
};