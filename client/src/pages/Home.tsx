import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlantCard from "@/components/PlantCard";
import FilterBar from "@/components/FilterBar";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  return (
    <div className="pb-16"> {/* Add padding for the fixed navigation */}
      <FilterBar title="My Plants" />
      
      <div className="plant-list p-4">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Array(4).fill(0).map((_, j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <p className="text-red-600">Failed to load plants. Please try again.</p>
          </div>
        ) : plants && plants.length > 0 ? (
          // Plants list
          plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <div className="bg-neutral-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-neutral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-darkest mb-2">No plants yet</h3>
            <p className="text-neutral-dark mb-4">Start adding plants to your collection</p>
            <Link href="/add">
              <Button>Add Your First Plant</Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      {plants && plants.length > 0 && (
        <div className="fixed bottom-20 z-10" style={{ left: '50%', transform: 'translateX(-50%)', maxWidth: '448px' }}>
          <Link href="/add">
            <a className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-colors duration-300">
              <Plus className="h-6 w-6" />
              <span className="ml-2 font-medium">Add Plant</span>
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
