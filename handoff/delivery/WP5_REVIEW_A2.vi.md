# WP5 khu vực A, lần 2 — kiểm tra lại phần thay đổi về quy trình tích hợp, nộp bảng công và quyền riêng tư trên bản đóng băng cuối gói

Biểu mẫu: [REVIEW](../templates/REVIEW.vi.md). Bản gốc tiếng Anh (có giá trị pháp lý): [WP5_REVIEW_A2.md](WP5_REVIEW_A2.md). Prompt đánh giá: [WP5_REVIEW](../prompts/WP5_REVIEW.vi.md); brief giao việc và hồ sơ tác vụ: [WP5-ASSESS-A](tasks/WP5-ASSESS-A.md), mục "Attempt 2 (coordinator note)". Đánh giá trước được giữ nguyên: [WP5_REVIEW_A](WP5_REVIEW_A.vi.md) (lần 1, PASS tại `546cdda`). Bằng chứng: `handoff/delivery/evidence/WP5-ASSESS-A2/` (đã che, xuống dòng LF; mã probe và script dạng `*.mjs.txt` và `*.sh.txt`; mục lục `00-README.txt`).

- **Gói/ngày/người đánh giá và mô hình/mức nỗ lực quan sát được:** WP5, khu vực A, lần 2: kiểm tra lại phần thay đổi, gắn với digest, trên bản đóng băng cuối gói WP5. 2026-10-06, từ 21:53 đến khoảng 22:30 UTC. Người đánh giá: một subagent timesheet-auditor mới, tự báo mô hình `claude-opus-5-5`; mức nỗ lực và tốc độ không quan sát được từ bên trong phiên.
- **SHA commit được đánh giá và digest mã nguồn; commit chưa đẩy; mức đầy đủ của mã nguồn:**
  - Commit được đánh giá `74d5bfec6700126da4105b5d97f5efe943f896f5`, là `freeze_commit` của WP5-GATE. HEAD = `origin/main` = `74d5bfe` trước và sau; không có commit chưa đẩy.
  - Digest mã nguồn `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba` trên 779 tệp (không tính `handoff/`), bằng digest cổng đã ghi. Ghi trước (21:54 UTC) và sau mọi lần chạy (22:12 UTC) ở ba dạng: `scripts/source-digest.mjs` trong kho, dạng `git ls-tree` của HEAD và của `74d5bfe`, và bản xuất sạch (`00-baseline.txt`, `99-digest-after.txt`). Mốc so sánh `546cdda` cho `26fcc969…` ở dạng `git ls-tree`, như lần 1 đã ghi.
  - Mã nguồn đầy đủ: `git archive 74d5bfe` vào thư mục tác vụ. Digest của bản xuất là `0a64a75f…` trước và sau mọi lần chạy, và danh sách thay đổi ngoài phần bỏ qua của nó rỗng sau mọi lần chạy.
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **FIX REQUIRED** (hai phát hiện tài liệu mức Low trong các mục pilot mới của docs/11).
  - Không có mã nguồn ứng dụng, migration, script, gói phụ thuộc hay hành vi Compose nào thay đổi kể từ `546cdda`. Mọi kết luận của lần 1 vẫn đúng, và mọi lần chạy khu vực A trên bản đóng băng đều đạt (bên dưới).
  - Test AC-13 mới khẳng định các mục kịch bản của lần 1, có tính tất định (ba lần chạy, bốn múi giờ máy, hai đồng hồ thật bị dịch), và thất bại dưới cả hai đột biến tôi áp dụng.
  - Hai bước trong sổ tay kích hoạt và hủy kích hoạt pilot (docs/11 mục 13 và 14, EN và VI) bảo người vận hành xác nhận những điều sản phẩm không hiển thị: cờ gửi thật trong trạng thái quản trị, và một link sâu trong lần tự kiểm tra ở chế độ capture. Cả hai được tái hiện bên dưới và có cách sửa câu chữ trong phạm vi hẹp. Không tìm thấy lỗi nào của phần mềm về tính toàn vẹn, quyền riêng tư hay việc nộp.
