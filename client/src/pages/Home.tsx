import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlantCard from "@/components/PlantCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Leaf, Droplet, Package, ImageIcon, Thermometer, Search, Award, CalendarRange, X, Cloud, ArrowRight } from "lucide-react";
import { initializeLocalStorage } from "@/lib/localDataStorage";
import { useFirebasePlants, useMigrationStatus } from "@/lib/firebaseDataStorage";
import { MigrationModal } from "@/components/MigrationModal";
import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  
  // Enable Firebase for testing the backend
  const isUsingFirebase = true; // Firebase backend is operational and ready for migration
  
  // Check if local storage has plants for migration
  const [localPlantCount, setLocalPlantCount] = useState(0);
  
  React.useEffect(() => {
    initializeLocalStorage();
    const localPlants = JSON.parse(window.localStorage.getItem('plant_app_plants') || '[]');
    setLocalPlantCount(localPlants.length);
  }, []);
  
  const { data: plants, isLoading, error, refetch } = useQuery<Plant[]>({
    queryKey: isUsingFirebase ? ['/api/plants'] : ['/api/plants/local'],
    queryFn: async () => {
      if (isUsingFirebase) {
        // Firebase API call
        const response = await fetch('/api/plants', {
          headers: {
            'X-User-ID': 'dev-user'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch plants');
        const plantsData = await response.json();
        console.log('Fetched plants from Firebase:', plantsData.length, 'plants');
        return plantsData;
      } else {
        // Local storage
        initializeLocalStorage();
        const plants = JSON.parse(window.localStorage.getItem('plant_app_plants') || '[]');
        return plants.sort((a: any, b: any) => (a.plantNumber || 0) - (b.plantNumber || 0));
      }
    },
    staleTime: 10 * 1000, // 10 seconds
    cacheTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true
  });

  // Remove excessive debug logging to improve performance
  if (process.env.NODE_ENV === 'development') {
    console.log("Home page - Plants:", plants?.length || 0, "plants", isUsingFirebase ? "Firebase" : "Local");
  }

  // Filter plants based on search query
  const filteredPlants = plants?.filter(plant => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      plant.name?.toLowerCase().includes(query) ||
      plant.babyName?.toLowerCase().includes(query) ||
      plant.commonName?.toLowerCase().includes(query) ||
      plant.latinName?.toLowerCase().includes(query) ||
      plant.plantNumber?.toString().includes(query)
    );
  }) || [];

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

  // Calculate total plants needing care (either water or feeding)
  const plantsNeedingCare = plants?.filter(plant => {
    const needsWater = !plant.lastWatered || 
      Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)) >= (plant.wateringFrequencyDays || 7);
    const needsFeeding = !plant.lastFed || 
      Math.floor((Date.now() - new Date(plant.lastFed).getTime()) / (1000 * 60 * 60 * 24)) >= (plant.feedingFrequencyDays || 14);
    return needsWater || needsFeeding;
  }).length || 0;

  return (
    <div className="pb-20">
      {/* Header with stats */}
      <div className="bg-green-50 p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-800 text-lg">My Plants</h2>
              {isAuthenticated && (
                <Badge variant="secondary" className="text-xs">
                  <Cloud className="h-3 w-3 mr-1" />
                  Firebase
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{totalPlants} plants in your collection</p>
          </div>

        </div>

        {/* Need Care Button */}
        {totalPlants > 0 && plantsNeedingCare > 0 && (
          <Link href="/bulk-care">
            <Card className="bg-orange-100 border-orange-200 hover:bg-orange-200 transition-colors cursor-pointer">
              <CardContent className="px-3 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-200 rounded-full p-1">
                      <Droplet className="h-3 w-3 text-orange-700" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-orange-900">{plantsNeedingCare}</div>
                      <p className="text-xs text-orange-700">
                        Plant{plantsNeedingCare === 1 ? '' : 's'} need care
                      </p>
                    </div>
                  </div>
                  <div className="text-orange-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Migration Notice - Show if using Firebase but have local storage data */}
        {isUsingFirebase && localPlantCount > 0 && (plants?.length || 0) === 0 && (
          <div className="mt-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Cloud className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Migrate {localPlantCount} Plants to Firebase
                      </h3>
                      <p className="text-xs text-blue-700 mb-2">
                        Transfer your existing plants from local storage to Firebase for unlimited storage and cross-device sync.
                      </p>
                      <button
                        onClick={() => setShowMigrationModal(true)}
                        className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition-colors"
                      >
                        <Cloud className="h-3 w-3" />
                        Migrate Now
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Search bar for many plants */}
      {plants && plants.length > 3 && (
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search plants by name, type, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-gray-600">
              {filteredPlants.length} of {plants.length} plants shown
            </div>
          )}
        </div>
      )}

      {/* Enhanced scrollable plant list */}
      <div className="flex-1 relative">
        {plants && plants.length > 5 && !searchQuery && (
          <div className="bg-green-50 border-b border-green-200 px-3 py-2 text-xs text-green-700 font-medium">
            {plants.length} plants • Scroll down to see all
          </div>
        )}
        
        <div className="plant-list overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
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
            <div className="bg-red-50 p-4 rounded-md border border-red-100 m-4">
              <p className="text-red-600">Failed to load plants. Please try again.</p>
            </div>
          ) : filteredPlants && filteredPlants.length > 0 ? (
            // Plants list
            filteredPlants.map((plant, index) => (
              <PlantCard key={`plant-${plant.id}-${plant.plantNumber || index}`} plant={plant} index={index} />
            ))
          ) : searchQuery && plants && plants.length > 0 ? (
            // No search results
            <div className="text-center py-8 px-4">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No plants found</h3>
              <p className="text-gray-600 mb-4">Try searching with different keywords</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-green-600 hover:text-green-700 underline text-sm"
              >
                Clear search to see all plants
              </button>
            </div>
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
        
        {/* Scroll indicator for many plants */}
        {filteredPlants && filteredPlants.length > 10 && (
          <div className="absolute bottom-2 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg opacity-75">
            {searchQuery ? `${filteredPlants.length} of ${plants?.length}` : `${filteredPlants.length} total`}
          </div>
        )}
      </div>

      <FloatingActionButton />
      
      {/* Migration Modal */}
      <MigrationModal 
        open={showMigrationModal} 
        onOpenChange={setShowMigrationModal} 
      />
    </div>
  );
};

export default Home;
