# Bước tiếp: bắt đầu hoặc resume coordinator

**Tình trạng ứng dụng:**
- WP1 đã nghiệm thu (68bbb31, digest c6e24381).
- WP2 đã nghiệm thu (5fafeae, digest e61fa914).
- WP3 đã nghiệm thu: WP3-REGATE3 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP3-RECHECK-A lần 3 và WP3-RECHECK-BC3, đều PASS tại 49651c8, digest c31c300c.
- WP4 đã nghiệm thu: WP4-REGATE4 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP4-RECHECK-A lần 4 và WP4-RECHECK-B4, đều PASS tại 546cdda, digest 26fcc969.
- WP5 đã nghiệm thu (độ sẵn sàng phần mềm): WP5-REGATE và WP5-REGATE2 PASS, và lần kiểm
  tra lại độc lập cuối WP5-RECHECK PASS tại 014bd47, digest 150420e7.
- Pilot: [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) cụ thể đã sẵn để chủ dự án
  duyệt. Chưa xin phép chủ dự án, chưa có kết quả pilot, NAS chưa được kiểm.
- Vòng thay đổi UI (chủ dự án yêu cầu 2026-10-08): kế hoạch và mockup tĩnh đã sẵn
  (task WP5-UX-PLAN; `handoff/delivery/design/WP5-UX/mockup.html`). Chủ dự án trả lời
  E-1..E-7 (board `pending_owner_question_2`) trước khi triển khai. Khi thiết kế mới vào
  code, snapshot WP5 phải chạy lại gate và audit độc lập, và định danh release trong
  pilot packet được cập nhật.

**Quy trình: bản sửa v2 đã nghiệm thu (audit GOV độc lập PASS tại 6578df8; xem [bàn giao quy trình](delivery/WORKFLOW_HANDOFF.vi.md)). Task quản trị dùng package GOV trên board.**
Xem [STATE](delivery/STATE.json), [bảng task](delivery/ORCHESTRATION.json),
[checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md), [WP5 handoff](delivery/WP5_HANDOFF.vi.md),
[WP5 recheck](delivery/WP5_RECHECK.vi.md) và [pilot packet](delivery/WP5_PILOT_PACKET.vi.md).

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
1. **Đã xong: WP5 đã nghiệm thu.** Biên bản nghiệm thu trong
   [WP5 handoff](delivery/WP5_HANDOFF.vi.md) đã commit ở dd0c7d1, không đổi source.
2. **Đã xong: GOV-RECOVERY.** `check_recovery.py` không còn lấy trạng thái thật của
   mission (bản sửa đóng băng ở 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.vi.md) PASS). Board ghi mission là
   `software_ready`.
3. **Tiếp theo, chủ dự án: duyệt pilot.** Đọc
   [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) và trả lời D-1..D-15.
   - D-1, D-7, D-8 và D-13 cần có trước khi kích hoạt.
   - Câu trả lời nào khác mặc định hiện tại sẽ kéo theo một vòng sửa (sửa, đóng băng,
     gate, audit độc lập) trước khi kích hoạt.
   - Làm các bước NAS của chủ dự án trong docs/11 và mẫu khôi phục trên máy đích.
   - Chỉ gửi thật, triển khai và kích hoạt sau khi chủ dự án cho phép rõ ràng. Khi đó
     resume coordinator bằng prompt ở trên.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume 44e3451e-da20-4a12-94bb-6b94fc5f531e`. Nếu không còn, mở phiên mới
dùng cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi từ board, checkpoint, report
task và git; không cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Brief lưu trước khi giao, kết quả lưu sau
bước liền mạch, commit/push tại điểm đóng băng/nghiệm thu, vì hard stop có thể không kịp
checkpoint cuối. Không lấy rewind native làm recovery.
