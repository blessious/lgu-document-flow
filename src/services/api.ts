// Data/service layer.
// Everything here is backed by in-memory mocks today. Each function is
// async so the future Node.js + MySQL REST API can be dropped in by
// replacing the body with a `fetch()` call — no UI changes required.

import {
  auditEntries,
  documentTypes,
  documents,
  notifications,
  offices,
  statusDistribution,
  turnaroundByOffice,
  users,
  volumeByDay,
  workflows,
} from "@/data/mock";
import type {
  AuditEntry,
  DocumentType,
  NotificationItem,
  Office,
  TrackedDocument,
  User,
  Workflow,
} from "@/types";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async listOffices(): Promise<Office[]> {
    await delay();
    return offices;
  },
  async listUsers(): Promise<User[]> {
    await delay();
    return users;
  },
  async listDocuments(): Promise<TrackedDocument[]> {
    await delay();
    return documents;
  },
  async listDocumentTypes(): Promise<DocumentType[]> {
    await delay();
    return documentTypes;
  },
  async listWorkflows(): Promise<Workflow[]> {
    await delay();
    return workflows;
  },
  async listNotifications(): Promise<NotificationItem[]> {
    await delay();
    return notifications;
  },
  async listAudit(): Promise<AuditEntry[]> {
    await delay();
    return auditEntries;
  },
  async analytics() {
    await delay();
    return { volumeByDay, turnaroundByOffice, statusDistribution };
  },
};

// ---- Lookup helpers (synchronous, safe for render) ----

export const officeById = (id?: string) => offices.find((o) => o.id === id);
export const officeName = (id?: string) => officeById(id)?.name ?? "—";
export const officeCode = (id?: string) => officeById(id)?.code ?? "—";
export const userById = (id?: string) => users.find((u) => u.id === id);
export const userName = (id?: string) => userById(id)?.name ?? "System";
export const docTypeById = (id?: string) => documentTypes.find((t) => t.id === id);
export const docTypeName = (id?: string) => docTypeById(id)?.name ?? "—";
export const workflowById = (id?: string) => workflows.find((w) => w.id === id);

export { volumeByDay, turnaroundByOffice, statusDistribution };
