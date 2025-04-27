import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlantCard from "@/components/PlantCard";
import { Plant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Leaf, CalendarRange, ImageIcon } from "lucide-react";

const Home = () => {
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  return (
    <div className="pb-20"> {/* Add padding for the fixed navigation */}
      {/* Tab navigation under header */}
      <div className="grid grid-cols-5 bg-green-600 py-2 border-t border-green-700">
        <Link href="/" className="flex flex-col items-center">
          <Leaf className="h-5 w-5 text-white" />
          <span className="text-xs text-white">my plants</span>
        </Link>
        <Link href="/pic-list" className="flex flex-col items-center">
          <ImageIcon className="h-5 w-5 text-white" />
          <span className="text-xs text-white">pic list</span>
        </Link>
        <Link href="/missed" className="flex flex-col items-center">
          <span className="h-5 w-5 text-white flex items-center justify-center">
            <span className="block w-2 h-2 bg-white rounded-full"></span>
          </span>
          <span className="text-xs text-white">missed</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center">
          <CalendarRange className="h-5 w-5 text-white" />
          <span className="text-xs text-white">calendar</span>
        </Link>
        <Link href="/website" className="flex flex-col items-center">
          <span className="h-5 w-5 text-white flex items-center justify-center text-xs font-bold">
            www
          </span>
          <span className="text-xs text-white">website</span>
        </Link>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end p-2 bg-white border-b border-gray-200">
        <Link href="/add" className="text-green-600 text-sm px-2 py-1 mr-2 flex items-center">
          <span>ADD PLANT</span>
          <Plus className="h-4 w-4 ml-1" />
        </Link>
        <Link href="/plant-details" className="text-green-600 text-sm px-2 py-1 flex items-center">
          <span>EDIT DETAIL</span>
        </Link>
        <button className="text-green-600 text-sm px-2 py-1 flex items-center">
          <span>PLANT CARE CLICK PIC</span>
        </button>
      </div>
      
      <div className="flex justify-between items-center bg-white p-2 border-b border-gray-200">
        <h2 className="font-bold text-gray-800 text-lg">my plants</h2>
        <Link href="/add" className="bg-green-600 rounded-full w-7 h-7 flex items-center justify-center">
          <Plus className="h-5 w-5 text-white" />
        </Link>
      </div>
      
      <div className="plant-list">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="relative bg-white border-b border-gray-200 py-2 pl-3 pr-2 flex items-center">
              <Skeleton className="w-16 h-16 mr-3 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
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
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No plants yet</h3>
            <p className="text-gray-600 mb-4">Start adding plants to your collection</p>
            <Link href="/add" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium inline-block">
              Add Your First Plant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
