import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationPreferences } from "./NotificationPreferences";
import { UsageTracker } from "./UsageTracker";

export const DreamJournalHeader = () => {
  return (
    <div className="space-y-8 mb-12">
      <h1 className="text-4xl md:text-5xl font-serif text-white mb-12 text-center">
        Dream Journal
      </h1>
      
      <Collapsible defaultOpen={false} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            <Bell className="mr-2 h-4 w-4" />
            Manage Journal Reminders
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <NotificationPreferences />
        </CollapsibleContent>
      </Collapsible>

      <UsageTracker />
    </div>
  );
};