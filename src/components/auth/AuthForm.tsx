
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

export const AuthForm = () => (
  <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dream-blue via-dream-purple to-black p-4">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay pointer-events-none"></div>
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/20">
      <h1 className="text-4xl font-serif text-white text-center mb-6">Jung GPT</h1>
      
      <div className="text-white/90 mb-8 space-y-4">
        <p className="text-center text-lg font-medium mb-4">
          Welcome to Your Dream Analysis Journey
        </p>
        
        <div className="space-y-3 text-sm">
          <p>
            Jung GPT is your AI-powered dream analysis companion, combining modern technology with Jungian psychology to help you understand your dreams and their deeper meanings.
          </p>
          
          <div className="space-y-2">
            <p className="font-medium">How it works:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Record your dreams each morning</li>
              <li>Receive AI-powered Jungian analysis</li>
              <li>Track patterns and insights over time</li>
              <li>Access a library of dream symbols</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-md">
            <p className="text-center">
              Create an account to start your dream analysis journey, or sign back in to continue exploring your dream patterns.
            </p>
          </div>
        </div>
      </div>

      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#663399',
                brandAccent: '#191970',
                inputBackground: 'rgba(255, 255, 255, 0.1)',
                inputText: 'white',
                inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                messageText: 'white',
                messageBackground: 'rgba(255, 255, 255, 0.1)',
                anchorTextColor: 'white',
                dividerBackground: 'rgba(255, 255, 255, 0.2)',
              },
            },
          },
          style: {
            button: {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              fontWeight: '500',
            },
            anchor: {
              color: 'white',
              fontWeight: '500',
            },
            container: {
              color: 'white',
            },
            label: {
              color: 'white',
            },
            message: {
              color: 'white',
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
