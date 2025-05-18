import { tv } from "tailwind-variants";

export const card = tv({
  slots: {
    wrapper: [
      "rounded-xl overflow-hidden shadow-md backdrop-blur-lg",
      "transition-all duration-300 hover:shadow-lg",
      "flex flex-col gap-4",
    ],
    header: "flex items-center justify-between",
    title: "font-semibold",
    subtitle: "text-xs text-(--ui-text-muted)",
    badge: [
      "bg-gradient-to-br",
      "px-3 py-1 rounded-full",
      "text-xs font-semibold text-white tracking-wide",
    ],
    text: "font-semibold",
    body: "",
    footer: "w-full flex justify-between items-center gap-2 bg-white",
  },
  variants: {
    theme: {
      default: {
        wrapper: "bg-(--ui-bg-muted)",
        badge: "from-slate-400 to-slate-700",
        text: "text-slate-600",
      },
      nemo_cloud: {
        wrapper: "bg-amber-500/8",
        badge: "from-amber-400 to-amber-700",
        text: "text-amber-600",
      },
      zigbee: {
        wrapper: "bg-emerald-500/8",
        badge: "from-emerald-400 to-emerald-700",
        text: "text-emerald-600",
      },
      air_quality: {
        wrapper: "bg-indigo-500/8",
        badge: "from-indigo-400 to-indigo-700",
        text: "text-indigo-600",
      },
    },
    size: {
      lg: {
        wrapper: "p-4 lg:p-8 gap-10",
        title: "text-2xl",
        body: "grid grid-cols-2 lg:grid-cols-4 gap-4",
      },
      md: {
        wrapper: "h-70",
        header: "p-4",
        body: "px-4 grid grid-cols-2 gap-2 grow",
        footer: "w-full h-12 px-4",
      },
      sm: {
        wrapper: "w-74 h-32 p-4",
        title: "text-md",
        body: "flex flex-col justify-between",
      },
    },
  },
  defaultVariants: {
    theme: "default",
    size: "md",
  },
});
