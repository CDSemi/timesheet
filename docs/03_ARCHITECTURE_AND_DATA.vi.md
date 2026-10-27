# Kiến trúc và hợp đồng dữ liệu

## Thành phần và lựa chọn

Một repo, một ứng dụng Node.js, một DB SQLite cục bộ. Hono phục vụ API và bản build React/Vite cùng origin. Module nền nhận job đã lưu; sau này có thể tách mà hiện tại chưa cần Redis. Dùng bộ tính thuần chung cho API, kết quả UI, báo cáo và sổ.

| Lựa chọn | Đánh giá |
|---|---|
| Hono + React/Vite | Đã chọn: API nhỏ/UI tĩnh rõ ràng, chung TypeScript; phải chủ động làm auth/job |
| Next.js | Phù hợp khi cần quy ước full-stack; công cụ riêng này không có nhu cầu SEO/render server công khai |
| ASP.NET Core/C# | Cũng phù hợp Docker và mô hình nghiệp vụ chặt; không có quy tắc nào loại nó |
| FastAPI/Python | Khả thi, nhưng thêm ngôn ngữ so với UI TypeScript |

Đây là đánh giá độ phù hợp dự án, không khẳng định C# hay Next.js không thể nhẹ. Dùng TypeScript strict, kiểm schema, migration có phiên bản và lockfile. Ghim Node LTS được hỗ trợ và SQLite binding còn duy trì ở WP1; Drizzle tùy chọn. PDF dùng pdf-lib với font Unicode nhúng, tránh cần dịch vụ trình duyệt cho mẫu cố định. Font nhúng gồm DejaVu Sans, Sans Bold, Serif Condensed Bold và Serif Italic từ gói `dejavu-fonts-ttf` đã cài, và Indie Flower 2.000 (SIL OFL 1.1) chỉ cho ô loại ngày: đây là file font duy nhất được commit, `assets/pdf-fonts/IndieFlower-Regular.ttf`, ghim bằng SHA-256, được chép vào image, không phục vụ qua HTTP và không dùng trong giao diện, với DejaVu Serif Italic là phương án thay theo từng ô khi gặp ký tự nó không có (ADR 0001, `docs/adr/0001-pdf-handwriting-font.md`). PDF là một trang US Letter vẽ theo hình học thuần `pdfLayout`; logo và wordmark C&D là đường viền vector dùng chung với client (`src/domain/brand.ts`).

## Bản ghi

