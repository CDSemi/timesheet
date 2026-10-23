# Review kiểm lại độc lập: INGAT-T0T8 (các phát hiện F1-F3 trên snapshot FIX1)

Bản dịch của [INGAT_T0_T8_RECHECK1.md](INGAT_T0_T8_RECHECK1.md); tiếng Anh là nguồn chuẩn. Review đầu tiên,
[INGAT_T0_T8_REVIEW.vi.md](INGAT_T0_T8_REVIEW.vi.md), giữ nguyên.

- Giai đoạn/ngày/reviewer và model/effort quan sát được: nhánh phụ "Ingat deployability", mục T0 và T8 (không có trên
  board); task INGAT-T0T8-RECHECK1 attempt 1, kiểm lại INGAT-T0T8-AUDIT attempt 1 (FIX REQUIRED); 2026-10-22;
  timesheet-auditor, effort xhigh (do profile đặt); model tự báo `claude-opus-5-5`.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: HEAD gốc
  `2bce0ab5842b80c710f23496d5173c122319e5c7` cộng chín file chưa commit có SHA-256 liệt kê trong
  `handoff/delivery/evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` (tất cả OK, lần đầu và lần cuối); source digest
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` (875 file) lần đầu và lần cuối. Ngoài `handoff/`, các
  path thay đổi đúng là chín file đó; Dockerfile, `compose.example.yaml`, `.dockerignore`, `package*.json` và `src/`
  không có diff so với HEAD. Snapshot cố ý chưa commit (theo brief), nên định danh dựa trên các hash và digest này, không
  dựa trên freeze commit như tài liệu 08 thường yêu cầu. Ngoài ra không có gì chưa push.
- Quyết định: **PASS** (F1, F2 và F3 đã đóng; phần thay đổi chỉ gồm chú thích, câu tài liệu và phần che bằng chứng; mọi
  câu mới đều đúng; không có lỗi mới). Các mục chưa chạy theo thiết kế bên dưới vẫn chưa chạy; chúng không phải là đạt.
- Phạm vi thật đã xem/chạy:
  - Toàn bộ phần thay đổi: bản sao từng byte của cả chín file đã audit (kho scratch của audit đầu, `sha256sum -c` theo
    danh sách IMPL OK) so diff với worktree; bốn bản gốc của F3 so diff với các file đã che mà không in dòng nào đã bỏ;
    mọi file của nhánh dưới `handoff/` so với bản sao cuối của audit đầu.
  - Đọc toàn bộ: sáu file đã đổi, `ingat-validate.yml`, Dockerfile; các phần của `src/server/index.ts`,
    `src/server/cli.ts` (đầu file, `seed`, `main`) và docs/11 mà chú thích mới dẫn tới; tài liệu 08.
  - Ingat (chỉ đọc, checkout `v0.1.0-16-g35be585`; các file Python được dẫn bằng tag `v0.1.0`): MANIFEST_SPEC (dòng
    `mode` của task), ARCHITECTURE (các dòng về CPU CFS), `ops/validate.py`, `ops/context.py`, `ops/instance.py`,
    `policy/compose_policy.py`, `adapters/compose.py`, file máy DSM 7.4.1.
  - Bản nháp riêng của chủ dự án chỉ làm đầu vào cho một lần quét token tự động; không trích gì từ đó ở đây.
  - Đã chạy, tất cả do auditor: định danh lần đầu và lần cuối; phần thay đổi và chứng minh chỉ đổi chú thích (`tomllib`);
    một bản build cục bộ của snapshot với cờ của workflow, `docker image inspect` và ba probe entrypoint; trigger của
    workflow và `$GITHUB_SHA`, có tải tài liệu GitHub; `ingat validate` đúng dạng của job CI trên worktree và trên một bản
    export sạch, cộng một đối chứng âm; actionlint ghim theo digest; cổng riêng tư của kho trên một kho scratch gồm mọi
    file của nhánh, cộng các lần quét tên, dạng dòng, marker và token của bản nháp; parity EN/VI, preflight của gói,
    `git diff --check`, kiểu xuống dòng.
- Bảng bằng chứng (lệnh | kết quả/exit | bằng chứng, tất cả dưới `handoff/delivery/evidence/INGAT-T0T8-RECHECK1/`):

  | Lệnh | Kết quả / exit | Bằng chứng |
  |---|---|---|
  | `identity.sh first` (HEAD, status, chín SHA-256 của danh sách FIX1, digest, diff của Dockerfile/Compose/`.dockerignore`/`package*.json`/`src`) | 0; khớp brief | `identity-first.txt` |
  | Bản sao từng byte của các file đã audit, `sha256sum -c` theo danh sách IMPL; `git diff --no-index` của chín file | 9 OK; sáu file đổi, `ingat-validate.yml` và docs/11 EN/VI giống hệt | `copy-old.txt`, `r2-delta.txt` |
  | `python -I cmp.py`: dữ liệu `tomllib`, dòng chỉ là chú thích, vị trí block scalar, phần che F3 | PASS (một FAIL sai do regex dòng đầu tiên của tôi với một dòng `--format`, đã sửa và chạy lại) | `r2-cmp.txt`, `r2-f3own.txt` |
  | File của nhánh dưới `handoff/` so với bản sao cuối của audit đầu | chỉ các file F3, phần ghi cuối của audit đầu, cặp checkpoint và các file task mới; board, STATE, NEXT_ACTION không đổi | `r2-handoff-delta.txt` |
  | `docker build --platform linux/amd64 --provenance=false --sbom=false …`; `docker image inspect`; các probe `docker run --rm --network none --read-only …` | 0; `["docker-entrypoint.sh"] ["node","dist/server/index.js"] 10001:10001`; argv đi qua nguyên vẹn | `r3-build.txt` |
  | Truy vết mỗi câu mới tới dòng code, spec và tài liệu; file Ingat so với `v0.1.0` | mọi câu đúng; Python được dẫn không đổi từ `v0.1.0` | `r3-trace.txt`, `r3-ingat-version.txt` |
  | Trigger, các chỗ dùng `$GITHUB_SHA`, grep câu chữ; `curl` tài liệu GitHub; `git log --all --grep` chỉ thị bỏ qua | job image chỉ chạy khi push; "Tip commit pushed to the ref" (HTTP 200); 0 commit bỏ qua | `r4-f2.txt` |
  | `docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user "$(id -u):$(id -g)" --volume <worktree>:/app:ro ghcr.io/lisahq/ingat@sha256:b5db73bf… validate /app`; cả `--user 1001:118`; bản export sạch | 0, 0, 0 "is valid" (lần export đầu hỏng ở lệnh `tar` của tôi, đã chạy lại) | `r5-validate.txt`, `r5b-export.txt` |
  | Đối chứng âm: một biến Compose chưa khai báo | 1, nêu đúng biến | `r5b-export.txt` |
  | `docker run --rm --read-only --network none … rhysd/actionlint@sha256:b1934ee5… .github/workflows/*.yml` | 0, không lỗi (1.7.12) | `r5-validate.txt` |
  | Cổng precommit trên kho scratch (chín file cộng mọi file của nhánh); `privacy.py`; quét token bản nháp | PASS, 0 chặn; 0 tên đã bỏ, 0 dòng, 0 hit marker hay bản nháp thật | `r6-privacy-pass*.txt`, `r6-scan-pass*.txt`, `r6-draftscan-pass*.txt` |
  | Parity (script WP5-UX5-T06) trên docs/07, ADR 0002, docs/11 và cặp này; `validate_package.py --preflight`; `git diff --check`; `eol.py` | đều OK / PASS / 0; chỉ LF | `r7-docs-pass*.txt`, `r7-eol.txt` |
  | `identity.sh last` (2026-10-22T23:37:04Z, sau khi dọn dẹp) | 0; khớp lần kiểm đầu; path mới chỉ là đầu ra của lần kiểm lại này dưới `handoff/` | `identity-last.txt` |

- Lỗi (mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi): không có lỗi mới. Các phát hiện trước
  được xử lý ở bên dưới.
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - O1. `ingat.toml:14` ghi "one image per commit". Hiểu là đơn vị release (image gắn theo commit, mỗi commit nhiều nhất
    một image) thì đúng; hiểu là "mọi commit đều có image" thì lặp lại chỗ thiếu chính xác của F2. Phần Hệ quả của ADR nay
    đã nêu hành vi chỉ build commit đầu mút. Câu chữ tùy chọn: "images are per commit (the tip of each push)".
  - O2. "Commit đầu mút của mỗi lần push" đúng trừ khi commit đầu của lần push mang chỉ thị bỏ qua của GitHub như
    `[skip ci]`; không commit nào của kho này dùng chỉ thị đó (`r4-f2.txt`).
  - O3. `ingat.toml:30` "development-only seed passwords that never run in production": thứ không bao giờ chạy là lệnh
    seed (`cli.ts:443` từ chối khi `NODE_ENV=production`); chỉ là câu chữ.
  - O4. Đầu file `cli.ts` mô tả mọi lệnh nhưng chỉ nêu mã thoát cho `restore --keep-schema` và `outbound`; mã thoát của
    migrate, bootstrap và backup nằm trong code (backup có cả trong docs/11). Chú thích không khẳng định quá điều đó.
  - R2-R5, R8 và R9 của review đầu giữ nguyên (ngoài phạm vi sửa); R1, R6 và R7 đã được xử lý và đúng.
  - Lỗi ghi chép ngoài snapshot: `INGAT_T0_T8_CHECKPOINT.md` và `.vi.md` ghi FIX1 che "mười" dòng; thực tế che chín
    (6+1+1+1). File đó thuộc coordinator.
- Gate chưa chạy/bị chặn và lý do (chưa chạy theo thiết kế, không phải đạt): cả hai workflow trên GitHub Actions; push lên
  GHCR bằng `GITHUB_TOKEN`, tạo package, liên kết và chế độ hiển thị; kéo ẩn danh từ máy đích và việc Engine 24 của máy đó
  kéo image; `init`, `prepare`, `deploy`, `backup` và `verify --restore-test` của Ingat trên máy thật; Node.js trên nhân
  4.4 (S15); bộ nhớ cho drill. Lần chạy task cục bộ, lần chạy với registry và lần kiểm `BUILDING.md` của Node.js trong audit
  đầu không lặp lại: hành vi chúng bao phủ không đổi (dữ liệu `tomllib` bằng nhau, workflow giống hệt ngoài dòng 1). Không
  dùng credential nào của chủ dự án; không chạy gì với NAS của chủ dự án; không push image nào.
- Xử lý phát hiện trước:
  - F1 đã đóng. `ingat.toml:139` nay ghi image giữ `docker-entrypoint.sh` của image Node gốc, script này chạy nguyên vẹn
    một argv bắt đầu bằng một chương trình: bản build của tôi có đúng Entrypoint đó, script `exec` nguyên vẹn khi từ đầu
    tìm thấy trên PATH (`node -e` in ra đúng tham số của nó; từ đầu là `-e` thì được thêm `node` phía trước), và chế độ
    `run` của Ingat đặt argv sau tên service, giữ nguyên entrypoint. `ingat.toml:29-30` nêu đúng ba nhóm: Env của image có
    NODE_ENV, HOST, PORT, DATABASE_PATH và DATA_DIR; STATIC_DIR do `src/server/index.ts:17` đọc; các mật khẩu SEED_* chỉ do
    lệnh `seed` đọc (`cli.ts:449-451`), lệnh này từ chối trong production.
  - F2 đã đóng. Workflow image chạy khi `push` lên `main` và chỉ build `$GITHUB_SHA`, mà GitHub ghi là commit đầu mút được
    push; workflow validate chạy khi push lên `main` và khi có pull request. Đầu workflow, docs/07 EN/VI và phần Hệ quả của
    ADR EN/VI đều ghi như vậy; không còn câu "every commit" nào. Câu mới (commit được push cùng các commit sau nó không có
    image; trước bản phát hành đầu tiên kho này push sau mỗi commit) khớp với workflow và dòng 72 của docs/08.
  - F3 đã đóng. Mỗi file trong bốn file có một khối thay đổi chỉ thay các dòng `docker ps` (6, 1, 1, 1) bằng một dòng che
    có số đếm bằng số dòng đã bỏ; không dòng nào đã bỏ là container của nhánh; không tên nào đã bỏ xuất hiện trong file nào
    của nhánh, và không còn danh sách không liên quan nào khác trong bằng chứng, brief hay báo cáo của nhánh.
  - R1 đúng (`ops/validate.py:66` coi CFS là có; `compose_policy.py:130-135`; ARCHITECTURE yêu cầu `cpus` chỉ là tham số
    mặc định không giới hạn). R6 đúng (`ops/instance.py:131-133`, `ops/context.py:274-275` chỉ từ chối tham số subnet chưa
    đặt). R7 đúng (docs/11 nêu mã thoát của backup, restore và outbound; đầu file mô tả mọi lệnh).
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: với PASS này, phần mềm T0/T8 (manifest, workflow, tài liệu) sẵn sàng
  ở định danh này, cho một commit gồm đúng chín file này. Vẫn cần phép của chủ dự án cho mọi bước trên GitHub (Actions,
  quyền workflow, chế độ hiển thị package, không hoàn tác được) và cho mọi lần chạy trên NAS. Chưa có kết quả pilot hay S15.
- Một bước/prompt tiếp: coordinator ghi PASS này vào cặp checkpoint (sửa "mười" thành "chín") và giao snapshot chưa
  commit cho chủ dự án như quy tắc của checkpoint (người yêu cầu cấm push; commit nào sau này phải chứa đúng chín file
  này, nếu không định danh đổi và PASS này không còn áp dụng).

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: INGAT-T0T8-RECHECK1 attempt 1, timesheet-auditor
  (`claude-opus-5-5`, tự báo); tác giả: planner của INGAT-T0T8-PLAN, worker của INGAT-T0T8-IMPL và worker sửa của
  INGAT-T0T8-FIX1 (đều tự báo `claude-sonnet-5-5`); gate INGAT-T0T8-GATE và INGAT-T0T8-REGATE1 (tự báo
  `claude-sonnet-5-5`). Model của auditor không yếu hơn model mạnh nhất của các tác giả.
- Context mới; xác nhận reviewer không viết thay đổi: context mới, không phải context của auditor đầu; auditor không viết gì
  trong snapshot và chỉ viết cặp review này, phần Results của brief,
  `handoff/delivery/evidence/INGAT-T0T8-RECHECK1/` và thư mục task.
- Digest trước/sau; bằng chứng gate snapshot đó:
  `47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033` trước và sau, chín hash FIX1 OK trước và sau
  (`identity-first.txt`, `identity-last.txt`); bằng chứng gate `handoff/delivery/evidence/INGAT-T0T8-REGATE1/`
  (Decision PASS trên cùng định danh), cùng `INGAT-T0T8-GATE` cho phần hành vi không đổi.
- Path report mới giữ lịch sử review trước: `handoff/delivery/INGAT_T0_T8_RECHECK1.md` và `.vi.md`; review đầu
  `INGAT_T0_T8_REVIEW.md` và `.vi.md` cùng bằng chứng của nó không đổi.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: F1, F2, F3 đã đóng; không có phát hiện mới; không cần thêm task
  sửa hay kiểm lại nào cho định danh này.
