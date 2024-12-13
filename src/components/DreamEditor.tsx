import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DreamEditorProps {
  onSubmit: (content: string) => void;
}

export const DreamEditor = ({ onSubmit }: DreamEditorProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none',
      },
    },
  });

  const { data: usageData } = useQuery({
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
      return {
        count: dreams?.length || 0,
        limit: 3
      };
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  const handleUpgradeClick = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      console.log('Creating checkout session...');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
      });

      if (error) throw error;

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!editor || !editor.getText().trim()) return;

    const isFreeTier = profile?.subscription_tier === 'free';
    const hasReachedLimit = isFreeTier && (usageData?.count || 0) >= (usageData?.limit || 3);

    if (hasReachedLimit) {
      toast({
        title: "Free Tier Limit Reached",
        description: "You've reached your monthly limit for dream analysis. Upgrade to Premium to continue analyzing dreams!",
        variant: "default",
        action: (
          <Button 
            onClick={handleUpgradeClick}
            className="bg-dream-purple hover:bg-dream-purple/90 text-white gap-2"
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Button>
        ),
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await onSubmit(editor.getText());
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-serif text-dream-purple mb-2">Record Your Dream</h2>
        <p className="text-gray-600 mb-4">Write down your dream in as much detail as you remember...</p>
      </div>
      <div className="min-h-[200px] mb-4 p-4 border rounded-md bg-white">
        <EditorContent editor={editor} />
      </div>
      <Button 
        onClick={handleSubmit}
        className="w-full bg-dream-purple hover:bg-dream-purple/90 text-white"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Dream...
          </>
        ) : (
          'Analyze Dream'
        )}
      </Button>
    </Card>
  );
};