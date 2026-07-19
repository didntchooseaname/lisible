import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const neumorphEyebrowVariants = cva(
  "rounded-full border-[.75px] px-2.5 w-fit h-6 flex items-center text-xs font-medium mb-2 shadow-[inset_0px_-2px_0px_0px_var(--color-secondary),_0px_1px_6px_0px_var(--color-secondary)]",
  {
    variants: {
      intent: {
        default: "border-border text-muted-foreground bg-secondary",
        primary: "border-foreground/20 text-foreground bg-secondary",
        secondary: "border-accent/30 text-accent bg-accent/10",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
)

interface NeumorphEyebrowProps
  extends VariantProps<typeof neumorphEyebrowVariants> {
  children: React.ReactNode
  className?: string
}

export const NeumorphEyebrow: React.FC<NeumorphEyebrowProps> = ({
  children,
  intent,
  className,
  ...props
}) => {
  return (
    <div className={cn(neumorphEyebrowVariants({ intent }), className)} {...props}>
      {children}
    </div>
  )
}

export default NeumorphEyebrow

