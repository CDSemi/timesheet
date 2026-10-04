# WP3-REQ dispatch brief

- Mission/task: timesheet-software-readiness / WP3-REQ; package WP3; kind plan; attempt 1;
  depends on WP3-PLAN. Runs read-only beside WP3-T05 (the single source writer).
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`
  (canonical rule changes to the privacy boundary and a new authorization feature).
  Routing: size L, risk H, novelty yes. Record in English; read-only planning, no edits
  outside your owned paths.
- Read AGENTS.md from disk first (rules 2, 4, 7 and 8 and the UI section). Then read:
  - the owner's answers, verbatim, in the board `owner_decisions` entry of 2026-10-04
    that starts "OK tiếp tục đi" (handoff/delivery/ORCHESTRATION.json, read-only), and
    the coordinator decision of the same date;
  - [WP3-PLAN](WP3-PLAN.md) (the whole plan, especially "Common checks", B, C, E, F and G);
  - the results of WP3-T00, T01, T02, T03, T04 and T07 (frozen) and the T05 brief;
  - the canonical documents 01–07, 09 and 10 (English; read the matching `.vi.md` only
    where you draft Vietnamese text), and [WP2_HANDOFF](../WP2_HANDOFF.md) (the WP2-A-01
    privacy decision and the carry-forward);
  - the current source read-only: routes, ownership guards, audit, migrations,
    `src/server/pdf/`, `src/domain/snapshot.ts`, the submission settings service.
- Baseline: main at c289375a8d80c78ea9f3a9e54ff55a795f99ec7b. WP3-T05 edits
  src/server/services/finalization.ts, revisionLedger.ts, routes/submission.ts,
  http/schemas.ts and its tests while you read; treat those as in flux.
- Runtime: call Node 24 by full path if you run anything. Never write into the
  repository root. On Windows, never redirect to /dev/null or nul from a POSIX shell.

## The owner's answers (summary; the verbatim board entry is authoritative)

- F-2 and F-4, F-5: the WP3-PLAN recommendations are adopted.
- F-1 (modified): at the deadline, a period with no saved entries is still submitted
  automatically with the default labels. OT is not counted by default (the employee may
  update the OT hours later). The "employee review pending" notice is not shown by
  default; a settings option can turn it on. No deficit.
- F-3 (modified): the admin sees everything except each person's timesheet details. An
  individual may share view-only or edit access to their own timesheets with another
  person.

## Required output (append under Results)

A. **Canonical text changes.** For each of F-1..F-5, the exact edits as file:line with the
   current text and the proposed English text, plus the matching Vietnamese text for the
   `.vi.md` files, in docs 01–07, 09 and 10 (a decision entry in docs/10). Name every
   current statement that the answers contradict (for example the automatic-submission
   pending disclosure in docs/04 and docs/05 and AC-07/AC-10 in docs/06; the admin privacy
   boundary in docs/01 and docs/03; the status view in docs/07; the WP2 gate wording in
   docs/09). Define "timesheet details" precisely for F-3 (which records and fields an
   admin may and may not see: day entries, sessions, breaks, leave, OT ledger lines,
   evidence exports, review snapshots, PDFs, signature images, delivery attempts,
   recipients, audit payloads) and list what the admin sees.
B. **F-1 scope.** State whether the new "show employee review pending" setting should
   govern every automatic submission or only periods with no saved entries; give the
   recommended reading with reasons and flag it as an owner question if the answer is not
   clear from the owner's words. Specify the default-label submission, "OT not counted"
   (zero credited OT for days without records) and how the employee updates OT later
   (correction revision, T06).
C. **Timesheet-sharing specification** (draft, for the canonical docs): requirement ID and
   text; data model (grant records: owner, grantee, scope view|edit, created, revoked,
   audit; immutability or versioning); an authorization matrix for every existing and
   planned route and action (WP1 clock and sessions; WP2 day entries, batch, leave, OT
   ledger and leave requests, evidence export, history, personal settings; WP3 review,
   sign-off, signatures, PDF downloads, deliveries, resend, corrections, submission
   settings, auto-image authorization). Mark actions a delegate can never take, with
   reasons (for example signing off with the owner's signature, changing recipients or
   auto-image authorization, re-sharing). Cover revocation, audit attribution (actor
   versus owner), notifications, admin visibility of grants, and the UI. Give recommended
   defaults.
D. **Impact.** Concrete file-level changes required in frozen WP3 work (T01–T04, T07: for
   example a settings column and migration 0005, a snapshot field, the renderer banner
   condition, email template text) and in accepted WP1/WP2 code (ownership guards that
   must accept a grant), and the tests that pin current owner-only behaviour and must
   change. Say whether WP2-A-01 (removed employee-derived holiday-preview counts) and A3-01
   change under F-3; recommend, and do not plan a reversal without an owner decision.
E. **Revised plan.** Where the canonical doc update runs (its own writer task, after the
   T05 freeze), which new or changed tasks absorb F-1 and F-3 (IDs, size/risk/novelty,
   profile/model per docs/08, owned paths, dependencies, tests, freeze points), where the
   sharing feature goes (within WP3 after a named task, or a separate slice before WP4,
   with reasons), changes to the WP3 gate and the audit areas, and the new critical path.
   Keep one writer at a time.
F. **Owner questions.** Only genuine decisions, at most six, each with a recommended option
   and its consequence, ordered by when the plan needs them.
G. **Risks.** Privacy and security risks of the wider admin visibility and of delegate
   access, and mitigations (least privilege, audit, tests).

- Writable: this file and handoff/delivery/evidence/WP3-REQ/ (read-only command outputs,
  masked, LF, single final newline). Everything else read-only. No commits.
- Return at most 400 words, beginning with your self-reported model: the contradicted
  canonical statements, the sharing feature placement, the impact on frozen tasks, the
  owner questions, and the new critical path.

## Results

(Planner appends here.)

### Planner result (attempt 1, 2026-10-04)

- Self-reported model: claude-opus-5-5 (profile timesheet-planner; effort not observable).
- Baseline observed: HEAD `c289375a8d80c78ea9f3a9e54ff55a795f99ec7b` (= T07 freeze). Working tree: coordinator
  records under `handoff/` plus WP3-T05's in-flight `tests/support/concurrency.ts` and
  `tests/integration/finalization.test.ts` (not used for planning, not touched).
- Read-only. Evidence: [00-baseline.txt](../evidence/WP3-REQ/00-baseline.txt),
  [01-route-inventory.txt](../evidence/WP3-REQ/01-route-inventory.txt),
  [02-canonical-lines.txt](../evidence/WP3-REQ/02-canonical-lines.txt),
  [03-pinned-behaviour.txt](../evidence/WP3-REQ/03-pinned-behaviour.txt). No Node run was needed.
- Freeze commits of the frozen work: T00 `db75346`, T01 `ac5d0ba`, T02 `b060d33`, T03 `79862bb`, T04 `b89f8a8`,
  T07 `c289375`.

#### Observations (facts from the source, not assumptions)

- O1. Every personal route takes its subject from the session: `c.get('user')` in `routes/api.ts`, `ot.ts`,
  `history.ts`, `settings.ts`, `signatures.ts`, `submission.ts` (evidence 01). Services take that `SessionUser` as
  the owner (`loadScope(db, user)`, `user.id`, `user.calendarId`, `user.displayName` as the employee name).
- O2. `audit_events` already separates `actor_user_id` and `owner_user_id` (`services/audit.ts:5-14`), but
  `timesheetCommands.ts:123-125` writes `ctx.user.id` into both. Migration 0004 already keeps actors apart from
  owners: `submission_settings.created_by`, `timesheet_revisions.actor_user_id`,
  `delivery_attempts.decision_actor_user_id`.
- O3. Owner history hides other actors on purpose: `services/history.ts:7-13` ("an event performed by someone else
  is flagged, not attributed"); `tests/integration/history.test.ts:65-72` pins it.
- O4. The automatic notice is unconditional today: `pdf/timesheetPdf.ts:271-276` draws the "Employee review
  pending" banner whenever `origin === 'automatic'`; the origin label "automatic submission" is also printed at
  `:261-263` (header) and `:330` (footer). `submissionSettings.ts:444-448` renders `{SignOffStatus}` as "Automatic
  submission - employee review pending"; `http/schemas.ts:274` allows `sign_off: signed | review_pending`. Tests pin
  it: `pdf-render.test.ts:300-302`, `submission-settings.test.ts:478-481`.
- O5. The snapshot has no notice field (`domain/snapshot.ts:91-129`, `SNAPSHOT_VERSION = 1`); `canonical.test.ts:274`
  pins that version 2 is refused.
- O6. Days with no records already credit zero and are not counted as OT-pending: `timesheets.ts:449` counts only
  `incomplete`/`incomplete_breaks` in `pending_days`; `reviewPayload.ts:184-185` lists `no_records` days as
  unresolved inputs. "OT not counted" for empty days therefore needs no engine change.
- O7. `postCorrection` requires an existing original ledger entry (`ledger.ts:355-359`, 404 otherwise). A later OT
  update for a day that credited nothing at automatic submission needs a first credit, not a correction.
- O8. The admin router is pinned as account/calendar administration only: `isolation.test.ts:275-301` (exact route
  list; a regex refusing `timesheet|day|session|ledger|leave|history|evidence|export|policy` in admin paths; a source
  scan refusing `timesheet_`/`audit_events` and timesheet modules in `admin.ts`).
- O9. Submission settings have no notice column (`0004_submission.ts:67-91`); 0004 is frozen, so a new column needs
  migration 0005.

#### A. Canonical text changes (exact drafts)

Format: file:line, current text, proposed English, then the Vietnamese for the `.vi.md` line with the same content
(VI line in brackets). The F-1 and F-3 drafts assume the recommended options of F-Q1..F-Q5 (section F); a different
owner answer changes only the clause marked with that question.

**Contradicted canonical statements (AGENTS rule 8; flagged, not resolved here).**

| # | Location | Current statement | Contradicted by |
|---|---|---|---|
| C1 | docs/05_SUBMISSION_AND_NOTIFICATIONS.md:19 | "finalize valid attendance as **automatic; employee review pending**" | F-1: an empty period is submitted with default labels; the notice is off by default |
| C2 | docs/05_SUBMISSION_AND_NOTIFICATIONS.md:24 | "signed_at stays empty and pending review remains visible" | F-1: the notice is a setting, default off |
| C3 | docs/04_UX_AND_SETTINGS.md:56 | "Automatic PDF/email visibly says employee review is pending." | F-1 |
| C4 | docs/04_UX_AND_SETTINGS.md:40 | "Automatic submission uses valid saved attendance and marks unresolved OT pending." | F-1: also empty periods; days without records count no OT (not "pending") |
| C5 | docs/06_TEST_AND_ACCEPTANCE.md:15 | AC-07 "pending-review disclosure" | F-1 |
| C6 | docs/01_PRODUCT_REQUIREMENTS.md:36 | "Administrator status does not automatically grant private timesheet/signature access." | F-3 (refined: the admin sees all but timesheet details; sharing exists) |
| C7 | docs/03_ARCHITECTURE_AND_DATA.md:33 | "Admin manages accounts/configuration; access to private employee data requires a separate explicit permission." | F-3: the admin sees per-person operational data; the explicit permission becomes the owner's grant |
| C8 | docs/07_DEPLOYMENT_AND_OPERATIONS.md:36 | status view with "delivery backlog/faults/uncertainty" (scope undefined; WP3-PLAN F-3 recommended totals only) | F-3: per person and period is allowed, without details |
| C9 | docs/06_TEST_AND_ACCEPTANCE.md:9 | AC-01 "Two users cannot read/edit each other's times..." (absolute) | F-3 sharing |
| C10 | docs/03_ARCHITECTURE_AND_DATA.md:37; docs/05_SUBMISSION_AND_NOTIFICATIONS.md:56 | "Validate ownership/version on each action"; "Archived downloads require ownership." | F-3 sharing (grants), refined by F-Q4 |
| C11 | docs/09_IMPLEMENTATION_ROADMAP.md:33,37 and the mirrored lines `handoff/prompts/WP3_IMPLEMENT.md:17,21`, `WP3_REVIEW.md:17` (+ `.vi.md`) | WP3 scope/gate without sharing or the notice setting | F-1, F-3 |
| — | docs/09_IMPLEMENTATION_ROADMAP.md:25 | WP2 gate "admin is not blanket private-data access" | Not contradicted (still true); accepted WP2 history, leave unchanged |

Not contradicted (keep): docs/02:56 "automatic submission in choose mode leaves it pending with no debit"; docs/02:60
"Automatic origin remains unconfirmed"; docs/03:26 sign-off "absent on unsigned automation"; docs/05:30 outcome
notice; docs/10 D-09 "no fabricated sign-off"; docs/01:32 "Planned attendance labels are not ... employee
attestations".

**F-1 (notice setting, empty periods).**

1. docs/04_UX_AND_SETTINGS.md, defaults table after line 29 (new row). EN:
   `| Employee review pending notice on automatic submission | Off; the user may turn it on in Settings |`
   VI (after [29]): `| Thông báo "Chờ nhân viên xác nhận" khi tự nộp | Tắt; user có thể bật trong Settings |`
2. docs/04_UX_AND_SETTINGS.md:40, replace the last sentence. Current: "Automatic submission uses valid saved
   attendance and marks unresolved OT pending." EN: "Automatic submission uses valid saved attendance; for a period
   with no saved entries it uses the default labels (FR-03). Days without records credit no OT and create no
   deficit; incomplete days keep OT pending. The employee may add records later and correct the period (document
   05)." VI [40], current "Tự nộp dùng loại ngày hợp lệ đã lưu và ghi OT chưa giải quyết là chờ.": "Tự nộp dùng loại
   ngày hợp lệ đã lưu; kỳ chưa lưu dữ liệu nào thì dùng nhãn mặc định (FR-03). Ngày không có bản ghi không được tính
   OT và không tính thiếu giờ; ngày chưa đủ giữ OT ở trạng thái chờ. Nhân viên có thể bổ sung bản ghi sau và sửa kỳ
   (tài liệu 05)."
3. docs/04_UX_AND_SETTINGS.md:56, replace the first sentence. Current: "Automatic PDF/email visibly says employee
   review is pending." EN: "Automatic PDF/email always identify the revision as an automatic submission and never
   show a sign date or claim a signature; they add the "Employee review pending" notice only when the user's setting
   is on (default off)." [F-Q2] VI [56], current "PDF/email tự nộp ghi rõ đang chờ nhân viên xác nhận.": "PDF/email tự
   nộp luôn ghi rõ đây là bản tự nộp, không bao giờ hiện ngày ký hay tuyên bố đã ký; chỉ thêm thông báo "Chờ nhân
   viên xác nhận" khi user bật setting này (mặc định tắt)."
4. docs/05_SUBMISSION_AND_NOTIFICATIONS.md:19. Current: "- Unsigned draft + enabled switch: finalize valid attendance
   as **automatic; employee review pending**; post only computable credits/authorized deficits; enqueue PDF/email."
   EN: "- Unsigned draft + enabled switch: finalize valid saved attendance—or the default labels when the period has
   no saved entries—as **automatic**, with employee review recorded as pending; post only computable
   credits/authorized deficits (days without records post no OT and no deficit); enqueue PDF/email." VI [19]: "- Nháp
   chưa ký + bật: chốt loại ngày hợp lệ đã lưu—hoặc nhãn mặc định khi kỳ chưa lưu dữ liệu nào—là **tự động**, trạng
   thái nhân viên xác nhận ghi là chờ; chỉ ghi OT tính được/khoản trừ đã cho phép (ngày không có bản ghi không ghi OT
   và không tính thiếu); xếp PDF/email."
5. docs/05_SUBMISSION_AND_NOTIFICATIONS.md:24. Current: "Automatic image inclusion is separately off by default.
   Explicit prior authorization may enable it, but signed_at stays empty and pending review remains visible." EN:
   "Automatic image inclusion is separately off by default. Explicit prior authorization may enable it, but signed_at
   stays empty and no sign-off is recorded. The "Employee review pending" notice on the automatic PDF/email follows
   the user's setting (default off) and applies to every automatic submission [F-Q1]; the employee's own screens and
   the outcome notice always show that review is pending." VI [24]: "Ảnh ký tự động là tùy chọn riêng mặc định tắt.
   Cho phép trước rõ ràng có thể bật, nhưng signed_at vẫn trống và không ghi sign-off. Thông báo "Chờ nhân viên xác
   nhận" trên PDF/email tự nộp theo setting của user (mặc định tắt) và áp dụng cho mọi lần tự nộp; màn hình của chính
   nhân viên và thông báo kết quả luôn hiện là chờ xác nhận."
6. docs/05_SUBMISSION_AND_NOTIFICATIONS.md:54, append. EN: "After an automatic submission the employee may add
   records for days that credited no OT and finalize a reasoned correction; a day without an earlier credit posts a
   first credit, any other day only the difference." VI [54]: "Sau khi tự nộp, nhân viên có thể bổ sung bản ghi cho
   ngày chưa được tính OT rồi chốt bản sửa có lý do; ngày chưa có khoản cộng trước đó ghi khoản cộng đầu tiên, ngày
   khác chỉ ghi chênh lệch."
7. docs/06_TEST_AND_ACCEPTANCE.md:15 (AC-07). Current: "Auto-submit on/off, pending-review disclosure and image
   settings behave correctly". EN: "Auto-submit on/off, the pending-review notice setting (default off) and image
   settings behave correctly; an automatic revision never has a sign date or sign-off; a period without saved entries
   is submitted with default labels, no OT and no deficit". VI [15]: "Tự nộp bật/tắt, setting thông báo chờ xác nhận
   (mặc định tắt) và setting ảnh hoạt động đúng; revision tự động không bao giờ có ngày ký hay sign-off; kỳ chưa lưu
   dữ liệu được nộp theo nhãn mặc định, không OT, không thiếu giờ".

**F-2 (pending debit lifecycle; recommendation adopted).** docs/02_TIME_AND_OT_RULES.md:56, insert after
"Insufficient available balance leaves the proposed debit pending, not silently negative." EN: "A pending debit stays
a recorded line of its revision, shown on the review and OT screens; only a later finalized revision (correction or
late review) re-evaluates it, and no background process posts it." VI [56], after "Thiếu số dư khả dụng thì đề xuất
trừ chờ, không âm thầm âm.": "Khoản trừ chờ là một dòng được ghi của revision đó, hiện trên màn review và OT; chỉ một
revision chốt sau (sửa hoặc review muộn) đánh giá lại nó, và không tiến trình nền nào ghi nó."

**F-4 (activation scope; adopted).** docs/05_SUBMISSION_AND_NOTIFICATIONS.md:26, replace the first two sentences.
Current: "Record automation_active_from. By default only periods with due_at on/after activation are eligible;
imported history is excluded." EN: "Record one system-wide automation_active_from at the owner's activation (empty
until then, so nothing is finalized automatically before it). A period is eligible only when its due_at is on/after
both that instant and the user's auto-submit effective instant; imported history is excluded." VI [26], current "Ghi
automation_active_from. Mặc định chỉ kỳ có due_at từ thời điểm kích hoạt trở đi đủ điều kiện; loại lịch sử nhập.":
"Ghi một automation_active_from cho toàn hệ thống khi chủ kích hoạt (trống cho tới lúc đó, nên không có gì tự chốt
trước). Một kỳ chỉ đủ điều kiện khi due_at bằng/sau cả thời điểm đó và thời điểm hiệu lực tự nộp của user; loại lịch
sử nhập."

**F-5 (PDF total; adopted).** docs/04_UX_AND_SETTINGS.md:52: replace "total including both Sundays" with "the credited
OT total in h:mm over all 14 days, including both Sundays (hidden with the OT rows when Show OT on PDF is off)"; VI
[52]: replace "tổng có cả hai Chủ nhật" with "tổng OT được ghi dạng h:mm của cả 14 ngày, gồm hai Chủ nhật (ẩn cùng
dòng OT khi tắt Hiện OT trên PDF)". docs/06_TEST_AND_ACCEPTANCE.md:18 (AC-10): replace "both Sundays in total" with
"the credited OT total (h:mm) includes both Sundays"; VI [18]: replace "tổng có hai Chủ nhật" with "tổng OT được ghi
(h:mm) gồm hai Chủ nhật".

**F-3 (admin boundary and sharing).**

1. docs/01_PRODUCT_REQUIREMENTS.md:36. Current: "Two isolated test users must work throughout the first release.
   Administrator status does not automatically grant private timesheet/signature access. Future manager access needs
   explicit assignment." EN: "Two isolated test users must work throughout the first release. Administrators see
   accounts, configuration and operational status, including each person's submission and delivery status, but
   never the details of anyone's timesheets (document 03 defines them). Each person may share view-only or edit
   access to their own timesheets with another account and revoke it; sign-off, signatures, sending and personal
   settings stay with the owner. Future manager access needs explicit assignment." VI [36]: "Hai user test phải được
   cách ly trong toàn bộ bản đầu. Admin thấy tài khoản, cấu hình và tình trạng vận hành, gồm trạng thái nộp và gửi
   của từng người, nhưng không bao giờ thấy chi tiết timesheet của ai (tài liệu 03 định nghĩa). Mỗi người có thể chia
   sẻ quyền chỉ xem hoặc quyền sửa timesheet của chính mình cho một tài khoản khác và thu hồi; sign-off, chữ ký, gửi
   và settings cá nhân vẫn chỉ thuộc chủ. Quyền manager tương lai cần gán rõ."
2. docs/01_PRODUCT_REQUIREMENTS.md, table after line 24 (new row). EN: `| FR-17 | Owner-granted, revocable view-only or
   edit access to one's own timesheets; admin status without timesheet details | WP3 |` VI (after [24]): `| FR-17 |
   Chủ chia sẻ quyền chỉ xem hoặc sửa timesheet của mình, thu hồi được; admin xem tình trạng không có chi tiết
   timesheet | WP3 |`
3. docs/03_ARCHITECTURE_AND_DATA.md, records table after line 30 (new row). EN: `| timesheet_shares | Owner, grantee,
   scope view/edit, created by/at, revoked by/at; one active grant per owner and grantee; immutable except one
   revocation; never transitive |` VI (after [30]): `| timesheet_shares | Chủ, người được chia sẻ, phạm vi xem/sửa,
   người/lúc tạo, người/lúc thu hồi; mỗi cặp chủ–người nhận chỉ một quyền hiệu lực; bất biến trừ một lần thu hồi;
   không chia sẻ tiếp |`
4. docs/03_ARCHITECTURE_AND_DATA.md:33, replace "Admin manages accounts/configuration; access to private employee data
   requires a separate explicit permission." EN: "Admin manages accounts/configuration and sees operational
   information: accounts, calendars, sharing grants, each person's timesheet lifecycle, revision origin and review
   state, PDF and delivery states, redacted fault codes, settings flags and job/runner health. Timesheet details stay
   private: day entries, sessions and breaks, leave, notes, calculations, personal policies, OT ledger and balances,
   leave requests and permission evidence, evidence exports, review payloads and snapshots, PDFs, signature images,
   rendered email content, recipient addresses, templates and the audit payloads of personal records. Access to them
   requires the owner's explicit grant, also for an administrator." [F-Q3] VI [33], replace "Admin quản tài khoản/cấu
   hình; xem dữ liệu riêng cần quyền riêng rõ ràng.": "Admin quản tài khoản/cấu hình và thấy thông tin vận hành: tài
   khoản, lịch, quyền chia sẻ, vòng đời timesheet của từng người, nguồn và trạng thái xác nhận của revision, trạng
   thái PDF và gửi, mã lỗi đã che, cờ setting và sức khỏe job/runner. Chi tiết timesheet vẫn riêng tư: ngày, phiên và
   nghỉ, phép, ghi chú, phép tính, quy tắc cá nhân, sổ và số dư OT, yêu cầu nghỉ và bằng chứng cho phép, file xuất
   bằng chứng, payload/snapshot review, PDF, ảnh chữ ký, nội dung email đã dựng, địa chỉ người nhận, template và
   payload audit của bản ghi cá nhân. Xem chúng cần quyền chia sẻ rõ ràng của chủ, kể cả với admin."
5. docs/03_ARCHITECTURE_AND_DATA.md:37, replace "Validate ownership/version on each action." EN: "Validate ownership or
   an active grant of sufficient scope, and the version, on each action; the session user is the actor and the
   timesheet owner is the subject." VI [37], replace "Kiểm chủ/phiên bản ở mỗi thao tác.": "Kiểm chủ sở hữu hoặc quyền
   chia sẻ còn hiệu lực đủ phạm vi, và phiên bản, ở mỗi thao tác; user của session là người thực hiện, chủ timesheet
   là đối tượng."
6. docs/03_ARCHITECTURE_AND_DATA.md:45, in the route-group list after "private files," insert EN "sharing (grants and
   delegated access under an explicit owner path),"; VI [45] after "file riêng," insert "chia sẻ (cấp quyền và truy
   cập ủy quyền dưới path chủ rõ ràng),".
7. docs/04_UX_AND_SETTINGS.md:12. Current: "| Settings/admin | Personal policy/templates; users, annual holidays, sender
   and operational status with scoped access |" EN: "| Settings/admin | Personal policy/templates and sharing
   (grant/revoke view or edit); users, annual holidays, sender, sharing grants and per-person submission/delivery
   status without timesheet details |" VI [12]: "| Settings/admin | Quy tắc/template riêng và chia sẻ (cấp/thu hồi xem
   hoặc sửa); user, lễ năm, sender, quyền chia sẻ và trạng thái nộp/gửi từng người không có chi tiết timesheet |".
   New row after line 12, EN: `| Shared timesheets | A grantee opens an owner's timesheets from "Shared with me" under
   a persistent bar naming the owner and the scope; actions outside the grant are absent and refused by the server |`
   VI: `| Timesheet được chia sẻ | Người được chia sẻ mở timesheet của chủ từ "Được chia sẻ với tôi" với thanh cố định
   ghi tên chủ và phạm vi; thao tác ngoài quyền bị ẩn và server từ chối |`
8. docs/05_SUBMISSION_AND_NOTIFICATIONS.md:56, replace "Archived downloads require ownership." EN: "Archived downloads
   require ownership; a sharing grant does not include PDFs or signature images." [F-Q4] VI [56], replace "Tải lưu trữ
   cần quyền chủ.": "Tải lưu trữ cần quyền chủ; quyền chia sẻ không gồm PDF hay ảnh chữ ký."
9. docs/06_TEST_AND_ACCEPTANCE.md:9 (AC-01). EN: "Without a grant, two users cannot read/edit each other's times,
   ledger, PDFs, signatures or tokens by swapping IDs; admins see no timesheet details". VI [9]: "Không có quyền chia
   sẻ thì hai user không xem/sửa giờ, sổ, PDF, chữ ký, token của nhau bằng đổi ID; admin không thấy chi tiết
   timesheet". New row after line 23, EN: `| AC-16 | A grant reaches only its scope (view or edit timesheets), never
   sign-off, signatures, PDFs, sending, settings, ledger/leave or re-sharing; edits are attributed to the grantee;
   revocation or deactivation applies on the next request | WP3 |` VI: `| AC-16 | Quyền chia sẻ chỉ tới đúng phạm vi
   (xem hoặc sửa timesheet), không bao giờ sign-off, chữ ký, PDF, gửi, settings, sổ/phép hay chia sẻ tiếp; thao tác
   sửa ghi tên người được chia sẻ; thu hồi hoặc vô hiệu hóa có hiệu lực ở request kế tiếp | WP3 |`
10. docs/07_DEPLOYMENT_AND_OPERATIONS.md:36, replace the second sentence. Current: "An authenticated status view shows
    runner heartbeat, backup success, disk capacity, delivery backlog/faults/uncertainty and sender setup." EN: "An
    administrator status view shows runner heartbeat, backup success, disk capacity, sender setup and delivery
    backlog/faults/uncertainty per person and period, without timesheet details, message content or recipient
    addresses." VI [36]: "Màn hình admin hiện heartbeat runner, backup thành công, dung lượng, sender và backlog/lỗi/chưa
    rõ theo từng người và kỳ, không có chi tiết timesheet, nội dung thư hay địa chỉ người nhận."
11. docs/09_IMPLEMENTATION_ROADMAP.md:33, append EN "Add owner-granted timesheet sharing (view/edit) and the admin
    status boundary." VI [33]: "Thêm chia sẻ timesheet do chủ cấp (xem/sửa) và ranh giới tình trạng cho admin."
    docs/09:37, append to the gate EN "; AC-16, the pending-notice setting, empty-period automatic submission and admin
    status without timesheet details." VI [37]: "; AC-16, setting thông báo chờ xác nhận, tự nộp kỳ chưa có dữ liệu và
    tình trạng admin không có chi tiết timesheet." Mirror the gate text in `handoff/prompts/WP3_IMPLEMENT.md:17,21`,
    `handoff/prompts/WP3_REVIEW.md:17` and their `.vi.md` files.
12. docs/10_DECISIONS_AND_SOURCES.md:7, append to the confirmed requirements EN "Owner-granted view-only/edit sharing of
    one's own timesheets." VI [7]: "Chia sẻ quyền chỉ xem/sửa timesheet của chính mình do chủ cấp." New final section,
    EN:

    > ## Owner decisions — 2026-10-04 (WP3-PLAN F-1..F-5)
    >
    > Source: the owner's direct reply recorded in the task board, 2026-10-04.
    >
    > - F-1: at the deadline a period with no saved entries is still submitted automatically with the default labels.
    >   Days without records credit no OT (the employee may add records and correct later) and create no deficit. The
    >   "Employee review pending" notice on automatic PDF/email is off by default and a per-user setting turns it on;
    >   automatic revisions still record review as pending, never show a sign date and never claim a signature.
    > - F-2: a pending deficit debit stays a recorded pending line of its revision, shown on the review and OT screens,
    >   re-evaluated only by a later finalized revision; no background posting.
    > - F-3: administrators see everything except each person's timesheet details (document 03). An individual may
    >   share view-only or edit access to their own timesheets with another account; the grant is revocable, audited
    >   and never covers sign-off, signatures, PDFs, sending, personal settings or re-sharing.
    > - F-4: one system-wide activation instant (empty until the owner's pilot) combined with each user's auto-submit
    >   effective instant.
    > - F-5: the PDF total is the credited OT total in h:mm over all 14 days, hidden when Show OT on PDF is off.
    > - Unchanged: the accepted WP2 removal of employee-derived holiday-preview counts (WP2-A-01), because those counts
    >   derive from day entries, which are timesheet details.

    VI:

    > ## Quyết định của chủ — 2026-10-04 (WP3-PLAN F-1..F-5)
    >
    > Nguồn: câu trả lời trực tiếp của chủ ghi trong bảng task, 2026-10-04.
    >
    > - F-1: đến hạn, kỳ chưa lưu dữ liệu nào vẫn được tự nộp theo nhãn mặc định. Ngày không có bản ghi không được tính
    >   OT (nhân viên có thể bổ sung bản ghi và sửa sau) và không tính thiếu giờ. Thông báo "Chờ nhân viên xác nhận"
    >   trên PDF/email tự nộp mặc định tắt và có setting theo từng user để bật; revision tự động vẫn ghi trạng thái xác
    >   nhận là chờ, không bao giờ hiện ngày ký và không tuyên bố đã ký.
    > - F-2: khoản trừ thiếu giờ đang chờ là một dòng chờ được ghi của revision đó, hiện trên màn review và OT, chỉ
    >   được đánh giá lại bởi một revision chốt sau; không ghi nền.
    > - F-3: admin thấy mọi thứ trừ chi tiết timesheet của từng người (tài liệu 03). Cá nhân có thể chia sẻ quyền chỉ
    >   xem hoặc sửa timesheet của mình cho một tài khoản khác; quyền thu hồi được, có audit và không bao giờ gồm
    >   sign-off, chữ ký, PDF, gửi, settings cá nhân hay chia sẻ tiếp.
    > - F-4: một thời điểm kích hoạt toàn hệ thống (trống tới pilot của chủ) kết hợp thời điểm hiệu lực tự nộp của
    >   từng user.
    > - F-5: tổng trên PDF là tổng OT được ghi dạng h:mm của cả 14 ngày, ẩn khi tắt Hiện OT trên PDF.
    > - Không đổi: việc WP2 đã bỏ số đếm suy từ dữ liệu nhân viên trong preview lịch lễ (WP2-A-01), vì số đếm đó suy
    >   từ ngày công, là chi tiết timesheet.

13. Optional consistency (reference example, not prose): `reference/examples/policy.example.json:64-77` gains
    `"show_review_pending_notice": false` in `submission`.

**Definition of "timesheet details" (F-3), recommended.**

| Record / field | Admin without a grant |
|---|---|
| Accounts (id, email, name, role, status, calendar, created/updated) | Sees (unchanged) |
| Company calendars, holiday versions, payroll exceptions | Sees (unchanged) |
| Per person and period: period dates, due instant, lifecycle (no timesheet / draft / overdue / finalized), latest revision number, origin employee/deadline, review state pending/signed, `signed_at` instant, correction count | Sees (new) |
| PDF state (pending/ready/failed, redacted error code); job states; delivery attempt state, attempt count, `accepted_at`, redacted fault class (missing sender, missing recipient, auth, rejected, uncertain), decision needed yes/no | Sees (new) |
| Settings flags: auto-submit on/off and effective instant, auto-image authorized yes/no, notice on/off, show-OT on/off, signature on file yes/no, recipients configured yes/no | Sees (new) |
| Sharing grants: owner, grantee, scope, created/revoked instants | Sees; may revoke (new) |
| System: sender configured, outbound mode, runner heartbeat, activation instant, job totals by state, backup/disk (WP4) | Sees (new) |
| Day entries (category, source, leave minutes/kind, WFH, notes, confirmation) | Never |
| Work sessions and breaks (instants, zones, sources, confirmations) | Never |
| Calculations (raw/regular/non-working/eligible/credited, completeness, deficits, provisional) | Never |
| Personal work policies (B/N/M, breaks, deficit mode) | Never |
| OT ledger entries, balances, `revision_ledger_lines` | Never |
| OT leave requests, permission evidence, reservations, consumption | Never |
| Evidence exports (CSV) | Never |
| Review payloads, snapshots, payload hashes, rendered subject/body | Never |
| PDFs (bytes), signature images, the auto-image attachment | Never |
| Delivery envelopes (recipient addresses, subject, Message-ID), raw provider responses | Never [F-Q3] |
| Templates and recipient addresses in submission settings | Never [F-Q3] |
| Audit events of personal records (before/after JSON, reasons) and A3-01's `refreshed_pay_period` | Never |
| Counts derived from day entries or sessions (WP2-A-01) | Never |

#### B. F-1 scope

- Reading of the setting. The owner lists the notice inside the empty-period answer but describes it as a settings
  option with a default; a per-user setting naturally governs every automatic submission, and a notice that appeared
  only on non-empty periods would invert the risk (the empty period is the one with no attested data). Recommended
  reading: the setting governs **every** automatic submission. The words do not settle it: owner question F-Q1.
- What the setting changes: only the recipient-facing artefacts (the PDF banner and the `{SignOffStatus}` text). It
  never changes the record: `timesheet_revisions.review_state` stays `pending`, `signed_at` stays null, no `signoffs`
  row; the employee's own screens and the outcome notice (docs/05:30) always say review is pending. Recommended floor
  with the notice off (F-Q2): the factual origin label "automatic submission" stays in the PDF header/footer
  (`timesheetPdf.ts:261-263,330`), the Date line stays blank, and `{SignOffStatus}` renders "Automatic submission"
  (never "Signed"); with the notice on it renders today's "Automatic submission - employee review pending".
- Default-label submission: when the deadline job finds no `timesheets` row for an eligible period, it creates the
  row and finalizes the T04 snapshot built from the FR-03 defaults (`category_source` default, no sessions);
  `no_records` days stay listed as unresolved inputs (O6). Eligibility (F-4) is unchanged: activation instant, user
  auto-submit effective instant, not imported, unsigned and unfinalized.
- "OT not counted": `no_records` days credit 0 and post nothing (R-06 "Incomplete days post nothing"; O6: no engine
  change). Incomplete days (open session, unknown breaks) keep OT pending and post nothing. No deficit (R-05: only
  complete confirmed work creates one).
- Updating OT later: the employee adds records with a reason (old/finalized edit, R-07) and finalizes a correction
  revision (T06), which needs the owner's sign-off. No original credit exists for those days, so `postCorrection`
  cannot apply (O7): T06 must post a first credit with the day's revision-independent original key when the day has
  no posted original, and a revision-keyed correction (`rev:{revisionId}:day:{date}:correction`) otherwise, both
  recorded in `revision_ledger_lines`. A late review with unchanged content stays zero delta (LG-09).

#### C. Timesheet-sharing specification (draft for the canonical docs)

- Requirement FR-17 (A, F-3 item 2) and acceptance AC-16 (A, F-3 item 9).
- Data model (migration 0006, `timesheet_shares`): `id`, `owner_user_id` FK users, `grantee_user_id` FK users,
  `scope` `view|edit`, `created_by` (= owner), `created_at`, `revoked_at` null, `revoked_by` null (owner, grantee
  leaving, or admin), `revoke_reason` optional (≤ 500); CHECK owner ≠ grantee; partial UNIQUE index on
  `(owner_user_id, grantee_user_id) WHERE revoked_at IS NULL`; triggers: no DELETE, identity/scope/created fields
  immutable, revocation fields set once (NULL → value). A scope change = revoke + new grant in one transaction. Audit
  events `share.grant` and `share.revoke` with `owner_user_id` = owner, `actor_user_id` = actor, no personal content.
- Access resolution: a new explicit path `/api/shared/:ownerId/...` mounts an **allowlisted** subset of the personal
  routers; the existing `/api/...` routes stay self-only and unchanged. Middleware resolves the grant live from the DB
  on every request (like `requireAdmin`), requires both accounts active, and sets `actor` (session user) and
  `subject` (owner principal built from the owner's account, never from the session). No grant, a revoked grant, an
  inactive account or a wrong owner → 404 (no existence leak); a write with a view grant → 403 `grant_scope`. Writes
  re-check the grant inside the same IMMEDIATE transaction (revocation race). Object IDs (sessions) must belong to the
  subject (404 otherwise).
- Authorization matrix (✓ allowed, — refused; "never" = no grant can allow it):

| Area / route or action | Owner | View | Edit | Admin w/o grant | Reason when refused |
|---|---|---|---|---|---|
| WP1/WP2 `GET /calendar`, `/periods/current`, `/periods`, `/timesheets/:payrollDate`, `/days/:workDate`, `/sessions/:id` | ✓ | ✓ | ✓ | — | timesheet details |
| WP1/WP2 `PUT /days/:workDate`, `POST /days/:workDate/sessions`, `PUT`/`DELETE /sessions/:id`, `POST /days/batch` (preview/commit); old/finalized edits with a reason | ✓ | — | ✓ | — | |
| WP1 `POST /clock/in`, `/clock/out` (live clock) | ✓ | never | never [F-Q5] | — | a live clock record is the owner's real-time attestation from their own device; delegates use manual entry |
| WP1/WP2 `GET /policies` | ✓ | ✓ | ✓ | — | read-only, explains the calculations |
| WP1/WP2 `POST /policies`, `/policies/preview` | ✓ | never | never | — | personal calculation settings (deficit mode) |
| WP2 `GET /ot/summary`, `/ot/ledger` | ✓ | never [F-Q4] | never [F-Q4] | — | balances are not timesheets |
| WP2 `GET`/`POST /ot/leave`, `consume`/`cancel`/`reverse` | ✓ | never | never | — | spending OT and manager permission evidence are owner acts |
| WP2 `GET /ot/evidence.csv` | ✓ | never | never | — | a bulk export leaves the system with permission evidence |
| WP2 `GET /history` | ✓ | never | never | — | the full personal audit trail across all areas |
| Auth `/me`, `/logout`; WP2 personal settings screens | own | own | own | own | session-scoped, not delegable |
| WP3 `GET /timesheets/:payrollDate/review` | ✓ | never | never | — | sign-off preparation: recipients, email body, signature reference |
| WP3 `POST /timesheets/:payrollDate/signoff`, late review, correction finalization | ✓ | never | never | — | FR-10 explicit employee sign-off with the owner's name and image |
| WP3 `POST /signatures`, `GET /signatures/current`, `/signatures/:id` | ✓ | never | never | — | AGENTS rule 4 |
| WP3 PDF download of a revision | ✓ | never [F-Q4] | never [F-Q4] | — | the PDF embeds the signature image |
| WP3 revision list/status metadata (number, origin, review state, PDF and delivery state) | ✓ | ✓ | ✓ | ✓ (status only) | |
| WP3 delivery attempt detail (envelope, recipients) | ✓ | never | never | — | recipients and message content |
| WP3 `POST /revisions/:id/resend`, `POST /deliveries/:id/decision` | ✓ | never | never | — | sends mail to payroll in the owner's name |
| WP3 `GET`/`POST /settings/submission`, `/versions`, `/preview`, `auto-image/authorize`/`revoke` | ✓ | never | never | — | recipients, templates, automation and auto-image are personal authorizations |
| WP3 reminders and outcome notices | to owner | none | none | — | |
| Sharing `GET /shares` (given and received) | ✓ | own received | own received | — | |
| Sharing `POST /shares` (grant/change), `POST /shares/:id/revoke` | ✓ | leave own | leave own | — | re-sharing never: grants are not transitive |
| Admin `GET /admin/shares`, `POST /admin/shares/:id/revoke` | — | — | — | ✓ | the admin may list and revoke, never create or use |
| Admin `/admin/operations`, `/admin/submissions` (status per section A) | — | — | — | ✓ | no timesheet details |

- Revocation: by the owner (any time), the grantee (leave) or an admin (security). Effective on the next request; no
  session revocation is needed. Deactivating either account suspends access (live status check) without revoking the
  row.
- Audit attribution: every write through a grant records `actor_user_id` = grantee and `owner_user_id` = owner. The
  owner's History shows the grantee's display name for events performed under a grant (changes O3); events by anyone
  else stay unattributed.
- Notifications: in-app only in WP3 (the grantee sees "Shared with me" at the next sign-in; the owner sees the grant
  list). No new email kind. Recommended mitigation: the owner's Review shows "N day(s) last changed by <grantee>"
  since the owner's previous finalization (derived from audit, outside the snapshot hash).
- Admin visibility of grants: list (owner and grantee names, scope, instants) and revoke. An admin can be a grantee
  only through the owner's grant, like anyone else.
- UI: Settings → Sharing (grant by exact account email, scope view/edit, list, revoke); an AppShell "Shared with me"
  switcher; a persistent bar "Viewing <owner>'s timesheets — view only | can edit"; deep links `#/shared/{ownerId}/...`
  require login; disallowed actions are absent, not merely disabled; every new value a token per the AGENTS UI section.
