# Bước tiếp: bắt đầu hoặc resume coordinator

**Ứng dụng: WP1 FIX REQUIRED; F-01 chưa sửa; WP2 chưa bắt đầu.**
Thiết kế quy trình này không sửa ứng dụng. Xem [STATE](delivery/STATE.json),
[bảng task](delivery/ORCHESTRATION.json), [WP1 handoff](delivery/WP1_HANDOFF.vi.md),
[WP1 review](delivery/WP1_REVIEW.vi.md), [bàn giao quy trình](delivery/ORCHESTRATION_HANDOFF.vi.md).

Mở repo này trong Claude Code bằng đăng nhập subscription. Cấu hình dự án chọn
coordinator/profile; [tài liệu 08](../docs/08_AI_WORKFLOW_AND_BUDGET.vi.md) quy định
fallback hỗ trợ. Restart phiên cũ nếu thư mục agents mới chưa nạp.

Dán một lần:

~~~text
Đọc CLAUDE.md, AGENTS.md và handoff/prompts/ORCHESTRATE.md.
Điều phối nhiệm vụ Timesheet đã lưu tới sẵn sàng phần mềm WP1–WP5 và
pilot packet cụ thể. Giao plan, chẩn đoán, implement, sửa, kiểm chứng và
audit độc lập cho subagent; chọn model/effort hỗ trợ theo độ khó task.
Main agent chỉ điều phối và lưu tiến độ bền vững. Tiếp task dở, không
làm lại việc đã đạt. Trao đổi tiếng Việt. Giữ việc không liên quan, dùng
dữ liệu giả/dry-run, để thay đổi chưa commit. Dừng trước gửi/triển khai
thật; chỉ xin phép chủ sau khi chuẩn bị pilot packet cụ thể.
Không đổi billing.
~~~

Luồng hiện tại: planner xác nhận sửa F-01 có giới hạn, worker chạy
[FIX_FINDINGS](prompts/FIX_FINDINGS.vi.md), verifier gate WP1, auditor mới chạy
[WP1_REVIEW](prompts/WP1_REVIEW.vi.md) trên source mới. Chỉ PASS cho phép WP2.
Coordinator tiến theo [lộ trình](../docs/09_IMPLEMENTATION_ROADMAP.vi.md) không bắt
chuyển nhà cung cấp thủ công. WP5 bắt đầu nghiệm thu độc lập; pilot thật do chủ quyết.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume <session-id>` cho phiên đã ghi. Nếu không còn, mở phiên mới dùng
cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi state/report/checkout; không
cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Lưu brief trước giao việc, kết quả sau
bước liền mạch vì hard stop có thể không kịp checkpoint cuối. Không lấy rewind native
làm recovery. Giữ source/evidence; không giải nén lại gói cũ.
