import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UpgradePrompt } from '@/components/UpgradePrompt';

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
      return data as Dream;
    },
    retry: false
  });

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
        action: <UpgradePrompt />
      });
    }
  }, [profile, dream, toast]);

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