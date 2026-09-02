import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileText, Timer } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/store/app-store";
import { officeCode, officeName, statusDistribution, turnaroundByOffice, volumeByDay } from "@/services/api";
import { formatDate, isOverdue, relativeTime } from "@/lib/format";
import { offices } from "@/data/mock";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — LGU DocTrack" },
      { name: "description", content: "City-wide document volume, SLA compliance and office workload overview." },
      { property: "og:title", content: "Admin dashboard — LGU DocTrack" },
      { property: "og:description", content: "City-wide document volume, SLA compliance and office workload." },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["var(--color-primary)", "var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-destructive)"];

function DashboardPage() {
  const { documents } = useApp();
  const active = documents.filter((d) => !["completed", "filed"].includes(d.status));
  const overdue = active.filter((d) => isOverdue(d.dueAt));
  const completed = documents.filter((d) => d.status === "completed" || d.status === "filed");

  return (
    <>
      <PageHeader
        title="Administrator dashboard"
        description="City-wide view of document movement, bottlenecks and compliance for the current period."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">Generate report</Link>
            </Button>
            <Button asChild>
              <Link to="/documents/new">Register document</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active documents" value={active.length} hint="Currently in circulation" icon={FileText} />
        <StatCard label="Overdue vs SLA" value={overdue.length} hint="Beyond target turnaround" icon={AlertTriangle} tone="danger" />
        <StatCard label="Completed" value={completed.length} hint="Released or archived" icon={CheckCircle2} tone="success" />
        <StatCard label="Avg. turnaround" value="21.8h" hint="Across all offices" icon={Timer} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Document volume</CardTitle>
            <CardDescription>Registered versus completed documents over the last seven days.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeByDay} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)" }} />
                <Line type="monotone" dataKey="registered" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" stroke="var(--color-success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status mix</CardTitle>
            <CardDescription>Share of documents by current state.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Documents needing attention</CardTitle>
              <CardDescription>Urgent, overdue or held documents across all offices.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/documents">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Current office</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active
                    .slice()
                    .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt))
                    .slice(0, 6)
                    .map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs">
                          <Link to="/documents/$docId" params={{ docId: d.id }} className="text-primary hover:underline">
                            {d.trackingCode}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[18rem]">
                          <span className="block truncate">{d.title}</span>
                          <PriorityBadge priority={d.priority} />
                        </TableCell>
                        <TableCell className="text-sm">{officeCode(d.currentOfficeId)}</TableCell>
                        <TableCell>
                          <StatusBadge status={d.status} />
                        </TableCell>
                        <TableCell className={isOverdue(d.dueAt) ? "text-destructive text-sm" : "text-sm"}>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden /> {formatDate(d.dueAt)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Office workload</CardTitle>
            <CardDescription>Average turnaround in hours.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnaroundByOffice} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="office" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)" }} />
                <Bar dataKey="hours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Office SLA compliance</CardTitle>
          <CardDescription>Percentage of documents released within the prescribed turnaround.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offices.slice(0, 6).map((o, i) => {
            const pct = [94, 88, 76, 91, 62, 97][i] ?? 80;
            return (
              <div key={o.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{officeName(o.id)}</span>
                  <span className="tabular-nums text-muted-foreground">{pct}%</span>
                </div>
                <Progress value={pct} />
                <p className="text-xs text-muted-foreground">Updated {relativeTime("2026-09-01T22:00:00Z")}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
