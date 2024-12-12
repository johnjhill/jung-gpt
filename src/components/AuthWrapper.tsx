import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthLoading } from './auth/AuthLoading';
import { AuthForm } from './auth/AuthForm';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          return;
        }

        console.log('Initial session check:', currentSession ? 'Logged in' : 'Not logged in');
        setSession(currentSession);
      } catch (error) {
        console.error('Error in session check:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      
      if (currentSession) {
        console.log('User signed in:', currentSession.user.id);
        navigate('/');
      } else {
        console.log('No session found');
        setSession(null);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    console.log('Loading auth state...');
    return <AuthLoading />;
  }

  if (!session) {
    console.log('No session, showing auth form');
    return <AuthForm />;
  }

  console.log('Session found, rendering protected content');
  return <>{children}</>;
};