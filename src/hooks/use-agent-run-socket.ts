import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/config/env";
import { projectKeys } from "./use-projects";
import {
  mockAppendRunLog,
  mockAppendRunText,
  mockGetRun,
  mockSetRunStatus
} from "@/lib/mock-backend";

export interface LogLine {
  id: string;
  message: string;
  timestamp: string;
}

type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

const TERMINAL_STATUSES: RunStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];

interface UseAgentRunSocketOptions {
  projectId: string;
  runId: string;
  initialStatus: RunStatus;
  enabled?: boolean;
}

interface UseAgentRunSocketResult {
  logs: LogLine[];
  textChunks: string;
  isConnected: boolean;
}

export function useAgentRunSocket({
  projectId,
  runId,
  initialStatus,
  enabled = true
}: UseAgentRunSocketOptions): UseAgentRunSocketResult {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [textChunks, setTextChunks] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const invalidateRun = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: projectKeys.run(projectId, runId)
    });
    queryClient.invalidateQueries({
      queryKey: projectKeys.runs(projectId)
    });
    // invalidate file tree so it refreshes after run completes
    queryClient.invalidateQueries({
      queryKey: projectKeys.fileTree(projectId)
    });
  }, [queryClient, projectId, runId]);

  useEffect(() => {
    if (!enabled) return;
    if (!runId) return;

    // Mock mode: if the run exists in the local in-memory backend, render logs/text without sockets.
    const mockRun = mockGetRun(projectId, runId);
    if (mockRun) {
      setLogs(mockRun.logs);
      setTextChunks(mockRun.textChunks);

      // In UI-only mode, keep the "live/online" indicator on once we have mock data.
      setIsConnected(true);

      // If the run is already terminal, just render what we have.
      if (mockRun.status !== "RUNNING") return;

      if (!mockRun.simulationStarted) {
        mockRun.simulationStarted = true;
        const steps = Math.max(mockRun.script.logMessages.length, mockRun.script.textChunks.length);

        let step = 0;
        const runStep = () => {
          const logMsg = mockRun.script.logMessages[step];
          const textChunk = mockRun.script.textChunks[step];

          if (logMsg) {
            const timestamp = new Date().toISOString();
            mockAppendRunLog(projectId, runId, { message: logMsg, timestamp });
            setLogs((prev) => [
              ...prev,
              {
                id: `${runId}-log-${prev.length}`,
                message: logMsg,
                timestamp
              }
            ]);
          }

          if (textChunk) {
            mockAppendRunText(projectId, runId, textChunk);
            setTextChunks((prev) => prev + textChunk);
          }

          step += 1;
          if (step < steps) {
            window.setTimeout(runStep, 300);
            return;
          }

          mockSetRunStatus(projectId, runId, "COMPLETED");
          // Force React Query consumers (status badges, run list) to refresh.
          invalidateRun();
          setIsConnected(false);
        };

        // Kick off immediately.
        window.setTimeout(runStep, 250);
      }

      return;
    }

    if (TERMINAL_STATUSES.includes(initialStatus)) return;

    const socket = io(`${API_URL}/agent`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("run:subscribe", { runId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("reconnect", () => {
      socket.emit("run:subscribe", { runId });
    });

    socket.on("run:status", (data: { runId: string; status: RunStatus }) => {
      if (data.runId !== runId) return;
      invalidateRun();
    });

    socket.on(
      "run:log",
      (data: { runId: string; message: string; timestamp: string }) => {
        if (data.runId !== runId) return;
        setLogs((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            message: data.message,
            timestamp: data.timestamp
          }
        ]);
      }
    );

    socket.on("run:text", (data: { runId: string; chunk: string }) => {
      if (data.runId !== runId) return;
      setTextChunks((prev) => prev + data.chunk);
    });

    socket.on("run:completed", (data: { runId: string }) => {
      if (data.runId !== runId) return;
      invalidateRun();
      socket.disconnect();
    });

    socket.on(
      "run:failed",
      (data: { runId: string; errorMessage?: string }) => {
        if (data.runId !== runId) return;
        invalidateRun();
        socket.disconnect();
      }
    );

    socket.on("connect_error", (err) => {
      console.error("[forge] WebSocket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [runId, initialStatus, enabled, invalidateRun]);

  return { logs, textChunks, isConnected };
}
