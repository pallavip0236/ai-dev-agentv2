import {
  // Activity,
  ArrowLeft,
  FolderKanban,
  Link2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgentCard } from "@/components/agent-card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateProject, useLinkJira } from "@/hooks/use-projects";
import { useDeleteProject } from "@/hooks/use-projects";
import {
  agents,
  getAgentById,
  getAgentsByCategory,
  getProjectById
} from "@/lib/data";
import { useProjects } from "@/hooks/use-projects";
import { useSignout } from "@/hooks/use-auth";
import Header from "@/components/header";
import { FolderPlus } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";

type MenuKey =
  | "dashboard"
  | "agents"
  | "projects"
  | "workflows"
  | "settings"
  | "jira";
type View = "agents-overview" | "agent-detail" | "projects-overview" | "project-detail";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "agents", label: "Agents", icon: Users },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "jira", label: "Open Jira", icon: Link2 },
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "settings", label: "Settings", icon: Settings }
] as const;

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
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkProjectId, setLinkProjectId] = useState("");
  const [linkProjectKey, setLinkProjectKey] = useState("");

  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const linkJira = useLinkJira();

  const { data: projectsData, isLoading: projectsLoading } = useProjects();

  const allProjects =
    Array.isArray(projectsData?.data)
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
    const projectFromApi = projectList.find((project: any) => project.id === selectedProjectId);
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
    // if (location.pathname === "/dashboard/jira") {
    //   setMenu("jira");
    //   return;
    // }

    setMenu("dashboard");
    setView("agents-overview");
  }, [location.pathname]);

  const filteredAgents =
    filter === "all" ? agents : agents.filter((agent) => agent.id === filter);

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
                      //  navigate("/dashboard/jira");
                      //  setMenu("jira");
                       return;
                     }



                    // fallback for non-routed items
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
<p className="text-sm font-medium text-white">Administrator</p>
<p className="text-xs text-slate-400">admin@gmail.com</p>
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
            {(location.pathname.startsWith("/dashboard/projects/") ||
              location.pathname === "/dashboard/jira" 
            ) ? (
              <Outlet />
            ) : (
              <>
                {(menu === "dashboard" || menu === "agents") &&
                  view === "agents-overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Agent Overview</h2>
                    <p className="text-sm text-slate-400">{agents.length} agents deployed</p>
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"                  >
                    <option value="all">All Agents</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {filter === "all" ? (
                  Object.entries(categories).map(([category, categoryAgents]) => (
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
                  ))
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
                    <p className="text-sm text-slate-400">{projectList.length} projects</p>
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
                  <div className="text-sm text-slate-400">Loading projects…</div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {projectList.map((project: any) => {
                      const createdAt = project.createdAt
                        ? new Date(project.createdAt).toLocaleString()
                        : "N/A";
                      const jiraKey = project.jiraProjectKey ?? project.jiraProject?.key ?? project.jiraProjectKey;
                      const jiraLinked = Boolean(jiraKey);

                      return (
                        <div
                          key={project.id}
className="rounded-xl border border-border bg-card p-4 text-left hover:border-blue-500/50 transition"                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold">{project.name}</p>
                              <p className="text-xs text-slate-400">Created: {createdAt}</p>
                              <p className="text-xs text-slate-400">{project.description ?? "No description"}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                jiraLinked ? "bg-emerald-500 text-black" : "bg-slate-700 text-white"
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
                                const existingRunId = localStorage.getItem("lastRunId");
                                setSelectedProjectId(project.id);
                                setView("project-detail");
                                if (existingRunId) {
                                  navigate(`/dashboard/projects/${project.id}?run=${existingRunId}`);
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
 <button
    type="button"
    onClick={() => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this project?"
      );
      if (!confirmDelete) return;

      deleteProject.mutate(project.id, {
        onSuccess: () => {
          toast.success("Project deleted successfully");
        },
        onError: (err: any) => {
          toast.error(err?.message ?? "Failed to delete project");
        }
      });
    }}
    disabled={deleteProject.isPending}
    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-500 disabled:opacity-50"
  >
    {deleteProject.isPending ? "Deleting..." : "Delete"}
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
                    if (!v) setNewProjectName("");
                  }}
                >
                  <DialogContent className="glass border-glass-border sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create new project</DialogTitle>
                      <DialogDescription>
                        Provide a project name and create it.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                      <Input
                        placeholder="Project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="bg-input/50 border-border/50"
                        autoFocus
                      />

                      <div className="flex justify-end gap-2">
                        <Button onClick={() => setCreateDialogOpen(false)} variant="ghost">
                          Cancel
                        </Button>
                        <Button
                          disabled={!newProjectName.trim() || createProject.isPending}
                          onClick={() => {
                            if (!newProjectName.trim()) return;
                            createProject.mutate(
                              {
                                name: newProjectName.trim(),
                                description: ""
                              },
                              {
                                onSuccess: (response: any) => {
                                  toast.success("Project created");
                                  setCreateDialogOpen(false);
                                  setNewProjectName("");
                                  if (response?.data?.id) {
                                    localStorage.setItem("lastProjectId", response.data.id);
                                  }
                                },
                                onError: (err: any) => {
                                  toast.error(err?.message ?? "Failed to create project");
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
                  <DialogContent className="glass border-glass-border sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Link Jira Project</DialogTitle>
                      <DialogDescription>
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
                        <Button variant="ghost" onClick={() => setLinkDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          disabled={!linkProjectKey.trim() || !linkProjectId || linkJira.isPending}
                          onClick={() => {
                            if (!linkProjectId || !linkProjectKey.trim()) return;
                            linkJira.mutate(
                              { projectId: linkProjectId, projectKey: linkProjectKey.trim() },
                              {
                                onSuccess: () => {
                                  toast.success("Jira linked successfully");
                                  setLinkDialogOpen(false);
                                  setLinkProjectId("");
                                  setLinkProjectKey("");
                                },
                                onError: (err: any) => {
                                  toast.error(err?.message ?? "Failed to link Jira");
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
              </div>
            )}

            {menu === "projects" && view === "project-detail" && selectedProject && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={openProjects}
                  className="text-sm text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div>
                  <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                  <p className="text-sm text-slate-400">{selectedProject.description}</p>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                  <Stat label="Total Tickets" value={String(selectedProject.tickets.total)} />
                  <Stat label="Open" value={String(selectedProject.tickets.open)} />
                  <Stat
                    label="In Progress"
                    value={String(selectedProject.tickets.inProgress)}
                  />
                  <Stat label="Closed" value={String(selectedProject.tickets.closed)} />
                  <Stat label="Progress" value={`${selectedProject.progress}%`} />
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
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-slate-400">{agent.task}</p>
                          </div>
                          <span className="text-xs text-slate-300">View</span>
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
                  <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                  <p className="text-sm text-slate-400">{selectedAgent.task}</p>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                  {selectedAgent.metrics.slice(0, 5).map((metric) => (
                    <Stat key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                  <Stat label="Active Tasks" value={String(selectedAgent.activeTasks)} />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
<div className="rounded-xl border border-border bg-card p-4 h-64">
                      <p className="text-sm font-semibold mb-3">Performance Over Time</p>
                    <div className="h-48 rounded-md border border-white/10 bg-gradient-to-b from-cyan-500/20 to-transparent" />
                  </div>
<div className="rounded-xl border border-border bg-card p-4 h-64">                    <p className="text-sm font-semibold mb-3">Task Distribution</p>
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