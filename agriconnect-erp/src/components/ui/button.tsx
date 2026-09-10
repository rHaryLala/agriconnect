import { Button as ButtonPrimitive } from "@base-ui/react/button"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-variants"

interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant = "default", size = "default", asChild = false, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      render={asChild ? (children as React.ReactElement) : undefined}
      nativeButton={!asChild}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {!asChild && children}
    </ButtonPrimitive>
  )
}

export { Button }