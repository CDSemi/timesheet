# Đánh giá độc lập WP4 — vùng A (vận hành)

Mẫu: [REVIEW](../templates/REVIEW.md). Bản gốc tiếng Anh (có thẩm quyền): [WP4_REVIEW_A.md](WP4_REVIEW_A.md). Prompt đánh giá: [WP4_REVIEW](../prompts/WP4_REVIEW.md); brief giao việc và hồ sơ tác vụ: [WP4-AUDIT-A](tasks/WP4-AUDIT-A.md). Bằng chứng: `handoff/delivery/evidence/WP4-AUDIT-A/` (mục lục trong `00-README.txt`).

- **Gói/ngày/người đánh giá và model/effort quan sát được:** WP4, vùng A (vận hành: cấu hình và proxy, bootstrap, ranh giới image, backup nhất quán WAL và dọn backup, restore cô lập, tạm dừng gửi đi và đối soát, nâng cấp và quay lui cùng bộ chạy migration, lưu giữ dòng job, job hằng ngày, quyền riêng tư của trang trạng thái quản trị, runbook). 2026-10-06. Người đánh giá: subagent WP4-AUDIT-A (profile timesheet-auditor), model tự báo `claude-opus-5-5`; effort và tốc độ không quan sát được.
- **SHA commit được đánh giá và digest nguồn; commit chưa push; độ đầy đủ của nguồn:** `13a258db86b2f0b6388830e584e2cca5303f1f6c` (commit đóng băng của WP4-GATE). Digest nguồn `1ed67f55fb20c5bed64926c54ce635211f09c44ce33d50a2f88c8354577addfe` trên 774 tệp (không tính `handoff/`), bằng digest chính thức của gate. Đã ghi trước (10:44 UTC) và sau (11:18 UTC) trong repository bằng `scripts/source-digest.mjs` và dạng `git ls-tree`, và trên bản export sạch sau mọi kiểm tra (`00`, `99`). HEAD không đổi. `main` ngang `origin/main`: không có commit chưa push. Nguồn đầy đủ: một bản export `git archive` của commit.
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **FIX REQUIRED.** Một lỗi bắt buộc sửa: WP4-A-01 (Low). Image chứa 114 source map, và server production phục vụ source map của client kèm toàn văn mã nguồn. Điều này trượt kiểm tra ranh giới image của đợt kiểm định này (mục phạm vi 3) và docs/07:9. Hai lỗi tài liệu mức Low nên sửa cùng vòng: WP4-A-02 và WP4-A-03. WP4-A-04 (Info, công cụ) là tùy chọn. Không tìm thấy lỗi hành vi: tính nhất quán, cô lập, riêng tư, xử lý bí mật, AC-08 và bộ chạy migration đều đạt.
- **Phạm vi đã thực sự xem/chạy:**
  - Đã đọc: AGENTS.md (từ đĩa), brief, WP4_REVIEW, WP4_IMPLEMENT, docs 03, 05, 06, 07, 10 và 11, HANDOFF WP4, kết quả WP4-GATE và các quyết định trên board.
  - Đã lần theo mã: `config.ts`, `http/clientAddress.ts`, `routes/auth.ts`, `auth/rateLimit.ts`, `services/bootstrap.ts`, `cli.ts`, `index.ts`, `app.ts` (`/api/ready`), `ops/backup.ts`, `ops/manifest.ts`, `ops/prune.ts`, `ops/restore.ts`, `db/migrations.ts`, `db/database.ts`, các migration 0008 đến 0011, `jobs/jobStore.ts`, `jobs/runner.ts`, `jobs/retentionJob.ts`, `jobs/sweepJob.ts`, `files/fileStore.ts` (`sweep`), `services/operationsStatus.ts`, `routes/admin.ts`, `Dockerfile`, `.dockerignore`, `compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs`, `scripts/smoke-built-server.mjs`, `tests/integration/restore.test.ts` và ba chỗ ghim số job đã được nới.
  - Đã chạy: một bản export sạch với `npm ci` và `npm run verify`; toàn bộ diễn tập container, giai đoạn 1 đến 6, với bản build WP3; chín probe (P1 đến P9). Các probe bao gồm bộ chạy migration, nhiều tiến trình mở đồng thời, backup trong khi đang ghi kèm restore cô lập, dọn backup với junction NTFS, ranh giới đích và backup bị sửa, bootstrap, proxy và cấu hình, lưu giữ và quét file mồ côi, riêng tư quản trị, và CLI outbound.
