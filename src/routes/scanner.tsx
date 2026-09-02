import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Inbox, QrCode, Send, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Mobile scanner — LGU DocTrack" },
      { name: "description", content: "Handheld receiving and dispatch station for QR-labelled documents." },
      { property: "og:title", content: "Mobile scanner — LGU DocTrack" },
      { property: "og:description", content: "Handheld receiving and dispatch station for QR-labelled documents." },
    ],
  }),
  component: ScannerLayout,
});

const TABS = [
  { to: "/scanner", label: "Scan", icon: ScanLine },
  { to: "/scanner/receive", label: "Receive", icon: QrCode },
  { to: "/scanner/dispatch", label: "Dispatch", icon: Send },
  { to: "/scanner/queue", label: "Queue", icon: Inbox },
];

function ScannerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-sidebar px-4 py-3 text-sidebar-foreground">
        <Link to="/dashboard" className="rounded-md p-1 hover:bg-sidebar-accent" aria-label="Back to desktop app">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Receiving station</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{officeName(session?.officeId ?? "off-accounting")}</p>
        </div>
        <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
          {session?.avatarInitials ?? "JS"}
        </span>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map((t) => {
            const active = pathname === t.to;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <t.icon className="size-5" aria-hidden />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
