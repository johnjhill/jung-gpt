import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { DreamJournal } from '@/components/DreamJournal';

const Index = () => {
  // Fetch user's profile to get subscription status
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
  });

  // Fetch dream count for the current month
  const { data: monthlyDreamCount } = useQuery({
    queryKey: ['monthlyDreamCount'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      return count;
    }
  });

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-serif text-white text-center mb-12">
        Dream Analysis Journal
      </h1>
      
      <SubscriptionBanner 
        subscriptionTier={profile?.subscription_tier} 
        monthlyDreamCount={monthlyDreamCount}
      />
      
      <DreamJournal 
        subscriptionTier={profile?.subscription_tier}
        monthlyDreamCount={monthlyDreamCount}
      />
    </div>
  );
};

export default Index;