- **Bảng bằng chứng:**

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `git archive 13a258d` rồi `npm ci` (Node 24.21.0) | exit 0, 169 gói, không có dòng deprecation | `01` |
| `npm run verify` khi đã export `DATA_DIR` | exit 1: typecheck, lint và build sạch; 75 tệp / 1710 test đạt; kiểm tra capture của smoke FAIL (WP4-A-04) | `02`, `02b` |
| `npm run verify` khi không đặt `DATA_DIR` (smoke dùng thư mục tạm của chính nó) | exit 0: 75 tệp / 1710 test, SMOKE PASSED, không có dòng deprecation | `03` |
| `node scripts/container-drill.mjs --work <work>\drill --project ts-wp4-aud-a --wp3 <work>\wp3` | exit 0, `DRILL STAGES 1-6 PASSED`; theo giai đoạn 31/31/56/35/27/23 PASS, 0 FAIL (205), bằng WP4-T12 và gate | `04`, `05` |
| P1 bộ chạy migration (sau một lần chạy lại vì lỗi của probe) | exit 1: 25 PASS, 1 FAIL. Lần FAIL duy nhất là một tiến trình mở đồng thời một tệp mới gặp SQLITE_BUSY trong `openDatabase`, được P1b mô tả (R-A2). | `10` |
| P1b nhiều tiến trình mở đồng thời (10 vòng × 6 tiến trình × 3 trạng thái) | exit 0, 4 PASS, 1 FAIL (trường hợp tệp mới). Nâng cấp 10/10 và khởi động lại 10/10 sạch; tệp mới: 13/60 tiến trình gặp SQLITE_BUSY lúc mở; không bao giờ áp dụng hai lần. | `11` |
| P2 backup trong khi ghi, restore cô lập, hash và số dư | exit 0; 31 PASS | `12` |
| P3 dọn backup và thoát qua junction | exit 0; 9 kiểm tra PASS, cộng phép đo đồng hồ chạy lùi đã ghi lại (R-A1) | `13` |
| P4 ranh giới đích và backup bị sửa | exit 0; 16 PASS | `14` |
| P5 bootstrap (production) | exit 0; 21 PASS | `15` |
| P6 proxy, bộ giới hạn, dừng sớm khi cấu hình sai, health, source map được phục vụ | exit 0; 20 PASS; map được phục vụ (WP4-A-01) | `16` |
| P7 lạm dụng cửa sổ lưu giữ, một lượt runner khi đang tạm dừng | exit 0; 23 PASS | `17` |
| P8 allowlist của trạng thái vận hành và danh sách tài khoản | exit 0; 8 PASS | `18` |
| P9 quy tắc xác nhận `outbound` và dòng audit | mã exit đúng như mong đợi 2/2/2/1/1/2/2/0/0/2; resume được audit | `19` |
| Danh sách tệp của image, thiết lập build | 114 `*.map` dưới `/app/dist`; bộ quét của drill không có quy tắc `*.map` | `20` |
| Thông báo từ chối của bootstrap | trích ngày và số chính sách (WP4-A-03) | `21` |
| `npm audit`, `npm audit --omit=dev` | 1 high (source-map-js, chỉ dev) / 0 | `22` |

