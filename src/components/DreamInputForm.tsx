import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface DreamInputFormProps {
  dreamContent: string;
  isSubmitting: boolean;
  onChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const DreamInputForm = ({ 
  dreamContent, 
  isSubmitting, 
  onChange, 
  onSubmit 
}: DreamInputFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea
        value={dreamContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your dream..."
        className="min-h-[200px] bg-white/80 backdrop-blur-sm"
      />
      <Button 
        type="submit" 
        disabled={!dreamContent.trim() || isSubmitting}
        className="w-full bg-dream-purple hover:bg-dream-purple/90 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Dream...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Analyze Dream
          </>
        )}
      </Button>
    </form>
  );
};