import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import DreamCard from '@/components/DreamCard';

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
  summary: string;
}

const DreamHistory = () => {
  const [loadingDreamId, setLoadingDreamId] = useState<string | null>(null);
  
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

  const handleViewAnalysis = async (dreamId: string) => {
    setLoadingDreamId(dreamId);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      window.location.href = `/dream/${dreamId}#final`;
    } finally {
      setLoadingDreamId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
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
          <DreamCard
            key={dream.id}
            dream={dream}
            loadingDreamId={loadingDreamId}
            handleViewAnalysis={handleViewAnalysis}
          />
        ))}
      </div>
    </div>
  );
};

export default DreamHistory;