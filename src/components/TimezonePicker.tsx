import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import timezones from "timezones-list";
import { useMemo, useState } from "react";

interface TimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
}

type Region = {
  name: string;
  cities: Array<{
    tzCode: string;
    label: string;
  }>;
};

export const TimezonePicker = ({ value, onChange }: TimezonePickerProps) => {
  // Group timezones by region
  const regions = useMemo(() => {
    const grouped = timezones.reduce((acc: { [key: string]: Region }, tz) => {
      const region = tz.label.split('/')[0];
      if (!acc[region]) {
        acc[region] = {
          name: region,
          cities: []
        };
      }
      acc[region].cities.push({
        tzCode: tz.tzCode,
        label: tz.label.split('/').slice(1).join(' - ')
      });
      return acc;
    }, {});
    return Object.values(grouped);
  }, []);

  // Find current region and city based on value
  const currentTimezone = timezones.find(tz => tz.tzCode === value);
  const currentRegion = currentTimezone?.label.split('/')[0] || '';
  
  const [selectedRegion, setSelectedRegion] = useState(currentRegion);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // If there's only one city in the region, select it automatically
    const regionData = regions.find(r => r.name === region);
    if (regionData && regionData.cities.length === 1) {
      onChange(regionData.cities[0].tzCode);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="region" className="text-sm text-gray-600">
          Region
        </Label>
        <Select value={selectedRegion} onValueChange={handleRegionChange}>
          <SelectTrigger id="region" className="w-[280px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.name} value={region.name}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRegion && (
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm text-gray-600">
            City
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="city" className="w-[280px]">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {regions
                .find(r => r.name === selectedRegion)
                ?.cities.map((city) => (
                  <SelectItem key={city.tzCode} value={city.tzCode}>
                    {city.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};