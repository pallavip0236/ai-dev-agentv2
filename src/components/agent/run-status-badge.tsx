import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

const statusConfig: Record<
  RunStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-muted/60 text-muted-foreground border-border/50",
    dot: "bg-muted-foreground"
  },
  RUNNING: {
    label: "Running",
    className: "bg-cyan/10 text-cyan border-cyan/20",
    dot: "bg-cyan animate-pulse"
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400"
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive"
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted/60 text-muted-foreground border-border/50",
    dot: "bg-muted-foreground"
  }
};

interface RunStatusBadgeProps {
  status: RunStatus;
  className?: string;
}

export function RunStatusBadge({ status, className }: RunStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-mono text-xs px-2 py-0.5",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
