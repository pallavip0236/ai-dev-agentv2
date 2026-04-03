import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Ticket,
  Activity,
  FileText,
  Settings,
  LogOut,
  Cpu,
  // Link2
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: FolderKanban, label: "Projects", to: "/dashboard/projects" },
  {
    icon: PlusCircle,
    label: "Create Project",
    to: "/dashboard/projects"
  },
  { icon: Ticket, label: "Tickets" },
  { icon: Activity, label: "Activity" },
  // { icon: Link2, label: "Jira", to: "/dashboard/jira" },

  // ✅ ADDED THIS
  { icon: FileText, label: "Logs", to: "/dashboard/logs" },

  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signout = useMutation({
    mutationFn: () => api.post("/api/v1/auth/signout", {}),
    onSuccess: async () => {
      localStorage.removeItem("auth");
      queryClient.clear();
      queryClient.removeQueries({ queryKey: ["session"] });
      navigate("/auth/signin", { replace: true });
      toast.success("Signed out successfully");
    },
    onError: async () => {
      localStorage.removeItem("auth");
      queryClient.clear();
      queryClient.removeQueries({ queryKey: ["session"] });
      navigate("/auth/signin", { replace: true });
      toast.error("Sign out failed (try again)");
    }
  });

  return (
    <aside className="w-56 h-screen flex flex-col bg-[#0f172a] border-r border-white/10">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <Cpu size={18} className="text-white" />
        </div>
        <span className="font-semibold text-white text-[15px]">
          AI Dashboard
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setActiveItem(item.label);
                if (item.to) navigate(item.to);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition ${
                isActive
                  ? "bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-xs font-bold text-black">
            AD
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">Admin</p>
            <p className="text-[11px] text-gray-400">Administrator</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signout.mutate()}
          disabled={signout.isPending}
          className="w-full flex items-center justify-center gap-2 mt-3 px-3 py-2 rounded-lg
          bg-red-500/10 text-red-400 border border-red-500/20
          hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30
          transition-all duration-200 text-[13px] font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;