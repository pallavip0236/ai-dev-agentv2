import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

const getLanguage = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase();
  const languages: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    txt: "plaintext",
    yaml: "yaml",
    yml: "yaml",
    sh: "shell",
    env: "plaintext"
  };
  return languages[ext ?? ""] ?? "plaintext";
};

interface CodeViewerProps {
  path: string;
  content: string;
  isLoading?: boolean;
}

export function CodeViewer({ path, content, isLoading }: CodeViewerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={getLanguage(path)}
      value={content}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontLigatures: true,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "none",
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6
        }
      }}
    />
  );
}
