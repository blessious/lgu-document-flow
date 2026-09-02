import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Keyboard, ScanLine, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useApp } from "@/store/app-store";
import { officeName } from "@/services/api";
import type { ScanOutcome, TrackedDocument } from "@/types";

export const Route = createFileRoute("/scanner/")({
  component: ScanPage,
});

function ScanPage() {
  const { documents, session, receiveDocument, flagWrongOffice } = useApp();
  const navigate = useNavigate();
  const officeId = session?.officeId ?? "off-accounting";
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ outcome: ScanOutcome; doc?: TrackedDocument } | null>(null);

  const resolve = (value: string) => {
    const doc = documents.find(
      (d) => d.qrCode.toLowerCase() === value.toLowerCase() || d.trackingCode.toLowerCase() === value.toLowerCase(),
    );
    if (!doc) return setResult({ outcome: "unknown" });
    if (doc.nextOfficeId === officeId && doc.status === "in_transit") return setResult({ outcome: "receive", doc });
    if (doc.currentOfficeId === officeId) return setResult({ outcome: "dispatch", doc });
    return setResult({ outcome: "wrong_office", doc });
  };

  const simulate = () => {
    setScanning(true);
    setResult(null);
    const pool = documents.filter((d) => !["completed", "filed"].includes(d.status));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(() => {
      setScanning(false);
      if (pick) resolve(pick.qrCode);
    }, 900);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
        <div className="absolute inset-8 rounded-xl border-2 border-white/70" />
        {scanning ? <div className="absolute inset-x-10 h-0.5 animate-bounce bg-primary" /> : null}
        <div className="z-10 text-center text-white/80">
          <ScanLine className="mx-auto size-10" aria-hidden />
          <p className="mt-2 text-sm">{scanning ? "Reading QR label…" : "Point the camera at the routing slip"}</p>
        </div>
      </div>

      <Button className="h-12 w-full text-base" onClick={simulate} disabled={scanning}>
        {scanning ? "Scanning…" : "Simulate scan"}
      </Button>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Keyboard className="size-4" aria-hidden /> Enter code manually
          </p>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="QR-000418" aria-label="QR code" />
            <Button variant="outline" onClick={() => resolve(code.trim())} disabled={!code.trim()}>
              Go
            </Button>
          </div>
        </CardContent>
      </Card>

      {result?.outcome === "unknown" ? (
        <Card className="border-destructive/40">
          <CardContent className="space-y-2 p-4 text-center">
            <AlertTriangle className="mx-auto size-8 text-destructive" aria-hidden />
            <p className="font-medium">Unrecognised QR label</p>
            <p className="text-sm text-muted-foreground">
              This code is not registered. Ask the releasing office to reprint the routing slip.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {result?.doc ? (
        <Card
          className={
            result.outcome === "wrong_office" ? "border-warning/50" : result.outcome === "receive" ? "border-success/50" : ""
          }
        >
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{result.doc.trackingCode}</p>
                <p className="truncate text-sm font-medium">{result.doc.title}</p>
              </div>
              <StatusBadge status={result.doc.status} />
            </div>

            {result.outcome === "receive" ? (
              <>
                <p className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="size-4" aria-hidden /> Expected at your office
                </p>
                <Button
                  className="h-12 w-full"
                  onClick={() => {
                    receiveDocument(result.doc!.id);
                    setResult(null);
                    navigate({ to: "/scanner/queue" });
                  }}
                >
                  Confirm receipt
                </Button>
              </>
            ) : null}

            {result.outcome === "dispatch" ? (
              <>
                <p className="text-sm text-muted-foreground">This document is in your custody. Forward it to the next office.</p>
                <Button className="h-12 w-full" asChild>
                  <Link to="/scanner/dispatch">
                    <Send className="size-4" /> Dispatch document
                  </Link>
                </Button>
              </>
            ) : null}

            {result.outcome === "wrong_office" ? (
              <>
                <div className="rounded-lg bg-warning-soft p-3 text-sm text-warning">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="size-4" aria-hidden /> Wrong office
                  </p>
                  <p className="mt-1">
                    This document is routed to {officeName(result.doc.nextOfficeId ?? result.doc.currentOfficeId)}. Do not
                    accept it here.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => {
                    flagWrongOffice(result.doc!.id, officeId);
                    setResult(null);
                  }}
                >
                  Report misrouting
                </Button>
              </>
            ) : null}

            <Button variant="ghost" className="w-full" asChild>
              <Link to="/documents/$docId" params={{ docId: result.doc.id }}>View full record</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
