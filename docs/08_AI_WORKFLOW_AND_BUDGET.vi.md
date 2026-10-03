# Điều phối AI và usage subscription

## Quyền tự quyết và vai trò

Yêu cầu ngày 2026-10-02 thay phân chia cứng Claude implement / ChatGPT review và cấm chọn model/effort subagent, chạy song song trước đây. Vai trò thuộc task, không thuộc nhà cung cấp. Mặc định: một nhiệm vụ Claude Code từ lỗi WP1 hiện tại tới sẵn sàng phần mềm WP5. ChatGPT/Codex có thể nhận bất kỳ vai trò nào nếu chủ chọn; chuyển thủ công là tùy chọn.

Main agent chỉ điều phối: giao kiểm repo, plan, chẩn đoán, implement, sửa, kiểm chứng và audit độc lập context mới. Nó quản lý dependency, giao việc, bằng chứng, trạng thái, recovery. Được ghi hồ sơ/bàn giao tổng hợp, không viết source ứng dụng hoặc tự verdict nghiệm thu. Đã cho phép tự quyết việc thường và tiến sau gate đạt. Chủ giữ ngoại lệ nghiệp vụ, triển khai/gửi thật và secret. Chuẩn bị pilot trước khi xin phép kích hoạt. Không tự commit/amend/push.

## Cấu hình và chọn theo độ khó

`.claude/settings.json` chọn `timesheet-coordinator`. Định nghĩa trong `.claude/agents/` cấu hình alias model/effort; riêng văn bản không cấu hình client. Không đổi settings toàn cục, tốc độ, đăng nhập hay billing.

| Profile | Model / effort | Công việc |
|---|---|---|
| timesheet-coordinator | sonnet / medium | Giao việc, dependency, state, tiến độ tiếng Việt |
| timesheet-light | sonnet / low | Tài liệu, bản dịch, kiểm kê có chỉ dẫn rõ |
| timesheet-planner | sonnet / high | Kiểm repo, chia scope, chẩn đoán, đánh giá rủi ro |
| timesheet-worker | sonnet / medium | Implement thường với hợp đồng rõ |
| timesheet-worker-high | sonnet / high | Time/OT, ownership, transaction, sign-off, concurrency, recovery |
| timesheet-expert | opus / high | Lỗi khó có giới hạn sau hai lần thử tái hiện thất bại, hoặc độ khó đặc biệt có bằng chứng |
| timesheet-verifier | sonnet / high | Gate bắt buộc, định danh source, đối chiếu gián đoạn |
| timesheet-auditor | opus / high | Audit tiêu chuẩn/spec độc lập context mới, recheck |

Chọn profile hỗ trợ nhỏ nhất đủ khả năng theo độ khó/rủi ro task, không theo số giai đoạn. Auditor có thể cùng họ model implementer; phải là instance/context khác chưa viết thay đổi đang kiểm. Không tự max effort hoặc tốc độ tăng cường.

Giao kiểm client/version/profile chỉ đọc khi bắt đầu. Ghi settings yêu cầu riêng với settings thật quan sát được; dùng null khi không thấy. Kiểm client nhận `agent`, `model`, `effort`, `Agent` và profile. Restart nếu thư mục agents mới chưa nạp. Account/managed có thể ghi đè. Nếu subscription không có Opus, dùng auditor mới Sonnet/high. Nếu effort không hỗ trợ, dùng mức hỗ trợ và ghi fallback. Coordinator được sửa cấu hình profile riêng dự án cho fallback hỗ trợ trước khi giao việc, ghi lý do. Không chuyển API billing. Nếu không delegate được, lưu blocker cấu hình thay vì main tự implement.

## Giao việc và ownership

Theo [ORCHESTRATE](../handoff/prompts/ORCHESTRATE.vi.md). Brief gồm task ID, giai đoạn/prompt, danh sách nguồn chuẩn, dependency, baseline/digest, path được ghi chính xác, output/evidence, rule/AC và bước tiếp. Worker chỉ chạy task đó, không chạy nhiệm vụ coordinator. Chỉ coordinator ghi ORCHESTRATION.json, STATE.json, NEXT_ACTION.

Tối đa hai subagent hoạt động; chỉ một ghi source/configuration. Chạy song song phân tích chỉ đọc độc lập hoặc report/evidence riêng. Chạy tuần tự install, migration, build, gate dùng chung output/database. Dừng writer trước gate/audit. Không delegate lồng; worker trả escalation cho coordinator. Mặc định: checkout này với ownership rõ. Worktree phải giữ đúng snapshot review gồm file chưa commit cần thiết; không dùng checkout nhánh mặc định làm mất chúng. Không reset/clean việc không liên quan.

## State bền vững và recovery

[ORCHESTRATION.json](../handoff/delivery/ORCHESTRATION.json) là bảng task trên đĩa. [STATE.json](../handoff/delivery/STATE.json) vẫn là tóm tắt nghiệm thu giai đoạn. Task list/chat native chỉ là hỗ trợ tiện lợi.

