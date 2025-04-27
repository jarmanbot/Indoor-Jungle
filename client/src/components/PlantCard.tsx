import { Link } from "wouter";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { Plant, PlantStatus } from "@shared/schema";

interface PlantCardProps {
  plant: Plant;
}

const PlantCard = ({ plant }: PlantCardProps) => {
  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Format location for display
  const formatLocation = (location: string) => {
    return location
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <div className="relative bg-white border-b border-gray-200 py-2 pl-3 pr-2 flex items-center">
      <Link href={`/plant/${plant.id}`}>
        <a className="flex flex-1">
          {/* Plant Image */}
          <div className="w-16 h-16 mr-3 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={plant.imageUrl || "https://via.placeholder.com/100x100?text=No+Image"} 
              alt={plant.babyName} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Plant Information */}
          <div className="flex-1">
            <div className="flex items-center">
              <span className="bg-green-600 text-white text-xs font-medium rounded-full px-2 py-0.5 mr-2">
                {plant.plantNumber || "?"}
              </span>
              <h3 className="font-bold text-gray-900">{plant.babyName}</h3>
            </div>
            <div className="text-sm text-gray-600">
              {plant.commonName || plant.latinName || "Unknown species"}
            </div>
            {plant.latinName && (
              <div className="text-xs italic text-gray-500">{plant.latinName}</div>
            )}
            {plant.location && (
              <div className="text-xs text-gray-500 mt-1">
                {formatLocation(plant.location)}
              </div>
            )}
          </div>
        </a>
      </Link>
      
      {/* More button */}
      <button className="p-2 text-gray-500">
        <MoreVertical className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PlantCard;
