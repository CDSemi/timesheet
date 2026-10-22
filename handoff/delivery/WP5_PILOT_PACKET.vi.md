# Gói pilot WP5

Đây là gói cụ thể để chủ sở hữu xem xét trước khi cho phép gửi thật. Bản tiếng Anh là bản chuẩn; [WP5_PILOT_PACKET.md](WP5_PILOT_PACKET.md) là bản gốc, tệp này là bản dịch. Các quy tắc áp dụng nằm ở [06 Nghiệm thu](../../docs/06_TEST_AND_ACCEPTANCE.vi.md), [07 Vận hành](../../docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md), [05 Nộp bài](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md), [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) (mục 13 đến 16) và [ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md).

**Trạng thái: phần mềm sẵn sàng, pilot đang chờ. NAS CHƯA ĐƯỢC XÁC MINH (NOT VERIFIED). Chưa gửi email thật nào, chưa triển khai gì và chưa ai yêu cầu hay cấp phép.**

## 0. Cách dùng gói này

- **Bản được theo dõi trong git chỉ chứa placeholder và mẫu tổng hợp** (repository là công khai; quy tắc 4 của AGENTS). Sao chép tệp này ra một nơi riêng ngoài git và ghi giá trị thật ở đó. Tên máy chủ thật, địa chỉ, thông tin đăng nhập SMTP, chữ ký và dữ liệu cá nhân không bao giờ vào bản trong git, chat, ảnh chụp màn hình hay log. Quyết định của chủ sở hữu D-11 (a): gói được theo dõi giữ placeholder, giá trị thật nằm ở bản riêng của chủ sở hữu ngoài git.
- Placeholder viết dạng `<như-này>`. Các placeholder dùng ở đây: `<nas-host>`, `<sender-address>`, `<owner-address>`, `<payroll-address>`, `<proxy-ip>`, `<release-commit>`, `<source-digest>`, `<image-id>`, `<backup-name>`, `<manifest-sha256>`, `<activation-instant-utc>` và các placeholder của runbook (`<compose>`, `<cli>`, `<env-file>`, `<data-dir>`, `<backup-dir>`, `<restore-dir>`).
- Mọi ô `[ ]` dưới đây cố ý để trống. Chỉ chủ sở hữu tick ô, và chỉ cho việc chính chủ sở hữu đã làm hoặc đã quyết định.
- Bốn sự kiện luôn được tách riêng: phần mềm sẵn sàng, quyền của chủ sở hữu, nhà cung cấp chấp nhận và người nhận đã nhận ([06 Nghiệm thu](../../docs/06_TEST_AND_ACCEPTANCE.vi.md)).

### Định danh bản phát hành của gói này

| Trường | Giá trị |
|---|---|
| Commit phát hành (WP5-UX3-FIX6-FREEZE, đã push; bản WP5 được nghiệm thu lại sau vòng đổi giao diện 3) | `8e557100d16b6b6eb86a48e00276835761aabfdf` |
| Source digest (`npm run digest`, không tính `handoff/`; digest ghi nhận của WP5-UX3-REGATE5) | `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6`, 833 tệp; tính lại trước và sau tác vụ này, không đổi |
| Gate và audit cuối | WP5-UX3-REGATE5 PASS, NAS NOT VERIFIED ([tác vụ](tasks/WP5-UX3-REGATE5.md)): các bản build giống hệt từng byte với WP5-UX3-REGATE3 và REGATE4, nên các mục của chúng được mang sang; e2e đầy đủ đồng hồ thật 651 passed / 67 skipped / 0 failed; chạy đầy đủ đồng hồ giả lập ở một ngày trong cửa sổ và ở ngày đổi giờ DST, 0 failed; drill `--wp3` 208 PASS / 0 FAIL (REGATE3); 2.141 unit test; axe: chỉ còn mục kích thước mục tiêu của menu tài khoản đã được biện minh. WP5-UX3-AUDIT-INT PASS ([báo cáo](WP5_UX3_REVIEW_INT.vi.md)); nó thay thế WP5-UX2-AUDIT2, bản nghiệm thu ở `a643794` / `229df806…` (lịch sử: [báo cáo](WP5_UX2_REVIEW2.vi.md)) |
| Phiên bản trong `package.json` | `0.1.0` (không định danh bản phát hành; commit và digest mới định danh) |
| Image ID tham chiếu (bản build drill của WP5-UX3-REGATE3, máy trạm phát triển, có byte giống hệt bản phát hành, `linux/amd64`, 110.042.848 byte; image đã được xóa) | `sha256:bcb0692cc99fe5c0b198dc26cff623045903f851f3d7069105b1df09bf9e493b` |
| Image ID build trên NAS | `<image-id>` (chủ sở hữu ghi lại lúc build, [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) mục 1 bước 8; build lại cùng mã nguồn cho ID khác) |
| Tuyên bố phát hành | chưa tuyên bố, không có tag. Quyết định của chủ sở hữu D-14 (b): bản phát hành đầu tiên được tuyên bố sau thời gian pilot, không phải lúc cho phép pilot; cho đến lúc đó các commit vẫn ở `main` theo quy tắc ở [08 Quy trình AI](../../docs/08_AI_WORKFLOW_AND_BUDGET.vi.md) và `git.release_declared` vẫn là false |

Image ID tham chiếu là image drill của gate trên máy trạm phát triển. Nó không phải image trên NAS, và image đó đã được xóa sau gate. Nếu bất kỳ tệp nào ngoài `handoff/` thay đổi thì commit và digest đổi, và định danh này phải được làm mới.

**Định danh bản phát hành: được làm mới sau gate vòng 5.** Commit, source digest, bản ghi gate và image ID tham chiếu ở trên là của vòng 3 và **không phải** bản phát hành vòng 5. Gate cuối gói của vòng 5 tạo các giá trị mới và ACCEPT-DOCS ghi chúng vào đây, vào mục 6 và mục 7; đến lúc đó đừng dùng chúng cho pilot. Các mẫu ở mục 3 là ngoại lệ: chúng được tạo lại từ commit đóng băng vòng 5 `69d6340`.

**Vòng đổi giao diện (WP5-UX).** Sau khi gói được viết lần đầu ở `014bd47`, chủ sở hữu yêu cầu ngày 2026-10-08 một giao diện đẹp hơn, dễ dùng hơn, với trang Timesheet bố trí như workbook Excel mẫu. Chủ sở hữu trả lời E-1..E-7 theo khuyến nghị, và WP5-UX-Q1 cùng WP5-UX-Q2 bằng "a". Vòng này chỉ đổi giao diện client và các test (cùng một bộ định dạng giờ:phút chỉ để hiển thị); không đổi server và không đổi quy tắc nghiệp vụ. Nó đã được gate lại (WP5-UX-REGATE8) và audit cuối (WP5-UX-AUDIT-AB9, [báo cáo](WP5_UX_REVIEW_AB9.vi.md)); vì vậy định danh ở trên khác định danh phát hành đầu tiên `014bd47` / `150420e7…`. Hồ sơ nằm ở [bàn giao WP5](WP5_HANDOFF.vi.md), mục "Nghiệm thu lại sau vòng đổi giao diện (WP5-UX)".

**Vòng đổi giao diện 2 (WP5-UX2).** Ngày 2026-10-14 chủ sở hữu yêu cầu thêm các thay đổi trên trang Timesheet (tô sáng cả cột ngày đang mở, kiểu chọn nhẹ hơn trong bộ chọn nhãn, nút chuyển Light/Dark ở thanh điều hướng chính, hover rõ hơn trên các nút bật/tắt, nút Today và Current period, công tắc trượt cho "Show details"), rồi logo C&D với wordmark hai dòng, điều khiển check in/out trên thanh trên cùng ở điện thoại và cách gọi "Check in/out". WP5-UX2-Q1 được trả lời bằng cả hai nút (Today mở kỳ chứa hôm nay; Current period quay về kỳ mà trang mở ra) và WP5-UX2-Q2 bằng "a" (đường viền vector của wordmark, sắc nhạt hơn ở giao diện tối). Vòng này đổi giao diện client, cách gọi và các test, cùng cách diễn đạt của ba thông báo lỗi server (và một chú thích); không đổi quy tắc nghiệp vụ, phép tính, schema, API hay PDF. Nó đã được gate lại (WP5-UX2-REGATE2) và audit cuối (WP5-UX2-AUDIT2, [báo cáo](WP5_UX2_REVIEW2.vi.md)); vì vậy định danh ở trên khác `90b98ef` / `57e2974c…`. Hồ sơ nằm ở [bàn giao WP5](WP5_HANDOFF.vi.md), mục "Nghiệm thu lại sau vòng đổi giao diện 2 (WP5-UX2)".

