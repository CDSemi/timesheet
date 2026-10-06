# Kiểm lại WP4 — vùng A (vận hành) sau vòng sửa

Mẫu: [REVIEW](../templates/REVIEW.md). Bản gốc tiếng Anh (có thẩm quyền): [WP4_RECHECK_A.md](WP4_RECHECK_A.md). Prompt đánh giá: [WP4_REVIEW](../prompts/WP4_REVIEW.md); brief giao việc và hồ sơ tác vụ: [WP4-RECHECK-A](tasks/WP4-RECHECK-A.md). Đánh giá vùng A trước đó (giữ nguyên): [WP4_REVIEW_A](WP4_REVIEW_A.md). Bằng chứng: `handoff/delivery/evidence/WP4-RECHECK-A/` (mục lục trong `00-README.txt`; đã che, LF; mã probe lưu dạng `*.mjs.txt`).

- **Gói/ngày/người đánh giá và model/effort quan sát được:** WP4, vùng A (vận hành), kiểm lại mới sau vòng sửa WP4-FIXA và WP4-FIXB. 2026-10-06, 12:45 đến 13:10 UTC. Người đánh giá: subagent WP4-RECHECK-A (profile timesheet-auditor, agent trên bảng `a659b8cbd52722f18`), model tự báo `claude-opus-5-5`; yêu cầu opus/xhigh; effort và tốc độ không quan sát được từ trong phiên.
- **SHA commit được đánh giá và digest nguồn; commit chưa push; độ đầy đủ của nguồn:**
  - Commit `0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65`, tức `freeze_commit` của WP4-REGATE. `origin/main` là cùng commit, nên không có commit chưa push.
  - Digest nguồn `dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742` trên 775 tệp (không tính `handoff/`), bằng digest chính thức của gate.
  - Đã ghi trước (12:45 UTC) và sau (13:03 UTC) trong repository, bằng dạng `git ls-tree` và `scripts/source-digest.mjs` (`00`, `99`). Đã kiểm lại lúc 13:09 UTC, sau khi viết xong báo cáo và bằng chứng (`99b`). HEAD không đổi, và không tệp nào ngoài `handoff/` thay đổi.
  - Nguồn đầy đủ: một bản export `git archive` của commit. Mã cây đầy đủ `ce6f443d…` bằng cây đóng băng, và digest bằng nhau trước và sau mọi kiểm tra (`00b`, `99`).
- **Quyết định: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - WP4-A-01 đến A-04 đã đóng, mỗi lỗi bằng tái hiện của chính tôi.
  - Các thay đổi R-A1, R-A5 và R-A7 đúng và an toàn.
  - Các bản sửa không đổi gì khác trong vùng A: backup và restore, tạm dừng và đối soát, nâng cấp và quay lui, lưu giữ và allowlist của admin đều đạt lại trên bản đóng băng mới.
  - Phần đồng bộ tài liệu của FIXB trong docs/07 và docs/10 khớp với mã.
  - Trường hợp trùng giây ở mục phạm vi 5 chấp nhận được (Info, R-RA1).
  - Không có lỗi. Bốn rủi ro hoặc đề xuất tùy chọn được liệt kê riêng (R-RA1 đến R-RA4).
- **Phạm vi đã thực sự xem/chạy:**
  - Đã đọc: AGENTS.md (từ đĩa), brief, WP4_REVIEW, WP4_REVIEW_A cùng bằng chứng, và kết quả của WP4-FIXA, WP4-FIXB và WP4-REGATE. Thêm docs/03:49, docs/07, docs/10 và docs/11 cùng cặp `.vi.md`, diff `13a258d..0f7fba2` của mọi đường dẫn ngoài handoff, và các mục trên bảng để tách tác giả với người kiểm định.
  - Mã đã đọc: `Dockerfile`, `vite.config.ts`, `tsconfig.server.json`, `.dockerignore`, `.env.example`, `src/server/app.ts` (route tĩnh), `ops/prune.ts` (cả tệp), `ops/backup.ts` (cách đặt tên), `cli.ts` (đường backup, prune và bootstrap), `services/bootstrap.ts` và các validator miền nó gọi, `scripts/container-drill.mjs` (các kiểm tra đã đổi), `scripts/smoke-built-server.mjs`, `tests/integration/static-assets.test.ts` và `backup-prune.test.ts` (R-A1). Thêm giới hạn trong `xlsxReader.ts`, các trần trong `templateMapping.ts`, `workbookImport.ts` (trạng thái I-3 và đường 422), phép so sánh hạn trong `automation.ts` và mã client về retention.
  - Đã chạy trên bản export: `npm ci`; `npm run verify` với `DATA_DIR` và `DATABASE_PATH` được export; toàn bộ container drill với bản build WP3; một lần `docker build --no-cache` độc lập; quét lớp của cả hai image mà không khởi động container; chạy lại các probe P2, P3, P4, P7 và P8 của đợt kiểm định đầu; hai probe mới (R-A1 và prune, và thông báo từ chối bootstrap A-03); kiểm tra mã nguồn chỉ đọc.
