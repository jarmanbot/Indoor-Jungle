import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Droplet, 
  Package, 
  CheckCircle, 
  Clock,
  Check,
  Zap
} from "lucide-react";

const BulkCare = () => {
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [careType, setCareType] = useState<"watering" | "feeding" | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  const bulkCareMutation = useMutation({
    mutationFn: async (data: { plantIds: number[], type: "watering" | "feeding", notes: string }) => {
      const promises = data.plantIds.map(plantId => {
        const endpoint = data.type === "watering" 
          ? `/api/plants/${plantId}/watering-logs`
          : `/api/plants/${plantId}/feeding-logs`;
        
        return apiRequest('POST', endpoint, {
          [data.type === "watering" ? "wateredAt" : "fedAt"]: new Date().toISOString(),
          notes: data.notes
        });
      });
      
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      // Invalidate plant data and logs
      variables.plantIds.forEach(plantId => {
        queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/watering-logs`] });
        queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/feeding-logs`] });
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      
      toast({
        title: "Bulk care completed",
        description: `Successfully logged ${variables.type} for ${variables.plantIds.length} plants`,
      });
      
      // Reset form
      setSelectedPlants([]);
      setNotes("");
      setCareType(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log bulk care",
        variant: "destructive",
      });
    }
  });

  const handleSelectAll = () => {
    if (selectedPlants.length === plants?.length) {
      setSelectedPlants([]);
    } else {
      setSelectedPlants(plants?.map(p => p.id) || []);
    }
  };

  const handlePlantToggle = (plantId: number) => {
    setSelectedPlants(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const handleBulkCare = () => {
    if (!careType || selectedPlants.length === 0) return;
    
    bulkCareMutation.mutate({
      plantIds: selectedPlants,
      type: careType,
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
      <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Bulk Plant Care</h2>
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Droplet className="h-5 w-5" />
              Need Watering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">{plantsThatNeedWater.length}</span>
              <Badge variant="secondary">Plants</Badge>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                setSelectedPlants(plantsThatNeedWater.map(p => p.id));
                setCareType("watering");
              }}
              disabled={plantsThatNeedWater.length === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Water All
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Package className="h-5 w-5" />
              Need Feeding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">{plantsThatNeedFeeding.length}</span>
              <Badge variant="secondary">Plants</Badge>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                setSelectedPlants(plantsThatNeedFeeding.map(p => p.id));
                setCareType("feeding");
              }}
              disabled={plantsThatNeedFeeding.length === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Feed All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plant Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Plants</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              <Check className="h-4 w-4 mr-2" />
              {selectedPlants.length === plants?.length ? "Deselect All" : "Select All"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {plants?.map(plant => (
              <div key={plant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={selectedPlants.includes(plant.id)}
                  onCheckedChange={() => handlePlantToggle(plant.id)}
                />
                <div className="h-12 w-12 rounded-md overflow-hidden">
                  <img 
                    src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                    alt={plant.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{plant.name}</h4>
                  <p className="text-sm text-muted-foreground">{plant.location}</p>
                </div>
                <div className="flex gap-1">
                  {plantsThatNeedWater.some(p => p.id === plant.id) && (
                    <Badge variant="outline" className="text-blue-600">
                      <Droplet className="h-3 w-3 mr-1" />
                      Water
                    </Badge>
                  )}
                  {plantsThatNeedFeeding.some(p => p.id === plant.id) && (
                    <Badge variant="outline" className="text-green-600">
                      <Package className="h-3 w-3 mr-1" />
                      Feed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Care Type Selection */}
      {selectedPlants.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Care Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                variant={careType === "watering" ? "default" : "outline"}
                onClick={() => setCareType("watering")}
                className="flex items-center gap-2"
              >
                <Droplet className="h-4 w-4" />
                Watering
              </Button>
              <Button
                variant={careType === "feeding" ? "default" : "outline"}
                onClick={() => setCareType("feeding")}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Feeding
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add notes about this care session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {selectedPlants.length > 0 && careType && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Ready to log care</h3>
                <p className="text-sm text-muted-foreground">
                  {careType} for {selectedPlants.length} selected plants
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleBulkCare}
              disabled={bulkCareMutation.isPending}
            >
              {bulkCareMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Logging Care...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Log {careType} for {selectedPlants.length} plants
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkCare;