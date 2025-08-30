"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarUploadProps {
  onFileChange: (file: File | null) => void;
  error?: string;
  className?: string;
}

export function AvatarUpload({
  onFileChange,
  error,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor="avatar">Avatar (Optional)</Label>

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
          {preview ? (
            <Image
              src={preview}
              alt="Avatar preview"
              className="h-full w-full rounded-full object-cover"
              width={64}
              height={64}
            />
          ) : (
            <div className="text-center text-xs text-gray-400">No Image</div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
            >
              Choose File
            </Button>
            {preview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">JPEG, PNG, or WebP. Max 5MB.</p>
        </div>
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="avatar"
      />

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
