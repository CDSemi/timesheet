# Bước tiếp: bắt đầu hoặc resume coordinator

**Ứng dụng: WP1 đã nghiệm thu (68bbb31, digest c6e24381). WP2 đã nghiệm thu (WP2-GATE4 PASS và hai audit độc lập cuối WP2-AUDIT-A2 lần 3, WP2-AUDIT-B4 PASS tại 5fafeae, digest e61fa914); tiếp theo WP3.**
**Quy trình: bản sửa v2 đã nghiệm thu (audit GOV độc lập PASS tại 6578df8; xem [bàn giao quy trình](delivery/WORKFLOW_HANDOFF.vi.md)). Task quản trị dùng package GOV trên board.**
Xem [STATE](delivery/STATE.json), [bảng task](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md), [WP2 handoff](delivery/WP2_HANDOFF.vi.md),
[WP2 recheck A4](delivery/WP2_RECHECK_A4.vi.md) và [WP2 recheck B4](delivery/WP2_RECHECK_B4.vi.md).

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

Luồng hiện tại: sau commit nghiệm thu WP2, planner Opus chia WP3 từ
[lộ trình](../docs/09_IMPLEMENTATION_ROADMAP.vi.md) và [WP3_IMPLEMENT](prompts/WP3_IMPLEMENT.vi.md)
thành các task có giới hạn, gồm các mục chuyển tiếp trong [WP2_HANDOFF](delivery/WP2_HANDOFF.vi.md)
(biến thể pending CorrectionResult/DeficitDebitResult, bỏ phút tạm tính khi chốt, khóa
correction theo revision). Worker implement, committer đóng băng từng phần, verifier chạy
gate cuối package WP3, và auditor mới chạy [WP3_REVIEW](prompts/WP3_REVIEW.vi.md). Chỉ PASS
cho phép WP4. WP5 bắt đầu bằng nghiệm thu độc lập; pilot thật do chủ quyết.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`. Nếu không còn, mở phiên mới
dùng cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi từ board, checkpoint, report
task và git; không cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Brief lưu trước khi giao, kết quả lưu sau
bước liền mạch, commit/push tại điểm đóng băng/nghiệm thu, vì hard stop có thể không kịp
checkpoint cuối. Không lấy rewind native làm recovery.
