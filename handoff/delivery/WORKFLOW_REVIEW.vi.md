# Review độc lập quy trình: thiết kế lại điều phối và bản sửa v2

Bản dịch của [WORKFLOW_REVIEW.md](WORKFLOW_REVIEW.md); tiếng Anh là nguồn chuẩn. Lập theo [REVIEW](../templates/REVIEW.vi.md). Hồ sơ task (tiếng Anh): [WF-AUDIT](tasks/WF-AUDIT.md).

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** Phạm vi quy trình, ghi trên bảng task dưới giai đoạn WP1. Review ngày 2026-10-03 UTC (2026-10-02 America/Los_Angeles). Subagent `timesheet-auditor` context mới. Model tự báo `claude-opus-5-5`. Không quan sát được effort. Bộ công cụ khớp profile auditor.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** freeze commit `fd77a8717da9a1b2ea9ce13520d59b9df60f4716` = `origin/main`; không có commit chưa push. Source digest `03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b` (532 file, không tính `handoff/`). Digest giống nhau ở bản checkout trong Dropbox và ở bản clone tạm tại SHA đó. Phạm vi review là toàn bộ `1a25275..fd77a87`: bản thiết kế lại `ffbf8f0` (chưa từng được audit) cộng bản sửa v2 `fd77a87`. Source đủ.
- **Quyết định: FIX REQUIRED.** Mọi kiểm tra bắt buộc đều đạt. Tuy vậy, ba lỗi mức Medium cần sửa quy tắc chuẩn hoặc công cụ trước khi nghiệm thu quy trình: mâu thuẫn trong quy tắc về độ mạnh của auditor, audit quy trình sẽ thành cũ ở lần đổi WP1 tiếp theo, và lỗ hổng của kiểm tra riêng tư trong một repo công khai. Ngoài ra có bảy lỗi mức Low.

## Phạm vi thật đã xem/chạy

Đã đọc toàn bộ: diff tích lũy của AGENTS/CLAUDE/README, tài liệu 06/08/09/10, NEXT_ACTION, STATE, bảng task, cả chín profile, `settings.json`, `validate_orchestration.py`, `check_recovery.py`, `validate_package.py`, `scripts/precommit-check.mjs`, `package.json`, các prompt ORCHESTRATE/RESUME/FIX_FINDINGS, các mẫu, và một số prompt WP1/WP5 lấy mẫu. Cũng đã đọc: `owner_decisions`, `coordinator_decisions` và `auxiliary_lookups` WF-CAPS trên bảng; [WF-REVIEW](tasks/WF-REVIEW.vi.md) chỉ làm bối cảnh; và các report WF-IMPL-TOOLING/WF-IMPL-DOCS/WF-FREEZE/WF-GATE, coi là tuyên bố cần kiểm. Source ứng dụng ngoài phạm vi và không đổi (`git diff 1a25275 fd77a87 -- src tests package-lock.json skills-lock.json` rỗng).