- Recommended defaults: no grant exists by default; the form defaults to view; a grant covers all of the owner's
  timesheets (no per-period grants); no expiry; one active grant per pair; an unknown or inactive grantee email → 422
  `grantee_not_found` (authenticated and rate-limited; enumeration risk accepted for an internal tool, see G).

#### D. Impact

F-1 on frozen WP3 work (one delta task, T07B in E):

| Frozen task | File-level change | Tests that pin current behaviour and must change |
|---|---|---|
| T01 (`ac5d0ba`) | New `src/server/db/migrations/0005_review_notice.ts`: `ALTER TABLE submission_settings ADD COLUMN show_review_pending_notice INTEGER NOT NULL DEFAULT 0 CHECK (show_review_pending_notice IN (0, 1))`; register it in `migrations.ts`; 0004 unchanged | `tests/integration/migrations.test.ts` (schema version, upgrade from a v4 database, default 0) |
| T03 (`79862bb`) | `services/submissionSettings.ts` (type, row map, versioned save, default false, audit); `routes/settings.ts`; `http/schemas.ts:263-274` (optional `show_review_pending_notice`; `sign_off` gains `automatic`); `SIGN_OFF_LABELS` (`:444-448`) gains "Automatic submission" | `submission-settings.test.ts:478-481` (preview label per setting) |
| T04 (`b89f8a8`) | `domain/snapshot.ts`: `show_review_pending_notice: boolean`, `SNAPSHOT_VERSION` 2; `services/reviewPayload.ts` copies the flag from the effective settings | `canonical.test.ts:205,231,274`; `review-payload.test.ts:173`; the hash changes when the flag changes |
| T07 (`c289375`) | `pdf/timesheetPdf.ts:271`: banner only when `origin === 'automatic' && snapshot.show_review_pending_notice`; origin label and blank date unchanged | `pdf-render.test.ts:300-302` split into notice on/off; new: auto-image with the notice off has no date and keeps "automatic submission" |
| T00, T02 | none | none |
| T05 (in flux) | none on the manual path; the field only enters the hash | none |
| Planned | T09: `{SignOffStatus}` from the frozen flag; T10: empty-period finalization (create the timesheet row, default labels); T13: settings toggle | — |

