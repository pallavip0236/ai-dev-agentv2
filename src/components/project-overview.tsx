import { ChevronRight } from "lucide-react";

const donutData = [
  { label: "Open", value: 12, color: "#22d3ee" },
  { label: "In Progress", value: 10, color: "#f59e0b" },
  { label: "Closed", value: 32, color: "#10b981" },
];

const total = donutData.reduce((sum, item) => sum + item.value, 0);

const ProjectOverview = () => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="glass-card p-5">
      <h2 className="text-[14px] font-semibold mb-4" style={{ color: "var(--foreground)" }}>
        Project Overview
      </h2>

      <div className="space-y-2 text-[12px] mb-4">
        <div className="flex justify-between">
          <span style={{ color: "var(--muted-foreground)" }}>Total Tickets</span>
          <span style={{ color: "var(--foreground)" }} className="font-semibold">54</span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: "var(--muted-foreground)" }}>Open Tickets</span>
          <span style={{ color: "#22d3ee" }} className="font-semibold">12</span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: "var(--muted-foreground)" }}>Closed Tickets</span>
          <span style={{ color: "#10b981" }} className="font-semibold">42</span>
        </div>
      </div>

      <div className="flex items-center gap-6">

        <div className="relative w-[140px] h-[140px]">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <title>Project ticket status distribution</title>
            {donutData.map((d, i) => {
              const offset = donutData
                .slice(0, i)
                .reduce((sum, item) => sum + (item.value / total) * circumference, 0);
              const dash = (d.value / total) * circumference;
              return (
                <circle
                  key={d.label}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="12"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${d.color})` }}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ color: "var(--foreground)" }} className="text-3xl font-bold">{total}</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-[150px] space-y-2">
          {donutData.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span style={{ color: "var(--muted-foreground)" }}>{d.label}</span>
              </div>
              <span style={{ color: "var(--foreground)" }} className="font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="flex items-center gap-1 text-[12px] mt-4 hover:text-white" style={{ color: "var(--muted-foreground)" }}>
        View All Tickets <ChevronRight size={12} />
      </button>
    </div>
  );
};

export default ProjectOverview;