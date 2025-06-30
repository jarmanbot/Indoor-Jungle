import { ChangeEvent, useState } from "react";
import { Camera } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  currentImage?: string | null;
}

const ImageUpload = ({ onImageSelected, currentImage }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage || undefined);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Pass the file up to parent component
    onImageSelected(file);
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
