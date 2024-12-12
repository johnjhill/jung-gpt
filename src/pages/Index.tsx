import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DreamJournalHeader } from '@/components/DreamJournalHeader';
import { SetupManager } from '@/components/SetupManager';
import { DreamJournalMain } from '@/components/DreamJournalMain';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [session, setSession] = useState<any>(null);

  // First check if we have a session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Current session:', session ? 'Active' : 'None');
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile only when we have a session
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      console.log('Fetching user profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_setup')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      console.log('Profile setup status:', data?.has_completed_setup);
      return data;
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!session // Only run query when we have a session
  });

  useEffect(() => {
    if (profile !== undefined) {
      const needsSetup = !profile?.has_completed_setup;
      console.log('Setting showSetup based on profile:', needsSetup);
      setShowSetup(needsSetup);
    }
  }, [profile]);

  const handleSetupComplete = async () => {
    console.log('Setup completed, showing main interface');
    await refetch(); // Refetch profile data to get updated setup status
    setShowSetup(false);
  };

  if (isLoading) {
    return null; // AuthWrapper will handle loading state
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      {showSetup ? (
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-serif text-white text-center">
            Welcome to Dream Journal
          </h1>
          <SetupManager onSetupComplete={handleSetupComplete} />
        </div>
      ) : (
        <>
          <DreamJournalHeader />
          <DreamJournalMain />
        </>
      )}
    </div>
  );
};

export default Index;