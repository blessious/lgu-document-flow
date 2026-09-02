import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LGU DocTrack" },
      { name: "description", content: "System identity, SLA defaults, notification and scanner preferences." },
      { property: "og:title", content: "Settings — LGU DocTrack" },
      { property: "og:description", content: "System identity, SLA defaults and scanner preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configuration for the whole tracking system."
        actions={
          <Button onClick={() => toast.success("Settings saved (mock).")}>
            <Save className="size-4" /> Save changes
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sla">SLA & routing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Institution identity</CardTitle>
              <CardDescription>Appears on printed routing slips and reports.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-2xl gap-4">
              <div className="space-y-2">
                <Label htmlFor="lgu">LGU name</Label>
                <Input id="lgu" defaultValue="City Government of San Lorenzo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr">Address</Label>
                <Textarea id="addr" rows={2} defaultValue="City Hall Compound, Rizal Street, San Lorenzo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefix">Tracking code prefix</Label>
                <Input id="prefix" defaultValue="LGU-2026-" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service levels</CardTitle>
              <CardDescription>Defaults applied when a workflow step has no explicit SLA.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="r1">Routine (hours)</Label>
                <Input id="r1" type="number" defaultValue={72} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r2">Urgent (hours)</Label>
                <Input id="r2" type="number" defaultValue={24} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r3">Rush (hours)</Label>
                <Input id="r3" type="number" defaultValue={8} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alerting</CardTitle>
              <CardDescription>Who gets told when a document stalls.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl space-y-4">
              {[
                ["Overdue alerts", "Notify the office head when a document exceeds its SLA."],
                ["Wrong office scans", "Alert Records Management when a document is scanned off-route."],
                ["Daily digest", "Send each office a morning summary of pending documents."],
              ].map(([title, desc], i) => (
                <div key={title} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch defaultChecked={i !== 2} aria-label={title} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scanner behaviour</CardTitle>
              <CardDescription>Applies to the mobile receiving experience.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl space-y-4">
              {[
                ["Block wrong-office receipts", "Prevent receiving a document routed to another office."],
                ["Require remarks on hold", "Force a reason when placing a document on hold."],
                ["Vibrate on successful scan", "Haptic confirmation on supported devices."],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch defaultChecked aria-label={title} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
