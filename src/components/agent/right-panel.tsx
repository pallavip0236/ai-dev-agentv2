import { Code2, Eye, FolderTree, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useFileContent, useFileTree } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CodeViewer } from "./code-viewer";
import { FileExplorer } from "./file-explorer";

type RightPanelTab = "files" | "preview";

interface RightPanelProps {
  projectId: string;
  hasRuns: boolean;
  isRunning: boolean;
}

export function RightPanel({ projectId, hasRuns, isRunning }: RightPanelProps) {
  const [tab, setTab] = useState<RightPanelTab>("files");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const { data: fileTree, isLoading: treeLoading } = useFileTree(
    projectId,
    hasRuns && !isRunning
  );

  const { data: fileContent, isLoading: contentLoading } = useFileContent(
    projectId,
    selectedFilePath ?? ""
  );

  // Welcome state
  if (!hasRuns) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-cyan/10 border flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-cyan" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-2">
          Ready to build
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Describe what you want to build in the chat. Forge will write the
          code, install dependencies, and show you the result here.
        </p>
      </div>
    );
  }

  // Running state
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="space-y-2 w-64">
          {Array.from({ length: 8 }, (_, i) => `line-${i}`).map((key, i) => (
            <div
              key={key}
              className="h-3 rounded-full bg-secondary/60 animate-pulse"
              style={{
                width: `${60 + Math.sin(i * 1.5) * 30}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Loader2 className="w-4 h-4 animate-spin text-cyan" />
          <span className="text-sm text-cyan font-mono">
            Agent is writing code...
          </span>
        </div>
      </div>
    );
  }

  // Files + Preview state
  return (
    <div className="flex flex-col h-full border-4 border-red-500">
      {/* tab bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 flex-shrink-0 border-4 border-green-500">
        <Button
          onClick={() => setTab("files")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            tab === "files"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code
        </Button>
        <Button
          onClick={() => setTab("preview")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            tab === "preview"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </Button>
      </div>

      {tab === "files" && (
        <div className="flex flex-1 min-h-0">
          {/* file tree sidebar */}
          <div className="w-52 flex-shrink-0 border-r border-border/50 overflow-y-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30">
              <FolderTree className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                explorer
              </span>
            </div>
            {treeLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <FileExplorer
                nodes={fileTree ?? []}
                selectedPath={selectedFilePath}
                onSelect={setSelectedFilePath}
              />
            )}
          </div>

          {/* code viewer */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {selectedFilePath ? (
              <CodeViewer
                path={selectedFilePath}
                content={fileContent?.content ?? ""}
                isLoading={contentLoading}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  Select a file to view
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "preview" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Live preview coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
