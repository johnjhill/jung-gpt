import { NotificationPreferences } from "@/components/NotificationPreferences";
import { Card } from "@/components/ui/card";

const Preferences = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-serif text-white mb-12 text-center">
        Preferences
      </h1>

      <Card className="p-6 bg-white/90">
        <h2 className="text-2xl font-serif mb-6 text-gray-800">Journal Reminders</h2>
        <NotificationPreferences />
      </Card>
    </div>
  );
};

export default Preferences;