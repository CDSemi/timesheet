# Kiểm toán độc lập cuối của WP5 — bản đóng băng package-final

Hoàn thành theo mẫu [REVIEW](../templates/REVIEW.vi.md). Bản gốc tiếng Anh (nguồn chuẩn): [WP5_REVIEW_FINAL.md](WP5_REVIEW_FINAL.md). Brief và kết quả:
[WP5-FINAL-AUDIT](tasks/WP5-FINAL-AUDIT.md). Bằng chứng: `handoff/delivery/evidence/WP5-FINAL-AUDIT/` (mục lục trong `00-README.txt`).

- **Gói/ngày/người review và model/effort quan sát được:** WP5, kiểm toán cuối trên bản đóng băng package-final
  (WP5-FINAL-AUDIT, lần 1). 2026-10-06, từ 22:09Z đến khoảng 22:35Z. Người review: một subagent `timesheet-auditor`. Model tự
  báo `claude-opus-5-5`; không quan sát được effort. Model mạnh nhất trong số các tác giả của snapshot là `claude-opus-5-5`
  (hồ sơ WP1–WP4); các tác giả WP5 tự báo `claude-sonnet-5-5`. Quy tắc về độ mạnh của auditor được thỏa.
- **SHA commit và digest nguồn được review; commit chưa push; độ đầy đủ của nguồn:** commit
  `74d5bfec6700126da4105b5d97f5efe943f896f5` (`freeze_commit` của WP5-GATE), digest
  `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba` (779 file, không tính `handoff/`). HEAD = origin/main =
  `74d5bfe` trước và sau; không có commit chưa push. Digest bằng nhau trước và sau trong repository
  (`scripts/source-digest.mjs`), ở dạng `git ls-tree` và trên hai bản export `git archive` sạch. Không file nào ngoài
  `handoff/` khác HEAD. Nguồn đầy đủ.
- **Quyết định: FIX REQUIRED.** Hai phát hiện tài liệu mức Low (WP5-F-01 trong runbook và gói pilot, WP5-F-02 trong gói
  pilot). WP5-B-01 và WP5-B-02 đã được giải quyết. Vùng B đạt trên digest mới. Không thấy lỗi chặn nào theo danh sách chặn
  của docs/06: ngoài hai điểm trên, phần mềm vẫn sẵn sàng.

## Phạm vi đã thực sự xem và chạy

Đã đọc: AGENTS.md (trên đĩa), brief, WP5_REVIEW và các tài liệu nó nêu (docs/02, 05, 06, 07, 09), docs/11 và docs/12 (EN và
VI), WP5_REVIEW_B, các mục B đến G của WP5-PLAN, kết quả và bằng chứng của WP5-FIXB, WP5-AC13, WP5-REL, WP5-GATE và
WP5-PILOT, `WP5_PILOT_PACKET.md` và `.vi.md`, cùng `WP5_HANDOFF.md` và `.vi.md`. Code đã lần theo: `config.ts`, `cli.ts` (lệnh
nào đọc cấu hình gửi thư), `routes/admin.ts` (route kích hoạt), `services/automation.ts`, `http/security.ts` (kiểm tra origin
và content-type), `app.ts` (health và ready), `services/operationsStatus.ts` và `client/components/OperationsStatus.tsx` (trạng
thái hiển thị gì), `mail/captureAdapter.ts`, `mail/smtpAdapter.ts` (mã lỗi), `Dockerfile`, `.dockerignore`,
`compose.example.yaml`, `.env.example`, `scripts/container-drill.mjs`.

Không làm lại: phần thay đổi của vùng A (WP5-ASSESS-A lần 2 phụ trách). Tôi không đọc báo cáo đó.

## Bảng bằng chứng

| Lệnh | Kết quả / mã thoát | Bằng chứng |
|---|---|---|
| Digest trước: `scripts/source-digest.mjs`, dạng `git ls-tree`, hai bản export `git archive 74d5bfe` | `0a64a75f…` (779 file) ở cả bốn; hai file tar giống hệt; danh sách export = danh sách ls-tree | `00-*`, `01-*` |
| `npm ci` trong cả hai bản export (`--trace-deprecation --pending-deprecation`) | exit 0/0, 161 gói, lockfile không đổi, 0 dòng deprecation | `02-npm-ci.txt` |
| `npm run build` trong cả hai bản export, SHA-256 từng file của `dist/` | exit 0/0; 230 file, 4.044.281 byte, giống hệt từng byte; cũng bằng dist của `546cdda` mà WP5-ASSESS-B đã đo | `03-build.txt`, `04-*` |
| `git diff --stat 546cdda 74d5bfe -- . ':!handoff'` | chỉ `.env.example`, `compose.example.yaml`, README, docs/11, docs/12 (EN, VI) và hai file test AC-13 | `05-diff-scope.txt` |
| `npm run drill:container -- --work <task>\drill --project ts-wp5-final --wp3 <task>\wp3` (đã chuẩn bị `git archive 49651c8`) | exit 0, `DRILL STAGES 1-6 PASSED`, 208 PASS, 0 FAIL (33/31/57/35/27/23), 5 phút | `06-*`, `08-drill*.txt` |
| Quét độc lập danh sách file của image drill; `docker image inspect` | 10.331 đường dẫn, FORBIDDEN TOTAL 0; `/app` = `dist`, `node_modules`, `package.json`; 0 devDependency; User `10001:10001`; image `sha256:03dd6422…` (110.002.055 byte) | `10-*`, `11-*` |
| `docker compose config` của `<compose>`, `<compose-restored>` và `<compose-previous>`, biến trong `<project-dir>/.env`, chạy từ thư mục khác | exit 0 ×3: bản live gắn `<data-dir>`, `<env-file>`, tag của release, cổng từ `.env`; bản restore gắn `<restore-dir>` dưới `<project>-restored`; bản rollback gắn tag trước, `<restore-dir>`, `JOB_RUNNER: "off"` dưới `<project>-rollback` | `12-*` |
| Mục 16 bước 1 `<compose> run --rm --no-deps -T timesheet <cli> migrate` trên `<data-dir>` mới | exit 0, áp dụng schema 1–13 (image được build trên đường đi) | `13-migrate-first.txt` |
| Mục 1 bước 8 (`up --detach --build`, `ps`, `logs`, `docker image inspect`) | healthy; mount `<data-dir>` → `/data`; root chỉ đọc; cổng loopback; đã ghi ID image | `14-live-up.txt` |
| Mục 3 bootstrap; admin, nhân viên, chữ ký tổng hợp, một kỳ đã ký kèm PDF | exit 0; các mã 201; PDF sẵn sàng sau 6 s (một lỗi probe, đã sửa và chạy lại: xem `16-*`) | `15-*`, `16-*` |
| Lệnh console ở mục 13 bước 5, lấy nguyên văn từ docs/11 của bản export, chạy trong Edge headless sau khi đăng nhập qua UI; lệnh xóa ở mục 14 bước 1 | thời điểm quá khứ 422 `activation_in_past`; lý do trống 422 `reason_required`; đặt → trạng thái hiện thời điểm; xóa bằng `null` → "Not activated"; từ origin không có trong `APP_ORIGINS` 403 `origin_rejected`. Lần chạy 2: 9/0 (lần 1 đọc màn hình cũ: lỗi probe) | `18-*` |
| `OUTBOUND_MODE=smtp` không có cờ: `<compose> restart`, rồi `up --detach --force-recreate --no-build`, rồi CLI | restart giữ môi trường cũ; recreate đọc lại và server từ chối khởi động, chỉ nêu tên cờ; `cli.js migrate` thoát 0; trả lại và recreate: healthy | `19-env-reread.txt` |
| Mục 13 bước 3 (`backup`, `ls -1 <backup-dir>`, `sha256sum <backup-dir>/<backup-name>/manifest.json`); một lần ghi sau backup | backup `succeeded`, 2 file; in ra hash của manifest; phiên làm việc sau backup được tạo | `20-*`, `21-*`, `22-*` |
| Dừng bản live; mục 6 bước 2 container restore dùng một lần | exit 0; manifest đã xác minh; `paused: true, reason: restored` | `23-restore.txt` |
| Mục 6 bước 3 `<compose-restored> up --detach --no-build`; `ps`; `docker inspect`; log; xem trước ở mục 7 | dự án riêng `ts-wp5-final-live-restored`; `/data` = `<restore-dir>`; image của release (cùng ID); healthy; `Outbound delivery PAUSED … (reason: restored)`; xem trước `outbound release` và `resume` thoát 2 | `24-restored-instance.txt` |
| API của bản đã restore | phiên trước backup 200, phiên sau backup 404 (đúng thời điểm); revision kèm PDF; operations báo tạm dừng `restored`; backup `never`; health và ready tối giản; JSON operations không có mật khẩu, địa chỉ, tên hay id phiên | `25-check-restored.txt` |
| Đọc thư mục backup ở chế độ chỉ đọc (`backup-facts.mjs`) | manifest không chứa cấu hình; hash file và CSDL khớp; 4 sự kiện audit kích hoạt, mỗi sự kiện có lý do; integrity ok | `26-*` |
| `SMOKE_PORT=47762 NODE_OPTIONS=… npm run verify` trên export 1 | exit 0, 77 file, 1.759 test, SMOKE PASSED, 0 dòng deprecation | `29-*` |
| Test AC-13 chạy riêng ×2 và với `TZ=Asia/Tokyo` | exit 0 ×3 (test 1,8 s, tổng 3,8 s) | `31-*` |
| Các khóa env được nêu trong docs/11, docs/12 và gói pilot | mọi khóa của ứng dụng có trong `.env.example` hoặc `src/server/config.ts` (`JOB_RUNNER`, `STATIC_DIR` trong `.env.example` và `index.ts`); `TIMESHEET_*` là biến Compose; `NODE_IMAGE_DIGEST` là ARG của Dockerfile; `SQLITE_BUSY` là mã lỗi | `30-*` |
| Tương đương EN/VI (`parity.mjs`) | docs/11, docs/12, gói pilot, WP5_HANDOFF: bằng nhau về tiêu đề, mục đánh số, gạch đầu dòng, dòng bảng, khối lệnh (giống hệt), ô đánh dấu và liên kết; code span chỉ khác ở chỗ placeholder được dịch; khác biệt của README có từ trước WP5 | `09-*` |
| `npm audit --omit=dev`; `validate_package.py --preflight` | 0 lỗ hổng; PASS (89 cặp) | `32-*`, `35-*` |
| Digest được nêu của `8e99d2c`, `85838b5`, `546cdda`; index của base image | đều bằng số đã nêu; index của tag `173f1258…`, bản ghim `8ec5d755…` (R-B5-2 vẫn mở) | `33-*`, `34-*` |
| Trạng thái cuối | cả hai dự án đã down theo tên, image đã xóa theo đúng tag; `docker ps --all --filter name=ts-wp5-final` rỗng; không network, volume hay cổng nghe nào trên 47760–47779; digest không đổi ở mọi dạng | `27-*`, `28-*`, `36-*`, `99-*` |

## Phát hiện

| ID | Mức | File / hàm | Tái hiện | Mong đợi / thực tế | Quy tắc / AC | Sửa có giới hạn |
|---|---|---|---|---|---|---|
| WP5-F-01 | Low | `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md`: mục 13 bước 2 (gạch đầu tiên), bước 4 (gạch thứ hai và ba), mục 14 bước 4. `handoff/delivery/WP5_PILOT_PACKET.md` và `.vi.md`: mục 2 "Tự kiểm tra ở chế độ capture" ô đầu tiên, mục 6 bước 1. Nguồn trạng thái: `services/operationsStatus.ts` `deliverySetupOf`, `client/components/OperationsStatus.tsx` `StatusPanel`; CLI: `cli.ts` | Bản live ở chế độ capture: màn hình trạng thái hiện "Sender address: Configured", "Outbound mode: Capture only (nothing leaves the server)", "Not activated" (`18-activation-browser-run2.txt`). `GET /api/admin/operations` có `sender: {configured: true, outbound_mode: "capture"}` và không có trường cờ gửi (`17-check-live.txt`); không file nguồn nào đưa `PRODUCTION_SENDING_ENABLED` vào trạng thái. Với `OUTBOUND_MODE=smtp` mà không có cờ, server từ chối, nhưng `cli.js migrate` thoát 0 (`19-env-reread.txt`); `cli.ts` chỉ đọc cấu hình gửi thư cho `backup`, `restore`, `run-jobs` và `seed` | **Mong đợi:** mọi bước kiểm tra khi kích hoạt và hủy kích hoạt nêu một điều người vận hành quan sát được. **Thực tế:** "trạng thái quản trị cho thấy … cờ tắt" (và "cờ bật") không kiểm tra được: trạng thái không có trường đó. Nếu hiểu là cờ duy nhất trên màn hình, "Sender address: Configured", thì nó trái với "tắt". "Server và CLI từ chối khởi động" đúng với server và với `backup`, `restore`, không đúng với `migrate`, `outbound` hay `bootstrap` | Phạm vi 3 của WP5-FINAL-AUDIT (mọi bước chạy được); WP5-PLAN B mục 4 (runbook đúng thực tế); AC-14 (thiết lập bộ gửi hiển thị được); độ chính xác của gói pilot theo docs/06 | Chỉ sửa tài liệu, EN và VI, runbook và gói pilot: <br>1. Thay "cờ tắt/bật" bằng các sự thật mà màn hình hiển thị: Outbound mode "Capture only (nothing leaves the server)" hoặc "SMTP (real sending)", và thời điểm kích hoạt.<br>2. Kiểm tra cờ ngay trong `<env-file>` mà không in giá trị, ví dụ `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>` (0 hoặc 1).<br>3. Viết "server, và các lệnh CLI đọc cấu hình gửi thư (`backup`, `restore`), từ chối khởi động". Tùy chọn: nêu nhãn màn hình "Running" bên cạnh "leased" |
| WP5-F-02 | Low | `handoff/delivery/WP5_PILOT_PACKET.md` và `.vi.md`, mục 8, đoạn ngay dưới tiêu đề | Mục 0 nêu bản đóng băng package-final `74d5bfe`; mục 8 viết "Câu trả lời khác mặc định hiện tại của D-3, D-5, D-6 hoặc D-8 sẽ thành một việc bổ sung nhỏ trước khi đóng băng package-final". Lựa chọn khuyến nghị (b) của D-8 khác mặc định hiện tại | **Mong đợi:** gói cho chủ sở hữu biết một câu trả lời khác mặc định bây giờ dẫn tới gì: một vòng sửa (sửa, đóng băng, gate, kiểm toán độc lập) trước khi kích hoạt, sau đó định danh bản phát hành ở mục 0 và 6 được cập nhật. **Thực tế:** gói nêu một bước đã qua, nên chủ sở hữu không thấy rằng làm theo khuyến nghị D-8 sẽ đổi bản phát hành mà gói nêu | "Gói pilot cụ thể" của docs/06; WP5_REVIEW (tách sẵn sàng phần mềm khỏi phép của chủ sở hữu) | Chỉ sửa handoff (digest không đổi), EN và VI: viết lại câu đó như trên. Cách viết đã lỗi thời đó cũng có trong `pending_owner_question.blocking` của board; đó là hồ sơ của coordinator |

## Rủi ro và cải tiến tùy chọn (không phải lỗi)

- **R-F1 bản đã restore trong lúc pilot.** `<compose-restored>` đọc `<env-file>` của bản live. Sau khi kích hoạt, file đó ở
  chế độ SMTP, trong khi mục 6 bước 3 nói bản kiểm tra chạy "ở chế độ capture". Trạng thái tạm dừng gửi giữ mọi lần gửi cho
  tới `outbound resume --confirm`, nên không có gì rời đi trong lúc kiểm tra. Tùy chọn: với bản chỉ để kiểm tra, trỏ
  `TIMESHEET_ENV_FILE` tới bản sao chế độ capture được bảo vệ đã giữ ở mục 13 bước 3.
- **R-F2 đưa dữ liệu đã restore thành bản live.** Runbook không nói cách để bản sao đã restore trở thành bản live sau mục 15
  bước 5 và mục 7. Dự án và thư mục dữ liệu nào chạy tiếp? `<project-dir>/.env` sẽ cần `TIMESHEET_DATA_DIR`. Backup và cảnh
  báo máy chủ khi đó nằm ở `<restore-dir>/backups`. Tương tự, "nâng cấp lại" sau một rollback ở mục 8 chưa có dạng lệnh. Kỳ
  đầu tiên không cần cả hai; hãy ghi vào tài liệu trước khi dựa vào chúng.
