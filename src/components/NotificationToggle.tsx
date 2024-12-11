import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

export const NotificationToggle = ({ enabled, onToggle }: NotificationToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="notifications" className="text-base">
        Daily dream recording reminders
      </Label>
      <Switch
        id="notifications"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};