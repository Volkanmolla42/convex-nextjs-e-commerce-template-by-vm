import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-xs font-medium uppercase tracking-200 transition-all duration-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-denim/70 focus-visible:ring-offset-1 focus-visible:ring-offset-paper [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-denim text-background dark:text-foreground font-semibold hover:bg-denim-hover",
        outline:
          "border border-navy/20 bg-transparent text-navy/60 hover:border-navy/40 hover:text-navy",
        outlineGold:
          "border border-navy/20 bg-transparent text-navy/60 hover:border-denim hover:text-denim",
        ghost: "bg-transparent text-navy/70 hover:text-navy",
        nav: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent duration-200",
        danger:
          "border border-border bg-transparent text-muted-foreground hover:border-destructive/30 hover:text-destructive",
        link: "h-auto border-0 bg-transparent p-0 text-muted-foreground tracking-wider underline underline-offset-4 hover:text-primary",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 px-5",
        lg: "h-16 px-10 tracking-250",
        icon: "h-12 w-12 p-0 tracking-normal",
        "icon-sm": "h-10 w-10 p-0 tracking-normal",
        "icon-lg": "h-14 w-14 p-0 tracking-normal",
        inline: "h-auto px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

