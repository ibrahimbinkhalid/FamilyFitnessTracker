import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { insertScheduleEventSchema, insertEventAssigneeSchema, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Temporary user ID until auth is implemented
const USER_ID = 1;
const FAMILY_ID = 1;

export default function AddScheduleDialog({ open, onOpenChange }: AddScheduleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('exercise');
  const [eventColor, setEventColor] = useState('primary');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  
  // Fetch family members for assignee selection
  const { data: familyMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['/api/families', FAMILY_ID, 'members'],
    queryFn: async () => {
      const res = await fetch(`/api/families/${FAMILY_ID}/members`);
      if (!res.ok) throw new Error('Failed to fetch family members');
      return res.json() as Promise<User[]>;
    },
  });

  const scheduleEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const res = await apiRequest('POST', '/api/schedule-events', eventData);
      const event = await res.json();
      
      // Assign this event to all selected users
      for (const userId of selectedAssignees) {
        await apiRequest('POST', '/api/event-assignees', {
          eventId: event.id,
          userId
        });
      }
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-events'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: "Event Scheduled",
        description: "Your event has been scheduled successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to schedule event: ${error}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setTitle('');
    setEventType('exercise');
    setEventColor('primary');
    setStartTime('');
    setEndTime('');
    setSelectedAssignees([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime) {
      toast({
        title: "Missing Times",
        description: "Please set both start and end times for the event.",
        variant: "destructive",
      });
      return;
    }
    
    // Create full date objects from time inputs
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const startDateTime = new Date(`${today}T${startTime}:00`);
    const endDateTime = new Date(`${today}T${endTime}:00`);
    
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    
    const eventData = {
      title,
      type: eventType,
      color: eventColor,
      startTime: startDateTime,
      endTime: endDateTime,
      createdBy: USER_ID
    };
    
    try {
      // Validate with schema
      insertScheduleEventSchema.parse(eventData);
      
      if (selectedAssignees.length === 0) {
        toast({
          title: "No Assignees",
          description: "Please select at least one family member for this event.",
          variant: "destructive",
        });
        return;
      }
      
      scheduleEventMutation.mutate(eventData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check your form inputs and try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAssignee = (userId: number) => {
    setSelectedAssignees(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={eventType} 
                onValueChange={setEventType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Select 
                value={eventColor} 
                onValueChange={setEventColor}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Blue</SelectItem>
                  <SelectItem value="secondary">Green</SelectItem>
                  <SelectItem value="accent">Yellow</SelectItem>
                  <SelectItem value="default">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                className="col-span-3"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                className="col-span-3"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Assignees
              </Label>
              <div className="col-span-3 space-y-2">
                {loadingMembers ? (
                  <div className="text-sm text-gray-500">Loading family members...</div>
                ) : !familyMembers?.length ? (
                  <div className="text-sm text-gray-500">No family members found</div>
                ) : (
                  familyMembers.map(member => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`member-${member.id}`} 
                        checked={selectedAssignees.includes(member.id)}
                        onCheckedChange={() => toggleAssignee(member.id)}
                      />
                      <Label htmlFor={`member-${member.id}`} className="cursor-pointer">
                        {member.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={scheduleEventMutation.isPending}>
              {scheduleEventMutation.isPending ? "Scheduling..." : "Schedule Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
