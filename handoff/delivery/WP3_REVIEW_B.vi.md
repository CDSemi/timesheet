# Review độc lập WP3 — vùng B (job, gửi thư, tự động nộp, nhắc hạn, an toàn GET, UI)

Bản gốc tiếng Anh: [WP3_REVIEW_B.md](WP3_REVIEW_B.md). Brief và kết quả của task: [WP3-AUDIT-B](tasks/WP3-AUDIT-B.md). Bằng chứng: `evidence/WP3-AUDIT-B/` (đã che, LF; script probe lưu dạng `*.mjs.txt`; ảnh chụp `*-synthetic.png`).

## Review độc lập

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP3, vùng B; 2026-10-05 (UTC). Reviewer `timesheet-auditor`, task WP3-AUDIT-B lần 1; model tự báo `claude-opus-5-5`; effort yêu cầu xhigh (không quan sát được từ bên trong phiên).
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056` (`freeze_commit` của WP3-GATE, trùng `origin/main`); digest `96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729` (717 file, không gồm `handoff/`) trước và sau, trong bản clone scratch và trong thư mục dự án; trùng digest của gate. Không có commit chưa push. Source đủ, trong một bản clone scratch ngoài Dropbox.
- **Quyết định: FIX REQUIRED** — một lỗi mức trung bình (WP3-B-01) và hai lỗi mức thấp (WP3-B-02, WP3-B-03). Mọi phần khác của vùng B đều đạt các kiểm tra do auditor tự chạy.
- **Phạm vi thật đã xem/chạy:** job bền vững (store, runner, lease, retry, business key), job PDF và job gửi, adapter capture và SMTP (SMTP chỉ đọc code), quyết định cho lần gửi không chắc chắn, cấu hình outbound và `MAIL_FROM`, tự động nộp theo hạn và mốc kích hoạt, kỳ trống F-1, tùy chọn dòng ghi chú và ảnh chữ ký cùng `{SignOffStatus}`, nhắc hạn và thông báo, an toàn GET của mọi route GET, deep link, độc lập với múi giờ thiết bị, chuẩn giao diện E-8, bố cục mobile và tên truy cập, ảnh render và ảnh chụp của gate và T14, cùng bốn carry item của vùng B. Đã đọc: AGENTS.md, WP3_REVIEW, WP3_IMPLEMENT, docs/01–07 và 10 (quyết định của chủ dự án 2026-10-04), WP3_HANDOFF, kết quả WP3-GATE, WP3-PLAN/REQ/REQ2 và các quyết định trên board.

### Bảng bằng chứng

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `npm ci` (Node 24.21.0, bản clone scratch) | exit 0, 160 package | `01-npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 60 file / 1384 test; SMOKE PASSED, 40 dòng `PASS`; 0 dòng deprecation | `02-verify.txt` |
| `npm run test:e2e` (Edge, desktop + mobile) | exit 0; 127 passed, 5 skipped, 0 failed | `03-e2e.txt` |
| Probe p1: tiêm lỗi job và gửi thư trên file SQLite thật (tiến trình con bị SIGKILL) | exit 0; 46 PASS | `04-p1-jobs-delivery.txt`, `p1-jobs-delivery.mjs.txt` |
| Probe p2: kích hoạt, quét hạn, F-1, ma trận 2×2 ghi chú × ảnh, nhắc hạn, độc lập múi giờ | exit 1; 94 PASS, 1 FAIL (WP3-B-01) | `05-p2-automation.txt`, `p2-automation.mjs.txt` |
| Probe p3: mọi route GET × chủ/người được chia sẻ/admin/ẩn danh, hash từng bảng và `data_version` | exit 0; 200 request, 1 request có ghi (lần tải PDF của người được chia sẻ, có audit) | `06-p3-get-safety.txt`, `p3-get-safety.mjs.txt` |
| Probe p4: chặn outbound (chỉ thử các trường hợp bị từ chối), `MAIL_FROM`, lỗi thiếu người gửi, crash ở lần gửi cuối | exit 1; 15 PASS, 1 FAIL (WP3-B-02) | `07-p4-delivery-config.txt`, `p4-delivery-config.mjs.txt` |
| Probe p5: server đã build, CLI run-jobs, ảnh chụp Edge desktop/mobile, tên truy cập, tràn ngang, deep link, múi giờ trình duyệt | exit 0; 10 PASS; 16 màn hình: 0 tràn ngang, 0 control thiếu tên, 0 control mobile thấp hơn 44 px | `08-p5-ui.txt`, `audit-b-*-synthetic.png` |
| Probe p6: token E-8 trong `styles.css` và style inline | exit 0; 0 giá trị cứng ngoài `:root`; bo góc, đổ bóng và transition chỉ qua token; 0 style inline | `09-p6-css-tokens.txt` |
| Probe p7: đổi auto-submit và lựa chọn rõ ràng cho kỳ quá hạn | exit 0; 5 PASS | `10-p7-overdue-choice.txt` |
| `vitest run` deadline-race, delivery-crash, jobs-restart × 5 vòng | exit 0 mỗi vòng; 14 test mỗi vòng | `11-race-rounds.txt` |

