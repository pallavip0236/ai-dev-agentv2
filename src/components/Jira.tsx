import { CircleDot, Ellipsis, FolderKanban, Plus, Search } from "lucide-react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router";

import { api } from "@/lib/api";
import { useCreateProject } from "@/hooks/use-projects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type JiraIssue = {
  id?: string | number;
  key?: string;
  summary?: string;
  description?: string;
  status?: string;
  type?: string;
  priority?: string;
};

type JiraBoardItem = {
  id: number;
  name: string;
  type: string;
};

type JiraSprint = {
  id: number;
  name: string;
  state: "active" | "closed" | "future";
  startDate?: string;
  endDate?: string;
  goal?: string;
};

function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: unknown; code?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.errors != null) {
      try {
        return `Validation: ${JSON.stringify(data.errors)}`;
      } catch {
        return "Validation failed";
      }
    }
    return err.message || `Request failed (${err.response?.status ?? "?"})`;
  }
  if (err instanceof Error) return err.message;
  return "Request failed";
}

function parseJiraBoardsPayload(data: unknown): JiraBoardItem[] {
  if (Array.isArray(data)) return data as JiraBoardItem[];
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: JiraBoardItem[] }).data;
  }
  return [];
}

function normalizeStatus(status?: string) {
  const value = (status ?? "").toLowerCase();
  if (value.includes("todo") || value.includes("to do") || value.includes("open")) return "todo";
  if (value.includes("active") || value.includes("progress") || value.includes("doing")) return "active";
  if (value.includes("review") || value.includes("testing")) return "inprogress";
  if (value.includes("done") || value.includes("complete") || value.includes("closed")) return "completed";
  return "todo";
}

