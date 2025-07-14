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
      // Use local storage for watering logs
      const wateringLog = {
        id: getNextId(),
        plantId: plantId,
        wateredAt: data.wateredAt.toISOString(),
        amount: data.amount || "moderate",
        notes: data.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local storage
      const existingLogs = localData.get('wateringLogs') || [];
      localData.set('wateringLogs', [...existingLogs, wateringLog]);
      
      // Update plant's lastWatered date
      const plants = localData.get('plants') || [];
      const updatedPlants = plants.map((p: any) => 
        p.id === plantId ? { ...p, lastWatered: data.wateredAt.toISOString() } : p
      );
      localData.set('plants', updatedPlants);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/watering-logs`] });
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