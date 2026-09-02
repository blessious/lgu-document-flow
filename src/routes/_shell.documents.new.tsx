import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Printer, QrCode } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QrPlaceholder } from "@/components/common/QrPlaceholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { documentTypes, offices, workflows } from "@/data/mock";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import type { Priority, TrackedDocument } from "@/types";

export const Route = createFileRoute("/_shell/documents/new")({
  head: () => ({
    meta: [
      { title: "Register a document — LGU DocTrack" },
      { name: "description", content: "Capture document details, assign a routing workflow and print a QR routing slip." },
      { property: "og:title", content: "Register a document — LGU DocTrack" },
      { property: "og:description", content: "Capture document details and print a QR routing slip." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { registerDocument } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [created, setCreated] = useState<TrackedDocument | null>(null);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    typeId: "dt-1",
    priority: "routine" as Priority,
    originOfficeId: "off-records",
    nextOfficeId: "off-budget",
    workflowId: "wf-1",
    requester: "",
    pageCount: "1",
    remarks: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 3 && form.requester.trim().length > 1;

  if (created) {
    return (
      <>
        <PageHeader
          title="Document registered"
          description="Print the QR routing slip and attach it to the physical document before dispatching."
          actions={
            <Button variant="outline" asChild>
              <Link to="/documents">Back to registry</Link>
            </Button>
          }
        />
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-6" aria-hidden />
            </span>
            <CardTitle className="mt-3">{created.trackingCode}</CardTitle>
            <CardDescription>{created.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-6">
              <QrPlaceholder value={created.qrCode} size={160} />
              <p className="font-mono text-sm">{created.qrCode}</p>
              <p className="text-center text-xs text-muted-foreground">
                Routing slip · {officeName(created.originOfficeId)} → {officeName(created.nextOfficeId)}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => toast.success("Routing slip sent to the label printer (mock).")}>
                <Printer className="size-4" /> Print routing slip
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/documents/$docId", params: { docId: created.id } })}>
                Open document
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCreated(null);
                  setStep(1);
                }}
              >
                Register another
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Register document"
        description="Three quick steps: describe the document, choose its route, then generate the QR label."
        actions={
          <Button variant="outline" asChild>
            <Link to="/documents">
              <ArrowLeft className="size-4" /> Cancel
            </Link>
          </Button>
        }
      />

      <ol className="flex flex-wrap items-center gap-3 text-sm">
        {["Document details", "Routing", "QR label"].map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold " +
                (step > i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            <span className={step > i ? "font-medium" : "text-muted-foreground"}>{label}</span>
            {i < 2 ? <Separator className="w-8" /> : null}
          </li>
        ))}
      </ol>

      <Card className="max-w-3xl">
        <CardContent className="space-y-5 p-6">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Document title</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="DV — Fuel and lubricants, September 2026" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject / purpose</Label>
                <Textarea id="subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Document type</Label>
                  <Select value={form.typeId} onValueChange={(v) => set("typeId", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="rush">Rush</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requester">Requesting party</Label>
                  <Input id="requester" value={form.requester} onChange={(e) => set("requester", e.target.value)} placeholder="General Services Office" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pages">Page count</Label>
                  <Input id="pages" type="number" min={1} value={form.pageCount} onChange={(e) => set("pageCount", e.target.value)} />
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Originating office</Label>
                  <Select value={form.originOfficeId} onValueChange={(v) => set("originOfficeId", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {offices.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Next office</Label>
                  <Select value={form.nextOfficeId} onValueChange={(v) => set("nextOfficeId", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {offices.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Routing workflow</Label>
                <Select value={form.workflowId} onValueChange={(v) => set("workflowId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {workflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Preview route</p>
                <ol className="mt-3 space-y-2">
                  {(workflows.find((w) => w.id === form.workflowId)?.steps ?? []).map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3 text-sm">
                      <span className="flex size-6 items-center justify-center rounded-full bg-background text-xs ring-1 ring-border">{i + 1}</span>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">· {officeName(s.officeId)} · SLA {s.slaHours}h</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (optional)</Label>
                <Textarea id="remarks" rows={2} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <QrCode className="size-5 text-primary" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  A tracking code and QR reference will be generated on save. Print the slip and attach it to the
                  document.
                </p>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Title</dt><dd className="font-medium">{form.title || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Requester</dt><dd className="font-medium">{form.requester || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Origin</dt><dd className="font-medium">{officeName(form.originOfficeId)}</dd></div>
                <div><dt className="text-muted-foreground">Next office</dt><dd className="font-medium">{officeName(form.nextOfficeId)}</dd></div>
                <div><dt className="text-muted-foreground">Priority</dt><dd className="font-medium capitalize">{form.priority}</dd></div>
                <div><dt className="text-muted-foreground">Pages</dt><dd className="font-medium">{form.pageCount}</dd></div>
              </dl>
            </div>
          ) : null}

          <Separator />
          <div className="flex justify-between">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 1 && !valid) {
                    toast.error("Add a document title and requesting party first.");
                    return;
                  }
                  setStep((s) => s + 1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const doc = registerDocument({
                    ...form,
                    pageCount: Number(form.pageCount) || 1,
                    remarks: form.remarks || undefined,
                  });
                  setCreated(doc);
                  toast.success(`${doc.trackingCode} registered.`);
                }}
              >
                Register & generate QR
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
