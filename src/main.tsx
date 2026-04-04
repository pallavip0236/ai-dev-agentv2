import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import App from "./App.tsx";
import "./index.css";


// biome-ignore lint/style/noNonNullAssertion: needed for react
createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <ThemeProvider>

    <App />
</ThemeProvider>
  </StrictMode>
);
