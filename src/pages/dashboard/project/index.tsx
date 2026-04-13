"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import {
  ExternalLink,
  Github,
  Link2Off,
  Loader2,
  X,
} from "lucide-react";

import { ChatPanel } from "@/components/agent/chat-panel";
import { AgentLogsPanel } from "@/components/agent/agent-logs-panel";

import type { Message } from "@/components/agent/chat-panel";

import {
  useApprovePlanning,
  useApproveSprintReview,
  useConnectGithub,
  useDisconnectGithub,
  useProject,
  useRejectSprintReview,
  useStartPlanning,
} from "@/hooks/use-projects";

// Extended to include TESTING and SECURITY_SCAN
type TimelineStatus =
  | "IDLE"
  | "PLANNING"
  | "PLANNED"
  | "CODING"
  | "TESTING"
  | "SECURITY_SCAN"
  | "SPRINT_REVIEW"
  | "FAILED";

type AgentLog = {
  id: number;
  status: "running" | "success" | "error";
  message: string;
  timestamp: Date;
  level: "info" | "success" | "error";
};

type GitHubFormState = {
  repoUrl: string;
  personalAccessToken: string;
  baseBranch: string;
};

const planningApprovalStorageKey = (projectId: string) =>
  `project:${projectId}:planningApprovalPending`;

const projectRanStorageKey = (projectId: string) =>
  `project:${projectId}:hasRun`;

function isPlanningApprovalPending(projectId: string) {
  if (typeof window === "undefined") return false;
  return (
    window.sessionStorage.getItem(planningApprovalStorageKey(projectId)) ===
    "true"
  );
}

function setPlanningApprovalPending(projectId: string, pending: boolean) {
  if (typeof window === "undefined") return;
  if (pending) {
    window.sessionStorage.setItem(
      planningApprovalStorageKey(projectId),
      "true"
    );
  } else {
    window.sessionStorage.removeItem(planningApprovalStorageKey(projectId));
  }
}

function hasProjectRun(projectId: string) {
  if (typeof window === "undefined") return false;
  return (
    window.sessionStorage.getItem(projectRanStorageKey(projectId)) === "true"
  );
}

function setProjectRan(projectId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(projectRanStorageKey(projectId), "true");
}

function extractRepoName(repoUrl: string) {
  try {
    const trimmed = repoUrl.trim().replace(/\.git$/, "");
    const parts = trimmed.split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    if (owner && repo) return `${owner}/${repo}`;
  } catch {
    return repoUrl;
  }
  return repoUrl;
}

/* ------------------------------ Helpers ------------------------------ */

function makeMessage(content: string, extra?: Partial<Message>): Message {
  return {
    id: crypto.randomUUID(),
    role: "agent",
    content,
    ...extra,
  };
}

function mkLog(
  message: string,
  level: AgentLog["level"] = "info"
): AgentLog {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    status:
      level === "error"
        ? "error"
        : level === "success"
        ? "success"
        : "running",
    message,
    timestamp: new Date(),
    level,
  };
}

function getInitialMessages(
  project: any,
  needsPlanningApproval: boolean,
  isCompletedProject: boolean
): Message[] {
  switch (project?.status) {
    case "PLANNING":
      return [
        makeMessage("Planning backlog and creating tickets...", {
          isLoading: true,
        }),
      ];

    case "PLANNED":
      return needsPlanningApproval
        ? [
            makeMessage(
              "Planning complete! Your epics and stories are in the Jira backlog. Approve below to confirm.",
              { action: { type: "approve-planning" } }
            ),
          ]
        : [
            makeMessage(
              "Planning approved! Choose a sprint and start coding.",
              { action: { type: "start-coding" } }
            ),
          ];

    case "CODING":
      return [
        makeMessage("Coding is in progress...", {
          isLoading: true,
        }),
      ];

    case "TESTING":
      return [
        makeMessage(
          "Coding complete! Testing agent is writing unit tests...",
          { isLoading: true }
        ),
      ];

    case "SECURITY_SCAN":
      return [
        makeMessage(
          "Tests written! Security agent is scanning the code for vulnerabilities...",
          { isLoading: true }
        ),
      ];

    case "SPRINT_REVIEW":
      return [
        makeMessage(
          "Sprint complete! Review the ticket outcome and approve or reject.",
          { action: { type: "review-sprint" } }
        ),
      ];

    case "FAILED":
      return [
        makeMessage("Something went wrong. Check the logs for details."),
      ];

    case "IDLE":
      return isCompletedProject
        ? [
            makeMessage(
              "All done! The backlog is empty and all tickets have been implemented."
            ),
          ]
        : [
            makeMessage(
              project?.name
                ? `Project "${project.name}" is ready. Describe what you want to build.`
                : "Hi 👋 Describe your project requirement."
            ),
          ];

    default:
      return [
        makeMessage(
          project?.name
            ? `Project "${project.name}" is ready. Describe what you want to build.`
            : "Hi 👋 Describe your project requirement."
        ),
      ];
  }
}

