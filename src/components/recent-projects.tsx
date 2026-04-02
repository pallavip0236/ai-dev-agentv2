import { MoreHorizontal, ChevronRight } from "lucide-react";

const projects = [
  { name: "Payment API", key: "PAY", lead: "DevOps", status: "Active" },
  { name: "Order Service", key: "ORD", lead: "Backend", status: "Active" },
  { name: "Authentication", key: "AUTH", lead: "Security", status: "Active" },
  { name: "User Management", key: "USR", lead: "Frontend Team", status: "Active" },
  { name: "Notification Service", key: "NOTIFY", lead: "Support", status: "Active" },
];

const RecentProjects = () => (
  <div className="glass-card p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[14px] font-semibold text-foreground">Recent Projects</h2>
      <button type="button" className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
    </div>

    <div className="grid grid-cols-[1fr_60px_80px_55px] gap-2 text-[11px] text-muted-foreground font-medium px-3 pb-2 border-b border-border/30">
      <span>Project Name</span>
      <span>Key</span>
      <span>Lead</span>
      <span>Status</span>
    </div>

    <div className="divide-y divide-border/20">
      {projects.map((p) => (
        <div key={p.key} className="grid grid-cols-[1fr_60px_80px_55px] gap-2 items-center px-3 py-2.5 hover:bg-secondary/30 transition-colors rounded">
          <span className="text-[12px] font-medium text-foreground truncate">{p.name}</span>
          <span className="text-[11px] text-glow-cyan font-mono">{p.key}</span>
          <span className="text-[11px] text-muted-foreground">{p.lead}</span>
          <span className="text-[10px] font-medium text-glow-green">{p.status}</span>
        </div>
      ))}
    </div>

    <button type="button" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground mt-3 transition-colors">
      View All Activity <ChevronRight size={12} />
    </button>
  </div>
);

export default RecentProjects;