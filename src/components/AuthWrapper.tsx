import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Logged in' : 'Not logged in');
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
      if (session) {
        console.log('User signed in:', session.user.id);
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dream-blue via-dream-purple to-dream-lavender">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dream-blue via-dream-purple to-dream-lavender p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl">
          <h1 className="text-4xl font-serif text-dream-blue text-center mb-8">Jung GPT</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#663399',
                    brandAccent: '#191970',
                    inputBackground: 'white',
                    inputText: 'black',
                    inputPlaceholder: '#666666',
                    messageText: '#191970',
                    messageBackground: '#E6E6FA',
                    anchorTextColor: '#191970',
                    dividerBackground: '#663399',
                  },
                },
              },
              style: {
                input: {
                  backgroundColor: 'white',
                  color: 'black',
                },
                label: {
                  color: '#191970',
                  fontWeight: '500',
                },
                button: {
                  backgroundColor: 'white',
                  color: '#191970',
                  borderColor: '#663399',
                  fontWeight: '500',
                },
                anchor: {
                  color: '#191970',
                  fontWeight: '500',
                },
              },
            }}
            theme="default"
            providers={['google']}
            localization={{
              variables: {
                sign_up: {
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign up",
                  loading_button_label: "Signing up...",
                  social_provider_text: "Sign in with {{provider}}",
                  link_text: "Don't have an account? Sign up",
                  confirmation_text: "By signing up, you agree to our Terms & Conditions, which include enabling email notifications for daily dream journaling reminders. You can adjust these settings after signing up."
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};