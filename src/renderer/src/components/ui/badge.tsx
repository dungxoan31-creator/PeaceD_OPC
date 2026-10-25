import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary border border-primary/40 shadow-xs [a&]:hover:bg-primary/30',
        secondary: 'bg-glass-surface text-secondary-foreground border border-glass-border backdrop-blur-sm [a&]:hover:bg-glass-surface/80',
        dot: 'bg-background/80 text-foreground border-glass-border shadow-xs backdrop-blur-sm',
        destructive:
          'bg-destructive/20 text-destructive border border-destructive/40 focus-visible:ring-destructive/20 [a&]:hover:bg-destructive/30',
        outline:
          'border-glass-border bg-glass-surface/40 text-foreground backdrop-blur-sm [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        /** The chip naming the machine a workspace runs on — quieter and squarer than `secondary`,
         *  so it reads as context beside a workspace name rather than as a status of its own. */
        hostContext:
          'h-4 rounded border-glass-border bg-glass-surface/60 px-1.5 text-[10px] leading-none text-muted-foreground backdrop-blur-sm'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
