import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Query Keys
export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  runs: (projectId: string) => [...projectKeys.all, "runs", projectId] as const,
  run: (projectId: string, runId: string) =>
    [...projectKeys.all, "run", projectId, runId] as const,
  fileTree: (projectId: string) =>
    [...projectKeys.all, "fileTree", projectId] as const,
  fileContent: (projectId: string, path: string) =>
    [...projectKeys.all, "fileContent", projectId, path] as const
};

export type LogLine = {
  id: string;
  message: string;
  timestamp: string;
};

// Projects
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      const res = await api.get("/api/v1/projects", {
        params: { page: 1, limit: 50 }
      });
      if (res.status === 200) return res.data;
      throw new Error("Failed to fetch projects");
    }
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}`);
      if (res.status === 200) return res.data;
      throw new Error("Failed to fetch project");
    },
    enabled: !!projectId
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      api.post("/api/v1/projects", {
        name: data.name,
        description: `${data.name} project`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => api.delete(`/api/v1/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    }
  });
}

// Files
export function useFileTree(projectId: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.fileTree(projectId),
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/file-tree`);
      if (res.status === 200) return res.data.tree;
      throw new Error("Failed to fetch file tree");
    },
    enabled: !!projectId && enabled
  });
}

export function useFileContent(projectId: string, path: string) {
  return useQuery({
    queryKey: projectKeys.fileContent(projectId, path),
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/file-content`, {
        params: { path }
      });
      if (res.status === 200) return res.data;
      throw new Error("Failed to fetch file content");
    },
    enabled: !!projectId && !!path
  });
}

// Agent Runs
export function useAgentRuns(projectId: string) {
  return useQuery({
    queryKey: projectKeys.runs(projectId),
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/runs`, {
        params: { page: 1, limit: 50 }
      });
      if (res.status === 200) return res.data;
      throw new Error("Failed to fetch runs");
    },
    enabled: !!projectId
  });
}

export function useAgentRun(projectId: string, runId: string) {
  return useQuery({
    queryKey: projectKeys.run(projectId, runId),
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/runs/${runId}`);
      if (res.status === 200) return res.data;
      throw new Error("Failed to fetch run");
    },
    enabled: !!projectId && !!runId
  });
}

export function useStartPlanning(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { prompt: string }>({
    mutationFn: (data) =>
      api
        .post(`/api/v1/projects/${projectId}/agent/planning/start`, data)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: projectKeys.runs(projectId) });
    }
  });
}

export function useApprovePlanning(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { runId: string }>({
    mutationFn: ({ runId }) =>
      api.post(`/api/v1/projects/${projectId}/agent/planning/approve`, { runId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    }
  });
}

export function useCancelAgentRun(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) =>
      api.post(`/api/v1/projects/${projectId}/runs/${runId}/cancel`),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.runs(projectId) });
      queryClient.invalidateQueries({
        queryKey: projectKeys.run(projectId, runId)
      });
    }
  });
}

export function useLinkJira(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { projectId?: string; projectKey: string }>({
    mutationFn: ({ projectId: projectIdArg, projectKey }) => {
      const finalProjectId = projectIdArg ?? projectId;
      if (!finalProjectId) {
        return Promise.reject(new Error("Project ID is required for Jira linking"));
      }
      return api.post(`/api/v1/projects/${finalProjectId}/jira/link`, { projectKey });
    },
    onSuccess: (_, variables) => {
      const finalProjectId = variables.projectId ?? projectId;
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      if (finalProjectId) {
        queryClient.invalidateQueries({ queryKey: ["projects", finalProjectId] });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(finalProjectId) });
      }
    }
  });
}
