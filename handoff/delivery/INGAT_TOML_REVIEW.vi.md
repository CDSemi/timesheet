# Review độc lập: cấu trúc của `ingat.toml` (INGAT-TOML-AUDIT)

Bản dịch của [INGAT_TOML_REVIEW.md](INGAT_TOML_REVIEW.md); tiếng Anh là nguồn chuẩn. Các review về tính đúng của cùng
file, [INGAT_T0_T8_REVIEW.md](INGAT_T0_T8_REVIEW.md) và [INGAT_T0_T8_RECHECK1.md](INGAT_T0_T8_RECHECK1.md), giữ nguyên.

**Tóm tắt cho chủ dự án.** `ingat.toml` không phình to: đây là dạng Ingat 0.1.x (M1) của mẫu SQLite trong
MANIFEST_SPEC §11 của Ingat, cùng các mục theo cùng thứ tự, và với 257 dòng nó bằng cỡ fixture của chính Ingat cho mẫu
đó (255 dòng). Gần như mọi key đều do parser của Ingat 0.1.0 bắt buộc, khác giá trị mặc định và được 0.1.0 đọc, hoặc
là một sự thật được khai báo mà milestone sau của Ingat sẽ đọc; các dòng `service`/`mode`/`effect`/`timeout` lặp lại
trong mười một task không rút gọn được, vì schema 1 không có giá trị mặc định cho task (đã chứng minh: bảng
`[task_defaults]` bị từ chối là key lạ). Phần thừa thật sự nhỏ: sáu dòng là danh sách rỗng bằng đúng mặc định của Ingat,
và phần đầu bảy dòng lặp lại ADR 0002 và nói lần thứ ba về image do CI build. Một biến thể gọn bỏ các phần đó còn 249
dòng thay vì 257, qua `ingat validate` đã ghim, và cho ra đúng cùng một model (cả 556 trường sau parse đều bằng nhau).
Những chỗ dài có chủ ý: các task outbound (sáu task cho ba lệnh, vì preview, confirm và bước gỡ hold cần thiết lập khác
nhau), các exit map viết rõ và các chú thích mang sự thật không có ở nơi nào khác. Với người vận hành, file dễ dùng; ba
dòng dài 197-319 ký tự và hai đoạn văn bản cho người vận hành thiếu một gợi ý hữu ích là phần trau chuốt tùy chọn, đã
có biến thể được validate.

- Giai đoạn/ngày/reviewer và model/effort quan sát được: nhánh phụ "Ingat deployability" (không nằm trên board); task
  INGAT-TOML-AUDIT attempt 1 (audit cấu trúc của manifest đã được nghiệm thu); 2026-10-23; timesheet-auditor, effort
  xhigh (profile cố định); model tự báo `claude-opus-5-5`.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: HEAD
  `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45` (local, đúng như brief); SHA-256 của `ingat.toml`
  `7bf274a8c8da29c75c806e46bfa62489b4821d59fee08a5d81c70cced74a1104`, bằng blob ở HEAD và blob ở `6173f07`, lúc đầu và
  lúc cuối; source digest `59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad` (875 file, không tính
  `handoff/`) lúc đầu và lúc cuối. Cây làm việc chỉ khác HEAD ở các file nhiệm vụ trong `handoff/`. Bản cũ trong
  worktree `.claude/worktrees/relaxed-lalande-8359f0/ingat.toml` có cùng hash.
- Quyết định: **FIX REQUIRED** (hai lỗi mức Low, cả hai không đổi hành vi: model sau khi giải vẫn y hệt; mỗi cách sửa có
  phạm vi rõ và chủ dự án có thể nhận hoặc từ chối). Không có lỗi nào về tính đúng hay an toàn.
- Phạm vi thật đã xem/chạy:
  - Đã đọc: `ingat.toml`, `.github/workflows/ingat-validate.yml`, `compose.example.yaml`, Dockerfile, phần đầu của
    `src/server/cli.ts`, `/api/health` và `/api/ready` trong `src/server/app.ts`, các đoạn về Ingat trong docs/07 và
    docs/11, ADR 0002, các hồ sơ trước mà brief nêu (chỉ coi là nhận định cần kiểm).
  - Ingat 0.1.0 (chỉ đọc): toàn bộ MANIFEST_SPEC; `model/manifest.py`, `model/toml_read.py`, `model/instance.py`,
    `ops/validate.py`, `ops/deploy.py`, `ops/lifecycle.py`, `ops/backup.py`, `ops/steps_build.py`, `ops/context.py`,
    `ops/status.py`, `core/probes.py`, `core/tasks.py`, `adapters/override.py`, danh sách lệnh trong guide, fixture
    `fixtures/fx-lite/ingat.toml`; grep mọi key của manifest trong `src/`. 13 file được trích có cùng SHA-256 trong
    image đã ghim và trong checkout (`v0.1.0-16-g35be585`).
  - Đã chạy: `ingat validate` đã ghim, đúng dạng lệnh của job CI, trên bản sao của file gốc và ba biến thể, một phép
    thử âm, hai file instance tổng hợp; dump mọi trường đã giải qua chính parser của Ingat trong image đã ghim, và diff
    các bản dump. Không mở bản nháp riêng của chủ dự án.