- **Phạm vi thực sự đã xem/chạy:**
  - Đã đọc: AGENTS.md (từ đĩa), brief và ghi chú lần 2, kết quả lần 1 và WP5_REVIEW_A, kết quả của WP5-FIXB, WP5-AC13, WP5-REL và WP5-GATE, WP5_REVIEW, WP5-PLAN mục A, B, F và G, docs/05 và docs/06 (AC-13, AC-14, AC-16), docs/07 "Trình tự setup", và toàn bộ phần thay đổi: docs/11 và docs/12 (EN và VI), `.env.example`, `compose.example.yaml`, README, test AC-13 và tệp hỗ trợ của nó.
  - Mã đã đọc để kiểm các khẳng định trong tài liệu: `config.ts` (chế độ gửi, cờ, khóa SMTP), `services/automation.ts` (kích hoạt, điều kiện), `services/notifications.ts` và `jobs/reminderJob.ts` (cổng kích hoạt, link sâu), `mail/message.ts`, `mail/smtpAdapter.ts` (mã lỗi), `mail/captureAdapter.ts`, `jobs/sendJob.ts`, `jobs/runner.ts` (chu kỳ, thứ tự quét), `services/operationsStatus.ts`, `routes/admin.ts`, `client/components/OperationsStatus.tsx` và `deliveryModel.ts`, `services/signatures.ts`, các route đứng sau mọi định danh bị tráo trong test, `tests/support/testApp.ts` và `concurrency.ts`.
  - Đã chạy trên bản xuất sạch: `npm ci`, `npm run verify`, `npm run test:e2e` (hai lần, xem bên dưới), riêng test AC-13 (3 lần, 4 múi giờ, 2 đồng hồ thật), hai đột biến trong một bản sao nháp riêng, một script so khớp EN/VI, và probe HTTP của tôi (`probe.mjs`) trên cổng 47702 và 47703.
  - Môi trường: Git Bash, Node v24.21.0 bản portable gọi theo đường dẫn đầy đủ, npm 11.18.0, script npm chạy bằng Git Bash (không có `cmd.exe`). `DATA_DIR` và `DATABASE_PATH` trong thư mục tác vụ cho mọi lần chạy. Không dùng Docker. Chỉ chế độ capture; không bao giờ đặt `PRODUCTION_SENDING_ENABLED`; không gửi gì. WP5-PILOT chạy trên cùng máy suốt phiên.
- **Bảng bằng chứng:**

