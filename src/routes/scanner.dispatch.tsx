import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import { offices } from "@/data/mock";

export const Route = createFileRoute("/scanner/dispatch")({
  component: DispatchPage,
});

function DispatchPage() {
  const { documents, session, dispatchDocument } = useApp();
  const officeId = session?.officeId ?? "off-accounting";
  const list = documents.filter((d) => d.currentOfficeId === officeId && !["completed", "filed", "in_transit"].includes(d.status));
  const [target, setTarget] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Dispatch documents</h1>
        <p className="text-sm text-muted-foreground">Forward documents currently held by {officeName(officeId)}.</p>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={PackageCheck} title="Nothing to dispatch" description="Receive a document first, then forward it here." />
      ) : (
        list.map((d) => (
          <Card key={d.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{d.trackingCode}</p>
                  <p className="truncate text-sm font-medium">{d.title}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`t-${d.id}`}>Forward to</Label>
                <Select value={target[d.id] ?? d.nextOfficeId ?? "off-records"} onValueChange={(v) => setTarget((p) => ({ ...p, [d.id]: v }))}>
                  <SelectTrigger id={`t-${d.id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {offices.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="h-11 w-full"
                onClick={() => {
                  const to = target[d.id] ?? d.nextOfficeId ?? "off-records";
                  dispatchDocument(d.id, to);
                  toast.success(`${d.trackingCode} dispatched to ${officeName(to)}.`);
                }}
              >
                <Send className="size-4" /> Dispatch
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