| Nhóm | Hợp đồng |
|---|---|
| users/sessions | ID ổn định, tên/email, vai trò/trạng thái, hash mật khẩu an toàn, session server thu hồi được |
| calendars/versions/holidays | Múi giờ IANA, thứ làm, ngày/tên lễ/đóng cửa, phiên bản hiệu lực |
| work_policies | User, ngày hiệu lực, B/N/M, nghỉ, thiếu giờ; phiên bản được tham chiếu bất biến |
| pay_periods | Lịch, đầu/cuối, payroll, quy tắc hạn và UTC đã giải; duy nhất lịch/payroll |
| timesheets/day_entries | Duy nhất user+kỳ và user+work_date; loại ngày/phút nghỉ kèm `leave_kind` (vacation, sick hoặc ot; không có loại ngày nghỉ-bằng-OT), ghi chú, xác nhận, phiên bản chống sửa đè |
| work_sessions/breaks | Chủ sở hữu, UTC vào/ra, múi giờ nguồn, cách nhập, nghỉ đã xác nhận; ca cùng user không trùng |
| timesheet_revisions/signoffs | Payload/hash chuẩn bất biến; sign-off gắn người/thời gian/hash thật, vắng khi tự nộp chưa ký. Sign-off ghi tên hiển thị của tài khoản và, khi đã lưu, cả ảnh chữ ký; tham chiếu ảnh có thể rỗng (quyết định của chủ F-5 b, 2026-10-21; migration 0014) |
| revision_files | Một PDF cho mỗi revision và biến thể (`t<dòng giờ>o<dòng OT>`: `t1o1`, `t1o0`, `t0o1`, `t0o0`); mỗi biến thể là một góc nhìn tất định của cùng snapshot đã ký, render một lần, có hash và không bao giờ xóa; tối đa bốn cho mỗi revision (quyết định của chủ F-3 b, 2026-10-21; migration 0015) |
| revision_sends | Một bản ghi bất biến cho mỗi lần gửi một revision: số thứ tự, khóa request của chủ, nguồn (nhân viên hoặc deadline), người thực hiện, To/Cc, tiêu đề, nội dung text và HTML, hai công tắc dòng PDF và biến thể của chúng, lý do của chủ khi gửi thêm bản (2-500 ký tự, hoặc không có), send job; chỉ chủ sở hữu xem được như các nội dung email đã render khác. Mọi send job tạo trước khi tách đều có bản ghi được backfill (quyết định của chủ F-2 a, F-4, 2026-10-21; migration 0015) |
| ot_ledger | Delta phút nguyên có dấu, loại, sự kiện nguồn, link revision/sửa, người/lý do; khóa duy nhất |
| ot_leave_requests | Phút xin/duyệt/giữ/tiêu, ngày, bằng chứng, nguồn duyệt, đảo; chỉ tiêu qua thao tác record use rõ ràng, idempotent vào hoặc sau ngày nghỉ (cho phép một phần); WP2 không có job runner tiêu hay hết hạn giữ chỗ |
| jobs/delivery_attempts | Chủ/revision/kênh, hạn/thử lại, trạng thái, số lần, lease, ID đối chiếu/nhà cung cấp |
| attachments/audit_events | Key riêng khó đoán/hash/loại/kích thước; người, UTC, thao tác, trước/sau, lý do |
| timesheet_shares | Chủ, người được chia sẻ, các mục (timesheet không/xem/sửa, OT chỉ đọc, tải PDF đã chốt), người/lúc tạo, người/lúc thu hồi; mỗi cặp chủ–người nhận một quyền hiệu lực; đổi mục thì thu hồi và thay dòng; không chia sẻ tiếp |
| imports | SHA-256 nguồn, phiên bản ánh xạ, chủ, đợt preview/commit; khóa chống trùng |

Kỳ chung không chứa cờ signed/sent của một user. Tên/email/path không phải khóa danh tính. Admin quản tài khoản/cấu hình và thấy thông tin vận hành: tài khoản, lịch, quyền chia sẻ, vòng đời timesheet của từng người, nguồn và trạng thái xác nhận của revision, trạng thái PDF và gửi kèm địa chỉ người nhận, mã lỗi đã che, cờ setting và sức khỏe job/runner. Chi tiết timesheet vẫn riêng tư: ngày, phiên và nghỉ, phép, ghi chú, phép tính, quy tắc cá nhân, sổ và số dư OT, yêu cầu nghỉ và bằng chứng cho phép, file xuất bằng chứng, payload/snapshot review, PDF, ảnh chữ ký, template email, nội dung email đã dựng và payload audit của bản ghi cá nhân. Xem chúng cần quyền chia sẻ rõ ràng của chủ, kể cả với admin. Một ngoại lệ rõ ràng (quyết định của chủ F-2 (b), 2026-10-20, đảo lại việc gỡ bỏ ở WP2-A-01): bản xem trước nhập ngày lễ của admin hiện, theo từng ngày thay đổi, số chính xác các ngày của nhân viên trong timesheet chưa chốt theo nhãn mặc định, số nhãn tự chọn mà bản nhập giữ lại và số timesheet đã chốt, không kèm danh tính; trong nhóm nhỏ một con số như vậy có thể chỉ ra các ngày đã ghi của một đồng nghiệp cụ thể, nên mỗi lần xem trước ghi một sự kiện audit `calendar.holiday_preview` (người thực hiện, lịch, khoảng ngày, số ngày có số đếm; không có tên). Admin có thể sửa tên hiển thị và vai trò của user bất cứ lúc nào, nhưng chỉ đổi lịch của user khi user chưa có timesheet, ngày, phiên làm việc, dòng sổ cái hay yêu cầu nghỉ nào (nếu có thì trả 409 `calendar_in_use` và không ghi gì). Manager tương lai dùng gán nhân viên.

