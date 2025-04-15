import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Item } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Format date string
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Get default categories for packing
export function getDefaultCategories(): string[] {
  return [
    "Clothing",
    "Toiletries",
    "Electronics",
    "Documents",
    "Food & Drinks",
    "Miscellaneous",
  ];
}

// Calculate and format the packing progress
export function formatProgress(packed: number, total: number): string {
  if (total === 0) {
    return "No items";
  }
  const percentage = Math.round((packed / total) * 100);
  return `${packed}/${total} (${percentage}%)`;
}

// Get color based on progress
export function getProgressColor(percentage: number): string {
  if (percentage === 100) {
    return "bg-green-500";
  }
  if (percentage >= 50) {
    return "bg-yellow-500";
  }
  return "bg-red-500";
}

// Sort items by various criteria
export function sortItems<T extends Record<string, any>>(items: T[], sortBy: string, sortOrder: "asc" | "desc" = "asc"): T[] {
  const sortedItems = [...items];

  const multiplier = sortOrder === "asc" ? 1 : -1;

  switch (sortBy) {
    case "name":
      sortedItems.sort((a, b) => a.name.localeCompare(b.name) * multiplier);
      break;
    case "category":
      sortedItems.sort((a, b) => (a.category || "").localeCompare(b.category || "") * multiplier);
      break;
    case "assignedTo":
      sortedItems.sort(
        (a, b) => (a.assignedTo || "").localeCompare(b.assignedTo || "") * multiplier
      );
      break;
    case "isPacked":
      sortedItems.sort((a, b) => {
        if (a.isPacked === b.isPacked) return 0;
        return a.isPacked ? 1 * multiplier : -1 * multiplier;
      });
      break;
    default:
      break;
  }

  return sortedItems;
}