Kết quả chính quan sát được (đều từ lần chạy của auditor):

- **Job:** cùng một business key từ 4 tiến trình × 200 vòng chỉ cho một dòng mỗi key; 3 tiến trình runner nhận 60 job, mỗi job đúng một lần (đều thành công ở lần thử 1); retry sau 60, 300, 900 và 3600 giây, rồi chuyển can thiệp ở lần thử 5; runner chết không bị nhận lại ở giây 119, được nhận lại khi lease hết hạn và chuyển can thiệp `lease_expired` sau lần hết hạn thứ năm.
- **Khởi động lại job PDF:** kill trước khi ghi, trước khi rename và sau khi rename vẫn chỉ có một dòng attachment PDF, một file lưu trữ và sổ cái không đổi (còn sót một file `.tmp` mồ côi; việc dọn chưa được lên lịch).
- **Khởi động lại khi gửi và trạng thái không chắc chắn:** kill sau bước chuẩn bị thì dùng lại attempt `preparing` và capture đúng một lần; kill sau khi đã commit `sending` cho `uncertain` (`lease_expired_while_sending`), job vào can thiệp, các lượt sau không gửi gì; kill sau khi adapter đã nhận (đã ghi capture) cũng cho `uncertain` và không capture lần hai. Quyết định `resend` rõ ràng capture đúng một lần, quyết định thứ hai bị 409, `mark_delivered` không gửi gì; vẫn một revision, sổ cái không đổi, quyết định được audit một lần.
- **Gửi thư:** envelope đã capture = To + Cc của snapshot và `MAIL_FROM`; subject, `{SignOffStatus}` và SHA-256 của PDF trùng snapshot và PDF đã lưu; metadata của capture không có trường bí mật; 25 capture nhắc hạn/thông báo không có `attachment.pdf`, không có trường PDF và chỉ một người nhận. `OUTBOUND_MODE=smtp` bị từ chối khi thiếu cờ của chủ dự án và với các giá trị `TRUE`, `1`, `yes`, ` true`; `MAIL_FROM` sai bị từ chối mà không lặp lại giá trị; khi không có người gửi, attempt là `failed_permanent`/`sender_missing`, job vào can thiệp và không có capture. Không bảng nào chứa mật khẩu dạng rõ hay thông tin đăng nhập SMTP.
- **Tự động nộp:** khi mốc kích hoạt còn trống, các lượt runner sau hạn không ghi job, revision hay nhắc hạn nào; mốc kích hoạt trong quá khứ bị 422, lý do trống bị 422, nhân viên bị 403; việc ghi mốc được audit một lần (trước `null`, sau là mốc). Công tắc bật: revision tự động (origin `deadline`, review `pending`, không actor, không reviewed hash, không có dòng `signoffs`); công tắc tắt: một bản ghi quá hạn và một cảnh báo quá hạn, không có revision; kỳ đã ký tay không bị chốt lại; không có gì xảy ra 30 giây trước hạn. Quét hạn dưới TZ America/Los_Angeles, Pacific/Kiritimati, Asia/Ho_Chi_Minh và UTC cho cùng kỳ và cùng hash payload; trong Edge, múi giờ trình duyệt America/Los_Angeles và Pacific/Kiritimati hiển thị cùng kỳ, cùng 14 ngày kế toán và cùng hạn theo múi giờ báo cáo. Bật auto-submit muộn không nộp bản nháp đã quá hạn; chỉ lựa chọn rõ ràng `apply_to_overdue_drafts` mới nộp.
- **F-1:** kỳ trống với `auto_deduct` cho một revision, 14 ngày nhãn Worked/Off, không đề xuất OT, không đề xuất thiếu giờ, không dòng sổ cái. Chế độ choose trên đường tự động để lại dòng trừ `pending_choice` và chỉ ghi khoản cộng tính được.
- **Ma trận ghi chú × ảnh (2×2, tự chạy):** số ảnh trong PDF là 0/0/1/1 đúng theo ủy quyền; dòng ghi chú chỉ xuất hiện khi bật (văn bản mặc định "Automatic submission", hoặc văn bản người dùng đặt); không có dấu hiệu tự động nào khác (`automat|pending|unsigned|not signed|review|deadline|system`) trên PDF hay trong email; `{SignOffStatus}` là "Submitted" hoặc văn bản ghi chú, ở cả subject và nội dung; ngày in là ngày nộp tự động theo America/Los_Angeles (10/13/2026, không phải ngày UTC 10/14); tên tiếng Việt hiển thị đúng. Kiểm tra văn bản ghi chú từ chối chuỗi trống, hai dòng, dấu ngoặc nhọn và 121 ký tự. Màn hình review và lịch sử của chính chủ ghi "Submitted automatically, review pending" và "Not signed yet".
- **Nhắc hạn:** nhắc 24 giờ được quyết định một lần cho mỗi tài khoản đang hoạt động và không lặp khi chạy lại; nhắc 2 giờ gửi cho mọi tài khoản chưa chốt và không gửi cho tài khoản đã ký tay; thông báo kết quả cho mọi lần nộp tự động, quyết định một lần; thông báo ghi review đang chờ và chỉ dẫn tới `<origin>/#/review/2026-10-16`; trang review đó cần đăng nhập (401).
- **An toàn GET:** 44 đường dẫn GET đã đăng ký (43 API cộng client tĩnh) × 4 vai trò = 200 request: không bảng nào đổi và `data_version` giữ nguyên, trừ lần tải PDF của người được chia sẻ qua `/api/shared/:ownerId/revisions/:id/pdf`, vốn phải ghi dòng audit (quyết định F-Q4/F-Q5, mục 7 của gate). Một GET ở phút mới chỉ cập nhật `auth_sessions.last_seen_at`. GET API ẩn danh trả 401; deep link mở màn hình đăng nhập trước rồi tới đúng trang review (desktop và mobile).
- **Chuẩn UI:** chỉ dùng token (`--radius: 4px`, `--transition: all 300ms ease-out`, `--shadow-*` nhiều lớp), một breakpoint 768 px có ghi chú, không style inline; ảnh chụp cho thấy bố cục dày đặc, nhất quán trên desktop và mobile.