- Bảng bằng chứng (lệnh | kết quả/exit | bằng chứng, tất cả trong `handoff/delivery/evidence/INGAT-TOML-AUDIT/`):

  | Lệnh | Kết quả / exit | Bằng chứng |
  |---|---|---|
  | `git rev-parse HEAD`, `git status --short`, `sha256sum` của file, blob ở HEAD và `6173f07`, bản worktree | 0; tất cả `7bf274a8...` | `identity.txt` |
  | `node scripts/source-digest.mjs` (Node v24.21.0), đầu và cuối | 0; `59516a2d...` cả hai lần | `identity.txt` |
  | `docker run --rm --read-only --network none --cap-drop ALL --security-opt no-new-privileges --user "$(id -u):$(id -g)" --volume <copy>:/app:ro ghcr.io/lisahq/ingat@sha256:b5db73bf... validate /app` trên `orig`, `lean`, `lean-wrapped`, `optional` | 0, 0, 0, 0 ("is valid") | `results-summary.txt` |
  | Như trên với `probe-required` (một bảng `[task_defaults]`; một task không có `service`, `mode`, `effect`, `timeout`) | 1: bốn "is required", "task_defaults: unknown key" | `results-summary.txt`, `commands.txt` |
  | Như trên với `--instance` và một file instance tổng hợp đúng / sai | 0 / 1 (chín thông báo, mỗi key một dòng) | `results-summary.txt`, `instance-*.toml.txt` |
  | `docker run ... --entrypoint python3 <image> -I /scripts/dump_model.py /app/ingat.toml` cho từng biến thể; `diff` phần thân | 0 mỗi lần; `lean` và `lean-wrapped` giống hệt `orig` (thân `e831cb73...`, 556 trường); `optional` chỉ khác ở chỗ chủ ý | `model-dump-orig.txt`, `model-diff-optional.txt`, `dump_model.py.txt` |
  | Kích thước (`wc`, `awk`) | orig 257 dòng / 11.261 byte / 14 dòng quá 120 cột (dài nhất 319); lean 249 / 10.938 / 3; lean-wrapped 258 / 10.986 / 0 (dài nhất 119); optional 258 / 11.285 / 0 | `results-summary.txt` |
  | `sha256sum` 13 file Ingat trong image (`--entrypoint sha256sum`) và trong checkout | 0; tất cả bằng nhau | `identity.txt` |
  | `cmp` mỗi bản sao bằng chứng với bản gốc trong thư mục task | 0 cho cả mười bản sao | `commands.txt` |

