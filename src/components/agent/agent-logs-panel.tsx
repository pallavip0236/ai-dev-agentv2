"use client";

import { Loader2, Check } from "lucide-react";
import { Fragment, useEffect, useRef } from "react";

export const TIMELINE = [
  "IDLE",
  "PLANNING",
  "PLANNED",
  "CODING"
] as const;

export type TimelineStatus =
  | "IDLE"
  | "PLANNING"
  | "PLANNED"
  | "CODING"
  | "SPRINT_REVIEW"
  | "FAILED";

export type AgentLog = {
  id: number;
  status: "running" | "success" | "error";
  message: string;
};

type AgentLogsPanelProps = {
  logs: AgentLog[];
  status: TimelineStatus;
};

/* ---------------- TIMELINE ---------------- */

function StatusTimeline({ status }: { status: TimelineStatus }) {
  const isFailed = status === "FAILED";
  const isReview = status === "SPRINT_REVIEW";

  const effective = isFailed || isReview ? "CODING" : status;

  const currentIdx = TIMELINE.indexOf(effective as any);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start">
        {TIMELINE.map((step, idx) => {
          const done = idx < currentIdx;
          const current = idx === currentIdx;

          return (
            <Fragment key={step}>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`
                  flex size-6 items-center justify-center rounded-full text-xs font-medium
                  ${done && "bg-cyan-500 text-white"}
                  ${current && !isFailed && "ring-2 ring-cyan-400 text-cyan-400"}
                  ${current && isFailed && "ring-2 ring-red-500 text-red-400"}
                  ${!done && !current && "bg-white/10 text-gray-400"}
                `}
                >
                  {done ? <Check size={12} /> : idx + 1}
                </div>

                <span
                  className={`
                  text-xs
                  ${current && !isFailed && "text-white"}
                  ${current && isFailed && "text-red-400"}
                  ${done && "text-white"}
                  ${!done && !current && "text-gray-400"}
                `}
                >
                  {step}
                </span>
              </div>

              {idx < TIMELINE.length - 1 && (
                <div
                  className={`flex-1 h-px mt-3 mx-1 ${
                    done ? "bg-cyan-500" : "bg-white/10"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* REVIEW MESSAGE */}
      {isReview && (
        <p className="text-xs text-gray-400 text-center">
          Sprint complete — awaiting your review.
        </p>
      )}

      {/* FAILED MESSAGE */}
      {isFailed && (
        <p className="text-xs text-red-400 text-center">
          The process encountered an error. Check the logs below.
        </p>
      )}
    </div>
  );
}

/* ---------------- LOGS PANEL ---------------- */

export function AgentLogsPanel({ logs, status }: AgentLogsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const isRunning =
    status === "PLANNING" ||
    status === "CODING" ||
    status === "SPRINT_REVIEW";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full bg-[#0f1730] text-white">
      {/* HEADER */}
      <div className="flex h-11 items-center gap-2 border-b border-white/10 px-5">
        <span className="text-xs font-medium text-gray-400 uppercase">
          Logs
        </span>

        {isRunning && (
          <Loader2 className="size-3 animate-spin text-gray-400" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* TIMELINE */}
        <StatusTimeline status={status} />

        <div className="border-t border-white/10" />

        {/* LOGS */}
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Logs will appear here when the agent is running.
          </p>
        ) : (
          <div className="flex flex-col gap-2 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span
                  className={`
                    ${log.status === "success" && "text-green-400"}
                    ${log.status === "error" && "text-red-400"}
                    ${log.status === "running" && "text-white"}
                  `}
                >
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}