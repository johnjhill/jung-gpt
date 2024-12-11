import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { DreamContentSection } from '@/components/DreamContentSection';
import { DreamAnalysisSection } from '@/components/DreamAnalysisSection';

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
        .maybeSingle(); // Using maybeSingle() instead of single()
      
      if (error) {
        console.error('Error fetching dream:', error);
        throw error;
      }
      
      if (!data) {
        console.error('Dream not found');
        throw new Error('Dream not found');
      }

      const dreamData = data;
      let typedAnalysis: DreamAnalysis | null = null;

      if (dreamData.analysis && typeof dreamData.analysis === 'object' && !Array.isArray(dreamData.analysis)) {
        const analysis = dreamData.analysis as Record<string, unknown>;
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
      
      return {
        id: dreamData.id,
        dream_content: dreamData.dream_content,
        created_at: dreamData.created_at,
        summary: dreamData.summary,
        analysis: typedAnalysis
      } as Dream;
    }
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
      <DreamContentSection 
        summary={dream.summary}
        createdAt={dream.created_at}
        content={dream.dream_content}
      />
      
      {dream.analysis && (
        <div className="mt-8">
          <DreamAnalysisSection 
            analysis={dream.analysis}
            showFinalAnalysis={showFinalAnalysis}
          />
        </div>
      )}
    </div>
  );
};

export default DreamDetail;