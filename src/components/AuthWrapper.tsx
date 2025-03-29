
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLoading } from './auth/AuthLoading';
import { AuthForm } from './auth/AuthForm';
import { Session } from '@supabase/supabase-js';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      // Only update state with synchronous operations inside the callback
      setSession(currentSession);
      
      // Use setTimeout to defer any additional actions that might trigger Supabase calls
      if (currentSession && event === 'SIGNED_IN') {
        setTimeout(() => {
          console.log('User signed in, navigating to home');
          navigate('/', { replace: true });
        }, 0);
      }
    });

    // THEN check for existing session
    const initSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setLoading(false);
          return;
        }

        if (initialSession) {
          console.log('Initial session found:', initialSession.user.id);
          setSession(initialSession);
        } else {
          console.log('No initial session found');
          setSession(null);
        }
      } catch (error) {
        console.error('Error in session check:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle URL hash for Google OAuth redirect
  useEffect(() => {
    // Check if we have a hash in the URL (could be from OAuth redirect)
    const handleRedirectResult = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('Detected access token in URL, processing OAuth result');
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error processing OAuth redirect:', error);
          } else if (data?.session) {
            console.log('Successfully retrieved session from OAuth redirect');
            setSession(data.session);
            
            // Clear the hash to clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('Error handling OAuth redirect:', err);
        }
      }
    };

    handleRedirectResult();
  }, [location]);

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