**Vòng đổi giao diện 3 (WP5-UX3).** Ngày 2026-10-15 chủ sở hữu yêu cầu kiểu hiện đại thay cho kiểu công nghiệp, menu danh tính trên thanh trên cùng (avatar, tên phía trên email; Light/Dark, Profile, Settings, Sign out), phần đầu trang và thanh kỳ được sắp lại, các cột được chọn nổi lên (có đổ bóng), và Day editor với hộp thoại phiên riêng cùng vùng giờ nghỉ đơn giản hơn (một ô "Confirm no breaks taken", mỗi giờ nghỉ một dòng, Suggest breaks và Add break). Chủ sở hữu đã trả lời G-1..G-5 (G-1 b có chỉnh sửa, G-2 a "Category", G-3 a điền sẵn, G-4 biến thể của chủ sở hữu, G-5 b nhãn "in progress"), Q6 (b), các chip 24 giờ và Q7 (a, phần đầu AI Instruction của chủ sở hữu trong AGENTS.md). Vòng này chỉ đổi giao diện client và tài liệu; không đổi server, quy tắc nghiệp vụ, phép tính, schema, API, PDF hay email (`dist/server` và `dist/domain` giống hệt từng byte với `a643794`). Nó đã được gate lại (WP5-UX3-REGATE5) và audit cuối (WP5-UX3-AUDIT-INT, [báo cáo](WP5_UX3_REVIEW_INT.vi.md)); vì vậy định danh ở trên khác `a643794` / `229df806…`. Hồ sơ nằm ở [bàn giao WP5](WP5_HANDOFF.vi.md), mục "Nghiệm thu lại sau vòng đổi giao diện 3 (WP5-UX3)".

**Vòng đổi giao diện 4 (WP5-UX4), đang thực hiện.** Ngày 2026-10-20 chủ sở hữu yêu cầu vòng đổi giao diện thứ tư và trả lời các quyết định pilot D-1..D-15 (mục 8). Vòng này đổi giao diện client và, với các câu trả lời D-5 a, D-6 a, D-9 b, D-10 (là F-1 i) và D-15 b, đổi cả server (route đổi mật khẩu, quy tắc số dư đầu kỳ, giới hạn bản xem trước import, số đếm theo ngày trong xem trước ngày nghỉ kèm sự kiện audit) cùng một chốt chặn chấm công qua chia sẻ. Vòng này vẫn cần gate và các audit độc lập mới, nên định danh phát hành ở trên **chưa** được làm mới; nó được làm mới khi nghiệm thu lại. Hồ sơ sẽ nằm ở [bàn giao WP5](WP5_HANDOFF.vi.md).

**Vòng đổi giao diện 5 (WP5-UX5), đang thực hiện.** Ngày 2026-10-21 chủ sở hữu yêu cầu vòng thứ năm và trả lời F-1..F-10 (mục 8). Vòng này đổi giao diện client, PDF và server: ký xác nhận và gửi nay là hai hành động riêng, mỗi lần gửi có phong bì và lựa chọn dòng PDF riêng, bản gửi thêm cần một lý do, ảnh chữ ký là tùy chọn, PDF là một trang thiết kế lại với font viết tay Indie Flower, dạng gọn của bảng chuyển xuống dưới 480px và schema là 15. Vòng 4 được gộp vào cùng gate cuối gói (quyết định của chủ Q0 a). Vòng này vẫn cần gate đó và các audit độc lập mới, nên định danh phát hành ở trên **chưa** được làm mới. Các slice (UX5-T01a đến T05B) đã đóng băng; hồ sơ sẽ nằm ở [bàn giao WP5](WP5_HANDOFF.vi.md).

Bằng chứng của gói nằm ở `handoff/delivery/evidence/WP5-UX5-T06/` cho các mẫu ở mục 3 và kiểm tra sẵn sàng ở mục 1, và ở `handoff/delivery/evidence/WP5-PILOT/` cho các bản ghi trước đó (mục lục ở mục 11).

## 1. URL

| Mục | Placeholder | Cấu hình ở đâu |
|---|---|---|
| Host HTTPS công khai | `https://<nas-host>/` | DNS, chứng chỉ và reverse proxy của Synology (do chủ sở hữu kiểm soát) |
| `PUBLIC_BASE_URL` | `https://<nas-host>` (chỉ https trong production, không path, query hay fragment) | `<env-file>` |
| `APP_ORIGINS` | `https://<nas-host>` (origin trình duyệt chính xác, ngăn cách bằng dấu phẩy) | `<env-file>` |
| `TRUSTED_PROXY_ADDRESSES` | `<proxy-ip>` (đúng địa chỉ mà ứng dụng thấy là peer kết nối của proxy; không CIDR, không tên host) | `<env-file>` |

Các bước kiểm tra. Mỗi bước là **[owner NAS step, unverified]**; tick và ghi ngày trên NAS.

- [ ] `https://<nas-host>/api/ready` trả 200 với `{"status":"ready","schema":{"expected":N,"actual":N},"data_dir_writable":true}` và không gì khác. `https://<nas-host>/api/health` trả 200 `{"status":"ok"}`. Quan sát trên máy phát triển (server đã build của commit đóng băng vòng 5, chế độ capture, cổng loopback, `evidence/WP5-UX5-T06/06-ready-check.txt`): `/api/health` 200 `{"status":"ok"}`, `/api/ready` 200 với schema 15 expected và actual, `data_dir_writable` true.
- [ ] Đăng nhập: quản trị viên đăng nhập tại `https://<nas-host>/` (màn hình Setup chỉ hiện một lần, runbook mục 3). Hai client sau proxy không bị chặn chung (điều này cho thấy `TRUSTED_PROXY_ADDRESSES` đúng).
- [ ] Deep link: mở `https://<nas-host>/#/review/<payroll-date>` (dạng của mọi liên kết nhắc nhở, như các mẫu ở mục 3); nó yêu cầu đăng nhập rồi mở màn hình review. Một bản nộp đã capture không chứa liên kết nào, và liên kết của lời nhắc đầu tiên được kiểm tra sau khi đặt thời điểm kích hoạt (runbook mục 13 bước 7). Liên kết yêu cầu đăng nhập là đủ; nó không bao giờ tự ký hay tự nộp.
- [ ] Một yêu cầu thay đổi trạng thái từ origin đó được chấp nhận (origin không có trong `APP_ORIGINS` bị từ chối với 403 `origin_rejected`).

## 2. Người gửi và người nhận

### Các trường và nơi đặt từng giá trị

