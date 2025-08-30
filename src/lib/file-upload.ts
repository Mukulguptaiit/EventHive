/**
 * Utility functions for handling file uploads locally
 */

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Convert a File object to a data URL for local storage/preview
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload file to the server's local filesystem
 */
export async function uploadFileLocally(file: File): Promise<UploadedFile> {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Upload to the server API
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload file");
    }

    const result = await response.json();

    return {
      url: result.url, // Server returns public URL like /uploads/uuid.jpg
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload a JPEG, PNG, or WebP image",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 5MB",
    };
  }

  return { isValid: true };
}

/**
 * Delete a file from the server
 */
export async function deleteUploadedFile(filename: string): Promise<void> {
  try {
    // Extract filename from URL if a full URL is provided
    const fileToDelete = filename.startsWith("/uploads/")
      ? filename.split("/uploads/")[1]
      : filename;

    const response = await fetch(
      `/api/upload?filename=${encodeURIComponent(fileToDelete)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      console.warn("Failed to delete file from server:", filename);
    }
  } catch (error) {
    console.warn("Error deleting file:", error);
  }
}
