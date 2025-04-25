import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import PlantForm from "@/components/PlantForm";
import { X } from "lucide-react";

const AddPlant = () => {
  const [_, setLocation] = useLocation();

  const handleSuccess = () => {
    // Invalidate the plants cache and redirect to home
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    setLocation("/");
  };

  return (
    <div className="bg-white h-screen overflow-auto">
      <div className="p-4 border-b border-neutral-medium flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add New Plant</h3>
        <button 
          className="text-neutral-dark hover:text-neutral-darkest"
          onClick={() => setLocation("/")}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="p-4">
        <PlantForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AddPlant;