- **R-F3 định danh image (R-B5-1) được xác nhận lại.**
  - Ở đây, ba lần build cùng mã nguồn cho ba ID image: drill `03dd6422…`, bản build của `compose run` `f22b659a…` và
    `up --build` `bbfef4d7…`. Của gate là `0addd200…`.
  - Nội dung ứng dụng ổn định: các file `dist/` giống hệt từng byte.
  - Mục 16 bước 1 build image khi chưa có, và mục 1 bước 8 build lại dưới cùng tag. Hãy ghi ID sau lần build cuối, như
    runbook nói.
- **R-F4 quyền root trên NAS.** `<data-dir>` có quyền 700 và thuộc UID 10001. Vì vậy các lệnh `ls -1 <backup-dir>` và
  `sha256sum` (mục 13 bước 3, mục 15 bước 5) và các lệnh Docker cần root (`sudo -i`) trên DSM. Tùy chọn: nói điều này một
  lần.
- **R-F5 cách hiện thời điểm.** Trạng thái hiện thời điểm kích hoạt theo múi giờ của trình duyệt mà không ghi múi giờ:
  `2027-01-01T00:00:00Z` hiện là "2026-12-31 16:00". Tùy chọn: ghi chú bên cạnh "Kiểm tra trạng thái quản trị hiển thị thời
  điểm đó".
- **R-F6 chặn dán trong console.** Edge và Chrome có thể yêu cầu người vận hành gõ "allow pasting" trước khi chạy dòng đã
  dán. Bước này vẫn chạy được.
- **R-F7 R-B5-2 vẫn mở.** Index của tag là `173f1258…`, bản ghim là `8ec5d755…` (đọc lại lúc 22:26Z).
- **O-1 cách viết trong handoff.** `WP5_HANDOFF.md` và `.vi.md` gọi các phát hiện của vùng B là "hai phát hiện tài liệu mức
  thấp" và "(low, documentation)"; WP5-B-01 là Medium. Gộp việc sửa vào WP5-ACCREC, task sẽ viết lại file đó.
- **O-2 các sai lệch có ghi nhận của lần kiểm toán này.**
  - Các lệnh trong tài liệu được chạy với ba phần thêm:
    - `--name ts-wp5-final-restore-1` cho container restore dùng một lần, theo tiền tố của task;
    - `-T` cho `<compose> run`, để không dùng TTY;
    - `MSYS_NO_PATHCONV=1`, chỉ vì Git Bash (R-B5-6).
  - Một lệnh shell của lần kiểm toán này có một lệnh `cp` thừa chép một file lên chính nó kèm `2>/dev/null`, trái quy tắc
    vận hành. Nó không thay đổi gì và không kết quả nào phụ thuộc vào nó.
  - Ba lỗi probe đã được sửa và chạy lại; tất cả vẫn được giữ trong bằng chứng:
    - một độ lệch giờ địa phương thay cho thời điểm UTC;
    - một màn hình cũ sau khi chỉ đổi hash;
    - hai tên sai trong `backup-facts`.

## Các gate bắt buộc chưa chạy hoặc bị chặn, và lý do

- NAS: CHƯA ĐƯỢC KIỂM CHỨNG (không có phần cứng của chủ sở hữu). Gồm hệ thống file DSM, UID/GID trên bind mount thật, reverse
  proxy, `TRUSTED_PROXY_ADDRESSES`, NTP, Task Scheduler, bản sao trên thiết bị riêng, cảnh báo máy chủ và image arm64 gốc.
  Theo brief, điều này không làm lần kiểm toán thất bại.
