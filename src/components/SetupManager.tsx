import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InitialSetup } from './InitialSetup';

interface SetupManagerProps {
  onSetupComplete: () => void;
}

export const SetupManager = ({ onSetupComplete }: SetupManagerProps) => {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      console.log('Checking setup status...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("has_completed_setup")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      console.log('Setup status:', profile?.has_completed_setup);
      setNeedsSetup(!profile?.has_completed_setup);
      if (profile?.has_completed_setup) {
        onSetupComplete();
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!needsSetup) return null;

  return (
    <InitialSetup onSetupComplete={() => {
      console.log('Setup completed, notifying parent component');
      setNeedsSetup(false);
      onSetupComplete();
    }} />
  );
};