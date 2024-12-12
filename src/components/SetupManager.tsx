import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InitialSetup } from './InitialSetup';
import { useQuery } from '@tanstack/react-query';

interface SetupManagerProps {
  onSetupComplete: () => void;
}

export const SetupManager = ({ onSetupComplete }: SetupManagerProps) => {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      console.log('Fetching user profile for setup status...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        throw new Error('No user found');
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("has_completed_setup")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Setup status from profile:', data?.has_completed_setup);
      return data;
    },
    retry: false,
    staleTime: Infinity, // Don't refetch unnecessarily
    gcTime: 0,
    meta: {
      onSuccess: (data: { has_completed_setup: boolean }) => {
        console.log('Profile data fetched successfully:', data);
        setNeedsSetup(!data?.has_completed_setup);
        setLoading(false);
        if (data?.has_completed_setup) {
          console.log('Setup already completed, notifying parent');
          onSetupComplete();
        }
      },
      onError: (error: Error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    }
  });

  if (loading) {
    console.log('Loading setup status...');
    return null;
  }

  if (!needsSetup) {
    console.log('Setup not needed');
    return null;
  }

  console.log('Showing setup screen');
  return (
    <InitialSetup onSetupComplete={() => {
      console.log('Setup completed, notifying parent component');
      setNeedsSetup(false);
      onSetupComplete();
    }} />
  );
};