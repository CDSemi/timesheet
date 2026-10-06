# Bước tiếp: bắt đầu hoặc resume coordinator

**Tình trạng ứng dụng:**
- WP1 đã nghiệm thu (68bbb31, digest c6e24381).
- WP2 đã nghiệm thu (5fafeae, digest e61fa914).
- WP3 đã nghiệm thu: WP3-REGATE3 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP3-RECHECK-A lần 3 và WP3-RECHECK-BC3, đều PASS tại 49651c8, digest c31c300c.
- WP4 đang làm: các task T01–T08 và T12A đã commit, và các quyết định F-1..F-6 của chủ
  dự án đã ghi vào docs (WP4-DEC). Board ghi task kế tiếp.

**Quy trình: bản sửa v2 đã nghiệm thu (audit GOV độc lập PASS tại 6578df8; xem [bàn giao quy trình](delivery/WORKFLOW_HANDOFF.vi.md)). Task quản trị dùng package GOV trên board.**
Xem [STATE](delivery/STATE.json), [bảng task](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md), [WP3 handoff](delivery/WP3_HANDOFF.vi.md),
[WP3 recheck A3](delivery/WP3_RECHECK_A3.vi.md) và [WP3 recheck BC3](delivery/WP3_RECHECK_BC3.vi.md).

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

Luồng hiện tại:
1. **Gỡ skill GOV-SKILL.** Chủ dự án chọn gỡ skill `.claude/skills/readme-md/` thay vì
   sửa (2026-10-05, đảo lại H-Q3 (a)). Việc gỡ đi qua một vòng GOV: gỡ, commit đóng
   băng, gate do verifier chạy, và một audit mới.
2. **Thực hiện WP4.** Làm theo [kế hoạch WP4](delivery/tasks/WP4-PLAN.md):
   - T07B (cờ F-3, việc giữ job F-4 và việc xóa bớt bản sao lưu F-5);
   - T09–T11 (nhập workbook và số dư OT đầu kỳ);
   - T12 (bước 6 và chạy lại toàn bộ diễn tập) và T13 (runbook và bàn giao).

   Worker implement, và committer đóng băng từng task. Sau đó verifier chạy gate cuối
   package WP4, và auditor mới chạy [WP4_REVIEW](prompts/WP4_REVIEW.vi.md).
3. **WP5.** WP5 bắt đầu bằng nghiệm thu độc lập. Pilot thật do chủ dự án quyết định.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`. Nếu không còn, mở phiên mới
dùng cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi từ board, checkpoint, report
task và git; không cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Brief lưu trước khi giao, kết quả lưu sau
bước liền mạch, commit/push tại điểm đóng băng/nghiệm thu, vì hard stop có thể không kịp
checkpoint cuối. Không lấy rewind native làm recovery.
