import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDreamContent, generateDreamSummary } from "@/services/dreamSubmission";
import { saveDreamWithInitialAnalysis } from "@/services/dreamAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { UpgradePrompt } from "./UpgradePrompt";

export const DreamEditor = () => {
  const [dreamContent, setDreamContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch dream usage data
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
    },
    refetchInterval: 5000,
  });

  // Fetch user profile
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamContent.trim()) return;

    // Check if user has reached free tier limit
    if (profile?.subscription_tier === 'free' && usageData && usageData.count >= usageData.limit) {
      toast({
        title: "Free Tier Limit Reached",
        description: "You've reached your monthly limit for dream analysis. Upgrade to Premium to continue analyzing dreams!",
        variant: "default",
        action: <UpgradePrompt />
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Analyzing dream content...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const analysis = await analyzeDreamContent(dreamContent);
      const summary = await generateDreamSummary(dreamContent);

      await saveDreamWithInitialAnalysis(dreamContent, user.id, analysis, summary);

      toast({
        title: "Dream Recorded",
        description: "Your dream has been saved and analyzed.",
      });

      setDreamContent("");
    } catch (error) {
      console.error('Error submitting dream:', error);
      toast({
        title: "Error",
        description: "Failed to save and analyze your dream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={dreamContent}
        onChange={(e) => setDreamContent(e.target.value)}
        placeholder="Describe your dream..."
        className="min-h-[200px] bg-white/80 backdrop-blur-sm"
      />
      <Button 
        type="submit" 
        disabled={!dreamContent.trim() || isSubmitting}
        className="w-full bg-dream-purple hover:bg-dream-purple/90 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Dream...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Analyze Dream
          </>
        )}
      </Button>
    </form>
  );
};