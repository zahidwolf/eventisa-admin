// <CHANGE> Fixed clsx import - ClassValue is not exported in clsx v2.1.1, using any type instead
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