## Nguyên tử và snapshot

Bật foreign keys, WAL, busy timeout và transaction ngắn. Kiểm chủ sở hữu hoặc quyền chia sẻ còn hiệu lực đủ phạm vi, và phiên bản, ở mỗi thao tác; user của session là người thực hiện, chủ timesheet là đối tượng. Giữ/tiêu số dư nguyên tử. Nhận job bằng update nguyên tử và lease gia hạn. Không gọi mạng trong transaction ghi DB.

Chốt tạo revision bất biến, sign-off thật nếu có, sự kiện sổ và outbox nguyên tử. PDF/mạng chạy sau. Ký và gửi là hai hành động riêng (WP5-UX5-T01b): sign-off, bản sửa và late review chỉ xếp job PDF; một lần gửi tạo nguyên tử bản ghi bất biến của nó, send job của nó và, khi biến thể đó chưa được lưu, job PDF của nó. Các đường tự động (chốt tự động, và lần gửi tại deadline của một revision đã ký nhưng chưa gửi) cũng tạo bản ghi gửi với nguồn `deadline` theo cùng cách. Dùng file tạm rồi rename nguyên tử, hash đã lưu và phục hồi file mồ côi; không xóa file lưu trữ còn được tham chiếu.

Serialization chuẩn có thứ tự key/array ổn định, phút nguyên, ngày ISO và UTC. Snapshot phép tính, ID quy tắc/lịch, dữ liệu nhân viên/báo cáo, người nhận, tiêu đề/nội dung, phép dùng ảnh ký và phiên bản mẫu. Nội dung ảnh/file tham chiếu phải bất biến; sửa profile không đổi báo cáo cũ. Không snapshot credential.

## Nhập, số dư đầu và lưu giữ (quyết định của chủ 2026-10-05, là yêu cầu)

- Ai nhập (F-1): mỗi người chỉ preview và commit workbook của chính mình, nên người thực hiện là chủ. Admin không thể nhập, preview hay đọc bản nhập cho người khác; đợt nhập của user khác trả 404.
- Kỳ đã nhập (F-2): kỳ nhập (`imported_unverified`) không ghi sự kiện sổ, không thể ký hay nộp (409 `imported_period`) và là lịch sử chỉ đọc. Số dư đầu rõ ràng là nguồn OT mang sang duy nhất, nên không tính hai lần.
- Số dư đầu (F-3, sửa theo quyết định của chủ F-1 (i) và D-5 a ngày 2026-10-20): bằng 0 và không có dòng nào cho đến khi chủ đặt nó, và chỉ chủ đặt hoặc đổi nó, bất cứ lúc nào. Giá trị đầu tiên là phút có dấu, khác không, kèm ngày hiệu lực (mặc định là ngày đặt) và một lý do ngắn; tham chiếu bằng chứng là tùy chọn, và nếu để trống thì lưu trên dòng số dư đầu bằng chữ cố định "not provided" (schema không đổi, không cần migration). Mỗi user một dòng số dư đầu, lưu thành một loại dòng sổ; mọi thay đổi sau là một lần sửa có lý do (một dòng sổ, bằng chứng tùy chọn, để trống thì lưu null), có thể đưa giá trị về 0 bằng cách ghi âm giá trị hiện tại; sửa về đúng giá trị hiện tại thì không ghi gì.
- Tài khoản chưa từng cấu hình (F-3): tài khoản chưa từng lưu setting nộp hiện cho admin cờ "chưa thiết lập" trong danh sách tài khoản của quản trị viên, và nhân viên không nhận cảnh báo quá hạn. Khớp với quy tắc H-Q1 (a) ở tài liệu 05 (không tự động trước khi setup).
- Giữ dòng job (F-4): chỉ được xóa dòng job `deadline_scan` và `reminder_scan` đã thành công và cũ hơn 30 ngày, qua ngoại lệ gắn với migration cho trigger cấm xóa job. Không bao giờ xóa dòng gửi, PDF hay delivery.

