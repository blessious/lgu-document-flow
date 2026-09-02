import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Inbox, QrCode, TruckIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import { offices } from "@/data/mock";
import { formatDateTime, relativeTime } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/_shell/incoming")({
  head: () => ({
    meta: [
      { title: "Expected incoming — LGU DocTrack" },
      { name: "description", content: "Documents dispatched to your office and awaiting receipt at the window." },
      { property: "og:title", content: "Expected incoming — LGU DocTrack" },
      { property: "og:description", content: "Documents dispatched to your office awaiting receipt." },
    ],
  }),
  component: IncomingPage,
});

function IncomingPage() {
  const { documents, session, receiveDocument } = useApp();
  const [officeId, setOfficeId] = useState(session?.officeId ?? "off-accounting");
  const list = documents.filter((d) => d.nextOfficeId === officeId && d.status === "in_transit");

  return (
    <>
      <PageHeader
        title="Expected incoming"
        description="Documents other offices have dispatched to you. Confirm receipt when the physical copy arrives."
        actions={
          <Button asChild>
            <Link to="/scanner/receive">
              <QrCode className="size-4" /> Scan to receive
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Receiving office</CardTitle>
          <CardDescription>Switch offices to view another receiving queue.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select value={officeId} onValueChange={setOfficeId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing in transit to this office"
          description="Documents appear here the moment another office dispatches them to you."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((d) => (
            <Card key={d.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{d.title}</CardTitle>
                  <CardDescription className="font-mono text-xs">{d.trackingCode}</CardDescription>
                </div>
                <StatusBadge status={d.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TruckIcon className="size-4" aria-hidden />
                  From {officeName(d.currentOfficeId)} · dispatched {relativeTime(d.updatedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={d.priority} />
                  <span className="text-xs text-muted-foreground">Due {formatDateTime(d.dueAt)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      receiveDocument(d.id);
                      toast.success(`${d.trackingCode} received.`);
                    }}
                  >
                    Confirm receipt
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/documents/$docId" params={{ docId: d.id }}>Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
