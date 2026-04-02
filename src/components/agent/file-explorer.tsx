import {
  ChevronDown,
  ChevronRight,
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen
} from "lucide-react";

type FileTreeNode = {
  path: string;
  name: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
};
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  const iconClass = "w-3.5 h-3.5 flex-shrink-0";

  if (["ts", "tsx", "js", "jsx"].includes(ext ?? ""))
    return <FileCode className={cn(iconClass, "text-cyan")} />;
  if (ext === "json")
    return <FileJson className={cn(iconClass, "text-amber-400")} />;
  if (["md", "txt"].includes(ext ?? ""))
    return <FileText className={cn(iconClass, "text-muted-foreground")} />;
  if (["css", "scss"].includes(ext ?? ""))
    return <FileCode className={cn(iconClass, "text-violet")} />;
  if (ext === "html")
    return <FileCode className={cn(iconClass, "text-orange-400")} />;
  return <File className={cn(iconClass, "text-muted-foreground")} />;
};

interface FileNodeProps {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

function FileNode({ node, depth, selectedPath, onSelect }: FileNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const isSelected = selectedPath === node.path;
  const isDir = node.type === "directory";

  return (
    <div>
      <Button
        className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer group transition-colors",
          isSelected
            ? "bg-cyan/10 text-cyan"
            : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isDir) {
            setExpanded((v) => !v);
          } else {
            onSelect(node.path);
          }
        }}
      >
        {isDir ? (
          <>
            <span className="w-3 h-3 flex-shrink-0">
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
            {expanded ? (
              <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 h-3 flex-shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="text-xs font-mono truncate">{node.name}</span>
      </Button>

      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileExplorerProps {
  nodes: FileTreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function FileExplorer({
  nodes,
  selectedPath,
  onSelect
}: FileExplorerProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 px-4 text-center">
        <p className="text-xs text-muted-foreground">No files yet</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {nodes.map((node) => (
        <FileNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
