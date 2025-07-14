import { Link } from "wouter";
import { format, isToday } from "date-fns";
import { MoreVertical, Droplets, Package, Clock } from "lucide-react";
import { Plant, PlantStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { localStorage as localData, isUsingLocalStorage } from "@/lib/localDataStorage";

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
    <div className={`relative ${bgColor} border-b border-gray-200 py-2 pl-3 pr-2`}>
      <div className="flex items-center">
        <Link href={`/plant/${plant.id}`} className="flex flex-1">
          {/* Plant Image */}
          <div className="w-16 h-16 mr-3 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={plant.imageUrl || "https://via.placeholder.com/100x100?text=No+Image"} 
              alt={plant.babyName} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Plant Information */}
          <div className="flex-1">
            <div className="flex items-center">
              <span className="bg-green-600 text-white text-xs font-medium rounded-full px-2 py-0.5 mr-2">
                {plant.plantNumber || "?"}
              </span>
              <h3 className="font-bold text-gray-900">{plant.babyName}</h3>
            </div>
            <div className="text-sm text-gray-600">
              {plant.commonName || plant.latinName || "Unknown species"}
            </div>
            {plant.latinName && (
              <div className="text-xs italic text-gray-500">{plant.latinName}</div>
            )}
            <div className="flex items-center mt-0.5">
              {plant.nextCheck && (
                <div className="flex items-center text-xs text-gray-500 mr-3">
                  <Clock className="h-3 w-3 mr-1 text-amber-500" />
                  <span>Check: {formatDate(plant.nextCheck)}</span>
                </div>
              )}
              {plant.location && (
                <div className="text-xs text-gray-500">
                  {formatLocation(plant.location)}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
      
      {/* Quick action instructions */}
      <p className="text-xs text-gray-500 mt-2 mb-1 text-center">Click card for detailed care logging</p>
      
      {/* Quick action buttons */}
      <div className="flex mt-1 gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-7 text-xs text-blue-600 border-blue-200"
          onClick={handleWaterNow}
        >
          <Droplets className="h-3 w-3 mr-1" />
          Log Watering (Quick Log)
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-7 text-xs text-green-600 border-green-200"
          onClick={handleFeedNow}
        >
          <Package className="h-3 w-3 mr-1" />
          Log Feeding (Quick Log)
        </Button>
      </div>
    </div>
  );
};

export default PlantCard;
