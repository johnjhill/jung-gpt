import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TimezonePicker } from "./TimezonePicker";

export const NotificationPreferences = () => {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email_notifications_enabled, notification_time, timezone")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setEnabled(profile.email_notifications_enabled || false);
        if (profile.notification_time) {
          setTime(profile.notification_time.slice(0, 5)); // Convert "HH:mm:ss" to "HH:mm"
        }
        setTimezone(profile.timezone || "UTC");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
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

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6 bg-white/90">
      <h2 className="text-2xl font-serif mb-6 text-gray-800">Email Notifications</h2>
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
              savePreferences();
            }}
          />
        </div>
        
        {enabled && (
          <>
            <TimezonePicker 
              value={timezone}
              onChange={(newTimezone) => {
                setTimezone(newTimezone);
                savePreferences();
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
                  savePreferences();
                }}
                className="w-32"
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
};