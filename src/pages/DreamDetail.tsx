import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Crown } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
}

interface Dream {
  id: string;
  dream_content: string;
  analysis: DreamAnalysis | null;
  created_at: string;
  summary: string;
}

const DreamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      console.log('Fetching user profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      console.log('User subscription tier:', data.subscription_tier);
      
      return data;
    }
  });

  const { data: dream, isLoading, error } = useQuery({
    queryKey: ['dream', id],
    queryFn: async () => {
      console.log('Fetching dream with ID:', id);
      
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching dream:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Dream not found');
      }
      
      console.log('Fetched dream:', data);

      const analysis = data.analysis ? (data.analysis as unknown as DreamAnalysis) : null;
      
      return {
        id: data.id,
        dream_content: data.dream_content,
        analysis: analysis,
        created_at: data.created_at,
        summary: data.summary
      } satisfies Dream;
    },
    retry: false
  });

  const handleUpgradeClick = async () => {
    try {
      console.log('Starting checkout process...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
      });

      if (error) throw error;

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (error) {
      console.error('Dream fetch error:', error);
      toast({
        title: "Error",
        description: "This dream could not be found. You will be redirected to your dream history.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        navigate('/history');
      }, 2000);
    }
  }, [error, navigate, toast]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#final' && profile?.subscription_tier === 'free' && dream?.analysis?.finalAnalysis) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to analyze more dreams and unlock all features!",
        variant: "default",
        action: (
          <Button 
            onClick={handleUpgradeClick}
            className="bg-dream-purple hover:bg-dream-purple/90 text-white gap-2"
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Button>
        ),
      });
    }
  }, [profile, dream]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!dream) {
    return null;
  }

  const showFinalAnalysis = profile?.subscription_tier !== 'free' || !dream.analysis?.finalAnalysis;

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-serif text-white">
          {dream.summary}
        </h1>
        
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-serif mb-4">Dream Content</h2>
            <p className="text-gray-700">{dream.dream_content}</p>
            
            {dream.analysis && (
              <>
                <h2 className="text-2xl font-serif mt-8 mb-4">Initial Analysis</h2>
                <p className="text-gray-700">{dream.analysis.initialAnalysis}</p>
                
                {showFinalAnalysis && dream.analysis.finalAnalysis && (
                  <>
                    <h2 className="text-2xl font-serif mt-8 mb-4" id="final">Final Analysis</h2>
                    <p className="text-gray-700">{dream.analysis.finalAnalysis}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamDetail;