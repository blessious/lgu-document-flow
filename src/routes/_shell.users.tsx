import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users as seedUsers } from "@/data/mock";
import { officeName } from "@/services/api";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_shell/users")({
  head: () => ({
    meta: [
      { title: "Users & roles — LGU DocTrack" },
      { name: "description", content: "Manage accounts, office assignment and role-based permissions." },
      { property: "og:title", content: "Users & roles — LGU DocTrack" },
      { property: "og:description", content: "Manage accounts, office assignment and role-based permissions." },
    ],
  }),
  component: UsersPage,
});

const PERMISSIONS = [
  { role: "Administrator", scope: "Full system access, configuration and audit" },
  { role: "Office head", scope: "Approve, dispatch and monitor own office" },
  { role: "Staff", scope: "Register, process and forward documents" },
  { role: "Receiving clerk", scope: "Scanner only — receive and dispatch" },
];

function UsersPage() {
  const [list, setList] = useState(seedUsers);

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Accounts are provisioned by the records administrator and scoped to a single office."
        actions={
          <Button onClick={() => toast.success("Invite sent (mock).")}>
            <UserPlus className="size-4" /> Invite user
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {u.avatarInitials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{officeName(u.officeId)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{u.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(u.lastLogin)}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={u.active}
                        aria-label={`Toggle ${u.name}`}
                        onCheckedChange={(v) => {
                          setList((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: v } : x)));
                          toast.success(`${u.name} ${v ? "activated" : "deactivated"}.`);
                        }}
                      />
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
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" aria-hidden /> Role permissions
          </CardTitle>
          <CardDescription>Roles are enforced server-side once the API is connected.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {PERMISSIONS.map((p) => (
            <div key={p.role} className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">{p.role}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.scope}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