| Giá trị | Tên | Đặt ở | Ghi chú |
|---|---|---|---|
| Địa chỉ người gửi | `MAIL_FROM` (một địa chỉ) | `<env-file>` | Nhà cung cấp phải chấp nhận người gửi này. Placeholder `<sender-address>`. |
| Chế độ | `OUTBOUND_MODE` = `capture` (mặc định) hoặc `smtp` | `<env-file>` | Giữ `capture` cho đến khi chủ sở hữu cho phép gửi thật. |
| Cờ gửi thật | `PRODUCTION_SENDING_ENABLED` | `<env-file>` | Đúng giá trị `true`, chỉ khi kích hoạt (runbook mục 13 bước 4). Để trống cho đến lúc đó. |
| Máy chủ SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURITY` (`starttls` hoặc `tls`) | `<env-file>` | Chỉ đọc khi `OUTBOUND_MODE=smtp`. |
| Thông tin đăng nhập SMTP | `SMTP_USER` và `SMTP_PASSWORD` cùng nhau, hoặc không có | chỉ `<env-file>` | Bí mật duy nhất ứng dụng có thể giữ. Không bao giờ vào git, chat, ảnh chụp hay log. |
| Người nhận (To, Cc) | `to`, `cc` của cài đặt nộp bài | Settings của từng user (không phải env) | Mặc định của thẻ Send; sửa cho từng lần gửi. Theo từng user. `<payroll-address>` và `<owner-address>` bên dưới. |
| Template tiêu đề và nội dung | `subject_template`, `body_template` | Settings của từng user | Mặc định của thẻ Send (dựng với giá trị của revision); Subject và nội dung thư được sửa cho từng lần gửi. Biến: `{EmployeeName}`, `{PeriodStart}`, `{PeriodEnd}`, `{PayrollDate}`, `{SignOffStatus}`, `{SubmissionId}`, `{Revision}`. Biến lạ bị từ chối. |
| Dòng PDF | "Time rows on the PDF" và "OT rows on the PDF" | Settings của từng user | Mặc định của hai công tắc trên thẻ Send; chọn cho từng lần gửi (mục 4). |

Ký xác nhận và gửi là hai hành động riêng. Ký xác nhận khóa kỳ và không gửi gì. Sau đó chủ gửi từ thẻ Send của trang Review, nơi To, Cc, Subject, nội dung thư và hai công tắc dòng PDF bắt đầu từ mặc định của Settings và có thể sửa cho lần gửi đó; lần gửi được lưu với các giá trị đã dùng. Đổi Settings tác động đến lần gửi kế tiếp, không bao giờ đến lần đã gửi. Gửi thêm một bản của kỳ đã có một bản được tính là đã gửi (một lượt gửi đã được chấp nhận hoặc không chắc chắn) cần một xác nhận và một lý do gõ vào 2 đến 500 ký tự ([05 Nộp bài](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Corrections and resends"); lý do được lưu cùng lần gửi và trong nhật ký audit và không bao giờ đưa vào email.

### Tự kiểm tra ở chế độ capture (trước khi gửi thật)

Làm theo runbook mục 13 bước 2 trên NAS. **[owner NAS step, unverified]**

- [ ] `OUTBOUND_MODE=capture` và `PRODUCTION_SENDING_ENABLED` chưa đặt; trạng thái quản trị hiện "Outbound mode: Capture only (nothing leaves the server)" và kích hoạt "Not activated", và `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` in ra `0` (trạng thái không có trường nào cho cờ).
- [ ] Với hai tài khoản tổng hợp của [07 Vận hành](../../docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md) "Setup sequence" (địa chỉ ở `example.invalid`), sign-off một kỳ tổng hợp, rồi gửi nó từ thẻ Send của trang Review (chỉ sign-off thì không gửi gì; thử "Send another copy..." một lần để thấy hộp thoại lý do). Thư mục capture (`mail-capture` dưới `/data/private-data`) chứa đúng người nhận đã gõ hoặc mặc định trên thẻ Send và nội dung đã đóng băng, cùng một PDF có SHA-256 bằng bản tải PDF của cùng các công tắc. Không có gì rời khỏi NAS.
- [ ] Cài đặt nộp bài của tài khoản chủ sở hữu và của mọi tài khoản khác sẽ tồn tại đã được lưu, các tài khoản tổng hợp đã bị vô hiệu hóa, và không tài khoản nào bật auto-submit.
- [ ] Trạng thái quản trị không có job gửi nào đang queued hay leased.

Tương đương trên máy phát triển là mục 3: mười một thư được capture từ bản build đóng băng vòng 5 với user tổng hợp (sáu thư có PDF), mỗi PDF khớp hash đã ghi.

### Lần gửi thật đầu tiên

Quyết định của chủ sở hữu D-12 (a): kỳ đầu tiên được ký tay, auto-submit tắt, không đặt activation instant, và lần gửi thật đầu tiên đi đến địa chỉ riêng của chủ sở hữu. Từ vòng 5 đó là hai hành động: sign-off, rồi gửi. Gõ (hoặc lấy mặc định từ Settings) địa chỉ riêng của chủ sở hữu làm To trên thẻ Send của lần gửi đó, và để trống Cc; bản đầu không cần lý do. Một bản gửi sau cho payroll là "Send another copy..." kèm lý do của nó.

| Trường | Giá trị (chỉ ở bản riêng) |
|---|---|
| To của lần gửi thật đầu tiên | `<owner-address>` |
| Cc | không |
| Người nhận payroll của bản gửi sau | `<payroll-address>` (quyết định cùng chủ sở hữu việc payroll nhận thư của kỳ đầu hay của một bản gửi sau, bản này hỏi lý do; runbook mục 13 bước 6) |

## 3. Mẫu email và PDF

Mọi mẫu được tạo từ bản export `git archive` sạch của commit `69d6340` (WP5-UX5-T05B-FREEZE, bản đóng băng slice của vòng 5), build bằng `npm ci` và `build:server`, dùng các service và job handler production, đồng hồ cố định, chế độ capture và user tổng hợp ở `example.invalid`. `PRODUCTION_SENDING_ENABLED` chưa bao giờ được đặt và không gửi gì cả. Lịch là lịch seed tổng hợp: kỳ 2026-09-14 đến 2026-09-27, ngày payroll 2026-10-02, múi giờ báo cáo `America/Los_Angeles`. Ngày thật sẽ khác.

Nguồn gốc của các mẫu này: tạo tại 69d6340 (WP5-UX5-T06, tạo lại cho vòng 5; các mẫu cũ ở 74d5bfe không còn đại diện cho sản phẩm, vì PDF, luồng gửi và các thư đã đổi). Lần chạy là `make-samples.mjs.txt` trong `evidence/WP5-UX5-T06/`: phương pháp của WP5-PILOT được chỉnh theo việc tách đôi. Nó ký xác nhận qua service sign-off production, rồi gửi qua service gửi production (`sendDraft` và `sendRevision`, với mặc định của Settings và các ghi đè cho từng lần gửi nêu bên dưới), chạy các job handler production và lượt quét hạn nộp với đồng hồ cố định, và trích từng thư mục capture. Nó chạy một lần (exit 0, 11 thư được capture, không job nào cần can thiệp). Commit này là bản đóng băng của các slice vòng 5, chưa phải bản phát hành vòng 5: gate cuối gói có thể đổi sản phẩm lần nữa, và khi đó các mẫu được tạo lại từ commit phát hành (làm mới sau gate vòng 5). Lịch và con người đều tổng hợp; ảnh chữ ký là đường lượn sóng do seed tạo ra, và không có chữ ký thật hay trang tham chiếu thật nào được mở hay lưu.

Mỗi thư lưu thành một `.txt` (tiêu đề, header thô, nội dung đã giải mã, thông tin PDF), và mỗi trang PDF thành một ảnh `*-synthetic.png`. Mọi ảnh đều đã được xem sau khi tạo. Mỗi PDF có một trang; hash đã lưu khớp tệp đính kèm đã capture (`pdf_hash_ok` true cho cả sáu trong `sample-index.txt`).

| # | Mẫu | Tệp thư | Ảnh PDF | SHA-256 của PDF |
|---|---|---|---|---|
| S1 | Sign-off thủ công lúc 2026-09-28 23:30 giờ địa phương (ảnh chữ ký đã lưu), rồi lần gửi revision 1 từ thẻ Send với mặc định của Settings | `msg-05-submission-payroll-manual-rev1.txt` | `pilot-05-submission-payroll-manual-rev1-p1-synthetic.png` | `5b31334fcb28e566cefc1b532790b47e0ce05e1530b994b8435d51dcfc9879f9` |
| S2 | Một hiệu chỉnh (revision 2) của kỳ S1, gửi như một bản gửi thêm; lần gửi không có lý do bị từ chối trước (422 `reason_required`), rồi gửi với lý do "Corrected Sunday end time; please use this copy" | `msg-11-submission-payroll-manual-rev2.txt` | `pilot-11-submission-payroll-manual-rev2-p1-synthetic.png` | `5893e0393165c34fa9c320bee6888aa721c78f668e5cad1fc2796dd39f15d1ab` |
| S3 | Nộp tự động lúc đến hạn, dòng ghi chú tắt, đã ủy quyền ảnh | `msg-08-submission-payroll-auto-off-rev1.txt` | `pilot-08-submission-payroll-auto-off-rev1-p1-synthetic.png` | `fa4a8e4f8cc0a023580a58c84f21dcf59071182656cf01ae5293088b0e3596ce` |
| S4 | Nộp tự động lúc đến hạn, dòng ghi chú bật (chữ mặc định "Automatic submission"), đã ủy quyền ảnh | `msg-07-submission-payroll-auto-on-rev1.txt` | `pilot-07-submission-payroll-auto-on-rev1-p1-synthetic.png` | `b8caaf084cedd49159411c710543ab21fc1ba53d5fcc4d98147e5288aa9f5acf` |
| S5 | Một revision đã ký lúc 2026-09-28 23:30 giờ địa phương và chưa bao giờ gửi, auto-submit bật: hạn nộp gửi nó như đã ký (F-2 a, `origin deadline`, phong bì của Settings), không có revision mới | `msg-10-submission-payroll-signed-rev1.txt` | `pilot-10-submission-payroll-signed-rev1-p1-synthetic.png` | `039228bd32a2ea44f059f115cb82c1e7264451de6a3eda2ea32ff56e60bca4ac` |
| S6 | Một sign-off thủ công và một lần gửi với "Time rows on the PDF" tắt chỉ cho lần gửi này (biến thể `t0o1`; dòng OT vẫn bật) | `msg-04-submission-payroll-norows-rev1.txt` | `pilot-04-submission-payroll-norows-rev1-p1-synthetic.png` | `c7ef784100d1371db3fbf69e2eba019f733a52c6b9bafba6c6afb882d09ad00f` |
| N1, N2 | Nhắc nhở gửi nhân viên ("due in about 18 hours"), mỗi tài khoản tự động một thư | `msg-03-...txt` (ghi chú tắt), `msg-02-...txt` (ghi chú bật) | không có | không có |
| N3, N4 | Thông báo kết quả gửi nhân viên sau nộp tự động | `msg-09-...txt` (ghi chú tắt), `msg-06-...txt` (ghi chú bật) | không có | không có |
| N5 | Nhắc nhở gửi nhân viên của revision S5: "Timesheet signed, not sent yet" (mới ở vòng 5) | `msg-01-notice-sample.signed-1.txt` | không có | không có |

Văn bản của từng trang PDF: `pdf-text-<n>-...txt`. Chỉ mục kèm các kiểm tra là `sample-index.txt`. Mọi tệp nằm ở `handoff/delivery/evidence/WP5-UX5-T06/`. Có năm thông báo; N5 là nhắc nhở "signed, not sent yet" mới.

### Các mẫu cho thấy gì

- **Email gửi payroll.** Từ người gửi, To là người nhận đã cấu hình của user, Cc là địa chỉ cc đã cấu hình, không có Bcc, PDF đính kèm tên `timesheet-<payroll-date>-r<n>.pdf`, có phần plain-text và HTML. Nội dung mặc định: "Hello, Attached is the timesheet of `{EmployeeName}` for `{PeriodStart}` to `{PeriodEnd}` (payroll date `{PayrollDate}`). Status: `{SignOffStatus}`. Submission `{SubmissionId}`, revision `{Revision}`."
- **Ký xác nhận, rồi gửi (S1).** Sign-off chỉ tạo revision, bản ghi sign-off và job PDF; lần gửi là một bước riêng. Tiêu đề và dòng trạng thái ghi "Submitted". PDF in tên nhân viên, ảnh chữ ký đã lưu và ngày sign-off thật theo múi giờ báo cáo (09/28/2026, dù theo UTC là 09/29).
- **Hiệu chỉnh và bản gửi thêm (S2).** Revision mới là một thư và PDF riêng với "Revision 2" cùng giờ kết thúc Chủ nhật đã sửa và tổng OT (17:00 h:mm thay vì 16:30), mang ngày của sign-off riêng của nó (09/30/2026). Một bản của kỳ đã được tính là đã gửi, nên lần gửi cần lý do; lần chạy cho thấy sự từ chối khi không có lý do rồi lần gửi được chấp nhận. Lý do được lưu cùng lần gửi và không có trong email (nội dung là mặc định: "Status: Submitted", "revision 2"). Email không nói đây là hiệu chỉnh hay vì sao; chủ sở hữu quyết định payroll có cần điều này được nêu trong template hay trong nội dung thư gõ cho lần gửi.
- **Tự động, ghi chú tắt (S3).** Tiêu đề và trạng thái ghi "Submitted", giống hệt bản thủ công. PDF có tên, ảnh đã ủy quyền và ngày nộp tự động (09/29/2026, ngày địa phương của lượt chạy hạn nộp), và không có chỉ báo tự động.
- **Tự động, ghi chú bật (S4).** Chữ ghi chú thay cho trạng thái trong PDF thành một dòng dưới tiêu đề ("Automatic submission"); tiêu đề thư ghi "Automatic submission" và nội dung ghi "Status: Automatic submission". Đây là khác biệt duy nhất so với S3. Revision được ghi vẫn là tự động, review đang chờ, `signed_at` rỗng và không có sign-off; màn hình của chính nhân viên và thông báo kết quả (N3, N4) nói rõ điều đó.
- **Hạn nộp gửi một revision đã ký chưa gửi (S5).** Người đó đã ký và không gửi. Trước hạn, nhắc nhở ghi "signed, not sent yet" (N5). Lúc đến hạn, với auto-submit bật, lượt quét gửi chính revision đã ký đó với phong bì của Settings. Không có revision mới và sổ cái không đổi. PDF mang ngày sign-off thật (09/28/2026), khác S3 và S4 mang ngày đến hạn. Không có thông báo kết quả sau lần gửi này. Với auto-submit tắt thì người đó nhận cảnh báo quá hạn và không gửi gì.
- **Một lần gửi với dòng giờ tắt (S6).** PDF không có ô giờ bắt đầu và kết thúc; các ngày, loại, ô OT, tổng OT (16:30), chữ ký và ngày giống như lần gửi có dòng giờ. Biến thể mặc định của sign-off (dòng giờ bật) cũng được dựng và lưu cho revision này; lần gửi dùng biến thể kia. Công tắc dòng OT hoạt động giống vậy, và bốn tổ hợp là bốn biến thể được lưu.
- **Thông báo.** Nhắc nhở và thông báo kết quả chỉ gửi nhân viên, có header `Auto-Submitted: auto-generated`, nêu hạn nộp theo múi giờ báo cáo và kèm liên kết yêu cầu đăng nhập; N3 và N4 nói review đang chờ, và N5 ghi "signed, not sent yet".
- **Giới hạn đã biết thấy được trong mẫu** (xem [ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md)): ngày không có bản ghi in "Worked" không giờ trên PDF tự động (R-WA8; quyết định F-1 và F-Q1 của chủ sở hữu); hiệu chỉnh hoặc xem lại muộn chỉ do người đó gửi, không bao giờ gửi lúc đến hạn (H-1 a); các mẫu không có nhãn ngày lễ và ngày nghỉ phép, nên dòng nghỉ một phần của PDF ("Leave h:mm", thay cho R-WA2) và quy tắc thu nhỏ rồi mới cắt cho nhãn ngày lễ dài được đọc từ mã, không được trình bày ở đây.

### Phê duyệt nội dung (chủ sở hữu)

Văn bản template cuối cùng, lựa chọn dòng ghi chú và việc có đặt ảnh vào các bản nộp tự động hay không là đầu vào của chủ sở hữu. Chủ sở hữu phê duyệt nội dung chính xác sau khi xem bản xem trước thật ở chế độ capture trên host.

- [ ] Văn bản template tiêu đề và nội dung đã duyệt (hoặc đã sửa): ______
- [ ] Dòng ghi chú: tắt / bật với chữ: ______
- [ ] Ảnh chữ ký trên bản nộp tự động: đã ủy quyền / không ủy quyền
- [ ] Cách nêu việc hiệu chỉnh trong thư revision 2: chấp nhận như hiện tại / yêu cầu đổi: ______
- [ ] Quy tắc lý do cho bản gửi thêm (một xác nhận và một lý do gõ vào 2 đến 500 ký tự khi đã có một bản được tính là đã gửi; lý do được giữ trong hồ sơ và nhật ký audit và không đưa vào email): chấp nhận như hiện tại / yêu cầu đổi (ví dụ thêm lý do vào email): ______
- [ ] Một revision đã ký nhưng chưa từng gửi được gửi lúc đến hạn khi auto-submit bật, và một hiệu chỉnh sau đó không bao giờ được gửi tự động (F-2 a, H-1 a): chấp nhận như hiện tại / yêu cầu đổi: ______
- [ ] Đã kiểm tra bản xem trước thật trên host, ở chế độ capture, với người nhận thật: ngày ______

## 4. Danh mục kiểm tra cài đặt

Chỉ tên khóa môi trường (giá trị nằm trong `<env-file>` và bản riêng). Nguồn: `.env.example` và [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) mục 1 và 13.

| Khóa | Cần cho pilot | Placeholder hoặc quy tắc |
|---|---|---|
| `NODE_ENV` | có | `production` |
| `HOST`, `PORT` | có | `0.0.0.0` trong container, `3000`; ví dụ Compose chỉ publish loopback |
| `DATABASE_PATH`, `DATA_DIR` | có (đường dẫn tuyệt đối, cả hai) | `/data/timesheet.db`, `/data/private-data` |
| `APP_ORIGINS`, `PUBLIC_BASE_URL` | có | `https://<nas-host>` |
| `COOKIE_SECURE`, `SESSION_TTL_HOURS` | ghi đè tùy chọn | mặc định |
| `TRUSTED_PROXY_ADDRESSES` | có | `<proxy-ip>` |
| `OUTBOUND_MODE` | có | `capture` đến khi kích hoạt, sau đó `smtp` |
| `MAIL_FROM` | có | `<sender-address>` |
| `PRODUCTION_SENDING_ENABLED` | chỉ khi kích hoạt | đúng `true`; còn lại để trống |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURITY`, `SMTP_USER`, `SMTP_PASSWORD` | chỉ khi kích hoạt | bản riêng của chủ sở hữu |
| `JOB_RUNNER` | chỉ khi rollback | `off` sau rollback về schema cũ đến khi đối soát xong (D-1) |
| `STATIC_DIR` | tùy chọn | để trống |
| Biến Compose `TIMESHEET_ENV_FILE`, `TIMESHEET_DATA_DIR`, `TIMESHEET_IMAGE`, `TIMESHEET_PORT` | có | trong `<project-dir>/.env`, mode 600 (runbook, "Placeholders and conventions") |

Cài đặt ứng dụng. Cột "mặc định đã ghi" là mặc định thiết kế ([04 UX và cài đặt](../../docs/04_UX_AND_SETTINGS.vi.md)); giá trị của chủ sở hữu ghi ở bản riêng.

| Cài đặt | Đặt ở đâu | Mặc định đã ghi hoặc mẫu | Giá trị của chủ sở hữu |
|---|---|---|---|
| Múi giờ báo cáo | tệp bootstrap (runbook mục 3) | `America/Los_Angeles`; đổi múi giờ thiết bị không bao giờ nhóm lại timesheet | bản riêng |
| Lịch payroll | tệp bootstrap | ngày payroll mốc `2026-10-02`, mỗi 14 ngày, hạn nộp vào thứ Ba trước đó 17:00 múi giờ báo cáo | bản riêng |
| Ngày nghỉ công ty 2026 | tệp bootstrap, sau đó mục ngày nghỉ hằng năm của quản trị viên | chín ngày của template để chủ sở hữu xác nhận (`reference/examples/holidays.2026.example.json`, không phải danh sách luật định): 01-01, 01-02 (linh hoạt), 02-16, 05-25, 07-03 (bù), 09-07, 11-26, 11-27 (linh hoạt), 12-25 | bản riêng |
| Ngày nghỉ công ty 2027 | ngày nghỉ hằng năm của quản trị viên: xem trước, kiểm tra, xuất bản phiên bản hiệu lực mới | chưa có; ứng dụng cảnh báo từ 1 tháng 10 (E-12) khi thiếu lịch năm sau | bản riêng; là đầu vào của chủ sở hữu |
| Policy B / N / M | Settings của user (policy) | B = 480 phút, N = 30 (vượt hẳn), M = 30 (gần nhất, đúng điểm giữa làm tròn xuống), tham chiếu 08:00-17:00, nghỉ 15+30+15 | bản riêng |
| Chế độ thiếu giờ (deficit) | policy của user | `ignore`; tùy chọn `auto_deduct` hoặc `choose_at_signoff` | bản riêng |
| Nhắc nhở | cài đặt nộp bài của user | trước hạn 24 giờ và 2 giờ, cho đến khi kỳ có một lần gửi (kỳ đã ký chưa gửi được nhắc là "signed, not sent yet"), cảnh báo quá hạn khi auto-submit tắt, thông báo kết quả sau nộp tự động | bản riêng |
| Auto-submit | cài đặt nộp bài của user | bật là tùy chọn được lưu; không có gì tự động trước activation instant. Khi bật, hạn nộp chốt và gửi một bản nháp và gửi một revision đã ký nhưng chưa từng gửi (F-2 a); một hiệu chỉnh không bao giờ được gửi tự động. Khuyến nghị cho kỳ đầu: tắt (D-12) | bản riêng |
| Time rows on the PDF | cài đặt nộp bài của user (Settings, Personal) | bật; mặc định của công tắc "Time rows on the PDF" của mỗi lần gửi, cũng được lần gửi lúc đến hạn dùng. Tắt thì in PDF không có ô giờ bắt đầu và kết thúc | bản riêng |
| OT rows on the PDF | cài đặt nộp bài của user | bật; mặc định của công tắc "OT rows on the PDF" của mỗi lần gửi, cũng được lần gửi lúc đến hạn dùng. Tắt thì không in ô OT và tổng OT | bản riêng |
| Dòng ghi chú | cài đặt nộp bài của user | tắt; chữ "Automatic submission" | bản riêng |
| Ủy quyền ảnh tự động | lúc tải chữ ký, một ủy quyền riêng có audit (thu hồi được trong Settings) | chọn sẵn lúc tải lên; nếu bỏ chọn thì không có ảnh trên bản nộp tự động | bản riêng |
| Người nhận, template | cài đặt nộp bài của user | mục 2; mặc định của mọi lần gửi, sửa trên thẻ Send cho từng lần gửi | bản riêng |
| Số dư đầu kỳ | màn hình Import / `PUT /api/ot/opening-balance` | 0 cho đến khi chủ sở hữu đặt (D-10 a có thay đổi, F-1 i): một giá trị có dấu, khác 0, kèm ngày hiệu lực (mặc định là ngày đặt) và một lý do ngắn; bằng chứng tùy chọn (để trống thì lưu là "not provided"); một lần sửa có thể đưa về 0. Pilot không nhập workbook lịch sử | bản riêng |
| Activation instant | `PUT /api/admin/automation/activation` từ console của quản trị viên đã đăng nhập (runbook mục 13 bước 5) | rỗng; chỉ đặt `<activation-instant-utc>` sau khi kỳ đầu đã được ký tay | bản riêng |
| Kỳ pilot đầu tiên | do chủ sở hữu chọn trên chu kỳ 14 ngày | các ngày payroll tiếp tục 2026-10-02 + 14 ngày (2026-10-16, 2026-10-30, 2026-11-13, ...); mỗi kỳ hạn nộp thứ Ba trước đó 17:00 múi giờ báo cáo. Placeholder `<first-payroll-date>` | bản riêng |

## 5. Bằng chứng khôi phục

### Số liệu trên máy phát triển (drill của WP5-GATE, không phải NAS)

Các số liệu này là của các drill WP5-GATE và WP5-UX3 (schema 13). Chúng được làm mới sau gate vòng 5, có drill chạy bản build schema 15.

Nguồn: drill container của gate, dữ liệu tổng hợp, chế độ capture, Docker Desktop trên máy trạm phát triển (`linux/amd64`), image `sha256:0addd2000b42...9fd8`. `npm run drill:container -- --wp3 <bản build trước>`: các giai đoạn 33, 31, 57, 35, 27 và 23 kiểm tra = 208 PASS, 0 FAIL (`handoff/delivery/evidence/WP5-GATE/07-drill.txt`).

Nguồn gốc của các số liệu này: bảng được tạo lần đầu tại 74d5bfe (WP5-GATE). Commit phát hành a643794 đã đạt lại cùng drill container trong WP5-UX2-REGATE2 (`--wp3`, 208 PASS / 0 FAIL, cùng 208 kiểm tra, image `sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a`), nên số lượng đạt đúng với bản phát hành; các giá trị riêng lẻ bên dưới (mili giây, số byte, số lượt ghi) là của lần chạy WP5-GATE; hồ sơ WP5-UX2-REGATE2 ghi số kiểm tra (33/31/57/35/27/23), không ghi các giá trị này. Code server mà drill chạy, `dist/server`, giống hệt từng byte giữa 74d5bfe và 90b98ef và ở a643794 chỉ khác ba văn bản thông báo và một chú thích (hồ sơ WP5-UX2); bản phát hành 8e55710 giống hệt từng byte với a643794 ở `dist/server` và `dist/domain` và đã đạt cùng drill trong WP5-UX3-REGATE3 (`--wp3`, 208 PASS / 0 FAIL, cùng 208 kiểm tra, image `sha256:bcb0692cc99fe5c0b198dc26cff623045903f851f3d7069105b1df09bf9e493b`, trên các bản build có byte giống hệt bản phát hành; WP5-UX3-REGATE5 mang kết quả đó sang); client đã đổi trong các vòng giao diện và không thuộc số liệu khôi phục.

| Số liệu | Giá trị |
|---|---|
| Backup khi đang ghi | exit 0; 432 ms trong CLI, 1.180 ms qua `docker compose exec`; 5, 56 và 27 lượt ghi trước, trong và sau, tất cả thành công |
| Nội dung backup | schema 13, app 0.1.0, 10 tệp (7 chữ ký, 1 PDF), database 651.264 byte, integrity ok, 0 vi phạm khóa ngoại; mọi tệp khớp SHA-256 và kích thước trong manifest |
| Khôi phục cô lập | exit 0 trong 1.331 ms vào thư mục mới còn trống; manifest đã xác minh; 10 tệp, 0 sai lệch; integrity check đạt; schema 13 như backup |
| Số đếm sau khôi phục bằng backup | users 2, import batches 2, revisions 1, ledger entries 0, sign-offs 1, attachments 8, work sessions 29, outbound jobs 1 |
| Tạm dừng outbound | bản khôi phục bị tạm dừng với lý do `restored`; 1 job gửi bị giữ, 0 queued, 0 attempt chờ quyết định; không gì được capture hay gửi khi đang tạm dừng (quan sát 40 giây) |
| Instance khôi phục | healthy sau 5,5 giây; session đã lưu dùng được; một PDF render được |
| Đối soát | bản xem trước `outbound release` liệt kê thư gửi đang giữ; `outbound resume --confirm` gỡ tạm dừng; sau đó không gì từ backup bị gửi đi; `release --job` và `--all` mỗi cái tạo đúng một attempt |
| Khôi phục rollback (`--keep-schema`) | bị từ chối khi không có `--confirm`, rồi khôi phục khi có: số đếm bằng giá trị trước nâng cấp; không gửi gì sau khi bản build trước khởi động |
| Chưa chứng minh ở đây | NAS, hệ thống tệp của nó, DSM Task Scheduler, bản sao thiết bị riêng, cảnh báo host, SMTP thật |

Đây là số đo trên một máy trạm. Các mục tiêu backup hằng đêm, điểm khôi phục 24 giờ và khôi phục trong một giờ cần được thử trên NAS, không được khẳng định.

### Biểu mẫu khôi phục đích trên NAS (để trống)

Chạy runbook mục 4, 6 và 7 trên NAS với dữ liệu tổng hợp trước khi kích hoạt. Chỉ ghi số đếm và hash, không bao giờ ghi dữ liệu cá nhân. **[owner NAS step, unverified]**

| Bước | Ghi lại | Kết quả |
|---|---|---|
| Ngày, người thực hiện, commit phát hành, image ID | | |
| Lệnh backup (`<cli> backup --to /data/backups`) | exit code và `outcome` in ra (mong đợi 0, `succeeded`) | |
| `<backup-name>` và `sha256sum <backup-dir>/<backup-name>/manifest.json` = `<manifest-sha256>` | | |
| Tóm tắt manifest | schema, phiên bản app, số tệp, chữ ký, PDF, byte database | |
| Số đếm nguồn (trạng thái quản trị hoặc API) | users, revisions, ledger entries, sign-offs, attachments, work sessions | |
| Bản sao thiết bị riêng của backup và của `<env-file>` chế độ capture | ở đâu, ngày | |
| Khôi phục cô lập vào `<restore-dir>` mới còn trống (container dùng một lần, không mạng, root chỉ đọc) | exit code (mong đợi 0), thời lượng | |
| Kết quả restore | manifest đã xác minh, số tệp và sai lệch, kết quả integrity, schema | |
| Số đếm sau khôi phục bằng số đếm nguồn | từng số đếm bằng nhau: có / không | |
| Hash của một PDF đã khôi phục bằng hash đã ghi | có / không | |
| Instance khôi phục (tên project Compose riêng, `--no-build`) | healthy sau bao lâu, banner tạm dừng và lý do `restored`, không gửi gì khi tạm dừng | |
| Đối soát (mục 7) | số thư gửi đang giữ, attempt không chắc chắn, quyết định đã ghi, exit của `resume --confirm`, các lần release | |
| Instance live không bị động; hai hàng đợi cũ và khôi phục không bao giờ chạy cùng lúc | có / không | |
| Đã backup đầu tiên sau khôi phục | có / không | |
| Tổng thời gian từ backup đến instance khôi phục đã kiểm tra | so với mục tiêu một giờ | |
| Kết luận | đạt / không đạt / ghi chú | |

- [ ] Khôi phục đích đã chạy trên NAS và biểu mẫu đã điền đủ. Ngày: ______

## 6. Thẻ rollback

Pilot là lần cài đặt đầu tiên, nên không có schema production hay image cũ để quay về. Rollback nghĩa là dừng gửi thật và quay về Excel ([runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) mục 15). Bản trong git chỉ có placeholder; bản riêng của chủ sở hữu giữ giá trị thật (D-11).

| Trường | Giá trị |
|---|---|
| Commit phát hành | `8e557100d16b6b6eb86a48e00276835761aabfdf` |
| Source digest | `507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6` (833 tệp, không tính `handoff/`) |
| Image ID build trên NAS | `<image-id>` (bản build tham chiếu của drill WP5-UX3-REGATE3, máy phát triển, byte giống hệt bản phát hành, 110.042.848 byte, đã xóa sau gate: `sha256:bcb0692cc99fe5c0b198dc26cff623045903f851f3d7069105b1df09bf9e493b`) |
| Backup trước kích hoạt | `<backup-name>` (lấy ở runbook mục 13 bước 3) |
| Hash manifest của backup đó | `<manifest-sha256>` |
| Bản sao thiết bị riêng của backup và `<env-file>` chế độ capture | cất ở đâu (bản riêng) |
| Ngày kích hoạt | `<activation-instant-utc>` |

Các dòng định danh ở trên được làm mới sau gate vòng 5 (ACCEPT-DOCS), như ở mục 0.

Các bước (văn bản đầy đủ ở runbook mục 14 và 15):

1. Hủy kích hoạt: nếu đã đặt activation instant thì xóa nó trước (lệnh console với `active_from: null` và một lý do); chờ đến khi không còn job gửi nào queued hay leased; trong `<env-file>` bỏ `PRODUCTION_SENDING_ENABLED`, đặt `OUTBOUND_MODE=capture` và xóa các giá trị `SMTP_*`; `<compose> up --detach --force-recreate --no-build`; kiểm tra trạng thái hiện "Outbound mode: Capture only (nothing leaves the server)" và "Not activated", và `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` in ra `0`.
2. Giữ dữ liệu. Không bao giờ xóa `<data-dir>` hay `<backup-dir>`. Không bao giờ chạy hai hàng đợi.
3. Quay về workbook Excel cho kỳ đó (bản riêng của chủ sở hữu).
4. Thư đã gửi không thu hồi được; đọc lịch sử gửi để tránh nhập hai lần. Một kỳ nộp nhầm vẫn nằm trong hồ sơ và được sửa bằng hiệu chỉnh có lý do.
5. Chỉ khôi phục khi dữ liệu hỏng hoặc sai, không bao giờ ghi đè lên dữ liệu live: kiểm tra hash manifest với `<manifest-sha256>`, khôi phục `<backup-name>` cô lập (biểu mẫu mục 5) và đối soát.
6. Quy tắc tồn dư (quyết định của chủ sở hữu D-1 (a)): sau rollback về schema cũ, bản build cũ chạy với `JOB_RUNNER=off` đến khi đối soát xong. Điều này chỉ quan trọng sau một nâng cấp về sau có thêm migration.

## 7. Định danh bản phát hành và danh mục kiểm tra NAS

Định danh bản phát hành: bảng ở mục 0 (làm mới sau gate vòng 5, ACCEPT-DOCS). NAS **CHƯA ĐƯỢC XÁC MINH (NOT VERIFIED)** cho đến khi chủ sở hữu tick mọi mục dưới đây và ghi ngày. Đến lúc đó kết quả là "software ready, pilot pending" (quyết định của chủ sở hữu D-13 (a)). Mọi mục là **[owner NAS step, unverified]**, sao từ [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) mục 2.

Thông tin NAS cần ghi (bản riêng): model NAS ______; phiên bản DSM ______; phiên bản Container Manager ______; `uname -m` ______; đường dẫn dữ liệu và backup ______; chủ thư mục UID/GID `10001` ______; NTP bật ______.

- [ ] Kiến trúc (`uname -m`), phiên bản DSM và Container Manager đã ghi lại.
- [ ] `<data-dir>` nằm trên volume cục bộ (không phải SMB, NFS hay thư mục đồng bộ), thuộc UID/GID `10001`, mode 700.
- [ ] `<env-file>` mode 600 và không chứa giá trị nào cũng có trong git hay chat.
- [ ] Dịch vụ healthy sau `up`, sau `<compose> restart` và sau khi khởi động lại NAS.
- [ ] `https://<nas-host>/api/ready` trả 200 chỉ với các số schema, và `https://<nas-host>/api/health` trả 200.
- [ ] Màn hình Setup chỉ hiện một lần, và quản trị viên đăng nhập được.
- [ ] Giới hạn tốc độ đăng nhập theo từng client (`TRUSTED_PROXY_ADDRESSES` đúng).
- [ ] NTP bật và đồng hồ NAS đúng.
- [ ] Một bản nộp tổng hợp render được PDF (font có trong image) và thư của nó rơi vào capture.
- [ ] Backup, khôi phục cô lập và đối soát chạy được trên NAS với dữ liệu tổng hợp (biểu mẫu mục 5), và bản sao thiết bị riêng đã có.
- [ ] Một bản sao được bảo vệ của `<env-file>` (mode 600) được giữ cùng bản sao backup trên thiết bị riêng, kèm commit phát hành, source digest và image ID.
- [ ] Trạng thái quản trị hiện backup, dung lượng đĩa trống và chế độ outbound.
- [ ] Cảnh báo host độc lập (runbook mục 11) kêu khi thử.

