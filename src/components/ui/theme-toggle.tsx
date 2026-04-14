"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>

<DropdownMenuContent
  align="end"
  className="
    bg-[#0f1730]
    border border-white/10
    shadow-xl
    rounded-md
    text-white
  "
>
  <DropdownMenuItem
    className="hover:bg-cyan-500/20 cursor-pointer"
    onClick={() => setTheme("light")}
  >
    Light
  </DropdownMenuItem>

  <DropdownMenuItem
    className="hover:bg-cyan-500/20 cursor-pointer"
    onClick={() => setTheme("dark")}
  >
    Dark
  </DropdownMenuItem>

  <DropdownMenuItem
    className="hover:bg-cyan-500/20 cursor-pointer"
    onClick={() => setTheme("system")}
  >
    System
  </DropdownMenuItem>
</DropdownMenuContent>
    </DropdownMenu>
  );
}