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
import { PlusCircle, Shuffle } from "lucide-react";

// Human-like first and last names for plant naming
const firstNames = [
  "Alex", "Morgan", "Charlie", "Sam", "Jordan", "Casey", "Riley", "Taylor", "Avery", "Quinn",
  "Blake", "Drew", "Sage", "River", "Sky", "Luna", "Ivy", "Rose", "Lily", "Iris",
  "Jade", "Ruby", "Violet", "Daisy", "Hazel", "Olive", "Jasmine", "Willow", "Fern", "Poppy",
  "Basil", "Rosie", "Sunny", "Aurora", "Maya", "Leo", "Max", "Zoe", "Emma", "Noah",
  "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin",
  "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Michael", "Emily", "Daniel",
  "Elizabeth", "Matthew", "Sofia", "Owen", "Avery", "Jackson"
];

const lastNames = [
  "Anderson", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
  "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers"
];

// Create a more robust form schema with validation
// Only make babyName (plant name) required, all other fields optional
const formSchema = insertPlantSchema.extend({
  babyName: z.string().min(1, "Plant name is required"),
  commonName: z.string().optional(),
  location: z.string().optional(),
  wateringFrequencyDays: z.number().min(1, "Watering frequency must be at least 1 day").max(365, "Watering frequency cannot exceed 365 days").optional(),
  feedingFrequencyDays: z.number().min(1, "Feeding frequency must be at least 1 day").max(365, "Feeding frequency cannot exceed 365 days").optional(),
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
    
    // Fetch custom locations from server for up-to-date data (only if not in alpha mode)
    const fetchLocations = async () => {
      if (!isAlphaTestingMode()) {
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
      } else {
        console.log("Alpha mode: Using custom locations from localStorage only");
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

  // Generate a random human-like plant name
  const generateRandomName = () => {
    const firstNameIndex = Math.floor(Math.random() * firstNames.length);
    const lastNameIndex = Math.floor(Math.random() * lastNames.length);
    const fullName = `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`;
    form.setValue('babyName', fullName);
  };
  
  const handleAddCustomLocation = async () => {
    if (customLocation.trim()) {
      console.log("Adding custom location:", customLocation.trim());
      
      // Add new location to state
      const newLocations = [...customLocations, customLocation.trim()];
      setCustomLocations(newLocations);
      
      // Save to localStorage
      try {
        localStorage.setItem('customLocations', JSON.stringify(newLocations));
        console.log("Custom location saved to localStorage");
      } catch (error) {
        console.error("Failed to save custom location:", error);
      }
      
      // Set form value and close dialog
      form.setValue("location", customLocation.trim());
      setCustomLocation("");
      setShowCustomLocationDialog(false);
      
      // Only save to database if not in alpha mode
      if (!isAlphaTestingMode()) {
        try {
          await saveCustomLocationToDb(customLocation.trim());
          console.log("Custom location saved to database");
        } catch (error) {
          console.error("Failed to save custom location to database:", error);
          // Show user a toast about the error but continue
          toast({
            title: "Warning",
            description: "Location saved locally but couldn't sync to server",
            variant: "destructive",
          });
        }
      } else {
        console.log("Alpha mode: Custom location saved locally only");
      }
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
      
      // Ensure we have default values for optional fields
      const processedData = {
        ...data,
        wateringFrequencyDays: data.wateringFrequencyDays || defaultWateringFreq,
        feedingFrequencyDays: data.feedingFrequencyDays || defaultFeedingFreq,
        commonName: data.commonName || "",
        location: data.location || "",
        notes: data.notes || "",
        latinName: data.latinName || ""
      };
      
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
              ...processedData,
              name: processedData.babyName,
              imageUrl: imageUrl,
              updatedAt: new Date().toISOString()
            };
            alphaStorage.set('plants', plants);
            console.log("Plant updated in localStorage");
          }
        } else {
          // Create new plant
          let imageUrl = undefined;
          
          // Handle image in alpha mode - use compressed images to save storage space
          if (selectedImage) {
            // Convert compressed image to base64 for localStorage storage
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
            ...processedData,
            id: plantId,
            plantNumber: plantNumber,
            name: processedData.babyName,
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
        Object.entries(processedData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        // Add name field (for backward compatibility)
        formData.append("name", processedData.babyName);
        
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
          ...processedData,
          name: processedData.babyName // Ensure name field is set from babyName
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
                  <FormLabel>Plant Name</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Input 
                        placeholder="e.g., Alex Yolobo" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomName}
                      className="w-full text-xs h-8"
                    >
                      <Shuffle className="mr-2 h-3 w-3" />
                      Generate Random Name
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="commonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Name (Optional)</FormLabel>
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
                <FormLabel>Location (Optional)</FormLabel>
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
                  <FormLabel>Watering Frequency (days) - Optional</FormLabel>
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
                  <FormLabel>Feeding Frequency (days) - Optional</FormLabel>
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
                <FormLabel>Notes (Optional)</FormLabel>
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