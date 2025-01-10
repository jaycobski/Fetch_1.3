import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <Badge
      className={cn(
        "transition-colors",
        isConnected 
          ? "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-300" 
          : "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900 dark:text-red-300",
        className
      )}
    >
      {isConnected ? "Connected" : "Not Connected"}
    </Badge>
  );
}