- **Phát hiện:**
  - **WP4-A-01 | Low | bắt buộc (trượt mục phạm vi 3, ranh giới image) | `Dockerfile:42` (bước runtime `COPY --from=build /app/dist ./dist`), `tsconfig.server.json:9` (`"sourceMap": true`), `vite.config.ts:12` (`sourcemap: true`), `scripts/container-drill.mjs:213-226` (`forbiddenPaths` không có quy tắc `*.map`).**
    - Tái hiện: danh sách tệp image của drill có 114 đường dẫn `*.map` dưới `/app/dist` (`20`). Một trong số đó là `/app/dist/client/assets/index-UbxC4j68.js.map`. Server đã build trả `GET /assets/index-UbxC4j68.js.map` với 200 và 1.887.573 byte kèm `sourcesContent`, và bundle có `sourceMappingURL` (`16`).
    - Mong đợi: không có tệp dành cho lập trình viên trong image (docs/07:9 "Keep the workbook, developer files and secrets out of the image"; mục phạm vi 3 "no source maps"). Thực tế: mọi map của server và client đều nằm trong image, và production phục vụ toàn bộ mã nguồn client cho bất kỳ ai.
    - Tác động: không có bí mật và không có dữ liệu cá nhân (map chỉ chứa mã; repository công khai theo thiết kế). Đây là lỗi ranh giới và vệ sinh, không phải rò rỉ riêng tư.
    - Quy tắc: docs/07:9; AC-11 (image sạch).
    - Sửa có giới hạn: build image không có map. Hoặc truyền `--sourceMap false` cho tsc và `--sourcemap false` cho vite ở bước build của Dockerfile, hoặc xóa `dist/**/*.map` và các chú thích `sourceMappingURL` trước khi sao chép sang runtime. Thêm `*.map` vào bộ quét tệp cấm của drill và kiểm tra `/assets/*.map` trả 404. Môi trường phát triển cục bộ có thể giữ map.
  - **WP4-A-02 | Low | sửa cùng vòng | `.env.example:60`.**
    - Mong đợi: mẫu nêu cách dùng duy nhất trong production của `JOB_RUNNER=off`. Khi quay lui về một bản build mà schema không có tạm dừng gửi đi, phải chạy với runner tắt cho đến khi đối soát xong (docs/07:32, docs/11:194, quyết định điều phối docs/10:159).
    - Thực tế: "JOB_RUNNER=off disables the in-process job runner (tests and drills only; leave unset)." Mẫu mâu thuẫn với chính quy tắc khiến giới hạn còn lại đã chấp nhận của việc quay lui trở nên an toàn.
    - Sửa: viết lại chú thích: phải tắt sau một lần quay lui `restore --keep-schema --confirm` cho đến khi đối soát xong; ngoài trường hợp đó thì để trống.
  - **WP4-A-03 | Low (độ chính xác tài liệu) | sửa cùng vòng | `docs/11_OPERATIONS_RUNBOOK.md:73,116,247-253` và bản `.vi.md`; `src/server/services/bootstrap.ts:123` (chú thích).**
    - (a) Runbook nói trang trạng thái quản trị hiển thị lần chạy lưu giữ, và mục 12 nói "The screen reads GET /api/admin/operations" rồi liệt kê lưu giữ. Màn hình không hiển thị nó: chỉ JSON có `operations.retention` (`18`; HANDOFF:124 cũng nói vậy).
    - (b) Runbook và chú thích bootstrap nói rằng thông báo từ chối không trích giá trị nào từ tệp. Thực tế thông báo từ chối có trích ngày và số chính sách, ví dụ "Invalid holiday/closure date 2026-02-30" và "Reference 08:00–17:00 (540 min) must equal required 480 min plus excluded breaks 15 min" (`21`). Văn bản tự do (tên, múi giờ) không bị trích, và không có gì bí mật được in ra.
    - Quy tắc: AGENTS.md quy tắc 5; mục phạm vi 10 (các khẳng định của runbook đúng như được viết).
    - Sửa: chỉnh câu chữ (EN và VI), hoặc thêm dòng lưu giữ vào màn hình.
  - **WP4-A-04 | Info (công cụ, tùy chọn) | `scripts/smoke-built-server.mjs:43-58`.**
    - Vấn đề: môi trường của smoke trải `process.env` và ghi đè `DATABASE_PATH`, nhưng không ghi đè `DATA_DIR`.
    - Tái hiện (`02`, `02b`): khi đã export `DATA_DIR`, như quy tắc runtime của WP4 yêu cầu cho mọi lần chạy CLI và server, `npm run verify` trượt kiểm tra capture của smoke (exit 1). Smoke còn ghi tệp chữ ký, PDF và capture tổng hợp vào `DATA_DIR` của người gọi.
    - Mong đợi: smoke giữ toàn bộ lưu trữ trong thư mục tạm của chính nó.
    - Sửa: đặt `DATA_DIR: join(work, 'private-data')` trong môi trường của smoke.
