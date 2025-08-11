import { Link } from "wouter";
import { format, isToday } from "date-fns";
import { MoreVertical, Droplets, Package, Clock } from "lucide-react";
import { Plant, PlantStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { localStorage as localData } from "@/lib/localDataStorage";

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
      // Use local storage for watering logs
      const wateringLog = {
        id: Date.now(), // Simple ID generation
        plantId: plant.id,
        wateredAt: new Date().toISOString(),
        amount: "normal",
        notes: "Quick watering from home screen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local storage
      const existingLogs = localData.get('wateringLogs') || [];
      localData.set('wateringLogs', [...existingLogs, wateringLog]);
      
      // Update plant's lastWatered date
      const plants = localData.get('plants') || [];
      const updatedPlants = plants.map((p: any) => 
        p.id === plant.id ? { ...p, lastWatered: new Date().toISOString() } : p
      );
      localData.set('plants', updatedPlants);
      
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}/watering-logs`] });
      
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
      // Use local storage for feeding logs
      const feedingLog = {
        id: Date.now() + 1, // Simple ID generation with offset
        plantId: plant.id,
        fedAt: new Date().toISOString(),
        fertilizerType: "general",
        amount: "normal",
        notes: "Quick feeding from home screen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local storage
      const existingLogs = localData.get('feedingLogs') || [];
      localData.set('feedingLogs', [...existingLogs, feedingLog]);
      
      // Update plant's lastFed date
      const plants = localData.get('plants') || [];
      const updatedPlants = plants.map((p: any) => 
        p.id === plant.id ? { ...p, lastFed: new Date().toISOString() } : p
      );
      localData.set('plants', updatedPlants);
      
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}/feeding-logs`] });
      
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
            {plant.imageUrl === 'compressed_for_backup' ? (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative group">
                <Package className="h-6 w-6 text-green-600" />
                <div className="absolute inset-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-center rounded-md">
                  Image saved in backup files
                </div>
              </div>
            ) : (
              <img 
                src={plant.imageUrl || "https://via.placeholder.com/100x100?text=No+Image"} 
                alt={plant.babyName} 
                className="w-full h-full object-cover"
              />
            )}
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
