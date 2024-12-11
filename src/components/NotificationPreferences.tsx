import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimezonePicker } from "./TimezonePicker";
import { Loader2 } from "lucide-react";

interface NotificationPreferencesProps {
  onSaved?: () => void;
  isInitialSetup?: boolean;
}

export const NotificationPreferences = ({ onSaved, isInitialSetup }: NotificationPreferencesProps) => {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      console.log('Loading notification preferences...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email_notifications_enabled, notification_time, timezone")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        console.log('Loaded preferences:', profile);
        setEnabled(profile.email_notifications_enabled || false);
        if (profile.notification_time) {
          setTime(profile.notification_time.slice(0, 5)); // Convert "HH:mm:ss" to "HH:mm"
        }
        setTimezone(profile.timezone || "UTC");
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      console.log('Saving notification preferences...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          email_notifications_enabled: enabled,
          notification_time: time + ":00", // Add seconds for database format
          timezone
        })
        .eq("id", user.id);

      if (error) throw error;

      console.log('Preferences saved successfully');
      setUnsavedChanges(false);
      
      if (!isInitialSetup) {
        toast({
          title: "Preferences Updated",
          description: "Your notification preferences have been saved.",
        });
      }
      
      onSaved?.();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = () => {
    setUnsavedChanges(true);
  };

  if (loading) return null;

  return (
    <Card className={isInitialSetup ? "bg-transparent shadow-none" : "p-6 bg-white/90"}>
      {!isInitialSetup && (
        <h2 className="text-2xl font-serif mb-6 text-gray-800">Email Notifications</h2>
      )}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="text-base">
            Daily dream recording reminders
          </Label>
          <Switch
            id="notifications"
            checked={enabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              handleChange();
            }}
          />
        </div>
        
        {enabled && (
          <>
            <TimezonePicker 
              value={timezone}
              onChange={(newTimezone) => {
                setTimezone(newTimezone);
                handleChange();
              }}
            />
            
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm text-gray-600">
                Notification time ({timezone})
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  handleChange();
                }}
                className="w-32"
              />
            </div>
          </>
        )}

        {(unsavedChanges || isInitialSetup) && (
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="w-full"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isInitialSetup ? "Complete Setup" : "Save Changes"}
          </Button>
        )}
      </div>
    </Card>
  );
};