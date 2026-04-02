import {
  Activity,
  ArrowLeft,
  Bell,
  FolderKanban,
  Link2,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  User2,
  Users,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgentCard } from "@/components/agent-card";
import ModeToggle from "@/components/mode-toggle";
import {
  agents,
  getAgentById,
  getAgentsByCategory,
  getProjectById
} from "@/lib/data";
import { useProjects } from "@/hooks/use-projects";
import { useSignout } from "@/hooks/use-auth";
import { Outlet, useLocation, useNavigate } from "react-router";

type MenuKey =
  | "dashboard"
  | "agents"
  | "projects"
  | "workflows"
  | "logs"
  | "settings"
  | "jira";
type View = "agents-overview" | "agent-detail" | "projects-overview" | "project-detail";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "agents", label: "Agents", icon: Users },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "jira", label: "Open Jira", icon: Link2 },
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "logs", label: "Logs", icon: Activity },
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
    if (location.pathname === "/dashboard/jira") {
      setMenu("jira");
      return;
    }
    if (location.pathname === "/dashboard/logs") {
      setMenu("logs");
      return;
    }
    setMenu("dashboard");
    setView("agents-overview");
  }, [location.pathname]);

  const filteredAgents =
    filter === "all" ? agents : agents.filter((agent) => agent.id === filter);

  return (
    <div className="min-h-screen bg-[#060c1b] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-56 border-r border-white/10 bg-[#0a1228] flex flex-col">
          <div className="h-14 border-b border-white/10 px-4 flex items-center font-semibold text-sm">
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
                      navigate("/dashboard/jira");
                      setMenu("jira");
                      return;
                    }

                    if (item.key === "logs") {
                      navigate("/dashboard/logs");
                      setMenu("logs");
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
                <p className="text-sm font-medium">Administrator</p>
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
          <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between">
            <p className="text-sm font-semibold">AI Agents Management Dashboard</p>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <button type="button" className="text-slate-400 hover:text-white">
                <Mail className="w-4 h-4" />
              </button>
              <button type="button" className="text-slate-400 hover:text-white">
                <Bell className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 border-l border-white/10 pl-3">
                <User2 className="w-4 h-4" />
                Admin
              </div>
            </div>
          </header>

          <section className="p-5 space-y-5">
            {(location.pathname.startsWith("/dashboard/projects/") ||
              location.pathname === "/dashboard/jira" ||
              location.pathname === "/dashboard/logs") ? (
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
                    className="bg-[#111a33] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
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
                <div>
                  <h2 className="text-xl font-bold">Projects</h2>
                  <p className="text-sm text-slate-400">{projectList.length} active projects</p>
                </div>
                {projectsLoading ? (
                  <div className="text-sm text-slate-400">Loading projects…</div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {projectList.map((project: any) => (
                      <div
                        key={project.id}
                        className="rounded-xl border border-white/10 bg-[#0f1730] p-4 text-left hover:border-blue-500/50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-lg">{project.name}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{project.description ?? "No description"}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
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
                            className="px-3 py-1.5 rounded-md bg-cyan-500 text-black text-xs font-medium hover:bg-cyan-400"
                          >
                            Chat
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem("lastProjectId", project.id);
                              const existingRunId = localStorage.getItem("lastRunId");
                              const params = new URLSearchParams();
                              params.set("projectId", project.id);
                              if (existingRunId) params.set("runId", existingRunId);
                              navigate(`/dashboard/jira?${params.toString()}`);
                            }}
                            className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-400"
                          >
                            Jira
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <div className="rounded-xl border border-white/10 bg-[#0f1730] p-4">
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
                  <div className="rounded-xl border border-white/10 bg-[#0f1730] p-4 h-64">
                    <p className="text-sm font-semibold mb-3">Performance Over Time</p>
                    <div className="h-48 rounded-md border border-white/10 bg-gradient-to-b from-cyan-500/20 to-transparent" />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0f1730] p-4 h-64">
                    <p className="text-sm font-semibold mb-3">Task Distribution</p>
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
    <div className="rounded-lg border border-white/10 bg-[#0f1730] p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}