function JiraColumn({
  title,
  issues,
  isLoading
}: {
  title: string;
  issues: JiraIssue[];
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1b1d21] p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          {title} <span className="font-normal text-slate-500">({issues.length})</span>
        </p>
        <button type="button" className="text-slate-500 hover:text-white" aria-label={`${title} menu`}>
          <Ellipsis className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500 text-center">Loading…</p>
      ) : issues.length === 0 ? (
        <p className="text-xs text-slate-500 text-center">No issues</p>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div
              key={issue.id ?? issue.key ?? `${title}-${index}`}
              className="rounded-lg border border-white/5 bg-[#0f1113] p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-white">
                {issue.summary ?? issue.key ?? "Untitled issue"}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                {issue.description?.trim() || "—"}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CircleDot className="h-3 w-3" />
                  {issue.key ?? "—"}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <span className="select-none">{issue.status ?? "—"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Jira() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createProject = useCreateProject();

  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [approveProjectId, setApproveProjectId] = useState("");
  const [approveRunId, setApproveRunId] = useState("");
  const [jiraProjectKey] = useState("");

  useEffect(() => {
    const projectIdFromUrl = searchParams.get("projectId");
    const runIdFromUrl = searchParams.get("runId");
    if (projectIdFromUrl) setApproveProjectId(projectIdFromUrl);
    if (runIdFromUrl) setApproveRunId(runIdFromUrl);
  }, [searchParams]);

  const boardsQuery = useQuery({
    queryKey: ["jira-boards"],
    queryFn: async () => {
      const { data } = await api.get<unknown>("/api/v1/jira/boards");
      return parseJiraBoardsPayload(data);
    }
  });

  const boards = Array.isArray(boardsQuery.data) ? boardsQuery.data : [];

  useEffect(() => {
    if (selectedBoardId == null && boards.length > 0) setSelectedBoardId(boards[0].id);
  }, [boards, selectedBoardId]);

  const sprintsQuery = useQuery({
    queryKey: ["jira-sprints", selectedBoardId],
    enabled: Boolean(selectedBoardId),
    queryFn: async () => {
      // Backend query schema only supports `state`; passing boardId causes validation errors.
      const { data } = await api.get<unknown>("/api/v1/jira/sprints");
      if (Array.isArray(data)) return data as JiraSprint[];
      if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
        return (data as any).data as JiraSprint[];
      }
      return [];
    }
  });

  const approvalProjectQuery = useQuery({
    queryKey: ["approval-project", approveProjectId],
    enabled: Boolean(approveProjectId.trim()),
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/projects/${approveProjectId.trim()}`);
      return data as {
        id: string;
        status?: string;
        jiraSprintId?: number | null;
        jiraProjectKey?: string | null;
      };
    }
  });

  const linkJira = useMutation({
    mutationFn: async ({ projectId, projectKey }: { projectId: string; projectKey: string }) => {
      return api.post(`/api/v1/projects/${projectId}/jira/link`, { projectKey });
    },
    onSuccess: () => {
      toast.success("Jira linked to project");
      if (approveProjectId.trim()) {
        approvalProjectQuery.refetch();
      }
    },
    onError: (err) => toast.error(apiErrorMessage(err))
  });

  const sprints = Array.isArray(sprintsQuery.data) ? sprintsQuery.data : [];

  useEffect(() => {
    if (sprints.length === 0) {
      setSelectedSprintId(null);
      return;
    }
    if (selectedSprintId != null) return;
    const active = sprints.find((s) => s.state === "active");
    setSelectedSprintId(active?.id ?? sprints[0].id);
  }, [sprints, selectedSprintId]);

  const issuesQuery = useQuery({
    queryKey: ["jira-sprint-issues", selectedSprintId],
    enabled: Boolean(selectedSprintId),
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/jira/sprints/${selectedSprintId}/issues`);
      return data as JiraIssue[];
    }
  });

  const approvePlanning = useMutation({
    mutationFn: async ({ projectId, runId }: { projectId: string; runId: string }) => {
      return api.post(`/api/v1/projects/${projectId}/agent/planning/approve`, { runId });
    },
    onSuccess: () => toast.success("Planning approved"),
    onError: (err) => toast.error(apiErrorMessage(err))
  });

  const rawIssues = Array.isArray(issuesQuery.data) ? issuesQuery.data : [];
  const approvalProject = approvalProjectQuery.data;
  const approvalStatus = String(approvalProject?.status ?? "");
  const canApprove =
    approvalStatus === "PLANNED" &&
    Boolean(approvalProject?.jiraSprintId) &&
    Boolean((approveRunId.trim() || localStorage.getItem("lastRunId")));
  const columns = useMemo(() => {
    return {
      todo: rawIssues.filter((issue) => normalizeStatus(issue.status) === "todo"),
      active: rawIssues.filter((issue) => normalizeStatus(issue.status) === "active"),
      inprogress: rawIssues.filter((issue) => normalizeStatus(issue.status) === "inprogress"),
      completed: rawIssues.filter((issue) => normalizeStatus(issue.status) === "completed")
    };
  }, [rawIssues]);

  const createProjectSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name is too long")
      }),
    []
  );

  const form = useForm({
    defaultValues: { name: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = createProjectSchema.safeParse(value);
        if (!result.success) return result.error.issues[0]?.message ?? "Invalid input";
        return undefined;
      }
    },
    onSubmit: async ({ value }) => {
      try {
        const projectName = value.name.trim();
        const res = await createProject.mutateAsync({ name: projectName });

        const anyRes = res as any;
        const createdId =
          anyRes?.body?.id ??
          anyRes?.id ??
          anyRes?.data?.id ??
          anyRes?.data?.body?.id ??
          anyRes?.data?.project?.id ??
          anyRes?.data?.projectId ??
          anyRes?.data?.projectID ??
          anyRes?.data?.result?.id ??
          anyRes?.data?.data?.id;

        const createdIdIsPrimitive =
          typeof createdId === "string" || typeof createdId === "number";

        let resolvedId: string | number | null = createdIdIsPrimitive ? createdId : null;

        // If backend exists, try to resolve the id by name via GET /projects.
        try {
          const listRes = await api.get("/api/v1/projects", { params: { page: 1, limit: 100 } });
          const list = Array.isArray(listRes.data?.data)
            ? listRes.data.data
            : Array.isArray(listRes.data)
              ? listRes.data
              : [];

          const match = list.find(
            (p: any) =>
              String(p?.name ?? "").trim().toLowerCase() === projectName.toLowerCase()
          );

          if (match?.id) resolvedId = match.id;
        } catch {
          // No backend (UI-only mode) — fall back to createdId from POST.
        }

        if (resolvedId === undefined || resolvedId === null || String(resolvedId).trim() === "") {
          toast.error(
            "Project was created, but we could not resolve the project id for navigation."
          );
          return;
        }

        toast.success("Project created");
        localStorage.setItem("lastProjectId", String(resolvedId));
        setCreateDialogOpen(false);
        form.reset();
        navigate(`/dashboard/projects/${resolvedId}`);
      } catch (err) {
        toast.error(apiErrorMessage(err));
      }
    }
  });

