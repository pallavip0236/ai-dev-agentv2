"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { ChatPanel } from "@/components/agent/chat-panel";
import { AgentLogsPanel } from "@/components/agent/agent-logs-panel";
import type { Message } from "@/components/agent/chat-panel";
import type { AgentLog, TimelineStatus } from "@/components/agent/agent-logs-panel";
import {
  useApprovePlanning,
  useApproveSprintReview,
  useProject,
  useRejectSprintReview,
  useStartPlanning
} from "@/hooks/use-projects";

function makeMessage(content: string, extra?: Partial<Message>): Message {
  return {
    id: crypto.randomUUID(),
    role: "agent",
    content,
    ...extra
  };
}

function mkLog(message: string, status: AgentLog["status"] = "running"): AgentLog {
  return {
    id: Date.now(),
    status,
    message
  };
}

function getInitialMessages(project: any): Message[] {
  switch (project?.status) {
    case "PLANNING":
      return [makeMessage("Planning backlog and creating tickets...", { isLoading: true })];
    case "PLANNED":
      return [
        makeMessage("Backlog created successfully. Approve the planning to continue.", {
          action: { type: "approve_planning" }
        })
      ];
    case "SPRINT_REVIEW":
      return [
        makeMessage("Sprint complete! Review the ticket outcome and approve or reject.", {
          action: { type: "review_sprint" }
        })
      ];
    case "CODING":
      return [makeMessage("Coding is in progress...", { isLoading: true })];
    case "FAILED":
      return [makeMessage("Something went wrong. Check the logs for details.")];
    default:
      return [
        makeMessage(
          project?.name
            ? `Project "${project.name}" is ready. Describe what you want to build.`
            : "Hi 👋 Describe your project requirement."
        )
      ];
  }
}

function mapStatusToTimeline(status: string): TimelineStatus {
  if (status === "CODING") return "CODING";
  if (status === "SPRINT_REVIEW") return "SPRINT_REVIEW";
  if (status === "FAILED") return "FAILED";
  if (status === "PLANNED") return "PLANNED";
  if (status === "PLANNING") return "PLANNING";
  return "IDLE";
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId ?? "";

const {
  data: projectResponse,
  isLoading: isProjectLoading,
  isError: isProjectError
} = useProject(projectId);

  const project = projectResponse?.data ?? projectResponse;

  const startPlanning = useStartPlanning(projectId);
  const approvePlanning = useApprovePlanning(projectId);
  const approveSprintReview = useApproveSprintReview(projectId);
  const rejectSprintReview = useRejectSprintReview(projectId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const prevStatus = useRef<string | undefined>(undefined);
  const initialized = useRef(false);

const isBusy =
  startPlanning.isPending ||
  approvePlanning.isPending ||
  approveSprintReview.isPending ||
  rejectSprintReview.isPending;


  useEffect(() => {
    if (!project || initialized.current) return;
    initialized.current = true;
    prevStatus.current = project.status;
    setMessages(getInitialMessages(project));
    setLogs([]);
  }, [project]);

  useEffect(() => {
    if (!project || !initialized.current) return;
    if (prevStatus.current === project.status) return;

    const previous = prevStatus.current;
    prevStatus.current = project.status;

    if (previous === "IDLE" && project.status === "PLANNING") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Planning backlog and creating tickets...", { isLoading: true })
      ]);
      return;
    }

    if (previous === "PLANNING" && project.status === "PLANNED") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Backlog created successfully. Approve the planning to continue.", {
          action: { type: "approve_planning" }
        })
      ]);
      setLogs((prev) => [...prev, mkLog("Planning completed.", "success")]);
      return;
    }

    if (previous === "PLANNED" && project.status === "CODING") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading && msg.action?.type !== "approve_planning"),
        makeMessage("Coding is in progress...", { isLoading: true })
      ]);
      setLogs((prev) => [...prev, mkLog("Coding started.", "success")]);
      return;
    }

    if (previous === "CODING" && project.status === "SPRINT_REVIEW") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Sprint complete! Review the ticket outcome and approve or reject.", {
          action: { type: "review_sprint" }
        })
      ]);
      setLogs((prev) => [...prev, mkLog("Sprint complete. Awaiting review.", "success")]);
      return;
    }

    if (previous === "SPRINT_REVIEW" && project.status === "CODING") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading && msg.action?.type !== "review_sprint"),
        makeMessage("Review approved. Coding next sprint...", { isLoading: true })
      ]);
      setLogs((prev) => [...prev, mkLog("Sprint approved, resuming coding.", "success")]);
      return;
    }

    if (project.status === "FAILED") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Something went wrong. Check the logs for details.")
      ]);
      setLogs((prev) => [...prev, mkLog("Project failed.", "error")]);
      return;
    }
  }, [project?.status]);

  const handleSend = (input: string) => {
    if (!input.trim() || isBusy || !projectId) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: input },
      makeMessage("Planning backlog and creating tickets...", { isLoading: true })
    ]);
    setLogs((prev) => [...prev, mkLog("Planning started.", "running")]);

    startPlanning.mutate({ prompt: input }, {
      onError: (error) => {
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isLoading),
          makeMessage(`Error: ${error.message}`)
        ]);
      }
    });
  };

const handleApprovePlanning = () => {
  if (!projectId) return;

  approvePlanning.mutate(undefined, {
    onSuccess: () => {
      setMessages((prev) => [
        ...prev.filter((m) => m.action?.type !== "approve_planning"),
        makeMessage("Planning approved! Choose a sprint and start coding.", {
          action: { type: "start_coding" }
        })
      ]);

      setLogs((prev) => [
        ...prev,
        mkLog("Planning approved. Ready to start coding.", "success")
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [...prev, makeMessage(`Error: ${error.message}`)]);
    }
  });
};

const handleApproveSprint = () => {
  if (!projectId || project.status !== "SPRINT_REVIEW") return;

  setLogs((prev) => [
    ...prev,
    mkLog("Sprint approved. Moving to next sprint...", "success")
  ]);

  approveSprintReview.mutate(undefined, {
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        makeMessage(`Error: ${error.message}`)
      ]);
    }
  });
};

  const handleStartCoding = () => {
    setMessages((prev) => prev.filter((m) => m.action?.type !== "start_coding"));
  };

  const handleRejectSprint = (issueKey: string, feedback: string) => {
    if (!projectId) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: `Reject: ${issueKey} — ${feedback}` },
      makeMessage("Retrying sprint with feedback...", { isLoading: true })
    ]);
    setLogs((prev) => [...prev, mkLog(`Ticket ${issueKey} rejected. Feedback submitted.`, "running")]);

    rejectSprintReview.mutate({ issueKey, feedback }, {
      onError: (error) => {
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isLoading),
          makeMessage(`Error: ${error.message}`)
        ]);
      }
    });
  };



  if (isProjectLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="flex h-full items-center justify-center text-center p-6">
        <div>
          <p className="text-lg font-semibold text-foreground">Unable to load project.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please go back to the dashboard and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-6">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold truncate text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {project.description}
            </p>
          )}
        </div>

      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 flex-col overflow-hidden border-r">
          <ChatPanel
            projectId={project.id}
            messages={messages}
            onSend={handleSend}
            onApprovePlanning={handleApprovePlanning}
            onStartCoding={handleStartCoding}
            onApproveSprint={handleApproveSprint}
            onRejectSprint={handleRejectSprint}
            loading={isBusy}
          />
        </div>
        <div className="flex w-1/2 flex-col overflow-hidden">
          <AgentLogsPanel status={mapStatusToTimeline(project.status)} logs={logs} />
        </div>
      </div>
    </div>
  );
}