- **Bảng bằng chứng:**

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| Digest `git ls-tree` và `scripts/source-digest.mjs` trong repository, trước và sau | HEAD `0f7fba2`; `dfe4541d…` (775 tệp) cả hai lần; không đổi ngoài handoff | `00`, `99` |
| `git archive 0f7fba2`; thư mục git riêng `add -A`, `write-tree` (ngoài repository) | cây `ce6f443d…` = cây đóng băng; digest `dfe4541d…` trước và sau mọi kiểm tra | `00b`, `99` |
| `npm ci` (Node 24.21.0, npm 11.18.0) | exit 0, 169 gói, không có dòng deprecation | `01` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify`, export `DATA_DIR` và `DATABASE_PATH` vào thư mục tác vụ | exit 0: typecheck, lint, 76 tệp / 1734 test, build, SMOKE PASSED; không có dòng deprecation; `DATA_DIR` đã export vẫn trống | `02` |
| Bản build WP3 cho giai đoạn 4-5 (`git archive 49651c8`, `npm ci`, `build:server`) | exit 0 | `03` |
| `node scripts/container-drill.mjs --work <work>\drill --project ts-wp4-rca --wp3 <work>\wp3` | exit 0, `DRILL STAGES 1-6 PASSED`, 33/31/57/35/27/23 PASS (208), 0 FAIL | `04` |
| `docker build --no-cache --platform linux/amd64 --tag ts-wp4-rca-timesheet:nocache .` | exit 0; `tsc -p tsconfig.server.json --sourceMap false`; vite không in map | `05` |
| `docker image save` và `tar` qua mọi lớp của cả hai image | `/app/dist`: 116 tệp, 0 `*.map`, 0 tệp chứa `sourceMappingURL`, giống hệt ở hai image; 566 map của bên thứ ba dưới `/app/node_modules` (R-RA3) | `06`, `07` |
| P2 (đợt đầu) backup dưới ba luồng ghi, restore cô lập | exit 0, 31 PASS (ghi trong lúc backup: 74 phiên, 14 chữ ký, 5 số dư đầu) | `10` |
| P8 allowlist của trạng thái vận hành và danh sách tài khoản | exit 0, 8 PASS; cùng các dòng kiểm tra như đợt đầu | `11` |
| P7 cửa sổ lưu giữ và quét hằng ngày khi đang tạm dừng | exit 0, 23 PASS; cùng các dòng kiểm tra như đợt đầu | `12` |
| Probe mới R-A1 và prune (thư viện, CLI, trùng giây, backup ghép cặp) | exit 0, 24 PASS cùng các số đo | `13` |
| Probe mới A-03 thông báo từ chối bootstrap (13 tệp sai, 1 tệp đúng) | exit 0, 15 PASS | `14` |
| `git diff --name-only 13a258d 0f7fba2 -- . ':!handoff'` và `--stat` trên đường dẫn runtime vùng A | 29 đường dẫn; mã runtime vùng A chỉ đổi ở `ops/prune.ts`, chú thích `bootstrap.ts` và route asset trong `app.ts` | `15` |
| P3 (đợt đầu) chọn prune và thoát qua NTFS junction; kịch bản B nay chờ lời từ chối | exit 0, 10 PASS | `16` |
| P4 (đợt đầu) ranh giới đích backup và restore, backup bị sửa | exit 0, 16 PASS | `17` |
| Phần còn sót của Docker theo project và tên; `docker image rm` hai image kiểm định | không còn gì | `18` |
| Grep mã nguồn chỉ đọc đứng sau mỗi lần đóng | xem tệp | `19` |
| `validate_package.py --preflight` (Python của workflow) sau khi viết cặp báo cáo | exit 0, PASS, 77 cặp bản dịch | `20` |
| `scripts/precommit-check.mjs` trên các tệp của tác vụ này, được stage trong một thư mục git riêng ngoài repository | exit 0, 0 phát hiện | `21` |

- **Lỗi:** không có. Không quan sát thấy lỗi nào trong snapshot được đánh giá.
- **Các lần đóng và kiểm tra đã xác minh, theo mục phạm vi của brief:**
  1. Các lỗi đã đóng:
     - **WP4-A-01 đã đóng.**
       - Cả hai image (bản build của drill và bản no-cache của tôi) không có `*.map` và không có `sourceMappingURL` ở bất kỳ đâu dưới `/app/dist` (`06`, `07`).
       - Trong container đang chạy, bundle không có `sourceMappingURL`, và `/assets/<bundle>.map` trả 404 (drill giai đoạn 1, `04`).
       - Bộ quét tệp cấm của drill có quy tắc `*.map` cho `/app/dist`.
       - `app.ts` trả 404 JSON cho mọi `/assets/*` không tồn tại thay vì trang fallback một trang (`static-assets.test.ts` đạt trong 1734 test).
       - Bản build cục bộ vẫn giữ map (`02`, vite in `map:`), như được phép.
     - **WP4-A-02 đã đóng.** `.env.example:60-61` nói `JOB_RUNNER=off` là bắt buộc sau một lần quay lui bằng `restore --keep-schema --confirm` cho đến khi đối soát xong, còn lại thì để trống. Điều này khớp docs/07:32, docs/10:159, docs/11 mục 8 bước 3 và cảnh báo của CLI (`19`).
     - **WP4-A-03 đã đóng.**
       - (a) Không component client nào hiển thị lần chạy lưu giữ; chỉ kiểu trong `api.ts` có nó (`19`). docs/11 mục 5 và 12 nay nói nó chỉ có trong JSON.
       - (b) Mười ba tệp bootstrap sai mang dấu đánh dấu ở tên lịch, múi giờ, tên ngày lễ, khóa và giá trị lạ, và một trường thừa của chính sách. Tất cả exit 1, và không tệp nào in ra dấu đánh dấu. Một lần từ chối chỉ trích một ngày (`2026-01-01`, `2026-02-30`) hoặc số của chính sách (`08:00–17:00 (540 min) … 470 … 60`), hoặc nêu một trường và một quy tắc. Tệp không phải JSON in một câu cố định. Tệp hợp lệ chỉ in số đếm và token (`14`). Runbook và chú thích trong `bootstrap.ts` nói đúng như vậy.
     - **WP4-A-04 đã đóng.** `npm run verify` exit 0 khi `DATA_DIR` và `DATABASE_PATH` được export, và thư mục đã export vẫn trống (`02`). Smoke tự đặt `DATA_DIR` riêng.
  2. Các cải tiến:
     - **R-A1 đúng và an toàn.**
       - Một ứng viên mang ngày sau đồng hồ làm cả lượt bị từ chối, cả chạy thử lẫn chạy thật, với `clock_behind_backups` (exit 2), và không xóa gì. Phép kiểm tra chạy trước bước chọn và bước xóa.
       - Ranh giới: backup đúng bằng thời điểm của đồng hồ được nhận; muộn hơn một giây thì bị từ chối.
       - Một thư mục mang ngày tương lai không do công cụ tạo (manifest hoặc tên sai) chỉ được đếm và không gây từ chối.
       - Qua CLI với đồng hồ thật, `backup prune --dry-run` và `backup --to --prune` exit 2, stdout trống (chạy thử) và stderr không có tên hay đường dẫn nào. Backup mới đã kiểm được giữ.
       - Prune bình thường vẫn chạy. Trên 180 backup hằng đêm nó giữ 13 và xóa 167, và tập được giữ bằng phép tính 7 ngày / 4 tuần ISO / 6 tháng độc lập của tôi. Qua CLI, `--prune` exit 0 với `removed 2, kept 2` (`13`, và `16` với các lối thoát qua junction vẫn an toàn).
     - **R-A5 đúng.** Hai job gửi bị giữ (`held 2, releasable 2`): lệnh thả theo id thả một job, `outbound release --all --confirm` báo `released 1`, và cả hai job được nhận, mỗi job đúng một lần thử gửi (`[0,0] -> [1,1]`, drill giai đoạn 3). Phép kiểm tra nay đòi `released >= 1`.
     - **R-A7 đúng.** docs/03:49 (EN và VI) nói "trong danh sách tài khoản của quản trị viên".
  3. Hồi quy, không đổi gì khác trong vùng A:
     - Diff kể từ bản đóng băng đầu chỉ chạm mã runtime vùng A ở `ops/prune.ts` (phép kiểm tra và chú thích), chú thích `bootstrap.ts` và route asset trong `app.ts` (`15`).
     - Backup và restore: P2 31 PASS (bản sao nhất quán WAL dưới tải ghi, sổ nguyên tử cùng dòng audit, bản sao là tập con của dữ liệu sống, restore cô lập với cây dữ liệu sống giữ nguyên, hash, và số dư qua SQL và API), P4 16 PASS, drill giai đoạn 2 và 3.
     - Tạm dừng và đối soát: drill giai đoạn 3, 57 PASS.
     - Nâng cấp và quay lui: drill giai đoạn 4 (35) và 5 (27), với bản build cũ từ chối CSDL đã nâng cấp và `--keep-schema` cần `--confirm`.
     - Lưu giữ: P7 23 PASS và các test lưu giữ trong 1734 test.
     - Allowlist của admin: P8 8 PASS, với đúng các đường khóa, gồm `retention` và `not_set_up`.
  4. **Phần đồng bộ tài liệu của FIXB khớp với mã** (`19`):
     - docs/07 nêu 4 MiB XML mỗi phần (`maxPartXmlBytes`) và 16 MiB cho cả gói (`maxTotalXmlBytes`). Nó nêu các trần về phần tử, ô, dòng và chuỗi dùng chung, hơn 2.000 dòng ngày lễ (`MAX_HOLIDAY_ROWS`, bị từ chối với `too_many_holidays`), 422 `workbook_rejected`, và phát hiện bị giới hạn (`MAX_FINDING_SOURCES` 20, `MAX_FINDINGS_PER_CODE` 25).
     - Mặc định an toàn của I-3: `periodEnd >= today` là `not_ended`, và `dueAtUtc > now` là `not_due`, nên chính thời điểm đến hạn được tính là đã đến hạn, như ở `automation.ts:200`.
     - docs/10 có quyết định của coordinator ghi ngày và đảo ngược được. docs/11:225 đã khớp. Các cặp VI khớp, và không tài liệu nào khác còn nêu quy tắc I-3 cũ.
  5. **Quan sát của WP4-REGATE chấp nhận được (Info): R-RA1 bên dưới.**
- **Rủi ro và đề xuất tùy chọn, tách khỏi lỗi đã chứng minh:**
  - **R-RA1 (mục phạm vi 5), trùng giây. Đánh giá là chấp nhận được, không phải lỗi.**
    - `newerFirst` (`ops/prune.ts:77-80`) phá thế hòa khi cùng thời điểm bằng tên thư mục, mà 8 chữ số hex cuối là ngẫu nhiên.
    - Khi hai backup cùng một giây UTC và backup vừa tạo (`requiredName`) có hậu tố nhỏ hơn, `--prune` xóa nó và giữ backup kia.
    - Số đo (`13`): 7 trên 12 cặp CLI chạy liền nhau (`backup --to`, rồi `backup --to --prune`) cùng một giây. Ở 3 trong 7 cặp đó, lệnh xóa đúng backup nó vừa in ra.
    - Trong mọi trường hợp vẫn còn đúng một backup đầy đủ, đã kiểm, của cùng giây đó. Cửa sổ ngày vốn chỉ giữ một backup cho mỗi ngày UTC, và hai bản chỉ khác nhau dưới một giây ghi. Backup hằng đêm theo lịch không bao giờ trùng giây.
    - Ảnh hưởng thấy được duy nhất: tên thư mục mà lệnh đó in ra có thể không còn tồn tại.
    - Đề xuất tùy chọn: khi cùng thời điểm, giữ `requiredName`.
  - **R-RA2, backup ghép cặp trước nâng cấp và việc lưu giữ (Low; tài liệu, chủ hoặc coordinator chọn).**
    - docs/11 mục 8 (Nâng cấp bước 1) và docs/07:32 dựa vào backup ghép cặp trước nâng cấp.
    - Một lần `--prune` sau đó trong cùng ngày UTC sẽ xóa nó, vì mỗi ngày UTC chỉ giữ backup mới nhất (`13`: backup ghép cặp lúc 03:00Z và bản hằng đêm lúc 19:00Z cùng ngày thì nó bị xóa; nếu bản hằng đêm lúc 00:30Z ngày hôm sau thì nó được giữ).
    - Khi đó việc quay lui phải dùng bản hằng đêm của ngày trước (cùng schema cũ, được giữ vì là bản mới nhất của ngày đó), mất các giờ trước khi nâng cấp, hoặc bản sao trên thiết bị riêng ở mục 4 bước 3.
    - Tùy chọn: thêm một dòng runbook, "trước khi nâng cấp, chép backup ghép cặp ra ngoài `<backup-dir>` hoặc kiểm nó trên thiết bị riêng".
  - **R-RA3, source map của bên thứ ba trong image (Info).**
    - `/app/node_modules` chứa 566 tệp `*.map` đã phát hành: pdf-lib 560, fast-xml-parser 4, fast-xml-builder 1, path-expression-matcher 1 (`06`).
    - Đó là mã thư viện công khai, không bao giờ được phục vụ (gốc tĩnh là `dist/client`, và `/assets/*.map` trả 404) và không chứa bí mật. FIXA đã khai phạm vi `/app/dist` của quy tắc trong drill.
    - Chú thích Dockerfile "The image ships no source maps" là nói về bản build của ứng dụng.
    - Tùy chọn: sửa câu chú thích, hoặc xóa `node_modules/**/*.map` ở giai đoạn `prod-deps`.
  - **R-RA4, một backup mang ngày tương lai xa chặn việc prune (Info; an toàn khi lỗi).**
    - Nếu đồng hồ máy chủ từng chạy nhanh và một backup mang tên ở tương lai, mọi lần `--prune` và chạy thử sau đó đều exit 2 cho đến khi người vận hành dời thư mục đó đi.
    - Runbook chỉ nói "hãy sửa giờ máy chủ trước". Không gì bị xóa, tác vụ theo lịch thất bại một cách thấy được, và cảnh báo dung lượng đĩa ở mục 11 cuối cùng sẽ bật.
    - Câu runbook tùy chọn: khi giờ máy chủ đã đúng, dời thư mục mang ngày tương lai (tên của nó cho thấy thời điểm) ra khỏi `<backup-dir>`.
  - Lỗi chữ nhỏ (Info, có từ trước): docs/11 mục 4 bước 1 nói backup "chỉ in số đếm", nhưng nó cũng in tên thư mục mới, điều mà mục 8 bước 1 dựa vào.
  - R-A2, R-A3, R-A4, R-A6, R-A8 và R-A9 của đợt đầu giữ nguyên như đã ghi. Mã của chúng không đổi, và chúng không được đo lại ngoài các probe liệt kê ở trên.
- **Gate bắt buộc chưa chạy/bị chặn và lý do:**
  - Máy đích NAS và arm64 gốc: NOT VERIFIED (không có quyền truy cập của chủ; các bước của chủ nằm trong docs/11). Chúng nằm ngoài lần kiểm lại trên máy trạm này, như ở đợt đầu.
  - Không chạy lại `npm run test:e2e`; nó không bắt buộc cho vùng A, và regate báo 145 đạt, 5 bỏ qua. Không có SMTP thật (chỉ capture).
  - P1 và P1b (bộ chạy migration), P5 (token bootstrap), P6 (proxy và cấu hình) và P9 của đợt đầu không được chạy lại như probe riêng:
    - `db/`, `config.ts`, `http/`, `auth/`, `cli.ts` và logic bootstrap không đổi kể từ `13a258d` (`15`);
    - drill giai đoạn 1, 3, 4 và 5 cùng 1734 test bao phủ chúng trên bản đóng băng này.
- **Xử lý các phát hiện trước:**
  - WP4-A-01, A-02, A-03 và A-04: đã đóng.
  - R-A1: đã làm và đã xác minh.
  - R-A5 và R-A7: đã đóng.
  - R-A2, R-A3, R-A4, R-A6, R-A8 và R-A9: backlog hoặc lựa chọn của chủ, không đổi.
  - Quan sát trùng giây của WP4-REGATE: R-RA1, chấp nhận được.
- **Tách riêng sẵn sàng phần mềm, phép của chủ và kết quả pilot:**
  - Sẵn sàng phần mềm của vùng A: được chấp nhận tại `0f7fba2` / `dfe4541d…` trên một máy trạm (Docker Desktop, linux/amd64). NAS và arm64 chưa được xác minh.
  - Phép của chủ: không yêu cầu và không được cấp; không triển khai gì và không gửi gì.
  - Kết quả pilot: không có (WP5).
- **Một bước/prompt tiếp theo:** coordinator ghi WP4-RECHECK-A là PASS tại digest `dfe4541d…`. Khi WP4-RECHECK-B xong, coordinator chuyển WP4 sang nghiệm thu. R-RA1 và R-RA2 có thể vào backlog như cải tiến tùy chọn cho runbook hoặc prune.

Không có lỗi bịa và không có kết quả đạt chưa quan sát. Một đánh giá từng phần không phải là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt đánh giá, ID người đánh giá và ID tác giả được đánh giá:**
  - WP4-RECHECK-A, lần 1. Người đánh giá: subagent timesheet-auditor `a659b8cbd52722f18` (`claude-opus-5-5`).
  - Tác giả của phần thay đổi được đánh giá: WP4-FIXA `a7b344b3ceca312e4` và WP4-FIXB `afacb78fd37c3d657`, đều `claude-sonnet-5-5`. Người commit WP4-FIX-FREEZE `a1f25540e4029dee5` và người kiểm gate WP4-REGATE `a042ae51bdbb94d57`, đều sonnet.
  - Model tác giả mạnh nhất của WP4 là `claude-opus-5-5` (T05, T06, T09, T10), nên người đánh giá không yếu hơn.
  - Người đánh giá không phải người kiểm định vùng A đầu tiên `af8b9184c8adf6eb0`.
- **Context mới; xác nhận người đánh giá không viết thay đổi:** context mới. Người đánh giá này không viết gì trong WP4. Nó chỉ viết báo cáo này, bản dịch, phần kết quả trong brief và `evidence/WP4-RECHECK-A/`. Không sửa mã nguồn nào, và các probe chạy trong một bản export nháp ngoài Dropbox.
- **Digest nguồn trước/sau; bằng chứng gate của snapshot đó:** `dfe4541d…86742` trước và sau (repository và export), bằng digest chính thức của WP4-REGATE (`handoff/delivery/evidence/WP4-REGATE/`).
- **Đường dẫn báo cáo mới, giữ lịch sử đánh giá trước:** `handoff/delivery/WP4_RECHECK_A.md` (tệp mới); `WP4_REVIEW_A` và các đánh giá khác không đổi.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp theo của coordinator:** vùng A không cần task sửa. Backlog tùy chọn: R-RA1 đến R-RA4. Tiếp theo: nghiệm thu WP4 khi WP4-RECHECK-B xong.
