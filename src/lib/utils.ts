import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getStorageUrl(bucket: string, path: string | null | undefined) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
