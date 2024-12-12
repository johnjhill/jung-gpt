import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DreamJournalHeader } from '@/components/DreamJournalHeader';
import { SetupManager } from '@/components/SetupManager';
import { DreamJournalMain } from '@/components/DreamJournalMain';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('Initial session check:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log('Auth state changed:', _event);
      setSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      console.log('Fetching user profile...');
      if (!session?.user?.id) {
        console.log('No active session found');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_setup')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log('Profile setup status:', data?.has_completed_setup);
      return data;
    },
    enabled: !!session?.user?.id, // Only run query if we have a session
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (profile !== undefined) {
      const needsSetup = !profile?.has_completed_setup;
      console.log('Setting showSetup based on profile:', needsSetup);
      setShowSetup(needsSetup);
    }
  }, [profile]);

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      {showSetup ? (
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-serif text-white text-center">
            Welcome to Dream Journal
          </h1>
          <SetupManager onSetupComplete={() => setShowSetup(false)} />
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