import { randomUUID } from 'node:crypto';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { findActiveAccountByEmail, getActiveAccount, type UserAccount } from './users.ts';

/*
 * Owner-granted sharing of one's own timesheets (FR-17, AC-16, WP3-REQ C as amended by WP3-REQ2
 * item 4). A share carries three items: timesheets (none, view or edit), read-only OT summary and
 * ledger, and final PDF downloads. Only the owner grants or changes a share, and only for the
 * owner's own timesheets, so a share is never transitive; the owner, the grantee (leaving) or an
 * administrator may revoke it. A change of items revokes the row and inserts its replacement in
 * one IMMEDIATE transaction. Access is resolved live on every request and requires both accounts
 * to be active; a write re-checks it inside its own transaction (`requireShareAccess`).
 *
 * Audit events (`share.grant`, `share.change`, `share.revoke`, `share.pdf_download`) record the
 * actor and the owner and carry ids and items only: no email address, name or timesheet content.
 */

export type TimesheetsScope = 'none' | 'view' | 'edit';

export interface ShareItems {
  timesheets: TimesheetsScope;
  otRead: boolean;
  pdfDownload: boolean;
}

/** What one shared route needs from a share (WP3-REQ2 item 4 matrix). */
export type ShareAccess = 'timesheets_view' | 'timesheets_edit' | 'ot_read' | 'pdf_download' | 'revision_list';

export function shareAllows(items: ShareItems, access: ShareAccess): boolean {
  switch (access) {
    case 'timesheets_view':
      return items.timesheets !== 'none';
    case 'timesheets_edit':
      return items.timesheets === 'edit';
    case 'ot_read':
      return items.otRead;
    case 'pdf_download':
      return items.pdfDownload;
    case 'revision_list':
      return items.timesheets !== 'none' || items.pdfDownload;
  }
}

export const grantScope = (): ApiError => new ApiError(403, 'grant_scope', 'This share does not include this action');

/** One answer for no share, a revoked share, an inactive account and a wrong owner. */
export const noShare = (): ApiError => notFound('Shared timesheet');

interface ShareRow {
  id: string;
  owner_user_id: string;
  grantee_user_id: string;
  timesheets_scope: TimesheetsScope;
  ot_read: number;
  pdf_download: number;
  created_by: string;
  created_at: string;
  revoked_by: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
}

const SHARE_COLUMNS =
  's.id, s.owner_user_id, s.grantee_user_id, s.timesheets_scope, s.ot_read, s.pdf_download, s.created_by, s.created_at, ' +
  's.revoked_by, s.revoked_at, s.revoke_reason';

function itemsOf(row: Pick<ShareRow, 'timesheets_scope' | 'ot_read' | 'pdf_download'>): ShareItems {
  return { timesheets: row.timesheets_scope, otRead: row.ot_read === 1, pdfDownload: row.pdf_download === 1 };
}

export function itemsJson(items: ShareItems) {
  return { timesheets: items.timesheets, ot_read: items.otRead, pdf_download: items.pdfDownload };
}

function sameItems(a: ShareItems, b: ShareItems): boolean {
  return a.timesheets === b.timesheets && a.otRead === b.otRead && a.pdfDownload === b.pdfDownload;
}

function checkItems(items: ShareItems): ShareItems {
  if (items.timesheets === 'none' && !items.otRead && !items.pdfDownload) {
    throw new ApiError(422, 'no_share_items', 'Turn on at least one shared item');
  }
  return items;
}

export interface ActiveShare {
  id: string;
  items: ShareItems;
  owner: UserAccount;
  granteeUserId: string;
}

/**
 * The live share from `ownerUserId` to `granteeUserId`: the active row while both accounts are
 * active, otherwise null. Read on every shared request, never cached.
 */