### Phát hiện

| ID | Mức | File/hàm | Cách tái hiện | Mong đợi / thực tế | Quy tắc/AC | Cách sửa có giới hạn |
|---|---|---|---|---|---|---|
| WP3-B-01 | Trung bình | `src/server/services/automation.ts:147-157` `governingSwitch` (và danh sách ứng viên ở `:217-247`) | p2 mục 9: kích hoạt 2026-10-01; admin tạo ngày 2026-11-12 một tài khoản chưa từng lưu cài đặt; một lượt runner lúc 00:00:30 | Mong đợi: kỳ đã quá hạn từ trước khi tài khoản được tạo không bị nộp tự động nếu không có lựa chọn rõ ràng. Thực tế: ba revision tự động (payroll 2026-10-16, 10-30, 11-13; kỳ đầu bắt đầu 2026-09-28) được chốt với nhãn mặc định, thông báo kết quả được xếp hàng và job gửi lỗi `recipient_missing`. Cùng nhánh mặc định-bật đó còn tự nộp mỗi kỳ cho tài khoản admin chưa cấu hình (p2, ảnh màn hình admin của p5). | docs/05 "Deadline and recovery" (điều kiện cần mốc hiệu lực auto-submit của người dùng; thay đổi mặc định áp cho kỳ tương lai, bản nháp quá hạn cần lựa chọn rõ ràng), AC-07, F-4; carry item 6 của HANDOFF ("mốc kích hoạt là lớp bảo vệ") không đúng với tài khoản tạo sau khi kích hoạt | Với tài khoản chưa có phiên bản cài đặt nào, dùng thời điểm tạo tài khoản (`users.created_at`) làm mốc hiệu lực auto-submit, để kỳ có `due_at` trước mốc đó bị bỏ qua (`before_effective`); giữ mặc định-bật cho các hạn sau đó. Thêm test tích hợp red-first (tài khoản tạo sau kích hoạt có các hạn đã qua → không có revision; hạn đầu tiên sau khi tạo → nộp tự động theo F-1). |
| WP3-B-02 | Thấp | `src/server/jobs/jobStore.ts:194-197` (đoạn quét lease hết hạn trong `claimNextJob`) cùng `src/server/services/deliveries.ts:28-53` (`recoverInterruptedSends`, chỉ được gọi từ `sendJob.ts:214` và `deliveries.ts:170`) | p4 mục 3: bốn kết quả `failed_temporary`, rồi runner bị kill sau khi commit `sending` ở lần thử thứ năm (cuối); một lượt chạy sau khi lease hết hạn | Mong đợi: attempt chuyển `uncertain` và yêu cầu chủ quyết định. Thực tế: job vào can thiệp `lease_expired`, attempt vẫn `sending` với `decision_required: false`, màn hình Lịch sử hiện "Sending" và lệnh gửi lại bị 409 `delivery_in_progress`, cho tới khi một job gửi khác chạy ở đâu đó. Không có gửi lại mù. | Bảng lỗi docs/05 ("mất tiến trình/kết nối sau khi có thể đã được nhận: đánh dấu uncertain … cần quyết định gửi lại rõ ràng"), AC-08 | Đánh dấu uncertain các attempt `sending` đang mở của job gửi mỗi khi job rời trạng thái `leased` mà handler không chạy (ví dụ gọi `recoverInterruptedSends` đầu mỗi lượt `runJobsOnce`, hoặc cập nhật attempt trong cùng transaction với bước chuyển can thiệp do lease hết hạn). Thêm test cho chuỗi này. |
| WP3-B-03 | Thấp | `src/client/components/sharingModel.ts:179-182` `historyActorBadge`; `src/client/components/otModel.ts:82-97` `OPERATION_TEXT` | ảnh lịch sử của p5 `audit-b-automation-owner-history-desktop-synthetic.png` sau một lần nộp tự động | Mong đợi: màn hình của chính nhân viên nói đúng, bằng lời thường, về nguồn gốc tự động. Thực tế: sự kiện hiện mã thô `timesheet.auto_finalize` kèm nhãn "by someone else" (mọi sự kiện hệ thống không có actor — `deadline.overdue`, `deadline.finalize_failed` — đều bị gắn nhãn đó), và các thao tác WP3 khác (`timesheet.signoff`, `revision.resend`, `delivery.decision`, `auth.login`) hiện dạng mã thô. | docs/04 Screens ("giữ luồng thông thường không có thuật ngữ DB/job"), quyết định F-Q2 (màn hình của nhân viên cho thấy nguồn gốc tự động) | Ghi nhãn sự kiện không actor là thao tác tự động của hệ thống thay cho "by someone else", và thêm nhãn lời thường cho các mã thao tác WP3; mở rộng test model phía client hiện có. |

