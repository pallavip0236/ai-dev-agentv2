"use client";

import { Loader2, CheckCircle2, Terminal } from "lucide-react";

export const TIMELINE = ["IDLE", "PLANNING", "PLANNED", "CODED"] as const;

export type TimelineStatus = (typeof TIMELINE)[number];

export type AgentLog = {
  id: number;
  status: "running" | "success" | "error";
  message: string;
};

type AgentLogsPanelProps = {
  logs: AgentLog[];
  status: TimelineStatus; 
};



function StatusTimeline({ status }: { status: TimelineStatus }) {
  const currentIndex = TIMELINE.indexOf(status);

  return (
    <div className="px-4 pt-4 pb-2 border-b border-white/10">
      <div className="flex items-center">
        {TIMELINE.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${done ? "bg-cyan-500 text-white" : ""}
                    ${
                      current
                        ? "ring-2 ring-cyan-400 bg-white/10 text-cyan-300"
                        : ""
                    }
                    ${!done && !current ? "bg-white/5 text-gray-400" : ""}
                  `}
                >
                  {done ? "✓" : index + 1}
                </div>

                <span
                  className={`
                    text-[11px] mt-1
                    ${current ? "text-white font-medium" : "text-gray-400"}
                  `}
                >
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>

              {index < TIMELINE.length - 1 && (
                <div
                  className={`flex-1 h-[1px] mx-2 ${
                    done ? "bg-cyan-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



export function AgentLogsPanel({ logs, status }: AgentLogsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#0f1730] text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Terminal className="text-green-400" size={20} />
        <h2 className="font-semibold text-lg">Agent Logs</h2>
      </div>

      {/* ✅ TIMELINE */}
      <StatusTimeline status={status} />

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 && (
          <p className="text-sm text-slate-400">
            No activity yet. Start by giving instructions in chat.
          </p>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-[#111827] border border-white/10 rounded-lg p-3 text-sm flex items-center gap-3"
          >
            {log.status === "running" ? (
              <Loader2 className="animate-spin text-yellow-400" size={16} />
            ) : (
              <CheckCircle2 className="text-green-400" size={16} />
            )}
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}