export function resolveActiveShare(db: Db, ownerUserId: string, granteeUserId: string): ActiveShare | null {
  const row = db
    .prepare(
      `SELECT ${SHARE_COLUMNS} FROM timesheet_shares s
         JOIN users g ON g.id = s.grantee_user_id AND g.status = 'active'
        WHERE s.owner_user_id = ? AND s.grantee_user_id = ? AND s.revoked_at IS NULL`,
    )
    .get(ownerUserId, granteeUserId) as ShareRow | undefined;
  if (row === undefined) return null;
  const owner = getActiveAccount(db, row.owner_user_id);
  if (owner === undefined) return null;
  return { id: row.id, items: itemsOf(row), owner, granteeUserId: row.grantee_user_id };
}

/** The share check of one shared action: 404 without a live share, 403 `grant_scope` without the item. */
export function requireShareAccess(db: Db, ownerUserId: string, granteeUserId: string, access: ShareAccess): ActiveShare {
  const share = resolveActiveShare(db, ownerUserId, granteeUserId);
  if (share === null) throw noShare();
  if (!shareAllows(share.items, access)) throw grantScope();
  return share;
}

function activeShareById(db: Db, shareId: string): ShareRow | undefined {
  return db.prepare(`SELECT ${SHARE_COLUMNS} FROM timesheet_shares s WHERE s.id = ? AND s.revoked_at IS NULL`).get(shareId) as
    | ShareRow
    | undefined;
}

function insertShare(db: Db, ownerUserId: string, granteeUserId: string, items: ShareItems, now: string): string {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO timesheet_shares (id, owner_user_id, grantee_user_id, timesheets_scope, ot_read, pdf_download, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, ownerUserId, granteeUserId, items.timesheets, items.otRead ? 1 : 0, items.pdfDownload ? 1 : 0, ownerUserId, now);
  return id;
}

function markRevoked(db: Db, shareId: string, actorUserId: string, reason: string | null, now: string): void {
  const result = db
    .prepare('UPDATE timesheet_shares SET revoked_by = ?, revoked_at = ?, revoke_reason = ? WHERE id = ? AND revoked_at IS NULL')
    .run(actorUserId, now, reason, shareId);
  if (result.changes !== 1) throw notFound('Share');
}

/* ---- Owner and grantee views ------------------------------------------------------------------ */

interface GivenRow extends ShareRow {
  grantee_display_name: string;
  grantee_email: string;
  grantee_status: string;
}

function givenJson(row: GivenRow) {
  return {
    id: row.id,
    grantee: { display_name: row.grantee_display_name, email: row.grantee_email, active: row.grantee_status === 'active' },
    items: itemsJson(itemsOf(row)),
    created_at: row.created_at,
  };
}

export type GivenShare = ReturnType<typeof givenJson>;

const GIVEN_SQL = `SELECT ${SHARE_COLUMNS}, g.display_name AS grantee_display_name, g.email AS grantee_email, g.status AS grantee_status
                     FROM timesheet_shares s JOIN users g ON g.id = s.grantee_user_id`;

function givenShare(db: Db, shareId: string): GivenShare {
  const row = db.prepare(`${GIVEN_SQL} WHERE s.id = ?`).get(shareId) as GivenRow | undefined;
  if (row === undefined) throw notFound('Share');
  return givenJson(row);
}

/** The owner's active shares, with each grantee's name, address and account status. */
export function listGivenShares(db: Db, ownerUserId: string): GivenShare[] {
  return (
    db.prepare(`${GIVEN_SQL} WHERE s.owner_user_id = ? AND s.revoked_at IS NULL ORDER BY s.created_at, s.rowid`).all(ownerUserId) as GivenRow[]
  ).map(givenJson);
}

interface ReceivedRow extends ShareRow {
  owner_display_name: string;
  owner_email: string;
}

