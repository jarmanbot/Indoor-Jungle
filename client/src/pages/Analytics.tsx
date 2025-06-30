import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Calendar, 
  Droplet, 
  Leaf, 
  Clock,
  Award,
  BarChart3,
  PieChart,
  ChevronLeft
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plant } from "@shared/schema";

const Analytics = () => {
  const [_, setLocation] = useLocation();
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  // Calculate analytics data
  const totalPlants = plants?.length || 0;
  const plantsWateredThisWeek = plants?.filter(plant => {
    if (!plant.lastWatered) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(plant.lastWatered) > weekAgo;
  }).length || 0;

  const careConsistency = totalPlants > 0 ? Math.round((plantsWateredThisWeek / totalPlants) * 100) : 0;

  return (
    <div className="p-4 pb-20">
      <Button onClick={() => setLocation('/')} variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Plants
      </Button>
      <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Plant Analytics</h2>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="care">Care Stats</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
                <Leaf className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPlants}</div>
                <p className="text-xs text-muted-foreground">
                  In your collection
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Care Consistency</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{careConsistency}%</div>
                <Progress value={careConsistency} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Droplet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plantsWateredThisWeek}</div>
                <p className="text-xs text-muted-foreground">
                  Plants watered
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Care Streak</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Days consistent
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Care Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed charts coming soon!</p>
                <p className="text-sm">Track watering patterns, feeding schedules, and plant growth over time.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="care" className="mt-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Care Frequency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Weekly watering consistency</span>
                    <Badge variant="secondary">{careConsistency}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average days between watering</span>
                    <Badge variant="secondary">7 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Most consistent plant</span>
                    <Badge variant="secondary">Alex Yoloba</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Advanced Care Analytics Coming Soon!</p>
                  <ul className="text-sm space-y-1">
                    <li>• Seasonal care pattern analysis</li>
                    <li>• Plant health correlation tracking</li>
                    <li>• Optimal care timing predictions</li>
                    <li>• Care cost tracking and budgeting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="growth" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-6 opacity-50" />
                <h3 className="text-lg font-medium mb-4">Growth Analytics Coming Soon!</h3>
                <div className="max-w-md mx-auto text-sm space-y-2">
                  <p>• Photo-based growth timeline tracking</p>
                  <p>• Size measurement logging and visualization</p>
                  <p>• Before/after comparison tools</p>
                  <p>• Growth rate calculations and predictions</p>
                  <p>• Seasonal growth pattern analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;