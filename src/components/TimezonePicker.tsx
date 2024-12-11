import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import timezones from "timezones-list";

interface TimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimezonePicker = ({ value, onChange }: TimezonePickerProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="timezone" className="text-sm text-gray-600">
        Your timezone
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="timezone" className="w-[280px]">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.tzCode} value={tz.tzCode}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};