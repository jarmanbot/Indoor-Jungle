import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { localStorage as localData } from "@/lib/localDataStorage";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  repottedAt: z.date().optional(),
  potSize: z.string().optional(),
  soilType: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RepottingLogFormProps {
  plantId: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function RepottingLogForm({ plantId, onSuccess, onCancel }: RepottingLogFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repottedAt: new Date(),
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Save repotting log to Firebase
      const response = await fetch(`/api/plants/${plantId}/repotting-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify({
          repottedAt: date?.toISOString() || new Date().toISOString(),
          potSize: data.potSize || "",
          soilType: data.soilType || "",
          notes: data.notes || ""
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save repotting log');
      }
      
      // Enhanced cache invalidation for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/repotting-logs`] });
      queryClient.removeQueries({ queryKey: ['/api/plants'] });
      queryClient.removeQueries({ queryKey: [`/api/plants/${plantId}`] });
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/plants'] });
        queryClient.refetchQueries({ queryKey: [`/api/plants/${plantId}`] });
      }, 50);
      
      toast({
        title: "Success",
        description: "Repotting log added successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding repotting log:", error);
      toast({
        title: "Error",
        description: "Failed to add repotting log",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="repottedAt">Date Repotted</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="potSize">Pot Size</Label>
        <Input
          id="potSize"
          placeholder="e.g., 6 inch, 15cm"
          {...register("potSize")}
        />
        {errors.potSize && (
          <p className="text-sm text-red-600">{errors.potSize.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="soilType">Soil Type</Label>
        <Input
          id="soilType"
          placeholder="e.g., Potting mix, succulent soil"
          {...register("soilType")}
        />
        {errors.soilType && (
          <p className="text-sm text-red-600">{errors.soilType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about the repotting..."
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Adding..." : "Add Repotting Log"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}