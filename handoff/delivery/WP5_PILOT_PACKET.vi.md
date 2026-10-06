# Gói pilot WP5

Đây là gói cụ thể để chủ sở hữu xem xét trước khi cho phép gửi thật. Bản tiếng Anh là bản chuẩn; [WP5_PILOT_PACKET.md](WP5_PILOT_PACKET.md) là bản gốc, tệp này là bản dịch. Các quy tắc áp dụng nằm ở [06 Nghiệm thu](../../docs/06_TEST_AND_ACCEPTANCE.vi.md), [07 Vận hành](../../docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md), [05 Nộp bài](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md), [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) (mục 13 đến 16) và [ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md).

**Trạng thái: phần mềm sẵn sàng, pilot đang chờ. NAS CHƯA ĐƯỢC XÁC MINH (NOT VERIFIED). Chưa gửi email thật nào, chưa triển khai gì và chưa ai yêu cầu hay cấp phép.**

## 0. Cách dùng gói này

- **Bản được theo dõi trong git chỉ chứa placeholder và mẫu tổng hợp** (repository là công khai; quy tắc 4 của AGENTS). Sao chép tệp này ra một nơi riêng ngoài git và ghi giá trị thật ở đó. Tên máy chủ thật, địa chỉ, thông tin đăng nhập SMTP, chữ ký và dữ liệu cá nhân không bao giờ vào bản trong git, chat, ảnh chụp màn hình hay log. Khuyến nghị; quyết định của chủ sở hữu đang chờ (D-11).
- Placeholder viết dạng `<như-này>`. Các placeholder dùng ở đây: `<nas-host>`, `<sender-address>`, `<owner-address>`, `<payroll-address>`, `<proxy-ip>`, `<release-commit>`, `<source-digest>`, `<image-id>`, `<backup-name>`, `<manifest-sha256>`, `<activation-instant-utc>` và các placeholder của runbook (`<compose>`, `<cli>`, `<env-file>`, `<data-dir>`, `<backup-dir>`, `<restore-dir>`).
- Mọi ô `[ ]` dưới đây cố ý để trống. Chỉ chủ sở hữu tick ô, và chỉ cho việc chính chủ sở hữu đã làm hoặc đã quyết định.
- Bốn sự kiện luôn được tách riêng: phần mềm sẵn sàng, quyền của chủ sở hữu, nhà cung cấp chấp nhận và người nhận đã nhận ([06 Nghiệm thu](../../docs/06_TEST_AND_ACCEPTANCE.vi.md)).

### Định danh bản phát hành của gói này

| Trường | Giá trị |
|---|---|
| Commit phát hành (đóng băng package-final của WP5) | `74d5bfec6700126da4105b5d97f5efe943f896f5` (= `origin/main` lúc tạo gói) |
| Source digest (`npm run digest`, không tính `handoff/`) | `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 tệp; tính lại trước và sau tác vụ này, không đổi |
| Phiên bản trong `package.json` | `0.1.0` (không định danh bản phát hành; commit và digest mới định danh) |
| Image ID tham chiếu (bản build drill của WP5-GATE, máy trạm phát triển, `linux/amd64`, 110.002.055 byte) | `sha256:0addd2000b422846badb99ea72003d4a883dc418b7b5f8c2c6d53acb66189fd8` |
| Image ID build trên NAS | `<image-id>` (chủ sở hữu ghi lại lúc build, [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) mục 1 bước 8; build lại cùng mã nguồn cho ID khác) |
| Tuyên bố phát hành | chưa tuyên bố, không có tag; khuyến nghị tuyên bố khi chủ sở hữu cho phép pilot; quyết định của chủ sở hữu đang chờ (D-14) |

Image ID tham chiếu là image drill của gate trên máy trạm phát triển. Nó không phải image trên NAS, và image đó đã được xóa sau gate. Nếu bất kỳ tệp nào ngoài `handoff/` thay đổi thì commit và digest đổi, và định danh này phải được làm mới.

Bằng chứng của gói nằm ở `handoff/delivery/evidence/WP5-PILOT/` (mục lục ở mục 11).

## 1. URL

| Mục | Placeholder | Cấu hình ở đâu |
|---|---|---|
| Host HTTPS công khai | `https://<nas-host>/` | DNS, chứng chỉ và reverse proxy của Synology (do chủ sở hữu kiểm soát) |
| `PUBLIC_BASE_URL` | `https://<nas-host>` (chỉ https trong production, không path, query hay fragment) | `<env-file>` |
| `APP_ORIGINS` | `https://<nas-host>` (origin trình duyệt chính xác, ngăn cách bằng dấu phẩy) | `<env-file>` |
| `TRUSTED_PROXY_ADDRESSES` | `<proxy-ip>` (đúng địa chỉ mà ứng dụng thấy là peer kết nối của proxy; không CIDR, không tên host) | `<env-file>` |

