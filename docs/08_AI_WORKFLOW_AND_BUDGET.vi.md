# Điều phối AI và usage subscription

## Quyền tự quyết và vai trò

Yêu cầu ngày 2026-10-02 thay phân chia cứng Claude implement / ChatGPT review và cấm chọn model/effort subagent, chạy song song trước đây. Vai trò thuộc task, không thuộc nhà cung cấp. ChatGPT/Codex có thể nhận bất kỳ vai trò nào nếu chủ chọn; chuyển thủ công là tùy chọn.

Main agent chỉ điều phối: giao kiểm repo, plan, chẩn đoán, implement và sửa; nó quản lý dependency, giao việc, trạng thái, recovery. Được ghi hồ sơ quy trình và checkpoint ngắn, không viết source ứng dụng. Đã cho phép tự quyết việc thường. Chủ giữ ngoại lệ nghiệp vụ, triển khai/gửi thật và secret. Commit và push chỉ theo quyền thường trực ở mục "Commit và push".

## Direct change policy

Quyết định của chủ, 2026-11-04 (nguyên văn trong bảng task, mục `owner_decisions`; trường `change_policy` của bảng là `"direct"`): quy tắc và gate quá chặt. App cần chạy sớm. Làm việc bình thường: chủ thử app đang chạy khi cần thử và yêu cầu sửa khi cần sửa.

1. **Một thay đổi** là yêu cầu của chủ, hoặc một bản sửa chủ yêu cầu. Coordinator giao cho một worker: `timesheet-worker`, hoặc `timesheet-worker-high` nếu liên quan thời gian, ledger, ký duyệt, ownership hay concurrency. Không có giai đoạn lập kế hoạch trừ khi yêu cầu chưa rõ hoặc một lỗi cần chẩn đoán: worker đi thẳng vào code của chức năng được yêu cầu.
2. **Xong nghĩa là thay đổi chạy đúng như yêu cầu.** Worker chứng minh hành vi đã đổi bằng test nhắm vào chức năng đó (unit, integration hoặc e2e của tính năng, hoặc chạy trực tiếp) và giữ bộ kiểm nhanh xanh: `npm run lint`, `npm run typecheck`, `npm test` và `npm run build`. Kết quả là lệnh và mã thoát thật, ghi trong phần Results của brief task; không bịa.
3. **Không test chữ nghĩa; tài liệu khớp hành vi hiện tại.** Không chạy test hay lượt quét bằng script trên chữ nghĩa của tài liệu, comment hay thông báo: không rà EN/VI, link hay chữ cũ. Khi một thay đổi làm đổi chức năng hoặc cách nó hoạt động, chính worker đó cập nhật các tài liệu mô tả nó (tiếng Anh và `.vi.md` tương ứng) trong cùng task, đọc đối chiếu với code đã đổi (quy tắc, trường, giới hạn, luồng, thông báo) và liệt kê tài liệu đã kiểm và đã sửa trong Results; tài liệu mâu thuẫn hành vi hiện tại là lỗi, sửa ngay trong task đó. Không có task duyệt riêng; coordinator đọc danh sách đó trước khi commit. `validate_package.py --preflight` không còn là kiểm tra bắt buộc với worker hay committer; nó vẫn là công cụ.
4. **`timesheet-committer` commit và push**, giữ các quét riêng tư và secret, kiểm tra precommit, `validate_orchestration.py` và `check_recovery.py`.
5. **Không có** gate verifier, audit định kỳ, đóng băng (freeze), regate, duyệt kế hoạch hay duyệt tài liệu. Không cần thư mục bằng chứng: một phần Results ngắn trong brief task là đủ. Source digest không còn là định danh nghiệm thu. Khi coordinator thấy thật sự cần một audit (ví dụ thay đổi rủi ro về lương, OT, ký duyệt, gửi hoặc mất dữ liệu), nó hỏi chủ trước và chỉ chạy khi chủ đồng ý; tương tự với e2e đầy đủ, quét hay diễn tập container.
6. **Chủ thử app đang chạy và yêu cầu sửa.** Verifier hoặc auditor chỉ chạy khi chủ đồng ý; auditor là instance mới, không viết thay đổi đó.

