# Bước tiếp: bắt đầu hoặc resume coordinator

**Ứng dụng: WP1 đã nghiệm thu (kiểm tra lại độc lập PASS tại 68bbb31, digest c6e24381); tiếp theo WP2.**
**Quy trình: bản sửa v2 đã nghiệm thu (audit GOV độc lập PASS tại 6578df8; xem [bàn giao quy trình](delivery/WORKFLOW_HANDOFF.vi.md)). Task quản trị dùng package GOV trên board.**
Xem [STATE](delivery/STATE.json), [bảng task](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md), [WP1 handoff](delivery/WP1_HANDOFF.vi.md)
và [WP1 recheck](delivery/WP1_RECHECK.vi.md).

Mở repo này trong Claude Code bằng đăng nhập subscription. Cấu hình dự án chọn
coordinator; [tài liệu 08](../docs/08_AI_WORKFLOW_AND_BUDGET.vi.md) quy định định tuyến
(profile = vai trò + effort, model chọn theo từng lần giao) và chính sách commit/push.
Chỉ khởi động lại khi profile mới hoặc đã sửa chưa được nhận.

Dán một lần:

~~~text
Đọc CLAUDE.md, AGENTS.md và handoff/prompts/ORCHESTRATE.md.
Điều phối nhiệm vụ Timesheet đã lưu tới sẵn sàng phần mềm WP1–WP5 và
pilot packet cụ thể. Giao plan, chẩn đoán, implement, sửa, kiểm chứng,
audit độc lập và commit cho subagent; định tuyến model/effort theo rubric
tài liệu 08. Main agent chỉ điều phối và lưu tiến độ bền vững. Tiếp task
dở, không làm lại việc đã đạt. Trao đổi tiếng Việt. Giữ việc không liên
quan, dùng dữ liệu giả/dry-run. Chỉ commit và push qua timesheet-committer
theo tài liệu 08 (thẳng main đến release đầu). Dừng trước gửi/triển khai
thật; chỉ xin phép chủ sau khi chuẩn bị pilot packet cụ thể.
Không đổi billing hay cài đặt quyền.
~~~

Luồng hiện tại: sau commit nghiệm thu WP1, planner Opus chia WP2 từ
[lộ trình](../docs/09_IMPLEMENTATION_ROADMAP.vi.md) và [WP2_IMPLEMENT](prompts/WP2_IMPLEMENT.vi.md)
thành các task có giới hạn (gồm rủi ro chuyển từ [WP1_RECHECK](delivery/WP1_RECHECK.vi.md)).
Worker implement, committer đóng băng từng phần, verifier chạy gate cuối package WP2, và
auditor mới chạy [WP2_REVIEW](prompts/WP2_REVIEW.vi.md). Chỉ PASS cho phép WP3. WP5 bắt
đầu bằng nghiệm thu độc lập; pilot thật do chủ quyết.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`. Nếu không còn, mở phiên mới
dùng cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi từ board, checkpoint, report
task và git; không cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Brief lưu trước khi giao, kết quả lưu sau
bước liền mạch, commit/push tại điểm đóng băng/nghiệm thu, vì hard stop có thể không kịp
checkpoint cuối. Không lấy rewind native làm recovery.
