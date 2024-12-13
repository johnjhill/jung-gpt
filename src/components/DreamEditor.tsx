import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDreamContent, generateDreamSummary } from "@/services/dreamSubmission";
import { saveDreamWithInitialAnalysis } from "@/services/dreamAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { UpgradePrompt } from "./UpgradePrompt";
import { DreamInputForm } from "./DreamInputForm";
import { useDreamUsage } from "@/hooks/useDreamUsage";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DreamEditorProps {
  onSubmit?: (dream: string) => Promise<void>;
}

export const DreamEditor = ({ onSubmit }: DreamEditorProps) => {
  const [dreamContent, setDreamContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: usageData } = useDreamUsage();
  const { data: profile } = useUserProfile();

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

      if (onSubmit) {
        await onSubmit(dreamContent);
      }

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
    <DreamInputForm
      dreamContent={dreamContent}
      isSubmitting={isSubmitting}
      onChange={setDreamContent}
      onSubmit={handleSubmit}
    />
  );
};