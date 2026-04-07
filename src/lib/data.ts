export type AgentStatus =
  | "active"
  | "idle"
  | "running"
  | "scanning"
  | "deploying"
  | "monitoring"
  | "error";

export interface Agent {
  id: string;
  name: string;
  category: string;
  status: AgentStatus;
  task: string;
  metrics: { label: string; value: string; color?: string }[];
  activeTasks: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  agents: string[];
  tickets: { total: number; open: number; closed: number; inProgress: number };
  progress: number;
}

export const agents: Agent[] = [
  {
    id: "coding-01",
    name: "Coding Agent 01",
    category: "Software Development",
    status: "active",
    task: "Feature 'UX-Fixes' in Progress",
    metrics: [
      { label: "Lines Written", value: "1,840" },
      { label: "PRs", value: "12 Open" },
      { label: "Success Rate", value: "96%", color: "success" }
    ],
    activeTasks: 5
  },
  {
    id: "architecture",
    name: "Architecture Agent",
    category: "Software Development",
    status: "active",
    task: "Designing Microservices",
    metrics: [
      { label: "UML Diagrams", value: "45" },
      { label: "ADRs", value: "19" },
      { label: "Reviews", value: "34" }
    ],
    activeTasks: 3
  },
  {
    id: "documentation",
    name: "Documentation Agent",
    category: "Software Development",
    status: "idle",
    task: "Last Updated: 2hr ago",
    metrics: [
      { label: "Pages", value: "112" },
      { label: "Tech Debt", value: "Low", color: "success" }
    ],
    activeTasks: 1
  },
  {
    id: "testing-03",
    name: "Testing Agent 03",
    category: "Quality Assurance",
    status: "running",
    task: "Suite: Regression v3.1",
    metrics: [
      { label: "Tests Run", value: "2,150" },
      { label: "Passed", value: "2,091", color: "success" },
      { label: "Failed", value: "59", color: "destructive" },
      { label: "Coverage", value: "94%", color: "success" }
    ],
    activeTasks: 4
  },
  {
    id: "security",
    name: "Security Agent",
    category: "Quality Assurance",
    status: "scanning",
    task: "Dependency Scan",
    metrics: [
      { label: "Vulns", value: "3 High / 12 Mid", color: "warning" },
      { label: "Scans", value: "10/day" },
      { label: "Compliance", value: "91%", color: "success" }
    ],
    activeTasks: 3
  },
 


];

export const projects: Project[] = [
  {
    id: "proj-alpha",
    name: "Project Alpha",
    description: "E-commerce platform migration",
    agents: ["coding-01", "architecture", "testing-03", "devops-02"],
    tickets: { total: 48, open: 12, closed: 30, inProgress: 6 },
    progress: 72
  },
  {
    id: "proj-beta",
    name: "Project Beta",
    description: "Mobile app backend services",
    agents: ["coding-01", "security", "infra"],
    tickets: { total: 35, open: 8, closed: 22, inProgress: 5 },
    progress: 65
  },
  {
    id: "proj-gamma",
    name: "Project Gamma",
    description: "Data pipeline optimization",
    agents: ["architecture", "performance", "monitoring"],
    tickets: { total: 22, open: 5, closed: 15, inProgress: 2 },
    progress: 80
  },
  {
    id: "proj-delta",
    name: "Project Delta",
    description: "Security compliance audit",
    agents: ["security", "documentation", "testing-03"],
    tickets: { total: 60, open: 20, closed: 32, inProgress: 8 },
    progress: 55
  }
];

export const getAgentById = (id: string) => agents.find((a) => a.id === id);
export const getProjectById = (id: string) => projects.find((p) => p.id === id);
export const getAgentsByCategory = () => {
  const map: Record<string, Agent[]> = {};
  agents.forEach((agent) => {
    if (!map[agent.category]) map[agent.category] = [];
    map[agent.category].push(agent);
  });
  return map;
};
