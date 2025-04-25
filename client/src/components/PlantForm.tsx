import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlantLocation, insertPlantSchema } from "@shared/schema";
import ImageUpload from "./ImageUpload";
import { apiRequest } from "@/lib/queryClient";
import { Hash } from "lucide-react";

// Extend the schema with more validation
const formSchema = insertPlantSchema.extend({
  babyName: z.string().min(2, {
    message: "Baby name must be at least 2 characters.",
  }),
  commonName: z.string().min(2, {
    message: "Common name must be at least 2 characters.",
  }),
  latinName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlantFormProps {
  onSuccess: () => void;
  initialValues?: Partial<FormValues>;
  plantId?: number;
}

const PlantForm = ({ onSuccess, initialValues, plantId }: PlantFormProps) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configure form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      babyName: initialValues?.babyName || "",
      latinName: initialValues?.latinName || "",
      commonName: initialValues?.commonName || "",
      location: initialValues?.location || "",
      lastWatered: initialValues?.lastWatered || undefined,
      nextCheck: initialValues?.nextCheck || undefined,
      lastFed: initialValues?.lastFed || undefined,
      notes: initialValues?.notes || "",
    },
  });

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create a FormData object to handle the image upload
      const formData = new FormData();
      
      console.log("Submitting form data:", data);
      
      // Add all form fields to the FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // Add the image if one was selected
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      
      // Determine if this is a create or update operation
      const url = plantId ? `/api/plants/${plantId}` : '/api/plants';
      const method = plantId ? 'PATCH' : 'POST';
      
      // Send the request
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
      });
      
      // Log response for debugging
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || "Failed to save plant");
      }
      
      toast({
        title: plantId ? "Plant updated" : "Plant created",
        description: plantId 
          ? "Your plant has been updated successfully" 
          : "Your plant has been added to your collection",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error saving plant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert enum to options for select
  const locationOptions = Object.entries(PlantLocation).map(([key, value]) => ({
    label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ImageUpload 
          onImageSelected={handleImageSelected} 
          currentImage={initialValues?.imageUrl}
        />
        
        <FormField
          control={form.control}
          name="babyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Baby Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Monty" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="commonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Common Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Swiss Cheese Plant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="latinName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latin Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Monstera Deliciosa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lastWatered"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Watered</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nextCheck"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Check</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="lastFed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Fed</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any special care instructions..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (plantId ? "Update Plant" : "Save Plant")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlantForm;
