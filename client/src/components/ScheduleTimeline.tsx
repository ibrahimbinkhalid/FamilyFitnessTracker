import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScheduleEvent, User } from '@shared/schema';

interface ScheduleTimelineProps {
  date?: Date;
}

export default function ScheduleTimeline({ date = new Date() }: ScheduleTimelineProps) {
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/schedule-events', date.toISOString().split('T')[0]],
    queryFn: async () => {
      const res = await fetch(`/api/schedule-events?date=${date.toISOString().split('T')[0]}`);
      if (!res.ok) throw new Error('Failed to fetch schedule events');
      return res.json() as Promise<ScheduleEvent[]>;
    },
  });

  // Fetch all events' assignees in parallel
  const eventAssigneeQueries = events?.map(event => {
    return useQuery({
      queryKey: ['/api/schedule-events', event.id, 'assignees'],
      queryFn: async () => {
        const res = await fetch(`/api/schedule-events/${event.id}/assignees`);
        if (!res.ok) throw new Error(`Failed to fetch assignees for event ${event.id}`);
        return res.json() as Promise<User[]>;
      },
      enabled: !!events, // Only run if events are loaded
    });
  }) || [];

  // Check if all assignee data has been loaded
  const assigneesLoading = eventAssigneeQueries.some(query => query.isLoading);
  const isLoading = eventsLoading || assigneesLoading;

  // Format time from date string (HH:MM AM/PM)
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calculate duration between two dates in hours and minutes
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Get background and border color classes based on event type
  const getEventColors = (type: string, color: string) => {
    const colorMap: Record<string, string> = {
      'primary': 'bg-primary bg-opacity-10 border-primary',
      'secondary': 'bg-secondary bg-opacity-10 border-secondary',
      'accent': 'bg-accent bg-opacity-10 border-accent',
      'default': 'bg-neutral-200 border-neutral-800',
    };

    return colorMap[color] || colorMap.default;
  };

  // Format assignee names for display
  const formatAssignees = (assignees: User[]) => {
    if (!assignees || assignees.length === 0) return 'No assignees';
    
    if (assignees.length === 1) return assignees[0].name;
    
    if (assignees.length === assignees.filter(a => a.name).length) {
      return 'Everyone';
    }
    
    return assignees.map(a => a.name).join(', ');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex mb-4">
            <div className="mr-4 text-right" style={{ width: '60px' }}>
              <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-6"></div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 border-l-4 border-gray-300 p-2 rounded h-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500">No events scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
      {events.map((event, index) => {
        const assignees = eventAssigneeQueries[index]?.data || [];
        
        return (
          <div className="flex mb-4 last:mb-0" key={event.id}>
            <div className="mr-4 text-right" style={{ width: '60px' }}>
              <div className="text-sm font-medium">{formatTime(event.startTime)}</div>
              <div className="text-xs text-gray-500">
                {calculateDuration(event.startTime, event.endTime)}
              </div>
            </div>
            <div className="flex-1">
              <div 
                className={`${getEventColors(event.type, event.color)} border-l-4 p-2 rounded cursor-pointer`}
                onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-xs text-gray-600">{formatAssignees(assignees)}</div>
                
                {expandedEventId === event.id && (
                  <div className="mt-2 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Start: {formatTime(event.startTime)}</span>
                      <span>End: {formatTime(event.endTime)}</span>
                    </div>
                    <div className="mt-1">Type: {event.type}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
