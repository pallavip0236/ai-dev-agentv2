import { FolderKanban, Ticket, CheckCircle2, Plus } from "lucide-react";

const stats = [
  { icon: FolderKanban, label: "Total Projects", value: "12", ringColor: "from-yellow-500 to-orange-500", glowColor: "text-glow-orange" },
  { icon: Ticket, label: "Open Tickets", value: "54", ringColor: "from-pink-500 to-purple-500", glowColor: "text-glow-cyan" },
  { icon: CheckCircle2, label: "Closed Tickets", value: "120", ringColor: "from-blue-500 to-indigo-500", glowColor: "text-glow-purple" },
];

const StatCard = () => (
  <div className="flex items-center gap-4">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className={`glass-card px-5 py-3 flex items-center gap-4 shadow-[0_0_25px_hsla(25,90%,55%,0.3)]`}
      >
        <div className="relative">
          {/* Single-color spinning ring using gradient from Tailwind */}
          <div className={`w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-br ${stat.ringColor} animate-[spin-slow_4s_linear_infinite]`}>
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <stat.icon size={20} className={stat.glowColor} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          <p className="text-xl font-bold text-foreground">{stat.value}</p>
        </div>
      </div>
    ))}

    <button
      type="button"
      className="glass-card px-5 py-3 flex items-center gap-2 ml-auto cursor-pointer hover:border-primary/50 transition-colors h-[72px]"
    >
      <Plus size={18} className="text-muted-foreground" />
      <span className="text-[13px] font-medium text-foreground">Create Project</span>
    </button>
  </div>
);

export default StatCard;