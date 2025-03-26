import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import FitnessPage from './FitnessPage';

export default function Home() {
  const [_, setLocation] = useLocation();
  
  // Redirect to fitness page on initial load
  useEffect(() => {
    setLocation('/fitness');
  }, [setLocation]);

  return (
    <>
      <Header />
      <TabNavigation />
      <FitnessPage />
      <BottomNavigation />
    </>
  );
}
