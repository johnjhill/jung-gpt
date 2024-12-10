import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
}

interface DreamRecord {
  id: string;
  dream_content: string;
  dream_date: string;
  analysis: DreamAnalysis | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const DreamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dream, isLoading } = useQuery({
    queryKey: ['dream', id],
    queryFn: async () => {
      if (!id) throw new Error('Dream ID is required');
      
      console.log('Fetching dream details for id:', id);
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching dream:', error);
        throw error;
      }
      
      console.log('Fetched dream:', data);
      
      // First cast to unknown, then to DreamAnalysis to satisfy TypeScript
      const analysis = data.analysis ? (data.analysis as unknown as DreamAnalysis) : null;
      
      const dreamData: DreamRecord = {
        ...data,
        analysis
      };

      return dreamData;
    },
    enabled: !!id, // Only run the query if we have an ID
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl text-white mb-4">Dream not found</h1>
        <Button onClick={() => navigate('/history')} variant="ghost" className="text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Button
        onClick={() => navigate('/history')}
        variant="ghost"
        className="text-white mb-8 hover:text-white/90"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to History
      </Button>

      <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {format(new Date(dream.created_at), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-serif text-dream-purple mb-6">Your Dream</h2>
          <p className="text-gray-700 mb-8">{dream.dream_content}</p>

          {dream.analysis && (
            <>
              <h3 className="text-2xl font-serif text-dream-purple mb-4">Initial Analysis</h3>
              <p className="text-gray-700 mb-8">{dream.analysis.initialAnalysis}</p>

              {dream.analysis.questions && dream.analysis.answers && (
                <div className="mb-8">
                  <h3 className="text-2xl font-serif text-dream-purple mb-4">Follow-up Questions</h3>
                  {dream.analysis.questions.map((question, index) => (
                    <div key={index} className="mb-6">
                      <p className="font-medium text-dream-purple mb-2">Q: {question}</p>
                      <p className="text-gray-700">A: {dream.analysis.answers?.[index] || 'No answer provided'}</p>
                    </div>
                  ))}
                </div>
              )}

              {dream.analysis.finalAnalysis && (
                <>
                  <h3 className="text-2xl font-serif text-dream-purple mb-4">Final Analysis</h3>
                  <p className="text-gray-700">{dream.analysis.finalAnalysis}</p>
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DreamDetail;