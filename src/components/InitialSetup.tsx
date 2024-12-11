import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { NotificationPreferences } from "./NotificationPreferences";

interface InitialSetupProps {
  onSetupComplete: () => void;
}

export const InitialSetup = ({ onSetupComplete }: InitialSetupProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const handlePreferencesSaved = async () => {
    try {
      console.log('Marking initial setup as complete...');
      setIsCompleting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ has_completed_setup: true })
        .eq("id", user.id);

      if (error) throw error;

      console.log('Initial setup completed successfully');
      toast({
        title: "Setup Complete!",
        description: "You're all set to start recording and analyzing your dreams.",
      });

      onSetupComplete();
    } catch (error) {
      console.error('Error completing initial setup:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card className="p-6 bg-white/90">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif text-gray-800">Complete Your Setup</h2>
          <p className="text-gray-600">
            To get started with your dream analysis journey, we need to set up your daily dream recording reminders. 
            This helps ensure you capture your dreams while they're still fresh in your memory.
          </p>
          <p className="text-gray-600">
            Choose your preferred notification time below, and we'll send you gentle reminders 
            to record and analyze your dreams.
          </p>
        </div>
        
        <NotificationPreferences onSaved={handlePreferencesSaved} isInitialSetup={true} />
      </div>
    </Card>
  );
};