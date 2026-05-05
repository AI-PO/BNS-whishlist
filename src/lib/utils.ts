import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  // use the `extend` key in case you want to extend instead of override
  override: {
    classGroups: {
      "font-size": [
        "text-8",
        "text-10",
        "text-11",
        "text-12",
        "text-13",
        "text-14",
        "text-15",
        "text-16",
        "text-18",
        "text-20",
        "text-22",
        "text-24",
        "text-26",
        "text-28",
        "text-30",
        "text-32",
        "text-34",
        "text-40",
        "text-42",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
