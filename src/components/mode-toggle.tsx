import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../components/theme-provider";   // <-- correct path (adjust if needed)

export default function ModeToggle() {
  const { setTheme } = useTheme();   // no need to destructure theme if not used
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-gray-200 dark:border-white/10 
        bg-white dark:bg-[#020817] text-gray-700 dark:text-gray-300 
        hover:text-black dark:hover:text-white transition"
      >
        <Sun size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg 
        bg-white dark:bg-[#020817] border border-gray-200 dark:border-white/10 shadow-lg">

          <button
            type="button"
            onClick={() => { setTheme("light"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#0b1220]"
          >
            <Sun size={16} />
            Light
          </button>

          <button
            type="button"
            onClick={() => { setTheme("dark"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#0b1220]"
          >
            <Moon size={16} />
            Dark
          </button>

          <button
            type="button"
            onClick={() => { setTheme("system"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#0b1220]"
          >
            <Monitor size={16} />
            System
          </button>

        </div>
      )}
    </div>
  );
}