F-3 admin boundary (no accepted code must change for this part; planned T13 scope moves to T13D):
- `routes/admin.ts` gains status and grant routes backed by a new `services/operationsStatus.ts` with a column
  allowlist (no `payload_json`, `envelope_json`, `provider_response`, `before_json`/`after_json`, recipients,
  templates).
- `tests/integration/isolation.test.ts:275-301` changes deliberately: the exact admin route list adds the new routes;
  the path regex stays (names such as `/operations`, `/submissions`, `/shares` pass it); the `admin.ts` import scan
  allows `services/operationsStatus.ts` and `services/shares.ts`; a new test asserts every admin response field is in
  the allowlist and that a seeded period's notes, minutes, session instants and recipients never appear.

F-3 sharing on accepted WP1/WP2 code and frozen WP3 code:
- `src/server/types.ts` (AppEnv gains `actor` and `subject`); `src/server/http/auth.ts` (`requireGrant(scope)`);
  `services/timesheetCommands.ts:54-58,114-125` (`CommandContext` gains `actor`; audit actor = actor);
  `services/dayEntries.ts` (batch passes the actor); `routes/api.ts` (router factory mounted at `/api` and, allowlisted,
  at `/api/shared/:ownerId`); `services/history.ts:7-13,74-84` (grantee attribution); `services/users.ts` (active
  grantee lookup by email); `app.ts` (mount); new `services/shares.ts`, `routes/shares.ts`, migration 0006.
- Frozen WP3 code: `routes/submission.ts` (review GET), `routes/signatures.ts` and `routes/settings.ts` stay self-only
  and are not mounted under `/api/shared`; a test pins that. T05's sign-off asserts actor === subject (defence in
  depth).
- Tests: existing owner-only tests stay valid (non-grantees still get 404). Changes: `history.test.ts:65-72`
  (delegate events carry a name); a new route-inventory test enumerating every `app.routes` entry under `/api/shared`
  against the matrix; red-first and mutation checks for each guard.

WP2-A-01 and A3-01 under F-3: **no change recommended.** WP2-A-01's per-date counts derive from day entries (timesheet
details), so they stay removed. A3-01's `refreshed_pay_period` reveals only timesheet existence, which F-3 now allows,
but it is an audit payload and no admin audit view is planned, so it stays hidden (least privilege). R3
(`calendar_in_use`) and WP2-A2-02 become consistent with F-3; no code change. Reversing WP2-A-01 needs an explicit
owner decision (F-Q6); none is planned.

#### E. Revised plan

Single writer throughout; each task ends with a freeze by `timesheet-committer`.

| ID | Title | S/R/N | Profile / model | Owned paths | Depends | Freeze |
|---|---|---|---|---|---|---|
| T05 | (running) sign-off finalization | L/H/yes | worker-high / opus | per its brief | T07 | T05-FREEZE |
| T06 | Corrections, late review, resend, plus a first credit for a day without an original (B, O7) | M/H/no | worker-high / sonnet | per WP3-PLAN | T05 | T06-FREEZE |
| WP3-DOC | Canonical text F-1..F-5 (EN+VI) and the prompt gate lines | M/M/no | worker / sonnet | `docs/01`–`07`, `09`, `10` (+ `.vi.md`), `handoff/prompts/WP3_IMPLEMENT{,.vi}.md`, `WP3_REVIEW{,.vi}.md`, `reference/examples/policy.example.json` | owner answers F-Q1..F-Q5; T06-FREEZE | DOC-FREEZE |
| T07B | Review-pending notice setting (migration 0005, settings, snapshot v2, renderer) | M/H/no | worker-high / sonnet | `src/server/db/migrations/0005_review_notice.ts`, `src/server/db/migrations.ts`, `src/server/services/submissionSettings.ts`, `src/server/routes/settings.ts`, `src/server/http/schemas.ts`, `src/domain/snapshot.ts`, `src/server/services/reviewPayload.ts`, `src/server/pdf/timesheetPdf.ts`, `tests/integration/{migrations,submission-settings,review-payload,pdf-render}.test.ts`, `tests/domain/canonical.test.ts` | DOC-FREEZE | T07B-FREEZE |
| T08, T09 | unchanged (T09 reads the frozen flag for `{SignOffStatus}`) | per plan | per plan | per plan | T07B | per plan |
| T10 | Deadline automation plus empty-period default-label submission | M/H/no | worker-high / sonnet | per plan | T09 | per plan |
| T11, T12 | unchanged | per plan | per plan | per plan | per plan | per plan |
| T13 | History/delivery UI and settings UI (with the notice toggle) | M/H/no | worker-high / sonnet | per plan minus the admin status paths | T12 | T13-FREEZE |
| T13D | Admin operations/submission status (F-3 boundary), server and UI | M/H/no | worker-high / sonnet | `src/server/services/operationsStatus.ts`, `src/server/routes/admin.ts`, `src/client/AdminScreen.tsx`, `src/client/components/OperationsStatus.tsx`, `src/client/api.ts`, `src/client/styles.css`, `tests/integration/operations-status.test.ts`, `tests/integration/isolation.test.ts` | T13 | T13D-FREEZE |
| T13A | Actor/subject seam, no behaviour change | M/H/no | worker-high / sonnet | `src/server/types.ts`, `src/server/http/auth.ts`, `src/server/services/timesheetCommands.ts`, `src/server/services/dayEntries.ts`, `src/server/routes/api.ts`, `tests/integration/edit-rules.test.ts`, `tests/integration/day-entries-batch.test.ts` | T13D | T13A-FREEZE |
| T13B | Sharing grants: migration 0006, service, routes, `/api/shared` allowlist, admin grant list/revoke, history attribution, matrix test | L/H/yes | worker-high / opus (size_risk: new authorization surface) | `src/server/db/migrations/0006_timesheet_shares.ts`, `src/server/db/migrations.ts`, `src/server/services/shares.ts`, `src/server/routes/shares.ts`, `src/server/app.ts`, `src/server/http/auth.ts`, `src/server/services/history.ts`, `src/server/services/users.ts`, `src/server/routes/admin.ts`, `tests/integration/{sharing,sharing-matrix,history,isolation,migrations}.test.ts` | T13A | T13B-FREEZE |
| T13C | Sharing UI (Settings → Sharing, "Shared with me", owner bar, review "changed by" hint) | M/H/no | worker-high / sonnet | `src/client/SettingsScreen.tsx`, `src/client/components/Sharing*.tsx`, `src/client/components/AppShell.tsx`, `src/client/App.tsx`, `src/client/api.ts`, `src/client/styles.css`, `tests/client/sharingModel.test.ts` | T13B | T13C-FREEZE |
| T14 | Plus e2e sharing (grant, view refuses writes, edit attributed, revoke, admin sees no details) and notice on/off PDF renders | M/M/yes | worker / sonnet | per plan plus `tests/e2e/sharing.spec.ts` | T13C | per plan |
| T15 | Handoff (adds FR-17 and AC-16) | S/L/no | worker / sonnet | per plan | T14 | package-final |

