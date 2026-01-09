import { useState } from 'react';
import { TourismProvider, useTourism } from '@/contexts/TourismContext';
import { InterestSelector } from '@/components/InterestSelector';
import { Dashboard } from '@/components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';

function AppContent() {
  const { hasSelectedInterests, resetInterests } = useTourism();
  const [showDashboard, setShowDashboard] = useState(false);

  const handleInterestComplete = () => {
    setShowDashboard(true);
  };

  const handleResetInterests = () => {
    resetInterests();
    setShowDashboard(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!showDashboard ? (
        <motion.div
          key="selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InterestSelector onComplete={handleInterestComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Dashboard onResetInterests={handleResetInterests} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Index = () => {
  return (
    <TourismProvider>
      <AppContent />
    </TourismProvider>
  );
};

export default Index;
