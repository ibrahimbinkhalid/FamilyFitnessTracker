import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

interface FamilyProgressItem {
  userId: number;
  progress: number;
}

// Mock family ID until auth is implemented
const FAMILY_ID = 1;

export default function FamilyActivitySummary() {
  // Fetch family members
  const { data: familyMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['/api/families', FAMILY_ID, 'members'],
    queryFn: async () => {
      const res = await fetch(`/api/families/${FAMILY_ID}/members`);
      if (!res.ok) throw new Error('Failed to fetch family members');
      return res.json() as Promise<User[]>;
    },
  });

  // Fetch family progress
  const { data: familyProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['/api/families', FAMILY_ID, 'progress'],
    queryFn: async () => {
      const res = await fetch(`/api/families/${FAMILY_ID}/progress`);
      if (!res.ok) throw new Error('Failed to fetch family progress');
      return res.json() as Promise<FamilyProgressItem[]>;
    },
  });

  const isLoading = loadingMembers || loadingProgress;

  // Get status indicator color based on progress
  const getStatusColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Format current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Family Activity</h2>
      <div className="bg-neutral-100 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Today's Progress</div>
          <div className="text-xs text-neutral-800">{formattedDate}</div>
        </div>
        
        {isLoading ? (
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-300 mb-1"></div>
                <div className="w-full bg-gray-200 h-2 mt-1"></div>
                <div className="h-4 w-8 bg-gray-200 mt-1 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex space-x-4">
            {familyMembers?.map((member) => {
              const progressData = familyProgress?.find(p => p.userId === member.id);
              const progress = progressData?.progress || 0;
              
              return (
                <div key={member.id} className="flex-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white mb-1 relative">
                    <span className="text-xs font-medium">{member.name}</span>
                    <div className={`absolute -bottom-1 -right-1 ${getStatusColor(progress)} rounded-full w-4 h-4 border-2 border-white`}></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs mt-1">{progress}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
