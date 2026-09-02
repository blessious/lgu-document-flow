import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Workflow as WorkflowIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { workflows } from "@/data/mock";
import { officeCode, officeName } from "@/services/api";

export const Route = createFileRoute("/_shell/workflows/")({
  head: () => ({
    meta: [
      { title: "Workflows — LGU DocTrack" },
      { name: "description", content: "Routing templates that define which office handles a document and how fast." },
      { property: "og:title", content: "Workflows — LGU DocTrack" },
      { property: "og:description", content: "Routing templates defining office sequence and service levels." },
    ],
  }),
  component: WorkflowsPage,
});

function WorkflowsPage() {
  return (
    <>
      <PageHeader
        title="Workflows"
        description="Reusable routing templates applied to documents at registration."
        actions={
          <Button asChild>
            <Link to="/workflows/builder">
              <Plus className="size-4" /> New workflow
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {workflows.map((w) => (
          <Card key={w.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <WorkflowIcon className="size-4 text-primary" aria-hidden /> {w.name}
                </CardTitle>
                <CardDescription>{w.description}</CardDescription>
              </div>
              <Badge variant={w.active ? "default" : "secondary"}>{w.active ? "Active" : "Draft"}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {w.steps.map((s, i) => (
                  <span key={s.id} className="flex items-center gap-1.5">
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium" title={officeName(s.officeId)}>
                      {officeCode(s.officeId)}
                    </span>
                    {i < w.steps.length - 1 ? <ArrowRight className="size-3 text-muted-foreground" aria-hidden /> : null}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{w.steps.length} steps · {w.documentsUsing} documents</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/workflows/builder">Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
