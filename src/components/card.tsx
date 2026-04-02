import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Card({ children }: Props) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-5 shadow-lg backdrop-blur-md">
      {children}
    </div>
  );
}