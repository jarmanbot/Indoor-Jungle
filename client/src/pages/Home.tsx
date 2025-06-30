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
  const { data: plants, isLoading, error, refetch } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
    staleTime: 0, // Always refetch on mount
    refetchOnMount: true,
  });

  // Debug log for plants data
  console.log("Home page - Plants data:", plants);
  console.log("Home page - IsLoading:", isLoading);
  console.log("Home page - Error:", error);

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
      <div className="bg-green-50 p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">My Plants</h2>
            <p className="text-sm text-gray-600">{totalPlants} plants in your collection</p>
          </div>

        </div>

        {/* Compact stats */}
        {totalPlants > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            <Link href="/analytics">
              <Card className="bg-green-100 border-green-200 hover:bg-green-200 transition-colors cursor-pointer">
                <CardContent className="p-1.5">
                  <div className="flex items-center gap-1">
                    <div className="bg-blue-100 rounded-full p-0.5">
                      <Leaf className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{totalPlants}</div>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/bulk-care">
              <Card className="bg-green-100 border-green-200 hover:bg-green-200 transition-colors cursor-pointer">
                <CardContent className="p-1.5">
                  <div className="flex items-center gap-1">
                    <div className="bg-orange-100 rounded-full p-0.5">
                      <Droplet className="h-2.5 w-2.5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{plantsNeedingWater}</div>
                      <p className="text-xs text-gray-600">Need water</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/bulk-care">
              <Card className="bg-green-100 border-green-200 hover:bg-green-200 transition-colors cursor-pointer">
                <CardContent className="p-1.5">
                  <div className="flex items-center gap-1">
                    <div className="bg-green-100 rounded-full p-0.5">
                      <Package className="h-2.5 w-2.5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{plantsNeedingFeeding}</div>
                      <p className="text-xs text-gray-600">Need feed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>

      {/* Compact Quick Actions */}
      <div className="p-2 bg-green-100 border-b">
        <h3 className="font-medium text-gray-800 mb-1.5 text-sm">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-1.5">
          <Link href="/bulk-care" className="flex flex-col items-center p-1.5 rounded-lg bg-white hover:bg-green-50 transition-colors">
            <div className="bg-green-200 rounded-full p-1 mb-0.5">
              <Zap className="h-2.5 w-2.5 text-green-700" />
            </div>
            <span className="text-xs text-center text-gray-700">Bulk Care</span>
          </Link>
          
          <Link href="/identify" className="flex flex-col items-center p-1.5 rounded-lg bg-white hover:bg-green-50 transition-colors">
            <div className="bg-blue-200 rounded-full p-1 mb-0.5">
              <Search className="h-2.5 w-2.5 text-blue-700" />
            </div>
            <span className="text-xs text-center text-gray-700">Plant ID</span>
          </Link>
          
          <Link href="/recommendations" className="flex flex-col items-center p-1.5 rounded-lg bg-white hover:bg-green-50 transition-colors">
            <div className="bg-purple-200 rounded-full p-1 mb-0.5">
              <Brain className="h-2.5 w-2.5 text-purple-700" />
            </div>
            <span className="text-xs text-center text-gray-700">Smart Tips</span>
          </Link>
          
          <Link href="/analytics" className="flex flex-col items-center p-1.5 rounded-lg bg-white hover:bg-green-50 transition-colors">
            <div className="bg-indigo-200 rounded-full p-1 mb-0.5">
              <BarChart3 className="h-2.5 w-2.5 text-indigo-700" />
            </div>
            <span className="text-xs text-center text-gray-700">Analytics</span>
          </Link>
        </div>
      </div>
      
      <div className="plant-list">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className={`relative ${i % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'} border-b border-gray-200 py-2 pl-3 pr-2 flex items-center`}>
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
          plants.map((plant, index) => (
            <PlantCard key={plant.id} plant={plant} index={index} />
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No plants yet</h3>
            <p className="text-gray-600 mb-4">Start adding plants to your collection</p>
            <Link href="/add" className="bg-green-700 text-white px-4 py-2 rounded-md font-medium inline-block">
              Add Your First Plant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
