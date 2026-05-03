import { type ClassValue, clsx } from 'clsx';

// Simple cn utility without tailwind-merge (keep deps minimal)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