- **Rủi ro và cải tiến tùy chọn, tách khỏi lỗi đã chứng minh:**
  - R-A1, đồng hồ chạy lùi và việc dọn backup (`ops/prune.ts:100-124`).
    - Đo trên 180 backup hằng đêm (`13`): đồng hồ đúng giữ 13. Đồng hồ bị đặt lùi về 2025-01-01 chỉ giữ bản mới nhất; một lần `--prune` thật còn giữ thêm bản backup mới bị ghi sai ngày và xóa phần còn lại.
    - Đã được giảm nhẹ bởi bước NTP của chủ sở hữu và bản sao trên thiết bị riêng.
    - Cải tiến: từ chối việc dọn (exit 2) khi có ứng viên mang ngày sau đồng hồ.
  - R-A2, nhiều tiến trình cùng mở một tệp cơ sở dữ liệu hoàn toàn mới (`db/database.ts:11-18`, từ WP1).
    - Việc chuyển sang WAL trả SQLITE_BUSY ngay cho một số tiến trình (`11`). Tiến trình thất bại một cách rõ ràng; dữ liệu không bao giờ bị hỏng.
    - Bản thân `migrate()` an toàn khi đồng thời: nâng cấp và khởi động lại đều sạch, và không migration nào được áp dụng hai lần.
    - Thứ tự trong runbook (server trước, rồi đến CLI) tránh được trường hợp này. Cải tiến: thử lại việc chuyển journal mode.
  - R-A3, giới hạn còn lại của việc quay lui (restore giữ schema của một schema không có tạm dừng). Chấp nhận được cho WP4: chưa có thời điểm kích hoạt, thư chỉ ở chế độ capture, và các lần gửi đã backup bị giữ lại (drill giai đoạn 5). Trước pilot WP5, chủ sở hữu nên chọn: quy tắc `JOB_RUNNER=off` (cùng WP4-A-02), hoặc xóa thời điểm kích hoạt khi dùng `--confirm` (docs/10:159).
  - R-A4, thời điểm của cửa sổ lưu giữ do bên gọi cung cấp (`jobs/retentionJob.ts`).
    - SQL trực tiếp đặt cửa sổ thành năm 2099 có thể xóa một dòng quét đã thành công 29 ngày tuổi (`17`, đã rollback). Dòng gửi thư, PDF, gửi, quét file và lưu giữ vẫn bị từ chối ở mọi thời điểm.
    - Chỉ `retentionJob.ts` ghi cửa sổ, và production từ chối `run-jobs --now`. Chấp nhận được.
  - R-A5, một kiểm tra của drill nói quá kết quả của nó. "outbound release --all --confirm releases the remaining held send job" đạt với `released: 0` (`05`; điều kiện là `released === releasable - 1`). Một lần thả hàng loạt thật được `restore.test.ts:488` bao phủ (released 1). Cải tiến: giữ hai job trong drill.
  - R-A6, các chỗ ghim số job đã được nới.
    - `delivery.test.ts:284` (3/3) và `jobs-restart.test.ts:289` (4 nhận / 3 thành công) vẫn chính xác và có giải thích. Hợp lệ.
    - `automation.spec.ts:156,273` trở thành cận trên (≤2, ≤4) và yếu hơn. Các khẳng định nghiệp vụ vẫn còn (không revision, không hoàn tất, kích hoạt null), và `deadline.test.ts:961` cùng `reminders.test.ts:218` ghim chính xác "không có job quét khi chưa kích hoạt". Chấp nhận được; cải tiến: khẳng định theo loại job.
  - R-A7, `not_set_up` nằm trong danh sách tài khoản trong khi docs/03:49 nói "operational status". docs/03:34 xếp tài khoản và "settings flags" vào thông tin vận hành, và runbook mục 12 ghi rõ danh sách tài khoản. Nhất quán; tùy chọn chỉnh câu thành "in the administrator's account list".
  - R-A8, cơ sở dữ liệu mặc định của CLI trong môi trường phát triển. Không có `DATABASE_PATH` thì `cli.js migrate`, hoặc bất kỳ lệnh lạ nào, mở `%LOCALAPPDATA%\timesheet-dev\timesheet.db` (`config.ts:28-31`, `cli.ts:433-434`; sự cố WP4-GATE). Cải tiến: các lệnh bảo trì yêu cầu `DATABASE_PATH` tường minh. Có từ trước.
  - R-A9, `npm audit` báo high ở `source-map-js`. Gói này chỉ dùng cho dev (vite > postcss), không có trong image, và `npm audit --omit=dev` báo 0 (`22`). Backlog chấp nhận được.
