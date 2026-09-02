import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  documents as seedDocuments,
  notifications as seedNotifications,
  users,
  workflows,
} from "@/data/mock";
import type {
  DocumentStatus,
  NotificationItem,
  Priority,
  TrackedDocument,
  TrackingEvent,
  User,
} from "@/types";

interface RegisterInput {
  title: string;
  subject: string;
  typeId: string;
  priority: Priority;
  originOfficeId: string;
  nextOfficeId: string;
  workflowId: string;
  requester: string;
  pageCount: number;
  remarks?: string | undefined;
}

interface AppState {
  session: User | null;
  documents: TrackedDocument[];
  notifications: NotificationItem[];
  login: (email: string) => User;
  loginAs: (user: User) => void;
  logout: () => void;
  registerDocument: (input: RegisterInput) => TrackedDocument;
  receiveDocument: (docId: string, remarks?: string) => void;
  dispatchDocument: (docId: string, toOfficeId: string, remarks?: string) => void;
  flagWrongOffice: (docId: string, scannedOfficeId: string) => void;
  setStatus: (docId: string, status: DocumentStatus, remarks?: string) => void;
  fileDocument: (docId: string, location: string) => void;
  markAllRead: () => void;
  toggleRead: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

let seq = 426;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [docs, setDocs] = useState<TrackedDocument[]>(seedDocuments);
  const [notifs, setNotifs] = useState<NotificationItem[]>(seedNotifications);

  const pushNotification = useCallback((n: Omit<NotificationItem, "id" | "read" | "timestamp">) => {
    setNotifs((prev) => [
      { ...n, id: `ntf-${Math.random().toString(36).slice(2, 8)}`, read: false, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const appendEvent = useCallback(
    (docId: string, event: Omit<TrackingEvent, "id" | "documentId" | "timestamp">, patch: Partial<TrackedDocument>) => {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                ...patch,
                updatedAt: new Date().toISOString(),
                events: [
                  ...d.events,
                  {
                    ...event,
                    id: `e-${Math.random().toString(36).slice(2, 8)}`,
                    documentId: docId,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : d,
        ),
      );
    },
    [],
  );

  const value = useMemo<AppState>(() => {
    const actor = () => session?.id ?? "usr-1";
    return {
      session,
      documents: docs,
      notifications: notifs,
      login: (email: string) => {
        const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? users[0]!;
        setSession(found);
        return found;
      },
      loginAs: (user: User) => setSession(user),
      logout: () => setSession(null),
      registerDocument: (input) => {
        seq += 1;
        const code = `LGU-2026-${String(seq).padStart(6, "0")}`;
        const now = new Date().toISOString();
        const doc: TrackedDocument = {
          id: `doc-${seq}`,
          trackingCode: code,
          qrCode: `QR-${String(seq).padStart(6, "0")}`,
          title: input.title,
          subject: input.subject,
          typeId: input.typeId,
          status: "registered",
          priority: input.priority,
          originOfficeId: input.originOfficeId,
          currentOfficeId: input.originOfficeId,
          nextOfficeId: input.nextOfficeId,
          workflowId: input.workflowId,
          currentStepIndex: 0,
          createdBy: actor(),
          createdAt: now,
          updatedAt: now,
          dueAt: new Date(Date.now() + 3 * 86400000).toISOString(),
          requester: input.requester,
          pageCount: input.pageCount,
          remarks: input.remarks,
          events: [
            {
              id: `e-${Math.random().toString(36).slice(2, 8)}`,
              documentId: `doc-${seq}`,
              action: "registered",
              actorId: actor(),
              toOfficeId: input.originOfficeId,
              timestamp: now,
            },
          ],
        };
        setDocs((prev) => [doc, ...prev]);
        pushNotification({
          title: "Document registered",
          body: `${code} was registered and a QR label is ready for printing.`,
          kind: "success",
          documentId: doc.id,
        });
        return doc;
      },
      receiveDocument: (docId, remarks) => {
        const doc = docs.find((d) => d.id === docId);
        if (!doc) return;
        const target = doc.nextOfficeId ?? doc.currentOfficeId;
        appendEvent(
          docId,
          { action: "received", actorId: actor(), fromOfficeId: doc.currentOfficeId, toOfficeId: target, remarks },
          { status: "received", currentOfficeId: target, currentStepIndex: doc.currentStepIndex + 1 },
        );
        pushNotification({
          title: "Document received",
          body: `${doc.trackingCode} was received successfully.`,
          kind: "success",
          documentId: docId,
        });
      },
      dispatchDocument: (docId, toOfficeId, remarks) => {
        const doc = docs.find((d) => d.id === docId);
        if (!doc) return;
        appendEvent(
          docId,
          { action: "dispatched", actorId: actor(), fromOfficeId: doc.currentOfficeId, toOfficeId, remarks },
          { status: "in_transit", nextOfficeId: toOfficeId },
        );
        pushNotification({
          title: "Document dispatched",
          body: `${doc.trackingCode} is now in transit.`,
          kind: "info",
          documentId: docId,
        });
      },
      flagWrongOffice: (docId, scannedOfficeId) => {
        const doc = docs.find((d) => d.id === docId);
        if (!doc) return;
        appendEvent(
          docId,
          {
            action: "wrong_office",
            actorId: actor(),
            fromOfficeId: doc.currentOfficeId,
            toOfficeId: scannedOfficeId,
            remarks: "Scanned outside the expected routing office.",
          },
          {},
        );
        pushNotification({
          title: "Wrong office scan",
          body: `${doc.trackingCode} was scanned at an unexpected office.`,
          kind: "warning",
          documentId: docId,
        });
      },
      setStatus: (docId, status, remarks) => {
        const map: Record<string, TrackingEvent["action"]> = {
          on_hold: "held",
          returned: "returned",
          completed: "completed",
          in_process: "processed",
        };
        appendEvent(docId, { action: map[status] ?? "processed", actorId: actor(), remarks }, { status });
      },
      fileDocument: (docId, location) => {
        appendEvent(
          docId,
          { action: "filed", actorId: actor(), remarks: `Filed at ${location}` },
          { status: "filed", fileLocation: location },
        );
      },
      markAllRead: () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true }))),
      toggleRead: (id) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))),
    };
  }, [session, docs, notifs, appendEvent, pushNotification]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppStoreProvider");
  return ctx;
}

export const allWorkflows = workflows;
