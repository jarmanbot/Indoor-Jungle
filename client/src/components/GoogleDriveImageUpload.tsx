import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleDriveImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  disabled?: boolean;
}

export function GoogleDriveImageUpload({ onImageUploaded, currentImage, disabled }: GoogleDriveImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  // Upload to Google Drive mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/plants/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (result) => {
      onImageUploaded(result.imageUrl);
      setSelectedFile(null);
      setPreviewUrl(result.imageUrl);
      toast({
        title: "Image Uploaded",
        description: "Your plant image has been uploaded to Google Drive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image to Google Drive",
        variant: "destructive",
      });
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

    // Validate file size (10MB limit for Google Drive)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="plant-image" className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-blue-600" />
        Plant Image (Google Drive)
      </Label>
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Plant preview"
            className="w-32 h-32 object-cover rounded-lg border"
            onError={(e) => {
              // Handle broken Google Drive images
              e.currentTarget.src = '/api/placeholder-image';
            }}
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
          {currentImage && currentImage.includes('drive.google.com') && (
            <div className="absolute bottom-1 right-1">
              <Cloud className="h-4 w-4 text-white bg-blue-600 rounded p-0.5" />
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <Cloud className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">No image selected</p>
          <p className="text-xs text-blue-600">Will be stored in Google Drive</p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          id="plant-image"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploadMutation.isPending}
          className="flex-1"
        />
        
        {selectedFile && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={disabled || uploadMutation.isPending}
            className="whitespace-nowrap"
          >
            {uploadMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Drive
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        <Cloud className="h-3 w-3 inline mr-1" />
        Images are uploaded to your Google Drive folder and can be accessed from any device.
        Maximum file size: 10MB
      </p>
    </div>
  );
}