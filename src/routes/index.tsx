import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { QrCode, ShieldCheck, LogIn, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/data/mock";
import { officeName } from "@/services/api";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — LGU QR Document Tracking System" },
      {
        name: "description",
        content:
          "Secure sign-in for the local government unit QR-based document tracking system. Route, receive and monitor documents across offices.",
      },
      { property: "og:title", content: "Sign in — LGU QR Document Tracking System" },
      {
        property: "og:description",
        content: "Secure sign-in for the LGU QR-based document tracking and routing system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginAs } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@lgu.gov.ph");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter both your government e-mail and password.");
      return;
    }
    const user = login(email);
    navigate({ to: user.role === "receiving" ? "/scanner" : "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <QrCode className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">LGU DocTrack</p>
            <p className="text-xs text-sidebar-foreground/60">City Government Records System</p>
          </div>
        </div>
        <div className="max-w-md space-y-5">
          <h2 className="text-3xl font-semibold tracking-tight">
            Every document accounted for, from window to archive.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            QR-labelled routing slips, office-to-office custody logs, SLA monitoring and a mobile receiving
            scanner — all in one institutional workspace.
          </p>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden /> Full custody audit trail per document
            </li>
            <li className="flex items-center gap-2">
              <QrCode className="size-4" aria-hidden /> Receive and dispatch in two taps
            </li>
            <li className="flex items-center gap-2">
              <Search className="size-4" aria-hidden /> Public tracking by reference code
            </li>
          </ul>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          Frontend prototype · no live backend connected
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <QrCode className="size-5" aria-hidden />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to LGU DocTrack</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your government-issued account to continue.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Government e-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@lgu.gov.ph"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              <LogIn className="size-4" /> Sign in
            </Button>
          </form>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Demo accounts</CardTitle>
              <CardDescription>Click a role to enter the prototype instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {users.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    loginAs(u);
                    navigate({ to: u.role === "receiving" ? "/scanner" : "/dashboard" });
                  }}
                  className="flex w-full items-center gap-3 rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {u.avatarInitials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{u.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {u.position} · {officeName(u.officeId)}
                    </span>
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Tracking a document?{" "}
            <Link to="/track" className="font-medium text-primary underline-offset-4 hover:underline">
              Track without signing in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
