import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { documentTypes, workflows } from "@/data/mock";

export const Route = createFileRoute("/_shell/references")({
  head: () => ({
    meta: [
      { title: "Reference data — LGU DocTrack" },
      { name: "description", content: "Document types, priorities, retention periods and other master lists." },
      { property: "og:title", content: "Reference data — LGU DocTrack" },
      { property: "og:description", content: "Document types, priorities and retention master lists." },
    ],
  }),
  component: ReferencesPage,
});

const PRIORITIES = [
  { name: "Routine", sla: "72 hours", color: "Neutral" },
  { name: "Urgent", sla: "24 hours", color: "Amber" },
  { name: "Rush", sla: "8 hours", color: "Red" },
];

const ACTIONS = ["Registered", "Dispatched", "Received", "Processed", "Held", "Returned", "Completed", "Filed", "Wrong office"];

function ReferencesPage() {
  return (
    <>
      <PageHeader
        title="Reference data"
        description="Master lists that drive dropdowns, service levels and retention across the system."
        actions={
          <Button onClick={() => toast.success("Reference entry added (mock).")}>
            <Plus className="size-4" /> Add entry
          </Button>
        }
      />

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Document types</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="actions">Tracking actions</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Default workflow</TableHead>
                    <TableHead>Retention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell><Badge variant="secondary">{t.code}</Badge></TableCell>
                      <TableCell className="text-sm font-medium">{t.name}</TableCell>
                      <TableCell className="text-sm">{workflows.find((w) => w.id === t.defaultWorkflowId)?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{t.retentionYears} years</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities">
          <div className="grid gap-4 sm:grid-cols-3">
            {PRIORITIES.map((p) => (
              <Card key={p.name}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription>Target turnaround {p.sla}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Badge colour: {p.color}</CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custody actions</CardTitle>
              <CardDescription>Fixed vocabulary recorded on every tracking event.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
