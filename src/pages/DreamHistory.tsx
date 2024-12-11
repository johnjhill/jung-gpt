import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import DreamCard from '@/components/DreamCard';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { addDays, isWithinInterval, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/card';

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

interface DateRange {
  from?: Date;
  to?: Date;
}

const DreamHistory = () => {
  const [loadingDreamId, setLoadingDreamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  
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

  const filteredDreams = dreams?.filter(dream => {
    const matchesSearch = searchQuery === '' || 
      dream.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.dream_content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !dateRange.from || !dateRange.to || 
      isWithinInterval(startOfDay(new Date(dream.dream_date)), {
        start: startOfDay(dateRange.from),
        end: startOfDay(dateRange.to)
      });

    return matchesSearch && matchesDate;
  });

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
      
      <Card className="p-6 bg-white/90 mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Filter by Date Range</h3>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Search Dreams</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by theme or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>
      
      <div className="space-y-8">
        {filteredDreams?.map((dream) => (
          <DreamCard
            key={dream.id}
            dream={dream}
            loadingDreamId={loadingDreamId}
            handleViewAnalysis={handleViewAnalysis}
          />
        ))}
        
        {filteredDreams?.length === 0 && (
          <Card className="p-6 bg-white/80 text-center">
            <p className="text-gray-600">No dreams found matching your filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DreamHistory;