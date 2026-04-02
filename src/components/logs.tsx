export default function Logs() {
  const logs = [
    { id: "1", time: "14:32:05", agent: "Coding Agent 01", level: "info", message: "Commit pushed to feature/ux-fixes" },
    { id: "2", time: "14:30:12", agent: "Testing Agent 03", level: "warn", message: "3 flaky tests detected in regression suite" },
    { id: "3", time: "14:28:45", agent: "Security Agent", level: "error", message: "Critical vulnerability found in dependency lodash@4.17.15" },
    { id: "4", time: "14:25:00", agent: "DevOps Agent 02", level: "info", message: "Production deployment #45 completed successfully" },
    { id: "5", time: "14:22:33", agent: "Infra Agent", level: "warn", message: "CPU usage on node-07 exceeded 80% threshold" },
    { id: "6", time: "14:20:10", agent: "Monitoring Agent", level: "info", message: "Incident #1042 auto-resolved after 12 minutes" },
    { id: "7", time: "14:18:00", agent: "Architecture Agent", level: "info", message: "ADR-019 approved: migrate to event-driven architecture" },
    { id: "8", time: "14:15:22", agent: "Performance Agent", level: "info", message: "Benchmark report generated for API v2 endpoints" },
  ];

  const levelColors: Record<string, string> = {
    info: "text-primary",
    warn: "text-warning",
    error: "text-destructive",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-card-foreground">System Logs</h2>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Time</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Agent</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Level</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.time}</td>
                  <td className="px-4 py-3 text-card-foreground font-medium">{log.agent}</td>
                  <td className="px-4 py-3">
                    <span className={`uppercase text-xs font-bold ${levelColors[log.level]}`}>{log.level}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
