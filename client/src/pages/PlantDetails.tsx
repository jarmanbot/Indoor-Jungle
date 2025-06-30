import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import WateringLogForm from "@/components/WateringLogForm";
import FeedingLogForm from "@/components/FeedingLogForm";
import RepottingLogForm from "@/components/RepottingLogForm";
import SoilTopUpLogForm from "@/components/SoilTopUpLogForm";
import PruningLogForm from "@/components/PruningLogForm";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Droplet, Clock, Package, MapPin, Edit, Trash, Hash, Flower, Shovel, Mountain, Scissors, Check, X } from "lucide-react";
import PlantCareHistory from "@/components/PlantCareHistory";
import { isAlphaTestingMode } from "@/lib/alphaTestingMode";

const PlantDetails = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [showWateringForm, setShowWateringForm] = useState(false);
  const [showFeedingForm, setShowFeedingForm] = useState(false);
  const [showRepottingForm, setShowRepottingForm] = useState(false);
  const [showSoilTopUpForm, setShowSoilTopUpForm] = useState(false);
  const [showPruningForm, setShowPruningForm] = useState(false);
  const [editingWateringFrequency, setEditingWateringFrequency] = useState(false);
  const [wateringFrequencyValue, setWateringFrequencyValue] = useState("");
  const [editingFeedingFrequency, setEditingFeedingFrequency] = useState(false);
  const [feedingFrequencyValue, setFeedingFrequencyValue] = useState("");
  const numericId = id ? parseInt(id) : 0;

  const { data: plant, isLoading, error } = useQuery<Plant>({
    queryKey: [`/api/plants/${id}`],
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/plants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      toast({
        title: "Plant deleted",
        description: "The plant has been removed from your collection",
      });
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete plant",
        variant: "destructive",
      });
    }
  });

  const updateWateringFrequencyMutation = useMutation({
    mutationFn: async (newFrequency: number) => {
      await apiRequest('PATCH', `/api/plants/${id}`, { 
        wateringFrequencyDays: newFrequency 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${id}`] });
      setEditingWateringFrequency(false);
      toast({
        title: "Watering frequency updated",
        description: "Your plant's watering schedule has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update watering frequency",
        variant: "destructive",
      });
    }
  });

  const updateFeedingFrequencyMutation = useMutation({
    mutationFn: async (newFrequency: number) => {
      await apiRequest('PATCH', `/api/plants/${id}`, { 
        feedingFrequencyDays: newFrequency 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${id}`] });
      setEditingFeedingFrequency(false);
      toast({
        title: "Feeding frequency updated",
        description: "Your plant's feeding schedule has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update feeding frequency",
        variant: "destructive",
      });
    }
  });

  const handleWateringFrequencyEdit = () => {
    setWateringFrequencyValue(plant?.wateringFrequencyDays?.toString() || "7");
    setEditingWateringFrequency(true);
  };

  const handleWateringFrequencySave = () => {
    const frequency = parseInt(wateringFrequencyValue);
    if (frequency > 0 && frequency <= 365) {
      updateWateringFrequencyMutation.mutate(frequency);
    } else {
      toast({
        title: "Invalid frequency",
        description: "Please enter a value between 1 and 365 days",
        variant: "destructive",
      });
    }
  };

  const handleWateringFrequencyCancel = () => {
    setEditingWateringFrequency(false);
    setWateringFrequencyValue("");
  };

  const handleFeedingFrequencyEdit = () => {
    setFeedingFrequencyValue(plant?.feedingFrequencyDays?.toString() || "14");
    setEditingFeedingFrequency(true);
  };

  const handleFeedingFrequencySave = () => {
    const frequency = parseInt(feedingFrequencyValue);
    if (frequency > 0 && frequency <= 365) {
      updateFeedingFrequencyMutation.mutate(frequency);
    } else {
      toast({
        title: "Invalid frequency",
        description: "Please enter a value between 1 and 365 days",
        variant: "destructive",
      });
    }
  };

  const handleFeedingFrequencyCancel = () => {
    setEditingFeedingFrequency(false);
    setFeedingFrequencyValue("");
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="w-full h-64 mb-4" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-20 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="p-4">
        <Button onClick={() => setLocation('/')} variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Plants
        </Button>
        <div className="bg-red-50 p-4 rounded-md border border-red-100">
          <p className="text-red-600">Failed to load plant details. Please try again.</p>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Format location for display
  const formatLocation = (location: string | null | undefined) => {
    if (!location) return "Unknown location";
    return location
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleWateringSuccess = () => {
    setShowWateringForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'watering-logs'] });
  };

  const handleFeedingSuccess = () => {
    setShowFeedingForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'feeding-logs'] });
  };

  const handleRepottingSuccess = () => {
    setShowRepottingForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'repotting-logs'] });
  };

  const handleSoilTopUpSuccess = () => {
    setShowSoilTopUpForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'soil-top-up-logs'] });
  };

  const handlePruningSuccess = () => {
    setShowPruningForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'pruning-logs'] });
  };

  return (
    <div className="p-4 pb-16">
      <Button onClick={() => setLocation('/')} variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Plants
      </Button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="relative">
          <img 
            src={plant.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} 
            alt={plant.name} 
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white"
              onClick={() => setLocation(`/edit/${plant.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            {!(isAlphaTestingMode() && plant.plantNumber === 1) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Plant</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {plant.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
          {plant.plantNumber && (
            <div className="absolute top-4 left-4 bg-primary text-white rounded-full px-3 py-1.5 shadow text-sm font-bold flex items-center">
              <Hash className="h-4 w-4 mr-1" />
              {plant.plantNumber}
            </div>
          )}
        </div>

        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">{plant.name}</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-light rounded-md p-3">
              <div className="flex items-start">
                <Droplet className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">Last Watered</h4>
                  <p className="text-sm text-neutral-dark">{formatDate(plant.lastWatered)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-blue-600 border-blue-200"
                onClick={() => setShowWateringForm(true)}
              >
                Log Watering
              </Button>
            </div>

            <div className="bg-neutral-light rounded-md p-3">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-warning mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">Next Check</h4>
                  <p className="text-sm text-neutral-dark">{formatDate(plant.nextCheck)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-warning"
                onClick={() => {
                  // Set next check date based on plant's watering frequency
                  const nextCheck = new Date();
                  const frequency = plant.wateringFrequencyDays || 7;
                  nextCheck.setDate(nextCheck.getDate() + frequency);

                  apiRequest('PATCH', `/api/plants/${plant.id}`, { 
                    nextCheck: nextCheck.toISOString()
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
                    toast({
                      title: "Reminder set",
                      description: `Your plant's next check has been scheduled for ${frequency} days from now`,
                    });
                  });
                }}
              >
                Set Reminder
              </Button>
            </div>

            <div className="bg-neutral-light rounded-md p-3">
              <div className="flex items-start">
                <Package className="h-5 w-5 text-success mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">Last Fed</h4>
                  <p className="text-sm text-neutral-dark">{formatDate(plant.lastFed)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-green-600 border-green-200"
                onClick={() => setShowFeedingForm(true)}
              >
                Log Feeding
              </Button>
            </div>

            <div className="bg-neutral-light rounded-md p-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-neutral-dark">{formatLocation(plant.location)}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-light rounded-md p-3">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Watering Frequency</h4>
                  {editingWateringFrequency ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={wateringFrequencyValue}
                        onChange={(e) => setWateringFrequencyValue(e.target.value)}
                        className="h-7 w-16 text-sm"
                        min="1"
                        max="365"
                      />
                      <span className="text-sm text-neutral-dark">days</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleWateringFrequencySave}
                        disabled={updateWateringFrequencyMutation.isPending}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleWateringFrequencyCancel}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-neutral-dark">
                        Every {plant.wateringFrequencyDays || 7} days
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleWateringFrequencyEdit}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-neutral-light rounded-md p-3">
              <div className="flex items-start">
                <Flower className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Feeding Frequency</h4>
                  {editingFeedingFrequency ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={feedingFrequencyValue}
                        onChange={(e) => setFeedingFrequencyValue(e.target.value)}
                        className="h-7 w-16 text-sm"
                        min="1"
                        max="365"
                      />
                      <span className="text-sm text-neutral-dark">days</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleFeedingFrequencySave}
                        disabled={updateFeedingFrequencyMutation.isPending}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleFeedingFrequencyCancel}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-neutral-dark">
                        Every {plant.feedingFrequencyDays || 14} days
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={handleFeedingFrequencyEdit}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Care Actions */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-orange-600 border-orange-200"
              onClick={() => setShowRepottingForm(true)}
            >
              <Shovel className="h-4 w-4 mr-2" />
              Repot
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-amber-600 border-amber-200"
              onClick={() => setShowSoilTopUpForm(true)}
            >
              <Mountain className="h-4 w-4 mr-2" />
              Add Soil
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-200"
              onClick={() => setShowPruningForm(true)}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Prune
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {plant.notes && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium mb-2">Notes</h3>
          <p className="text-sm text-neutral-dark">{plant.notes}</p>
        </div>
      )}

      {/* Care History */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold mb-4">Care History</h2>
        <PlantCareHistory 
          plant={plant} 
          showWateringForm={showWateringForm}
          setShowWateringForm={setShowWateringForm}
          showFeedingForm={showFeedingForm}
          setShowFeedingForm={setShowFeedingForm}
          showRepottingForm={showRepottingForm}
          setShowRepottingForm={setShowRepottingForm}
          showSoilTopUpForm={showSoilTopUpForm}
          setShowSoilTopUpForm={setShowSoilTopUpForm}
          showPruningForm={showPruningForm}
          setShowPruningForm={setShowPruningForm}
        />
      </div>

      <Dialog open={showWateringForm} onOpenChange={setShowWateringForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Watering</DialogTitle>
          </DialogHeader>
          <WateringLogForm 
            plantId={plant.id}
            onSuccess={handleWateringSuccess}
            onCancel={() => setShowWateringForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showFeedingForm} onOpenChange={setShowFeedingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Feeding</DialogTitle>
          </DialogHeader>
          <FeedingLogForm 
            plantId={plant.id}
            onSuccess={handleFeedingSuccess}
            onCancel={() => setShowFeedingForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRepottingForm} onOpenChange={setShowRepottingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Repotting</DialogTitle>
          </DialogHeader>
          <RepottingLogForm 
            plantId={plant.id}
            onSuccess={handleRepottingSuccess}
            onCancel={() => setShowRepottingForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showSoilTopUpForm} onOpenChange={setShowSoilTopUpForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Soil Top Up</DialogTitle>
          </DialogHeader>
          <SoilTopUpLogForm 
            plantId={plant.id}
            onSuccess={handleSoilTopUpSuccess}
            onCancel={() => setShowSoilTopUpForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPruningForm} onOpenChange={setShowPruningForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Pruning</DialogTitle>
          </DialogHeader>
          <PruningLogForm 
            plantId={plant.id}
            onSuccess={handlePruningSuccess}
            onCancel={() => setShowPruningForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantDetails;