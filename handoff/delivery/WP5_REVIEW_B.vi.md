# Review độc lập WP5, khu vực B — bản phát hành tái lập được, khôi phục đã kiểm chứng và vận hành

Bản dịch của [WP5_REVIEW_B.md](WP5_REVIEW_B.md); tiếng Anh là nguồn chuẩn. Điền theo [REVIEW](../templates/REVIEW.vi.md).
Brief và kết quả: [WP5-ASSESS-B](tasks/WP5-ASSESS-B.md). Bằng chứng: `handoff/delivery/evidence/WP5-ASSESS-B/` (mục lục trong
`00-README.txt`).

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** WP5, bước đầu tiên (đánh giá mới bản ứng viên phát hành WP1–WP4),
  khu vực B. 2026-10-06, từ 20:22Z đến 20:50Z. Reviewer: subagent `timesheet-auditor` của task WP5-ASSESS-B, lần 1. Model tự
  báo `claude-opus-5-5`; effort không quan sát được. Model tác giả mạnh nhất của snapshot được kiểm là `claude-opus-5-5` (hồ sơ
  WP4 và WP5-PLAN), nên quy tắc độ mạnh của audit được giữ.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `546cddaf6747aef85e8b6d9b7712de9e28f138bf`, digest `26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081`
  (775 file, trừ `handoff/`). HEAD = origin/main = `e7fe5144` (chỉ đổi `handoff/`). Digest khớp trước và sau: trong repository
  (`scripts/source-digest.mjs`), ở dạng `git ls-tree` của HEAD và của `546cdda`, và trên ba bản export sạch bằng `git archive`
  (tính từ danh sách tar với blob ID git thô). Không file nguồn nào ngoài `handoff/` khác HEAD. Source đủ.
- **Quyết định: FIX REQUIRED.** Hai lỗi tài liệu trong runbook vận hành (B-01 Medium, B-02 Low). Bản thân phần mềm đạt mọi kiểm
  tra của khu vực này: build tái lập được, image sạch, drill, một lần khôi phục độc lập có kỳ đã chốt, một bản sửa và các khoản
  giữ chỗ OT, đường đối soát lần gửi không chắc chắn, và quyền riêng tư vận hành. Không thấy lỗi chặn nào về toàn vẹn, quyền
  riêng tư hay khôi phục trong code.

## Phạm vi thật đã xem và chạy

WP5-PLAN mục B, "WP5-ASSESS-B", các ý 1 đến 6, trên các bản export sạch ngoài Dropbox, chỉ với dữ liệu tổng hợp và chế độ
capture. Không bao giờ đặt `PRODUCTION_SENDING_ENABLED` và không gửi thư thật nào. Chỉ dùng Git Bash; npm chạy script qua Git
Bash (`npm_config_script_shell`), nên không dùng `cmd.exe`. `DATA_DIR` và `DATABASE_PATH` được đặt trong thư mục task cho mọi
lần chạy CLI và server. Cổng 47721–47725 và 47730. Compose project `ts-wp5-assess-b`.

Đã đọc: AGENTS.md (từ đĩa), brief, WP5_REVIEW, docs/02, 05, 06, 07, 08, 09, 10 (các quyết định về khôi phục và rollback), 11,
WP5-PLAN các mục A, B, C, F và G, hồ sơ nghiệm thu trong WP4_HANDOFF và bằng chứng drill của WP4-REGATE4. Code đã lần theo:
`ops/backup.ts`, `ops/restore.ts`, `ops/manifest.ts`, `cli.ts`, `config.ts`, `routes/auth.ts`, `routes/submission.ts`,
`routes/ot.ts`, `services/deliveries.ts` (`decideDelivery`), `services/finalization.ts` (`resendRevision`), `seed.ts`,
`Dockerfile`, `.dockerignore`, `compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs`.

