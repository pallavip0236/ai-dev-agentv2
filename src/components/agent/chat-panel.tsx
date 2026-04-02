import { useForm } from "@tanstack/react-form";
import { ArrowUp, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAgentRunSocket } from "@/hooks/use-agent-run-socket";
import { useAgentRuns, useCreateAgentRun } from "@/hooks/use-projects";

const promptSchema = z.object({
  prompt: z.string().min(1).max(10000)
});

interface ChatPanelProps {
  projectId: string;
  activeRunId: string | null;
  onRunCreated: (runId: string) => void;
  onRunSelect: (runId: string) => void;
}

export function ChatPanel({
  projectId,
  activeRunId,
  onRunCreated,
  onRunSelect
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: runsData, isLoading } = useAgentRuns(projectId);
  const createRun = useCreateAgentRun(projectId);

  const runs = runsData?.data ?? [];

  const sortedRuns = useMemo(() => {
    return [...runs].sort(
      (a: any, b: any) =>
        new Date(a.createdAt ?? 0).getTime() -
        new Date(b.createdAt ?? 0).getTime()
    );
  }, [runs]);

  const activeRun = runs.find((r: any) => r.id === activeRunId);

  const isActiveRunBusy =
    activeRun?.status === "PENDING" || activeRun?.status === "RUNNING";

  const { textChunks } = useAgentRunSocket({
    projectId,
    runId: activeRunId ?? "",
    initialStatus: activeRun?.status ?? "PENDING",
    enabled: Boolean(activeRunId)
  });

  const form = useForm({
    defaultValues: { prompt: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = promptSchema.safeParse(value);
        if (!result.success)
          return result.error.issues[0]?.message ?? "Invalid input";
        return undefined;
      }
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await createRun.mutateAsync({ prompt: value.prompt });

        if (res?.status === 400) {
          toast.error("A run is already in progress for this project");
          return;
        }

        const createdRunId =
          (res as any)?.body?.id ??
          (res as any)?.body?.runId ??
          (res as any)?.body?.planningRunId ??
          (res as any)?.body?.run?.id ??
          (res as any)?.data?.id ??
          (res as any)?.data?.runId ??
          (res as any)?.data?.planningRunId ??
          (res as any)?.data?.run?.id ??
          (res as any)?.data?.body?.id;

        if (!createdRunId) {
          toast.error("Run started but id was not returned");
          return;
        }

        form.reset();
        localStorage.setItem("lastRunId", String(createdRunId));
        localStorage.setItem("lastProjectId", projectId);
        onRunCreated(createdRunId);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to start run"
        );
      }
    }
  });

  const textLength = Array.isArray(textChunks)
    ? textChunks.length
    : typeof textChunks === "string"
    ? textChunks.length
    : 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedRuns.length, textLength]);

  return (
    <div className="flex flex-col h-full rounded-[28px] border border-white/10 
    bg-gradient-to-b from-[#0b1220] to-[#020617] 
    shadow-[0_0_40px_rgba(34,211,238,0.15)] 
    overflow-hidden backdrop-blur-xl">

      {/* HEADER */}
      <div className="flex flex-col gap-2 px-5 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-semibold text-white">Chat Workspace</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-300">
          <span>{projectId ? `Project: ${projectId}` : "No project selected"}</span>
          <span className="text-gray-500">|</span>
          <span>{activeRunId ? `Run: ${activeRunId}` : "No run selected"}</span>
          <span className="text-gray-500">|</span>
          <span>{sortedRuns.length} message threads</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : (
          sortedRuns.map((run: any) => {
            const isActive = run.id === activeRunId;
            const prompt = String(run.prompt ?? "");

            let assistantText = "";

            if (isActive) {
              if (Array.isArray(textChunks)) {
                assistantText = textChunks.join("");
              } else if (typeof textChunks === "string") {
                assistantText = textChunks;
              }
            } else {
              assistantText = String(
                run.textChunks ?? run.output ?? run.response ?? ""
              );
            }

            const isTyping = isActive && isActiveRunBusy && !assistantText;

            const time = new Date(
              run.createdAt || Date.now()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                key={run.id}
                className="space-y-3"
                onClick={() => onRunSelect(run.id)}
              >
                {(assistantText || isTyping) && (
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs shadow-md">
                      🤖
                    </div>

                    <div className="max-w-[75%] px-4 py-3 rounded-2xl 
                    bg-gradient-to-br from-white/10 to-white/5 
                    border border-white/10 backdrop-blur-sm shadow-md text-sm text-white">

                      {isTyping ? (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">
                          {assistantText}
                        </span>
                      )}

                      <div className="text-[10px] text-gray-400 mt-1 text-right">
                        {time}
                      </div>
                    </div>
                  </div>
                )}

                {prompt && (
                  <div className="flex items-end justify-end gap-2">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl 
                    bg-gradient-to-r from-cyan-400 to-blue-500 
                    text-white shadow-lg text-sm">

                      <span className="whitespace-pre-wrap">{prompt}</span>

                      <div className="text-[10px] text-white/70 mt-1 text-right">
                        {time}
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-white">
                      👤
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="prompt">
            {(field) => (
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isActiveRunBusy) {
                      e.preventDefault();
                      form.handleSubmit();
                    }
                  }}
                  placeholder={
                    isActiveRunBusy
                      ? "Agent is typing..."
                      : "Message the agent..."
                  }
                  disabled={isActiveRunBusy}
                  rows={2}
                  className="w-full bg-transparent px-4 py-3 pr-14 text-sm text-white 
                  placeholder:text-gray-400 outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={isActiveRunBusy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl 
                  bg-gradient-to-r from-cyan-400 to-blue-500 
                  text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
                >
                  {isActiveRunBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </form.Field>
        </form>
      </div>
    </div>
  );
}