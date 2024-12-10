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
      
      // Get a fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session');
      }

      if (!session) {
        console.error('No active session found');
        throw new Error('Please log in to upgrade');
      }

      console.log('Creating checkout session...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { returnUrl: window.location.origin },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('Invalid response:', data);
        throw new Error('Invalid response from server');
      }

      console.log('Redirecting to checkout URL:', data.url);
      window.location.assign(data.url);
      
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process",
        variant: "destructive",
      });
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