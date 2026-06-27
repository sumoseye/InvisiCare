'use client';

import { AlertBanner } from '@/components/layout/AlertBanner';
import { Header } from '@/components/layout/Header';
import { DataProvider } from '@/components/DataProvider';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { VitalsTab } from '@/components/tabs/VitalsTab';
import { PoseDetectionTab } from '@/components/tabs/PoseDetectionTab';
import { FallDetectionTab } from '@/components/tabs/FallDetectionTab';
import { useAppStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

function TabContent() {
  const activeTab = useAppStore((s) => s.activeTab);

  const tabs: Record<string, React.ReactNode> = {
    overview: <OverviewTab />,
    vitals: <VitalsTab />,
    pose: <PoseDetectionTab />,
    fall: <FallDetectionTab />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {tabs[activeTab]}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-gradient-to-br from-dark via-darker to-dark">
        <Header />
        <AlertBanner />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <TabContent />
        </main>
      </div>
    </DataProvider>
  );
}
