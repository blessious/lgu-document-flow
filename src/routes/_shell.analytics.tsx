import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, Timer, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { turnaroundByOffice, volumeByDay } from "@/services/api";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — LGU DocTrack" },
      { name: "description", content: "Turnaround, bottleneck and throughput analytics across city hall offices." },
      { property: "og:title", content: "Analytics — LGU DocTrack" },
      { property: "og:description", content: "Turnaround, bottleneck and throughput analytics for city hall." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Performance of the document routing process over the last 30 days." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Throughput" value="175" hint="Documents completed" icon={TrendingUp} tone="success" />
        <StatCard label="Median turnaround" value="19h" hint="Down 3h vs last month" icon={Timer} />
        <StatCard label="SLA compliance" value="86%" hint="Target 90%" icon={Gauge} tone="warning" />
        <StatCard label="Active handlers" value="63" hint="Staff scanning documents" icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered vs completed</CardTitle>
          <CardDescription>Daily throughput trend.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeByDay} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)" }} />
              <Legend />
              <Area type="monotone" dataKey="registered" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
              <Area type="monotone" dataKey="completed" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bottlenecks by office</CardTitle>
          <CardDescription>Average hours a document waits before being forwarded.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={turnaroundByOffice} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <YAxis dataKey="office" type="category" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)" }} />
              <Bar dataKey="hours" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
