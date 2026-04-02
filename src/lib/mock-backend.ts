import type { LogLine } from "@/hooks/use-agent-run-socket";

export type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type MockProject = {
  id: string;
  name: string;
  description: string;
  agents: string[];
  tickets: { total: number; open: number; closed: number; inProgress: number };
  progress: number;
};

export type MockRun = {
  id: string;
  projectId: string;
  prompt: string;
  status: RunStatus;
  errorMessage: string | null;
  createdAt: string;

  // Streaming payload used by the mock socket hook.
  script: {
    logMessages: string[];
    textChunks: string[];
  };

  logs: LogLine[];
  textChunks: string;

  // Avoid starting multiple simulations for the same run.
  simulationStarted: boolean;
};

const projects: MockProject[] = [];
const runsByProjectId = new Map<string, MockRun[]>();

function uuid() {
  // Node/modern browsers both support crypto.randomUUID; keep fallback for safety.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = crypto as any;
  if (c?.randomUUID) return c.randomUUID();
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function mockReset() {
  projects.splice(0, projects.length);
  runsByProjectId.clear();
}

export function mockCreateProject(input: { name: string }): MockProject {
  const id = `mock-proj-${uuid()}`;
  const name = input.name.trim();

  const project: MockProject = {
    id,
    name,
    description: "Mock project (no backend connected).",
    agents: [],
    tickets: { total: 0, open: 0, closed: 0, inProgress: 0 },
    progress: 0
  };

  projects.unshift(project);

  // Create a single initial run so the chat header shows "1 messages" (matches your screenshot),
  // while still rendering multiple assistant bubbles from `script.textChunks`.
  const initialRunId = `mock-run-${uuid()}`;
  const now = new Date();

  const welcomeTextChunks = `Welcome to "${name}"! I'm your AI agent. How can I help you get started?`;
  const welcomeLogs = [
    "INFO Setting up linting rules…",
    "SUCCESS ESLint + prettier configured",
    "INFO Generating project scaffolding…",
    "WARN Using default template — no custom config found",
    "INFO Creating entry point files…",
    "SUCCESS src/index.ts created",
    "INFO Setting up test framework…",
    "SUCCESS Vite configured with coverage",
    "INFO Initializing Git repository…",
    "SUCCESS Git repo initialized with .gitignore",
    "INFO Running initial build…",
    "SUCCESS Build completed in 1.2s",
    "INFO Running test suite…",
    "SUCCESS All 3 tests passed",
    "INFO Installing dependencies…",
    "SUCCESS Dependencies installed",
    "INFO Creating final output…",
    "SUCCESS Output bundle prepared",
    "INFO Performing final typecheck…",
    "SUCCESS Typecheck passed",
    "INFO Cleanup temporary files…",
    "INFO Agent ready and listening for commands…"
  ];

  const initialRun: MockRun = {
    id: initialRunId,
    projectId: id,
    // User bubble shown in UI from `prompt` (your screenshot shows a user card).
    prompt: "Create a new task project for my team",
    status: "COMPLETED",
    errorMessage: null,
    createdAt: now.toISOString(),
    script: {
      logMessages: welcomeLogs,
      // Render two assistant bubbles (welcome + follow-up) inside one run.
      textChunks: [
        welcomeTextChunks,
        `Great! I'll help you create a new task project.\nWhat would you like to name it?`
      ]
    },
    logs: welcomeLogs.map((message, idx) => ({
      id: `${initialRunId}-log-${idx}`,
      message,
      timestamp: new Date(now.getTime() + idx * 150).toISOString()
    })),
    // Combined text (mock socket exposes a single string; UI prefers `script.textChunks` when present).
    textChunks: `${welcomeTextChunks}\nGreat! I'll help you create a new task project.\nWhat would you like to name it?`,
    simulationStarted: true
  };

  runsByProjectId.set(id, [initialRun]);

  return project;
}

export function mockListProjects(params: { page: number; limit: number }) {
  // Keep the same shape as the real backend list response usage in the UI.
  return {
    data: projects.slice(0, params.limit),
    total: projects.length
  };
}

export function mockGetProject(id: string): MockProject | null {
  return projects.find((p) => p.id === id) ?? null;
}

export function mockDeleteProject(id: string) {
  const idx = projects.findIndex((p) => p.id === id);
  if (idx >= 0) projects.splice(idx, 1);
  runsByProjectId.delete(id);
}

export function mockListRuns(projectId: string) {
  return {
    data: runsByProjectId.get(projectId) ?? []
  };
}

export function mockGetRun(projectId: string, runId: string): MockRun | null {
  return (runsByProjectId.get(projectId) ?? []).find((r) => r.id === runId) ?? null;
}

export function mockCreateRun(projectId: string, input: { prompt: string }): MockRun {
  const existing = runsByProjectId.get(projectId) ?? [];

  const runId = `mock-run-${uuid()}`;
  const now = new Date();

  const prompt = input.prompt.trim();

  const scriptLogMessages = [
    `INFO Received prompt: ${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}`,
    "INFO Creating entry point files…",
    "SUCCESS Setting up test framework…",
    "INFO Running initial build…",
    "SUCCESS All checks passed"
  ];

  const scriptTextChunks = [
    `Processing your request: "${prompt}"\n`,
    "Planning tasks…\n",
    "Generating files…\n",
    "Finalizing…\n",
    "Done.\n"
  ];

  const newRun: MockRun = {
    id: runId,
    projectId,
    prompt,
    status: "RUNNING",
    errorMessage: null,
    createdAt: now.toISOString(),
    script: {
      logMessages: scriptLogMessages,
      textChunks: scriptTextChunks
    },
    logs: [],
    textChunks: "",
    simulationStarted: false
  };

  runsByProjectId.set(projectId, [newRun, ...existing]);
  return newRun;
}

export function mockSetRunStatus(projectId: string, runId: string, status: RunStatus) {
  const run = mockGetRun(projectId, runId);
  if (run) run.status = status;
}

export function mockAppendRunLog(projectId: string, runId: string, log: Omit<LogLine, "id">) {
  const run = mockGetRun(projectId, runId);
  if (!run) return;
  run.logs.push({
    id: `${runId}-log-${run.logs.length}`,
    message: log.message,
    timestamp: log.timestamp
  });
}

export function mockAppendRunText(projectId: string, runId: string, chunk: string) {
  const run = mockGetRun(projectId, runId);
  if (!run) return;
  run.textChunks += chunk;
}

