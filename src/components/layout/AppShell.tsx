import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  FolderArchive,
  Inbox,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Admin dashboard", icon: LayoutDashboard },
      { to: "/office", label: "My office", icon: Building2 },
      { to: "/incoming", label: "Expected incoming", icon: Inbox },
    ],
  },
  {
    label: "Documents",
    items: [
      { to: "/documents", label: "Document registry", icon: FileText },
      { to: "/documents/new", label: "Register document", icon: ClipboardList },
      { to: "/track", label: "Public tracking", icon: Search },
      { to: "/filing", label: "Filing & archives", icon: FolderArchive },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/workflows", label: "Workflows", icon: Workflow },
      { to: "/offices", label: "Offices", icon: Building2 },
      { to: "/users", label: "Users & roles", icon: Users },
      { to: "/references", label: "Reference data", icon: ListTree },
    ],
  },
  {
    label: "Insight",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/reports", label: "Reports", icon: FileText },
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/audit", label: "Audit & security", icon: ShieldCheck },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { session, logout, notifications } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <QrCode className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">LGU DocTrack</p>
          <p className="truncate text-xs text-sidebar-foreground/60">QR Document Tracking</p>
        </div>
        <button
          className="ml-auto rounded-md p-1 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {item.to === "/notifications" && unread > 0 ? (
                        <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <Separator className="bg-sidebar-border" />
      <div className="p-3">
        <Link
          to="/scanner"
          className="flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2.5 text-sm text-sidebar-accent-foreground hover:opacity-90"
        >
          <QrCode className="size-4" aria-hidden />
          Open mobile scanner
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-72">{sidebar}</div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <Activity className="size-4 text-success" aria-hidden />
            Prototype mode — mock data only
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link to="/notifications" className="relative">
                <Bell className="size-5" />
                {unread > 0 ? (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
                ) : null}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/scanner">
                <QrCode className="size-4" /> Scan
              </Link>
            </Button>
            <div className="hidden items-center gap-3 border-l border-border pl-3 sm:flex">
              <div className="text-right">
                <p className="text-sm leading-tight font-medium">{session?.name ?? "Guest"}</p>
                <p className="text-xs text-muted-foreground">{officeName(session?.officeId)}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {session?.role.replace("_", " ") ?? "visitor"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