## Bảng bằng chứng

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `git archive 546cdda` hai lần, giải nén vào `src` và `src2` | hai file tar giống hệt (SHA-256 `7dc39d6a…`); digest export `26fcc969…`, 775 file | `00-export-digest-before.txt` |
| `npm ci` trong cả hai export (`--trace-deprecation`) | exit 0 / 0, 161 package, SHA-256 lockfile `dda35f8b…` không đổi, 0 dòng deprecation | `01-npm-ci.txt` |
| `npm audit --omit=dev`; `npm audit` | 0 lỗ hổng / 1 high (`source-map-js` 1.2.1 qua vite > postcss, chỉ dev) | `02-npm-audit.txt` |
| `npm run build` trong cả hai export, rồi `dist-hash.mjs` | exit 0 / 0; 230 file `dist/`, 4.044.281 byte, mọi SHA-256 giống nhau (cây `a7371fb8…`) | `03-build.txt`, `04-dist-compare.txt` |
| `npm run drill:container -- --work <task>\drill --project ts-wp5-assess-b --wp3 <task>\wp3` (`git archive 49651c8`, `npm ci`, `build:server`) | exit 0, `DRILL STAGES 1-6 PASSED`, 208 PASS, 0 FAIL (33/31/57/35/27/23), 6 phút | `07-drill*.txt`, `05-wp3-prep.txt` |
| Thông tin image của drill | ID `sha256:75f50c10…`, linux/amd64, 110.002.030 byte (104,9 MiB), User `10001:10001`, healthcheck, volume `/data`, không label; mọi bước build đều CACHED | `09-image-inspect.txt`, `07-drill-build-log.txt` |
| Quét file cấm độc lập trên danh sách file của image (`image-scan.mjs`, 12 quy tắc) | 10.331 đường dẫn; tổng file cấm **0**; `/app` chỉ có `package.json`, `dist`, `node_modules`; 16 trên 16 package production, 0 package dev; 560 map của bên thứ ba chỉ nằm dưới `node_modules` | `08-image-forbidden-scan.txt` |
| `.env.example`, `compose.example.yaml` | đọc toàn bộ: chỉ có placeholder, không giá trị bí mật; mật khẩu SMTP và mật khẩu seed bị comment và để trống | báo cáo này |
| Khôi phục độc lập, đường host (`xrestore.mjs`, 5 lần) | lần 2 48/0, lần 4 (chế độ uncertain) 63/0, lần 5 50/0; lần 1 và 3 chỉ hỏng do lỗi của probe (xem dưới) | `10-xrestore-run*.txt` |
| Cùng một backup được khôi phục bởi bản build host và bởi image theo dạng container một lần ở docs/11 mục 6; so sánh các bảng | lần 1 exit 1 (`backup_unreadable`: Git Bash đổi `/backups` thành đường dẫn Windows); lần 2 với `MSYS_NO_PATHCONV=1` exit 0; cả 29 bảng giống nhau sau khi che thời điểm khôi phục và id audit; 3 file khớp hash với manifest | `11-container-restore.txt` |
| Instance đã khôi phục được khởi động qua Compose (docs/11 mục 6 bước 3) với bốn biến `TIMESHEET_*` | healthy; log `Outbound delivery PAUSED … (reason: restored); 1 delivery attempt(s) await a decision`; bản xem trước `outbound release` bị chặn `attempt_uncertain`; `outbound resume --confirm` bị từ chối (exit 1); uid 10001; `down` theo tên project | `13-restored-instance-compose.txt` |
| `docker compose config` của dạng `<compose>` nguyên văn trong docs/11 | trường hợp 1 exit 1 (`env file … timesheet.env not found`); trường hợp 2 bind `<project-dir>/data`, image `timesheet:local`, cổng 3000; trường hợp 4: bốn biến đặt trong `<project-dir>/.env` cho kết quả đúng ý | `12-runbook-compose-config.txt` |
| `docker buildx imagetools inspect node:24.21.0-trixie-slim` (docs/11 mục 9 bước 1) | exit 0; index của tag nay là `173f1258…` (build lại 2026-10-06 01:44Z); Dockerfile ghim `8ec5d755…` | `14-base-image-digest.txt` |
| `<compose> build --no-cache` (docs/11 mục 9 bước 3), cùng đúng tag | exit 0, 15 giây; image ID mới `62fb1101…` (110.002.192 byte); sau đó image ID của drill là "No such image"; lớp 1–6 giống, 7–10 khác | `15-build-no-cache.txt` |
| `/app/dist` của image không cache so với một bản build kiểu image tại máy của export thứ ba | 116 file, giống từng byte; không có `sourceMappingURL` trong `/app/dist` | `16-image-dist-compare.txt` |
| CLI host ở chế độ production (`ops-cli.mjs`) | lần 2 16/0: `bootstrap --new-token` chạy được trước khi có quản trị viên đầu tiên và bị từ chối sau đó; `seed` và `run-jobs` bị từ chối; `backup --to <dir> --prune` hai lần giữ lại một backup trong ngày; prune chạy thử; cookie Secure, HttpOnly, SameSite=Strict; health và ready không có dữ liệu riêng tư. Lần 1 có một kỳ vọng sai của probe | `17-ops-cli-run*.txt` |
| Bản build WP3 trước với `JOB_RUNNER=off` trên bản sao `restore --keep-schema --confirm` (docs/11 mục 8 bước 3) | 5/0: restore cảnh báo về `JOB_RUNNER=off`; trong 25 giây không job, lần gửi hay PDF nào thay đổi; schema vẫn là 6 | `18-runner-off.txt` |
| Các lệnh cảnh báo phía host ở docs/11 mục 11 trên thư mục tổng hợp | im lặng với backup mới; "backup too old" với thư mục rỗng và với `-mmin -0` | `19-host-alert.txt` |
| `SMOKE_PORT=47725 NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` trên export 1 | exit 0, 76 file, 1.758 test, SMOKE PASSED (41 PASS), 0 dòng deprecation, 82 giây | `20-verify.txt` |
| Trạng thái Docker và tiến trình cuối | xóa image theo đúng tag, `down` project theo tên; `docker ps --all --filter name=ts-wp5-assess-b` rỗng; không network hay volume; không cổng nào lắng nghe trong 47720–47739 | `98-*.txt` |

### Lần khôi phục độc lập (ý 2)

Bộ dữ liệu có các tài khoản tổng hợp được seed. employee2 chốt kỳ đã qua 2026-10-02 với một ngày thường được ghi có 60 và một
ngày thứ Bảy được ghi có 240. Sau đó người này sửa kỳ đã chốt có kèm lý do và chốt một revision sửa (+30). Họ giữ khoản giữ chỗ
OT 240 phút được seed, và một yêu cầu nghỉ thứ hai 120 phút đã dùng 60. Tổng: đã ghi sổ 870, giữ chỗ 300, khả dụng 570; 5 dòng
sổ cái; 2 revision; 2 PDF và một chữ ký. `cli.js backup` chạy khi server đang chạy. Thêm một phiên làm việc được ghi sau
backup. Nguồn được dừng qua chính handle của nó.

Kết quả:
- Từ chối khôi phục: đích nằm trong `DATA_DIR` đang chạy cho exit 2 `target_inside_data_dir`; đích không rỗng cho exit 2
  `target_not_empty`.
- Lệnh khôi phục kiểm manifest và đặt lệnh tạm dừng (`restored`). Chỉ `operations_state`, một sự kiện audit của lần khôi phục và
  các job bị giữ khác bản sao backup (ở chế độ uncertain có thêm lần gửi bị đánh dấu không chắc chắn).
- Sổ cái, revision, sign-off, yêu cầu nghỉ, tệp đính kèm và phiên làm việc giống nhau từng dòng. Bản khôi phục thiếu đúng phiên
  làm việc được ghi sau backup, nên nó là ảnh tại một thời điểm.
- Qua API của instance đã khôi phục: số dư, mọi dòng sổ cái, yêu cầu nghỉ, revision, view timesheet đã chốt và SHA-256 của cả
  hai PDF đều bằng nguồn. Dòng tạm dừng được ghi log. `/api/admin/operations` hiện lệnh tạm dừng. Health và ready không mang dữ
  liệu riêng tư.
- Đường không chắc chắn (lần 4), drill không chạy tới (`attempts_marked_uncertain` của drill luôn là 0): một lần gửi lại làm khi
  runner của nguồn tắt nằm trong backup như một lần gửi `preparing`. Lệnh khôi phục đánh dấu nó không chắc chắn và giữ job.
  - `outbound resume --confirm` bị từ chối (exit 1), và `release --all` từ chối nó (`attempt_uncertain`).
  - Quyết định "resend" của chủ tạo một lần gửi mới. Không có gì được gửi đi khi instance còn tạm dừng.
  - Sau `resume --confirm`, thư được capture đúng một lần, với PDF của revision 2 (cùng SHA-256) và người nhận `example.invalid`.
  - Job gốc bị giữ không bao giờ được thả, và không phút nào trong sổ cái thay đổi.

Lỗi của probe, giữ lại cho trung thực:
- Lần 1: phiên làm việc ghi sau backup trùng một phiên đã seed (422), nên kiểm tra ảnh tại một thời điểm không có dòng thừa.
- Lần 3: bốn kỳ vọng quá hẹp. Lệnh khôi phục đổi bảng `delivery_attempts`, và một lần gửi `preparing` đọc thành không chắc chắn
  sau khôi phục. Probe còn đếm Message-ID như một người nhận và quên lần gửi đã được chấp nhận trước đó của revision 1.
