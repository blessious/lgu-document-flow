import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Filter, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/store/app-store";
import { docTypeName, officeName } from "@/services/api";
import { documentTypes, offices } from "@/data/mock";
import { formatDate, isOverdue } from "@/lib/format";
import { STATUS_LABEL } from "@/components/common/StatusBadge";
import type { DocumentStatus } from "@/types";

export const Route = createFileRoute("/_shell/documents/")({
  head: () => ({
    meta: [
      { title: "Document registry — LGU DocTrack" },
      { name: "description", content: "Searchable registry of every QR-labelled document in the local government unit." },
      { property: "og:title", content: "Document registry — LGU DocTrack" },
      { property: "og:description", content: "Searchable registry of every QR-labelled document in the LGU." },
    ],
  }),
  component: RegistryPage,
});

const STATUSES = Object.keys(STATUS_LABEL) as DocumentStatus[];

function RegistryPage() {
  const { documents } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [office, setOffice] = useState("all");
  const [type, setType] = useState("all");

  const rows = useMemo(
    () =>
      documents.filter((d) => {
        const text = `${d.trackingCode} ${d.title} ${d.requester}`.toLowerCase();
        return (
          text.includes(q.toLowerCase()) &&
          (status === "all" || d.status === status) &&
          (office === "all" || d.currentOfficeId === office) &&
          (type === "all" || d.typeId === type)
        );
      }),
    [documents, q, status, office, type],
  );

  return (
    <>
      <PageHeader
        title="Document registry"
        description="Every registered document with its QR reference, custody and routing state."
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" /> Export CSV
            </Button>
            <Button asChild>
              <Link to="/documents/new">
                <Plus className="size-4" /> Register document
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search code, title, requester"
              className="pl-9"
              aria-label="Search documents"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={office} onValueChange={setOffice}>
            <SelectTrigger aria-label="Filter by office">
              <SelectValue placeholder="Office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All offices</SelectItem>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Filter by document type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {documentTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Filter} title="No documents match your filters" description="Try clearing the search or selecting a different office." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking code</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current office</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.trackingCode}</TableCell>
                      <TableCell className="max-w-[22rem]">
                        <span className="block truncate font-medium">{d.title}</span>
                        <span className="mt-1 flex items-center gap-2">
                          <PriorityBadge priority={d.priority} />
                          <span className="truncate text-xs text-muted-foreground">{d.requester}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{docTypeName(d.typeId)}</TableCell>
                      <TableCell className="text-sm">{officeName(d.currentOfficeId)}</TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell className={isOverdue(d.dueAt) && !["completed", "filed"].includes(d.status) ? "text-sm text-destructive" : "text-sm"}>
                        {formatDate(d.dueAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/documents/$docId" params={{ docId: d.id }}>
                            <FileText className="size-4" /> Open
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Showing {rows.length} of {documents.length} documents.
      </p>
    </>
  );
}
