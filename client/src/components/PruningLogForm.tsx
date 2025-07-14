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

const formSchema = z.object({
  prunedAt: z.date().optional(),
  partsRemoved: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PruningLogFormProps {
  plantId: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function PruningLogForm({ plantId, onSuccess, onCancel }: PruningLogFormProps) {
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
      prunedAt: new Date(),
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Always use local storage - save pruning log
      const pruningLogs = localData.get('pruningLogs') || [];
      const newId = pruningLogs.length > 0 ? Math.max(...pruningLogs.map((log: any) => log.id)) + 1 : 1;
      
      const newLog = {
        id: newId,
        plantId: plantId,
        prunedAt: date?.toISOString() || new Date().toISOString(),
        partsRemoved: data.partsRemoved || "",
        reason: data.reason || "",
        notes: data.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      pruningLogs.push(newLog);
      localData.set('pruningLogs', pruningLogs);
      
      toast({
        title: "Success",
        description: "Pruning log added successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding pruning log:", error);
      toast({
        title: "Error",
        description: "Failed to add pruning log",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prunedAt">Date Pruned</Label>
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
        <Label htmlFor="partsRemoved">Parts Removed</Label>
        <Input
          id="partsRemoved"
          placeholder="e.g., Dead leaves, brown tips, damaged stems"
          {...register("partsRemoved")}
        />
        {errors.partsRemoved && (
          <p className="text-sm text-red-600">{errors.partsRemoved.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          placeholder="e.g., Dead foliage, pest damage, shaping"
          {...register("reason")}
        />
        {errors.reason && (
          <p className="text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about the pruning..."
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
          {isSubmitting ? "Adding..." : "Add Pruning Log"}
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