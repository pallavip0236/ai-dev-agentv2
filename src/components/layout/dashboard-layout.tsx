// biome-ignore assist/source/organizeImports: keep imports order
import Sidebar from "../sidebar";
import Header from "../header";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </main>
      </div>
    </div>
  );
}