- Sharing placement: **inside WP3, after T13/T13D and before T14.** Reasons: the matrix must cover the final WP3
  routes (T06, T08, T09) and UI (T12, T13), so the route-inventory test is written once and complete; T14's e2e and
  the existing WP3 gate and audits then cover it without a second gate/audit cycle; the board's `authorized_scope` is
  WP1–WP5, so a separate package label would sit outside it. A slice before T06 would force rework of later routes;
  a slice after WP3 acceptance would need its own gate, audits and accept (about ten more dispatches).
- WP3 gate additions: (13) notice matrix: off (default) → no banner, origin label present, `{SignOffStatus}`
  "Automatic submission", `review_state` pending, `signed_at` null; on → banner; each combined with auto-image on/off;
  (14) empty-period automatic submission: default labels, zero OT, no deficit, one revision; (15) AC-16 matrix over
  the full route inventory, revocation and deactivation on the next request, no re-share, actor attribution, the write
  re-check inside the transaction; (16) admin responses: field allowlist, no timesheet details for a seeded period,
  the A3-01 assertion.
- Audit areas: A adds sharing authorization and the admin boundary; B adds the notice setting on PDF/email and the
  empty-period automation. An optional third area audit C (sharing only) if A's context is too large.
- New critical path: T05 → T06 → WP3-DOC → T07B → T08 → T09 → T10 → T11 → T12 → T13 → T13D → T13A → T13B → T13C →
  T14 → T15 → WP3-GATE → audits A and B (C optional) → fix rounds → accept. Owner answers F-Q1..F-Q5 are needed before
  WP3-DOC (after T06); if they come later, WP3-DOC and T07B may move to any slot before T08 without blocking T06.

