import { Link } from "wouter";
import { format, isToday } from "date-fns";
import { MoreVertical, Droplets, Package, Clock } from "lucide-react";
import { Plant, PlantStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";


interface PlantCardProps {
  plant: Plant;
  index?: number;
}

const PlantCard = ({ plant, index = 0 }: PlantCardProps) => {
  const { toast } = useToast();

  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    if (isToday(new Date(date))) return "Today";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Format location for display
  const formatLocation = (location: string) => {
    return location
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  // Handle watering a plant
  const handleWaterNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const currentTime = new Date().toISOString();
      
      // Save watering log to Firebase
      const response = await fetch(`/api/plants/${plant.id}/watering-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          wateredAt: currentTime,
          amount: "moderate",
          notes: "Quick watering from home screen"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save watering log');
      }

      // Calculate next watering date
      const nextWater = new Date(currentTime);
      nextWater.setDate(nextWater.getDate() + (plant.wateringFrequencyDays || 7));
      
      // Calculate next feeding date (if lastFed exists)
      let nextCheck = nextWater;
      if (plant.lastFed && plant.feedingFrequencyDays) {
        const nextFeed = new Date(plant.lastFed);
        nextFeed.setDate(nextFeed.getDate() + plant.feedingFrequencyDays);
        // Use the earlier of next water or next feed
        nextCheck = nextWater < nextFeed ? nextWater : nextFeed;
      }

      // Update the plant's lastWatered and nextCheck dates via Firebase API
      const updateResponse = await fetch(`/api/plants/${plant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          lastWatered: currentTime,
          nextCheck: nextCheck.toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update plant');
      }
      
      // Enhanced cache invalidation with proper sequence for immediate UI updates
      queryClient.removeQueries({ queryKey: ['/api/plants'] });
      queryClient.removeQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}/watering-logs`] });
      
      // Force immediate refetch with proper timing
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/plants'] });
        queryClient.refetchQueries({ queryKey: [`/api/plants/${plant.id}`] });
      }, 100);
      
      toast({
        title: "Plant watered",
        description: `${plant.babyName} has been watered successfully`,
      });
    } catch (error) {
      console.error('Error watering plant:', error);
      toast({
        title: "Error",
        description: "Failed to record watering",
        variant: "destructive"
      });
    }
  };
  
  // Handle feeding a plant
  const handleFeedNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const currentTime = new Date().toISOString();
      
      // Save feeding log to Firebase
      const response = await fetch(`/api/plants/${plant.id}/feeding-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          fedAt: currentTime,
          fertilizer: "general",
          amount: "moderate",
          notes: "Quick feeding from home screen"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save feeding log');
      }

      // Calculate next feeding date
      const nextFeed = new Date(currentTime);
      nextFeed.setDate(nextFeed.getDate() + (plant.feedingFrequencyDays || 14));
      
      // Calculate next watering date (if lastWatered exists)
      let nextCheck = nextFeed;
      if (plant.lastWatered && plant.wateringFrequencyDays) {
        const nextWater = new Date(plant.lastWatered);
        nextWater.setDate(nextWater.getDate() + plant.wateringFrequencyDays);
        // Use the earlier of next water or next feed
        nextCheck = nextFeed < nextWater ? nextFeed : nextWater;
      }

      // Update the plant's lastFed and nextCheck dates via Firebase API
      const updateResponse = await fetch(`/api/plants/${plant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          lastFed: currentTime,
          nextCheck: nextCheck.toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update plant');
      }
      
      // Enhanced cache invalidation with proper sequence for immediate UI updates
      queryClient.removeQueries({ queryKey: ['/api/plants'] });
      queryClient.removeQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}/feeding-logs`] });
      
      // Force immediate refetch with proper timing
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/plants'] });
        queryClient.refetchQueries({ queryKey: [`/api/plants/${plant.id}`] });
      }, 100);
      
      toast({
        title: "Plant fed",
        description: `${plant.babyName} has been fed successfully`,
      });
    } catch (error) {
      console.error('Error feeding plant:', error);
      toast({
        title: "Error",
        description: "Failed to record feeding",
        variant: "destructive"
      });
    }
  };
  
  const isEven = index % 2 === 0;
  const bgColor = isEven ? "bg-blue-50" : "bg-green-50";
  
  return (
    <div className={`relative ${bgColor} border-b border-gray-200 py-1.5 pl-2.5 pr-1.5`}>
      <div className="flex items-center">
        <Link href={`/plant/${plant.id}`} className="flex flex-1">
          {/* Plant Image - keeping same size */}
          <div className="w-16 h-16 mr-2.5 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={plant.imageUrl || "https://via.placeholder.com/100x100?text=No+Image"} 
              alt={plant.babyName} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Plant Information - more compact */}
          <div className="flex-1">
            <div className="flex items-center mb-0.5">
              <span className="bg-green-600 text-white text-xs font-medium rounded-full px-1.5 py-0.5 mr-1.5 text-[10px]">
                {plant.plantNumber || "?"}
              </span>
              <h3 className="font-semibold text-gray-900 text-sm">{plant.babyName}</h3>
            </div>
            <div className="text-xs text-gray-600 mb-0.5">
              {plant.commonName || plant.latinName || "Unknown species"}
            </div>
            {plant.latinName && (
              <div className="text-xs italic text-gray-500 mb-0.5">{plant.latinName}</div>
            )}
            <div className="flex items-center">
              {(() => {
                // Calculate next check date if not set
                let nextCheckDate = plant.nextCheck;
                if (!nextCheckDate && plant.lastWatered) {
                  const lastWatered = new Date(plant.lastWatered);
                  const daysToAdd = plant.wateringFrequencyDays || 7;
                  nextCheckDate = new Date(lastWatered.getTime() + (daysToAdd * 24 * 60 * 60 * 1000)).toISOString();
                } else if (!nextCheckDate) {
                  // If no last watered date, suggest checking soon
                  nextCheckDate = new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)).toISOString();
                }
                
                return nextCheckDate && (
                  <div className="flex items-center text-xs text-gray-500 mr-2">
                    <Clock className="h-2.5 w-2.5 mr-1 text-amber-500" />
                    <span className="text-[10px]">Check: {formatDate(new Date(nextCheckDate))}</span>
                  </div>
                );
              })()}
              {plant.location && (
                <div className="text-xs text-gray-500 text-[10px]">
                  {formatLocation(plant.location)}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
      
      {/* Quick action instructions - smaller */}
      <p className="text-[10px] text-gray-500 mt-1 mb-1 text-center">Click card for detailed care logging</p>
      
      {/* Quick action buttons - more compact */}
      <div className="flex mt-1 gap-1.5">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-6 text-[10px] px-2 text-blue-600 border-blue-200"
          onClick={handleWaterNow}
        >
          <Droplets className="h-2.5 w-2.5 mr-1" />
          Water
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-6 text-[10px] px-2 text-green-600 border-green-200"
          onClick={handleFeedNow}
        >
          <Package className="h-2.5 w-2.5 mr-1" />
          Feed
        </Button>
      </div>
    </div>
  );
};

export default PlantCard;
