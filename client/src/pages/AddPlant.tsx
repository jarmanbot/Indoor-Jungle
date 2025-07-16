import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import PlantForm from "@/components/PlantForm";
import { X } from "lucide-react";

const AddPlant = () => {
  const [_, setLocation] = useLocation();

  const handleSuccess = () => {
    // Invalidate the plants cache and redirect to home
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    queryClient.refetchQueries({ queryKey: ['/api/plants'] });
    
    // Use a slight delay to ensure the redirect happens after cache invalidation
    setTimeout(() => {
      setLocation("/");
    }, 200);
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
        {/* Test input to debug keyboard issue */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <label className="block text-sm font-medium mb-2">Test Input (for debugging keyboard issue):</label>
          <input 
            type="text" 
            placeholder="Tap here to test keyboard"
            className="w-full p-2 border border-gray-300 rounded"
            style={{ fontSize: '16px' }}
            onFocus={() => console.log('Test input focused')}
            onTouchStart={(e) => {
              console.log('Test input touched');
              e.currentTarget.focus();
            }}
          />
        </div>
        
        <PlantForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AddPlant;
