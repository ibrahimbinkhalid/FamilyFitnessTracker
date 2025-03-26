import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ActivityStat } from '@shared/schema';

// Temporary user ID until auth is implemented
const USER_ID = 1;

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState('7');
  const [activityType, setActivityType] = useState('all');

  // Fetch user's activity stats
  const { data: activityStats, isLoading } = useQuery({
    queryKey: ['/api/users', USER_ID, 'activity-stats', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/users/${USER_ID}/activity-stats?days=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch activity stats');
      return res.json() as Promise<ActivityStat[]>;
    },
  });

  // Filter stats by activity type if needed
  const filteredStats = activityType === 'all' 
    ? activityStats 
    : activityStats?.filter(stat => stat.activityType === activityType);

  // Group stats by date for line chart
  const getChartData = () => {
    if (!filteredStats) return [];
    
    const groupedByDate = filteredStats.reduce((acc, stat) => {
      const date = new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!acc[date]) {
        acc[date] = { date, value: 0 };
      }
      
      acc[date].value += stat.value;
      return acc;
    }, {} as Record<string, { date: string, value: number }>);
    
    return Object.values(groupedByDate);
  };

  // Get summary stats for the selected period
  const getSummaryStats = () => {
    if (!filteredStats || filteredStats.length === 0) return { total: 0, average: 0, max: 0 };
    
    const total = filteredStats.reduce((sum, stat) => sum + stat.value, 0);
    const average = total / filteredStats.length;
    const max = Math.max(...filteredStats.map(stat => stat.value));
    
    return { total, average, max };
  };

  // Get data for activity distribution pie chart
  const getActivityDistribution = () => {
    if (!activityStats) return [];
    
    const distribution = activityStats.reduce((acc, stat) => {
      if (!acc[stat.activityType]) {
        acc[stat.activityType] = 0;
      }
      acc[stat.activityType] += stat.value;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const { total, average, max } = getSummaryStats();
  const chartData = getChartData();
  const distributionData = getActivityDistribution();

  return (
    <>
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Activity Progress</CardTitle>
                <div className="flex space-x-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="steps">Steps</SelectItem>
                      <SelectItem value="exercise_minutes">Exercise</SelectItem>
                      <SelectItem value="calories">Calories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">No activity data available for this period.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{average.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                  <p className="text-sm text-gray-500">Average</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{max.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Maximum</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="chart">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="chart">Activity Trends</TabsTrigger>
              <TabsTrigger value="distribution">Activity Distribution</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-gray-500">No activity data available for this period.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4F46E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : distributionData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-gray-500">No activity data available for this period.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center mt-4">
                        {distributionData.map((entry, index) => (
                          <div key={index} className="flex items-center mx-2 mb-2">
                            <div 
                              className="w-3 h-3 mr-1" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-xs">{entry.name}: {entry.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <BottomNavigation />
    </>
  );
}
