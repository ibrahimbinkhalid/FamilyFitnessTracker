import { useState } from 'react';
import { Goal, Activity } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TodaysGoalProps {
  userId: number;
}

export function TodaysGoal({ userId }: TodaysGoalProps) {
  const queryClient = useQueryClient();
  
  const { data: goals, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'goals'],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/goals`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json() as Promise<Goal[]>;
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (updatedGoal: Partial<Goal> & { id: number }) => {
      const { id, ...goalData } = updatedGoal;
      const res = await apiRequest('PATCH', `/api/goals/${id}`, goalData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'goals'] });
    },
  });

  const todayGoal = goals?.find(goal => !goal.completed);
  
  const handleStartActivity = () => {
    // In a real app, this would start tracking the activity
    // For now, let's just increment the current value a bit
    if (todayGoal) {
      const incrementValue = Math.min(
        todayGoal.targetValue * 0.1, 
        todayGoal.targetValue - todayGoal.currentValue
      );
      
      updateGoalMutation.mutate({
        id: todayGoal.id,
        currentValue: todayGoal.currentValue + Math.round(incrementValue)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1"></div>
        <div className="flex justify-between mt-1">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    );
  }

  if (!todayGoal) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4 shadow-sm">
        <h3 className="font-medium mb-2">No Active Goals</h3>
        <p className="text-sm text-gray-500">Create a new goal to track your progress!</p>
      </div>
    );
  }

  const progressPercent = Math.min(
    Math.round((todayGoal.currentValue / todayGoal.targetValue) * 100),
    100
  );

  const getActivityIcon = () => {
    if (todayGoal.name.toLowerCase().includes('run')) return 'directions_run';
    if (todayGoal.name.toLowerCase().includes('weight')) return 'fitness_center';
    if (todayGoal.name.toLowerCase().includes('walk')) return 'directions_walk';
    if (todayGoal.name.toLowerCase().includes('bike')) return 'directions_bike';
    if (todayGoal.name.toLowerCase().includes('swim')) return 'pool';
    return 'directions_run';
  };

  const getIconBgColor = () => {
    if (todayGoal.name.toLowerCase().includes('run')) return 'bg-primary bg-opacity-10 text-primary';
    if (todayGoal.name.toLowerCase().includes('weight')) return 'bg-accent bg-opacity-10 text-accent';
    return 'bg-primary bg-opacity-10 text-primary';
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4 shadow-sm">
      <h3 className="font-medium mb-2">Today's Goal</h3>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${getIconBgColor()} flex items-center justify-center mr-3`}>
            <span className="material-icons">{getActivityIcon()}</span>
          </div>
          <div>
            <div className="font-medium">{todayGoal.name}</div>
            <div className="text-xs text-gray-500">Goal: {todayGoal.targetValue} {todayGoal.unit}</div>
          </div>
        </div>
        <button 
          className="px-3 py-1 bg-secondary text-white rounded-full text-xs"
          onClick={handleStartActivity}
          disabled={updateGoalMutation.isPending || progressPercent >= 100}
        >
          {updateGoalMutation.isPending ? 'Updating...' : progressPercent >= 100 ? 'Completed' : 'Start'}
        </button>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-secondary h-2.5 rounded-full" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span>{todayGoal.currentValue} {todayGoal.unit}</span>
        <span>{todayGoal.targetValue} {todayGoal.unit}</span>
      </div>
    </div>
  );
}

interface RecentActivitiesProps {
  userId: number;
}

export function RecentActivities({ userId }: RecentActivitiesProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'recent-activities'],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/recent-activities?limit=2`);
      if (!res.ok) throw new Error('Failed to fetch recent activities');
      return res.json() as Promise<Activity[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-neutral-200 p-3 flex justify-between items-center shadow-sm animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500">No recent activities found.</p>
      </div>
    );
  }

  // Function to format the activity date
  const formatActivityDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'weight_training':
        return 'bg-accent bg-opacity-10 text-accent';
      default:
        return 'bg-primary bg-opacity-10 text-primary';
    }
  };

  return (
    <div className="space-y-3">
      {activities?.map((activity) => (
        <div key={activity.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${getIconBgColor(activity.type)} flex items-center justify-center mr-3`}>
              <span className="material-icons">{activity.icon}</span>
            </div>
            <div>
              <div className="font-medium">{activity.name}</div>
              <div className="text-xs text-gray-500">{formatActivityDate(activity.date.toString())}</div>
            </div>
          </div>
          <div className="text-sm font-medium">{activity.duration} min</div>
        </div>
      ))}
    </div>
  );
}
