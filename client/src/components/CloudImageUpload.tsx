import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CloudImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  disabled?: boolean;
}

export function CloudImageUpload({ onImageUploaded, currentImage, disabled }: CloudImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Get upload URL mutation
  const getUploadUrlMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/plant-images/upload-url', 'POST');
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Get upload URL
      const { uploadURL, objectPath } = await getUploadUrlMutation.mutateAsync();

      // Upload file to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // Return the object path for serving
      const imageUrl = objectPath;
      onImageUploaded(imageUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Your plant image has been uploaded successfully",
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="plant-image">Plant Image</Label>
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl.startsWith('/plant-images/') 
              ? previewUrl // Cloud image path
              : previewUrl // Local preview or existing image
            }
            alt="Plant preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No image selected</p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          id="plant-image"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="flex-1"
        />
        
        {selectedFile && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={disabled || isUploading}
            className="whitespace-nowrap"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Select an image file (JPEG, PNG, etc.) up to 5MB. Images are stored securely in cloud storage.
      </p>
    </div>
  );
}