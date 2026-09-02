import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { PriorityBadge } from "@/components/common/StatusBadge";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/scanner/receive")({
  component: ReceivePage,
});

function ReceivePage() {
  const { documents, session, receiveDocument } = useApp();
  const officeId = session?.officeId ?? "off-accounting";
  const list = documents.filter((d) => d.nextOfficeId === officeId && d.status === "in_transit");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Receive documents</h1>
        <p className="text-sm text-muted-foreground">Everything dispatched to {officeName(officeId)}.</p>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing to receive" description="Scan a routing slip when a document arrives." />
      ) : (
        list.map((d) => (
          <Card key={d.id}>
            <CardContent className="space-y-3 p-4">
              <p className="font-mono text-xs text-muted-foreground">{d.trackingCode}</p>
              <p className="text-sm font-medium">{d.title}</p>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={d.priority} />
                <span className="text-xs text-muted-foreground">
                  From {officeName(d.currentOfficeId)} · {relativeTime(d.updatedAt)}
                </span>
              </div>
              <Button
                className="h-11 w-full"
                onClick={() => {
                  receiveDocument(d.id);
                  toast.success(`${d.trackingCode} received.`);
                }}
              >
                Receive
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
