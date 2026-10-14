# Bước tiếp: bắt đầu hoặc resume coordinator

**Tình trạng ứng dụng:**
- WP1 đã nghiệm thu (68bbb31, digest c6e24381).
- WP2 đã nghiệm thu (5fafeae, digest e61fa914).
- WP3 đã nghiệm thu: WP3-REGATE3 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP3-RECHECK-A lần 3 và WP3-RECHECK-BC3, đều PASS tại 49651c8, digest c31c300c.
- WP4 đã nghiệm thu: WP4-REGATE4 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP4-RECHECK-A lần 4 và WP4-RECHECK-B4, đều PASS tại 546cdda, digest 26fcc969.
- WP5 đã nghiệm thu (độ sẵn sàng phần mềm), nghiệm thu lại sau vòng thay đổi UI theo yêu
  cầu chủ dự án: WP5-UX-REGATE8 PASS và lần kiểm tra lại độc lập cuối WP5-UX-AUDIT-AB9
  PASS (phần A và B) tại 90b98ef, digest 57e2974c (lần nghiệm thu đầu: 014bd47, digest
  150420e7).
- Vòng thay đổi UI (chủ dự án yêu cầu 2026-10-08, đã xong): trang Timesheet theo bố cục
  bảng timesheet trong file Excel mẫu, khung app thân thiện hơn, trên máy tính và điện
  thoại (kế hoạch và mockup: task WP5-UX-PLAN, `handoff/delivery/design/WP5-UX/mockup.html`).
  Chủ dự án chấp nhận E-1..E-7 theo khuyến nghị và trả lời WP5-UX-Q1, WP5-UX-Q2 là (a).
  Các phần T01..T06 và các vòng sửa FIX1..FIX10 (trợ năng WCAG 2.2 AA, bố cục điện thoại,
  test e2e không phụ thuộc lịch) chỉ đổi UI phía client và test; không đổi server hay
  nghiệp vụ. Backlog không bắt buộc cho vòng sửa pilot: xem
  [WP5 handoff](delivery/WP5_HANDOFF.vi.md).
- Vòng thay đổi UI lần 2 (chủ dự án yêu cầu 2026-10-14, đang chạy): sáu thay đổi trên
  trang Timesheet (tô sáng cột của ngày đang mở trong Day editor, kiểu chọn nhẹ nhàng hơn
  trong ô chọn Label, nút chuyển giao diện tối/sáng trên thanh điều hướng chính, hover rõ
  hơn trên các nút bật/tắt, nút Today tường minh, và Show details thành công tắc trượt).
  Chạy như vòng thay đổi WP5-UX2 trước khi kích hoạt pilot: kế hoạch WP5-UX2-PLAN (đang
  chạy), các phần việc có đóng băng, gate cuối package, audit độc lập mới, rồi nghiệm thu
  lại WP5 và cập nhật định danh trong pilot packet. Đến lúc đó WP5 vẫn được nghiệm thu
  trên 90b98ef.
- Pilot: [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) cụ thể đã sẵn để chủ dự án duyệt
  (định danh bản phát hành 90b98ef / 57e2974c; sẽ cập nhật sau vòng 2). Chưa xin phép chủ
  dự án, chưa có kết quả pilot, NAS chưa được kiểm.

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
1. **Đã xong: WP5 đã nghiệm thu, rồi nghiệm thu lại sau vòng thay đổi UI.** Biên bản
   nghiệm thu đầu đã commit ở dd0c7d1; biên bản nghiệm thu lại trên 90b98ef / 57e2974c
   (WP5-UX-AUDIT-AB9) nằm trong [WP5 handoff](delivery/WP5_HANDOFF.vi.md).
2. **Đã xong: GOV-RECOVERY.** `check_recovery.py` không còn lấy trạng thái thật của
   mission (bản sửa đóng băng ở 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.vi.md) PASS). Board ghi mission là
   `software_ready`.
3. **Đang chạy: vòng thay đổi UI lần 2 (WP5-UX2).** Kế hoạch đã xong (mockup trong
   `handoff/delivery/design/WP5-UX2/`; phần bổ sung PLAN2 và PLAN3 cho cặp nút Today/Current
   period, logo, chấm công trên header điện thoại và chữ "Check in/out"). Phần việc
   WP5-UX2-T01 (nút Dark mode) đã xong và đang được đóng băng; tiếp theo là T02-T08, rồi
   gate, audit mới và nghiệm thu lại. Nếu phiên dừng, resume coordinator bằng prompt ở
   trên.
4. **Chủ dự án, lúc nào cũng được: duyệt pilot.** Đọc
   [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) và trả lời D-1..D-15.
   - D-1, D-7, D-8 và D-13 cần có trước khi kích hoạt.
   - Câu trả lời nào khác mặc định hiện tại sẽ kéo theo một vòng sửa (sửa, đóng băng,
     gate, audit độc lập) trước khi kích hoạt.
   - Làm các bước NAS của chủ dự án trong docs/11 và mẫu khôi phục trên máy đích.
   - Chỉ gửi thật, triển khai và kích hoạt sau khi chủ dự án cho phép rõ ràng. Khi đó
     resume coordinator bằng prompt ở trên.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume 11acfabe-25ef-48b5-ac28-73ce2d74ecee`. Nếu không còn, mở phiên mới
dùng cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi từ board, checkpoint, report
task và git; không cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Brief lưu trước khi giao, kết quả lưu sau
bước liền mạch, commit/push tại điểm đóng băng/nghiệm thu, vì hard stop có thể không kịp
checkpoint cuối. Không lấy rewind native làm recovery.
