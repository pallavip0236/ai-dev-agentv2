import { Bot } from "lucide-react";
import type { Agent } from "@/lib/data";

const statusMap: Record<Agent["status"], string> = {
  active: "bg-emerald-500/20 text-emerald-300",
  idle: "bg-slate-600/30 text-slate-300",
  running: "bg-cyan-500/20 text-cyan-300",
  scanning: "bg-amber-500/20 text-amber-300",
  deploying: "bg-violet-500/20 text-violet-300",
  monitoring: "bg-blue-500/20 text-blue-300",
  error: "bg-red-500/20 text-red-300"
};

const metricColorMap: Record<string, string> = {
  success: "text-emerald-300",
  warning: "text-amber-300",
  destructive: "text-red-300"
};

interface AgentCardProps {
  agent: Agent;
  onOpen: () => void;
}

export function AgentCard({ agent, onOpen }: AgentCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-xl border border-white/10 bg-[#0f1730] p-4 text-left hover:border-blue-500/50 transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-300" />
          <p className="font-semibold">{agent.name}</p>
        </div>
        <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${statusMap[agent.status]}`}>
          {agent.status}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3">Task: {agent.task}</p>

      <div className="grid grid-cols-2 gap-3">
        {agent.metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[11px] text-slate-400 uppercase">{metric.label}</p>
            <p className={`text-sm font-medium ${metric.color ? metricColorMap[metric.color] : "text-slate-100"}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">Active Tasks: {agent.activeTasks}</p>
    </button>
  );
}
