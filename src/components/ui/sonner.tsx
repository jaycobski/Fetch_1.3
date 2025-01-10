import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

const toastVariants = cva(
  "group toast flex gap-2 items-start rounded-md border p-4 shadow-lg w-[356px] min-h-[64px]",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-green-50 border-green-100 text-green-600 dark:bg-green-900/30 dark:border-green-500/30 dark:text-green-300",
        error: "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/30 dark:border-red-500/30 dark:text-red-300",
        warning: "bg-yellow-50 border-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:border-yellow-500/30 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group fixed top-4 right-4 z-[100]"
      toastOptions={{
        unstyled: true,
        duration: 4000,
        classNames: {
          toast: cn(toastVariants({ variant: "default" })),
          title: "font-semibold text-sm",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-3 h-8",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-3 h-8",
          success: cn(toastVariants({ variant: "success" })),
          error: cn(toastVariants({ variant: "error" })),
          warning: cn(toastVariants({ variant: "warning" })),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }