import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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

const DreamHistory = () => {
  const navigate = useNavigate();
  
  const { data: dreams, isLoading } = useQuery({
    queryKey: ['dreams'],
    queryFn: async () => {
      console.log('Fetching dreams from Supabase');
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log('Fetched dreams:', data);
      
      return (data as any[]).map(dream => ({
        ...dream,
        analysis: dream.analysis as DreamAnalysis
      })) as DreamRecord[];
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
                {format(new Date(dream.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="prose prose-sm">
              <h3 className="text-xl font-serif text-dream-purple mb-4">Dream</h3>
              <p className="text-gray-700 mb-4">{dream.dream_content}</p>
              
              {dream.analysis && (
                <div className="mt-4">
                  <h4 className="text-lg font-serif text-dream-purple mb-2">Initial Analysis</h4>
                  <p className="text-gray-700 mb-4">
                    {dream.analysis.initialAnalysis}
                  </p>
                  
                  <div className="flex gap-4">
                    {dream.analysis.finalAnalysis && (
                      <>
                        <Button
                          onClick={() => navigate(`/dream/${dream.id}`)}
                          variant="ghost"
                          className="text-dream-purple hover:text-dream-purple/90 group"
                        >
                          <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          View Full Analysis
                        </Button>
                        <Button
                          onClick={() => navigate(`/dream/${dream.id}#final`)}
                          variant="outline"
                          className="text-dream-purple hover:text-dream-purple/90 group"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          See Final Analysis
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DreamHistory;