- Lỗi (mức | đường dẫn key (dòng) | bằng chứng | kỳ vọng / thực tế | sửa có phạm vi):
  - **F1 Low | `[backup] verify = []` (108), `[restore] start = []` (111), `post = []` (113), `checks = []` (114),
    `[drill] checks = []` (121), `record = []` (122)** | mỗi dòng bằng mặc định của parser, một danh sách rỗng
    (`model/manifest.py:215, 222, 224, 225, 231, 232`; `toml_read.py:57-62`); 0.1.0 duyệt danh sách rỗng dù có viết hay
    không (`ops/steps_build.py:83`, `ops/backup.py:160-162, 173`); bỏ chúng đi thì `ingat validate` vẫn exit 0 và model
    sau parse y hệt (`results-summary.txt`) | kỳ vọng: key ở giá trị mặc định thì bỏ, trừ khi file nói lý do giữ, như
    chính phần đầu file đã làm với các danh sách `[deploy]` rỗng; thực tế: sáu dòng mặc định, năm dòng không nêu lý do
    (lý do, lệnh restore tự kiểm hash, tính toàn vẹn và schema, chỉ có trong hồ sơ plan) | sửa: xóa sáu dòng, chuyển ghi
    chú `verify` lên dòng tiêu đề `[backup]` và ghi lý do của `[restore]` ở đó (biến thể lean, dòng 108-114). Nếu từ
    chối thì giữ được sự giống nhau với fixture fx-lite của Ingat, vốn có viết các danh sách này.
  - **F2 Low | phần đầu (1-7) và ghi chú `[compose]` (17-18)** | dòng 3-6 nhắc lại ADR 0002 ("Facts for the owner": các
    phần M1 bỏ; "Decision": CI build, pull theo tag, nhãn revision); sự thật về CI/pull xuất hiện ba lần (dòng 5-6,
    17, 18); câu trong ngoặc ở dòng 4-5 giải thích vì sao danh sách deploy *không rỗng* bị từ chối, điều này không giải
    thích vì sao các danh sách *rỗng* bị bỏ | kỳ vọng: mỗi sự thật nói một lần, cạnh key liên quan; thực tế: ba lần |
    sửa: phần đầu bốn dòng trỏ tới ADR 0002 và nói rằng key ở mặc định của Ingat được bỏ, và mỗi key `[compose]` một ghi
    chú (biến thể lean, dòng 1-16).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  - O-A Độ dài dòng. `pause` (99, 317 ký tự), `restore_notice` (136, 319) và `argv` của probe sẵn sàng (69, 197) rộng
    hơn hẳn phần còn lại. Chuỗi nhiều dòng của TOML với dấu gạch chéo ngược ở cuối mỗi dòng cho đúng cùng giá trị
    (`lean-wrapped`: model y hệt, dòng rộng nhất 119). Đánh đổi: ai sửa một dòng đã ngắt phải giữ khoảng trắng trước dấu
    gạch chéo ngược, nếu không hai từ sẽ dính nhau.
  - O-B Văn bản `pause` không nhắc tới `bootstrap-new-token`, task mà pause cho phép, cũng không nói token sống 60 phút
    (`src/server/cli.ts:35-39`); bản tóm tắt kế hoạch chỉ liệt kê tên các task được phép (`cli/render.py:29`). Biến thể
    `optional` thêm một câu.
  - O-C `restore_notice` nêu tên các task confirm mà không có `--arg job=<id>` và kết thúc bằng `outbound-resume` trơn.
    Ingat 0.1.0 chưa bao giờ hiển thị nó (chưa có restore trực tiếp), nên việc này có ý nghĩa từ M2. Biến thể `optional`
    ghi rõ cú pháp.
  - O-D Một giá trị sai của key có pattern chỉ báo "does not match the manifest's pattern" (`model/instance.py:231-232`;
    đã tái hiện với `APP_ORIGINS`, `PUBLIC_BASE_URL`, `SESSION_TTL_HOURS`). Một dòng ghi chú về định dạng cho
    `APP_ORIGINS` và `PUBLIC_BASE_URL` giúp người vận hành (biến thể `optional`).
  - O-E `[[smoke]] live` (84-87) lặp lại `[probes.edge-live]` (cùng request, cùng kỳ vọng) và đã được `[[smoke]] ready`
    bao trùm, vì `/api/ready` cũng đọc cơ sở dữ liệu (`app.ts:57-64, 121-128`). Trong 0.1.0, mọi kế hoạch chạy smoke đều
    vừa qua `edge-live` (`core/probes.py:136-143`, `ops/deploy.py:432-437`, `ops/lifecycle.py:130-138`). Bỏ nó không
    đổi hành vi (biến thể `optional`, validate exit 0) nhưng mất khả năng phân biệt "sống nhưng chưa sẵn sàng" và mất sự
    giống với §11. Nên giữ, trừ khi ít dòng quan trọng hơn.
  - O-F Giữ có chủ ý dù 0.1.0 vẫn chạy như cũ khi thiếu: `0 = "ok"` trong mười exit map (mã 0 không khai báo đã là ok,
    `core/tasks.py:32-36`); `operator = false` và `image = "candidate"`/`"bundle"` ở migrate, backup và restore
    (`ops/lifecycle.py:191` vẫn từ chối; MANIFEST_SPEC §4 yêu cầu `operator = false`); `mode = "0700"` (planner tự dùng
    0700, `ops/deploy.py:270`, nhưng spec không ghi mặc định); `data_dir_writable = true` cạnh `status = "ready"` (đã hàm
    ý bởi `app.ts:124`). Chúng nói rõ hợp đồng.
  - O-G Khai báo cho milestone sau, 0.1.0 không đọc lúc chạy: `single_active` (Planned M4), `after_restore`,
    `restore_notice`, `[restore] activate`, `[rollback] env`. Giữ: hiện được validate và sau này cần.
  - O-H `local_only = true` không được đường code nào của 0.1.0 đọc, và MANIFEST_SPEC §2.4 không ghi Planned, nên 0.1.0
    không từ chối thư mục dữ liệu không phải đĩa cục bộ. Không phải lỗi của manifest; nên mở issue cho Ingat. Trong lúc
    chờ, quy tắc đĩa cục bộ của docs/11 và `compose.example.yaml` là hàng rào duy nhất.
  - O-I Đổi CLI có một chỗ rõ ràng để sửa (banner của tasks trỏ tới `src/server/cli.ts`), nhưng tiền tố
    `node dist/server/cli.js` lặp mười một lần và không gom được trong schema 1 (không có biến cho argv; mọi param phải là
    biến Compose, `ops/validate.py:55`). Chưa có gì kiểm rằng argv của mỗi task được `cli.ts` chấp nhận; `ingat validate`
    chỉ kiểm cấu trúc. Tùy chọn: một unit test nhỏ.
  - O-J Các task outbound đã tối thiểu: hai preview (lệnh khác nhau; `idempotent`, `expect`, exit 2 = ok), ba confirm,
    một resume gỡ hold; `--all` và `--job <id>` không dùng chung một mẫu argv được vì `args` chỉ điền giá trị, không thêm
    hay bớt phần tử. Gộp release-job và drop-job bằng một đối số hành động là làm được nhưng sẽ giấu một thao tác phá hủy
    sau một cái tên chung chung: không khuyến nghị. `[[smoke]] ready` và `[probes.ready]` không trùng nhau: probe exec
    cấp dữ liệu cho `[schema]` và là kiểm tra sẵn sàng duy nhất trong drill cô lập, nơi probe http không chạy
    (`core/probes.py:113-115`).
  - Mục đã biết, không mới: O1 (câu chữ `ingat.toml:14`), O3 (câu chữ dòng 30) và O4 (dòng 140 so với phần đầu
    `cli.ts`; banner của bản lean nói "describes every command") từ RECHECK1; R8 (`min_free_memory` chưa đo) từ review
    đầu.
