import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";  


// biome-ignore lint/style/noNonNullAssertion: needed for react
createRoot(document.getElementById("root")!).render(
  <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="dashboard-theme">

    <App />
        </ThemeProvider>

  </StrictMode>
);
