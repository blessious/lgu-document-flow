import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { offices, workflows } from "@/data/mock";
import { officeName } from "@/services/api";
import type { WorkflowStep } from "@/types";

export const Route = createFileRoute("/_shell/workflows/builder")({
  head: () => ({
    meta: [
      { title: "Workflow builder — LGU DocTrack" },
      { name: "description", content: "Compose the office sequence, service levels and required steps of a routing workflow." },
      { property: "og:title", content: "Workflow builder — LGU DocTrack" },
      { property: "og:description", content: "Compose office sequence and service levels for a routing workflow." },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const base = workflows[0]!;
  const [name, setName] = useState(base.name);
  const [description, setDescription] = useState(base.description);
  const [active, setActive] = useState(true);
  const [steps, setSteps] = useState<WorkflowStep[]>(base.steps);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...steps];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    setSteps(next);
  };
  const update = (i: number, patch: Partial<WorkflowStep>) =>
    setSteps((s) => s.map((step, idx) => (idx === i ? { ...step, ...patch } : step)));

  return (
    <>
      <PageHeader
        title="Workflow builder"
        description="Define the sequence of offices, service levels and mandatory checkpoints."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/workflows">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            <Button onClick={() => toast.success("Workflow saved (mock).")}>
              <Save className="size-4" /> Save workflow
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Steps</CardTitle>
            <CardDescription>Documents move top to bottom. Reorder with the arrows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((s, i) => (
              <div key={s.id + i} className="rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`n-${i}`}>Step name</Label>
                      <Input id={`n-${i}`} value={s.name} onChange={(e) => update(i, { name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Responsible office</Label>
                      <Select value={s.officeId} onValueChange={(v) => update(i, { officeId: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {offices.map((o) => (
                            <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`s-${i}`}>SLA (hours)</Label>
                      <Input
                        id={`s-${i}`}
                        type="number"
                        min={1}
                        value={s.slaHours}
                        onChange={(e) => update(i, { slaHours: Number(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="flex items-end gap-3 pb-1">
                      <Switch id={`r-${i}`} checked={s.required} onCheckedChange={(v) => update(i, { required: v })} />
                      <Label htmlFor={`r-${i}`}>Required step</Label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" aria-label="Move up" onClick={() => move(i, -1)}>
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Move down" onClick={() => move(i, 1)}>
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove step"
                      onClick={() => setSteps((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setSteps((prev) => [
                  ...prev,
                  { id: `s${prev.length + 1}-${Date.now()}`, name: "New step", officeId: "off-records", slaHours: 24, required: true },
                ])
              }
            >
              <Plus className="size-4" /> Add step
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wname">Name</Label>
                <Input id="wname" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wdesc">Description</Label>
                <Textarea id="wdesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="wactive" checked={active} onCheckedChange={setActive} />
                <Label htmlFor="wactive">Active for new documents</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Route preview</CardTitle>
              <CardDescription>Total target turnaround: {steps.reduce((a, s) => a + s.slaHours, 0)} hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span className="truncate font-medium">{officeName(s.officeId)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{s.slaHours}h</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