Lưu task ID/dependency, loại/trạng thái, profile, settings yêu cầu/thật, agent/session ID nếu thấy, attempt, path sở hữu, prompt/report/evidence, baseline/digest, quyết định, bước tiếp. Trạng thái: pending, running, interrupted, blocked, done, cancelled. Implement done không là nghiệm thu độc lập. Audit PASS cần bằng chứng độc lập source hiện tại.

Trước giao việc, lưu brief song ngữ và trạng thái running. Trước thay bảng hợp lệ, lưu nội dung cũ thành ORCHESTRATION.previous.json. Giao subagent kiểm bản thay. Một coordinator ghi state chung. Worker thêm kết quả song ngữ bền vững sau mỗi bước sửa/kiểm và trước khi trả, dùng [TASK](../handoff/templates/TASK.vi.md). Đối chiếu output/evidence thật trước cập nhật state. Quyết định gate là PASS / FAIL / NOT VERIFIED; tóm tắt giai đoạn đạt dùng independent_review: passed. Sau nghiệm thu, cập nhật STATE, NEXT_ACTION, HANDOFF song ngữ cùng nhau. Review mới dùng path mới; giữ bằng chứng lịch sử.

Checkpoint trước việc dài, sau kết quả, trước compaction, khi thấy cảnh báo usage, trước khi dừng. Ghi sửa dở, lệnh chưa rõ đã xong, process còn chạy, path sở hữu, gate còn, bước tiếp. Không trông chờ lượt cuối sau hard limit.

Khi resume, giao đối chiếu bảng/bản trước, checkpoint và checkout thật trước. Task running cũ thành interrupted tới khi xác nhận process/session; không tạo writer mới khi cũ có thể còn chạy. Tiếp subagent theo ID trong phiên resume nếu còn. Nếu không, giữ task ID, tăng attempt, giao phần còn cho agent thay. Không làm lại giai đoạn đã đạt hoặc coi lệnh chưa rõ là pass.

Nếu state hỏng, phục hồi bản previous hợp lệ cuối rồi đối chiếu report, source, log trước giao việc. File/bằng chứng thật ưu tiên hơn mô tả cũ; báo khác biệt. Định danh source đổi làm mất hiệu lực audit pass cũ.

## Gate và audit độc lập

Đóng băng source, giao gate bắt buộc, lưu HANDOFF rồi giao audit độc lập context mới theo WPn_REVIEW. Không fork lý luận implementer sang auditor. Auditor kiểm tiêu chuẩn/spec, trace production, tự chạy check/probe bắt buộc, ghi digest trước/sau. Không sửa source đang audit. PASS / FIX REQUIRED / NOT VERIFIED cần bằng chứng thật, không chỉ tổng kết implementer.

FIX REQUIRED tạo sửa có giới hạn rồi gate/audit trên digest mới. NOT VERIFIED chặn tới khi đủ execution/source/evidence. WP1 cần sửa/recheck F-01; chỉ PASS cho phép WP2. Lặp tới WP4. WP5 bắt đầu bằng nghiệm thu độc lập rồi sửa/recheck, chuẩn bị pilot cụ thể. Sẵn sàng phần mềm, phép chủ, kết quả pilot thật là riêng biệt.

## Subscription và limit

Thông tin hiện có: Claude Max 20x (ảnh chủ, 2026-09-30), ChatGPT Business ghế standard và 2.500 reserve credits được báo. Ưu tiên subscription có sẵn; chi reserve dự kiến bằng không. Không extra usage/overage, API key, mua credits, đổi billing account/workspace.

Subagent dùng chung allowance; nhiều agent không nhân quota. Chỉ ghi số dư/reset khi thấy, kèm thời điểm/múi giờ. Không bịa token budget, giờ reset, quota, ngày xong. Giảm song song/checkpoint khi usage thấp; không né limit bằng đường billing khác.

Sau reset, Resume/Continue phiên Claude cũ hoặc mở phiên mới cùng prompt đầu vào. Recovery bền vững không đặt lịch tự thức dậy hoặc bảo đảm client dừng tự restart. Có thể cần Resume/Continue thủ công; chủ không cần gửi lại brief nghiệp vụ. Ước tính 16–23 phiên cũ thuộc luồng hai client; ước tính việc còn từ task đã đạt.

Khả năng kiểm ngày 2026-10-02: [subagent](https://code.claude.com/docs/en/sub-agents), [model/effort](https://code.claude.com/docs/en/model-config), [resume CLI](https://code.claude.com/docs/en/cli-reference), [giới hạn checkpoint](https://code.claude.com/docs/en/checkpointing). Rewind native không thay hồ sơ task hoặc bao phủ mọi sửa qua shell/subagent. Cần kiểm tích hợp Claude và subscription bằng client thật.
