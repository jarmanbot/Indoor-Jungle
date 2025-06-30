import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  plantLocations, 
  insertPlantSchema, 
  type InsertCustomLocation 
} from "@shared/schema";
import { isAlphaTestingMode, alphaStorage, getNextId, getNextPlantNumber } from "@/lib/alphaTestingMode";
import ImageUpload from "./ImageUpload";
import { PlusCircle } from "lucide-react";

// Create a more robust form schema with validation
// First, extend the schema with required fields
const formSchema = insertPlantSchema.extend({
  babyName: z.string().min(1, "Baby name is required"),
  commonName: z.string().min(1, "Common name is required"),
  location: z.string().min(1, "Location is required"),
  wateringFrequencyDays: z.number().min(1, "Watering frequency must be at least 1 day").max(365, "Watering frequency cannot exceed 365 days"),
})
// Then explicitly make plantNumber and name optional since they're auto-generated
.omit({ plantNumber: true, name: true })
.extend({
  plantNumber: z.number().optional(),
  name: z.string().optional()
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
  const [showCustomLocationDialog, setShowCustomLocationDialog] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [defaultWateringFreq, setDefaultWateringFreq] = useState(7);
  const [defaultFeedingFreq, setDefaultFeedingFreq] = useState(14);
  
  // Load saved custom locations and default care frequencies on mount
  useEffect(() => {
    // Load custom locations from localStorage for immediate display
    try {
      const savedLocations = localStorage.getItem('customLocations');
      if (savedLocations) {
        setCustomLocations(JSON.parse(savedLocations));
      }
    } catch (error) {
      console.error("Failed to load custom locations from localStorage:", error);
    }
    
    // Load default care frequencies from localStorage
    try {
      const savedWateringFreq = localStorage.getItem('defaultWateringFreq');
      const savedFeedingFreq = localStorage.getItem('defaultFeedingFreq');
      
      if (savedWateringFreq) {
        setDefaultWateringFreq(parseInt(savedWateringFreq) || 7);
      }
      if (savedFeedingFreq) {
        setDefaultFeedingFreq(parseInt(savedFeedingFreq) || 14);
      }
    } catch (error) {
      console.error("Failed to load default care frequencies from localStorage:", error);
    }
    
    // Then fetch custom locations from server for up-to-date data
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const locationData = await response.json();
          // Extract names from the location objects
          const locationNames = locationData.map((loc: any) => loc.name);
          setCustomLocations(locationNames);
          
          // Update localStorage with the latest data
          localStorage.setItem('customLocations', JSON.stringify(locationNames));
        }
      } catch (error) {
        console.error("Failed to fetch custom locations from server:", error);
        // We still continue with any localStorage data we have
      }
    };
    
    fetchLocations();
  }, []);

  // Initialize form with default values
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
      wateringFrequencyDays: initialValues?.wateringFrequencyDays || defaultWateringFreq,
      feedingFrequencyDays: initialValues?.feedingFrequencyDays || defaultFeedingFreq,
      notes: initialValues?.notes || "",
      plantNumber: initialValues?.plantNumber,
    },
  });

  // Update form default values when default frequencies are loaded
  useEffect(() => {
    if (!initialValues?.wateringFrequencyDays) {
      form.setValue('wateringFrequencyDays', defaultWateringFreq);
    }
    if (!initialValues?.feedingFrequencyDays) {
      form.setValue('feedingFrequencyDays', defaultFeedingFreq);
    }
  }, [defaultWateringFreq, defaultFeedingFreq, form, initialValues]);

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
  };
  
  const handleAddCustomLocation = () => {
    if (customLocation.trim()) {
      // Add new location to state
      const newLocations = [...customLocations, customLocation.trim()];
      setCustomLocations(newLocations);
      
      // Save to localStorage
      try {
        localStorage.setItem('customLocations', JSON.stringify(newLocations));
      } catch (error) {
        console.error("Failed to save custom location:", error);
      }
      
      // Set form value and close dialog
      form.setValue("location", customLocation.trim());
      setCustomLocation("");
      setShowCustomLocationDialog(false);
      
      // Additionally save in the database
      saveCustomLocationToDb(customLocation.trim())
        .then(() => {
          console.log("Custom location saved to database");
        })
        .catch(error => {
          console.error("Failed to save custom location to database:", error);
        });
    }
  };
  
  // Save custom location to database
  const saveCustomLocationToDb = async (name: string): Promise<void> => {
    const locationData: InsertCustomLocation = { name };
    
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save location: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving custom location:", error);
      // We don't throw the error so the UI can still continue
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Form submitted with data:", data);
      setIsSubmitting(true);
      
      // In alpha testing mode, save directly to localStorage
      if (isAlphaTestingMode()) {
        console.log("Alpha mode: Saving to localStorage...");
        
        const plants = alphaStorage.get('plants') || [];
        
        if (plantId) {
          // Update existing plant
          const plantIndex = plants.findIndex((p: any) => p.id === plantId);
          if (plantIndex !== -1) {
            let imageUrl = plants[plantIndex].imageUrl;
            
            // Handle image update in alpha mode
            if (selectedImage) {
              const reader = new FileReader();
              imageUrl = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(selectedImage);
              });
            }
            
            plants[plantIndex] = {
              ...plants[plantIndex],
              ...data,
              name: data.babyName,
              imageUrl: imageUrl,
              updatedAt: new Date().toISOString()
            };
            alphaStorage.set('plants', plants);
            console.log("Plant updated in localStorage");
          }
        } else {
          // Create new plant
          let imageUrl = undefined;
          
          // Handle image in alpha mode
          if (selectedImage) {
            // Convert image to data URL for storage in alpha mode
            const reader = new FileReader();
            imageUrl = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(selectedImage);
            });
          }
          
          const plantId = getNextId();
          const plantNumber = getNextPlantNumber();
          console.log('Creating plant with ID:', plantId, 'and plant number:', plantNumber);
          
          const newPlant = {
            ...data,
            id: plantId,
            plantNumber: plantNumber,
            name: data.babyName,
            imageUrl: imageUrl,
            lastWatered: null,
            nextCheck: null,
            lastFed: null,
            status: "healthy",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('Final plant object before saving:', newPlant);
          
          plants.push(newPlant);
          alphaStorage.set('plants', plants);
          console.log("New plant saved to localStorage:", newPlant);
        }
      } else if (selectedImage) {
        console.log("Uploading with image...");
        // Using FormData for image upload
        const formData = new FormData();
        
        // Add the image
        formData.append("image", selectedImage);
        
        // Add all other form fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        // Add name field (for backward compatibility)
        formData.append("name", data.babyName);
        
        // Make the API request
        const url = plantId ? `/api/plants/${plantId}` : '/api/plants';
        console.log("Sending POST request to:", url);
        const response = await fetch(url, {
          method: plantId ? 'PATCH' : 'POST',
          body: formData,
        });
        
        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.message || "Failed to save plant");
        }
        
        const result = await response.json();
        console.log("Success response:", result);
      } else {
        console.log("Uploading without image...");
        // Using JSON for submissions without image
        // Prepare data with backwards compatibility
        const jsonData = {
          ...data,
          name: data.babyName // Ensure name field is set from babyName
        };
        
        // Make the API request
        const url = plantId ? `/api/plants/${plantId}` : '/api/plants/json';
        console.log("Sending POST request to:", url);
        console.log("Request data:", jsonData);
        
        const response = await fetch(url, {
          method: plantId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });
        
        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.message || "Failed to save plant");
        }
        
        const result = await response.json();
        console.log("Success response:", result);
      }
      
      // Show success message
      toast({
        title: plantId ? "Plant updated" : "Plant created",
        description: plantId 
          ? "Your plant has been updated successfully" 
          : "Your plant has been added to your collection",
      });
      
      // Wait a moment for the toast to appear, then call success callback
      setTimeout(() => {
        onSuccess();
      }, 100);
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

  // Combine predefined and custom locations
  const allLocationOptions = [
    ...plantLocations,
    ...customLocations.map(name => ({
      value: name,
      label: name
    }))
  ];

  console.log("Form errors:", form.formState.errors);
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4 mb-2">
            <ImageUpload 
              onImageSelected={handleImageSelected} 
              currentImage={initialValues?.imageUrl}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="babyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Plant Baby Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Alex Yolobo" 
                      {...field} 
                      className="bg-background"
                    />
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
                    <Input 
                      placeholder="e.g., Swiss Cheese Plant" 
                      {...field} 
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="latinName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latin Name (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Monstera Deliciosa" 
                    {...field} 
                    className="bg-background"
                  />
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
                <div className="flex gap-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background flex-1">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-1 text-xs font-semibold text-muted-foreground">
                        Default Locations
                      </div>
                      {plantLocations.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                      
                      {customLocations.length > 0 && (
                        <>
                          <div className="p-1 mt-2 text-xs font-semibold text-muted-foreground">
                            My Custom Locations
                          </div>
                          {customLocations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      
                      <div className="p-1 border-t border-border mt-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-2 h-8"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowCustomLocationDialog(true);
                          }}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Custom Location
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="wateringFrequencyDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Watering Frequency (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={defaultWateringFreq.toString()} 
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || defaultWateringFreq)}
                      className="bg-background"
                      min="1"
                      max="365"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="feedingFrequencyDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feeding Frequency (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={defaultFeedingFreq.toString()} 
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || defaultFeedingFreq)}
                      className="bg-background"
                      min="1"
                      max="365"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special care instructions or notes about this plant..." 
                    {...field} 
                    value={field.value || ''} 
                    className="min-h-24 bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onSuccess()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (plantId ? "Update Plant" : "Add Plant")}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Custom Location Dialog */}
      <Dialog 
        open={showCustomLocationDialog} 
        onOpenChange={setShowCustomLocationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel>Location Name</FormLabel>
              <Input 
                placeholder="e.g., Front Porch" 
                value={customLocation} 
                onChange={(e) => setCustomLocation(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCustomLocationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCustomLocation} 
                disabled={!customLocation.trim()}
              >
                Add Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlantForm;