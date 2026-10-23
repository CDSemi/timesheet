# Review độc lập: INGAT-T0T8 (manifest Ingat và image GHCR, nhánh phụ T0 và T8)

Bản dịch của [INGAT_T0_T8_REVIEW.md](INGAT_T0_T8_REVIEW.md); tiếng Anh là nguồn chuẩn.

- Giai đoạn/ngày/reviewer và model/effort quan sát được: nhánh phụ "Ingat deployability", mục T0 và T8 (không có trên
  board); task INGAT-T0T8-AUDIT attempt 1; 2026-10-22; timesheet-auditor, effort xhigh (do profile đặt); model tự báo
  `claude-opus-5-5`.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: HEAD gốc
  `2bce0ab5842b80c710f23496d5173c122319e5c7` cộng chín file chưa commit có SHA-256 liệt kê trong
  `handoff/delivery/evidence/INGAT-T0T8-IMPL/snapshot-sha256.txt` (tất cả OK, lần đầu và lần cuối); source digest
  `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd` (875 file) lần đầu và lần cuối. Không path nào khác ngoài
  `handoff/` thay đổi; Dockerfile, `compose.example.yaml` và `.dockerignore` không có diff so với HEAD. Snapshot cố ý chưa
  commit (theo brief; người yêu cầu cấm push), nên định danh dựa trên các hash và digest này, không dựa trên freeze commit
  như tài liệu 08 thường yêu cầu. Ngoài ra không có gì chưa push.
- Quyết định: **FIX REQUIRED** (ba lỗi mức thấp, mỗi lỗi có cách sửa giới hạn; không thấy lỗi hành vi nào trong manifest
  hay các workflow).
- Phạm vi thật đã xem/chạy:
  - Đọc toàn bộ: chín file của snapshot; Dockerfile, `.dockerignore`, `compose.example.yaml`, `package.json`,
    `.env.example`; `src/server/config.ts`, `index.ts`, `cli.ts`, `app.ts` (health và readiness),
    `http/security.ts`, `http/clientAddress.ts`, `ops/backup.ts` và `ops/restore.ts` (các phần mà task dùng).
  - Ingat (chỉ đọc): MANIFEST_SPEC §1-§7 và §11-§12; ARCHITECTURE §9.4, §9.5, §11.1-§11.4; ADR-0026; ROADMAP S15;
    hướng dẫn vận hành về `validate`; cả hai workflow của Ingat; và trong `src/ingat` các file `model/manifest.py`,
    `model/templates.py`, `model/instance.py`, `ops/validate.py`, `ops/context.py`, `ops/deploy.py`, `ops/instance.py`,
    `ops/backup.py`, `ops/steps_build.py`, `core/steps.py` (obtain), `core/executor.py` (loại bước),
    `adapters/override.py` và `policy/compose_policy.py`. Source của chúng ở checkout Ingat bằng tag `v0.1.0`, chỉ khác một
    docstring.
  - Bản nháp riêng của chủ dự án §11-§12, chỉ đọc để đánh giá các chỗ sửa; không trích gì từ đó ở đây.
  - Đã chạy, tất cả do auditor: `ingat validate` đúng dạng của job CI cộng ba probe từ chối, hai probe giới hạn và hai file
    instance tổng hợp; mọi argv task trong manifest, argv của probe readiness và các route live, ready trên bản build cục bộ
    của snapshot với các cờ cứng hóa của Compose; ghim action qua `git ls-remote`, runtime của các action, actionlint ghim
    theo digest; chính khối `run:` của workflow image hai lần với một registry cục bộ dùng một lần; một bản build cục bộ
    `linux/amd64` với cờ của workflow; `BUILDING.md` của Node.js cho v24.21.0 và v24.x; cổng riêng tư của kho trên một kho
    scratch gồm mọi file của nhánh; parity EN/VI, preflight của gói, self-test riêng tư và `git diff --check`.
