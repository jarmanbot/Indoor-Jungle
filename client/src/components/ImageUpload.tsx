import { ChangeEvent, useState } from "react";
import { Camera } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  currentImage?: string | null;
}

const ImageUpload = ({ onImageSelected, currentImage }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage || undefined);

  // Compress image for alpha mode to save localStorage space
  const compressImage = (file: File, maxWidth = 400, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth = maxWidth;
        let newHeight = maxWidth / aspectRatio;
        
        if (newHeight > maxWidth) {
          newHeight = maxWidth;
          newWidth = maxWidth * aspectRatio;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress the image
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let processedFile = file;
    
    // Compress image to save localStorage space
    processedFile = await compressImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(processedFile);

    // Pass the processed file up to parent component
    onImageSelected(processedFile);
  };

  return (
    <div className="mb-4">
      <label className="block text-neutral-darkest text-sm font-medium mb-2">Plant Photo</label>
      <div className="relative">
        <div className="border-2 border-dashed border-neutral-medium rounded-lg p-4 text-center cursor-pointer hover:bg-neutral-light transition-colors duration-200">
          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Plant preview" 
                className="aspect-square w-full object-cover rounded" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 rounded">
                <span className="text-white text-sm">Click to change image</span>
              </div>
            </div>
          ) : (
            <>
              <Camera className="h-10 w-10 mx-auto text-neutral-dark" />
              <p className="mt-2 text-sm text-neutral-dark">Click to upload an image</p>
            </>
          )}
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