## API và ranh giới hosting

Nhóm route dưới /api cho auth, settings cá nhân, lịch, kỳ/sửa ngày, OT/phép, review/chốt/trạng thái, sửa/gửi lại, file riêng, chia sẻ (cấp quyền và truy cập ủy quyền dưới path chủ rõ ràng), user (quản trị), nhập workbook của chính chủ và health. Tách lỗi dữ liệu, auth, chủ sở hữu, phiên bản cũ và gửi. Review/chốt cần expected_version và hash đã xem; xung đột phải xem lại. Người ký của một sign-off, một bản sửa và một late review là người đang đăng nhập (quyết định của chủ F-5 b, 2026-10-21): server ghi tên hiển thị của user trong session và không bao giờ ghi tên từ request. Khóa `signer_name` mà caller cũ vẫn gửi được chấp nhận và bỏ qua (nó không đổi tên đã lưu, cũng không đổi việc một lần gửi lại có phải là replay giống hệt hay không). Ảnh chữ ký đã lưu là tùy chọn: có ảnh thì sign-off ghi ảnh đó, và payload review có `signature` khác với ảnh đang lưu là 409 `stale_review`; không có ảnh thì sign-off không ghi ảnh và PDF chỉ in tên. Route nhập workbook là `/api/imports` và số dư mở đầu tường minh là `/api/ot/opening-balance`; cả hai chỉ dành cho chủ sở hữu và không thuộc bất kỳ chia sẻ nào.

Gửi (WP5-UX5-T01b; quyết định của chủ F-2 a, F-3 b và F-4, 2026-10-21). Tất cả chỉ dành cho chủ sở hữu; không route nào thuộc allowlist chia sẻ.
- `GET /api/revisions/:id/send-draft` không ghi gì. Nó trả về các giá trị mặc định của thẻ Gửi: To và Cc từ Settings hiện tại, tiêu đề và nội dung render từ mẫu Settings hiện tại cho revision này, hai công tắc dòng PDF từ Settings ("Dòng giờ trên PDF" `show_time_on_pdf`, "Dòng OT trên PDF" `show_ot_on_pdf`), người gửi đã cấu hình, `copy_sent_before` (bản gần nhất được tính: ngày, người nhận, trạng thái), `reason_required` và lần gửi trước.
- `POST /api/revisions/:id/send` nhận `{ request_key, to, cc, subject, body_text, time_rows, ot_rows, reason? }`. Cùng khóa request với cùng nội dung thì replay (200); với nội dung khác là 409 `request_key_reused`. Chỉ revision hiện tại của kỳ được gửi (409 `revision_superseded`), không bao giờ là kỳ nhập. Lần gửi bị từ chối khi một attempt của revision đang mở (409 `delivery_in_progress`), không chắc chắn mà chưa có quyết định (409 `delivery_uncertain`), hoặc khi một send job của bất kỳ revision nào của kỳ đang chờ (409 `delivery_in_progress`). Sau đó quy tắc lý do chạy trong cùng transaction (tài liệu 05). Một transaction ghi bản ghi gửi, send job của nó (business key `send:<send id>`, chỉ ID định tuyến), job PDF của biến thể khi file đó chưa được lưu, và sự kiện audit `revision.send` (ID, số thứ tự, công tắc, số người nhận, và lý do trong trường lý do của sự kiện; không địa chỉ, không nội dung).
- `POST /api/revisions/:id/resend` là cùng lần gửi đó với giá trị của lần gửi trước. Quyết định "gửi lại" cho một attempt không chắc chắn cũng vậy, và nó cần lý do.
- `GET /api/revisions/:id/pdf?time=0|1&ot=0|1[&disposition=inline]` trả về biến thể đã lưu (mặc định: biến thể lúc sign-off, có dòng giờ và dòng OT theo snapshot). Nó render theo yêu cầu một biến thể chưa lưu, qua đường của job PDF (không gọi mạng, ghi file nguyên tử, rồi một transaction ngắn). Trên mount chia sẻ, query bị bỏ qua và không render gì: người được chia sẻ nhận biến thể của lần gửi gần nhất, hoặc biến thể lúc sign-off, khi nó đã được lưu (nếu chưa thì 409 `pdf_not_ready`).
- `GET /api/timesheets/:payrollDate/pdf-preview?time&ot` render một bản xem trước chưa ký của review hiện tại. Nó không ghi gì, `no-store`, hiển thị inline, và in "Preview, not signed" không kèm ảnh.