## Bảng bằng chứng

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`, `origin/main`; `npm run digest` (Node 24.21.0) trước audit | cả hai là fd77a87; 03d4a6f9…491b; ngoài `handoff/` không có gì thay đổi | [0-identity-before](evidence/WF-AUDIT/0-identity-before.txt) |
| `python handoff/delivery/validate_orchestration.py` | 0, PASS (9 profile, 10 task) | [1-validator-recovery](evidence/WF-AUDIT/1-validator-recovery.txt) |
| `python handoff/delivery/check_recovery.py` | 0, 48 kiểm tra giả lập | như trên |
| Probe riêng `2-probes.py` (bảng giả lập trong bộ nhớ) | 0; cả 19 probe cho kết quả đúng như mô tả: từ chối override không lý do của task running, opusplan/best/fable/default, commit cạnh audit đang chạy, audit yếu hơn, lệch snapshot gate/audit và commit main sau release. Các lỗ hổng được ghi lại ở probe 6, 8, 10, 11 | [2-probes](evidence/WF-AUDIT/2-probes.py), [kết quả](evidence/WF-AUDIT/2-probes-output.txt) |
| Kiểm xác nhận của chủ (metadata transcript) | Văn bản nguyên văn trên bảng là tin nhắn trực tiếp của chủ, khớp chính xác | [3-owner-confirmation](evidence/WF-AUDIT/3-owner-confirmation.txt) |
| Probe sửa profile trên bản clone tạm | Từ chối đúng: coordinator có Bash, worker có Agent, thiếu committer, committer không có Bash, fable/opusplan/ultracode. Chấp nhận sai (exit 0): expert `effort: max` | [4-profile-probes](evidence/WF-AUDIT/4-profile-probes.txt) |
| `node scripts/precommit-check.mjs --self-test`; 18 probe trên tập đã stage | Self-test 0 (27 mẫu path, 24 mẫu dòng). Chặn email, secret có ngoặc hoặc dạng env, private key, credential trong URL, chữ ký ngoài evidence, spreadsheet, sqlite, `.env`, `data/`. Bỏ sót secret YAML, media trong evidence và path `/c/Users` | [5-precommit](evidence/WF-AUDIT/5-precommit.txt) |
| `npm ci`; `npm run lint` (Node 24.21.0, `--trace-deprecation --pending-deprecation`) | 0; 0; không có cảnh báo | [6-lint](evidence/WF-AUDIT/6-lint.txt) |
| `validate_package.py --preflight`; `git diff --check 1a25275 fd77a87`; liệt kê phạm vi | 0 (42 cặp, 496 link, 91 tình huống); 0; thay đổi ngoài handoff chỉ gồm file quy trình | [7-preflight-scope](evidence/WF-AUDIT/7-preflight-scope.txt) |
| precommit trên toàn bộ 1a25275..fd77a87 | 0 lỗi chặn, 16 cảnh báo profile-path; không có email hay secret | [8-range-privacy](evidence/WF-AUDIT/8-range-privacy.txt) |
| Quan sát runtime | Profile được áp dụng; AGENTS.md cũ nằm trong context của subagent | [9-observations](evidence/WF-AUDIT/9-observations.txt) |

## Lỗi

| ID | Mức | File:dòng | Tái hiện / quan sát | Thay đổi bắt buộc |
|---|---|---|---|---|
| WF-A-01 | Medium | docs/08_AI_WORKFLOW_AND_BUDGET.md:26,30,34; .claude/agents/timesheet-auditor.md:25; handoff/delivery/validate_orchestration.py:139 | Tài liệu 08 nói auditor "không bao giờ thấp hơn model tác giả", và profile auditor nói auditor "không được yếu hơn". Nhưng tài liệu 08 cũng cho phép auditor Sonnet khi không có Opus, và validator bỏ qua kiểm độ mạnh khi lý do là `fallback_unavailable` (check_recovery chấp nhận audit Sonnet cho tác giả Opus). Dòng 34 yêu cầu auditor "Sonnet/high", trong khi profile auditor cố định `xhigh` và effort chỉ đổi qua profile (dòng 32). | Ghi một quy tắc chuẩn duy nhất trong tài liệu 08 (+vi) và profile auditor. Ví dụ: chỉ dùng fallback khi không tác giả nào của snapshot dùng model mạnh hơn; nếu có, lưu checkpoint rồi chờ, hoặc báo blocker cho chủ. Thu hẹp chỗ validator bỏ qua cho khớp, xử lý "Sonnet/high" và thêm probe. |
| WF-A-02 | Medium | validate_orchestration.py:15,246-247,257-258; `WP1-F01-FIX.depends_on` trên bảng; WORKFLOW_REVISION_CHECKPOINT.md:42; docs/08:44-54 | Task quy trình buộc phải dùng giai đoạn WP1. Khi bản sửa F-01 đổi `current_source_digest`, PASS của WF-AUDIT sẽ lỗi "Stale PASS" (probe 8). Kế hoạch lưu trữ các task WF-* không được ghi ở đâu. Nếu chỉ xóa WF-AUDIT thì `WP1-F01-FIX` sẽ lỗi "Unknown/self dependency". | Ghi rõ cách xử lý task quản trị trong tài liệu 08 (+vi): một phạm vi riêng, hoặc một nơi lưu trữ mà validator vẫn dùng được để giải dependency. Nêu các path mà khi đổi thì cần audit quy trình mới (AGENTS/CLAUDE, tài liệu 08, prompt, mẫu, profile, settings, validator, precommit). |
| WF-A-03 | Medium | scripts/precommit-check.mjs:17-18, 10+43, 22 | Các probe sau đạt với 0 phát hiện: `SMTP_PASSWORD: Zq81probeKx` và `api_token: Zq81probeKx` (YAML không ngoặc), `handoff/delivery/evidence/WP3/employee-signature.png` và một PDF cùng thư mục, và `/c/Users/<name>/…`. Log 3b đã commit có path dạng này. Sắp tới là PDF/chữ ký của WP3 và file compose của WP4. | Phát hiện secret dạng `name: value` không ngoặc. Ít nhất phải cảnh báo (hoặc đòi allowlist giả lập tường minh) cho file PDF/ảnh/chữ ký trong evidence. Mở rộng quy tắc profile-path cho path ổ đĩa dạng POSIX và bỏ qua `<placeholder>`. Thêm ca self-test cho từng điểm. |
| WF-A-04 | Low | validate_orchestration.py:19; docs/08:30 | `EFFORTS` có `max`, nên profile `effort: max` vẫn qua validator (exit 0). Tài liệu 08 yêu cầu quyết định của chủ cho effort max. | Bỏ `max` khỏi tập cho phép, hoặc yêu cầu bản ghi quyết định của chủ cho nó; thêm probe. |
| WF-A-05 | Low | validate_orchestration.py:136-138,240-243 | Validator chỉ tự nhận ra tác giả ở task `implement`/`fix`. Tác giả tài liệu tự audit thay đổi của mình vẫn đạt nếu `author_agent_ids` bỏ sót người đó (probe 6). Tài liệu lại là sản phẩm chính của một thay đổi quy trình. | Coi mọi task không phải gate/audit/commit có `agent_id` trong phạm vi được review là tác giả, hoặc bắt buộc `author_agent_ids` không rỗng; thêm probe. |
| WF-A-06 | Low | handoff/prompts/RESUME.md:6,9 (+vi :6,8); .claude/agents/timesheet-coordinator.md:4,13 | RESUME bảo coordinator "Kiểm việc chưa commit/chưa push thật" và "Kiểm process còn chạy", nhưng coordinator không có shell. Bước 2 lại chỉ giao việc kiểm tra này khi có điều kiện. | Đọc trạng thái đó từ bảng và checkpoint, và giao việc kiểm tra khi cần; sửa cả bản vi. |
| WF-A-07 | Low | Dòng 9 của cả tám profile có shell; docs/08:32 | Context của auditor này chứa AGENTS.md bản ffbf8f0: rule 12 vẫn cấm commit và rule 1 thiếu câu về hồ sơ task chỉ tiếng Anh. Profile ghi "Đọc AGENTS.md trừ khi đã có trong context", nên agent đang giữ bản cũ sẽ không đọc lại. | Bắt buộc restart client sau khi đổi AGENTS/CLAUDE, hoặc cho brief/profile đọc AGENTS.md từ đĩa. Ghi điều này vào tài liệu 08 (+vi). |
| WF-A-08 | Low | .claude/agents/timesheet-committer.md:22; docs/08:70; tasks/WF-FREEZE.md (Results) | WF-FREEZE chạy precommit bằng Node v26.10.0 dù brief yêu cầu Node 24. Không có gì cố định runtime của committer. | Nêu runtime Node 24 trong profile hoặc brief của committer, và ghi `node --version` vào bằng chứng commit. |
| WF-A-09 | Low | evidence/orchestration/{documentation,recovery,workflow}.txt:1, run-validation.ps1:3 (ffbf8f0); evidence/WF-IMPL-TOOLING/3a…:3-44, 3b…:1, 5a-lint.txt:1 (fd77a87) | Tên tài khoản Windows xuất hiện trong repo công khai. Trong 12 cảnh báo lúc freeze, 8 là path thật và 4 là báo nhầm do placeholder `<user>` trong WF-REVIEW. File 3b không bị phát hiện. | Che path profile trong bằng chứng mới. Committer dừng, hoặc che path trước, khi bằng chứng mới gây cảnh báo profile-path. Có thể che bớt trong một commit thường (không viết lại lịch sử). |
| WF-A-10 | Low | docs/08:60 so với handoff/NEXT_ACTION.md:33-34; `owned_paths` của WP1-F01-FIX/GATE/AUDIT trên bảng; docs/08:48,69 | Lần recheck F-01 tự nó quyết định nghiệm thu WP1, nhưng kế hoạch cho nó "có gộp gate", trong khi tài liệu 08 giữ gate riêng cho "snapshot cuối giai đoạn". Các task F-01 vẫn sở hữu hồ sơ task `.vi.md`. Không có task freeze commit giữa bước sửa và gate. | Định nghĩa "snapshot cuối giai đoạn". Lập lại chuỗi F-01 (sửa → freeze commit → gate/audit) với hồ sơ chỉ tiếng Anh trước khi giao việc. Đây là việc coordinator lập lại kế hoạch, đã ghi trên bảng. |

## Rủi ro và đề xuất tùy chọn (không bắt buộc sửa)

- CLAUDE.vi.md vẫn giữ tiêu đề "Điểm vào dự án cho Claude" (bản EN: "Claude guidance"). Trong docs/10.vi, dòng ghi chú bản dịch nay nằm trước các mục mới.
- File lịch sử `evidence/orchestration/check-recovery.py` vẫn đọc `ORCHESTRATION.previous.json` đã bỏ. File được giữ nguyên theo quyết định.
- Tác giả không phải Claude được xếp hạng theo alias Claude đã yêu cầu (probe 9). Trường model của task đã xong không được kiểm lại (probe 11).
- Profile committer chưa có các bước tạo nhánh và PR sau release đầu tiên; cần thêm trước khi `release_declared`. Giới hạn Write/Edit của coordinator và committer chỉ được bảo đảm bằng văn bản.

## Đã xác nhận, không có lỗi

- Quyền commit nhất quán giữa AGENTS rule 12, mục "Commit và push" của tài liệu 08, ORCHESTRATE:6, RESUME:17-20,25, profile committer (tập cấm rộng hơn) và các profile worker. Chính sách nhánh sau release được thực thi với task commit đã xong. `.claude/settings.json` chỉ có `agent`; không có file quyền nào được theo dõi. Xác nhận nguyên văn và yêu cầu ban đầu của chủ đã được kiểm trong transcript phiên, không lấy từ tin nhắn agent.
- Định tuyến: bảng tài liệu 08 = frontmatter cả chín profile = quyết định trên bảng task. Effort chỉ đổi qua profile. Override cần alias được phép và lý do. Audit yếu hơn bị từ chối, theo cả model yêu cầu lẫn model thật. Task commit chạy riêng.
- Coordinator không có Bash và delegate lồng bị từ chối, cả hai do validator thực thi.
- Bản sửa v2 chỉ chạm path thuộc task của nó hoặc của coordinator. Không tìm thấy secret hay email trong phạm vi. Nghiệp vụ không đổi. STATE giữ WP1 `fix_required` với F-01. Chuỗi WP1-F01 vẫn cần sửa → freeze → audit mới trên digest mới (NEXT_ACTION).
- AGENTS, tài liệu 08, ORCHESTRATE và NEXT_ACTION tương đương hoàn toàn giữa tiếng Anh và tiếng Việt. Các cặp lấy mẫu (README, CLAUDE, tài liệu 06/09/10, RESUME, FIX_FINDINGS, mẫu, prompt WP1/WP5) tương đương, trừ các ghi chú ở trên.
- Mục đã biết: (1) 12 cảnh báo → WF-A-09; (2) lần bị bộ phân loại từ chối đã được xử lý đúng: worker dừng, không lách; sau đó chủ xác nhận trực tiếp; fallback không cần dùng; không đổi cài đặt quyền; (3) kế hoạch lưu trữ → WF-A-02.

## Gate chưa chạy/bị chặn và lý do

Không có kiểm tra bắt buộc nào bị bỏ. Không chạy lại `npm run verify` vì source ứng dụng không đổi và WF-GATE đã chạy. Không tải lại các URL tài liệu của WF-CAPS (profile này không có công cụ web). Các dữ kiện đã ghi được kiểm tính nhất quán với tài liệu 08 và validator.

## Xử lý phát hiện trước

Chỉ để làm bối cảnh, không phải recheck WF-REVIEW:

- A1–A6, A8–A10 và A12–A14 đã được bản sửa xử lý. A9 được xử lý qua định danh audit reviewed_commit + source_digest.
- A7 (công cụ phụ thuộc máy) còn mở một phần ở WF-A-08, và A15 còn mở ở WF-A-09.
- Lối tắt của A11 ("trừ khi đã có trong context") dẫn tới WF-A-07.
- F-01 của WP1_REVIEW không đổi và vẫn mở.

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

Không đổi. WP1 vẫn FIX REQUIRED và WP2 chưa bắt đầu. Chưa xin phép pilot của chủ, chưa gửi hay triển khai gì.

## Một bước tiếp

Coordinator đăng ký một task sửa quy trình có giới hạn (worker; tài liệu + validator + precommit, kèm cặp vi) cho WF-A-01…WF-A-09, và lập lại kế hoạch chuỗi F-01 (WF-A-10). Sau đó: freeze commit, gate của verifier, rồi một audit mới kiểm lại các lỗi này trên digest mới. Lỗi Medium bắt buộc phải sửa. Mỗi lỗi Low phải được sửa, hoặc hoãn tường minh kèm quyết định có ghi lại.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WF-AUDIT attempt 1, agent ID trên bảng `a80f8351bbd2fd196`. Tác giả: `a232a5b7f6cdec442` (WF-REVIEW), `ae6c446dc434f85d6` (WF-IMPL-TOOLING), `afbd2f9ae6ec1fce3` và `ad742f3b42890d674` (WF-IMPL-DOCS), đều là Sonnet 5.5. Coordinator (phiên chính, Opus 5.5) viết NEXT_ACTION, STATE và bảng task. Tác giả của ffbf8f0 là một phiên Codex (bằng chứng của nó dùng path runtime Codex); không quan sát được model.
- Context mới; xác nhận reviewer không viết thay đổi: đã xác nhận. Auditor này chỉ ghi cặp report này, hồ sơ task WF-AUDIT và `evidence/WF-AUDIT/`.
- Digest trước/sau; bằng chứng gate snapshot đó: trước 03d4a6f9…491b. Sau: xem mục Results của [hồ sơ task](tasks/WF-AUDIT.md). WF-GATE PASS trên cùng digest.
- Path report mới giữ lịch sử review trước: file mới; không sửa report cũ nào.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: xem "Một bước tiếp".
