import { ChevronRight } from "lucide-react";

const tickets = [
  { id: "PAY-102", title: "Payment Failure", priority: "High", priorityColor: "text-destructive", status: "Open", statusColor: "text-glow-cyan" },
  { id: "ORD-130", title: "Order Processing", priority: "Medium", priorityColor: "text-glow-yellow", status: "Closed", statusColor: "text-glow-green" },
  { id: "AUTH-110", title: "Login Timeout Issue", priority: "Open", priorityColor: "text-glow-cyan", status: "Open", statusColor: "text-glow-cyan" },
  { id: "PAY-101", title: "Payment Endpoint", priority: "Bug", priorityColor: "text-destructive", status: "In Progress", statusColor: "text-glow-orange" },
  { id: "USR-199", title: "User Profile Sync", priority: "High", priorityColor: "text-destructive", status: "Closed", statusColor: "text-glow-green" },
];

const RecentTickets = () => (
  <div className="glass-card p-5 flex flex-col">

    <h2 className="text-[14px] font-semibold text-foreground mb-4">
      Recent Tickets
    </h2>

    <div className="grid grid-cols-[70px_1fr_65px_75px] gap-2 text-[11px] text-muted-foreground font-medium pb-2 border-b border-border/30">
      <span>Ticket ID</span>
      <span>Title</span>
      <span>Priority</span>
      <span>Status</span>
    </div>

    <div className="divide-y divide-border/20 min-h-[210px]">
      {tickets.map((t) => (
        <div
          key={t.id}
          className="grid grid-cols-[70px_1fr_65px_75px] gap-2 items-center py-2.5 hover:bg-secondary/30 transition-colors rounded"
        >
          <span className="text-[11px] font-mono text-glow-blue">
            {t.id}
          </span>

          <span className="text-[12px] text-foreground truncate">
            {t.title}
          </span>

          <span className={`text-[10px] font-semibold ${t.priorityColor}`}>
            {t.priority}
          </span>

          <span className={`text-[10px] font-medium ${t.statusColor}`}>
            {t.status}
          </span>
        </div>
      ))}
    </div>

    <button type="button" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground mt-3 transition-colors">
      View All Tickets
      <ChevronRight size={12} />
    </button>

  </div>
);

export default RecentTickets;