/** The shares the grantee holds from active owners: the owner id is what /api/shared/:ownerId needs. */
export function listReceivedShares(db: Db, granteeUserId: string) {
  const rows = db
    .prepare(
      `SELECT ${SHARE_COLUMNS}, o.display_name AS owner_display_name, o.email AS owner_email
         FROM timesheet_shares s JOIN users o ON o.id = s.owner_user_id AND o.status = 'active'
        WHERE s.grantee_user_id = ? AND s.revoked_at IS NULL
        ORDER BY s.created_at, s.rowid`,
    )
    .all(granteeUserId) as ReceivedRow[];
  return rows.map((row) => ({
    id: row.id,
    owner: { id: row.owner_user_id, display_name: row.owner_display_name, email: row.owner_email },
    items: itemsJson(itemsOf(row)),
    created_at: row.created_at,
  }));
}

/* ---- Grant, change, revoke ------------------------------------------------------------------- */

export interface GrantInput {
  ownerUserId: string;
  granteeEmail: string;
  items: ShareItems;
}

/**
 * The owner shares their own timesheets with the active account of exactly this address. An
 * unknown or deactivated address gets the same 422 `grantee_not_found`; the caller rate-limits it.
 */
export function grantShare(db: Db, clock: Clock, input: GrantInput): GivenShare {
  const items = checkItems(input.items);
  return writeTransaction(db, () => {
    const grantee = findActiveAccountByEmail(db, input.granteeEmail);
    if (grantee === undefined) {
      throw new ApiError(422, 'grantee_not_found', 'No active account can receive a share at this address');
    }
    if (grantee.id === input.ownerUserId) throw new ApiError(422, 'self_share', 'Your own timesheets are already yours');
    if (resolveExisting(db, input.ownerUserId, grantee.id)) {
      throw new ApiError(409, 'share_exists', 'This account already has a share; change its items instead');
    }
    const id = insertShare(db, input.ownerUserId, grantee.id, items, nowUtc(clock));
    recordAudit(db, clock, {
      actorUserId: input.ownerUserId,
      ownerUserId: input.ownerUserId,
      operation: 'share.grant',
      entityType: 'timesheet_share',
      entityId: id,
      after: itemsJson(items),
    });
    return givenShare(db, id);
  });
}

function resolveExisting(db: Db, ownerUserId: string, granteeUserId: string): boolean {
  return (
    db
      .prepare('SELECT 1 FROM timesheet_shares WHERE owner_user_id = ? AND grantee_user_id = ? AND revoked_at IS NULL')
      .get(ownerUserId, granteeUserId) !== undefined
  );
}

export interface ChangeInput {
  ownerUserId: string;
  shareId: string;
  items: ShareItems;
}

/** The owner changes the items: the row is revoked and replaced in one transaction; equal items change nothing. */
export function changeShare(db: Db, clock: Clock, input: ChangeInput): { share: GivenShare; changed: boolean } {
  const items = checkItems(input.items);
  return writeTransaction(db, () => {
    const row = activeShareById(db, input.shareId);
    if (row === undefined || row.owner_user_id !== input.ownerUserId) throw notFound('Share');
    const before = itemsOf(row);
    if (sameItems(before, items)) return { share: givenShare(db, row.id), changed: false };
    const now = nowUtc(clock);
    markRevoked(db, row.id, input.ownerUserId, null, now);
    const id = insertShare(db, row.owner_user_id, row.grantee_user_id, items, now);
    recordAudit(db, clock, {
      actorUserId: input.ownerUserId,
      ownerUserId: row.owner_user_id,
      operation: 'share.change',
      entityType: 'timesheet_share',
      entityId: id,
      before: { share_id: row.id, ...itemsJson(before) },
      after: { share_id: id, ...itemsJson(items) },
    });
    return { share: givenShare(db, id), changed: true };
  });
}

export type RevokerRole = 'owner' | 'grantee' | 'admin';

export interface RevokeInput {
  actorUserId: string;
  shareId: string;
  reason: string | null;
}

function revoke(db: Db, clock: Clock, row: ShareRow, input: RevokeInput, role: RevokerRole): string {
  const now = nowUtc(clock);
  markRevoked(db, row.id, input.actorUserId, input.reason, now);
  recordAudit(db, clock, {
    actorUserId: input.actorUserId,
    ownerUserId: row.owner_user_id,
    operation: 'share.revoke',
    entityType: 'timesheet_share',
    entityId: row.id,
    reason: input.reason,
    before: itemsJson(itemsOf(row)),
    after: { revoked_by_role: role },
  });
  return now;
}