Không thấy lỗi nào khác trong vùng B.

### Carry item (vùng B)

| Carry item | Đánh giá | Lý do |
|---|---|---|
| Nhắc hạn có thể lặp sau crash khi dùng SMTP thật | Backlog chấp nhận được (Thấp) | Chỉ là thông báo gửi tới địa chỉ của chính nhân viên; quyết định được khử trùng lặp theo từng lần; khoảng hở là crash giữa lúc nhà cung cấp nhận và `completeJob`; chế độ capture được bảo vệ bằng thư mục attempt; không ảnh hưởng tài liệu payroll hay sổ cái. Thêm dấu `sending` cho `send_reminder` sẽ cho at-most-once nếu chủ dự án muốn. |
| Lỗi xác thực TLS được xếp là tạm thời | Backlog chấp nhận được (Thấp) | Đọc code (nodemailer báo lỗi socket STARTTLS/TLS là `ESOCKET`): không có gì được truyền, thông tin đăng nhập không bao giờ đi dạng rõ (`requireTLS`/`secure`), job retry 1/5/15/60 phút rồi vào can thiệp hiển thị được; chỉ có mã `smtp_unavailable` kém chính xác. Không chạy với server thật (quy tắc chỉ capture). |
| Job gửi được nhận trước PDF tốn một lần thử | Backlog chấp nhận được (Thấp) | Thấy trong p2 (2 lần gửi phải retry, gửi được ở lượt sau). Vô hại trừ khi job PDF lỗi liên tục theo cùng lịch, khi đó job gửi có thể vào can thiệp `pdf_not_ready` và cần gửi lại tay. Xếp PDF trước job gửi (hoặc hoãn mà không tính lần thử) sẽ loại bỏ việc này. |
| Tên thao tác thô trong lịch sử | Tự nó không chặn (Thấp; mẫu này đã được chấp nhận ở WP2), nhưng nên gộp vào bản sửa WP3-B-03 | WP3 thêm mã thô cho chính các thao tác của nó, kể cả lần nộp tự động, và cùng màn hình đó gắn nhãn sai sự kiện hệ thống là "by someone else". |

