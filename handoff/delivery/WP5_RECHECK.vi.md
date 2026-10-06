# Recheck độc lập khép lại WP5 — bản đóng băng sửa tài liệu

Hoàn thành theo mẫu [REVIEW](../templates/REVIEW.vi.md). Bản gốc tiếng Anh (nguồn chuẩn): [WP5_RECHECK.md](WP5_RECHECK.md).
Brief và kết quả: [WP5-RECHECK](tasks/WP5-RECHECK.md). Bằng chứng: `handoff/delivery/evidence/WP5-RECHECK/` (mục lục trong
`00-README.txt`). Các báo cáo trước giữ nguyên: [WP5_REVIEW_FINAL](WP5_REVIEW_FINAL.vi.md) và [WP5_REVIEW_A2](WP5_REVIEW_A2.vi.md).

- **Gói/ngày/người review và model/effort quan sát được:** WP5, recheck khép lại (WP5-RECHECK, lần 1). 2026-10-06, từ 23:12Z
  đến khoảng 23:35Z. Người review: một subagent `timesheet-auditor` mới, model tự báo `claude-opus-5-5`; không quan sát được
  effort. Model mạnh nhất trong số các tác giả của snapshot là `claude-opus-5-5` (hồ sơ WP1–WP4); các tác giả và người sửa
  của WP5 tự báo `claude-sonnet-5-5`. Người review không yếu hơn tác giả nào.
- **SHA commit và digest nguồn được review; commit chưa push; độ đầy đủ của nguồn:**
  - Commit `014bd47a8d906c944d2781eba4f2b91c5a532419` (`freeze_commit` của WP5-REGATE2). HEAD = `origin/main` = `014bd47`
    trước và sau; không có commit chưa push.
  - Digest `150420e76cbd5daf167d4cb74006da5438b2bd132b63976a25cbcf4ff6533e61` (779 file, không tính `handoff/`), bằng digest
    ghi nhận của gate. Ghi lại trước (23:12Z) và sau (23:28Z, và lần nữa ở cuối) theo ba dạng: `scripts/source-digest.mjs`,
    dạng `git ls-tree`, và một bản export `git archive 014bd47` sạch.
  - Không file nào ngoài `handoff/` khác HEAD. Nguồn đầy đủ. Các thay đổi gói pilot của WP5-PKTID là file handoff chưa commit;
    chúng không đổi digest.
- **Quyết định: PASS.** Cả bốn phát hiện mức Low đã được giải quyết trên bản đóng băng này, các sửa rủi ro nhỏ đều chính xác,
  gói pilot nêu đúng bản phát hành đã qua gate lại, và EN/VI tương đương. Phần thay đổi kể từ `74d5bfe` chỉ là tài liệu. Không
  thấy lỗi mới; các nhận xét bên dưới là rủi ro và đề xuất tùy chọn.

## Phạm vi đã thực sự xem và chạy

- Đã đọc: AGENTS.md (trên đĩa), brief, WP5_REVIEW, docs/05, 06, 07, 11 và 12 (EN và VI ở chỗ thay đổi), WP5_REVIEW_FINAL và
  WP5_REVIEW_A2 (phát hiện, rủi ro, bằng chứng), kết quả của WP5-FIXD, WP5-REGATE, WP5-FIXD2, WP5-REGATE2 và WP5-PKTID cùng
  bằng chứng của chúng, gói pilot (EN và VI) và `pending_owner_question` trên board.
- Code đã lần theo: `config.ts` (`parseOutbound`), `cli.ts` (lệnh nào đọc cấu hình gửi thư), `index.ts` (khởi động server),
  `services/operationsStatus.ts` (`deliverySetupOf`, `operationsStatusJson`), `client/components/OperationsStatus.tsx`
  (`StatusPanel`), `client/components/format.ts` (`instantText`, `displayZone`), `domain/reminders.ts` (`reviewLink`),
  `services/notifications.ts` (điều kiện kích hoạt), `client/components/AppShell.tsx` (`useHashRoute`), `client/App.tsx` (cổng
  đăng nhập), `client/components/deliveryModel.ts`, `mail/captureAdapter.ts`, `compose.example.yaml`, `.env.example`.
