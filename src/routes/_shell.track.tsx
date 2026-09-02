import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, MapPin, Clock, FileQuestion } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Timeline } from "@/components/common/Timeline";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { QrPlaceholder } from "@/components/common/QrPlaceholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/store/app-store";
import { docTypeName, officeName } from "@/services/api";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_shell/track")({
  head: () => ({
    meta: [
      { title: "Track a document — LGU DocTrack" },
      { name: "description", content: "Enter a tracking or QR reference code to see where a document currently sits." },
      { property: "og:title", content: "Track a document — LGU DocTrack" },
      { property: "og:description", content: "Enter a tracking or QR reference code to locate a document." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { documents } = useApp();
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState(false);
  const match = documents.find(
    (d) =>
      d.trackingCode.toLowerCase() === code.trim().toLowerCase() ||
      d.qrCode.toLowerCase() === code.trim().toLowerCase(),
  );

  return (
    <>
      <PageHeader
        title="Track a document"
        description="Look up any document by its printed tracking code or QR reference. No sign-in required."
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setSearched(true);
            }}
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LGU-2026-000418 or QR-000418"
              aria-label="Tracking code"
            />
            <Button type="submit">
              <Search className="size-4" /> Track
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Sample codes: LGU-2026-000418 · LGU-2026-000401 · QR-000422
          </p>
        </CardContent>
      </Card>

      {searched && !match ? (
        <EmptyState
          icon={FileQuestion}
          title="No document found for that code"
          description="Double-check the reference on your routing slip, or contact the Records Management Section."
        />
      ) : null}

      {match ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{match.title}</CardTitle>
                <CardDescription>
                  {match.trackingCode} · {docTypeName(match.typeId)}
                </CardDescription>
              </div>
              <StatusBadge status={match.status} />
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <MapPin className="mt-0.5 size-4 text-primary" aria-hidden />
                  <div>
                    <p className="text-xs text-muted-foreground">Currently at</p>
                    <p className="text-sm font-medium">{officeName(match.currentOfficeId)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Clock className="mt-0.5 size-4 text-primary" aria-hidden />
                  <div>
                    <p className="text-xs text-muted-foreground">Last update</p>
                    <p className="text-sm font-medium">{formatDateTime(match.updatedAt)}</p>
                  </div>
                </div>
              </div>
              <Timeline events={match.events} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reference label</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <QrPlaceholder value={match.qrCode} size={150} />
              <p className="font-mono text-sm">{match.qrCode}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
