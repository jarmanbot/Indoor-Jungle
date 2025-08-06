import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { localStorage as localData } from "@/lib/localDataStorage";
import { 
  Droplet, 
  Package, 
  CheckCircle, 
  Clock,
  ChevronLeft,
  Sparkles
} from "lucide-react";

const BulkCare = () => {
  const [_, setLocation] = useLocation();
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"water" | "feed">("water");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
    queryFn: async () => {
      const plants = localData.get('plants') || [];
      return plants.sort((a: any, b: any) => (a.plantNumber || 0) - (b.plantNumber || 0));
    },
  });

  const bulkCareMutation = useMutation({
    mutationFn: async (data: { plantIds: number[], type: "watering" | "feeding", notes: string }) => {
      const timestamp = new Date().toISOString();
      
      // Update plants and add logs in local storage
      const plants = localData.get('plants') || [];
      const updatedPlants = plants.map((plant: any) => {
        if (data.plantIds.includes(plant.id)) {
          return {
            ...plant,
            [data.type === "watering" ? "lastWatered" : "lastFed"]: timestamp
          };
        }
        return plant;
      });
      localData.set('plants', updatedPlants);
      
      // Add logs for each plant
      const logType = data.type === "watering" ? "wateringLogs" : "feedingLogs";
      const existingLogs = localData.get(logType) || [];
      const newLogs = data.plantIds.map(plantId => ({
        id: Date.now() + Math.random(), // Simple ID generation
        plantId,
        [data.type === "watering" ? "wateredAt" : "fedAt"]: timestamp,
        notes: data.notes || ""
      }));
      localData.set(logType, [...existingLogs, ...newLogs]);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      
      toast({
        title: "Bulk care completed!",
        description: `Successfully logged ${variables.type} for ${variables.plantIds.length} plants`,
      });
      
      // Reset form
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log bulk care",
        variant: "destructive",
      });
    }
  });

  const handleBulkCare = (plantIds: number[], type: "watering" | "feeding") => {
    if (plantIds.length === 0) return;
    
    bulkCareMutation.mutate({
      plantIds,
      type,
      notes
    });
  };

  const getPlantsThatNeedCare = (type: "watering" | "feeding") => {
    if (!plants) return [];
    
    return plants.filter(plant => {
      const lastCareDate = type === "watering" ? plant.lastWatered : plant.lastFed;
      const frequency = type === "watering" ? plant.wateringFrequencyDays : plant.feedingFrequencyDays;
      
      if (!lastCareDate) return true;
      
      const daysSinceLastCare = Math.floor(
        (Date.now() - new Date(lastCareDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return daysSinceLastCare >= (frequency || (type === "watering" ? 7 : 14));
    });
  };

  const plantsThatNeedWater = getPlantsThatNeedCare("watering");
  const plantsThatNeedFeeding = getPlantsThatNeedCare("feeding");

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Bulk Plant Care</h2>
        <div className="text-center py-8">Loading plants...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <Button onClick={() => setLocation('/')} variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Plants
      </Button>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Plant Care</h2>
        <p className="text-gray-600">Log care for multiple plants at once</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("water")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === "water" 
              ? "bg-blue-500 text-white shadow-sm" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Droplet className="h-4 w-4" />
          Watering ({plantsThatNeedWater.length})
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === "feed" 
              ? "bg-green-500 text-white shadow-sm" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Package className="h-4 w-4" />
          Feeding ({plantsThatNeedFeeding.length})
        </button>
      </div>

      {/* Notes Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <Textarea
            placeholder="Add notes about this care session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Quick Action Button */}
      {(activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding).length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">
                  {activeTab === "water" ? "Water all plants that need it" : "Feed all plants that need it"}
                </h3>
                <p className="text-sm text-gray-600">
                  {(activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding).length} plants ready for {activeTab === "water" ? "watering" : "feeding"}
                </p>
              </div>
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
            
            <Button 
              className={`w-full ${activeTab === "water" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
              onClick={() => handleBulkCare(
                (activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding).map(p => p.id),
                activeTab === "water" ? "watering" : "feeding"
              )}
              disabled={bulkCareMutation.isPending}
            >
              {bulkCareMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {activeTab === "water" ? "Water" : "Feed"} All ({(activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding).length})
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plant List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Plants that need {activeTab === "water" ? "watering" : "feeding"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding).length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">All caught up!</h3>
              <p className="text-gray-600 text-sm">
                No plants need {activeTab === "water" ? "watering" : "feeding"} right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding).map(plant => {
                const lastCareDate = activeTab === "water" ? plant.lastWatered : plant.lastFed;
                const daysSince = lastCareDate 
                  ? Math.floor((Date.now() - new Date(lastCareDate).getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                
                return (
                  <div key={plant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                        alt={plant.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{plant.name}</h4>
                      <p className="text-sm text-gray-600">
                        {plant.location} • #{plant.plantNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={activeTab === "water" ? "text-blue-600" : "text-green-600"}>
                        {daysSince ? `${daysSince} days ago` : "Never"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkCare;