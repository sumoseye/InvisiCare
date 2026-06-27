'use client';

import { AlertBanner } from '@/components/layout/AlertBanner';
import { Header } from '@/components/layout/Header';
import { DataProvider } from '@/components/DataProvider';
import { Analytics } from '@/components/tabs/Analytics';
import { Dashboard } from '@/components/tabs/Dashboard';
import { EventLog } from '@/components/tabs/EventLog';
import { IntrusionDetection } from '@/components/tabs/IntrusionDetection';
import { PoseTracking } from '@/components/tabs/PoseTracking';
import { useAppStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

function TabContent() {
  const activeTab = useAppStore((s) => s.activeTab);

  const tabs: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    pose: <PoseTracking />,
    intrusion: <IntrusionDetection />,
    analytics: <Analytics />,
    events: <EventLog />,
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