Tổng thể: danh mục NAS hoàn tất và ghi ngày ______ bởi ______. (Để trống nghĩa là NOT VERIFIED.)

## 8. Quyết định của chủ sở hữu

Chủ sở hữu đã trả lời cả mười lăm quyết định ngày 2026-10-20 (`owner_decisions` của board, nguyên văn bằng tiếng Việt). Nguồn các phương án: [WP5-PLAN](tasks/WP5-PLAN.md) mục D; bản ghi quyết định là [10 Quyết định](../../docs/10_DECISIONS_AND_SOURCES.vi.md). D-1, D-7, D-8 và D-13 cần có câu trả lời trước khi kích hoạt và đã có. Năm câu trả lời làm đổi mã (D-5 a, D-6 a, D-9 b, D-10 là F-1 (i) và D-15 b, cùng một chốt chặn chấm công qua chia sẻ); chúng thuộc vòng đổi giao diện 4, dùng chung gate cuối gói của vòng 5 và các audit độc lập mới, nên định danh phát hành ở mục 0 và 6 được làm mới sau gate đó (ACCEPT-DOCS). Các câu trả lời của vòng 5 nằm ở bảng thứ hai bên dưới. D-11 (a) và D-13 (a): giá trị thật ở lại bản riêng của chủ sở hữu, và NAS vẫn NOT VERIFIED cho đến khi chủ sở hữu tick danh mục ở mục 7.

