import { extendTailwindMerge } from "tailwind-merge";
import {
  FontSizeClasses,
  TextColorClasses,
} from "@/constants/design-tokens/generated-tokens";

const fontSizeValues = FontSizeClasses.map((klass) =>
  klass.replace(/^text-/, "")
);
const textColorValues = TextColorClasses.map((klass) =>
  klass.replace(/^text-/, "")
);

export const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Override groups with token-restricted values
      "text-color": [{ text: textColorValues }],
      "font-size": [{ text: fontSizeValues }],
    },
  },
});
