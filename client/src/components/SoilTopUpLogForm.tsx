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
  toppedUpAt: z.date().optional(),
  soilType: z.string().optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SoilTopUpLogFormProps {
  plantId: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function SoilTopUpLogForm({ plantId, onSuccess, onCancel }: SoilTopUpLogFormProps) {
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
      toppedUpAt: new Date(),
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Always use local storage - save soil top up log
      const soilTopUpLogs = localData.get('soilTopUpLogs') || [];
      const newId = soilTopUpLogs.length > 0 ? Math.max(...soilTopUpLogs.map((log: any) => log.id)) + 1 : 1;
      
      const newLog = {
        id: newId,
        plantId: plantId,
        toppedUpAt: date?.toISOString() || new Date().toISOString(),
        soilType: data.soilType || "",
        amount: data.amount || "",
        notes: data.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      soilTopUpLogs.push(newLog);
      localData.set('soilTopUpLogs', soilTopUpLogs);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/soil-top-up-logs`] });
      
      toast({
        title: "Success",
        description: "Soil top up log added successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding soil top up log:", error);
      toast({
        title: "Error",
        description: "Failed to add soil top up log",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="toppedUpAt">Date</Label>
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
        <Label htmlFor="soilType">Soil Type</Label>
        <Input
          id="soilType"
          placeholder="e.g., Potting mix, compost"
          {...register("soilType")}
        />
        {errors.soilType && (
          <p className="text-sm text-red-600">{errors.soilType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          placeholder="e.g., 1 cup, handful"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about the soil top up..."
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
          {isSubmitting ? "Adding..." : "Add Soil Top Up Log"}
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