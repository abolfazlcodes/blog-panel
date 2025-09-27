import { extendTailwindMerge } from "tailwind-merge";

export const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Override groups with token-restricted values
    },
  },
});