| ID | Quyết định | Câu trả lời | Đã thay đổi gì |
|---|---|---|---|
| D-1 (R-A3) | Job tạo sau khi rollback về schema cũ không bị giữ | (a) giữ quy tắc: bản build cũ chạy với `JOB_RUNNER=off` đến khi đối soát xong | chỉ tài liệu (runbook mục 8 và 15) |
| D-2 (WP4-I-1) | Kỳ draft của ứng dụng có được nhận ngày import không | (a) không bao giờ | chỉ tài liệu (mặc định hiện tại) |
| D-3 (WP4-I-2) | "Off day (overtime used)" khi import | (a) bỏ qua | chỉ tài liệu (mặc định hiện tại) |
| D-4 (WP4-I-3) | Import kỳ chưa kết thúc | (a) không | chỉ tài liệu (mặc định hiện tại) |
| D-5 (WP4-I-4) | Sửa số dư đầu kỳ nhập sai về tổng bằng 0 | (a) có, bằng một hiệu chỉnh bù trừ có lý do | mã: một lần sửa có thể đưa số dư về 0 (số dư đã bằng 0 thì không ghi gì); tài liệu 03, 07, 11, 12 |
| D-6 (WP4-I-5) | Hạn mức cho các bản xem trước import chưa commit | (a) tối đa 20 mỗi người | mã: lần tải lên mới thứ 21 bị từ chối (409 `import_preview_limit`); một bản xem trước chỉ được giải phóng bằng cách commit nó; tài liệu 07, 11, 12 |
| D-7 (F-7) | Nhắc nhở sau sự cố crash trên SMTP thật có thể lặp một lần | (a) chấp nhận at-least-once | chỉ tài liệu (tài liệu 05, 12, runbook mục 13) |
| D-8 (F-7) | Lỗi chứng chỉ TLS được phân loại tạm thời (thử lại, rồi can thiệp) | (a) giữ nguyên và ghi tài liệu | chỉ tài liệu (tài liệu 12, runbook mục 13): lỗi chứng chỉ được thử lại, tổng cộng năm lần, rồi can thiệp, hiện là `smtp_unavailable`; việc kiểm tra đầu tiên sau khi đổi chứng chỉ hoặc máy chủ |
| D-9 (E-11, F-7) | Nhóm pilot và mật khẩu (không có tự đổi mật khẩu) | (b) thêm route đổi mật khẩu trước khi có người khác tham gia | mã: `POST /api/auth/password` và thẻ "Change password" ở Profile; mật khẩu tạm của admin vẫn giữ; tài liệu 03, 04, 11, 12 |
| D-10 | Số dư đầu kỳ và lịch sử lúc bắt đầu pilot | (a) có thay đổi: mặc định 0, đổi được bất cứ lúc nào, không cần bằng chứng (F-1 i); pilot không import lịch sử | mã: lý do bắt buộc, bằng chứng tùy chọn ("not provided" khi để trống), ngày hiệu lực mặc định là ngày đặt, sửa về 0; tài liệu 01, 03, 07, 10, 11, 12; dòng ở mục 4 |
| D-11 | Giá trị pilot thật nằm ở đâu | (a) gói trong git với placeholder, giá trị thật ở bản riêng của chủ sở hữu ngoài git | chỉ tài liệu (mục 0) |
| D-12 | Phân giai đoạn lần kích hoạt thật đầu tiên | (a) kỳ đầu làm tay với gửi thật đến địa chỉ riêng của chủ sở hữu, auto-submit tắt, không có activation instant | chỉ tài liệu (mục 2, runbook mục 13 bước 6) |
| D-13 | Host pilot | (a) NAS; NOT VERIFIED đến khi chủ sở hữu tick danh mục | chỉ tài liệu (mục 7) |
| D-14 | Tuyên bố phát hành đầu tiên (`git.release_declared`) | (b) tuyên bố sau thời gian pilot | chỉ tài liệu (dòng tuyên bố ở mục 0, ô tick ở mục 9) |
| D-15 (F-Q6) | Quyền riêng tư của xem trước ngày nghỉ | (b) khôi phục số đếm theo ngày | mã: số đếm chính xác theo ngày, không có danh tính, và một sự kiện audit `calendar.holiday_preview` cho mỗi lần xem trước; tài liệu 03, 10, 12 |

