import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlantCard from "@/components/PlantCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Droplet, Package, ImageIcon, Thermometer, Zap, Search, Brain, BarChart3, Award, CalendarRange } from "lucide-react";

const Home = () => {
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  // Calculate stats for dashboard
  const totalPlants = plants?.length || 0;
  const plantsNeedingWater = plants?.filter(plant => {
    if (!plant.lastWatered) return true;
    const daysSince = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= (plant.wateringFrequencyDays || 7);
  }).length || 0;
  
  const plantsNeedingFeeding = plants?.filter(plant => {
    if (!plant.lastFed) return true;
    const daysSince = Math.floor((Date.now() - new Date(plant.lastFed).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= (plant.feedingFrequencyDays || 14);
  }).length || 0;

  return (
    <div className="pb-20">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">My Plants</h2>
            <p className="text-sm text-gray-600">{totalPlants} plants in your collection</p>
          </div>

        </div>

        {/* Compact stats and Quick Actions in same row */}
        {totalPlants > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Stats Column */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-1">Stats</h3>
              <div className="grid grid-cols-3 gap-1">
                <Card className="bg-white/70 backdrop-blur-sm p-1">
                  <CardContent className="p-0 text-center">
                    <div className="text-xs font-bold text-blue-600">{totalPlants}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/70 backdrop-blur-sm p-1">
                  <CardContent className="p-0 text-center">
                    <div className="text-xs font-bold text-orange-600">{plantsNeedingWater}</div>
                    <div className="text-xs text-gray-600">Water</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/70 backdrop-blur-sm p-1">
                  <CardContent className="p-0 text-center">
                    <div className="text-xs font-bold text-green-600">{plantsNeedingFeeding}</div>
                    <div className="text-xs text-gray-600">Feed</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions Column */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-1">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-1">
                <Link href="/add">
                  <Badge variant="outline" className="flex items-center gap-1 px-1 py-1 cursor-pointer hover:bg-green-50 text-xs w-full justify-center">
                    <Plus className="h-3 w-3" />
                    Add
                  </Badge>
                </Link>
                <Link href="/calendar">
                  <Badge variant="outline" className="flex items-center gap-1 px-1 py-1 cursor-pointer hover:bg-blue-50 text-xs w-full justify-center">
                    <CalendarRange className="h-3 w-3" />
                    Cal
                  </Badge>
                </Link>
                <Link href="/analytics">
                  <Badge variant="outline" className="flex items-center gap-1 px-1 py-1 cursor-pointer hover:bg-purple-50 text-xs w-full justify-center">
                    <BarChart3 className="h-3 w-3" />
                    Stats
                  </Badge>
                </Link>
                <Link href="/achievements">
                  <Badge variant="outline" className="flex items-center gap-1 px-1 py-1 cursor-pointer hover:bg-yellow-50 text-xs w-full justify-center">
                    <Award className="h-3 w-3" />
                    Awards
                  </Badge>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>


      
      <div className="plant-list">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="relative bg-white border-b border-gray-200 py-2 pl-3 pr-2 flex items-center">
              <Skeleton className="w-16 h-16 mr-3 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <p className="text-red-600">Failed to load plants. Please try again.</p>
          </div>
        ) : plants && plants.length > 0 ? (
          // Plants list
          plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No plants yet</h3>
            <p className="text-gray-600 mb-4">Start adding plants to your collection</p>
            <Link href="/add" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium inline-block">
              Add Your First Plant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
