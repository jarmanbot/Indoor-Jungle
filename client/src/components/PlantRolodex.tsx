import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Plant } from "@shared/schema"
import { Link } from "wouter"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Droplet, 
  Package, 
  Calendar, 
  MapPin, 
  Hash,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit
} from "lucide-react"
import { format, isToday, isPast } from "date-fns"

interface PlantRolodexProps {
  plants: Plant[]
}

const PlantRolodex = ({ plants }: PlantRolodexProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    skipSnaps: false,
    dragFree: false
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    return format(d, "MMM d");
  };

  const getDaysUntilNextWatering = (lastWatered: Date | string | null, frequency: number) => {
    if (!lastWatered) return 0;
    const daysSince = Math.floor((Date.now() - new Date(lastWatered).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, frequency - daysSince);
  };

  const needsWater = (plant: Plant) => {
    if (!plant.lastWatered) return true;
    const daysSince = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= (plant.wateringFrequencyDays || 7);
  };

  const needsFeeding = (plant: Plant) => {
    if (!plant.lastFed) return true;
    const daysSince = Math.floor((Date.now() - new Date(plant.lastFed).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= (plant.feedingFrequencyDays || 14);
  };

  if (plants.length === 0) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Plant Collection</h3>
          <p className="text-sm text-gray-600">{plants.length} plants • Swipe to browse</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollPrev}
            disabled={selectedIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollNext}
            disabled={selectedIndex === plants.length - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {plants.map((plant, index) => (
            <div key={plant.id} className="flex-[0_0_85%] min-w-0 pl-4 pr-2 first:pl-4 last:pr-4">
              <Card className={`
                mx-2 my-4 overflow-hidden transition-all duration-300 transform
                ${index === selectedIndex 
                  ? 'scale-100 shadow-xl ring-2 ring-green-400 ring-opacity-50' 
                  : 'scale-95 shadow-md opacity-75'
                }
                ${needsWater(plant) ? 'bg-red-50 border-red-200' : 
                  needsFeeding(plant) ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-white'
                }
              `}>
                <CardContent className="p-0">
                  {/* Plant Image */}
                  <div className="relative">
                    <img 
                      src={plant.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} 
                      alt={plant.name}
                      className="w-full h-48 object-cover"
                    />
                    {/* Plant Number Badge */}
                    {plant.plantNumber && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white rounded-full px-3 py-1 text-sm font-bold flex items-center shadow-lg">
                        <Hash className="h-3 w-3 mr-1" />
                        {plant.plantNumber}
                      </div>
                    )}
                    {/* Status Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      {needsWater(plant) && (
                        <Badge variant="destructive" className="text-xs">
                          Needs Water
                        </Badge>
                      )}
                      {needsFeeding(plant) && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
                          Needs Feed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Plant Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="font-bold text-lg text-gray-800 mb-1">{plant.name}</h4>
                      {plant.commonName && (
                        <p className="text-sm text-gray-600">{plant.commonName}</p>
                      )}
                      {plant.location && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {plant.location.replace('_', ' ')}
                        </div>
                      )}
                    </div>

                    {/* Care Status Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center mb-1">
                          <Droplet className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-xs font-medium text-blue-800">Watering</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Last: {formatDate(plant.lastWatered)}
                        </p>
                        <p className="text-xs font-medium text-blue-800">
                          {needsWater(plant) 
                            ? "Due now!" 
                            : `${getDaysUntilNextWatering(plant.lastWatered, plant.wateringFrequencyDays || 7)} days`
                          }
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center mb-1">
                          <Package className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-xs font-medium text-green-800">Feeding</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Last: {formatDate(plant.lastFed)}
                        </p>
                        <p className="text-xs font-medium text-green-800">
                          {needsFeeding(plant) ? "Due now!" : "Up to date"}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/plant/${plant.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/edit/${plant.id}`}>
                        <Button variant="outline" size="sm" className="px-3">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1 pb-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex 
                ? 'bg-green-600 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default PlantRolodex