import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plant } from "@shared/schema";
import { useLocation } from "wouter";
import { 
  Check,
  ChevronLeft,
  Hash,
  MapPin,
  Search
} from "lucide-react";

const BulkCare = () => {
  const [_, setLocation] = useLocation();
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "number" | "room" | "name">("all");

  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });



  // Filter plants based on search term and filter type
  const filteredPlants = plants?.filter(plant => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (filterBy) {
      case "number":
        return plant.plantNumber?.toString().includes(searchTerm);
      case "room":
        return plant.location?.toLowerCase().includes(searchLower);
      case "name":
        return plant.name?.toLowerCase().includes(searchLower) ||
               plant.babyName?.toLowerCase().includes(searchLower) ||
               plant.commonName?.toLowerCase().includes(searchLower);
      default:
        return plant.plantNumber?.toString().includes(searchTerm) ||
               plant.location?.toLowerCase().includes(searchLower) ||
               plant.name?.toLowerCase().includes(searchLower) ||
               plant.babyName?.toLowerCase().includes(searchLower) ||
               plant.commonName?.toLowerCase().includes(searchLower);
    }
  }) || [];

  const handleSelectAll = () => {
    if (selectedPlants.length === filteredPlants.length) {
      setSelectedPlants([]);
    } else {
      setSelectedPlants(filteredPlants.map(p => p.id));
    }
  };

  const handlePlantToggle = (plantId: number) => {
    setSelectedPlants(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Select Plants</h2>
        <div className="text-center py-8">Loading plants...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <Button onClick={() => setLocation('/')} variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Plants
      </Button>
      <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Select Plants</h2>
      
      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={filterBy === "all" ? "default" : "outline"}
                onClick={() => setFilterBy("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterBy === "number" ? "default" : "outline"}
                onClick={() => setFilterBy("number")}
                size="sm"
                className="flex items-center gap-1"
              >
                <Hash className="h-3 w-3" />
                Number
              </Button>
              <Button
                variant={filterBy === "room" ? "default" : "outline"}
                onClick={() => setFilterBy("room")}
                size="sm"
                className="flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                Room
              </Button>
              <Button
                variant={filterBy === "name" ? "default" : "outline"}
                onClick={() => setFilterBy("name")}
                size="sm"
              >
                Name
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plant Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Plants ({filteredPlants.length})</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredPlants.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              {selectedPlants.length === filteredPlants.length && filteredPlants.length > 0 ? "Deselect All" : "Select All"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No plants match your search" : "No plants found"}
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredPlants.map(plant => (
                <div key={plant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedPlants.includes(plant.id)}
                    onCheckedChange={() => handlePlantToggle(plant.id)}
                  />
                  <div className="h-12 w-12 rounded-md overflow-hidden">
                    <img 
                      src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                      alt={plant.name || plant.babyName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {plant.plantNumber && (
                        <Badge variant="secondary" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          {plant.plantNumber}
                        </Badge>
                      )}
                      <h4 className="font-medium">{plant.name || plant.babyName}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {plant.location}
                    </div>
                    {plant.commonName && (
                      <p className="text-xs text-muted-foreground">{plant.commonName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Plants Summary */}
      {selectedPlants.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-medium">Selected Plants</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPlants.length} plant{selectedPlants.length !== 1 ? 's' : ''} selected
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPlants([])}
                className="mt-2"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkCare;