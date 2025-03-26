import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import FamilyActivitySummary from '@/components/FamilyActivitySummary';
import { TodaysGoal, RecentActivities } from '@/components/ActivityCard';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import FloatingActionButton from '@/components/FloatingActionButton';
import { HealthTip } from '@shared/schema';

// Temporary user ID until auth is implemented
const USER_ID = 1;

export default function FitnessPage() {
  // Fetch a random health tip
  const { data: healthTip, isLoading: tipLoading } = useQuery({
    queryKey: ['/api/health-tips/random'],
    queryFn: async () => {
      const res = await fetch('/api/health-tips/random');
      if (!res.ok) throw new Error('Failed to fetch health tip');
      return res.json() as Promise<HealthTip>;
    },
  });

  return (
    <>
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Family Activity Summary */}
          <FamilyActivitySummary />
          
          {/* Your Activity Section */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Activity</h2>
              <button className="text-xs text-primary font-medium flex items-center">
                View all <span className="material-icons text-sm ml-1">arrow_forward</span>
              </button>
            </div>
            
            {/* Today's Goal */}
            <TodaysGoal userId={USER_ID} />
            
            {/* Recent Activities */}
            <RecentActivities userId={USER_ID} />
          </section>
          
          {/* Today's Schedule Section */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Today's Schedule</h2>
              <button className="text-xs text-primary font-medium flex items-center">
                Full schedule <span className="material-icons text-sm ml-1">event</span>
              </button>
            </div>
            
            <ScheduleTimeline />
          </section>
          
          {/* Health Tips Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Weekly Insights</h2>
            
            {tipLoading ? (
              <div className="bg-primary bg-opacity-5 rounded-lg p-4 border border-primary border-opacity-20 animate-pulse">
                <div className="h-20 bg-primary bg-opacity-10 rounded"></div>
              </div>
            ) : !healthTip ? (
              <div className="bg-primary bg-opacity-5 rounded-lg p-4 border border-primary border-opacity-20">
                <div className="flex items-start">
                  <span className="material-icons text-primary mr-3">lightbulb</span>
                  <div>
                    <h3 className="font-medium mb-1">Fitness Tip</h3>
                    <p className="text-sm text-gray-700">No health tips available at the moment.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary bg-opacity-5 rounded-lg p-4 border border-primary border-opacity-20">
                <div className="flex items-start">
                  <span className="material-icons text-primary mr-3">{healthTip.icon}</span>
                  <div>
                    <h3 className="font-medium mb-1">{healthTip.title}</h3>
                    <p className="text-sm text-gray-700">{healthTip.content}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      
      <FloatingActionButton />
      <BottomNavigation />
    </>
  );
}
