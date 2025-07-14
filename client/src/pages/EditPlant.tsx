import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PlantForm from "@/components/PlantForm";
import { X } from "lucide-react";
import { isAlphaTestingMode, alphaStorage } from "@/lib/alphaTestingMode";
import { Plant } from "@shared/schema";

const EditPlant = () => {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute("/edit/:id");
  const plantId = params?.id ? parseInt(params.id) : 0;

  // Fetch plant data for editing
  const { data: plant, isLoading, error } = useQuery<Plant>({
    queryKey: [`/api/plants/${plantId}`],
    queryFn: async () => {
      if (isAlphaTestingMode()) {
        // In alpha mode, get plant from localStorage
        const plants = alphaStorage.get('plants') || [];
        const plant = plants.find((p: any) => p.id === plantId);
        if (!plant) {
          throw new Error('Plant not found in alpha storage');
        }
        return plant;
      } else {
        // Normal API call
        const response = await fetch(`/api/plants/${plantId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch plant');
        }
        return response.json();
      }
    },
    enabled: !!plantId,
  });

  const handleSuccess = () => {
    // Invalidate the plants cache and redirect to plant details
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
    queryClient.refetchQueries({ queryKey: ['/api/plants'] });
    
    // Use a slight delay to ensure the redirect happens after cache invalidation
    setTimeout(() => {
      setLocation(`/plant/${plantId}`);
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="bg-white h-screen overflow-auto">
        <div className="p-4 border-b border-neutral-medium flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Plant</h3>
          <button 
            className="text-neutral-dark hover:text-neutral-darkest"
            onClick={() => setLocation(`/plant/${plantId}`)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-center py-8">Loading plant details...</div>
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="bg-white h-screen overflow-auto">
        <div className="p-4 border-b border-neutral-medium flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Plant</h3>
          <button 
            className="text-neutral-dark hover:text-neutral-darkest"
            onClick={() => setLocation(`/plant/${plantId}`)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-center py-8 text-red-500">
            Error loading plant details. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen overflow-auto">
      <div className="p-4 border-b border-neutral-medium flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Plant</h3>
        <button 
          className="text-neutral-dark hover:text-neutral-darkest"
          onClick={() => setLocation(`/plant/${plantId}`)}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="p-4">
        <PlantForm 
          onSuccess={handleSuccess} 
          initialValues={plant}
          plantId={plantId}
        />
      </div>
    </div>
  );
};

export default EditPlant;