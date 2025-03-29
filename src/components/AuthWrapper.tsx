
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
    console.log('Auth wrapper mounted');
    
    // Handle hash fragment for OAuth redirects
    if (location.hash && (location.hash.includes('access_token') || location.hash.includes('error'))) {
      console.log('Detected hash in URL, processing OAuth result');
      const hashParams = new URLSearchParams(location.hash.substring(1));
      if (hashParams.get('error')) {
        console.error('OAuth error:', hashParams.get('error_description'));
      }
    }

    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      // Only use synchronous state updates inside the listener
      setSession(currentSession);
      
      if (currentSession && event === 'SIGNED_IN') {
        // Use setTimeout to safely handle navigation after state update
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
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (data.session) {
          console.log('Initial session found:', data.session.user.id);
          setSession(data.session);
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error in session check:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [navigate, location]);

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
