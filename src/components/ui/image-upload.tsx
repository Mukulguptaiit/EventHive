"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";
import { validateImageFile } from "@/lib/file-upload";
import { toast } from "sonner";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];

      setImages(newImages);
      onImagesChange(newImages);

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload images",
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);

    // Delete from server if it's an uploaded file
    if (imageUrl.startsWith("/uploads/")) {
      try {
        const filename = imageUrl.split("/").pop();
        await fetch(`/api/upload?filename=${filename}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete file from server:", error);
        // Don't show error to user since the image is already removed from UI
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div key={index} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={image}
                  alt={`Facility photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <ImageIcon className="text-muted-foreground h-8 w-8" />
            <div>
              <p className="text-sm font-medium">Upload facility photos</p>
              <p className="text-muted-foreground text-xs">
                {images.length} of {maxImages} images uploaded
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
