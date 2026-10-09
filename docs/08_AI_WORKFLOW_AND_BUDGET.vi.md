# Điều phối AI và usage subscription

## Quyền tự quyết và vai trò

Yêu cầu ngày 2026-10-02 thay phân chia cứng Claude implement / ChatGPT review và cấm chọn model/effort subagent, chạy song song trước đây. Vai trò thuộc task, không thuộc nhà cung cấp. Mặc định: một nhiệm vụ Claude Code từ lỗi WP1 hiện tại tới sẵn sàng phần mềm WP5. ChatGPT/Codex có thể nhận bất kỳ vai trò nào nếu chủ chọn; chuyển thủ công là tùy chọn.

Main agent chỉ điều phối: giao kiểm repo, plan, chẩn đoán, implement, sửa, kiểm chứng và audit độc lập context mới. Nó quản lý dependency, giao việc, bằng chứng, trạng thái, recovery. Được ghi hồ sơ/bàn giao tổng hợp, không viết source ứng dụng hoặc tự verdict nghiệm thu. Đã cho phép tự quyết việc thường và tiến sau gate đạt. Chủ giữ ngoại lệ nghiệp vụ, triển khai/gửi thật và secret. Chuẩn bị pilot trước khi xin phép kích hoạt. Commit và push chỉ theo quyền thường trực ở mục "Commit và push".

## Cấu hình và chọn theo độ khó

`.claude/settings.json` chọn `timesheet-coordinator`. Định nghĩa trong `.claude/agents/` cấu hình alias model/effort; riêng văn bản không cấu hình client. Không đổi settings toàn cục, tốc độ, đăng nhập hay billing.

Profile cố định vai trò và effort; coordinator chọn model cho từng lần giao việc theo thang đánh giá task, không theo số giai đoạn. Size: S/M/L/XL. Rủi ro H: đầu vào OT/credit, ledger/số dư, ownership/phân quyền, transaction/concurrency, riêng tư (PDF/chữ ký/export/dữ liệu cá nhân), lịch sử bất biến, recovery/restore, gửi ra ngoài. Novelty: không có mẫu sẵn trong repo.

| Task | Profile (effort) | Model |
|---|---|---|
| Kiểm kê, đồng bộ link/bản dịch, metadata | light (low) | sonnet; haiku chỉ cho liệt kê/probe thuần |
| Plan/chẩn đoán lỗi có giới hạn; đối chiếu gián đoạn | planner (high) | sonnet |
| Chia giai đoạn WP2–WP4 | planner (high) | opus |
| Finding đã chấp nhận nêu file/cách sửa/test | không | bỏ plan; worker tái hiện trước |
| Slice thường hoặc tài liệu có hợp đồng rõ | worker (medium) | sonnet |
| Sửa/slice rủi ro cao đã có mẫu | worker-high (high) | sonnet |
| Slice L rủi ro cao mới (ledger, finalization/outbox nguyên tử, restore khi đang ghi, gửi không chắc chắn) | worker-high (high) | opus |
| Leo thang: chưa rõ nguyên nhân gốc sau một lần thử có bằng chứng, FIX REQUIRED lặp lại | expert (xhigh) | opus |
| Gate, digest, bằng chứng | verifier (medium) | sonnet |
| Audit độc lập (recheck sửa, giai đoạn, workflow); WP5 gồm 2–3 audit theo vùng cộng một lượt tích hợp | auditor (xhigh) | opus, không bao giờ thấp hơn model tác giả mạnh nhất |
| Commit/push | committer (medium) | sonnet |
| Coordinator | coordinator (medium) | inherit (model phiên của chủ) |

Giới hạn: một lần thử lại ở bậc ban đầu, một lần ở bậc leo thang, rồi blocker cho chủ. Hạ bậc phần hoàn thiện sau slice Opus đã đạt; khi thấy cảnh báo usage thấp, hạ override planner/worker về sonnet, không bao giờ hạ auditor dưới model tác giả mạnh nhất. Không được khi chưa có quyết định của chủ: fable, best, opusplan (có thể tính usage-credit), effort max/ultracode, đổi tốc độ. Auditor phải là instance/context khác chưa viết thay đổi đang kiểm.

Độ mạnh của audit (một quy tắc, không ngoại lệ): model auditor không bao giờ yếu hơn model tác giả mạnh nhất của snapshot được kiểm, và `validate_orchestration.py` bắt buộc điều này. Tác giả là `agent_id` và `previous_agent_ids` của mọi task cùng giai đoạn có loại không phải gate, audit hay commit, cộng `author_agent_ids` của audit; cùng tập này dùng để tách auditor. Nếu model cần thiết không có, checkpoint và chờ hoặc nêu blocker cho chủ. Auditor Sonnet (`timesheet-auditor` với model override sonnet, lý do `fallback_unavailable`; effort giữ xhigh của profile) chỉ hợp lệ khi không tác giả nào dùng Opus.

