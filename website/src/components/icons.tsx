import { cva } from "class-variance-authority";

export const iconsVariants = cva("cursor-pointer", {
	variants: {
		variant: {
			action: "h-5 w-5 text-gray-500",
			label: "h-4 w-4 text-gray-500",
		},
	},
});
