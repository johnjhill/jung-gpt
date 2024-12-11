import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimezonePicker } from "./TimezonePicker";

interface TimePreferencesFormProps {
  time: string;
  timezone: string;
  onTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
}

export const TimePreferencesForm = ({
  time,
  timezone,
  onTimeChange,
  onTimezoneChange,
}: TimePreferencesFormProps) => {
  return (
    <div className="space-y-4">
      <TimezonePicker 
        value={timezone}
        onChange={onTimezoneChange}
      />
      
      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm text-gray-600">
          Notification time ({timezone})
        </Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-32"
        />
      </div>
    </div>
  );
};