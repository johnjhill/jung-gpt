import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { format } from 'date-fns';

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

      let typedAnalysis: DreamAnalysis | null = null;
      if (data.analysis && typeof data.analysis === 'object' && !Array.isArray(data.analysis)) {
        const analysis = data.analysis as Record<string, unknown>;
        if (
          typeof analysis.initialAnalysis === 'string' &&
          Array.isArray(analysis.questions) &&
          analysis.questions.every(q => typeof q === 'string')
        ) {
          typedAnalysis = {
            initialAnalysis: analysis.initialAnalysis,
            questions: analysis.questions,
            answers: Array.isArray(analysis.answers) ? analysis.answers.map(a => String(a)) : undefined,
            finalAnalysis: typeof analysis.finalAnalysis === 'string' ? analysis.finalAnalysis : undefined
          };
        }
      }
      
      const dreamData: Dream = {
        id: data.id,
        dream_content: data.dream_content,
        created_at: data.created_at,
        summary: data.summary,
        analysis: typedAnalysis
      };
      
      return dreamData;
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
        <div className="flex justify-between items-start">
          <h1 className="text-4xl md:text-5xl font-serif text-white">
            {dream.summary}
          </h1>
          <p className="text-sm text-gray-300">
            {format(new Date(dream.created_at), 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="bg-white/90 rounded-lg p-8 shadow-lg space-y-8">
          <div className="prose prose-lg max-w-none">
            <section>
              <h2 className="text-2xl font-serif mb-4 text-dream-purple">Dream Content</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{dream.dream_content}</p>
            </section>
            
            {dream.analysis && (
              <>
                <section className="mt-8">
                  <h2 className="text-2xl font-serif mb-4 text-dream-purple">Initial Analysis</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{dream.analysis.initialAnalysis}</p>
                </section>
                
                {dream.analysis.questions && dream.analysis.answers && (
                  <section className="mt-8">
                    <h2 className="text-2xl font-serif mb-4 text-dream-purple">Exploration Questions</h2>
                    <div className="space-y-4">
                      {dream.analysis.questions.map((question, index) => (
                        <div key={index} className="bg-dream-lavender/20 p-4 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">{question}</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{dream.analysis?.answers?.[index]}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {showFinalAnalysis && dream.analysis.finalAnalysis && (
                  <section className="mt-8" id="final">
                    <h2 className="text-2xl font-serif mb-4 text-dream-purple">Final Analysis</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{dream.analysis.finalAnalysis}</p>
                  </section>
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