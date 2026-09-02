import {
  ArrowRight,
  CheckCircle2,
  FileInput,
  FilePlus2,
  FolderArchive,
  PauseCircle,
  Undo2,
  Workflow as WorkflowIcon,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TrackingEvent } from "@/types";
import { officeName, userName } from "@/services/api";
import { formatDateTime, relativeTime } from "@/lib/format";

const ICON: Record<TrackingEvent["action"], LucideIcon> = {
  registered: FilePlus2,
  dispatched: ArrowRight,
  received: FileInput,
  processed: WorkflowIcon,
  held: PauseCircle,
  returned: Undo2,
  completed: CheckCircle2,
  filed: FolderArchive,
  wrong_office: AlertTriangle,
};

const LABEL: Record<TrackingEvent["action"], string> = {
  registered: "Registered",
  dispatched: "Dispatched",
  received: "Received",
  processed: "Processed",
  held: "Placed on hold",
  returned: "Returned",
  completed: "Completed",
  filed: "Filed",
  wrong_office: "Wrong office scan",
};

export function Timeline({ events }: { events: TrackingEvent[] }) {
  const ordered = [...events].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {ordered.map((e) => {
        const Icon = ICON[e.action];
        const danger = e.action === "wrong_office" || e.action === "returned";
        return (
          <li key={e.id} className="relative">
            <span
              className={
                "absolute -left-[2.05rem] flex size-7 items-center justify-center rounded-full border " +
                (danger
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-primary/25 bg-primary/10 text-primary")
              }
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="text-sm font-medium text-foreground">{LABEL[e.action]}</p>
              <p className="text-xs text-muted-foreground">{relativeTime(e.timestamp)}</p>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {e.fromOfficeId ? `${officeName(e.fromOfficeId)} → ` : ""}
              {e.toOfficeId ? officeName(e.toOfficeId) : "—"}
            </p>
            {e.remarks ? <p className="mt-1 text-sm text-foreground/80 italic">“{e.remarks}”</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {userName(e.actorId)} · {formatDateTime(e.timestamp)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