Ghi theo task: profile, model yêu cầu, `model_override_reason` (size_risk|novelty|escalation|fallback_unavailable|owner), `routing` {size, risk, novelty}, và `actual_model` tự báo cùng `actual_source`. Effort chỉ đổi qua profile; sửa profile có thể cần restart client (kiểm bằng dispatch; profile không nhận ra là blocker restart). Restart client cũng làm mới ngữ cảnh AGENTS/CLAUDE được nạp vào agent; phiên chạy lâu có thể giữ bản cũ, nên mọi profile không phải coordinator đọc AGENTS.md từ đĩa khi bắt đầu task.

Giao kiểm client/version/profile chỉ đọc khi bắt đầu. Ghi settings yêu cầu riêng với settings thật quan sát được; dùng null khi không thấy. Kiểm client nhận `agent`, `model`, `effort`, `Agent` và profile. Restart nếu thư mục agents mới chưa nạp. Account/managed có thể ghi đè. Nếu subscription không có Opus, áp dụng quy tắc độ mạnh audit ở trên (chờ hoặc blocker; không dùng auditor yếu hơn khi có tác giả dùng Opus). Nếu effort không hỗ trợ, dùng mức hỗ trợ và ghi fallback. Coordinator được sửa cấu hình profile riêng dự án cho fallback hỗ trợ trước khi giao việc, ghi lý do. Không chuyển API billing. Nếu không delegate được, lưu blocker cấu hình thay vì main tự implement.

## Giao việc và ownership

Theo [ORCHESTRATE](../handoff/prompts/ORCHESTRATE.vi.md). Brief gồm task ID, giai đoạn/prompt, danh sách nguồn chuẩn, dependency, baseline/digest, path được ghi chính xác, output/evidence, rule/AC và bước tiếp. Worker chỉ chạy task đó, không chạy nhiệm vụ coordinator. Chỉ coordinator ghi ORCHESTRATION.json, STATE.json, NEXT_ACTION.

Tối đa hai subagent hoạt động; chỉ một ghi source/configuration. Chạy song song phân tích chỉ đọc độc lập hoặc report/evidence riêng. Chạy tuần tự install, migration, build, gate dùng chung output/database. Dừng writer trước gate/audit. Không delegate lồng; worker trả escalation cho coordinator. Mặc định: checkout này với ownership rõ. Worktree phải giữ đúng snapshot review gồm file chưa commit cần thiết; không dùng checkout nhánh mặc định làm mất chúng. Không reset/clean việc không liên quan.

## State bền vững và recovery

[ORCHESTRATION.json](../handoff/delivery/ORCHESTRATION.json) là bảng task trên đĩa. [STATE.json](../handoff/delivery/STATE.json) vẫn là tóm tắt nghiệm thu giai đoạn. Task list/chat native chỉ là hỗ trợ tiện lợi.

Lưu task ID/dependency, loại/trạng thái, profile, settings yêu cầu/thật, agent/session ID nếu thấy, attempt, path sở hữu, prompt/report/evidence, baseline/digest, quyết định, bước tiếp. Trạng thái: pending, running, interrupted, blocked, done, cancelled. Implement done không là nghiệm thu độc lập. Audit PASS cần bằng chứng độc lập source hiện tại.

Trước giao việc, lưu brief và trạng thái running. Brief/kết quả task trong `handoff/delivery/tasks/` chỉ bằng tiếng Anh; tiếng Việt dành cho tài liệu cho người đọc, prompt, template, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW và chat. ORCHESTRATION.previous.json đã bỏ: bảng đã commit cuối là bản phục hồi; sửa bảng bằng diff nhỏ và chạy `python handoff/delivery/validate_orchestration.py` trong task commit và sau khi đổi rule/profile. Một coordinator ghi state chung. Worker thêm kết quả bền vững sau mỗi bước sửa/kiểm và trước khi trả, dùng [TASK](../handoff/templates/TASK.vi.md). Đối chiếu output/evidence thật trước cập nhật state. Quyết định gate là PASS / FAIL / NOT VERIFIED; tóm tắt giai đoạn đạt dùng independent_review: passed. Sau nghiệm thu, cập nhật STATE, NEXT_ACTION, HANDOFF song ngữ cùng nhau. Review mới dùng path mới; giữ bằng chứng lịch sử.

Checkpoint trước việc dài, sau kết quả, trước compaction, khi thấy cảnh báo usage, trước khi dừng. Ghi sửa dở, lệnh chưa rõ đã xong, process còn chạy, path sở hữu, gate còn, bước tiếp. Không trông chờ lượt cuối sau hard limit.

Khi resume, chỉ giao đối chiếu khi có task running/interrupted hoặc checkpoint ghi việc chưa commit/chưa push; nếu không, đọc bảng và checkpoint. Task running cũ thành interrupted tới khi xác nhận process/session; không tạo writer mới khi cũ có thể còn chạy. Tiếp subagent theo ID trong phiên resume nếu còn. Nếu không, giữ task ID, tăng attempt, giao phần còn cho agent thay. Không làm lại giai đoạn đã đạt hoặc coi lệnh chưa rõ là pass.

Nếu state hỏng, phục hồi bảng đã commit cuối rồi đối chiếu report, source, log trước giao việc. File/bằng chứng thật ưu tiên hơn mô tả cũ; báo khác biệt. Định danh source đổi làm mất hiệu lực audit pass cũ.

## Gate và audit độc lập

Đóng băng source, giao gate bắt buộc, lưu HANDOFF rồi giao audit độc lập context mới theo WPn_REVIEW. Không fork lý luận implementer sang auditor. Auditor kiểm tiêu chuẩn/spec, trace production, tự chạy check/probe bắt buộc, ghi digest trước/sau. Không sửa source đang audit. PASS / FIX REQUIRED / NOT VERIFIED cần bằng chứng thật, không chỉ tổng kết implementer.

Audit chạy trên freeze commit với cây sạch ngoài `handoff/` (hoặc bản clone tạm tại SHA đó). Snapshot cuối giai đoạn là snapshot mà audit PASS sẽ nghiệm thu giai đoạn, gồm cả recheck FIX REQUIRED mở khóa giai đoạn kế; nó giữ gate verifier riêng. `gate_included` chỉ dành cho sửa S-size trung gian. Khi audit ghi `reviewed_commit` và gate mà nó phụ thuộc ghi `freeze_commit`, hai giá trị phải bằng nhau (mọi giai đoạn).

Phạm vi quản trị: task quy trình dùng giai đoạn `GOV`, không thuộc `authorized_scope` (giữ WP1–WP5). Task GOV đang chạy được miễn kiểm tra "task đang chạy ngoài giai đoạn đang hoạt động"; kiểm PASS cũ chỉ áp dụng cho giai đoạn đang hoạt động; audit GOV đã xong còn cần `reviewed_commit` (40 hex) và một gate phụ thuộc có `freeze_commit` bằng giá trị đó, nên audit GOV không bao giờ dùng `gate_included`; dependency được phép vượt giai đoạn. Path quản trị: AGENTS.md, CLAUDE.md và bản `.vi.md`, tài liệu này và bản dịch, `handoff/prompts/`, `handoff/templates/`, `.claude/`, `.agents/`, `docs/agents/`, `handoff/delivery/validate_*.py`, `handoff/delivery/check_recovery.py`, `scripts/precommit-check.mjs`. Mọi thay đổi ở đó cần freeze commit GOV, gate và audit mới. PASS của GOV được định danh bằng reviewed commit (digest nguồn không gồm `handoff/`) và chỉ bị thay thế bởi thay đổi quản trị sau đó. NEXT_ACTION, STATE, bảng, checkpoint và tài liệu 10 là state hoặc hồ sơ, không phải path quản trị.

FIX REQUIRED tạo sửa có giới hạn rồi gate/audit trên digest mới. Task sửa có thể ghi trường tùy chọn `addresses_audit` (ID của audit mà nó xử lý, để truy vết): chỉ dùng cho task sửa, phải trỏ tới một audit có thật đã xong với FIX REQUIRED hoặc NOT VERIFIED, và audit đó không được đồng thời là dependency, vì dependency nghĩa là audit đã PASS. Khi một thay đổi đã được chấp nhận về sau thay thế snapshot đã audit, PASS cũ được giữ làm lịch sử: audit PASS đã xong có thể ghi trường tùy chọn `superseded_by`, là ID của một audit khác cùng package, bản thân audit đó không có `superseded_by` và review một digest khác. PASS đã bị thay thế vẫn thỏa kiểm tra dependency của các task từng dùng nó, được miễn kiểm tra stale-PASS và không còn được tính là nghiệm thu hiện hành; ở trạng thái `software_ready`, mọi đích `superseded_by` phải là audit PASS đã xong. NOT VERIFIED chặn tới khi đủ execution/source/evidence. WP1 cần sửa/recheck F-01; chỉ PASS cho phép WP2. Lặp tới WP4. WP5 bắt đầu bằng nghiệm thu độc lập rồi sửa/recheck, chuẩn bị pilot cụ thể. Sẵn sàng phần mềm, phép chủ, kết quả pilot thật là riêng biệt.

## Commit và push