return (
  <div className="min-h-screen bg-[#0b0f19] text-white p-6 space-y-6">

    {/* ================= HEADER ================= */}
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-lg flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Jira Workspace</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-[#1b1d21] px-4 py-2 text-sm text-slate-400">
          <Search className="h-4 w-4 shrink-0" />
          <span>Search anything...</span>
        </div>


<Button
  type="button"
  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 gap-2 shadow-md"
  disabled={approvePlanning.isPending || !canApprove}
  onClick={() => {
    const projectId = localStorage.getItem("lastProjectId") || "";
    const runId = localStorage.getItem("lastRunId") || "";

    if (!projectId || !runId) {
      toast.error("Approval data missing.");
      return;
    }

    approvePlanning.mutate({ projectId, runId });
  }}
>
  <CircleDot className="h-4 w-4" />
  Approve Planning
</Button>


        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const projectId = approveProjectId.trim() || localStorage.getItem("lastProjectId") || "";
            const projectKey = jiraProjectKey.trim();
            if (!projectId || !projectKey) {
              toast.error("Provide projectId and Jira project key");
              return;
            }
            linkJira.mutate({ projectId, projectKey });
          }}
          disabled={linkJira.isPending}
        >
     
        </Button>

        <Button
          type="button"
          className="bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>
    </div>

    {/* ================= BOARDS ================= */}
    {boardsQuery.isLoading ? (
      <p className="text-sm text-slate-500">Loading boards from Jira…</p>
    ) : boardsQuery.isError ? (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {apiErrorMessage(boardsQuery.error)}
      </p>
    ) : (
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-md">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Boards</h3>
          <p className="text-xs text-slate-500">GET /api/v1/jira/boards</p>
        </div>

        {boards.length === 0 ? (
          <p className="text-sm text-slate-500">No boards returned from API.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoardId(board.id)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-5 transition ${
                  selectedBoardId === board.id
                    ? "border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/30"
                    : "border-white/10 bg-[#1b1d21] hover:border-white/20"
                }`}
              >
                <FolderKanban className="h-5 w-5 text-cyan-400" />
                <p className="text-base font-semibold">{board.name}</p>
                <p className="text-xs text-slate-500">
                  {board.type} · ID {board.id}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    )}

    {/* ================= SPRINT + STATUS ================= */}
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-sm flex flex-wrap items-center gap-4">
      
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs">Sprints:</span>
        {sprints.length === 0 ? (
          <span className="text-xs text-slate-500">No sprint data</span>
        ) : (
          <select
            value={selectedSprintId ?? ""}
            onChange={(e) => setSelectedSprintId(Number(e.target.value))}
            className="bg-[#1b1d21] border border-white/10 rounded px-3 py-1 text-xs"
          >
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.state})
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        Project Status:
        <span className="ml-2 font-semibold text-white">
          {approvalStatus || "—"}
        </span>
      </div>

      <div>
        Sprint ID:
        <span className="ml-2 font-semibold text-white">
          {approvalProject?.jiraSprintId ?? "—"}
        </span>
      </div>

    </div>

    {/* ================= KANBAN ================= */}
    <div className="grid gap-6 xl:grid-cols-4">
      <JiraColumn
        title="TODO"
        issues={columns.todo}
        isLoading={issuesQuery.isLoading || sprintsQuery.isLoading}
      />
      <JiraColumn
        title="Active"
        issues={columns.active}
        isLoading={issuesQuery.isLoading || sprintsQuery.isLoading}
      />
      <JiraColumn
        title="In Progress"
        issues={columns.inprogress}
        isLoading={issuesQuery.isLoading || sprintsQuery.isLoading}
      />
      <JiraColumn
        title="Completed"
        issues={columns.completed}
        isLoading={issuesQuery.isLoading || sprintsQuery.isLoading}
      />
    </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(v) => {
          setCreateDialogOpen(v);
          if (!v) form.reset();
        }}
      >
        <DialogContent className="glass border-glass-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create project</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Enter a project name. You will be taken to the agent workspace.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4 mt-2"
          >
            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="project-name" className="text-sm text-muted-foreground">
                      Project name
                    </FieldLabel>
                    <Input
                      id="project-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="my-awesome-app"
                      className="bg-input/50 border-border/50 focus:border-cyan/50 focus:ring-cyan/20"
                      autoFocus
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateDialogOpen(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>

              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-cyan text-background hover:bg-cyan/90 font-medium gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Project"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