### Rủi ro và cải tiến tùy chọn (không phải lỗi đã chứng minh)

- GET có ghi theo thiết kế: lần tải PDF của người được chia sẻ ghi dòng audit; mọi GET đã đăng nhập cập nhật `auth_sessions.last_seen_at` tối đa một lần mỗi phút. Không cái nào ký, nộp hay tiêu dùng gì (docs/05).
- File PDF tạm mồ côi sau crash trước rename vẫn nằm trên đĩa (hàm dọn của file store có nhưng chưa lên lịch; mục 4 của HANDOFF). Dòng job (mỗi phút một `deadline_scan`, mỗi 5 phút một `reminder_scan`) không bao giờ bị xóa.
- Audit này không chạy SMTP thật; adapter SMTP và các test với sink loopback đã chạy trong `npm run verify`.
- Liên kết nội dòng "record it on the OT screen" (`src/client/components/ReviewFindings.tsx:157`) không có transition chung hay style hover (Thông tin).
- Việc loại trừ `imported_unverified` đã được kiểm trong code và trong test của tác giả; đường import thật có ở WP4.

### Gate bắt buộc chưa chạy/bị chặn và lý do

- Gửi SMTP thật, triển khai NAS và kích hoạt production: bị cấm trước khi chủ dự án cho phép pilot.
- Không còn dòng gate bắt buộc nào của vùng B chưa chạy.

### Xử lý các phát hiện trước

- WP3-GATE (PASS) và báo cáo của tác giả được coi là lời khẳng định và được chạy lại ở những phần thuộc vùng B; các con số của gate (60 file / 1384 test, 40 dòng `PASS` của smoke, 127 passed / 5 skipped) tái hiện được. Carry item 6 của HANDOFF là gốc của WP3-B-01.

### Sẵn sàng phần mềm, sự cho phép của chủ dự án và kết quả pilot

- Sẵn sàng phần mềm (vùng B): chưa chấp nhận cho tới khi WP3-B-01 đến WP3-B-03 được sửa và kiểm lại.
- Sự cho phép của chủ dự án cho gửi thật/kích hoạt: chưa yêu cầu, chưa có. Kết quả pilot: chưa có.

### Một hành động/prompt tiếp theo

Coordinator giao một task sửa có giới hạn cho WP3-B-01, WP3-B-02 và WP3-B-03 theo [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md), rồi freeze, gate và một lần kiểm lại vùng B mới ở digest mới.

Không bịa phát hiện, không ghi nhận kết quả chưa quan sát. Review một phần không phải là chấp nhận toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/lần review, ID reviewer và ID tác giả được review:** WP3-AUDIT-B lần 1, agent reviewer `aca7e1ccf879138f1`; tác giả được review là các agent của task WP3 trên board (PLAN, REQ, REQ2, T00–T15 cùng T07B và T13A–T13D, DOC, REC1).
- **Context mới; xác nhận reviewer không viết thay đổi:** context mới; reviewer này không viết thay đổi WP3 nào và không sửa source. Model tác giả mạnh nhất là `claude-opus-5-5`, bằng model của reviewer.
- **Source digest trước/sau; bằng chứng gate cho snapshot đó:** `96870f7e…6e729` trước và sau; bằng chứng WP3-GATE `evidence/WP3-GATE/` thuộc cùng snapshot.
- **Đường dẫn báo cáo mới, giữ lịch sử review trước:** `handoff/delivery/WP3_REVIEW_B.md` (mới); chưa có review vùng B nào trước đó cho WP3.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:** WP3-B-01 (Trung bình), WP3-B-02 (Thấp), WP3-B-03 (Thấp) còn mở → một task sửa, freeze, gate, kiểm lại vùng B mới.
