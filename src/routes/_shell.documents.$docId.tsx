import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, FolderArchive, PauseCircle, Printer, Send, Undo2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QrPlaceholder } from "@/components/common/QrPlaceholder";
import { Timeline } from "@/components/common/Timeline";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { offices } from "@/data/mock";
import { docTypeName, officeName, userName, workflowById } from "@/services/api";
import { formatDateTime } from "@/lib/format";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/_shell/documents/$docId")({
  head: () => ({
    meta: [
      { title: "Document details — LGU DocTrack" },
      { name: "description", content: "Custody timeline, workflow progress and routing actions for a tracked document." },
      { property: "og:title", content: "Document details — LGU DocTrack" },
      { property: "og:description", content: "Custody timeline, workflow progress and routing actions." },
    ],
  }),
  component: DocumentDetail,
});

function DocumentDetail() {
  const { docId } = useParams({ from: "/_shell/documents/$docId" });
  const { documents, dispatchDocument, receiveDocument, setStatus, fileDocument } = useApp();
  const doc = documents.find((d) => d.id === docId);
  const [target, setTarget] = useState("off-treasury");
  const [remarks, setRemarks] = useState("");
  const [location, setLocation] = useState("Cabinet A / Drawer 1");

  if (!doc) {
    return (
      <EmptyState
        icon={FolderArchive}
        title="Document not found"
        description="It may have been archived or the tracking code is incorrect."
        action={
          <Button asChild>
            <Link to="/documents">Back to registry</Link>
          </Button>
        }
      />
    );
  }

  const wf = workflowById(doc.workflowId);

  return (
    <>
      <PageHeader
        title={doc.title}
        description={`${doc.trackingCode} · ${docTypeName(doc.typeId)} · filed by ${userName(doc.createdBy)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/documents">
                <ArrowLeft className="size-4" /> Registry
              </Link>
            </Button>
            <Button variant="outline" onClick={() => toast.success("Routing slip re-printed (mock).")}>
              <Printer className="size-4" /> Reprint slip
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Current state</CardTitle>
                <CardDescription>{doc.subject}</CardDescription>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={doc.priority} />
                <StatusBadge status={doc.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div><dt className="text-muted-foreground">Current office</dt><dd className="font-medium">{officeName(doc.currentOfficeId)}</dd></div>
                <div><dt className="text-muted-foreground">Next office</dt><dd className="font-medium">{officeName(doc.nextOfficeId)}</dd></div>
                <div><dt className="text-muted-foreground">Origin</dt><dd className="font-medium">{officeName(doc.originOfficeId)}</dd></div>
                <div><dt className="text-muted-foreground">Requester</dt><dd className="font-medium">{doc.requester}</dd></div>
                <div><dt className="text-muted-foreground">Registered</dt><dd className="font-medium">{formatDateTime(doc.createdAt)}</dd></div>
                <div><dt className="text-muted-foreground">Target completion</dt><dd className="font-medium">{formatDateTime(doc.dueAt)}</dd></div>
                <div><dt className="text-muted-foreground">Pages</dt><dd className="font-medium">{doc.pageCount}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Remarks</dt><dd className="font-medium">{doc.remarks ?? "—"}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Custody timeline</TabsTrigger>
              <TabsTrigger value="workflow">Workflow progress</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <Card>
                <CardContent className="p-6">
                  <Timeline events={doc.events} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="workflow">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{wf?.name ?? "No workflow"}</CardTitle>
                  <CardDescription>{wf?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(wf?.steps ?? []).map((s, i) => {
                    const state = i < doc.currentStepIndex ? "done" : i === doc.currentStepIndex ? "current" : "pending";
                    return (
                      <div
                        key={s.id}
                        className={
                          "flex items-center gap-3 rounded-lg border p-3 " +
                          (state === "current" ? "border-primary bg-primary/5" : "border-border")
                        }
                      >
                        <span
                          className={
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                            (state === "done"
                              ? "bg-success-soft text-success"
                              : state === "current"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground")
                          }
                        >
                          {state === "done" ? <CheckCircle2 className="size-4" /> : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {officeName(s.officeId)} · SLA {s.slaHours}h · {s.required ? "Required" : "Optional"}
                          </p>
                        </div>
                        <span className="text-xs capitalize text-muted-foreground">{state}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attachments">
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={FolderArchive}
                    title="Physical document — no digital copies"
                    description="This prototype tracks physical custody only. File uploads are intentionally out of scope."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR reference</CardTitle>
              <CardDescription>Attach this label to the physical folder.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <QrPlaceholder value={doc.qrCode} size={150} />
              <p className="font-mono text-sm">{doc.qrCode}</p>
              <p className="font-mono text-xs text-muted-foreground">{doc.trackingCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Routing actions</CardTitle>
              <CardDescription>Actions update the custody log immediately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Forward to office</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {offices.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rem">Remarks</Label>
                <Textarea id="rem" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional note recorded in the audit trail" />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  dispatchDocument(doc.id, target, remarks || undefined);
                  setRemarks("");
                  toast.success(`Dispatched to ${officeName(target)}.`);
                }}
              >
                <Send className="size-4" /> Dispatch
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { receiveDocument(doc.id, remarks || undefined); toast.success("Marked as received."); }}>
                  Receive
                </Button>
                <Button variant="outline" onClick={() => { setStatus(doc.id, "in_process"); toast.success("Marked in process."); }}>
                  In process
                </Button>
                <Button variant="outline" onClick={() => { setStatus(doc.id, "on_hold", remarks || undefined); toast.warning("Placed on hold."); }}>
                  <PauseCircle className="size-4" /> Hold
                </Button>
                <Button variant="outline" onClick={() => { setStatus(doc.id, "returned", remarks || undefined); toast.warning("Returned to origin."); }}>
                  <Undo2 className="size-4" /> Return
                </Button>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => { setStatus(doc.id, "completed"); toast.success("Marked completed."); }}>
                <CheckCircle2 className="size-4" /> Mark completed
              </Button>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="loc">File location</Label>
                <Textarea id="loc" rows={2} value={location} onChange={(e) => setLocation(e.target.value)} />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    fileDocument(doc.id, location);
                    toast.success("Document filed to archives.");
                  }}
                >
                  <FolderArchive className="size-4" /> File to archives
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