### Quyết định của chủ sở hữu vòng 5 (2026-10-21 và 2026-10-22)

Chủ sở hữu đã trả lời các câu hỏi F-1 đến F-10 của WP5-UX5-PLAN ngày 2026-10-21 và hai câu hỏi của coordinator ngày 2026-10-22 (`owner_decisions` của board, nguyên văn bằng tiếng Việt). Bản ghi quyết định là [10 Quyết định](../../docs/10_DECISIONS_AND_SOURCES.vi.md). F-2, F-3, F-4 và F-5 làm đổi server, dữ liệu và quy tắc nghiệp vụ, nên các mục 2 đến 4 của gói pilot đổi theo; định danh phát hành được làm mới sau gate vòng 5.

| ID | Quyết định | Câu trả lời | Đã thay đổi gì |
|---|---|---|---|
| Q0 | Gate của vòng 4 đặt ở đâu | (a) vòng 4 được gộp vào gate cuối gói của vòng 5 | không đổi mã; một gate và audit mới cho vòng 4 và 5, nên định danh phát hành chờ nó |
| Q1 | Ảnh tham chiếu cho PDF | chủ sở hữu cho xem một trang workbook đã điền; chỉ dùng cho kiểu chữ và tỷ lệ, và không lưu ở đâu vì chứa dữ liệu cá nhân | bố cục PDF của UX5-T02 |
| Q2 | Chữ ở chân trang PDF | trái: dòng bản quyền do coordinator đề xuất "© <year> C&D Semiconductor Services, Inc. All rights reserved."; phải: "Internal use by C&D only" | chân trang PDF của UX5-T02 |
| FREEZE-T01B-Q | Ai đóng băng slice T01b | (a) một committer mới với đường dẫn tường minh và không có tệp danh sách | không đổi sản phẩm (quản trị của việc đóng băng) |
| H-1 | Sau một lần gửi, hiệu chỉnh hoặc xem lại muộn có đi lúc đến hạn không | (a) một kỳ vẫn là đã nộp khi revision nào của nó có một lần gửi; người đó gửi các hiệu chỉnh, không bao giờ là hạn nộp | mã: lượt quét hạn nộp chỉ gửi một kỳ khi không revision nào có lần gửi; nút trên Timesheet ghi "Review or correct" sau một lần gửi; tài liệu 05, 10, 12; mục 3 (giới hạn) |
| F-1 | Chiều cao nút phụ so với quy tắc chạm 44px | (a) 36px nhìn thấy trên mọi thiết bị, vùng chạm 44px giữ như một vùng bấm vô hình; điều khiển giao diện 32px với con trỏ chính xác từ 768px | CSS client và test; tài liệu 04 |
| F-2 | Sau khi tách: hạn nộp, nhắc nhở, "cần sign off" | (a) "đã nộp" nghĩa là đã gửi: nhắc nhở chạy đến khi có lần gửi; lúc đến hạn một kỳ đã ký chưa gửi được gửi khi auto-submit bật và nhận cảnh báo quá hạn khi tắt; nút ghi "Review & send" | mã: `deadline.send_signed`, nhắc nhở "signed, not sent yet"; tài liệu 04, 05, 06, 10; mục 3 mẫu S5 và thông báo N5 |
| F-3 | Hai công tắc PDF | (b) chọn ở mỗi lần gửi, đồng thời đặt làm mặc định trong Settings | mã: biến thể PDF cho mỗi revision, `show_time_on_pdf`; tài liệu 03, 04, 05, 10; mục 2, 3 (S6) và 4 |
| F-4 | To, Cc, Subject và nội dung thư trên thẻ Send | sửa được cho từng lần gửi, kèm một xác nhận và một lý do gõ vào trước khi gửi thêm một bản | mã: mỗi lần gửi là một bản ghi (`revision_sends`), `reason_required`, lý do trong nhật ký audit và không trong email; tài liệu 03, 05, 06, 10; mục 2 và 3 (S2); danh mục phê duyệt nội dung |
| F-5 | Sign off khi không có ảnh chữ ký | (b) có ảnh thì ký bằng ảnh và tên; không có thì ký bằng tên; ảnh là tùy chọn | mã: migration 0014, tên hiển thị của tài khoản là người ký; tài liệu 03, 04, 05, 06, 10; mục 3 |
| F-6 | Cái gì chuyển xuống 480px | (a) dạng gọn của bảng chuyển xuống dưới 480px; vỏ điều hướng, editor dạng sheet, hộp thoại toàn màn hình và quy tắc 44px ở lại 768px | CSS và truy vấn client; tài liệu 04 |
| F-7 | Bấm ra ngoài đóng Day editor | (a) bấm ra ngoài các cột, ngăn kéo và hộp thoại sẽ đóng nó; bấm vào nút và liên kết giữ hành động của chúng | client; tài liệu 04 |
| F-8 | Đoạn hướng dẫn của workbook trên PDF | (a) bỏ đi | PDF; tài liệu 03, 04; mục 3 |
| F-9 | Font của PDF | (b) một font viết tay nếu dùng được: được duyệt là Indie Flower (WP5-UX5-G-1, 2026-10-21), kèm phương án dự phòng | PDF; file font đầu tiên được commit, ADR 0001, Dockerfile và các kiểm tra gate; tài liệu 03, 04, 12; các mẫu được tạo lại |
| F-10 | Đầu trang PDF "version/revision" | (a) "Revision n" với mã nộp nhỏ bên dưới | PDF; tài liệu 04; mục 3 |
| Ghi chú mockup | Các ghi chú của chủ sở hữu về mockup B1 đến B11 (khoảng cách, hai dòng chữ ký, thụt lề, việc duyệt Indie Flower, kiểu chữ của PDF) | áp dụng như đã viết | bố cục client và PDF; tài liệu 04 |

