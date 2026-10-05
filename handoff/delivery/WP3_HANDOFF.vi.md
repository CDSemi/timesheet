# Bàn giao WP3 — Nộp, PDF, gửi, tự động và chia sẻ

Hoàn thành theo [HANDOFF](../templates/HANDOFF.vi.md) với bằng chứng thực tế. Bản dịch của [WP3_HANDOFF.md](WP3_HANDOFF.md); tiếng Anh là nguồn chuẩn. Mọi con số dưới đây được chép từ một bản ghi tác vụ hoặc một file bằng chứng nêu bên cạnh; không có con số nào được chạy lại, trừ khi một dòng nói rõ. Số liệu chưa chạy hoặc chưa kiểm được đều ghi rõ. Gate cuối gói (WP3-GATE) và các audit độc lập mới chưa chạy: bản ghi chấp nhận ở cuối cố ý để trống và sẽ là căn cứ cho định danh gói và các kết luận của gate và audit khi bước chấp nhận điền vào.

- **Gói/phạm vi, ngày và tác giả:** chỉ WP3, theo [WP3-PLAN](tasks/WP3-PLAN.md), [WP3-REQ](tasks/WP3-REQ.md), [WP3-REQ2](tasks/WP3-REQ2.md), [WP3_IMPLEMENT](../prompts/WP3_IMPLEMENT.vi.md) và [09 Lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md): xem lại và sign-off, chốt revision cùng sửa sau chốt, PDF, kho file riêng tư, gửi capture và SMTP, bộ chạy job bền, tự động nộp theo hạn, nhắc hạn, chia sẻ do chủ sở hữu cấp, màn hình tình trạng cho admin và bằng chứng đầu-cuối. 04/10/2026 → 05/10/2026 (mốc thời gian trong bằng chứng là UTC). Tác giả: các subagent Claude Code của mission điều phối timesheet (mỗi lúc một người ghi source); bản bàn giao này và các thay đổi tài liệu cho nhà phát triển do một `timesheet-worker` (WP3-T15) viết.
- **Model/effort/speed thực tế, hoặc không quan sát được:** tự khai trong các bản ghi tác vụ. T01, T05, T08, T09 và T13B chạy trên `claude-opus-5-5` (profile `timesheet-worker-high`, override `opus`); T00, T02, T03, T04, T06, T07, T07B, T10, T11, T12, T13, T13A, T13C, T13D, T14, WP3-DOC và tác vụ này chạy trên `claude-sonnet-5-5`; audit GOV-WP3P chạy trên `claude-opus-5-5`. Effort và speed không quan sát được từ bên trong phiên; hãy xác nhận trong client.
- **Commit SHA, digest source và commit chưa push, hoặc bản source đầy đủ:** freeze triển khai cuối là WP3-T14-FREEZE, commit `b083739bb8f1d7e8b932c8d5463bfb271ac5b1e5` (đã push, [WP3-T14-FREEZE](tasks/WP3-T14-FREEZE.md)), digest source `677b914268406543b542a5bbb2491e46266ae1bf5e2d950239a259778329b20c` trên 717 file (loại `handoff/`). WP3-T15 chỉ đổi tài liệu cho nhà phát triển và mô tả trong `package.json` trên nền đó: digest source sau tác vụ này `96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729` trên 717 file (lần chạy T15, `evidence/WP3-T15/`). Các thay đổi T15 chưa commit cho đến WP3-T15-FREEZE; SHA và digest của freeze cuối gói do gate và bản ghi chấp nhận ghi, không bao giờ ghi tay ở đây. Không có commit chưa push ở baseline T15.
- **Trạng thái triển khai; trạng thái review độc lập:** mọi tác vụ triển khai WP3 (T00–T14 cùng T07B và T13A–T13D) đã triển khai và được bảng freeze; T15 (bản bàn giao này) là tác vụ tài liệu cuối gói. Review độc lập cho phần mềm: **chưa chạy** (WP3-GATE, rồi các audit mới). Review độc lập duy nhất đến nay là audit quản trị GOV-WP3P-AUDIT (PASS trên `da6d0cd`, [GOV_WP3P_REVIEW](GOV_WP3P_REVIEW.vi.md)), chỉ bao phủ các câu phạm vi và gate trong prompt.
- **Hành vi đã triển khai và file đã đổi:** xem "Phạm vi đã giao theo tác vụ" bên dưới.
- **Migration/tương thích schema:** ba migration, đều chỉ thêm và có checksum (xem "Migration 0004–0006").
- **Hợp đồng chuẩn đã đổi và lý do, hoặc không:** có, đều ghi bằng tiếng Anh và tiếng Việt bởi WP3-DOC (cb9800e): docs 01, 02, 03, 04, 05, 06, 07, 09 và 10, các prompt WP3 và `reference/examples/policy.example.json`, cho các quyết định chủ sở hữu ngày 04/10/2026 (xem "Quyết định chủ sở hữu đã triển khai"). Quy tắc tính R-01…R-07 và các số của fixture không đổi. Một thay đổi quản trị: GOV-WP3P (xem bên dưới).
- **Bảng kiểm chứng:** bên dưới. Mọi lệnh chạy bằng runtime Node 24 portable (`v24.21.0`) gọi bằng đường dẫn đầy đủ.
- **AC đã bao phủ; đường chưa chạy/bị chặn thật sự:** bên dưới.
- **Ảnh chụp/PDF/bằng chứng mail-capture tổng hợp:** ảnh `*-synthetic.png` nằm trong các thư mục bằng chứng T12, T13, T13C, T13D và T14; năm ảnh dựng trang PDF (`pdf-*-synthetic.png`) nằm trong `evidence/WP3-T14/`. Mail capture được kiểm trong script smoke và `tests/e2e/submission.spec.ts`; không có `.eml`, PDF hay CSV nào được lưu trong repo.
- **Phát hiện đã xử lý, lỗi còn lại và backlog tùy chọn:** bên dưới ("Giới hạn và mục chuyển tiếp").
- **Đầu vào cài đặt cần từ chủ sở hữu, không gồm bí mật:** không có cho mức sẵn sàng phần mềm. Cho gói pilot: host, cổng và chế độ bảo mật SMTP, địa chỉ người gửi, người nhận payroll, base URL HTTPS công khai, thư mục dữ liệu và thời điểm kích hoạt. Giá trị do chủ sở hữu cung cấp ngoài repo; không xin bí mật trong chat. Câu hỏi chủ sở hữu còn mở: F-Q6 (quy tắc riêng tư xem trước ngày lễ WP2-A-01 giữ nguyên và câu hỏi được hỏi lại).
- **Hành động production và ủy quyền tường minh, thường là không:** không có. Không triển khai, không mở host ra ngoài (chỉ loopback), không email thật, không dữ liệu thật. `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt; chế độ gửi là capture suốt. Thời điểm kích hoạt đang rỗng.
- **Usage/credit chỉ khi quan sát được thật:** không quan sát được trong các phiên này.
- **Một hành động tiếp theo và prompt tương ứng:** chạy WP3-GATE ([WP3-GATE](tasks/WP3-GATE.md)) trên commit WP3-T15-FREEZE, rồi các audit độc lập mới ([WP3_REVIEW](../prompts/WP3_REVIEW.vi.md)); không bắt đầu WP4 trước khi chúng đạt.

## Nguồn gốc điều phối

- **ID mission/tác vụ và bảng/checkpoint:** mission `timesheet-software-readiness`, gói WP3, các tác vụ WP3-PLAN, WP3-REQ, WP3-REQ2, WP3-T00 … WP3-T15 (cùng WP3-T07B, WP3-T13A–WP3-T13D, WP3-T07-RECON, WP3-E2E-RECHECK, WP3-REC1, WP3-TMPCLEAN, WP3-DOC), GOV-WP3P (FREEZE, GATE, AUDIT) và một FREEZE cho mỗi tác vụ triển khai. Bảng: [ORCHESTRATION.json](ORCHESTRATION.json); brief và kết quả: `handoff/delivery/tasks/`; checkpoint: [WORKFLOW_REVISION_CHECKPOINT.vi.md](WORKFLOW_REVISION_CHECKPOINT.vi.md).
- **Danh tính bên triển khai và auditor độc lập; ngữ cảnh tách biệt:** mỗi tác vụ chạy trong ngữ cảnh subagent riêng. Chưa có audit gói WP3; gate và các audit phải dùng ngữ cảnh mới, không phải tác giả của bất kỳ thay đổi WP3 nào.
- **Digest đã kiểm/đã review hiện tại; báo cáo và quyết định review:** digest chính thức sẽ là giá trị gate tính trên bản export sạch của commit WP3-T15-FREEZE. Chưa có báo cáo hay quyết định review.
- **Tác vụ/phụ thuộc còn lại; một hành động tiếp theo của điều phối viên:** WP3-T15-FREEZE, WP3-GATE, hai audit mới, rồi bước chấp nhận trên bảng. Hành động tiếp theo của điều phối viên: giao WP3-T15-FREEZE sau các kiểm tra của tác vụ này, rồi WP3-GATE.
- **Mức sẵn sàng phần mềm và việc chờ chủ sở hữu cho phép pilot, tách riêng:** mức sẵn sàng phần mềm của WP3: đã triển khai, chưa qua gate hay audit. Chủ sở hữu cho phép pilot: chưa yêu cầu và chưa cho; không có gì được triển khai và chưa gửi email thật nào.

## Quyết định chủ sở hữu đã triển khai

Nguồn: [docs/10, "Quyết định của chủ sở hữu — 2026-10-04"](../../docs/10_DECISIONS_AND_SOURCES.vi.md), `owner_decisions` của bảng và [WP3-REQ2](tasks/WP3-REQ2.md).

| Quyết định | Triển khai điều gì | Do |
|---|---|---|
| F-1 | Kỳ không có mục nào được lưu vẫn được tự nộp với nhãn mặc định, OT bằng 0 và không thiếu giờ | T10 (test kỳ rỗng), e2e T14 |
| F-Q1, F-Q2 | Không có chỉ báo tự động trên PDF và email gửi đi; khối chữ ký in tên và ngày tự nộp; ảnh chỉ khi có ủy quyền tường minh; dòng ghi chú tùy chọn của người dùng (mặc định "Automatic submission", tắt); hệ thống giữ origin deadline, review pending, `signed_at` rỗng, không có sign-off | T07B (schema 0005, bộ dựng, snapshot v2), T13 (cài đặt), T14 (ảnh dựng) |
| G-Q1 (b) | Khi tải chữ ký lên, app hỏi ủy quyền ảnh tự động, chọn sẵn; một hành động tường minh có audit; bỏ chọn nghĩa là không có ảnh cho đến khi ủy quyền trong Cài đặt | T07B (`?authorize_auto_image=`), T13 (UI đồng ý khi tải lên) |
| G-Q2 (a) | `{SignOffStatus}` hiển thị "Submitted" cho nộp thủ công và tự động, hoặc nội dung ghi chú cho lần tự nộp có bật ghi chú | T07B |
| F-2 | Khoản ghi nợ thiếu giờ đang chờ là một dòng bất biến của revision, hiển thị trên màn xem lại và OT, chỉ được đánh giá lại bởi revision chốt sau; không ghi nền | T05, T06, T12 |
| F-3, F-Q3 | Admin thấy mọi thứ trừ chi tiết timesheet, gồm địa chỉ người nhận nhưng không có mẫu hay nội dung thư | T13D |
| F-3, F-Q4, F-Q5 | Chia sẻ do chủ sở hữu cấp theo từng mục (xem, sửa, đọc OT, tải PDF), thu hồi được, có audit, không bắc cầu; admin chỉ liệt kê và thu hồi | T13A, T13B, T13C |
| F-4 | Một thời điểm kích hoạt toàn hệ thống (rỗng cho đến pilot) kết hợp với thời điểm hiệu lực tự nộp của từng người dùng | T03 (instant theo người dùng), T10 (kích hoạt, quét) |
| F-5 | Tổng trên PDF là tổng OT được ghi nhận dạng h:mm trên cả 14 ngày, ẩn khi "Show OT on PDF" tắt | T07 |
| F-Q6 | **Còn mở.** WP2-A-01 (không có số đếm xem trước ngày lễ suy ra từ nhân viên) giữ nguyên và câu hỏi vẫn mở cho chủ sở hữu | không đổi |

## Phạm vi đã giao theo tác vụ

Mỗi dòng nêu commit freeze của bảng (SHA viết tắt của `git`) và kết quả verify mà bản ghi tác vụ báo: số file test / số test của `npm run verify` tại tác vụ đó. Bản ghi freeze T14 là con số cuối.

| Tác vụ | Freeze | Hành vi | Verify (file / test) |
|---|---|---|---|
| WP3-T00 | `db75346` | Chốt chặn công thức của CSV bằng chứng ở ký tự kích hoạt đầu tiên khác khoảng trắng (R2 của WP2); smoke chọn cổng trống và báo lỗi nhìn thấy được (WP2-A4-01) | 32 / 619 |
| WP3-T01 | `ac5d0ba` | Migration 0004 `submission` (tệp đính kèm, phiên bản cài đặt nộp, revision, sign-off, dòng sổ cái của revision, file của revision, job, lần gửi, lần nhắc, trạng thái vận hành); `loadDeliveryConfig` (thư mục dữ liệu, base URL công khai, người gửi, chế độ gửi, bí mật SMTP được che) | 33 / 674 |
| WP3-T02 | `b060d33` | Kho file riêng tư (ghi nguyên tử, khóa mờ, quét mồ côi), kiểm tra ảnh chữ ký PNG/JPEG, `POST /api/signatures` (giới hạn 256 KiB), tải chữ ký chỉ của chủ sở hữu, audit | 35 / 711 |
| WP3-T03 | `79862bb` | Cài đặt nộp (phiên bản chỉ thêm, người nhận được kiểm tra, engine mẫu an toàn, ủy quyền ảnh tự động, xem trước không ghi), `/api/settings/submission*` | 37 / 821 |
| WP3-T04 | `b89f8a8` | Snapshot JSON chuẩn tắc và SHA-256, payload xem lại chỉ dựng từ engine, `GET /api/timesheets/:payrollDate/review` chỉ đọc | 39 / 878 |
| WP3-T07 | `c289375` | Bộ dựng pdf-lib xác định với font DejaVu nhúng, ảnh chữ ký bị chặn kích thước, cả hai Chủ nhật nằm trong tổng OT | 40 / 906 |
| WP3-T05 | `72f1920` | `POST .../signoff` trong một giao dịch IMMEDIATE: revision 1, sign-off, ghi nợ rồi ghi có qua một sổ cái duy nhất, dòng ghi nợ đang chờ (F-2), hai job; phát lại idempotent; xem lại cũ 409 | 42 / 930 |
| WP3-T06 | `2f8011a` | Sửa sau chốt với lý do bắt buộc (chỉ chênh lệch, khóa riêng cho từng revision), xem lại muộn (delta bằng 0, LG-09), gửi lại tường minh với phong bì đóng băng; R1 của sổ cái (so cả `sourceRef`) | 43 / 959 |
| WP3-T08 | `3d7a17c` | Kho job bền (lease, thử lại 1/5/15/60 phút, mã được che), bộ chạy, job PDF, CLI `run-jobs`, bộ chạy trên server (`JOB_RUNNER`) | 45 / 980 |
| WP3-T09 | `0a26afa` | Bộ dựng thư, adapter capture và SMTP có phân loại kết quả, job gửi có phục hồi sau sự cố, route lịch sử gửi và quyết định | 47 / 1005 |
| WP3-T10 | `0321be6` | Tự động theo hạn: thời điểm kích hoạt, chốt tự động (origin deadline), bản ghi quá hạn, phục hồi theo thứ tự thời gian, test đua giữa thủ công và hạn | 49 / 1038 |
| WP3-T11 | `c3d32b9` | Nhắc hạn (24 giờ, 2 giờ, quá hạn, thông báo kết quả), chống trùng, gộp, link sâu yêu cầu đăng nhập, email chỉ cho nhân viên | 51 / 1095 |
| WP3-T12 | `8e2c2bf` | Màn xem lại và sign-off, xử lý bản cũ, link sâu, tình trạng xem lại và gửi ở phần đầu | 52 / 1135 |
| WP3-T13D | `19723b6` | Tình trạng vận hành và nộp cho admin với danh sách khóa cho phép (F-3, F-Q3 (b)) | 53 / 1150 |
| WP3-T13A | `c1e4bb2` | Đường nối actor/subject trong các factory router và audit; cấu hình gửi được tiêm vào app (không đổi hành vi; kiểm kê route giống hệt) | 54 / 1164 |
| WP3-REC1, WP3-DOC | `632092d`, `cb9800e` | REC1: commit chỉ gồm hồ sơ của bằng chứng kiểm lại e2e; DOC: docs chuẩn, prompt và ví dụ chính sách được cập nhật cho các quyết định 04/10/2026 | 54 / 1164 (DOC) |
| GOV-WP3P | `da6d0cd` | Thay đổi quản trị: các câu phạm vi và gate WP3 trong bốn prompt WP3 (xem bên dưới) | không áp dụng |
| WP3-T07B | `943027b` | Migration 0005; dòng ghi chú và tùy chọn ảnh; snapshot v2; một văn bản `SignOffStatus`; bộ dựng không có chỉ báo tự động; bắt buộc có ảnh khi nộp thủ công | 54 / 1232 |
| WP3-T13 | `5b90d30` | Tải PDF chỉ của chủ sở hữu (`GET /api/revisions/:id/pdf`), màn lịch sử và gửi, UI cài đặt nộp, đồng ý khi tải chữ ký, trạng thái trên lưới | 57 / 1292 |
| WP3-T13B | `c3c35de` | Migration 0006 `timesheet_shares`; service và route chia sẻ; danh sách cho phép `/api/shared/:ownerId` (17 route) với kiểm lại trong giao dịch; danh sách revision chỉ của chủ sở hữu; quy gán lịch sử; admin liệt kê và thu hồi chia sẻ | 59 / 1356 |
| WP3-T13C | `8ad2e4f` | Cài đặt chia sẻ, bộ chuyển và thanh "Shared with me", các màn được chia sẻ, lịch sử dựng từ danh sách revision; `GET /api/signatures/current` trả 200 `{signature: null}` | 60 / 1383 |
| WP3-T14 | `b083739` | Luồng đầu-cuối (sign-off và xung đột, ma trận tự nộp, gửi lại và quyết định không chắc chắn, ranh giới admin), kiểm tra smoke, ảnh dựng PDF trực quan, sửa capture (không có `attachment.pdf` cho thư không đính kèm), seed và `MAIL_FROM` | 60 / 1384 |

WP3-E2E-RECHECK (verifier, HEAD `c1e4bb2`, digest `0edefc94…03299`) chạy lại `npm run test:e2e` sau khi lần chạy T13A gặp lỗi bộ đệm socket: thoát 0, 97 đạt, 3 bỏ qua, không có dòng `ERR_*` ([WP3-E2E-RECHECK](tasks/WP3-E2E-RECHECK.md)). WP3-T07-RECON (verifier) giải thích sự lệch digest của T07 (worker sửa một test sau khi tính digest) và kiểm lại: 40 file / 906 test, thoát 0 ([WP3-T07-RECON](tasks/WP3-T07-RECON.md)).

Route thêm trong WP3 (đều dưới `/api`; hợp đồng nằm trong các bản ghi tác vụ): `POST /signatures`, `GET /signatures/current`, `GET /signatures/:id`; `/settings/submission*` (đọc, phiên bản, lưu, xem trước, ủy quyền và thu hồi ảnh tự động); `GET /timesheets/:payrollDate/review`, `POST .../signoff`, `GET .../finalization`, `POST .../revisions`, `POST .../late-review`; `GET /revisions`, `GET /revisions/pending-lines`, `POST /revisions/:id/resend`, `GET /revisions/:id/pdf`; `GET /deliveries`, `POST /deliveries/:id/decision`; `GET|POST /shares`, `PUT /shares/:id`, `POST /shares/:id/revoke`, danh sách cho phép `/shared/:ownerId`; `GET /admin/operations`, `GET /admin/submissions`, `GET|PUT /admin/automation*`, `GET /admin/shares`, `POST /admin/shares/:id/revoke`. Không route nào ghi trực tiếp tín dụng hay ghi nợ; các test kiểm kê route liệt kê mọi route thay đổi dữ liệu.

## Migration 0004–0006

- `0004_submission` (T01): các bảng nêu trên cùng `timesheets.imported_unverified`; STRICT, khóa ghép `(id, user_id)`, trigger bất biến và một-lần-gửi-đang-mở; không cột nào lưu bí mật, thông tin đăng nhập, token hay nội dung file. Nâng cấp từ CSDL v3 tạo bởi mã `5fafeae` chỉ áp 0004 và giữ nguyên mọi dòng v3 (`evidence/WP3-T01/04-upgrade-5fafeae.txt`: `integrity_check` ok, `foreign_key_check` rỗng).
- `0005_automatic_presentation` (T07B): `submission_settings.auto_note_enabled` và `auto_note_text` bằng `ALTER TABLE ADD COLUMN`; các phiên bản cũ đọc ra là "tắt, văn bản mặc định"; checksum 0004 được ghim trong một test.
- `0006_timesheet_shares` (T13B): `timesheet_shares` (chủ sở hữu, người được chia sẻ, các mục, trường thu hồi, một chia sẻ đang hiệu lực cho mỗi cặp, không xóa); checksum 0001–0005 được ghim.
- Mục 11 của brief WP3-GATE lặp lại việc nâng cấp từ source WP2 đã chấp nhận `5fafeaee72509c6110a907458643bf7582dad81a` qua 0004–0006; lần chạy gate đó chưa diễn ra.

## Dependency đã thêm

Ghim chính xác trong `package.json` và `package-lock.json`. Runtime: `pdf-lib` 1.17.1, `@pdf-lib/fontkit` 1.1.1, `dejavu-fonts-ttf` 2.37.3 (T07), `nodemailer` 10.0.14 (T09). Dev: `pdfjs-dist` 6.4.299 (T07; kéo theo các gói nền tảng tùy chọn `@napi-rs/canvas`, không có script cài đặt), `smtp-server` 3.19.17 và `@types/smtp-server` 3.5.13 (T09). Các bản ghi tác vụ nêu rằng `npm view` không báo trường `deprecated` và log verify không có dòng deprecation (T07: +20 gói, T09: +6, không gói nào bị gỡ).

## Lệnh

| Lệnh | Mục đích | Kết quả ghi nhận gần nhất |
|---|---|---|
| `npm run verify` | typecheck, lint, test, build, smoke | Bản ghi T14: thoát 0, 60 file / 1384 test, không có dòng deprecation; lần chạy T15 bên dưới |
| `npm run test:e2e` | build, rồi Playwright desktop và mobile trên kênh Edge đã cài | Bản ghi T14: 127 đạt, 5 bỏ qua (132 trên cả hai project, `evidence/WP3-T14/06-e2e.txt`) |
| `npm run digest` | digest source, loại `handoff/` | T14: `677b9142…9b20c`; T15: `96870f7e…6e729` |
| `npm run smoke` | server đã build qua HTTP với CSDL dùng một lần | Bằng chứng T14 `07-verify.txt`: SMOKE PASSED, 40 dòng `PASS` (bản ghi T14 nói "46 checks"; log chỉ có 40 dòng `PASS`, một chênh lệch ghi chép để gate xử lý) |
| `node dist/server/cli.js run-jobs --once --now <instant UTC>` | một lượt chạy job xác định; bị từ chối khi production | được `tests/integration/jobs-restart.test.ts` và script smoke bao phủ |
| `node scripts/precommit-check.mjs` | cổng riêng tư trên index tạm | mọi tác vụ freeze đều chạy, 0 phát hiện |

## Kiểm chứng

Mọi con số là của chính các bản ghi tác vụ, trừ khi dòng ghi "T15". Chưa có lần tái hiện độc lập; WP3-GATE lặp lại chúng trên bản export sạch.

| Kiểm tra | Môi trường | Mã thoát | Kết quả quan sát | Bằng chứng |
|---|---|---:|---|---|
| T14 `npm run verify` với `--trace-deprecation --pending-deprecation` | Node 24.21.0 | 0 | 60 file / 1384 test, không có dòng deprecation | `evidence/WP3-T14/07-verify.txt` |
| T14 `npm run test:e2e` | Edge, desktop 1280x800 và mobile 390x844 | 0 | 127 đạt, 5 bỏ qua | `evidence/WP3-T14/06-e2e.txt` |
| T14 `npm run digest` | Node 24.21.0 | 0 | `677b9142…9b20c` (717 file) | `evidence/WP3-T14/08-digest.txt` |
| T15 `npm run verify` với `--trace-deprecation --pending-deprecation` | Node 24.21.0, Windows, chạy tại chỗ | 0 | 60 file / 1384 test; không có dòng deprecation; SMOKE PASSED | `evidence/WP3-T15/` |
| T15 `npm run digest` | Node 24.21.0 | 0 | `96870f7e…6e729` (717 file) | `evidence/WP3-T15/` |
| Test đua và chèn lỗi | worker threads, tiến trình con bị kill | 0 trong verify của từng tác vụ | T05: hai sign-off khác nhau 20 vòng, giống nhau 10, sign-off so với sửa ngày 10; T10: thủ công so với hạn 20 vòng (sign-off thắng 3, hạn thắng 17) và quét so với quét 10; T08: ba tiến trình runner nhận 40 job đúng một lần; T08/T09: kill trước khi ghi, giữa ghi và đổi tên, sau đổi tên, sau khi sink nhận thư, trước và sau `sending` | `evidence/WP3-T05/`, `WP3-T08/`, `WP3-T09/`, `WP3-T10/` |
| Kiểm tra đột biến (do tác giả chạy) | theo từng tác vụ | không áp dụng | mỗi tác vụ báo mọi đột biến đều bị bắt (T00 một đột biến chốt chặn được hoàn nguyên và khôi phục, T01 6, T02 14, T03 18, T04 16, T05 13, T06 19, T07 14, T07B 19, T08 13, T09 4, T10 12, T11 16, T12 8, T13 16, T13A 6, T13B 10, T13C 11, T13D 8) | log đột biến `03`/`04` của từng tác vụ |

Ánh xạ AC: bản ánh xạ gate của WP3-T14 (`evidence/WP3-T14/10-gate-mapping.txt`) liệt kê, theo từng mục gate, đặc tả, test hoặc ảnh dựng; nó nêu rằng bốn bài đua, chèn lỗi, nâng cấp migration và các mục LG/DF được các bộ test của tác vụ trước và gate cuối gói bao phủ.

**AC đã bao phủ (bằng chứng của tác giả, không độc lập):** AC-01 (ID-swap 404, kiểm kê route, ma trận chia sẻ), AC-03 (idempotency của job và ghi sổ, đồng thời), AC-04 (lý do, audit, revision), AC-06–AC-10 (sign-off, tự nộp, trạng thái gửi, nhắc hạn, PDF), AC-14 (file và tải riêng tư), AC-16 (chia sẻ). **Thật sự chưa chạy:** WP3-GATE và các audit độc lập; `npm ci` trên export sạch; nâng cấp từ source WP2 qua 0004–0006 ngoài probe nâng cấp v3 của T01; mọi lần gửi SMTP thật (bị cấm trước khi chủ sở hữu cho phép pilot); việc dựng PDF thành ảnh chỉ có qua bản dựng trang bằng Edge của T14.

## Chỉ mục bằng chứng

Tất cả nằm dưới `handoff/delivery/evidence/` (log đã che, LF; ảnh tổng hợp; script lưu dạng `*.txt`):

- `WP3-T00/` … `WP3-T13D/`: log red, green, đột biến, verify và digest theo từng tác vụ; `WP3-T12/`, `WP3-T13/`, `WP3-T13C/`, `WP3-T13D/` còn chứa ảnh chụp tổng hợp.
- `WP3-T14/`: capture red/green, e2e, verify, digest, `10-gate-mapping.txt`, năm ảnh dựng `pdf-*-synthetic.png` và ảnh chụp e2e.
- `*-FREEZE/`: log kiểm tra của committer cho từng freeze (digest, số file stage, mã thoát các kiểm tra).
- `WP3-DOC/`: log parity và preflight; `WP3-E2E-RECHECK/`, `WP3-T07-RECON/`, `WP3-TMPCLEAN/`; `GOV-WP3P-GATE/`, `GOV-WP3P-AUDIT/`.
- `WP3-T15/`: ghi chú parity, log preflight, verify và digest của T15.

## Giới hạn và mục chuyển tiếp

Còn mở tại bản bàn giao này, theo các bản ghi tác vụ (tác giả không coi mục nào là chặn; gate và audit quyết định):

1. **Nhắc hạn có thể lặp một lần sau sự cố trên SMTP thật** (ghi chú 4 của T11): sự cố giữa lúc nhà cung cấp chấp nhận và `completeJob` có thể gửi một nhắc hạn tư vấn hai lần; chế độ capture được bảo vệ bằng thư mục của nó. Xem lại nếu chủ sở hữu muốn nhắc hạn tối đa một lần.
2. **Lỗi xác minh chứng chỉ TLS được phân loại là tạm thời** (T09): lỗi tới adapter dưới dạng `ESOCKET`, nên thử lại và kết thúc ở can thiệp sau các lần thử thay vì ngay lập tức.
3. **Lần gửi được nhận trước khi PDF xong tốn một lần thử của job** (T09, T10): nó lỗi `pdf_not_ready` và thử lại sau một phút; kho job không có cách hoãn mà không tính lần thử.
4. **Lưu giữ dòng job** (T10, T11): mỗi phút một dòng `deadline_scan` và mỗi năm phút một dòng `reminder_scan` sau kích hoạt; job không bao giờ bị xóa. Quyết định lưu giữ thuộc chủ sở hữu trước khi chạy production dài. Việc quét file mồ côi của kho file đã triển khai nhưng chưa được lên lịch (T08).
5. **Ghi chú đính kèm của T11:** nhắc hạn truyền một PDF rỗng; bản sửa capture của T14 bỏ `attachment.pdf` cho thư không đính kèm. Cần xác nhận bằng mục 9 của gate rằng capture của nhắc hạn có được bao phủ.
6. **Kỳ kết thúc trước khi tài khoản tồn tại** vẫn được nộp rỗng khi qua hạn (T10); thời điểm kích hoạt là biện pháp bảo vệ.
7. **Các mục chuyển tiếp của T13:** khoảng trống danh sách revision được đóng bằng `GET /api/revisions` (T13B, T13C); dòng console 404 chữ ký đã đóng (T13C); harness thiếu `MAIL_FROM` đã đóng (T14). Còn mở: Lịch sử vẫn hiện tên thao tác thô như `day_entry.update` cho thao tác lạ (ghi chú 3 của T13C); huy hiệu gửi chỉ đọc khi tải trang, không polling (T12).
8. **T13A/T13B:** `CommandContext.actor` và `AppDeps.delivery` là tùy chọn để các nơi gọi không thuộc quyền sở hữu vẫn chạy (sai lệch 2 của T13A); quy gán lịch sử dưới chia sẻ dùng khoảng hiệu lực của chia sẻ, nên sự kiện của người được chia sẻ nằm ngoài mọi khoảng thì không được quy gán (ghi chú 3 của T13B).
9. **Quy tắc sign-off ghi nhận như diễn giải:** sign-off của kỳ chưa kết thúc không bị từ chối (T05); thử lại revision có thiếu giờ chế độ chọn không phải phát lại (409 `stale_version`, không bao giờ có revision thứ hai, T06); xem lại muộn mà nội dung đổi bị từ chối bằng `content_changed` và cần sửa sau chốt (T06); origin tự động được lưu là `deadline` (T10).
10. **Đồng ý khi tải lên cần có cài đặt:** `POST /api/signatures?authorize_auto_image=true` bị từ chối (422 `submission_settings_required`, không lưu gì) khi chưa có cài đặt; UI chờ và hiện thứ tự các bước (T07B, T13).
11. **Màn admin:** bản nháp không được liệt kê, vì một dòng nháp sẽ lộ rằng người đó có mục (T13D). Spec e2e của admin chấp nhận một trong hai trạng thái gửi cuối khi fixture không có người gửi; T14 nay đặt `MAIL_FROM` cho fixture.
12. **Môi trường E2E:** một lần chạy đầy đủ của T13A lỗi hai spec mobile vì lỗi console `net::ERR_NO_BUFFER_SPACE` của Windows; WP3-E2E-RECHECK chạy lại sạch (97 đạt, 3 bỏ qua ở commit đó). Coi tái diễn là do môi trường, chạy lại một lần và ghi nhận.
13. **Mục WP2 còn mở:** **ADV-A-05** (đường append nội bộ bị lặp trong `otLeave.ts` và `ledger.ts`, Thông tin, backlog) và **các mục tùy chọn B4** (bản ghi chấp nhận trong [WP2_HANDOFF](WP2_HANDOFF.vi.md): `--space-6` không dùng, token cùng giá trị, chú thích truy vấn 767 px, giả định ±1 ngày của oracle, export `legacyPdtWallTime` và style tính toán chưa được ghim). R1, R2, R4 và A4-01 của WP2 đã đóng bởi T06, T00 và T05; A3-01 được danh sách cho phép của T13D tôn trọng vì nó không bao giờ đọc payload audit.
14. **Ghi chép công cụ:** bản ghi T14 đếm 46 check smoke trong khi log verify của chính nó chỉ có 40 dòng `PASS` (xem Lệnh).

## Hoãn lại

Magic link (link sâu yêu cầu đăng nhập là đủ, docs/05), adapter ntfy tùy chọn và SMS chưa triển khai (phạm vi tùy chọn của [WP3-PLAN](tasks/WP3-PLAN.md), docs/01, docs/05, D-10). Bằng chứng quyền E-7 vẫn là tham chiếu dạng văn bản. Container Docker, backup/restore và gói pilot thuộc WP4 và WP5.

## Thay đổi quản trị: GOV-WP3P

Các câu phạm vi và gate bắt buộc trong `handoff/prompts/WP3_IMPLEMENT.md` và `WP3_REVIEW.md` (cùng `.vi.md`) được mở rộng để khớp docs/09: chia sẻ do chủ sở hữu cấp với công tắc theo mục, ranh giới tình trạng cho admin, AC-16, dòng ghi chú tự động và các tùy chọn ảnh, không có chỉ báo tự động trên các lần nộp gửi đi và tự nộp kỳ rỗng. Được freeze là `da6d0cd` (GOV-WP3P-FREEZE); GOV-WP3P-AUDIT độc lập trả PASS trên commit đó, không có lỗi được chứng minh và các rủi ro tùy chọn R1–R5 ([GOV_WP3P_REVIEW](GOV_WP3P_REVIEW.vi.md)): R1 (quy tắc 4 của AGENTS có thể ghi "hoặc một mục chia sẻ do chủ sở hữu cấp"), R2 (docs/09 không nêu F-2, F-4 và cách hiển thị G-Q2, mà gate WP3 vẫn phải kiểm), R3 (một cụm tiếng Việt có thể bị đọc là tình trạng của chính admin). Chúng ở lại trong backlog quản trị.

## Hành động tiếp theo

Giao WP3-T15-FREEZE (commit và push qua `timesheet-committer` sau các kiểm tra), rồi WP3-GATE trên commit đó, rồi hai audit độc lập mới. Không bắt đầu WP4, và không đặt `PRODUCTION_SENDING_ENABLED`, cho đến khi gate và cả hai audit đạt và chủ sở hữu đã cho phép gói pilot.

## Bản ghi chấp nhận (WP3-ACCEPT)

(Để trống. Bước chấp nhận ghi commit freeze, digest, kết luận gate và audit tại đây.)

## Vòng sửa 1 — WP3-FIXB (phát hiện vùng B)

Tác vụ [WP3-FIXB](tasks/WP3-FIXB.md) lần 1 trên baseline `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056`, cho [WP3_REVIEW_B](WP3_REVIEW_B.md). Chưa được chấp nhận độc lập cho đến khi audit lại vùng B bằng reviewer mới. Bằng chứng: `evidence/WP3-FIXB/` (đã che, LF).

| Phát hiện | Xử lý | Cách sửa | Test hồi quy (đỏ trước, xanh sau) |
|---|---|---|---|
| WP3-B-01 (Trung bình; docs/05 "Deadline and recovery", AC-07, F-4) | Đã sửa | `src/server/services/automation.ts`: `users.created_at` là thời điểm sớm nhất mà tự động hóa với tới được với tài khoản đó. `assessPeriod` bỏ qua kỳ có `due_at` trước đó (`before_account`) và `listCandidates` bắt đầu từ mốc muộn hơn giữa thời điểm kích hoạt và lúc tạo tài khoản. Hạn vào hoặc sau lúc tạo (kể cả kỳ chứa lúc tạo) vẫn tự nộp đúng hạn (F-1). Giới hạn cũng áp cho cấu hình đã lưu, kể cả lựa chọn rõ ràng "áp dụng cho bản nháp quá hạn" (mốc hiệu lực được lưu là một hằng số rất sớm). Mặc định auto-submit không đổi. | `tests/integration/deadline.test.ts`, nhóm "account creation bound": không nộp các kỳ đã quá hạn lúc tạo (chưa lưu cấu hình), hạn đầu tiên sau lúc tạo tự nộp với nhãn mặc định, kỳ chứa lúc tạo tự nộp, cấu hình đã lưu và lựa chọn quá hạn không bao giờ lùi trước lúc tạo. Probe p2 nay 95 PASS. |
| WP3-B-02 (Thấp; bảng lỗi docs/05, AC-08) | Đã sửa | `src/server/jobs/runner.ts`: mọi lượt `runJobsOnce` có handler gửi đều gọi `recoverInterruptedSends` trước lần claim đầu, nên attempt của lần gửi mà runner đã chết là `uncertain` (kèm lời nhắc quyết định của chủ sở hữu) trước khi bước dọn claim đưa job của lần thử cuối sang intervention. Không bao giờ tự gửi lại; một quyết định rõ ràng gửi lại đúng một lần; không còn ngõ cụt 409 `delivery_in_progress`. | `tests/integration/delivery.test.ts` "a process lost during the LAST permitted attempt…" (bốn lần lỗi tạm, crash sau `sending` ở lần 5, một lượt sau khi lease hết hạn, quyết định của chủ sở hữu gửi lại đúng một lần). `delivery-crash.test.ts`: tóm tắt lượt của runner khởi động lại đổi từ claimed 1/intervention 1 sang claimed 0 (recovery chạy trước claim); các khẳng định về kết quả giữ nguyên. Probe p4 nay 16 PASS. |
| WP3-B-03 (Thấp; docs/04 Screens, F-Q2) | Đã sửa | `otModel.ts` `operationText` đặt tên cho mọi mã thao tác server ghi (WP2 và WP3, ví dụ `timesheet.auto_finalize` = "Submitted automatically") và dự phòng bằng nhãn trung tính "Other change"; `sharingModel.ts` `historyActorBadge` gắn nhãn "automatic" cho sự kiện hệ thống không có actor thay vì "by someone else" (thêm `isSystemOperation`); `HistoryScreen.tsx` gắn `data-history-actor="system"`. Quy gán cho người được chia sẻ không đổi. | `tests/client/otModel.test.ts`, `tests/client/sharingModel.test.ts`. |

Mặc định auto-submit (rủi ro R3 của audit A): docs/04 (bảng cài đặt) ghi "Enabled preference after sender setup; real sending remains disabled until activation", docs/10 D-09 ghi "enabled after setup" và docs/05 ghi "Unsigned draft + enabled switch". Không tài liệu nào nói tài khoản chưa từng lưu cấu hình thì mặc định ra sao; triển khai coi là bật, và bản sửa này không đổi điều đó.

Việc tài liệu theo sau (chưa sửa, ngoài đường dẫn được giao): docs/05 "Deadline and recovery" có thể bổ sung rằng với user chưa lưu cấu hình, thời điểm tạo tài khoản là mốc bắt đầu tự động hóa.

Lệnh và kết quả: `evidence/WP3-FIXB/00-commands.txt`. Sau lần sửa cuối: `npm run test:e2e` exit 0 (127 đạt, 5 bỏ qua), `npm run verify` exit 0 (60 file / 1391 test, SMOKE PASSED với 40 dòng `PASS`), `npm run digest` exit 0: `d9fa55bda1c637b1e58f2b5de005941b3767d8ca6d676e8b4e89fce2c6004582` (717 file, loại `handoff/`).

Còn lại: một cạnh tồn dư của B-02 (lease hết hạn giữa recovery đầu lượt và bước dọn claim của cùng lượt sẽ được xử lý ở đầu lượt kế, trong vòng một chu kỳ runner, và không bao giờ bị gửi lại); ba mục chuyển tiếp vùng B vẫn là backlog. Hành động tiếp theo: freeze, gate, rồi audit lại vùng B bằng reviewer mới tại digest mới.

## Vòng sửa 1 — WP3-FIXC (phát hiện vùng C)

Tác vụ [WP3-FIXC](tasks/WP3-FIXC.md) lần 1 trên baseline `a1cd566e59253d19f53cfd5b3a81fd27a7e9a056` cộng các thay đổi WP3-FIXB chưa commit (giữ nguyên), cho [WP3_REVIEW_C](WP3_REVIEW_C.md). Chưa được chấp nhận độc lập cho đến khi audit lại vùng C bằng reviewer mới. Bằng chứng: `evidence/WP3-FIXC/` (đã che, LF).

| Phát hiện | Xử lý | Cách sửa | Test hồi quy (đỏ trước, xanh sau) |
|---|---|---|---|
| WP3-C-01 (Trung bình; WP3-REQ C/E/G, FR-17, AC-16) | Đã sửa (làm gợi ý đã lên kế hoạch, theo quyết định của coordinator ngày 2026-10-05) | Mới `src/server/services/sharedActs.ts` `granteeChangesForReview`: từ audit, các ngày của kỳ đang review mà sự kiện `day_entry.*`/`work_session.*` cuối cùng được ghi qua một grant, gom theo tên hiển thị của người được chia sẻ, kể từ lần finalize của chính chủ sở hữu gần nhất cho kỳ đó (`timesheet.signoff`, `timesheet.correction`, `timesheet.late_review`; nộp tự động không phải của chủ sở hữu), nếu chưa có thì từ đầu kỳ theo múi giờ báo cáo. Thay đổi muộn hơn của chủ sở hữu hoặc của người được chia sẻ khác sẽ lấy lại ngày đó. `routes/submission.ts` trả về dưới tên `grantee_changes` cạnh payload, không bao giờ nằm trong payload, và chỉ khi actor là subject; route review không thuộc allowlist chia sẻ nên người được chia sẻ, view chia sẻ và quản trị viên không bao giờ nhận được. `ReviewScreen.tsx` hiển thị "N day(s) last changed by <tên>" (`granteeChangesModel.ts`) phía trên bảng ngày, trước Sign off; `styles.css` thêm một quy tắc chỉ dùng token E-8; `api.ts` thêm kiểu. Payload, hash, revision đã lưu và PDF không đổi. | `tests/integration/review-grantee-changes.test.ts` (11): gợi ý cho sửa của người được chia sẻ (ngày và session), không có khi chỉ chủ sở hữu sửa, chủ sở hữu sửa sau thì xóa ngày đó, gom theo người được chia sẻ, bỏ qua kỳ khác, chỉ tính từ lần finalize trước, vẫn còn sau khi thu hồi, quản trị viên thu hồi không tính, phản hồi cho người được chia sẻ/view chia sẻ/quản trị viên không bao giờ có (route review chia sẻ trả 404), payload và revision đã lưu không chứa gợi ý và hash đã review bằng hash chuẩn của payload và được ký nguyên vẹn, đọc không ghi gì. `tests/client/granteeChangesModel.test.ts`; `tests/e2e/sharing.spec.ts` (gợi ý trên desktop và mobile, không có trên view chia sẻ, bị xóa khi chủ sở hữu sửa). Đỏ: 10/11 test fail trước đó. |
| WP3-C-02 (Thấp; quy gán AC-16, hợp đồng history) | Đã sửa | `history.ts` không còn quyết định quy gán theo cửa sổ thời gian của share. Một sự kiện chỉ tính là thực hiện qua `/api/shared` khi actor khác chủ sở hữu và thao tác thuộc loại mà route chia sẻ ghi (`SHARED_ACT_OPERATIONS` trong `sharedActs.ts`: tạo/sửa/xóa ngày và session cùng `share.pdf_download`); cùng điều kiện đó cấp cho gợi ý Review. Quản trị viên thu hồi qua route admin dù cũng có share, hành động cùng giây với một grant sau đó, `user.*` và người được chia sẻ rời share đều không bị quy gán. Cách diễn đạt: `historyActorBadge` ghi "Downloaded by <tên> (shared access)" cho tải PDF và giữ "Changed by" cho các chỉnh sửa. | `tests/integration/history.test.ts`: quản trị viên có share thu hồi qua route admin; hành động cùng giây trước một grant sau đó; người được chia sẻ rời share; cả năm route ghi của share đều được quy gán (chặn lệch); `tests/client/sharingModel.test.ts` (cách diễn đạt tải xuống). Test cũ chèn một dòng tổng hợp sau khi share kết thúc được thay bằng test rời share (không route nào ghi được dòng như vậy). Đỏ: 3/4 test integration và test cách diễn đạt fail trước đó. |
| WP3-C-03 (Thông tin) | Đã sửa | Chú thích `AppEnv` trong `src/server/types.ts` nay mô tả `requireShare` (user và actor = người được chia sẻ, subject = chủ sở hữu nêu trong đường dẫn). | Chỉ là chú thích. |

Không thêm trường nào và không có migration. Dòng audit không ghi đường dẫn request hay cờ, nên quyết định được thực hiện mà không dựa vào chúng: một sự kiện là "qua grant" khi actor khác chủ sở hữu và thao tác là loại chỉ route chia sẻ mới ghi. Điều này dựa trên hai sự thật: guard truy cập chỉ đặt `actor` khác `subject` dưới `/api/shared`, và các route khác ghi owner id của người khác dùng mã thao tác khác (`user.*`, `share.revoke`). Sai lệch để coordinator xem xét: nếu một route không chia sẻ trong tương lai ghi một trong các mã thao tác trong danh sách cho actor khác, nó sẽ bị quy gán sai; test chặn lệch chỉ bao các route chia sẻ. Một dấu ghi nhận (migration) là phương án vững chắc hơn nếu coordinator muốn.

Thay đổi hành vi cần lưu ý: việc người được chia sẻ rời share (`share.revoke` với `revoked_by_role: grantee`, thực hiện qua `/api/shares`, không phải `/api/shared`) không còn được nêu tên trong History của chủ sở hữu; nó hiện là "Share ended" bởi người khác, đúng như quyết định yêu cầu.

Lệnh và kết quả: `evidence/WP3-FIXC/00-commands.txt`. Sau lần sửa mã nguồn cuối: `npm run test:e2e` exit 0 (127 đạt, 5 bỏ qua), `npm run verify` exit 0 (62 file / 1407 test, SMOKE PASSED với 40 dòng `PASS`), `npm run digest` exit 0: `eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410` (721 file, loại `handoff/`). Ảnh chụp `sharing-review-hint-desktop-synthetic.png` và `sharing-review-hint-mobile-synthetic.png`.

Còn lại: gợi ý trên Review liệt kê cả ngày, không nêu thay đổi cụ thể (History có hiển thị thay đổi từng trường). Hành động tiếp theo: freeze, gate, rồi audit lại vùng C bằng reviewer mới tại digest mới.