Quyền thường trực của chủ, 2026-10-02 (chủ xác nhận trực tiếp trong phiên chính): chỉ `timesheet-committer` commit và push, mỗi lần một task commit.

- Trước bản release đầu tiên, commit thẳng `main` và push sau mỗi commit. Sau khi chủ ghi release đầu tiên (bảng `git.release_declared` true), làm trên nhánh `fix/<task>-<slug>` hoặc `feat/<task>-<slug>` với pull request; chủ merge trừ khi ủy quyền. Agent không tạo tag hay release.
- Điểm commit: freeze commit sau mỗi task implement/sửa (trước gate/audit; định danh được audit là reviewed_commit + source_digest); accept commit sau audit PASS (evidence, review, state); sửa đổi quản trị; checkpoint commit trước khi dừng có kế hoạch khi state chưa commit. Không commit theo từng lần sửa bảng.
- Kỷ luật: task commit chạy riêng với đúng tập path dự kiến và stage theo path tường minh; file IDE tự stage thừa được bỏ stage bằng `git restore --staged`. Chạy lệnh Node bằng runtime Node 24 (dự án yêu cầu `^24.11.0`; trên máy Windows của chủ là `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin`, thêm vào đầu PATH; Node 25/26 của hệ thống bị từ chối) và ghi `node --version` vào evidence commit. Trước khi commit chạy `node scripts/precommit-check.mjs`, `git diff --cached --check`, parse JSON đã đổi, validator orchestration khi bảng được stage, và đọc diff tìm dữ liệu cá nhân. Không bao giờ commit secret, ảnh chữ ký hay dữ liệu timesheet cá nhân.
- Che evidence: kiểm tra riêng tư chặn path hồ sơ người dùng cụ thể, secret YAML/INI không có nháy, giá trị của tên secret có dạng app password cách quãng (bốn nhóm bốn chữ cái hoặc chữ số, có hoặc không có nháy), và file PDF/ảnh/chữ ký mà tên file không chứa `synthetic` (`reference/fixtures/` và `reference/examples/` vẫn được phép); mọi địa chỉ email không tổng hợp đều bị chặn, trừ đúng địa chỉ ghi công commit `noreply@anthropic.com`. Với phát hiện `profile-path` trong log evidence đã stage, committer được thay riêng phần tên tài khoản bằng `<user>`, stage lại, ghi từng file đã che và chạy lại mọi kiểm tra; không đổi nội dung khác và dừng với mọi phát hiện khác.
- Không bao giờ: amend, force-push, `--no-verify`, reset, rebase, clean, stash, tag, viết lại lịch sử, `add -A`, `commit -a`.
- Push lỗi: thử lại hai lần rồi ghi `push_blocker` (commit ở lại local). Bị từ chối non-fast-forward hoặc protection thì dừng với blocker cho chủ. Không bao giờ xin credential trong chat.
- Nhiệm vụ không đổi cài đặt quyền; chủ có thể cho phép trước lệnh git hoặc thêm luật deny. Message dùng skill commit-message với các dòng thân Task/Gate/Audit/Digest. Ngoài quyền này không ai commit trừ khi người dùng yêu cầu rõ; mỗi phản hồi sau khi sửa file vẫn kèm `Commit description`.

## Subscription và limit

Thông tin hiện có: Claude Max 20x (ảnh chủ, 2026-09-30), ChatGPT Business ghế standard và 2.500 reserve credits được báo. Ưu tiên subscription có sẵn; chi reserve dự kiến bằng không. Không extra usage/overage, API key, mua credits, đổi billing account/workspace.

Subagent dùng chung allowance; nhiều agent không nhân quota. Chỉ ghi số dư/reset khi thấy, kèm thời điểm/múi giờ. Không bịa token budget, giờ reset, quota, ngày xong. Giảm song song/checkpoint khi usage thấp; không né limit bằng đường billing khác.

Sau reset, Resume/Continue phiên Claude cũ hoặc mở phiên mới cùng prompt đầu vào. Recovery bền vững không đặt lịch tự thức dậy hoặc bảo đảm client dừng tự restart. Có thể cần Resume/Continue thủ công; chủ không cần gửi lại brief nghiệp vụ. Ước tính 16–23 phiên cũ thuộc luồng hai client; ước tính việc còn từ task đã đạt.

Khả năng kiểm ngày 2026-10-02: [subagent](https://code.claude.com/docs/en/sub-agents), [model/effort](https://code.claude.com/docs/en/model-config), [resume CLI](https://code.claude.com/docs/en/cli-reference), [giới hạn checkpoint](https://code.claude.com/docs/en/checkpointing). Rewind native không thay hồ sơ task hoặc bao phủ mọi sửa qua shell/subagent. Cần kiểm tích hợp Claude và subscription bằng client thật.