Không phải quyết định, để chủ sở hữu lưu ý: danh sách ngày nghỉ công ty 2027 (đầu vào cài đặt); bản sao backup trên thiết bị riêng ([07 Vận hành](../../docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md)); cảnh báo host độc lập (runbook mục 11).

## 9. Biên bản cho phép (chưa ký)

Không có gì ở đây được tick hay ký. Chỉ chủ sở hữu điền, trong hồ sơ riêng của chủ sở hữu, và chỉ sau khi đã đọc gói này. Bốn sự kiện được tách riêng; sự kiện này không thay cho sự kiện kia.

| Sự kiện | Ý nghĩa | Ai ghi | Bằng chứng và thời điểm |
|---|---|---|---|
| 1. Phần mềm sẵn sàng | Các gate và kiểm toán độc lập của gói đạt trên dữ liệu tổng hợp ở chế độ capture trên máy trạm phát triển (handoff của các gói, gate WP5). Không nói gì về NAS. | hồ sơ dự án | ______ |
| 2. Quyền của chủ sở hữu | Sự cho phép rõ ràng của chủ sở hữu cho gửi thật và kích hoạt, trong chat hoặc hồ sơ riêng của chủ sở hữu. Chưa được yêu cầu hay cấp trong bản phát hành này. | chủ sở hữu | ______ |
| 3. Nhà cung cấp chấp nhận | Lịch sử gửi của một revision cho thấy attempt được chấp nhận kèm xác nhận của nhà cung cấp. Thất bại hiện mã lỗi đã che. | chủ sở hữu, theo từng thư | ______ |
| 4. Người nhận đã nhận | Chủ sở hữu xác nhận trong hộp thư (kể cả thư rác) rằng đúng một thư đến từ `<sender-address>` kèm PDF, và PDF bằng bản trong ứng dụng. | chủ sở hữu, theo từng thư | ______ |

