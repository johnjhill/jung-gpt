import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimezonePickerProps {
  value: string;
  onChange: (timezone: string) => void;
}

export const TimezonePicker = ({ value, onChange }: TimezonePickerProps) => {
  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    // Get list of IANA timezone names
    const tzNames = Intl.supportedValuesOf('timeZone');
    setTimezones(tzNames);
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="timezone">Your Timezone</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="timezone" className="w-[280px]">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};