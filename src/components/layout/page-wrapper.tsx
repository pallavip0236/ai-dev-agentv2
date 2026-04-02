import { Navbar } from "./navbar";

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background mesh-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-12">{children}</main>
    </div>
  );
}