/**
 * The owner revokes a share, or the grantee leaves it; anyone else (an administrator included,
 * who has its own route) gets 404. Effective on the next request.
 */
export function revokeOwnShare(db: Db, clock: Clock, input: RevokeInput) {
  return writeTransaction(db, () => {
    const row = activeShareById(db, input.shareId);
    if (row === undefined) throw notFound('Share');
    let role: RevokerRole;
    if (row.owner_user_id === input.actorUserId) role = 'owner';
    else if (row.grantee_user_id === input.actorUserId) role = 'grantee';
    else throw notFound('Share');
    const revokedAt = revoke(db, clock, row, input, role);
    return { id: row.id, role, revoked_at: revokedAt };
  });
}

/* ---- Administration: list and revoke, never create or use -------------------------------------- */

interface AdminRow extends ShareRow {
  owner_display_name: string;
  grantee_display_name: string;
}

function revokerRole(row: ShareRow): RevokerRole | null {
  if (row.revoked_by === null) return null;
  if (row.revoked_by === row.owner_user_id) return 'owner';
  if (row.revoked_by === row.grantee_user_id) return 'grantee';
  return 'admin';
}

function adminJson(row: AdminRow) {
  return {
    id: row.id,
    owner: { id: row.owner_user_id, display_name: row.owner_display_name },
    grantee: { id: row.grantee_user_id, display_name: row.grantee_display_name },
    items: itemsJson(itemsOf(row)),
    created_at: row.created_at,
    revoked_at: row.revoked_at,
    revoked_by_role: revokerRole(row),
  };
}

const ADMIN_SQL = `SELECT ${SHARE_COLUMNS}, o.display_name AS owner_display_name, g.display_name AS grantee_display_name
                     FROM timesheet_shares s
                     JOIN users o ON o.id = s.owner_user_id
                     JOIN users g ON g.id = s.grantee_user_id`;

export const MAX_ADMIN_SHARES = 1000;

/** Every grant, newest first: names, items and instants only, never an address or timesheet content. */
export function listAllShares(db: Db) {
  return (db.prepare(`${ADMIN_SQL} ORDER BY s.created_at DESC, s.rowid DESC LIMIT ?`).all(MAX_ADMIN_SHARES) as AdminRow[]).map(adminJson);
}

/** An administrator revokes an active share (for security); the audit names the administrator as actor. */
export function adminRevokeShare(db: Db, clock: Clock, input: RevokeInput) {
  return writeTransaction(db, () => {
    const row = activeShareById(db, input.shareId);
    if (row === undefined) throw notFound('Share');
    revoke(db, clock, row, input, 'admin');
    return adminJson(db.prepare(`${ADMIN_SQL} WHERE s.id = ?`).get(row.id) as AdminRow);
  });
}

/* ---- Audited grantee PDF download -------------------------------------------------------------- */

export interface SharedPdfDownload {
  ownerUserId: string;
  granteeUserId: string;
  revisionId: string;
  payrollDate: string;
  revisionNo: number;
}

/**
 * Records one grantee download of the owner's final PDF, after re-checking the PDF item inside the
 * same IMMEDIATE transaction; a refusal throws before anything is written or sent.
 */
export function recordSharedPdfDownload(db: Db, clock: Clock, input: SharedPdfDownload): void {
  writeTransaction(db, () => {
    requireShareAccess(db, input.ownerUserId, input.granteeUserId, 'pdf_download');
    recordAudit(db, clock, {
      actorUserId: input.granteeUserId,
      ownerUserId: input.ownerUserId,
      operation: 'share.pdf_download',
      entityType: 'timesheet_revision',
      entityId: input.revisionId,
      after: { payroll_date: input.payrollDate, revision_no: input.revisionNo },
    });
  });
}
