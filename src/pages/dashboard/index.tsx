import {
  ArrowLeft,
  FolderKanban,
  FolderPlus,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  ScanSearch,
  Settings,
  Trash2,
  Users,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { AgentCard } from "@/components/agent-card";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSignout } from "@/hooks/use-auth";
import {
  type CodelensScanResult,
  useCodelensScan,
  useCreateProject,
  useDeleteProject,
  useLinkJira,
  useProjects
} from "@/hooks/use-projects";
import {
  agents,
  getAgentById,
  getAgentsByCategory,
  getProjectById
} from "@/lib/data";
import { toast } from "sonner";
import { Outlet, useLocation, useNavigate } from "react-router";

type MenuKey =
  | "dashboard"
  | "agents"
  | "projects"
  | "workflows"
  | "settings"
  | "jira";
type View =
  | "agents-overview"
  | "agent-detail"
  | "projects-overview"
  | "project-detail";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "agents", label: "Agents", icon: Users },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "jira", label: "Open Jira", icon: Link2 },
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "settings", label: "Settings", icon: Settings }
] as const;

function formatScanOutput(result: CodelensScanResult | null) {
  if (!result) return "";
  if (typeof result.report === "string" && result.report.trim()) {
    return result.report;
  }
  return JSON.stringify(result, null, 2);
}

