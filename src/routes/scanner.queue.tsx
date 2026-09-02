import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/scanner/queue")({
  component: QueuePage,
});

function QueuePage() {
  const { documents, session } = useApp();
  const officeId = session?.officeId ?? "off-accounting";
  const list = documents.filter((d) => d.currentOfficeId === officeId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Office queue</h1>
        <p className="text-sm text-muted-foreground">Everything currently logged to {officeName(officeId)}.</p>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Queue is empty" description="Received documents will show up here." />
      ) : (
        list.map((d) => (
          <Link key={d.id} to="/documents/$docId" params={{ docId: d.id }} className="block">
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs text-muted-foreground">{d.trackingCode}</p>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-sm font-medium">{d.title}</p>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={d.priority} />
                  <span className="text-xs text-muted-foreground">Updated {relativeTime(d.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