#### F. Owner questions (ordered by need; all before WP3-DOC)

- **F-Q1 (F-1) Scope of the "show employee review pending" setting.** (a) Recommended: every automatic submission
  (one per-user setting, default off). (b) Only periods with no saved entries; other automatic submissions always show
  the notice. Consequence of (b): two rules, a snapshot rule on emptiness, more tests.
- **F-Q2 (F-1) What remains when the notice is off.** (a) Recommended: the small factual "automatic submission" label
  in the PDF header/footer, a blank sign date and `{SignOffStatus}` = "Automatic submission"; an authorized auto-image
  may still appear. (b) Additionally force the notice on whenever the auto-image is included (strongest guard against
  a signature-looking PDF). (c) Remove every automatic indicator: contradicts D-09 and docs/10:38 (auto-sign wording
  removed) and makes an unsigned PDF look signed; not recommended.
- **F-Q3 (F-3) Recipients and templates for the admin.** (a) Recommended: flags and redacted fault codes only
  (recipients configured yes/no), not recipient addresses, templates or message content. (b) The admin also sees
  recipient addresses to diagnose delivery faults; the docs/03 and docs/07 drafts then drop "recipient addresses".
- **F-Q4 (F-3) What a grant covers.** (a) Recommended: timesheets only (periods, day views, sessions, per-day
  calculations, policy versions read-only, revision status); no OT ledger/balances/leave, evidence export, history,
  review payload, PDFs or signatures. (b) Also OT summary/ledger read-only and final PDF downloads (exposes the
  signature image embedded in the PDF).