- Gate chưa chạy/bị chặn và lý do (chưa chạy theo thiết kế, không phải đạt): máy đích; Ingat `init`, `prepare`,
  `deploy`, `backup`, `verify --restore-test`, chạy task và pause cài đặt trên instance thật; milestone sau (restore
  trực tiếp và rollback từ M2, `single_active` từ M4). Với các biến thể gọn, việc model sau parse giống hệt thay cho
  bằng chứng chạy thật: Ingat lập kế hoạch từ model đã parse, chỉ hash manifest được ghi lại là khác. Ảnh hưởng lúc chạy
  của biến thể `optional` (bớt một smoke check) được lần theo code, chưa chạy.
- Xử lý phát hiện trước: không có phát hiện trước về cấu trúc file này; F1-F3 cũ vẫn đóng (RECHECK1), các mục đã biết ở
  trên không đổi.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: manifest đã nghiệm thu vẫn đúng và dùng được như hiện tại; F1 và F2
  là phần dọn dẹp nhỏ, không chặn mức sẵn sàng phần mềm của nhánh. Mọi bước trên GitHub và NAS vẫn cần chủ dự án cho
  phép. Chưa có kết quả pilot.
- Một bước/prompt tiếp: coordinator trình chủ dự án F1 và F2 (biến thể lean, chỉ đổi `ingat.toml`, model y hệt) và O-A
  đến O-D; nếu chủ dự án đồng ý, một task worker có phạm vi áp dụng các mục được chọn vào `ingat.toml`, rồi một gate chạy
  lại `ingat validate` đã ghim và dump model (SHA-256 phần thân phải giữ nguyên
  `e831cb73169f2c09fefbb2f7e02470ea5fd2c997cd62ab3034eb344a37776356` trừ khi chọn O-B đến O-E), sau đó một recheck mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: INGAT-TOML-AUDIT attempt 1, timesheet-auditor
  (`claude-opus-5-5`, tự báo); tác giả của `ingat.toml`: INGAT-T0T8-PLAN (planner), INGAT-T0T8-IMPL (worker-high) và
  INGAT-T0T8-FIX1 (worker), đều là Sonnet theo brief. Model của auditor không yếu hơn model mạnh nhất của tác giả.
- Context mới; xác nhận reviewer không viết thay đổi: context mới; auditor không viết gì trong `ingat.toml` và chỉ ghi
  cặp review này, phần Results của brief, `handoff/delivery/evidence/INGAT-TOML-AUDIT/` và thư mục task.
- Digest trước/sau; bằng chứng gate snapshot đó: `59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad` và
  `ingat.toml` `7bf274a8...` trước và sau (`identity.txt`); gate đã nghiệm thu nội dung này là INGAT-T0T8-REGATE1 cùng
  INGAT-T0T8-RECHECK1 PASS.
- Path report mới giữ lịch sử review trước: `handoff/delivery/INGAT_TOML_REVIEW.md` và `.vi.md`; review, recheck
  INGAT_T0_T8 và bằng chứng của chúng không đổi.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: F1 và F2 còn mở (Low, do chủ dự án chọn); các mục tùy chọn
  O-A đến O-J cho chủ dự án; nếu đồng ý, một task sửa `ingat.toml`, một gate và một recheck mới.
