import { cva } from "class-variance-authority";

export const iconsVariants = cva("text-gray-500", {
	variants: {
		variant: {
			action: "cursor-pointer h-5 w-5 hover:text-gray-400",
			label: "h-4 w-4",
		},
	},
});