- **Hành vi đã xác minh (không lỗi):**
  1. Cấu hình dừng sớm, nêu tên biến và không in giá trị (8 trường hợp, `16`). Khi không có proxy tin cậy, hoặc proxy tin cậy không phải đầu nối socket, `X-Forwarded-For` xoay vòng vẫn dùng chung một bucket (lần thất bại thứ 31 bị 429). Khi đầu nối socket được tin cậy, hop không tin cậy ngoài cùng bên phải là client: hop chèn thêm bên trái, cách viết IPv4-mapped và header sai dạng không thể tách bucket, và bucket theo tài khoản gắn với client thật. `/api/health` là `{"status":"ok"}`; `/api/ready` có đúng `status`, `schema{expected,actual}` và `data_dir_writable`.
  2. Bootstrap chỉ lưu SHA-256 của token đã chuẩn hóa. Token hết hạn 60 phút sau khi cấp và chỉ dùng được một lần. Token đã bị thay, sai, hết hạn hoặc dùng lại đều nhận cùng một 403. `--new-token` thay token và bị từ chối khi đã có quản trị viên. Không token hay hash nào xuất hiện trong phản hồi, log hoặc dòng audit; các dòng audit là sự kiện hệ thống (`15`).
  3. Image (drill giai đoạn 1): base được ghim theo digest, `User=10001:10001` dạng số, UID khi chạy 10001, root chỉ đọc với tmpfs `/tmp`, không có test, `reference/`, `handoff/`, `.env` hay tệp workbook, chỉ có dependency production, không có bí mật trong biến môi trường của image, dữ liệu chỉ lưu dưới `/data`. Ngoại lệ: các source map (WP4-A-01).
  4. Backup nhất quán WAL khi đang ghi.
     - Ba luồng ghi chạy: 56 phiên làm việc và 16 chữ ký hoàn tất trong cửa sổ backup, và 5/8 số dư đầu kỳ nằm trong ảnh chụp.
     - Mỗi số dư đầu kỳ trong bản sao có dòng audit của nó, và không dòng audit nào thiếu dòng sổ cái.
     - Mọi phiên được commit trước khi backup bắt đầu đều có trong bản sao; bản sao là tập con của dữ liệu đang chạy.
     - Manifest có đúng các khóa và chỉ có hash và kích thước; mỗi tệp bằng mục manifest của nó và tệp đang chạy (`12`). Tệp nguồn import được bao gồm (drill giai đoạn 2).
  5. Dọn backup:
     - Chỉ chọn thư mục thật có tên của công cụ và manifest có thời điểm bằng tên, và luôn giữ bản mới nhất. Junction đặt tên giống backup bị bỏ qua.
     - Junction ở vị trí `files/`, hoặc bên trong `files/`, chỉ bị gỡ liên kết, không bao giờ đi theo: các thư mục nạn nhân giữ nguyên từng byte.
     - Chạy thử không xóa gì. Thiếu backup mới và một lối thoát phát hiện lúc xóa đều khiến toàn bộ lần chạy bị từ chối trước khi xóa bất cứ thứ gì (`13`).
  6. Restore không bao giờ ghi `DATABASE_PATH` hay `DATA_DIR` đang chạy (cây thư mục giống hệt trước và sau, `12`). Junction trỏ vào `DATA_DIR`, thư mục của instance đang chạy và thư mục nằm trong backup đều bị từ chối với exit 2. Backup bị sửa thất bại với exit 1 và không để lại gì (`14`). Số dư sau restore bằng backup qua SQL và qua API của instance đã restore, và instance đã restore ghi log việc tạm dừng.
  7. Lần gửi bị giữ và AC-08:
     - Mọi job gửi thư và nhắc nhở đang xếp hàng hoặc đang được thuê trong backup đều bị giữ.
     - Lần gửi không chắc chắn không bao giờ được thả hay gửi lại; resume bị từ chối khi còn lần gửi chờ quyết định.
     - Thả và hủy cần `--confirm`, từ chối trả exit 1, và các bước thành công là sự kiện hệ thống được audit.
     - Job tạo sau restore không bị giữ; chúng chỉ chờ resume.
     - Bằng chứng: drill giai đoạn 3, các kịch bản `restore.test.ts` đã đọc toàn bộ, và `19`.
  8. Nâng cấp và quay lui:
     - Migration được áp dụng một lần trong một giao dịch độc quyền; khởi động lại không áp dụng gì.
     - Bản build trước từ chối cơ sở dữ liệu đã nâng cấp, và lần từ chối không thay đổi gì.
     - `--keep-schema` bị từ chối nếu thiếu `--confirm`; khi có, các job gửi đã backup bị giữ và runner WP3 không gửi gì (drill giai đoạn 4 và 5).
  9. Bộ chạy migration (thay đổi của WP4-T10):
     - Migration lỗi rollback cả DDL lẫn các dòng.
     - Vi phạm khóa ngoại, với bảng mới hay bảng có sẵn, bị từ chối trước COMMIT.
     - `foreign_keys` trở về giá trị trước đó trên mọi nhánh (thành công, lỗi SQL, vi phạm khóa ngoại, khóa bận, gọi lồng, bản build cũ từ chối).
     - Nhiều tiến trình mở đồng thời trên cơ sở dữ liệu có sẵn đều sạch (`10`, `11`).
  10. Lưu giữ (F-4): khi cửa sổ đóng không gì bị xóa, kể cả `DELETE` hàng loạt. Khi mở, chỉ các dòng `deadline_scan`/`reminder_scan` đã thành công và cũ hơn 30 ngày bị xóa. Dòng cửa sổ không thể bị xóa, nhân đôi hay sai dạng. Dòng đã thành công không thể bị lùi ngày. Lần chạy đóng cửa sổ và ghi một thời điểm cùng một số đếm (`17`).
  11. Job hằng ngày: khi đang tạm dừng gửi đi, job lưu giữ và job quét file mồ côi đều chạy. Job quét chỉ xóa tệp cũ không được tham chiếu và giữ chữ ký được tham chiếu cùng một tệp nguồn import cũ hơn thời gian ân hạn. Job gửi đang xếp hàng vẫn không được nhận, không có lần gửi và không có capture (`17`).
  12. Riêng tư quản trị: trạng thái vận hành và danh sách tài khoản khớp đúng allowlist (có cả `not_set_up` và `retention`). Không có khóa lưu trữ, hash, đường dẫn host, số phút sổ cái, số dư hay trường phiên làm việc, và log server không có địa chỉ email (`18`).
  13. Runbook: mỗi lệnh CLI tồn tại với tham số và mã exit như tài liệu (`19`, các bộ phân tích tham số trong `cli.ts`). Mỗi lệnh được ánh xạ tới một giai đoạn drill hoặc mang nhãn bước NAS của chủ sở hữu (kiểm tra chéo của gate vẫn đúng). Không có host thật, thông tin đăng nhập hay dữ liệu cá nhân.
