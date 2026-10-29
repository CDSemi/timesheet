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
   - Commit đã push gần nhất là 94accda (digest 462a1cd7).
   - Những gì đã xảy ra từ 5b8b718:
     - WP5-UX5-REGATE3 không đạt vì lỗi của test và bộ chạy test, cùng hai cảnh báo của npm
       audit.
     - FIX4 tới FIX6 đã sửa các lỗi đó (ghim phiên bản thư viện, test, bộ chạy test), được
       freeze trong f4049aa.
     - WP5-UX5-REGATE4 đạt trên f4049aa.
     - Hai audit độc lập A và B trả về FIX REQUIRED:
       - một lỗi Medium: phần chân chữ ký đã ký trên trang Review hẹp;
       - các lỗi Low: tài liệu, dòng nghỉ phép trong PDF, khả năng truy cập, thao tác cảm
         ứng trong Day editor, và các test chưa đủ chặt.
     - FIX7 tới FIX9 đã sửa các lỗi đó, cùng một lỗ hổng bàn phím có từ trước ở các thẻ tuần
       chỉ đọc; được freeze trong 94accda.
   - WP5-UX5-REGATE5 trượt ở đúng một tiêu chí: khi máy bận, một test logo không đổi và vốn
     chạy chậm vượt giới hạn 4 phút trong một lượt quét. Mọi thứ khác đều qua.
   - WP5-UX5-DIAG4 đã tìm ra vì sao bốn test e2e chạy chậm, và chứng minh một bản vá chỉ
     sửa test.
   - WP5-UX5-FIX10 đã áp dụng bản vá đó; test logo giờ mất khoảng 31 giây thay vì 2 phút.
   - FIX10 đã được freeze trong a5533b5 (digest 41477510) và đã push.
   - Lần gate lại có giới hạn phạm vi WP5-UX5-REGATE6 đã đạt trên a5533b5.
   - Lần kiểm tra lại vùng B tìm ra một lỗ hổng mức Low: sau khi khôi phục từ bản sao lưu,
     việc thả một lần gửi đang bị giữ vẫn có thể gửi bản cũ tới sau bản đính chính. Các lỗi
     cũ của vùng B đã được sửa.
   - Lần kiểm tra lại vùng A tìm ra một lỗ hổng mức Low: viền focus của thẻ tuần chỉ đọc bị
     che mất một phần. Các lỗi cũ của vùng A đã được sửa.
   - WP5-UX5-FIX11 đã sửa cả hai lỗ hổng và thêm các test còn thiếu; đã được freeze trong
     0f52300 (digest 20709d60) và đã push.
   - WP5-UX5-REGATE7 chỉ trượt một tiêu chí: trong một lượt quét, test không đổi
     `review.spec.ts:406` đo chữ trong thẻ kiểm tra lệch tâm 8 px ở bề rộng 767 px. Chạy
     riêng và chạy lại đều qua. Mọi mục khác đều đạt. Gate cũng phát hiện thiếu một test
     khôi phục (mutant R3).
   - WP5-UX5-DIAG5 kết luận test đo trúng lúc bố cục thay đổi trong một khung hình, không
     phải lỗi sản phẩm. Planner đề xuất thêm bước chờ theo trạng thái (chỉ sửa test) và test
     khôi phục còn thiếu.
   - WP5-UX5-FIX12 đã áp bản sửa nhưng chưa commit (digest bf7ec3f7). Task này phát hiện
     hai test chập chờn có từ trước, có thể làm gate sau trượt.
   - WP5-UX5-DIAG6 tìm ra một race trong test và một race hẹp trong sản phẩm: bấm Escape
     ngay sau khi gõ vào Notes của Day editor có thể làm mất ghi chú mà không hỏi. Bản sửa
     là một hook phía client và một test mới.
   - WP5-UX5-FIX13 đã áp bản sửa đó. FIX12 và FIX13 đã được freeze trong bb8d340 (digest
     c1691aed) và đã push.
   - WP5-UX5-REGATE8, gate lại toàn bộ trên bb8d340, chỉ trượt một tiêu chí. Trong hai lượt
     quét theo giờ mô phỏng, test mobile `controls.spec.ts:49` (không đổi trong đợt này) đo
     khoảng cách hàng tiêu đề ở 768 px được 74,8 px thay vì 32. Mọi mục khác đều đạt.
   - Lớp lỗi này quay lại sau bước kiểm tra của DIAG5, vốn chỉ chạy desktop, nên việc chẩn
     đoán được leo thang.
   - WP5-UX5-DIAG7 (timesheet-expert) xác định đây vẫn là race khi đo, xảy ra cả theo giờ
     thật. Bản sửa chỉ ở một file test và đã được chứng minh. Khi kiểm tra trên cả hai
     project, DIAG7 tìm thêm hai lỗi chập chờn khác, có từ trước: test bậc thang các loại
     khoảng kỳ và test đồng bộ giao diện sáng/tối giữa các tab.
   - WP5-UX5-DIAG8 xác định cả hai đều là race của test và đã chứng minh bản sửa test. DIAG8
     còn phát hiện: một tab đang đóng menu không còn đổi theo giao diện sáng/tối vừa chọn ở
     tab khác. Điều này trái quy tắc đã duyệt ở vòng UI lần 2. Một bản sửa sản phẩm nhỏ, đã
     chứng minh, khôi phục quy tắc đó.
   - WP5-UX5-FIX14 đã áp cả ba bản sửa và qua mọi kiểm tra. Các bản sửa đã được freeze trong
     bd9c275 (digest 419ede40) và đã push.
   - WP5-UX5-REGATE9, gate lại toàn bộ trên bd9c275, chỉ trượt một tiêu chí. Trong lượt quét
     chạy qua nửa đêm giờ địa phương, test Check in trên mobile không thấy phiên vừa mở. Mọi
     mục khác đều đạt, kể cả các bản sửa trước.
   - WP5-UX5-DIAG9 xác định sản phẩm chạy đúng: một phiên qua đêm thuộc về ngày nó bắt đầu.
     Lỗi là do test đọc ngày trước nửa đêm, và 31 test có cùng giả định đó. Bản vá chỉ đổi
     test: sửa helper Check in, giữ mỗi test tránh đúng lúc nửa đêm giờ địa phương mà không
     tác động lên hệ thống, và thêm một test tích hợp ngay tại ranh giới ngày.
   - WP5-UX5-FIX15 đã áp bản vá đó và qua mọi kiểm tra. Bản vá đã được freeze trong be2afa2
     (digest ff73565b) và đã push.
   - WP5-UX5-REGATE10, gate lại có phạm vi trên be2afa2, đã đạt.
   - Lượt kiểm tra lại độc lập vùng A (WP5-UX5-RECHECK-A2) đã đạt.
   - Lượt kiểm tra lại độc lập vùng B (WP5-UX5-RECHECK-B2) tìm ra một lỗ hổng mức Low. Sau
     khi khôi phục, một lần gửi cũ đang bị giữ vẫn có thể được thả ra nếu lần gửi bản đính
     chính bị lỗi hoặc chưa chắc đã gửi.
   - WP5-UX5-FIX16 đã sửa lỗi này: lần gửi cũ đang bị giữ giờ vẫn bị giữ khi có bất kỳ lần
     gửi muộn hơn nào của cùng kỳ, trừ lần đã hủy. Digest 18aa0ad0.
   - Bản sửa đã được freeze trong 1fe5ad3 (digest 18aa0ad0) và đã push.
   - WP5-UX5-REGATE11, gate lại có phạm vi trên 1fe5ad3, chỉ trượt một tiêu chí: một test
     import vượt quá thời gian chờ trong một lượt quét, đúng lúc máy đang bận khoảng 6–7 lõi
     cho việc khác. Mọi mục khác đều đạt.
   - WP5-UX5-DIAG10 xác định thao tác import không chậm. Test vẫn tiếp tục thao tác trên một
     tab trình duyệt đang nằm phía sau, và tab đó bị bỏ đói khi máy dùng hết CPU. Một test
     khác cũng có cùng kiểu này. Một bản sửa chỉ đổi test xử lý cả hai.
   - WP5-UX5-FIX17 đã áp bản sửa đó và qua mọi kiểm tra (digest 69c6daff).
   - Bản sửa đã được freeze trong a5cbc91 (digest 69c6daff) và đã push.
   - WP5-UX5-REGATE12, gate lại có phạm vi trên a5cbc91, đã đạt.
   - Lượt kiểm tra lại độc lập vùng B, WP5-UX5-RECHECK-B3, đã đạt, không có phát hiện mới.
   - Audit tích hợp WP5-UX5-AUDIT-INT tìm ra một lỗ hổng mức Low. Trên desktop, Day editor
     đang mở không cập nhật sau khi bấm Check in hoặc Check out trên trang. Vì vậy ghi chú
     gõ từ trước bị từ chối khi lưu và phải gõ lại. Mọi mục khác đều đạt.
   - WP5-UX5-FIX18 đã sửa lỗi này: editor giờ cập nhật theo, và giữ nguyên những gì đã gõ.
     Digest 6937d79c.
   - Bản sửa đã được freeze trong d96df5d (digest 6937d79c) và đã push.
   - WP5-UX5-REGATE13, gate lại trên d96df5d, đã đạt.
   - Lần kiểm tra lại tích hợp WP5-UX5-AUDIT-INT2 xác nhận lỗ hổng đó đã đóng, nhưng tìm thêm
     hai lỗi mới.
     - Medium, có từ trước các vòng này: lưu hoặc xóa một phiên trong Day editor đang mở có
       thể khiến lần "Save day fields" sau đó âm thầm ghi đè thay đổi làm từ thiết bị khác.
     - Low: lệnh tính digest cho bản phát hành bị lỗi.
   - WP5-UX5-FIX19 đã sửa cả hai (digest 67aa715c).
   - Đang chạy: WP5-UX5-FIX19-FREEZE commit và push bản sửa.
   - Sau đó là gate lại (WP5-UX5-REGATE14), kiểm tra lại tích hợp
     (WP5-UX5-AUDIT-INT3), kiểm tra lại tích hợp
     (WP5-UX5-AUDIT-INT2), một lượt kiểm
     tra lại độc lập mới cho vùng B (WP5-UX5-RECHECK-B3), kiểm tra lại độc lập hai lỗi đã sửa, thay đổi
     Day editor và thay đổi giao diện, audit tích hợp, ACCEPT-DOCS và nghiệm thu lại WP5.
   - Để tiếp tục sau khi bị gián đoạn, dùng prompt khởi động ở trên. Điều phối viên làm tiếp
     ở `next_task_id` của board.
   - Chi tiết: [checkpoint](delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md), mục "REGATE3
     không đạt; hai việc chẩn đoán đang chạy (2026-10-26)" và các mục sau đó.
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