Giữ nguyên: ownership, riêng tư và repository công khai (quy tắc 4 của AGENTS); dữ liệu giả và mail capture, không credential trong chat (6); ngữ nghĩa thời gian (7); quy tắc nghiệp vụ của chủ ưu tiên hơn công thức kế thừa (8); không API deprecated (11); chỉ committer commit (12); tiêu chuẩn giao diện; mỗi lúc một người ghi source và tối đa hai subagent; vai trò coordinator. Gửi thật, triển khai và kích hoạt trên NAS là việc của chủ: agent không bao giờ gửi mail thật và không triển khai, bảng giữ `stop_before`.

`validate_orchestration.py` theo `change_policy` của bảng. Với `"direct"`, nó chỉ bỏ các kiểm tra nghiệm thu: stale PASS, `non_product_since_acceptance`, cấu trúc gate và audit của audit đã xong (dependency gate, gắn commit, digest, tách và độ mạnh auditor) và khớp digest giữa gate và audit. Nó giữ schema, trạng thái, profile, concurrency và writer, chồng ownership, chỉ committer commit và kết quả commit, `stop_before`, file prompt, report và evidence được liệt kê, `next_task_id` và các phase WP1-WP5 trong STATE. Không có trường này, các kiểm tra cũ áp dụng nguyên vẹn. `--non-product-range` và `--non-product-staged` vẫn là công cụ. Task quy trình dùng giai đoạn `GOV`, ngoài `authorized_scope`.

## Cấu hình và chọn theo độ khó

`.claude/settings.json` chọn `timesheet-coordinator`. Định nghĩa trong `.claude/agents/` cấu hình alias model/effort; riêng văn bản không cấu hình client. Không đổi settings toàn cục, tốc độ, đăng nhập hay billing.

Profile cố định vai trò và effort; coordinator chọn model cho từng lần giao việc theo thang đánh giá task. Size: S/M/L/XL. Rủi ro H: đầu vào OT/credit, ledger/số dư, ownership/phân quyền, transaction/concurrency, riêng tư (PDF/chữ ký/export/dữ liệu cá nhân), lịch sử bất biến, recovery/restore, gửi ra ngoài. Novelty: không có mẫu sẵn trong repo.

| Task | Profile (effort) | Model |
|---|---|---|
| Yêu cầu của chủ hoặc bản sửa được yêu cầu | worker (medium) | sonnet |
| Như trên, liên quan thời gian, ledger, ký duyệt, ownership hay concurrency | worker-high (high) | sonnet; opus cho slice L rủi ro cao mới |
| Yêu cầu chưa rõ hoặc lỗi cần chẩn đoán | planner (high) | sonnet |
| Kiểm kê, đồng bộ link/bản dịch, metadata | light (low) | sonnet; haiku chỉ cho liệt kê/probe thuần |
| Chưa rõ nguyên nhân gốc sau một lần thử có bằng chứng | expert (xhigh) | opus |
| Commit/push | committer (medium) | sonnet |
| Kiểm chứng hoặc audit độc lập, chỉ khi chủ đồng ý | verifier (medium) / auditor (xhigh) | sonnet / opus |
| Coordinator | coordinator (medium) | inherit (model phiên của chủ) |

Giới hạn: một lần thử lại ở bậc ban đầu, một lần ở bậc leo thang, rồi blocker cho chủ. Khi thấy cảnh báo usage thấp, hạ override planner/worker về sonnet. Không được khi chưa có quyết định của chủ: fable, best, opusplan (có thể tính usage-credit), effort max/ultracode, đổi tốc độ.

Ghi theo task: profile, model yêu cầu, `model_override_reason` (size_risk|novelty|escalation|fallback_unavailable|owner), `routing` {size, risk, novelty}, và `actual_model` tự báo cùng `actual_source`. Effort chỉ đổi qua profile; sửa profile có thể cần restart client (kiểm bằng dispatch; profile không nhận ra là blocker restart). Restart client cũng làm mới ngữ cảnh AGENTS/CLAUDE được nạp vào agent; phiên chạy lâu có thể giữ bản cũ, nên mọi profile không phải coordinator đọc AGENTS.md từ đĩa khi bắt đầu task.

Giao kiểm client/version/profile chỉ đọc khi bắt đầu. Ghi settings yêu cầu riêng với settings thật quan sát được; dùng null khi không thấy. Account/managed có thể ghi đè. Nếu subscription không có Opus, dùng sonnet và ghi `fallback_unavailable`. Nếu effort không hỗ trợ, dùng mức hỗ trợ và ghi fallback. Coordinator được sửa cấu hình profile riêng dự án cho fallback hỗ trợ trước khi giao việc, ghi lý do. Không chuyển API billing. Nếu không delegate được, lưu blocker cấu hình thay vì main tự implement.

## Giao việc và ownership

Theo [ORCHESTRATE](../handoff/prompts/ORCHESTRATE.vi.md). Brief gồm task ID, yêu cầu, danh sách đọc, dependency, path được ghi chính xác, phần Results và bước tiếp. Worker chỉ chạy task đó, không chạy nhiệm vụ coordinator. Chỉ coordinator ghi ORCHESTRATION.json, STATE.json, NEXT_ACTION.

Tối đa hai subagent hoạt động; chỉ một ghi source/configuration. Chạy song song phân tích chỉ đọc độc lập hoặc report riêng. Chạy tuần tự install, migration, build dùng chung output/database. Không delegate lồng; worker trả escalation cho coordinator. Mặc định: checkout này với ownership rõ. Không reset/clean việc không liên quan.

## State bền vững và recovery

[ORCHESTRATION.json](../handoff/delivery/ORCHESTRATION.json) là bảng task trên đĩa. [STATE.json](../handoff/delivery/STATE.json) vẫn là tóm tắt giai đoạn. Task list/chat native chỉ là hỗ trợ tiện lợi.

Lưu task ID/dependency, loại/trạng thái, profile, settings yêu cầu/thật, agent/session ID nếu thấy, attempt, path sở hữu, prompt/report, quyết định, bước tiếp. Trạng thái: pending, running, interrupted, blocked, done, cancelled.

Trước giao việc, lưu brief và trạng thái running. Brief/kết quả task trong `handoff/delivery/tasks/` chỉ bằng tiếng Anh; tiếng Việt dành cho tài liệu cho người đọc, prompt, template, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW và chat. ORCHESTRATION.previous.json đã bỏ: bảng đã commit cuối là bản phục hồi; sửa bảng bằng diff nhỏ và chạy `python handoff/delivery/validate_orchestration.py` trong task commit và sau khi đổi rule/profile. Một coordinator ghi state chung. Worker thêm Results sau mỗi bước sửa/kiểm và trước khi trả, dùng [TASK](../handoff/templates/TASK.vi.md). Đối chiếu output thật trước cập nhật state.

Checkpoint trước việc dài, sau kết quả và trước khi dừng, bằng [CHECKPOINT](../handoff/templates/CHECKPOINT.vi.md) ngắn: sửa dở, lệnh chưa rõ đã xong, process còn chạy, path sở hữu, bước tiếp. Không trông chờ lượt cuối sau hard limit.

Khi resume, đọc bảng và checkpoint rồi tiếp từ `next_task_id` của bảng. Chỉ giao đối chiếu khi có task running/interrupted hoặc checkpoint ghi việc chưa commit/chưa push. Task running cũ thành interrupted tới khi xác nhận process/session; không tạo writer mới khi cũ có thể còn chạy. Nếu không, giữ task ID, tăng attempt, giao phần còn cho agent thay. Không coi lệnh chưa rõ là pass.

Nếu state hỏng, phục hồi bảng đã commit cuối rồi đối chiếu report, source, log trước giao việc. File thật ưu tiên hơn mô tả cũ; báo khác biệt.

## Commit và push

Quyền thường trực của chủ, 2026-10-02 (chủ xác nhận trực tiếp trong phiên chính): chỉ `timesheet-committer` commit và push, mỗi lần một task commit.

