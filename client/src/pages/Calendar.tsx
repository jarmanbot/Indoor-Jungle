import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plant } from "@shared/schema";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplet, Package, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const Calendar = () => {
  const [_, setLocation] = useLocation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  // Calculate next watering and feeding dates based on frequency
  const calculateNextCareDate = (lastCareTimestamp: Date | string | null, frequencyDays: number) => {
    if (!lastCareTimestamp) return new Date(); // If never cared for, due now
    
    const lastDate = new Date(lastCareTimestamp);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + frequencyDays);
    return nextDate;
  };

  // Filter plants for events on the selected date
  const getEventsForSelectedDate = () => {
    if (!date || !plants) return { wateringEvents: [], feedingEvents: [] };
    
    const formattedSelectedDate = format(date, 'yyyy-MM-dd');
    
    const wateringEvents = plants.filter(plant => {
      const nextWaterDate = calculateNextCareDate(plant.lastWatered, plant.wateringFrequencyDays || 7);
      return format(nextWaterDate, 'yyyy-MM-dd') === formattedSelectedDate;
    });
    
    const feedingEvents = plants.filter(plant => {
      const nextFeedDate = calculateNextCareDate(plant.lastFed, plant.feedingFrequencyDays || 14);
      return format(nextFeedDate, 'yyyy-MM-dd') === formattedSelectedDate;
    });
    
    return { wateringEvents, feedingEvents };
  };

  const { wateringEvents, feedingEvents } = getEventsForSelectedDate();
  
  // Function to highlight dates with events
  const getDayClass = (day: Date) => {
    if (!plants) return "";
    
    const formattedDay = format(day, 'yyyy-MM-dd');
    
    const hasWateringEvent = plants.some(plant => {
      const nextWaterDate = calculateNextCareDate(plant.lastWatered, plant.wateringFrequencyDays || 7);
      return format(nextWaterDate, 'yyyy-MM-dd') === formattedDay;
    });
    
    const hasFeedingEvent = plants.some(plant => {
      const nextFeedDate = calculateNextCareDate(plant.lastFed, plant.feedingFrequencyDays || 14);
      return format(nextFeedDate, 'yyyy-MM-dd') === formattedDay;
    });
    
    if (hasWateringEvent && hasFeedingEvent) return "bg-purple-100 text-purple-600 font-bold";
    if (hasWateringEvent) return "bg-blue-100 text-blue-600 font-bold";
    if (hasFeedingEvent) return "bg-green-100 text-green-600 font-bold";
    
    return "";
  };

  return (
    <div className="p-4 pb-16">
      <Button onClick={() => setLocation('/')} variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Plants
      </Button>
      <h2 className="text-lg font-medium text-neutral-darkest mb-4">Plant Calendar</h2>
      
      <Card>
        <CardContent className="p-3">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiersClassNames={{
              selected: "bg-primary text-primary-foreground",
            }}
            components={{
              DayContent: ({ date: day }) => (
                <div className={`w-full h-full flex items-center justify-center ${getDayClass(day)}`}>
                  {format(day, "d")}
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      <h3 className="text-md font-medium mt-6 mb-2">
        {date ? `Events for ${format(date, 'MMMM d, yyyy')}` : 'Select a date to see events'}
      </h3>

{wateringEvents.length === 0 && feedingEvents.length === 0 ? (
        <div className="text-center py-8 bg-neutral-light rounded-md">
          <p className="text-neutral-dark">No plant care scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wateringEvents.map(plant => (
            <Card key={`watering-${plant.id}`} className="overflow-hidden">
              <div className="flex items-center p-3">
                <Droplet className="h-5 w-5 text-blue-500 mr-3" />
                <div className="h-12 w-12 rounded-md overflow-hidden mr-3">
                  <a href={`/plant/${plant.id}`}>
                    <img 
                      src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                      alt={plant.name}
                      className="h-full w-full object-cover"
                    />
                  </a>
                </div>
                <div className="flex-1">
                  <a href={`/plant/${plant.id}`} className="hover:underline">
                    <h4 className="font-medium">{plant.name}</h4>
                  </a>
                  <p className="text-sm text-neutral-dark">Check water levels</p>
                </div>
                <div className="flex space-x-2">
                  <a 
                    href={`/plant/${plant.id}`}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md"
                  >
                    Details
                  </a>
                  <button 
                    className="text-sm bg-primary text-white px-3 py-1 rounded-md"
                    onClick={() => {
                      toast({
                        title: "Watering checked",
                        description: `${plant.name} has been marked as checked`,
                      });
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </Card>
          ))}
          
          {feedingEvents.map(plant => (
            <Card key={`feeding-${plant.id}`} className="overflow-hidden">
              <div className="flex items-center p-3">
                <Package className="h-5 w-5 text-green-500 mr-3" />
                <div className="h-12 w-12 rounded-md overflow-hidden mr-3">
                  <a href={`/plant/${plant.id}`}>
                    <img 
                      src={plant.imageUrl || "https://via.placeholder.com/48?text=Plant"} 
                      alt={plant.name}
                      className="h-full w-full object-cover"
                    />
                  </a>
                </div>
                <div className="flex-1">
                  <a href={`/plant/${plant.id}`} className="hover:underline">
                    <h4 className="font-medium">{plant.name}</h4>
                  </a>
                  <p className="text-sm text-neutral-dark">Fertilizing day</p>
                </div>
                <div>
                  <a 
                    href={`/plant/${plant.id}`}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded-md"
                  >
                    Details
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;
