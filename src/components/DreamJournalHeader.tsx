import { UsageTracker } from "./UsageTracker";

export const DreamJournalHeader = () => {
  return (
    <div className="space-y-8 mb-12">
      <h1 className="text-4xl md:text-5xl font-serif text-white mb-12 text-center">
        Dream Journal
      </h1>
      
      <UsageTracker />
    </div>
  );
};