# Bước tiếp: bắt đầu hoặc resume coordinator

**Tình trạng ứng dụng:**
- WP1 đã nghiệm thu (68bbb31, digest c6e24381).
- WP2 đã nghiệm thu (5fafeae, digest e61fa914).
- WP3 đã nghiệm thu: WP3-REGATE3 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP3-RECHECK-A lần 3 và WP3-RECHECK-BC3, đều PASS tại 49651c8, digest c31c300c.
- WP4 đã nghiệm thu: WP4-REGATE4 PASS và hai lần kiểm tra lại độc lập cuối cùng,
  WP4-RECHECK-A lần 4 và WP4-RECHECK-B4, đều PASS tại 546cdda, digest 26fcc969.
- WP5 đã nghiệm thu (độ sẵn sàng phần mềm), nghiệm thu lại sau vòng thay đổi UI lần 3
  theo yêu cầu chủ dự án: WP5-UX3-REGATE5 PASS và audit độc lập cuối WP5-UX3-AUDIT-INT PASS
  tại 8e55710, digest 507de97c. Các lần nghiệm thu trước: a643794 / 229df806 sau vòng 2,
  90b98ef / 57e2974c sau vòng 1, và 014bd47 / 150420e7.
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
  báo lỗi phía server; không đổi nghiệp vụ. Backlog không bắt buộc: xem
  [WP5 handoff](delivery/WP5_HANDOFF.vi.md). Câu hỏi không bắt buộc WP5-UX2-Q3 đã được thay
  bằng câu trả lời G-5 (b) của vòng 3.
- Vòng thay đổi UI lần 3 (chủ dự án yêu cầu 2026-10-15, xong 2026-10-19):
  - Những gì đã đổi:
    - phong cách hiện đại thay cho phong cách công nghiệp;
    - menu nhận diện người dùng trên thanh trên cùng (Profile, Settings có Administration,
      Sign out);
    - bố cục phần đầu trang và thanh kỳ với nhãn old/current/in progress/future;
    - hiệu ứng nổi cho cột được chọn trên bảng;
    - Day editor dạng nổi dưới 1360px;
    - hộp thoại phiên giờ riêng với các dòng giờ nghỉ, hoặc chip trên điện thoại;
    - điền sẵn giá trị mặc định và gợi ý giờ nghỉ cho các ngày đã qua;
    - thông báo khi chưa có giờ nghỉ và hộp xác nhận cuối trước khi lưu.
  - Câu trả lời của chủ dự án: G-1..G-5, N-1, N-2, Q6 (b), chip giờ 24h, và Q7 (a, phần đầu
    AGENTS.md của chủ dự án).
  - Phần việc đã làm: các kế hoạch WP5-UX3-PLAN và PLAN2; các phần T01..T10 cùng T05B, T06 và
    T08B; các vòng sửa FIX1..FIX6; và các thay đổi quản trị GOV (79b9a53) và GOV2 (ceb86b6).
  - Phạm vi: UI phía client, test và tài liệu. dist/server và dist/domain giống từng byte so với
    a643794; không đổi nghiệp vụ.
  - Review cuối: [review tích hợp WP5 UX3](delivery/WP5_UX3_REVIEW_INT.vi.md).
  - Backlog không bắt buộc: xem [WP5 handoff](delivery/WP5_HANDOFF.vi.md).
