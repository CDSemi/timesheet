# Bước tiếp: bắt đầu hoặc resume coordinator

**Tình trạng ứng dụng:**
- WP1 đã nghiệm thu (68bbb31, digest c6e24381).
- WP2 đã nghiệm thu (5fafeae, digest e61fa914).
- WP3 đã nghiệm thu: WP3-REGATE3 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP3-RECHECK-A lần 3 và WP3-RECHECK-BC3, đều PASS tại 49651c8, digest c31c300c.
- WP4 đã nghiệm thu: WP4-REGATE4 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP4-RECHECK-A lần 4 và WP4-RECHECK-B4, đều PASS tại 546cdda, digest 26fcc969.
- WP5 đã nghiệm thu (độ sẵn sàng phần mềm), nghiệm thu lại sau vòng thay đổi UI lần 2
  theo yêu cầu chủ dự án: WP5-UX2-REGATE2 PASS và lần kiểm tra lại độc lập cuối
  WP5-UX2-AUDIT2 PASS tại a643794, digest 229df806 (các lần nghiệm thu trước: 90b98ef /
  57e2974c sau vòng 1, và 014bd47 / 150420e7).
- Vòng thay đổi UI (chủ dự án yêu cầu 2026-10-08, đã xong): trang Timesheet theo bố cục
  bảng timesheet trong file Excel mẫu, khung app thân thiện hơn, trên máy tính và điện
  thoại (kế hoạch và mockup: task WP5-UX-PLAN, `handoff/delivery/design/WP5-UX/mockup.html`).
  Chủ dự án chấp nhận E-1..E-7 theo khuyến nghị và trả lời WP5-UX-Q1, WP5-UX-Q2 là (a).
  Các phần T01..T06 và các vòng sửa FIX1..FIX10 (trợ năng WCAG 2.2 AA, bố cục điện thoại,
  test e2e không phụ thuộc lịch) chỉ đổi UI phía client và test; không đổi server hay
  nghiệp vụ. Backlog không bắt buộc cho vòng sửa pilot: xem
  [WP5 handoff](delivery/WP5_HANDOFF.vi.md).
- Vòng thay đổi UI lần 2 (chủ dự án yêu cầu 2026-10-14, đã xong): tô sáng ngày đang mở
  trong Day editor; ô chọn Label nhẹ nhàng hơn; nút chuyển Light/Dark; hover và trạng thái
  bật rõ hơn; nút Today và Current period; Show details thành công tắc trượt; logo C&D và
  chữ thương hiệu hai hàng; check in/out trên thanh trên cùng ở điện thoại; hàng nút kỳ một
  dòng trên điện thoại ("Sign off" khi hẹp); chữ "Check in/out"; "Due" theo kiểu nhãn; mũi
  tên trong khoảng kỳ; bỏ dòng tên công ty trên bảng ở màn hình (PDF giữ nguyên). Các phần
  T01..T10 và vòng sửa FIX1..FIX2; đổi UI phía client, test và tài liệu, cùng ba câu thông
  báo lỗi phía server; không đổi nghiệp vụ. Câu hỏi không bắt buộc WP5-UX2-Q3 (nhãn
  "future" trên kỳ mà Today mở ra trong 5 ngày trước ngày trả lương; mặc định giữ nguyên)
  và backlog không bắt buộc: xem [WP5 handoff](delivery/WP5_HANDOFF.vi.md).
- Vòng thay đổi UI lần 3 (chủ dự án yêu cầu 2026-10-15, đang chạy): phong cách hiện đại
  thay cho phong cách công nghiệp, menu nhận diện người dùng trên thanh trên cùng, bố cục
  phần đầu trang và thanh kỳ, hiệu ứng nổi cho cột được chọn trên bảng, và Day editor với
  hộp thoại riêng cho phiên giờ cùng vùng giờ nghỉ đơn giản hơn (27 mục, nguyên văn trên
  board). Kế hoạch WP5-UX3-PLAN đã xong (mockup
  `handoff/delivery/design/WP5-UX3/mockup.html`); phần T06 (model dòng giờ nghỉ) đã đóng
  băng ở 5c8355d. Chủ dự án đã trả lời G-1..G-5 (G-1 b kèm thay đổi); phụ lục
  WP5-UX3-PLAN2 đã cập nhật mockup (Day editor nổi dưới 1360px, bảng tuần không bo góc,
  chip giờ nghỉ trên điện thoại, nhãn "in progress"). Đang chạy: chuỗi quản trị cho mục UI
  trong AGENTS.md (đóng băng, gate, audit mới), sau đó các phần T01..T10. Câu hỏi không bắt
  buộc WP5-UX3-Q6 (hàng hay chip cho giờ nghỉ trên điện thoại; `pending_owner_question_4`
  trên board) chỉ chặn T08B.
- Pilot: [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) cụ thể đã sẵn để chủ dự án duyệt
  (định danh bản phát hành a643794 / 229df806). Chưa xin phép chủ dự án, chưa có kết quả
  pilot, NAS chưa được kiểm.

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
1. **Đã xong: WP5 đã nghiệm thu, rồi nghiệm thu lại sau mỗi vòng thay đổi UI.** Biên bản
   nghiệm thu đầu đã commit ở dd0c7d1; các biên bản nghiệm thu lại trên 90b98ef / 57e2974c
   (WP5-UX-AUDIT-AB9) và trên a643794 / 229df806 (WP5-UX2-AUDIT2) nằm trong
   [WP5 handoff](delivery/WP5_HANDOFF.vi.md).
2. **Đã xong: GOV-RECOVERY.** `check_recovery.py` không còn lấy trạng thái thật của
   mission (bản sửa đóng băng ở 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.vi.md) PASS). Board ghi mission là
   `software_ready`.
3. **Đã xong: vòng thay đổi UI lần 2 (WP5-UX2).** Nghiệm thu lại trên a643794 / 229df806
   (gate WP5-UX2-REGATE2, audit WP5-UX2-AUDIT2 PASS); định danh trong pilot packet đã cập
   nhật.
4. **Tiếp theo, chủ dự án: duyệt pilot.** Đọc
   [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) và trả lời D-1..D-15 (và, nếu muốn,
   WP5-UX2-Q3).
   - D-1, D-7, D-8 và D-13 cần có trước khi kích hoạt.
   - Câu trả lời nào khác mặc định hiện tại sẽ kéo theo một vòng sửa (sửa, đóng băng,
     gate, audit độc lập) trước khi kích hoạt.
   - Làm các bước NAS của chủ dự án trong docs/11 và mẫu khôi phục trên máy đích.
   - Chỉ gửi thật, triển khai và kích hoạt sau khi chủ dự án cho phép rõ ràng. Khi đó
     resume coordinator bằng prompt ở trên.

Sau reset usage: Resume/Continue phiên cũ, ví dụ `claude --continue` tại đây hoặc
`claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`. Nếu không còn, mở phiên mới
dùng cùng prompt. [RESUME](prompts/RESUME.vi.md) phục hồi từ board, checkpoint, report
task và git; không cần gửi lại brief nghiệp vụ.

Chưa cấu hình tự thức dậy khi quota reset. Brief lưu trước khi giao, kết quả lưu sau
bước liền mạch, commit/push tại điểm đóng băng/nghiệm thu, vì hard stop có thể không kịp
checkpoint cuối. Không lấy rewind native làm recovery.
