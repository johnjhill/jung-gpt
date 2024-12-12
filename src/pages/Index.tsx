import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DreamJournalHeader } from '@/components/DreamJournalHeader';
import { SetupManager } from '@/components/SetupManager';
import { DreamJournalMain } from '@/components/DreamJournalMain';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [showSetup, setShowSetup] = useState(false);  // Changed default to false

  // Fetch user profile to check setup status
  const { data: profile, isLoading } = useQuery({
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
        
      if (error) throw error;
      console.log('Profile setup status:', data?.has_completed_setup);
      return data;
    }
  });

  useEffect(() => {
    if (profile !== undefined) {  // Only set state when we have profile data
      console.log('Setting showSetup based on profile:', !profile?.has_completed_setup);
      setShowSetup(!profile?.has_completed_setup);
    }
  }, [profile]);

  const handleSetupComplete = () => {
    console.log('Setup completed, showing main interface');
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