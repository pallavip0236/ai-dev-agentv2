import { ChevronRight, Plus, Settings } from "lucide-react";

const activeProjects = [
  { name: "Payment API", team: "DevOps Team", color: "from-yellow-500 to-orange-500" },
  { name: "Order Service", team: "Backend Team", color: "from-pink-500 to-purple-500" },
  { name: "Authentication", team: "Security Team", color: "from-blue-500 to-indigo-500" },
  { name: "User Management", team: "Frontend Team", color: "from-green-500 to-emerald-500" }
];

const bottomProjects = [
  { name: "Payment API", team: "DevOps Team" },
  { name: "Trusted Team", team: "Frontend Team" }
];

const ActiveProjects = () => {
  return (
    <div className="glass-card flex flex-col">

      <h2 className="text-[14px] font-semibold mb-4" style={{ color: "var(--foreground)" }}>
        Active Projects
      </h2>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col space-y-4">

        <div className="space-y-3">
          {activeProjects.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-3 hover:bg-white/10 transition"
            >
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {p.name}
                </p>

                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  ⚙ {p.team}
                </p>
              </div>

              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shadow`}>
                <Settings size={16} className="text-white" />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-lg py-2 hover:bg-white/10 transition text-[12px]"
          style={{ color: "var(--foreground)" }}
        >
          <Plus size={14} />
          View All Projects
        </button>

        <div className="pt-4 border-t border-white/10">

          <h3 className="text-[13px] font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            Active Projects
          </h3>

          <div className="space-y-2">
            {bottomProjects.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span style={{ color: "var(--foreground)" }}>{p.name}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{p.team}</span>
                </div>
                <button type="button" className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[11px]" style={{ color: "var(--foreground)" }}>
                  View Ticket
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="flex items-center gap-1 text-[11px] mt-3" style={{ color: "var(--muted-foreground)" }}>
            + View All Tickets
            <ChevronRight size={12} />
          </button>

        </div>

      </div>
    </div>
  );
};

export default ActiveProjects;