- Lần nào hành vi của sản phẩm cũng đúng. Probe đã sửa (lần 4 và 5) đạt.

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-B-01 | Medium | `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md`: "Chỗ giữ chỗ và quy ước" (`<compose>`, không có `<image>`), mục 1 bước 5 và 8, mục 6 bước 2–3, mục 8 (nâng cấp bước 1–2, rollback bước 3); cùng `compose.example.yaml` và phần đầu `.env.example` | `12-runbook-compose-config.txt`; `15-build-no-cache.txt`; `git grep TIMESHEET_ 546cdda` chỉ thấy các biến trong `compose.example.yaml` và drill (drill đặt cả bốn, và đổi `TIMESHEET_DATA_DIR` cho giai đoạn 3 và 4) | **Kỳ vọng:** các lệnh trong tài liệu bind `<env-file>`, `<data-dir>` hoặc `<restore-dir>`, và một `<image>` riêng cho từng bản phát hành, như các bước drill mà chúng dẫn chiếu. **Thực tế:** khi env file nằm ở `<env-file>`, `<compose>` nguyên văn thất bại (`env file <project-dir>/timesheet.env not found`). `.env.example` gợi ý `/volume1/docker/timesheet/.env`. Nếu không, Compose bind `<project-dir>/data` (`create_host_path`, thuộc root trên Linux, trong khi runbook chown `<data-dir>`), gắn tag `timesheet:local` và công bố cổng 3000. Mục 6 bước 3 (instance đã khôi phục trên `<restore-dir>`) và rollback bước 3 (image trước) không có cách nào được ghi để đặt `/data` hay image, và `<image>` không bao giờ được định nghĩa. "Ghi lại tag image đang chạy" không xác định được gì sau khi một lần build nâng cấp gắn lại tag `timesheet:local`: ở đây image ID trước là "No such image" sau một lần build lại cùng tag | AC-11 (khôi phục cô lập), AC-15 (rollback tương thích), docs/07 "Backup, restore và nâng cấp" và bước setup 5, gate WP5 "khôi phục đã kiểm chứng", độ trung thực của runbook (WP5-PLAN B ý 4) | Chỉ tài liệu, EN và VI:<br>1. Trong "Chỗ giữ chỗ và quy ước", định nghĩa `<image>` và bốn biến Compose (ví dụ trong `<project-dir>/.env`: `TIMESHEET_ENV_FILE=<env-file>`, `TIMESHEET_DATA_DIR=<data-dir>`, `TIMESHEET_IMAGE=timesheet:<release-commit>`, `TIMESHEET_PORT=3000`).<br>2. Mục 6 bước 3: `TIMESHEET_DATA_DIR=<restore-dir>` dưới tên project riêng.<br>3. Mục 8: mỗi bản phát hành một tag, và ghi image ID lúc build; rollback khởi động tag trước.<br>4. Cho đường dẫn ví dụ của `.env.example` khớp `timesheet.env`, hoặc ghi cần đặt `TIMESHEET_ENV_FILE`.<br>5. Kiểm lại: `docker compose config` của từng dạng trong tài liệu |
| WP5-B-02 | Low | `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md`, mục 4 bước 3 và danh sách kiểm ở mục 2 | `grep -n env-file docs/11…`: env file chỉ xuất hiện ở mục 1, 2 (mode 600), 6 và 8. `backup.ts` chỉ sao chép cơ sở dữ liệu và các file được tham chiếu (allowlist khóa của manifest). Mọi lần khôi phục ở đây đều cần một env file cấp riêng | **Kỳ vọng:** docs/07 dòng 28, "giữ cấu hình bí mật cần thiết một cách an toàn, không in ra", như một phần của sao lưu. **Thực tế:** cả công cụ lẫn runbook đều không giữ nó. Khi mất volume NAS, bản sao trên thiết bị riêng có dữ liệu nhưng không có cấu hình mà instance đã khôi phục cần để khởi động: `APP_ORIGINS`, `PUBLIC_BASE_URL`, `MAIL_FROM`, `TRUSTED_PROXY_ADDRESSES`, và thông tin đăng nhập SMTP trong pilot. Nó cũng không ghi bản phát hành nào đã tạo ra dữ liệu | docs/07 "Backup, restore và nâng cấp"; AC-15 | Chỉ tài liệu, EN và VI:<br>1. Mục 4 bước 3: giữ một bản sao được bảo vệ của `<env-file>` (mode 600, không bao giờ trong git hay chat) cùng bản sao trên thiết bị riêng.<br>2. Ghi commit, digest và image ID của bản phát hành đi kèm.<br>3. Thêm một dòng vào danh sách kiểm ở mục 2 |

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-B5-1 định danh bản phát hành.**
  - Image ID không ổn định theo từng lần build: `75f50c10…` (có cache) và `62fb1101…` (không cache) cho cùng một source; lớp
    7–10 khác nhau về metadata. Nội dung ứng dụng thì tái lập được: `dist/` giống từng byte giữa các export, và `/app/dist` bằng
    một bản build kiểu image tại máy.
  - `package.json` và `app_version` của manifest backup là 0.1.0, giống bản build WP3 `49651c8`. Image không có label revision,
    và `/api/ready` chỉ cho biết schema.
  - Vì vậy gói pilot phải ghi image ID được build trên NAS. Tăng version hoặc thêm label OCI revision là tùy chọn (WP5-REL).