Các bước kiểm tra. Mỗi bước là **[owner NAS step, unverified]**; tick và ghi ngày trên NAS.

- [ ] `https://<nas-host>/api/ready` trả 200 với `{"status":"ready","schema":{"expected":N,"actual":N},"data_dir_writable":true}` và không gì khác. `https://<nas-host>/api/health` trả 200 `{"status":"ok"}`. Quan sát trên máy phát triển (server đã build, chế độ capture, cổng loopback, `evidence/WP5-PILOT/05-ready-check.txt`): `/api/health` 200 `{"status":"ok"}`, `/api/ready` 200 với schema 13 expected và actual, `data_dir_writable` true.
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
| Người nhận (To, Cc) | `to`, `cc` của cài đặt nộp bài | Settings của từng user (không phải env) | Theo từng user. `<payroll-address>` và `<owner-address>` bên dưới. |
| Template tiêu đề và nội dung | `subject_template`, `body_template` | Settings của từng user | Biến: `{EmployeeName}`, `{PeriodStart}`, `{PeriodEnd}`, `{PayrollDate}`, `{SignOffStatus}`, `{SubmissionId}`, `{Revision}`. Biến lạ bị từ chối. |

Đổi người nhận không tác động đến revision đã có: phong bì thư thay đổi cần một revision mới đã được review ([05 Nộp bài](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Corrections and resends"). Đặt người nhận của kỳ đầu tiên trước khi sign-off.

### Tự kiểm tra ở chế độ capture (trước khi gửi thật)

Làm theo runbook mục 13 bước 2 trên NAS. **[owner NAS step, unverified]**

- [ ] `OUTBOUND_MODE=capture` và `PRODUCTION_SENDING_ENABLED` chưa đặt; trạng thái quản trị hiện "Outbound mode: Capture only (nothing leaves the server)" và kích hoạt "Not activated", và `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` in ra `0` (trạng thái không có trường nào cho cờ).
- [ ] Với hai tài khoản tổng hợp của [07 Vận hành](../../docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md) "Setup sequence" (địa chỉ ở `example.invalid`), sign-off và nộp một kỳ tổng hợp. Thư mục capture (`mail-capture` dưới `/data/private-data`) chứa đúng người nhận đã cấu hình và nội dung đã đóng băng, cùng một PDF có SHA-256 bằng bản tải PDF. Không có gì rời khỏi NAS.
- [ ] Cài đặt nộp bài của tài khoản chủ sở hữu và của mọi tài khoản khác sẽ tồn tại đã được lưu, các tài khoản tổng hợp đã bị vô hiệu hóa, và không tài khoản nào bật auto-submit.
- [ ] Trạng thái quản trị không có job gửi nào đang queued hay leased.

Tương đương trên máy phát triển là mục 3: tám thư được capture từ bản build đã gate với user tổng hợp, mỗi PDF khớp hash đã ghi.

### Lần gửi thật đầu tiên

Khuyến nghị; quyết định của chủ sở hữu đang chờ (D-12): kỳ đầu tiên được ký tay, auto-submit tắt, không đặt activation instant, và lần gửi thật đầu tiên đi đến địa chỉ riêng của chủ sở hữu.

| Trường | Giá trị (chỉ ở bản riêng) |
|---|---|
| To của lần gửi thật đầu tiên | `<owner-address>` |
| Cc | không |
| Người nhận payroll của revision sau | `<payroll-address>` (quyết định cùng chủ sở hữu việc payroll nhận thư của kỳ đầu hay của một revision sau; runbook mục 13 bước 6) |

## 3. Mẫu email và PDF

Mọi mẫu được tạo từ bản export `git archive` sạch của commit `74d5bfe` (bản đóng băng đã qua gate), build bằng `npm ci` và `build:server`, dùng các service và job handler production, đồng hồ cố định, chế độ capture và user tổng hợp ở `example.invalid`. `PRODUCTION_SENDING_ENABLED` chưa bao giờ được đặt và không gửi gì cả. Lịch là lịch seed tổng hợp: kỳ 2026-09-14 đến 2026-09-27, ngày payroll 2026-10-02, múi giờ báo cáo `America/Los_Angeles`. Ngày thật sẽ khác.

Mỗi thư lưu thành một `.txt` (tiêu đề, header thô, nội dung đã giải mã, thông tin PDF), và mỗi trang PDF thành một ảnh `*-synthetic.png`. Mọi ảnh đều đã được xem sau khi tạo. Mỗi PDF có một trang; hash đã lưu khớp tệp đính kèm đã capture.

| # | Mẫu | Tệp thư | Ảnh PDF | SHA-256 của PDF |
|---|---|---|---|---|
| S1 | Sign-off thủ công, revision gốc 1, ảnh chữ ký, ký 2026-09-28 23:30 giờ địa phương | `msg-03-submission-payroll-manual-rev1.txt` | `pilot-03-submission-payroll-manual-rev1-p1-synthetic.png` | `43ed65038bfe305727b40d7b2162df2ba2aacaecd75a863372aee9d0a7b70221` |
| S2 | Hiệu chỉnh thủ công, revision 2, gửi mail theo lựa chọn rõ ràng của chủ sở hữu | `msg-08-submission-payroll-manual-rev2.txt` | `pilot-08-submission-payroll-manual-rev2-p1-synthetic.png` | `52bc10c58f10e4d7cdca56b757eff885ebb0a088aeafb3737896ea6544e2993f` |
| S3 | Nộp tự động, dòng ghi chú tắt, đã ủy quyền ảnh | `msg-07-submission-payroll-auto-off-rev1.txt` | `pilot-07-submission-payroll-auto-off-rev1-p1-synthetic.png` | `0c30201bce796acb0d78bcfbbe8ff477ba4da04971e87fc2803a54f32c787204` |
| S4 | Nộp tự động, dòng ghi chú bật (chữ mặc định "Automatic submission"), đã ủy quyền ảnh | `msg-04-submission-payroll-auto-on-rev1.txt` | `pilot-04-submission-payroll-auto-on-rev1-p1-synthetic.png` | `2c6af3a649a4392202c8ae21902e43c2f71969dd5b23349d7a191f2ee4ec508f` |
| N1, N2 | Nhắc nhở gửi nhân viên ("due in about 18 hours"), mỗi tài khoản tự động một thư | `msg-01-...txt`, `msg-02-...txt` | không có | không có |
| N3, N4 | Thông báo kết quả gửi nhân viên sau nộp tự động | `msg-06-...txt` (ghi chú tắt), `msg-05-...txt` (ghi chú bật) | không có | không có |

Văn bản của từng trang PDF: `pdf-text-<n>-...txt`. Chỉ mục kèm các kiểm tra là `sample-index.txt`.

### Các mẫu cho thấy gì

- **Email gửi payroll.** Từ người gửi, To là người nhận đã cấu hình của user, Cc là địa chỉ cc đã cấu hình, không có Bcc, PDF đính kèm tên `timesheet-<payroll-date>-r<n>.pdf`, có phần plain-text và HTML. Nội dung mặc định: "Hello, Attached is the timesheet of `{EmployeeName}` for `{PeriodStart}` to `{PeriodEnd}` (payroll date `{PayrollDate}`). Status: `{SignOffStatus}`. Submission `{SubmissionId}`, revision `{Revision}`."
- **Thủ công (S1).** Tiêu đề và dòng trạng thái ghi "Submitted". PDF in tên nhân viên, ảnh chữ ký và ngày sign-off thật theo múi giờ báo cáo (09/28/2026, dù theo UTC là 09/29).
- **Hiệu chỉnh thủ công (S2).** Revision mới là một thư và PDF riêng với "Revision 2" cùng giờ kết thúc Chủ nhật đã sửa và tổng OT (17:00 h:mm thay vì 16:30). Nội dung thư không nói đây là hiệu chỉnh ("Status: Submitted"). Chủ sở hữu quyết định payroll có cần điều này được nêu trong template hay trong thư kèm theo.
- **Tự động, ghi chú tắt (S3).** Tiêu đề và trạng thái ghi "Submitted", giống hệt bản thủ công. PDF có tên, ảnh đã ủy quyền và ngày nộp tự động (09/29/2026, ngày địa phương của lượt chạy hạn nộp), và không có chỉ báo tự động.
- **Tự động, ghi chú bật (S4).** Chữ ghi chú thay cho trạng thái trong tiêu đề và nội dung ("Automatic submission") và in thành một dòng dưới tiêu đề PDF. Đây là khác biệt duy nhất so với S3. Revision được ghi vẫn là tự động, review đang chờ, `signed_at` rỗng và không có sign-off; màn hình của chính nhân viên và thông báo kết quả (N3, N4) nói rõ điều đó.
- **Thông báo.** Nhắc nhở và thông báo kết quả chỉ gửi nhân viên, có header `Auto-Submitted: auto-generated`, nêu hạn nộp theo múi giờ báo cáo và kèm liên kết yêu cầu đăng nhập; N3 và N4 nói review đang chờ.
- **Giới hạn đã biết thấy được trong mẫu** (xem [ghi chú phát hành](../../docs/12_RELEASE_NOTES.vi.md)): ngày không có bản ghi in "Worked" không giờ trên PDF tự động (R-WA8; quyết định F-1 và F-Q1 của chủ sở hữu); nghỉ một phần không được in (R-WA2); nhãn ngày lễ dài bị cắt bằng dấu ba chấm (WP3 R1). Dữ liệu mẫu ở đây không có nhãn ngày lễ hay nghỉ phép.

### Phê duyệt nội dung (chủ sở hữu)

Văn bản template cuối cùng, lựa chọn dòng ghi chú và việc có đặt ảnh vào các bản nộp tự động hay không là đầu vào của chủ sở hữu. Chủ sở hữu phê duyệt nội dung chính xác sau khi xem bản xem trước thật ở chế độ capture trên host.

- [ ] Văn bản template tiêu đề và nội dung đã duyệt (hoặc đã sửa): ______
- [ ] Dòng ghi chú: tắt / bật với chữ: ______
- [ ] Ảnh chữ ký trên bản nộp tự động: đã ủy quyền / không ủy quyền
- [ ] Cách nêu việc hiệu chỉnh trong thư revision 2: chấp nhận như hiện tại / yêu cầu đổi: ______
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
| Nhắc nhở | cài đặt nộp bài của user | trước hạn 24 giờ và 2 giờ, cảnh báo quá hạn khi auto-submit tắt, thông báo kết quả sau nộp tự động | bản riêng |
| Auto-submit | cài đặt nộp bài của user | bật là tùy chọn được lưu; không có gì tự động trước activation instant. Khuyến nghị cho kỳ đầu: tắt (D-12) | bản riêng |
| Dòng ghi chú | cài đặt nộp bài của user | tắt; chữ "Automatic submission" | bản riêng |
| Ủy quyền ảnh tự động | lúc tải chữ ký, một ủy quyền riêng có audit (thu hồi được trong Settings) | chọn sẵn lúc tải lên; nếu bỏ chọn thì không có ảnh trên bản nộp tự động | bản riêng |
| Người nhận, template | cài đặt nộp bài của user | mục 2 | bản riêng |
| Số dư đầu kỳ | màn hình Import / `PUT /api/ot/opening-balance` | chưa có; một giá trị có dấu, khác 0, có bằng chứng, hoặc bắt đầu từ 0 (D-10) | bản riêng |
| Activation instant | `PUT /api/admin/automation/activation` từ console của quản trị viên đã đăng nhập (runbook mục 13 bước 5) | rỗng; chỉ đặt `<activation-instant-utc>` sau khi kỳ đầu đã được ký tay | bản riêng |
| Kỳ pilot đầu tiên | do chủ sở hữu chọn trên chu kỳ 14 ngày | các ngày payroll tiếp tục 2026-10-02 + 14 ngày (2026-10-16, 2026-10-30, 2026-11-13, ...); mỗi kỳ hạn nộp thứ Ba trước đó 17:00 múi giờ báo cáo. Placeholder `<first-payroll-date>` | bản riêng |

## 5. Bằng chứng khôi phục

### Số liệu trên máy phát triển (drill của WP5-GATE, không phải NAS)

Nguồn: drill container của gate, dữ liệu tổng hợp, chế độ capture, Docker Desktop trên máy trạm phát triển (`linux/amd64`), image `sha256:0addd2000b42...9fd8`. `npm run drill:container -- --wp3 <bản build trước>`: các giai đoạn 33, 31, 57, 35, 27 và 23 kiểm tra = 208 PASS, 0 FAIL (`handoff/delivery/evidence/WP5-GATE/07-drill.txt`).

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
| Commit phát hành | `74d5bfec6700126da4105b5d97f5efe943f896f5` |
| Source digest | `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba` |
| Image ID build trên NAS | `<image-id>` (bản build tham chiếu của gate: `sha256:0addd2000b422846badb99ea72003d4a883dc418b7b5f8c2c6d53acb66189fd8`) |
| Backup trước kích hoạt | `<backup-name>` (lấy ở runbook mục 13 bước 3) |
| Hash manifest của backup đó | `<manifest-sha256>` |
| Bản sao thiết bị riêng của backup và `<env-file>` chế độ capture | cất ở đâu (bản riêng) |
| Ngày kích hoạt | `<activation-instant-utc>` |

Các bước (văn bản đầy đủ ở runbook mục 14 và 15):

1. Hủy kích hoạt: nếu đã đặt activation instant thì xóa nó trước (lệnh console với `active_from: null` và một lý do); chờ đến khi không còn job gửi nào queued hay leased; trong `<env-file>` bỏ `PRODUCTION_SENDING_ENABLED`, đặt `OUTBOUND_MODE=capture` và xóa các giá trị `SMTP_*`; `<compose> up --detach --force-recreate --no-build`; kiểm tra trạng thái hiện "Outbound mode: Capture only (nothing leaves the server)" và "Not activated", và `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` in ra `0`.
2. Giữ dữ liệu. Không bao giờ xóa `<data-dir>` hay `<backup-dir>`. Không bao giờ chạy hai hàng đợi.
3. Quay về workbook Excel cho kỳ đó (bản riêng của chủ sở hữu).
4. Thư đã gửi không thu hồi được; đọc lịch sử gửi để tránh nhập hai lần. Một kỳ nộp nhầm vẫn nằm trong hồ sơ và được sửa bằng hiệu chỉnh có lý do.
5. Chỉ khôi phục khi dữ liệu hỏng hoặc sai, không bao giờ ghi đè lên dữ liệu live: kiểm tra hash manifest với `<manifest-sha256>`, khôi phục `<backup-name>` cô lập (biểu mẫu mục 5) và đối soát.
6. Quy tắc tồn dư (khuyến nghị; quyết định của chủ sở hữu đang chờ (D-1)): sau rollback về schema cũ, bản build cũ chạy với `JOB_RUNNER=off` đến khi đối soát xong. Điều này chỉ quan trọng sau một nâng cấp về sau có thêm migration.

## 7. Định danh bản phát hành và danh mục kiểm tra NAS

Định danh bản phát hành: bảng ở mục 0. NAS **CHƯA ĐƯỢC XÁC MINH (NOT VERIFIED)** cho đến khi chủ sở hữu tick mọi mục dưới đây và ghi ngày. Đến lúc đó kết quả là "software ready, pilot pending" (khuyến nghị; quyết định của chủ sở hữu đang chờ (D-13)). Mọi mục là **[owner NAS step, unverified]**, sao từ [runbook](../../docs/11_OPERATIONS_RUNBOOK.vi.md) mục 2.

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

Cả mười lăm quyết định vẫn đang chờ: không quyết định nào được trả lời trong `owner_decisions` của board. Nguồn: [WP5-PLAN](tasks/WP5-PLAN.md) mục D. D-1, D-7, D-8 và D-13 phải được trả lời trước khi kích hoạt. Câu trả lời khác mặc định hiện tại của D-3, D-5, D-6 hoặc D-8 gây ra một vòng sửa (sửa, đóng băng, gate, audit độc lập) trước khi kích hoạt, và định danh phát hành ở mục 0 và 6 khi đó được làm mới. Tùy chọn (b) được khuyến nghị của D-8 khác mặc định hiện tại.

| ID | Quyết định | Khuyến nghị (và lý do) | Câu trả lời hiện tại |
|---|---|---|---|
| D-1 (R-A3) | Job tạo sau khi rollback về schema cũ không bị giữ | (a) giữ quy tắc đã ghi: bản build cũ chạy với `JOB_RUNNER=off` đến khi đối soát xong. Pilot là lần cài đầu tiên nên không có schema production cũ; (b) sẽ khiến công cụ restore đổi trạng thái nghiệp vụ | đang chờ |
| D-2 (WP4-I-1) | Kỳ draft của ứng dụng có được nhận ngày import không | (a) không bao giờ, hiện tại; lựa chọn an toàn nhất và không phải đổi code | đang chờ |
| D-3 (WP4-I-2) | "Off day (overtime used)" khi import | (b) import thành Off không ảnh hưởng ledger nếu import lịch sử trước pilot; nếu không thì giữ (a) bỏ qua và quyết định sau pilot | đang chờ |
| D-4 (WP4-I-3) | Import kỳ chưa kết thúc | (a) không, hiện tại; lịch sử import giữ đầy đủ và chỉ đọc | đang chờ |
| D-5 (WP4-I-4) | Sửa số dư đầu kỳ nhập sai về tổng bằng 0 | (a) có, bằng một hiệu chỉnh bù trừ có lý do, nếu có ghi số dư đầu kỳ lúc bắt đầu pilot | đang chờ |
| D-6 (WP4-I-5) | Hạn mức cho các bản xem trước import chưa commit | (a) tối đa 20 mỗi người, sau pilot với pilot chỉ chủ sở hữu; trước pilot nếu có người khác tham gia | đang chờ |
| D-7 (F-7) | Nhắc nhở sau sự cố crash trên SMTP thật có thể lặp một lần | (a) chấp nhận at-least-once; mất một nhắc nhở có thể gây lỡ hạn | đang chờ |
| D-8 (F-7) | Lỗi chứng chỉ TLS được phân loại tạm thời (thử lại, rồi can thiệp) | (b) coi là lỗi cấu hình vĩnh viễn, hiện ngay, tùy theo đánh giá; nếu không thì giữ (a) và ghi tài liệu | đang chờ |
| D-9 (E-11, F-7) | Nhóm pilot và mật khẩu (không có tự đổi mật khẩu) | (a) pilot chỉ chủ sở hữu, mật khẩu tạm đặt ngoài kênh; (b) thêm route đổi mật khẩu trước khi có người khác tham gia | đang chờ |
| D-10 | Số dư đầu kỳ và lịch sử lúc bắt đầu pilot | ghi một số dư đầu kỳ có bằng chứng, hoặc bắt đầu từ 0; bỏ qua import lịch sử cho pilot | đang chờ |
| D-11 | Giá trị pilot thật nằm ở đâu | (a) gói trong git với placeholder, giá trị thật ở bản riêng của chủ sở hữu ngoài git; repository là công khai | đang chờ |
| D-12 | Phân giai đoạn lần kích hoạt thật đầu tiên | (a) kỳ đầu: sign-off tay với gửi thật, lần gửi thật đầu đến địa chỉ riêng của chủ sở hữu, auto-submit tắt và không có activation instant; bật tự động từ kỳ sau | đang chờ |
| D-13 | Host pilot | (a) NAS sau runbook mục 1, 2, 4 và 6; NOT VERIFIED đến khi chủ sở hữu tick danh mục | đang chờ |
| D-14 | Tuyên bố phát hành đầu tiên (`git.release_declared`) | (a) khi chủ sở hữu cho phép pilot; các bản sửa sau theo quy tắc nhánh và pull request. Agent không tạo tag | đang chờ |
| D-15 (F-Q6) | Quyền riêng tư của xem trước ngày nghỉ | (a) giữ việc bỏ số đếm theo ngày; không ảnh hưởng pilot chỉ chủ sở hữu | đang chờ |

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
- [ ] Bản phát hành đầu tiên được tuyên bố khi cho phép này (D-14): có / không

Chữ ký của chủ sở hữu hoặc tham chiếu đến hồ sơ riêng của chủ sở hữu: ______   Ngày và thời điểm UTC: ______

Sau lần gửi thật đầu tiên, ghi riêng nhà cung cấp chấp nhận và người nhận đã nhận (sự kiện 3 và 4); thư đã được chấp nhận mà không bao giờ đến là vấn đề của nhà cung cấp hay hộp thư, không phải kết quả của ứng dụng. Có gì bất thường: hủy kích hoạt (mục 6). Sau pilot, theo dõi một kỳ thật với Excel còn dùng để so sánh ([06 Nghiệm thu](../../docs/06_TEST_AND_ACCEPTANCE.vi.md)).

## 10. Giới hạn của gói này

- Các mẫu đến từ chế độ capture trên máy trạm phát triển. Hành vi SMTP thật, NAS, reverse proxy, chứng chỉ và bản sao thiết bị riêng chưa được quan sát cho đến khi chủ sở hữu chạy các bước trên.
- Lịch, tên và ngày của mẫu là tổng hợp. Không có tên host, địa chỉ, thông tin đăng nhập, chữ ký hay dữ liệu cá nhân thật nào trong gói được theo dõi hay bằng chứng của nó.
- Mục 4 liệt kê mặc định đã ghi, không phải lựa chọn của chủ sở hữu; giá trị của chủ sở hữu không được biết ở đây.
- Image ID tham chiếu thuộc một bản build đã bị xóa sau gate; bản build trên NAS ghi ID riêng của nó.

## 11. Mục lục bằng chứng

`handoff/delivery/evidence/WP5-PILOT/`: `msg-01` đến `msg-08` (tiêu đề, header, nội dung của từng thư đã capture); `pdf-text-03`, `-04`, `-07`, `-08`; `pilot-03`, `-04`, `-07`, `-08` `...-p1-synthetic.png` (bốn ảnh render PDF); `sample-index.txt`; `03-make-samples.txt` (log chạy tạo mẫu); `04-extract.txt`; `05-ready-check.txt` (health và readiness của server đã build ở chế độ capture); các script tạo mẫu dạng `make-samples.mjs.txt`, `extract.mjs.txt` và `ready-check.mjs.txt`; cùng các bản ghi digest, precommit và preflight của tác vụ.
