# Brief giao việc WF-REVIEW

- Mission/task: timesheet-software-readiness / WF-REVIEW; package trên board WP1 (sửa
  quy trình, không phải việc ứng dụng); loại plan; attempt 1; không dependency.
- Yêu cầu chủ dự án, chat 2026-10-02 (tóm ý): (1) kiểm tính thực tế và hiệu quả của quy
  trình AI tự động từ đầu đến cuối; (2) đánh giá bảng model/effort có thấp so với độ phức
  tạp thật không; (3) chọn giữa bảng cố định và coordinator tự chọn theo từng việc thật,
  tối đa độ chính xác/hiệu quả mà không phí token; (4) nay cho phép tự commit và push
  trong lúc làm, thẳng trên nhánh chính khi chưa release; sau release đầu tiên dùng nhánh
  phụ cho sửa/nâng cấp.
- Profile: timesheet-planner, yêu cầu sonnet/high; model/effort thật không quan sát được.
- Baseline: HEAD 1a25275b7c87bcef1e9099d7adba8f2eb763d698 cộng thiết kế điều phối chưa
  commit (tác giả tự kiểm, chưa từng audit độc lập).
- Đọc khi cần: AGENTS.md, CLAUDE.md, docs/08 (EN), handoff/prompts/ORCHESTRATE.md,
  RESUME.md, FIX_FINDINGS.md, handoff/NEXT_ACTION.md, handoff/templates/*.md (EN),
  .claude/settings.json, .claude/agents/*.md, handoff/delivery/validate_orchestration.py,
  handoff/delivery/evidence/orchestration/check-recovery.py, ORCHESTRATION.json,
  STATE.json, ORCHESTRATION_HANDOFF.md, WP1_REVIEW.md (F-01), WP1_HANDOFF.md,
  docs/06, docs/09 và prompt IMPLEMENT/REVIEW WP2–WP5 (chỉ để ước lượng khối lượng).
  Chỉ mở .vi.md để liệt kê phần cần sửa cặp.
- Sự kiện coordinator quan sát: công cụ Agent cho override `model` từng lần giao (enum
  sonnet, opus, haiku, fable), ưu tiên hơn frontmatter profile; không có tham số effort
  từng lần giao, effort chỉ lấy từ frontmatter profile. Phiên chính thực chạy
  claude-opus-5-5 (chủ dự án chọn) dù profile yêu cầu sonnet/medium. Validator buộc
  model/effort của task pending/running bằng frontmatter, đúng tám profile, loại task
  plan/diagnose/implement/fix/gate/audit/documentation; mọi profile không phải coordinator
  cấm commit/push. Một tra cứu tài liệu chỉ-đọc riêng đang kiểm mức effort theo model
  (xhigh/max), nghĩa của `fable`, sửa profile có nạp không cần khởi động lại, và trọng số
  usage Opus so với Sonnet. Thiết kế phải chịu được các ẩn số này; đánh dấu lựa chọn phụ
  thuộc là có điều kiện.

## Đầu ra bắt buộc (chỉ report)

A. Kết quả tính thực tế/hiệu quả: điểm nghẽn, kiểu lỗi, lãng phí token (brief/kết quả nội
   bộ song ngữ, chi phí coordinator không có shell cho validate/commit, ngưỡng leo thang,
   vòng audit lại, xử lý digest, chi phí khôi phục). Có mức độ và bằng chứng file:line.
B. Ước lượng khối lượng: phân loại sửa F-01 và các loại task WP2–WP5 theo quy mô và rủi
   ro, lý do ngắn từ roadmap/prompt.
C. Định tuyến: vai trò nào thiếu hoặc thừa sức. Đề xuất chính sách (ví dụ profile là bậc
   effort cộng override model từng lần giao theo rubric quy mô × rủi ro), điều kiện
   tăng/giảm bậc, sức planner cho plan package so với plan sửa có giới hạn, sức
   audit/nghiệm thu, bậc dịch/kiểm kê, model coordinator. Một bảng: loại task × quy mô ×
   rủi ro → profile, model, effort, lý do. Nêu cách ghi override yêu cầu/thật và validator
   phải chấp nhận gì.
D. Thiết kế commit/push: commit thẳng main trước release; ai commit (coordinator không có
   shell), khi nào (ranh giới task, gate, audit), stage theo path cụ thể, kiểm riêng tư
   trước commit (không secret, chữ ký, PDF riêng, dữ liệu cá nhân), không
   amend/force/viết lại lịch sử/--no-verify/tag/release, xử lý push lỗi, khóa
   Dropbox/Windows, quan hệ với snapshot đóng băng và digest (cân nhắc SHA commit cộng cây
   sạch làm định danh được audit), commit state do coordinator ghi, quy ước commit
   message, chính sách nhánh/PR sau release đầu. Quyết định commit thiết kế chưa commit
   hiện có riêng hay cùng lần sửa này, biết nó chưa từng audit độc lập.
E. Danh sách thay đổi chính xác: từng file (EN và cặp .vi.md, profile, validator, probe
   khôi phục, template, prompt vào NEXT_ACTION, trường STATE) với thay đổi cụ thể, tập tối
   thiểu trước; đánh dấu thứ cần khởi động lại client.
F. Rủi ro/ẩn số và điều gate cùng audit độc lập phải kiểm.

- Được ghi: report này và WF-REVIEW.md; thêm kết quả dưới brief bằng cả hai ngôn ngữ.
  Mọi path khác chỉ đọc. Không commit, không sửa source/cấu hình.
- Lệnh chỉ-đọc được phép: git status/log/diff, `claude --version` nếu có, validator
  chỉ-đọc. Trích output chính trong report; không lưu bằng chứng nơi khác.
- Trả coordinator: tóm tắt ngắn (tối đa 400 từ) và path report.

## Kết quả

### Ghi chú người review

Người review: profile timesheet-planner, yêu cầu sonnet/high; model tự báo claude-sonnet-5-5
(lấy từ system prompt của phiên, không tự kiểm chứng được); effort không quan sát được.
Review chỉ-đọc; không ghi file repo nào ngoài report này và bản dịch. Quan sát tách khỏi đề
xuất. Mục phụ thuộc kết quả tra cứu WF-CAPS đang chạy được gắn **[C-n]** và phải chốt trước
khi triển khai:

- **C-1** mỗi model nhận effort nào (xhigh/max cho Opus và Sonnet);
- **C-2** ý nghĩa/khả dụng của alias `fable`;
- **C-3** sửa `.claude/agents/*.md` và `.claude/settings.json` có nạp mà không cần restart client không;
- **C-4** trọng số dùng subscription tương đối giữa Opus và Sonnet;
- **C-5** cú pháp permission rule để chặn lệnh con của git, và Bash của subagent chạy nền có bị kẹt ở permission prompt không;
- **C-6** kết quả của công cụ Agent có cho biết model thực sự dùng không.

Sự kiện quan sát chính:

- `git rev-parse HEAD` = `ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed` ("Configure resumable Claude subagent orchestration", 2026-10-02 17:36 -0700); `git status -sb` = `## main...origin/main` và `origin/main` cùng SHA, nên commit đó **đã được push**. `git show --stat ffbf8f0` cho thấy nó chứa profile, settings, validator, prompt, template và bản viết lại docs. `git status --short` hiện chỉ có `M handoff/delivery/ORCHESTRATION.json` và các file chưa theo dõi WF-REVIEW/checkpoint. Vì vậy "thiết kế orchestration chưa commit" trong brief **không còn tồn tại**; nó đã được commit và push sau baseline `1a25275` của brief.
- `claude --version` -> `2.1.285 (Claude Code)` (ORCHESTRATION_HANDOFF.md ghi executable không có; đã lỗi thời).
- `python handoff/delivery/validate_orchestration.py` -> `{"status":"PASS","profiles":8,"tasks":5,"active_tasks":1,"application_acceptance_verified":false,"claude_runtime_verified":false}`.
- `.git/hooks` không có hook thật; `commit.gpgsign` chưa đặt; remote `origin https://github.com/CDSemi/timesheet.git`; chưa có permission rule nào (`.claude/settings.json` chỉ là `{"agent":"timesheet-coordinator"}`; `~/.claude/settings.json` chỉ có theme).
- Quy mô: 6.796 dòng TS ở `src/` + `tests/`; 647 file được theo dõi; 174 test đạt (WP1_REVIEW.md:28); `timesheetCommands.ts` dài 458 dòng.

## A. Phát hiện về tính thực tế và hiệu quả

Mức: H = chặn yêu cầu mới hoặc tốn phần lớn token/thời gian; M = chi phí lặp lại hoặc lỗ hổng đúng-đắn; L = nhỏ.

| # | Mức | Phát hiện (quan sát) | Bằng chứng | Hệ quả / đề xuất |
|---|---|---|---|---|
| A1 | H | **Baseline lỗi thời.** Board, brief, checkpoint, handoff mô tả HEAD `1a25275` cộng thiết kế chưa commit; thiết kế đó đã là commit `ffbf8f0` đã push. | `baseline_commit` của cả 5 task trong ORCHESTRATION.json; WF-REVIEW.md:13; WORKFLOW_REVISION_CHECKPOINT.md; ORCHESTRATION_HANDOFF.md:4 ("left uncommitted"); `git log` | Baseline audit sẽ ghi sai. Đặt lại `baseline_commit` cho task pending; WF-AUDIT phải phủ diff tích lũy `1a25275..HEAD` vì thiết kế chưa từng được audit độc lập (D5). |
| A2 | H | **Validator chặn model override theo từng dispatch.** Task pending/running phải có `requested_model/effort` bằng frontmatter profile, nên coordinator truyền `model: opus` cho profile sonnet không ghi trung thực được. Không có trường tách mặc định profile / model yêu cầu / model thực tự báo; `coordinator_runtime` là văn bản tự do, không validate. | validate_orchestration.py:101-103; ORCHESTRATION.json `coordinator_runtime` | Bảng cố định không diễn đạt được chính sách rubric ở C. Sửa validator và schema board (mục E 10, 13). |
| A3 | H | **Coordinator không có shell => mỗi thay đổi state thường tốn một subagent validate cộng việc copy cả file.** Luật yêu cầu subagent validate mỗi board thay thế và lưu `ORCHESTRATION.previous.json` trước khi thay; copy nghĩa là coordinator Write toàn bộ file (hiện 7,4 KB với 5 task; ~5 task/package suy ra hàng chục KB). | docs/08:40; ORCHESTRATE.md:38-39; check-recovery.py:41 | Chi phí tăng theo kích thước board và số dispatch. Dùng git làm bản phục hồi (`git show HEAD:handoff/delivery/ORCHESTRATION.json`), sửa board bằng Edit nhỏ, chạy validator **trong task commit** (pre-commit) và sau khi đổi luật/profile, không sau mỗi cập nhật. |
| A4 | M-H | **Brief và kết quả song ngữ cho mọi task, do coordinator viết trước dispatch.** Validator bắt buộc cả hai ngôn ngữ cho task không pending/cancelled. WF-REVIEW EN+VI = 4.971 + 5.330 byte cho một brief. docs/09:63 chỉ nói "tài liệu yêu cầu/vận hành hướng người dùng giữ song ngữ". | docs/08:40; ORCHESTRATE.md:15-16; validate_orchestration.py:115-116; AGENTS.md rule 1 | Gần gấp đôi output của coordinator (thực tế là Opus). Đề xuất (cần chủ dự án xác nhận vì AGENTS rule 1 yêu cầu giữ bản dịch tương ứng): brief/kết quả task là hồ sơ làm việc cho agent, chỉ tiếng Anh; tiếng Việt vẫn bắt buộc cho CHECKPOINT, HANDOFF, REVIEW, tài liệu hướng chủ dự án và chat. Phương án dự phòng: giữ cặp file nhưng để `timesheet-light` (sonnet/low) viết VI sau khi có kết quả, không phải coordinator trước dispatch. |
| A5 | M-H | **Task planner lặp lại một bản sửa đã được đặc tả.** F-01 trong WP1_REVIEW đã có file, hàm, dòng 425-450, repro F-01A/F-01B, cách sửa giới hạn (theo `updateSession`: thay hàng break cũ bằng tập đã gửi, giữ audit/rollback) và danh sách regression. WP1-F01-PLAN sẽ suy diễn lại (planner/high + brief song ngữ + validator + commit). | WP1_REVIEW.md:68-78; ORCHESTRATE.md:14-15; tasks/WP1-F01-PLAN.md | Cho phép bỏ `plan` khi finding đã chấp nhận nêu file/hàm/repro/fix/test; prompt worker-high đã yêu cầu tái hiện trước khi sửa. Hủy WP1-F01-PLAN (`cancelled` không cần report trong validator). |
| A6 | M | **Gate rồi audit chạy lại cùng bộ lệnh.** Verifier chạy typecheck/lint/test/build/smoke/digest/probe; auditor phải tự chạy các kiểm tra bắt buộc và ghi digest trước/sau; worker cũng đã chạy. Chi phí chủ yếu là overhead agent, không phải output lệnh. | docs/08:50; validate_orchestration.py:161-163 | Giữ gate verifier cho snapshot cuối package; với fix S để task audit tự gồm gate (`gate_included`) và nới :161 (tầng 2). |
| A7 | M | **Công cụ gắn với máy.** Runner hard-code cache runtime của vendor khác cho Node và Python; Node hệ thống là v26.10.0 (ngoài `engines ^24.11.0`) và npm mặc định lỗi. Mỗi verifier/auditor phải tự tìm lại; runner hỏng nếu cache bị dọn. | run-gates.ps1:3-5; run-validation.ps1:3; WP1_REVIEW.md:19; `node --version` = v26.10.0 | Một gate runner dùng lại được, có bộ định vị Node 24 và fallback python trên PATH (python trên PATH là 3.14). Tầng 2. |
| A8 | M | **Không có giới hạn số lần thử hay hạ cấp.** `expert` là "sau hai lần thử có tái hiện thất bại"; vòng FIX REQUIRED -> fix -> gate -> audit chỉ bị giới hạn bằng lời; mỗi lần lặp tốn một chu kỳ đầy đủ. | docs/08:22,52 | Thêm giới hạn (C4). |
| A9 | M | **Digest so với commit.** `scripts/source-digest.mjs` băm blob ID git của mọi file ngoài `handoff/`, kể cả file chưa theo dõi không bị ignore, và ghi rõ sau commit nó bằng công thức cây HEAD. Sửa profile/docs/AGENTS vì vậy đổi digest nguồn (đúng), file rác chưa theo dõi cũng đổi digest, và coordinator không tính được. | scripts/source-digest.mjs:1-12; docs/08:32 | Dùng (commit SHA + cây sạch + digest) làm định danh được audit (D6). |
| A10 | M | **Luật commit mâu thuẫn quyết định mới của chủ dự án ở sáu tài liệu và cả bảy profile có shell.** | AGENTS.md:14 (rule 12); docs/08:7; ORCHESTRATE.md:6; RESUME.md:20; NEXT_ACTION.md:22; dòng 12-14 của profile; skill commit-message ("authorizes no version-control mutation") | Liệt kê ở E. Không subagent nào được commit hợp lệ cho đến khi sửa profile. |
| A11 | L-M | **Đọc thừa mỗi dispatch.** CLAUDE.md import `@AGENTS.md` nên AGENTS.md đã có trong context, nhưng profile vẫn ghi "Read AGENTS.md, document 08...". Document 08 dài 63 dòng dày. | CLAUDE.md dòng 3; profile dòng 9 | Dòng 9 profile: đọc brief task; chỉ planner/verifier/auditor/committer đọc document 08. |
| A12 | L-M | **Dispatch phục hồi vô điều kiện.** Mỗi lần resume đều giao reconcile dù không task nào running/interrupted. | docs/08:44; RESUME.md:2 | Chỉ giao khi có task `running`/`interrupted` hoặc trạng thái git bẩn/chưa push; ngược lại đọc trực tiếp board + checkpoint. |
| A13 | L | **Subagent tự báo được model** (system prompt nêu model ID); `actual_model` của WF-REVIEW đang null dù quan sát rẻ. Effort không tự báo được. | ORCHESTRATION.json task WF-REVIEW | Yêu cầu dòng đầu kết quả "Self-reported model/effort"; board ghi `actual_source`. |
| A14 | L | `auxiliary_lookups` (WF-CAPS) nằm ngoài validator và ngoài giới hạn hai agent đang chạy; hiện 2 agent nên chưa vi phạm nhưng chưa được cưỡng chế. | ORCHESTRATION.json; validate_orchestration.py:169-170 | Validate/đếm nó (tầng 3). |
| A15 | L | Repo công khai; runner bằng chứng chứa đường dẫn tài khoản Windows (đã có, không mới). | run-gates.ps1:3 | Script riêng tư chỉ cảnh báo (không chặn) với `C:\Users\<name>`. |

Không thấy vấn đề: quy tắc đồng thời (tối đa hai, một writer, gate/audit độc quyền) khớp validator; prompt profile cấm ủy quyền lồng nhau; danh sách tool của coordinator đúng là không có Bash.

## B. Ước lượng khối lượng

Kích thước S = một file/hàm; M = vài file / một lát dọc; L = lát đa module có schema/service mới; XL = nhiều lát, xuyên suốt. Rủi ro H = đầu vào OT/credit, ledger/số dư, quyền sở hữu/phân quyền, transaction/đồng thời, riêng tư (PDF/chữ ký/export/dữ liệu cá nhân), lịch sử bất biến, phục hồi, gửi ra ngoài. Không nêu số token hay thời lượng (không quan sát được).

| Hạng mục | Cỡ | Rủi ro | Lý do (bằng chứng roadmap/prompt) |
|---|---|---|---|
| Sửa WP1 F-01 (`clockOut`, timesheetCommands.ts:425-450) | S | H (đổi đầu vào OT; transaction IMMEDIATE; audit trước/sau) | Một hàm; mẫu đã có ở `updateSession`; hai repro + xác nhận rỗng/không rõ + rollback trong `tests/integration`. Kế hoạch đã ở WP1_REVIEW.md:68. |
| Gate F-01 | S | M | Lệnh có sẵn (typecheck, lint, 174 test, build, smoke, digest) + probe; cơ học. |
| Audit recheck F-01 | phạm vi S, mở khóa WP2 | H | Tái hiện F-01A/B và chạy lại gate trên digest mới; brief hẹp giữ chi phí nhỏ. |
| Sửa workflow (WF-IMPL) | M | M-H (chi phối mọi thứ; logic validator) | Khoảng 20 cặp EN+VI, validator + probe, một profile mới; không đụng source ứng dụng. |
| WP2 editor/cài đặt/lịch, CSV ngày lễ | M x2-3 | M (CSV là đầu vào không tin cậy) | docs/09 WP2 checkpoint 1; xây trên service WP1. |
| WP2 quản trị người dùng và quyền sở hữu | M | H | AC-01; "admin không phải quyền truy cập dữ liệu riêng tùy ý". |
| WP2 schema/service ledger (giữ chỗ, delta, consume/cancel/reverse một phần) | L | H, mới | Transaction, giữ chỗ đồng thời; không có mẫu trong repo. |
| WP2 nghỉ/WFH/loại, lịch sử/audit, CSV bằng chứng | M x2 | M-H (riêng tư khi export) | docs/09 WP2 checkpoint 2. |
| WP2 gate luồng trình duyệt | M | M | Công cụ mới; "HTML smoke hiện có không phải bằng chứng luồng trình duyệt" (WP1_REVIEW.md:91). |
| WP3 snapshot/hash, sign-off, finalization ledger/outbox nguyên tử | L-XL | H, mới | Snapshot bất biến; một transaction qua ledger và outbox. |
| WP3 PDF (pdf-lib) và file chữ ký riêng tư | M-L | H (riêng tư) | Bằng chứng trực quan gồm cả hai Chủ nhật; chữ ký không bao giờ công khai. |
| WP3 job/nhắc/tự động hạn chót/adapter/SMTP không chắc chắn | L | H | Đua hạn chót/thủ công, job trùng, gửi bị ngắt hoặc không chắc chắn. |
| WP3 kiểm tra tích hợp/trực quan | M | M | docs/09 checkpoint 3 "chỉ nếu cần". |
| WP4 Docker/Compose, backup/restore khi đang ghi | L | H | Restore với hash file/số dư; kiến trúc NAS có thể không kiểm chứng được (đánh dấu unverified theo hợp đồng). |
| WP4 preview/commit workbook (provenance, idempotency) | M-L | H (toàn vẹn dữ liệu; workbook thật chứa dữ liệu cá nhân) | Provenance theo ô nguồn; import lại giống hệt là no-op. |
| WP4 runbook/ví dụ cấu hình | S-M | L | Tài liệu. |
| WP5 audit chấp nhận mới cho WP1-WP4 | XL nếu là một task | H | Một auditor đọc cả code base vượt context hữu ích: chia 2-3 audit theo vùng cộng một lượt tích hợp. |
| WP5 sửa lỗi đã chấp nhận | S-M mỗi cái, chưa rõ số lượng | theo finding | Phụ thuộc kết quả audit. |
| WP5 gói pilot / ghi chú release | M | M | Tài liệu song ngữ; cần giá trị từ chủ dự án (URL, người nhận); không secret, không gửi thật. |
| Gate/audit mỗi package (WP2-WP4) | M-L mỗi cái | H | Bắt buộc; mỗi cái có thể sinh vòng FIX REQUIRED. |

Hiệu quả cho WP5: khi audit mỗi package ghi commit của nó (D6), WP5 có thể giới hạn review sâu vào `git diff <audited_commit>..HEAD -- . ':!handoff'` cộng đường dẫn xuyên package (AC-13), vẫn chạy lại toàn bộ bộ lệnh trên digest hiện tại nên giữ quy tắc "bằng chứng độc lập trên nguồn hiện tại".

## C. Định tuyến

### C1. Quan sát về bảng cố định hiện tại

- **Thiếu mạnh cho việc xây mới rủi ro cao:** ledger WP2, finalization nguyên tử/outbox/gửi không chắc chắn WP3 và restore-khi-ghi WP4 đều ánh xạ vào `worker-high` = sonnet/high, Opus chỉ sau hai lần thử có tái hiện thất bại. Với việc khó và mới, hai lần thất bại (mỗi lần kèm chi phí gate/audit) là đường đắt nhất. Repo không có bằng chứng chất lượng theo model (một lỗi P2 sống sót qua 174 test đạt cho thấy test có thể phản chiếu cài đặt, không cho biết model nào tốt hơn), nên đây là phán đoán theo rủi ro, phụ thuộc **[C-4]**.
- **Thiếu mạnh:** planner phân rã package cho WP2-WP4 (sonnet/high); ranh giới lát sai nhân lên công làm lại, việc lập kế hoạch chỉ-đọc và một lần mỗi package.
- **Thừa mạnh:** `timesheet-verifier` (high) cho việc chạy lệnh cơ học vì auditor vẫn chạy lại bộ kiểm tra; `timesheet-expert` nay trùng "worker-high + model opus" do đã có override model theo dispatch.
- **Phù hợp:** `light` (sonnet/low) cho kiểm kê và dịch trạng thái; `worker` (sonnet/medium) cho việc có hợp đồng rõ; `auditor` opus/high.
- **Coordinator:** thực tế claude-opus-5-5 trong khi profile yêu cầu sonnet/medium; frontmatter profile rõ ràng không ràng buộc phiên chính. Đây là context sống lâu nhất nên trọng số của nó ảnh hưởng nhiều nhất tới mức dùng **[C-4]**; việc của nó là dispatch và toàn vẹn JSON nên effort medium là đủ.
- **Bảng cố định hay chọn theo task:** effort chỉ đến từ profile; model override được theo dispatch. Tối ưu thực tế là **lai**: profile là *vai trò + bậc effort* (cố định, validator kiểm được), coordinator chọn *model* theo từng dispatch bằng rubric cỡ x rủi ro x tính mới, mặc định là model của profile.

### C2. Rubric

Cỡ S/M/L (mục B). Rủi ro H khi có bất kỳ: đầu vào OT/credit, ledger/số dư, sở hữu/phân quyền, transaction/đồng thời, riêng tư, lịch sử bất biến, phục hồi/restore, gửi ra ngoài. Mới (N) = không có mẫu trong repo để bắt chước. Bắt đầu ở dòng rẻ nhất đủ dùng; chỉ nâng khi có trigger (C4), không nâng vì "quan trọng".

### C3. Bảng (loại task x cỡ x rủi ro -> profile, model, effort, lý do)

| Loại task | Cỡ | Rủi ro / mới | Profile | Model | Effort | Lý do |
|---|---|---|---|---|---|---|
| Kiểm kê, đồng bộ link/bản dịch, trạng thái/handoff VI | bất kỳ | L | timesheet-light | sonnet | low | Cơ học; auditor kiểm mẫu ý nghĩa. `haiku` chỉ để liệt kê file thuần túy, không bao giờ để dịch, và chỉ khi khả dụng. |
| Plan từ finding đã chấp nhận nêu rõ file/fix/test | S | bất kỳ | không | n/a | n/a | Bỏ qua (A5); worker xác nhận phạm vi trước. |
| Plan/chẩn đoán vấn đề có giới hạn kèm repro | S-M | M-H | timesheet-planner | sonnet | high | Chỉ-đọc; repro giới hạn công việc. |
| Phân rã package (WP2, WP3, WP4) | L-XL | H | timesheet-planner | **opus** | high | Lỗi chia lát nhân lên; một dispatch mỗi package. |
| Reconcile task bị ngắt/không chắc | bất kỳ | M | timesheet-planner | sonnet | high | Phán đoán trên bằng chứng, chỉ-đọc. |
| Làm lát thường có hợp đồng rõ (view UI, preview CSV, cấu hình) | S-M | L-M | timesheet-worker | sonnet | medium | Hợp đồng rõ; test cho phản hồi. |
| Làm/sửa, rủi ro H, đã có mẫu (F-01, kiểm tra sở hữu, hàng audit) | S-M | H, không mới | timesheet-worker-high | sonnet | high | Mẫu có sẵn; tái hiện trước. |
| Làm lát H mới (service ledger, finalization nguyên tử/outbox, restore khi ghi, gửi không chắc chắn) | L | H + N | timesheet-worker-high | **opus** | high | Tránh trả hai chu kỳ Sonnet thất bại; một writer giữ chi phí tuần tự và có giới hạn. |
| Lần thử thứ hai thất bại, hoặc gốc lỗi chưa rõ sau một lần thử có bằng chứng | S-M | H | timesheet-expert | opus | high | Định nghĩa lại expert là bậc leo thang, không phải "sau hai lần thất bại". |
| Gate, fix S hoặc lát thường | S-M | M | timesheet-verifier | sonnet | **medium** | Cơ học; audit chạy lại. Hạ effort là sửa frontmatter (restart [C-3]). |
| Gate, snapshot cuối package | L | H | timesheet-verifier | sonnet | medium | Lên opus chỉ khi output probe cần phán đoán. |
| Audit độc lập: chấp nhận package (WP1-WP4), audit workflow/luật | M-L | H | timesheet-auditor | opus | high | Không yếu hơn model của tác giả. xhigh chỉ qua profile mới nếu **[C-1]** xác nhận và **[C-4]** cho phép. |
| Audit độc lập: recheck fix S | S | H | timesheet-auditor | opus | high | Brief hẹp giữ chi phí nhỏ; việc này mở khóa WP2. |
| Audit chấp nhận WP5 | XL | H | timesheet-auditor, 2-3 audit vùng + 1 lượt tích hợp | opus | high | Chia theo vùng cho vừa context; mỗi cái mới tinh. |
| Commit/push | n/a | M (riêng tư) | **timesheet-committer (mới)** | sonnet | medium | Cơ học nhưng nhạy riêng tư; script xác định giảm phán đoán. |
| Gói pilot / ghi chú release | M | M | timesheet-worker | sonnet | medium | Tài liệu có chỗ trống cho chủ dự án; auditor review. |

### C4. Trigger leo thang / hạ cấp và giới hạn

Leo thang model (giữ bậc effort) khi: (1) một lần thử có tái hiện thất bại mà gốc lỗi chưa rõ; (2) finding FIX REQUIRED lặp lại sau một lần sửa; (3) task là H+N trước dispatch; (4) tác giả dùng opus thì auditor phải là opus; (5) audit tìm ra lỗi toàn vẹn mà bậc của tác giả bỏ sót. Leo thang effort chỉ qua profile (cần **[C-1]**, restart). Hạ cấp: (a) fix S có mẫu sẵn xuống sonnet/medium; (b) verifier giữ sonnet/medium; (c) sau khi lát Opus được chấp nhận, việc chỉnh/thêm test quay về sonnet; (d) nếu cảnh báo usage cho thấy hạn mức thấp **[C-4]**, planner/worker từ opus xuống sonnet nhưng auditor độc lập không bao giờ dưới model của tác giả; nếu Opus không khả dụng dùng auditor sonnet/high mới và ghi fallback (docs/08:26). Giới hạn: một lần thử lại ở bậc xuất phát, một lần ở bậc leo thang, rồi là blocker chuyển cho chủ dự án.

Model coordinator: giữ lựa chọn của chủ dự án; đặt `model: inherit` trong profile (alias đã được chấp nhận) để yêu cầu và thực tế không lệch, ghi thực tế theo từng phiên. Nếu **[C-4]** cho thấy Opus tốn nhiều, chủ dự án có thể chọn coordinator sonnet/medium và chỉ dùng Opus cho planner/worker/auditor; đó là lựa chọn chi phí chứ không phải đúng-đắn, vì coordinator không tạo source hay kết luận.

### C5. Ghi và validate override

Trường mới của task trên board: `profile_model`, `profile_effort` (sao từ frontmatter); `requested_model` (giá trị thực sự truyền cho Agent; bằng `profile_model` nếu không override); `requested_effort` (phải bằng `profile_effort`); `model_override_reason` (bắt buộc khi khác: `size_risk`, `novelty`, `escalation`, `fallback_unavailable`, `owner`); `routing` `{size, risk, novelty}`; `actual_model` (dòng đầu kết quả tự báo, hoặc kết quả công cụ nếu **[C-6]**); `actual_effort` (null nếu không quan sát); `actual_source` (`self_reported|tool_result|unobserved`). `actual != requested` đặt `model_mismatch: true` kèm ghi chú.

Validator phải chấp nhận: override có lý do; chỉ effort bằng của profile; `requested_model` thuộc `sonnet|opus|haiku` (thêm `fable` chỉ sau khi **[C-2]** định nghĩa); actual null khi `unobserved`. Phải từ chối: override không có lý do; effort khác profile; audit có hạng model (opus > sonnet > haiku; theo `requested_model`, hoặc tiền tố `actual_model` khi biết) thấp hơn model task tác giả cao nhất trong package, trừ khi ghi `fallback_unavailable`; audit PASS có `actual_model` ghi nhận thấp hơn tác giả. `coordinator_runtime` phải có `actual_model`.

## D. Thiết kế commit và push

Quyết định của chủ dự án (2026-10-02, trong `owner_decisions`): cho phép tự động commit và push trực tiếp lên `main` trong giai đoạn phát triển đến bản release đầu tiên; sau đó dùng nhánh phụ.

**D1. Ai commit.** Coordinator không có Bash nên phải ủy quyền cho một vai trò. Thêm một profile `timesheet-committer` (sonnet/medium; tool Read, Glob, Grep, Bash, Write, Edit, Skill; không Agent) và loại task `commit`. Bảy profile còn lại giữ "không commit/push" (đổi lời: chỉ committer commit). Bị loại: mỗi worker tự commit (rải cổng riêng tư ra bảy prompt, và có thể commit state của coordinator hoặc hỗn hợp chưa audit); cho coordinator shell (vi phạm AGENTS rule 13 / docs/08:7).

**D2. Khi nào.** (1) *Commit đóng băng* sau khi task implement/fix kết thúc và trước gate (cục bộ; đây là snapshot được audit). (2) *Commit chấp nhận* sau khi gate và audit PASS (board, STATE, HANDOFF/REVIEW, bằng chứng), rồi **push** (cũng push trước mọi lần dừng có kế hoạch). (3) Thay đổi quản trị theo cùng hai bước. Không commit mỗi lần sửa board (tốn token); state chưa commit của coordinator được Dropbox bảo vệ và vào commit mốc kế tiếp. Ước tính: khoảng hai dispatch commit cho mỗi fix có giới hạn và 5-8 mỗi package, tổng cộng vài chục.

**D3. Stage theo đường dẫn tường minh.** Brief commit liệt kê chính xác các path (`owned_paths` của task cộng state chung đã đụng). Committer yêu cầu `git status --porcelain=v1` đúng bằng tập mong đợi; mọi path thừa (đã theo dõi hoặc chưa) dừng task với blocker. Chỉ stage bằng `git add -- <path>...` (không `-A`, `.`, `-u`, `-p`, `commit -a`); commit bằng `-F <file message>`.

**D4. Kiểm tra riêng tư (xác định).** `scripts/precommit-check.mjs` mới (Node, không API deprecated) trên tập đã stage; thoát khác 0 thì chặn. Chặn: `.env*` (trừ `.env.example`), `data/`, `*.db|*.sqlite*|-wal|-shm`, `*.pdf` ngoài fixture tổng hợp, file ảnh hoặc path chứa `signature`, `*.pem|*.key`, `.xls*|.csv` ngoài workbook mẫu đã làm sạch và fixture tổng hợp, file quá lớn, dòng thêm có header khóa riêng, gán password/token/secret có giá trị, thông tin SMTP, domain email không tổng hợp (cho phép `example.*`, `.test`, `.invalid`); cảnh báo `C:\Users\<name>`. Committer còn đọc diff đã stage để tìm dữ liệu timesheet cá nhân, chạy `git diff --cached --check`, parse `.json` đã đổi, và chạy `python handoff/delivery/validate_orchestration.py` khi board nằm trong tập (thay cho các dispatch validator riêng, A3).

**D5. Thiết kế đã có.** Không còn là vấn đề: nó là commit `ffbf8f0` và đã ở `origin/main` (đã công bố nên cũng không amend được; khớp luật cấm amend). Hiện chưa commit: cập nhật board, checkpoint workflow và các file WF-REVIEW. Khuyến nghị: không gộp chúng vào bản sửa. Thứ tự: (i) sau restart client, *commit đóng băng* của bản sửa (luật, profile, validator, probe, template, board, checkpoint), chỉ cục bộ; (ii) WF-GATE và WF-AUDIT chạy trên SHA đó; (iii) commit chấp nhận và push sau PASS. WF-AUDIT review diff tích lũy `1a25275..HEAD` để một audit phủ cả thiết kế chưa từng audit lẫn bản sửa; fix sau FIX REQUIRED là commit mới trên `main`.

**D6. Định danh được audit.** Dùng `(reviewed_commit, source_digest)`. `source_digest` vẫn là phép so bằng (chuẩn hóa line-ending, loại `handoff/`, bằng công thức cây HEAD sau commit); `reviewed_commit` là commit đóng băng mà gate/audit xuất phát. Điều kiện: `git status --porcelain` không có gì ngoài `handoff/`; HEAD bằng commit đóng băng (hoặc digest cây bằng nhau); digest trước bằng sau. Commit bằng chứng và state sau audit chỉ đụng `handoff/` nên digest và PASS giữ nguyên; mọi thay đổi ngoài `handoff/` tạo digest mới và vô hiệu PASS (quy tắc `Stale PASS` hiện có, validate_orchestration.py:142). Audit có thể chạy trong clone tạm tại SHA để tránh tranh chấp Dropbox. Trường mới: `freeze_commit` (gate), `reviewed_commit` (audit), `commit_sha` và `pushed` (task commit), `git` của board `{branch, release_declared, unpushed}`.

**D7. Điều cấm và cưỡng chế.** Không bao giờ: `--amend`, `--force`/`-f`/`--force-with-lease`, `--no-verify`, `reset`, `rebase`, `clean`, `stash`, `tag`, tạo release, xóa nhánh, ghi lại lịch sử, `add -A`. Cưỡng chế bằng văn bản profile và bằng rule `permissions.deny` trong `.claude/settings.json` nếu **[C-5]** xác nhận cú pháp (sửa settings có thể cần restart **[C-3]**). Skill `git-guardrails-claude-code` trong `.agents/skills` chặn mọi push; không cài nguyên trạng.

**D8. Push thất bại.** Trước mỗi push: `git fetch` và `git push --dry-run origin main`. Xác thực/mạng: thử lại hai lần (5 s, 30 s), sau đó ghi `push_blocker`, thêm commit vào `git.unpushed`, tiếp tục cục bộ, thử lại ở lần chấp nhận/dừng kế tiếp; không bao giờ xin credential trong chat (việc của chủ dự án: đăng nhập một lần qua credential manager hiện có). Non-fast-forward: dừng, không merge/rebase/force, blocker cho chủ dự án. Bị từ chối bởi hook hoặc bảo vệ nhánh: blocker. Package có thể tiến tiếp trên commit chấp nhận cục bộ nhưng báo cáo cuối phải liệt kê commit chưa push.

**D9. Khóa Dropbox/Windows.** Task commit chạy độc quyền (không task nào khác đang chạy) vì `git status` làm mới index và tranh `.git/index.lock`. Khi gặp `Unable to create '.git/index.lock'` hoặc EBUSY: thử lại ba lần (5/15/30 s). Chỉ xóa lock nếu không có tiến trình git nào đang chạy và lock cũ hơn hai phút, và ghi lại; nếu không là blocker. Gặp file `*conflicted copy*` trong `.git` thì báo và dừng.

**D10. Quy ước message.** Giữ phong cách hiện có (tiêu đề mệnh lệnh, gạch đầu dòng `- type(scope): ...` như `ffbf8f0`) qua skill `commit-message`. Phần thân thêm `Task: <id>`, và với commit chấp nhận có `Gate: <task> PASS`, `Audit: <task> PASS`, `Digest: <sha256>`. Dòng attribution đúng như nhắc nhở attribution của harness tại thời điểm commit; không tự bịa. AGENTS rule 12 đổi để dẫn tới ủy quyền thường trực; câu "chuẩn bị message không cho phép gì" của skill giữ nguyên.

**D11. Sau release đầu tiên.** "Release đầu tiên" = quyết định của chủ dự án ghi `release_declared: true` trong `owner_decisions` (không suy từ WP5; pilot thật vẫn do chủ dự án kiểm soát). Sau đó: không commit trực tiếp lên `main`; làm trên `fix/<task-id>-<slug>` hoặc `feat/...`; gate/audit trên SHA của nhánh; chủ dự án (hoặc quy tắc ủy quyền sau này) merge qua PR bằng `gh`; agent không tạo tag hay release. Validator: nếu `release_declared` thì task committer yêu cầu `branch != main`.

## E. Danh sách thay đổi chính xác

Mỗi sửa file tiếng Anh cần sửa tương ứng `.vi.md`; profile, validator, script và JSON không có cặp. WF-IMPL là một writer duy nhất (đề xuất worker-high, sonnet/high).

**Tầng 1 (bắt buộc trước commit ủy quyền đầu tiên)**

1. `.claude/agents/timesheet-committer.md` (mới): sonnet/medium; tool `Read, Glob, Grep, Bash, Write, Edit, Skill`; prompt: chỉ commit/push các path tường minh trong brief, chạy script riêng tư, cấm amend/force/--no-verify/reset/rebase/clean/stash/tag, chạy tuần tự, báo SHA và exit code, kiểm tra trước push, không đụng STATE/NEXT_ACTION. **Cần restart [C-3].**
2. `.claude/agents/timesheet-{auditor,expert,light,planner,verifier,worker,worker-high}.md` dòng 12-14: "Do not edit shared state, spawn agents, commit/push" -> "...; only timesheet-committer commits or pushes". Dòng 9: bỏ "AGENTS.md". **Cần restart [C-3].**
3. `AGENTS.md` rule 12 (+vi): thay "Leave changes uncommitted by default; NEVER create/amend/push ... unless the user explicitly requests" bằng ủy quyền thường trực của chủ dự án (vai trò committer, `main` đến release đầu tiên, nhánh phụ sau đó, không amend/force/no-verify/tag, cổng riêng tư); giữ `Commit description` trong mỗi phản hồi.
4. `docs/08_AI_WORKFLOW_AND_BUDGET.md` (+vi): dòng 7; bảng profile (thêm committer, verifier medium, định nghĩa lại expert); dòng 24 (thay câu bảng cố định bằng rubric C2-C4, giới hạn, ghi override); dòng 26 fallback; dòng 32 câu worktree -> định danh theo (commit, digest); dòng 40 bản sao board trước đó qua git và hồ sơ task chỉ tiếng Anh; mục mới "Commits and pushes" (D1-D11).
5. `docs/10_DECISIONS_AND_SOURCES.md` (+vi): ghi quyết định ngày 2026-10-02 của chủ dự án (ủy quyền commit/push) và quyết định định tuyến lai.
6. `handoff/prompts/ORCHESTRATE.md` (+vi): dòng 6 ("No commit/amend/push"); bước 3 (plan tùy chọn với finding đã chấp nhận); bước 4 (commit đóng băng trước gate); bước 6 (commit chấp nhận + push); dòng 38 (validator trong task commit và sau khi đổi luật).
7. `handoff/prompts/RESUME.md` (+vi): dòng 20 và bước 2 (reconcile commit chưa push và index.lock).
8. `handoff/NEXT_ACTION.md` (+vi): dòng 22 ("leave changes uncommitted") và "Current route" dòng 27-31 (không planner F-01; commit đóng băng; định tuyến); nêu restart và baseline.
9. `scripts/precommit-check.mjs` (mới): các kiểm tra D4; `npm run lint` phải đạt (memory dự án ghi bẫy lint `.mjs`).
10. `handoff/delivery/validate_orchestration.py`: `KINDS += commit` (:14); chín profile (:63); kind `commit` -> `timesheet-committer`, độc quyền với mọi task đang chạy khác (:169-175), `commit_sha` 40 hex và `pushed` boolean khi done; thay :101-103 bằng quy tắc override C5; kiểm tra hạng model của audit gần :135-138; `reviewed_commit`/`freeze_commit` cho gate/audit done (:129); `release_declared` -> committer `branch != main`; `actual_model` của coordinator; yêu cầu chỉ tiếng Anh cho kind không phải documentation ở :115-116 (nếu chủ dự án đồng ý A4).
11. `handoff/delivery/evidence/orchestration/check-recovery.py`: probe cho override có lý do được chấp nhận, không lý do bị từ chối, override effort bị từ chối, auditor yếu hơn bị từ chối, độc quyền commit, commit SHA sai bị từ chối; cập nhật số lượng (hiện 22). `run-validation.ps1` dòng 3: fallback `python` trên PATH.
12. Template `handoff/templates/TASK.md` (+vi): routing (cỡ/rủi ro/mới), profile so với yêu cầu so với model/effort tự báo, commit đóng băng/được review, ghi chú chỉ tiếng Anh. `CHECKPOINT.md`, `HANDOFF.md`, `REVIEW.md` (+vi): thay các dòng "baseline/commit" bằng commit SHA, digest nguồn, commit chưa push (CHECKPOINT:4,23; HANDOFF:7,27; REVIEW:4,21).
13. `handoff/delivery/ORCHESTRATION.json` (coordinator): `baseline_commit` -> `ffbf8f0`; đối tượng `git` mới; task mới WF-IMPL -> WF-COMMIT (đóng băng) -> WF-GATE -> WF-AUDIT -> WF-COMMIT2 (chấp nhận + push); WP1-F01-PLAN `cancelled`, `depends_on` của WP1-F01-FIX trỏ lại commit chấp nhận; trường routing/override cho mọi task. Sửa chữ baseline lỗi thời ở ORCHESTRATION_HANDOFF.md:4 (+vi) và WORKFLOW_REVISION_CHECKPOINT.md (+vi). `handoff/delivery/STATE.json`: `workflow_revision` -> `2026-10-02-orchestration-v2`, `model_policy` -> `task_size_risk_rubric`, thêm `git_policy`.

**Tầng 2 (hiệu quả; gộp vào WF-IMPL nếu nhỏ)**

14. Gate runner dùng chung `scripts/run-gates.ps1` (hoặc Node) với bộ định vị Node 24 và digest; ngừng trỏ vào path hard-code lịch sử.
15. Bỏ `ORCHESTRATION.previous.json` để dùng `git show HEAD:...` (validator, check-recovery.py:41, docs/08:40, ORCHESTRATE/RESUME) sau khi task committer đầu tiên đã chạy một lần.
16. `gate_included` cho audit fix S (validator :161).
17. `timesheet-verifier.md` effort high -> medium; `timesheet-coordinator.md` `model: inherit`.
18. `.claude/settings.json` `permissions.deny` cho lệnh con git nguy hiểm và `permissions.allow` cho lệnh git của committer, sau **[C-5]**.

**Tầng 3 (tùy chọn/có điều kiện):** profile auditor xhigh sau **[C-1]/[C-4]**; `fable` sau **[C-2]**; đếm `auxiliary_lookups` vào giới hạn đang chạy (A14).

**Cờ restart:** mục 1, 2, 17, 18 (file profile, profile coordinator, settings) cần phiên client mới nếu **[C-3]** cho biết agent chỉ nạp lúc khởi động. Trình tự: WF-IMPL -> chủ dự án chạy `claude --continue` (board và checkpoint khôi phục trạng thái) -> commit đóng băng -> WF-GATE -> WF-AUDIT -> commit chấp nhận + push -> tiếp tục WP1 F-01.

## F. Rủi ro, điều chưa biết và việc cần xác minh

Rủi ro/chưa biết:

1. **[C-3]** Nếu profile committer không được nạp, commit đầu tiên không ủy quyền được; dự phòng: chủ dự án tự làm một commit khởi động.
2. **[C-5]** Permission prompt của Bash trong subagent có thể làm kẹt chạy không giám sát; chưa xác minh lệnh git ghi có tự động được phép không. WF-GATE phải gồm chạy thử (`git push --dry-run`, một `git commit` trong clone tạm).
3. **[C-4]/[C-1]** Trọng số usage và mức effort có thể đổi bảng C3 (dòng opus, xhigh); kiểm lại với kết quả tra cứu trước WF-IMPL.
4. Hồ sơ task chỉ tiếng Anh (A4) mâu thuẫn AGENTS rule 1 như đang viết; cần chủ dự án xác nhận hoặc dùng phương án dự phòng.
5. Đóng băng trước audit đặt commit chưa audit lên `main` cục bộ (trước release, có ủy quyền); chấp nhận được vì push chờ PASS; chạm giới hạn cứng trước PASS để lại commit chưa push.
6. Model tự báo không phải bằng chứng; kiểm soát tài khoản/quản trị có thể ghi đè.
7. Script riêng tư chỉ là heuristic, không nhận ra dữ liệu cá nhân trong văn xuôi; việc committer đọc diff và audit vẫn cần.
8. Bản thân WF-REVIEW chưa được audit và dựa trên kiểm tra chỉ-đọc; các quy tắc validator đề xuất chưa được chạy.
9. Không quan sát được giá trị quota/reset; không nêu ước tính chi phí token.

WF-GATE (verifier) phải xác minh bằng output thực: validator và probe phục hồi đạt trên board đã sửa và thất bại với từng ca âm mới; `validate_package.py --preflight` (cặp file, link, 91 kịch bản); `git diff --check`; `npm run lint`; `precommit-check.mjs` chặn đầu vào xấu tổng hợp (`.env` giả, `signature.png`, PDF giả, dòng khóa giả) và cho qua path sạch trong clone tạm; chạy thử committer (`git push --dry-run`, thăm dò cây sạch và index.lock); `claude --version` và danh sách profile cho thấy chín profile và committer nạp được; không đổi gì dưới `src/`, `tests/` hay dependency.

WF-AUDIT (opus/high mới; không phải WF-IMPL, không phải WF-REVIEW) phải xác minh: diff tích lũy `1a25275..HEAD`; các điều cấm amend/force/--no-verify/tag xuất hiện nhất quán ở profile, AGENTS, doc 08 và rule settings; không profile nào ngoài committer commit được; ghi override không thể che auditor yếu hơn (probe âm); coordinator vẫn không có shell và chỉ ghi state chung như đã tài liệu hóa; cặp EN/VI tương đương cho mỗi file hướng người dùng đã sửa; không secret hay dữ liệu cá nhân trong diff; trường baseline và định danh nhất quán; không có tuyên bố chấp nhận ứng dụng nào bị đổi (STATE giữ WP1 FIX REQUIRED); chuỗi WP1-F01 vẫn yêu cầu fix -> gate -> audit mới trên digest mới.

Một hành động tiếp theo cho coordinator: đối chiếu báo cáo này với kết quả WF-CAPS (C-1 đến C-6), hỏi chủ dự án một câu duy nhất ở A4, rồi lưu brief WF-IMPL (worker-high, sonnet/high) gồm các mục 1-13.
