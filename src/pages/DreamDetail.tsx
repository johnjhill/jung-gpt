import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const DreamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: dream, isLoading, error } = useQuery({
    queryKey: ['dream', id],
    queryFn: async () => {
      console.log('Fetching dream with ID:', id);
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching dream:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Dream not found');
      }
      
      console.log('Fetched dream:', data);
      return data;
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
      
      // Redirect after a short delay to allow the toast to be seen
      setTimeout(() => {
        navigate('/history');
      }, 2000);
    }
  }, [error, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!dream) {
    return null; // The useEffect will handle the redirect
  }

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
                
                {dream.analysis.finalAnalysis && (
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