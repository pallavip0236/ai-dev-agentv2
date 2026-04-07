"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFutureSprints } from "@/hooks/use-jira";
import { useStartCoding } from "@/hooks/use-projects";

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  isLoading?: boolean;
  action?: {
    type: "approve-planning" | "start-coding" | "review-sprint";
  };
};

type ChatPanelProps = {
  projectId: string;
  projectStatus: string;
  messages: Message[];
  onSend: (message: string) => void;
  onApprovePlanning: () => void;
  onStartCoding: () => void;
  onApproveSprint: () => void;
  onRejectSprint: (issueKey: string, feedback: string) => void;
  loading: boolean;
};

function StartCodingDialog({
  projectId,
  onSuccess,
}: {
  projectId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const { data: sprints, isLoading: sprintsLoading } =
    useFutureSprints(projectId);
  const { mutate: startCoding, isPending } = useStartCoding(projectId);

  const handleStart = () => {
    if (!selectedSprintId) return;

    startCoding(
      { sprintId: selectedSprintId },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedSprintId(null);
          onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="self-start bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Check size={14} className="mr-1" />
          Start Coding Sprint
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Start Coding Sprint
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Select a future sprint from your Jira board. The coding agent will
            implement all tickets in it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {sprintsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : !sprints || sprints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No future sprints found. Create one in Jira first.
            </p>
          ) : (
            sprints.map((sprint) => (
              <button
                key={sprint.id}
                type="button"
                onClick={() => setSelectedSprintId(sprint.id ?? null)}
                className={`flex flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-all ${
                  selectedSprintId === sprint.id
                    ? "border-blue-500 bg-blue-50 text-slate-900"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span className="text-sm font-semibold text-slate-900">
                  {sprint.name}
                </span>

                {sprint.goal && (
                  <span className="text-xs text-slate-500">
                    {sprint.goal}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={!selectedSprintId || isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Start Coding"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChatPanel({
  projectId,
  projectStatus,
  messages,
  onSend,
  onApprovePlanning,
  onStartCoding,
  onApproveSprint,
  onRejectSprint,
  loading,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [issueKey, setIssueKey] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleReject = () => {
    if (!issueKey.trim() || !feedback.trim()) return;
    onRejectSprint(issueKey.trim().toUpperCase(), feedback.trim());
    setIssueKey("");
    setFeedback("");
    setShowRejectBox(false);
  };

  const inputDisabled =
    loading ||
    projectStatus === "PLANNING" ||
    projectStatus === "PLANNED" ||
    projectStatus === "CODING" ||
    projectStatus === "SPRINT_REVIEW";

  const placeholder =
    projectStatus === "PLANNED"
      ? "Approve the plan above or start the next sprint..."
      : projectStatus === "SPRINT_REVIEW"
      ? "Review the sprint above and approve or reject..."
      : projectStatus === "PLANNING" || projectStatus === "CODING"
      ? "Agent is working..."
      : "Describe your requirement...";

  return (
    <div className="flex flex-col h-screen bg-[#0b1120] text-white">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Bot className="text-blue-400" size={20} />
        <h2 className="font-semibold text-lg">Jira AI Agent</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col gap-2 max-w-[75%]">
              <div
                className={`px-4 py-3 rounded-xl text-sm flex items-start gap-2 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-[#1e293b] border border-white/10"
                }`}
              >
                {msg.role === "agent" && (
                  <Bot size={16} className="text-blue-400 mt-0.5" />
                )}

                <div className="flex-1">
                  {msg.isLoading ? (
                    <span className="flex items-center gap-2 opacity-70">
                      <Loader2 className="animate-spin" size={14} />
                      Working on it...
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>

              {msg.action?.type === "approve-planning" &&
                projectStatus === "PLANNED" && (
                  <Button
                    size="sm"
                    onClick={onApprovePlanning}
                    className="self-start bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check size={14} className="mr-1" />
                    Approve Planning
                  </Button>
                )}

              {msg.action?.type === "start-coding" &&
                projectStatus === "PLANNED" && (
                  <StartCodingDialog
                    projectId={projectId}
                    onSuccess={onStartCoding}
                  />
                )}

              {msg.action?.type === "review-sprint" &&
                projectStatus === "SPRINT_REVIEW" && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={onApproveSprint}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check size={14} className="mr-1" />
                        Approve Sprint
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setShowRejectBox(true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <X size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>

                    {showRejectBox && (
                      <div className="flex flex-col gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Issue key (e.g. SCRUM-5)"
                          className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={issueKey}
                          onChange={(e) => setIssueKey(e.target.value)}
                        />
                        <textarea
                          placeholder="Enter feedback..."
                          className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />

                        <Button
                          size="sm"
                          onClick={handleReject}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Submit Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2 bg-[#0b1120]">
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={inputDisabled}
        />

        <Button
          onClick={handleSend}
          disabled={inputDisabled || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Send size={16} />
          )}
        </Button>
      </div>
    </div>
  );
}
