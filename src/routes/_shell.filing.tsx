import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Archive, Boxes, FolderArchive, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/store/app-store";
import { docTypeName, officeName } from "@/services/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/filing")({
  head: () => ({
    meta: [
      { title: "Filing & archives — LGU DocTrack" },
      { name: "description", content: "Assign physical file locations and manage retention of completed documents." },
      { property: "og:title", content: "Filing & archives — LGU DocTrack" },
      { property: "og:description", content: "Assign physical file locations and manage retention schedules." },
    ],
  }),
  component: FilingPage,
});

function FilingPage() {
  const { documents, fileDocument } = useApp();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<Record<string, string>>({});
  const filed = documents.filter((d) => d.status === "filed");
  const pending = documents.filter((d) => d.status === "completed");
  const results = filed.filter((d) => `${d.trackingCode} ${d.title} ${d.fileLocation}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Filing & archives"
        description="Give every completed document a physical home and track its retention period."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Archived" value={filed.length} hint="With assigned file location" icon={Archive} />
        <StatCard label="Awaiting filing" value={pending.length} hint="Completed but unfiled" icon={FolderArchive} tone="warning" />
        <StatCard label="Storage boxes" value={42} hint="Across 3 archive rooms" icon={Boxes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Awaiting filing</CardTitle>
          <CardDescription>Completed documents that still need a shelf location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <EmptyState icon={FolderArchive} title="Everything is filed" description="No completed documents are waiting for a location." />
          ) : (
            pending.map((d) => (
              <div key={d.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">{d.trackingCode}</p>
                </div>
                <Input
                  className="sm:w-72"
                  placeholder="Cabinet / Drawer / Folder"
                  value={loc[d.id] ?? ""}
                  onChange={(e) => setLoc((p) => ({ ...p, [d.id]: e.target.value }))}
                  aria-label={`File location for ${d.trackingCode}`}
                />
                <Button
                  onClick={() => {
                    const value = loc[d.id]?.trim();
                    if (!value) {
                      toast.error("Enter a file location first.");
                      return;
                    }
                    fileDocument(d.id, value);
                    toast.success(`${d.trackingCode} filed.`);
                  }}
                >
                  File
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <div>
            <CardTitle className="text-base">Archive index</CardTitle>
            <CardDescription>Search the physical archive by code, title or location.</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search archives" aria-label="Search archives" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Filed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/documents/$docId" params={{ docId: d.id }} className="text-primary hover:underline">
                        {d.trackingCode}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[20rem] truncate">{d.title}</TableCell>
                    <TableCell className="text-sm">{docTypeName(d.typeId)}</TableCell>
                    <TableCell className="text-sm">{d.fileLocation ?? "—"}</TableCell>
                    <TableCell className="text-sm">{formatDate(d.updatedAt)}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {results.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No archived documents match “{q}”.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retention schedule</CardTitle>
          <CardDescription>Configured per document type in reference data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["Disbursement Voucher · 10 years", "Purchase Request · 7 years", "Business Permit · 5 years", "Travel Order · 3 years", "Memorandum · 3 years"].map((r) => (
            <div key={r} className="rounded-lg border border-border p-3 text-sm">
              {r}
            </div>
          ))}
          <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            Archive room custodian: {officeName("off-records")}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