function mapStatusToTimeline(status: string): TimelineStatus {
  if (status === "CODING") return "CODING";
  if (status === "TESTING") return "TESTING";
  if (status === "SECURITY_SCAN") return "SECURITY_SCAN";
  if (status === "SPRINT_REVIEW") return "SPRINT_REVIEW";
  if (status === "FAILED") return "FAILED";
  if (status === "PLANNED") return "PLANNED";
  if (status === "PLANNING") return "PLANNING";
  return "IDLE";
}

type GitHubConnectModalProps = {
  open: boolean;
  form: GitHubFormState;
  error?: string | null;
  isSubmitting?: boolean;
  onChange: (field: keyof GitHubFormState, value: string) => void;
  onClose: () => void;
  onConnect: () => void;
};

function GitHubConnectModal({
  open,
  form,
  error,
  isSubmitting,
  onChange,
  onClose,
  onConnect,
}: GitHubConnectModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Connect GitHub Repository
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Connect a GitHub repo so the coding agent can read and write files.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Repository URL
            </label>
            <input
              value={form.repoUrl}
              onChange={(e) => onChange("repoUrl", e.target.value)}
              placeholder="https://github.com/org/repo"
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Personal Access Token
            </label>
            <input
              type="password"
              value={form.personalAccessToken}
              onChange={(e) => onChange("personalAccessToken", e.target.value)}
              placeholder="github_pat_..."
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Base Branch
            </label>
            <input
              value={form.baseBranch}
              onChange={(e) => onChange("baseBranch", e.target.value)}
              placeholder="main"
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-800 px-6 py-4">
          {error && <p className="mr-auto text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={onConnect}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Connect"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Component ------------------------------ */

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId ?? "";

  const {
    data: projectResponse,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProject(projectId, {
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      // Poll during all active agent states
      return ["PLANNING", "CODING", "TESTING", "SECURITY_SCAN"].includes(
        data.status
      )
        ? 1000
        : false;
    },
  });

  const project = projectResponse?.data ?? projectResponse;

  const startPlanning = useStartPlanning(projectId);
  const approvePlanning = useApprovePlanning(projectId);
  const approveSprintReview = useApproveSprintReview(projectId);
  const rejectSprintReview = useRejectSprintReview(projectId);
  const connectGithub = useConnectGithub(projectId);
  const disconnectGithub = useDisconnectGithub(projectId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [gitHubError, setGitHubError] = useState<string | null>(null);
  const [gitHubForm, setGitHubForm] = useState<GitHubFormState>({
    repoUrl: "",
    personalAccessToken: "",
    baseBranch: "main",
  });

  const prevStatus = useRef<string | undefined>(undefined);
  const initialized = useRef(false);

  const isBusy =
    startPlanning.isPending ||
    approvePlanning.isPending ||
    approveSprintReview.isPending ||
    rejectSprintReview.isPending;

  /* -------------------- Initial Load -------------------- */

  useEffect(() => {
    if (!project || initialized.current) return;

    initialized.current = true;
    prevStatus.current = project.status;

    if (project.status === "PLANNING") {
      setPlanningApprovalPending(projectId, true);
      setProjectRan(projectId);
    }

    if (
      project.status === "CODING" ||
      project.status === "TESTING" ||
      project.status === "SECURITY_SCAN" ||
      project.status === "SPRINT_REVIEW"
    ) {
      setProjectRan(projectId);
    }

    const needsPlanningApproval =
      project.status === "PLANNED" && isPlanningApprovalPending(projectId);

    const isCompletedProject =
      project.status === "IDLE" && hasProjectRun(projectId);

    setMessages(
      getInitialMessages(project, needsPlanningApproval, isCompletedProject)
    );
    setLogs([]);
  }, [project, projectId]);

  /* -------------------- Reconcile UI Without Refresh -------------------- */

  useEffect(() => {
    if (!project || !initialized.current) return;

    if (
      project.status === "PLANNED" &&
      isPlanningApprovalPending(projectId)
    ) {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) => msg.action?.type === "approve-planning"
        );
        if (alreadyExists) return prev;
        return [
          ...prev.filter((msg) => !msg.isLoading),
          makeMessage(
            "Planning complete! Your epics and stories are in the Jira backlog. Approve below to confirm.",
            { action: { type: "approve-planning" } }
          ),
        ];
      });
    }

    if (project.status === "IDLE" && hasProjectRun(projectId)) {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) =>
            msg.content ===
            "All done! The backlog is empty and all tickets have been implemented."
        );
        if (alreadyExists) return prev;
        return [
          ...prev.filter((msg) => !msg.isLoading),
          makeMessage(
            "All done! The backlog is empty and all tickets have been implemented."
          ),
        ];
      });
    }
  }, [project?.status, projectId]);

  /* -------------------- Status Transitions -------------------- */

  useEffect(() => {
    if (!project || !initialized.current) return;
    if (prevStatus.current === project.status) return;

    const previous = prevStatus.current;
    prevStatus.current = project.status;

    /* IDLE → PLANNING */
    if (previous === "IDLE" && project.status === "PLANNING") {
      setPlanningApprovalPending(projectId, true);
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Planning backlog and creating tickets...", {
          isLoading: true,
        }),
      ]);
      return;
    }

    /* PLANNING → PLANNED */
    if (previous === "PLANNING" && project.status === "PLANNED") {
      setPlanningApprovalPending(projectId, true);
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage(
          "Planning complete! Your epics and stories are in the Jira backlog. Approve below to confirm.",
          { action: { type: "approve-planning" } }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Planning complete. Jira tickets created in backlog.", "success"),
      ]);
      return;
    }

    /* PLANNED → CODING */
    if (previous === "PLANNED" && project.status === "CODING") {
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Coding agent is starting on your sprint...", {
          isLoading: true,
        }),
      ]);
      setLogs((prev) => [...prev, mkLog("Coding agent started.", "info")]);
      return;
    }

    /* CODING → TESTING */
    if (previous === "CODING" && project.status === "TESTING") {
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage(
          "Coding complete! Testing agent is writing unit tests...",
          { isLoading: true }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Coding complete. Testing agent started.", "success"),
      ]);
      return;
    }

    /* TESTING → SECURITY_SCAN */
    if (previous === "TESTING" && project.status === "SECURITY_SCAN") {
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage(
          "Tests written! Security agent is scanning the code for vulnerabilities...",
          { isLoading: true }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Testing complete. Security scan started.", "success"),
      ]);
      return;
    }

    /* SECURITY_SCAN → SPRINT_REVIEW */
    if (previous === "SECURITY_SCAN" && project.status === "SPRINT_REVIEW") {
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage(
          "Sprint complete! Review the results and approve to continue, or reject a ticket with feedback.",
          { action: { type: "review-sprint" } }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Security scan complete. Awaiting HIL review.", "success"),
      ]);
      return;
    }

    /* CODING → SPRINT_REVIEW (no-GitHub / no-testing path) */
    if (previous === "CODING" && project.status === "SPRINT_REVIEW") {
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage(
          "Sprint complete! Review the implemented tickets on the Jira board. Approve to continue with the next sprint, or reject a ticket with feedback.",
          { action: { type: "review-sprint" } }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Sprint complete. Awaiting HIL review.", "success"),
      ]);
      return;
    }

    /* SPRINT_REVIEW → CODING (reject / next sprint) */
    if (previous === "SPRINT_REVIEW" && project.status === "CODING") {
      setProjectRan(projectId);
      setMessages((prev) => [
        ...prev.filter(
          (msg) => !msg.isLoading && msg.action?.type !== "review-sprint"
        ),
        makeMessage(
          "Review submitted. Agent is processing the next sprint...",
          { isLoading: true }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Sprint review actioned. Coding agent restarted.", "info"),
      ]);
      return;
    }

    /* SPRINT_REVIEW → PLANNED (approved, more sprints available) */
    if (previous === "SPRINT_REVIEW" && project.status === "PLANNED") {
      setMessages((prev) => [
        ...prev.filter(
          (msg) => !msg.isLoading && msg.action?.type !== "review-sprint"
        ),
        makeMessage(
          "Sprint review complete. Choose the next sprint to continue.",
          { action: { type: "start-coding" } }
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("Next sprint is ready to start.", "success"),
      ]);
      return;
    }

    /* CODING → IDLE (all done) */
    if (previous === "CODING" && project.status === "IDLE") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage(
          "All done! The backlog is empty and all tickets have been implemented."
        ),
      ]);
      setLogs((prev) => [
        ...prev,
        mkLog("All sprints complete. Project finished.", "success"),
      ]);
      return;
    }

    /* → FAILED */
    if (project.status === "FAILED") {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        makeMessage("Something went wrong. Check the logs for details."),
      ]);
      setLogs((prev) => [...prev, mkLog("Process failed.", "error")]);
    }
  }, [project?.status, projectId]);

  /* -------------------- Handlers -------------------- */

  const handleSend = (input: string) => {
    if (!input.trim() || isBusy || !projectId) return;

    setPlanningApprovalPending(projectId, true);
    setProjectRan(projectId);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
      },
      makeMessage("Planning backlog and creating tickets...", {
        isLoading: true,
      }),
    ]);

    setLogs((prev) => [...prev, mkLog("Planning started.", "info")]);

    startPlanning.mutate(
      { prompt: input },
      {
        onError: (error: any) => {
          setMessages((prev) => [
            ...prev.filter((msg) => !msg.isLoading),
            makeMessage(`Error: ${error.message}`),
          ]);
        },
      }
    );
  };

  const handleApprovePlanning = () => {
    if (!projectId) return;

    approvePlanning.mutate(undefined, {
      onSuccess: () => {
        setPlanningApprovalPending(projectId, false);
        setMessages((prev) => [
          ...prev.filter((msg) => msg.action?.type !== "approve-planning"),
          makeMessage("Planning approved! Choose a sprint and start coding.", {
            action: { type: "start-coding" },
          }),
        ]);
        setLogs((prev) => [
          ...prev,
          mkLog("Planning approved. Ready to start coding.", "success"),
        ]);
      },
      onError: (error: any) => {
        setMessages((prev) => [
          ...prev,
          makeMessage(`Error: ${error.message}`),
        ]);
      },
    });
  };

  const handleApproveSprint = () => {
    if (!projectId || project.status !== "SPRINT_REVIEW") return;

    setMessages((prev) => [
      ...prev.filter((msg) => msg.action?.type !== "review-sprint"),
      makeMessage("Sprint approved. Processing next sprint...", {
        isLoading: true,
      }),
    ]);

    setLogs((prev) => [
      ...prev,
      mkLog("Sprint approved. Moving to next sprint...", "success"),
    ]);

    approveSprintReview.mutate(undefined, {
      onError: (error: any) => {
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isLoading),
          makeMessage(`Error: ${error.message}`),
        ]);
      },
    });
  };

  const handleStartCoding = () => {
    setMessages((prev) =>
      prev.filter((msg) => msg.action?.type !== "start-coding")
    );
  };

  const handleRejectSprint = (issueKey: string, feedback: string) => {
    if (!projectId) return;

    setMessages((prev) => [
      ...prev.filter((msg) => msg.action?.type !== "review-sprint"),
      {
        id: crypto.randomUUID(),
        role: "user",
        content: `Reject: ${issueKey} - ${feedback}`,
      },
      makeMessage("Retrying sprint with feedback...", {
        isLoading: true,
      }),
    ]);

    setLogs((prev) => [
      ...prev,
      mkLog(`Ticket ${issueKey} rejected. Feedback submitted.`, "info"),
    ]);

    rejectSprintReview.mutate(
      { issueKey, feedback },
      {
        onError: (error: any) => {
          setMessages((prev) => [
            ...prev.filter((msg) => !msg.isLoading),
            makeMessage(`Error: ${error.message}`),
          ]);
        },
      }
    );
  };

  const handleGitHubFormChange = (
    field: keyof GitHubFormState,
    value: string
  ) => {
    setGitHubForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnectGitHub = () => {
    const repoUrl = gitHubForm.repoUrl.trim();
    const pat = gitHubForm.personalAccessToken.trim();
    const baseBranch = gitHubForm.baseBranch.trim() || "main";

    if (!repoUrl || !pat || !projectId) {
      setGitHubError(
        "Repository URL, personal access token, and base branch are required."
      );
      return;
    }

    setGitHubError(null);

    connectGithub.mutate(
      { repoUrl, pat, baseBranch },
      {
        onSuccess: () => {
          setIsGitHubModalOpen(false);
          setGitHubForm({ repoUrl: "", personalAccessToken: "", baseBranch: "main" });
        },
        onError: (error: any) => {
          setGitHubError(error?.message || "Failed to connect GitHub repository.");
        },
      }
    );
  };

  const handleDisconnectGitHub = () => {
    if (!projectId) return;
    disconnectGithub.mutate(undefined, {
      onError: (error: any) => {
        setGitHubError(error?.message || "Failed to disconnect GitHub repository.");
      },
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
          <p className="text-lg font-semibold text-foreground">
            Unable to load project.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please go back to the dashboard and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-6">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-semibold truncate text-foreground">
                {project.name}
              </h1>

              <span
                className={`px-2.5 py-0.5 text-xs rounded-full font-medium
                ${project.status === "PLANNED"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : project.status === "PLANNING"
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  : project.status === "CODING"
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : project.status === "TESTING"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : project.status === "SECURITY_SCAN"
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : project.status === "SPRINT_REVIEW"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-gray-500/10 text-gray-300 border border-gray-500/20"
                }`}
              >
                {project.status}
              </span>
            </div>

            {project.description && (
              <p className="text-xs text-muted-foreground truncate">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {project.githubRepoUrl ? (
              <>
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 max-w-[240px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <Github className="h-4 w-4 text-slate-300" />
                  <span className="truncate">
                    {extractRepoName(project.githubRepoUrl)}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={handleDisconnectGitHub}
                  disabled={disconnectGithub.isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {disconnectGithub.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2Off className="h-4 w-4" />
                  )}
                  Disconnect
                </button>

                {project.githubPrUrl && (
                  <a
                    href={project.githubPrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View PR
                  </a>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setGitHubError(null);
                  setIsGitHubModalOpen(true);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
              >
                <Github className="h-4 w-4" />
                Connect GitHub
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-1/2 flex-col overflow-hidden border-r">
            <ChatPanel
              projectId={project.id}
              projectStatus={project.status}
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
            <AgentLogsPanel
              status={mapStatusToTimeline(project.status) as any}
              logs={logs as any}
            />
          </div>
        </div>
      </div>

      <GitHubConnectModal
        open={isGitHubModalOpen}
        form={gitHubForm}
        error={gitHubError}
        isSubmitting={connectGithub.isPending}
        onChange={handleGitHubFormChange}
        onClose={() => {
          setGitHubError(null);
          setIsGitHubModalOpen(false);
        }}
        onConnect={handleConnectGitHub}
      />
    </>
  );
}