| Lệnh | Kết quả / mã thoát | Bằng chứng |
|---|---|---|
| `git rev-parse`; `scripts/source-digest.mjs`; digest `git ls-tree` của HEAD, `74d5bfe` và `546cdda`; digest bản xuất; trước và sau | HEAD = `origin/main` = `74d5bfe`; `0a64a75f…` (779) ở mọi dạng, cả hai lần; mốc `26fcc969…`; danh sách thay đổi của bản xuất rỗng | `00-baseline.txt`, `99-digest-after.txt` |
| `git log`, `git diff --name-status --stat 546cdda 74d5bfe -- . ':!handoff'`, đường dẫn theo từng commit | 10 đường dẫn trong 3 commit; không có đường dẫn nào trong `src/`, `migrations`, `scripts/`, tệp gói, Dockerfile hay tệp cấu hình | `01-delta.txt` |
| `npm ci` (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | thoát 0, 161 gói, lockfile không đổi (`cmp` với kho: bằng nhau), 0 dòng deprecation | `02-npm-ci.txt` |
| `npm run verify` (`SMOKE_PORT=47701`) | thoát 0: typecheck, lint, 77 tệp / 1.759 test, build, `SMOKE PASSED` (41 kiểm tra), 0 dòng deprecation | `03-verify.txt` |
| `npm run test:e2e`, lần 1 | thoát 1: 144 đạt, 1 lỗi, 5 bỏ qua. Lỗi là một lỗi console `net::ERR_NO_BUFFER_SPACE` trước khi đăng nhập trong `submission.spec.ts:62` (desktop) | `04-e2e-run1.txt` |
| `npm run test:e2e`, lần 2 (chạy lại một lần, theo quy tắc chung WP5-PLAN mục B) | thoát 0: 145 đạt, 5 bỏ qua, 4,0 phút, 0 dòng deprecation | `04-e2e-run2.txt`, `04-e2e-load-before-run2.txt` |
| Riêng test AC-13, 3 lần | mỗi lần thoát 0; test 1.723 / 1.746 / 1.906 ms; thời gian thực 4,23 / 4,03 / 4,24 s | `06-ac13-run1..3.txt` |
| Test AC-13, múi giờ máy đặt lúc chạy (preload `settz.mjs`): Asia/Tokyo, Pacific/Kiritimati, Etc/UTC, America/New_York | mỗi lần thoát 0; dòng "Start at" của vitest hiện giờ địa phương của từng múi | `06-ac13-zone-*.txt` |
| Test AC-13, đồng hồ thật dời tới 2027-01-20T12:00Z và 2025-06-15T12:00Z (preload `shiftnow.mjs`) | mỗi lần thoát 0 | `06-ac13-now-*.txt` |
| `TZ=Pacific/Kiritimati` đặt từ Git Bash | không có hiệu lực: Node báo `America/Los_Angeles` (xem rủi ro R-A2-3) | `06-ac13-tz-env-not-applied.txt` |
| Đột biến trong bản sao nháp (`git archive 74d5bfe` + `npm ci`, ngoài kho) | bản đối chứng thoát 0; đột biến 1 thoát 1; đột biến 3 thoát 1; cả hai tệp đã khôi phục và bằng bản xuất | `07-mutation.txt` |
| So khớp EN/VI của docs/11, docs/12 và README | tiêu đề, bước, gạch đầu dòng, khối mã, ô đánh dấu và dòng bảng bằng nhau; token khu vực A bằng nhau (hai khác biệt là văn xuôi đã dịch) | `05-parity.txt` |
| `node probe/probe.mjs`, lần 2 (lần chính thức) | thoát 0: 26 PASS, 0 FAIL | `08-probe-log-run2.txt`, `probe.mjs.txt`, `lib.mjs.txt` |
| `node probe/probe.mjs`, lần 1 | 22 PASS, 4 FAIL, đều do lỗi probe (sai đường dẫn JSON), đã sửa trong probe | `08-probe-run-history.txt`, `08-probe-log-run1.txt` |
| `netstat -ano`, `ps -W` ở cuối | không có cổng lắng nghe trong 47700–47719; không còn tiến trình Node portable nào của tác vụ này | `98-process-listing.txt` |
| `scripts/precommit-check.mjs` trên các tệp của tác vụ này, stage trong một git dir riêng ngoài kho | xem hồ sơ tác vụ | `97-precommit.txt` |

- **Phát hiện:**

| ID | Mức | Tệp / vị trí | Cách tái hiện | Mong đợi / thực tế | Quy tắc / AC | Cách sửa trong phạm vi hẹp |
|---|---|---|---|---|---|---|
| WP5-A2-01 | Low | `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md`: mục 13 bước 2 gạch đầu dòng thứ nhất (dòng 294), mục 13 bước 4 gạch đầu dòng thứ ba (dòng 318), mục 14 bước 4 (dòng 355) | Kiểm tra probe `OPS-2`: `GET /api/admin/operations` trả `operations.sender` = `{configured, outbound_mode}` và không có trường sender nào khác (`08-admin-operations.txt`). Màn hình (`OperationsStatus.tsx`, `StatusPanel`) chỉ hiện "Sender address" và "Outbound mode". Ở chế độ capture máy chủ không bao giờ đọc cờ (`config.ts`, `parseOutbound`) | Mong đợi: mỗi bước kiểm tra làm được đúng như viết. Thực tế: sổ tay nói trạng thái quản trị hiện "cờ tắt" hoặc "cờ bật"; không có trường hay dòng chữ nào như vậy. Khi hủy kích hoạt, một dòng `PRODUCTION_SENDING_ENABLED=true` còn sót trong `<env-file>` không thấy được từ trạng thái. Nếu sau này chế độ được chuyển lại sang `smtp`, việc gửi thật chỉ còn cần một thay đổi thay vì hai | Quy ước của docs/11 (mọi bước kiểm chứng được hoặc có nhãn); cổng cờ chỉ chủ sở hữu bật cho việc gửi thật (`config.ts`, quy tắc 6 của AGENTS, docs/07); AC-14 | Chỉ sửa tài liệu, EN và VI. Ở ba chỗ, ghi đúng điều trạng thái hiển thị: "Outbound mode: Capture only (nothing leaves the server)" hoặc "SMTP (real sending)". Máy chủ chỉ vào được chế độ SMTP khi có cờ. Ở mục 14 bước 3 hoặc 4, thêm một bước kiểm tra tệp rằng dòng cờ đã mất, ví dụ `grep -c '^PRODUCTION_SENDING_ENABLED=' <env-file>` in ra `0` |
| WP5-A2-02 | Low | `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md`: mục 13 bước 2 gạch đầu dòng thứ ba (dòng 296) | Kiểm tra probe `SELF-4`, `LINK-1`, `LINK-2`. Thư nộp đã capture không có URL nào (`mail/message.ts` không tạo link; nội dung thư trong `08-probe-log-run2.txt`). Khi chưa có thời điểm kích hoạt, `run-jobs` tại các thời điểm nhắc 24 giờ và 2 giờ và sau hạn không quyết định nhắc nhở, cảnh báo quá hạn hay thông báo kết quả nào: 0 occurrence, 0 thư capture (đầu tệp `notifications.ts`: không quyết định gì khi thời điểm kích hoạt còn null). Đối chứng dương: sau khi ghi thời điểm kích hoạt, mọi nhắc nhở đã capture đều mang `https://timesheet.example.invalid/#/review/<payroll-date>` | Mong đợi: bước kiểm tra trong lần tự kiểm tra làm được. Thực tế: trong lần tự kiểm tra ở chế độ capture không thư capture nào chứa link sâu. Kỳ đầu theo giai đoạn (D-12) cũng không có thời điểm kích hoạt, nên `PUBLIC_BASE_URL` chỉ được dùng lần đầu bởi một nhắc nhở thật sau khi bật tự động | docs/05 "Nhắc nhở và link xem xét" (link sâu yêu cầu đăng nhập); quy ước của docs/11 | Chỉ sửa tài liệu, EN và VI. Thay gạch đầu dòng bằng một bước kiểm tra làm được khi chưa kích hoạt: mở `https://<nas-host>/#/review/<payroll-date>` (dạng của mọi link nhắc nhở, `PUBLIC_BASE_URL` + `/#/review/<payroll-date>`); trang phải yêu cầu đăng nhập rồi mở màn hình xem xét. Thêm vào mục 13 bước 5 hoặc 7: kiểm tra link của nhắc nhở đầu tiên sau khi đặt thời điểm kích hoạt |

- **Các kiểm tra đã xác minh (phạm vi phần thay đổi của khu vực A, các mục 1–4 của ghi chú lần 2):**
  1. **Phần thay đổi kể từ `546cdda`** (`01-delta.txt`). Mười đường dẫn ngoài handoff trong ba commit. `e7fe514` chỉ chạm `handoff/`. Không có mã nguồn ứng dụng nào thay đổi.
     - WP5-FIXB `85838b5`:
       - `.env.example`: chỉ phần chú thích đầu tệp. Không khóa hay giá trị nào đổi; câu về quyền riêng tư (mode 600, không bao giờ vào git hay chat) giữ nguyên.
       - `compose.example.yaml`: ba dòng chú thích; hành vi Compose không đổi.
       - docs/11 các mục "Placeholder và quy ước", 1, 2, 4, 6, 7, 8 và 9 (EN, VI).
     - WP5-AC13 `8e99d2c`: `tests/integration/ac13-two-week.test.ts` và `ac13-support.ts`.
     - WP5-REL `74d5bfe`: docs/12 (mới, EN, VI); docs/11 mục 13–16 và bảng lệnh; một dòng README (EN, VI).
     - Đánh giá tài liệu theo khu vực A:
       - Quyền riêng tư được giữ. Chỉ có placeholder và `example.invalid`. Bản sao `<env-file>` được bảo vệ là mode 600 và nằm ngoài git và chat. Giá trị SMTP được xóa khỏi tệp khi hủy kích hoạt, và lý do kích hoạt không bao giờ là dữ liệu cá nhân.
       - Sẵn sàng, cho phép và kết quả vẫn tách riêng: docs/12 "Sẵn sàng phần mềm, cho phép của chủ sở hữu và kết quả pilot" và docs/11 mục 13. Nhà cung cấp chấp nhận và người nhận nhận được được ghi thành các sự kiện riêng.
       - Đối chiếu với mã và probe, các khẳng định sau của docs/11 và docs/12 là đúng:
         - route kích hoạt và các từ chối `activation_in_past`, `reason_required` và `origin_rejected` (`ACT-1`);
         - thời điểm có kiểm toán hiển thị trong trạng thái, và xóa nó bằng null (`ACT-2`, `ACT-3`);
         - điều kiện từ thời điểm kích hoạt và thời điểm hiệu lực auto-submit của người dùng trở đi; không bao giờ áp dụng cho tài khoản chưa từng lưu thiết lập (`automation.ts`, docs/05);
         - SMTP bị từ chối khi thiếu cờ, nêu tên cờ và không bao giờ nêu giá trị (`F-5`);
         - các mã lỗi `smtp_auth_failed`, `smtp_tls_failed` và `smtp_config_invalid`, và lỗi socket TLS được xếp là tạm thời (`smtpAdapter.ts`, D-8);
         - `SMTP_SECURITY` là `starttls`/`tls`, và `SMTP_USER`/`SMTP_PASSWORD` đặt cùng nhau (`config.ts`);
         - thư mục capture dưới `/data/private-data` (`DATA_DIR` trong Dockerfile);
         - không gửi lại mù quáng một lần gửi không chắc chắn;
         - đổi người nhận cần một bản sửa mới;
         - runner tìm thấy việc trong vòng một phút (chu kỳ 15 giây);
         - số job gửi đang xếp hàng trong trạng thái (`outbound.queued_send_jobs`);
         - ghi chú R-WA3.
       - Các ngoại lệ là WP5-A2-01, WP5-A2-02 và rủi ro câu chữ R-A2-1.
       - Bản EN và VI khớp nhau (`05-parity.txt`), và phần VI của cả hai phát hiện nói giống bản EN.
  2. **Test AC-13.**
     - Phạm vi bao phủ: test khẳng định mọi điều probe lần 1 đã cho thấy với các mục ghi chú liệt kê:
       - 14 ngày;
       - tổng được ghi có 510 = `8:30`, trong màn hình xem xét và trong PDF đã capture;
       - sổ OT ghi đúng một lần: 6 khoản ghi có cộng một khoản −60, đã ghi sổ 540, 8 dòng, không đổi sau khởi động lại, quyết định và các lần tráo;
       - khởi động lại: một tiến trình runner riêng commit `sending` rồi thoát (86). Runner production khởi động lại đánh dấu lần gửi là `uncertain` (`lease_expired_while_sending`) và không capture gì; gửi lại bị 409 cho tới khi chủ sở hữu quyết định; quyết định đó cho đúng một lần gửi được chấp nhận và một thư capture với To/Cc đã đóng băng, người gửi, không có Bcc và hash PDF;
       - sửa: 422 khi không có lý do; bản sửa 2 thay bản 1; chỉ +30 sửa khoản ghi có ngày 10-04; payload r1 bằng từng byte; hai lần ký; không có job, lần gửi hay thư capture nào từ việc sửa hay từ `send_email: false`;
       - tiêu hai lần: hai kết nối trong worker thread, đúng một `used` và một `409 exceeds_reserved`;
       - cách ly: 11 định danh bị tráo trả 403/404, số dòng mọi bảng và thư mục capture không đổi, Bob không thấy gì của Alice;
       - quá hạn: tại thời điểm ghi `2026-10-09T00:05:00Z` khi tắt auto-submit, một bản ghi quá hạn, không có bản sửa tự động, không có job PDF hay gửi cho Bob, đúng một thư capture (cảnh báo của chính anh ấy, không có PDF), và không thêm gì ở lần quét sau.
     - Mọi route bị tráo đều tồn tại (`api.ts`, `ot.ts`, `submission.ts`, `shares.ts`), nên các lần từ chối không phải là đạt suông.
     - Tính tất định:
       - đồng hồ được tiêm, không sleep, không cổng mạng, thư mục tạm tạo lúc chạy;
       - ba lần chạy đều đạt;
       - đạt ở bốn múi giờ máy, đặt lúc chạy và thấy được qua giờ bắt đầu của vitest;
       - đạt khi đồng hồ thật ở tháng 1/2027 và tháng 6/2025;
       - kiểm tra quá hạn đúng dù lượt quét nào trong hai lượt của một lần chạy đi trước, vì lần chạy 00:11 mở một nhóm nhắc nhở mới (R-A2-4).
     - Đột biến (`07-mutation.txt`):
       - bản đối chứng đạt;
       - đột biến 1, lặp lại đột biến của WP5-AC13: bỏ ngưỡng N. Thất bại với `credit 2026-09-24: expected 30 to be +0`, như WP5-AC13 đã ghi;
       - đột biến 3, của tôi: đọc chữ ký mà bỏ bộ lọc chủ sở hữu. Thất bại với `Bob GET /api/signatures/<id>: expected [403, 404] to include 200`.
  3. **Chạy lại.**
     - `npm ci`, verify và e2e như trong bảng.
     - Probe của tôi phủ các mục lần 1 mà test không phủ. Chia sẻ (`SHARE-1..4`):
       - quyền chỉ xem chỉ tới được bảng công; OT, PDF và sửa trả 403;
       - ký, chữ ký, gửi lại, thiết lập, nghỉ phép và chia sẻ lại không bao giờ được gắn route (404);
       - thay đổi có hiệu lực ở yêu cầu kế tiếp: OT 200, PDF cùng byte và lượt tải có kiểm toán, lần sửa được ghi cho người được chia sẻ; thay đổi tạo id mới;
       - thu hồi cho 404 ở yêu cầu kế tiếp; vô hiệu hóa cho 401; kích hoạt lại khôi phục đăng nhập.
     - Lỗi người gửi và người nhận (`F-1..5`):
       - `sender_missing` và `recipient_missing` là vĩnh viễn và hiển thị trong danh sách của chủ sở hữu và trong trạng thái nộp của quản trị (kèm người nhận đã đóng băng, không có chi tiết bảng công);
       - không lỗi nào từng được chấp nhận, capture hay tự động thử lại;
       - SMTP thiếu cờ bị từ chối, và mật khẩu tổng hợp không bao giờ xuất hiện.
     - Bí mật (`PRIV-1`, `PRIV-2`, `OPS-3`):
       - health là `{"status":"ok"}`; readiness không chứa địa chỉ hay đường dẫn;
       - log máy chủ và đầu ra CLI của cả hai instance không có mật khẩu hay cookie, và mỗi setup token chỉ xuất hiện trong đầu ra bootstrap của nó;
       - trạng thái quản trị không chứa địa chỉ hay chi tiết bảng công.
     - Tự kiểm tra capture (`SELF-1..3`): đúng To/Cc đã cấu hình, `MAIL_FROM`, không có Bcc, và PDF bằng bản tải về; lần gửi được ghi `accepted` với phản hồi nhà cung cấp `captured`.
  4. **Kết luận trước đây.** Không có mã nguồn nào thay đổi, nên các kiểm tra 1–7 đã xác minh và PASS về phần mềm của lần 1 vẫn áp dụng cho cùng mã đó. Chúng được chứng minh lại ở đây bằng test AC-13, các bộ test, e2e và probe. R-WA1..R-WA8 được đánh giá lại bên dưới.
- **Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh:**
  - **R-A2-1 (Low, câu chữ):** docs/11 mục 14 bước 2 nói một lần gửi bị capture sau khi hủy kích hoạt "được ghi nhận với bộ gửi capture".
    - "Bộ gửi capture" là thuật ngữ của dự án cho bộ chuyển capture (DEVELOPMENT.md), nên câu này không sai.
    - Nhưng lịch sử của chủ sở hữu hiện lần gửi đó là "Accepted by the mail server" (`deliveryModel.ts`). Chỉ bản ghi API mới cho thấy phản hồi nhà cung cấp `captured` và id nhà cung cấp `capture-…` (`SELF-3`).
    - Nêu tên hai dấu hiệu này sẽ giúp người vận hành tìm ra các bài nộp đã capture mà chưa gửi thư.
  - **R-A2-2 (Low, trùng khu vực B):** `<compose-restored>` giữ `<env-file>` đang dùng; `08-config-restored.txt` của WP5-GATE cho thấy `OUTBOUND_MODE` lấy từ tệp đó.
    - Sau khi kích hoạt, một instance đã restore để xem xét sẽ đọc `smtp` và cờ, dù mục 6 bước 3 nói "ở chế độ capture".
    - Trạng thái tạm dừng gửi ra của restore giữ mọi lần gửi cho tới lệnh resume rõ ràng, nên không có gì đi ra nếu người vận hành không làm.
    - Tùy chọn: một bản sao env file ở chế độ capture, như `<compose-previous>` làm với `JOB_RUNNER=off`.
  - **R-A2-3 (Info, chất lượng bằng chứng):** các lần chạy của WP5-AC13 "với `TZ=Asia/Tokyo` và `TZ=America/New_York`" không đổi múi giờ.
    - Git Bash bỏ `TZ` khi khởi động một tiến trình native: `process.env.TZ` là undefined. Giờ bắt đầu `14:16` của vitest trong bằng chứng của họ là giờ Los Angeles, và múi giờ của máy này trùng múi giờ báo cáo của kịch bản.
    - Đã chứng minh lại ở đây bằng preload lúc chạy. Các cổng sau nên đặt múi giờ theo cùng cách.
  - **R-A2-4 (Info):** một cảnh báo quá hạn có thể đến sau bản ghi quá hạn của nó tối đa một nhóm nhắc nhở năm phút.
    - Lượt quét hạn và lượt quét nhắc nhở của một lần chạy trùng `next_run_at` và `created_at` và được nhận theo id ngẫu nhiên. Thấy ở lần probe 1 so với lần 2 (`08-probe-run-history.txt`).
    - Điều này nằm trong thiết kế WP3 (nhóm nhắc nhở năm phút). Bốn lần chạy của test phủ cả hai thứ tự.
  - **R-A2-5 (Info, có thể bổ sung test):** test không phủ các mục sau của lần 1. Mỗi mục đã được các bộ test có sẵn, e2e hoặc probe lần 1 phủ:
    - khởi động lại trước và sau PDF;
    - PDF r1 được giữ sau bản sửa (chỉ dòng payload r1, các lần ký và các lần gửi được khẳng định);
    - một lần gửi lại tường minh PDF không đổi mà sổ OT không biến động;
    - tráo lô nhập, phiên bản thiết lập và quản trị viên;
    - một cuộc đua ký qua hai kết nối (chỉ một kết nối: tính lũy đẳng).
  - **R-WA1..R-WA8 đánh giá lại (mã không đổi):**
    - R-WA1 (Low), R-WA2 (Low), R-WA6 (Info) và R-WA8 (Info) không đổi và nay được liệt kê trong docs/12.
    - R-WA3 (Low) không đổi và được ghi trong docs/11 mục 16 ghi chú 5. `LINK-2` lại cho thấy quản trị viên bootstrap và Carol (chưa từng cấu hình) nhận nhắc nhở trước hạn sau khi kích hoạt.
    - R-WA4 (Info) được xác nhận: thay đổi tạo id mới (`SHARE-2`).
    - R-WA5 (Info) không lặp lại: probe đóng mỗi kết nối.
    - R-WA7 (Info) giảm bớt: test AC-13 chạy `runJobsOnce` production trong tiến trình và trong một tiến trình runner riêng. Vòng lặp chạy thật vẫn chỉ được e2e phủ.
  - **E2E lần 1:** `net::ERR_NO_BUFFER_SPACE`, coi là do môi trường (WP3 carry 12) khi WP5-PILOT đang chạy trên máy. Cả hai lần đều được ghi; lần chạy lại duy nhất đạt.
- **Cổng bắt buộc chưa chạy/bị chặn và lý do:**
  - Khu vực B không được lặp lại ở đây: khả năng tái tạo bản phát hành, restore, drill, image, `npm audit` và độ trung thực Compose của sổ tay. WP5-GATE đã phủ chúng trên bản đóng băng này.
  - SMTP thật và NAS không quan sát được ở chế độ capture và vẫn NOT VERIFIED (D-13).
  - Các mục 13–16 là bước NAS của chủ sở hữu. Tôi chỉ đối chiếu các khẳng định của chúng với mã và một instance cục bộ.
  - Không chạy kiểm tra trình duyệt nào ngoài bộ e2e.
- **Xử lý các phát hiện trước:**
  - Lần 1 không có phát hiện.
  - WP5-B-01 và WP5-B-02 (khu vực B) đã được WP5-FIXB sửa. Khu vực A không thấy hồi quy nào từ bản sửa: bản sao env file được bảo vệ, và instance đã restore có project và dữ liệu riêng (đã ghi R-A2-2).
  - Các phát hiện WP1–WP4 vẫn đóng.
- **Sẵn sàng phần mềm, cho phép của chủ sở hữu và kết quả pilot, tách riêng:**
  - Sẵn sàng phần mềm (khu vực A): phần mềm của `74d5bfe` / `0a64a75f…` đạt mọi kiểm tra khu vực A trên một máy trạm Windows ở chế độ capture. Tài liệu cuối gói có hai phát hiện sổ tay mức Low (FIX REQUIRED), nên khu vực A chưa được nghiệm thu trên bản đóng băng này cho tới khi chúng được sửa và kiểm tra lại.
  - Cho phép của chủ sở hữu: chưa yêu cầu và chưa có; không triển khai, kích hoạt hay gửi gì.
  - Kết quả pilot: chưa có.
- **Một hành động/prompt tiếp theo:** coordinator giao một bản sửa tài liệu trong phạm vi hẹp cho WP5-A2-01 và WP5-A2-02 theo [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md). Bản sửa đổi `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md`, chỉ mục 13 và 14. Sau đó là bản đóng băng của nó, một lần cổng lại và một lần kiểm tra lại khu vực A chỉ cho các dòng đó trên digest mới. R-A2-1 và R-A2-2 có thể được sửa trong cùng lượt.

Không bịa phát hiện, không ghi đạt khi chưa quan sát. Một đánh giá từng phần không phải là nghiệm thu đầy đủ.

## Nguồn gốc subagent độc lập

- **Tác vụ/lần đánh giá, ID người đánh giá và ID tác giả được đánh giá:**
  - WP5-ASSESS-A, lần 2, subagent timesheet-auditor, tự báo `claude-opus-5-5`. ID tác tử trên bảng do coordinator ghi.
  - Tác giả được đánh giá:
    - các worker WP1–WP4 (mô hình tác giả mạnh nhất là opus);
    - WP5-FIXB, WP5-AC13 và WP5-REL (sonnet);
    - các committer của họ.
  - Người đánh giá không yếu hơn mô hình tác giả mạnh nhất.
- **Ngữ cảnh mới; xác nhận người đánh giá không viết thay đổi nào:**
  - Ngữ cảnh mới. Người đánh giá này không viết thay đổi nào của WP1–WP5. Không phải auditor lần 1, auditor WP5-ASSESS-B hay auditor WP5-FINAL-AUDIT.
  - Chỉ viết báo cáo này, bản dịch, kết quả lần 2 trong brief và `evidence/WP5-ASSESS-A2/`. Không sửa mã nguồn nào. Các đột biến chạy trong một bản sao nháp riêng ngoài kho.
  - Sai lệch so với quy tắc chạy: một lệnh shell chuyển lỗi của một lệnh `cp` thất bại vào `/dev/null`, trái quy tắc của brief. Lệnh sao chép không ghi gì, và không có gì khác bị ảnh hưởng.
- **Digest mã nguồn trước/sau; bằng chứng cổng cho snapshot đó:** `0a64a75f…01ba` (779 tệp) trước và sau, trong kho, dạng `git ls-tree` và bản xuất. Bằng digest cổng đã ghi của WP5-GATE (`handoff/delivery/evidence/WP5-GATE/00-digest.txt`).
- **Đường dẫn báo cáo mới, giữ nguyên lịch sử đánh giá trước:** `handoff/delivery/WP5_REVIEW_A2.md` và `.vi.md` (tệp mới). `WP5_REVIEW_A.md` và bằng chứng của nó không đổi.
- **Xử lý phát hiện và tác vụ sửa/kiểm tra lại tiếp theo của coordinator:**
  - WP5-A2-01 và WP5-A2-02 đang mở, với bản sửa chỉ tài liệu như trên, sau đó kiểm tra lại trên digest mới.
  - Rủi ro R-A2-1..R-A2-5 chuyển cho tác vụ sửa (R-A2-1, R-A2-2), phương pháp WP5-GATE (R-A2-3) và backlog (R-A2-4, R-A2-5).