- **F-Q5 (F-3) Edit-grant limits and the admin's role.** (a) Recommended: edit = manual day/session/break/batch edits,
  including old/finalized periods with a reason; no live Clock in/out for the owner; never sign-off or sending; the
  admin may list and revoke grants but not create them. (b) Also allow Clock in/out on the owner's behalf.
- **F-Q6 (F-3, optional, before T13D) WP2-A-01.** (a) Recommended: the removed employee-derived holiday-preview counts
  stay removed (no reply needed). (b) Restore them for the admin: reopens accepted WP2 code and tests and exposes data
  derived from day entries.

#### G. Risks and mitigations

- Wider admin metadata (per-person lifecycle, late or automatic versus signed, faults) reveals behaviour patterns.
  Mitigation: an explicit field allowlist in `operationsStatus.ts`; no counts derived from day entries or sessions; a
  test that serializes every admin response for a seeded period and searches it for that period's notes, minutes,
  instants and recipients; no admin audit view (A3-01).
- Delegate privilege escalation (IDOR across owners via `/api/shared/:ownerId/sessions/:id`, or a self-only route
  reachable through the shared mount). Mitigation: the allowlisted mount, subject-scoped queries, 404 on mismatch, a
  route-inventory test that fails when a route appears under `/api/shared` without a matrix entry, red-first and a
  mutation check per guard.
- Revocation race and stale grants. Mitigation: a live grant check on every request and inside the write transaction;
  deactivation suspends access.
- Fabricated attestation: an edit delegate enters hours that the owner later signs, or the deadline submits delegate
  edits with the notice off. Mitigation: actor attribution in audit and History, the review "changed by" hint,
  sign-off and sending owner-only; the owner's outcome notice still states that review is pending.
- An unsigned PDF that looks signed (notice off plus auto-image). Mitigation: the F-Q2 floor (origin label, blank
  date) and tests for that combination.
- Grantee lookup by email allows account enumeration by signed-in users. Mitigation: exact match only, rate limit,
  generic 422; accepted for an internal tool.
- Signature exposure through PDFs or the review payload. Mitigation: both stay owner-only (F-Q4 (a)); the review GET
  is not mounted under `/api/shared`.
- Scope growth in WP3 (five new or split tasks, one on opus). Mitigation: the seam (T13A) changes no behaviour and
  lands before the grant logic; plan one fix round; the optional audit area C.
