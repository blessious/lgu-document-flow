import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { offices } from "@/data/mock";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_shell/reports")({
  head: () => ({
    meta: [
      { title: "Reports — LGU DocTrack" },
      { name: "description", content: "Generate transmittal, turnaround and volume reports for any period or office." },
      { property: "og:title", content: "Reports — LGU DocTrack" },
      { property: "og:description", content: "Generate transmittal, turnaround and volume reports." },
    ],
  }),
  component: ReportsPage,
});

const TEMPLATES = [
  { id: "transmittal", name: "Transmittal report", desc: "All documents dispatched by an office within a period." },
  { id: "turnaround", name: "Turnaround report", desc: "Average handling time per office and document type." },
  { id: "aging", name: "Aging report", desc: "Documents pending beyond their prescribed SLA." },
  { id: "volume", name: "Volume summary", desc: "Registered, completed and filed counts per month." },
];

function ReportsPage() {
  const { documents } = useApp();
  const [template, setTemplate] = useState("transmittal");
  const [office, setOffice] = useState("all");
  const rows = documents.filter((d) => office === "all" || d.currentOfficeId === office);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Print-ready outputs for COA, management reviews and office transmittals."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Export queued (mock).")}>
              <FileSpreadsheet className="size-4" /> Export XLSX
            </Button>
            <Button onClick={() => toast.success("Report sent to printer (mock).")}>
              <Printer className="size-4" /> Print
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplate(t.id)}
            className={
              "rounded-lg border p-4 text-left transition-colors " +
              (template === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent")
            }
          >
            <FileText className="size-5 text-primary" aria-hidden />
            <p className="mt-2 text-sm font-medium">{t.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report parameters</CardTitle>
          <CardDescription>Filters apply to the preview below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" defaultValue="2026-08-01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" defaultValue="2026-09-02" />
          </div>
          <div className="space-y-2">
            <Label>Office</Label>
            <Select value={office} onValueChange={setOffice}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All offices</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Preview — {TEMPLATES.find((t) => t.id === template)?.name}</CardTitle>
            <CardDescription>{rows.length} records</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast.success("CSV downloaded (mock).")}>
            <Download className="size-4" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.trackingCode}</TableCell>
                    <TableCell className="max-w-[22rem] truncate">{d.title}</TableCell>
                    <TableCell className="text-sm">{officeName(d.currentOfficeId)}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-sm">{formatDate(d.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
