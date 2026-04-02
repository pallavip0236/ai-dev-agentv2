import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  mockCreateProject,
  mockCreateRun,
  mockDeleteProject,
  mockGetProject,
  mockListProjects,
  mockListRuns,
  mockSetRunStatus
} from "@/lib/mock-backend";

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

// Projects
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/projects", {
          params: { page: 1, limit: 50 }
        });
        if (res.status === 200) return res.data;
        throw new Error("Failed to fetch projects");
      } catch {
        return mockListProjects({ page: 1, limit: 50 });
      }
    }
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      try {
        const res = await api.get(`/api/v1/projects/${projectId}`);
        if (res.status === 200) return res.data;
        throw new Error("Failed to fetch project");
      } catch {
        const p = mockGetProject(projectId);
        if (!p) throw new Error("Failed to fetch project");
        return p;
      }
    },
    enabled: !!projectId
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      api
        .post("/api/v1/projects", {
          name: data.name,
          description: `${data.name} project`
        })
        .catch(() => {
          const project = mockCreateProject({ name: data.name });
          // Mirror the shape used by the UI's id extraction.
          return {
            status: 201,
            body: { id: project.id },
            data: { id: project.id }
          };
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      api.delete(`/api/v1/projects/${projectId}`).catch(() => {
        mockDeleteProject(projectId);
        return { status: 200 };
      }),
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
      try {
        const res = await api.get(`/api/v1/projects/${projectId}/runs`, {
          params: { page: 1, limit: 50 }
        });
        if (res.status === 200) return res.data;
        throw new Error("Failed to fetch runs");
      } catch {
        return mockListRuns(projectId);
      }
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

export function useCreateAgentRun(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { prompt: string }) =>
      api.post(`/api/v1/projects/${projectId}/agent/planning/start`, data).catch(() => {
        const run = mockCreateRun(projectId, { prompt: data.prompt });
        return {
          status: 201,
          body: { id: run.id },
          data: { id: run.id }
        };
      }),
    onSuccess: (res, variables) => {
      const anyRes = res as any;
      const createdRunId =
        anyRes?.body?.id ??
        anyRes?.body?.runId ??
        anyRes?.data?.id ??
        anyRes?.data?.runId ??
        anyRes?.data?.body?.id;

      if (createdRunId) {
        queryClient.setQueryData(projectKeys.runs(projectId), (old: any) => {
          const oldRuns = Array.isArray(old?.data) ? old.data : [];
          const already = oldRuns.some((r: any) => String(r?.id) === String(createdRunId));
          if (already) return old;
          const optimisticRun = {
            id: String(createdRunId),
            prompt: variables.prompt,
            status: "RUNNING",
            errorMessage: null,
            createdAt: new Date().toISOString()
          };
          return { ...(old ?? {}), data: [optimisticRun, ...oldRuns] };
        });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.runs(projectId) });
    }
  });
}

export function useCancelAgentRun(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) =>
      api
        .post(`/api/v1/projects/${projectId}/runs/${runId}/cancel`)
        .catch(() => {
          mockSetRunStatus(projectId, runId, "CANCELLED");
          return { status: 200 };
        }),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.runs(projectId) });
      queryClient.invalidateQueries({
        queryKey: projectKeys.run(projectId, runId)
      });
    }
  });
}
