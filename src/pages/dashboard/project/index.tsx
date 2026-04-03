import { ArrowLeft, FolderGit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ChatPanel } from "@/components/agent/chat-panel";
import { AgentLogsPanel } from "@/components/agent/agent-logs-panel";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentRuns, useProject } from "@/hooks/use-projects";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProject(
    projectId ?? ""
  );
  const { data: runsData } = useAgentRuns(projectId ?? "");

  const runs = runsData?.data ?? [];

  // active run from URL query param or latest run
  const runIdFromUrl = searchParams.get("run");
  const [activeRunId, setActiveRunId] = useState<string | null>(
    runIdFromUrl ?? null
  );

  useEffect(() => {
    if (!activeRunId && projectId) {
      const storedLastProject = localStorage.getItem("lastProjectId");
      const storedLastRun = localStorage.getItem("lastRunId");

      if (storedLastProject === projectId && storedLastRun) {
        setActiveRunId(storedLastRun);
        setSearchParams({ run: storedLastRun }, { replace: true });
        return;
      }
    }

    if (runs.length > 0 && !activeRunId) {
      const latest = [...runs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setActiveRunId(latest.id);
      setSearchParams({ run: latest.id }, { replace: true });
    }
  }, [projectId, runs, activeRunId, setSearchParams]);

  useEffect(() => {
    if (activeRunId && projectId) {
      localStorage.setItem("lastProjectId", projectId);
      localStorage.setItem("lastRunId", activeRunId);
    }
  }, [projectId, activeRunId]);

  const handleRunCreated = (runId: string) => {
    setActiveRunId(runId);
    setSearchParams({ run: runId }, { replace: true });
    if (projectId) {
      localStorage.setItem("lastProjectId", projectId);
      localStorage.setItem("lastRunId", runId);
    }
  };

  const handleRunSelect = (runId: string) => {
    setActiveRunId(runId);
    setSearchParams({ run: runId }, { replace: true });
    if (projectId) {
      localStorage.setItem("lastProjectId", projectId);
      localStorage.setItem("lastRunId", runId);
    }
  };


  if (projectLoading) {
    return (
      <div className="min-h-full bg-background mesh-bg">
        <div className="pt-14 h-full flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="flex-1 m-4 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-full bg-background mesh-bg flex items-center justify-center p-4">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background mesh-bg flex flex-col">

      {/* project header bar */}
      <div className="fixed top-14 inset-x-0 z-40 h-10 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center px-4 gap-3">
        <Button onClick={() => navigate("/dashboard/jira")}>
          <ArrowLeft className="w-3.5 h-3.5" />
          Jira
        </Button>
        <Button
          onClick={() => {
            const params = new URLSearchParams();
            params.set("projectId", projectId ?? "");
            if (activeRunId) params.set("runId", activeRunId);
            navigate(`/dashboard/jira?${params.toString()}`);
          }}
        >
          Approve Planning
        </Button>
        <span className="text-border">/</span>
        <div className="flex items-center gap-1.5">
          <FolderGit2 className="w-3.5 h-3.5 text-cyan" />
          <span className="text-xs font-medium text-foreground">
            {project.name}
          </span>
        </div>
      </div>

      {/* workspace — full height below both bars */}
      <div className="pt-24 h-screen">
        <ResizablePanelGroup
          dir="horizontal"
          className="h-full flex justify-between px-4 pb-4"
        >
          {/* left: chat panel */}
          <ResizablePanel defaultSize={50}>
            <ChatPanel
              projectId={projectId ?? ""}
              activeRunId={activeRunId}
              onRunCreated={handleRunCreated}
              onRunSelect={handleRunSelect}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/50 mx-2 rounded-full" />

          {/* right: streaming agent logs */}
          <ResizablePanel defaultSize={50}>
            <AgentLogsPanel projectId={projectId ?? ""} runId={activeRunId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