function CodelensScanButton({
  projectId,
  projectName
}: {
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CodelensScanResult | null>(null);
  const { mutate: scan, isPending } = useCodelensScan(projectId);

  const handleScan = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    scan(undefined, {
      onSuccess: (data) => {
        setResult(data);
        setOpen(true);
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to run CodeLens scan");
      }
    });
  };

  const issuesCount = result?.issuesCount ?? 0;
  const issueLines = Array.isArray(result?.issuesData)
    ? result!.issuesData
    : [];

  return (
    <>
      <button
        type="button"
        onClick={handleScan}
        disabled={isPending}
        title="Run CodeLens scan"
        className="px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs font-medium hover:bg-violet-500 disabled:opacity-60 flex items-center gap-1.5"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ScanSearch className="w-3.5 h-3.5" />
        )}
        Scan
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              CodeLens Scan - {projectName}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              SonarQube response for this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result?.success
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {result?.success ? "Success" : "No scan data yet"}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {issuesCount} issues
              </span>
              {result?.projectKey && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {result.projectKey}
                </span>
              )}
            </div>

            {issueLines.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">
                  Issues
                </h4>
                <div className="space-y-2">
                  {issueLines.map((issue, index) => (
                    <div
                      key={`${issue.key}-${index}`}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{issue.key}</p>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{issue.rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">
                Scan Response
              </h4>
              <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-800">
                {formatScanOutput(result)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuKey>("dashboard");
  const [view, setView] = useState<View>("agents-overview");
  const [filter, setFilter] = useState("all");
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkProjectId, setLinkProjectId] = useState("");
  const [linkProjectKey, setLinkProjectKey] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const linkJira = useLinkJira();

  const { data: projectsData, isLoading: projectsLoading } = useProjects();

  const allProjects = Array.isArray(projectsData?.data)
    ? projectsData.data
    : Array.isArray(projectsData)
      ? projectsData
      : [];

  const projectList = allProjects.length > 0 ? allProjects : [];

  const { mutate: signout, isPending: isSigningOut } = useSignout();

  const categories = getAgentsByCategory();
  const selectedAgent = useMemo(
    () => getAgentById(selectedAgentId) ?? agents[0],
    [selectedAgentId]
  );
  const selectedProject = useMemo(() => {
    const projectFromApi = projectList.find(
      (project: any) => project.id === selectedProjectId
    );
    if (projectFromApi) return projectFromApi;
    return getProjectById(selectedProjectId);
  }, [selectedProjectId, projectList]);

  const openAgents = () => {
    setMenu("agents");
    setView("agents-overview");
  };

  const openProjects = () => {
    setMenu("projects");
    setView("projects-overview");
  };

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/projects/")) {
      setMenu("projects");
      setView("project-detail");
      return;
    }
    if (location.pathname === "/dashboard/projects") {
      setMenu("projects");
      setView("projects-overview");
      return;
    }

    setMenu("dashboard");
    setView("agents-overview");
  }, [location.pathname]);

  const filteredAgents =
    filter === "all" ? agents : agents.filter((agent) => agent.id === filter);

  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { name: "Admin", email: "admin@gmail.com" };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-56 border-r border-white/10 bg-[#0a1228] flex flex-col">
          <div className="h-14 border-b border-white/10 px-4 flex items-center font-semibold text-sm text-white">
            Ai-AgentDashboard
          </div>

          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = menu === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.key === "dashboard" || item.key === "agents") {
                      navigate("/dashboard");
                      setMenu(item.key === "agents" ? "agents" : "dashboard");
                      setView("agents-overview");
                      return;
                    }

                    if (item.key === "projects") {
                      navigate("/dashboard/projects");
                      setMenu("projects");
                      setView("projects-overview");
                      return;
                    }

                    if (item.key === "jira") {
                      return;
                    }

                    setMenu(item.key);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm transition ${
                    isActive
                      ? "bg-blue-600/25 text-blue-300"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/20"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => signout()}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? "Signing out…" : "Logout"}
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <Header />

          <section className="p-5 space-y-5">
            {location.pathname.startsWith("/dashboard/projects/") ||
            location.pathname === "/dashboard/jira" ? (
              <Outlet />
            ) : (
              <>
                {(menu === "dashboard" || menu === "agents") &&
                  view === "agents-overview" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold">Agent Overview </h2>
                          <p className="text-sm text-slate-400">
                            {agents.length} agents deployed
                          </p>
                        </div>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                        >
                          <option value="all">All Agents</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {filter === "all" ? (
                        Object.entries(categories).map(
                          ([category, categoryAgents]) => (
                            <div key={category} className="space-y-3">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                {category}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {categoryAgents.map((agent) => (
                                  <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onOpen={() => {
                                      setSelectedAgentId(agent.id);
                                      setView("agent-detail");
                                      setMenu("agents");
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredAgents.map((agent) => (
                            <AgentCard
                              key={agent.id}
                              agent={agent}
                              onOpen={() => {
                                setSelectedAgentId(agent.id);
                                setView("agent-detail");
                                setMenu("agents");
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                {menu === "projects" && view === "projects-overview" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Projects</h2>
                        <p className="text-sm text-slate-400">
                          {projectList.length} projects
                        </p>
                      </div>
                      <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="
                          px-4 py-2 text-sm font-medium rounded-lg
                          bg-gradient-to-r from-cyan-500 to-blue-500
                          text-black
                          hover:from-cyan-400 hover:to-blue-400
                          shadow-md hover:shadow-cyan-500/30
                          transition-all duration-200
                          flex items-center gap-2
                        "
                      >
                        <FolderPlus size={16} />
                        Create Project
                      </Button>
                    </div>

                    {projectsLoading ? (
                      <div className="text-sm text-slate-400">
                        Loading projects…
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {projectList.map((project: any) => {
                          const createdAt = project.createdAt
                            ? new Date(project.createdAt).toLocaleString()
                            : "N/A";
                          const jiraKey =
                            project.jiraProjectKey ??
                            project.jiraProject?.key ??
                            project.jiraProjectKey;
                          const jiraLinked = Boolean(jiraKey);

                          return (
                            <div
                              key={project.id}
                              className="rounded-xl border border-border bg-card p-4 text-left hover:border-blue-500/50 transition"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-semibold">
                                    {project.name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Created: {createdAt}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {project.description ?? "No description"}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    jiraLinked
                                      ? "bg-emerald-500 text-black"
                                      : "bg-slate-700 text-white"
                                  }`}
                                >
                                  {jiraLinked ? "Jira Connected" : "Jira not linked"}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!jiraLinked) {
                                      toast.error("Link Jira first to use Chat.");
                                      return;
                                    }
                                    localStorage.setItem("lastProjectId", project.id);
                                    const existingRunId =
                                      localStorage.getItem("lastRunId");
                                    setSelectedProjectId(project.id);
                                    setView("project-detail");
                                    if (existingRunId) {
                                      navigate(
                                        `/dashboard/projects/${project.id}?run=${existingRunId}`
                                      );
                                    } else {
                                      navigate(`/dashboard/projects/${project.id}`);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                                    jiraLinked
                                      ? "bg-cyan-500 text-black hover:bg-cyan-400"
                                      : "bg-slate-700 text-slate-300 cursor-not-allowed"
                                  }`}
                                  disabled={!jiraLinked}
                                >
                                  Chat 
                                </button>

                                {!jiraLinked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLinkProjectId(project.id);
                                      setLinkDialogOpen(true);
                                      setLinkProjectKey("");
                                    }}
                                    className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-400"
                                  >
                                    Link Jira
                                  </button>
                                )}

                                <CodelensScanButton
                                  projectId={project.id}
                                  projectName={project.name}
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setProjectToDelete(project.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-500 flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete 
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Dialog
                      open={createDialogOpen}
                      onOpenChange={(v) => {
                        setCreateDialogOpen(v);
                        if (!v) {
                          setNewProjectName("");
                          setNewProjectDescription("");
                        }
                      }}
                    >
                      <DialogContent className="sm:max-w-md rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
                        <DialogHeader className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Create new project
                          </DialogTitle>
                          <DialogDescription>
                            Provide a project name and create it.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-2">
                          <Input
                            placeholder="Project name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            placeholder="Project description"
                            value={newProjectDescription}
                            onChange={(e) =>
                              setNewProjectDescription(e.target.value)
                            }
                            className="w-full min-h-[80px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => setCreateDialogOpen(false)}
                              variant="ghost"
                            >
                              Cancel
                            </Button>
                            <Button
                              disabled={
                                !newProjectName.trim() || createProject.isPending
                              }
                              onClick={() => {
                                if (!newProjectName.trim()) return;
                                createProject.mutate(
                                  {
                                    name: newProjectName.trim(),
                                    description: newProjectDescription.trim()
                                  },
                                  {
                                    onSuccess: (response: any) => {
                                      toast.success("Project created");
                                      setCreateDialogOpen(false);
                                      setNewProjectName("");
                                      if (response?.data?.id) {
                                        localStorage.setItem(
                                          "lastProjectId",
                                          response.data.id
                                        );
                                      }
                                    },
                                    onError: (err: any) => {
                                      toast.error(
                                        err?.message ?? "Failed to create project"
                                      );
                                    }
                                  }
                                );
                              }}
                            >
                              {createProject.isPending ? "Creating..." : "Create"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={linkDialogOpen}
                      onOpenChange={(v) => {
                        setLinkDialogOpen(v);
                        if (!v) {
                          setLinkProjectId("");
                          setLinkProjectKey("");
                        }
                      }}
                    >
                      <DialogContent className="sm:max-w-md rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
                        <DialogHeader className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Link Jira Project
                          </DialogTitle>
                          <DialogDescription className="text-sm text-slate-500">
                            Add Jira project key for this project.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-2">
                          <Input
                            placeholder="Jira project key"
                            value={linkProjectKey}
                            onChange={(e) => setLinkProjectKey(e.target.value)}
                            className="bg-input/50 border-border/50"
                            autoFocus
                          />

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => setLinkDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              disabled={
                                !linkProjectKey.trim() ||
                                !linkProjectId ||
                                linkJira.isPending
                              }
                              onClick={() => {
                                if (!linkProjectId || !linkProjectKey.trim()) {
                                  return;
                                }
                                linkJira.mutate(
                                  {
                                    projectId: linkProjectId,
                                    projectKey: linkProjectKey.trim()
                                  },
                                  {
                                    onSuccess: () => {
                                      toast.success("Jira linked successfully");
                                      setLinkDialogOpen(false);
                                      setLinkProjectId("");
                                      setLinkProjectKey("");
                                    },
                                    onError: (err: any) => {
                                      toast.error(
                                        err?.message ?? "Failed to link Jira"
                                      );
                                    }
                                  }
                                );
                              }}
                            >
                              {linkJira.isPending ? "Linking..." : "Link Jira"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={(v) => {
                        setDeleteDialogOpen(v);
                        if (!v) setProjectToDelete(null);
                      }}
                    >
                      <DialogContent className="sm:max-w-md rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-red-600">
                            Delete Project
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this project? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setDeleteDialogOpen(false);
                              setProjectToDelete(null);
                            }}
                          >
                            Cancel
                          </Button>

                          <Button
                            className="bg-red-600 hover:bg-red-500 text-white"
                            disabled={deleteProject.isPending}
                            onClick={() => {
                              if (!projectToDelete) return;

                              deleteProject.mutate(projectToDelete, {
                                onSuccess: () => {
                                  toast.success("Project deleted successfully");
                                  setDeleteDialogOpen(false);
                                  setProjectToDelete(null);
                                },
                                onError: (err: any) => {
                                  toast.error(
                                    err?.message ?? "Failed to delete project"
                                  );
                                }
                              });
                            }}
                          >
                            {deleteProject.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {menu === "projects" &&
                  view === "project-detail" &&
                  selectedProject && (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={openProjects}
                        className="text-sm text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <div>
                        <h2 className="text-xl font-bold">
                          {selectedProject.name}
                        </h2>
                        <p className="text-sm text-slate-400">
                          {selectedProject.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                        <Stat
                          label="Total Tickets"
                          value={String(selectedProject.tickets.total)}
                        />
                        <Stat
                          label="Open"
                          value={String(selectedProject.tickets.open)}
                        />
                        <Stat
                          label="In Progress"
                          value={String(selectedProject.tickets.inProgress)}
                        />
                        <Stat
                          label="Closed"
                          value={String(selectedProject.tickets.closed)}
                        />
                        <Stat
                          label="Progress"
                          value={`${selectedProject.progress}%`}
                        />
                      </div>

                      <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="font-semibold mb-3">Assigned Agents</h3>
                        <div className="space-y-2">
                          {selectedProject.agents.map((agentId: string) => {
                            const agent = getAgentById(agentId);
                            if (!agent) return null;
                            return (
                              <button
                                key={agent.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAgentId(agent.id);
                                  setView("agent-detail");
                                  setMenu("agents");
                                }}
                                className="w-full flex items-center justify-between rounded-md border border-white/10 px-3 py-2 hover:border-blue-500/50"
                              >
                                <div className="text-left">
                                  <p className="text-sm font-medium">
                                    {agent.name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {agent.task}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-300">
                                  View
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                {(menu === "dashboard" || menu === "agents") &&
                  view === "agent-detail" &&
                  selectedAgent && (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={openAgents}
                        className="text-sm text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <div>
                        <h2 className="text-xl font-bold">
                          {selectedAgent.name}
                        </h2>
                        <p className="text-sm text-slate-400">
                          {selectedAgent.task}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                        {selectedAgent.metrics.slice(0, 5).map((metric) => (
                          <Stat
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                          />
                        ))}
                        <Stat
                          label="Active Tasks"
                          value={String(selectedAgent.activeTasks)}
                        />
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border bg-card p-4 h-64">
                          <p className="text-sm font-semibold mb-3">
                            Performance Over Time
                          </p>
                          <div className="h-48 rounded-md border border-white/10 bg-gradient-to-b from-cyan-500/20 to-transparent" />
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4 h-64">
                          <p className="text-sm font-semibold mb-3">
                            Task Distribution
                          </p>
                          <div className="w-40 h-40 mx-auto mt-4 rounded-full border-[20px] border-emerald-400/80 border-r-amber-400 border-b-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
