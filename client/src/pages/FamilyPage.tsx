import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Family } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Temporary user ID until auth is implemented
const USER_ID = 1;
const FAMILY_ID = 1;

export default function FamilyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');

  // Fetch current family
  const { data: family, isLoading: loadingFamily } = useQuery({
    queryKey: ['/api/families', FAMILY_ID],
    queryFn: async () => {
      const res = await fetch(`/api/families/${FAMILY_ID}`);
      if (!res.ok) throw new Error('Failed to fetch family');
      return res.json() as Promise<Family>;
    },
  });

  // Fetch family members
  const { data: familyMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['/api/families', FAMILY_ID, 'members'],
    queryFn: async () => {
      const res = await fetch(`/api/families/${FAMILY_ID}/members`);
      if (!res.ok) throw new Error('Failed to fetch family members');
      return res.json() as Promise<User[]>;
    },
  });

  // Create new user and add to family mutation
  const addMemberMutation = useMutation({
    mutationFn: async (userData: any) => {
      // First create the user
      const userRes = await apiRequest('POST', '/api/users', userData);
      const user = await userRes.json();
      
      // Then add to family
      const memberRes = await apiRequest('POST', '/api/family-members', {
        familyId: FAMILY_ID,
        userId: user.id
      });
      
      return memberRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families', FAMILY_ID, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/families', FAMILY_ID, 'progress'] });
      setShowAddMemberDialog(false);
      resetForm();
      toast({
        title: "Member Added",
        description: "New family member has been added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add family member: ${error}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setNewMemberName('');
    setNewMemberUsername('');
    setNewMemberPassword('');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName || !newMemberUsername || !newMemberPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new user data
    const userData = {
      name: newMemberName,
      username: newMemberUsername,
      password: newMemberPassword,
      role: "member",
    };
    
    addMemberMutation.mutate(userData);
  };

  const isLoading = loadingFamily || loadingMembers;

  // Function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Family Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {isLoading ? '...' : family?.name.charAt(0) || 'F'}
                </div>
                <h2 className="text-xl font-bold mb-1">{isLoading ? 'Loading...' : family?.name || 'Your Family'}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {isLoading ? '' : `${familyMembers?.length || 0} members`}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddMemberDialog(true)}
                >
                  <span className="material-icons text-sm mr-1">person_add</span>
                  Add Family Member
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Family Members */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Family Members</h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !familyMembers?.length ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No family members found.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setShowAddMemberDialog(true)}
                  >
                    Add Family Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyMembers.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-4">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
          
          {/* Family Stats */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Family Stats</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Family Workouts</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Daily Steps</span>
                    <Badge variant="outline">6,230</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Most Active Member</span>
                    <Badge>{familyMembers?.[0]?.name || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scheduled Events This Week</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <span className="material-icons text-sm mr-1">assessment</span>
                  View Detailed Stats
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>
      </main>
      <BottomNavigation />
      
      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  className="col-span-3"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddMemberDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMemberMutation.isPending}>
                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
