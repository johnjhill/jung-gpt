import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const FREE_TIER_LIMIT = 3;

export const useDreamUsage = () => {
  return useQuery({
    queryKey: ['dreamUsage'],
    queryFn: async () => {
      console.log('Fetching dream usage data...');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: dreams, error } = await supabase
        .from('dreams')
        .select('created_at')
        .gte('created_at', startOfMonth.toISOString());
        
      if (error) throw error;
      console.log('Dreams this month:', dreams?.length);
      
      return {
        count: dreams?.length || 0,
        limit: FREE_TIER_LIMIT
      };
    },
    refetchInterval: 5000,
  });
};