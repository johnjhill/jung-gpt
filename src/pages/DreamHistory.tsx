import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const DreamHistory = () => {
  const { data: dreams, isLoading } = useQuery({
    queryKey: ['dreams'],
    queryFn: async () => {
      console.log('Fetching dreams from Supabase');
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .order('dream_date', { ascending: false });
      
      if (error) throw error;
      console.log('Fetched dreams:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-serif text-white text-center mb-12">
        Your Dream Journey
      </h1>
      
      <div className="space-y-8">
        {dreams?.map((dream) => (
          <Card key={dream.id} className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                {format(new Date(dream.dream_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="prose prose-sm">
              <h3 className="text-xl font-serif text-dream-purple mb-4">Dream</h3>
              <p className="text-gray-700 mb-4">{dream.dream_content}</p>
              
              {dream.analysis && (
                <>
                  <h4 className="text-lg font-serif text-dream-purple mb-2">Analysis</h4>
                  <p className="text-gray-700">{dream.analysis.finalAnalysis}</p>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DreamHistory;