"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/agent/chat-panel";
import { AgentLogsPanel } from "@/components/agent/agent-logs-panel";

import type { Message } from "@/components/agent/chat-panel";
import type {
  AgentLog,
  TimelineStatus,
} from "@/components/agent/agent-logs-panel";

/* ================= WORKFLOW TYPES ================= */



/* ================= COMPONENT ================= */

export default function OpenJiraPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "agent",
      content: "Hi 👋 Describe your project requirement.",
    },
  ]);

  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [status, setStatus] = useState<TimelineStatus>("IDLE");
  const [loading, setLoading] = useState(false);
  const [currentSprint, setCurrentSprint] = useState(1);

  /* ================= SEND REQUIREMENT ================= */

  const handleSend = (input: string) => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: input },
      {
        id: crypto.randomUUID(),
        role: "agent",
        content: "Planning backlog and creating tickets...",
        isLoading: true,
      },
    ]);


    setStatus("PLANNING");
    setLoading(true);

    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        status: "running",
        message: "Planning agent started...",
      },
    ]);

    setTimeout(() => {

      setStatus("PLANNED");

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          id: crypto.randomUUID(),
          role: "agent",
          content:
            "Backlog created successfully. Do you approve the planning?",
          action: { type: "approve_planning" },
        },
      ]);

      setLogs((prev) =>
        prev.map((log) =>
          log.status === "running"
            ? {
                ...log,
                status: "success",
                message: "Backlog & tickets created.",
              }
            : log
        )
      );

      setLoading(false);
    }, 2000);
  };

  /* ================= APPROVE PLANNING ================= */

  const handleApprovePlanning = () => {
    startSprint();
  };

  /* ================= START SPRINT ================= */

  const startSprint = () => {
    setStatus("CODED");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "agent",
        content: `Sprint ${currentSprint} started. Coding in progress...`,
        isLoading: true,
      },
    ]);

    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        status: "running",
        message: `Sprint ${currentSprint} coding started.`,
      },
    ]);

    setTimeout(() => {
      setStatus("CODED");

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: `Sprint ${currentSprint} completed. Please review.`,
          action: { type: "review_sprint" },
        },
      ]);

      setLogs((prev) =>
        prev.map((log) =>
          log.status === "running"
            ? {
                ...log,
                status: "success",
                message: `Sprint ${currentSprint} implemented successfully.`,
              }
            : log
        )
      );

      setLoading(false);
    }, 3000);
  };

  /* ================= APPROVE SPRINT ================= */

  const handleApproveSprint = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "agent",
        content: `Sprint ${currentSprint} approved ✅ Creating next sprint...`,
      },
    ]);

    setCurrentSprint((prev) => prev + 1);

    setTimeout(() => {
      startSprint();
    }, 1500);
  };

  /* ================= REJECT SPRINT ================= */

  const handleRejectSprint = (feedback: string) => {
    setStatus("CODED");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: `Feedback: ${feedback}`,
      },
      {
        id: crypto.randomUUID(),
        role: "agent",
        content: `Retrying Sprint ${currentSprint} based on feedback...`,
        isLoading: true,
      },
    ]);

    setTimeout(() => {
      setStatus("CODED");

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: `Sprint ${currentSprint} updated. Approve or reject?`,
          action: { type: "review_sprint" },
        },
      ]);

      setLoading(false);
    }, 3000);
  };

  /* ================= UI ================= */

  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r border-white/10">
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          onApprovePlanning={handleApprovePlanning}
          onApproveSprint={handleApproveSprint}
          onRejectSprint={handleRejectSprint}
          loading={loading}
        />
      </div>

      <div className="w-1/2">
        <AgentLogsPanel logs={logs} status={status} />
      </div>
    </div>
  );
}