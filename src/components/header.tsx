import { Mail, Bell, User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header = () => (
  <header className="h-14 flex items-center justify-between px-6 border-b transition-colors">

    <h1 className="text-[15px] font-semibold">
      AI Project Automation Dashboard
    </h1>

    <div className="flex items-center gap-4">

      <ThemeToggle />

      <button
        type="button"
        className="hover:text-black dark:hover:text-white transition"
        style={{ color: "var(--foreground)" }}
      >
        <Mail size={18} />
      </button>

      <button
        type="button"
        className="relative hover:text-black dark:hover:text-white transition"
        style={{ color: "var(--foreground)" }}
      >
        <Bell size={18} />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div className="flex items-center gap-2 ml-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
          <User size={14} className="text-black" />
        </div>

        <span
          className="text-[13px] font-medium"
          style={{ color: "var(--foreground)" }}
        >
          Admin
        </span>
      </div>

    </div>
  </header>
);

export default Header;