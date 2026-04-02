
import { LogOut, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { useSignout } from "@/hooks/use-auth";

export function Navbar() {
  const { data: user } = useSession();

 const{mutate: signout,isPending} = useSignout();
 
  const initials = user?.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">
            Forge
          </span>
        </div>

        {/* user menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2.5 rounded-full pl-2 pr-1 py-1 hover:bg-secondary/60 transition-colors outline-none">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.name}
              </span>
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-cyan/10 text-cyan text-xs font-medium border border-cyan/20">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 glass border-glass-border"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground text-sm">
                  {user?.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={() => signout()}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
