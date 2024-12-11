import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const UpgradePrompt = () => {
  const { toast } = useToast();

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

  return (
    <Button 
      onClick={handleUpgradeClick}
      className="bg-dream-purple hover:bg-dream-purple/90 text-white gap-2"
    >
      <Crown className="h-4 w-4" />
      Upgrade
    </Button>
  );
};