Người đang đăng nhập tự đổi mật khẩu bằng `POST /api/auth/password` (quyết định của chủ D-9 b, 2026-10-20). Route chỉ dành cho user của session và không phải route chia sẻ. Body gồm mật khẩu hiện tại và mật khẩu mới; mật khẩu hiện tại sai trả 403 `current_password_incorrect` (session vẫn hợp lệ) và được đếm theo từng user và địa chỉ client trong bộ giới hạn đăng nhập, dưới khóa riêng `password:<user id>` (5 lần sai mật khẩu hiện tại trong 15 phút, sau đó trả 429 kèm `Retry-After`). Khóa đăng nhập mang tiền tố `login:`, nên không dữ liệu đăng nhập nào chạm được vào bucket đó để khóa user khỏi việc đổi mật khẩu (F-UX4B-1); bucket theo địa chỉ client (30 lần sai trong 15 phút) vẫn dùng chung với đăng nhập. Mật khẩu mới ngoài 12–256 ký tự trả 422 `weak_password`, và trùng mật khẩu hiện tại trả 422 `password_unchanged`. Trong một transaction: thay hash, thu hồi mọi session khác của user (session này vẫn đăng nhập) và ghi một sự kiện audit `auth.password_change` không chứa mật khẩu hay hash. Mật khẩu tạm của admin cho tài khoản khác là đường riêng và không đổi.

Chốt chặn đồng hồ qua chia sẻ (F-Q5, mở rộng bởi quyết định R2 a của chủ sở hữu, 2026-10-21): qua một chia sẻ, người được cấp quyền không bao giờ bắt đầu hay kết thúc ca đang chạy của chủ sở hữu bằng bất kỳ đường nào. `createSession` và `updateSession` từ chối việc đổi trạng thái đang chạy, và `DELETE /api/shared/:ownerId/sessions/:id` trên ca chưa có giờ kết thúc cũng bị từ chối, tất cả bằng 409 `shared_clock_action` trước khi ghi bất cứ thứ gì (kiểm tra chạy trong giao dịch ghi, trước kiểm tra phiên bản, nên không ghi gì và không có sự kiện kiểm toán). Xóa ca đã kết thúc qua chia sẻ và mọi hành động của chủ sở hữu không đổi, danh mục route không đổi.

Xuất và nhập setting không thêm bản ghi hay route nào. File setting chỉ được tạo và đọc trong trình duyệt và áp dụng qua các route chính sách, setting nộp và lịch hiện có; file không đi qua server ra khỏi thiết bị của người dùng.

Dùng cookie session an toàn, CSRF/origin, rate limit login/token, kiểm loại/kích thước upload và tải file có quyền. Không phục vụ PDF/chữ ký từ path public. Health không có dữ liệu cá nhân.

Một instance với lưu trữ cục bộ host. Thư mục NAS mount vào container chạy ngay NAS là cục bộ; SMB/NFS từ xa không là đích SQLite WAL. PostgreSQL là nhu cầu đo được sau này khi nhiều instance/tranh ghi. Có thể thêm OIDC; không tin header danh tính proxy do client tùy ý gửi.

Bản dịch của [03_ARCHITECTURE_AND_DATA.md](03_ARCHITECTURE_AND_DATA.md); tiếng Anh là nguồn chuẩn.
