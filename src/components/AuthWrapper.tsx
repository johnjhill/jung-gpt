import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLoading } from './auth/AuthLoading';
import { AuthForm } from './auth/AuthForm';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

        if (currentSession) {
          console.log('Initial session found:', currentSession.user.id);
          // Refresh the session to ensure it's valid
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Error refreshing session:', refreshError);
            setSession(null);
            return;
          }

          console.log('Session refreshed successfully');
          setSession(refreshedSession);
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (currentSession) {
        console.log('User signed in:', currentSession.user.id);
        setSession(currentSession);
        // Only navigate to home if we're on the root path
        if (location.pathname === '/') {
          navigate('/', { replace: true });
        }
      } else {
        console.log('No session found');
        setSession(null);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

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