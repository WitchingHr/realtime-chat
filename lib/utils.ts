import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// merge tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}