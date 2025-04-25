import { Link } from "wouter";
import { format } from "date-fns";
import { MoreVertical, Droplet, Clock, Package, MapPin } from "lucide-react";
import { Plant, PlantStatus } from "@shared/schema";

interface PlantCardProps {
  plant: Plant;
}

const PlantCard = ({ plant }: PlantCardProps) => {
  // Determine plant status indicator
  const getStatusInfo = () => {
    switch (plant.status) {
      case PlantStatus.HEALTHY:
        return { class: "status-good", text: "Healthy" };
      case PlantStatus.CHECK_SOON:
        return { class: "status-warning", text: "Check soon" };
      case PlantStatus.NEEDS_WATER:
        return { class: "status-alert", text: "Needs water" };
      default:
        return { class: "status-good", text: "Healthy" };
    }
  };

  const statusInfo = getStatusInfo();
  
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
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="relative">
        <img 
          src={plant.imageUrl || "https://via.placeholder.com/400x250?text=No+Image"} 
          alt={plant.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          <MoreVertical className="h-5 w-5 text-neutral-dark" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Link href={`/plant/${plant.id}`}>
            <a className="text-lg font-semibold">{plant.name}</a>
          </Link>
          <div className="flex items-center">
            <span className={`plant-status-indicator ${statusInfo.class}`}></span>
            <span className="text-xs text-neutral-dark">{statusInfo.text}</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-neutral-light rounded-md p-2">
            <div className="text-xs text-neutral-dark mb-1">Last Watered</div>
            <div className="flex items-center">
              <Droplet className="h-4 w-4 text-secondary mr-1" />
              <span className="font-medium text-sm">{formatDate(plant.lastWatered)}</span>
            </div>
          </div>
          <div className="bg-neutral-light rounded-md p-2">
            <div className="text-xs text-neutral-dark mb-1">Next Check</div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-warning mr-1" />
              <span className="font-medium text-sm">{formatDate(plant.nextCheck)}</span>
            </div>
          </div>
          <div className="bg-neutral-light rounded-md p-2">
            <div className="text-xs text-neutral-dark mb-1">Last Fed</div>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-success mr-1" />
              <span className="font-medium text-sm">{formatDate(plant.lastFed)}</span>
            </div>
          </div>
          <div className="bg-neutral-light rounded-md p-2">
            <div className="text-xs text-neutral-dark mb-1">Location</div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-primary mr-1" />
              <span className="font-medium text-sm">{formatLocation(plant.location)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
