import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plant, PlantStatus } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isAfter, isPast, isToday, addDays } from "date-fns";
import { Droplet, Package, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";
import WateringLogForm from "@/components/WateringLogForm";
import FeedingLogForm from "@/components/FeedingLogForm";

const Tasks = () => {
  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });
  
  const { toast } = useToast();
  const [wateringPlant, setWateringPlant] = useState<Plant | null>(null);
  const [feedingPlant, setFeedingPlant] = useState<Plant | null>(null);

  // Filter plants that need watering (nextCheck is today or past)
  const needsWateringPlants = plants?.filter(plant => 
    plant.nextCheck && (isToday(new Date(plant.nextCheck)) || isPast(new Date(plant.nextCheck)))
  ) || [];

  // Filter plants that were fed more than 30 days ago or never fed
  const needsFeedingPlants = plants?.filter(plant => {
    if (!plant.lastFed) return true;
    return isPast(addDays(new Date(plant.lastFed), 30));
  }) || [];

  // Filter plants that need checking soon (nextCheck is within the next 3 days)
  const upcomingCheckPlants = plants?.filter(plant => {
    if (!plant.nextCheck) return false;
    const checkDate = new Date(plant.nextCheck);
    return !isPast(checkDate) && !isToday(checkDate) && 
           !isPast(addDays(new Date(), 3)) && isAfter(addDays(new Date(), 3), checkDate);
  }) || [];

  // Handle successful watering log submission
  const handleWateringSuccess = () => {
    setWateringPlant(null);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    
    if (wateringPlant) {
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${wateringPlant.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${wateringPlant.id}/watering-logs`] });
    }
  };

  // Handle successful feeding log submission
  const handleFeedingSuccess = () => {
    setFeedingPlant(null);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    
    if (feedingPlant) {
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${feedingPlant.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${feedingPlant.id}/feeding-logs`] });
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    if (isToday(new Date(date))) return "Today";
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <div className="p-4 pb-16">
      <h2 className="text-lg font-medium text-neutral-darkest mb-4">Plant Tasks</h2>

      {isLoading ? (
        <div className="text-center py-4">Loading tasks...</div>
      ) : plants && plants.length > 0 ? (
        <div className="space-y-6">
          {/* Plants that need watering */}
          <div>
            <div className="flex items-center mb-2">
              <Droplet className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium">Needs Watering</h3>
            </div>
            
            {needsWateringPlants.length === 0 ? (
              <Card>
                <CardContent className="py-4 text-center text-neutral-dark">
                  All plants are properly watered
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {needsWateringPlants.map(plant => (
                  <Card key={plant.id} className="overflow-hidden">
                    <div className="flex items-center p-3">
                      <Link href={`/plant/${plant.id}`}>
                        <a className="h-12 w-12 rounded-md overflow-hidden mr-3">
                          <img 
                            src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                            alt={plant.name}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/plant/${plant.id}`}>
                          <a className="font-medium">{plant.name}</a>
                        </Link>
                        <div className="flex items-center text-sm text-neutral-dark">
                          <span>Check due: {formatDate(plant.nextCheck)}</span>
                          {isPast(new Date(plant.nextCheck as Date)) && !isToday(new Date(plant.nextCheck as Date)) && (
                            <Badge variant="destructive" className="ml-2">Overdue</Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="ml-2"
                        onClick={() => handleWaterNow(plant)}
                      >
                        Water
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Plants that need feeding */}
          <div>
            <div className="flex items-center mb-2">
              <Package className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium">Needs Feeding</h3>
            </div>
            
            {needsFeedingPlants.length === 0 ? (
              <Card>
                <CardContent className="py-4 text-center text-neutral-dark">
                  All plants are properly fed
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {needsFeedingPlants.map(plant => (
                  <Card key={plant.id} className="overflow-hidden">
                    <div className="flex items-center p-3">
                      <Link href={`/plant/${plant.id}`}>
                        <a className="h-12 w-12 rounded-md overflow-hidden mr-3">
                          <img 
                            src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                            alt={plant.name}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/plant/${plant.id}`}>
                          <a className="font-medium">{plant.name}</a>
                        </Link>
                        <p className="text-sm text-neutral-dark">
                          Last fed: {plant.lastFed ? formatDate(plant.lastFed) : "Never"}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        className="ml-2"
                        onClick={() => handleFeedNow(plant)}
                      >
                        Feed
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming checks */}
          <div>
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="font-medium">Upcoming Checks</h3>
            </div>
            
            {upcomingCheckPlants.length === 0 ? (
              <Card>
                <CardContent className="py-4 text-center text-neutral-dark">
                  No upcoming checks in the next 3 days
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingCheckPlants.map(plant => (
                  <Card key={plant.id} className="overflow-hidden">
                    <div className="flex items-center p-3">
                      <Link href={`/plant/${plant.id}`}>
                        <a className="h-12 w-12 rounded-md overflow-hidden mr-3">
                          <img 
                            src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                            alt={plant.name}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/plant/${plant.id}`}>
                          <a className="font-medium">{plant.name}</a>
                        </Link>
                        <p className="text-sm text-neutral-dark">
                          Check on: {formatDate(plant.nextCheck)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Card>
            <CardContent className="py-8">
              <h3 className="text-lg font-medium text-neutral-darkest mb-2">No plants yet</h3>
              <p className="text-neutral-dark mb-4">Add plants to start tracking tasks</p>
              <Link href="/add">
                <Button>Add Your First Plant</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tasks;
