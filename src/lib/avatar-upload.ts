import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Upload avatar file to local storage
 * In production, you would use cloud storage like AWS S3, Cloudinary, etc.
 */
export async function uploadAvatar(file: File): Promise<UploadedFile> {
  try {
    await ensureUploadsDir();

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueId = crypto.randomUUID();
    const filename = `avatar_${uniqueId}${fileExtension}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filepath, buffer);

    return {
      url: `/uploads/avatars/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw new Error("Failed to upload avatar");
  }
}

/**
 * Validate avatar file
 */
export function validateAvatarFile(file: File): string | null {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return "Avatar image must be less than 5MB";
  }

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return "Avatar must be a valid image file (JPEG, PNG, GIF, WebP)";
  }

  return null;
}
