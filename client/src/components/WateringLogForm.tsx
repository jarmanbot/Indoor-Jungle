import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { localStorage as localData, getNextId } from "@/lib/localDataStorage";
import { queryClient } from "@/lib/queryClient";
import { calculateNextCheckDate } from "@/lib/utils";

const formSchema = z.object({
  wateredAt: z.date({
    required_error: "A date is required",
  }),
  amount: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const waterAmounts = [
  { value: "light", label: "Light watering" },
  { value: "moderate", label: "Moderate watering" },
  { value: "full", label: "Full watering" },
];

interface WateringLogFormProps {
  plantId: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function WateringLogForm({ plantId, onSuccess, onCancel }: WateringLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wateredAt: new Date(),
      amount: "moderate",
      notes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Save watering log to Firebase
      const response = await fetch(`/api/plants/${plantId}/watering-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          wateredAt: data.wateredAt.toISOString(),
          amount: data.amount || "moderate",
          notes: data.notes || ""
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save watering log');
      }

      // Get plant data to calculate next check date
      const plantResponse = await fetch(`/api/plants/${plantId}`, {
        headers: { 'X-User-ID': 'dev-user' }
      });
      const plant = await plantResponse.json();
      
      // Calculate next watering date
      const nextWater = new Date(data.wateredAt);
      nextWater.setDate(nextWater.getDate() + (plant.wateringFrequencyDays || 7));
      
      // Calculate next feeding date (if lastFed exists)
      let nextCheck = nextWater;
      if (plant.lastFed && plant.feedingFrequencyDays) {
        const nextFeed = new Date(plant.lastFed);
        nextFeed.setDate(nextFeed.getDate() + plant.feedingFrequencyDays);
        // Use the earlier of next water or next feed
        nextCheck = nextWater < nextFeed ? nextWater : nextFeed;
      }

      // Update the plant's lastWatered and nextCheck dates via Firebase API
      const updateResponse = await fetch(`/api/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          lastWatered: data.wateredAt.toISOString(),
          nextCheck: nextCheck.toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update plant');
      }
      
      // Enhanced cache invalidation with proper sequence for immediate UI updates
      queryClient.removeQueries({ queryKey: ['/api/plants'] });
      queryClient.removeQueries({ queryKey: [`/api/plants/${plantId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/watering-logs`] });
      
      // Force immediate refetch with proper timing
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/plants'] });
        queryClient.refetchQueries({ queryKey: [`/api/plants/${plantId}`] });
      }, 100);
      toast({
        title: "Watering logged",
        description: "The watering has been successfully recorded",
      });
      onSuccess();
    } catch (error) {
      console.error("Error logging watering:", error);
      toast({
        title: "Error",
        description: "There was a problem logging the watering",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="wateredAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className="w-full pl-3 text-left font-normal"
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Watering Amount</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "moderate"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {waterAmounts.map((amount) => (
                    <SelectItem key={amount.value} value={amount.value}>
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any observations about the plant's condition?"
                  {...field}
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="ml-auto"
          >
            <Droplets className="mr-2 h-4 w-4" />
            {isSubmitting ? "Logging..." : "Log Watering"}
          </Button>
        </div>
      </form>
    </Form>
  );
}