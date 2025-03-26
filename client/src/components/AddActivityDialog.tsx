import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { insertActivitySchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Temporary user ID until auth is implemented
const USER_ID = 1;

export default function AddActivityDialog({ open, onOpenChange }: AddActivityDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activityName, setActivityName] = useState('');
  const [activityType, setActivityType] = useState('running');
  const [duration, setDuration] = useState('30');
  const [steps, setSteps] = useState('');
  
  const activityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const res = await apiRequest('POST', '/api/activities', activityData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', USER_ID, 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', USER_ID, 'recent-activities'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: "Activity Added",
        description: "Your activity has been logged successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add activity: ${error}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setActivityName('');
    setActivityType('running');
    setDuration('30');
    setSteps('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activityData = {
      name: activityName,
      type: activityType,
      icon: getIconForActivityType(activityType),
      duration: parseInt(duration),
      steps: steps ? parseInt(steps) : undefined,
      date: new Date(),
      userId: USER_ID
    };
    
    try {
      // Validate with schema
      insertActivitySchema.parse(activityData);
      activityMutation.mutate(activityData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check your form inputs and try again.",
        variant: "destructive",
      });
    }
  };

  const getIconForActivityType = (type: string): string => {
    const iconMap: Record<string, string> = {
      'running': 'directions_run',
      'walking': 'directions_walk',
      'cycling': 'directions_bike',
      'swimming': 'pool',
      'weight_training': 'fitness_center',
      'yoga': 'self_improvement',
      'other': 'local_activity',
    };
    
    return iconMap[type] || 'directions_run';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={activityType} 
                onValueChange={setActivityType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="weight_training">Weight Training</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (min)
              </Label>
              <Input
                id="duration"
                className="col-span-3"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="steps" className="text-right">
                Steps
              </Label>
              <Input
                id="steps"
                className="col-span-3"
                type="number"
                placeholder="Optional"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={activityMutation.isPending}>
              {activityMutation.isPending ? "Adding..." : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