- Bảng bằng chứng (lệnh | kết quả/exit | bằng chứng, tất cả dưới `handoff/delivery/evidence/INGAT-T0T8-AUDIT/`):

  | Lệnh | Kết quả / exit | Bằng chứng |
  |---|---|---|
  | `identity.sh first` (HEAD, status, chín SHA-256, source digest, diff của Dockerfile/Compose/.dockerignore) | 0; khớp brief | `identity-first.txt` |
  | `docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user 1001:118 -v <worktree>:/app:ro ghcr.io/lisahq/ingat@sha256:b5db73bf… validate /app` | 0, "is valid" | `a2-validate.txt` |
  | Probe từ chối trên bản sao: khai báo key bị cấm; cổng trên 0.0.0.0; tham số template chưa khai báo | 1, 1, 1 với đúng đường dẫn key | `a2-validate.txt` |
  | Probe giới hạn: `cpus: "0.5"`; `log_snapshot` | 0, 0 (validate nhận thứ mà 0.1.0 từ chối trên máy đích) | `a2-validate.txt` |
  | File instance tổng hợp: tốt; xấu (mười lỗi) | 0; 1 | `a2-validate.txt` |
  | Hợp đồng task: 11 task, argv probe `ready`, `/api/health`, `/api/ready`, restore rồi khởi động với các hold | mọi exit và đường dẫn JSON đúng như manifest ánh xạ | `a3-tasks.txt` |
  | Truy vết mọi phần tử manifest tới `file:line` | xem bảng | `a3-trace.txt` |
  | `git ls-remote` ba tag action; `action.yml` ở các SHA đã ghim | ghim khớp; mới nhất của mỗi dòng; đều `node24`; không có thông báo deprecation | `a4-workflows.txt` |
  | actionlint 1.7.12 theo digest (có shellcheck 0.11.0 bên trong) trên cả hai workflow | 0, không lỗi | `a4-workflows.txt` |
  | Khối `run:` của workflow với `registry:3` trên loopback, chạy hai lần | 0 (nhánh "not found": build, push, digest, kiểm nhãn); 0 ("already published", cùng digest, không build); tag = một OCI image manifest | `a4-workflows.txt` |
  | `docker buildx build --platform linux/amd64 --provenance=false --sbom=false --label … --load .` với BuildKit đã ghim | 0; `linux/amd64 10001:10001 <HEAD> 0.1.0`, nhãn source; Entrypoint `["docker-entrypoint.sh"]` | `a5-build.txt` |
  | `curl` `BUILDING.md` của Node.js v24.21.0 và v24.x | 200; x64 glibc Tier 1 từ nhân 4.18, "Older kernel versions may work" | `a6-s15.txt` |
  | Cổng riêng tư trên kho scratch (chín file cộng mọi file của nhánh dưới `handoff/`), grep marker | PASS, 0 chặn; đã đọc các hit marker (F3) | `a7-privacy.txt` |
  | Parity trên ba cặp và docs/07 ở HEAD; `validate_package.py --preflight`; `precommit-check --self-test`; `git diff --check` | đều 0 / PASS | `a8-docs.txt` |
  | `identity.sh last` (2026-10-22T23:05:46Z) | 0; khớp lần kiểm đầu; path mới chỉ là đầu ra của auditor dưới `handoff/` | `identity-last.txt` |

- Lỗi (mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi):
  - **F1 | Thấp | `ingat.toml:138` và `ingat.toml:29` (chú thích).** Tái hiện: `docker image inspect` image build từ snapshot in
    `Entrypoint=["docker-entrypoint.sh"]` (`a5-build.txt`); Dockerfile không đặt ENTRYPOINT, nên stage runtime thừa hưởng
    ENTRYPOINT của image Node gốc. `STATIC_DIR` được server production đọc (`src/server/index.ts:17`). Kỳ vọng: chú thích mô
    tả đúng image. Thực tế: dòng 138 ghi "The image has no ENTRYPOINT"; dòng 29 ghi mọi key bị cấm đều do khối ENV của image
    cố định hoặc chỉ lệnh phát triển đọc, mà `STATIC_DIR` thì không. Hành vi không bị ảnh hưởng: script entrypoint chạy
    nguyên argv bắt đầu bằng một lệnh (mọi task đã chạy, `a3-tasks.txt`) và probe dùng `docker exec`. Quy tắc: chú thích của
    một manifest công khai phải nêu sự thật (MANIFEST_SPEC §4, "the entrypoint stays"; AGENTS.md: mô tả đúng hành vi đã
    làm). Sửa: viết lại hai chú thích (ví dụ "The image keeps the Node base image's docker-entrypoint.sh, which runs a task
    argv that starts with a program unchanged" và "Fixed by the image (Dockerfile ENV block), the static-root override
    STATIC_DIR, or read only by development commands"); chạy lại `validate`.
  - **F2 | Thấp | `.github/workflows/image.yml:1`, `docs/07_DEPLOYMENT_AND_OPERATIONS.md:9` và `.vi.md:9`,
    `docs/adr/0002-ingat-manifest-and-ghcr-image.md:59` và `.vi.md:57`.** Tái hiện: job chỉ build `$GITHUB_SHA`
    (`image.yml:40-47`), và GitHub ghi `GITHUB_SHA` của một lần chạy `push` là "Tip commit pushed to the ref" (một lần chạy cho
    mỗi lần push; `a8-docs.txt`); `ingat-validate.yml:5-8` chạy khi push lên `main` và khi có pull request. Kỳ vọng: tài liệu
    ghi "commit đầu (tip) của mỗi lần push lên `main`" và "ở mỗi lần push lên `main` và mỗi pull request". Thực tế: "on every
    commit to main" (đầu workflow), "ở mỗi commit lên `main`" và "kiểm file này ở mỗi lần push" (docs/07 EN và VI), "Mỗi
    commit `main` thêm một phiên bản package GHCR" (Hệ quả của ADR, EN và VI), trong khi phần Quyết định của chính ADR ghi
    "ở mỗi lần push lên `main`". Hệ quả: một commit được push cùng các commit sau nó không có image, và `prepare` của Ingat
    cho commit đó thất bại lúc kéo image. Quy tắc: yêu cầu 2 của brief và mục audit 8 (tài liệu khớp hành vi); AGENTS.md
    (không khẳng định quá hành vi). Sửa: sửa câu chữ ở năm chỗ đó và chú thích của workflow (không đổi hành vi), hoặc, nếu
    chủ dự án muốn mọi commit đều deploy được, một quyết định thiết kế riêng.
  - **F3 | Thấp | bằng chứng của nhánh dưới `handoff/`: `evidence/INGAT-T0T8-GATE/cleanup.txt:6-12`,
    `evidence/INGAT-T0T8-GATE/g5.txt.txt:32-33`, `evidence/INGAT-T0T8-IMPL/g5.txt:30-31`,
    `evidence/INGAT-T0T8-IMPL/ps.txt:1`.** Tái hiện: grep marker của `a7-privacy.txt` và đọc các dòng đó. Kỳ vọng: quy tắc
    riêng tư của chính nhánh này ("mọi thứ dưới `handoff/` giữ chung chung: không giá trị của máy, cổng thật …", brief PLAN;
    mục audit 7). Thực tế: danh sách `docker ps` các container không liên quan của máy phát triển, có tên các dự án khác của
    chủ dự án, các cổng chúng công bố và một mẩu tên tài khoản đã che. Không phải secret và không phải máy đích; 31 file bằng
    chứng đã commit của các gói trước đã liệt kê các tên như vậy, nên điều này theo thói quen cũ nhưng không theo quy tắc của
    nhánh này. Sửa: trước mọi commit, thay mỗi dòng không liên quan bằng một con số ("N container không thuộc task này; bỏ
    tên và cổng"); giữ các dòng của container của chính task.
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - R1. CI không bắt được hai loại mà Ingat 0.1.0 từ chối trên máy đích: `validate` kiểm policy với giả định có CPU CFS
    (`ops/validate.py:66`), nên một `cpus` khác 0 thêm sau này vẫn qua CI (`a2-validate.txt` L1), và nó không chạy
    `supported()` (L2, ADR 0002 đã ghi). Tùy chọn: nêu `cpus` trong phần sự thật của ADR, hoặc thêm một kiểm tra CI.
  - R2. Hợp đồng mã thoát của app: một lỗi không bắt thoát với 1 (`src/server/cli.ts:482`), mà map của bootstrap và của
    outbound `--confirm` đọc là `refused` (không đổi gì). Các map theo đúng hợp đồng đã ghi và ví dụ SQLite của chính Ingat;
    một mã riêng là thay đổi app ngoài phạm vi này.
  - R3. Nhánh "not found" của workflow mới chứng minh trên `registry:3`; câu lỗi của GHCR cho package chưa từng đăng chưa
    kiểm chứng. Câu khác sẽ làm job dừng an toàn (không push gì) nhưng chặn lần đăng đầu cho đến khi chỉnh.
  - R4. Bước lấy version chỉ nhận chữ số và dấu chấm; version pre-release trong `package.json` làm job dừng (an toàn).
  - R5. Client buildx của runner không được ghim (BuildKit có ghim), giống workflow của Ingat.
  - R6. ADR 0002 ghi 0.1.x không chạy được "tham số subnet"; chính xác là tham số subnet để cấp phát tự động
    (`ops/instance.py:131-133`).
  - R7. `ingat.toml:139` ghi các map exit có tài liệu ở docs/11; docs/11 ghi exit của backup, restore và outbound, không
    ghi migrate hay bootstrap (đầu file `cli.ts` ghi đủ).
  - R8. `[drill] min_free_memory = "512m"` chưa đo; drill từ chối khi ít hơn mức này (`ops/backup.py:138-140`).
  - R9. Khoảng trống có sẵn của app, ADR đã nêu: chưa có lệnh verify chỉ đọc; credential SMTP là secret trong env-file (không
    hỗ trợ `*_FILE`), nên mục 2 và 5 của ARCHITECTURE §11.3 chỉ đạt một phần.
  - Đã xác nhận đúng, để ghi lại: mọi argv task và map exit; đường dẫn JSON của readiness; owner, mode và cấu trúc của
    store; các tham số và quy tắc `[app_env]` so với `config.ts`; hold, env rollback, side effect; người dùng và nhãn của
    image; quyền tối thiểu; ghim SHA đầy đủ; logic bất biến tag và digest; tắt attestation; các cờ khóa của job validate;
    phát biểu S15; không có `cpus`; không có giá trị của máy trong chín file.
- Gate chưa chạy/bị chặn và lý do (chưa chạy theo thiết kế, không phải đạt): cả hai workflow trên GitHub Actions; push lên
  GHCR bằng `GITHUB_TOKEN`, tạo package, liên kết và chế độ hiển thị; kéo ẩn danh từ máy đích và việc Engine 24 của máy đó
  kéo OCI manifest; `init`, `prepare`, `deploy`, `backup` và `verify --restore-test` của Ingat trên máy thật (thay vào đó đã
  truy vết trong source của Ingat và chạy từng lệnh cục bộ); Node.js trên nhân 4.4 (S15); bộ nhớ cho drill. Không dùng
  credential nào của chủ dự án; không chạy gì với NAS của chủ dự án; không push image lên registry từ xa.
- Xử lý phát hiện trước: các chỗ sửa bản nháp của plan (expect_labels, tham chiếu image GHCR, các key build không dùng, danh
  sách cấm, `TRUSTED_PROXY_ADDRESSES` không bắt buộc, pattern số giờ phiên, bỏ `log_snapshot`, câu pause chung chung,
  `operator = false` cho task backup) đều có mặt và đúng; không thấy lỗi bản nháp nào khác. Bảng sự thật của plan ghi "no
  ENTRYPOINT" là sai (nguồn của F1). Các mục PASS của gate đã chạy lại ở đây với cùng kết quả; lưu ý của gate (chỉ parse YAML
  qua actionlint) vẫn đúng, và actionlint đã parse cả hai file.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: sẵn sàng phần mềm của T0/T8 chưa được nghiệm thu cho đến khi F1-F3 được
  sửa và kiểm lại. Vẫn cần phép của chủ dự án cho mọi bước trên GitHub (Actions, quyền workflow, chế độ hiển thị package,
  không hoàn tác được) và cho mọi lần chạy trên NAS. Chưa có kết quả pilot hay S15.
- Một bước/prompt tiếp: coordinator giao một task sửa có phạm vi (path sở hữu: chú thích `ingat.toml` ở dòng 29 và 138,
  dòng 1 của `.github/workflows/image.yml`, đoạn docs/07 EN và VI, dòng Hệ quả của ADR 0002 EN và VI, và bốn file bằng chứng
  của F3), rồi một gate trên hash và digest mới và một audit kiểm lại mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: INGAT-T0T8-AUDIT attempt 1, timesheet-auditor
  (`claude-opus-5-5`, tự báo); tác giả: planner của INGAT-T0T8-PLAN và worker của INGAT-T0T8-IMPL (đều tự báo
  `claude-sonnet-5-5`); gate INGAT-T0T8-GATE (tự báo `claude-sonnet-5-5`).
- Context mới; xác nhận reviewer không viết thay đổi: context mới; auditor không viết gì trong snapshot và chỉ viết cặp review
  này, phần Results của brief, `handoff/delivery/evidence/INGAT-T0T8-AUDIT/` và thư mục task.
- Digest trước/sau; bằng chứng gate snapshot đó: `79ca6562e84e642d4a1a1559ff594742dc9835cc05c4e768224452dd773a7cfd` trước và
  sau, chín hash OK trước và sau (`identity-first.txt`, `identity-last.txt`); bằng chứng gate
  `handoff/delivery/evidence/INGAT-T0T8-GATE/` (Decision PASS trên cùng định danh).
- Path report mới giữ lịch sử review trước: `handoff/delivery/INGAT_T0_T8_REVIEW.md` và `.vi.md` (review đầu tiên của nhánh
  này).
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: F1-F3 còn mở; tiếp theo một task sửa có phạm vi (ví dụ
  INGAT-T0T8-FIX1), một gate trên định danh mới, rồi một audit kiểm lại mới (ví dụ INGAT-T0T8-RECHECK1).