- **R-B5-2 image nền.** Index được ghim `8ec5d755…` chậm một lần build lại Debian so với tag (`173f1258…`, 2026-10-06). Quyết
  định việc làm mới theo mục 9 trước khi build cho pilot.
- **R-B5-3 cảnh báo chỉ ở dev.** `source-map-js` 1.2.1 (high) chỉ là dependency dev; `npm audit --omit=dev` thấy 0, và image
  không chứa package dev nào.
- **R-B5-4 trạng thái backup sau khôi phục.** Instance đã khôi phục báo backup `never` cho tới lần backup đầu tiên của chính nó
  (trạng thái nằm ngoài snapshot theo thiết kế). Thêm "chụp một backup sau khi đối soát" vào ghi chú của runbook.
- **R-B5-5 xác nhận lại R-RA2.** Hai lần `backup --prune` trong cùng ngày giữ lại một thư mục, nên prune cùng ngày sẽ xóa backup
  ghép đôi trước nâng cấp.
- **R-B5-6 người vận hành Windows.** Git Bash đổi đường dẫn container trong `docker run` (chuyển đổi đường dẫn MSYS). Việc này
  chỉ ảnh hưởng người vận hành trên Windows; shell của NAS không bị ảnh hưởng.
- **R-B5-7 thông tin.** `cli.js migrate` in ra `DATABASE_PATH` tuyệt đối (terminal của người vận hành; `/data/timesheet.db`
  trong image).
- **Quan sát.** Ở lần 1, lần gửi của revision 1 chưa chạy lúc backup (attempts 1, chưa có lần gửi: cơ chế thử lại khi gửi trước
  PDF đã được ghi nhận). Lệnh khôi phục đã giữ nó, đúng thiết kế.

## Gate chưa chạy hoặc bị chặn, và lý do

- NAS: toàn bộ NOT VERIFIED (không có phần cứng của chủ): kiến trúc, hệ thống file DSM, quyền sở hữu UID/GID trên một bind mount
  thật, reverse proxy, `TRUSTED_PROXY_ADDRESSES`, NTP, Task Scheduler, bản sao trên thiết bị riêng, lệnh `find` của DSM, và image
  arm64 chạy native. Theo brief, riêng điều này không làm khu vực bị đánh trượt.
- `outbound drop --job <id> --confirm` không được chạy: các bộ dữ liệu này không sinh ra lời nhắc bị giữ nào. Nó được phủ bởi
  `tests/integration/restore.test.ts` trong lần chạy verify 1.758 test; audit này không chạy trực tiếp nó.
- Bản build trước với `JOB_RUNNER=off` chạy như một tiến trình host, không phải như một image trước (xem B-01).
- AC-13 và quy trình tích hợp thuộc khu vực A.

## Xử lý phát hiện trước

- WP4 A-01 (source map trong image): vẫn đã được sửa. Không có map nào dưới `/app/dist` và không có `sourceMappingURL`, và
  `/assets/*.map` trả về 404 (drill).
- R-A3 (giới hạn còn lại của rollback): quy tắc `JOB_RUNNER=off` trong tài liệu hoạt động với bản build WP3 (`18-runner-off.txt`);
  lựa chọn D-1 của chủ vẫn còn mở.
