import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { RunStatusBadge } from "./run-status-badge";

interface RunMessageProps {
  run: {
    id: string;
    prompt: string;
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
    errorMessage: string | null;
    createdAt: string;
  };
  isActive: boolean;
  textChunks?: string;
  logs?: { id: string; message: string; timestamp: string }[];
  onClick: () => void;
}

export function RunMessage({
  run,
  isActive,
  textChunks,
  logs,
  onClick
}: RunMessageProps) {
  const [logsExpanded, setLogsExpanded] = useState(false);

  return (
    <Button
      className={`rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        isActive
          ? "glass border-cyan/30 glow-cyan"
          : "bg-secondary/30 border border-border/30 hover:border-border/60"
      }`}
      onClick={onClick}
    >
      {/* user prompt */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-6 h-6 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-violet" />
        </div>
        <p className="text-sm text-foreground leading-relaxed">{run.prompt}</p>
      </div>

      {/* agent response */}
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          {/* streaming text or final status */}
          {run.status === "PENDING" && (
            <p className="text-sm text-muted-foreground italic">
              Waiting to start...
            </p>
          )}
          {run.status === "RUNNING" && (
            <div>
              {textChunks ? (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {textChunks}
                  <span className="inline-block w-1.5 h-3.5 bg-cyan animate-pulse ml-0.5 align-middle" />
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => `dot-${i}`).map(
                      (key, i) => (
                        <div
                          key={key}
                          className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      )
                    )}
                  </div>
                  <span className="text-xs text-cyan font-mono">
                    Agent thinking...
                  </span>
                </div>
              )}
            </div>
          )}
          {run.status === "COMPLETED" && (
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {textChunks || "Run completed successfully."}
            </p>
          )}
          {run.status === "FAILED" && (
            <p className="text-sm text-destructive leading-relaxed">
              {run.errorMessage || "Run failed."}
            </p>
          )}
          {run.status === "CANCELLED" && (
            <p className="text-sm text-muted-foreground italic">
              Run was cancelled.
            </p>
          )}

          {/* status + timestamp */}
          <div className="flex items-center gap-2 mt-2">
            <RunStatusBadge status={run.status} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(run.createdAt), {
                addSuffix: true
              })}
            </span>
          </div>

          {/* logs toggle */}
          {logs && logs.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLogsExpanded((v) => !v);
              }}
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-transparent border border-border/30 hover:border-border/60"
            >
              <Terminal className="w-3 h-3" />
              {logsExpanded ? "Hide" : "Show"} logs ({logs.length})
              {logsExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}

          {/* logs */}
          {logsExpanded && logs && logs.length > 0 && (
            <div className="mt-2 bg-muted/30 rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto">
              {logs.map((log) => (
                <p
                  key={log.id}
                  className="text-muted-foreground leading-relaxed"
                >
                  <span className="text-cyan/40 mr-2 select-none">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </span>
                  {log.message}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Button>
  );
}