- **Gate bắt buộc chưa chạy/bị chặn và lý do:**
  - Đích NAS là NOT VERIFIED: không có quyền truy cập của chủ sở hữu. Chạy arm64 gốc là NOT VERIFIED; image chỉ có bản build giả lập của WP4-T04.
  - `npm run test:e2e` không chạy lại. Nó không bắt buộc cho vùng A; gate đã báo 145 đạt và 5 bỏ qua.
  - Không có SMTP thật (ngoài phạm vi).
- **Xử lý các phát hiện trước và mục mang theo trong HANDOFF (vùng A):**
  - NAS chưa xác minh: chấp nhận được; các bước của chủ sở hữu có trong docs/11.
  - Giới hạn quay lui: chấp nhận được với quy tắc đã ghi (R-A3; WP4-A-02 sửa mẫu).
  - Trạng thái dọn backup không được ghi: backlog chấp nhận được (cảnh báo phía host ở docs/11 mục 11 bao phủ tuổi của backup).
  - Khuyến cáo npm: backlog chấp nhận được (R-A9).
  - Job gửi bị giữ chỉ có thể thả, không thể hủy: chấp nhận được (quyết định điều phối).
  - Trạng thái lưu giữ chỉ có trong JSON: chấp nhận được, nhưng câu chữ của runbook phải khớp (WP4-A-03).
  - Cửa sổ dọn theo lịch: R-A1.
  - Thay đổi khóa ngoại của `migrate()`: an toàn (hành vi đã xác minh 9).
  - Các chỗ ghim đã nới: R-A6.
  - Các component client và literal 767px thuộc vùng B, không được đánh giá ở đây.
  - Mục mang theo số 4 của WP3 (lập lịch quét file mồ côi): đã đóng; job quét chạy hằng ngày (`17`).
