import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Flower } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorage as localData } from "@/lib/localDataStorage";
import { calculateNextCheckDate } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  fedAt: z.date({
    required_error: "A date is required",
  }),
  fertilizer: z.string().optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FeedingLogFormProps {
  plantId: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function FeedingLogForm({ plantId, onSuccess, onCancel }: FeedingLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fedAt: new Date(),
      fertilizer: "",
      amount: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Save feeding log to Firebase
      const response = await fetch(`/api/plants/${plantId}/feeding-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          fedAt: data.fedAt.toISOString(),
          fertilizer: data.fertilizer || "",
          amount: data.amount || "",
          notes: data.notes || ""
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save feeding log');
      }

      // Update the plant's lastFed date via Firebase API
      const updateResponse = await fetch(`/api/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          lastFed: data.fedAt.toISOString(),
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
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/feeding-logs`] });
      
      // Force immediate refetch with proper timing
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/plants'] });
        queryClient.refetchQueries({ queryKey: [`/api/plants/${plantId}`] });
      }, 100);
      
      toast({
        title: "Feeding logged",
        description: "The feeding has been successfully recorded",
      });
      onSuccess();
    } catch (error) {
      console.error("Error logging feeding:", error);
      toast({
        title: "Error",
        description: "There was a problem logging the feeding",
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
          name="fedAt"
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
          name="fertilizer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fertilizer Used (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="What fertilizer did you use?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="How much did you use? (e.g., '1 tsp')"
                  {...field}
                />
              </FormControl>
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
                  placeholder="Any observations about the plant's condition or feeding?"
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
            className="ml-auto bg-green-600 hover:bg-green-700"
          >
            <Flower className="mr-2 h-4 w-4" />
            {isSubmitting ? "Logging..." : "Log Feeding"}
          </Button>
        </div>
      </form>
    </Form>
  );
}