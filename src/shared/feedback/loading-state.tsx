import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  message?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
};

export function LoadingState({
  message = "Loading...",
  className,
  size = "default",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingState size="lg" message="Loading page..." />
    </div>
  );
}
