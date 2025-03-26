import { useState } from 'react';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Function to format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Go to current day
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <>
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Card className="p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                <span className="material-icons text-sm">chevron_left</span>
              </Button>
              <div className="text-center">
                <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
                <Button variant="link" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextDay}>
                <span className="material-icons text-sm">chevron_right</span>
              </Button>
            </div>
          </Card>

          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Daily Schedule</h2>
            </div>
            
            <ScheduleTimeline date={selectedDate} />
          </section>
        </div>
      </main>
      
      <FloatingActionButton />
      <BottomNavigation />
    </>
  );
}