- Trước bản release đầu tiên, commit thẳng `main` và push sau mỗi commit. Sau khi chủ ghi release đầu tiên (bảng `git.release_declared` true), làm trên nhánh `fix/<task>-<slug>` hoặc `feat/<task>-<slug>` với pull request; chủ merge trừ khi ủy quyền. Agent không tạo tag hay release.
- Điểm commit: sau khi worker trả một thay đổi đã qua các kiểm tra nhanh; sửa đổi quản trị; checkpoint commit trước khi dừng có kế hoạch khi state chưa commit. Không commit theo từng lần sửa bảng.
- Kỷ luật: task commit chạy riêng với đúng tập path dự kiến và stage theo path tường minh; file IDE tự stage thừa được bỏ stage bằng `git restore --staged`. Chạy lệnh Node bằng runtime Node 24 (dự án yêu cầu `^24.11.0`; trên máy Windows của chủ là `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin`, thêm vào đầu PATH; Node 25/26 của hệ thống bị từ chối) và ghi `node --version`. Trước khi commit chạy `node scripts/precommit-check.mjs`, `git diff --cached --check`, parse JSON đã đổi, validator orchestration khi bảng được stage, và đọc diff tìm dữ liệu cá nhân. Không bao giờ commit secret, ảnh chữ ký hay dữ liệu timesheet cá nhân.
- Che evidence: kiểm tra riêng tư chặn path hồ sơ người dùng cụ thể, secret YAML/INI không có nháy, giá trị của tên secret có dạng app password cách quãng (bốn nhóm bốn chữ cái hoặc chữ số, có hoặc không có nháy), và file PDF/ảnh/chữ ký mà tên file không chứa `synthetic` (`reference/fixtures/` và `reference/examples/` vẫn được phép); mọi địa chỉ email không tổng hợp đều bị chặn, trừ đúng địa chỉ ghi công commit `noreply@anthropic.com`. Với phát hiện `profile-path` trong log đã stage, committer được thay riêng phần tên tài khoản bằng `<user>`, stage lại, ghi từng file đã che và chạy lại mọi kiểm tra; không đổi nội dung khác và dừng với mọi phát hiện khác.
- Không bao giờ: amend, force-push, `--no-verify`, reset, rebase, clean, stash, tag, viết lại lịch sử, `add -A`, `commit -a`.
- Push lỗi: thử lại hai lần rồi ghi `push_blocker` (commit ở lại local). Bị từ chối non-fast-forward hoặc protection thì dừng với blocker cho chủ. Không bao giờ xin credential trong chat.
- Nhiệm vụ không đổi cài đặt quyền; chủ có thể cho phép trước lệnh git hoặc thêm luật deny. Message dùng skill commit-message với dòng thân Task. Ngoài quyền này không ai commit trừ khi người dùng yêu cầu rõ; mỗi phản hồi sau khi sửa file vẫn kèm `Commit description`.

## Subscription và limit

Thông tin hiện có: Claude Max 20x (ảnh chủ, 2026-09-30), ChatGPT Business ghế standard và 2.500 reserve credits được báo. Ưu tiên subscription có sẵn; chi reserve dự kiến bằng không. Không extra usage/overage, API key, mua credits, đổi billing account/workspace.

Subagent dùng chung allowance; nhiều agent không nhân quota. Chỉ ghi số dư/reset khi thấy, kèm thời điểm/múi giờ. Không bịa token budget, giờ reset, quota, ngày xong. Giảm song song/checkpoint khi usage thấp; không né limit bằng đường billing khác.

Sau reset, Resume/Continue phiên Claude cũ hoặc mở phiên mới cùng prompt đầu vào. Recovery bền vững không đặt lịch tự thức dậy hoặc bảo đảm client dừng tự restart. Có thể cần Resume/Continue thủ công; chủ không cần gửi lại brief nghiệp vụ.

Khả năng kiểm ngày 2026-10-02: [subagent](https://code.claude.com/docs/en/sub-agents), [model/effort](https://code.claude.com/docs/en/model-config), [resume CLI](https://code.claude.com/docs/en/cli-reference), [giới hạn checkpoint](https://code.claude.com/docs/en/checkpointing). Rewind native không thay hồ sơ task hoặc bao phủ mọi sửa qua shell/subagent. Cần kiểm tích hợp Claude và subscription bằng client thật.
