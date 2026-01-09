import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ FIXED: Robust URL generation
export function getStorageUrl(bucket: string, path: string | null | undefined) {
  if (!path || path === "") return null; // Ensure null is returned for empty strings
  if (path.startsWith("http")) return path;

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectId) return null;

  // 1. Remove trailing slash from base
  const baseUrl = projectId.replace(/\/$/, "");

  // 2. Remove leading slash from path
  const cleanPath = path.replace(/^\/+/, "");

  // 3. Encode segments
  const encodedPath = cleanPath.split('/').map(segment => 
    encodeURIComponent(decodeURIComponent(segment))
  ).join('/');

  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}