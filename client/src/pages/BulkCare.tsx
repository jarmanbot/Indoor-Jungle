import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Check,
  X,
  Filter,
  MousePointer2
} from "lucide-react";

const BulkCare = () => {
  const [_, setLocation] = useLocation();
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"water" | "feed">("water");
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [showOnlyNeedy, setShowOnlyNeedy] = useState(false);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragStartPlant, setDragStartPlant] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  const [groupBy, setGroupBy] = useState<'room' | 'lastWatered' | 'species' | 'potSize' | 'needsCare'>('room');
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
      queryClient.refetchQueries({ queryKey: ['/api/plants'] });
      
      toast({
        title: "Bulk care completed!",
        description: `Successfully logged ${variables.type} for ${variables.plantIds.length} plants`,
      });
      
      // Reset form
      setSelectedPlants([]);
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

  const handleBulkCare = () => {
    if (selectedPlants.length === 0) return;
    
    bulkCareMutation.mutate({
      plantIds: selectedPlants,
      type: activeTab === "water" ? "watering" : "feeding",
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

  const handlePlantToggle = (plantId: number) => {
    setSelectedPlants(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const handleSelectAllNeedy = () => {
    const needyPlants = getPlantsThatNeedCare(activeTab === "water" ? "watering" : "feeding");
    const needyIds = needyPlants.map(p => p.id);
    setSelectedPlants(needyIds);
  };

  const handleSelectAll = () => {
    if (!plants) return;
    const allIds = plants.map(p => p.id);
    setSelectedPlants(allIds);
  };

  const handleClearSelection = () => {
    setSelectedPlants([]);
  };

  // Drag-and-drop selection functionality
  const handleDragStart = useCallback((plantId: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', plantId.toString());
    
    setIsDragSelecting(true);
    setDragStartPlant(plantId);
    
    // Determine drag mode based on current selection state
    const isSelected = selectedPlants.includes(plantId);
    setDragMode(isSelected ? 'remove' : 'add');
    
    // Add visual feedback
    const plantCard = e.currentTarget as HTMLElement;
    plantCard.style.opacity = '0.5';
  }, [selectedPlants]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragSelecting(false);
    setDragStartPlant(null);
    
    // Reset visual feedback
    const plantCard = e.currentTarget as HTMLElement;
    plantCard.style.opacity = '1';
  }, []);

  const handleDragOver = useCallback((plantId: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (!isDragSelecting || plantId === dragStartPlant) return;
    
    // Select/deselect plants based on drag mode
    if (dragMode === 'add' && !selectedPlants.includes(plantId)) {
      setSelectedPlants(prev => [...prev, plantId]);
    } else if (dragMode === 'remove' && selectedPlants.includes(plantId)) {
      setSelectedPlants(prev => prev.filter(id => id !== plantId));
    }
  }, [isDragSelecting, dragStartPlant, dragMode, selectedPlants]);

  const handleDrop = useCallback((plantId: number, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!isDragSelecting) return;
    
    // Final selection logic
    if (dragMode === 'add' && !selectedPlants.includes(plantId)) {
      setSelectedPlants(prev => [...prev, plantId]);
    } else if (dragMode === 'remove' && selectedPlants.includes(plantId)) {
      setSelectedPlants(prev => prev.filter(id => id !== plantId));
    }
  }, [isDragSelecting, dragMode, selectedPlants]);

  // Group plants by various criteria
  const plantsThatNeedWater = getPlantsThatNeedCare("watering");
  const plantsThatNeedFeeding = getPlantsThatNeedCare("feeding");
  const currentNeedyPlants = activeTab === "water" ? plantsThatNeedWater : plantsThatNeedFeeding;
  const plantsToShow = showOnlyNeedy ? currentNeedyPlants : (plants || []);

  const getGroupKey = (plant: any, groupBy: string) => {
    switch (groupBy) {
      case 'room':
        return plant.location || 'No Location';
      case 'lastWatered':
        if (!plant.lastWatered) return 'Never Watered';
        const daysSinceWatered = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceWatered === 0) return 'Today';
        if (daysSinceWatered === 1) return 'Yesterday';
        if (daysSinceWatered <= 7) return 'This Week';
        if (daysSinceWatered <= 14) return '1-2 Weeks Ago';
        if (daysSinceWatered <= 30) return '2-4 Weeks Ago';
        return 'Over a Month Ago';
      case 'species':
        return plant.commonName || plant.name || 'Unknown Species';
      case 'potSize':
        return plant.potSize || 'Unknown Pot Size';
      case 'needsCare':
        const needsWater = plantsThatNeedWater.some(p => p.id === plant.id);
        const needsFood = plantsThatNeedFeeding.some(p => p.id === plant.id);
        if (needsWater && needsFood) return 'Needs Water & Food';
        if (needsWater) return 'Needs Water';
        if (needsFood) return 'Needs Food';
        return 'All Good';
      default:
        return 'Other';
    }
  };

  const plantsByGroup = plantsToShow.reduce((acc, plant) => {
    const groupKey = getGroupKey(plant, groupBy);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(plant);
    return acc;
  }, {} as Record<string, typeof plantsToShow>);

  const groupOptions = [
    { value: 'room', label: 'Room', icon: '🏠' },
    { value: 'lastWatered', label: 'Last Watered', icon: '💧' },
    { value: 'species', label: 'Species', icon: '🌿' },
    { value: 'potSize', label: 'Pot Size', icon: '🪴' },
    { value: 'needsCare', label: 'Care Status', icon: '⚠️' }
  ];

  // Get group selection counts
  const getGroupStats = (groupPlants: typeof plantsToShow) => {
    const selected = groupPlants.filter(p => selectedPlants.includes(p.id)).length;
    const needy = groupPlants.filter(p => currentNeedyPlants.some(np => np.id === p.id)).length;
    return { selected, needy, total: groupPlants.length };
  };

  const handleGroupToggle = (groupPlants: typeof plantsToShow) => {
    const groupIds = groupPlants.map(p => p.id);
    const allSelected = groupIds.every(id => selectedPlants.includes(id));
    
    if (allSelected) {
      // Deselect all in group
      setSelectedPlants(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      // Select all in group
      setSelectedPlants(prev => Array.from(new Set([...prev, ...groupIds])));
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Plant Care</h2>
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MousePointer2 className="h-4 w-4" />
          <span>Click on plant cards to select, or drag across plants for multi-selection</span>
        </div>
        <div className="text-sm text-gray-500">
          Use the floating buttons on the left to quickly water or feed selected plants
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => {
            setActiveTab("water");
            setSelectedPlants([]);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === "water" 
              ? "bg-blue-500 text-white shadow-sm" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Droplet className="h-4 w-4" />
          Watering ({plantsThatNeedWater.length} need)
        </button>
        <button
          onClick={() => {
            setActiveTab("feed");
            setSelectedPlants([]);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === "feed" 
              ? "bg-green-500 text-white shadow-sm" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Package className="h-4 w-4" />
          Feeding ({plantsThatNeedFeeding.length} need)
        </button>
      </div>

      {/* Grouping Selection */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Group plants by:</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {groupOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={groupBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupBy(option.value as any)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllNeedy}
                disabled={currentNeedyPlants.length === 0}
                className={`${activeTab === "water" ? "border-blue-200 text-blue-700 hover:bg-blue-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}
              >
                <Check className="h-3 w-3 mr-1" />
                Select {currentNeedyPlants.length} needy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                <Check className="h-3 w-3 mr-1" />
                All plants ({plants?.length || 0})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedPlants.length === 0}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            
            <Button
              variant={showOnlyNeedy ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyNeedy(!showOnlyNeedy)}
            >
              <Filter className="h-3 w-3 mr-1" />
              {showOnlyNeedy ? "Showing needy only" : "Show needy only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Count */}
      {selectedPlants.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedPlants.length} plants selected for {activeTab === "water" ? "watering" : "feeding"}
            </span>
            <Badge variant="secondary">{selectedPlants.length}</Badge>
          </div>
        </div>
      )}

      {/* Plant List Grouped by Selected Criteria */}
      <div className="space-y-4 mb-4">
        {Object.keys(plantsByGroup).length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-500">
                {showOnlyNeedy 
                  ? `No plants need ${activeTab === "water" ? "watering" : "feeding"} right now!` 
                  : "No plants found"
                }
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(plantsByGroup).map(([groupName, groupPlants]) => {
            const stats = getGroupStats(groupPlants);
            const allGroupSelected = groupPlants.every(p => selectedPlants.includes(p.id));
            const someGroupSelected = groupPlants.some(p => selectedPlants.includes(p.id));
            
            return (
              <Card key={groupName}>
                <CardContent className="p-4">
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg capitalize">
                        {groupName.replace(/_/g, ' ')}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {stats.total} plant{stats.total !== 1 ? 's' : ''}
                        </Badge>
                        {stats.needy > 0 && (
                          <Badge 
                            variant="outline" 
                            className={activeTab === "water" ? "text-blue-600 border-blue-200" : "text-green-600 border-green-200"}
                          >
                            {stats.needy} need care
                          </Badge>
                        )}
                        {stats.selected > 0 && (
                          <Badge variant="default">
                            {stats.selected} selected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleGroupToggle(groupPlants)}
                    >
                      <Checkbox 
                        checked={allGroupSelected}
                        className="pointer-events-none"
                        ref={el => {
                          if (el && 'indeterminate' in el) {
                            (el as any).indeterminate = someGroupSelected && !allGroupSelected;
                          }
                        }}
                      />
                      <span className="text-sm font-medium">
                        {allGroupSelected ? 'Deselect group' : 'Select group'}
                      </span>
                    </div>
                  </div>

                  {/* Plants in Group */}
                  <div className="space-y-2">
                    {groupPlants.map(plant => {
                      const needsCare = currentNeedyPlants.some(p => p.id === plant.id);
                      const isSelected = selectedPlants.includes(plant.id);
                      
                      return (
                        <div 
                          key={plant.id} 
                          className={`plant-item flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200' 
                              : 'hover:bg-gray-50 hover:shadow-sm border-gray-200'
                          } ${isDragSelecting ? 'select-none' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(plant.id, e)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(plant.id, e)}
                          onDrop={(e) => handleDrop(plant.id, e)}
                          onClick={() => handlePlantToggle(plant.id)}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                              ✓
                            </div>
                          )}
                          
                          <div className={`h-12 w-12 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
                            isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                          }`}>
                            <img 
                              src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                              alt={plant.name}
                              className={`h-full w-full object-cover transition-all duration-200 ${
                                isSelected ? 'brightness-110 saturate-110' : ''
                              }`}
                              draggable={false}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate transition-colors duration-200 ${
                              isSelected ? 'text-blue-800' : 'text-gray-900'
                            }`}>
                              #{plant.plantNumber} {plant.name}
                            </h4>
                            <p className={`text-sm truncate transition-colors duration-200 ${
                              isSelected ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                              {plant.commonName}
                            </p>
                            {plant.nextCheck && (
                              <div className="flex items-center text-xs text-amber-600 mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Check: {new Date(plant.nextCheck).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          {needsCare && (
                            <Badge 
                              variant="outline" 
                              className={activeTab === "water" ? "text-blue-600 border-blue-200 bg-blue-50" : "text-green-600 border-green-200 bg-green-50"}
                            >
                              {activeTab === "water" ? <Droplet className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                              Needs {activeTab === "water" ? "water" : "feed"}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Notes Section */}
      {selectedPlants.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <Textarea
              placeholder={`Add notes about this ${activeTab === "water" ? "watering" : "feeding"} session...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {selectedPlants.length > 0 && (
        <Button 
          className={`w-full ${activeTab === "water" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
          onClick={handleBulkCare}
          disabled={bulkCareMutation.isPending}
        >
          {bulkCareMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Logging {activeTab === "water" ? "watering" : "feeding"}...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Log {activeTab === "water" ? "watering" : "feeding"} for {selectedPlants.length} plants
            </>
          )}
        </Button>
      )}

      {/* Floating Quick Action Buttons - Left Side */}
      {selectedPlants.length > 0 && (
        <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-50">
          <div className="flex flex-col gap-6 items-center">
            {/* Selection Counter */}
            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-full font-medium shadow-lg">
              {selectedPlants.length}
            </div>
            
            {/* Quick Water Button */}
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-lg px-4 py-4 min-w-20"
              onClick={() => {
                bulkCareMutation.mutate({
                  plantIds: selectedPlants,
                  type: "watering",
                  notes: "Quick watering via floating button"
                });
              }}
              disabled={bulkCareMutation.isPending}
              title={`Water ${selectedPlants.length} selected plants`}
            >
              <span className="text-sm font-medium">Water</span>
            </Button>
            
            {/* Spacer */}
            <div className="h-4"></div>
            
            {/* Quick Feed Button */}
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg rounded-lg px-4 py-4 min-w-20"
              onClick={() => {
                bulkCareMutation.mutate({
                  plantIds: selectedPlants,
                  type: "feeding",
                  notes: "Quick feeding via floating button"
                });
              }}
              disabled={bulkCareMutation.isPending}
              title={`Feed ${selectedPlants.length} selected plants`}
            >
              <span className="text-sm font-medium">Feed</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkCare;