import { useForm } from "@tanstack/react-form";
import { formatDistanceToNow } from "date-fns";
import { FolderGit2, Loader2, Plus} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateProject,
  useProjects
} from "@/hooks/use-projects";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(250, "Description is too long")
});

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useProjects();
  const createProject = useCreateProject();


  const form = useForm({
    defaultValues: { name: "", description: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = createProjectSchema.safeParse(value);
        if (!result.success)
          return result.error.issues[0]?.message ?? "Invalid input";
        return undefined;
      }
    },
    onSubmit: async ({ value }) => {
      try {
        const projectName = value.name.trim();
        const projectDescription = value.description.trim();
        const res = await createProject.mutateAsync({
          name: projectName,
          description: projectDescription
        });
        const anyRes = res as any;
        const createdId =
          anyRes?.body?.id ??
          anyRes?.id ??
          anyRes?.data?.id ??
          anyRes?.data?.body?.id ??
          anyRes?.data?.project?.id ??
          anyRes?.data?.projectId ??
          anyRes?.data?.projectID ??
          anyRes?.data?.result?.id ??
          anyRes?.data?.data?.id;

        const createdIdIsPrimitive =
          typeof createdId === "string" || typeof createdId === "number";

        let resolvedId: string | number | null = createdIdIsPrimitive ? createdId : null;

        // If backend exists, try to resolve the id by name via GET /projects.
        try {
          const listRes = await api.get("/api/v1/projects", { params: { page: 1, limit: 100 } });
          const list = Array.isArray(listRes.data?.data)
            ? listRes.data.data
            : Array.isArray(listRes.data)
              ? listRes.data
              : [];

          const match = list.find(
            (p: any) =>
              String(p?.name ?? "").trim().toLowerCase() === projectName.toLowerCase()
          );
          if (match?.id) resolvedId = match.id;
        } catch {
          // No backend (UI-only mode) — fall back to createdId from POST.
        }

        if (resolvedId === undefined || resolvedId === null || String(resolvedId).trim() === "") {
          toast.error("Project created, but navigation id could not be resolved.");
          return;
        }

        toast.success("Project created");
        setOpen(false);
        form.reset();
        navigate(`/dashboard/projects/${resolvedId}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create project");
      }
    }
  });



  const projects = data?.data ?? [];

  return (
    <PageWrapper>
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading
              ? "Loading..."
              : `${data?.total ?? 0} project${(data?.total ?? 0) !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-cyan text-background hover:bg-cyan/90 gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          New project
        </Button>
      </div>

      {/* project grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <Skeleton key={key} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-4">
            <FolderGit2 className="w-6 h-6 text-cyan" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            No projects yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Create your first project and let Forge build it for you.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="bg-cyan text-background hover:bg-cyan/90 gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            New project
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence>
            {projects.map((project: any, i: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                className="glass rounded-xl p-5 cursor-pointer group hover:border-cyan/30 hover:glow-cyan transition-all duration-200"
              >
                {/* project icon + name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
                    <FolderGit2 className="w-4 h-4 text-cyan" />
                  </div>
                </div>

                {/* name */}
                <h3 className="font-medium text-foreground text-sm mb-1 truncate">
                  {project.name}
                </h3>
                {project.description ? (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                ) : project.repoOwner && project.repoName ? (
                  <p className="text-xs text-muted-foreground font-mono truncate mb-3">
                    {project.repoOwner}/{project.repoName}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">
                    Standalone project
                  </p>
                )}

                {/* footer */}
                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true
                  })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* create project dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) form.reset();
        }}
      >
        <DialogContent className="glass border-glass-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Create project
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Give your project a name and a short description. You can connect a GitHub repo later.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4 mt-2"
          >
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor="project-name"
                      className="text-sm text-muted-foreground"
                    >
                      Project name
                    </FieldLabel>
                    <Input
                      id="project-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="my-awesome-app"
                      className="bg-input/50 border-border/50 focus:border-cyan/50 focus:ring-cyan/20"
                      autoFocus
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor="project-description"
                      className="text-sm text-muted-foreground"
                    >
                      Project description
                    </FieldLabel>
                    <Input
                      id="project-description"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="A short summary of your project"
                      className="bg-input/50 border-border/50 focus:border-cyan/50 focus:ring-cyan/20"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-cyan text-background hover:bg-cyan/90 font-medium gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create project"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