- **Sẵn sàng phần mềm, quyền của chủ sở hữu và kết quả pilot, tách riêng:**
  - Sẵn sàng phần mềm của vùng A: chưa được chấp nhận, vì WP4-A-01 cần sửa. Ngoài điểm đó, hành vi đã được xác minh trên máy trạm (Docker Desktop, amd64).
  - Quyền của chủ sở hữu: chưa yêu cầu và chưa được cấp; không triển khai gì và không gửi gì.
  - Kết quả pilot: chưa có (WP5).
- **Một hành động/prompt tiếp theo:** điều phối viên giao một lần sửa có giới hạn qua [FIX_FINDINGS](../prompts/FIX_FINDINGS.md) cho WP4-A-01, cùng WP4-A-02, WP4-A-03 và tùy chọn WP4-A-04. Sau đó là đóng băng, gate kiểm định và một lần kiểm tra lại vùng A mới tại digest mới. Lần kiểm tra lại bao gồm bộ quét image của drill giai đoạn 1 có thêm `*.map` và 404 cho `/assets/*.map`.

Không bịa phát hiện, không ghi đạt khi chưa quan sát. Một đánh giá một phần không phải là chấp nhận hoàn toàn.

## Nguồn gốc subagent độc lập

- **Tác vụ/lần thử đánh giá, ID người đánh giá và ID tác giả được đánh giá:** WP4-AUDIT-A, lần thử 1. Người đánh giá là một subagent timesheet-auditor mới (`claude-opus-5-5`). Tác giả là các tác vụ triển khai WP4 trên board: T05, T06, T09 và T10 chạy `claude-opus-5-5`; T01 đến T04, T05B, T07, T07B, T08, T09B, T11, T12, T12A, T13 và WP4-DEC chạy `claude-sonnet-5-5`. Người đánh giá không yếu hơn model mạnh nhất trong các tác giả.
- **Ngữ cảnh mới; xác nhận người đánh giá không là tác giả:** ngữ cảnh mới. Người đánh giá không viết gì trong WP4 và chỉ viết báo cáo này, bản dịch, phần kết quả trong hồ sơ tác vụ và `evidence/WP4-AUDIT-A/`. Không sửa mã nguồn. Các probe chạy trên một bản export tạm bên ngoài Dropbox.
- **Digest nguồn trước/sau; bằng chứng gate cho ảnh chụp đó:** `1ed67f55…addfe` trước và sau (repository và bản export), bằng WP4-GATE (`handoff/delivery/evidence/WP4-GATE/`).
- **Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước:** `handoff/delivery/WP4_REVIEW_A.md` (tệp mới); không thay đổi đánh giá WP4 nào trước đó.
- **Xử lý phát hiện và tác vụ sửa/kiểm tra lại tiếp theo của điều phối viên:** WP4-A-01 bắt buộc; WP4-A-02 và WP4-A-03 cùng vòng; WP4-A-04 tùy chọn; R-A1 đến R-A9 là backlog hoặc lựa chọn của chủ sở hữu. Tiếp theo: tác vụ sửa, đóng băng, gate, rồi một lần kiểm tra lại WP4-AUDIT-A mới.
