import { useState } from 'react';
import { DreamJournalHeader } from '@/components/DreamJournalHeader';
import { DreamJournalInfo } from '@/components/DreamJournalInfo';
import { SetupManager } from '@/components/SetupManager';
import { DreamJournalMain } from '@/components/DreamJournalMain';

const Index = () => {
  const [showSetup, setShowSetup] = useState(true);

  const handleSetupComplete = () => {
    console.log('Setup completed, showing main interface');
    setShowSetup(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <DreamJournalHeader />
      
      {showSetup ? (
        <SetupManager onSetupComplete={handleSetupComplete} />
      ) : (
        <DreamJournalMain />
      )}

      <DreamJournalInfo />
    </div>
  );
};

export default Index;