Quyền, phạm vi và điều kiện của chủ sở hữu:

- [ ] Tôi đã đọc gói này và [ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md). Các quyết định ở mục 8 được trả lời như ghi ở đó.
- [ ] Danh mục NAS (mục 7) đã hoàn tất và ghi ngày; hoặc chủ sở hữu chấp nhận bằng văn bản việc kích hoạt trên host vẫn NOT VERIFIED: ______
- [ ] Biểu mẫu khôi phục đích (mục 5) đã hoàn tất.
- [ ] Phê duyệt nội dung (mục 3) đã hoàn tất.
- [ ] Gửi thật được cho phép cho: chỉ lần gửi thật đầu đến `<owner-address>` / cả `<payroll-address>` / phạm vi: ______
- [ ] Việc đặt activation instant được cho phép: chưa / từ `<activation-instant-utc>`
- [ ] Bản phát hành đầu tiên được tuyên bố sau thời gian pilot, không phải lúc cho phép này (D-14 b): đã tuyên bố ngày ______ (để trống đến lúc đó; `git.release_declared` vẫn là false)

Chữ ký của chủ sở hữu hoặc tham chiếu đến hồ sơ riêng của chủ sở hữu: ______   Ngày và thời điểm UTC: ______

Sau lần gửi thật đầu tiên, ghi riêng nhà cung cấp chấp nhận và người nhận đã nhận (sự kiện 3 và 4); thư đã được chấp nhận mà không bao giờ đến là vấn đề của nhà cung cấp hay hộp thư, không phải kết quả của ứng dụng. Có gì bất thường: hủy kích hoạt (mục 6). Sau pilot, theo dõi một kỳ thật với Excel còn dùng để so sánh ([06 Nghiệm thu](../../docs/06_TEST_AND_ACCEPTANCE.vi.md)).

## 10. Giới hạn của gói này

- Các mẫu đến từ chế độ capture trên máy trạm phát triển. Hành vi SMTP thật, NAS, reverse proxy, chứng chỉ và bản sao thiết bị riêng chưa được quan sát cho đến khi chủ sở hữu chạy các bước trên.
- Lịch, tên và ngày của mẫu là tổng hợp. Không có tên host, địa chỉ, thông tin đăng nhập, chữ ký hay dữ liệu cá nhân thật nào trong gói được theo dõi hay bằng chứng của nó.
- Các mẫu ở mục 3 đến từ commit đóng băng slice vòng 5 `69d6340`, không phải bản phát hành vòng 5; chúng được tạo lại từ commit phát hành sau gate cuối gói nếu sản phẩm đổi. Chúng không có nhãn ngày lễ và ngày nghỉ phép.
- Các giới hạn của vòng 5 nằm ở [ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md) mục "Vòng chỉnh UI thứ 5": hiệu chỉnh làm sau một lần gửi chỉ do người đó gửi; nút trên Timesheet không thấy một lần gửi đang xếp hàng chưa có lượt nào; mỗi revision lưu tối đa bốn PDF; "PDF Preview" mở trong tab mới; chiều rộng lẻ được chứng minh trên style sheet; container drill và các audit độc lập của vòng 5 thuộc gate và chưa chạy.
- Mục 4 liệt kê mặc định đã ghi, không phải lựa chọn của chủ sở hữu; giá trị của chủ sở hữu không được biết ở đây.
- Image ID tham chiếu thuộc một bản build đã bị xóa sau gate; bản build trên NAS ghi ID riêng của nó.
- Pilot chưa chạy, NAS là NOT VERIFIED, chưa ai yêu cầu hay cấp phép, và không có kết quả pilot.
- Backlog tùy chọn cho vòng sửa sau pilot, chỉ theo ID (không mục nào chặn việc nghiệm thu lại): R-B7-1..R-B7-4 ([WP5_UX_REVIEW_B7](WP5_UX_REVIEW_B7.vi.md)); R-AB8-1..R-AB8-4 ([WP5_UX_REVIEW_AB8](WP5_UX_REVIEW_AB8.vi.md)); R-AB9-1..R-AB9-6 ([WP5_UX_REVIEW_AB9](WP5_UX_REVIEW_AB9.vi.md)); và các rủi ro B6 và A7 ([WP5_UX_REVIEW_B6](WP5_UX_REVIEW_B6.vi.md), [WP5_UX_REVIEW_A7](WP5_UX_REVIEW_A7.vi.md)); từ vòng đổi giao diện 2: R-UX2A-1..R-UX2A-5 ([WP5_UX2_REVIEW](WP5_UX2_REVIEW.vi.md)) và R-UX2A2-1..R-UX2A2-4 ([WP5_UX2_REVIEW2](WP5_UX2_REVIEW2.vi.md)); từ vòng đổi giao diện 3: R-UX3B-1, R-UX3B-2, R-UX3B-5..R-UX3B-7 ([WP5_UX3_REVIEW_B](WP5_UX3_REVIEW_B.vi.md)); phần còn lại của R-A2-1 và các rủi ro A2 R3, R5, R7 ([WP5_UX3_REVIEW_A2](WP5_UX3_REVIEW_A2.vi.md)); R-B2-2, R-B2-3, R-B2-5 ([WP5_UX3_REVIEW_B2](WP5_UX3_REVIEW_B2.vi.md)); R-INT-1..R-INT-4 ([WP5_UX3_REVIEW_INT](WP5_UX3_REVIEW_INT.vi.md)); và các mục backlog quản trị R3-R5 và R8 của [GOV_UX3_REVIEW2](GOV_UX3_REVIEW2.vi.md).
- Câu hỏi tùy chọn cho chủ sở hữu WP5-UX2-Q3 (nhãn của kỳ mà Today mở ra trong năm ngày của cửa sổ) đã được câu trả lời G-5 (b) của vòng 3 thay thế: kỳ đó hiện nhãn "in progress". Không còn gì mở về việc này.

## 11. Mục lục bằng chứng

`handoff/delivery/evidence/WP5-UX5-T06/` (các mẫu hiện hành, mục 3): `msg-01` đến `msg-11` (tiêu đề, header, nội dung của từng thư đã capture: sáu bản nộp và năm thông báo); `pdf-text-04`, `-05`, `-07`, `-08`, `-10`, `-11`; `pilot-04`, `-05`, `-07`, `-08`, `-10`, `-11` `...-p1-synthetic.png` (sáu ảnh render PDF); `sample-index.txt` (số trang và kiểm hash của từng PDF); `04-make-samples.txt` (log chạy tạo mẫu, kèm các bản ghi gửi và lượt gửi); `05-extract.txt`; `06-ready-check.txt` (health và readiness của server đã build ở chế độ capture, schema 15); `00-base.txt`; `01-commands.txt` (lệnh và exit); các script tạo mẫu dạng `make-samples.mjs.txt`, `extract.mjs.txt` và `ready-check.mjs.txt`; cùng các bản ghi parity, preflight và quyền riêng tư của tác vụ.

`handoff/delivery/evidence/WP5-PILOT/` (các mẫu cũ của `74d5bfe`, chỉ giữ làm lịch sử; chúng không còn đại diện cho sản phẩm): `msg-01` đến `msg-08` (tiêu đề, header, nội dung của từng thư đã capture); `pdf-text-03`, `-04`, `-07`, `-08`; `pilot-03`, `-04`, `-07`, `-08` `...-p1-synthetic.png` (bốn ảnh render PDF); `sample-index.txt`; `03-make-samples.txt` (log chạy tạo mẫu); `04-extract.txt`; `05-ready-check.txt` (health và readiness của server đã build ở chế độ capture); các script tạo mẫu dạng `make-samples.mjs.txt`, `extract.mjs.txt` và `ready-check.mjs.txt`; cùng các bản ghi digest, precommit và preflight của tác vụ.