- Đã chạy trên bản export sạch của `014bd47`, Git Bash, Node v24.21.0 portable đứng đầu PATH, script npm chạy bằng Git Bash
  (không `cmd.exe`), `DATA_DIR` và `DATABASE_PATH` nằm trong thư mục task cho mọi lần chạy, cổng 47760–47761, không Docker,
  chỉ chế độ capture, `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt trong tiến trình nào.

## Bảng bằng chứng

| Lệnh | Kết quả / mã thoát | Bằng chứng |
|---|---|---|
| `git rev-parse`; `scripts/source-digest.mjs`; digest dạng `git ls-tree` của HEAD, `014bd47`, `9bcdd88`, `74d5bfe` | HEAD = origin/main = `014bd47`; `150420e7…` (779) ở cả hai dạng; `9bcdd88` = `1b8ceae4…`, `74d5bfe` = `0a64a75f…` (đúng các giá trị đã báo) | `00-baseline.txt` |
| `git log`, `git diff --name-status --stat 74d5bfe 014bd47 -- . ':!handoff'` | 2 commit; chỉ `docs/11_OPERATIONS_RUNBOOK.md` và `.vi.md` (+22/−20); 0 đường dẫn trong src, tests, scripts, migrations, file package, Dockerfile, `.dockerignore`, Compose hay `.env.example` | `01-delta.txt`, `02-diff-docs11-*.txt` |
| Export `git archive 014bd47`, digest của export | `150420e7…` (779); danh sách bằng danh sách ls-tree | `03-export-digest-before.txt` |
| `npm ci` (`--trace-deprecation --pending-deprecation`) | exit 0, 161 gói, lockfile không đổi, không có dòng deprecation | `04-npm-ci.txt` |
| `SMOKE_PORT=47760 npm run verify` | exit 0: typecheck, lint, 77 file / 1.759 test, build, `SMOKE PASSED` | `05-verify.txt` |
| Test AC-13 chạy riêng | exit 0, 1 test | `06-ac13.txt` |
| `npm ci` + `npm run build` của một export `git archive 74d5bfe`; SHA-256 từng file `dist/` của cả hai bản build | cả hai 230 file, 4.044.281 byte, danh sách giống hệt | `07-dist-compare.txt`, `07-dist-hashes.txt` |
| `node probe.mjs` (server đã build, chế độ production, capture, runner bật, Edge headless) | exit 0: 27 PASS, 0 FAIL (lần chạy ghi nhận, lần đầu) | `08-probe-log.txt` và `08-*.txt`, `probe.mjs.txt` |
| `grep -c '^PRODUCTION_SENDING_ENABLED=true$'` trên sáu file env tổng hợp | không có/bị comment/`false` in 0 (exit 1); dòng chuẩn in 1; giá trị có nháy in 0 | `09-grep-flag-check.txt` |
| Tương đương EN/VI (`parity.mjs`) của docs/11 và gói pilot | mọi mục thay đổi đều bằng nhau; ba chênh lệch code span là placeholder được dịch trong phần không đổi | `10-parity.txt` |
| Grep docs/05, 07, 11, 12, README và gói pilot (EN và VI) tìm câu nói trạng thái hiển thị cờ và câu chữ cũ | 0 câu; câu chữ cũ 0 lần | `11-flag-grep.txt` |
| Các token định danh của gói pilot so với hồ sơ và bằng chứng gate | như dưới đây | `12-packet-identity.txt`, `13-packet-pktid-diff-*.txt` |
| `validate_package.py --preflight` (Python của workflow); precommit check trên các file của task này (git dir riêng) | preflight exit 0, PASS, 91 cặp; precommit exit 0, PASS, 0 phát hiện chặn, 0 cảnh báo; cả hai chạy lại sau lần sửa cuối (lần 2 trong cùng file) | `96-preflight.txt`, `97-precommit.txt` |
| `netstat`, `ps -W`; digest sau | không có listener nào trên 47760–47779, không có tiến trình Node portable; digest không đổi ở mọi dạng | `98-process-listing.txt`, `99-digest-after.txt` |

## Phát hiện

Không có. Không thấy lỗi nào trong phần thay đổi được review, trong gói pilot hay trong các nhánh code mà các câu đã sửa mô tả.

## Recheck bốn phát hiện

1. **WP5-F-01 (câu về cờ trên trạng thái, câu từ chối): đã giải quyết.**
   - Instance đang chạy, chế độ capture, sau một bản nộp đã capture. Màn hình hiện "Sender address: Configured", "Outbound mode:
     Capture only (nothing leaves the server)" và "Automatic submission starts: Not activated", không nhắc tới cờ nào.
   - `GET /api/admin/operations` có `sender` = `{configured, outbound_mode}` và không có khóa nào nêu cờ hay việc gửi production.
   - Điều này khớp docs/11 mục 12 (câu của WP5-FIXD2, với nhãn "Sender address" và "Outbound mode"), mục 13 bước 2 và 4, mục 14
     bước 4, gói pilot mục 2 (ô đầu) và mục 6 bước 1. Mọi mục của mục 12 đều có trong JSON.
   - Câu từ chối, với `OUTBOUND_MODE=smtp` và không có cờ, ở production. Server thoát 1 và không bao giờ lắng nghe. `backup --to`
     và `restore` thoát 1 với thông báo nêu tên cờ. Không giá trị SMTP nào xuất hiện ở đầu ra nào, và lần restore bị từ chối
     không để lại thư mục đích. Các lệnh khác không từ chối vì cờ:
     - `migrate` thoát 0;
     - `backup prune --in … --dry-run` thoát 0 (nó không đọc cấu hình gửi thư);
     - `outbound release` và `outbound resume` in bản xem trước (exit 2);
     - `bootstrap --new-token`, `run-jobs` và `seed` từ chối vì lý do riêng (đã có quản trị viên; production).

     Để đối chứng, cùng lần restore đó chạy được ở chế độ capture (exit 0).
2. **WP5-A2-01 (kiểm tra cờ khi hủy kích hoạt): đã giải quyết.** Mục 13 bước 2 và bước 4 và mục 14 bước 4 nêu đúng chữ trên màn
   hình và thêm `grep -c '^PRODUCTION_SENDING_ENABLED=true$' <env-file>`. Trên các file tổng hợp, lệnh in 0 cho file không có
   dòng đó, với dòng bị comment của `.env.example`, sau khi xóa và với `=false`, và in 1 với dòng kích hoạt. Lệnh không bao giờ
   in giá trị.
3. **WP5-A2-02 (link sâu): đã giải quyết.**
   - Khi chưa đăng nhập, Edge mở `<loopback origin>/#/review/2026-10-09`: hiện form đăng nhập, giữ nguyên hash và không hiện
     review. Sau khi đăng nhập, cùng địa chỉ đó mở "Review and sign off" của ngày trả lương 2026-10-09.
   - Bản nộp đã capture không chứa URL nào, đúng như câu mới.
   - Mục 13 bước 7 có kiểm tra link của lời nhắc đầu tiên theo dạng `https://<nas-host>/#/review/<payroll-date>`.
   - Sau khi đặt thời điểm kích hoạt bằng lệnh gọi đã ghi trong tài liệu, lời nhắc đầu tiên tới nhân viên (`run-jobs` lúc
     2027-01-01T00:01Z) chứa đúng `https://timesheet.example.invalid/#/review/2027-01-01`. Đó là `reviewLink`
     (`PUBLIC_BASE_URL` + `/#/review/<payroll-date>`), có `Auto-Submitted: auto-generated`.
   - Cùng link đó, thay host bằng loopback origin, yêu cầu đăng nhập rồi mở review của 2027-01-01.
4. **WP5-F-02 (gói pilot mục 8): đã giải quyết.** Mục 8 nói một câu trả lời khác mặc định hiện tại cho D-3, D-5, D-6 hoặc D-8
   gây ra một vòng sửa (sửa, đóng băng, gate, kiểm toán độc lập) trước khi kích hoạt, và định danh bản phát hành ở mục 0 và 6 sau
   đó được làm mới. `pending_owner_question.blocking` trên board nói cùng điều đó (cả working tree và HEAD).

## Các sửa rủi ro nhỏ

- **R-A2-1: chính xác.** Lịch sử của chủ sở hữu hiện lần thử đã capture là "Accepted by the mail server" và không bao giờ hiện
  "captured". Bản ghi API có `provider_response` `captured` và `provider_message_id` `capture-…`.
- **R-A2-2 và R-F1 (mục 15 bước 5): chính xác và chạy được.** Biến shell `TIMESHEET_ENV_FILE` thắng `<project-dir>/.env` với file
  Compose này. `08-config-rollback.txt` của WP5-REGATE cho thấy `<compose-previous>` gắn một file env khác theo cách đó. Không
  chạy lại ở đây (không Docker).
- **R-F4 (phần mở đầu mục 13): nhất quán** với mục 1 bước 3 (`<data-dir>` quyền 700, UID 10001). Không quan sát được `sudo -i`
  trên DSM ở đây (NAS NOT VERIFIED).
- **R-F5 (mục 13 bước 5): chính xác.** `2027-01-01T00:00:00Z` hiện thành "2026-12-31 16:00" (America/Los_Angeles),
  "2027-01-01 09:00" (Asia/Tokyo) và "2026-12-31 19:00" (America/New_York), không có nhãn múi giờ (`instantText` theo múi giờ
  của trình duyệt).
- **R-F6: chính xác theo đọc hiểu** (cơ chế chặn dán vào console của Chromium). Trình duyệt headless không thể hiện nó.

## Định danh của gói pilot

- Mục 0 và 6 (EN và VI) nêu `014bd47a8d906c944d2781eba4f2b91c5a532419` và `150420e7…` (779 file). Cả hai bằng số liệu của recheck
  này và hồ sơ WP5-REGATE2.
- Image tham chiếu `sha256:bd17d061…` là bản build drill của WP5-REGATE từ `9bcdd88` (110.002.055 byte,
  `evidence/WP5-REGATE/07-drill.txt`), đã xóa sau gate đó (`14-image-rm.txt`). Gói pilot ghi nó là bản build trên máy phát triển
  từ `9bcdd88`, chênh lệch chỉ về tài liệu.
- Quy tắc image ID trên NAS được giữ: `<image-id>` ở mục 0 và 6, ghi lại lúc build; mục 10.
- Không còn chỗ nào nêu `74d5bfe`, `0a64a75f`, `9bcdd88` hay `1b8ceae4` là bản phát hành hiện tại. Các chỗ nêu `74d5bfe` và
  `0addd200…` ở mục 3 và 5 được ghi rõ là lịch sử.
- Các câu nguồn gốc đúng: recheck này build `74d5bfe` và `014bd47` từ export sạch và thấy 230 file `dist/` giống hệt từng byte.

## Tương đương EN/VI

docs/11 mục 12 đến 16 và gói pilot mục 0, 1, 2, 3, 5, 6 và 8 có cùng số mục đánh số, gạch đầu dòng, dòng bảng, khối code, ô đánh
dấu, link, code span và token hex. Tôi đã đọc bản tiếng Việt của mọi câu đã thay đổi; mỗi câu nói cùng điều với bản tiếng Anh.

## Rủi ro và đề xuất tùy chọn (không phải lỗi)

- **R-RC-1 (Info, kiểm tra đúng nguyên dòng).** Lệnh `grep -c` chỉ khớp dòng chuẩn. Giá trị có nháy `"true"` in 0, và trên NAS
  (grep của Linux) dòng kết thúc CRLF cũng in 0; grep của Git Bash bỏ ký tự CR (`09-grep-flag-check.txt`). Mục 13 bước 4 chờ
  kết quả 1 ngay sau khi sửa và đòi "đúng giá trị đó", nên dạng như vậy sẽ lộ ra lúc kích hoạt.
- **R-RC-2 (Info, thứ tự).** Mục 13 bước 6 chỉ bật tự động "sau khi bước 7 đạt". Gạch đầu dòng về link mới ở bước 7 chỉ chạy
  được sau bước 5, và nó nói rõ điều đó ("khi đã đặt thời điểm kích hoạt"). Tùy chọn: chuyển gạch đó vào bước 5, hoặc nói rằng
  bước 7 đạt mà không cần nó.
- **R-RC-3 (Info, gói pilot mục 8).** Mục này chỉ nêu D-8 là khuyến nghị khác mặc định hiện tại. Khuyến nghị (a) của D-5 cũng
  khác khi ghi một số dư mở đầu lúc bắt đầu pilot (D-10). Câu chung đã bao gồm trường hợp này, và docs/12 liệt kê các mặc định
  hiện tại. Tùy chọn: nêu thêm D-5.
- **R-RC-4 (Info, phần còn lại của R-F1).** Mục 6 bước 3 vẫn nói instance đã restore chạy "ở chế độ capture". Sau khi kích
  hoạt, điều đó chỉ đúng khi dùng cách thay ở mục 15 bước 5; việc tạm dừng gửi ra ngoài vẫn giữ mọi lần gửi. Trong mục 15,
  bước 1 đã đưa file đang chạy về chế độ capture.
- **R-RC-5 (Info, phạm vi R-F4).** Ghi chú về quyền root áp cho mục 13 đến 16; các lệnh backup, restore và nâng cấp ở mục 4, 6
  và 8 cũng cần nó trên DSM.
- **R-RC-6 (Info, trích dẫn).** Mục 3 và 5 dẫn WP5-REGATE2 cho `dist/` giống hệt, nhưng gate đó so `9bcdd88` với `014bd47`.
  Recheck này đối chiếu thẳng `74d5bfe` với `014bd47`.
- Mang theo, không đổi: R-F2 (đưa dữ liệu đã restore thành dữ liệu chạy thật), R-F3/R-B5-1 (image ID khác nhau mỗi lần build),
  R-F7/R-B5-2 (pin của base image).

## Gate chưa chạy hoặc bị chặn, và lý do

- NAS là NOT VERIFIED (không có phần cứng của chủ sở hữu): DSM, `sudo -i`, reverse proxy, bind mount thật và cảnh báo từ máy chủ.
- SMTP thật không được chạy; `PRODUCTION_SENDING_ENABLED` không bao giờ được đặt.
- Không chạy lại ở đây, theo brief và vì phần thay đổi là hai file tài liệu với `dist/` giống hệt từng byte:
  - bộ e2e và drill container (WP5-REGATE đã đạt cả hai trên `9bcdd88`);
  - `docker compose config` (WP5-REGATE).
- Không thể hiện cơ chế chặn "allow pasting" thủ công trong trình duyệt headless.

## Xử lý các phát hiện trước

- WP5-F-01, WP5-F-02, WP5-A2-01, WP5-A2-02: đã giải quyết và đóng trên `014bd47` / `150420e7…`.
- R-A2-1, R-A2-2/R-F1, R-F4, R-F5, R-F6: đã sửa trong văn bản và chính xác.
- WP5-B-01 và WP5-B-02 vẫn đóng (WP5-FINAL-AUDIT).
- Kết quả vùng A và vùng B trên `74d5bfe` vẫn áp dụng: code và `dist/` không đổi.

## Sẵn sàng phần mềm, phép của chủ sở hữu và kết quả pilot

- **Sẵn sàng phần mềm: sẵn sàng (pilot đang chờ).**
  - Vùng A (WP5-ASSESS-A lần 2) và vùng B (WP5-FINAL-AUDIT) đạt trên `74d5bfe`, ngoài các phát hiện tài liệu nay đã đóng.
  - Phần thay đổi tới `014bd47` chỉ là tài liệu, và `dist/` giống hệt từng byte.
  - Ở đây verify (1.759 test), AC-13 và probe đều đạt.
  - Không có lỗi chặn nào về toàn vẹn, quyền riêng tư hay nộp bài theo docs/06.
  - NAS là NOT VERIFIED.
- **Phép của chủ sở hữu:** chưa được xin và chưa được cho. Không triển khai gì, không gửi thư thật nào, và không đặt thời điểm kích
  hoạt trên instance thật nào.
- **Kết quả pilot:** chưa có; chưa chạy pilot nào.

## Một bước tiếp theo

Coordinator ghi nhận WP5 sẵn sàng phần mềm trên `014bd47` / `150420e7…`, cho commit các thay đổi của gói pilot, rồi xin chủ sở
hữu các câu trả lời D-1 đến D-15 và phép chạy pilot kèm gói pilot cụ thể. R-RC-1 đến R-RC-6 là tùy chọn và không chặn. Một câu
trả lời cho D-3, D-5, D-6 hoặc D-8 khác mặc định hiện tại sẽ mở vòng sửa nêu ở gói pilot mục 8.

Không có phát hiện bịa ra hay kết quả đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, ID người review và ID tác giả được review:** WP5-RECHECK, lần 1, subagent `timesheet-auditor` mới (tự
  báo `claude-opus-5-5`). Tác giả được review: các worker WP1–WP4, và trong WP5 là người sửa WP5-FIXD và WP5-FIXD2, task gói
  pilot WP5-PKTID cùng người commit của họ. Các tác giả WP5 trước đó là WP5-PLAN, WP5-FIXB, WP5-AC13, WP5-REL và WP5-PILOT.
- **Context mới; người review không viết thay đổi:** xác nhận. Không phải auditor của WP5-ASSESS-A (lần 1 và 2), WP5-ASSESS-B
  hay WP5-FINAL-AUDIT. Không sửa source, test, tài liệu, board, STATE, NEXT_ACTION hay checkpoint. Đã viết: báo cáo này và bản
  dịch, phần Results của brief và `evidence/WP5-RECHECK/`.
- **Digest nguồn trước/sau; bằng chứng gate của snapshot đó:** `150420e7…` (779) trước và sau, trong repository, dạng
  `git ls-tree` và bản export. Gate là WP5-REGATE2 PASS trên cùng bản đóng băng (WP5-REGATE trên `9bcdd88`).
- **Đường dẫn báo cáo mới, giữ lịch sử review trước:** `handoff/delivery/WP5_RECHECK.md` và `.vi.md`, file mới. Không báo cáo
  nào trước đó bị thay đổi.
- **Xử lý phát hiện và task sửa/recheck tiếp theo của coordinator:** không còn phát hiện mở; không cần task sửa hay recheck nào.
