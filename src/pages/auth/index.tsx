import { motion } from "motion/react";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background mesh-bg flex items-center justify-center">
      {/* animated grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.75 0.18 200) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.75 0.18 200) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />

      {/* floating orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.22 290), transparent 70%)"
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.18 200), transparent 70%)"
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* logo */}
      <motion.div
        className="absolute top-8 left-8 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan to-violet flex items-center justify-center">
          <span className="text-background font-bold text-xs font-mono">F</span>
        </div>
        <span className="text-foreground font-semibold tracking-tight">
          Forge
        </span>
      </motion.div>

      <Outlet />
    </div>
  );
}
