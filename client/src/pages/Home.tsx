import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlantCard from "@/components/PlantCard";
import PlantRolodex from "@/components/PlantRolodex";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Droplet, Package, ImageIcon, Thermometer, Zap, Search, Brain, BarChart3, Award, CalendarRange } from "lucide-react";
import { localStorage as localData, initializeLocalStorage } from "@/lib/localDataStorage";

const Home = () => {
  const { data: plants, isLoading, error, refetch } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
    queryFn: async () => {
      // Always use local storage mode now
      initializeLocalStorage();
      const plants = localData.get('plants') || [];
      // Sort plants by plant number to ensure proper display order
      return plants.sort((a: any, b: any) => (a.plantNumber || 0) - (b.plantNumber || 0));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Remove excessive debug logging to improve performance
  if (process.env.NODE_ENV === 'development') {
    console.log("Home page - Plants:", plants?.length || 0, "plants");
  }

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
      
      {/* Plant Rolodex */}
      {isLoading ? (
        // Loading state for rolodex
        <div className="px-4 py-8">
          <div className="flex items-center justify-center space-x-4">
            <Skeleton className="w-80 h-96 rounded-lg" />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-2 h-2 rounded-full" />
            ))}
          </div>
        </div>
      ) : error ? (
        // Error state
        <div className="bg-red-50 p-4 mx-4 rounded-md border border-red-100">
          <p className="text-red-600">Failed to load plants. Please try again.</p>
        </div>
      ) : plants && plants.length > 0 ? (
        // Plant Rolodex
        <PlantRolodex plants={plants} />
      ) : (
        // Empty state
        <div className="text-center py-8 px-4">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No plants yet</h3>
          <p className="text-gray-600 mb-4">Start adding plants to your collection</p>
          <div className="space-y-3">
            <Link href="/add" className="bg-green-700 text-white px-6 py-3 rounded-md font-medium inline-block">
              Add Your First Plant
            </Link>
            <div className="text-sm text-gray-500">
              Or enable the demo plant in{" "}
              <Link href="/settings" className="text-green-600 hover:text-green-700 underline">
                Settings
              </Link>{" "}
              to explore the app
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
