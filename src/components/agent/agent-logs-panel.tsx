import { Terminal } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useAgentRun, type LogLine } from "@/hooks/use-projects";

export function AgentLogsPanel({
  projectId,
  runId
}: {
  projectId: string;
  runId: string | null;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: runData } = useAgentRun(projectId, runId ?? "");

  const logs = useMemo<LogLine[]>(
    () =>
      Array.isArray(runData?.logs)
        ? runData.logs
        : Array.isArray(runData?.data?.logs)
        ? runData.data.logs
        : [],
    [runData]
  );

  // keep the view pinned to newest log line
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  const hasLogs = useMemo(() => logs.length > 0, [logs.length]);

  function renderLogMessage(message: string) {
    // Expected mock/backend format: "LEVEL something..."
    const [levelRaw, ...rest] = message.split(" ");
    const level = String(levelRaw ?? "").toUpperCase();
    const body = rest.join(" ");

    const levelStyle =
      level === "SUCCESS"
        ? "text-emerald-300"
        : level === "WARN" || level === "WARNING"
          ? "text-amber-300"
          : level === "ERROR"
            ? "text-red-300"
            : level === "INFO"
              ? "text-cyan-300"
              : "text-slate-300";

    return (
      <div className="flex items-start gap-2">
        <span className={`shrink-0 font-mono text-[11px] ${levelStyle}`}>{level}</span>
        <span className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
          {body}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#0a1228]/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan" />
          <span className="text-sm font-semibold text-foreground">Agent Logs</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {logs.length} entries
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {!runId ? (
          <p className="text-sm text-muted-foreground">
            Create a run from the chat to see logs here.
          </p>
        ) : !hasLogs ? (
          <p className="text-sm text-muted-foreground">Waiting for agent output…</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log: LogLine) => (
              <div key={log.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">•</span>
                </div>
                <div className="mt-1">{renderLogMessage(log.message)}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}

