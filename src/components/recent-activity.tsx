/** biome-ignore-all assist/source/organizeImports: icons imported separately for clarity */

import { ChevronRight,UserCheck,FileText,FolderPlus,CheckCircle} from "lucide-react";

const activities = [
  {
    id: "pay-102",
    date: "May 22",
    event: "Ticket PAY-102 assigned to John D.",
    project: "Payment API",
    status: "Assigned",
    icon: UserCheck,
    color: "text-blue-400",
  },
  {
    id: "auth-210",
    date: "May 21",
    event: "Ticket AUTH-210 created",
    project: "Authentication",
    status: "Open",
    icon: FileText,
    color: "text-cyan-400",
  },
  {
    id: "notification-service",
    date: "May 20",
    event: 'New project "Notification Service" created',
    project: "Notification Service",
    status: "Created",
    icon: FolderPlus,
    color: "text-green-400",
  },
  {
    id: "ord-150",
    date: "May 20",
    event: "Ticket ORD-150 closed",
    project: "Order Service",
    status: "Closed",
    icon: CheckCircle,
    color: "text-emerald-400",
  },
];

const RecentActivity = () => (
  <div className="glass-card p-5">

    <h2 className="text-[14px] font-semibold text-foreground mb-4">
      Recent Activity
    </h2>

    <div className="grid grid-cols-[70px_1fr_75px] gap-2 text-[11px] text-muted-foreground font-medium px-3 pb-2 border-b border-border/30">
      <span>Date</span>
      <span>Event</span>
      <span>Status</span>
    </div>

    <div className="divide-y divide-border/20">
      {activities.map((a) => (
        <div
          key={a.id}
          className="grid grid-cols-[70px_1fr_75px] gap-2 items-start px-3 py-3 hover:bg-secondary/30 transition-colors rounded"
        >


          <span className="text-[11px] text-muted-foreground">
            {a.date}
          </span>

          <div>
            <p className="text-[12px] text-foreground leading-snug">
              {a.event}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {a.project}
            </p>
          </div>

          <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-white/10 w-fit">
            <a.icon size={11} className={a.color} />
            {a.status}
          </span>

        </div>
      ))}
    </div>

    <button type="button" className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground mt-3 transition-colors">
      View All Activity <ChevronRight size={12} />
    </button>

  </div>
);

export default RecentActivity;