- R-RA2: đã xác nhận lại (R-B5-5).
- R-A8 và R-RA9: không kiểm lại (mọi lần chạy ở đây đều đặt đường dẫn tường minh).
- WP4-I-1..I-5 và cảnh báo dev: không đổi.

## Tách sẵn sàng phần mềm, phép chủ và kết quả pilot

- **Sẵn sàng phần mềm, khu vực B.** Bản phát hành build tái lập được từ một export sạch. Image được ghim, không chạy root và
  không có file cấm. Sao lưu và khôi phục, kể cả đối soát lần gửi không chắc chắn, đã được kiểm chứng trên máy phát triển (Docker
  Desktop, amd64) với dữ liệu tổng hợp. Runbook cần các sửa tài liệu B-01 và B-02 trước khi gói pilot có thể dựa vào nó. NAS là
  NOT VERIFIED.
- **Phép của chủ.** Chưa yêu cầu và chưa được cấp. Không triển khai, không thư thật, không dữ liệu production.
- **Kết quả pilot.** Không có; chưa chạy pilot nào.

Các dữ kiện phía vận hành cho gói pilot (chỉ dữ kiện; đầu vào của chủ chỉ nêu tên, không bao giờ yêu cầu):
1. Cách bind của Compose và tag image cho từng bản phát hành (B-01), và việc giữ env file (B-02).
2. Các bước kích hoạt và tắt không nằm trong docs/11 theo thiết kế (`PRODUCTION_SENDING_ENABLED`, `OUTBOUND_MODE=smtp`,
   `SMTP_*`, thời điểm kích hoạt, cách triển khai theo giai đoạn cho kỳ đầu tiên). Chúng được lên kế hoạch cho WP5-REL.
3. Chưa có thẻ rollback cho lần cài đặt đầu tiên: tắt, giữ dữ liệu, quay về Excel.
4. Hồ sơ bản phát hành: commit, digest, image ID build trên NAS và quyết định làm mới image nền (R-B5-1, R-B5-2).
5. Biểu mẫu chứng minh khôi phục trên NAS và cảnh báo phía host vẫn là bước của chủ.
6. Đầu vào cần từ chủ: model NAS, `uname -m` và phiên bản DSM; đường dẫn dữ liệu và backup; UID/GID; tên host HTTPS và địa chỉ
   proxy; nhà cung cấp SMTP, với thông tin đăng nhập chỉ trong env file được bảo vệ; người nhận; lựa chọn D-1 (R-A3).

## Một bước tiếp

Coordinator giao một bản sửa tài liệu có phạm vi cho WP5-B-01 và WP5-B-02 (docs/11 EN và VI, tùy chọn phần đầu `.env.example` và
một comment trong `compose.example.yaml`), theo [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md) và `addresses_audit: WP5-ASSESS-B`.
Bản sửa có thể gộp vào WP5-REL. Sau đó chạy freeze, gate và một lần kiểm lại độc lập trên digest mới: `docker compose config` của
từng dạng trong tài liệu, và khởi động theo mục 6 bước 3 trên `<restore-dir>`.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-ASSESS-B, lần 1, agent `a76dbe4b854f423f7` (theo board). Các
  tác giả là người triển khai và người sửa của WP1–WP4 và WP5-PLAN, như ghi trên board. Reviewer này không thuộc nhóm đó và không
  phải auditor của WP5-ASSESS-A.
- **Context mới; xác nhận reviewer không viết thay đổi:** đã xác nhận. Context mới. Không sửa source, test, tài liệu, board,
  STATE, NEXT_ACTION hay checkpoint. Chỉ viết: báo cáo này và bản dịch, mục Results của brief và `evidence/WP5-ASSESS-B/`.
- **Digest trước/sau; bằng chứng gate của snapshot đó:** `26fcc969…` trước và sau, ở cả ba dạng (và trên ba export). Gate là
  WP4-REGATE4 PASS trên cùng freeze; audit này tự chạy lại verify, drill và các lần khôi phục.
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_REVIEW_B.md` và `.vi.md`, là file mới. Không báo cáo cũ
  nào bị đổi.
- **Xử lý phát hiện và task sửa/recheck tiếp của coordinator:** WP5-B-01 và WP5-B-02 chuyển sang một bản sửa tài liệu có phạm vi
  (hoặc gộp vào WP5-REL), rồi freeze, gate và một lần kiểm lại khu vực này.
