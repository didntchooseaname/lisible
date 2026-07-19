import * as React from "react";
import {
  buttonVariantsOuter,
  innerDivVariants,
  type UnifiedButtonProps,
} from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

interface TextureLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: UnifiedButtonProps["variant"];
  size?: UnifiedButtonProps["size"];
  innerClassName?: string;
}

export function TextureLink({
  variant = "minimal",
  size = "default",
  className,
  innerClassName,
  children,
  ...props
}: TextureLinkProps) {
  return (
    <a
      className={cn(
        buttonVariantsOuter({ variant, size }),
        "inline-flex w-auto no-underline",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          innerDivVariants({ variant, size }),
          "min-h-[42px] font-medium text-foreground",
          innerClassName,
        )}
      >
        {children}
      </div>
    </a>
  );
}

export default TextureLink;
