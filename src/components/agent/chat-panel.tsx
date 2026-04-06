"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";


export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  isLoading?: boolean;
  action?: {
    type: "approve_planning" | "review_sprint";
  };
};

/* ================= PROPS ================= */

type ChatPanelProps = {
  messages: Message[];
  onSend: (message: string) => void;
  onApprovePlanning: () => void;
  onApproveSprint: () => void;
  onRejectSprint: (issueKey: string, feedback: string) => void;
  loading: boolean;
};

/* ================= COMPONENT ================= */

export function ChatPanel({
  messages,
  onSend,
  onApprovePlanning,
  onApproveSprint,
  onRejectSprint,
  loading,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [issueKey, setIssueKey] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <div className="flex flex-col h-full bg-[#0b1120] text-white">
      {/* ================= HEADER ================= */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Bot className="text-blue-400" size={20} />
        <h2 className="font-semibold text-lg">Jira AI Agent</h2>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col gap-2 max-w-[75%]">
              {/* Message Bubble */}
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

              {/* ================= ACTION BUTTONS ================= */}

              {/* Approve Planning */}
              {msg.action?.type === "approve_planning" && (
                <Button
                  size="sm"
                  onClick={onApprovePlanning}
                  className="self-start bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check size={14} className="mr-1" />
                  Approve Planning
                </Button>
              )}

              {/* Review Sprint (Approve / Reject) */}
              {msg.action?.type === "review_sprint" && (
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

                  {/* Feedback box */}
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

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          type="text"
          placeholder="Describe your requirement..."
          className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />

        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
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