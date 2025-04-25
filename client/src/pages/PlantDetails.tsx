import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Droplet, Clock, Package, MapPin, Edit, Trash } from "lucide-react";

const PlantDetails = () => {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const numericId = parseInt(id);

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
  const formatLocation = (location: string) => {
    return location
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
          </div>
        </div>
        
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">{plant.name}</h1>
          
          {plant.notes && (
            <div className="mb-4 bg-neutral-light p-3 rounded-md">
              <h3 className="font-medium mb-1">Notes</h3>
              <p className="text-sm text-neutral-dark">{plant.notes}</p>
            </div>
          )}
          
          <h3 className="font-medium mb-2 mt-4">Care Information</h3>
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
                className="mt-2 w-full text-secondary"
                onClick={() => {
                  // Update last watered date to today
                  apiRequest('PATCH', `/api/plants/${plant.id}`, { 
                    lastWatered: new Date().toISOString()
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
                    toast({
                      title: "Watering recorded",
                      description: "Your plant's watering has been updated",
                    });
                  });
                }}
              >
                Water Now
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
                  // Set next check date to 7 days from now
                  const nextCheck = new Date();
                  nextCheck.setDate(nextCheck.getDate() + 7);
                  
                  apiRequest('PATCH', `/api/plants/${plant.id}`, { 
                    nextCheck: nextCheck.toISOString()
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
                    toast({
                      title: "Reminder set",
                      description: "Your plant's next check has been scheduled",
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
                className="mt-2 w-full text-success"
                onClick={() => {
                  // Update last fed date to today
                  apiRequest('PATCH', `/api/plants/${plant.id}`, { 
                    lastFed: new Date().toISOString()
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
                    toast({
                      title: "Feeding recorded",
                      description: "Your plant's feeding has been updated",
                    });
                  });
                }}
              >
                Feed Now
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetails;