- Chưa thử SMTP thật: `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt. Gồm lời nhắc lặp lại (D-7), cách phân loại TLS
  (D-8, chỉ đọc từ `smtpAdapter.ts`) và việc nhà cung cấp chấp nhận.
- Chưa khởi động `<compose-previous> up` (chỉ config, như brief yêu cầu). Đường rollback đã chạy ở drill stage 5 với bản
  build trước dưới dạng tiến trình trên máy chủ.
- Chưa thử `outbound drop`: không có lời nhắc bị giữ nào phát sinh. `tests/integration/restore.test.ts` bao phủ nó trong
  verify.
- Phần thay đổi của vùng A thuộc WP5-ASSESS-A lần 2.

## Xử lý các phát hiện trước

- **WP5-B-01 (Medium): đã giải quyết.**
  - `<image>`, bốn biến Compose trong `<project-dir>/.env`, `<compose-restored>` và `<compose-previous>` đã được định nghĩa
    (EN và VI).
  - Cả ba dạng qua `docker compose config` từ một thư mục làm việc không liên quan.
  - Bản đã restore được khởi động từ một backup tạo tại đây, dưới dự án riêng. Nó gắn `<restore-dir>` và image của release
    (cùng ID) và khởi động ở trạng thái tạm dừng.
  - Mục 8 dùng một tag cho mỗi release, ghi ID image và rollback về `<previous-image>` với `JOB_RUNNER=off`.
  - Phần đầu `.env.example` trỏ tới `TIMESHEET_ENV_FILE`.
- **WP5-B-02 (Low): đã giải quyết.**
  - Mục 4 bước 3 giữ một bản sao được bảo vệ của `<env-file>` (quyền 600) cùng bản sao trên thiết bị riêng, kèm commit
    release, digest và ID image.
  - Danh sách ở mục 2 có dòng tương ứng (EN và VI).
  - Manifest của backup không chứa cấu hình (`26-backup-facts-run2.txt`), điều này xác nhận nhu cầu đó.
- R-B5-4 nay là ghi chú trong runbook (mục 7, mục 16 bước 6), và bản đã restore hiện backup `never`. R-B5-1 và R-B5-2 được
  ghi trong docs/12. R-B5-5 (R-RA2) và R-RA9 là ghi chú trong runbook (mục 16).

## Vùng B trên digest mới: PASS

- **Build tái lập được.** Hai bản export sạch cho file tar giống hệt và đúng digest đã ghi. `npm ci` không đổi lockfile và
  không in dòng deprecation nào. `dist/` giống hệt từng byte và bằng bản build `546cdda` đã kiểm toán.
- **Image.** Image được ghim, không chạy bằng root (10001) và chỉ đọc khi chạy, không có file cấm và không có dev dependency.
- **Drill.** Stage 1–6 đạt trên bản đóng băng này: 208/0.
- **Restore đã kiểm chứng.** Một lần restore độc lập theo các dạng container trong tài liệu ở trạng thái tạm dừng, nhất quán
  và đúng thời điểm.
- **Riêng tư vận hành.** Health và ready tối giản. JSON operations không có mật khẩu và không có trường cá nhân. Đầu ra CLI
  chỉ có số đếm. Log không có token hay mật khẩu (drill).

## Ghi chú phát hành, phần bổ sung của runbook và gói pilot

- **Các bước chạy được.** Mọi bước mới của runbook dùng các placeholder đã định nghĩa. Tôi đã chạy những bước sau trên dữ
  liệu tổng hợp:
  - lệnh console kích hoạt (nguyên văn), lệnh xóa, hành vi recreate và việc từ chối khi thiếu cờ;
  - các lệnh backup trước kích hoạt;
  - lệnh migrate tường minh.

  Bước console chạy được và an toàn như đã viết:
  - nó cần một quản trị viên đã đăng nhập, với cookie `Secure`, `HttpOnly`, `SameSite=Strict`;
  - origin phải có trong `APP_ORIGINS`;
  - bắt buộc có lý do, và thời điểm không được ở quá khứ;
  - lệnh gọi được audit, có lưu lý do;
  - lệnh xóa hoạt động.

  WP5-F-01 là ngoại lệ.
- **Khóa env.** Mọi khóa được nêu đều tồn tại (xem bảng).
- **Quyết định của chủ sở hữu.** D-1 đến D-15 ở mọi nơi đều ghi "recommended; owner decision pending" hoặc "pending". Không
  quyết định nào được trình bày như đã quyết, và board chưa có câu trả lời nào.
- **Tương đương EN/VI.** Đạt.
- **Mâu thuẫn.** Không thấy mâu thuẫn nào với docs/05, docs/06 hay docs/07. Các giới hạn đã biết theo WP5-PLAN mục F (mọi
  mục PR và PB) và các mục R-WA và R-B5 được nêu tên.
- **Gói pilot.**
  - Gói đầy đủ so với WP5-PLAN mục C.
  - Các mẫu lấy từ một bản export sạch của `74d5bfe`, chỉ có người nhận `example.invalid`. Các PDF đã được render; tôi đã xem
    2 trong 4 bản render, chúng là tổng hợp và cho OT đúng với các phiên mẫu.
  - Các số liệu trích từ gate khớp với bằng chứng của gate.
  - Một lần quét không thấy máy chủ, địa chỉ, thông tin đăng nhập, chữ ký hay dữ liệu cá nhân thật nào.
  - Biên bản cho phép giữ bốn sự thật tách biệt. 0 trên 35 ô được đánh dấu.
  - WP5-F-02 là ngoại lệ.

## Sẵn sàng phần mềm, phép của chủ sở hữu và kết quả pilot

- **Sẵn sàng phần mềm.** Không có lỗi chặn nào theo danh sách chặn của docs/06. Danh sách đó gồm OT sai, rò rỉ riêng tư, sự
  kiện sổ cái bị trùng hay mất, ký xác nhận giả, mất revision, gửi lại mù quáng sau khi không chắc chắn và restore thất bại.
  Bằng chứng:
  - AC-13 đạt khi chạy riêng và trong verify;
  - drill và restore đạt;
  - bản phát hành tái lập được.

  Trạng thái sẵn sàng được ghi nhận sau hai lần sửa tài liệu mức Low và lần kiểm tra lại của chúng. NAS CHƯA ĐƯỢC KIỂM CHỨNG.
- **Phép của chủ sở hữu.** Chưa được yêu cầu và chưa được cấp. Chưa triển khai gì, chưa gửi thư thật nào và thời điểm kích
  hoạt vẫn trống.
- **Kết quả pilot.** Chưa có; chưa chạy pilot nào.

## Một hành động tiếp theo

Coordinator giao một lần sửa tài liệu có giới hạn cho WP5-F-01 và WP5-F-02, dùng [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md)
và `addresses_audit: WP5-FINAL-AUDIT`. Lần sửa này có thể dùng chung một task với các phát hiện của WP5-ASSESS-A lần 2 nếu
chúng chạm cùng các mục.
- WP5-F-01 sửa docs/11 (EN và VI) và gói pilot.
- WP5-F-02 chỉ sửa gói pilot.

Sau lần sửa là một lần đóng băng, một gate và một lần kiểm tra lại các dòng đã đổi trên digest mới. Lần kiểm tra lại bao
gồm các sự thật về trạng thái được nêu ở mục 13 và 14, và các mục 2, 6 và 8 của gói pilot. Nếu docs/11 thay đổi, định danh
của gói (mục 0 và 6) được cập nhật theo bản đóng băng mới. O-1 đi vào WP5-ACCREC.

## Nguồn gốc subagent độc lập

- **Task/lần review, ID người review và ID tác giả được review:** WP5-FINAL-AUDIT, lần 1, một subagent `timesheet-auditor`
  mới. Các tác giả là những người triển khai và sửa WP1–WP4, WP5-PLAN, WP5-FIXB, WP5-AC13, WP5-REL và WP5-PILOT, như board
  ghi. Người review này không phải ai trong số họ, và không phải auditor của WP5-ASSESS-A (lần 1 và 2) hay WP5-ASSESS-B.
- **Ngữ cảnh mới; xác nhận người review không viết thay đổi nào:** xác nhận. Không sửa source, test, tài liệu, board, STATE,
  NEXT_ACTION hay checkpoint. Đã viết: báo cáo này và bản dịch, mục Results của brief và chỉ `evidence/WP5-FINAL-AUDIT/`.
- **Digest nguồn trước/sau; bằng chứng gate cho snapshot đó:** `0a64a75f…` trước và sau, trong repository, ở dạng
  `git ls-tree` và trên hai bản export. Gate là WP5-GATE PASS trên cùng bản đóng băng; lần kiểm toán này tự chạy lại build,
  drill, verify, AC-13 và một lần restore.
- **Đường dẫn báo cáo mới, giữ lịch sử review trước:** `handoff/delivery/WP5_REVIEW_FINAL.md` và `.vi.md`, các file mới.
  Không báo cáo cũ nào bị sửa.
- **Xử lý phát hiện và task sửa/kiểm tra lại tiếp theo của coordinator:** WP5-F-01 và WP5-F-02 đi vào một lần sửa tài liệu
  có giới hạn, rồi đóng băng, gate và kiểm tra lại. WP5-B-01 và WP5-B-02 đã đóng.
