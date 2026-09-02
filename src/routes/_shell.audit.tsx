import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auditEntries } from "@/data/mock";
import { userName } from "@/services/api";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_shell/audit")({
  head: () => ({
    meta: [
      { title: "Audit & security — LGU DocTrack" },
      { name: "description", content: "Immutable trail of user actions, sign-ins and configuration changes." },
      { property: "og:title", content: "Audit & security — LGU DocTrack" },
      { property: "og:description", content: "Immutable trail of user actions and configuration changes." },
    ],
  }),
  component: AuditPage,
});

const SEVERITY: Record<string, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

function AuditPage() {
  const [q, setQ] = useState("");
  const rows = auditEntries.filter((a) => `${a.action} ${a.target} ${userName(a.actorId)}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Audit & security" description="Everything that happens in the system is recorded here." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Events (30 days)" value={1284} hint="All recorded actions" icon={ShieldCheck} />
        <StatCard label="Failed sign-ins" value={7} hint="3 from outside the LGU network" icon={ShieldAlert} tone="danger" />
        <StatCard label="Password resets" value={12} hint="Requested by office heads" icon={KeyRound} tone="warning" />
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div>
            <CardTitle className="text-base">Audit trail</CardTitle>
            <CardDescription>Entries cannot be edited or deleted.</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search audit trail" aria-label="Search audit trail" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{formatDateTime(a.timestamp)}</TableCell>
                    <TableCell className="text-sm">{userName(a.actorId)}</TableCell>
                    <TableCell className="font-mono text-xs">{a.action}</TableCell>
                    <TableCell className="text-sm">{a.target}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.ip}</TableCell>
                    <TableCell><Badge variant={SEVERITY[a.severity]}>{a.severity}</Badge></TableCell>
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
