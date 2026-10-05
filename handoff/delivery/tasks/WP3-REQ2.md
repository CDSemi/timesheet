# WP3-REQ2 dispatch brief

- Mission/task: timesheet-software-readiness / WP3-REQ2; package WP3; kind plan; attempt
  1; depends on WP3-REQ. An addendum by the same planner (resumed context), read-only,
  running beside WP3-T08 (the single source writer).
- Profile/routing: timesheet-planner with model override opus, reason `size_risk`.
  Routing: size M, risk H, novelty yes. Record in English.
- Read from disk: AGENTS.md; the board `owner_decisions` entry of 2026-10-04 that starts
  "- F-Q1: (a)" (verbatim answers) and the coordinator decision of the same date that
  starts "Interpretation recorded for the canonical update" (handoff/delivery/
  ORCHESTRATION.json, read-only); your own [WP3-REQ](WP3-REQ.md) report; the WP3-T05 and
  WP3-T06 results.
- Baseline: main at 2f8011ac1a8e2eadc031e6654714454efe1126f1. WP3-T08 edits
  src/server/jobs/*, src/server/index.ts, src/server/cli.ts and their tests while you
  read.

## The owner's answers (the verbatim board entry is authoritative)

- F-Q1 (a): the note setting governs every automatic submission.
- F-Q2 (overrides your recommendation): outgoing automatic submissions carry no automatic
  indicator and a complete signature block; the system alone tracks the automatic
  origin. Per-user options: a note line (default text "Automatic submission", editable by
  the user; shown only when enabled, default off per F-1) and whether the signature image
  is included.
- F-Q3 (b): the admin also sees recipient addresses (not templates or message content).
- F-Q4 (b) with per-item toggles: a share can include timesheets, read-only OT
  summary/ledger and final PDF downloads, each item on or off per grant.
- F-Q5 (a) as recommended.
- F-Q6: not understood by the owner; re-asked; WP2-A-01 stays as accepted meanwhile.

## Required output (append under Results)

1. **Revised section A** (canonical EN/VI text) for every place your drafts change under
   these answers, as file:line with the final text: the automatic-submission PDF and
   email (no automatic indicator by default; printed signer name; the printed date is the
   automatic submission date in the saved reporting zone while `signed_at` stays null; the
   image only when the user's image option is on; the optional note line), R-07 and AC-07
   /AC-10 in docs/06, D-09 and a new decision entry in docs/10, the admin boundary with
   recipient addresses (docs/01, 03, 05, 07), and FR-17/AC-16 with per-item grant toggles.
   Mark every line that differs from section A of WP3-REQ.
2. **Signature-image option.** Reconcile it with the existing explicit, audited auto-image
   authorization (T03): is the "include signature image" option the same control or a
   second one; its default (the coordinator recorded "off unless the owner says
   otherwise"; flag if the canonical docs or the owner's words imply a different default);
   and what the PDF shows when the image is off (name and date only).
3. **Revised T07B** (ready to become a brief): owned paths, schema (migration 0005 columns
   for the note enable flag and text, bounded length, validated, no template variables or
   a closed set), settings and audit, snapshot fields and version, renderer behaviour for
   manual and automatic revisions, `{SignOffStatus}` text, and the tests that must change
   (including the T07 tests that pin the banner and the blank date).
4. **Revised sharing specification** (section C): the grant model with per-item toggles
   (timesheet view, timesheet edit, OT summary/ledger read-only, final PDF download), the
   matrix rows that change (PDF download now allowed when the item is on, despite the
   embedded signature image; OT read-only), admin visibility of recipient addresses, and
   the updated T13B/T13C/T13D scopes.
5. **Revised WP3-DOC instructions**: the exact list of file edits for the doc worker (EN
   and VI), including the WP3_IMPLEMENT/WP3_REVIEW prompt gate lines and
   `reference/examples/policy.example.json` if needed.
6. **Risks** introduced by F-Q2 and F-Q4 (b) (an unsigned-but-signed-looking PDF; PDF
   access exposing the signature image to a grantee), and the mitigations that remain
   within the owner's decisions (audit, the owner's own screens, explicit options).
7. Any remaining genuine owner question (at most two), with a recommended option.

- Writable: this file and handoff/delivery/evidence/WP3-REQ2/ (masked, LF, single final
  newline). Everything else read-only. No commits. Never write into the repository root;
  on Windows never redirect to /dev/null or nul from a POSIX shell.
- Return at most 300 words, beginning with your self-reported model: what changed from
  WP3-REQ, the T07B scope, the sharing changes, the doc-edit list size, and any owner
  question.

## Results

(Planner appends here.)

### Planner result (attempt 1, 2026-10-04)

- Self-reported model: claude-opus-5-5 (profile timesheet-planner; effort not observable).
- Baseline observed: HEAD `2f8011ac1a8e2eadc031e6654714454efe1126f1`; since the WP3-REQ baseline `c289375` only T05
  (`72f1920`) and T06 (`2f8011a`) landed, neither touching `src/server/pdf/`, `src/domain/snapshot.ts`, settings or
  docs. Working tree: coordinator records under `handoff/` (T08's source edits not yet visible); nothing of T08 read
  or touched.
- Read-only. Evidence: [00-baseline.txt](../evidence/WP3-REQ2/00-baseline.txt),
  [01-pins.txt](../evidence/WP3-REQ2/01-pins.txt). No Node run was needed.
- Tags used below: **[changed]** differs from WP3-REQ section A/C/E; **[new]** not in WP3-REQ; **[unchanged]** WP3-REQ
  text stands (listed only where useful).

#### Observations added since WP3-REQ

- P1. The renderer prints `snapshot.employee.name` in the signature block only for manual revisions
  (`timesheetPdf.ts:316-318`) and never `signoffs.signer_name` (T05 stores it, the renderer input has no signer field).
  The automatic path needs a printed name and the manual path should print the name the employee signed with.
- P2. The renderer refuses `signedAt` on an automatic revision (`timesheetPdf.ts:232-234`) and prints a date only from
  `signedAt` (`:240`, `:321`); an automatic date therefore needs a separate input, not `signedAt`.
- P3. Origin wording reaches outgoing artefacts in four places: the header "Revision N (manual sign-off | automatic
  submission)" (`:261-263`), the banner (`:271-276`), the footer (`:330`) and `{SignOffStatus}` ("Signed by employee"
  `reviewPayload.ts:44`; "Automatic submission - employee review pending" `submissionSettings.ts:448`). Removing only
  the banner would still reveal the origin through the header/footer label.
- P4. The auto-image control already exists (T03): `submission_settings.auto_image_authorized`,
  `auto_image_attachment_id` (one immutable signature attachment), `auto_image_authorized_at` (0004:78-90),
  `POST /api/settings/submission/auto-image/authorize|revoke` with `expected_seq`, audited; the snapshot carries
  `auto_image: { authorized, attachment_id }` (`snapshot.ts:126-127`).
- P5. T06 late review requires the automatic revision's ledger content to be unchanged (409 `content_changed`), and a
  correction posts first credits for days without originals; F-1 needs no T06 change.

#### 1. Revised section A (canonical EN/VI text)

Only places whose text differs from WP3-REQ section A, or new places, are given in full. Every other WP3-REQ draft
stands **[unchanged]**: F-1 items 2 (docs/04:40), 6 (docs/05:54); F-2; F-4; F-5 (docs/04:52 and the OT-total clause of
AC-10); F-3 items 5 (docs/03:37), 6 (docs/03:45).

**Automatic submission presentation (F-1 with F-Q1 (a), F-Q2 owner choice).**

1. **[changed]** docs/04_UX_AND_SETTINGS.md defaults table: the WP3-REQ "notice" row is withdrawn. New row after line
   30, EN: `| Automatic submission note line | Off; when on, the PDF and email show the user's text (default "Automatic
   submission") |` VI (after [30]): `| Dòng ghi chú khi tự nộp | Tắt; khi bật, PDF và email hiện nội dung của user (mặc
   định "Automatic submission") |`. Line 30 ("Automatic signature image | Off; explicit prior authorization may
   enable") stays **[unchanged]** subject to G-Q1.
2. **[changed]** docs/04_UX_AND_SETTINGS.md:56, replace the first sentence ("Automatic PDF/email visibly says employee
   review is pending."). EN: "The outgoing PDF and email of an automatic submission show no automatic indicator: the
   signature block prints the employee name and the date of the automatic submission in the saved reporting zone; the
   signature image appears only when the user has authorized automatic image use; a note line appears only when the
   user turns it on (default off; the user edits its text, default "Automatic submission"). The system still records
   the revision as automatic with employee review pending, empty signed_at and no sign-off, and the employee's own
   screens show that." VI [56]: "PDF và email gửi đi của bản tự nộp không có dấu hiệu tự động: khối chữ ký in tên nhân
   viên và ngày tự nộp theo múi giờ báo cáo đã lưu; ảnh chữ ký chỉ xuất hiện khi user đã cho phép dùng ảnh tự động;
   dòng ghi chú chỉ xuất hiện khi user bật (mặc định tắt; user sửa nội dung, mặc định "Automatic submission"). Hệ thống
   vẫn ghi revision là tự động, chờ nhân viên xác nhận, signed_at trống và không có sign-off, và màn hình của chính
   nhân viên hiện điều đó." The remaining sentences of line 56 stay.
3. **[changed]** docs/05_SUBMISSION_AND_NOTIFICATIONS.md:19. EN: "- Unsigned draft + enabled switch: finalize valid saved
   attendance—or the default labels when the period has no saved entries—as **automatic** (the record keeps employee
   review pending); post only computable credits/authorized deficits (days without records post no OT and no
   deficit); enqueue PDF/email, presented as document 04 describes." VI [19]: "- Nháp chưa ký + bật: chốt loại ngày hợp
   lệ đã lưu—hoặc nhãn mặc định khi kỳ chưa lưu dữ liệu nào—là **tự động** (bản ghi giữ trạng thái chờ nhân viên xác
   nhận); chỉ ghi OT tính được/khoản trừ đã cho phép (ngày không có bản ghi không ghi OT và không tính thiếu); xếp
   PDF/email, trình bày như tài liệu 04."
4. **[changed]** docs/05_SUBMISSION_AND_NOTIFICATIONS.md:24. EN: "Automatic image inclusion is separately off by default;
   an explicit, audited prior authorization of one stored signature image enables it. Outgoing automatic PDF/email
   follow document 04 (no automatic indicator, optional note line). signed_at stays empty and no sign-off is recorded;
   the employee's own screens and the outcome notice always show that review is pending." VI [24]: "Ảnh ký tự động là
   tùy chọn riêng mặc định tắt; cho phép trước rõ ràng, có audit, cho một ảnh chữ ký đã lưu sẽ bật nó. PDF/email tự nộp
   gửi đi theo tài liệu 04 (không dấu hiệu tự động, dòng ghi chú tùy chọn). signed_at vẫn trống và không ghi sign-off;
   màn hình của chính nhân viên và thông báo kết quả luôn hiện là chờ xác nhận."
5. **[new]** docs/02_TIME_AND_OT_RULES.md:74 (R-07), replace "Use actual `signed_at`, never TODAY()." EN: "The PDF date
   is the actual `signed_at` of a manual revision, or the date of an automatic revision's submission instant in the
   saved reporting zone (its `signed_at` stays empty); never TODAY()." VI [74], replace "Dùng `signed_at` thật, không
   TODAY().": "Ngày trên PDF là `signed_at` thật của revision thủ công, hoặc ngày của thời điểm tự nộp của revision tự
   động theo múi giờ báo cáo đã lưu (`signed_at` của nó vẫn trống); không TODAY()."
6. **[new]** docs/01_PRODUCT_REQUIREMENTS.md:32, append after "...not actual clock records or employee attestations."
   EN: "An automatic submission may present them in its outgoing PDF without an automatic indicator (document 04); the
   system still records them as unattested." VI [32], after "...không phải giờ thực hay xác nhận của nhân viên.": "Bản tự
   nộp có thể trình bày chúng trong PDF gửi đi mà không có dấu hiệu tự động (tài liệu 04); hệ thống vẫn ghi chúng là
   chưa xác nhận."
7. **[changed]** docs/06_TEST_AND_ACCEPTANCE.md:15 (AC-07). EN: "Auto-submit on/off, the automatic note line (default
   off, editable text) and image authorization behave correctly; outgoing automatic submissions show no automatic
   indicator while the record keeps origin automatic, review pending, empty signed_at and no sign-off; a period without
   saved entries is submitted with default labels, no OT and no deficit". VI [15]: "Tự nộp bật/tắt, dòng ghi chú tự
   nộp (mặc định tắt, sửa được nội dung) và phép dùng ảnh hoạt động đúng; bản tự nộp gửi đi không có dấu hiệu tự động
   trong khi bản ghi giữ nguồn tự động, chờ xác nhận, signed_at trống và không sign-off; kỳ chưa lưu dữ liệu được nộp
   theo nhãn mặc định, không OT, không thiếu giờ".
8. **[changed]** docs/06_TEST_AND_ACCEPTANCE.md:18 (AC-10). EN: "PDF has 14 dates, the credited OT total (h:mm) includes
   both Sundays, the real sign date (manual) or the automatic submission date (automatic), Unicode, long labels,
   bounded image and revision IDs". VI [18]: "PDF đủ 14 ngày, tổng OT được ghi (h:mm) gồm hai Chủ nhật, ngày ký thật
   (thủ công) hoặc ngày tự nộp (tự động), Unicode, nhãn dài, ảnh vừa và ID revision".
9. **[new]** docs/10_DECISIONS_AND_SOURCES.md:23 (D-09). EN: `| D-09 | Auto-submit preference enabled after setup;
   dry-run until activation; automatic image only after explicit authorization; the record never contains a fabricated
   sign-off (automatic origin, review pending, empty signed_at); outgoing automatic PDF/email follow the 2026-10-04
   owner decision. |` VI [23]: `| D-09 | Bật tùy chọn tự nộp sau setup; dry-run tới kích hoạt; ảnh tự động chỉ khi
   được cho phép rõ; bản ghi không bao giờ chứa sign-off giả (nguồn tự động, chờ xác nhận, signed_at trống); PDF/email
   tự nộp gửi đi theo quyết định của chủ ngày 2026-10-04. |`
10. **[new]** docs/10_DECISIONS_AND_SOURCES.md:38, append EN: "The 2026-10-04 owner decision sets how outgoing automatic
    submissions look; it does not reintroduce a recorded automatic sign-off." VI [38]: "Quyết định của chủ ngày
    2026-10-04 quy định hình thức bản tự nộp gửi đi; nó không đưa lại sign-off tự động trong bản ghi."
11. **[changed]** `{SignOffStatus}`: no canonical line names its values today (docs/04:50 lists the variable only). If
    G-Q2 (a) is adopted, append to docs/04:50 EN: "{SignOffStatus} renders "Submitted" for every submission, or the
    note text when an automatic submission's note line is on." VI [50]: "{SignOffStatus} hiển thị "Submitted" cho mọi
    lần nộp, hoặc nội dung dòng ghi chú khi bản tự nộp bật dòng ghi chú."

**Admin boundary with recipient addresses (F-Q3 (b)).**

12. **[changed]** docs/03_ARCHITECTURE_AND_DATA.md:33, replacing the WP3-REQ draft. EN: "Admin manages
    accounts/configuration and sees operational information: accounts, calendars, sharing grants, each person's
    timesheet lifecycle, revision origin and review state, PDF and delivery states with recipient addresses, redacted
    fault codes, settings flags and job/runner health. Timesheet details stay private: day entries, sessions and
    breaks, leave, notes, calculations, personal policies, OT ledger and balances, leave requests and permission
    evidence, evidence exports, review payloads and snapshots, PDFs, signature images, email templates, rendered email
    content and the audit payloads of personal records. Access to them requires the owner's explicit grant, also for an
    administrator." VI [33]: "Admin quản tài khoản/cấu hình và thấy thông tin vận hành: tài khoản, lịch, quyền chia sẻ,
    vòng đời timesheet của từng người, nguồn và trạng thái xác nhận của revision, trạng thái PDF và gửi kèm địa chỉ
    người nhận, mã lỗi đã che, cờ setting và sức khỏe job/runner. Chi tiết timesheet vẫn riêng tư: ngày, phiên và nghỉ,
    phép, ghi chú, phép tính, quy tắc cá nhân, sổ và số dư OT, yêu cầu nghỉ và bằng chứng cho phép, file xuất bằng
    chứng, payload/snapshot review, PDF, ảnh chữ ký, template email, nội dung email đã dựng và payload audit của bản ghi
    cá nhân. Xem chúng cần quyền chia sẻ rõ ràng của chủ, kể cả với admin."
13. **[changed]** docs/07_DEPLOYMENT_AND_OPERATIONS.md:36. EN: "An administrator status view shows runner heartbeat,
    backup success, disk capacity, sender setup and delivery backlog/faults/uncertainty per person and period,
    including recipient addresses, without timesheet details or message content." VI [36]: "Màn hình admin hiện
    heartbeat runner, backup thành công, dung lượng, sender và backlog/lỗi/chưa rõ theo từng người và kỳ, kèm địa chỉ
    người nhận, không có chi tiết timesheet hay nội dung thư."
14. **[changed]** docs/04_UX_AND_SETTINGS.md:12. EN: "| Settings/admin | Personal policy/templates and sharing (grant,
    change or revoke per item); users, annual holidays, sender, sharing grants and per-person submission/delivery
    status with recipients, without timesheet details |" VI [12]: "| Settings/admin | Quy tắc/template riêng và chia sẻ
    (cấp, đổi hoặc thu hồi theo từng mục); user, lễ năm, sender, quyền chia sẻ và trạng thái nộp/gửi từng người kèm
    người nhận, không có chi tiết timesheet |"
15. docs/01_PRODUCT_REQUIREMENTS.md:36: see item 16 (one replacement covers F-Q3 and F-Q4).

**Sharing with per-item toggles (F-Q4 (b), F-Q5 (a)).**

16. **[changed]** docs/01_PRODUCT_REQUIREMENTS.md:36. EN: "Two isolated test users must work throughout the first
    release. Administrators see accounts, configuration and operational status, including each person's submission and
    delivery status and recipients, but never the details of anyone's timesheets (document 03 defines them). Each person
    may share their own timesheets with another account item by item—view, edit, read-only OT summary and ledger, final
    PDF downloads—and change or revoke the share; sign-off, signature image files, sending and personal settings stay
    with the owner. Future manager access needs explicit assignment." VI [36]: "Hai user test phải được cách ly trong
    toàn bộ bản đầu. Admin thấy tài khoản, cấu hình và tình trạng vận hành, gồm trạng thái nộp, gửi và người nhận của
    từng người, nhưng không bao giờ thấy chi tiết timesheet của ai (tài liệu 03 định nghĩa). Mỗi người có thể chia sẻ
    timesheet của chính mình cho một tài khoản khác theo từng mục—xem, sửa, xem sổ và tổng OT (chỉ đọc), tải PDF đã
    chốt—và đổi hoặc thu hồi; sign-off, file ảnh chữ ký, gửi và settings cá nhân vẫn chỉ thuộc chủ. Quyền manager tương
    lai cần gán rõ."
17. **[changed]** docs/01 table, new row after line 24. EN: `| FR-17 | Owner-granted, revocable sharing of one's own
    timesheets with per-item toggles (view, edit, read-only OT, final PDFs); admin status without timesheet details |
    WP3 |` VI: `| FR-17 | Chủ chia sẻ timesheet của mình, thu hồi được, bật/tắt từng mục (xem, sửa, OT chỉ đọc, PDF đã
    chốt); admin xem tình trạng không có chi tiết timesheet | WP3 |`
18. **[changed]** docs/03 records table, new row after line 30. EN: `| timesheet_shares | Owner, grantee, items
    (timesheets none/view/edit, OT read-only, final PDF download), created by/at, revoked by/at; one active share per
    owner and grantee; a change of items revokes and replaces the row; never transitive |` VI: `| timesheet_shares | Chủ,
    người được chia sẻ, các mục (timesheet không/xem/sửa, OT chỉ đọc, tải PDF đã chốt), người/lúc tạo, người/lúc thu
    hồi; mỗi cặp chủ–người nhận một quyền hiệu lực; đổi mục thì thu hồi và thay dòng; không chia sẻ tiếp |`
19. **[changed]** docs/04, new screen row after line 12. EN: `| Shared timesheets | A grantee opens an owner's shared
    items from "Shared with me" under a persistent bar naming the owner and the shared items; actions outside the share
    are absent and refused by the server |` VI: `| Timesheet được chia sẻ | Người được chia sẻ mở các mục được chia sẻ
    của chủ từ "Được chia sẻ với tôi" với thanh cố định ghi tên chủ và các mục; thao tác ngoài quyền bị ẩn và server từ
    chối |`
20. **[changed]** docs/05_SUBMISSION_AND_NOTIFICATIONS.md:56, replace "Archived downloads require ownership." EN:
    "Archived downloads require ownership or a share whose PDF item is on (the PDF may contain the signature image);
    signature image files are never shared." VI [56], replace "Tải lưu trữ cần quyền chủ.": "Tải lưu trữ cần quyền chủ
    hoặc quyền chia sẻ bật mục PDF (PDF có thể chứa ảnh chữ ký); file ảnh chữ ký không bao giờ được chia sẻ."
21. **[changed]** docs/06:9 (AC-01). EN: "Without a share item, two users cannot read/edit each other's times, ledger,
    PDFs, signatures or tokens by swapping IDs; admins see no timesheet details". VI [9]: "Không có mục chia sẻ thì hai
    user không xem/sửa giờ, sổ, PDF, chữ ký, token của nhau bằng đổi ID; admin không thấy chi tiết timesheet". New row
    after line 23, EN: `| AC-16 | A share reaches only its enabled items (timesheet view or edit, read-only OT summary
    and ledger, final PDF download), never sign-off, signature image files, sending, settings, leave actions or
    re-sharing; edits are attributed to the grantee; a change, revocation or deactivation applies on the next request |
    WP3 |` VI: `| AC-16 | Quyền chia sẻ chỉ tới các mục đã bật (xem hoặc sửa timesheet, xem sổ và tổng OT chỉ đọc, tải
    PDF đã chốt), không bao giờ sign-off, file ảnh chữ ký, gửi, settings, thao tác nghỉ hay chia sẻ tiếp; thao tác sửa
    ghi tên người được chia sẻ; đổi, thu hồi hoặc vô hiệu hóa có hiệu lực ở request kế tiếp | WP3 |`
22. **[changed]** docs/09_IMPLEMENTATION_ROADMAP.md:33 append EN "Add owner-granted timesheet sharing with per-item
    toggles and the admin status boundary." VI [33] "Thêm chia sẻ timesheet do chủ cấp, bật/tắt từng mục, và ranh giới
    tình trạng cho admin." docs/09:37 append EN "; AC-16, the automatic note line and image options, outgoing automatic
    submissions without an automatic indicator, empty-period automatic submission and admin status without timesheet
    details." VI [37] "; AC-16, dòng ghi chú và tùy chọn ảnh khi tự nộp, bản tự nộp gửi đi không dấu hiệu tự động, tự nộp
    kỳ chưa có dữ liệu và tình trạng admin không có chi tiết timesheet." Mirror in the WP3_IMPLEMENT/WP3_REVIEW prompts
    (section 5).
23. **[changed]** docs/10:7 append EN "Owner-granted sharing of one's own timesheets, item by item." VI [7] "Chia sẻ
    timesheet của chính mình theo từng mục do chủ cấp." New final section (replaces the WP3-REQ draft), EN:

    > ## Owner decisions — 2026-10-04 (WP3-PLAN F-1..F-5 and WP3-REQ F-Q1..F-Q6)
    >
    > Source: the owner's direct replies recorded in the task board, 2026-10-04.
    >
    > - F-1: at the deadline a period with no saved entries is still submitted automatically with the default labels.
    >   Days without records credit no OT (the employee may add records and correct later) and create no deficit.
    > - F-Q1, F-Q2: outgoing automatic submissions carry no automatic indicator. The PDF signature block prints the
    >   employee name and the automatic submission date in the saved reporting zone; the signature image appears only
    >   with the user's explicit image authorization; an optional note line (user-editable, default "Automatic
    >   submission", off by default) applies to every automatic submission when on. Only the system tracks the
    >   automatic origin: the revision keeps origin automatic, review pending, empty signed_at and no sign-off, and the
    >   employee's own screens and outcome notice show that review is pending. This supersedes the earlier "pending
    >   review remains visible" rule for outgoing artefacts.
    > - F-2: a pending deficit debit stays a recorded pending line of its revision, shown on the review and OT screens,
    >   re-evaluated only by a later finalized revision; no background posting.
    > - F-3, F-Q3: administrators see everything except each person's timesheet details (document 03), including
    >   recipient addresses but not templates or message content.
    > - F-3, F-Q4, F-Q5: an individual may share their own timesheets with another account item by item (view, edit,
    >   read-only OT summary and ledger, final PDF downloads). Edit covers manual day, session, break and batch edits
    >   (reasons for old periods), never Clock in/out for the owner, sign-off or sending. Shares are revocable, audited
    >   and never transitive; administrators may list and revoke them but not create them.
    > - F-4: one system-wide activation instant (empty until the owner's pilot) combined with each user's auto-submit
    >   effective instant.
    > - F-5: the PDF total is the credited OT total in h:mm over all 14 days, hidden when Show OT on PDF is off.
    > - Unchanged meanwhile: the accepted WP2 removal of employee-derived holiday-preview counts (WP2-A-01); F-Q6 is
    >   re-asked.

    VI:

    > ## Quyết định của chủ — 2026-10-04 (WP3-PLAN F-1..F-5 và WP3-REQ F-Q1..F-Q6)
    >
    > Nguồn: các câu trả lời trực tiếp của chủ ghi trong bảng task, 2026-10-04.
    >
    > - F-1: đến hạn, kỳ chưa lưu dữ liệu nào vẫn được tự nộp theo nhãn mặc định. Ngày không có bản ghi không được tính
    >   OT (nhân viên có thể bổ sung bản ghi và sửa sau) và không tính thiếu giờ.
    > - F-Q1, F-Q2: bản tự nộp gửi đi không có dấu hiệu tự động. Khối chữ ký trên PDF in tên nhân viên và ngày tự nộp
    >   theo múi giờ báo cáo đã lưu; ảnh chữ ký chỉ xuất hiện khi user cho phép dùng ảnh rõ ràng; dòng ghi chú tùy chọn
    >   (user sửa được, mặc định "Automatic submission", mặc định tắt) áp dụng cho mọi lần tự nộp khi bật. Chỉ hệ thống
    >   theo dõi nguồn tự động: revision giữ nguồn tự động, chờ xác nhận, signed_at trống và không sign-off, và màn hình
    >   cùng thông báo kết quả của chính nhân viên hiện là chờ xác nhận. Điều này thay quy tắc cũ "vẫn hiện chờ xác
    >   nhận" cho bản gửi đi.
    > - F-2: khoản trừ thiếu giờ đang chờ là một dòng chờ được ghi của revision đó, hiện trên màn review và OT, chỉ được
    >   đánh giá lại bởi một revision chốt sau; không ghi nền.
    > - F-3, F-Q3: admin thấy mọi thứ trừ chi tiết timesheet của từng người (tài liệu 03), gồm địa chỉ người nhận nhưng
    >   không gồm template hay nội dung thư.
    > - F-3, F-Q4, F-Q5: cá nhân có thể chia sẻ timesheet của mình cho một tài khoản khác theo từng mục (xem, sửa, xem sổ
    >   và tổng OT chỉ đọc, tải PDF đã chốt). Quyền sửa gồm sửa tay ngày, phiên, nghỉ và sửa hàng loạt (kỳ cũ cần lý
    >   do), không bao giờ Clock in/out thay chủ, sign-off hay gửi. Quyền chia sẻ thu hồi được, có audit, không chia sẻ
    >   tiếp; admin xem danh sách và thu hồi được nhưng không tạo được.
    > - F-4: một thời điểm kích hoạt toàn hệ thống (trống tới pilot của chủ) kết hợp thời điểm hiệu lực tự nộp của từng
    >   user.
    > - F-5: tổng trên PDF là tổng OT được ghi dạng h:mm của cả 14 ngày, ẩn khi tắt Hiện OT trên PDF.
    > - Tạm thời không đổi: việc WP2 đã bỏ số đếm suy từ dữ liệu nhân viên trong preview lịch lễ (WP2-A-01); F-Q6 được
    >   hỏi lại.

**Definition of "timesheet details", changed rows [changed]:** "Delivery envelopes (recipient addresses, ...)" and
"Templates and recipient addresses" from WP3-REQ become: admin **sees** recipient addresses (to/cc) in settings
status and delivery attempts; admin **never** sees templates, rendered subject/body, Message-ID or raw provider
responses. All other rows stand.

#### 2. Signature-image option

- **Same control, not a second one.** The owner's "include the signature image or not" is the existing T03 auto-image
  authorization (P4): per user, explicit, audited, versioned, default off, bound to one immutable signature
  attachment, already frozen into the snapshot (`auto_image`). A second flag would create two sources of truth and an
  unaudited path to place a signature. T07B changes only its presentation: Settings shows it as "Include my signature
  image on automatic submissions", a switch that performs the audited authorize/revoke acts with the current
  signature. A newer upload does not move the authorization automatically (archived immutability); the UI offers to
  re-authorize with the new image.
- **Default: off**, as the coordinator recorded and as the canonical texts say (docs/04:30 "Off; explicit prior
  authorization may enable", docs/05:24, D-09). Flag: the owner's words "bản gửi đi vẫn phải có chữ ký đầy đủ" (the
  outgoing copy must still carry a complete signature) can be read as "image on by default". It cannot literally
  default on (a user may have no image yet, and placing a signature needs the user's prior consent), so the genuine
  choice is whether the auto-submit setup asks for the authorization by default: owner question G-Q1.
- **Image off:** the automatic PDF prints the signer name and the automatic submission date in the signature block;
  the signature line above the name stays empty. Manual sign-off is unchanged (name and validated image required).

#### 3. Revised T07B (ready to become a brief)

- Title: "Automatic submission presentation: note line, image option, no automatic indicator". Size M, risk H,
  novelty no; timesheet-worker-high / sonnet. Depends on WP3-DOC freeze **and** the T08 freeze (it changes the renderer
  input that T08's PDF job calls). One writer.
- Owned paths: `src/server/db/migrations/0005_automatic_presentation.ts` (new), `src/server/db/migrations.ts`,
  `src/server/services/submissionSettings.ts`, `src/server/routes/settings.ts`, `src/server/http/schemas.ts`,
  `src/domain/snapshot.ts`, `src/domain/emailTemplate.ts` (the `{SignOffStatus}` text function only),
  `src/server/services/reviewPayload.ts`, `src/server/pdf/timesheetPdf.ts`, `src/server/pdf/layout.ts` (if a helper is
  needed), `src/server/jobs/pdfJob.ts` (renderer input mapping only; T08's file after its freeze),
  `tests/integration/{migrations,submission-settings,review-payload,pdf-render}.test.ts`,
  `tests/domain/{canonical,email-template}.test.ts`, the T08 PDF-job test file (input mapping assertions only).
- Schema (0005; 0004 untouched):
  `ALTER TABLE submission_settings ADD COLUMN auto_note_enabled INTEGER NOT NULL DEFAULT 0 CHECK (auto_note_enabled IN
  (0, 1));` and `ALTER TABLE submission_settings ADD COLUMN auto_note_text TEXT NOT NULL DEFAULT 'Automatic submission'
  CHECK (length(auto_note_text) BETWEEN 1 AND 120 AND instr(auto_note_text, char(10)) = 0 AND instr(auto_note_text,
  char(13)) = 0);`. No notice column (the WP3-REQ `show_review_pending_notice` is withdrawn).
- Validation (zod + service): NFC, trimmed, 1–120 characters, one line, no Unicode control characters, no `{` or `}`
  (literal text, no template variables: closed set = none). Both fields optional on save; omitted fields keep the
  current values; a save appends a settings version with audit (before/after of the two fields; not timesheet data).
  Users without settings get disabled + the default text.
- Snapshot: `SNAPSHOT_VERSION` 2 adds `auto_note: { enabled: boolean; text: string }` (from the effective settings);
  `auto_image` stays. `submission.sign_off_status` comes from one domain function `signOffStatusText(origin, autoNote)`
  per G-Q2 (recommended: "Submitted" for both origins; the note text for an automatic submission whose note is on). The
  normalizer reads v1 payloads for rendering only (note off) so revisions finalized before T07B still render; new
  payloads are v2.
- Renderer input: add `signerName: string` and `automaticSubmittedAt: string | null`. Manual: `signedAt` required,
  `automaticSubmittedAt` null, image required, `signerName` = `signoffs.signer_name` (fixes P1). Automatic: `signedAt`
  null (existing guard kept), `automaticSubmittedAt` required (= `timesheet_revisions.created_at`), `signerName` =
  `snapshot.employee.name`, image allowed only when `snapshot.auto_image.authorized` (new guard). Both: no banner; no
  origin word in header or footer ("Submission X", "Revision N"); the signature block prints the name and the date (the
  local date of `signedAt` or `automaticSubmittedAt` in the snapshot's reporting zone); the note line (one line, plain,
  in the former banner position) only when origin is automatic and `auto_note.enabled`; identical bytes for identical
  input.
- `{SignOffStatus}` and preview: `http/schemas.ts:274` `sign_off` becomes `manual | automatic`; the preview and the
  T10 automatic snapshot use `signOffStatusText`. Because the note can reach the subject through `{SignOffStatus}`, the
  one-line CHECK and validation are the header-injection guard; the body escapes HTML as today.
- Tests that must change: `pdf-render.test.ts:211` ("Revision 3 (manual sign-off)"), `:284`, `:300-304` (banner,
  blank date, "automatic submission"), keep `:312` (automatic with `signedAt` refused); `canonical.test.ts:205,218,231,274`;
  `review-payload.test.ts:173,182,360` (version and "Signed by employee" text, if G-Q2 (a)); `submission-settings.test.ts:478-481`;
  `migrations.test.ts` (v5, defaults, CHECK refusals, upgrade from a v4 database with rows).
- New tests (red-first): automatic with note off has no "automatic", "pending" or note text anywhere in the extracted
  text and prints name and submission date; the extracted text of an automatic PDF equals the manual PDF's for the
  same snapshot, name and date (image aside); note on shows the custom Vietnamese text; note ignored on manual; image
  only when authorized (unauthorized image refused); date from `automaticSubmittedAt` in the reporting zone, checked
  with the production zone functions on a DST-change week (season-independent); 121 characters, line break, control
  character and braces refused; audit of a note change. Mutations: banner restored, origin label restored, note shown
  when disabled, image placed when unauthorized, date taken from the clock instead of the revision.
- Checks: common checks 1, 2, 6 of WP3-PLAN; `npm run verify` with deprecation flags and `npm run digest` by Node 24.

#### 4. Revised sharing specification (section C)

- **Grant model [changed]** (`timesheet_shares`, migration 0006): `timesheets_scope` `none|view|edit`, `ot_read` 0/1,
  `pdf_download` 0/1, plus the WP3-REQ fields (owner, grantee, created by/at, revoked by/at, reason). CHECK
  `timesheets_scope <> 'none' OR ot_read = 1 OR pdf_download = 1`; one active share per pair (partial UNIQUE); a change
  of items = revoke + insert in one transaction, audited `share.change` with before/after items; no DELETE; fields
  immutable except one revocation. Form default: timesheets view on, OT off, PDF off.
- **Matrix rows that change [changed]** (other WP3-REQ rows stand):

| Route / action | Item required | Note |
|---|---|---|
| Timesheet, day, session, calendar, period, policy reads | `timesheets_scope` view or edit | unchanged rule, now an item |
| Day, session, break, batch writes | `timesheets_scope` edit | F-Q5 (a): no Clock in/out, never sign-off or sending |
| `GET /ot/summary`, `/ot/ledger`, `GET /revisions/pending-lines` | `ot_read` | read-only; `GET /ot/leave` and every leave action stay never (permission evidence, spending) |
| Revision list/status metadata | `timesheets_scope` ≠ none or `pdf_download` | status only |
| Final PDF download of a ready revision PDF (all finalized revisions of the owner) | `pdf_download` | allowed despite the embedded signature image (owner decision); each grantee download is audited (`share.pdf_download`, owner = owner) and shown in the owner's History |
| `GET /timesheets/:payrollDate/finalization` (T05: sign-off, ledger lines, jobs) | never | owner-only; delegates use the status list |
| Signature files, review payload, sign-off, corrections/late review, resend, delivery decision, submission settings, auto-image, evidence CSV, history, delivery attempt envelopes | never | unchanged |
| Admin status | admin role | now includes recipient addresses (to/cc) of the effective settings and of frozen envelopes; never templates, subject/body, Message-ID or raw provider responses |

- **T13A [changed]:** the seam also parameterizes `src/server/routes/ot.ts` and the revision status/PDF read routes
  (wherever T08/T13 place them) so they can be mounted under `/api/shared/:ownerId`; owned paths add those routers and
  their tests. No behaviour change.
- **T13B [changed]:** per-item guards (`requireShare(item)`), the three item columns, `share.change`, the PDF-download
  audit event, the ot/PDF mounts, and a matrix test over every `/api/shared` route × each of the 11 valid item sets,
  including PDF-only and OT-only. Still opus (size_risk).
- **T13C [changed]:** per-item switches in Settings → Sharing with the note "PDFs contain your signature image" beside the
  PDF switch; read-only OT view and PDF download for grantees; the owner bar lists the shared items.
- **T13D [changed]:** the status allowlist admits recipient addresses; the response-scan test still forbids notes,
  minutes, instants, subject/body and template text.

#### 5. Revised WP3-DOC instructions (writer: worker / sonnet; docs only)

Apply the WP3-REQ section A drafts as amended by item 1 above, in English and the matching `.vi.md` (locate VI lines by
content; they are offset by 0–2 lines). Exact edit list:

| File (EN and VI) | Edits |
|---|---|
| docs/01_PRODUCT_REQUIREMENTS | :24 new FR-17 row (item 17); :32 append (item 6); :36 replace (item 16) |
| docs/02_TIME_AND_OT_RULES | :56 insert F-2 sentence (WP3-REQ); :74 R-07 date sentence (item 5) |
| docs/03_ARCHITECTURE_AND_DATA | :30 new `timesheet_shares` row (item 18); :33 replace (item 12); :37 replace and :45 insert (WP3-REQ F-3 items 5, 6) |
| docs/04_UX_AND_SETTINGS | :12 replace (item 14) and new "Shared timesheets" row (item 19); new note-line row after :30 (item 1); :40 (WP3-REQ F-1 item 2); :50 append (item 11, only with G-Q2 (a)); :52 F-5 (WP3-REQ); :56 first sentence (item 2) |
| docs/05_SUBMISSION_AND_NOTIFICATIONS | :19 (item 3); :24 (item 4); :26 F-4 (WP3-REQ); :54 append (WP3-REQ F-1 item 6); :56 (item 20) |
| docs/06_TEST_AND_ACCEPTANCE | :9 AC-01 (item 21); :15 AC-07 (item 7); :18 AC-10 (item 8); new AC-16 row after :23 (item 21) |
| docs/07_DEPLOYMENT_AND_OPERATIONS | :36 (item 13) |
| docs/09_IMPLEMENTATION_ROADMAP | :33 and :37 (item 22) |
| docs/10_DECISIONS_AND_SOURCES | :7 append, :23 D-09, :38 append, new final section (items 9, 10, 23) |
| handoff/prompts/WP3_IMPLEMENT.md / `.vi.md` | :17 scope sentence and :21 gate sentence mirror docs/09:33 and :37 |
| handoff/prompts/WP3_REVIEW.md / `.vi.md` | :17 gate sentence mirrors docs/09:37 |
| reference/examples/policy.example.json | `submission` gains `"auto_note_enabled": false` and `"auto_note_text": "Automatic submission"`; `email_body` "Employee review: {SignOffStatus}." becomes "Status: {SignOffStatus}." (matches the app default template and the neutral value) |

Total: 10 canonical documents in two languages (20 files, about 45 edits per language), 4 prompt files, 1 JSON example.
Checks for the doc worker: EN/VI parity per edited line, no other wording change, package validator preflight, the
precommit privacy check, `npm run digest` (docs are in the digest).

#### 6. Risks introduced by F-Q2 and F-Q4 (b), and remaining mitigations

- **Unsigned PDF that looks signed** (name, date, optionally image; default labels on an empty period presented as
  attested). Recipients cannot tell; a later dispute rests on the system record. Mitigations within the owner's
  decisions: the immutable record (origin automatic, review pending, empty `signed_at`, no `signoffs` row) and its
  audit; the printed date is the true submission date, never a fabricated sign instant or TODAY(); the image needs the
  explicit audited authorization (default off); the employee's screens, the outcome notice (T11) and History show
  "review pending" with a direct late-review/correction path; the optional note line; a neutral `{SignOffStatus}` (G-Q2
  (a)) avoids the explicit false statement "Signed by employee" in email; docs/10 records the owner decision; the WP5
  pilot packet shows the owner the exact automatic PDF before activation.
- **Grantee PDF access exposes the signature image** (it can be extracted and reused). Mitigations: the PDF item is off
  by default and switched on per share with an explicit warning; signature files themselves are never shared; every
  grantee PDF download is audited and visible to the owner; change/revocation applies on the next request; `no-store`
  and attachment disposition as for owner downloads.
- **OT read-only exposure** (balances, leave consumption entries): off by default, per share, read-only; leave requests and
  permission evidence stay owner-only.
- **Note text reaching the subject line** through `{SignOffStatus}`: one-line CHECK, control-character and brace
  refusal, HTML escaping in the body.
- **Admin sees recipient addresses**: limited to addresses; templates and content stay excluded by the allowlist test.

#### 7. Remaining owner questions

- **G-Q1 Signature image on automatic submissions — default.** (a) Recommended: off until the user switches on "Include
  my signature image on automatic submissions" (the existing explicit, audited authorization); the auto-submit setup
  screen asks for it. Consequence: until then automatic PDFs print name and date without the image. (b) Ask for the
  authorization at signature upload and pre-select it (still one explicit, audited act); a user who declines gets (a).
  Reading the owner's "must still carry a complete signature" as an image applied without any prior consent is not
  offered: placing a signature needs the user's authorization.
- **G-Q2 Value of `{SignOffStatus}`.** (a) Recommended: "Submitted" for manual and automatic submissions (the note text
  instead when an automatic submission's note line is on); true in both cases and reveals no origin. (b) "Signed by
  employee" for both: matches today's manual text but states a falsehood in automatic emails. (c) Keep different texts
  per origin: contradicts F-Q2 (an automatic indicator).