- Pilot: [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) cụ thể đã sẵn để chủ dự án duyệt
  (định danh bản phát hành 8e55710 / 507de97c). Chưa xin phép chủ dự án, chưa có kết quả
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
0. **Đang làm (đã tiếp tục ngày 2026-10-26 sau lần tạm dừng vì hạn mức ngày 2026-10-23):
   vòng thay đổi UI lần 4 và 5.**
   - Commit đã push gần nhất là 5b8b718 (digest edcca194). FIX1, FIX2 và FIX3 đã được freeze,
     và nhánh Ingat của chủ dự án đã được gộp vào (b8bae50).
   - WP5-UX5-REGATE3 (lần 2) không đạt:
     - hai lỗi assertion trong lượt quét: Today khi qua nửa đêm giờ LA, và một dòng trên
       trang review không thẳng hàng;
     - ECONNRESET lặp lại;
     - hai cảnh báo bảo mật mới từ npm audit (nodemailer, zod).
   - Hai việc chẩn đoán đã xong:
     - hai lỗi trong lượt quét là lỗi của test;
     - lỗi reset kết nối là lỗi của bộ chạy test;
     - không có lỗi nào của sản phẩm.
   - WP5-UX5-FIX4 đã ghim nodemailer 10.1.4 và zod 4.6.6, chưa commit.
   - WP5-UX5-FIX5 (chỉ sửa test và bộ chạy test) đã xong, chưa commit.
   - WP5-UX5-DIAG3 đã xong. Khi máy bận, quá nhiều worker test chạy song song gây ra lỗi
     quá thời gian; lỗi reset ở bước smoke cũng là lỗi keep-alive như trước. Không có lỗi
     sản phẩm.
   - WP5-UX5-FIX6 (chỉ sửa bộ chạy test và cấu hình test) đã xong.
   - FIX4 tới FIX6 đã được freeze trong f4049aa (digest 26b163a6) và đã push.
   - WP5-UX5-REGATE4 đã đạt trên f4049aa.
   - WP5-UX5-AUDIT-B tìm ra năm lỗi mức Low (FIX REQUIRED): tài liệu cũ chưa cập nhật, một
     trường hợp hiếm trong PDF khiến giờ nghỉ phép bị cắt mất khi tên ngày lễ dài, và hai
     test chưa đủ chặt.
   - WP5-UX5-AUDIT-A tìm ra một lỗi Medium và ba lỗi Low (FIX REQUIRED). Lỗi Medium: trên
     trang Review hẹp, nút "Sign correction" của một kỳ đã ký che mất dòng chữ ký.
   - Cả hai bản kế hoạch sửa đã xong. WP5-UX5-FIX7 (sửa các lỗi vùng B) đã xong, chưa
     commit.
   - WP5-UX5-FIX8 (sửa các lỗi vùng A) đã xong, chưa commit. Lượt quét axe của nó phát hiện
     một lỗ hổng truy cập bằng bàn phím có từ trước: các thẻ tuần chỉ đọc cuộn ngang không
     thể dùng bàn phím để tới được.
   - WP5-UX5-FIX9 đã sửa lỗ hổng đó, chưa commit.
   - Đang chạy: WP5-UX5-FIX9-FREEZE, một commit cho FIX7 tới FIX9 và các bản ghi, rồi
     push.
   - Sau đó là một lần freeze, gate lại, kiểm tra lại độc lập, audit tích hợp, ACCEPT-DOCS
     và nghiệm thu lại WP5.
   - Chi tiết: checkpoint, mục "REGATE3 không đạt; hai việc chẩn đoán đang chạy
     (2026-10-26)".
   - Trước đó trong ngày đã tạm dừng hai lần để khởi động lại máy.
   - Mọi slice của hai vòng đã được freeze. Commit gần nhất là 2bce0ab (digest 70975091).
   - Gate của đợt 5 FAIL và FIX1 đã sửa. Lần regate sau đó FAIL vì một lỗi tranh chấp
     thời điểm trong test; WP5-UX5-DIAG1 xác định đó là lỗi của test.
   - WP5-UX5-FIX2 (chỉ sửa test) bị gián đoạn.
   - Tiếp tục bằng prompt khởi động bên dưới. Điều phối viên làm tiếp ở `next_task_id` của
     board (WP5-UX5-FIX2, lần 2). Sau đó là freeze của nó, WP5-UX5-REGATE2, audit A và B,
     audit tích hợp, ACCEPT-DOCS và nghiệm thu lại WP5.
   - Chi tiết: [checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md), mục "Tạm dừng
     để khởi động lại máy (2026-10-22)".
   - Cho đến khi nghiệm thu lại, bản đã nghiệm thu gần nhất vẫn là 8e55710 / 507de97c.
1. **Đã xong: WP5 đã nghiệm thu, rồi nghiệm thu lại sau mỗi vòng thay đổi UI.** Biên bản
   nghiệm thu đầu đã commit ở dd0c7d1. Các biên bản nghiệm thu lại nằm trong
   [WP5 handoff](delivery/WP5_HANDOFF.vi.md):
   - 90b98ef / 57e2974c (WP5-UX-AUDIT-AB9);
   - a643794 / 229df806 (WP5-UX2-AUDIT2);
   - 8e55710 / 507de97c (WP5-UX3-AUDIT-INT).
2. **Đã xong: GOV-RECOVERY.** `check_recovery.py` không còn lấy trạng thái thật của
   mission (bản sửa đóng băng ở 7f750e9, gate PASS,
   [GOV recovery review](delivery/GOV_RECOVERY_REVIEW.vi.md) PASS). Board ghi mission là
   `software_ready`.
3. **Đã xong: vòng thay đổi UI lần 2 và lần 3.**
   - WP5-UX2: nghiệm thu lại trên a643794 / 229df806.
   - WP5-UX3: nghiệm thu lại trên 8e55710 / 507de97c (gate WP5-UX3-REGATE5, audit
     WP5-UX3-AUDIT-INT PASS). Định danh trong pilot packet đã cập nhật.
4. **Tiếp theo, chủ dự án: duyệt pilot.** Đọc
   [pilot packet](delivery/WP5_PILOT_PACKET.vi.md) và trả lời D-1..D-15.
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
