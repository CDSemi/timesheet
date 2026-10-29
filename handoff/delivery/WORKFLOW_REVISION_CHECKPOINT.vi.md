# Checkpoint nhiệm vụ (WP3 đã nghiệm thu; vòng GOV-SKILL và lập kế hoạch WP4)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-05 UTC.

## Cập nhật 2026-10-15: vòng thay đổi UI lần 3 theo yêu cầu chủ dự án (WP5-UX3)

- Điểm xuất phát: WP5 đã nghiệm thu lại trên a643794 / 229df806 (WP5-UX2-AUDIT2 PASS);
  commit board cuối là b1bf147 (WP5-UX2-ACCEPT). Mục cập nhật vòng 2 bên dưới ghi các bản
  ghi chưa commit sau commit đó (chuyển về `software_ready`, kết quả và bằng chứng ACCEPT,
  cập nhật checkpoint).
- Phiên coordinator mới b5de56d1-fb31-4dc5-b74f-70e9473e1a0a (suy ra từ đường dẫn
  scratchpad); `coordinator_session_id` trên board trỏ tới phiên này.
- Chủ dự án yêu cầu 27 thay đổi UI (nguyên văn ở `owner_decisions` trên board; danh sách
  tiếng Anh U-01..U-27 trong `handoff/delivery/tasks/WP5-UX3-PLAN.md`): phong cách hiện đại
  thay cho phong cách công nghiệp; tăng tương phản các bề mặt và làm bảng tuần nổi lên;
  khối nhận diện người dùng trên thanh trên cùng (avatar, tên hiển thị, email) với menu gồm
  Light/Dark, Profile, Settings (Administration thành một tab) và Sign out; trên màn hình
  lớn: chữ thương hiệu, Check in/out cùng hàng tiêu đề, bỏ tên dưới tiêu đề, nhãn
  old/current/future dễ phân biệt (future màu hồng), hàng thông tin kỳ tự xuống dòng, Open a
  day cùng hàng ô chọn ngày, giãn cách trước Show details, tô nền ô Day và hiệu ứng nổi
  (đổ bóng) cho cột chọn hàng loạt và cột đang sửa, ý kiến về tên hàng "Label" và "Check";
  trên màn hình hẹp: "Current" và ẩn chữ "Open a day" khi cần; trong Day editor: ghi chú
  ngắn, phần đầu nổi bật hơn, hộp thoại riêng cho phiên giờ với bảng giờ nghỉ (ngày bắt
  đầu, giờ, số phút), xác nhận khi xóa, điền sẵn giờ mặc định và giờ nghỉ gợi ý cho ngày
  đã qua, vùng giờ nghỉ đơn giản hơn, Save cũng là xác nhận kèm hộp thoại xác nhận, và WFH
  cùng hàng Label.
- Quyết định của coordinator (board): vòng thay đổi UI lần 3 của WP5 (mã task WP5-UX3-*),
  không mở package mới; board `running`, `next_task_id` WP5-UX3-PLAN. U-01 đổi một đường
  dẫn quản trị (mục UI trong AGENTS.md; E-8), nên một vòng GOV đi trước mọi phần áp dụng
  phong cách mới. U-21..U-25 chạm tới cách nhập và xác nhận giờ nghỉ (rủi ro H; có thể đổi
  quy tắc chuẩn theo AGENTS quy tắc 8). Chủ dự án xem mockup và các câu hỏi của plan trước
  các phần phụ thuộc phong cách.
- Đang chạy: WP5-UX3-PLAN (planner, opus, lý do size_risk, chỉ đọc; brief
  `handoff/delivery/tasks/WP5-UX3-PLAN.md`; mockup trong
  `handoff/delivery/design/WP5-UX3/`). Bước 0 đối chiếu git (commit sau b1bf147, đường dẫn
  chưa commit, digest).
- WP5-UX3-PLAN xong (planner, tự báo claude-opus-5-5, chỉ đọc): HEAD b4d9dd8 = origin/main,
  một commit chỉ chứa handoff do chủ dự án tạo sau b1bf147, ghi việc vòng 2 trở về
  `software_ready`; digest 229df806 (815 file) lúc đầu và lúc cuối. Sự thật: chữ thương
  hiệu chỉ hiện từ 1440px; hàng "Check" chỉ hiển thị trạng thái; hàng "Label" là loại ngày
  ("Category" trên PDF và trong API); tên hiển thị và email đã có, chưa có trang Profile;
  giờ tham chiếu đã có theo từng phiên bản quy tắc; các nhãn kỳ ở giao diện sáng chỉ khác
  nhau 1.12:1. Thiết kế: token và độ nổi hiện đại, menu tài khoản, trang con trong
  Settings, cột được chọn nổi lên, hộp thoại phiên giờ với dòng giờ nghỉ dạng bắt đầu + số
  phút (không đổi server hay API). Một mâu thuẫn quy tắc: điền sẵn giờ ở U-23 trái với
  docs/04 dòng 16 và docs/10 dòng 178 (đã soạn câu chữ mới). Mockup và mười ảnh tổng hợp
  trong `handoff/delivery/design/WP5-UX3/`.
- Quyết định của coordinator (board): nhận kế hoạch và các mặc định khuyến nghị; "Status"
  thay cho "Check"; câu hỏi cho chủ dự án G-1..G-5 (`pending_owner_question_3`; G-5 thay
  WP5-UX2-Q3); việc thiếu GLOSSARY.md đưa vào backlog quản trị.
- Đang chạy: WP5-UX3-T06 (worker-high, opus, lý do novelty; model thuần cho dòng giờ nghỉ
  và unit test, không đổi UI; cả hai phương án G-4 nằm sau một tham số). Lần đóng băng của
  nó commit luôn kế hoạch, mockup và bản ghi vòng 3. Sau khi chủ dự án trả lời: chuỗi GOV,
  rồi T01..T10.
- WP5-UX3-T06 xong (worker-high, tự báo claude-opus-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): chỉ thêm `breakRowsModel.ts` và unit test của nó (không đổi UI); dòng
  không bị sửa gửi lại đúng từng byte các thời điểm đã lưu; giờ kết thúc = bắt đầu + số phút
  theo UTC, gửi kèm offset rõ ràng; `breaks_confirmed` theo tham số G-4; Check out giữ E-1;
  unit 1950; file mới 68/68 dưới ba múi giờ thiết bị; 3 đột biến đều bị bắt; e2e day-editor
  và shell 0 lỗi; verify 0; digest 0ef75a15 (817 file). Ghi chú cho T08: hiện chỉ
  `future_break` có `break_index`.
- `next_role` trong STATE nay ghi vòng 3 đang chạy (WP5 vẫn nghiệm thu trên a643794 cho tới
  lần nghiệm thu lại).
- Đang chạy: WP5-UX3-T06-FREEZE (committer, chạy một mình): hai file T06 cùng kế hoạch,
  mockup, ảnh, bằng chứng T06, board, STATE, cặp checkpoint và cặp NEXT_ACTION.
- WP5-UX3-T06-FREEZE xong: 5c8355df8d60fdeb85b551eb0e5a09e8f18a6334 trên main, đã push (35
  đường dẫn; digest 0ef75a15, 817 file; mọi bước kiểm exit 0; không sai lệch).
- Board: trạng thái `blocked`, chờ chủ dự án trả lời G-1..G-5 (`pending_owner_question_3`);
  `next_task_id` WP5-UX3-GOV (brief chờ `handoff/delivery/tasks/WP5-UX3-GOV.md`, giao khi
  G-1 là a hoặc b, hủy nếu là c). Chưa commit sau đó: kết quả đóng băng, brief GOV, mục cập
  nhật này (+ en).
- Sau khi có câu trả lời: WP5-UX3-GOV, đóng băng, gate và audit opus mới; rồi T01..T05,
  T07..T10, mỗi phần một lần đóng băng (câu trả lời được đưa vào brief), gate cuối gói,
  audit vùng A và B cùng một lượt tích hợp, và nghiệm thu lại WP5.
- Chủ dự án đã trả lời (nguyên văn trên board): G-1 b kèm thay đổi (bảng tuần không bo góc,
  cột được chọn bo 4px, các cột nổi liền nhau không đổ bóng đè lên nhau, nội dung cột không
  bị ép hay chồng lên nhau khi mở panel; panel nổi khi không đủ chỗ cho cả hai), G-2 a, G-3
  a, G-4 theo phương án của chủ dự án (thông báo cho chọn xác nhận không nghỉ / tạm chưa
  xác nhận / quay lại, rồi hộp xác nhận cuối), G-5 b; thêm N-1 (trên điện thoại các ô giờ
  nghỉ nằm một hàng dưới nhãn "Break n", dạng chip có hộp thoại con khi vẫn không đủ chỗ)
  và N-2 (khoảng cách hộp thoại trên điện thoại gọn hơn).
- Quyết định của coordinator: G-4 chỉ hiện khi không có giờ nghỉ nào và chưa tick ô; chip
  giờ nghỉ dùng giờ 24h (E-4; chủ dự án có thể yêu cầu AM/PM); câu chữ AGENTS không đổi
  vì G-1.
- Đang chạy song song: WP5-UX3-GOV (worker, sonnet; AGENTS.md và AGENTS.vi.md, bên ghi duy
  nhất) và WP5-UX3-PLAN2 (cùng planner được tiếp tục, opus, chỉ đọc: đo chồng lấn trên app
  thật, quy tắc panel nổi, hình dạng bảng, hàng giờ nghỉ trên điện thoại và hộp thoại con,
  khoảng cách, thông báo G-4, nhãn G-5, phần thay đổi của mockup và các phần việc).
- WP5-UX3-GOV xong (worker, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng chứng
  độc lập): mục UI trong AGENTS.md và AGENTS.vi.md được thay bằng văn bản B2 giữ nguyên (mỗi
  file thêm 7, bỏ 9 dòng); preflight, validator và check_recovery đạt; digest a682f153 (817
  file). Lần đóng băng của nó chờ WP5-UX3-PLAN2 trả kết quả (task commit chạy một mình);
  sau đó WP5-UX3-GOV-GATE và audit opus mới WP5-UX3-GOV-AUDIT.
- Quyết định của coordinator: mục "Visual standard" của docs/04 và ghi chú thay thế E-8 ở
  docs/10 chuyển vào T01, để AGENTS, docs/04 và styles.css khớp nhau từ lần đóng băng T01;
  audit GOV coi khoảng giữa là chuyển tiếp có kế hoạch.
- WP5-UX3-PLAN2 xong (planner, tự báo claude-opus-5-5, chỉ đọc): app thật không có phần tử
  chồng lên nhau nhưng cột chỉ rộng 89.4px và chữ bị ngắt giữa từ khi mở panel; panel đặt
  cạnh bảng từ 1360px, dưới mức đó là panel nổi dạng modal; bảng tuần không bo góc, các cột
  nổi bo 4px và gộp nhóm; hàng giờ nghỉ trên điện thoại từ 382px, dưới mức đó là chip có hộp
  thoại con "Break n" (tức là trên điện thoại 390/375/360/320); khoảng cách hộp thoại trên
  điện thoại; thông báo G-4; nhãn "in progress"; thêm phần T05B và T08B; mockup cập nhật
  kèm tám ảnh `mockup-r2`.
- Quyết định của coordinator: nhận PLAN2; câu hỏi không bắt buộc WP5-UX3-Q6 (hàng hay chip
  trên điện thoại phổ biến; mặc định chip) chỉ chặn T08B.
- Đang chạy: WP5-UX3-GOV-FREEZE (committer, chạy một mình; cặp AGENTS cùng 32 đường dẫn
  handoff). Sau đó WP5-UX3-GOV-GATE và WP5-UX3-GOV-AUDIT (đã đăng ký, đang chờ).
- WP5-UX3-GOV-FREEZE xong: 79b9a53c13b1542877a587dd0ca00fe295d1f8b6 trên main, đã push (34
  đường dẫn; digest a682f153, 817 file; mọi bước kiểm exit 0; không có file bằng chứng
  checks.txt, kết quả chỉ ghi trong brief).
- Đang chạy: WP5-UX3-GOV-GATE (verifier, sonnet) trên 79b9a53 / a682f153. Sau đó audit opus
  mới WP5-UX3-GOV-AUDIT.
- WP5-UX3-GOV-GATE PASS (verifier, tự báo claude-sonnet-5-5) trên 79b9a53: digest a682f153
  trước và sau; các validator, check_recovery 106, preflight 91, verify 1950; ngoài
  handoff/ chỉ AGENTS.md và AGENTS.vi.md thay đổi; không còn từ bị cấm; nội dung mục khớp
  từng byte với khối B2.
- Đang chạy: WP5-UX3-GOV-AUDIT (auditor mới, opus) trên 79b9a53 / a682f153.
- WP5-UX3-GOV-AUDIT PASS (auditor mới, tự báo claude-opus-5-5), không có phát hiện: HEAD =
  reviewed_commit = 79b9a53, digest a682f153 lúc đầu, lúc cuối và lần kiểm cuối; cả hai mục
  khớp từng byte với B2; EN/VI tương đương; trong các đường dẫn quản trị chỉ cặp AGENTS thay
  đổi; các validator đạt. Review `handoff/delivery/GOV_UX3_REVIEW.vi.md` (+ en). Rủi ro R1
  (docs/04 dòng 87 "High-density"), R2 (thời lượng qua một `--transition` duy nhất) và R3
  (bản AGENTS nạp sẵn đã cũ: bản trên đĩa được ưu tiên) đưa vào brief T01; R4, R5 và R6
  (GLOSSARY.md) vào backlog quản trị. **WP5-UX3-GOV đã nghiệm thu trên 79b9a53.**
- Đang chạy: WP5-UX3-GOV-ACCEPT (committer, chạy một mình; 28 đường dẫn handoff). T01 đã
  đăng ký ở trạng thái chờ (worker-high, sonnet), giao sau commit nghiệm thu.
- WP5-UX3-GOV-ACCEPT xong: 3968e15fe528bfbdf956a9b3c8aeaad8e348c57b trên main, đã push (28
  đường dẫn handoff; digest a682f153 không đổi; mọi bước kiểm exit 0; một lỗi nhỏ chuyển
  hướng ra null device).
- Đang chạy: WP5-UX3-T01 (worker-high, sonnet; token và bề mặt, mục visual standard của
  docs/04 gồm cả dòng 87, ghi chú E-8 ở docs/10) trên 3968e15 / a682f153.
- WP5-UX3-T01 xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): token vòng 3 ở bộ sáng và cả hai bộ tối; `--transition` khai báo ở quy tắc
  chung cho mọi phần tử với `--transition-duration` cục bộ, không dùng `all`; mỗi tuần là một
  thẻ `--elev-2` góc vuông, phần cuối bảng là một thẻ riêng, thanh công cụ và phần đầu biểu
  mẫu nằm trên nền trang; nút phụ chuyển sang `--accent-strong` khi hover (ngoài brief, để
  đạt 4.5:1 trên nền trang đậm hơn); chỉ đổi giá trị màu nền cũ trong theme.spec và logo.spec;
  thẻ trên nền 1.14 / 1.15; unit 2031; e2e đầy đủ desktop 229/0/29, mobile 245/0/13; ngân sách
  màn hình đầu 559.45 / 658.41 khi xem của mình, 611.45 / 710.41 khi có chia sẻ; verify 0;
  digest e9e8d117 (819 file). Ghi chú cho audit: khai báo transition ở quy tắc chung. Lỗi
  nhỏ: hai lệnh chỉ đọc dùng pipe head/tail hoặc chuyển hướng ra null device.
- Đã viết brief T02 (khối nhận diện, menu tài khoản, More, chữ thương hiệu) và đăng ký ở
  trạng thái chờ.
- Đang chạy: WP5-UX3-T01-FREEZE (committer, chạy một mình; 12 đường dẫn mã nguồn/tài liệu
  cùng 32 đường dẫn handoff).
- WP5-UX3-T01-FREEZE lần 1 dừng trước khi commit: `git diff --cached --check` exit 2 vì một
  dòng trống ở cuối file `tests/e2e/surfaces.spec.ts:242` (mã nguồn; committer không được
  sửa). 44 đường dẫn vẫn được stage; digest e9e8d117 khớp; precommit PASS.
- Đang chạy: WP5-UX3-T01 phụ lục 1 (cùng worker được tiếp tục): xóa dòng trống đó, kiểm các
  file khác của phần này xem có lỗi khoảng trắng, chạy lại spec, lint, verify và digest;
  không động vào index. Sau đó T01-FREEZE lần 2 với digest mới.
- T01 phụ lục 1 xong: chỉ xóa dòng trống cuối file; không còn lỗi khoảng trắng nào khác;
  surfaces.spec 26/26; lint 0; verify 0; digest a4f127cc (819 file); không động vào index.
- Đang chạy: WP5-UX3-T01-FREEZE lần 2 (committer, chạy một mình; 12 đường dẫn mã nguồn/tài
  liệu cùng 36 đường dẫn handoff, digest a4f127cc).
- WP5-UX3-T01-FREEZE lần 2 xong: e2f3d7492160d389c18903285994bedec56df51e trên main, đã push
  (48 đường dẫn; digest a4f127cc, 819 file; mọi bước kiểm exit 0). Lỗi nhỏ của coordinator
  đã ghi trên board (sửa mã agent trên board khi commit đang chạy).
- Đang chạy: WP5-UX3-T02 (worker-high, sonnet; khối nhận diện, menu tài khoản, More trên
  điện thoại, thanh menu máy tính bỏ Settings/Admin, chữ thương hiệu từ 1024px) trên
  e2f3d74 / a4f127cc.
- WP5-UX3-T02 xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): AccountMenu và accountModel (nút nhận diện, menu mở rộng, bàn phím, Escape
  và trả focus, nội dung More dùng chung); thanh menu máy tính chỉ còn Timesheet/Overtime/
  History; Administration vẫn trỏ `#/admin`, Profile trỏ `#/settings` cho tới T03; chữ thương
  hiệu từ 1024px, ẩn ở 1024-1279px khi có chia sẻ (khoảng cách và lề menu hẹp hơn ở khoảng đó
  để thanh vẫn một hàng); khẳng định trong 12 spec chuyển sang đi qua menu, có liệt kê; unit
  2045; e2e đầy đủ desktop 246/0/30, mobile 257/0/19; đột biến bị bắt; ngân sách màn hình đầu
  không đổi; verify 0; digest c938aa6f (822 file). Gói JS phía client đạt 502.77 kB (Vite cảnh
  báo 500 kB).
- Quyết định của coordinator: tách gói ở T03 (nạp chậm màn hình Administration và Import),
  không nâng giới hạn; các phần sau ghi kích thước gói; gate kiểm không còn cảnh báo. Đã viết
  brief T03 và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T02-FREEZE (committer, chạy một mình; 19 đường dẫn mã nguồn/test cùng 26
  đường dẫn handoff).
- WP5-UX3-T02-FREEZE xong: aa64999240ab0d5822ca371a0c8e24436d27f30a trên main, đã push (45
  đường dẫn; digest c938aa6f, 822 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T03 (worker-high, sonnet; trang con của Settings, Profile, route và
  chuyển hướng `#/admin`, nạp chậm màn hình Administration và Import) trên aa64999 / c938aa6f.
- WP5-UX3-T03 xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): routeModel, SettingsNav, ProfileScreen; `#/admin` chuyển sang
  `#/settings/admin` với admin, nhân viên quay về timesheet; nạp chậm Admin và Import (gói
  chính 502.77 -> 452.08 kB, hết cảnh báo); unit 2059; e2e đầy đủ desktop 256, mobile 267, 0
  lỗi; đột biến bị bắt; không có thay đổi server/domain; verify 0; digest e5b3faf9 (827 file).
  Sai lệch: nút "Try again" khi tải gói lỗi sẽ tải lại trang.
- Đã viết brief T04 và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T03-FREEZE (committer, chạy một mình; 15 đường dẫn mã nguồn/test cùng 28
  đường dẫn handoff).
- WP5-UX3-T03-FREEZE xong: 7cd8c592ba57d7f4a12013bacced948de0fb8c42 trên main, đã push (43
  đường dẫn; digest e5b3faf9, 827 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T04 (worker-high, sonnet; hàng tiêu đề có check in/out, nhãn kỳ gồm "in
  progress", hàng thông tin kỳ, hàng Open a day, giãn cách thanh công cụ, quy tắc màn hình
  hẹp) trên 7cd8c59 / e5b3faf9.
- WP5-UX3-T04 xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): hàm nhãn kỳ dựa trên dữ liệu kỳ của server ("in progress" xanh dương trong
  5 ngày cửa sổ; old hổ phách, current xanh lá, future hồng, trung tính xám); hàng tiêu đề có
  check in/out; thẻ kỳ hai hàng; hàng Open a day; giãn cách thanh công cụ; "Sign off" /
  "Current" khi hẹp; giao diện Today khi không hoạt động; unit 2065; e2e đầy đủ desktop
  267/0/30, mobile 274/0/23; đồng hồ giả lập 20/10, 26/10, 30/10 đều đạt; đột biến bị bắt;
  ngân sách màn hình đầu không đổi; gói chính 452.40 kB; verify 0; digest 025b46cf (827 file).
  Sai lệch: kiểm việc xuống dòng bằng tên múi giờ dài; chữ "Open a day" chỉ ẩn ở 320; vạch
  phân cách thanh công cụ từ 768px.
- Đã viết brief T05 và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T04-FREEZE (committer, chạy một mình; 11 đường dẫn mã nguồn/test cùng 38
  đường dẫn handoff).
- WP5-UX3-T04-FREEZE xong: 83c32d2fbc57af00ef251a06024b39e641a677ce trên main, đã push (49
  đường dẫn; digest 025b46cf, 827 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T05 (worker-high, sonnet; nhóm cột nổi, viền cột đang sửa và tô nền ô
  Day, tên Category/Status, hình "No times") trên 83c32d2 / 025b46cf.
- WP5-UX3-T05 xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): `liftRuns` theo từng tuần, cắt bóng ở cạnh trong, bo 4px ở góc ngoài; viền
  trong của cột đang sửa và tô nền ô Day (bỏ gạch chân và hai thanh bên); "Category"/"Status"
  trên màn hình; "No times" là vòng tròn gạch chéo; unit 2075; e2e đầy đủ desktop 275, mobile
  280, 0 lỗi; hai đột biến bị bắt; ngân sách màn hình đầu không đổi; gói chính 452.86 kB;
  verify 0; digest 23b394dd (827 file). Còn lại ngoài phạm vi: hình vuông "No times" trong
  reviewModel và chữ "label change" trong duyệt hàng loạt (chuyển sang T07), Label/Check trong
  docs/04 (T10); R-UX2A-4 kiểm bằng test mô phỏng (quét axe thật chuyển cho gate và audit vùng
  A).
- Đã viết brief T05B (Day editor nổi dưới 1360px) và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T05-FREEZE (committer, chạy một mình; 15 đường dẫn mã nguồn/test cùng 30
  đường dẫn handoff).
- WP5-UX3-T05-FREEZE xong: 699b1b304390ae556c89c6d3a9ee652a00da5182 trên main, đã push (45
  đường dẫn; digest 23b394dd, 827 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T05B (worker-high, sonnet; Day editor nổi dưới 1360px, độ rộng cột tối
  thiểu) trên 699b1b3 / 23b394dd.
- WP5-UX3-T05B xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): cột tối thiểu 108px; panel đứng cạnh bảng từ 1360px (trang rộng tối đa
  1600px khi đang sửa); từ 768 đến 1359px là panel nổi dạng modal có nền mờ nhẹ, nằm phía đối
  diện cột đang sửa; cột rộng 116.8 / 117.7 / 151.1px ở 1360 / 1366 / 1920; unit 2075; e2e
  đầy đủ desktop 281, mobile 280, 0 lỗi; đột biến bị bắt; ngân sách màn hình đầu không đổi;
  gói chính 453.27 kB; verify 0; digest a17a0ce8 (827 file). Sai lệch: từ 768 đến 899px thẻ
  tuần tự cuộn ngang bên trong; test pixel của nhóm cột nổi chạy ở 1445px vì cạnh cột lẻ pixel
  ở 1440.
- Quyết định của coordinator: danh sách điểm cần audit (quy tắc transition chung, màu hover,
  tải lại trang khi tải gói lỗi, quét axe thật, cuộn ngang trong thẻ ở 768-899px và khả năng
  có đường nối ở nhóm cột nổi tại độ rộng lẻ, thanh trên cùng hẹp lại ở 1024-1279px, chữ Open
  a day ở 360px) đưa vào brief của gate và audit.
- Đã viết brief T07 và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T05B-FREEZE (committer, chạy một mình; 6 đường dẫn mã nguồn/test cùng 25
  đường dẫn handoff).
- WP5-UX3-T05B-FREEZE xong: 5c0dad8e41fddc25306e8f2ff28424f815af32ef trên main, đã push (31
  đường dẫn; digest a17a0ce8, 827 file; mọi bước kiểm exit 0; một lỗi nhỏ `| head -0`).
- Đang chạy: WP5-UX3-T07 (worker-high, sonnet; phần đầu Day editor và các nhãn, thẻ phiên giờ,
  hộp xác nhận xóa, hàng WFH, "No times" ở Review và chữ "category change") trên 5c0dad8 /
  a17a0ce8.
- Chủ dự án báo chưa thấy câu hỏi nào (nguyên văn trên board); WP5-UX3-Q6 (giờ nghỉ trên điện
  thoại dạng hàng hay chip; nay khuyến nghị b, chỉ hiện ô ngày khi phiên qua đêm) và câu không
  bắt buộc về giờ 24h/AM-PM trên chip được hỏi lại riêng. Chỉ chặn T08B.
- WP5-UX3-T07 xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): phần đầu có nhãn, thẻ phiên giờ có bảng giờ nghỉ, "Confirm breaks", hộp
  ConfirmDialog dùng chung cho xóa, WFH cùng hàng Category, vòng tròn ở Review và chữ ở phần
  xem trước; unit 2091; e2e desktop 289, mobile 287, 0 lỗi; hai đột biến bị bắt; ngân sách màn
  hình đầu không đổi; gói chính 458.49 kB; verify 0; digest a3cbc3f4 (829 file). Còn mở: prop
  nhãn "in progress" cho editor (sang T08), ba chuỗi "label" trong duyệt hàng loạt (sang T09),
  dấu ngoặc tạo bằng CSS trong tên hộp thoại (điểm audit).
- Đã viết brief T08 (opus, size_risk) và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T07-FREEZE (committer, chạy một mình; 15 đường dẫn mã nguồn/test cùng 29
  đường dẫn handoff).
- WP5-UX3-T07-FREEZE xong: f8117a48cd856ee09494e54c64d6f09dbc20b234 trên main, đã push (44
  đường dẫn; digest a3cbc3f4, 829 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T08 (worker-high, opus, size_risk; hộp thoại phiên giờ, hàng giờ nghỉ,
  tự điền sẵn, thông báo G-4, xác nhận lưu và bỏ thay đổi, quy tắc hộp thoại lồng nhau, prop
  nhãn "in progress" cho editor) trên f8117a4 / a3cbc3f4.
- Chủ dự án đã trả lời (nguyên văn trên board): WP5-UX3-Q6 là b (chỉ hiện ô ngày của giờ nghỉ
  khi phiên qua nửa đêm hoặc chưa có giờ kết thúc) và chip dùng giờ 24h. Quyết định của
  coordinator: không đổi phạm vi T08 khi đang chạy; T08B áp dụng quy tắc này ở mọi độ rộng và đo
  lại ngưỡng chuyển sang chip. Vòng này không còn câu hỏi nào đang mở.
- WP5-UX3-T08 xong (worker-high, tự báo claude-opus-5-5; kết quả tự báo, chưa phải bằng chứng
  độc lập): SessionDialog và BreakRows (xóa SessionForm.tsx, giữ BreaksEditor cho T09); tự điền
  sẵn; thông báo "No breaks listed" ba lựa chọn, luôn có "Save this session?"; "Discard your
  changes?"; quy tắc hộp thoại lồng nhau; nhãn "in progress" trong editor; unit 2091; e2e đầy
  đủ desktop 298, mobile 292, 0 lỗi; đồng hồ giả lập ở giờ lùi, giờ tiến và trước nửa đêm đều
  đạt; ba đột biến bị bắt; ngân sách màn hình đầu không đổi; gói chính 477.22 kB; verify 0;
  digest tạm da580f1e (830 file). Sai lệch: `suggestionRows` viết trong SessionDialog, chưa có
  unit test (chuyển vào model ở T08B); "Confirm breaks" khi không có giờ nghỉ gợi ý phù hợp nay
  hỏi qua thông báo (chấp nhận, điểm audit vùng B).
- Đã viết brief T08B (quy tắc ô ngày theo Q6 b, chip và hộp thoại con, khoảng cách trên điện
  thoại, hàm model) và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T08-FREEZE (committer, chạy một mình; 10 đường dẫn mã nguồn/test gồm một
  file bị xóa, cùng 35 đường dẫn handoff; digest kiểm sau khi stage).
- WP5-UX3-T08-FREEZE xong: 1a33c574ee6f5ec5d02008e6077eb4e8b2ce3415 trên main, đã push (45
  đường dẫn; digest sau khi stage và trên HEAD là da580f1e, 830 file, khớp digest tạm; mọi bước
  kiểm exit 0; một lỗi nhỏ chuyển hướng ra null device sau khi push).
- Đang chạy: WP5-UX3-T08B (worker-high, sonnet; quy tắc ô ngày theo Q6 b, chip và hộp thoại
  con "Break n", khoảng cách trên điện thoại, chuyển suggestionRows vào model) trên 1a33c57 /
  da580f1e.
- WP5-UX3-T08B xong (worker-high, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng
  chứng độc lập): ô ngày của giờ nghỉ chỉ hiện với phiên qua đêm hoặc chưa có giờ kết thúc, các
  dòng theo ngày của phiên; dòng cùng ngày vừa tới 268px (mọi điện thoại), dòng qua đêm vừa tới
  390px, hẹp hơn thì là chip có hộp thoại con "Break n"; unit 2126; e2e đầy đủ desktop 305,
  mobile 299, 0 lỗi; đồng hồ giả lập ở giờ lùi và giờ tiến đều đạt; hai đột biến bị bắt; ngân
  sách màn hình đầu không đổi; gói chính 484.15 kB; verify 0; digest dd620f70 (834 file). Hộp
  thoại phiên mới với ba giờ nghỉ gợi ý ở 390x844 phải cuộn 297px (thanh nút dưới cùng cố định):
  đưa vào điểm audit. Lỗi nhỏ: một heredoc, một `| head -0`, hai lần đọc `tail -c`.
- Đã viết brief T09 và đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T08B-FREEZE (committer, chạy một mình; 10 đường dẫn mã nguồn/test cùng 31
  đường dẫn handoff).
- WP5-UX3-T08B-FREEZE xong: f89573b89435b651f5d7cdca7811b972a82087bc trên main, đã push (41
  đường dẫn; digest dd620f70, 834 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T09 (worker-high, sonnet; hộp thoại Check out dùng dòng giờ nghỉ mới với
  E-1, xóa BreaksEditor nếu không còn dùng, chữ "category" trong duyệt hàng loạt) trên f89573b /
  dd620f70.
- WP5-UX3-T09 bàn giao lần đầu (tự báo claude-sonnet-5-5): Check out dùng BreakRows với E-1
  (tick ô: `breaks: []` đã xác nhận; có dòng: xác nhận và thay; danh sách trống không tick: bỏ
  `breaks`); xóa BreaksEditor.tsx; unit 2126; e2e đầy đủ 614/0/66; đột biến bị bắt; verify 0;
  digest tạm 2038dfc7 (833 file). Còn lại: hai chuỗi duyệt hàng loạt trong BatchDialog.tsx
  (khẳng định trong keyboard-access.spec.ts) và câu gợi ý "Saving" trong Check out. Đã viết brief
  T10.
- Đang chạy: T09 phụ lục 1 (cùng worker; mở rộng đường dẫn sở hữu đúng cho hai điểm đó), rồi e2e
  đầy đủ, verify và digest tạm mới.
- T09 phụ lục 1 xong: hai chuỗi duyệt hàng loạt ghi "category" (BatchDialog.tsx, khẳng định trong
  keyboard-access.spec.ts:382); câu gợi ý "Checking out ..." trong hộp thoại Check out; unit 2126;
  e2e đầy đủ 614/0/66; verify 0; digest tạm 1fc57bce (833 file). Còn hai chú thích trong code ghi
  "new label" (schemas.ts phía server và api.ts phía client; người dùng không thấy; giữ nguyên).
- Đã viết brief gate WP5-UX3-GATE (điền đích sau khi đóng băng T10); T10 đăng ký ở trạng thái chờ.
- Đang chạy: WP5-UX3-T09-FREEZE (committer, chạy một mình; 9 đường dẫn mã nguồn/test gồm việc xóa
  BreaksEditor.tsx, cùng 29 đường dẫn handoff; digest kiểm sau khi stage).
- WP5-UX3-T09-FREEZE xong: 4b5403dbd4a6bbe4fe46925fa6129ad7f1c93a56 trên main, đã push (38 đường
  dẫn; digest sau khi stage và trên HEAD là 1fc57bce, 833 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-T10 (worker, sonnet; docs/04, 10, 12 EN và VI, câu quy tắc mới U-23, rà chữ
  cũ còn sót) trên 4b5403d / 1fc57bce. Lần đóng băng của nó là lần đóng băng cuối của gói.
- WP5-UX3-T10 xong (worker, tự báo claude-sonnet-5-5; kết quả tự báo, chưa phải bằng chứng độc
  lập): docs/04, docs/10 và docs/12 (EN và VI) mô tả vòng 3; câu quy tắc U-23 đặt nguyên văn ở
  docs/04 dòng 16 và thay mệnh đề trong docs/10; đã kiểm ghi chú E-8 của T01; rà và sửa tên cũ
  còn sót (giữ các mục lịch sử); số đếm song ngữ khớp; preflight PASS; verify 0; digest 29ac2594
  (833 file).
- Đã cập nhật `next_role` trong STATE và NEXT_ACTION (EN/VI) (các phần đã xong; tiếp theo là gate
  và audit). Gate, audit vùng A và B và audit tích hợp đã đăng ký ở trạng thái chờ cùng brief.
- Đang chạy: WP5-UX3-T10-FREEZE (lần đóng băng cuối gói; committer, chạy một mình; 6 file tài
  liệu cùng 20 đường dẫn handoff). Sau đó WP5-UX3-GATE trên commit đó; khi gate ghi digest mới,
  bản PASS hiện tại của WP5 (WP5-UX2-AUDIT2) và mọi audit trỏ tới nó được gắn superseded_by
  WP5-UX3-AUDIT-INT.
- WP5-UX3-T10-FREEZE xong (đóng băng cuối gói): cecfceb61c7f15216c8f188e8b7059c9f075247d trên
  main, đã push (26 đường dẫn; digest 29ac2594, 833 file; mọi bước kiểm exit 0).
- Đang chạy: WP5-UX3-GATE (verifier, sonnet; gate cuối gói) trên cecfceb / 29ac2594: các mục gate
  WP5 kèm kiểm thử container, server và domain giống từng byte bản a643794, phạm vi vòng, đồng hồ
  giả lập ở mười thời điểm, các kiểm riêng của vòng gồm các phép đo điểm audit và một lần quét axe
  thật.
- WP5-UX3-GATE FAIL (verifier, tự báo claude-sonnet-5-5; NAS chưa kiểm) trên cecfceb / 29ac2594
  (ba dạng digest khớp): mọi mục khác đều đạt (verify 2126, e2e đồng hồ thật 614/0/66, AC-13,
  kiểm thử container 208 PASS, dist/server và dist/domain giống từng byte a643794, phạm vi, CSP,
  độ tương phản, thanh trên cùng, quy tắc panel nổi). Lý do FAIL: (1) `timesheet.spec.ts:807`
  hỏng vào các ngày thứ Ba (hai cột kề nằm ở hai tuần khác nhau) và một lỗi chập chờn khi tạo
  dữ liệu ở `:452` trên điện thoại (409); (2) focus bàn phím bị che trong vùng cuộn ngang của thẻ
  tuần ở 768-899px; (3) axe: hai lỗi label-content-name-mismatch và một lỗi target-size dưới menu
  tài khoản đang mở. Đo thêm: bóng của nhóm cột nổi có vết khuyết mờ ở chỗ nối; hộp thoại phiên giờ
  390x844 phải cuộn 297/259px, ô đầu và thanh nút vẫn hiện.
- Quyết định của coordinator: một vòng sửa. Chạy song song: WP5-UX3-FIX1 (worker-high, opus,
  size_risk; bảy mục) và WP5-UX3-SWEEP (planner, opus, chỉ đọc trên bản xuất sạch của cecfceb;
  rà lỗi kiểu audit cho vùng A và B, trừ các mục của FIX1). Sau đó FIX2 cho các lỗi rà được (nếu
  có), các lần đóng băng, WP5-UX3-REGATE và các audit.
- WP5-UX3-SWEEP xong (planner, tự báo claude-opus-5-5; chỉ đọc): 2 mức trung bình (mất focus sau
  khi chọn một mục menu tài khoản; đột biến M18, quy tắc ngày đã qua theo ngày của máy, không bị
  test bắt), 6 mức nhẹ (nhãn kỳ trong editor khi mở ngày đang diễn ra qua Open a day; chữ "day
  label"; cách khắc phục Check out trong docs/12; số kích thước gói trong docs/10; đột biến M21 về
  múi giờ ở Profile không bị bắt; hộp thoại Check out không hỏi bỏ thay đổi), 5 ghi chú; dữ liệu gửi
  đi, các nhánh breaks_confirmed, không gửi gì khi Cancel/Discard/Done, điền sẵn theo ngày server và
  Escape/focus của các hộp thoại đều sạch; 22 đột biến, bắt được 20.
- Quyết định của coordinator: WP5-UX3-FIX2 (worker-high, sonnet) sau lần đóng băng FIX1 xử lý các
  mục 1-11 và 13 (Check out có câu hỏi bỏ thay đổi theo U-26); mục 12 (trường hợp E-1 chỉ qua API)
  được chấp nhận và thêm vào điểm audit vùng B. FIX2 đã đăng ký ở trạng thái chờ.
- WP5-UX3-FIX1 xong (worker-high, tự báo claude-opus-5-5): test cột nổi giữ cột kề trong cùng
  tuần với ngày đang mở; dữ liệu mẫu của test phiên bản cũ dùng phiên bản hiện tại; focus trong
  thẻ tuần luôn được cuộn vào tầm nhìn đầy đủ ở 768-899px; tên truy cập của ô chọn Category và chip
  giờ nghỉ chứa đúng chữ hiển thị; một lớp bóng chung cho cả nhóm cột xóa vết khuyết (dưới chỗ nối
  22.5-24.3/255 trước, 2.1-2.8 sau); mục target-size của menu tài khoản được giải trình (62 trên
  73 độ rộng chồng lên một điều khiển). Unit 2130 đạt, e2e đầy đủ 0 lỗi; digest e4659145 (833
  file).
- WP5-UX3-FIX1-FREEZE xong: 9187f31bee9c092041887d3ab034c492e33da0b5 trên main, đã push (348
  file: 11 mã nguồn/test, 12 bản ghi task và file board, 325 file bằng chứng; digest e4659145,
  833 file, trên HEAD cũng vậy; mọi kiểm tra trả về 0). Sơ suất: một lần chuyển hướng từ
  here-document rỗng vào một file nháp.
- WP5-UX3-FIX2 bàn giao lần đầu (worker-high, tự báo claude-sonnet-5-5): đã sửa các mục 1-11 và
  13 (focus sau khi chọn mục menu tài khoản, M18 và M21 nay bị test bắt, nhãn kỳ trong editor
  theo kỳ của chính ngày đó, chữ "category", docs/10 và docs/12, câu hỏi bỏ thay đổi ở Check out,
  xóa helper không dùng và chuyển các kiểm tra đối chiếu sang test khác, hover có điều kiện, liên
  kết dòng gợi ý). Unit 2131; e2e đầy đủ 0 lỗi (desktop 317, mobile 310); cả hai đồng hồ giả lập 0
  lỗi; gói chính 487.17 kB; verify 0; digest 65a2296e (833 file). docs/04 còn thiếu câu về hỏi bỏ
  thay đổi và quy tắc focus của menu tài khoản: Addendum 1 mở rộng phạm vi của worker sang cặp
  docs/04 cho đúng hai điểm này.
- WP5-UX3-FIX2 xong sau Addendum 1: chỉ cặp docs/04 thay đổi (dòng 7 quy tắc focus của menu tài
  khoản, dòng 70 câu hỏi bỏ thay đổi ở Check out, cả EN và VI); khớp bản dịch, preflight PASS, unit
  2131, verify 0; digest 262138e0 (833 file); 27 đường dẫn thay đổi ngoài handoff (13 client, 2
  test unit, 6 e2e, 6 docs).
- Đã soạn nháp brief WP5-UX3-REGATE (chạy lại mọi mục của gate lần 1, xác nhận các lý do FAIL đã
  khắc phục, kiểm các hành vi của FIX2); commit đích và digest điền sau lần đóng băng. Đã đăng ký ở
  trạng thái chờ.
- WP5-UX3-FIX2-FREEZE xong: 7ce4e95a0c4477374e981132d93b11aedab2e384 trên main, đã push (66 file;
  digest 262138e0, 833 file, trên HEAD cũng vậy; mọi kiểm tra trả về 0; không báo sơ suất nào).
- Đang chạy: WP5-UX3-REGATE (verifier, sonnet) trên 7ce4e95 / 262138e0. Sau đó các audit độc lập A
  và B nhắm lại vào lần gate này, AUDIT-INT và nghiệm thu lại WP5.
- Trong lúc chạy lại gate, các brief AUDIT-A, AUDIT-B và AUDIT-INT đã được nhắm lại vào 7ce4e95 /
  262138e0 và WP5-UX3-REGATE, mỗi brief thêm một mục cho vòng sửa, cùng dải cổng mới (A
  48940-48969, B 48970-48999). Các mục trên board chỉ được nhắm lại sau khi gate chạy lại đạt PASS.
- WP5-UX3-REGATE xong (verifier, tự báo claude-sonnet-5-5): PASS (các mục NAS NOT VERIFIED) trên
  7ce4e95 / 262138e0, digest bằng nhau ở cả ba dạng trước và sau.
  - Mọi lý do FAIL của lần 1 đều đã khắc phục: các lần chạy vào thứ Ba và cả hai lần ngày 28/11
    đều 0 lỗi; 48 lượt đi phím ở 768-899px, không vòng focus nào bị che; axe (a) và (b) đã hết,
    (c) đúng như phần giải trình.
  - e2e theo đồng hồ thật: 627 đạt, 0 lỗi; verify 2131; drill 208 PASS; server và domain giống
    hệt từng byte so với a643794; các hành vi của FIX2 đều đúng.
  - Điểm lệch: lần chạy FULL đầu tiên ở mốc 31/12 23:30 hỏng hai test mobile do timeout
    (theme.spec.ts:413, timesheet.spec.ts:1799). Chạy lại thì đạt, và chạy riêng thì cả hai
    test đạt 15/15. Phần cắt ảnh kiểm vết nối ở DPR 2 không được làm lại.
- Quyết định của coordinator: ghi nhận PASS kèm điểm lệch này. AUDIT-A (agent mới) đánh giá hai
  test đó khi chạy dưới tải và làm lại phần kiểm vết nối ở DPR 2; nếu nguyên nhân nằm ở test hoặc
  sản phẩm thì kết luận là FIX REQUIRED. current_source_digest là 262138e0. WP5-UX2-AUDIT2 và bảy
  audit từng trỏ tới nó nay trỏ tới WP5-UX3-AUDIT-INT. Các mục audit trên board đã được nhắm lại
  vào 7ce4e95 và lần gate chạy lại này.
- Đang chạy: WP5-UX3-AUDIT-A và WP5-UX3-AUDIT-B (auditor mới, opus/xhigh, chỉ đọc, song song).
- WP5-UX3-AUDIT-B xong (tự báo claude-opus-5-5): FIX REQUIRED với hai lỗi mức Low.
  - F-UX3B-1 (mục 12 của đợt rà): khi một phiên đang chạy đã có dòng nghỉ lưu sẵn nhưng chưa xác
    nhận (trạng thái chỉ tạo được qua API), nếu xóa hết các dòng trong hộp thoại Check out thì
    hộp thoại hiện danh sách rỗng nhưng server vẫn giữ các dòng đó (hoặc trả lỗi 422). Hộp thoại
    không hề nói điều này.
  - F-UX3B-2: "Confirm breaks" chỉ liệt kê giờ nghỉ gợi ý khi tất cả đều nằm trong phiên; docs/04
    dòng 65 lại nói nó liệt kê những giờ nghỉ nằm trong phiên.
  - Mọi phần khác của vùng B đều đạt: tính toàn vẹn của dữ liệu gửi đi (25 trường hợp), ngữ
    nghĩa xác nhận, điền sẵn, số liệu, hộp thoại, điện thoại, các mục của vòng sửa, 13/13 đột
    biến bị bắt. e2e đầy đủ 627 đạt, 0 lỗi; digest 262138e0 trước và sau.
  - Các rủi ro tùy chọn R-UX3B-1..7 nằm trong bản review.
- AUDIT-A vẫn đang chạy. Vòng sửa sẽ được quyết sau khi audit này xong, để một lần sửa bao luôn cả
  hai vùng.
- WP5-UX3-AUDIT-A xong (tự báo claude-opus-5-5): FIX REQUIRED.
  - F-UX3A-01, mức trung bình: vòng focus biến mất khi con trỏ chuột nằm trên nút ngày của bảng
    và mờ đi trên ô chọn Category. Lỗi này cũng xảy ra sau khi nhấn Escape để quay về từ editor,
    và đã có từ a643794.
  - F-UX3A-02..06, mức Low:
    - các luật hover chưa gắn điều kiện;
    - nút tài khoản chỉ cao 38px khi dùng con trỏ thô;
    - biểu tượng Sign out dính sát chữ;
    - việc Escape trả focus ở bảng More chưa có test (đột biến A4 không bị bắt);
    - bảng Administration trên điện thoại cuộn ngang khi có nhãn trạng thái giao dài (axe mức
      nghiêm trọng).
  - Mục 11: hai lần timeout của lần gate chạy lại là nhiễu do tải (một lần máy khựng 21 giây;
    125/125 lần đạt trong năm lần chạy đầy đủ).
  - Vết nối ở DPR 2 sạch.
  - Các kiểm tra bắt buộc: e2e đầy đủ 627 đạt, 0 lỗi; digest 262138e0 trước và sau.
- Quyết định của coordinator: một task sửa WP5-UX3-FIX3 (worker-high, sonnet) cho F-UX3A-01..06
  và F-UX3B-1..2, cùng R-UX3B-3, R-UX3B-4, R1 (tài liệu) và R8 (thời gian chờ của test).
  - F-UX3B-1: khi người dùng xóa hết các dòng nghỉ đã lưu, Check out gửi danh sách rỗng chưa xác
    nhận để thay các dòng đó, nên những gì hộp thoại hiện đúng bằng những gì được lưu. Khi lúc
    mở không có dòng nào đã lưu thì vẫn bỏ trống danh sách (E-1).
  - F-UX3B-2: code làm theo docs/04 dòng 65 (liệt kê các giờ nghỉ gợi ý nằm trong phiên).
  - Không sửa server.
  - Sau FIX3: FIX3-FREEZE, WP5-UX3-REGATE2, các audit mới AUDIT-A2 và AUDIT-B2, rồi AUDIT-INT.
- Đang chạy: WP5-UX3-FIX3.
- WP5-UX3-FIX3 xong (worker-high, tự báo claude-sonnet-5-5): xong cả mười hai mục.
  - Vòng focus dưới con trỏ chuột (bốn điều khiển); gắn điều kiện cho bảy luật hover, kèm một test
    quét toàn bộ; nút tài khoản cao 44px với con trỏ thô; Sign out dùng flex; test Escape ở bảng
    More (bắt được A4); bảng Administration trên điện thoại xuống dòng.
  - Check out gửi danh sách rỗng chưa xác nhận khi người dùng đã xóa hết các dòng đã lưu. Server
    đã được kiểm trước, và hộp thoại hiện một ghi chú.
  - "Confirm breaks" liệt kê các giờ nghỉ gợi ý nằm trong phiên.
  - Sửa chữ và tài liệu; theme.spec.ts có thêm thời gian chờ và cơ chế thử lại khi máy khựng.
  - Unit 2141; e2e đầy đủ 645 đạt, 0 lỗi; cả hai đồng hồ giả lập 0 lỗi; theme x5 380 đạt; các
    đột biến đều bị bắt; gói chính 486.81 kB; verify 0; digest d1d903cf (833 file; 20 đường dẫn
    thay đổi).
- Trước khi commit: thư mục bằng chứng của WP5-UX3-REGATE còn bốn file `.log`, không phải `.txt`
  và không được nhắc đến ở đâu. Đã nhờ chính verifier của lần gate đó chuyển chúng thành `.txt`
  LF đã che dữ liệu (hoặc xóa nếu trùng y hệt file khác) và ghi lại việc này. Sau đó là
  WP5-UX3-FIX3-FREEZE.
- Đã dọn bằng chứng: không file nào trùng với file khác. Mỗi file được chép thành bản `.log.txt` LF
  (không có gì cần che) và bản gốc đã bị xóa. Việc này được ghi trong phần Results của REGATE;
  kết luận không đổi.
- Đang chạy: WP5-UX3-FIX3-FREEZE (committer, sonnet; 20 đường dẫn của FIX3, các bản ghi, các cặp
  review và năm thư mục bằng chứng).
- WP5-UX3-FIX3-FREEZE xong: a78ada5edbf5339d4502df57e9f195d11c0b5d28 trên main, đã push.
  - 550 file: 20 ngoài handoff, 14 bản ghi, 516 file bằng chứng.
  - Digest d1d903cf (833 file), trên HEAD cũng vậy.
  - Mọi kiểm tra trả về 0; precommit không phát hiện gì.
- Đang chạy: WP5-UX3-REGATE2 (verifier, sonnet) trên a78ada5 / d1d903cf.
  - Chạy lại các mục 1, 2, 3, 5 và 6 của gate.
  - Đợt quét theo đồng hồ giả lập rút gọn, vì FIX3 không đổi phép tính thời gian nào: 5 mốc chạy
    FULL (gồm cả hai lần đổi giờ mùa) và 4 mốc chạy năm spec.
  - Đo để xác nhận từng lỗi của audit đã khắc phục.
  - Quét axe đầy đủ.
- Sau đó là các audit kiểm lại mới AUDIT-A2 và AUDIT-B2, rồi AUDIT-INT.
- Trong lúc REGATE2 chạy:
  - Đã soạn brief cho hai audit kiểm lại WP5-UX3-AUDIT-A2 và WP5-UX3-AUDIT-B2. Mỗi brief gồm: xác
    nhận các lỗi đã khắc phục, kiểm hồi quy từ phần thay đổi của FIX3, ít nhất sáu đột biến và
    các kiểm tra bắt buộc; dải cổng A2 49080-49109, B2 49110-49139.
  - Brief AUDIT-INT đã được nhắm lại vào a78ada5 / d1d903cf, REGATE2, A2 và B2 (cổng
    49140-49159).
  - Các mục trên board chỉ được đăng ký sau khi REGATE2 đạt PASS.

### Tạm dừng vì usage (2026-10-16)

- Chủ dự án yêu cầu tạm dừng vì usage sắp hết. Coordinator đã dừng WP5-UX3-REGATE2 lần 1
  (agent afc3cf1073f2699f5) bằng TaskStop khi đang chạy dở.
- Trạng thái board:
  - mission ở `paused_usage`;
  - WP5-UX3-REGATE2 ở `interrupted`, kèm ghi chú `interruption`;
  - next_task_id là WP5-UX3-REGATE2;
  - current_source_digest vẫn là 262138e0. Nó chỉ thành d1d903cf khi REGATE2 đạt PASS.
- Commit đã push gần nhất: a78ada5edbf5339d4502df57e9f195d11c0b5d28 (WP5-UX3-FIX3-FREEZE;
  digest d1d903cf, 833 file). Không có commit nào nằm ở máy mà chưa push.
- Bản ghi coordinator chưa commit kể từ a78ada5 (đều nằm trong `handoff/`):
  - sửa: `delivery/ORCHESTRATION.json`, `delivery/STATE.json`, cặp checkpoint này,
    `NEXT_ACTION.md` và `.vi.md`, `delivery/tasks/WP5-UX3-FIX3-FREEZE.md` (kết quả của
    committer), `delivery/tasks/WP5-UX3-AUDIT-INT.md` (đã nhắm lại);
  - mới: `delivery/tasks/WP5-UX3-REGATE2.md` (brief; có thể có Results dở dang của lần 1),
    `delivery/tasks/WP5-UX3-AUDIT-A2.md`, `delivery/tasks/WP5-UX3-AUDIT-B2.md`,
    `delivery/evidence/WP5-UX3-FIX3-FREEZE/` (`checks.txt`, `commit-message.txt`), và có thể
    cả thư mục `delivery/evidence/WP5-UX3-REGATE2/` dở dang.
  - Commit checkpoint được hoãn: lần commit đóng băng hoặc nghiệm thu tiếp theo sẽ mang theo
    các bản ghi này. Bằng chứng dở dang của REGATE2 chỉ được commit nếu mọi tên file kết thúc
    bằng `.txt` hoặc `-synthetic.png`.
- Những thứ có thể còn sót lại từ verifier bị dừng (chưa rõ, cần đối soát):
  - tiến trình Playwright, server hoặc trình duyệt trên các cổng 49040-49079;
  - thư mục task `D:\.claude-tmp\timesheet\WP5-UX3-REGATE2` (bản xuất, kết quả build);
  - project Docker compose `ts-wp5-ux3regate2` và image drill của nó.

  Không có thay đổi nào ở mã nguồn, tài liệu hay test: verifier không bao giờ sửa chúng.
- **Các bước khi resume** (theo RESUME.md và docs/08):
  1. Mở bằng `claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`, hoặc mở phiên mới với
     prompt khởi đầu.
  2. Giao một verifier đối soát:
     - `git status --short` (chỉ có các bản ghi ở trên);
     - digest của working tree là d1d903cf;
     - HEAD = origin/main = a78ada5;
     - không còn tiến trình nào của REGATE2;
     - `docker ps --all --filter name=ts-wp5-ux3regate2` rỗng (nếu còn thì xóa project đó và
       image drill của nó theo đúng tên);
     - liệt kê bằng chứng dở dang.
  3. Chạy lại WP5-UX3-REGATE2 (lần 2) bằng một verifier mới với cùng brief. Results dở dang
     của lần 1 được giữ làm lịch sử dưới mục "Attempt 1 (interrupted)".
  4. Nếu PASS:
     - đặt current_source_digest thành d1d903cf;
     - đăng ký WP5-UX3-AUDIT-A2 và -B2 rồi giao chạy song song (auditor opus mới; đã có
       brief);
     - nhắm lại mục WP5-UX3-AUDIT-INT trên board vào a78ada5 / d1d903cf và vào REGATE2, A2,
       B2.
  5. Sau đó là AUDIT-INT và nghiệm thu lại WP5 (định danh trong pilot packet, WP5_HANDOFF
     EN/VI, STATE, NEXT_ACTION, commit nghiệm thu, board trở về `software_ready`).

### Đã resume (2026-10-19)

- Chủ dự án đã resume phiên (cùng session ID của coordinator). Trạng thái mission trên board
  trở lại `running`.
- AGENTS.md trên đĩa đã thay đổi trong lúc tạm dừng. File giờ bắt đầu bằng tiêu đề "AI
  Instruction", phần Operating Contract và Prime Directive; các mục hướng dẫn dự án 1-13 và mục
  UI về nội dung không đổi. Coordinator không tự kiểm git, nên bước đối soát sẽ tìm hiểu thay
  đổi này đã được commit chưa, do ai làm, và AGENTS.vi.md cùng preflight có còn khớp không.
- Đang chạy: bước đối soát chỉ đọc WP5-UX3-RESUME-RECON (verifier, sonnet; nằm trong
  `auxiliary_lookups` của board). Việc ghi duy nhất của nó là xóa phần Docker còn sót của
  REGATE2, nếu có.
- WP5-UX3-RESUME-RECON xong.
  - HEAD = origin/main = a78ada5; không có commit nào sau đó. Các thay đổi trong handoff đúng
    là các bản ghi đã liệt kê ở mục tạm dừng.
  - Ngoài handoff/, chỉ có AGENTS.md bị sửa và chưa commit: thêm 48 dòng (tiêu đề AI
    Instruction, Operating Contract, Prime Directive), các mục 1-13 và mục UI không đổi.
    AGENTS.vi.md, các file CLAUDE, `.claude/` và docs/08 không đổi.
  - Digest working tree là 54cb9a3d, digest của HEAD là d1d903cf; khác nhau chỉ ở AGENTS.md.
  - Cả hai validator trả về 0.
  - Không còn tiến trình hay đối tượng Docker nào sót lại; REGATE2 lần 1 không để lại Results
    hay bằng chứng.
- Câu hỏi cho chủ dự án WP5-UX3-Q7 (`open_owner_question_ux3_q7` trên board): đưa nội dung mới
  của AGENTS.md vào repo trước khi chạy lại gate (kèm bản dịch AGENTS.vi.md), giữ nó ở máy,
  hay để chủ dự án tự xử lý. Có thêm một câu hỏi phụ về dòng nói đến bản tiếng Việt của
  runbook. Mission đang ở `blocked` chờ câu trả lời, vì commit đích của gate phụ thuộc vào nó.
- Chủ dự án đã trả lời WP5-UX3-Q7 (nguyên văn trên board): chọn (a). Dòng về runbook theo quy
  ước `.vi.md`, và các cụm từ thuộc dự án khác ("shop-floor", "step type", "probe kind",
  "manifest key" và tương tự) bị xóa.
- Quyết định của coordinator: chạy chuỗi GOV, vì AGENTS.md là file quản trị.
  1. WP5-UX3-GOV2 (worker, sonnet) sửa AGENTS.md và dịch AGENTS.vi.md.
  2. WP5-UX3-GOV2-FREEZE commit thay đổi này cùng các bản ghi handoff đang chờ.
  3. WP5-UX3-GOV2-GATE chạy trên commit đó.
  4. Sau đó GOV2-AUDIT (opus, agent mới) và REGATE2 lần 2 chạy song song.
  REGATE2, A2, B2 và INT được nhắm lại vào commit đóng băng GOV2, còn các bản ghi nghiệm thu
  GOV đi kèm lần commit WP5 tiếp theo.
- Đang chạy: WP5-UX3-GOV2. Trạng thái mission đã trở lại `running`.
- WP5-UX3-GOV2 xong (worker, tự báo claude-sonnet-5-5).
  - Dòng về runbook nay theo quy ước `.vi.md`.
  - Đã xóa: "shop-floor aware"; "step type", "task mode", "probe kind", "template variable"
    và "manifest key"; "CI run". "CI evidence" đổi thành "recorded evidence", vì repo không có
    CI.
  - Giữ lại, có bằng chứng Grep: production accuracy, host check, deployment, migration,
    release, recoverability, consumer need, public API, ADR.
  - Đã dịch AGENTS.vi.md: mỗi file có 9 tiêu đề.
  - Từ mục 1-13 đến cuối file giống từng byte so với a78ada5.
  - Các validator PASS; digest b35dddd5 (833 file).
- Đang chạy: WP5-UX3-GOV2-FREEZE (committer, chạy một mình).
- WP5-UX3-GOV2-FREEZE xong: ceb86b6b18bd0e8fabd93f47672cd87f3899b92f trên main, đã push.
  - 21 đường dẫn: cặp AGENTS cùng các bản ghi handoff đang chờ.
  - Digest b35dddd5 (833 file), trên HEAD cũng vậy.
  - Mọi kiểm tra trả về 0.
- Đang chạy song song (hai verifier chỉ đọc):
  - WP5-UX3-GOV2-GATE (sonnet) trên ceb86b6;
  - WP5-UX3-REGATE2 lần 2 (sonnet), đã nhắm lại vào ceb86b6 / b35dddd5.
- Sau đó: GOV2-AUDIT (opus, agent mới) sau gate GOV; các audit kiểm lại A2 và B2 sau khi REGATE2
  đạt PASS, với brief nhắm lại vào ceb86b6 / b35dddd5.
- Trong lúc các gate chạy:
  - Các brief AUDIT-A2, AUDIT-B2 và AUDIT-INT đã được nhắm lại vào ceb86b6 / b35dddd5.
  - Đã soạn brief WP5-UX3-GOV2-AUDIT: độ trung thành với ý chủ dự án, tính nhất quán với các mục
    1-13, docs/08, CLAUDE và các prompt, bản dịch, phạm vi và định dạng, và các validator.
    Audit này không chạy e2e.
- WP5-UX3-GOV2-GATE xong: PASS trên ceb86b6 / b35dddd5.
  - Phạm vi: đúng cặp AGENTS.
  - Các chỗ sửa theo ý chủ dự án đã có.
  - Phần sau tiêu đề Project instructions giống từng byte so với a78ada5.
  - Bản dịch EN/VI khớp nhau.
  - Các validator và verify đều đạt (2141 test).
- Đang chạy song song: WP5-UX3-GOV2-AUDIT (opus, agent mới) và WP5-UX3-REGATE2 lần 2.
- WP5-UX3-GOV2-AUDIT xong: PASS trên ceb86b6 / b35dddd5, không có lỗi nào. WP5-UX3-GOV2 đã được
  nghiệm thu.
  - Auditor dựng lại nguyên văn bản gốc của chủ dự án và xác nhận worker chỉ sửa đúng các mục đã
    nêu.
  - Việc xóa "CI" được chấp nhận.
  - Không có mâu thuẫn với các mục 1-13, docs/08, CLAUDE hay các prompt.
  - Rủi ro:
    - R1 (ghi chú cho chủ dự án): "template variable" và "manifest key" có tồn tại trong dự án
      này (template email, manifest của bản sao lưu), nhưng việc xóa làm đúng theo lời chủ dự án.
    - R2: giữ lại "production accuracy".
    - R3-R5 và R8 đưa vào backlog quản trị.
    - R9: các agent trong phiên này nhận bản AGENTS.md được nạp sẵn là bản chưa sửa của chủ dự
      án, nên brief phải ghi rõ bản trên đĩa mới là bản có hiệu lực.
- Vẫn đang chạy: WP5-UX3-REGATE2 lần 2.
- WP5-UX3-REGATE2 lần 2 xong: PASS trên ceb86b6 / b35dddd5. NAS, các script kiểm vết nối ở DPR 2
  và các trình duyệt ngoài Chromium là NOT VERIFIED.
  - e2e theo đồng hồ thật 645 đạt / 0 lỗi; 2141 test unit; drill 208 PASS.
  - dist/server và dist/domain giống từng byte so với a643794.
  - 5 lần chạy FULL và 5 lần chạy năm spec theo đồng hồ giả lập, 0 lỗi. Một lỗi buffer ở lần
    chạy đầu ngày 28/11 nằm trong phạm vi được phép chạy lại.
  - Mọi lỗi F-UX3A và F-UX3B đều đã khắc phục.
  - axe: chỉ còn mục target-size đã được giải trình.
  - Nhận xét thêm: biểu tượng Sign out lệch phải 3px so với Profile; màn hình đầu ở trạng thái
    away thấp hơn 2.2px; nhãn "after WP5-UX3-FIX2" trong docs/10 đã cũ.
- current_source_digest là b35dddd5. Mục AUDIT-INT nay phụ thuộc vào REGATE2, A2 và B2.
- Đang chạy song song: hai audit kiểm lại mới (opus) WP5-UX3-AUDIT-A2, có đánh giá thêm ba nhận xét
  trên và làm lại phần kiểm vết nối ở DPR 2, và WP5-UX3-AUDIT-B2.
- WP5-UX3-AUDIT-B2 xong: FIX REQUIRED với một lỗi mức Low về độ chặt của test, không có lỗi sản
  phẩm.
  - F-UX3B2-1: chưa có test nào chứng minh ghi chú xóa giờ nghỉ không hiện khi Check out bình
    thường (đột biến M6a không bị bắt).
  - F-UX3B-1 và F-UX3B-2 đã khắc phục; lựa chọn hành vi hợp lý.
  - Hồi quy: 39 trường hợp dữ liệu gửi đi giống từng byte so với 7ce4e95.
  - e2e đầy đủ 645 đạt / 0 lỗi.
  - Rủi ro R-B2-1..5: R-B2-1 là chưa có test nào ghim "Confirm breaks" cho phiên đã kết thúc
    trong hôm nay (đột biến M5b không bị bắt).
- AUDIT-A2 vẫn đang chạy. Cách sửa sẽ được quyết sau khi audit này xong.
- WP5-UX3-AUDIT-A2 xong: FIX REQUIRED.
  - F-UX3A2-1, mức trung bình: ở độ rộng điện thoại, bảng More vẫn mở sau khi focus rời khỏi
    nó, nên 12/14 ô chọn Category đang có focus bị che hoàn toàn. Lỗi có từ vòng 3.
  - F-UX3A2-2, mức Low: chưa có test giữ hai luật vòng focus dưới con trỏ chuột của nút dạng
    liên kết và tab điện thoại.
  - F-UX3A2-3, mức Low: mục Sign out lệch 3px so với các mục khác.
  - F-UX3A-01..06 đã khắc phục; F-UX3A-04 chỉ còn độ lệch nói trên.
  - Vết nối ở DPR 2 sạch.
  - Rủi ro R-A2-1: test quét hover chỉ kiểm theo chữ, nên đột biến M6b không bị bắt.
  - e2e đầy đủ 645 đạt / 0 lỗi, sau một lần chạy lại được phép vì lỗi mạng.
- Quyết định của coordinator: một lần sửa gọn WP5-UX3-FIX4 (worker-high, sonnet).
  - Phạm vi: F-UX3A2-1..3 và F-UX3B2-1, cùng các test giữ R-A2-1, R-B2-1, R-B2-4, và nhãn ở
    docs/10 dòng 240. Mỗi test giữ phải được chứng minh bằng đột biến tương ứng.
  - Sau đó: FIX4-FREEZE, WP5-UX3-REGATE3 rút gọn, các audit kiểm lại mới A3 và B3, rồi
    AUDIT-INT.
- Đang chạy: WP5-UX3-FIX4.
- WP5-UX3-FIX4 xong (worker-high, tự báo claude-sonnet-5-5).
  - Bảng More đóng khi focus rời thanh tab.
  - Sign out đã thẳng hàng.
  - Các test giữ mới: vòng focus của nút dạng liên kết và tab điện thoại, test quét hover dùng
    matchMedia, ghi chú xóa giờ nghỉ không hiện khi không cần, và "Confirm breaks" cho phiên đã
    kết thúc hôm nay.
  - Ghi chú cho suggestedRows và số liệu trong docs/10 (487.01 kB).
  - Các đột biến M1, M4, M5, M6b, M6a và M5b đều bị bắt.
  - Unit 2141; e2e đầy đủ 651 đạt / 0 lỗi; verify 0.
  - Digest 245e9459 (833 file; 8 đường dẫn thay đổi).
- Đang chạy: WP5-UX3-FIX4-FREEZE (committer, chạy một mình).
- WP5-UX3-FIX4-FREEZE xong: 86294412ce15e221f6e0fbc782f0b52a332352be trên main, đã push.
  - 581 file: 8 ngoài handoff, 18 bản ghi, 555 file bằng chứng.
  - Digest 245e9459, trên HEAD cũng vậy.
  - Mọi kiểm tra trả về 0.
- Quyết định của coordinator: FIX4 nhỏ và không đụng tới logic thời gian, server hay dữ liệu gửi
  đi.
  - WP5-UX3-REGATE3 là bản rút gọn: mục 1 của gate đầy đủ, các mục 2 và 3, chạy FULL ở một ngày
    trong khoảng 5 ngày trước ngày trả lương và một lần đổi giờ mùa, các hành vi và đột biến của
    FIX4, các kiểm tra của vòng 3 mà FIX4 chạm tới, và quét axe đầy đủ.
  - Không tách A3/B3: WP5-UX3-AUDIT-INT (agent mới) sẽ kiểm lại luôn các lỗi của A2/B2 và phần
    thay đổi của FIX4, và chỉ phụ thuộc vào REGATE3.
- Đang chạy: WP5-UX3-REGATE3 (verifier, sonnet) trên 8629441 / 245e9459.
- Trong lúc REGATE3 chạy, brief AUDIT-INT đã được viết lại.
  - Nay gồm: kiểm lại F-UX3A2-1..3, F-UX3B2-1, các test giữ và phần thay đổi của FIX4; tổng hợp
    mọi review và gate của vòng 3, kể cả GOV2; các thăm dò liên vùng; AC-13 ở ba múi giờ; tài
    liệu; và các kiểm tra bắt buộc kèm e2e đầy đủ.
  - Nhắm vào 8629441 / 245e9459; chỉ phụ thuộc vào REGATE3.
- Chủ dự án hỏi vì sao chỉ sửa AGENTS một chút mà phải chạy nhiều. Riêng chuỗi AGENTS mất khoảng
  20 phút. Phần còn lại là vòng 3: REGATE2 bị dừng giữa chừng nên đằng nào cũng phải chạy lại, và
  các audit kiểm lại tìm ra lỗi thật. Phần việc còn lại cần giữ ở mức tối thiểu.
- WP5-UX3-REGATE3 xong: FAIL, chỉ ở mục 4.
  - Test mới của FIX4 `day-editor.spec.ts:3895` phụ thuộc giờ trong ngày. Từ 00:00 đến khoảng
    03:00, phiên giờ của nó vắt qua nửa đêm và điện thoại hiện dạng chip.
  - Mọi mục khác đều đạt: e2e theo đồng hồ thật 651 / 0, drill, AC-13, ranh giới server, mọi hành
    vi và đột biến của FIX4, và axe.
- Quyết định của coordinator:
  - WP5-UX3-FIX5 chỉ sửa test, do chính tác giả FIX4 làm tiếp.
  - Sau đó là FIX5-FREEZE và một WP5-UX3-REGATE4 tối thiểu. Gate này chứng minh các bản build
    giống từng byte so với 8629441, nên các mục khác của REGATE3 được giữ nguyên kết quả, và chỉ
    chạy lại phần test.
  - Rồi đến AUDIT-INT.
- Đang chạy: WP5-UX3-FIX5.
- WP5-UX3-FIX5 xong (chỉ sửa test).
  - Test nay dùng một người dùng giả lập riêng, đặt ở múi giờ lệch cố định sao cho lúc chạy là
    giữa trưa, và kiểm rằng phiên nằm đúng ngày hôm nay theo server.
  - Test đạt lúc 00:30, 01:45, 02:00, 12:00 và 23:30 PDT và theo đồng hồ thật, trên cả hai
    project.
  - Đột biến M5b làm test hỏng cả lúc 01:45 lẫn 12:00.
  - day-editor 120 đạt / 0 lỗi; verify 0; digest 95323f2d.
- Đang chạy: WP5-UX3-FIX5-FREEZE (committer, chạy một mình).
- WP5-UX3-FIX5-FREEZE xong: 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d trên main, đã push.
  - 260 file: file spec, 8 bản ghi, 251 file bằng chứng.
  - Digest 95323f2d, trên HEAD cũng vậy.
- Đang chạy: WP5-UX3-REGATE4 tối thiểu (verifier, sonnet) trên 5c101c1 / 95323f2d.
  - Gate này chứng minh chỉ file spec thay đổi và các bản build giống từng byte so với 8629441,
    nên các mục khác của REGATE3 được giữ nguyên kết quả.
  - Nó chỉ chạy lại npm test, e2e đầy đủ theo đồng hồ thật, chạy FULL ở hai mốc giả lập, và test
    vừa sửa vào ban đêm kèm đột biến M5b.
- Sau đó là WP5-UX3-AUDIT-INT trên 5c101c1, với brief được nhắm lại.
- WP5-UX3-REGATE4 xong: FAIL ở mục 2 theo đúng tiêu chí đã viết.
  - Định danh và bản build giống hệt nhau, nên các mục của REGATE3 được giữ nguyên kết quả.
  - Test vừa sửa và đột biến M5b đều đạt, và hai lần chạy FULL theo đồng hồ giả lập đều 651 / 0.
  - Ba lần chạy đầy đủ theo đồng hồ thật, mỗi lần hỏng một test khác nhau trong số các test
    không đổi:
    - surfaces.spec.ts:215 và keyboard-access.spec.ts:444 hết 30 giây chờ trang đăng nhập;
    - hover.spec.ts:718, một test của FIX4, báo "element not attached".
  - Các test hỏng đều đạt khi chạy lại riêng.
- Đang chạy: bước chẩn đoán chỉ đọc WP5-UX3-DIAG1 (planner, sonnet). Nó xếp từng lỗi vào loại
  race trong test, lỗi sản phẩm, hay sự cố môi trường hoặc tải máy, kèm bằng chứng. Bước tiếp
  theo tùy vào kết quả này.
- WP5-UX3-DIAG1 xong.
  - Hai lỗi do môi trường: `net::ERR_NO_BUFFER_SPACE` khi tải gói JS của ứng dụng, một sự cố
    buffer đã biết trên máy này; quy tắc cho chạy lại hiện có được áp dụng.
  - hover.spec.ts:718 là một race trong test của FIX4: test bắt nhầm nút ngày của giao diện máy
    tính trước khi bố cục kịp đổi sang điện thoại. Đã chứng minh được cách sửa bằng một dòng
    selector.
  - Lần chạy đầy đủ thứ tư đạt 651 / 0.
- Quyết định của coordinator:
  - WP5-UX3-FIX6 sửa đúng một dòng trong test.
  - Sau đó là FIX6-FREEZE và một REGATE5 tối thiểu: định danh, bản build giống hệt, npm test,
    một lần e2e đầy đủ theo đồng hồ thật, và chạy lặp test vòng focus.
  - Làm rõ quy tắc: lỗi có dấu vết ERR_NO_BUFFER_SPACE được tính là lỗi buffer kể cả khi nó hiện
    ra dưới dạng timeout.
  - Rồi đến AUDIT-INT.
- Đang chạy: WP5-UX3-FIX6 (worker, sonnet).
- WP5-UX3-FIX6 xong: một dòng selector cùng một dòng chú thích trong hover.spec.ts.
  - Test vòng focus chạy lặp x30 được 60 lần đạt; hover.spec.ts trên cả hai project được 70 lần
    đạt.
  - npm test 2141; verify 0; digest 507de97c.
- Đang chạy: WP5-UX3-FIX6-FREEZE (committer, chạy một mình).
- WP5-UX3-FIX6-FREEZE: lần 1 dừng ở validate_orchestration. Đó là sơ suất của coordinator: mục
  REGATE4 trên board không có danh sách bằng chứng. Sau khi sửa board, lần 2 đã commit và push
  8e557100d16b6b6eb86a48e00276835761aabfdf (88 đường dẫn; digest 507de97c, trên HEAD cũng vậy;
  mọi kiểm tra trả về 0).
- Đang chạy: WP5-UX3-REGATE5 tối thiểu (verifier, sonnet) trên 8e55710 / 507de97c.
  - Gồm: định danh và bản build giống hệt, npm test, một lần e2e đầy đủ theo đồng hồ thật với quy
    tắc lỗi buffer đã làm rõ, test vòng focus chạy lặp x30, và các validator.
- Sau đó là WP5-UX3-AUDIT-INT trên 8e55710, với brief được nhắm lại.
- WP5-UX3-REGATE5 xong: PASS trên 8e55710 / 507de97c.
  - Chỉ hover.spec.ts thay đổi, và 236 file trong dist giống từng byte.
  - npm test 2141; e2e đầy đủ theo đồng hồ thật 651 đạt / 0 lỗi, không cần chạy lại; test vòng
    focus x30 được 60 lần đạt; các validator trả về 0.
  - Các mục của REGATE3 và REGATE4 được giữ nguyên kết quả. Docker, NAS và các trình duyệt ngoài
    Chromium không chạy ở bước này.
- current_source_digest là 507de97c.
- Đang chạy: WP5-UX3-AUDIT-INT (opus, agent mới) trên 8e55710. Đây là audit kiểm lại và tích hợp
  cuối cùng; nếu đạt PASS thì WP5 được nghiệm thu lại.
- WP5-UX3-AUDIT-INT xong: PASS, không có lỗi nào, trên 8e55710 / 507de97c. WP5 đã được nghiệm
  thu lại.
  - Mọi lỗi và test giữ của A2/B2 đều đã khắc phục, được auditor kiểm lại bằng thăm dò và đột biến
    riêng.
  - Mọi yêu cầu của chủ dự án (U-01..U-27, N-1, N-2, G-1..G-5, Q6, chip giờ, Q7) đều được đối
    chiếu với review đã kiểm nó.
  - Các kiểm tra liên vùng đều đạt; axe 0 lỗi; AC-13 đạt ở ba múi giờ.
  - e2e theo đồng hồ thật 651 / 0.
  - Rủi ro tùy chọn R-INT-1..4: R-INT-1 là một câu trong docs/04 về bảng More.
- Đang chạy: WP5-UX3-ACCEPT-DOCS (light, sonnet). Task này cập nhật định danh trong pilot packet
  và thêm mục vòng 3 vào WP5_HANDOFF, cả EN và VI.
- Sau đó: coordinator cập nhật STATE và NEXT_ACTION, rồi commit nghiệm thu WP5-UX3-ACCEPT, board
  trở về `software_ready`.
- WP5-UX3-ACCEPT-DOCS xong.
  - Pilot packet: định danh 8e55710 / 507de97c, nguồn gốc bản build server, số liệu drill của
    REGATE3, WP5-UX2-Q3 được thay bằng G-5 (b), và backlog vòng 3 theo mã.
  - WP5_HANDOFF: thêm một mục cho vòng 3.
  - Bản EN/VI khớp nhau; preflight 0; digest không đổi.
- STATE và NEXT_ACTION (EN và VI) nay ghi nhận việc nghiệm thu lại trên 8e55710 / 507de97c.
- Đang chạy: commit nghiệm thu chỉ gồm handoff WP5-UX3-ACCEPT (committer, chạy một mình).
  - Khi committer xong, coordinator chuyển board sang `software_ready` (next_task_id null, không
    còn task nào đang chạy). Thay đổi này để chưa commit cho tới lần commit kế tiếp, như sau
    vòng 2.
- WP5-UX3-ACCEPT xong: 1b96e9d36c4b32caab95d6c4638df7038134b189 trên main, đã push.
  - 202 đường dẫn trong handoff, không có gì ngoài handoff.
  - Digest 507de97c, không đổi.
  - Mọi kiểm tra trả về 0.
- **WP5 đã được nghiệm thu lại trên 8e55710 / 507de97c. Vòng thay đổi UI lần 3 đã kết thúc.**
  - Board đã trở về `software_ready` (next_task_id null). Thay đổi trạng thái này, kết quả của
    ACCEPT và mục ghi này để chưa commit cho tới lần commit kế tiếp.
  - Tiếp theo, chủ dự án: duyệt pilot packet và trả lời D-1..D-15.
  - NAS chưa được kiểm; pilot chưa được cho phép.
  - Backlog không bắt buộc cho vòng sửa pilot, liệt kê theo mã, nằm trong WP5 handoff.

## Cập nhật 2026-10-20: yêu cầu vòng 4 của chủ dự án (WP5-UX4) và các câu trả lời cho quyết định pilot

- Trong cùng một tin nhắn, chủ dự án gửi yêu cầu 15 mục về giao diện (nguyên văn trên board,
  `owner_decisions` 2026-10-20) và câu trả lời cho D-1..D-15.
  - Các mục giao diện gồm: chức năng export/import settings; trang Timesheet và Review trình bày
    như một tờ giấy; công tắc kiểu tròn; góc của panel; quy tắc nổi panel theo nội dung; chỉnh
    combobox và checkbox; đổi tên thành "Show worked hours"; sửa phiên đang chạy của hôm nay; và
    các thay đổi trong hộp thoại phiên giờ.
  - Các câu trả lời cần sửa code: D-5 a, D-6 a, D-9 b (chức năng đổi mật khẩu), D-15 b (hiện lại
    số đếm trong xem trước ngày nghỉ).
  - Chỉ cần cập nhật tài liệu: D-1 a, D-7 a, D-8 a, D-11 a, D-12 a, D-13 a, D-14 b. Giữ mặc định:
    D-2..D-4 a.
  - D-10 như đã viết mâu thuẫn với quy tắc gốc F-3 (cần bằng chứng, chỉ sửa bằng bút toán có lý do)
    và với D-5 a. Đã hỏi lại thành câu WP5-OWN-Q1, khuyến nghị: bắt đầu từ 0, mỗi lần đổi là một
    bút toán sửa kèm lý do ngắn, không cần tài liệu làm bằng chứng, có giữ lịch sử. Tạm giả định là
    không import lịch sử.
- Coordinator đồng ý đổi tên thành "Show worked hours": công tắc này thêm đúng hai dòng giờ làm việc
  (docs/04 dòng 41).
- Mission được mở lại (`running`, phase `ux4-plan`). Việc chuyển board sang `software_ready` sau
  vòng 3 và kết quả của ACCEPT vẫn chưa được commit, sẽ đi kèm lần commit kế tiếp.
- Đang chạy: WP5-UX4-PLAN (planner, opus, override size_risk). Bước này chỉ đọc; nó viết kế hoạch,
  cập nhật mockup, chia các phần việc và đưa ra tối đa 8 câu hỏi cho chủ dự án.
- WP5-UX4-PLAN xong.
  - 15 mục, kèm số đo: khoảng cách dưới tiêu đề 12px; checkbox WFH lệch xuống 7.6px; ô giờ của dòng
    nghỉ thêm tay rộng 265.6px so với 192.5px; thông báo lỗi khi lưu nằm ngoài vùng nhìn thấy.
  - Việc sửa phiên đang chạy chỉ bị chặn ở client; server đã cho phép sẵn.
  - Thiết kế export/import settings: một file cài đặt cá nhân cộng một file lịch công ty, chỉ làm ở
    client.
  - Phần việc server T04: route đổi mật khẩu (D-9 b), D-5 a, D-6 a, D-10, D-15.
  - Chia thành các phần T01..T06; khoảng 18-20 lần giao việc.
  - Mockup và 11 ảnh minh họa nằm trong `handoff/delivery/design/WP5-UX4/`.
- Có một commit chỉ gồm handoff, 18c8fd9, không do committer của mission tạo; nhiều khả năng do chủ
  dự án (đã ghi trong runtime observations). git.last_commit đã đặt theo commit này.
- Đang chờ chủ dự án trả lời F-1..F-5 (`open_owner_question_ux4` trên board):
  - F-1 số dư OT đầu kỳ (thay cho WP5-OWN-Q1);
  - F-2 D-15 b mâu thuẫn với quy tắc quyền riêng tư;
  - F-3 phạm vi export/import;
  - F-4 cách import hoạt động;
  - F-5 duyệt mockup.
- Mission đang ở `blocked` chờ các câu trả lời này. next_task_id là WP5-UX4-T01, đang chờ F-5.
- Chủ dự án đã trả lời (nguyên văn trên board):
  - F-1 i: pilot không import lịch sử; bản production vẫn giữ chức năng import.
  - F-2 b: hiện số đếm chính xác trong xem trước ngày nghỉ, kèm một ngoại lệ quyền riêng tư được ghi
    rõ và một sự kiện audit.
  - F-3 a và F-4 a.
  - F-5 duyệt kèm thay đổi:
    - khoảng cách dưới tiêu đề là 32px;
    - thanh công cụ, các tuần và phần cuối giữ nguyên kiểu dáng hiện tại, chỉ được đặt chung trong
      một tờ giấy; phần chữ ký và ngày giữ hai hàng;
    - kiểu dáng của tờ giấy được tự do thiết kế;
    - các link Today và Now canh phải;
    - dòng tiêu đề tuần và cột đầu tiên đậm màu hơn một chút.
  - Commit 18c8fd9 do chủ dự án tạo.
- Quyết định của coordinator: làm các phần theo thứ tự T04 (server), T01, T02, T03, T05, T06.
  - T04 còn thực thi quy tắc hiện có F-Q5 bằng một chặn ở server cho thao tác check in/out qua
    chia sẻ, và viết lại các quy tắc gốc F-3 và ngoại lệ quyền riêng tư trong docs/03 và docs/10
    (EN và VI).
  - Hộp thông báo lỗi cũng được dùng lại trong hộp thoại Check out.
- Đang chạy: WP5-UX4-T04 (worker-high, opus, override size_risk). Mission ở `running`, phase
  `ux4-slices`.
- WP5-UX4-T04 bàn giao lần đầu. Đã xong các mục 1-7:
  - route đổi mật khẩu và thẻ trên trang Profile;
  - D-5 a, F-1 i và D-6 a;
  - số đếm F-2 b kèm sự kiện audit;
  - chặn check in/out qua chia sẻ, chặn luôn việc mở lại một phiên đã kết thúc qua chia sẻ;
  - docs/03 và docs/10.
- Kết quả: unit 2152 đạt / 1 lỗi; e2e đầy đủ không có lỗi thật (một lỗi buffer, chạy lại thì đạt);
  các đột biến đều bị bắt.
- Lỗi duy nhất là danh sách route trong `tests/integration/ot-api.test.ts`, file không thuộc phạm
  vi của T04. Còn hai chỗ sót nằm ngoài phạm vi: `importModel.ts` (quy tắc số dư đầu kỳ cũ) và
  `AdminScreen.tsx` (câu về quyền riêng tư).
- Addendum 1 mở rộng phạm vi cho đúng ba file này. Đang chạy: T04 Addendum 1, cùng worker.
- WP5-UX4-T04 xong sau Addendum 1.
  - Đã cập nhật test danh sách route; quy tắc số dư đầu kỳ nay nằm trong `importModel.ts`; phần giới
    thiệu trang Administration đã ghi ngoại lệ F-2 b.
  - npm test 2155 đạt / 0 lỗi; năm spec liên quan 29 + 29 đạt; verify 0.
  - Digest 6e9e3001 (835 file); 33 đường dẫn thay đổi.
- Đang chạy: WP5-UX4-T04-FREEZE (committer, chạy một mình).
- WP5-UX4-T04-FREEZE.
  - Lần 1 dừng ở bước validator: task T01 đặt chỗ sẵn chưa có brief, một sơ suất của coordinator.
  - Sau khi viết brief T01, lần 2 đã commit và push 5a68fba65bac6723ed3e66f33048b722d34c4656
    (71 đường dẫn; digest 6e9e3001, trên HEAD cũng vậy; mọi kiểm tra trả về 0).
- Đang chạy: WP5-UX4-T01 (worker-high, sonnet) trên 5a68fba / 6e9e3001.
- WP5-UX4-T01 xong (theo báo cáo của worker; các vòng audit của đợt 4 sẽ kiểm tra độc lập).
  - Đã làm:
    - khoảng cách dưới tiêu đề 32px;
    - "tờ giấy" bao thanh công cụ, hai tuần và phần footer; footer giữ nguyên bố cục và hai hàng
      chữ ký;
    - hàng tiêu đề tuần và cột đầu đậm hơn;
    - công tắc tròn, mũi tên combo cách mép 12px, checkbox căn giữa;
    - "Show worked hours".
  - Kết quả: unit 2155; e2e đầy đủ 696 đạt / 0 lỗi; bắt được 4 đột biến; verify 0.
  - preflight PASS với Python của workflow (lần đầu trả về 1 do dùng một Python không có tzdata).
    Digest 1921c36f (836 file); 16 đường dẫn thay đổi ngoài handoff (1 file mới).
  - Điểm lệch cần báo chủ dự án: trang Review chuyển sang hai cột từ 1330px (trước là 1200px) vì
    lưới tuần vốn đã tràn ở 1280px.
  - Còn lại: chú thích ở `sheetModel.ts:141` chuyển cho UX4-T03.
- Đang chạy: WP5-UX4-T01-FREEZE (committer, chạy một mình).
  - Lần 1 dừng trước khi stage vì brief ghi sai, một sơ suất của coordinator: trong hai file evidence
    của T04-FREEZE, `checks.txt` là file chưa được git theo dõi (không phải file đã sửa), còn
    `commit-message.txt` không có trong danh sách. Chưa có file nào được stage.
  - Addendum 1 ghi cả hai là file mới. Cùng committer đó chạy tiếp, tính là lần 2.
  - Lần 2: hệ thống phân quyền của client chặn lệnh `git add` của committer hai lần. Nó không
    coi quyết định của coordinator là sự chấp thuận của người dùng.
    - Bước kiểm tra lại trước khi bị chặn đều đạt: HEAD = origin/main = 5a68fba; 16 đường dẫn
      khớp; thư mục evidence của T04-FREEZE có đúng hai file `.txt`.
    - Chưa có gì được stage hay commit.
  - Mission ở trạng thái `blocked`, chờ chủ dự án xác nhận trực tiếp (WP5-UX4-FREEZE1-Q).
    - (a) Stage cả hai file.
    - (b) Bỏ hai file đó ra.
  - Tiếp theo: cùng committer đó chạy tiếp sau khi chủ dự án trả lời, kèm trích dẫn nguyên văn câu
    trả lời.
  - Chủ dự án trả lời "a" (stage cả hai file). Mission chuyển về `running`; cùng committer đó chạy
    tiếp lần 2, có trích nguyên văn câu trả lời của chủ dự án.
  - `git add` bị chặn lần thứ ba: hệ thống phân quyền không chấp nhận sự chấp thuận do coordinator
    chuyển lời. Việc này giống tiền lệ ngày 2026-10-03.
    - Các kiểm tra trước đó lại đạt. Chưa có gì được stage.
    - Không tìm cách lách việc chặn: không giao cho committer mới.
  - Mission ở trạng thái `blocked`, chờ trả lời WP5-UX4-FREEZE2-Q.
    - (a) Chủ dự án tự gửi một tin nhắn nêu rõ hành động và rủi ro, sau đó cùng committer đó chạy
      tiếp.
    - (b) Chủ dự án tự commit bằng các lệnh chính xác, sau đó một agent chỉ đọc kiểm tra lại.
  - Chủ dự án chọn (a) và đã gửi tin nhắn trực tiếp (nguyên văn trên board). Mission chuyển về
    `running`; cùng committer đó chạy tiếp lần 2, có trích nguyên văn tin nhắn. Nếu vẫn bị chặn thì
    chuyển sang (b).
  - Lệnh `git add` với danh sách file cụ thể bị chặn lần thứ tư, lý do "[Auto-Mode Bypass]". Không
    tìm cách lách.
  - Chuyển sang (b): chủ dự án tự commit.
    - Nội dung commit nằm trong `evidence/WP5-UX4-T01-FREEZE/commit-message.txt`.
    - Mission ở trạng thái `blocked` cho tới khi commit vào repo. Sau đó một verifier chỉ đọc kiểm
      tra và ghi kết quả.
  - Chủ dự án báo "xong, đã push". Đang chạy: WP5-UX4-T01-FREEZE-RECON (verifier, chỉ đọc).
- WP5-UX4-T01-FREEZE xong: commit thủ công của chủ dự án
  213bbdc8a013c96e7144d59dd5802e467572779d.
  - Recon đạt cả 8 bước kiểm tra: commit cha 5a68fba; nội dung commit khớp file; đúng 37 đường dẫn;
    digest 1921c36f trên working tree và trên HEAD; các validator PASS; quét quyền riêng tư không
    có kết quả nào.
  - Bài học (ghi ở runtime_observations trên board): sau khi bị classifier chặn, không cho cùng
    agent đó chạy lại cùng hành động.
- Đang chạy: WP5-UX4-T02 (worker-high, sonnet) trên 213bbdc / 1921c36f.
  - Phạm vi: U4-05 (panel nổi không chặn trang, có đổi ngày, bỏ chọn và hỏi trước khi bỏ thay đổi
    chưa lưu), U4-06 (panel dạng drawer sát mép) và U4-07 (quy tắc editorLayout).
- WP5-UX4-T02, lần báo cáo đầu.
  - Đã làm theo báo cáo:
    - drawer không chặn trang từ 768px, có đổi ngày và bỏ chọn;
    - góc 0 / 12px;
    - mốc chuyển chế độ 1330px (thanh cuộn dạng overlay) / 1345px (thanh cuộn thường);
    - unit 2164; e2e mobile 0 lỗi; bắt được đột biến 1-6; digest a56b26fd (839 file).
  - Còn hở:
    - nút Today vẫn đổi ngày đang mở mà không hỏi, nên mất thay đổi chưa lưu mà không báo;
    - một lỗi phụ thuộc giây đồng hồ ở `day-editor.spec.ts:3994`, chỉ đạt khi chạy lại, mà quy
      tắc không cho phép chạy lại trường hợp này;
    - chú thích cũ trong `today.spec.ts`; `docs/12:39` chuyển cho T06.
  - Lệch đường dẫn: `src/client/DayEditor.tsx`. Brief ghi sai đường dẫn, lỗi của coordinator.
- Đang chạy: Addendum 1 của T02 (cùng worker). Nội dung: hỏi trước ở mọi thao tác làm đổi hoặc đóng
  ngày đang mở; sửa phép so sánh phụ thuộc thời gian để kết quả luôn ổn định; sửa chú thích; thêm
  đột biến 7.
- WP5-UX4-T02 xong sau Addendum 1.
  - Một cơ chế hỏi trước dùng chung cho mọi thao tác: bấm nút ngày hoặc cột, bỏ chọn, Open a day,
    Today, Previous/Next period, Current period, nút đóng và Escape.
  - Lỗi Confirm-breaks là do test: ô giờ chỉ hiện HH:MM khi giây bằng 0. Test nay chạy hai trường
    hợp với giây cố định.
  - E2e đầy đủ: desktop 376 / mobile 347 đạt, 0 lỗi, không phải chạy lại. Bắt được đột biến 1-7.
    Digest 04e16199 (839 file).
  - Cố ý không hỏi: khi rời trang qua một liên kết, và khi tải lại sau khi một thay đổi label hoặc
    thay đổi hàng loạt đã sửa đúng ngày đang mở.
- Đang chạy: WP5-UX4-T02-FREEZE.
  - Một committer mới chạy một mình.
  - Brief liệt kê đủ mọi đường dẫn ngay từ khi giao. Các bản ghi task và evidence WP5-UX4 phát
    sinh thêm được phép stage theo mẫu đặt sẵn lúc giao.
- WP5-UX4-T02-FREEZE đã commit và push b7cc06352687d1bc8cd6953b284915584a21e4fd.
  - 49 đường dẫn; digest 04e16199 trên HEAD; mọi kiểm tra trả về 0.
  - Một lần sửa khoảng trắng được phép, trong `WP5-UX4-T01-FREEZE.md`.
  - Sơ suất: dùng `node -e` một lần để kiểm tra JSON.
- Quyết định của coordinator: dùng lại hộp thông báo lỗi của U4-15 trong hộp thoại Check out.
- Đang chạy: WP5-UX4-T03 (worker-high, sonnet; rủi ro H nhưng đã có mẫu sẵn) trên b7cc063 /
  04e16199.
  - Phạm vi:
    - U4-11: sửa giờ bắt đầu của phiên đang chạy;
    - U4-12: time zone lên đầu;
    - U4-13: Today/Now canh phải, theo time zone đã nhập;
    - U4-14: hàng break thẳng cột;
    - U4-15: hộp thông báo lỗi trong hộp thoại phiên giờ và Check out;
    - chú thích ở `sheetModel.ts:141`.
- WP5-UX4-T03 xong (theo báo cáo của worker; các vòng audit của đợt 4 sẽ kiểm tra độc lập).
  - Sửa phiên đang chạy: test tích hợp ra 601 phút làm việc thường khi bắt đầu từ 08:00, so với 541
    phút khi bắt đầu từ 09:00.
  - Today và Now canh phải lệch không quá 1px; test với time zone Tokyo, máy đặt giờ LA và đồng hồ
    cố định đều đạt.
  - Các hàng break thẳng cột.
  - Hộp thông báo lỗi chạy ở cả hai hộp thoại.
  - Kết quả:
    - vitest 2185; e2e đầy đủ desktop 394 và mobile 365 đạt, 0 lỗi, không phải chạy lại;
    - bắt được đột biến 1-7;
    - build 498.66 kB, chỉ thấp hơn ngưỡng cảnh báo 500 kB có 1.3 kB. **T05 phải tách code**;
    - digest e3c7016b (840 file).
  - Ghi chú:
    - dự án không có axe-core, nên worker kiểm tra trực tiếp từng tiêu chí thay thế;
    - sau lần chạy e2e đầy đủ, worker thêm một assertion chỉ ở test cho U4-14 và các test đó đạt
      lại; gate sẽ chạy lại toàn bộ;
    - sơ suất: có lệnh pipe vào `head` và một heredoc rỗng.
- Đang chạy: WP5-UX4-T03-FREEZE. Một committer mới chạy một mình, với danh sách đường dẫn đầy đủ
  đặt sẵn lúc giao.
- WP5-UX4-T03-FREEZE đã commit và push cda9c5172b06d3651e94e75ff30e9b1edfae382e.
  - 47 đường dẫn; digest e3c7016b trên HEAD; mọi kiểm tra trả về 0.
  - Sơ suất: một lệnh redirect vào `/dev/null`.
- Đang chạy: WP5-UX4-T05 (worker-high, sonnet; rủi ro H vì quyền riêng tư và cờ tự động nộp, dùng
  mẫu xem trước rồi xác nhận đã có sẵn) trên cda9c51 / e3c7016b.
  - Phạm vi: export/import settings theo F-3 a và F-4 a.
  - Ràng buộc cứng:
    - chỉ sửa client; thiếu route nào thì dừng lại;
    - danh sách khóa được phép (allowlist);
    - không ghi gì nếu chưa xem trước và xác nhận một lần;
    - ô tick tự động nộp tách riêng;
    - file lịch công ty chỉ dành cho quản trị viên;
    - code chuyển settings nằm trong chunk tải lười (lazy), để chunk chính vẫn dưới ngưỡng cảnh báo
      500 kB.
- WP5-UX4-T05 xong (theo báo cáo của worker; sẽ audit sau).
  - Chỉ sửa client, không thiếu route nào.
  - File cá nhân: work policy, cài đặt nộp timesheet và theme. File công ty: time zone, payroll,
    ngày làm việc trong tuần, ngày lễ và payroll exceptions.
  - Xác nhận một lần; tự động nộp chỉ bật khi tick riêng.
  - Chunk chính 489.14 kB.
  - E2e đầy đủ: desktop 400 / mobile 371 đạt, 0 lỗi, không phải chạy lại. Bắt được đột biến 1-6
    (đột biến 4 tách thành 4a và 4b). Digest b4727677 (849 file).
  - Giới hạn cần báo chủ dự án:
    - file công ty có ngày làm việc trong tuần khác lịch hiện tại sẽ bị từ chối, vì không có route
      nào ghi được các ngày này;
    - file công ty chỉ áp dụng cho lịch của chính quản trị viên đó;
    - ngày lễ và payroll exceptions được ghi thành hai lần riêng.
- Đang chạy: WP5-UX4-T05-FREEZE (một committer mới, chạy một mình).
- WP5-UX4-T05-FREEZE đã commit và push 82d1ab4d8300de139db88dbaa9f7b2d56d2650b0: 52 đường dẫn;
  digest b4727677 trên HEAD; mọi kiểm tra trả về 0.
- Đang chạy: WP5-UX4-T06 (worker, sonnet; chỉ sửa docs) trên 82d1ab4 / b4727677.
  - Docs: docs/01, 03, 05, 07, 10, 11 và 12 (+ vi), cùng các chỗ còn sót ở docs/04.
  - Pilot packet §0, §4, §8 và §9, kèm bảng trả lời D-1..D-15.
  - Mọi nội dung được đối chiếu với source đã đóng băng.
  - Định danh bản phát hành giữ nguyên cho tới ACCEPT-DOCS.
- WP5-UX4-T06, lần báo cáo đầu (chưa commit).
  - Docs và pilot packet đã cập nhật theo brief: 9 cặp EN/VI khớp, preflight PASS, bảng đối chiếu
    39 dòng, digest 32432deb.
  - Còn một điểm chưa xác minh: D-8. `smtpAdapter.ts:46` xếp `ETLS` và `EREQUIRETLS` là lỗi vĩnh
    viễn, trong khi docs ghi lỗi chứng chỉ sẽ được thử lại.
- Đang chạy: WP5-UX4-D8-DIAG (planner, chỉ đọc). Agent quan sát từng chế độ bảo mật SMTP bằng một
  listener TLS giả lập chạy cục bộ với chứng chỉ tự ký, rồi đề xuất câu chữ đúng.
  - Worker T06 đang chờ, không chạy.
  - Sau đó, hoặc một addendum của T06 sửa lại câu chữ D-8, hoặc hỏi chủ dự án nếu tiền đề của D-8 a
    thay đổi.
- WP5-UX4-D8-DIAG xong. Tiền đề vẫn đúng, nên không cần hỏi chủ dự án.
  - Lỗi chứng chỉ ở cả hai chế độ đều đến dưới dạng `ESOCKET` và là lỗi tạm thời
    `smtp_unavailable`: thử 5 lần, rồi cần người xử lý.
  - Chỉ khi máy chủ từ chối STARTTLS mới ra `smtp_tls_failed`.
  - Docs ghi đúng nhưng chưa nêu tên mã lỗi.
- Đang chạy: Addendum 1 của T06 (cùng worker).
  - Câu chữ D-8 chính xác hơn.
  - Một test để giữ đúng hành vi trong `tests/integration/delivery.test.ts`, kèm đột biến.
  - typecheck, lint, npm test, rồi digest ở bước cuối.
- WP5-UX4-T06 xong sau Addendum 1.
  - Câu chữ D-8 đã chính xác.
  - Một test trong `delivery.test.ts` chạy cho cả STARTTLS lẫn TLS trực tiếp; đột biến của nó bị bắt.
  - npm test 2219 đạt; digest 104ca9c3 (849 file).
  - Ghi chú rủi ro cho gate: một test lỗi TLS không có lần gửi lại với chứng chỉ tin cậy đã làm
    worker của vitest bị crash (0xC0000005) lúc dọn dẹp. Lần chạy probe đầu của D8-DIAG cũng bị
    segfault. Test cuối có lần gửi lại tin cậy, giống test TLS trực tiếp đã có.
- Đang chạy: WP5-UX4-T06-FREEZE (một committer mới, chạy một mình). Brief có thêm bước quét PEM và
  khóa trong evidence của D8-DIAG.
  - Lần 1 dừng trước khi stage. Bước quét bắt được chữ `BEGIN` ở `probe-script.txt:50`.
  - Dòng đó là một template literal dựng phần đầu chứng chỉ quanh `${b64}` lúc chạy, không chứa
    khóa nào. Coordinator đã đọc dòng này.
  - Addendum 1 chỉ cho phép đúng trường hợp đó. Một committer mới chạy lần 2.
- WP5-UX4-T06-FREEZE lần 2 đã commit và push a3042dd9c2f94dd2287ef04ed815db0fbf1838b6.
  - 62 đường dẫn; digest 104ca9c3 trên HEAD; mọi kiểm tra trả về 0.
  - Toàn bộ source của đợt 4 đã xong: T04 5a68fba, T01 213bbdc, T02 b7cc063, T03 cda9c51,
    T05 82d1ab4, T06 a3042dd.
- Đang chạy: WP5-UX4-GATE (verifier, sonnet) trên a3042dd / 104ca9c3. Phạm vi:
  - gate WP5 đầy đủ;
  - ranh giới server chỉ gồm tám file của T04;
  - phạm vi của đợt;
  - quét với đồng hồ giả lập;
  - các kiểm tra riêng của đợt, gồm axe, độ tương phản, CSP và kích thước chunk;
  - `npm test` ba lần, theo dõi worker có bị crash không.
- WP5-UX4-GATE: **FAIL**.
  - **Lỗi sản phẩm (T02, SC 2.4.11).** Ở 1280x800, nút "Edit 10/19" bị drawer nổi (đang neo bên
    trái) che hoàn toàn. `whollyCovered` so sánh nghiêm ngặt, mà nút lại nằm lệch 0.23px dưới mép
    cửa sổ.
  - **Lỗi test phụ thuộc ngày:**
    - `sharing.spec.ts:399` vào các ngày cửa sổ nộp;
    - U4-11 vào Chủ nhật;
    - U4-05 (kiểm tra chuột có bấm tới được cột ngày cạnh drawer) vào 2026-11-01.
  - **Test flaky:**
    - `keyboard-access.spec.ts:227` (mobile; là lỗi duy nhất khi chạy với đồng hồ thật, 770 test
      đạt);
    - phép đo độ tương phản của link Today/Now;
    - dữ liệu seed của U4-14 lúc 23:58:30.
  - **Mọi mục còn lại đều đạt:**
    - ci, lint, verify, AC-13, drill (208 PASS), audit, các validator;
    - `npm test` ba lần, worker không crash lần nào;
    - ranh giới server: chỉ tám file của T04, `dist/domain` giống hệt;
    - phạm vi: 90 đường dẫn;
    - các phép đo của T01, T03, T04 và T05;
    - axe 0 vi phạm trong 30 lần quét; CSP giống hệt; chunk chính 489 kB.
- Đang chạy: WP5-UX4-FIX1 (worker-high, sonnet).
  - Worker tái hiện từng lỗi trước rồi mới sửa.
  - SC 2.4.11 được xét theo phần nhìn thấy của control, có dung sai, kèm unit test, một lượt duyệt
    bàn phím ở 1280 và một đột biến.
  - Các test được làm cho ổn định, chứng minh ở sáu thời điểm của gate và bằng 10 lần chạy lặp.
- WP5-UX4-FIX1 xong, không phải dừng. Mỗi lỗi đều được tái hiện trước.
  - SC 2.4.11 được sửa trong hàm thuần `whollyCovered`: cắt theo cửa sổ, dung sai 1px, 7 trường hợp
    unit test, một lượt duyệt ở 1280 với drawer neo cả hai bên, đột biến bị bắt.
  - Trường hợp ngày cửa sổ và Chủ nhật là lỗi của test; sản phẩm đúng theo docs/02.
  - Test bàn phím flaky là do bố cục bị xô lệch: thẻ export tải lười đến giữa lúc đang duyệt. Test
    nay chờ thẻ tải xong. Cách xử lý phía sản phẩm (giữ sẵn chiều cao cho thẻ) được chuyển cho audit
    A xem xét.
  - Kết quả: 0 lỗi ở sáu thời điểm; chạy lặp đạt 140/140 và 40/40; e2e đầy đủ 774 đạt, 0 lỗi; npm
    test 2226; digest b3e9c962.
- Đang chạy: WP5-UX4-FIX1-FREEZE (một committer mới, chạy một mình), sau đó là WP5-UX4-REGATE.
- WP5-UX4-FIX1-FREEZE đã commit và push 0ddfeada1b66c82b066b179e901184ca5d857793.
  - 319 đường dẫn, gồm 242 file evidence của gate và 62 file của FIX1.
  - Digest b3e9c962 trên HEAD; mọi kiểm tra trả về 0; quét khóa và PEM sạch.
- Đang chạy: WP5-UX4-REGATE (verifier, sonnet) trên 0ddfead / b3e9c962.
  - Chỉ dùng lại kết quả cũ khi `dist/server`, `dist/domain` và các chunk tải lười giống hệt từng
    byte với bản a3042dd.
  - Chạy lại:
    - phần lõi, với `npm test` ba lần;
    - e2e đầy đủ với đồng hồ thật;
    - toàn bộ test với đồng hồ giả lập ở ba thời điểm, cộng bảy spec ở ba thời điểm khác;
    - lượt duyệt bàn phím ở 1280 với drawer neo cả hai bên;
    - các test flaky chạy lặp 10 lần;
    - axe cho các màn hình liên quan;
    - kiểm tra các assertion đã đổi.
- WP5-UX4-REGATE: **PASS** trên 0ddfead / b3e9c962.
  - `dist/server` và `dist/domain` giống hệt. Các chunk tải lười giống hệt sau khi chuẩn hóa tên
    file chunk, nên các mục của gate được dùng lại.
  - `npm test` ba lần: 2226 mỗi lần, 0 crash.
  - E2e đầy đủ với đồng hồ thật: 774 đạt, 0 lỗi.
  - Quét với đồng hồ giả lập: 0 lỗi (một lần chạy lại vì lỗi buffer).
  - 2.4.11: 12 lượt duyệt, không control nào bị che.
  - Chạy lặp đạt 140/140 và 40/40; axe 0 vi phạm.
- Đang chạy song song: WP5-UX4-AUDIT-A và WP5-UX4-AUDIT-B (hai auditor opus mới).
  - Khu vực A: giao diện, shell, Day editor, hộp thoại và accessibility.
  - Khu vực B: dữ liệu, bảo mật, file settings, phiên giờ và docs.
- Sau đó là WP5-UX4-AUDIT-INT.
- WP5-UX4-AUDIT-B: **FIX REQUIRED**, một lỗi mức Low.
  - F-UX4B-1: năm lần đăng nhập sai với email `password:<id nạn nhân>`, từ cùng địa chỉ client,
    khiến việc đổi mật khẩu của nạn nhân bị trả 429 trong 15 phút. Hai luồng dùng chung không gian
    khóa của bộ giới hạn.
  - Các rủi ro tùy chọn R-UX4B-1..8. Trong đó có R-UX4B-2: người được chia sẻ quyền sửa có thể xóa
    phiên đang chạy của chủ timesheet.
  - Kiểm tra: npm test hai lần; chín file test tích hợp; delivery chạy 21 lần không crash; AC-13
    với Tokyo; sáu spec e2e 239/0; 19 đột biến đều bị bắt.
  - Coordinator đã dừng một tác vụ nền mà auditor để sót.
- Chờ WP5-UX4-AUDIT-A rồi mới mở vòng sửa: không chạy source writer khi audit đang chạy.
- WP5-UX4-AUDIT-A: **FIX REQUIRED**, 1 lỗi Medium và 3 lỗi Low.
  - F-UX4A-1 (Medium): khi dùng thanh cuộn thường 15px, drawer nhảy qua lại giữa "đứng cạnh bảng" và
    "nổi" khoảng 60 lần mỗi giây ở độ rộng 1330-1344px, trong một khoảng chiều cao cửa sổ nhất định.
  - F-UX4A-2: bấm Escape từ một control trên bảng khi đang có thay đổi chưa lưu thì không hiện gì
    (thiếu `preventDefault`).
  - F-UX4A-3: bấm Current period rồi chọn Keep editing thì focus nhảy sang Today.
  - F-UX4A-4: docs/04 dòng 67 và 108.
  - Mọi mục còn lại đều đạt: axe 0 vi phạm trong 102 lần quét; 2.4.11 không control nào bị che trong
    96 lượt duyệt; 14 đột biến đều bị bắt; e2e đầy đủ 773 đạt (một lần chạy lại vì lỗi buffer). Hai
    thao tác cố ý không hỏi trước và việc thẻ tải lười làm xô bố cục đều chấp nhận được.
- Câu hỏi cho chủ dự án WP5-UX4-R2-Q (R-UX4B-2: có chặn người được chia sẻ quyền sửa xóa phiên đang
  chạy của chủ không?) đang chờ trả lời. Khuyến nghị: (a) chặn.
- Đang chạy: WP5-UX4-FIX2 (worker-high, sonnet).
  - F-UX4A-1..4 và F-UX4B-1 (tách riêng không gian khóa của bộ giới hạn).
  - Dọn dẹp rủi ro 6 và 7 của review A.
  - Tái hiện lỗi trước; có đột biến; e2e với thanh cuộn thường chạy lặp 5 lần; e2e đầy đủ.
- WP5-UX4-FIX2 xong.
  - Cách sửa lỗi drawer nhảy qua lại là `html { overflow-y: scroll }`, vì đo thực tế cho thấy
    `scrollbar-gutter: stable` không có tác dụng. Từ nay trình duyệt desktop dùng thanh cuộn thường
    luôn hiện rãnh thanh cuộn.
  - Escape nay có `preventDefault`.
  - Current period chỉ chuyển focus khi người dùng đồng ý bỏ thay đổi.
  - Khóa của bộ giới hạn đăng nhập nay là `login:<email>`; bộ đếm theo địa chỉ vẫn dùng chung, như
    docs đã ghi.
  - Các việc dọn dẹp.
  - Kết quả: các đột biến đều bị bắt; e2e đầy đủ 779 đạt, 0 lỗi; npm test 2226; digest 1c1c526f
    (850 file).
- Câu hỏi WP5-UX4-R2-Q cho chủ dự án vẫn chờ trả lời. Nếu trả lời (a) sẽ thành một FIX3 nhỏ.
- Đang chạy: WP5-UX4-FIX2-FREEZE (một committer mới, chạy một mình), sau đó là REGATE2 và hai lần
  kiểm tra lại A2, B2.
- WP5-UX4-FIX2-FREEZE đã commit và push 178f1cf8970086018e2e96e8340d911077a2d3ad.
  - 352 đường dẫn; digest 1c1c526f trên HEAD; mọi kiểm tra trả về 0; quét khóa và PEM sạch.
- Đang chạy: WP5-UX4-REGATE2 (verifier, sonnet) trên 178f1cf / 1c1c526f.
  - `dist/server` chỉ được khác ở `auth.ts`.
  - Chạy lại drill và AC-13 với ba time zone.
  - E2e đầy đủ với đồng hồ thật và quét với đồng hồ giả lập.
  - Kiểm tra lại các lỗi đã sửa, gồm cả probe với thanh cuộn thường và các tác dụng phụ của
    `overflow-y: scroll` ở thẻ gốc.
- Chủ dự án trả lời (2026-10-21, nguyên văn trên board):
  - R2 a: chặn người được chia sẻ quyền sửa xóa phiên đang chạy của chủ.
  - R3 b: trang Review chia hai cột trở lại từ 1200px.
  - R4 a: footer giữ nguyên.
  - R5: chủ dự án hỏi lại vì sao drawer nhảy. Câu hỏi vẫn mở với hai lựa chọn: (a) giữ rãnh thanh
    cuộn luôn hiện; (b) tính độ rộng luôn trừ sẵn phần thanh cuộn thường, không ép hiện rãnh.
- REGATE2 được yêu cầu dừng sớm và dọn dẹp, vì FIX3 (R2, R3, và R5 nếu chọn b) sẽ sửa source thêm,
  và một lần regate sau sẽ kiểm tra lại toàn bộ.
- WP5-UX4-REGATE2: NOT VERIFIED, đã dừng sớm và dọn dẹp xong.
  - Đã làm: định danh (`dist/server` chỉ khác ở `auth.js`), `npm test` ba lần không crash, drill
    (208 PASS), AC-13 với ba time zone, test tích hợp, bảng route, audit.
  - E2e đầy đủ với đồng hồ thật lỗi một test: `hover.spec.ts:125` trên mobile, timeout lúc chờ
    style ổn định, không phải lỗi mạng. Lỗi này đưa vào FIX3.
- Đã viết brief WP5-UX4-FIX3. FIX3 đang ở trạng thái `blocked` chờ chủ dự án trả lời R5, mission
  cũng vậy. Phạm vi:
  - R2 a: thêm chặn ở server và ẩn nút ở client;
  - R3 b: trang Review chia hai cột từ 1200px mà không tràn;
  - R5 theo câu trả lời;
  - lỗi timeout của `hover.spec.ts`.

## Cập nhật 2026-10-21: yêu cầu đợt 5 của chủ dự án (WP5-UX5)

- Chủ dự án trả lời R5 b và gửi một yêu cầu lớn cho đợt 5, nguyên văn trên board (`owner_decisions`
  2026-10-21). Nội dung gồm:
  - chế độ compact áp dụng dưới 480px thay vì 768px;
  - thanh trên cùng, vết gạch ở mũi tên combobox, icon, chiều cao nút, nút chuyển theme, khoảng
    trắng trong khoảng giờ;
  - chi tiết thẻ kỳ lương và week sheet của trang Timesheet;
  - Day editor: bỏ bo góc, bấm ra ngoài thì đóng, Partial leave thành hộp thoại con, nút Save cố
    định trên điện thoại;
  - thiết kế lại trang Review và sign off, tách Sign off và Send;
  - thiết kế lại PDF.
- Quyết định của coordinator:
  - FIX3 chạy ngay với R2 a, R5 b và lỗi timeout hover. R3 b bỏ vì không còn cần, do checklist
    chuyển vào hộp thoại sign off.
  - WP5-UX5-PLAN (planner opus, chỉ đọc) chạy song song.
- Câu hỏi WP5-UX5-Q0 cho chủ dự án, kèm hỏi hình mẫu PDF chưa gửi và nội dung giấy phép:
  - (a, khuyến nghị) gộp đợt 4 vào gate và audit của đợt 5;
  - (b) đóng đợt 4 trước.
- Đang chạy: WP5-UX4-FIX3 (worker-high, sonnet) và WP5-UX5-PLAN (planner, opus).
- Chủ dự án trả lời:
  - **Q0 a:** gộp đợt 4 vào gate và audit của đợt 5. Sau FIX3-FREEZE không còn regate, kiểm tra
    lại hay audit tích hợp riêng cho đợt 4.
  - **Q2:** footer "© 2026 C&D Semiconductor Services, Inc. All rights reserved." và "Internal use
    by C&D only".
  - **Q1:** một ảnh mẫu trang PDF. Ảnh có tên và chữ ký thật nên không lưu vào repo (AGENTS
    rule 4). Bố cục của ảnh được mô tả bằng chữ trên board, và đã báo cho planner.
- WP5-UX5-PLAN xong.
  - 34 mục.
  - Đã xác nhận nguyên nhân: bố cục lệch nhau ở 767/768px khi màn hình phóng 150%; vết gạch ở mũi
    tên do hai dải gradient ghép lại; thanh WEEK không đủ rộng; nút "68px" thực ra là vùng chạm 44px
    nhân 150%.
  - Các slice T01 (tách Sign off và Send, rủi ro H) đến T06.
  - Không có migration; không đụng file GOV, trừ khi chủ dự án chọn F-1 c hoặc F-6 b.
  - Mockup kèm 11 ảnh render.
  - Câu hỏi F-1..F-10 cho chủ dự án đang chờ trả lời (`open_owner_question_ux5_f`).
- WP5-UX4-FIX3 vẫn đang chạy.
- Chủ dự án trả lời (nguyên văn trên board):
  - F-1 a, F-2 a, F-6 a, F-7 a, F-8 a, F-10 a;
  - F-3 b: hai công tắc PDF đổi được ở mỗi lần gửi, giá trị mặc định lấy từ Settings;
  - F-4: thông tin gửi (To, Cc, Subject, nội dung) sửa được ở mỗi lần gửi; gửi thêm một bản nữa thì
    phải xác nhận và gõ lý do;
  - F-5 b: ảnh chữ ký không bắt buộc;
  - F-9 b: dùng font viết tay nếu tìm được font có giấy phép phù hợp, nếu không thì theo a.
  - Điều chỉnh mockup: B1, B2, B5, B7/B9 (hai hàng chữ ký; giữ màu nền hàng đầu và cột đầu), B11.
- Đang chạy: Addendum 1 của WP5-UX5-PLAN (cùng planner, chỉ đọc), sửa lại phần B, C, mockup và E.
  FIX3 vẫn là tác vụ duy nhất được sửa source.
- Addendum 1 của WP5-UX5-PLAN xong.
  - Mỗi lần gửi là một bản ghi mới, có thông tin gửi và hai công tắc riêng. Lưu tối đa bốn biến
    thể PDF.
  - Quy tắc lý do: 2-500 ký tự, có ghi audit. Một bản được tính là đã gửi khi có ít nhất một lần
    gửi được chấp nhận hoặc chưa rõ kết quả.
  - Ảnh chữ ký không bắt buộc nữa nên cần migration 0014.
  - Font: Indie Flower (SIL OFL 1.1), kèm ADR 0001.
  - Mockup vẽ lại, 12 ảnh render.
  - Các slice: T01a sign off, T01b gửi, T02 PDF, T03 trang Review, T04 breakpoint, T05 bảng tuần và
    panel ngày, T06 docs. Ước tính 24-28 lượt chạy.
- Câu hỏi WP5-UX5-G-1 cho chủ dự án (duyệt mockup và font) chặn T02..T05. T01a bắt đầu sau
  FIX3-FREEZE.
- WP5-UX4-FIX3 xong.
  - R2 a: xóa phiên qua chia sẻ trả về 409, và client ẩn nút Delete.
  - R5 b: dùng `innerWidth` trừ độ rộng thanh cuộn đo bằng phần tử dò; không còn ép hiện rãnh thanh
    cuộn.
  - Hover: lỗi ở REGATE2 là do máy bị treo khoảng 24 giây, vượt mức chờ 7 giây của vòng thăm dò. Đã
    sửa bằng cách chờ theo sự kiện trong `hover.spec.ts`; 1050/1050 lần đạt trên mobile.
    `contrast.ts` vẫn còn hàm chờ cũ; đợt 5 sẽ xử lý.
  - Kết quả: e2e đầy đủ 0 lỗi; các đột biến đều bị bắt; digest 7af8e935.
- Đang chạy: WP5-UX4-FIX3-FREEZE (một committer mới, chạy một mình). Đây là commit cuối của đợt 4.
- WP5-UX4-FIX3-FREEZE đã commit và push 57c41e8e43fb6e10df654294361818e59bff86ca.
  - 179 đường dẫn; digest 7af8e935 trên HEAD; mọi kiểm tra trả về 0; các lần quét đều sạch.
  - Đợt 4 được gộp vào đợt 5.
- Chủ dự án (nguyên văn trên board): ghi chú mockup lần 2 (B2, B7/B9, B11) và duyệt font Indie
  Flower. Chủ dự án muốn đưa ảnh mẫu cho agent vẽ mockup. Ảnh chỉ được xem từ thư mục tạm của phiên,
  không sao chép, không ghi lại tên hay chữ ký thật.
- Đang chạy song song:
  - WP5-UX5-T01a (worker-high, sonnet; tác vụ sửa source): người ký lấy từ tài khoản, ảnh chữ ký
    không bắt buộc, kèm migration 0014. Việc tách Sign off và Send để cho T01b.
  - Addendum 2 của WP5-UX5-PLAN (planner, chỉ đọc): các ghi chú mockup.
- T01a dừng vì thiếu phạm vi, trước khi sửa file nào. Để compile và chạy verify được, cần thêm năm
  đường dẫn: `ReviewScreen.tsx`, `ReviewEnvelope.tsx`, hai script smoke và drill, và `DEVELOPMENT.md`
  (+ vi).
  - Addendum 1 bổ sung các đường dẫn này, và cho phép gửi `signer_name` nhưng bỏ qua giá trị, để 22
    file test vẫn dùng được.
  - `scripts/precommit-check.mjs` vẫn nằm ngoài phạm vi vì là file GOV; các script còn lại thì
    không phải.
  - Cùng worker đó chạy tiếp.
- Addendum 2 của WP5-UX5-PLAN xong.
  - Đã đo các ngưỡng của B2.
  - B7/B9: đường kẻ thẳng hàng, dài 22rem và 11rem; nút Sign off thụt vào 8px.
  - B11: kiểu chữ đo theo ảnh mẫu, không lưu ảnh. Tiêu đề Serif Condensed Bold 17/18pt, tên thứ
    in đậm dạng small caps, Indie Flower 13pt, các trường thụt vào 54pt, các hàng cao 34/69/16/17pt.
  - Đã vẽ lại ảnh render. Không có câu hỏi mới.
- Điều chỉnh lần 3 của chủ dự án (nguyên văn trên board): trên trang Review và trong hộp thoại Sign
  off, các hàng chữ ký và ngày tương ứng thụt vào 1 tab so với lề trái và 2 tab so với lề phải.
  - Đã ghi thành Addendum 3 của kế hoạch, với 1 tab = 0,5 inch (48px / 36pt).
  - Sẽ áp dụng trong UX5-T03, không vẽ lại mockup. PDF giữ nguyên trừ khi chủ dự án yêu cầu.
- Chủ dự án đính chính điều chỉnh lần 3 (nguyên văn trên board): các hàng chữ ký trên trang Review và
  trong hộp thoại Sign off thụt vào giống bản vẽ PDF B11.
  - Addendum 3b của kế hoạch thay cho quy tắc 1 tab / 2 tab.
  - UX5-T03 sẽ đo tỷ lệ từ bản vẽ B11 và áp dụng bằng token.
- WP5-UX5-T01a xong.
  - Người ký lấy theo tài khoản; `signer_name` bị bỏ qua.
  - Ảnh chữ ký không bắt buộc, qua migration 0014, có test nâng cấp từ v13.
  - Kết quả: e2e đầy đủ 779 đạt, 0 lỗi; 3/3 đột biến bị bắt; digest 783a63f8 (851 file).
  - Chấp nhận một assertion nằm ngoài phạm vi được giao (`history-settings.spec.ts:286`).
  - docs/01 FR-11 chuyển sang T01b.
- Đang chạy: WP5-UX5-T01a-FREEZE (một committer mới, chạy một mình), với 39 đường dẫn.
  - Lần 1 dừng ở bước validator với lỗi "Invalid task ID", vì mã task có chữ "a" viết thường. Đây là
    sơ suất của coordinator.
  - Mã task trên board đã đổi thành WP5-UX5-T01A và WP5-UX5-T01A-FREEZE; tên file giữ nguyên.
  - Cùng committer đó stage lại board và checkpoint, rồi chạy lại mọi kiểm tra (lần 2).
- WP5-UX5-T01A-FREEZE lần 2 đã commit và push c1b2cc4f31cc9a3957a04056a8dff413977b97b5. 60 đường
  dẫn; digest 783a63f8; mọi kiểm tra trả về 0.
- Đang chạy: WP5-UX5-T01B (worker-high, **opus**, override `size_risk`: slice outbox cỡ L, rủi ro H,
  có phần mới). Phạm vi:
  - ký mà không gửi;
  - `revision_sends` và các biến thể PDF (migration 0015);
  - các route send-draft, send và pdf;
  - quy tắc lý do khi gửi lại;
  - tự gửi đúng hạn và nhắc nhở;
  - nối tạm giao diện để luồng hiện tại vẫn chạy;
  - docs/01 FR-11.
- T01B dừng vì thiếu phạm vi, trước khi sửa file nào. Các đường dẫn còn thiếu: các component gửi lại
  ở History, trạng thái vận hành cho quản trị viên (để mỗi bản ghi chỉ ra một dòng dù có nhiều biến
  thể PDF), `submissionSettings.ts`, và `admin-status.spec.ts`.
  - Bổ sung thiết kế đã duyệt: migration 0015 tạo sẵn bản ghi gửi cho mọi job gửi đang có, để bản đã
    gửi trước khi nâng cấp không bị tự gửi lại lúc đến hạn.
  - Addendum 1 thêm các đường dẫn này. Cùng worker đó chạy tiếp.
  - Bài học: trước khi viết danh sách đường dẫn cho một slice, phải liệt kê hết nơi gọi tới mọi hợp
    đồng (API, hàm) bị thay đổi.
- T01B dừng lần thứ hai, cũng trước khi sửa file nào. Sau khi tách Sign off và Send,
  `tests/support/schemaV6.ts` phải tự tạo các job gửi của phiên bản 6.
  - Addendum 2 thêm `tests/support/`, chỉ để chỉnh fixture.
  - Worker giờ bắt đầu viết code.
- WP5-UX5-T01B xong (opus).
  - Ký không còn tự gửi. Mỗi lần gửi là một bản ghi riêng; có các biến thể PDF; có quy tắc lý do.
  - Migration 0015, kèm phần tạo sẵn bản ghi gửi cũ và test nâng cấp.
  - Tự gửi đúng hạn và nhắc nhở theo F-2 a; giao diện được nối tạm.
  - Kết quả: vitest 2261; e2e đầy đủ 779 đạt, 0 lỗi; 5/5 đột biến bị bắt; digest 089cf868 (854 file).
  - Script drill đã sửa nhưng chưa chạy vì cần Docker; gate sẽ chạy.
  - Điểm lệch, đưa thành câu hỏi WP5-UX5-H-1 cho chủ dự án: "đã nộp" nghĩa là bất kỳ bản nào của kỳ
    đã được gửi, nên bản sửa (correction) không tự gửi khi đến hạn.
- Đang chạy: WP5-UX5-T01B-FREEZE (một committer mới), kiểm tập đường dẫn theo quy tắc.
  - Lần 1: classifier chặn lệnh `git add --pathspec-from-file` với lý do "[Credential Leakage]".
    Committer không thử lại và chưa stage gì.
  - Các kiểm tra trước đó đều đạt: digest khớp, 71 đường dẫn đúng quy tắc, các lần quét không có kết
    quả nào.
  - Nguyên nhân có thể: brief của tôi bảo stage từ một file danh sách, nên bước kiểm tra quyền không
    thấy được các đường dẫn; các lần freeze trước đều ghi đường dẫn trực tiếp trong lệnh.
  - Theo bài học đã ghi, không cho cùng agent chạy lại.
  - Hỏi chủ dự án chọn: (a) một committer mới, ghi đường dẫn trực tiếp; hoặc (b) chủ dự án tự commit.
    Mission ở trạng thái `blocked`.
- Chủ dự án trả lời (2026-10-22, nguyên văn "1 a, 2 a"):
  - một committer mới ghi đường dẫn trực tiếp, theo Addendum 1 của brief. Nếu vẫn bị chặn thì dừng và
    chủ dự án tự commit;
  - H-1 a: bản sửa (correction) sau khi đã gửi một bản thì người dùng tự gửi, hệ thống không tự gửi
    khi đến hạn (đúng như đã làm).
  - Mission chuyển về `running`.
- WP5-UX5-T01B-FREEZE lần 2 (committer mới) đã commit và push
  9917ae8443f46cc3fc2dce79214176ff04bc01ba.
  - 96 đường dẫn được stage bằng tên file ghi trực tiếp trong lệnh, không bị chặn lần nào. Digest
    089cf868.
  - Quy tắc từ nay: không stage từ file danh sách.
- Đang chạy: WP5-UX5-T02 (worker-high, sonnet): bố cục PDF theo Addendum 2, file font Indie Flower
  kèm ADR 0001, font dự phòng khi thiếu ký tự, Dockerfile, và sửa test wordmark.
  - Worker liệt kê trước mọi file liên quan và đọc quy tắc precommit.
  - Worker sẽ dừng nếu cần sửa file governance hoặc thiếu đường dẫn.
- T02 dừng ở bước liệt kê, trước khi sửa file nào. `.dockerignore` là danh sách cho phép, nên cần thêm
  dòng `!assets/pdf-fonts/`.
  - Quy tắc precommit không chặn `.ttf` hay `OFL.txt`, nên không phải sửa file governance.
  - Addendum 1 thêm `.dockerignore` (một dòng). Cùng worker đó bắt đầu viết code.
- T02 đã viết xong: cả bốn biến thể PDF đều vừa một trang theo Addendum 2; font Indie Flower có
  SHA-256 và font dự phòng; ADR 0001; bắt được 5/5 đột biến; digest e9a8b42d.
  - E2e có 2 lỗi (`automation.spec.ts:118`, trên desktop và mobile), do test còn đọc chữ của PDF cũ.
  - Addendum 2 cho worker sửa hai assertion đó và chạy lại toàn bộ e2e.
  - Coordinator đã dừng một tác vụ nền `python -` mà worker để sót.
- WP5-UX5-T02 xong.
  - E2e đầy đủ 779 đạt, 0 lỗi, sau một lần chạy lại được phép vì lỗi buffer; npm test 2300; digest
    0f0467ab (862 file).
  - Ghi chú cho audit: `automation.spec.ts:191` giờ chỉ kiểm "VERTIME", còn `:202` không còn kiểm được
    gì. Độ chặt của test cần xem lại.
- Đang chạy: WP5-UX5-T02-FREEZE (một committer mới).
  - 24 đường dẫn ghi trực tiếp, trong đó có một file font, kiểm theo kích thước và mã băm.
- T02-FREEZE lần 1 dừng ở bước `git diff --cached --check`. `OFL.txt:21` có khoảng trắng thừa cuối
  dòng, lấy nguyên từ file gốc. 61 đường dẫn vẫn đang được stage.
  - Tác giả T02 xóa khoảng trắng đó (Addendum 3, không đụng tới git index) và tính lại digest.
  - Sau đó cùng committer đó stage lại và chạy lại các kiểm tra (lần 2).
- Addendum 3 của T02 xong.
  - Đã xóa khoảng trắng thừa trong `OFL.txt`. README và ADR 0001 (EN/VI) đều ghi lại việc này.
  - Test và preflight đạt. Digest mới 1b413273.
  - T02-FREEZE chạy lần 2: stage lại và chạy lại các kiểm tra.
- WP5-UX5-T02-FREEZE xong: b4c500456a69158571799f8f0d90f035fd7a0fa5 trên main, đã push (61
  đường dẫn: 24 ngoài `handoff/`, 37 trong handoff). Digest 1b413273 (862 file) trước khi
  stage và trên HEAD; mọi kiểm tra exit 0.
- Đang chạy: WP5-UX5-T03, trang Review and sign off cùng thẻ Send (worker-high, sonnet;
  cỡ L, rủi ro H; nền b4c5004 / 1b413273; cổng 49720-49739).
  - Brief đặt các câu trả lời F-3 b, F-4, F-5 b của chủ dự án và Addendum 3b lên trên kế
    hoạch B3.
  - Kèm theo: công tắc Settings "Time rows on the PDF", khóa trong file settings, nhãn
    `revision.send` và phần hiển thị lý do trong History.
  - Không giao đường dẫn `src/server` nào. Worker kiểm kê trước và dừng nếu cần đến.
- WP5-UX5-T03 xong (theo báo cáo của worker; gate và audit còn chờ). Không dừng ở bước kiểm kê;
  không đụng tới `src/server`.
  - npm test 2312; FULL e2e 795 đạt, 0 lỗi, không chạy lại; mutant 5/5; verify 0; digest
    d23e3617 (862 file).
  - Các tỉ lệ chữ ký đo từ mockup B11 và từ `layout.ts` khớp hoàn toàn.
  - Điểm lệch:
    - ô "From" hiện chữ giữ chỗ khi chưa có revision;
    - "PDF Preview" mở ở tab mới, vì CSP cấm nhúng khung;
    - `App.tsx` tải trễ trang Review, để giữ giới hạn kích thước chunk;
    - worker đã stage hai file bị xóa bằng `git rm --cached` để script digest chạy được.
  - Lỗi quy tắc: một heredoc, một `/dev/null`.
- Đang chạy: tra cứu WP5-UX5-T03-PATHS (light, haiku, chỉ đọc). Nó liệt kê chính xác các
  đường dẫn cho brief T03-FREEZE.
- T03-PATHS xong. Ngoài `handoff/`: 28 file sửa, 2 file mới và 2 file xóa đã được stage
  sẵn. Ngoài ra không có gì được stage. Không có đường dẫn nào nằm ngoài phạm vi được giao,
  và không có file nhị phân.
- Đang chạy: WP5-UX5-T03-FREEZE (một committer mới, chạy một mình). Nó stage 32 đường dẫn
  ghi rõ tên cùng các hồ sơ trong handoff; digest phải là d23e3617.
- WP5-UX5-T03-FREEZE xong: 65def2f61b6cb82e8c23cb01c15e787d2d0b1c14 trên main, đã push (56
  đường dẫn: 32 ngoài `handoff/`, 24 trong handoff). Digest d23e3617 (862 file) trước khi
  stage và trên HEAD; mọi kiểm tra exit 0. Lỗi quy tắc: một `2>/dev/null` và một `| head`.
- Đang chạy: WP5-UX5-T04, breakpoint, top bar và period card (worker-high, sonnet; cỡ L,
  rủi ro H; nền 65def2f / d23e3617; cổng 49740-49759).
  - Gồm U5-01, U5-02, U5-08 đến U5-15, U5-22 và khoảng cách B1.
  - F-6 a: chỉ dạng compact của tờ timesheet chuyển xuống dưới 480px. Khung điều hướng,
    Day editor, hộp thoại và quy tắc 44px vẫn ở 768px.
  - U5-14 với H-1 a: nút Review là nút primary khi một kỳ đã kết thúc vẫn cần người dùng
    xử lý, và trở lại secondary khi có bất kỳ revision nào của kỳ đó đã được gửi.
  - Không giao đường dẫn `src/server` nào.
- WP5-UX5-T04 xong (theo báo cáo của worker; gate và audit còn chờ). Không dừng ở bước kiểm
  kê; không đụng tới `src/server`.
  - npm test 2333; FULL e2e 809 đạt, 0 lỗi, không chạy lại; mutant 5/5; verify 0; digest
    2ba69f62 (867 file).
  - Mọi media query đều viết theo cú pháp khoảng; có một test vitest buộc điều đó.
  - Các độ rộng lẻ (479.33, 767.33) chỉ được chứng minh trên nội dung stylesheet, vì trình
    duyệt không đặt được viewport có độ rộng lẻ.
  - Điểm lệch:
    - ở chế độ xem được chia sẻ, tên công ty hiện từ 492px chứ không phải khoảng 250px,
      để không bao giờ làm thanh trên cùng thêm một hàng;
    - các ngưỡng của period card là số đo thật: 600px, cộng thêm 138px khi có Current
      period.
  - Lỗi quy tắc: ba heredoc rỗng, hai `/dev/null`, một `| head`, và các file thử tạm
    `zz-*` trong `tests/e2e/`, đã gỡ trước các lần chạy đầy đủ.
  - Để lại cho T05: U5-16, U5-21, nhãn liên kết ở dòng chữ ký trên Timesheet, và các chú
    thích cũ ghi 768-899.
- Đang chạy: tra cứu WP5-UX5-T04-PATHS (light, haiku, chỉ đọc), có kiểm tra file `zz-*`.
- T04-PATHS xong. Ngoài `handoff/`: 20 file sửa, 5 file mới, 0 file xóa. Không có gì được
  stage. Không có đường dẫn nào nằm ngoài phạm vi được giao, không có file nhị phân, không có
  file `zz-*`.
- Đang chạy: WP5-UX5-T04-FREEZE (một committer mới, chạy một mình). Nó stage 25 đường dẫn
  ghi rõ tên cùng các hồ sơ trong handoff; digest phải là 2ba69f62.
- WP5-UX5-T04-FREEZE xong: 060302bcb41050c116e2519602f303c3a11cb01d trên main, đã push (58
  đường dẫn: 25 ngoài `handoff/`, 33 trong handoff). Digest 2ba69f62 (867 file) trước khi
  stage và trên HEAD; mọi kiểm tra exit 0; không báo lỗi quy tắc nào.
- Quyết định của điều phối viên: tách UX5-T05 làm hai.
  - **T05A:** tờ timesheet, thanh công cụ và các control, kèm các việc T04 để lại, helper
    chờ ổn định trong `contrast.ts` và các assertion PDF trong `automation.spec.ts`.
  - **T05B:** Day editor (U5-23 đến U5-26).
- Đang chạy: WP5-UX5-T05A (worker, sonnet; cỡ L, rủi ro M; nền 060302b / 2ba69f62; cổng
  49760-49779).
  - Các mục: U5-03 đến U5-07, U5-16 đến U5-21 và U5-17b.
  - F-1 a: nút con cao 36px khi nhìn, kèm vùng chạm vô hình 44px dưới 768px và khi dùng
    con trỏ thô (cảm ứng).
  - Trong `src/domain/policy.ts` và PDF chỉ được đổi chữ hiển thị khoảng giờ, nếu có.
- WP5-UX5-T05A xong (theo báo cáo của worker; gate và audit còn chờ). Không dừng ở bước kiểm
  kê.
  - npm test 2344; mutant 5/5; verify 0; digest 66574877 (867 file).
  - FULL e2e lần 2, sau thay đổi cuối: 845 đạt và 1 lỗi bộ đệm trên mobile. Riêng test đó
    được chạy lại một mình và đạt; không chạy lại toàn bộ.
  - PDF không in khoảng giờ nào, nên `timesheetPdf.ts` không bị đụng tới.
  - Các ngưỡng được đo lại. Có thêm cách cho xuống dòng với khoảng giờ kết thúc "+1" ở ô
    hẹp nhất trên điện thoại.
  - Nhiều lỗi quy tắc khi chạy lệnh. Một lệnh `python -` bị treo ở nền; điều phối viên đã
    dừng agent worker (đã xong việc) để chấm dứt nó.
  - Ghi chú cho audit:
    - header của trang Review không xuống dòng (`nowrap`), trái với U5-16;
    - test 44x44 đã bị sửa;
    - chỉ chạy lại một phần;
    - cách ghi kết quả đối chiếu song ngữ docs/04.
- Đang chạy: tra cứu WP5-UX5-T05A-PATHS (light, haiku, chỉ đọc).
- T05A-PATHS xong. Ngoài `handoff/`: 32 file sửa, không có file mới hay bị xóa. Không có gì
  được stage. Không có gì nằm ngoài phạm vi cho phép hay trong `src/server`, và không có
  file `zz-*`.
- Đang chạy: WP5-UX5-T05A-FREEZE (một committer mới, chạy một mình). Nó stage 32 đường dẫn
  ghi rõ tên cùng các hồ sơ trong handoff, kể cả bản nháp brief T05B; digest phải là
  66574877.
- WP5-UX5-T05A-FREEZE xong: 70f7800b9c1582cffee453ac0bc8c741418f6f99 trên main, đã push (56
  đường dẫn: 32 ngoài `handoff/`, 24 trong handoff). Digest 66574877 (867 file) trước khi
  stage; mọi kiểm tra exit 0.
  - Điểm lệch: sau commit, committer tính lại digest của cây làm việc thay vì digest
    `git ls-tree` của HEAD. Phần ngoài `handoff/` đã sạch; gate sẽ ghi lại định danh của
    HEAD.
- Đang chạy: WP5-UX5-T05B, Day editor (worker-high, sonnet; cỡ M, rủi ro H; nền 70f7800 /
  66574877; cổng 49780-49799).
  - Các mục: U5-23 (panel không bo góc), U5-24 với F-7 a (bấm ra ngoài thì đóng, có hỏi
    trước khi bỏ thay đổi; các nút vẫn giữ hành động riêng), U5-25 (hộp thoại con
    Partial leave; Notes vẫn ở lại, B5) và U5-26 (điện thoại: bỏ Figures, nút Save cố
    định).
- WP5-UX5-T05B xong (theo báo cáo của worker; gate và audit còn chờ). Không dừng ở bước kiểm
  kê; không đụng tới `src/server`.
  - npm test 2345; FULL e2e 859 đạt, 0 lỗi, không chạy lại; mutant 5/5; verify 0; digest
    a5dcb5a6 (868 file; thêm file mới `LeaveDialog.tsx`).
  - Không dùng lại `LeaveRow.tsx`, vì đó là dòng yêu cầu nghỉ bằng OT.
  - Các handler bấm ra ngoài gọi `preventDefault`, để focus quay về nút của ngày.
  - Không báo lỗi quy tắc nào.
  - Ghi chú cho audit:
    - sau khi lưu từ nút cố định ở chân sheet trên điện thoại mà phần thân đang cuộn xuống,
      thông báo "đã lưu" được đọc lên nhưng không nằm trong tầm nhìn;
    - bấm vào chỗ trống trên thanh trên cùng sẽ đóng panel.
- Đã soạn sẵn brief: WP5-UX5-T06 (docs/04, docs/12, pilot packet và bộ mẫu mới).
- Đang chạy: tra cứu WP5-UX5-T05B-PATHS (light, haiku, chỉ đọc).
- T05B-PATHS xong. Ngoài `handoff/`: 11 file sửa, 1 file mới (`LeaveDialog.tsx`), 0 file
  xóa. Không có gì được stage, và không có đường dẫn ngoài phạm vi cho phép, file nhị phân hay
  file `zz-*` nào.
- Đang chạy: WP5-UX5-T05B-FREEZE (một committer mới, chạy một mình). Nó stage 12 đường dẫn
  ghi rõ tên cùng các hồ sơ trong handoff, kể cả bản nháp brief T06. Digest phải là
  a5dcb5a6, kiểm tra trên HEAD bằng `git ls-tree`.
- WP5-UX5-T05B-FREEZE xong: 69d63400486a977f10e022deea85026c6751b687 trên main, đã push (26
  đường dẫn: 12 ngoài `handoff/`, 14 trong handoff). Digest a5dcb5a6 (868 file) trước khi
  stage và từ `git ls-tree` của HEAD; mọi kiểm tra exit 0. Cả năm slice mã nguồn của đợt 5
  đều đã được freeze.
- Đang chạy: WP5-UX5-T06, tài liệu và pilot packet (worker, sonnet; cỡ L, rủi ro M; nền
  69d6340 / a5dcb5a6; cổng 49800-49819).
  - Gồm docs/04 và docs/12 (EN/VI), pilot packet (EN/VI), và bộ mẫu tổng hợp mới tạo từ
    bản export sạch của 69d6340, ở chế độ capture.
  - Định danh bản phát hành và số liệu drill để lại cho ACCEPT-DOCS. Không đổi mã nguồn:
    digest phải giữ nguyên a5dcb5a6.
- Đính chính của điều phối viên trong lúc T06 chạy: digest có tính cả `docs/` (chỉ loại
  `handoff/`), nên các thay đổi tài liệu của T06 sẽ làm digest đổi. Đã gửi bằng tin nhắn và
  ghi lại thành Addendum 1.
- T06 bàn giao lần đầu.
  - Tài liệu đã cập nhật: docs/04, docs/12 và docs/11 (EN/VI; docs/07 không cần sửa), và
    pilot packet (EN/VI).
  - Bộ mẫu tạo từ bản export sạch của 69d6340: S1-S6 và N1-N5. Có sáu PDF một trang với
    hash khớp, và kiểm tra ready cho thấy schema 15.
  - parity x4, preflight và self-test của precommit đều đạt. Digest 318b3370 (868 file),
    chỉ đổi do sáu file tài liệu.
  - Thiếu sót: mục 8 của packet chưa có hai câu trả lời của chủ dự án trong đợt 5, Q1 (hình
    tham chiếu) và Q2 (chữ ở chân trang).
- Đang chạy: Addendum 1 của T06 (cùng worker) bổ sung hai dòng đó.
- Đã soạn sẵn brief: WP5-UX5-GATE (gate của đợt 4 và đợt 5).
- WP5-UX5-T06 xong sau Addendum 1: mục 8 của packet đã có hai dòng Q1 và Q2 (EN/VI).
  Parity của packet OK, preflight PASS, `git diff --check` 0. Digest 318b3370 (868 file),
  addendum không làm digest đổi.
- Đang chạy: tra cứu WP5-UX5-T06-PATHS (light, haiku, chỉ đọc).
- T06-PATHS xong. Ngoài `handoff/`: 6 file tài liệu, đều là file sửa. Không có gì được
  stage, và không có file `zz-*`. Trong `handoff/`, file nhị phân duy nhất là sáu ảnh
  `-synthetic.png`.
- Đang chạy: WP5-UX5-T06-FREEZE (một committer mới, chạy một mình). Nó stage 6 đường dẫn
  tài liệu cùng các hồ sơ trong handoff, gồm cặp pilot packet và bản nháp brief gate. Digest
  phải là 318b3370, kiểm tra trên HEAD bằng `git ls-tree`.
- WP5-UX5-T06-FREEZE xong: e2bf1aab4ef65d496de6672c7986e27db04ddb39 trên main, đã push (55
  đường dẫn). Digest 318b3370 (868 file) trước khi stage và từ `git ls-tree` của HEAD; mọi
  kiểm tra exit 0. Mọi slice của đợt 5 đã được freeze; e2bf1aa là bản chụp cuối của gói.
- Giai đoạn `ux5-gate`. Đang chạy: WP5-UX5-GATE (verifier, sonnet; cỡ L, rủi ro H; đích
  e2bf1aa / 318b3370; nền 8e55710 / 507de97c; cổng 49820-49859; Compose project
  `ts-wp5-ux5gate`).
  - Gate kiểm cả đợt 4 và đợt 5: gate WP5 với lần drill đầu tiên của đợt 5, ranh giới và
    phạm vi, dữ liệu / gửi / PDF, đồng hồ giả lập, kiểm lại các điểm của đợt 4, kiểm giao
    diện của đợt 5, axe, CSP và ảnh chụp màn hình.
  - Không writer nào chạy trong lúc gate chạy.
- Đã soạn sẵn brief cho sau khi gate PASS: WP5-UX5-AUDIT-A (giao diện, khung điều hướng,
  Timesheet, Day editor, giao diện Review, khả năng tiếp cận, F-UX4A-1..4) và
  WP5-UX5-AUDIT-B (sign off và gửi, dữ liệu, migration, PDF, font, quyền riêng tư, tài
  liệu, F-UX4B-1). Cả hai do auditor opus/xhigh mới làm trên e2bf1aa / 318b3370, chạy song
  song; audit tích hợp đi sau.
- WP5-UX5-GATE: **FAIL** (NAS NOT VERIFIED). Digest 318b3370 khớp ở cả ba dạng.
  - **Drill `--wp3`:** 203 PASS / 6 FAIL. Lệnh sign off của drill thiếu `signer_name`, mà
    bản build trước bắt buộc phải có, nên bước nâng cấp có dữ liệu không được chạy thử.
  - **Quét với đồng hồ giả lập:** bốn lỗi test phụ thuộc vào ngày hoặc giờ mùa hè (DST):
    - `day-editor.spec.ts:6357`;
    - `today.spec.ts:990` và `:455`;
    - `timesheet.spec.ts:2040`.
  - **axe:** `scrollable-region-focusable` trên trang History. Lỗi có từ trước, giống hệt
    trên BASE_SHA.
  - **Đạt:** mọi mục còn lại. Gồm FULL e2e trên đồng hồ thật (859/0), npm test x3,
    migration 13 lên 15 kèm backfill, sao lưu và khôi phục, gửi và lý do, hạn chót và
    nhắc nhở, bốn biến thể PDF một trang có Indie Flower, phạm vi, bảng route, CSP, các độ
    rộng lẻ (đã đạt tới được), kiểm lại các điểm của đợt 4 và 38/40 lượt quét axe.
- Giai đoạn `ux5-fix`. Đang chạy: WP5-UX5-FIX1 (worker-high, sonnet; cỡ M, rủi ro M; nền
  e2bf1aa / 318b3370; cổng 49920-49939; Compose project `ts-wp5-ux5fix1`).
  - Sửa nội dung lệnh sign off của drill cho bản build trước, sửa bốn test, và làm cho các
    vùng cuộn của History nhận được focus và có tên.
  - Bằng chứng cần có: drill 0 FAIL; bốn test 0 lỗi ở cả sáu thời điểm và trên đồng hồ
    thật; axe trên History 0; FULL e2e 0 lỗi.
- WP5-UX5-FIX1 xong (theo báo cáo của worker; regate còn chờ). Mỗi phát hiện đều được tái
  hiện trước khi sửa.
  - **Drill:** chỉ gửi `signer_name` cho bản build trước. 209 PASS / 0 FAIL, và giai đoạn 4
    giờ sign off được hai kỳ trước khi nâng cấp.
  - **Bốn test:** giờ làm theo quy tắc của T04 dựa trên số đo, và dùng một phiên làm việc
    vắt qua nửa đêm ở cả giờ mùa hè lẫn mùa đông. 0 lỗi ở cả sáu thời điểm và trên đồng
    hồ thật; các mutant của assertion cũ đều fail.
  - **History:** thành phần mới `TableWrap.tsx` thay cho cả bảy chỗ dùng `.table-wrap`. Bảng
    nào tràn ngang sẽ thành một vùng có tên và nhận được focus. Axe trên History 0, kèm
    test mới `history-a11y.spec.ts`.
  - FULL e2e: desktop 458 và mobile 403 đạt, 0 lỗi. Verify 0. Digest 70975091 (870 file).
- Đang chạy: tra cứu WP5-UX5-FIX1-PATHS (light, haiku, chỉ đọc).
- FIX1-PATHS xong, nhưng một lần kiểm tra quyền đã chặn việc ghi Results vào brief của nó.
  Danh sách đầy đủ nằm trong thư mục tác vụ, còn board giữ bản tóm tắt.
  - Ngoài `handoff/`: 11 file sửa, 2 file mới, không có gì được stage, không có gì trong
    `src/server` hay `src/domain`.
  - Trong `handoff/`: 5 file sửa và 344 file mới, phần lớn là bằng chứng của gate và
    FIX1.
- Đang chạy: WP5-UX5-FIX1-FREEZE (một committer mới, chạy một mình). Nó stage 13 đường dẫn
  ghi rõ tên, các hồ sơ trong handoff, và ba thư mục bằng chứng dưới dạng thư mục. Digest
  phải là 70975091, kiểm tra trên HEAD bằng `git ls-tree`.
- WP5-UX5-FIX1-FREEZE xong ở lần 3: 2bce0ab5842b80c710f23496d5173c122319e5c7 trên main, đã
  push (363 đường dẫn). Digest `git ls-tree` của HEAD là 70975091 (870 file); mọi kiểm tra
  exit 0.
  - Lần 1: quy tắc `private-media` của precommit chặn file log của gate
    `13-integ-signatures.txt`. File đã được đổi tên thành `-synthetic.txt`.
  - Lần 2: các validator từ chối board. Lỗi của điều phối viên: FIX1 phụ thuộc vào gate
    FAIL. Giờ FIX1 phụ thuộc vào T06-FREEZE và ghi tên gate trong `addresses_gate`.
- Giai đoạn `ux5-regate`. Đang chạy: WP5-UX5-REGATE (verifier, sonnet; cỡ M, rủi ro H; đích
  2bce0ab / 70975091; cổng 49940-49979; Compose project `ts-wp5-ux5regate`).
  - Nội dung kiểm tra: định danh và phạm vi so với e2bf1aa; `dist/server` và `dist/domain`
    giống hệt từng byte, nên các mục kiểm tra phía server được giữ lại từ gate trước;
    phần lõi; drill; e2e trên đồng hồ thật và đồng hồ giả lập; axe trên mọi màn hình có
    `.table-wrap`; và bốn test đã sửa.
- Regate bị gián đoạn sớm vì phiên đăng nhập hết hạn (API 401), khi verifier mới đang đọc
  script. Chủ dự án đã đăng nhập lại. Cùng agent đó được cho chạy tiếp: nó kiểm tra phần còn
  sót lại trước, rồi làm tiếp.
- WP5-UX5-REGATE: **FAIL** trên 2bce0ab / 70975091, theo quy tắc lỗi không phải lỗi mạng thì
  ghi nhận nguyên trạng.
  - **Đạt:**
    - định danh: chỉ có 13 đường dẫn của FIX1, `dist/server` và `dist/domain` giống hệt
      từng byte;
    - phần lõi, npm test x3, các validator và các file integration;
    - drill 209/0 ở lần chạy lại, giai đoạn 4 sign off được hai kỳ;
    - FULL e2e trên đồng hồ thật, 458 + 403 đạt, 0 lỗi;
    - axe 0 ở mọi chỗ;
    - bốn test đã sửa không bị làm yếu đi.
  - **Quét với đồng hồ giả lập:** sáu trên bảy lượt chạy 0 lỗi. Có một lỗi:
    - `theme.spec.ts:605` trên mobile, lượt FULL lúc 2026-11-01T08:45Z: `--shell-bar-size`
      là 112 trong khi thanh trên cùng vẽ ra cao 60;
    - không tái hiện được trong 3 lần chạy riêng lẻ và một lần chạy lại toàn bộ.
  - **Còn sót lại:** cây tiến trình Node/Playwright bị treo của lượt quét đầu và hai shell
    đang chờ, có từ trước lúc gián đoạn, có thể vẫn còn chạy; chưa dừng chúng (không được
    kill theo PID).
- Lỗi của điều phối viên, đã sửa: một lần sửa REGATE làm tác vụ tạm tách ra thành một object
  giữ chỗ thừa; đã gộp lại trước khi giao việc tiếp.
- Đang chạy: WP5-UX5-DIAG1 (planner, sonnet; chỉ đọc; cổng 49980-49999).
  - Tìm chỗ ghi và chỗ đọc `--shell-bar-size`, tái hiện giá trị cũ khi máy chịu tải ở thời
    điểm đó, và phân loại là lỗi test hay lỗi sản phẩm, kèm cách sửa nhỏ nhất.
  - Đồng thời liệt kê các tiến trình còn sót của regate, nhưng không dừng chúng.
- Lần freeze tới phải đổi tên `13-integ-signatures.txt` của regate (theo quy tắc
  precommit).
- WP5-UX5-DIAG1 xong: đây là **lỗi của test**.
  - ResizeObserver ghi `--shell-bar-size` chậm một đến vài khung hình sau khi thanh đổi kích
    thước (1-35 ms, 67 ms khi giảm tốc CPU 10 lần). Chỗ đọc giá trị này chỉ là CSS, người
    dùng không thấy lỗi gì.
  - `expectBudget` đọc thanh và thuộc tính trong hai lượt gọi riêng.
  - Không tái hiện được qua khoảng 560 lần chạy. Không còn tiến trình nào của regate đang
    chạy.
  - Phần gia cố tùy chọn (theo dõi border box): chưa làm lúc này (quyết định của điều phối
    viên); chuyển cho Audit A như một rủi ro tùy chọn.
- Đang chạy: WP5-UX5-FIX2 (worker, sonnet; chỉ sửa test; cổng 50000-50019).
  - Dùng `expect.poll` trên một lượt gọi trong `theme.spec.ts` và `shell.spec.ts`, và thêm
    một test tất định.
  - Bằng chứng cần có: repeat-each=40 ở 2026-11-01T08:45Z, một mutant, và FULL e2e.

### Tạm dừng để khởi động lại máy (2026-10-22)

- **Việc tạm dừng.** Chủ dự án yêu cầu tạm dừng và lưu mọi thứ để khởi động lại máy. Điều
  phối viên đã dừng worker WP5-UX5-FIX2 (agent ac23550fd8a51aab2) bằng TaskStop khi nó đang
  sửa code. Nó chưa ghi Results.
- **Trạng thái board:**
  - trạng thái nhiệm vụ `paused_usage`, kèm `pause_note` ghi rõ đây là khởi động lại máy,
    không phải hết hạn mức sử dụng; đó là trạng thái tạm dừng duy nhất board có;
  - giai đoạn `ux5-fix2`;
  - WP5-UX5-FIX2 ở trạng thái `interrupted`, kèm ghi chú gián đoạn;
  - next_task_id là WP5-UX5-FIX2;
  - `current_source_digest` vẫn là 507de97c (bản đã nghiệm thu gần nhất, 8e55710).
- **Git.** Commit đã push gần nhất là 2bce0ab5842b80c710f23496d5173c122319e5c7
  (WP5-UX5-FIX1-FREEZE; digest 70975091, 870 file). Không có commit nào ở máy mà chưa push.
- **Phần chưa commit kể từ 2bce0ab:**
  - có thể có thay đổi dở dang của FIX2 trong `tests/e2e/theme.spec.ts`, `shell.spec.ts`
    và `day-editor.spec.ts` (chỉ trong các đường dẫn được giao cho FIX2);
  - hồ sơ của điều phối viên trong `handoff/`: board, STATE.json, NEXT_ACTION (+ vi), cặp
    checkpoint này, `tasks/WP5-UX5-FIX1-FREEZE.md` (Results và các addendum);
  - `tasks/WP5-UX5-REGATE.md` (Results), `tasks/WP5-UX5-DIAG1.md`, `tasks/WP5-UX5-FIX2.md`;
  - bản nháp `tasks/WP5-UX5-REGATE2.md`, và các bản nháp AUDIT-A, AUDIT-B (đã trỏ đích sang
    2bce0ab);
  - các thư mục bằng chứng `WP5-UX5-FIX1-FREEZE`, `WP5-UX5-REGATE` (file
    `13-integ-signatures.txt` trong đó phải đổi tên thành `-synthetic` ở lần freeze tới) và
    `WP5-UX5-DIAG1`.
- **Phần còn sót.** Không còn tiến trình nào của regate đang chạy (DIAG1 đã kiểm tra), và
  không có cổng nào trong dải của tác vụ bị giữ. Server và trình duyệt riêng của worker
  FIX2 sẽ tắt theo khi khởi động lại máy.
- **Các bước để tiếp tục:**
  1. Mở phiên làm việc (`claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`, hoặc một
     phiên mới với prompt khởi động trong NEXT_ACTION). Đặt lại trạng thái nhiệm vụ thành
     `running`.
  2. Giao WP5-UX5-FIX2 lần 2 cho một worker mới, dùng cùng brief. Worker ghi lại HEAD,
     `git status` và diff của các file test được giao trước tiên. Chỉ giữ thay đổi dở dang
     nếu nó khớp với brief; nếu không thì khôi phục các file đó về HEAD (chỉ trong các
     đường dẫn được giao). Sau đó làm cho xong brief.
  3. Tiếp theo: tra cứu danh sách đường dẫn và WP5-UX5-FIX2-FREEZE, kèm đổi tên
     `13-integ-signatures.txt` của regate. Rồi WP5-UX5-REGATE2 (điền phần Target).
  4. Sau đó: AUDIT-A và AUDIT-B chạy song song, đích là bản freeze của FIX2. Rồi audit tích
     hợp, ACCEPT-DOCS (định danh của pilot packet, WP5 handoff) và nghiệm thu lại WP5.
- **Việc của chủ dự án còn mở:** không có việc nào chặn tiến độ. D-1..D-15 của pilot packet
  để lại cho giai đoạn pilot.

### Đã tiếp tục (2026-10-22, sau khi khởi động lại máy)

- Chủ dự án nói "tiếp tục" trong cùng phiên điều phối. Trạng thái nhiệm vụ trở lại
  `running`.
- Đang chạy: WP5-UX5-FIX2 lần 2 (một worker mới, sonnet; Addendum 1 của brief).
  - Trước tiên nó ghi lại HEAD, `git status` và diff của các file test được giao.
  - Nó chỉ giữ thay đổi dở dang của lần 1 nếu khớp với brief; nếu không thì khôi phục ba
    file đó về HEAD.
  - Sau đó nó làm cho xong brief, trong thư mục tác vụ `WP5-UX5-FIX2-a2`.

### Tạm dừng lần nữa để khởi động lại máy (2026-10-22, lần thứ hai)

- **Việc tạm dừng.** Chủ dự án lại yêu cầu tạm dừng và lưu mọi thứ để khởi động lại máy.
  Điều phối viên đã dừng FIX2 lần 2 (agent a0c1d387b29545038) bằng TaskStop khi nó đang
  chạy test. Nó chưa ghi Results.
- **Board:**
  - trạng thái nhiệm vụ `paused_usage`, ghi chú tạm dừng đã được cập nhật;
  - WP5-UX5-FIX2 ở trạng thái `interrupted`, kèm ghi chú `interruption_2`;
  - next_task_id là WP5-UX5-FIX2.
- **Git:** không đổi so với lần tạm dừng đầu. Commit đã push gần nhất là 2bce0ab (digest
  70975091), và không có commit nào ở máy mà chưa push.
- **Phần chưa commit:**
  - giống danh sách trong mục "Tạm dừng để khởi động lại máy (2026-10-22)" ở trên;
  - có thể có thay đổi dở dang của FIX2 trong ba file test được giao;
  - Addendum 1 của brief, nay áp dụng cả cho lần 3.
- **Các bước để tiếp tục:**
  1. Mở lại phiên và đặt trạng thái nhiệm vụ thành `running`.
  2. Giao FIX2 lần 3 cho một worker mới, dùng cùng brief (Addendum 1; thư mục tác vụ
     `WP5-UX5-FIX2-a3`).
  3. Tiếp tục lộ trình: tra cứu đường dẫn và FIX2-FREEZE (kèm đổi tên
     `13-integ-signatures.txt` của regate), REGATE2, audit A và B, audit tích hợp,
     ACCEPT-DOCS và nghiệm thu lại WP5.

### Đã tiếp tục lần nữa (2026-10-22, sau lần khởi động lại thứ hai)

- Chủ dự án nói "tiếp tục". Trạng thái nhiệm vụ trở lại `running`.
- Đang chạy: WP5-UX5-FIX2 lần 3 (một worker mới, sonnet; Addendum 1 của brief; thư mục tác
  vụ `WP5-UX5-FIX2-a3`).
- WP5-UX5-FIX2 xong ở lần 3 (theo báo cáo của worker; regate còn chờ).
  - Chỉ sửa test: lệnh poll trong `theme.spec.ts` và `shell.spec.ts`, cùng một test tất
    định. Phần sửa dở của lần 1 và lần 2 khớp với brief nên được giữ lại.
  - FULL e2e 863 đạt, 0 lỗi. Mutant làm 7 test fail.
  - Lần chạy lặp cả hai spec (repeat-each=40, 14 worker) không đạt 0 lỗi (19, rồi 8, trên
    6272): đều là timeout và lỗi bộ đệm ở các test không liên quan, do máy quá tải. Lần
    chạy lặp nhắm riêng các test về chiều cao thanh đạt 1360/0.
  - Digest 3ca01b9c (870 file).
- **Thông tin mới từ worker FIX2:**
  - `origin/main` đang ở 70dce2a, đi trước HEAD 2bce0ab. Các commit mới đến từ bên ngoài
    nhiệm vụ và chạm vào `.github`, docs, `ingat.toml` và `handoff`.
  - Một bản checkout chưa được git theo dõi, `.claude/worktrees/relaxed-lalande-8359f0/`,
    chứa một file font làm `wordmarkAsset.test.ts` fail khi chạy `npm run verify` ngay
    trong repo; chạy trong bản export sạch thì đạt.
- Đang chạy: tra cứu chỉ đọc WP5-UX5-REMOTE-RECON (verifier, sonnet). Nó ghi lại các commit,
  phần trùng với công việc chưa commit của nhiệm vụ, trạng thái và việc sử dụng của
  worktree, cùng các phương án. Không freeze tiếp cho đến khi chủ dự án quyết định cách
  gộp chúng.
- WP5-UX5-REMOTE-RECON xong.
  - **Hai commit tạo bên ngoài nhiệm vụ, cùng danh tính tác giả với 2bce0ab:**
    - 6173f07, "ci(deploy): add the Ingat manifest and the GHCR image workflow": 203 file
      (`ingat.toml`, hai file trong `.github/workflows`, docs 07 và 11 (+vi), ADR 0002
      (+vi), hồ sơ INGAT);
    - 70dce2a: chỉ có handoff.
  - Không đụng đường dẫn quản trị nào, và không trùng với phần chưa commit của nhiệm vụ:
    fast-forward sẽ không gây xung đột.
  - **Worktree** `.claude/worktrees/relaxed-lalande-8359f0`:
    - nhánh `claude/relaxed-lalande-8359f0`, chỉ có ở máy, đang ở 70dce2a;
    - có thay đổi chưa commit (một hồ sơ INGAT-T0T8), được bỏ qua qua `.git/info/exclude`;
    - không có gì đang dùng nó.
  - Digest không bị ảnh hưởng. `wordmarkAsset.test.ts:135-140` duyệt cả thư mục này nên
    thấy file font trong đó.
- **Đang chờ chủ dự án:** câu hỏi WP5-UX5-REMOTE-Q.
  - A: gộp các commit bằng fast-forward trước khi freeze FIX2 (khuyến nghị), hoặc audit cả
    chúng, hoặc chờ.
  - B: test quét font bỏ qua `.claude/` (khuyến nghị), hoặc chủ dự án gỡ worktree.
  - C: việc push lên main có được phép khởi chạy workflow GHCR mới hay không.
- **Câu trả lời của chủ dự án (nguyên văn): "A.a, B.A, C.b".**
  - **A a:** lần freeze FIX2 trước hết đưa main ở máy tiến lên origin/main 70dce2a
    (fast-forward), rồi mới commit. Các file Ingat được coi là việc của chủ dự án, nằm ngoài
    đợt 4 và 5, chỉ kiểm tra là chúng không gây ảnh hưởng.
  - **B a:** test quét font bỏ qua `.claude/`.
  - **C b:** không push cho đến khi chủ dự án cho phép. Các commit nằm lại ở máy
    (`push_hold` trên board).
- Đang chạy: Addendum 2 của FIX2 (cùng worker). Nó cho phần duyệt font trong
  `wordmarkAsset.test.ts` bỏ qua `.claude/`, rồi chứng minh:
  - `npm run verify` đạt ngay trong repo khi worktree vẫn còn đó;
  - một mutant có font lạ vẫn làm test fail.
- Các bước tiếp theo:
  1. một lần tra cứu đường dẫn ngắn;
  2. FIX2-FREEZE: fast-forward, commit, đổi tên file log chữ ký của regate, **không
     push**;
  3. REGATE2 trên commit ở máy;
  4. audit A và B.
- Addendum 2 của FIX2 xong.
  - `wordmarkAsset.test.ts:134` bỏ qua `.claude`.
  - `npm run verify` đạt ngay trong repo khi worktree vẫn còn đó.
  - Mutant có font lạ vẫn làm test fail.
  - Digest 7ad771b5 (870 file, trên nền 2bce0ab cộng các thay đổi test của FIX2).
- Đang chạy: tra cứu WP5-UX5-FIX2-PATHS (light, haiku, phần Results ngắn).
- FIX2-PATHS xong. Danh sách nằm trong thư mục tác vụ; agent không ghi Results vào brief.
  - Ngoài `handoff/`: 3 file test.
  - Trong `handoff/`: 10 file sửa và 199 file mới, nằm trong 4 thư mục bằng chứng và 5 hồ
    sơ tác vụ.
  - Không trùng với HEAD..origin/main. Có một file log có chữ "signature" trong tên cần
    đổi tên.
- Đang chạy: WP5-UX5-FIX2-FREEZE (một committer mới, chạy một mình). Các bước:
  1. fetch và kiểm tra trùng lặp;
  2. `git merge --ff-only origin/main` (A a);
  3. stage, đổi tên, kiểm tra precommit và chạy các validator;
  4. **commit ở máy, không push** (C b).

  Digest `ls-tree` của HEAD phải bằng digest tính ngay sau fast-forward.
- WP5-UX5-FIX2-FREEZE xong: **7aafa21bc1c6efc70c0fa8691c3a1165841aeb45 trên main, CHƯA
  push** (C b).
  - Fast-forward 2bce0ab -> 70dce2a thành công (A a). Đã stage 213 file.
  - `13-integ-signatures.txt` đã được đổi tên thành `-synthetic`.
  - Mọi kiểm tra exit 0. D_PRE = digest `ls-tree` của HEAD = 59516a2d.
  - `git.unpushed` = [7aafa21].
- Giai đoạn `ux5-regate2`. Đang chạy: WP5-UX5-REGATE2 (verifier, sonnet) trên commit ở máy
  7aafa21 / 59516a2d, so với 2bce0ab.
- **Chủ dự án (nguyên văn): "Từ giờ bạn cứ push lên main thoải mái nhé".**
  - Lệnh tạm hoãn push (C b) đã được gỡ.
  - Committer sẽ push 7aafa21 ngay khi REGATE2 xong; tác vụ commit phải chạy một mình.
  - Các lần freeze sau push như trước.
- WP5-UX5-REGATE2: **FAIL** trên 7aafa21 / 59516a2d (875 file), theo quy tắc "ghi nhận
  nguyên trạng".
  - **Đạt:**
    - định danh: 12 đường dẫn, mỗi đường dẫn thuộc FIX2 hoặc Ingat; toàn bộ `dist/` giống
      hệt từng byte;
    - phần lõi, có chạy verify cả ngay trong repo;
    - FULL e2e trên đồng hồ thật, 459 + 404 đạt, 0 lỗi;
    - cả hai phép thử chịu tải, 1360 và 3140 đạt, 0 lỗi;
    - test tất định.
  - **Hai lỗi không phải lỗi mạng trong lượt quét,** không tái hiện được:
    - mobile `settings-routes.spec.ts:16` (tiêu đề "Administration" không hiện trong
      7 giây), ở lần chạy lại toàn bộ của ngày 10-26;
    - mobile `controls.spec.ts:640` (ảnh chụp mũi tên chevron ở DPR 1.5), ở lần chạy toàn
      bộ của ngày 11-01.

    Lần chạy lại của 11-01 có 0 lỗi, và test chevron chạy riêng đạt 3/3. Verifier đánh
    giá cả hai là lỗi chập chờn do máy quá tải.
- Đang chạy: WP5-UX5-RECORDS1 (committer, chạy một mình). Nó commit hồ sơ REGATE2 (chỉ
  trong handoff) và **push main**, kể cả 7aafa21.
- RECORDS1 dừng ở bước fetch. origin/main giờ là 01c4cdc, không còn là 70dce2a: phiên Ingat
  của chủ dự án đã push thêm. Chưa stage, commit hay push gì. RECORDS1 ở trạng thái
  `blocked`.
- Đang chạy: tra cứu chỉ đọc WP5-UX5-REMOTE-RECON2. Nó ghi lại các commit mới, phần trùng
  với 7aafa21 và với các hồ sơ chưa commit, một lần kiểm tra merge không ghi gì, và các
  phương án. Sau đó chủ dự án chọn cách gộp.
- REMOTE-RECON2 xong. 7aafa21 ở máy và origin/main 01c4cdc đã rẽ nhánh (1 / 2, gốc chung
  70dce2a).
  - **Hai commit của chủ dự án:**
    - 782cddab, dọn dẹp GHCR: một workflow, `scripts/ghcr-cleanup.ts`,
      `tests/integration/ghcr-cleanup*`, các file tsconfig, docs 07 và 11, ADR 0002 và
      0003, cùng các hồ sơ;
    - 01c4cdcb, các hồ sơ.
  - Không đụng đường dẫn quản trị, và không trùng với 7aafa21. Kiểm tra bằng `merge-tree`
    cho kết quả gộp sạch.
  - **Có một thay đổi chưa commit ở `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` (+ vi)
    ngay trong bản checkout chính này.** Nhiệm vụ không tạo ra nó, và nó xung đột với bản
    trên remote ở dòng 116.
- **Đang chờ chủ dự án:** câu hỏi WP5-UX5-REMOTE2-Q.
  - D: cách gộp — merge (khuyến nghị), rebase, hay tạm dừng các lần push của Ingat.
  - E: ai xử lý thay đổi chưa commit trong checkpoint INGAT.
  - Ngoài ra: phiên Ingat có thể chỉ làm việc trong worktree của nó hay không.
- **Câu trả lời của chủ dự án (nguyên văn): "D.a, E.a".**
  - **D a:** trước mỗi lần commit của nhiệm vụ, merge origin/main bằng một commit gộp (gộp
    sạch, không đụng đường dẫn nào của nhiệm vụ), rồi commit và push.
  - **E a:** phiên Ingat của chủ dự án tự xử lý cặp checkpoint INGAT. Nhiệm vụ không bao
    giờ đụng vào nó, và chỉ merge khi nó đã sạch.
- RECORDS1 chuyển sang `cancelled`. Phần hồ sơ và việc push 7aafa21 được dồn vào lần freeze
  của FIX3.
- Đang chạy: WP5-UX5-FIX3 (worker-high, sonnet; nền 7aafa21; cổng 50060-50079).
  - Nó tái hiện và sửa hai lỗi chập chờn do tải, `settings-routes.spec.ts:16` và
    `controls.spec.ts:640`, bằng cách chờ theo sự kiện. Chỉ sửa test; nếu nguyên nhân nằm
    ở sản phẩm thì dừng lại.
- Sau đó là freeze của FIX3:
  1. kiểm tra cặp checkpoint INGAT của chủ dự án đã sạch; nếu chưa thì dừng;
  2. `git merge origin/main` (một commit gộp);
  3. commit FIX3 cùng các hồ sơ của REGATE2;
  4. push.

  Rồi REGATE3 trên đầu nhánh đã gộp, gồm cả các test ghcr-cleanup mới của chủ dự án và các
  thay đổi tsconfig, kiểm tra là chúng không gây ảnh hưởng.
- WP5-UX5-FIX3 xong (theo báo cáo của worker). **Cả hai lỗi chập chờn đều do test tranh chấp
  thời điểm, không phải lỗi sản phẩm.**
  - **Tiêu đề:** sau khi bấm Sign out, màn hình Administration vẫn còn cho tới khi có phản
    hồi, và ô Email của chính màn hình đó nhận nhầm phần nhập. Sửa trong `fixtures.ts`:
    `signInPageAs` chờ nút "Sign in". Khi máy chịu tải: từ 2 lỗi trên 40 lần xuống 80/80
    đạt.
  - **Mũi tên chevron:** các ô giữ chỗ "Loading..." phía trên làm ô chọn xê dịch 0,53px.
    Sửa trong `controls.spec.ts`: `settledSelect` chờ hết ô giữ chỗ và 6 khung hình đứng
    yên. Khi máy chịu tải: 80/80.
  - Các mutant đều fail. FULL e2e 863 đạt, 0 lỗi. Verify 0.
  - `--preflight` chỉ fail trong repo vì file chưa được git theo dõi
    `INGAT_MANIFEST_DESIGN_REVIEW.md` của chủ dự án; chạy trên bản export thì đạt.
- **WP5-UX5-FIX3-FREEZE đang `blocked`** (E a). Nó chờ phiên Ingat của chủ dự án xử lý xong
  các file của phiên đó trong bản checkout này:
  - cặp INGAT_T0_T8_CHECKPOINT;
  - `INGAT_MANIFEST_DESIGN_REVIEW.md` và thư mục bằng chứng của nó.

  Đã nhờ chủ dự án báo khi nào xong.
- **Chủ dự án (nguyên văn): "Bên ingat yêu cầu bạn chạy "git merge --ff-only origin/main"
  cho lần commit kế tiếp".**
  - Lần commit tới chỉ fast-forward, không tạo commit gộp và không rebase. Nếu không
    fast-forward được thì committer dừng lại.
- Đang chạy: tra cứu chỉ đọc WP5-UX5-FIX3-PATHS. Nó kiểm tra:
  - 7aafa21 đã nằm trong origin/main chưa, tức là có fast-forward được không;
  - các commit mới trên remote chạm vào những gì;
  - các đường dẫn đang có thay đổi;
  - các file Ingat đã được xử lý xong chưa.
- FIX3-PATHS xong: **không fast-forward được.** Commit 7aafa21 chưa push nên không nằm trong
  origin/main 01c4cdc (đi trước 1, đi sau 2).
  - Các commit trên remote không đụng đường dẫn nào của nhiệm vụ.
  - Ngoài `handoff/`: chỉ có hai file của FIX3.
  - **Trong bản checkout này vẫn còn file của phiên Ingat:**
    - cặp INGAT_T0_T8_CHECKPOINT đang có thay đổi, mà origin cũng đã sửa, nên chặn mọi
      lần fast-forward hay merge;
    - các review, task và thư mục bằng chứng INGAT chưa được git theo dõi, làm
      `--preflight` fail.
- **Đang chờ chủ dự án:** câu hỏi WP5-UX5-FF-Q.
  - F: cách đạt được — rebase 7aafa21 (chưa push) lên origin/main (khuyến nghị, cần chủ
    dự án đồng ý rõ ràng); hoặc phiên Ingat push 7aafa21 lên origin trước; hoặc một commit
    gộp.
  - G: phiên Ingat xử lý xong hoặc chuyển các file của nó ra khỏi bản checkout này trước.
- **Chủ dự án chuyển lời điều phối viên của nhánh Ingat (2026-10-23):** việc đồng bộ đã xong.
  - origin/main 9f186b2 chứa commit gộp b8bae50, với hai cha là db87939 và 7aafa21 của
    nhiệm vụ. Cây mã nguồn của nó đã được phía Ingat kiểm tra (2374/2374 test).
  - Các bước đề nghị bản checkout này làm:
    1. lưu hai mục trong cặp checkpoint INGAT, rồi khôi phục cặp file đó;
    2. `git merge --ff-only origin/main`;
    3. thêm lại hai mục;
    4. commit các review, task và bằng chứng INGAT cùng với các file của nhiệm vụ, ghi
       nhận các task INGAT là đã xong, rồi push.
  - Phía Ingat không push thêm gì nữa.
- Cách điều phối viên xử lý:
  - Các task INGAT được ghi vào mục mới `external_tracks.INGAT` trên board. Validator chỉ
    chấp nhận gói WP1-WP5 và GOV trong `tasks`, và nhiệm vụ này không chạy các task đó.
  - Brief freeze của FIX3 giờ làm theo các bước trên. Nó cho phép một chỗ sửa: liên kết
    trỏ tới thư mục trong một review INGAT làm `--preflight` fail thì được đổi sang trỏ
    tới một file.
- Đang chạy: WP5-UX5-FIX3-FREEZE (một committer mới, chạy một mình): lưu, khôi phục,
  fast-forward, thêm lại, stage, kiểm tra, commit, push.
- WP5-UX5-FIX3-FREEZE xong: **đã push 5b8b7184692fff683c4083c9fc5610acd47bece1**, một
  fast-forward từ 9f186b2.
  - Hai mục đã được thêm lại (+92 / +91 dòng). Đã stage 177 file.
  - Một chỗ sửa liên kết, trong bản review thiết kế manifest INGAT (EN/VI).
  - Mọi kiểm tra exit 0. D_PRE = digest của HEAD = edcca194. Không còn commit nào chưa
    push.
  - Điểm lệch: phần nối thêm được làm bằng shell; một `/dev/null`; một địa chỉ no-reply
    công khai trong dòng Co-Authored-By của các hồ sơ đã stage (không phải dữ liệu cá
    nhân).
- Giai đoạn `ux5-regate3`. Đang chạy: WP5-UX5-REGATE3 (verifier, sonnet) trên 5b8b718 /
  edcca194, so với 7aafa21. Nội dung:
  - định danh, với mọi đường dẫn của FIX3 và Ingat được gán nguồn;
  - so sánh toàn bộ `dist/`: nếu giống hệt thì giữ lại kết quả cũ, nếu khác thì chạy lại
    các mục bị ảnh hưởng;
  - phần lõi, kèm các test và tsconfig của Ingat;
  - FULL e2e trên đồng hồ thật;
  - lượt quét bảy lần chạy với `--workers=6`;
  - phép thử chịu tải cho ba test đã sửa;
  - các mutant của FIX3.

### Tạm dừng vì hạn mức sử dụng (2026-10-23)

- **Việc tạm dừng.** Chủ dự án yêu cầu tạm dừng vì sắp hết hạn mức sử dụng. Điều phối viên
  đã dừng WP5-UX5-REGATE3 (agent a5a471b592740f995) bằng TaskStop khi nó đang chạy. Ghi
  chú cuối của nó là "Both clean. Continue waiting."; chưa ghi Results.
- **Board:**
  - trạng thái nhiệm vụ `paused_usage`, kèm ghi chú tạm dừng;
  - giai đoạn `ux5-regate3`;
  - WP5-UX5-REGATE3 ở trạng thái `interrupted`, kèm ghi chú gián đoạn;
  - next_task_id là WP5-UX5-REGATE3;
  - `current_source_digest` vẫn là 507de97c (bản đã nghiệm thu gần nhất, 8e55710).
- **Git.** Commit đã push gần nhất là 5b8b7184692fff683c4083c9fc5610acd47bece1 (digest
  edcca194). `git.unpushed` trống. origin/main còn chứa commit gộp Ingat b8bae50 của chủ dự
  án.
- **Phần chưa commit kể từ 5b8b718:**
  - board, STATE, NEXT_ACTION (+ vi) và cặp checkpoint này;
  - `tasks/WP5-UX5-FIX3-FREEZE.md` (Results), `tasks/WP5-UX5-REGATE3.md`, và các bản nháp
    audit A, B (đã trỏ sang đích mới);
  - `evidence/WP5-UX5-FIX3-FREEZE/`;
  - có thể có một phần `evidence/WP5-UX5-REGATE3/` làm dở.
- **Phần REGATE3 có thể để sót lại:** server và trình duyệt của nó, cùng Compose project
  `ts-wp5-ux5regate3` nếu nó đã bắt đầu chạy drill. Lần 2 sẽ kiểm tra và chỉ gỡ theo tên
  project, không bao giờ theo PID.
- **Các bước để tiếp tục:**
  1. Mở lại phiên (`claude --resume b5de56d1-fb31-4dc5-b74f-70e9473e1a0a`, hoặc một phiên
     mới với prompt khởi động), rồi đặt trạng thái nhiệm vụ thành `running`.
  2. Giao WP5-UX5-REGATE3 lần 2: một verifier mới, cùng brief, thư mục tác vụ
     `WP5-UX5-REGATE3-a2`, kiểm tra phần còn sót trước.
  3. Nếu PASS: audit A và B chạy song song (opus/xhigh mới, brief đã có sẵn, đích là
     5b8b718 / edcca194), rồi audit tích hợp, ACCEPT-DOCS và nghiệm thu lại WP5. Nếu
     FAIL: chẩn đoán và sửa như các lần trước.
- **Các thỏa thuận với chủ dự án đang có hiệu lực:**
  - D a cho việc merge, trừ khi chủ dự án lại yêu cầu `--ff-only`;
  - được phép push lên main;
  - nhánh Ingat không push gì thêm;
  - worktree `.claude/worktrees/relaxed-lalande-8359f0` của chủ dự án được để nguyên.

### Đã tiếp tục (2026-10-26)

- Chủ dự án nói "tiếp tục". Trạng thái nhiệm vụ trở lại `running`.
- Đang chạy: WP5-UX5-REGATE3 lần 2 (một verifier mới, sonnet; Addendum 1 của brief).
  - Trước tiên nó fetch và kiểm tra định danh; nếu origin đã đi trước HEAD thì dừng.
  - Nó kiểm tra phần lần 1 còn sót (Compose project `ts-wp5-ux5regate3` theo tên; các
    tiến trình chỉ liệt kê, không bao giờ dừng theo PID).
  - Nó dùng thư mục tác vụ mới `WP5-UX5-REGATE3-a2`.

### REGATE3 không đạt; hai việc chẩn đoán đang chạy (2026-10-26)

- **WP5-UX5-REGATE3 lần 2: FAIL** trên bản đã push 5b8b718 / edcca194. Các mục NAS vẫn
  NOT VERIFIED.
  - **Đạt:**
    - định danh (chỉ có đường dẫn của FIX3 và Ingat; không có gì trong `src/`, `assets/`
      hay các file package);
    - cả 250 file trong `dist/` giống từng byte với 7aafa21, nên kết quả drill, axe, CSP
      và tích hợp của REGATE2 được giữ;
    - phần lõi: npm ci, lint, typecheck, verify trong bản export, npm test 3 lần (2374
      test), các validator;
    - e2e FULL theo giờ thật: desktop 459, mobile 404, 0 lỗi;
    - chạy tải nặng các test đã sửa: 0 lỗi;
    - các mutant của FIX3 đều làm test đã sửa báo lỗi.
  - **Không đạt:**
    - `npm audit --omit=dev`: nodemailer (mức trung bình) và zod (mức cao). Đây là các cảnh
      báo mới, trong khi các file package không đổi.
    - Lượt quét với `--workers=6`:
      - `timesheet.spec.ts:1216`: lần chạy đi qua nửa đêm giờ LA mà Today vẫn ở ngày cũ;
      - `review.spec.ts:616`: dòng không thẳng hàng, lệch 23.25;
      - ECONNRESET lặp lại (`submission.spec.ts:67` và các spec automation), chạy lại vẫn
        còn.
  - Lần verify đầu trong repo có hai unit test bị quá thời gian khi máy chịu tải; lần chạy
    lại đạt.
  - Sau khi verifier trả kết quả, harness vẫn còn một tác vụ nền của nó. Điều phối viên đã
    dừng agent đó bằng TaskStop, không dừng tiến trình nào theo PID.
- **Đang chạy song song, cả hai chỉ đọc:**
  - WP5-UX5-DIAG2 (planner, sonnet): phân loại và tái hiện A (nửa đêm), B (thẳng hàng) và
    C (ECONNRESET), rồi đề xuất cách sửa tối thiểu;
  - WP5-UX5-DEPS1 (planner, sonnet): hai cảnh báo bảo mật, mức ảnh hưởng tới app, bản
    nâng cấp nhỏ nhất, và chạy thử trong một bản export tạm.
- **Tiếp theo:** một vòng sửa (mỗi lúc chỉ một người sửa mã nguồn), freeze, rồi REGATE4.
  Sau đó là audit A và B, audit tích hợp, ACCEPT-DOCS và nghiệm thu lại WP5.
- **Nếu bị gián đoạn:** chạy lại cả hai việc chẩn đoán từ brief bằng planner mới, trong
  thư mục tác vụ mới.
- **WP5-UX5-DEPS1: xong.** Cả hai đều là thư viện production dùng trực tiếp, ghim phiên
  bản chính xác. Bốn cảnh báo được công bố hoặc xác nhận ngày 2026-10-23.
  - **zod 4.6.5** (mức cao; dùng nhiều bộ nhớ khi kiểm tra mảng lớn): đã sửa ở 4.6.6. Về
    lý thuyết có thể chạm tới qua bước kiểm tra JSON, nhưng bị giới hạn bởi kích thước
    body 64 KiB.
  - **nodemailer 10.0.14** (ba cảnh báo mức trung bình, đều trong bộ phân tích địa chỉ):
    đã sửa ở 10.1.4. Không chạm tới được: mọi địa chỉ đều qua một bước kiểm tra địa chỉ
    đơn rất chặt trước.
  - **Chạy thử** trong một bản export tạm: mọi kiểm tra đều exit 0, `dist/` không đổi,
    không có cảnh báo deprecated nào.
  - **Lựa chọn của điều phối viên:** cặp phiên bản nhỏ nhất đủ để hết cảnh báo, 10.1.4 và
    4.6.6. Vì thư viện lúc chạy thay đổi, REGATE4 sẽ chạy lại drill container dù `dist/`
    giống từng byte.
- **Đang chạy:**
  - WP5-UX5-FIX4 (worker, sonnet), người duy nhất sửa mã nguồn. Nó sửa `package.json` và
    `package-lock.json`, chứng minh trong bản export tạm, và không động tới `node_modules`
    của repo.
  - WP5-UX5-DIAG2 (chỉ đọc) vẫn chạy tiếp.
- **WP5-UX5-FIX4: xong** (theo báo cáo của worker; còn chờ regate).
  - Lỗi audit được tái hiện trước.
  - Đã ghim nodemailer 10.1.4 và zod 4.6.6. Phần thay đổi lockfile chỉ chạm các mục đó và
    một mục lồng bên trong chỉ dùng cho dev.
  - Trong bản export tạm, lint, typecheck, npm test (2374), verify và
    `npm audit --omit=dev` đều exit 0. `dist/` giống từng byte.
  - Hai file package đã đổi trong working tree, chưa commit. `node_modules` trong repo vẫn
    là bản cũ.
  - Digest là c431c508 (882 file).
- **Tiếp theo:**
  - Freeze phải chờ DIAG2 xong: task commit phải chạy một mình.
  - Sau DIAG2: bản sửa của nó (người duy nhất sửa mã nguồn), rồi một lần freeze cho cả
    FIX4 và bản sửa đó, rồi REGATE4. REGATE4 chạy npm ci trong repo trước khi chạy verify
    trong repo, và chạy lại drill.
- **WP5-UX5-DIAG2: xong.** Cả ba lỗi đều được tái hiện. Không lỗi nào là lỗi của sản phẩm
  so với tài liệu.
  - **A, Today lúc nửa đêm:** lỗi của test.
    - Test đọc ngày từ server một lần. Một cú click ngay sau nửa đêm giờ LA khiến trang
      đọc lại, và Today chuyển sang ngày mới.
    - Sản phẩm đọc lại khi tải trang, khi focus, khi trang hiện ra và khi bấm Today, không
      dùng bộ hẹn giờ, đúng như tài liệu 04 dòng 58 yêu cầu.
    - Cách sửa: test chờ cho tới khi Today khớp với một lần đọc mới từ server, kèm sự kiện
      focus.
  - **B, thẳng hàng:** lỗi của test.
    - Trong phần xem trước của hộp thoại Sign off, ảnh chữ ký đã lưu tải về muộn, làm dòng
      của nhân viên cao thêm một dòng chữ (23.25 px) giữa hai lần đo.
    - Cách sửa: chờ ảnh tải xong rồi mới đo.
    - Bản thân việc nhảy 23 px được đưa vào backlog không bắt buộc của WP5; vòng này không
      sửa `src/`.
  - **C, ECONNRESET:** lỗi của bộ chạy test.
    - Client seed của test dùng lại một socket keep-alive sau một lần xử lý job bị chặn
      lâu hơn thời gian keep-alive 5 giây của server.
    - Cách sửa: gửi `connection: close` từ client seed.
    - Đồng hồ giả lập không liên quan.
  - **Cách chạy gate:** giữ nguyên (`--workers=6`, quy tắc chạy lại).
  - **Lần verify trong repo bị quá thời gian:** không cần sửa; chạy riêng và chạy lại một
    lần.
- **Đang chạy:** WP5-UX5-FIX5 (worker, sonnet), chạy một mình; chỉ sửa test và bộ chạy
  test.
  - Trước tiên nó chạy npm ci trong repo để khớp với lockfile của FIX4.
  - Nó tái hiện từng lỗi, áp dụng ba cách sửa, rồi chứng minh bằng các probe, chạy lặp ở
    đúng các thời điểm lỗi, e2e FULL theo giờ thật, hai mutant và các kiểm tra lõi.
    Digest tính sau cùng.
- **Tiếp theo:** một lần freeze cho FIX4 và FIX5 (tra đường dẫn, rồi committer), rồi
  REGATE4.
- **WP5-UX5-FIX5: xong** (theo báo cáo của worker; còn chờ regate). Chỉ sửa test và bộ
  chạy test; chưa commit; digest 4e93f766.
  - **Trước khi sửa:** A lỗi chắc chắn trong probe. B lỗi 3/6 lần khi ảnh trễ 50 ms. C lỗi
    20/20 lần ở 14 luồng.
  - **Sau khi sửa:** A đạt 80/80 lúc 06:59:35Z và 80/80 theo giờ thật. B đạt 50/50 với độ
    trễ 50-200 ms. C đạt 20/20 ở cả 10 và 14 luồng.
  - **E2e FULL theo giờ thật:** desktop 459 và mobile 404 test đạt, 0 lỗi.
  - **Mutant:** cả hai đều làm test báo lỗi.
  - **Còn hai hiện tượng**, nằm ngoài phạm vi file của FIX5, sẽ làm gate sau thất bại:
    - `npm test` lỗi hai lần vì quá thời gian 30 giây ở các integration test gọi nhiều
      tiến trình con, mỗi lần một nhóm test khác nhau;
    - `npm run verify` lỗi một lần ở bước smoke với "fetch failed" sau `run-jobs`, nhiều
      khả năng cùng cơ chế keep-alive như C.

    Các lần chạy sau đều đạt. FIX5 thấy 46 tiến trình `msedge` không phải do nó mở.
- **Quyết định của điều phối viên:** chẩn đoán trước khi freeze, thay vì đánh cược vào
  regate. REGATE3 mất khoảng 2,5 giờ.
- **WP5-UX5-DIAG3 xong** (planner, sonnet, chỉ đọc). Không có lỗi sản phẩm.
  - **Kiểm kê tiến trình.** 45 tiến trình `msedge` là trình duyệt Edge của chủ dự án.
    Mission không để sót trình duyệt, Playwright, vitest hay Docker nào. Có một tiến trình
    sót lại của mission: `bash.exe waitfor.sh out/sweep.done 590` từ lần chạy thứ hai của
    REGATE3, chiếm trọn một nhân CPU. Chủ dự án được nhờ tự đóng nó; task của mission
    không bao giờ dừng tiến trình theo PID. Tải thấy được là 1,5-4 trên 32 nhân.
  - **Quá thời gian.** Bộ test chạy 31 fork của vitest, mỗi fork lại gọi tiến trình CLI
    con. Đốt CPU trên cả 32 nhân không gây lỗi. Chỉ cho bộ test 2-8 CPU logic thì có lỗi,
    và ở 2 CPU thì lặp lại đúng nhóm test đã lỗi ở FIX5. Ở 4 CPU, chạy với 16 hoặc 8 worker
    thì không có lỗi nào. Mỗi lần gọi CLI mất 0,25-0,7 giây khi máy rảnh; con số "3,6 giây"
    thật ra là tổng của sáu lần chạy.
  - **Smoke.** Đã xác nhận cơ chế keep-alive: ba lần chạy CLI bằng `spawnSync` chặn luồng,
    rồi fetch trên một socket mà server đã đóng. Lỗi thứ hai: sau khi lỗi, `monitor` vẫn mở
    nên bước dọn dẹp thất bại và dòng "SMOKE FAILED" bị mất.
  - **Quyết định của điều phối viên:** FIX6 chỉ sửa phần chạy test và cấu hình test:
    - giới hạn số worker của vitest;
    - smoke gửi `connection: close` và đóng `monitor` trước khi dọn dẹp;
    - cùng header đó ở `container-drill.mjs`, `fixtures.ts:69` và `setup.spec.ts:98`, chỉ
      ở chỗ đúng là có mẫu lỗi này.

    Đề xuất tùy chọn nạp thư viện PDF khi cần (lazy import) của DIAG3 được đưa vào danh
    sách việc tùy chọn của WP5 (vòng này không sửa `src/`). Không nâng giới hạn thời gian
    nào, không đổi assertion nào.
  - **Cho REGATE4:** kiểm kê tiến trình trước khi chạy gate, và chạy `npm test` với
    `npm run verify` lần lượt, không bao giờ chạy cùng lúc.
- **WP5-UX5-FIX6 xong** (worker, sonnet; chưa commit; digest 26b163a6).
  - Đã sửa: `vitest.config.ts` (`maxWorkers: '50%'`, 16 fork thay vì 31),
    `scripts/smoke-built-server.mjs`, `scripts/container-drill.mjs` và phần kiểm tra health
    trong `tests/e2e/fixtures.ts`. `setup.spec.ts` giữ nguyên, vì các tiến trình con của nó
    chạy trước khi server khởi động.
  - **Smoke:** trước khi sửa, probe bị chặn thì lỗi và mất dòng báo lỗi. Sau khi sửa, chặn
    8 giây và 40 giây đều qua; một lỗi cố ý gây ra thì in "SMOKE FAILED (2)" và không để
    lại thư mục tạm.
  - **Giới hạn worker:** các lần chạy 4 CPU của chính FIX6 đều qua cả trước lẫn sau khi
    sửa, nên căn cứ cho giới hạn này là các lần chạy có kiểm soát của DIAG3. Đây là ghi chú
    cho REGATE4 và các auditor.
  - **Kết quả:** e2e FULL theo giờ thật 863 qua, 0 lỗi. Container drill qua (các bước 1,
    2, 3, 6). Lint, typecheck, `npm test` và `npm run verify` đều trả về 0.
  - **Sơ suất:** worker đã thêm một mục `safe.directory` vào cấu hình git toàn cục cho một
    bản xuất tạm. Chủ dự án đã được báo và có thể xóa nó.
- **Bước tra cứu WP5-UX5-FIX6-PATHS đã xong.**
  - HEAD = origin/main = 5b8b718, nên không cần merge.
  - Các file mã nguồn chưa commit đúng là tám file như dự kiến.
  - Một file evidence, `20-B-signature-image.txt` trong evidence của DIAG2, sẽ được đổi tên
    thêm `-synthetic` khi freeze. Board đã ghi sẵn tên mới.
  - Không còn container nào của drill. Mục `safe.directory` toàn cục là
    `D:/.claude-tmp/timesheet/WP5-UX5-FIX6/exp2`.
  - `waitfor.sh` khớp với PID 22240, tức tiến trình sót lại từ REGATE3, và ba tiến trình
    bash được tạo ngay lúc tra cứu. Ba tiến trình này được cho là shell của chính bước tra
    cứu; lần kiểm kê của REGATE4 sẽ xác nhận.
- **WP5-UX5-FIX6-FREEZE xong.**
  - Commit f4049aa7905e22f1467dfcae4208675cb2fc8e80 đã lên main và đã push, fast-forward từ
    5b8b718.
  - D_PRE bằng digest của HEAD, 26b163a6.
  - 164 đường dẫn: 8 file mã nguồn, 6 bản ghi, 12 task và 138 file evidence. Một file được
    đổi tên thêm `-synthetic`. Mọi kiểm tra đều trả về 0.
  - Bước quét email chỉ khớp với địa chỉ no-reply công khai trong một dòng Co-Authored-By,
    được trích lại trong bản ghi FIX3-FREEZE. Địa chỉ này đã công khai từ 5b8b718 và được
    chấp nhận như đã ghi. Các brief freeze sau sẽ ghi rõ địa chỉ này được phép.
- **WP5-UX5-REGATE4: PASS** trên f4049aa / 26b163a6 (verifier, sonnet). NAS vẫn NOT
  VERIFIED.
  - Kiểm kê: khoảng 1,4 trên 32 nhân đang bận. Tiến trình sót lại từ REGATE3 vẫn chiếm một
    nhân.
  - Đúng tám file mã nguồn. Cả 250 file trong `dist/` giống hệt từng byte với 5b8b718.
  - Drill `--wp3`: các bước 1-6 có 209 PASS và 0 FAIL. `npm audit --omit=dev` không thấy lỗ
    hổng nào.
  - `npm test` ×3 và `verify` (trong bản xuất và trong repo) đều trả về 0, không có lần nào
    quá thời gian. Bộ test chạy với 4 CPU logic cũng qua.
  - e2e FULL theo giờ thật: 459 và 404 qua, 0 lỗi. Sáu lượt quét và ba lượt chạy dồn đều 0
    lỗi, không có ECONNRESET.
  - Probe ngày Today của DIAG2, hai mutant M1 và M2, và các probe smoke của FIX6 (có và
    không có header, cùng lỗi cố ý gây ra) đều cho kết quả như yêu cầu.
  - Lưu ý: lockfile có thêm một bản nodemailer 10.0.14 lồng trong `smtp-server`, chỉ dùng
    khi phát triển và không có trong image.
- **Đang chạy:** WP5-UX5-AUDIT-A và WP5-UX5-AUDIT-B (auditor mới, opus), song song, trên
  f4049aa / 26b163a6. Brief của chúng đã được đổi mục tiêu và bổ sung:
  - A: các thay đổi e2e của những vòng sửa, một mutant mà chỉ bước so ngày trong poll Today
    mới bắt được, và đánh giá việc hoãn sửa lỗi lệch 23 px khi ảnh chữ ký tải chậm;
  - B: các phiên bản thư viện đã ghim (kể cả bản lồng chỉ dùng khi phát triển), bộ chạy
    test, căn cứ cho giới hạn worker, và việc hoãn lazy import thư viện PDF.
- **WP5-UX5-AUDIT-B: FIX REQUIRED** (opus). Năm lỗi mức Low, không có lỗi sản phẩm nào ở
  vùng B:
  - F-UX5B-1: docs/05:11 vẫn mô tả việc gửi ngay khi ký duyệt.
  - F-UX5B-2: docs/12:54 và docs/04:124 trích những chuỗi giao diện đã bị bỏ.
  - F-UX5B-3: trong PDF, một ngày vừa có nghỉ phép vừa có tên ngày lễ dài khoảng 35 ký tự
    trở lên thì mất chữ "Leave h:mm" vì bị cắt bằng dấu ba chấm, trái với docs/12:86.
  - F-UX5B-4: docs/10 không ghi quyết định H-1 a.
  - F-UX5B-5: bộ test không bắt được mutant M12b, và `sends.test.ts:300` không thể lỗi
    được vì mã hóa quoted-printable.

  Rủi ro:
  - R-UX5B-1 (có từ trước): một lần gửi đang chờ của bản sửa cũ có thể đến sau bản đính
    chính.
  - Các cảnh báo chỉ ở thư viện dùng khi phát triển, các chỗ gọi fetch trong drill, và giới
    hạn worker được đánh giá là chấp nhận được.

  Mọi kiểm tra đều qua, kể cả e2e, migration, sao lưu và khôi phục, và các probe HTTP.
  F-UX4B-1 đã được sửa.
- **WP5-UX5-AUDIT-A: FIX REQUIRED** (opus). Các phát hiện:
  - **F-UX5A-1, Medium.** Trên trang Review của một kỳ đã ký, nút "Sign correction" nằm
    trong dòng chữ ký của nhân viên. Ở 480, 390 và 320 px, tên bị ngắt từng chữ cái, nút che
    chữ "Signed", và các dòng không còn thẳng hàng.
  - F-UX5A-2: SC 2.5.3. Nút hiển thị "Change days" nhưng tên truy cập là "Change several
    days".
  - F-UX5A-3: vuốt chạm, hoặc nhấn vào thanh cuộn của thẻ tuần, làm đóng Day editor.
  - F-UX5A-4: các dòng cũ chưa cập nhật trong docs/04 và docs/12, cùng ba chú thích CSS.

  Mọi thứ khác đều qua:
  - các mục U5 còn lại, hai bề rộng lẻ 479,33 và 767,33 (mỗi bề rộng chỉ một bố cục), và
    F-UX4A-1..4, đã được sửa;
  - axe: 108 lượt quét, 0 vi phạm;
  - e2e đầy đủ: 863 qua, 0 lỗi.

  Mutant: 15 trên 17 bị bắt.
  - M2, bước ngày cuối của bậc thang khoảng ngày, không bị bắt.
  - M13 chỉ bị `today.spec.ts:626` bắt ở thời điểm qua nửa đêm, không phải bởi bước chờ
    `showToday`.
- **WP5-UX5-PLAN-FIX7 xong** (planner, sonnet). Nó đưa ra một bản diff đã được chứng
  minh và đặc tả chính xác.
  - **F-UX5B-3.** Một ngày lễ hoặc ngày công ty nghỉ vẫn có thể có nghỉ phép một phần;
    không có gì ngăn điều đó. Sửa mã sẽ khôi phục đúng docs/04:122, AC-10 và docs/12:86.
    Trong bản sửa, tên ngày lễ chiếm một dòng và "Leave h:mm" có dòng riêng. Các PDF không
    có cả hai nhãn vẫn giống hệt từng byte (624 trên 1.920 cặp), và các PDF mẫu của pilot
    không có nhãn nào trong hai nhãn này.
  - **R-UX5B-1.** Đã tái hiện được, và lỗi này có từ trước. Planner khuyến nghị phương án
    A: khi một lần gửi của bất kỳ bản sửa nào trong kỳ còn đang chờ, lần gửi mới bị chặn
    (409). Như vậy mã làm đúng câu docs/05:72 đã viết, và docs/03:60 được chỉnh cho khớp.
  - **Quyết định của điều phối viên:**
    - F-UX5B-3: sửa mã;
    - R-UX5B-1: làm phương án A ngay trong vòng này;
    - gộp luôn bốn chỗ thêm `connection: close` trong drill.

    Không cần chủ dự án quyết định, vì không có quy tắc nào chủ dự án đặt ra bị thay đổi.
    Chủ dự án được thông báo.
- **WP5-UX5-PLAN-FIX7A xong** (planner, sonnet). Đã chứng minh trong một bản xuất tạm.
  - **F-UX5A-1:** chỉ sửa CSS cho dòng tự xuống hàng. Ở 1440 và 1200 px không có gì thay
    đổi. Dưới khoảng 1150 px, "Sign correction" tụt xuống dưới nội dung đã ký và vẫn cách
    cuối dòng 8 px. Không còn chồng lấn, các dòng vẫn thẳng hàng, và PDF không bị đụng tới.
    Theo lời chủ dự án, nút nằm ở cuối dòng, và mockup chưa từng thể hiện trạng thái này,
    nên không cần chủ dự án quyết định. Chủ dự án được thông báo.
  - **F-UX5A-2:** tên truy cập đi theo dạng chữ đang hiện. Bốn assertion e2e được sửa.
  - **F-UX5A-3:** cảm ứng chỉ có tác dụng khi nhấc ngón tay (`pointerup`), nhấn vào thanh
    cuộn riêng của một phần tử thì bỏ qua, còn chuột và bút giữ nguyên cách xử lý cũ.
  - **F-UX5A-4:** có sẵn văn bản EN và VI chính xác. Hai dòng dùng chung docs/04:124 và
    docs/12:54 giữ nguyên văn bản của FIX7.
  - **Gộp thêm:** R3 (test bậc thang khoảng ngày bắt được M2), R4 và mũi tên của R5.
- **WP5-UX5-FIX7 xong** (worker-high, sonnet; chưa commit; digest bca04c4f).
  - **Trước khi sửa:** các probe PDF lỗi 13 kiểm tra, 7 test mới lỗi, và hai mutant M11, M12b
    không bị bắt.
  - **Sau khi sửa:** các probe PDF không còn kiểm tra nào lỗi, 106 test mới qua. Trong 1.920
    cặp PDF, 624 cặp không có đủ cả hai nhãn vẫn giống hệt từng byte. M11, M12b và M14 đều
    bị bắt.
  - e2e có chọn lọc: 38 qua, 0 lỗi. `npm test` chạy 2.384 test, `verify` trả về 0. Drill
    `--wp3`: 209 PASS, 0 FAIL. Tài liệu EN và VI khớp cấu trúc.
  - Ghi chú cho lần kiểm tra lại: lý do của nút Resend "A delivery of this revision is in
    progress." (`deliveryModel.ts:251`) vẫn tính theo từng bản.
- **WP5-UX5-FIX8 xong** (worker, sonnet; chưa commit; digest 61d19bf1).
  - Trước khi sửa, bốn test mới đều lỗi. Sau khi sửa, cả bốn qua. Mutant M2 giờ làm test
    bậc thang mới bị lỗi.
  - Điểm lệch kế hoạch: axe báo `button-name` ở 320 px, nên dạng ngắn "Change days" giờ là
    chữ thật thay vì nội dung `::before`.
  - axe: 40 lượt quét, 0 vi phạm. e2e FULL: 868 qua, 0 lỗi (desktop 463, mobile 405).
    `npm test` chạy 2.384 test, `verify` và build đều trả về 0.
  - Một lệnh `git apply -p2` với đường dẫn đã che lúc đầu ghi mười file vào một thư mục
    `export/` lạc chỗ. Worker đã sửa lại.
  - **Mới, có từ trước:** axe báo `scrollable-region-focusable` (serious) trên các thẻ tuần
    chỉ đọc của trang Review ở 768 px. Các thẻ này cuộn ngang từ 480 tới 929 px mà không
    chứa phần tử nào nhận được focus. HEAD cũng bị.
- **Quyết định của điều phối viên:** sửa ngay, trước khi freeze, vì chuẩn UI trong AGENTS
  yêu cầu WCAG 2.2 AA (SC 2.1.1) và lần kiểm tra lại sẽ trượt vì lỗi này.
- **WP5-UX5-FIX9 xong** (worker, sonnet; chưa commit; digest 462a1cd7; 27 file thay đổi
  ngoài `handoff/`).
  - Trước khi sửa: axe tìm thấy 24 lỗi `scrollable-region-focusable`, tất cả ở thẻ tuần
    chỉ đọc số 2 và 3 của trang Review, từ 480 tới 900 px. Không có lỗi nào khác ở bất kỳ
    màn hình nào.
  - Cách sửa: hook `useScrollsSideways` cho thẻ `tabIndex=0` chỉ khi thẻ bị tràn. Thẻ vốn đã
    có tên "Week n", phím mũi tên cuộn được, và có viền focus lõm vào trong. Các thẻ chỉnh
    sửa được không bị đụng tới.
  - Sau khi sửa: axe quét 56 lượt, 0 vi phạm. Test mới lỗi khi chưa sửa, và mutant cũng làm
    nó lỗi.
  - e2e FULL: 869 qua, 0 lỗi. `npm test` chạy 2.384 test; `verify` và build trả về 0.
  - Sơ suất: spec probe axe bị xóa nên không có trong evidence, và một lệnh `rm -rf` bị
    chặn.
- **Bước tra cứu WP5-UX5-FIX9-PATHS đã xong.**
  - HEAD = origin/main = f4049aa.
  - Ngoài `handoff/`: đúng 27 file của FIX9, tất cả xuống dòng kiểu LF. Không còn thư mục
    `export/`, file chưa theo dõi hay file `.tmp` nào.
  - `handoff/`: 9 file sửa và 566 file chưa theo dõi, tất cả là bản ghi của mission.
  - Không có gì chặn commit, không có container Docker nào sót lại.
- **Đang chạy:** WP5-UX5-FIX9-FREEZE (committer, sonnet), một mình: một commit cho FIX7
  tới FIX9 và các bản ghi, rồi push.
  - **Lần dừng đầu tiên:** committer dừng đúng quy trình, trước khi commit. Bước kiểm tra
    trước commit chặn hai mật khẩu giả lập viết thẳng trong một script probe của AUDIT-B,
    được lưu làm evidence (`94-http-areab.mjs.txt:380-381`). 603 đường dẫn đã được stage,
    và HEAD vẫn là f4049aa.
  - **Quyết định của điều phối viên (Addendum 1 của brief):** che hai giá trị đó thành
    `'<synthetic-password>'`, stage lại file đó và các bản ghi đã cập nhật, chạy lại các
    bước quét và kiểm tra trước commit, rồi commit và push. Committer cũ làm tiếp.
- **WP5-UX5-FIX9-FREEZE xong.**
  - Commit 94accda904240fda1cf500063d8b30d3a3603fd2 đã lên main và đã push, fast-forward từ
    f4049aa.
  - D_PRE bằng digest của HEAD, 462a1cd7.
  - 603 đường dẫn, hai giá trị mật khẩu giả lập đã được che. Mọi kiểm tra đều trả về 0.
- **WP5-UX5-REGATE5: FAIL** trên 94accda / 462a1cd7, chỉ vì một tiêu chí.
  - Trong lượt quét full-1101, test `logo.spec.ts:508` (không đổi, vốn chạy chậm) vượt giới
    hạn 240 giây khi máy đang bận (kiểm kê ngay sau đó thấy 5,5 nhân bận). Test này mất 2,5
    tới 3,8 phút ở mọi lần chạy. Chạy riêng thì qua, và chạy lại cả lượt quét cũng qua.
  - **Mọi thứ khác đều qua:**
    - đúng 27 file;
    - các thay đổi trong `dist/` khớp với FIX7 tới FIX9;
    - drill `--wp3`: 209 PASS, 0 FAIL;
    - `npm audit`: 0;
    - `npm test` ×3: 2.384 test;
    - e2e FULL theo giờ thật: 464 và 405 qua, 0 lỗi;
    - năm lượt quét còn lại và mọi lượt chạy dồn: 0 lỗi;
    - cả mười mutant đều bị bắt;
    - axe: 80 lượt quét, 0 vi phạm.
  - `npm ci` trong repo gặp lỗi EBUSY của Dropbox, và verifier khôi phục bằng
    `npm install`.
- **Quyết định của điều phối viên:** không bỏ qua lỗi quá thời gian. Một test chạy sát giới
  hạn như vậy là lỗi của test, nên ta bỏ bớt chi phí của nó chứ không nâng giới hạn.
- **WP5-UX5-DIAG4 xong** (planner, sonnet). Không có lỗi sản phẩm.
  - **Nguyên nhân:** `logo.spec.ts:508` đổi cỡ cửa sổ 2.242 bước, mỗi bước mất khoảng hai
    khung hình của trình duyệt. Khi máy bận, khung hình kéo dài ra, và khi chạy kèm một
    tiến trình đốt CPU thì test lỗi cả 4/4 lần.
  - **Các test khác chạy sát giới hạn:**
    - logo `:489`;
    - `admin-status` `:122` và `:259`: lệnh gửi chạy trước khi PDF xong thì phải chờ một
      phút để thử lại;
    - `timesheet.spec.ts:1037`: 360 ảnh chụp một pixel;
    - `day-editor.spec.ts:5560`: năm lượt gọi qua lại trình duyệt cho mỗi phần tử.

    Hai test mới có giới hạn 120 giây chỉ mất tối đa 7 giây.
  - **Bản vá** (chỉ sửa test, năm file; giữ nguyên assertion, trường hợp kiểm tra và giới
    hạn thời gian):
    - các lượt quét logo chạy trong bốn browser context, và lượt quét chế độ chia sẻ tách
      thành test riêng; các dòng kết quả giống hệt;
    - admin-status chờ PDF xong rồi mới gửi;
    - một ảnh chụp đã giải mã thay cho 360 ảnh;
    - một lần evaluate thay cho các lượt gọi theo từng phần tử, cho ra cùng tỷ lệ tương
      phản.
  - **Chứng minh:** test 508 giảm từ 2,0 phút xuống khoảng 33 giây mỗi test, và từ 192 xuống
    72 giây ở thời điểm của lượt quét. Mười mutant đều bị bắt. Bộ test chạy ở thời điểm của
    lượt quét: 871 test, 0 lỗi; `dist/` không đổi.
  - **Phạm vi gate lại:** `dist/`, drill, `npm audit`, `npm test`, axe và các mutant cấp
    unit được giữ kết quả từ REGATE5. Phần chạy lại gồm xác nhận danh tính, lint,
    typecheck, build và `verify`, e2e FULL, sáu lượt quét, chạy dồn các file đã đổi, và các
    mutant.
- **Quyết định của điều phối viên:**
  - áp dụng bản vá trong FIX10 (worker);
  - chấp nhận lần gate lại có giới hạn phạm vi;
  - thêm một ghi chú sản phẩm vào danh sách việc tùy chọn của WP5: một lần gửi được yêu cầu
    ngay sau khi ký có thể phải chờ một phút thử lại, vì lệnh tạo PDF và lệnh gửi được tạo
    trong cùng một giây và được xếp thứ tự theo id ngẫu nhiên.
- **WP5-UX5-FIX10 xong** (worker, sonnet; chưa commit; digest 41477510). Chỉ năm file test
  thuộc phạm vi của nó bị đổi.
  - Test logo 508 giờ mất khoảng 31 giây mỗi test sau khi tách, giảm từ 1,9 phút. Khi chạy
    kèm tiến trình đốt CPU, nó qua 12/12 lần, trong khi test cũ quá thời gian 4/4 lần.
  - admin-status mất 31-33 giây, thay vì 17 hoặc 78 giây. Test khung viền mất 15 giây, thay
    vì 34 giây.
  - Kết quả đo không đổi, và cả mười mutant đều bị bắt.
  - e2e FULL theo giờ thật: 871 qua, 0 lỗi. Lượt FULL ở thời điểm 2026-11-01T08:45Z với 6
    worker: 871 qua, 0 lỗi, các test logo mất 1,1 tới 1,3 phút.
  - Tên các file build không đổi.
- **WP5-UX5-FIX10-FREEZE xong.**
  - Commit a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5 đã lên main và đã push, fast-forward từ
    94accda.
  - D_PRE bằng digest của HEAD, 41477510.
  - 307 đường dẫn. Ba dòng có đường dẫn hồ sơ người dùng trong một log kiểm kê của DIAG4
    được che thành `<user>`. Mọi kiểm tra đều trả về 0.
- **WP5-UX5-REGATE6** (verifier, sonnet), lần gate lại có giới hạn phạm vi, đã chạy một
  mình trên a5533b5.
  - **Giữ kết quả từ REGATE5,** sau khi xác nhận đúng năm file đã đổi và mã băm `dist/`
    không đổi: cặp build, drill, `npm audit`, `npm test` ×3, các mutant cấp unit, axe, và
    lượt chạy dồn của các file không bị đụng tới.
  - **Chạy lại:** lint, typecheck, `verify`, các validator, e2e FULL, sáu lượt quét giờ mô
    phỏng (lần nào quá thời gian cũng tính là trượt), chạy dồn các test đã đổi, các mutant,
    và đọc lại diff.
  - **Lần dừng đầu tiên:** verifier gọi PowerShell với `-ExecutionPolicy Bypass -File`, một
    cách gọi mà brief chưa bao giờ cho phép. Bước kiểm tra quyền chặn lệnh đó, và verifier
    dừng đúng quy trình. Chưa mục gate nào được chạy.
  - **Quyết định của điều phối viên (Addendum 1):** không bao giờ thử lại cách gọi đó. Bước
    kiểm kê chỉ dùng các truy vấn `-Command` chỉ đọc viết trực tiếp. Nếu cả cách này cũng bị
    chặn thì bỏ qua bước kiểm kê và ghi lại; đây là biện pháp phòng ngừa, không phải tiêu chí
    của gate. Verifier cũ làm tiếp.
- **WP5-UX5-REGATE6: PASS** (có giới hạn phạm vi) trên a5533b5 / 41477510.
  - Kiểm kê được thực hiện bằng lệnh viết trực tiếp: 2,57 nhân đang bận.
  - **Tiền đề đúng:** chỉ đúng năm đường dẫn trong `tests/e2e` bị đổi, và 250 mã băm của
    `dist/` giống hệt REGATE5. Vì vậy kết quả drill, `npm audit`, `npm test` ×3, các mutant
    cấp unit và axe được giữ nguyên.
  - lint, typecheck, `verify` và các validator đều trả về 0.
  - e2e FULL: 466 và 405 qua, 0 lỗi.
  - Sáu lượt quét: 0 lỗi, không lần nào quá thời gian; các test logo mất 1,1 tới 1,4 phút.
  - Các lượt chạy dồn: 0 lỗi. Test logo lâu nhất mất 204 trên 240 giây khi chạy với 10
    worker.
  - Cả 12 mutant đều làm test của chúng lỗi.
- **WP5-UX5-RECHECK-B: FIX REQUIRED** (opus), với một lỗi mới mức Low.
  - **F-UX5B2-1:** sau khi khôi phục từ bản sao lưu, lệnh `outbound release` chỉ kiểm tra
    các lần gửi muộn hơn trong cùng một bản (`restore.ts:535-555`). Một lần gửi đang bị giữ
    của bản cũ có thể được thả ra và đến tay người nhận sau bản đính chính.
  - **Cách sửa:** kiểm tra các lần gửi muộn hơn theo kỳ (`timesheet_id`) và thêm một trường
    hợp vào `restore.test.ts`.
  - **Năm lỗi cũ F-UX5B-1..5 đã được sửa.** Probe PDF riêng của auditor tạo 2.304 PDF, và
    768 PDF không có đủ cả hai nhãn giống hệt từng byte. Mã băm các PDF mẫu của pilot không
    bị ảnh hưởng. Phương án A đã được kiểm chứng, kể cả khi hai tiến trình server chạy đua
    nhau.
  - **Rủi ro:**
    - phải chờ một phút để thử lại khi PDF của một lần gửi chưa được lưu, chấp nhận được cho
      pilot;
    - lần gửi bản đính chính có thể bị chặn tới khoảng 81 phút khi máy chủ email đang lỗi;
    - hai lỗ hổng test (G2, P4) mà probe của auditor bắt được nhưng bộ test thì không.
- **Quyết định của điều phối viên:** một lần sửa sau khi RECHECK-A trả kết quả, không bao giờ
  chạy song song với một audit đang chạy. Lần sửa gồm:
  - sửa F-UX5B2-1 trong mã, nhất quán với phương án A;
  - thêm test cho hai lỗ hổng G2 và P4;
  - một câu nêu giới hạn đã biết trong docs/12 (EN và VI) về thời gian phương án A có thể
    chặn.
- **WP5-UX5-RECHECK-A: FIX REQUIRED** (opus), với một lỗi mới mức Low.
  - **F-UX5A-1..4 đã được sửa.** Đo ở chín bề rộng, cả hai giao diện: không còn chồng lấn,
    nút cách cuối dòng 8 px, các dòng thẳng hàng. Tên của "Change days" khớp với chữ đang
    hiện. Phần sửa cảm ứng được chứng minh trong giả lập Chromium. Tài liệu đã được sửa.
  - **Mới, F-UX5A2-1:** viền focus của thẻ tuần chỉ đọc chỉ được vẽ ở cạnh trên và cạnh
    trái, vì các cột ngày che phần còn lại. Tài liệu lại nói đó là viền focus chung. WCAG
    2.2 AA vẫn đạt (SC 2.4.7); lỗi là so với chuẩn UI trong AGENTS và so với tài liệu.
  - axe: 104 lượt quét, 0 vi phạm. e2e FULL: 871 qua, 0 lỗi.
  - **Rủi ro:** cảm ứng trên thiết bị iOS và Android thật, thanh cuộn kiểu overlay, các lỗ
    hổng test MA1, MA5, MA8 và MA9, và các lượt quét logo nhạy với tải máy.
  - Lượt chạy probe của auditor vẫn đang chạy lúc bàn giao. Điều phối viên đã dừng nó bằng
    TaskStop; không dừng theo PID.
- **Quyết định của điều phối viên:** một lần sửa, WP5-UX5-FIX11 (worker-high). Gồm:
  - F-UX5B2-1 và F-UX5A2-1;
  - test cho các lỗ hổng G2, P4, MA1, MA8 và MA9;
  - một câu nêu giới hạn đã biết trong docs/12 về thời gian phương án A có thể chặn.

  R-A2-1 (thiết bị thật), R-A2-2 và MA5 vẫn được ghi lại. Pilot packet sẽ liệt kê bước
  kiểm tra trên iPad và máy tính bảng Android thật.
- **WP5-UX5-FIX11 xong** (worker-high, sonnet; chưa commit; digest 20709d60; 15 file thay
  đổi). Cả hai lỗi đều được tái hiện trước khi sửa.
  - **F-UX5B2-1:** `blockerOf` giờ kiểm tra theo kỳ. Lần gửi bị giữ của bản cũ vẫn bị giữ
    (`superseded_by_later_send`). docs/11:178 đã được sửa và docs/05:72 được bổ sung.
  - **F-UX5A2-1:** một lớp viền riêng vẽ đủ bốn cạnh, ở cả giao diện sáng và tối, kể cả khi
    thẻ đã cuộn. Các chú thích và docs/04 đã được sửa.
  - **Test lấp lỗ hổng:** G2, P4, MA1, MA8 và MA9 giờ đều làm test lỗi khi có mutant.
  - docs/12 đã có câu nêu giới hạn đã biết.
  - axe: 46 lượt quét, 0 vi phạm. `npm test` chạy 2.388 test. e2e FULL: 872 qua, 0 lỗi.
    Drill: 209 PASS, 0 FAIL.
  - **Tiến trình sót lại:** lượt chạy probe của RECHECK-A để lại các tiến trình Playwright
    mồ côi và một server đã build (PID 63092, 37448, 90528, 101148) sau khi tác vụ bash của
    nó bị dừng. Chủ dự án được nhờ tự đóng chúng; task của mission không bao giờ dừng tiến
    trình theo PID.
- **WP5-UX5-FIX11-FREEZE xong.**
  - Commit 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955 đã lên main và đã push, fast-forward từ
    a5533b5.
  - D_PRE bằng digest của HEAD, 20709d60.
  - 425 đường dẫn, không che gì. Mọi kiểm tra đều trả về 0.
- **WP5-UX5-REGATE7 KHÔNG ĐẠT ở một tiêu chí** (verifier, sonnet, chạy một mình, trên
  0f52300 / 20709d60).
  - Chỗ lỗi: lượt quét `seven-1026` (2026-10-27T06:58:30Z, `--workers=6`), test desktop
    `review.spec.ts:406`. Assertion "the text is vertically centred at 767px" đo được 8,
    trong khi giới hạn là 1,5. Đây không phải lỗi mạng, buffer hay quá thời gian.
  - FIX11 không sửa test này. Chạy riêng ở cùng thời điểm mô phỏng: qua 20/20; theo giờ thật
    cũng 20/20. Chạy lại cả bảy file: 0 lỗi.
  - Mọi mục khác đều đạt:
    - đúng 15 đường dẫn của FIX11;
    - thay đổi trong `dist/` khớp với `restore.ts` và bundle giao diện;
    - drill `--wp3`: 209 PASS, 0 FAIL;
    - `npm audit --omit=dev`: 0;
    - `npm test` ba lần, mỗi lần 2.388 test, cùng các validator;
    - e2e FULL theo giờ thật: 467/35/0 và 405/97/0;
    - năm lượt quét còn lại: 0 lỗi, không quá thời gian;
    - chạy dồn: 0 lỗi;
    - các mutant của FIX11 đều bị phát hiện. `restore.ts` cũ vẫn gửi bản đã bị thay thế,
      còn bản đích thì từ chối;
    - axe: 84 lượt quét, 0 vi phạm.
  - **Lỗ hổng test:** mutant thêm R3 sống sót qua cả 33 test khôi phục. Với R3, một lượt
    gửi sau đang được giữ lease không còn chặn việc release trên đường khôi phục. Dòng mã
    này có từ trước FIX11.
  - Kiểm kê tiến trình: các tiến trình mồ côi của RECHECK-A vẫn còn, dùng khoảng một lõi
    CPU. Không dừng tiến trình nào.
  - **Quyết định coordinator:** không bỏ qua lỗi assertion của một test không đổi, như đã
    làm với REGATE5.
- **Kết quả đầu của WP5-UX5-DIAG5** (planner, sonnet, chạy một mình, chỉ đọc):
  - **Nguyên nhân:** test đo trúng lúc bố cục lệch thật, nhưng chỉ trong một khung hình.
    - Khi bề rộng đổi từ 768 xuống 767, CSS áp dụng trước. `useMedia` của React gắn đồng hồ
      trên thanh trên chậm hơn một lần cập nhật hiển thị, nên thanh cao từ 52 lên 60 px và
      thẻ dịch xuống 8 px.
    - Test đọc thẻ và chữ ở hai trạng thái khác nhau. Mọi bố cục đã ổn định đều căn giữa.
    - Trace của lần lỗi khớp với cách giải thích này. Làm trễ thông báo media của React thì
      tái hiện được "Received 8" trong 35/40 lần chạy.
    - Không sửa sản phẩm. Cú nhảy một khung hình được đưa vào backlog tùy chọn của WP5.
  - **Bản sửa (chỉ test):** hàm phụ `expectLayoutAt(page, width)` trong
    `tests/e2e/fixtures.ts`, gọi sau `setViewportSize` ở `review.spec.ts` 406, 643, 734 và
    `timesheet.spec.ts` 2541.
    - Qua 40/40 lần với mô hình trễ và khi máy chịu tải.
    - Mutant lệch tâm 8 px vẫn làm test lỗi.
  - **R3:** thêm một ca trong `restore.test.ts`: lượt gửi sau đang giữ lease chặn việc
    release với lý do `superseded_by_later_send`. Lý do này đúng. Ca này diệt được R3.
  - **Quyết định coordinator:** chấp nhận. Addendum 1 nhờ chính planner đó xử lý thêm
    `logo.spec.ts:599`, test này cũng lỗi ở mức trễ 90 ms như 734. Planner cũng chạy lại bộ
    thử trễ trên 15 file spec với bản sửa cuối.
- **WP5-UX5-DIAG5 xong (Addendum 1).**
  - `logo.spec.ts:599` có cùng nguyên nhân, ở mốc 480 px. React thay lưới tuần rộng 865 px
    bằng bảng dạng điện thoại chậm hơn CSS một lần cập nhật. Vì vậy hàm phụ `expectSheetAt`
    giờ được gọi trong `sweepRange` của test logo.
  - Bản sửa cuối gồm năm file.
  - Bộ thử trễ (15 file spec có đổi bề rộng, 436 test desktop) có 0 lỗi ở các mức 20, 45
    và 90 ms. Trước khi sửa có 1, 3 và 6 lỗi.
  - Các mutant vẫn làm test của chúng lỗi.
- **WP5-UX5-FIX12 xong** (worker, sonnet; chưa commit; digest bf7ec3f7, 882 file).
  - Task tái hiện lỗi trên HEAD, rồi áp bản sửa vào năm file test.
  - **Sai khác so với bản sửa, đã chấp nhận:** thêm hai dòng `expectLayoutAt` trong
    `review.spec.ts` "a signed period opened again" và `timesheet.spec.ts` "from 320 to
    1920px". Các lượt kiểm tra cả bộ thấy hai test này lỗi 8/18 và 4/120 lần; có thêm dòng
    thì 0 lỗi.
  - Bộ thử trễ: 0 lỗi ở 20, 45, 70 và 90 ms. Khi máy chịu tải: 0 lỗi. Các mutant đều làm
    test của chúng lỗi. `restore.test.ts`: 33/33.
  - Lint, typecheck, build, verify và `npm test` (2.388) đều qua. `dist/` giống hệt HEAD.
  - e2e đầy đủ theo giờ thật:
    - mobile: 405/97/0;
    - desktop: lần đầu 1 lỗi (`keyboard-access.spec.ts:267`); chạy lại 467/35/0.
  - Giờ mô phỏng 2026-10-27T06:58:30Z: 0 lỗi.
  - **Hai test chập chờn có từ trước**, trên HEAD cũng lỗi:
    - `keyboard-access.spec.ts:267` ("Received: inactive"): khoảng một nửa số lần chạy lặp;
    - `day-editor.spec.ts:5304`: 2 đến 4 trên 20 lần.
  - **Quyết định coordinator:** test nào trong hai test này cũng có thể làm gate sau trượt.
    Vì vậy chẩn đoán và sửa chúng trước, rồi freeze FIX12 cùng bản sửa đó trong một lần.
- **WP5-UX5-DIAG6 xong** (planner, sonnet, chỉ đọc).
  - Cả hai test chập chờn đều không phải do trạng thái sót lại giữa các lần chạy lặp. Race
    có ở cả lần chạy đơn; máy càng bận thì lỗi càng hay xảy ra.
  - **`keyboard-access.spec.ts:267`: race trong test.**
    - Nút Check in bị vô hiệu hóa trong lúc tải trạng thái, kéo dài 10 đến 56 ms sau khi
      các ngày đã vẽ xong. Hành vi này đã được ghi trong tài liệu.
    - `focus()` không có tác dụng trên nút đang bị vô hiệu hóa, nên test chờ mãi.
    - Cách sửa: chờ nút bật lại rồi mới focus.
  - **`day-editor.spec.ts:5304`: một race hẹp trong sản phẩm, thuộc loại làm mất dữ liệu.**
    - Cờ "có thay đổi chưa lưu" của Day editor được báo trễ một task.
    - Nếu bấm Escape ngay sau khi gõ vào Notes, editor có thể đóng mà không hỏi "Discard
      your changes?", và ghi chú bị mất. Như vậy là trái với U4-05.
    - Cách sửa: dùng `useLayoutEffect` để báo cờ trong `DayFieldsForm.tsx`, và thêm một test
      e2e tất định. Trên sản phẩm cũ, test này lỗi 10/10.
  - Bằng chứng:
    - chạy lặp 60 lần với 2 và 6 worker: 0 lỗi;
    - các mô hình trễ và bóp CPU đều qua;
    - các mutant đều bị phát hiện;
    - chạy lặp cả bộ e2e ba lần trên hai project: 0 lỗi.
  - Lịch sử: cả hai race đã có từ lâu. Các log trước không ghi nhận lần lỗi nào.
  - `dist/client` thay đổi, nên phải gate lại toàn bộ. Một auditor mới sẽ đọc thay đổi sản
    phẩm này.
  - **Quyết định coordinator:** chấp nhận. Không cần quyết định nghiệp vụ hay UX, vì bản sửa
    chỉ khôi phục đúng U4-05.
- **WP5-UX5-FIX13 xong** (worker, sonnet; chưa commit; digest c1691aed, 882 file).
  - Task tái hiện được cả ba lỗi trên sản phẩm cũ: 10/10, 10/10 và 20/20.
  - Task áp bản sửa vào `DayFieldsForm.tsx`, `keyboard-access.spec.ts` và
    `day-editor.spec.ts`. Giờ có tám đường dẫn khác ngoài `handoff/`.
  - Chạy lặp 60 lần với 2 và 6 worker: 0 lỗi. Các mô hình, bảng đo độ trễ của cờ và lượt
    chạy khi máy chịu tải đều qua. Năm mutant, kể cả mutant đổi lại `useEffect`, đều làm
    test của chúng lỗi.
  - Lint, typecheck, build, verify và `npm test` (2.388) đều qua, không có cảnh báo
    deprecation. `dist/server` giống hệt. `dist/client` thay đổi: `index.html` và sáu chunk.
  - e2e đầy đủ theo giờ thật: desktop 468/35/0, mobile 406/97/0.
  - Lượt chạy ở giờ mô phỏng: 0 lỗi.
- **WP5-UX5-FIX13-FREEZE xong.**
  - Commit bb8d34039b79320e415a0224c0bd02075bd0f76a đã lên main và đã push, fast-forward từ
    0f52300.
  - D_PRE bằng digest của HEAD, c1691aed. Đã stage 627 đường dẫn.
  - Lần dừng đầu: `validate_orchestration.py` báo DIAG5 phụ thuộc vào gate đã trượt.
    Coordinator đã sửa board (DIAG5 giờ phụ thuộc FIX11-FREEZE), và chính committer đó
    làm tiếp.
  - Hai file evidence chứa dòng lệnh các công cụ riêng của chủ dự án không được đưa vào
    commit public: `new-proc-detail.txt` của DIAG6 và `10-census-sample1.txt` của REGATE7.
- **WP5-UX5-REGATE8 KHÔNG ĐẠT** (verifier, tự báo claude-sonnet-5-5) trên bb8d340 /
  c1691aed, ở một tiêu chí.
  - Hai lượt quét FULL theo giờ mô phỏng bị lỗi: `full-1101` (2026-11-01T08:45Z) có 1 lỗi
    và `full-0314` (2027-03-14T10:30Z) có 2 lỗi.
  - Cả ba lỗi đều ở test mobile `controls.spec.ts:49`, không đổi trong đợt này: "title row
    to period card at 768px", nhận 74,8 px, mong đợi 32. Đây là lỗi assertion, không phải
    lỗi mạng.
  - Mô tả của verifier:
    - 1 worker ở thời điểm 1101 trượt 4/5 lần;
    - 6 worker trượt 0/10 lần;
    - 0f52300 cũng trượt;
    - theo giờ thật thì chưa bao giờ trượt.
  - Mọi mục khác đều đạt:
    - đúng 8 đường dẫn và đối chiếu `dist/`;
    - drill 209/0 và `npm audit` 0;
    - lượt cốt lõi ×3 (2.388 test);
    - e2e đầy đủ theo giờ thật (0 lỗi);
    - bốn lượt quét còn lại;
    - chạy dồn, các mutant và mô hình của DIAG5, DIAG6;
    - axe, 0 vi phạm.
- **Quyết định coordinator.** Không bỏ qua, giống REGATE5 và REGATE7. Lớp lỗi này quay lại
  sau bước kiểm tra độ phủ của DIAG5, vốn chỉ chạy project desktop. Một phần bằng chứng
  không khớp với race do tải:
  - một worker trượt nhiều hơn sáu worker;
  - cả hai thời điểm trượt đều sát lúc đổi giờ mùa hè/mùa đông ở Mỹ (giờ Pacific).

  Theo dòng leo thang của docs/08, WP5-UX5-DIAG7 giao cho timesheet-expert (opus, xhigh),
  không giao cho planner. Expert phải xác định đây là race, trạng thái sót lại giữa các
  test, hay trạng thái thật của giao diện, và chạy kiểm tra độ phủ trên cả hai project, ở
  cả hai thời điểm, với 1 và 6 worker. Giới hạn: nếu bản sửa sau đó lại trượt gate vì cùng
  lớp lỗi, coordinator báo chủ dự án.
- **WP5-UX5-DIAG7 xong** (expert, tự báo claude-opus-5-5).
  - Kết luận: race khi đo, cùng loại với lỗi FIX12 đã sửa. Không phải trạng thái sót lại
    giữa các test, cũng không phải lỗi bố cục thật. Lỗi không cần ngày đặc biệt, đổi giờ,
    bộ giả lập đồng hồ hay chạy một worker mới xảy ra.
  - Nguyên nhân: test đọc vị trí thẻ kỳ ở lần vẽ đầu tiên sau khi đổi độ rộng. Lúc đó cụm
    check in/out của giao diện điện thoại vẫn nằm trên thanh trên cùng, khiến thanh xuống
    hai dòng. Sau khi React cập nhật, cụm này chuyển xuống hàng tiêu đề, rồi test mới đọc
    hàng tiêu đề. 74,8 = 194,8 − 120. Khi đã ổn định, khoảng cách luôn là 32.
  - Kiểu lỗi "một worker, hai thời điểm" mà REGATE8 thấy chỉ là nhiễu do mẫu quá nhỏ. Test
    gốc cũng trượt cả theo giờ thật.
  - Bản sửa, chỉ ở test: `controls.spec.ts` +4/−1, thêm `expectLayoutAt` sau khi đổi độ
    rộng ở `:49` và `:68`.
  - Bằng chứng:
    - mô hình trễ: bản gốc trượt 52/600, bản sửa 0/600;
    - chạy thường: bản gốc trượt 5/180, bản sửa 0/180;
    - mutant đẩy thẻ xuống thấp hơn 42,8 px: bắt được 12/12.
  - Kiểm tra độ phủ trên cả hai project, khoảng 3,5 giờ chạy: 0 lỗi, trừ hai lỗi chập
    chờn khác, có từ trước.
    - F1: `timesheet.spec.ts:2596` (bậc thang các loại khoảng kỳ) bỏ sót bước
      "cross-year" 1/12 lần, cả theo giờ thật.
    - F2: `theme.spec.ts:376` hết thời gian chờ một lần dưới mô hình trễ 45 ms: tab thứ
      hai không chuyển sang nền tối. Bộ nghe thay đổi giao diện giữa các tab chỉ nằm trong
      `ThemeToggle`, mà thành phần này chỉ được gắn khi menu đang mở.
- **Quyết định coordinator.** Chấp nhận DIAG7. F1 nhiều khả năng sẽ làm trượt lần gate
  tới, còn F2 có thể là một lỗ hổng đồng bộ giao diện giữa các tab. Vì vậy WP5-UX5-DIAG8
  (planner, sonnet) chẩn đoán cả hai trước khi vào một vòng sửa. DIAG8 chạy trên bb8d340,
  với bản vá của DIAG7 trong bản export nháp. F2 được đối chiếu với các kế hoạch đã duyệt:
  chỉ sửa sản phẩm nếu có quy tắc đã duyệt yêu cầu, nếu không thì ghi vào backlog.
- **WP5-UX5-DIAG8 xong** (planner, tự báo claude-sonnet-5-5).
  - **F1** (bậc thang các loại khoảng kỳ): race của test, cùng loại. Sau khi bấm, kỳ mới chỉ
    hiện ra khi server đã trả lời hai lần, nên bước chờ "đủ 14 ngày" qua ngay trên kỳ cũ.
    - Trong 15/36 lượt, test còn đo nhầm sang kỳ khác mà không báo lỗi.
    - Bản sửa: helper `stepPeriod`, chờ `data-period-due` đổi giá trị.
    - Bằng chứng: bản gốc trượt 5/216, bản sửa 0/216. Mutant sai năm bị bắt 12/12; bản gốc
      chỉ bắt được 5/12.
  - **F2** (giao diện ở tab thứ hai): dòng lỗi là lần tô màu của chính tab A. Khi máy bận,
    tab nằm phía sau bị bỏ đói; đây chính là phát hiện của DIAG4.
    - Bản sửa: ba lệnh `bringToFront`. Bằng chứng: chạy cạnh tiến trình đốt CPU, bản gốc
      trượt 41/48, bản sửa qua 48/48.
  - **Lỗi sản phẩm phát hiện thêm.** Một tab đang đóng menu tài khoản không đổi theo giao
    diện vừa chọn ở tab khác.
    - Điều này trái quy tắc đã duyệt ở UX2: "sự kiện storage giữ các tab khác đồng bộ".
      WP5-UX3-T02 đã làm hỏng quy tắc này khi chuyển nút giao diện, cùng bộ nghe duy nhất
      của nó, vào trong menu. docs/04 không nói gì về việc này.
    - Đã chứng minh một bản vá sản phẩm nhỏ: `ThemeToggle.tsx` +12, `App.tsx` +4 và một test
      mới.
  - Bằng chứng gộp, theo cả hai kiểu đồng hồ: 855 qua, 0 lỗi; mô hình trễ trên mobile: 0
    lỗi.
- **Quyết định coordinator.** Chấp nhận, kể cả bản vá sản phẩm:
  - nó khôi phục một quy tắc chủ dự án đã duyệt;
  - nó nhỏ và đã được chứng minh;
  - nó không đổi tài liệu nào;
  - nếu để lại, lỗi này sẽ quay lại thành phát hiện của audit.

  Vì vậy lần gate tới là gate đầy đủ.
- **WP5-UX5-FIX14 xong** (worker, tự báo claude-sonnet-5-5). Chưa commit. Digest 419ede40.
  - Đã tái hiện lỗi trên bb8d340 trước khi sửa:
    - controls trên mobile: trượt 26/200;
    - bậc thang khoảng kỳ với mô hình ép thứ tự: trượt 6/6;
    - test giao diện chạy cạnh tiến trình đốt CPU: trượt 21/24;
    - test mới về đồng bộ giữa các tab, trên sản phẩm cũ: trượt 12/12.
  - Đã áp ba bản vá vào đúng năm file, +69/−7.
  - Bằng chứng:
    - các mô hình: 0 lỗi;
    - chạy lặp: bậc thang 120, spec giao diện 820 và các test controls 120 lượt, đều qua;
    - cả năm mutant đều làm test tương ứng trượt.
  - `dist/server` và `dist/domain` giữ nguyên. Chỉ `dist/client` đổi: chunk chính và năm
    chunk import nó.
  - `npm test`: 2.388.
  - e2e đầy đủ: desktop 469/35/0, mobile 407/97/0.
  - Lượt quét thời điểm 0314 trên 15 file: 0 lỗi.
- **WP5-UX5-FIX14-FREEZE xong.**
  - Commit bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23 trên main, đã push dạng fast-forward từ
    bb8d340; remote trùng với HEAD.
  - D_PRE trùng digest của HEAD, 419ede40. Đã stage 549 đường dẫn.
  - Để ngoài commit: hai file `.log` của REGATE8, vì evidence phải là `.txt`. Hai file
    riêng tư từ lần trước vẫn không được commit.
  - Đã che một đường dẫn hồ sơ người dùng trong ba script evidence.
  - Mọi kiểm tra đều exit 0.
- **WP5-UX5-REGATE9 KHÔNG ĐẠT** (verifier, tự báo claude-sonnet-5-5) trên bd9c275 /
  419ede40, ở một tiêu chí.
  - Lượt quét bảy spec ở thời điểm 2026-10-27T06:58:30Z trượt một lần. Lượt này chạy qua nửa
    đêm giờ Los Angeles ở giây thứ 90.
  - Test trượt là `day-editor.spec.ts:2340` trên mobile: bước chờ trong `clockIn` tìm một
    phiên đang mở của `todayLocal` hết thời gian chờ 7 giây. Đây không phải lỗi mạng.
  - Mọi mục khác đều đạt:
    - drill 209/0 và `npm audit` 0;
    - lượt cốt lõi ×3 (2.388 test);
    - e2e đầy đủ theo giờ thật (0 lỗi);
    - năm lượt quét còn lại;
    - chạy dồn;
    - các mutant của FIX14;
    - mọi mô hình, kể cả mô hình trễ của DIAG5 trên cả hai project;
    - axe, 0 vi phạm, kể cả khi mở menu tài khoản và bảng More.
- **Quyết định coordinator.** Không bỏ qua. Đây là lớp lỗi mới: mọi bản sửa lỗi đo sớm đều
  giữ được, nên giới hạn leo thang không áp dụng.

  Giả thuyết chính, chưa được chứng minh: test chốt ngày địa phương trước khi lượt chạy qua
  nửa đêm. Vẫn phải loại trừ khả năng sản phẩm có lỗi thật ở ranh giới ngày.
  WP5-UX5-DIAG9 (planner, sonnet) chẩn đoán lỗi này và chạy kiểm tra độ phủ:
  - phạm vi chạy qua nửa đêm, với nửa đêm rơi vào nhiều thời điểm khác nhau trong lượt chạy;
  - các thời điểm quét còn lại.
- **Kết quả đầu tiên của WP5-UX5-DIAG9** (planner, tự báo claude-sonnet-5-5). Chuỗi quét
  còn đang chạy nên kết quả CHƯA ĐƯỢC KIỂM.
  - **Kết luận:** lỗi nằm ở giả định của test tại ranh giới ngày. Sản phẩm chạy đúng: một
    phiên qua đêm thuộc về ngày nó bắt đầu (docs/02, D-05). Trace của lượt trượt cho thấy
    lần Check in được ghi lúc 07:00:00Z vào ngày 2026-10-27, trong khi test lại tìm ở ngày
    2026-10-26.
  - **Bản sửa A:** `clockIn` tìm ở ngày đó và ngày kế tiếp, rồi đối chiếu ngày tìm được với
    thời điểm bắt đầu của chính phiên. Đã chứng minh ở sáu thời điểm chọn sẵn, và các mutant
    đều bị bắt.
  - **Kiểm tra độ phủ:** 31 test của bộ cũ trượt khi nửa đêm rơi vào giữa lúc test chạy.
  - **Bản sửa B:** một "hàng rào nửa đêm" trong fixtures. Nếu còn chưa tới 45 giây là đến
    nửa đêm, test được giữ lại cho đến khi sang ngày mới. Test cố ý chạy qua nửa đêm được
    miễn. Có hàng rào, sáu vị trí nửa đêm khác nhau đều 0 lỗi; bỏ hàng rào thì các lỗi quay
    lại.
  - **Tùy chọn:** một test tích hợp ghim lại ngày ghi nhận của lần Check in ngay tại giây
    chuyển ngày.
- **Quyết định coordinator (Addendum 1 trong brief).**
  - Chấp nhận bản sửa A và test tích hợp.
  - Chấp nhận bản sửa B về nguyên tắc, với điều kiện: hàng rào không được đăng nhập hay tác
    động lên hệ thống trước mỗi test, trừ khi chứng minh được là vô hại.
  - Chính planner đó chạy nốt chuỗi quét và chứng minh bản vá cuối cùng, kể cả e2e đầy đủ
    theo giờ thật trên cả hai project.
- **WP5-UX5-DIAG9 xong (kết quả Addendum 1).**
  - Hàng rào giờ đọc đồng hồ của trình chạy test và múi giờ đã lưu của dữ liệu mẫu. Nó
    không đăng nhập, không gửi request và không truy cập cơ sở dữ liệu.
  - Bản vá cuối chỉ đổi test: bốn file, +101/−14.
  - Bằng chứng trên bản export mới:
    - `npm test`: 2.389;
    - e2e đầy đủ theo giờ thật: 469/35/0 và 407/97/0;
    - phạm vi bảy file ở 06:58:30Z và khi nửa đêm rơi vào giây thứ 200: 0 lỗi;
    - các mô hình đều qua;
    - lần chạy đối chứng khi tắt hàng rào lại trượt như dự đoán;
    - mọi mutant đều bị bắt.
  - Chuỗi quét chạy hai lần với phiên bản hàng rào đầu tiên cũng 0 lỗi.
- **Quyết định coordinator.** Chấp nhận. Hàng rào là một bước chờ theo trạng thái trước khi
  test bắt đầu, không có tác dụng phụ. Hành vi lúc nửa đêm vẫn được kiểm qua:
  - test cố ý chạy qua nửa đêm;
  - lần kiểm sản phẩm của DIAG9;
  - test tích hợp mới.

  Hàng rào được ghi vào bàn giao WP5 như một lựa chọn thiết kế test.
- **WP5-UX5-FIX15 xong** (worker, tự báo claude-sonnet-5-5). Chưa commit. Digest ff73565b.
  - Tái hiện trước: trường hợp C2 trượt trên cả hai project, và các mô hình tắt hàng rào
    cũng trượt.
  - Đã áp bản vá vào đúng bốn file test.
  - Bằng chứng:
    - các trường hợp C1–C6: 24/24;
    - các mô hình đều qua, và lần chạy đối chứng tắt hàng rào lại trượt như dự đoán;
    - các mutant A, A2, B và mutant của test ranh giới đều bị bắt;
    - chạy lặp: 40/40 mỗi project.
  - `dist/` giữ nguyên.
  - `npm test`: 2.389.
  - e2e đầy đủ: 469/35/0 và 407/97/0.
  - Lượt quét qua nửa đêm: 0 lỗi. Test cố ý chạy qua nửa đêm trên desktop mất 1,0 phút.
- **WP5-UX5-FIX15-FREEZE xong.**
  - Commit be2afa2e3c43514581ed62fd145c15eeef13b534 trên main, đã push dạng fast-forward từ
    bd9c275.
  - D_PRE trùng digest của HEAD, ff73565b. Đã stage 433 đường dẫn.
  - Lần dừng đầu: bản ghi DIAG9 thừa một dòng trống ở cuối nên `git diff --cached --check`
    báo lỗi. Coordinator đã xóa dòng đó, rồi chính committer làm tiếp và mọi kiểm tra đều
    exit 0.
- **Đang chạy:** WP5-UX5-REGATE10 (verifier, sonnet), một mình, trên be2afa2. Đây là gate lại
  có phạm vi, vì chỉ test thay đổi:
  - xác nhận phạm vi, `dist/` phải giữ nguyên;
  - `npm audit`;
  - lượt cốt lõi ×3, 2.389 test;
  - e2e đầy đủ theo giờ thật và sáu lượt quét;
  - chạy dồn;
  - các mutant và lượt đối chứng của FIX15;
  - mô hình trễ 90 ms trên cả hai project;
  - đọc diff.

  Drill và axe được giữ kết quả của REGATE9, với điều kiện `dist/` giữ nguyên.
- **Kết quả đầu tiên của REGATE10: CHƯA ĐƯỢC KIỂM (NOT VERIFIED).**
  - Mục 1–6 đều đạt, 0 lỗi:
    - `dist/` giữ nguyên, nên drill và axe được giữ kết quả cũ;
    - lượt cốt lõi ×3: 2.389;
    - e2e đầy đủ: 469/407, 0 lỗi;
    - cả sáu lượt quét: 0 lỗi. Test cố ý chạy qua nửa đêm mất 1,1 phút, nghĩa là nó vẫn
      thực sự chạy qua nửa đêm;
    - chạy dồn: 0 lỗi.
  - Mục 7: các mutant, các trường hợp, các mô hình có hàng rào, mô hình trễ và phần đọc diff
    đều đạt.
  - Điểm duy nhất chưa khớp: khi tắt hàng rào, không phải test nào cũng trượt.
    - Desktop: 12/13 trượt; `day-editor.spec.ts:795` qua.
    - Mobile: 9 trượt; `:795` và `today.spec.ts:242` qua.
- **Coordinator (Addendum 1 trong brief).** Brief đã nói quá về lượt đối chứng này. Chính
  lượt đối chứng mobile của FIX15 cũng có `:242` qua, và mô hình chỉ lấy một mẫu của một cửa
  sổ thời gian.
  - Tiêu chí viết lại: khi bật hàng rào, không mẫu nào được trượt. Khi tắt hàng rào, mỗi test
    phải trượt ít nhất một trong sáu mẫu; nếu không, dòng thời gian phải cho thấy thời điểm
    nửa đêm của mô hình rơi lệch khỏi lúc test đọc ngày.
  - Chính verifier đó lấy thêm mẫu cho ba test này rồi kết luận.
- **WP5-UX5-REGATE10 ĐẠT (PASS)** sau Addendum 1.
  - Khi bật hàng rào: 15/15 mẫu đều qua.
  - Khi tắt hàng rào, ba test này cũng không trượt lần nào. Dòng thời gian cho thấy các lần
    đọc ngày của chúng đều kết thúc khoảng 0,27 giây trước thời điểm nửa đêm của mô hình,
    vốn rơi vào lúc đăng nhập. Đây là ghi chú về vị trí đặt nửa đêm, không phải lỗi.
  - Mọi mục khác vẫn giữ: `dist/` giữ nguyên nên giữ kết quả drill và axe; `npm audit` 0;
    lượt cốt lõi ×3 2.389; e2e đầy đủ 0 lỗi; sáu lượt quét 0 lỗi; chạy dồn, mutant, các
    trường hợp, mô hình và phần đọc diff đều sạch.
- **Đang chạy song song:** hai auditor opus mới, chưa viết task nào trong WP5-UX4 hay
  WP5-UX5, trên be2afa2 / ff73565b.
  - **WP5-UX5-RECHECK-A2 (vùng A):**
    - F-UX5A2-1;
    - các thay đổi phía client và e2e từ FIX12 đến FIX15, gồm hai thay đổi sản phẩm
      (`DayFieldsForm` và đồng bộ giao diện giữa các tab) và hàng rào nửa đêm;
    - kiểm tra hồi quy, axe, mutant riêng, các kiểm tra bắt buộc.
  - **WP5-UX5-RECHECK-B2 (vùng B):**
    - F-UX5B2-1;
    - G2 và P4;
    - trường hợp R3;
    - ngày ghi nhận Check in ở ranh giới ngày và vào đêm đổi giờ;
    - kiểm tra hồi quy, mutant riêng, các kiểm tra bắt buộc.
- **WP5-UX5-RECHECK-B2: CẦN SỬA (FIX REQUIRED)** (auditor, tự báo claude-opus-5-5). Một
  lỗi mới mức Low.
  - F-UX5B2-1 đã được sửa trên đúng đường đi mà RECHECK-B tái hiện, nhưng chưa khép kín.
  - **F-UX5B3-1 (Low).** `restore.ts:552-560` (`blockerOf`) chỉ tính một lần gửi muộn hơn
    khi nó đang chờ (queued), đang xử lý (leased) hoặc đã thành công (succeeded).
    - Lỗ hổng: nếu lần gửi bản đính chính rơi vào trạng thái `intervention`, bản cũ đang bị
      giữ vẫn có thể được thả ra và gửi đi sau bản đính chính. `intervention` là khi lần
      gửi lỗi vĩnh viễn, chưa chắc đã gửi (kể cả sau khi được đánh dấu "đã gửi" hoặc khi
      tiến trình gửi bị chết giữa chừng), hoặc bị giữ lại bởi một lần khôi phục thứ hai.
    - Vì vậy docs/05:72 và docs/11:178 mô tả chặt hơn so với những gì bản build làm được.
    - Bản sửa auditor đề xuất, có giới hạn: tính mọi lần gửi muộn hơn của cùng kỳ, trừ lần
      đã hủy, và thêm các trường hợp vào `restore.test.ts`.
  - G2, P4 và R3 đều đã bị bắt.
  - Check in lúc nửa đêm và vào cả hai đêm đổi giờ đều đúng.
  - Mọi kiểm tra bắt buộc đều đạt: `npm test` 2.389; e2e đầy đủ 469/407, 0 lỗi.
- **Coordinator.** Bản sửa phải chờ RECHECK-A2 xong: không ai được sửa mã nguồn trong lúc
  một audit đang chạy.
  - Bản sửa giao cho worker-high (sonnet), vì đây là luồng khôi phục và gửi ra ngoài, đã có
    mẫu sẵn để theo.
  - Sau đó là freeze, gate lại có phạm vi (bundle server sẽ đổi), và một lượt kiểm tra lại
    độc lập mới cho vùng B.
- **WP5-UX5-RECHECK-A2: ĐẠT (PASS)** (auditor, tự báo claude-opus-5-5). Vùng A được chấp
  nhận trên be2afa2.
  - F-UX5A2-1 đã sửa: đường viền focus được đo ở 96 trạng thái, lần nào cũng hiện đủ bốn
    cạnh.
  - `DayFieldsForm`: không vòng lặp, không còn sót cờ "đã sửa".
  - Giao diện sáng/tối đồng bộ giữa các tab, cả ở trang đăng nhập và sau khi bộ nhớ bị
    xóa. Các khóa khác bị bỏ qua, và an toàn khi bộ nhớ bị chặn.
  - Các helper và hàng rào nửa đêm chứng minh đúng như các test cũ.
  - Mọi kiểm tra bắt buộc đều đạt, kể cả lượt quét qua nửa đêm. axe chỉ còn mục kích thước
    vùng bấm đã được chấp nhận từ UX3.
  - 11/16 mutant tự viết bị bắt. Rủi ro tùy chọn: R-A3-1..3.
  - Không có lỗi mới.
- **WP5-UX5-FIX16 xong** (worker-high, tự báo claude-sonnet-5-5). Chưa commit. Digest
  18aa0ad0.
  - Đã tái hiện lỗi trước khi sửa: probe chạy trong tiến trình trượt 6/12, và các phần B, C,
    D của probe qua HTTP đều trượt.
  - Bản sửa: `blockerOf` tính mọi lần gửi muộn hơn của cùng kỳ, ở bất kỳ trạng thái nào trừ
    `cancelled`.
    - Lý do loại trừ lần gửi đã hủy: không có luồng nào của sản phẩm hủy một lần gửi, và
      một lần gửi đã hủy bị khóa lại, không gửi đi gì cả.
    - Lần gửi lặp lại của cùng một bản bị từ chối với mã `superseded_by_later_send`.
  - Test mới: bảy trường hợp khôi phục và lần Check in đúng giây nửa đêm. docs/05:72 thêm
    một mệnh đề, cả EN lẫn VI.
  - Bằng chứng:
    - các probe đều qua, 12/12 và A–D;
    - mười mutant đều bị bắt;
    - `dist/` chỉ khác ở `restore.js` và file map của nó;
    - `npm test`: 2.397;
    - e2e đầy đủ: 0 lỗi.
- **WP5-UX5-FIX16-FREEZE xong.**
  - Commit 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2 trên main, đã push dạng fast-forward từ
    be2afa2.
  - D_PRE trùng digest của HEAD, 18aa0ad0. Đã stage 595 đường dẫn.
  - Committer dừng ba lần, đều vì cách coordinator ghi board, không lần nào vì mã nguồn.
    Các lần sửa:
    1. PASS của RECHECK-A2 trên ff73565b bị coi là "cũ" so với snapshot đã nghiệm thu. Giờ
       nó ghi `superseded_by: WP5-UX5-AUDIT-INT`: PASS này được giữ làm lịch sử, còn căn cứ
       nghiệm thu hiện hành là audit tích hợp trên digest cuối cùng.
    2. Các task chờ REGATE11, RECHECK-B3 và AUDIT-INT cần có brief.
    3. AUDIT-INT cần phụ thuộc trực tiếp vào một gate.
- **Đang chạy:** WP5-UX5-REGATE11 (verifier, sonnet), một mình, trên 1fe5ad3. Đây là gate
  lại có phạm vi:
  - xác nhận phạm vi: trong `dist/` chỉ `restore.js` được phép thay đổi;
  - drill `--wp3`;
  - `npm audit`;
  - lượt cốt lõi ×3, 2.397 test;
  - e2e đầy đủ và sáu lượt quét;
  - chạy lặp các file test tích hợp đã đổi;
  - các mutant của FIX16 và các probe của RECHECK-B2;
  - đọc diff.

  axe được giữ kết quả cũ nếu `dist/client` giữ nguyên.
- **WP5-UX5-REGATE11 KHÔNG ĐẠT** ở một tiêu chí.
  - Trong lượt quét FULL lúc 2026-11-01T08:45Z, test desktop `import.spec.ts:102` vượt quá
    thời gian chờ. Nó chạm mốc 30 giây khi chờ thông báo "committed" sau Confirm import, và
    chạy hết 38 giây. Cùng test đó trên mobile chỉ mất 6,5 giây.
  - Lúc đó máy đang bận khoảng 6–7 lõi cho việc riêng của chủ dự án, ngoài mission, vượt
    giới hạn 4 lõi của gate.
  - Verifier vẫn chạy tiếp sau một lần đo ngắn. Quy tắc "chờ 10 phút" trong brief mâu thuẫn
    với quy tắc cấm `sleep`. Từ giờ brief ghi "dừng và báo lại".
  - Mọi mục khác đều đạt:
    - `dist/client` giữ nguyên, nên giữ kết quả axe;
    - drill 209/0 và `npm audit` 0;
    - lượt cốt lõi ×3, 2.397 test;
    - e2e đầy đủ theo giờ thật: 0 lỗi;
    - năm lượt quét còn lại;
    - chạy lặp, mutant và probe.
- **Coordinator.** Không bỏ qua lỗi này.
  - WP5-UX5-DIAG10 (planner, sonnet) đo khoảng dư thời gian của test này qua mọi log gate,
    và tìm xem 38 giây đã tốn vào đâu.
  - Sau đó DIAG10 tái hiện test dưới tải CPU có kiểm soát, ở mức 4 lõi và 7 lõi, để phân
    biệt sản phẩm chậm hoặc treo thật với máy bị quá tải.
  - DIAG10 cũng liệt kê các test khác đang sát giới hạn thời gian.
- **Kết quả đầu tiên của WP5-UX5-DIAG10** (planner, tự báo claude-sonnet-5-5).
  - **Kết luận:** lỗi nằm ở test, lộ ra khi máy bị dùng hết CPU; sản phẩm không chậm. Test
    mở thêm một tab thứ hai, rồi vẫn tiếp tục điều khiển tab đầu tiên. Lúc đó tab đầu bị
    đẩy ra sau, và Chromium cho nó chạy ở mức ưu tiên thấp nhất (idle).
    - Trong trace, hai bước mất 4 giây và 10 giây, còn cú bấm Confirm thì không bao giờ
      hoàn tất.
    - Không có request commit nào được gửi đi. Câu trả lời chậm nhất của server chỉ mất
      245 ms.
  - **Khoảng dư:** trung vị 2,6 giây, p95 3,8 giây, so với giới hạn 30 giây.
  - **Dưới tải CPU:**
    - 0 lỗi khi máy bận 3–8 lõi (198 lượt);
    - 0 lỗi trong một lượt chạy hỗn hợp 1.068 test khi máy bận 10–14 lõi;
    - chỉ trượt khi máy bị dùng hết CPU: 32 luồng trượt 11/24, 48 luồng trượt 12/24.
    - Việc riêng của chủ dự án đẩy máy từ 3 lên 27 lõi bận trong vòng 25 phút.
  - **Bản sửa:** thêm 9 dòng `bringToFront` vào `import.spec.ts`, cho cả hai test dùng hai
    tab trong file này.
    - Với 48 luồng, bản gốc trượt 5–7/12, bản sửa 0/12, trên cả hai project.
    - Các mutant đều bị bắt.
  - **Quy tắc gate:** dừng và báo lại ngay ở lần đo tải đầu tiên nếu máy quá tải, và xét
    mọi lỗi quá thời gian chờ qua trace của nó.
- **Coordinator (Addendum 1 trong brief).** Chấp nhận.
  - Lớp lỗi "tab nằm phía sau" giờ đã làm trượt hai lần gate: lần đầu ở theme, lần này ở
    import.
  - Vì vậy chính planner đó kiểm tra ba test hai tab còn lại, và mọi chỗ gọi `newPage`
    trong bộ e2e, dưới tải 48 luồng. Bản vá chỉ mở rộng nếu một test trong số đó trượt hoặc
    chậm quá nửa giới hạn thời gian.
- **WP5-UX5-DIAG10 xong (kết quả Addendum 1).** Lớp lỗi "tab nằm phía sau" đã khép lại, với
  thêm một bản sửa.
  - Nhánh chạy qua nửa đêm của `today.spec.ts:641` thao tác trên một tab đang nằm phía sau.
    Dưới tải đốt CPU, nó trượt 5/6 lần trên mỗi project.
  - Cách sửa: mở trang thứ hai trong một browser context riêng. Bản sửa qua 12/12 lần dưới
    tải, và cũng qua khi máy rảnh. Bản gốc được dùng làm mutant.
  - Cách dùng `bringToFront` cũng chạy được ở đây nhưng không được chọn: sản phẩm tải lại
    các kỳ khi cửa sổ được focus hoặc hiện ra, mà test này lại kiểm đúng các sự kiện đó.
  - `logo.spec.ts:489` và `controls.spec.ts:699` không bao giờ thao tác trên trang nằm phía
    sau. Hai test qua 36/36 và 48/48. Không còn test nào khác dùng hai trang.
  - Ghi nhận, chưa sửa: khi máy bị dùng hết CPU, các lượt quét logo dùng tới 70–80 % giới
    hạn 240 giây. Rủi ro này đưa vào backlog.
- **Quyết định coordinator.**
  - Chấp nhận bản vá, chỉ đổi test: `import.spec.ts` và `today.spec.ts`.
  - Quy tắc tải mới cho gate, áp dụng từ REGATE12:
    - Dừng và báo lại nếu lần đo đầu tiên thấy việc ngoài mission chiếm hơn 4 lõi.
    - Đo lại tải ngay sau mỗi lần trượt.
    - Một lần quá thời gian chờ mà trace cho thấy máy bị bỏ đói, trong khi lần đo vượt
      giới hạn, thì lượt chạy đó tính là CHƯA ĐƯỢC KIỂM (NOT VERIFIED). Lượt đó được chạy
      lại một lần khi máy rảnh, và ghi lại cả hai lượt.
    - Mọi lỗi khác vẫn làm trượt gate.
- **WP5-UX5-FIX17 xong** (worker, tự báo claude-sonnet-5-5). Chưa commit. Digest 69c6daff.
  - Tái hiện dưới tải đốt CPU: test import trượt 12/12, nhánh qua nửa đêm trượt 3/6.
  - Đã áp bản vá vào hai file e2e.
  - Dưới tải, trên cả hai project, mọi lượt đều qua: các test import 24/24 mỗi test, nhánh
    qua nửa đêm 6/6, nhánh thường 12/12.
  - Các mutant đều bị bắt.
  - Các lượt chạy khi máy rảnh đều qua.
  - `dist/` giữ nguyên.
  - e2e đầy đủ: 469/407, 0 lỗi. Lượt quét qua nửa đêm: 0 lỗi; test cố ý chạy qua nửa đêm mất
    72 giây.
- **Các bản ghi đã chuẩn bị cho bước tiếp:**
  - Đã đăng ký REGATE12 kèm brief: gate lại có phạm vi, chỉ test đổi, chạy đủ sáu lượt quét,
    theo quy tắc tải mới.
  - RECHECK-B3 và AUDIT-INT giờ phụ thuộc vào REGATE12, và nhắm tới digest của FIX17.
- **WP5-UX5-FIX17-FREEZE xong.**
  - Commit a5cbc91e6965633a0f9d1dd7e912577321cc71e3 trên main, đã push dạng fast-forward từ
    1fe5ad3.
  - D_PRE trùng digest của HEAD, 69c6daff. Đã stage 404 đường dẫn.
  - Mọi kiểm tra đều exit 0.
- **WP5-UX5-REGATE12, lần 1:** dừng đúng quy tắc ngay ở lần đo tải đầu vào. Máy đang bận
  4,6–4,7 lõi vì việc ngoài mission, vượt giới hạn 4 lõi. Chưa có mục nào được chạy.
- **Coordinator (Addendum 1 trong brief).** Nâng giới hạn đầu vào lên khoảng 8 lõi, dựa trên
  số đo của DIAG10:
  - 0 lỗi khi máy bận 3–8 lõi, qua 198 lượt;
  - 0 lỗi trong một lượt chạy hỗn hợp 1.068 test khi máy bận 10–14 lõi;
  - chỉ trượt khi máy đã dùng hết CPU.

  Quy tắc xử lý khi máy bị bỏ đói CPU giữ nguyên.
- **WP5-UX5-REGATE12 ĐẠT (PASS)** (lần 2, verifier, tự báo claude-sonnet-5-5) trên a5cbc91 /
  69c6daff.
  - Lần đo tải đầu vào cho 6,7 và 6,1 lõi, dưới giới hạn 8. Không có lỗi nào.
  - `dist/` giữ nguyên, nên giữ kết quả drill, `npm audit` và axe.
  - `npm test`: 2.397.
  - e2e đầy đủ: 469/407, 0 lỗi. Cả sáu lượt quét: 0 lỗi.
    - Test logo lâu nhất mất 53, 66 và 96 giây; test qua nửa đêm mất 55 giây.
  - Chạy dồn, kể cả dưới tải 48 luồng đốt CPU: 0 lỗi. Các mutant đều bị bắt.
- **WP5-UX5-RECHECK-B3 ĐẠT (PASS)** (auditor, tự báo claude-opus-5-5) trên a5cbc91 /
  69c6daff. Không có phát hiện mới.
  - F-UX5B3-1 đã khép lại: các probe của RECHECK-B2 qua 12/12 và các phần A–D.
  - Ngoại lệ cho lần gửi đã hủy đúng theo mã nguồn và lịch sử git. docs/05:72 mô tả chính
    xác, cả EN lẫn VI.
  - E1 và lần Check in đúng giây nửa đêm thực sự ghim được hành vi.
  - Mọi kiểm tra bắt buộc đều đạt: 2.397 test, e2e đầy đủ 0 lỗi.
  - 9/11 mutant tự viết bị bắt. Rủi ro tùy chọn: R-UX5B4-1..5.
  - Trên board, audit này ghi `superseded_by: WP5-UX5-AUDIT-INT` cho đến lúc nghiệm thu
    lại.
- **WP5-UX5-AUDIT-INT: CẦN SỬA (FIX REQUIRED)** (auditor, tự báo claude-opus-5-5) trên
  a5cbc91.
  - **F-UX5I-1 (Low).** Trên desktop, Day editor đang mở không đọc lại ngày sau khi bấm
    Check in hoặc Check out trên trang. Ghi chú gõ từ trước bị từ chối khi lưu, và
    "Reload day" xóa mất ghi chú đó.
    - Nguyên nhân: `TimesheetScreen.tsx` chỉ tải lại kỳ. `DayEditor.tsx` chỉ đọc lại ngày
      khi mở, sau các lần ghi của chính nó, và sau khi lưu nhãn hoặc lưu hàng loạt.
    - Không có dữ liệu nào bị lưu sai hay mất mà không báo: bước kiểm tra phiên bản đã từ
      chối lần lưu dựa trên dữ liệu cũ.
  - Mọi mục khác đều đạt:
    - đã tích hợp các vòng: mọi phát hiện đều đã đóng, mọi yêu cầu của chủ dự án và mọi lần
      trượt gate đều đã được đối chiếu;
    - RECHECK-A2 và RECHECK-B3 vẫn giữ;
    - các probe xuyên vùng đều qua;
    - AC-13 qua ở ba múi giờ;
    - tài liệu EN và VI khớp nhau;
    - e2e đầy đủ: 0 lỗi.
  - Rủi ro tùy chọn R-UX5I-1..4, và một backlog cho bàn giao WP5.
- **Coordinator.**
  - RECHECK-A2 và RECHECK-B3 giờ ghi `superseded_by: WP5-UX5-AUDIT-INT2`, tức lần kiểm tra lại
    tích hợp.
  - Đã đăng ký bốn task, mỗi task có brief riêng:
    - FIX18 (worker-high, sonnet). Vẫn giữ bước kiểm tra phiên bản cho các thay đổi đến từ
      nơi khác, và không bao giờ gửi các trường ngày đã cũ kèm phiên bản mới.
    - FIX18-FREEZE.
    - REGATE13: gate cho thay đổi phía client, có chạy axe khi Day editor đang mở.
    - AUDIT-INT2.
- **WP5-UX5-FIX18 xong** (worker-high, tự báo claude-sonnet-5-5). Chưa commit. Digest
  6937d79c.
  - Day editor đang mở trên desktop giờ đọc lại ngày mỗi khi phiên bản đồng hồ đổi, và giữ
    nguyên các form (không tăng `generation`). Nó chỉ lấy dữ liệu ngày mới khi các trường
    ngày trên server vẫn trùng với những gì nó đang giữ, và không lấy khi hộp thoại phiên
    làm việc đang mở.
    - Cùng bộ đếm đó cũng tăng khi tab được mở lại, với các điều kiện bảo vệ như trên.
      AUDIT-INT2 sẽ đánh giá trường hợp này.
  - Một thao tác Check in/out không làm đổi trường ngày nào.
  - Test: bốn test desktop mới (1440 px, 1280 px, thay đổi từ nơi khác, hộp thoại phiên) và
    một test điện thoại.
  - docs/04: thêm một câu, cả EN lẫn VI.
  - Các mutant M1 đến M5 đều bị bắt. M6 thì không phân biệt được.
  - Chỉ `dist/client` thay đổi.
  - `npm test`: 2.397. e2e đầy đủ: 473/36/0 và 408/101/0. Lượt chạy qua nửa đêm: 0 lỗi.
  - Công cụ: `npm run digest` báo lỗi ENOBUFS khi trong `handoff/` có nhiều file git chưa
    theo dõi. Việc này đưa vào backlog.
- **WP5-UX5-FIX18-FREEZE xong.**
  - Commit d96df5daa25b44b156354bc96605e13e94e44396 trên main, đã push dạng fast-forward từ
    a5cbc91.
  - `npm run digest` vẫn gặp lỗi ENOBUFS, nên D_PRE được tính bằng cách dùng `git ls-tree`
    trên cây đã stage. Kết quả trùng digest của HEAD, 6937d79c.
  - Đã stage 558 đường dẫn. Mọi kiểm tra đều exit 0.
- **WP5-UX5-REGATE13 ĐẠT (PASS)** (verifier, tự báo claude-sonnet-5-5) trên d96df5d /
  6937d79c. Lần đo tải đầu vào khoảng 1 lõi. Không có lỗi nào.
  - Chỉ `dist/client` thay đổi, nên giữ kết quả drill và `npm audit`.
  - Lượt cốt lõi ×3: 2.397 test.
  - e2e đầy đủ: 473/36/0 và 408/101/0.
  - Sáu lượt quét: 0 lỗi. Chạy dồn: 0 lỗi.
  - Các mutant M1 đến M3 đều bị bắt.
  - M6 không bị bắt, đúng như FIX18 đã ghi. Brief của gate liệt M6 vào nhóm bắt buộc phải
    bị bắt; coordinator ghi nhận dòng đó đặt quá chặt, và để AUDIT-INT2 đánh giá thiết kế.
  - axe: 12 lượt quét, 0 vi phạm.
- **WP5-UX5-AUDIT-INT2: CẦN SỬA (FIX REQUIRED)** (auditor, tự báo claude-opus-5-5) trên
  d96df5d.
  - F-UX5I-1 đã đóng.
  - Các lớp bảo vệ của FIX18 và việc đọc lại khi quay lại tab được đánh giá là đúng:
    docs/03:24 và :40 cho mục nhập của ngày một phiên bản riêng.
  - **F-UX5I2-1 (Medium; có từ WP2-T10).** Giả sử một thiết bị khác vừa sửa các trường của
    ngày. Sau đó, trong editor đang mở, bạn lưu phiên, bấm "Confirm breaks" hoặc xóa phiên.
    Lúc này editor nhận phiên bản mục nhập mới hơn, nhưng form vẫn giữ bản nháp cũ. Lần
    "Save day fields" kế tiếp vì vậy âm thầm ghi đè thay đổi của thiết bị kia.
  - **F-UX5I2-2 (Low).** `scripts/source-digest.mjs` không đặt `maxBuffer`, nên
    `npm run digest` lỗi trên mọi bản checkout kể từ d96df5d. docs/12:7 lại dùng chính lệnh
    này để ghi định danh bản phát hành.
  - Mọi mục khác đều giữ: e2e đầy đủ 0 lỗi, axe 16 lượt quét 0 vi phạm, AC-13.
  - Rủi ro tùy chọn mới: R-UX5I2-1..3.
- **Coordinator.**
  - RECHECK-A2 và RECHECK-B3 giờ ghi `superseded_by: WP5-UX5-AUDIT-INT3`.
  - Đã đăng ký bốn task, mỗi task kèm brief riêng:
    - FIX19 (worker-high, sonnet):
      - thêm lớp bảo vệ `sameDayFields` cho `saved()`. Nếu form chưa có thay đổi nào chưa
        lưu, form nạp lại từ dữ liệu ngày trên server. Nếu có thay đổi chưa lưu, lần lưu bị
        từ chối và "Reload day" đọc lại thay đổi;
      - thêm `maxBuffer` cho script digest;
      - các test G1, G2 và một trường hợp đã gõ ghi chú;
      - các test ghim hành vi cho các lớp bảo vệ của FIX18;
      - một mệnh đề trong docs/04 về việc đọc lại khi quay lại tab.

      R-UX5I2-3 vẫn để trong backlog vì cần chọn hành vi.
    - FIX19-FREEZE.
    - REGATE14.
    - AUDIT-INT3.
- **WP5-UX5-FIX19 xong** (worker-high, tự báo claude-sonnet-5-5). Chưa commit. Digest
  67aa715c.
  - Đã tái hiện lỗi trước khi sửa: G1 và G2 ghi đè thay đổi của thiết bị kia, và lệnh
    digest trên bản clone sạch bị lỗi.
  - `sessionWritten()` trong `DayEditor.tsx`: khi các trường ngày trong phản hồi khác với
    giá trị editor đang giữ, nếu người dùng đã gõ vào một trường thì editor giữ nguyên các
    trường và mục nhập cũ, nên lần lưu bị từ chối và "Reload day" đọc lại thay đổi. Nếu
    chưa gõ gì, form nạp lại từ phản hồi.
  - `source-digest.mjs` được thêm `maxBuffer`.
  - 11 test mới: G1 đến G3, trường hợp đã gõ ghi chú, và B, N, O.
  - docs/04 thêm mệnh đề về việc đọc lại khi quay lại tab, cả EN lẫn VI.
  - Mọi mutant đều bị bắt.
  - Chỉ `dist/client` thay đổi.
  - `npm test`: 2.397. e2e đầy đủ: 484/36/0 và 408/112/0. Lượt chạy qua nửa đêm: 0 lỗi.
  - `npm run digest` chạy lại được.
- **Đang chạy:** WP5-UX5-FIX19-FREEZE (committer). Coordinator không ghi file nào trong lúc
  committer chạy.
- **Tiếp theo:**
  - REGATE13 và AUDIT-INT2;
  - ACCEPT-DOCS: backlog trong bàn giao WP5, định danh bản phát hành trong gói pilot, và bước
    kiểm tra cảm ứng trên thiết bị thật;
  - nghiệm thu lại WP5.
- **Tiếp theo:** sửa nếu cần, rồi gate lại trên máy có tải nằm trong giới hạn. RECHECK-B3 và
  AUDIT-INT chuyển sang phụ thuộc vào lần gate mới.
- **Sau đó:**
  - gate lại có phạm vi, có chạy drill, vì bundle server thay đổi;
  - một lượt kiểm tra lại độc lập mới cho vùng B;
  - audit tích hợp, ACCEPT-DOCS và nghiệm thu lại WP5.
- **Tiếp theo:**
  - bản sửa, freeze và gate lại;
  - kiểm tra lại độc lập hai lỗi đã sửa, thay đổi Day editor và thay đổi đồng bộ giao diện
    giữa các tab;
  - audit tích hợp, ACCEPT-DOCS và nghiệm thu lại WP5.

## Cập nhật 2026-10-14: vòng thay đổi UI lần 2 theo yêu cầu chủ dự án (WP5-UX2)

- Điểm xuất phát: WP5 đã nghiệm thu lại trên 90b98ef / 57e2974c (WP5-UX-AUDIT-AB9 PASS);
  commit board cuối là aa3a7a0 (WP5-UX-ACCEPT). Mục cập nhật bên dưới ghi các bản ghi
  coordinator chưa commit sau commit đó; một tra cứu chỉ đọc (OWNER-RESEED) được thêm vào
  board ngày 2026-10-14 trước vòng này.
- Chủ dự án yêu cầu sáu thay đổi trên trang Timesheet (nguyên văn ở `owner_decisions` trên
  board): tô sáng cả cột của ngày đang mở trong Day editor; kiểu chọn nhẹ nhàng nhưng dễ
  nhận biết trong ô chọn Label; nút chuyển giao diện tối/sáng trên thanh điều hướng chính;
  hover rõ hơn trên các nút bật/tắt; nút Today tường minh sau khi Open day hoặc chuyển kỳ;
  Show details thành công tắc trượt.
- Quyết định coordinator: vòng thay đổi UI lần 2 của WP5 (mã task WP5-UX2-*) trước khi
  kích hoạt pilot, không tạo package mới; board `running`, `next_task_id` WP5-UX2-PLAN.
- Phiên coordinator mới 11acfabe-25ef-48b5-ac28-73ce2d74ecee (suy từ đường dẫn
  scratchpad); `coordinator_session_id` trên board và dòng resume trong NEXT_ACTION trỏ
  tới phiên này.
- Đang chạy: WP5-UX2-PLAN (planner, sonnet, chỉ đọc; brief
  `handoff/delivery/tasks/WP5-UX2-PLAN.md`; mockup trong
  `handoff/delivery/design/WP5-UX2/`). Bước 0 đối chiếu git (commit sau aa3a7a0, đường dẫn
  chưa commit, digest).
- Thứ tự dự kiến: kế hoạch → chỉ hỏi chủ dự án nếu kế hoạch nêu câu hỏi → commit
  checkpoint chỉ gồm handoff WP5-UX2-CKPT → các phần việc WP5-UX2-T01.., mỗi phần một lần
  đóng băng → gate cuối package (quét đồng hồ giả lập cho Today, drill) → audit opus mới →
  nghiệm thu lại WP5 kèm cập nhật định danh pilot packet; docs/10 nhận mục WP5-UX-Q1/Q2
  còn treo và yêu cầu này trong cùng vòng.
- Xong WP5-UX2-PLAN (planner, tự báo claude-sonnet-5-5, chỉ đọc): bước 0 thấy HEAD =
  origin/main = 834b9fc, một commit chỉ gồm handoff do chủ dự án tạo sau aa3a7a0, chứa các
  bản ghi WP5-UX-ACCEPT; digest 57e2974c (795 file) không đổi từ đầu đến cuối. Kế hoạch
  mục A-H, mockup và ba ảnh dựng tổng hợp trong `handoff/delivery/design/WP5-UX2/`. Không
  đổi server/API/schema. Đo thêm ngoài yêu cầu: vạch Today ở đầu cột mà docs/04 dòng 46
  hứa bị ô tiêu đề ngày (nền đặc) che mất (cũng làm hỏng viền chọn hàng loạt); một quy tắc
  hover xoá mất kiểu "đang bật" của các nút bật/tắt.
- Quyết định coordinator (board): gộp còn các phần T01 theme, T02 control (hover và trạng
  thái bật, công tắc Show details, ô chọn Label), T03 tô cột đang sửa kèm sửa vạch Today,
  T04 Today (sau khi chủ dự án trả lời), T05 tài liệu EN+VI, mỗi phần một lần đóng băng;
  màu hover áp dụng toàn app; theme lưu theo thiết bị; Day editor đang mở đi theo Today
  (mặc định F-2). Câu hỏi chủ dự án WP5-UX2-Q1 (đích của Today trong 5 ngày P-4..P;
  coordinator khuyến nghị b, kỳ chứa ngày hôm nay) chỉ chặn T04.
- Không commit checkpoint riêng: kế hoạch, mockup và các bản ghi vào commit đóng băng T01.
- Đang chạy: WP5-UX2-T01 (worker-high, sonnet; nút Dark mode).
- Chủ dự án trả lời WP5-UX2-Q1 (nguyên văn trên board): Today mở kỳ chứa hôm nay, thêm
  một nút riêng quay về kỳ mà trang mở ra (R-07). Coordinator: tên hiển thị "Current
  period" (khớp nhãn "current"); cả hai nút làm trong T04. Chạy song song với T01:
  WP5-UX2-PLAN2 (cùng planner được resume, chỉ đọc, không build, không chạy app hay
  trình duyệt) sửa lại B5 và thiết kế nút thứ hai, kèm phần thay đổi về test, tài liệu,
  dòng T04 và mockup.
- Xong WP5-UX2-PLAN2 (tự báo claude-sonnet-5-5, chỉ đọc): Today nhắm `in_progress` (đọc
  lại khi bấm), editor đi theo; Current period nhắm `current`, chỉ hiện trong P-4..P khi
  đã rời kỳ trang mở ra, chỉ chuyển kỳ; thứ tự Previous, Next, Today, Current period,
  Review. Mockup HTML đã cập nhật (ảnh dựng có trước bản bổ sung). Cảnh báo: trong khoảng
  đó, hàng nút trên điện thoại sẽ đẩy Review xuống dòng. Quyết định coordinator: một hàng
  ở 390px trong mọi trạng thái (nếu cần, nhãn hiển thị gọn "Current" dưới 768px, tên trợ
  năng "Current period"); T04 đo thật và dừng lại báo nếu không vừa.
- Chủ dự án thêm ba yêu cầu (nguyên văn trên board, kèm logo): logo C&D thay chữ "C&D
  CDsemi" (thêm "CDSemi" khi đủ chỗ); trên điện thoại đưa phần chấm công lên thanh header
  và để Today, Current period, Review & sign off cùng một hàng ("Review & sign off" có thể
  xuống hai dòng hoặc thành "Sign off"); đổi "Clock in/out" thành "Check in/out".
  Coordinator: gộp vào vòng 2; logo dùng SVG vẽ lại từ ảnh (quy tắc privacy trước commit
  chặn PNG); chữ "Current period" giữ đầy đủ. Chạy song song với T01: WP5-UX2-PLAN3 (cùng
  planner được resume, chỉ đọc).
- Xong WP5-UX2-T01 (worker-high, tự báo claude-sonnet-5-5; do người làm báo, chưa phải
  bằng chứng độc lập): nút Dark mode, `/theme-init.js` chạy trước lần vẽ đầu (CSP không
  đổi), token tối nằm trong media query và `[data-theme='dark']`; unit 1848; e2e đầy đủ
  desktop 138/0/15, mobile 142/0/11; ngân sách màn hình 659/758/667/766 trên 788; verify
  0; digest 44f5b6cc (802 file). Phát hiện R-UX2-1: `/theme-init.js` không có
  Cache-Control (trình duyệt tự đoán thời gian cache cho file không có hash). Sơ suất: hai
  lần chuyển hướng /dev/null, một heredoc ghi vào file test của chính nó.
- Xong WP5-UX2-PLAN3 (chỉ đọc): logo `src/client/public/cd-logo.svg` (kiêm favicon), 36px,
  chữ "CDSemi" từ 768px; phần chấm công lên header điện thoại trên mọi màn hình của chính
  người dùng (ClockProvider), không có trong màn hình xem chia sẻ, desktop giữ thẻ cũ, ngân
  sách 591/690/643/742; "Review & sign off" xuống hai dòng; đổi chữ chạm ba chuỗi thông báo
  phía server. Coordinator: chấp nhận, gate kiểm diff dist/server chỉ gồm ba chuỗi đó. Các
  phần cuối: T02 control, T03 tô cột, T04 Today và Current period, T05 logo, T06 đổi chữ,
  T07 chấm công trên header điện thoại, T08 tài liệu.
- Xong WP5-UX2-T01-FREEZE: af6207c281badc27192d1d420de8ace5a73c8296 trên main, đã push (46
  đường dẫn; digest 44f5b6cc, 802 file; mọi kiểm tra exit 0; một lần /dev/null vô hại).
- Đang chạy: WP5-UX2-T02 (worker-high, sonnet; hover và trạng thái bật, công tắc Show
  details, ô chọn Label) trên af6207c / 44f5b6cc.
- Chủ dự án thêm hai yêu cầu (nguyên văn trên board, kèm ảnh 2 và một file font nằm ngoài
  repo): chữ thương hiệu hai hàng ("SEMICONDUCTOR" / "SERVICES, INC.") theo font và màu
  của anh, đặt bên phải logo thay cho "CDSemi"; bỏ dòng tên công ty khỏi phần timesheet
  trên màn hình. Coordinator: cả hai vào phần thương hiệu T05; không bao giờ commit file
  font (repo public, chưa rõ giấy phép), chữ được chuyển thành đường vector; PDF giữ dòng
  tên công ty. Chạy song song với T02: WP5-UX2-PLAN4 (cùng planner được resume, chỉ đọc).
- Xong WP5-UX2-PLAN4 (chỉ đọc): font là VNI-Revue Bold (bản quyền 1991 VNI, giữ mọi
  quyền, không có điều khoản giấy phép); chữ thương hiệu "Semiconductor" (20px) trên
  "SERVICES, INC." (7px, giãn chữ), xanh ~#006bbb và xám ~#4c4f57, cùng logo rộng 196px,
  hiện từ 1280px; SVG vector nội tuyến tạo bằng fontkit đã cài, theme tối dùng màu sáng
  hơn; tên trợ năng "C&D Semiconductor Services, Inc."; dòng tên công ty bỏ khỏi bảng
  Timesheet và Review (PDF giữ nguyên). Câu hỏi chủ dự án WP5-UX2-Q2 (Q-1 quyền dùng font
  cho logo, Q-2 màu theme tối) chỉ chặn T05.
- Chủ dự án trả lời WP5-UX2-Q2 "Q-1 a, Q-2 a" (nguyên văn trên board): công ty được dùng
  font cho chữ thương hiệu (chỉ đường vector, không có file font); theme tối dùng màu sáng
  hơn. T05 không còn bị chặn.
- WP5-UX2-T02 bàn giao lần đầu (worker-high, tự báo claude-sonnet-5-5): màu hover mới, nút
  đang bật nền đặc màu nhấn (hover không xoá được; bỏ trường hợp riêng AX-04, viền focus
  6.09/6.79), Show details thành checkbox role=switch, ô chọn Label có vạch và dấu check;
  unit 1848; e2e desktop 171/0/15, mobile 174/1/11; ngân sách màn hình không đổi; verify
  0; digest c44e612c (804 file). Lỗi duy nhất là test `theme.spec.ts:215` của T01 chờ màu
  hover trên điện thoại, nơi hover không còn áp dụng (plan B4). Khác thiết kế: rãnh công
  tắc khi tắt dùng `--card` (tương phản hover 1.23/1.45 thay vì 1.08). Addendum 1 cho cùng
  worker: cho test đó rẽ nhánh theo `(hover: hover)`, rồi chạy lại e2e đầy đủ, verify và
  digest.
- Xong WP5-UX2-T02 sau addendum 1: `theme.spec.ts:215` rẽ nhánh theo `(hover: hover)`;
  e2e đầy đủ desktop 171/0/15, mobile 175/0/11; verify 0; digest 1e421090 (804 file).
- Xong WP5-UX2-T02-FREEZE: d0d21e1ffde06e4ae99c5ce90fa4a8324ccf0646 trên main, đã push
  (42 đường dẫn; digest 1e421090, 804 file; mọi kiểm tra exit 0; sơ suất: một lần
  /dev/null, một lần pipe vào tail).
- Đang chạy: WP5-UX2-T03 (worker-high, sonnet; tô cột đang sửa và sửa vạch Today) trên
  d0d21e1 / 1e421090.
- Xong WP5-UX2-T03 (worker-high, tự báo claude-sonnet-5-5; do người làm báo, chưa phải
  bằng chứng độc lập): tô cột đang sửa bằng lớp nền `::before` và viền `::after`; vạch
  Today và viền chọn hàng loạt nay hiện trên ô tiêu đề ngày; `aria-current` chỉ ở ngày đang
  sửa; khung hàng trên điện thoại (hàng chi tiết cũng có viền hai bên); viền ít nhất
  4.53:1, chữ ít nhất 4.52:1; thử đột biến bị test bắt (3 lỗi); unit 1850; e2e desktop
  183/0/15, mobile 187/0/11; ngân sách màn hình không đổi; verify 0; digest a42c5b04 (804
  file). Sơ suất ghi trên board (pipe vào tail, một /dev/null, một rm -rf thư mục nháp của
  chính nó, nằm ngoài repo).
- Xong WP5-UX2-T03-FREEZE: 70ecb1264f7b54cc967a136811eeddcd64d9014a trên main, đã push
  (35 đường dẫn; digest a42c5b04, 804 file; mọi kiểm tra exit 0; không có file bằng chứng
  checks.txt, kết quả chỉ nằm trong brief).
- Đang chạy: WP5-UX2-T04 (worker-high, sonnet; Today và Current period, hàng nút một dòng
  trên điện thoại, tự quét đồng hồ giả lập) trên 70ecb12 / a42c5b04.
- WP5-UX2-T04 bàn giao lần đầu (worker-high, tự báo claude-sonnet-5-5): Today và Current
  period đúng thiết kế; một hàng nút trên điện thoại ở 390/375/360 (Review hai dòng),
  Review xuống hàng ở 320; unit 1862; e2e desktop 190/0/19, mobile 197/0/12; quét 11 thời
  điểm đều đạt trừ một; thử đột biến bị bắt; verify 0; digest c9abda3e (807 file). DỪNG:
  vào ngày đầu của khoảng 5 ngày, trạng thái đã rời kỳ mở trang có ghi chú múi giờ thì
  hàng đầu kết thúc ở 795.0 / 803.0 so với 788 (nhãn Today cộng Review hai dòng); các
  trạng thái lúc mở trang vẫn đạt (659/758/667/766). Quyết định coordinator: Addendum 1
  chuyển phần kiểm tra trạng thái đó sang T07 (T07 giải phóng chiều cao trang), đổi thông
  báo sau khi bấm thành vùng aria-live cố định, rồi chạy lại e2e, quét, verify và digest.
- Chủ dự án thêm năm yêu cầu (nguyên văn trên board): trên điện thoại dùng "Sign off" thay
  vì cho nút Review xuống dòng (giữ chữ đầy đủ khi đủ chỗ); trên màn hình lớn, giãn khoảng
  cách giữa phần thương hiệu và menu; thay nút "Dark mode" bằng nút chuyển Light/Dark có
  icon; chữ "Due" theo kiểu nhãn; thay chữ "to" trong khoảng kỳ bằng ký hiệu đẹp hơn.
  Coordinator: T04 Addendum 2 (nhãn Review rút gọn bằng container query, nên phần kiểm tra
  trạng thái đã rời kỳ mở trang ở lại T04; "Due" theo kiểu nhãn; mũi tên ẩn với trình đọc
  màn hình, kèm chữ " to " ẩn); khoảng cách vào T05; phần mới T06 cho nút chuyển theme;
  thứ tự mới T05 thương hiệu, T06 nút theme, T07 đổi chữ, T08 chấm công trên header điện
  thoại, T09 tài liệu.
- Xong WP5-UX2-T04 sau addendum 1 và 2: vùng aria-live cố định cho thông báo; nút Review
  trên điện thoại một dòng (dạng gọn "Sign off" / "Review" bằng container query, tên trợ
  năng là nhãn đầy đủ); "Due" theo kiểu nhãn; mũi tên trong khoảng kỳ kèm " to " ẩn; trạng
  thái đã rời kỳ mở trang vào ngày đầu của khoảng 5 ngày đạt 777.5 / 785.5 trên 788 và có
  test; unit 1865; e2e desktop 191/0/19, mobile 198/0/12; quét 11 thời điểm đều đạt;
  verify 0; digest 9c76a1ec (807 file).
- Xong WP5-UX2-T04-FREEZE: 54dda11bbd95e8a8df07aa5918d1e6736231a0a5 trên main, đã push
  (101 đường dẫn; digest 9c76a1ec, 807 file; mọi kiểm tra exit 0; một lần `node -e "1"`
  thừa).
- Quyết định coordinator: tách phần thương hiệu. T05 logo (SVG vẽ lại, favicon, logo trên
  thanh trên cùng kèm tên công ty ẩn cho trình đọc màn hình) và T06 chữ thương hiệu (đường
  vector, token màu, mốc bề rộng hiển thị, khoảng cách với menu, bỏ dòng tên công ty trên
  màn hình); sau đó T07 nút Light/Dark, T08 đổi chữ, T09 chấm công trên header điện thoại,
  T10 tài liệu.
- Đang chạy: WP5-UX2-T05 (worker-high, sonnet; logo) trên 54dda11 / 9c76a1ec.
- Xong WP5-UX2-T05 (worker-high, tự báo claude-sonnet-5-5; do người làm báo, chưa phải
  bằng chứng độc lập): `cd-logo.svg` vẽ lại (3.440 B, thuần vector), độ khớp trung bình
  0.45 / 1.40 / 2.87 ở 512/64/32 (trong ngưỡng; coordinator đã xem ảnh so sánh), favicon,
  logo trên thanh trên cùng kèm tên công ty ẩn; unit 1869; e2e desktop 196, mobile 203, 0
  lỗi; verify 0; digest 38a2bb09 (810 file). Không thêm viền 1px cho vành logo (để audit
  xem).
- Xong WP5-UX2-T05-FREEZE: fa2e679273185e3ebad9f3af425177bf21fb8ac1 trên main, đã push
  (39 đường dẫn; digest 38a2bb09, 810 file; mọi kiểm tra exit 0; đầu ra thô được ghi thành
  file `.txt` trong thư mục bằng chứng của nó, đã kiểm: không có đường dẫn hồ sơ người dùng
  hay địa chỉ riêng).
- Đang chạy: WP5-UX2-T06 (worker-high, sonnet; chữ thương hiệu dạng vector, khoảng cách
  với menu, bỏ dòng tên công ty trên màn hình) trên fa2e679 / 38a2bb09.
- Xong WP5-UX2-T06 (worker-high, tự báo claude-sonnet-5-5; do người làm báo, chưa phải
  bằng chứng độc lập): chữ thương hiệu dạng vector (5.8 KB, không commit font), sáng
  #006eba/#4c4f57, tối dùng tông accent/muted; độ khớp đạt các kiểm tra của PLAN4 (đã xem
  ảnh); mốc hiển thị nâng lên 1440 vì ở 1280 có chia sẻ thì thanh xuống dòng; khoảng cách
  24px/32px; bỏ dòng tên công ty trên màn hình (PDF giữ nguyên); unit 1877; e2e desktop
  198, mobile 204, 0 lỗi; verify 0; digest 3407f8f7 (812 file).
- Xong WP5-UX2-T06-FREEZE: 3f5a3b333dede51043000e7123960ac05d26a76b trên main, đã push (68
  đường dẫn; digest 3407f8f7, 812 file; mọi kiểm tra exit 0; một lần /dev/null).
- Đang chạy: WP5-UX2-T07 (worker-high, sonnet; nút chuyển Light/Dark dạng nhóm radio có
  icon mặt trời và mặt trăng, trên desktop và menu More điện thoại) trên 3f5a3b3 / 3407f8f7.
- Xong WP5-UX2-T07 (worker-high, tự báo claude-sonnet-5-5; do người làm báo, chưa phải
  bằng chứng độc lập): nhóm radio "Theme" Light | Dark có icon mặt trời và mặt trăng, lựa
  chọn đang dùng nền đặc màu nhấn; tương phản chữ ít nhất 4.68, viền focus 6.09; thanh
  trên cùng một hàng ở 1440 khi có chia sẻ; menu More vừa; unit 1877; e2e desktop 204,
  mobile 210, 0 lỗi; verify 0; digest 3416cf04 (812 file).
- Xong WP5-UX2-T07-FREEZE: 9864400243ee0da55ff6241cca7a6ddf720e765d trên main, đã push (34
  đường dẫn; digest 3416cf04, 812 file; mọi kiểm tra exit 0).
- Đang chạy: WP5-UX2-T08 (worker, sonnet; đổi chữ Check in/out, gồm ba câu thông báo phía
  server, có chứng minh dist/server chỉ khác ở các câu đó) trên 9864400 / 3416cf04.
- WP5-UX2-T08 bàn giao lần đầu, ĐÃ DỪNG (worker, tự báo claude-sonnet-5-5): đã đổi chữ ở
  mười file client, ba câu phía server cộng một chú thích, và các test thuộc phần việc
  (vùng "Check in and out", dòng chờ "Checking your status"); unit 1878; e2e đầy đủ 4 lỗi,
  đều ở `keyboard-access.spec.ts:177` (không thuộc phần việc) vẫn chờ "Clock in/out". Một
  junction đặt sai đường dẫn từng được tạo thoáng qua ở thư mục gốc repo rồi đã xoá.
  Addendum 1: nhận thêm đúng dòng mẫu đó (chỉ tên mới), ghi lại sự cố junction kèm bằng
  chứng, rồi chạy e2e đầy đủ, chứng minh khác biệt dist/server, verify và digest.
- Xong WP5-UX2-T08 sau addendum 1: đổi tên trong mẫu keyboard-access; e2e đầy đủ desktop
  204/0/19, mobile 210/0/13; dist/server chỉ khác 9864400 ở timesheetCommands.js (3 câu, 1
  chú thích); verify 0; digest d3c1f7ca (812 file); sự cố junction đã ghi lại và thư mục
  gốc repo không còn gì sót.
- Xong WP5-UX2-T08-FREEZE: 608572f6e8ea53e1567568ac85ca49190b5d45cf trên main, đã push (45
  đường dẫn; digest d3c1f7ca, 812 file; phần src/server được stage chỉ có
  timesheetCommands.ts; mọi kiểm tra exit 0).
- Đang chạy: WP5-UX2-T09 (worker-high, sonnet; check in/out trên header điện thoại qua
  ClockProvider, không có trong màn hình xem chia sẻ, thẻ trên desktop giữ nguyên) trên
  608572f / d3c1f7ca.
- WP5-UX2-T09 bàn giao lần đầu, ĐÃ DỪNG (worker-high, tự báo claude-sonnet-5-5):
  ClockProvider (tắt trong màn hình xem chia sẻ, tối đa 3 GET như cũ) và BarClock trong
  header điện thoại cao 60px (112px khi có chia sẻ), desktop giữ thẻ cũ; ngân sách màn
  hình 571.5/670.4/623.5/722.4 trên 788; AX-01 đạt ở 390/375/360/320; e2e đầy đủ 5 lỗi,
  đều do hai phép kiểm chiều cao header cũ (`theme.spec.ts:532`, `logo.spec.ts:150`).
  Addendum 1: nhận hai phép kiểm đó với chiều cao theo thiết kế mới, rồi làm nốt unit,
  e2e, quét, verify và digest. Sơ suất: hai heredoc rỗng.
- Xong WP5-UX2-T09 sau addendum 1: hai phép kiểm chiều cao header theo thiết kế mới;
  unit 1878; e2e desktop 209/0/29, mobile 225/0/13; quét 3 thời điểm 0 lỗi; ngân sách
  571.5/670.4/623.5/722.4 và trạng thái đã rời kỳ 571.5/670.4 trên 788; AX-01 0 ô bị che;
  verify 0; digest 29ea76df (814 file).
- Xong WP5-UX2-T09-FREEZE: f70a5c0479b6cc1a0dd10d29f7791157ff29c43d trên main, đã push (43
  đường dẫn; digest 29ea76df, 814 file; mọi kiểm tra exit 0).
- Đang chạy: WP5-UX2-T10 (worker, sonnet; docs/04, 10, 12, 01, 02 và DEVELOPMENT, EN và
  VI) trên f70a5c0 / 29ea76df. Sau commit đóng băng của nó: gate cuối package
  WP5-UX2-GATE, rồi audit opus mới WP5-UX2-AUDIT.
- Xong WP5-UX2-T10 (worker, tự báo claude-sonnet-5-5; do người làm báo, chưa phải bằng
  chứng độc lập): docs/04, docs/10 (mục mới của vòng 2, danh sách quyết định coordinator,
  WP5-UX-Q1/Q2 còn treo; E-1 và F-Q5 đổi chữ sang "Check in/out" có ghi rõ), docs/12,
  docs/01, docs/02 và DEVELOPMENT, EN và VI; khớp song ngữ; preflight 0; verify 0; digest
  20e7a7c8 (814 file).
- Tiếp theo: WP5-UX2-T10-FREEZE (commit đóng băng cuối package, committer chạy một
  mình), rồi WP5-UX2-GATE (verifier) và audit opus mới WP5-UX2-AUDIT. Khi gate ghi digest
  mới, WP5-UX-AUDIT-AB9 và sáu audit trỏ tới nó được gán superseded_by WP5-UX2-AUDIT
  (không tạo chuỗi).
- Xong WP5-UX2-T10-FREEZE (đóng băng cuối package): d1a20a7f0112fa00171fe4b1d6035427855f12b6
  trên main, đã push (27 đường dẫn; digest 20e7a7c8, 814 file; mọi kiểm tra exit 0; một
  lần `node -e` thừa ra null device).
- Đang chạy: WP5-UX2-GATE (verifier, sonnet) trên d1a20a7 / 20e7a7c8: các mục gate WP5,
  ranh giới server so với 90b98ef (chỉ ba câu thông báo), phạm vi vòng, quét đồng hồ giả
  lập (6 thời điểm toàn bộ test cộng 9 thời điểm có chọn lọc), các kiểm tra riêng của vòng
  và ảnh chụp tổng hợp.
- WP5-UX2-GATE PASS (verifier, tự báo claude-sonnet-5-5; NAS chưa kiểm) trên d1a20a7 /
  20e7a7c8 (814 file, ba dạng digest bằng nhau): verify 1878; e2e 434/0/42; AC-13 x3 cùng
  Tokyo và New York; drill 208/0, image
  sha256:8b0effa0f831dbb96a08e1e0ab22615601dfbfe8384086abf1ee030682ce4310 (đã xoá); server
  và domain chỉ khác 90b98ef ở timesheetCommands (ba câu, một chú thích); phạm vi 67 đường
  dẫn đều thuộc T01-T10, không có font hay ảnh raster; quét 6 lần toàn bộ cộng 10 lần chọn
  lọc, 0 lỗi (một lần chạy lại vì lỗi bộ đệm); tương phản, 44px, không cuộn ngang; ngân sách
  571.5/670.4/623.5/722.4, trạng thái đã rời kỳ 591.0/690.0 trên 788; header 56, 60 và 112;
  CSP không đổi; không có check in/out khi xem chia sẻ; 10 ảnh chụp tổng hợp.
- Board: current_source_digest 20e7a7c8; WP5-UX-AUDIT-AB9 và sáu audit trỏ tới nó nay có
  superseded_by WP5-UX2-AUDIT.
- Đang chạy: WP5-UX2-AUDIT (auditor opus mới, xhigh) trên d1a20a7 / 20e7a7c8.
- WP5-UX2-AUDIT FIX REQUIRED (opus mới, tự báo claude-opus-5-5) trên d1a20a7 / 20e7a7c8
  (digest bằng nhau đầu và cuối): ba lỗi Low, 01 nút Today không phản hồi sau nửa đêm theo
  múi giờ báo cáo khi trang vẫn mở, 02 tài liệu thiếu mô tả hàng Review riêng ở 320px, 03
  viền focus của Today khi bị mờ chỉ 2.70:1 do opacity; rủi ro R-UX2A-1..5; các kiểm tra bắt
  buộc đều đạt (npm test 1878 x2, e2e 434/0/42, AC-13, server chỉ khác ba câu); 20 đột biến,
  16 bị bắt; độ đúng yêu cầu: cả 16 mục và hai câu trả lời đều đạt. Bản review:
  `handoff/delivery/WP5_UX2_REVIEW.vi.md` (+ en).
- Quyết định coordinator (2026-10-15): một vòng sửa WP5-UX2-FIX1 (lỗi 01-03 và R-UX2A-2);
  R-UX2A-5 (nhãn "future" trên kỳ mà Today mở ra) được hỏi chủ dự án như câu hỏi không bắt
  buộc. Sau đó FIX1-FREEZE, WP5-UX2-REGATE và audit mới WP5-UX2-AUDIT2.
- Xong WP5-UX2-FIX1 sau addendum 1 (worker-high, tự báo claude-sonnet-5-5; do người làm
  báo, chưa phải bằng chứng độc lập): nút Today khi mờ đọc lại ngày từ server khi bấm, khi
  cửa sổ được focus hoặc hiện lại (test qua nửa đêm với đồng hồ giả lập đạt ở 10-25 và
  10-31); tài liệu mô tả hàng Review dưới 330px và cách bấm mới; làm mờ bằng màu, viền
  focus 6.09-6.79; test chữ bắt cả 5 lần đổi ngược; unit 1882; e2e desktop 216/0/29,
  mobile 232/0/13; preflight và verify 0; digest ac1895d9 (815 file).
- Xong WP5-UX2-FIX1-FREEZE: b1b725b7361d55e7aed70656051359153e457b5c trên main, đã push (418
  đường dẫn, gồm bằng chứng gate, audit và FIX1; digest ac1895d9, 815 file; mọi kiểm tra
  exit 0; một lần `node -e` thừa).
- Đang chạy: WP5-UX2-REGATE (verifier, sonnet) trên b1b725b / ac1895d9: các mục gate WP5
  có drill (image phát hành mới), ranh giới, phạm vi sửa 11 đường dẫn, kiểm các lỗi đã
  sửa, quét rút gọn và các kiểm tra riêng của vòng. Sau đó audit opus mới WP5-UX2-AUDIT2.
  Câu hỏi không bắt buộc WP5-UX2-Q3 vẫn mở (mặc định a).
- WP5-UX2-REGATE FAIL (verifier, tự báo claude-sonnet-5-5) trên b1b725b / ac1895d9: mọi
  mục đều đạt (verify 1882, e2e đồng hồ thật 448/0, AC-13, drill 208 PASS với image
  2d269f87…, ranh giới, phạm vi sửa, lỗi 01-03 và R-UX2A-2 đã sửa, các kiểm tra của vòng)
  trừ hai lần chạy toàn bộ với đồng hồ giả lập ngoài khoảng 5 ngày (2026-10-17 và
  2026-12-31): mỗi lần 8 lỗi ở các test mới `focus-ring.spec.ts:407`, vì bước focus chỉ
  chạy được trong khoảng 5 ngày. Sản phẩm không lỗi (focus trực tiếp vẫn thấy viền đầy
  đủ). FIX1 chỉ chạy today.spec ngoài khoảng đó.
- Quyết định coordinator: WP5-UX2-FIX2 chỉ sửa test (worker, sonnet) để bước focus không
  phụ thuộc lịch và chạy toàn bộ test cả ngoài khoảng 5 ngày; rồi FIX2-FREEZE,
  WP5-UX2-REGATE2 và audit mới WP5-UX2-AUDIT2.
- Xong WP5-UX2-FIX2 (worker, tự báo claude-sonnet-5-5; chỉ sửa test): bước focus của Today
  khi mờ không còn phụ thuộc lịch; focus-ring.spec đạt ở 10-17, 12-31, 10-26, 10-27 và
  đồng hồ thật; e2e đầy đủ 448/0 với đồng hồ thật (sau một lần chạy lại vì lỗi bộ đệm) và
  ở 2026-10-17; unit 1882; verify 0; digest 229df806 (815 file).
- Xong WP5-UX2-FIX2-FREEZE: a6437943403fc416240fd13a787a8c4748af3e84 trên main, đã push
  (190 đường dẫn gồm bằng chứng REGATE; digest 229df806, 815 file; mọi kiểm tra exit 0;
  một heredoc rỗng đưa vào cat).
- Đang chạy: WP5-UX2-REGATE2 (verifier, sonnet) trên a643794 / 229df806 (các mục gate WP5
  có drill, ranh giới, dist giống hệt b1b725b, phạm vi sửa một file, quét trong và ngoài
  khoảng 5 ngày). Sau đó audit opus mới WP5-UX2-AUDIT2.
- WP5-UX2-REGATE2 PASS (verifier, tự báo claude-sonnet-5-5; NAS chưa kiểm) trên a643794 /
  229df806 (ba dạng digest bằng nhau): verify 1882; e2e đồng hồ thật 448/0/42; AC-13 x3
  cùng Tokyo và New York; drill 208/0, image
  sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a (đã xoá);
  dist/server chỉ khác 90b98ef ở timesheetCommands.js; dist/ giống hệt b1b725b; phạm vi sửa
  chỉ focus-ring.spec.ts (+4/-0); 9 lần quét đều 0 lỗi, gồm toàn bộ test ở 2026-10-17 và
  2026-12-31.
- Board: current_source_digest 229df806; WP5-UX-AUDIT-AB9 và sáu audit trỏ tới nó nay có
  superseded_by WP5-UX2-AUDIT2.
- WP5-UX2-AUDIT2 PASS (opus mới, tự báo claude-opus-5-5; không phải auditor vòng đầu) trên
  a643794 / 229df806, không có lỗi: 01-03 và R-UX2A-2 đã đóng, kiểm bằng đồng hồ giả lập và
  đo viền focus của chính auditor; npm test 1882 x2; e2e 448/0/42 với đồng hồ thật và ngoài
  khoảng 5 ngày; AC-13 1/1; 11 đột biến, 14 lần bắt trong 15 lần chạy; từ d1a20a7 chỉ 11
  đường dẫn của vòng sửa đổi, dist/server vẫn chỉ khác 90b98ef ở ba câu thông báo; rủi ro
  R-UX2A-1, -3, -4, -5 và mới (không bắt buộc) R-UX2A2-1..4. Bản review:
  `handoff/delivery/WP5_UX2_REVIEW2.vi.md` (+ en).
- Đang nghiệm thu lại: coordinator đã cập nhật STATE (WP5 trên a643794 / 229df806, review
  WP5_UX2_REVIEW2) và NEXT_ACTION (EN/VI); đang chạy WP5-UX2-ACCEPT-DOCS (light, sonnet:
  định danh pilot packet và WP5 handoff, EN/VI); sau đó commit nghiệm thu WP5-UX2-ACCEPT và
  chuyển board về `software_ready`.
- Xong WP5-UX2-ACCEPT-DOCS (light, tự báo claude-sonnet-5-5): pilot packet (EN/VI) cập nhật
  định danh a643794 / 229df806 / REGATE2 / image 6d184442 / AUDIT2, ghi đúng nguồn gốc phía
  server; WP5 handoff (EN/VI) thêm mục "Nghiệm thu lại sau vòng thay đổi UI lần 2
  (WP5-UX2)"; song ngữ khớp và preflight đạt; digest không đổi. Agent còn việc chạy nền sau
  khi bàn giao nên coordinator đã dừng nó (TaskStop).
- Tiếp theo: WP5-UX2-ACCEPT (committer, chạy một mình; chỉ handoff), rồi board chuyển về
  `software_ready` (bước chuyển cuối này để chưa commit). **WP5 được nghiệm thu lại trên
  a643794 / 229df806; vòng thay đổi UI lần 2 đã khép lại.** Việc tiếp theo của chủ dự án:
  duyệt pilot packet và trả lời D-1..D-15 (WP5-UX2-Q3 không bắt buộc).
- Xong WP5-UX2-ACCEPT: b1bf1479ba51f2df0d888fca232a1cb71f47c9e8 trên main, đã push (263
  đường dẫn handoff; digest 229df806 không đổi; mọi kiểm tra exit 0). **WP5 được nghiệm thu
  lại trên a643794 / 229df806; vòng thay đổi UI lần 2 đã khép lại.** Board về
  `software_ready` (next_task_id null).
- Chưa commit sau đó (chỉ handoff): bước chuyển trạng thái đó, kết quả và bằng chứng
  ACCEPT, và mục cập nhật này (+ en).
- Tiếp theo (chủ dự án): duyệt pilot packet (định danh bản phát hành a643794 / 229df806,
  image 6d184442…), trả lời D-1..D-15 và, nếu muốn, WP5-UX2-Q3 (nhãn "future"; mặc định giữ
  nguyên), làm các bước NAS, rồi quyết định cho phép pilot.

## Cập nhật 2026-10-08: vòng thay đổi UI theo yêu cầu chủ dự án (WP5)

- Chủ dự án yêu cầu UI đẹp, dễ dùng hơn; trang Timesheet bố cục giống bảng timesheet
  trong file Excel mẫu. Nguyên văn ở `owner_decisions` trên board.
- Quyết định coordinator: chạy như một vòng thay đổi WP5 trước khi kích hoạt pilot,
  không tạo package mới.
- Xong: WP5-UX-PLAN (planner, tự báo claude-opus-5-5, chỉ đọc; HEAD fe67f94 và digest
  150420e7 không đổi). Kế hoạch mục A-G trong `handoff/delivery/tasks/WP5-UX-PLAN.md`;
  mockup `handoff/delivery/design/WP5-UX/mockup.html` (artboard A1-A7) và tám ảnh chụp
  dữ liệu giả. Không đổi server/API, chỉ thêm hàm định dạng h:mm để hiển thị trong
  `src/domain/format.ts`; chia việc WP5-UX-T01..T06, một người ghi, rồi WP5-UX-GATE và
  audit opus độc lập trên digest mới.
- Phiên coordinator này không có công cụ Artifact (Design); mockup HTML thay thế.
- Câu hỏi chờ chủ dự án: `pending_owner_question_2` (E-1..E-7), chặn WP5-UX-T01.
- Commit checkpoint WP5-UX-CKPT (committer) lưu kế hoạch, mockup, ảnh, board, checkpoint
  và NEXT_ACTION, cùng bản ghi kết quả và evidence còn sót của GOV-RECOVERY-ACCEPT (lần
  2). `handoff/delivery/WP5_PILOT_PACKET.vi.md` có thay đổi chưa commit không rõ nguồn;
  để nguyên, không stage, cho đến khi chủ dự án xác nhận có phải của mình không. Sau đó board về lại `software_ready` (snapshot WP5 đã nghiệm thu không
  đổi); lần chuyển cuối này để chưa commit.
- Đã commit: WP5-UX-CKPT lần 2 = 5faa0b6f046568dae300331790a9dd168685427b trên main, đã
  push (18 đường dẫn, mọi kiểm tra exit 0, digest 150420e7). Chưa commit sau đó: kết quả
  trên board và lần chuyển về `software_ready`, cập nhật này (+ en), kết quả và evidence
  của WP5-UX-CKPT, và `WP5_PILOT_PACKET.vi.md` (không rõ nguồn, không đụng tới).
- Chủ dự án trả lời E-1..E-7 "OK theo khuyến nghị". Câu trả lời D trả lời trong chat,
  coordinator ghi nguyên văn, rồi worker tài liệu cập nhật packet EN+VI; chủ dự án đã
  hoàn lại bản nháp trong `WP5_PILOT_PACKET.vi.md`.
- Dự kiến vòng GOV-SUPERSEDE trước WP5-UX-GATE (trường audit `superseded_by`, để
  WP5-RECHECK vẫn là PASS lịch sử khi digest đổi; xem coordinator_decisions).
- Đang chạy: WP5-UX-T01 (worker, sonnet; token và khung app), gốc 5faa0b6 / 150420e7.
  Thứ tự: T01 → T01-FREEZE → … → T06, GOV-SUPERSEDE, WP5-UX-GATE, WP5-UX-AUDIT.
- T01 bàn giao lần đầu: khung app, token, link trong Settings và bốn spec đã xong;
  typecheck, lint, unit và verify exit 0; e2e mobile lỗi 3 test vì Sign out/Settings
  chuyển vào More. Phụ lục 1 mở rộng owned paths sang các spec sharing, isolation, setup
  và review (chỉ sửa test) và yêu cầu chạy toàn bộ e2e; tiếp tục cùng agent.
- T01 xong sau phụ lục 2: toàn bộ e2e exit 0 (desktop 72/0/3, mobile 73/0/2);
  typecheck, lint, verify exit 0; digest b5cdb2d4 (779 file). Một heredoc rỗng lỡ chạy
  (không ảnh hưởng, không còn task treo).
- WP5-UX-T01-FREEZE xong: 3224474 trên main, đã push (26 file, digest b5cdb2d4, mọi
  kiểm tra exit 0).
- Đang chạy: WP5-UX-T02 (worker-high, opus, novelty; bảng kiểu Excel) trên gốc
  3224474 / b5cdb2d4. Sở hữu các component bảng, sheetModel, hàm định dạng, phần thay
  hiển thị trong màn hình, styles và các spec trong `tests/e2e` (không gồm fixtures.ts).
- T02 xong (2 lần bàn giao): thêm component bảng, xóa bảng/danh sách cũ, hàm định dạng
  hiển thị; unit 1783 đạt; toàn bộ e2e exit 0 (desktop 72/0/3, mobile 73/0/2); verify
  exit 0; digest probe 1789a8be (781 file) vì `npm run digest` exit 1 khi việc xóa file
  chưa được stage (ghi trong backlog). Để gate xem: thanh trên cùng của điện thoại xuất
  hiện giữa ảnh chụp nguyên trang.
- WP5-UX-T02-FREEZE xong: 5edc548 trên main, đã push (41 file, digest 1789a8be sau khi
  stage và trên HEAD, mọi kiểm tra exit 0).
- T03 xong: PeriodBar, ClockPanel, periodBarModel (chấp nhận dù nằm ngoài owned paths đã
  liệt kê), chế độ sửa nhiều ngày; unit 1790 (lần đầu một worker vitest crash native,
  chạy lại sạch: cần theo dõi ở gate); toàn bộ e2e exit 0 (desktop 72/0/3, mobile
  73/0/2); verify exit 0; digest probe 80bffa7e (783 file). Lần thứ sáu lỡ dùng heredoc
  rỗng, không ảnh hưởng.
- WP5-UX-T03-FREEZE xong: b6324b7 trên main, đã push (38 file, digest 80bffa7e sau khi
  stage và trên HEAD, mọi kiểm tra exit 0; một lần lỡ pipe `| node -e`, vô hại).
- Đang chạy: WP5-UX-T04 (worker-high, opus, novelty; panel sửa ngày và bottom sheet,
  nhập nghỉ phép theo giờ + phút, xác nhận giờ nghỉ một chạm, chọn nhãn ngay trong ô)
  trên gốc b6324b7 / 80bffa7e.
- T04 xong: panel bên, bottom sheet, nghỉ phép giờ + phút, xác nhận giờ nghỉ một chạm,
  chọn nhãn trong ô (ba model thuần mới); unit 1808; toàn bộ e2e exit 0 (desktop
  76/0/3, mobile 77/0/2); verify exit 0; digest 6f362af9 (789 file). Lần thứ tám vi
  phạm quy tắc stdin (heredoc `cat` rỗng, không ảnh hưởng).
- WP5-UX-T04-FREEZE xong: 118a104 trên main, đã push (37 file, digest 6f362af9, mọi
  kiểm tra exit 0).
- T05 xong: Review thành bảng chỉ đọc kèm checklist; unit 1816; toàn bộ e2e exit 0
  (desktop 76/0/3, mobile 77/0/2); verify exit 0; digest 0071a588. Các assertion theo
  ngày trong review.spec được chuyển sang định dạng bảng (audit phải xác nhận không bị
  nới lỏng). Lần thứ chín vi phạm quy tắc stdin (heredoc `cat >>` rỗng, không ảnh hưởng).
- WP5-UX-T05-FREEZE xong: 6cbe5d6 trên main, đã push (27 file, digest 0071a588, mọi
  kiểm tra exit 0).
- T06 xong: docs/04, docs/10 (quyết định chủ dự án 2026-10-08) và docs/12, EN+VI;
  preflight PASS; verify exit 0; digest 46a3a0c6. Phát hiện mâu thuẫn: docs/04:16 "Display
  current viewing zone" so với thanh kỳ lương chỉ hiện múi giờ khi khác múi giờ báo cáo.
  Quyết định coordinator: giữ quy tắc, sửa UI ở WP5-UX-FIX1.
- WP5-UX-T06-FREEZE xong: abe6802 trên main, đã push (17 file, digest 46a3a0c6, mọi kiểm
  tra exit 0; lỡ pipe vào head/tail, vô hại).
- FIX1 xong: luôn hiện "Times in <zone>", thêm ghi chú khi múi giờ khác nhau; unit 1817;
  toàn bộ e2e exit 0 (desktop 77/0/3, mobile 78/0/2); preflight và verify exit 0; digest
  2565b1e8. Không có sai lệch.
- WP5-UX-FIX1-FREEZE xong: 4def605 trên main, đã push (23 file, digest 2565b1e8, mọi
  kiểm tra exit 0). Toàn bộ mã nguồn của vòng làm lại UI đã freeze.
- GOV-SUPERSEDE-FIX xong: validate_superseded (sáu quy tắc) và miễn kiểm tra stale-PASS;
  probe 87 -> 106; board thật vẫn đạt; docs/08 (+vi); dòng quy tắc trong tám profile;
  preflight và verify exit 0; digest 3d274c9e. Một lần lỡ `ls | head`, vô hại.
- GOV-SUPERSEDE-FREEZE xong: 831f760 trên main, đã push (31 file, digest 3d274c9e,
  validator mới PASS trên 283 task, 106 probe).
- GOV-SUPERSEDE-GATE PASS trên 831f760 (106 probe; các tình huống chấp nhận/từ chối đúng
  dự kiến; digest 3d274c9e).
- GOV-SUPERSEDE-AUDIT PASS (opus mới, không có finding; 48 tình huống, giữ 85 probe cũ,
  diệt 27/30 mutant; R1/R2 tùy chọn trong governance backlog; R3 là kỷ luật của
  coordinator) tại 831f760 / 3d274c9e.
- GOV-SUPERSEDE-ACCEPT xong: 5beae2f trên main, đã push (40 file handoff). GOV-SUPERSEDE
  đã nghiệm thu.
- WP5-UX-GATE PASS trên 831f760 (NAS chưa kiểm): digest 3d274c9e ở ba dạng; verify 1817;
  e2e 155/0/5; AC-13 ba lần và dưới hai múi giờ thật; drill 208/0, image
  sha256:2c8d9db2…24143 (đã xóa sau khi chạy); ranh giới chỉ có formatHoursMinutes; PDF
  không đổi; tương phản >= 4.65 (đường kẻ không phải chữ 2.86/2.97 được ghi nhận); npm
  test ba lần ổn định; thanh trên cùng là sticky (lỗi ghép ảnh đã giải thích); 44px và
  không cuộn ngang.
- Board: current_source_digest 3d274c9e; WP5-RECHECK superseded_by WP5-UX-AUDIT-A.
- Đang chạy (song song, chỉ đọc): WP5-UX-AUDIT-A (toàn vẹn nghiệp vụ, múi giờ, đường
  sửa, chia sẻ, riêng tư, PDF; cổng 47910-47929) và WP5-UX-AUDIT-B (đúng yêu cầu chủ dự
  án, độ chặt của test, trợ năng, chuẩn UI, tài liệu, e2e đầy đủ; cổng 47930-47949), cả
  hai là opus mới.
- WP5-UX-AUDIT-B xong: FIX REQUIRED. B-01 (Medium) màn hình đầu trên điện thoại không
  thấy dòng ngày nào; B-02 (Medium) panel bên ở khổ 768-1199px che các control của bảng
  vẫn nhận focus, Esc trên bảng không đóng panel, docs/04:59 mô tả sai; B-03 (Low)
  assertion import bị nới lỏng (import.spec.ts:382-396); B-04 (Low) docs/04 dòng 41, 55
  (EN/VI). Các kiểm tra của auditor đều đạt; digest 3d274c9e.
- WP5-UX-AUDIT-A: lần bàn giao đầu NOT VERIFIED (dừng sau khi lệnh xóa file thừa
  D:\raw-r07.txt bị chặn; đã nhờ chủ dự án xóa); đang chạy tiếp, gồm câu hỏi
  `noValidate` của ô nghỉ phép và dòng cảnh báo lỗ hổng của npm ci.
- WP5-UX-AUDIT-A xong (2026-10-09): FIX REQUIRED, A-01 (Medium) nhập nghỉ phép sai định
  dạng bị lưu thành giá trị khác (noValidate + leaveInputModel); các probe của auditor về
  múi giờ, AC-04, chia sẻ, cách ly và riêng tư đều đạt; cảnh báo 'high' của npm là
  source-map-js chỉ dùng khi phát triển, đã có từ trước (R-RA6).
- Vòng sửa (quyết định coordinator 2026-10-09): WP5-UX-FIX2 (A-01) đang chạy, rồi
  FIX2-FREEZE, WP5-UX-FIX3 (B-01..B-04), FIX3-FREEZE, WP5-UX-REGATE, audit lại độc lập
  WP5-UX-AUDIT-A2 và -B2.
- WP5-UX-FIX2 xong: nhập nghỉ phép sai định dạng bị từ chối (role=alert, aria-invalid,
  không gửi gì); unit 1820; toàn bộ e2e desktop 78/0/3, mobile 79/0/2; verify exit 0;
  digest 574bbc02. Sửa thêm một chỗ chờ e2e dễ chập chờn có từ trước (audit lại phải xác
  nhận không bị nới lỏng).
- WP5-UX-FIX2-FREEZE xong: aebc06f trên main, đã push (185 file, digest 574bbc02).
- WP5-UX-FIX3 bàn giao lần đầu: xong B-01 (dòng đầu trên điện thoại kết thúc ở 758px <
  788px), B-02 (dạng hộp thoại khóa nền dưới 1200px; Esc đóng từ mọi chỗ), B-03, B-04;
  unit 1820; toàn bộ e2e 162/0/10; preflight và verify exit 0; digest b4df9213. Thứ tự
  Tab trên điện thoại (link review đứng trước `>`) được trả lại cùng worker qua phụ lục 1
  trước khi freeze.
- WP5-UX-FIX3 xong sau phụ lục 1 (thứ tự DOM trước, sau, review; thêm assertion thứ tự
  Tab cho cả hai bản): unit 1820; toàn bộ e2e 164/0/10; preflight và verify exit 0;
  digest 8c07aac5.
- WP5-UX-FIX3-FREEZE xong: 589bcff trên main, đã push (38 file, digest 8c07aac5).
- WP5-UX-REGATE PASS trên 589bcff (NAS chưa kiểm): digest 8c07aac5 ở ba dạng; verify
  1820; e2e 164/0/10; AC-13 ba lần và hai múi giờ; drill 208/0, image
  sha256:6ab12fdf7889467842a044430dee0386d9f8755897ff2d4681421f558080cf72 (đã xóa sau khi
  chạy); ranh giới chỉ có formatHoursMinutes; PDF không đổi; đã quan sát A-01, B-01
  (659 <= 788), B-02, B-03, B-04 và thứ tự Tab đều đã sửa.
- Board: current_source_digest 8c07aac5; superseded_by của WP5-RECHECK là WP5-UX-AUDIT-A2.
- WP5-UX-AUDIT-B2 xong: FIX REQUIRED, một finding mức Low B2-01 (ô "Open a day" một hàng
  cắt mất ngày đã gõ ở khổ 360/320px, WCAG 1.4.10); B-01..B-04 đã đóng; 0 assertion bị
  nới lỏng; toàn bộ e2e 164/0/10; digest 8c07aac5.
- WP5-UX-AUDIT-A2 xong: PASS trên 589bcff / 8c07aac5, không có finding; A-01 đã đóng (12
  input sai bị từ chối trên ba bố cục; body hợp lệ giống 014bd47); rủi ro Info R2 (thứ
  tự Esc khi thu nhỏ dưới 1200px lúc đang mở review của bộ chọn) và R5 (thanh của người
  được chia sẻ trên điện thoại) được ghi lại, không sửa.
- WP5-UX-FIX4 xong: ô Open a day trên điện thoại hiện đủ ngày (220px ở 360, 180px ở 320;
  bố cục 390 không đổi); O-1..O-3; unit 1820; toàn bộ e2e 167/0/13; verify exit 0;
  digest 0b8428fd.
- WP5-UX-FIX4-FREEZE xong: a2ea7a4 trên main, đã push (246 file, digest 0b8428fd).
- WP5-UX-REGATE2 PASS trên a2ea7a4 (NAS chưa kiểm): digest 0b8428fd ở ba dạng; verify
  1820; e2e 167/0/13; AC-13 ba lần và hai múi giờ; drill 208/0, image
  sha256:410209b0d74225b7e20337279bccd6ab4bb0173a7437fa2e879344e2fac4ac9e (đã xóa sau khi
  chạy); B2-01 đã đóng (146/220/180px); B-01 659.02 (757.97 khi có ghi chú múi giờ) <=
  788; A-01, B-02, thứ tự Tab vẫn đúng.
- Board: current_source_digest 0b8428fd; WP5-UX-AUDIT-A2 và WP5-RECHECK có superseded_by
  WP5-UX-AUDIT-A3.
- WP5-UX-AUDIT-A3 PASS trên a2ea7a4 / 0b8428fd (thay đổi FIX4 chỉ là comment/CSS; body
  giống 014bd47; các kiểm tra đều đạt). Auditor để lại file thừa D:\canedit.txt (chủ dự
  án xóa cùng D:\raw-r07.txt).
- WP5-UX-AUDIT-B3 FIX REQUIRED: B3-01 (Low) hộp xác nhận lồng bên trong mất Esc và focus
  khi đổi chế độ ở mốc 1200px; B3-02 (Low) docs/04 dòng 55; B2-01 đã đóng; tùy chọn O-5
  (assertion con không bao giờ fail) và R-7 (chỉnh token).
- WP5-UX-FIX5 xong (opus): panel sửa ngày hoãn đổi chế độ khi còn hộp thoại khác đang
  mở; docs/04 dòng 55; O-5 thành assertion có thể fail; R-7 token 8.5/14.25rem (ở 375px
  dòng đầu nay nằm trên thanh tab); tự kiểm 9 đường thay đổi kích thước; e2e desktop
  84/0/9, mobile 86/0/7; verify exit 0; digest b7bbcbc0.
- WP5-UX-FIX5-FREEZE xong: edaaa85 trên main, đã push (302 file, digest b7bbcbc0).
- WP5-UX-REGATE3 PASS trên edaaa85 (NAS chưa kiểm): digest b7bbcbc0 ở ba dạng; verify
  1820; e2e 170/0/16; AC-13 ba lần và hai múi giờ; drill 208/0, image
  sha256:1332b6d5ac7bbbc127b0b64f56814373088e989508137f6760640a7d5abc6af2 (đã xóa sau khi
  chạy); B3-01 đúng trên ba đường đổi kích thước; B3-02, R-7 (đủ ngày ở 390/375/360/320)
  và các lỗi đã sửa trước vẫn đúng.
- Board: current_source_digest b7bbcbc0; WP5-RECHECK, WP5-UX-AUDIT-A2 và -A3 có
  superseded_by WP5-UX-AUDIT-A4.
- WP5-UX-AUDIT-A4 PASS trên edaaa85 / b7bbcbc0, không có finding (việc hoãn đổi chế độ
  không bao giờ đổi dữ liệu được lưu; 12 lần lưu sau khi đổi giống 014bd47; các kiểm tra
  đều đạt).
- WP5-UX-AUDIT-B4 FIX REQUIRED trên edaaa85: B3-01 đã đóng trên 7 đường, B3-02, O-5, R-7
  xong, không assertion nào bị nới lỏng; mới có B4-01 (Medium, đánh giá lại R-1: vòng
  focus 1.72:1 / 2.46:1, WCAG 1.4.11) và B4-02 (Low, giờ hạn nộp dạng ISO trong ghi chú
  múi giờ so với docs/04 dòng 45).
- Theo quyết định 2026-10-09, hỏi chủ dự án WP5-UX-Q1 thay vì lặp tiếp; đã chuẩn bị brief
  WP5-UX-FIX6 ở trạng thái pending (khuyến nghị phương án a).
- WP5-UX-CKPT2 xong: c24d634 trên main, đã push (300 file handoff, digest b7bbcbc0).
- Board: status `blocked`, next_task_id WP5-UX-FIX6 (pending), chờ chủ dự án trả lời
  WP5-UX-Q1. Chưa commit: lần chuyển trạng thái này, kết quả và evidence của CKPT2, và
  cập nhật checkpoint này (+ en).
- Chủ dự án trả lời WP5-UX-Q1 "a" (2026-10-09, đã ghi nguyên văn). Board về lại `running`.
- WP5-UX-FIX6 xong: vòng focus 5.2-7.5:1 trên mọi nền ở cả hai giao diện (thêm test e2e
  focus-ring), ngày hạn nộp kiểu Mỹ trong ghi chú múi giờ; unit 1821; toàn bộ e2e
  174/0/16; verify exit 0; digest 07c3ca00.
- Đối chiếu (WP5-UX-RECON1): HEAD = origin/main = 49a3ff0, một commit chỉ chứa handoff do
  chủ dự án tự commit sau c24d634 (kết quả CKPT2, lần chuyển trạng thái board, checkpoint);
  mã nguồn không đổi.
- WP5-UX-FIX6-FREEZE xong: 5e104e1 trên main, đã push (32 file, digest 07c3ca00, 790
  file).
- WP5-UX-REGATE4 PASS trên 5e104e1 (NAS chưa kiểm): digest 07c3ca00 ở ba dạng; verify
  1821; e2e 174/0/16; AC-13 ba lần và hai múi giờ; drill 208/0, image
  sha256:218dd7cc9e567862182f633914717e4087d2bb2265a77a2d98a7eaaf596e9791 (đã xóa sau khi
  chạy); vòng focus 6.09 / 6.79:1 trên sáu loại control; ghi chú múi giờ dạng Mỹ; các lỗi
  sửa trước vẫn đúng.
- Board: current_source_digest 07c3ca00; WP5-RECHECK, A2, A3 và A4 có superseded_by
  WP5-UX-AUDIT-A5.
- WP5-UX-AUDIT-B5 FIX REQUIRED trên 5e104e1: B4-01 và B4-02 đã đóng; lỗi WCAG 2.2 AA mới
  B5-01 (Medium, thanh sticky che control đang focus khi Shift+Tab, SC 2.4.11), B5-02
  (Medium, lựa chọn đang chọn trong bộ chọn nhãn 1.14:1 / 1.28:1, SC 1.4.11) và B5-03
  (Low, hộp thoại sửa ngày là một điểm dừng focus không có dấu hiệu, SC 2.4.7); không có
  assertion nào bị nới lỏng; toàn bộ e2e 174/0/16.
- WP5-UX-AUDIT-A5 PASS trên 5e104e1 / 07c3ca00, không có finding (FIX6 không đổi hành vi
  phần A; 20316 phép kiểm DST; server giống từng byte). Phần A đã cập nhật.
- Câu hỏi WP5-UX-Q2 trên board và trong NEXT_ACTION (+vi); brief chờ WP5-UX-A11Y-SWEEP
  (phương án a).
- WP5-UX-CKPT3 xong: d3935e7 trên main, đã push (310 file handoff, digest 07c3ca00).
- Board: status `blocked`, next_task_id WP5-UX-A11Y-SWEEP (pending), chờ chủ dự án trả
  lời WP5-UX-Q2. Chưa commit: lần chuyển trạng thái này, kết quả và evidence của CKPT3,
  và cập nhật checkpoint này (+ en).
- Chủ dự án trả lời WP5-UX-Q2 "a" (2026-10-09, đã ghi nguyên văn). Board về lại `running`.
- Đang chạy: WP5-UX-A11Y-SWEEP (planner, opus, chỉ đọc; quét axe tự động cùng đi phím đầy
  đủ qua mọi màn hình trên máy tính và điện thoại, nền sáng và tối).
- Tiếp theo: một vòng sửa WP5-UX-FIX7 cho mọi lỗi WCAG 2.2 AA mà bản rà soát liệt kê,
  freeze, WP5-UX-REGATE5, B6 mới và A6 kiểm phần thay đổi, rồi nghiệm thu lại WP5 (ghi
  quyết định Q1 và Q2 của chủ dự án vào docs/10).
- WP5-UX-A11Y-SWEEP xong (planner, tự báo claude-opus-5-5, chỉ đọc): mười lỗi WCAG 2.2 AA
  AX-01..AX-10 (AX-01..AX-03 = B5-01..B5-03; mới: AX-04 viền focus của nút công cụ đang
  bật, AX-05 tên trợ năng không chứa chữ hiển thị (SC 2.5.3), AX-06 bộ chuyển chia sẻ tự
  điều hướng khi đổi lựa chọn (SC 3.2.2), AX-07 thiếu vai trò status/alert (SC 4.1.3),
  AX-08 focus không trả về sau hộp thoại (SC 2.4.3), AX-09 độ tương phản `--ok` nền sáng
  (SC 1.4.3), AX-10 tiêu đề nhập hàng loạt tràn ở 320px (SC 1.4.10)). HEAD thấy là 5b349f8
  (commit chỉ có handoff sau d3935e7; lần freeze tới kiểm tác giả và nội dung).
- Quyết định coordinator (AGENTS quy tắc 8): AX-05 mâu thuẫn với docs/04 dòng 48 (tên nút
  ngày); tên mới sẽ chứa chữ hiển thị và giữ ngày ISO, docs/04 EN+VI đổi trong FIX7.
- WP5-UX-FIX7 xong (tự báo claude-opus-5-5; là báo cáo, chưa phải bằng chứng độc lập):
  sửa cả mười lỗi chỉ phía client trong 29 file cùng docs/04 dòng 48 EN+VI; các kiểm
  tra mới fail trên 5e104e1; tự kiểm bằng probe: 0 điểm dừng bị che; AX-09 lệch đề xuất
  `--ok` #136a42; thêm viền focus ô ngày (R-12); unit 1823, toàn bộ e2e 208/0/24,
  preflight và verify 0; digest b7c011d2. Sơ suất: một `| head`, một thư mục TEMP dùng
  chung cho hai lần chạy song song.
- WP5-UX-FIX7-FREEZE lần 1 dừng trước khi commit: 5b349f8 là checkpoint chỉ có handoff
  của chủ dự án (tác giả huysrc, 6 file handoff); digest b7c011d2 khớp; 141 đường dẫn đã
  stage và để nguyên; bước kiểm tra trước commit chặn 36 địa chỉ giả bị cắt
  (tên miền bị cắt còn `example.inval`) và một mẫu grep đường dẫn hồ sơ người dùng trong evidence và bản
  ghi FIX7.
- WP5-UX-FIX7-MASK xong (light, tự báo claude-sonnet-5-5): 36 lần thay bằng `<email>` và
  một lần thay bằng `<user>` trong chín file; không đổi index; dùng sed thay vì Edit.
- WP5-UX-FIX7-FREEZE lần 2 dừng: 143 đường dẫn đã stage, 7 chỗ chặn email mới, đều là
  bản ghi viết sau lần che có trích lại địa chỉ bị cắt (năm chỗ của coordinator đã viết
  lại không có ký tự at; quy tắc đã ghi vào runtime_observations).
- WP5-UX-FIX7-MASK lần 2 xong: đã sửa cả hai dòng; quét toàn bộ handoff: 0 email bị
  chặn, 0 đường dẫn hồ sơ trong các file đã đổi; 21 chỗ khớp mẫu cũ trong các file đã
  commit được ghi lại để phân loại quyền riêng tư (chỉ đọc) sau này.
- WP5-UX-FIX7-FREEZE lần 3 xong: bf954c0b371ad9a5fe461a603c5d476ea210e66c trên main, đã
  push (143 đường dẫn; digest cây làm việc và HEAD đều b7c011d2; mọi kiểm tra exit 0).
- WP5-UX-REGATE5 PASS (verifier, tự báo claude-sonnet-5-5; NAS chưa kiểm) trên bf954c0 /
  b7c011d2: unit 1823, toàn bộ e2e 208/0/24, drill 208 PASS, image
  sha256:1b7b561e3d6ca29cedd4fc7bb5bc3b2cecd1c8c88a6b86370e9b267c0765caf4; phạm vi sửa đúng
  29 đường dẫn; AX-01 0 điểm dừng bị che trong 64 lượt đi phím; viền focus 5.3-6.8:1; hai
  thông báo status ở admin/Settings chỉ kiểm qua mã nguồn.
- WP5-UX-AUDIT-A6 PASS (opus mới, tự báo claude-opus-5-5), không có finding: FIX7 không
  đổi hành vi phần A (Cancel/Escape/Back không ghi gì, body giống nhau từ 014bd47, bộ
  chuyển chia sẻ vẫn đúng 6 route, AC-16 và cách ly giữ nguyên, chọn ngày bằng data-day
  đúng qua DST và múi giờ thiết bị, hook thanh dính không che control nào); npm test 1823,
  e2e phần A 155/0/23, AC-13 1/1. Board: A5, A4, A3, A2 và WP5-RECHECK có superseded_by
  A6; digest hiện hành b7c011d2.
- WP5-UX-AUDIT-B6 FIX REQUIRED (opus mới): mọi mục của vòng sửa đã đóng (B5-01..B5-03,
  AX-04..AX-10, R-12; 200 lượt đi phím, 7320 điểm dừng, 0 bị che, 0 thiếu viền; không
  assertion nào bị nới lỏng; e2e lần 2 208/0/24, lần 1 có một lỗi ECONNRESET thoáng qua ở
  automation.spec.ts:118). Finding mới mức Low WP5-UX-B6-01 (có từ trước): ở 390x844,
  người có timesheet được chia sẻ và có ghi chú múi giờ thì thanh trên cùng thành hai
  dòng; dòng ngày đầu tiên kết thúc ở 830.2px, dưới thanh tab ở 788px (docs/04 dòng 48).
- Quyết định coordinator: sửa bố cục, giữ nguyên docs/04 dòng 48; giữ nguyên docs/10 khi
  nghiệm thu lại (docs/10 nằm trong digest), Q1 và Q2 vẫn ghi trên board và đưa vào WP5
  handoff.
- WP5-UX-FIX8 xong (tự báo claude-sonnet-5-5; là báo cáo, chưa phải bằng chứng độc lập):
  chỉ sửa CSS cho thanh trên cùng còn một dòng dưới 768px (`styles.css`, token mới
  `--switcher-basis`) và thêm hai kiểm tra e2e mobile trong `sharing.spec.ts`, fail trên
  bf954c0; ở 390x844 đáy dòng đầu là 659 / 758 / 667 / 766 so với 788; unit 1823; toàn bộ
  e2e 210/0/26; verify 0; digest b07727b2.
- WP5-UX-FIX8-FREEZE lần 1 dừng: board ghi hai file evidence của FIX7-FREEZE mà thực tế
  chưa từng được tạo, nên validator báo lỗi (kiểm tra trước commit sạch, 393 đường dẫn đã
  stage). Đã sửa danh sách trên board.
- Lần 2 dừng ở validator: FIX8 ghi audit B6 (FIX REQUIRED) trong depends_on. Đã bỏ;
  addresses_audit vẫn giữ liên kết.
- WP5-UX-FIX8-FREEZE lần 3 xong: 255ba17d6bf891c0ff779d4a4f518e0d2998cee8 trên main, đã
  push (393 đường dẫn; digest b07727b2; mọi kiểm tra exit 0).
- WP5-UX-REGATE6 PASS (verifier, tự báo claude-sonnet-5-5; NAS chưa kiểm) trên 255ba17 /
  b07727b2: unit 1823, toàn bộ e2e 210/0/26, drill 208 PASS, image
  sha256:f36d083ee6dd37ab66c1d00a98398a18171264ebad17b170f1a9c85b25e83af4; phạm vi sửa 2
  đường dẫn (76 dòng thêm, 0 dòng xóa); B6-01 vừa khung ở cả bốn trường hợp tại 390x844;
  AX-01 0 điểm dừng bị che. Thông tin để B7 đánh giá: ở 320 chữ trong ô chọn của bộ chuyển
  bị cắt; ở 375/360/320, khi có chia sẻ và ghi chú múi giờ thì màn hình đầu vẫn vượt khung
  (nằm ngoài lời hứa ở 390x844).
- B7 và A7 lần 1 (2026-10-09) dừng vì chạm giới hạn sử dụng hàng tuần của subscription;
  không ghi bản ghi nào. Chủ dự án yêu cầu chạy lại (2026-10-13).
- WP5-UX-AUDIT-A7 lần 2 FIX REQUIRED (opus mới): FIX8 không đổi hành vi phần A (chứng
  minh phần thay đổi đạt), nhưng có WP5-UX-A7-01 (Low, chỉ ở test, có từ trước FIX8):
  `isolation.spec.ts` (và `shell.spec.ts:68`) tạo dữ liệu vào một ngày nằm ngoài kỳ đang
  hiển thị trong 4 trên mỗi 14 ngày (thứ Ba đến thứ Sáu tuần đầu mỗi kỳ; hiện tại đến hết
  2026-10-16 giờ Los Angeles), nên spec cách ly bắt buộc fail trên mọi bản build trong
  những ngày đó. Bản thử đổi ngày tạo dữ liệu, giữ nguyên assertion, pass 6/6.
- WP5-UX-AUDIT-B7 lần 2 FIX REQUIRED (opus mới): B6-01 đã đóng (đáy dòng đầu 757.97 /
  659.02 / 765.97 / 667.02 so với 788), mọi mục phần B chịu ảnh hưởng của thanh trên
  cùng đều đạt, không assertion nào bị nới lỏng; lỗi chặn duy nhất là WP5-UX-B7-01, cùng
  lỗi ngày trong test với A7-01 (6 test e2e fail trong khoảng ngày lỗi, cả trên bf954c0).
  Rủi ro không bắt buộc: R-B7-1 (chữ trong ô chọn bị cắt ở 355-420 px sau FIX8),
  R-B7-2..R-B7-4.
- Quyết định coordinator: một vòng chỉ sửa test WP5-UX-FIX9, có phép kiểm tất định cho
  khoảng ngày; không đổi sản phẩm; R-B7-1..R-B7-4 đưa vào backlog của vòng sửa pilot.
- WP5-UX-FIX9 xong (tự báo claude-sonnet-5-5; là báo cáo, chưa phải bằng chứng độc lập):
  kỳ đang hiển thị là kỳ có ngày trả lương sớm nhất từ hôm nay trở đi; cách chọn ngày cũ
  sai trong 4 ngày kết thúc ở mỗi ngày trả lương (P-3..P; đúng như A7 mô tả).
  Spec cách ly và spec khung app giờ dùng `displayedSeedDay()`; test tất định mới
  `tests/domain/e2eSeedSelection.test.ts` (cách chọn cũ fail); 5 đường dẫn test; chạy spec
  3 lần đều pass trong khoảng ngày lỗi; toàn bộ e2e 210/0/26; unit 1827; verify 0; digest
  58b0deee.
- WP5-UX-FIX9-FREEZE xong: 3670a6c3c22ddcf75138927ed60f4cd9bf02078d trên main, đã push
  (374 đường dẫn; digest 58b0deee; mọi kiểm tra exit 0).
- WP5-UX-REGATE7 lần 1 NOT VERIFIED chỉ vì không kết nối được Docker engine (drill --wp3
  không chạy được). Mọi mục khác đều đạt trên 3670a6c / 58b0deee: toàn bộ e2e 210/0/26
  chạy trong khoảng ngày lỗi (2026-10-13 13:04 giờ Los Angeles), unit 1827, test chọn
  ngày fail với cách chọn cũ, spec mới pass 3 lần, 230 file dist giống từng byte với
  255ba17.
- Board đã `blocked`, chờ chủ dự án làm WP5-UX-DOCKER (mở Docker Desktop). Chủ dự án trả
  lời "tiếp tục nếu đang chạy dở" mà chưa xác nhận Docker; board về lại `running`. REGATE7
  lần 2 (chỉ drill) dừng ở bước kiểm engine: client 28.5.1, thiếu pipe của Docker Desktop
  Linux engine. Board lại `blocked` chờ WP5-UX-DOCKER. Checkpoint commit WP5-UX-CKPT4
  xong: dc70ba65eb6c93925b3abe821829b76fc7e1f9da trên main, đã push (100 đường dẫn
  handoff, digest 58b0deee không đổi). Chưa commit sau đó: cập nhật này (+ en), kết quả
  trên board, kết quả và evidence của CKPT4. Chủ dự án trả lời "Docker đã chạy"; board `running`.
  WP5-UX-REGATE7 lần 3 (chỉ drill): drill --wp3 208 PASS / 0 FAIL, image
  sha256:52b45ad9774df69e0a116440bbd64d15fa114ad0273af6b063f08a8f7c61b590, đã dọn sạch;
  cả gate PASS trên 3670a6c / 58b0deee (NAS chưa kiểm). WP5-UX-AUDIT-AB8 (audit
  opus mới, gộp) FIX REQUIRED: sản phẩm giống từng byte với 255ba17, độ mạnh của test và
  quy tắc chọn ngày đều PASS, AC-01 pass trong khoảng ngày lỗi, B7-01 = A7-01 đã đóng;
  nhưng toàn bộ e2e có 3 test fail (AB8-01, các test hạn chót sau giờ hạn nộp), và một lượt
  quét bằng đồng hồ giả lập đã được kiểm chứng tìm thêm AB8-02 (hết ngày trống ngày
  2026-11-28..30), AB8-03 (nhập ngày lễ qua năm mới) và AB8-04 (năm nhập mặc định từ
  2027-01-01). Tất cả chỉ ở test và có từ trước.
- Quyết định coordinator: một vòng chỉ sửa test WP5-UX-FIX10 (worker-high, sonnet), tự
  chạy lượt quét đồng hồ giả lập và sửa mọi lỗi theo lịch mà lượt quét cho thấy. Sau đó
  freeze, WP5-UX-REGATE8 (đồng hồ thật và lượt quét) và audit gộp AB9.
- WP5-UX-FIX10 xong (tự báo claude-sonnet-5-5; là báo cáo, chưa phải bằng chứng độc
  lập): AB8-01 ghi một hạn chót muộn hơn qua đường ngoại lệ trả lương khi hạn của kỳ đang
  hiển thị đã qua; AB8-02 trả lại các ngày đã tạo dữ liệu; AB8-03 ngày nhập nằm sau kỳ
  đang hiển thị; AB8-04 năm nhập mặc định theo quy tắc của client. 8 file test, không có
  file mới. Lượt quét: 14 lần chạy toàn bộ trên cả hai project, 0 fail (một lỗi thoáng
  qua ERR_NO_BUFFER_SPACE ngày 2027-01-19, chạy lại thì pass); unit 1831; verify 0; digest
  57e2974c.
- WP5-UX-FIX10-FREEZE xong: 90b98efc395c3894a21a909b6d361eadc6fc2bd9 trên main, đã push
  (106 đường dẫn; digest 57e2974c; mọi kiểm tra exit 0).
- WP5-UX-REGATE8 PASS (verifier, tự báo claude-sonnet-5-5; NAS chưa kiểm) trên 90b98ef /
  57e2974c: e2e trên đồng hồ thật 210/0/26 lúc 22:20 giờ Los Angeles, sau hạn nộp của kỳ
  đang hiển thị; lượt quét 7 thời điểm 0 fail; drill 208 PASS, image
  sha256:dec7b4856a8220743c513a955a840d399e4be0d74970a89801ea39b6d7898327; dist giống hệt
  3670a6c; phạm vi sửa đúng 8 đường dẫn test.
- WP5-UX-AUDIT-AB9 PASS (opus mới, gộp, tự báo claude-opus-5-5; không có finding): dist
  giống từng byte ở 255ba17, 3670a6c và 90b98ef; độ mạnh của test giữ nguyên; cách dựng
  hạn chót qua ngoại lệ trả lương của AB8-01 vẫn chứng minh tự động hóa hạn chót, quy tắc
  kích hoạt docs/05 và PDF tự động; lượt quét riêng ở 8 thời điểm mới (2026-2028) và 2 lần
  chạy một worker, tất cả 210/0/26; e2e đồng hồ thật 210/0/26; AC-01 và AC-13 đạt;
  AB8-01..04 đã đóng; R-AB9-1..6 (không bắt buộc) vào backlog pilot. Board: A6, A5, A4, A3,
  A2 và WP5-RECHECK có superseded_by AB9; digest hiện hành 57e2974c.
- WP5-UX-ACCEPT-DOCS xong (light, tự báo claude-sonnet-5-5): pilot packet (EN/VI) cập nhật
  thành 90b98ef / 57e2974c / image dec7b485 / AB9, dist/server giống từng byte ở 74d5bfe,
  014bd47 và 90b98ef (chỉ client thay đổi); WP5 handoff (EN/VI) có mục nghiệm thu lại; kiểm
  tra song ngữ và preflight đạt; digest không đổi. Coordinator đã cập nhật STATE (WP5
  nghiệm thu lại trên 90b98ef) và NEXT_ACTION (EN/VI).
- WP5-UX-ACCEPT xong: aa3a7a02f04a059843d120f7372848709f816f69 trên main, đã push (182
  đường dẫn handoff; digest 57e2974c không đổi; mọi kiểm tra exit 0). **WP5 đã nghiệm thu
  lại trên 90b98ef; vòng thay đổi UI đã khép lại.** Board về lại `software_ready`
  (next_task_id null). Chưa commit sau đó: lần chuyển trạng thái này, kết quả và evidence
  của ACCEPT, và cập nhật này (+ en).
- Tiếp theo (chủ dự án): duyệt pilot packet (định danh bản phát hành 90b98ef / 57e2974c),
  trả lời D-1..D-15 trong chat, làm các bước NAS và quyết định cho phép pilot. Backlog
  không bắt buộc cho vòng sửa pilot: xem WP5 handoff. Dọn dẹp: xoá hai file lạc
  `D:\raw-r07.txt` và `D:\canedit.txt`.
- Tiếp theo: nếu cả hai PASS, nghiệm thu lại WP5 (cập nhật định danh pilot packet thành
  5e104e1 / 07c3ca00 / image 218dd7cc…, quyết định Q1 vào docs/10, STATE, NEXT_ACTION, WP5
  handoff, commit nghiệm thu).
- Tiếp theo: FIX6-FREEZE, WP5-UX-REGATE4, B5 mới và A5 kiểm phần thay đổi (A2, A3, A4 và
  WP5-RECHECK có superseded_by A5), rồi nghiệm thu lại WP5. Quyết định Q1 được ghi vào
  docs/10 trong task tài liệu lúc nghiệm thu.
- Bước kế tiếp: nếu cả hai PASS, nghiệm thu lại WP5 (cập nhật định danh pilot packet
  thành edaaa85 / b7bbcbc0 / image 1332b6d5…, STATE, NEXT_ACTION, WP5 handoff, commit
  nghiệm thu); nếu phần B lại không đạt, hỏi chủ dự án thay vì lặp tiếp.
- Tiếp theo: WP5-UX-REGATE3, rồi B4 và A4 mới (A2, A3 và WP5-RECHECK có superseded_by
  A4). Nếu phần B lại không đạt sau vòng này, hỏi chủ dự án thay vì lặp tiếp.
- Bước kế tiếp: nếu cả hai PASS, nghiệm thu lại WP5: một task tài liệu cập nhật định
  danh pilot packet (EN+VI) thành a2ea7a4 / 0b8428fd / image 410209b0…, rồi coordinator
  cập nhật STATE, NEXT_ACTION (+vi), WP5 handoff (+vi) và board, sau đó commit nghiệm thu.
- Bước kế tiếp: FIX4-FREEZE, WP5-UX-REGATE2, kiểm tra lại độc lập WP5-UX-AUDIT-B3 (phần
  B) và WP5-UX-AUDIT-A3 (phần A, phần thay đổi); sau đó A2 và WP5-RECHECK có
  superseded_by A3.
- Bước kế tiếp: nếu cả hai PASS, nghiệm thu lại WP5 (STATE, NEXT_ACTION, WP5 handoff,
  cập nhật định danh release trong pilot packet thành 589bcff / 8c07aac5 / image mới,
  rồi commit nghiệm thu); nếu không, thêm một vòng sửa có giới hạn.
- Bước kế tiếp: khi có kết quả FIX3, WP5-UX-FIX3-FREEZE; sau đó WP5-UX-REGATE và audit
  lại độc lập A2, B2 (chuyển superseded_by của WP5-RECHECK sang WP5-UX-AUDIT-A2).

- Package và vai trò: WP3 (vòng sửa 1: chạy lại gate và kiểm tra lại); coordinator.
  Model thật claude-opus-5-5 (chủ dự án chọn; profile inherit); effort không quan sát
  được. Session 44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = fe67f9400e59ae7c10b9ac8871b4dea10b83860d (GOV-RECOVERY-ACCEPT, commit chốt; source WP5 được nghiệm thu là 014bd47, digest 150420e7). Lần chuyển board cuối sang `software_ready` và dòng này chưa được commit cho đến lần commit kế tiếp.
    WP3 được nghiệm thu tại b103923, trên mã nguồn 49651c8 với digest c31c300c…. Commit
    đóng băng GOV-SKILL là 3bdffbe.
    Commit nghiệm thu WP2 là 3ead61e; mã nguồn WP2 được nghiệm thu là
    5fafeaee72509c6110a907458643bf7582dad81a.
  - Digest chính thức của gate: eeb417d3… (WP3-REGATE PASS trên 2f2520e). Digest gate
    WP3 đầu tiên là 96870f7e… (WP3-GATE trên a1cd566); digest gate WP2 là e61fa914…
    (WP2-GATE4).
  - Chưa commit (chỉ trong handoff): board, checkpoint này, kết quả và bằng chứng của
    WP4-T01-FREEZE, và brief của WP4-T02.

    Digest chính thức của gate là 0d513fca… (WP3-REGATE2 PASS).
  - Không có commit chưa push.
- Đã xong:
  - Quản trị: bản sửa quy trình v2 đã nghiệm thu (WF-AUDIT3 PASS, `1a25275..6578df8`;
    [bàn giao](WORKFLOW_HANDOFF.vi.md)); GOV-E8 đã nghiệm thu
    ([báo cáo](GOV_E8_REVIEW.vi.md)).
  - WP1 đã nghiệm thu (kiểm tra lại PASS tại 68bbb31 / c6e24381; commit nghiệm thu
    f32978f).
  - WP2 đã implement và được nghiệm thu độc lập:
    - các task T01–T13, kèm CALFIX và việc chia T09A/T09B, mỗi task có commit đóng băng
      (396b399 … 8fae685; danh sách đủ nằm trên board và trong
      [WP2_HANDOFF](WP2_HANDOFF.vi.md));
    - chuỗi gate WP2-GATE (8fae685), GATE2 (f79413b), GATE3 (a3d1b65), GATE4 PASS trên
      5fafeae: 613 test, chạy đồng thời 20 lần, migration trên database mới và nâng cấp từ
      WP1, e2e 74 đạt / 2 bỏ qua với đủ 12 luồng;
    - chuỗi audit: WP2-AUDIT-A và -B FIX REQUIRED; các lượt sửa WP2-FIXA, WP2-FIXB (có phần
      bổ sung), WP2-FIXB2, WP2-FIXB3; WP2-AUDIT-B2 và -B3 FIX REQUIRED (đã đóng hết); kết
      quả cuối WP2-AUDIT-A2 lần 3 PASS ([recheck A4](WP2_RECHECK_A4.vi.md)) và
      WP2-AUDIT-B4 PASS, không có lỗi ([recheck B4](WP2_RECHECK_B4.vi.md)), cả hai trên
      5fafeae / e61fa914. PASS lần 1–2 của A2 mất hiệu lực vì mã nguồn đổi sau đó, vẫn giữ
      trong lịch sử.
- Chuyển tiếp, không chặn nghiệm thu (ghi trong STATE và WP2_HANDOFF):
  - R1 khóa correction theo revision; R2 ghi chú chính sách có khoảng trắng đầu được xuất
    nguyên dạng; R3 `calendar_in_use` cho biết tài khoản đã có dữ liệu (đã chấp nhận); R4
    WP3 phải lưu biến thể pending của `CorrectionResult`/`DeficitDebitResult` và bỏ phút
    tạm tính khi chốt.
  - A3-01 ẩn `refreshed_pay_period` trong mọi màn audit admin sau này; A4-01 thông báo
    khi trùng cổng smoke; ADV-A-05; F1 (chỉ là ghi chú bằng chứng); các mục tùy chọn của
    B4.
  - Phương án của chủ dự án: đổi lịch theo hướng chỉ áp dụng về sau (hiện đang từ chối
    bằng 409, là quyết định của coordinator, có thể đảo lại). Việc bỏ các con số lấy từ dữ
    liệu nhân viên trong bản xem trước ngày lễ cũng là quyết định có thể đảo lại.
  - Backlog quản trị cho một đợt GOV sau: check_recovery thừa hưởng trạng thái thật (sửa
    trước software_ready), mục 2 của AGENTS.vi, giới hạn của precommit, ghi chú
    -whitespace cho bằng chứng trong docs/08.
- Bài học vận hành (`runtime_observations` trên board): gọi Node 24 bằng đường dẫn đầy đủ;
  preflight dùng Python của workflow; không ghi vào gốc repo, không chuyển hướng ra
  `nul`; brief cho committer theo quy tắc không in nội dung (từ đó không bị bộ phân loại
  chặn nữa); commit tay của chủ dự án phải dùng `git add -A` và Commit description trong
  chat phải đúng là message dự định.
- WP2-ACCREC (light) đã xong: record nghiệm thu trong WP2_HANDOFF (EN/VI), sửa dòng FR-13
  về bản xem trước và cập nhật số liệu; preflight 0 (tác giả tự báo).
- WP2-ACCEPT đã xong: commit 3ead61e đã push (137 đường dẫn, chỉ trong handoff, mọi kiểm
  tra 0). WP2 đã nghiệm thu; package đang hoạt động trên board là WP3.
- WP3-PLAN (planner opus) đã xong ([plan](tasks/WP3-PLAN.md)): 16 task T00–T15 trong ba
  checkpoint, mỗi task có commit đóng băng; WP3-GATE; hai audit theo mảng bằng opus mới;
  commit nghiệm thu. Coordinator đã áp dụng plan và các lựa chọn mặc định thông thường
  (`coordinator_decisions` trên board).
- Câu hỏi đang chờ chủ dự án (`pending_owner_question` trên board): F-1 tự nộp khi đến hạn
  cho kỳ không có dữ liệu đã lưu; F-2 vòng đời của khoản trừ thiếu giờ đang chờ; F-3 màn
  trạng thái vận hành của admin so với ranh giới quyền riêng tư; F-4 phạm vi của
  `automation_active_from`; F-5 tổng trên PDF (chỉ làm rõ, cứ làm theo đề xuất trừ khi chủ
  dự án phản đối). Cần trước T05 (F-2), T10 (F-1, F-4) và T13 (F-3); T00–T04 vẫn tiếp tục.
- WP3-T00 đã xong (tác giả tự báo): chống chèn công thức CSV (R2; đỏ 4, xanh 26/26, bản
  đối chứng bị phát hiện) và sửa cổng smoke (A4-01; tự chọn cổng trống khi không đặt
  `SMOKE_PORT`; mọi lần thoát lỗi đều in dòng FAIL); verify 619 test, không có cảnh báo API
  lỗi thời; digest 81567e53….
- WP3-T00-FREEZE đã commit và push, SHA db75346 (attempt 2, 23 đường dẫn, mọi kiểm tra
  0). Attempt 1 dừng ở validator vì record WP2-ACCEPT trên board do coordinator ghi thiếu
  `branch`/`pushed`; lần đó chưa có commit.
- WP3-T01 đã xong (tác giả tự báo): migration 0004 với 10 bảng và
  `timesheets.imported_unverified`; database thật tạo từ 5fafeae nâng cấp sạch; mặc định
  gửi kiểu capture, SMTP chỉ chạy khi có cờ riêng của chủ dự án; 69 test xanh, 6/6 bản đối
  chứng bị phát hiện; verify 674 test; digest 995e68c9…. Schema theo đề xuất F-2/F-4; nếu
  chủ dự án chọn khác thì cần migration 0005.
- Attempt 1 của WP3-T01-FREEZE dừng: precommit chặn hai đường dẫn thư mục người dùng giả
  lập trong tests/integration/config.test.ts. Chưa có commit.
- WP3-T01 attempt 2 đã xong (tác giả tự báo): thay hai chuỗi bằng một thư mục gốc giả lập
  trung tính; verify 674 test; digest 3c6a10c1….
- WP3-T01-FREEZE đã commit và push, SHA ac5d0ba (attempt 2, 29 đường dẫn, mọi kiểm tra
  0).
- WP3-T02 đã xong (tác giả tự báo): kho file riêng tư, kiểm tra ảnh, upload chữ ký (ảnh
  PNG/JPEG thô, giới hạn 256 KiB riêng cho route này) và tải về chỉ cho chủ sở hữu; quy tắc
  chỉ nhận JSON vẫn giữ cho các route khác; 14/14 bản đối chứng bị phát hiện; verify 711
  test; digest 629e7d9d…. Chuyển cho T08: `index.ts` phải truyền `dataDir` từ cấu hình gửi.
- WP3-T02-FREEZE đã commit và push, SHA b060d33 (28 đường dẫn, mọi kiểm tra 0).
- WP3-T03 đã xong (tác giả tự báo): bộ dựng mẫu email, kiểm tra người nhận, cài đặt nộp
  chỉ thêm phiên bản mới với thời điểm bật tự nộp riêng từng người, quyền dùng ảnh chữ ký
  tự động có ghi audit, xem trước không ghi gì; 18/18 bản đối chứng bị phát hiện; verify
  821 test; digest 22acf6c4…. Worker đã báo một sự cố của script đối chứng (một file bị
  xóa trắng, đã viết lại và chạy lại toàn bộ).
- WP3-T03-FREEZE đã commit và push, SHA 79862bb (32 đường dẫn, mọi kiểm tra 0).
- WP3-T04 đã xong (tác giả tự báo): JSON chuẩn hóa và SHA-256, snapshot màn duyệt lấy số
  từ engine hiện có, route GET màn duyệt không ghi gì; 16/16 bản đối chứng bị phát hiện;
  verify 878 test; digest 69e790e0….
- Môi trường: ổ tạm B: chỉ còn khoảng 448 KB trống; khoảng 7,8 GB trong B:\Temp\claude
  thuộc về các phiên Claude. Agent không được đụng vào thư mục đó; dọn hay không là do chủ
  dự án quyết.
- WP3-TMPCLEAN đã xong: xóa 28 thư mục tạm không dùng của dự án (khoảng 14,9 MB); B: còn
  khoảng 22 MB trống, vẫn gần đầy. Các thư mục lớn khác trong B:\Temp (của IDE và công cụ
  chẩn đoán) do chủ dự án quyết.
- WP3-T04-FREEZE đã commit và push, SHA b89f8a8 (32 đường dẫn, mọi kiểm tra 0).
- Quyết định của coordinator: chạy WP3-T07 (dựng PDF) ngay bây giờ, trước T05/T06, vì T07
  chỉ phụ thuộc T04 còn T05 đang chờ câu trả lời F-2 của chủ dự án.
- WP3-T07 đã xong (tác giả tự báo): bộ dựng PDF bằng pdf-lib, kết quả ổn định từng byte
  (14 ngày, giờ:phút, tổng OT tính cả hai Chủ nhật, bật/tắt hiện OT, font Unicode, chữ ký
  nằm gọn trong khung, dải "chưa duyệt"); thư viện pdf-lib, fontkit, font DejaVu, pdfjs-dist
  chỉ cho test (không cái nào bị deprecated; file lock thêm 20 gói); 14/14 bản đối chứng
  bị phát hiện; verify 906 test; digest 971e7843….
- Attempt 1 của WP3-T07-FREEZE dừng trước khi stage: digest là 3f4a016d…, không khớp
  971e7843… do worker báo. Chưa có commit.
- WP3-T07-RECON đã xong: worker sửa một file test sau khi tính digest; digest của cây file
  hiện tại là 3f4a016d…, ổn định; các file thay đổi đúng bằng bộ file của T07; verify đạt
  (906 test) và precommit sạch.
- WP3-T07-FREEZE đã commit và push, SHA c289375 (attempt 2; file lock thêm 20 gói, không
  gỡ gói nào; mọi kiểm tra 0).
- Chủ dự án đã trả lời F-1..F-5 ngày 2026-10-04 (nguyên văn trong `owner_decisions` trên
  board): F-2, F-4 và F-5 theo đề xuất; F-1 có điều chỉnh (kỳ trống vẫn tự nộp theo nhãn
  mặc định, không tính OT, dòng "nhân viên chưa duyệt" mặc định tắt và có tùy chọn bật trong
  settings, không tính thiếu giờ); F-3 có điều chỉnh (admin xem được mọi thứ trừ chi tiết
  timesheet của từng người; mỗi người có thể chia sẻ quyền chỉ xem hoặc được sửa timesheet
  của mình). F-1 và F-3 làm thay đổi quy tắc trong tài liệu gốc; F-3 thêm tính năng chia
  sẻ.
- WP3-REQ (planner opus) đã xong ([báo cáo](tasks/WP3-REQ.md)): bản soạn EN/VI cho tài
  liệu gốc, bảng định nghĩa "chi tiết timesheet", đặc tả tính năng chia sẻ (FR-17/AC-16,
  bảng cấp quyền ở migration 0006, đường dẫn `/api/shared/:ownerId` chỉ mở các route được
  phép, bảng quyền), ảnh hưởng (task bù T07B cho tùy chọn hiện dòng "chưa duyệt"; T06 phải
  ghi khoản OT đầu tiên cho ngày chưa có bút toán gốc) và plan sửa đổi (WP3-DOC, T07B,
  T13D, T13A, T13B, T13C nằm trong WP3; thêm mục 13–16 vào gate). Coordinator đã áp dụng,
  tùy theo câu trả lời của chủ dự án.
- Câu hỏi đang chờ chủ dự án (`pending_owner_question` trên board): F-Q1..F-Q6, cần trước
  WP3-DOC (sau khi T06 đóng băng).
- WP3-T05 đã xong (tác giả tự báo): giao dịch ký trong một transaction IMMEDIATE (lệch
  hash/phiên bản trả 409, thiếu dữ liệu trả 422, tạo bản nộp đã ký với thời điểm ký thật,
  ghi sổ OT chỉ qua ledger.ts, lưu mọi kết quả kể cả dòng "chờ" theo F-2, đặt
  finalized_revision_no, tạo dòng job, ghi audit; gửi lại y hệt thì trả kết quả cũ); race
  20/20; 13/13 bản đối chứng bị phát hiện; verify 930 test; digest c380f302….
- WP3-T05-FREEZE đã commit và push, SHA 72f1920 (28 đường dẫn, mọi kiểm tra 0).
- WP3-T06 đã xong (tác giả tự báo): bản sửa (chỉ ghi chênh lệch, khóa riêng theo bản sửa,
  ghi OT lần đầu cho ngày chưa có bút toán gốc, phần tăng đang chờ ghi theo F-2), R1, duyệt
  muộn không làm đổi sổ OT và có lựa chọn gửi rõ ràng, gửi lại không đụng sổ OT; 19/19
  bản đối chứng bị phát hiện; verify 959 test; digest b47d30da….
- **Vướng mắc:** attempt 1 của WP3-T06-FREEZE dừng trước khi chạy lệnh git nào. Ổ tạm B:
  (nơi Claude Code ghi kết quả tạm của agent, B:\Temp\claude) đã đầy (0 MB), nên mọi lệnh
  shell của subagent đều lỗi ENOSPC. Chưa stage, chưa commit; thay đổi mã nguồn của T06
  vẫn nằm trong working tree. Agent không được đụng vào B:\Temp\claude và coordinator
  không có shell: chủ dự án cần giải phóng dung lượng ổ B: hoặc chuyển thư mục tạm của
  Claude Code sang ổ khác.
- Chủ dự án đã trả lời F-Q1..F-Q5 (nguyên văn trong `owner_decisions` trên board): F-Q1
  (a); F-Q2 khác đề xuất (bản gửi đi không có dấu hiệu tự động, có khối chữ ký đầy đủ,
  hệ thống tự theo dõi, kèm tùy chọn dòng ghi chú sửa được và tùy chọn chèn ảnh chữ ký);
  F-Q3 (b) admin xem được địa chỉ người nhận; F-Q4 (b) kèm bật/tắt từng mục; F-Q5 (a).
  F-Q6 cần hỏi lại cho rõ (WP2-A-01 giữ nguyên trong lúc chờ). Chủ dự án cho phép dùng
  thư mục tạm trên ổ D: (D:\timesheet-tmp, ngoài Dropbox). Cách hiểu của coordinator ghi
  trong `coordinator_decisions` trên board.
- WP3-T06-FREEZE đã commit và push, SHA 2f8011a (attempt 2, 23 đường dẫn, mọi kiểm tra 0;
  ổ B: đã có chỗ trở lại). Lệnh xóa đệ quy thư mục tạm rỗng trên D: bị chặn, không thử
  lại; thư mục vẫn còn.
- WP3-REQ2 đã xong ([phần bổ sung](tasks/WP3-REQ2.md)): bỏ dòng "chưa duyệt", thay bằng
  dòng ghi chú tùy chọn (mặc định tắt, sửa được, câu mặc định "Automatic submission") và
  quyền dùng ảnh chữ ký tự động đã có; nhãn nguồn gốc trên PDF cũng phải bỏ; PDF ký tay
  phải in đúng tên người ký đã lưu (lỗi của T07, sửa trong T07B); phạm vi T07B sửa đổi
  (gồm cả phần chuyển dữ liệu trong pdfJob); chia sẻ có ba mục cho mỗi quyền; danh sách
  sửa gồm 10 tài liệu gốc cả hai ngôn ngữ, 4 prompt và file policy mẫu.
- Câu hỏi đang chờ chủ dự án: G-Q1 (ảnh chữ ký mặc định trên bản nộp tự động) và G-Q2
  (câu chữ của {SignOffStatus}); F-Q6 không bắt buộc.
- WP3-T08 đã xong (tác giả tự báo): nhận việc nguyên tử có lease, thử lại sau 1/5/15/60
  phút rồi chuyển sang chờ can thiệp, bộ chạy job và CLI, job tạo PDF từ snapshot đã lưu
  có kiểm hash chữ ký, test phục hồi khi tiến trình bị kill, nối DATA_DIR; 13/13 bản đối
  chứng bị phát hiện; verify 980 test; digest 706c1619…. T09 phải sở hữu
  `src/server/jobs/runner.ts` để đăng ký job gửi mail.
- WP3-T08-FREEZE đã commit và push, SHA 3d7a17c (25 đường dẫn, mọi kiểm tra 0).
- Quyết định của coordinator: WP3-T09 chạy ngay (email được dựng từ snapshot đã chốt nên
  G-Q1/G-Q2 không ảnh hưởng); WP3-DOC và T07B chạy sau khi chủ dự án trả lời và trước T10.
- WP3-T09 đã xong (tác giả tự báo): email dựng ổn định từ snapshot đã chốt và PDF đã lưu;
  mặc định ghi ra file (capture); SMTP chỉ chạy khi có cờ của chủ dự án (test với máy
  nhận mail giả trên máy); phân loại kết quả gửi, kết quả chưa rõ không bao giờ tự gửi
  lại; phục hồi khi tiến trình bị kill; route quyết định; không lộ thông tin đăng nhập ở
  đâu cả; 4/4 bản đối chứng; verify 1005 test; digest 5e7e6b40…. Bốn chỗ sửa ngoài phạm vi
  đã báo (index.ts/cli.ts mỗi file một dòng, một dòng route trong ot-api, chỉnh assertion
  của jobs-restart vì job gửi giờ đã được đăng ký). Ghi chú cho audit: job gửi được nhận
  trước khi có PDF sẽ tốn một lượt thử; lỗi xác minh chứng chỉ TLS bị xếp là tạm thời.
- WP3-T09-FREEZE đã commit và push, SHA 0a26afa (32 đường dẫn, file lock thêm 6 gói, mọi
  kiểm tra 0).
- Quyết định của coordinator: WP3-T10 chạy ngay (F-1/F-4 đã có quyết định; G-Q1/G-Q2 chỉ
  ảnh hưởng phần hiển thị ở T07B). T11/T12 cũng có thể chạy trước WP3-DOC; T13 chờ WP3-DOC
  và T07B.
- WP3-T10 đã xong (tác giả tự báo): điều kiện tự nộp được kiểm lại trong transaction; tự
  chốt sổ (kỳ trống theo nhãn mặc định, OT bằng 0, không tính thiếu giờ); tắt tự nộp thì
  chỉ ghi quá hạn; xử lý bù theo thứ tự thời gian, từng nhóm có giới hạn; race luôn ra một
  bản nộp/một bộ bút toán/một lần gửi; route kích hoạt của admin có audit và từ chối mốc
  trong quá khứ; 12/12 bản đối chứng; verify 1038 test; digest 5f16dab1…. Phát hiện cho
  T07B: snapshot ghi cứng "Signed by employee" cho mọi bản nộp (G-Q2).
- WP3-T10-FREEZE đã commit và push, SHA 0321be6 (26 đường dẫn, mọi kiểm tra 0).
- WP3-T11 đã xong (tác giả tự báo): nhắc hạn (24 giờ/2 giờ hoặc mốc đã lưu), cảnh báo
  quá hạn, thông báo kết quả chỉ gửi cho nhân viên; không gửi trùng, gộp lần nhắc bị lỡ;
  mốc nhắc đúng khi đổi giờ mùa; link bắt đăng nhập; 16/16 bản đối chứng; verify 1095
  test; digest e7f00cd0…. Việc chuyển tiếp: file attachment.pdf rỗng trong capture của
  email nhắc (sửa sau); có thể gửi trùng một lần nhắc khi tiến trình bị kill với SMTP
  thật (giới hạn đã ghi nhận).
- WP3-T11-FREEZE đã commit và push, SHA c3d32b9 (21 đường dẫn, mọi kiểm tra 0).
- WP3-T12 đã xong (tác giả tự báo): màn duyệt, xử lý màn duyệt đã cũ, link dẫn thẳng,
  huy hiệu trạng thái ở đầu trang; quét CSS 0 giá trị viết cứng; 8/8 bản đối chứng; e2e 93
  đạt/3 bỏ qua; verify 1135 test; digest 160bb78c…. Chuyển cho T13: hiện trạng thái trên
  lưới (component cha nằm ngoài phạm vi T12).
- WP3-T12-FREEZE đã commit và push, SHA 8e2c2bf (49 đường dẫn, đã xem 6 ảnh chụp, mọi
  kiểm tra 0).
- WP3-T13D đã xong (tác giả tự báo): màn trạng thái vận hành và nộp/gửi cho admin theo
  danh sách trường được phép, có địa chỉ người nhận (F-3, F-Q3 (b)), giao diện admin,
  test quét đường dẫn khóa chống lộ dữ liệu, danh mục route trong test tách biệt; e2e 97
  đạt; 8/8 bản đối chứng; verify 1150 test; digest 321cc6a0…. Việc chuyển tiếp (giao cho
  T13A): truyền cấu hình gửi qua AppDeps thay vì đọc process.env.
- WP3-T13D-FREEZE đã commit và push, SHA 19723b6 (34 đường dẫn, đã xem 4 ảnh chụp, mọi
  kiểm tra 0).
- WP3-T13A đã xong (tác giả tự báo): tách người thao tác/chủ timesheet, router dạng
  factory, audit ghi riêng người thao tác và chủ, cấu hình gửi qua AppDeps; danh mục 63
  route giống hệt trước/sau; test 1150 → 1164; 6/6 bản đối chứng; verify 0; digest
  0edefc94…. Lượt e2e duy nhất có 2 test mobile hỏng do `net::ERR_NO_BUFFER_SPACE` (lỗi
  môi trường; chạy lại riêng thì đạt).
- WP3-T13A-FREEZE đã commit và push, SHA c1e4bb2 (34 đường dẫn, mọi kiểm tra 0).
- WP3-E2E-RECHECK đã xong: chạy toàn bộ e2e trên c1e4bb2 trả về 0 (97 đạt, 3 bỏ qua, 0
  lỗi); lỗi ở T13A là do môi trường.
- WP3-REC1 đã commit và push, SHA 632092d (8 đường dẫn, chỉ trong handoff, mọi kiểm tra 0).
- Chủ dự án đã trả lời G-Q1 (b) và G-Q2 (a) (`owner_decisions` trên board): lúc upload
  chữ ký, ứng dụng hỏi quyền dùng ảnh cho bản nộp tự động với lựa chọn chọn sẵn (vẫn là
  một bước đồng ý rõ ràng, có ghi audit); `{SignOffStatus}` là "Submitted" cho cả hai loại
  bản nộp, hoặc câu ghi chú khi bật dòng ghi chú. Brief WP3-DOC và T07B đã ghi câu trả lời.
- WP3-DOC đã xong (tác giả tự báo): 30 chỗ sửa mỗi ngôn ngữ ở tài liệu 01–07, 09, 10;
  dòng gate trong prompt WP3; file policy mẫu; bảng đối chiếu EN/VI; preflight 0; verify
  1164 test; digest 4d4c4863….
- Tách phần quản trị (quyết định của coordinator): `handoff/prompts/` là đường dẫn quản
  trị, nên WP3-DOC-FREEZE chỉ commit tài liệu gốc và file policy; bốn file prompt WP3 đi
  qua GOV-WP3P-FREEZE, GOV-WP3P-GATE và một GOV-WP3P-AUDIT độc lập trước T07B.
- WP3-DOC-FREEZE đã commit và push, SHA cb9800e (32 đường dẫn; bốn file prompt vẫn chưa
  stage; mọi kiểm tra 0).
- GOV-WP3P-FREEZE đã commit và push, SHA da6d0cd (13 đường dẫn, gồm bốn file prompt WP3;
  mọi kiểm tra 0).
- GOV-WP3P-GATE PASS trên da6d0cd (thay đổi chỉ ở bốn file prompt; khớp nghĩa với tài
  liệu 09 ở cả EN và VI; validators, verify đạt, digest không đổi).
- GOV-WP3P-AUDIT PASS (opus mới, không có phát hiện; [báo cáo](GOV_WP3P_REVIEW.vi.md));
  phạm vi được nghiệm thu cb9800e..da6d0cd. Ba gợi ý tùy chọn R1–R3 đưa vào backlog quản
  trị.
- WP3-T07B đã xong (tác giả tự báo): migration 0005 cho dòng ghi chú, cài đặt ghi chú có
  kiểm tra và audit, đồng ý dùng ảnh ngay lúc upload (`authorize_auto_image`, một
  transaction; trả 422 khi chưa lưu cài đặt — chuyển cho T13), snapshot phiên bản 2,
  trạng thái "Submitted"/câu ghi chú, bỏ dấu hiệu tự động, PDF ký tay in đúng tên người
  ký đã lưu; 19/19 bản đối chứng; verify 1232 test; digest 5e37ab98….
- WP3-T07B-FREEZE đã commit và push, SHA 943027b (56 đường dẫn, gồm các record GOV-WP3P;
  mọi kiểm tra 0).
- WP3-T13 đã xong (tác giả tự báo): tải PDF chỉ cho chủ, màn lịch sử và gửi, settings có
  dòng ghi chú và quyền dùng ảnh chữ ký, upload chữ ký có ô đồng ý chọn sẵn (xử lý trường
  hợp 422), trạng thái trên lưới; 16/16 bản đối chứng; e2e 111 đạt; verify 1292 test;
  digest 7b04f0b1…. Việc chuyển tiếp: route liệt kê bản nộp (đã thêm vào brief T13B);
  người gửi capture trong harness e2e và e2e tự nộp (T14); `GET /api/signatures/current`
  trả 404 khi chưa có chữ ký (sửa sau).
- WP3-T13-FREEZE đã commit và push, SHA 5b90d30 (57 đường dẫn, đã xem 6 ảnh chụp, mọi
  kiểm tra 0).
- WP3-T13B đã xong (tác giả tự báo): migration 0006 lưu quyền chia sẻ theo từng mục,
  `/api/shares` (có audit; 422 khi không tìm thấy người nhận, có giới hạn tần suất), admin
  xem và thu hồi quyền, đường dẫn `/api/shared/:ownerId` chỉ mở 17 route được phép (kiểm
  quyền ở mỗi request và kiểm lại trong transaction ghi), `GET /api/revisions`, lịch sử ghi
  tên người được chia sẻ; ma trận 11 × 17 cộng 31 đường dẫn không bao giờ chia sẻ; 10/10
  bản đối chứng; e2e 111 đạt; verify 1356 test; digest f3df3b86….
- WP3-T13B-FREEZE đã commit và push, SHA c3c35de (attempt 2; attempt 1 bị chặn vì có địa
  chỉ email trong file log bằng chứng, đã che 7 địa chỉ thành `<email>`; mọi kiểm tra 0).
- WP3-T13C đã xong (tác giả tự báo): settings chia sẻ bật/tắt từng mục kèm ghi chú về PDF,
  nút chuyển sang timesheet được chia sẻ và thanh báo chủ sở hữu, màn chia sẻ không hiện
  thao tác không được phép, lịch sử lấy từ danh sách bản nộp và ghi tên người được chia sẻ,
  signatures/current trả 200 null; e2e 119 đạt; 11/11 bản đối chứng; verify 1383 test;
  digest 9b8d6b26…. Việc chuyển tiếp: lịch sử còn hiện tên thao tác thô với thao tác lạ.
- WP3-T13C-FREEZE đã commit và push, SHA 8ad2e4f (attempt 2; attempt 1 dừng vì
  TimesheetScreen.tsx thiếu trong danh sách của worker, được thêm vào khi digest khớp; 72
  đường dẫn; mọi kiểm tra 0).
- WP3-T14 đã xong (tác giả tự báo): người gửi capture và chữ ký giả lập trong seed và
  fixture e2e, sửa capture cho thư không có tệp đính kèm, thêm kiểm tra smoke, e2e 127 đạt
  (submission, automation, pdf-visual), đã xem 5 ảnh trang PDF, bảng đối chiếu gate;
  verify 1384 test; digest 677b9142….
- WP3-T14-FREEZE đã commit và push thành b083739 (lần 2; lần 1 dừng ở preflight do brief
  WP3-GATE có liên kết hỏng, điều phối viên đã sửa; 42 đường dẫn; mọi kiểm tra trả về 0;
  đã xem 8 ảnh, tất cả là dữ liệu giả lập).
- WP3-T15 đã xong (tác giả tự báo): WP3_HANDOFF (EN/VI), README và DEVELOPMENT (EN/VI)
  về job, capture, cờ gửi thật, thời điểm kích hoạt, chia sẻ và MAIL_FROM; mô tả trong
  package.json; bản dịch khớp; preflight 0; verify 0 với 1384 test; digest 96870f7e….
  Điểm cần gate kiểm tra: bản ghi T14 ghi 46 kiểm tra smoke, nhưng log chỉ có 40.
- WP3-T15-FREEZE đã commit và push thành a1cd566, là commit đóng băng cuối package WP3
  (lần 1). Commit gồm 25 đường dẫn theo kế hoạch, cộng thêm 2 tệp bằng chứng của chính
  committer; đây là sai lệch vô hại, nằm ngoài digest. Mọi kiểm tra trả về 0; tài liệu
  không chứa secret hay địa chỉ thật.
- WP3-GATE PASS trên a1cd566 (đạt cả 16 mục; do verifier tự báo):
  - verify 0 với 1384 test; smoke có 40 dòng PASS (con số 46 trong bản ghi T14 là sai);
  - e2e 127 đạt, 5 bỏ qua, 0 lỗi;
  - các phép thử đua dữ liệu đạt 20/20 mỗi loại; giả lập sự cố đạt;
  - migration đạt trên cả CSDL mới và CSDL nâng cấp từ 5fafeae; các validator trả về 0;
  - phạm vi thay đổi sạch.

  Điều phối viên đã dừng agent sau khi nhận kết quả vì còn tác vụ nền sót lại.
- WP3-AUDIT-B: FIX REQUIRED (auditor opus mới):
  - WP3-B-01 (Medium): tài khoản tạo sau thời điểm kích hoạt mà chưa lưu cài đặt sẽ bị tự
    chốt mọi kỳ đã quá hạn; cần giới hạn theo `users.created_at`.
  - WP3-B-02 (Low): nếu sập trong lần gửi cuối cùng, lượt gửi đó kẹt ở `sending` và chủ
    không được hỏi quyết định; cần phục hồi các lượt gửi bị ngắt ở mỗi vòng runner.
  - WP3-B-03 (Low): History ghi việc tự chốt của hệ thống là "người khác" và hiện mã thao
    tác thô.
  - Các mục mang theo khác chấp nhận để lại backlog.
- WP3-AUDIT-A: NOT VERIFIED, chỉ vì lý do thủ tục, không có finding nào. Mọi kiểm tra
  chức năng đều đạt (đua dữ liệu, sự cố, HTTP, PDF, migration, quyền riêng tư). Auditor
  lỡ mở một cmd.exe tương tác rồi định dừng nó; sau đó classifier từ chối lệnh digest của
  nó. Điều phối viên không nhờ agent khác chạy lại lệnh đã bị từ chối. Thay vào đó, một
  auditor mới sẽ kiểm tra lại mảng A và tự gắn digest trên commit đóng băng của vòng sửa.
- WP3-AUDIT-C: FIX REQUIRED (auditor opus mới). Phân quyền chia sẻ đứng vững trước mọi
  probe: 88 mục trong danh mục route, 17 route chia sẻ, 11 tổ hợp quyền; đã chứng minh
  khe đua dữ liệu là có thật; các thao tác không được phép bị ẩn hẳn trên giao diện.
  - WP3-C-01 (Medium): thiếu dòng gợi ý "đã sửa bởi <người được chia sẻ>" trên màn
    Review của chủ, dù kế hoạch đã có.
  - WP3-C-02 (Low): History gán nhầm cho người được chia sẻ các thao tác qua route admin
    hoặc xảy ra trong cùng giây.
  - WP3-C-03 (Info): một chú thích đã lỗi thời.
  - Preflight đầy đủ bị lỗi vì có liên kết tới thư mục trong WP3_REVIEW_A/B.
- Vòng sửa 1 (quyết định điều phối 2026-10-05), chạy tuần tự:
  1. WP3-LINKFIX (light): xong ở lần 2, preflight trả về 0. Lần 1 lỗi do chính các
     liên kết ví dụ trong brief của điều phối viên.
  2. WP3-FIXB (B-01..03): đã xong (tác giả tự báo). Các bản sửa:
     - B-01: chỉ tự động hóa từ thời điểm tạo tài khoản;
     - B-02: phục hồi các lượt gửi bị ngắt ở mỗi vòng runner;
     - B-03: tên thao tác dễ đọc và nhãn hệ thống.

     Kết quả: 8 test đỏ chuyển xanh; verify 1391 test; e2e 127 đạt; digest d9fa55bd….
     Sai lệch: sửa thêm HistoryScreen.tsx, và đổi một assertion cũ trong
     delivery-crash.test.ts (đợt kiểm tra lại sẽ đánh giá).
  3. WP3-FIXC (C-01..03): đã xong (tác giả tự báo).
     - C-01: dòng gợi ý chỉ chủ thấy, lấy từ audit, nằm ngoài hash và PDF.
     - C-02: chỉ gán thao tác cho người được chia sẻ khi người thực hiện không phải chủ
       và đó là thao tác của route chia sẻ; không thêm migration.
     - C-03: đã sửa chú thích.
     - Kiểm tra: verify 1407 test; e2e 127 đạt; digest eeb417d3….
     - Sai lệch để đợt kiểm tra lại đánh giá: quy tắc dựa trên thao tác; việc người được
       chia sẻ tự rời quyền không còn ghi tên; một test được thay thế.
     - WP3-FIX-FREEZE đã commit và push thành 2f2520e (lần 3; 177 đường dẫn; mọi kiểm
       tra trả về 0; đã xem 6 ảnh, đều là dữ liệu giả lập). Lần 1 và lần 2 bị validator
       chặn do bản ghi của điều phối viên vi phạm quy tắc: ghi văn xuôi vào trường
       decision của các audit, và cho WP3-LINKFIX phụ thuộc vào các audit chưa PASS.
     - WP3-REGATE: PASS trên 2f2520e, đạt các mục 1–18 (verifier tự báo):
       - 1407 test; smoke 40; e2e 127 đạt;
       - các phép thử đua dữ liệu đạt 20/20 mỗi loại; giả lập sự cố đạt; migration lên v6;
       - test hồi quy được nêu tên theo từng finding;
       - phạm vi vòng sửa đúng bằng các đường dẫn của FIXB/FIXC.
     - WP3-RECHECK-BC: FIX REQUIRED (auditor opus mới).
       - B-01, B-02, C-01, C-02 và C-03 đã được sửa (test hồi quy fail trên a1cd566);
         B-03 mới sửa một phần.
       - Hai finding mới, đều Low: WP3-RBC-01 (khoản OT tự động không có người thực hiện
         vẫn hiện "bởi người khác") và WP3-RBC-02 (khi chủ chưa từng chốt kỳ, dòng gợi ý
         bỏ sót các thay đổi của người được chia sẻ trước ngày bắt đầu kỳ).
       - Các sai lệch của FIXB/FIXC được chấp nhận. Trước WP4 cần có dấu ghi nhận thao
         tác qua chia sẻ.
       - Rủi ro: tài khoản chưa từng setup vẫn bị tự chốt và gửi lỗi recipient_missing;
         docs/05 chưa mô tả giới hạn theo ngày tạo tài khoản.
     - Đang chờ chủ dự án trả lời câu hỏi H-Q1: có tự nộp cho tài khoản chưa setup hay
       không.
     - WP3-RECHECK-A: PASS trên 2f2520e, không có finding (auditor opus mới). Digest đã
       được ghi ở lệnh đầu và lệnh cuối.
       - Các probe mảng A: đua dữ liệu và sự cố mỗi loại chạy hai lần, HTTP 70, dòng gợi
         ý 7, PDF 34, migration 26.
       - Vòng sửa không ảnh hưởng mảng A.
       - R1–R7 vẫn chỉ là rủi ro.
       - Vì validator yêu cầu mọi PASS của WP3 phải khớp digest hiện tại, sau vòng sửa 2
         sẽ có một lần kiểm tra lại phần thay đổi ở mảng A, gắn digest (lần 2).
     - Ngày 2026-10-05, chủ dự án chọn (a) cho H-Q1. Chỉ tự nộp sau khi tài khoản đã
       lưu cài đặt nộp và bật tự nộp. Mặc định, các kỳ đến hạn trước khi setup không tự
       nộp; lựa chọn "áp dụng cho kỳ quá hạn" mà người dùng tự bật vẫn giữ nguyên.
     - WP3-FIX2 bị chặn; lần 1 chỉ xong một phần. Phần việc chính được báo là đã xong:
       - RBC-01, RBC-02, test nhánh `sending` và H-Q1 (a);
       - docs/05 và docs/10 bản EN/VI; HANDOFF;
       - preflight 0; e2e 127 đạt; verify 1416 test; digest 0d513fca….

       Kiểm tra quyền đã từ chối vòng lặp Bash dùng để che dữ liệu trong bằng chứng và
       xóa 6 tệp `.raw`. Sáu tệp log đó vẫn chưa được che, nằm trong evidence/WP3-FIX2/,
       và không được commit.
     - Chủ dự án chọn (a) cho H-Q2: che dữ liệu trong 6 tệp log, rồi xóa đúng 6 tệp
       `.raw` đó, mỗi lệnh một đường dẫn cụ thể. Chủ dự án cũng chuyển thư mục tạm sang
       `D:\.claude-tmp\timesheet\<task>`.
     - WP3-TMPMOVE đã xong: `D:\timesheet-tmp` đã được chuyển sang
       `D:\.claude-tmp\timesheet` bằng một lệnh đổi tên theo đường dẫn cụ thể. Đủ 46 thư
       mục, không xóa gì.
     - WP3-FIX2 đã xong ở lần 2. Worker đã che dữ liệu trong 6 tệp log và xóa đúng 6
       tệp `.raw` đã nêu tên, mỗi lệnh một đường dẫn cụ thể. Precommit trên bằng chứng
       không có finding nào. Verify đạt 1416 test; digest vẫn là 0d513fca….
     - WP3-FIX2-FREEZE đã commit và push thành 2d72d35 (158 đường dẫn; mọi kiểm tra trả
       về 0; 6 ảnh giả lập; không có tệp `.raw`). Riêng brief của bước freeze chưa được
       stage; nó sẽ vào commit handoff kế tiếp.
     - WP3-REGATE2: PASS trên 2d72d35, đạt 19 mục (verifier tự báo):
       - 1416 test; smoke 40; e2e 127 đạt;
       - đua dữ liệu 20/20 mỗi loại; giả lập sự cố đạt; migration lên v6;
       - đã nêu tên các test của vòng 2 và H-Q1;
       - phạm vi thay đổi chỉ gồm các đường dẫn của FIX2 và docs 05/10;
       - tài liệu khớp EN/VI, D-09 giữ nguyên;
       - các validator trả về 0 trong thư mục dự án;
       - digest chính thức của gate: 0d513fca….
     - WP3-RECHECK-A lần 2: PASS trên 2d72d35, không có finding (auditor opus mới; digest
       0d513fca… được ghi ở đầu và cuối).
       - Phần thay đổi gồm 18 đường dẫn; lõi mảng A và tầng cơ sở dữ liệu không đổi.
       - Chạy lại: đua dữ liệu hai lần, thêm phép thử đua giữa lần lưu cài đặt đầu tiên
         và hạn nộp; sự cố; HTTP 84; dòng gợi ý 12; PDF 34; migration 30.
       - So sánh H-Q1: dữ liệu của tài khoản đã setup giống hệt từng byte.
       - R3 đã đóng. Rủi ro Info mới: R8 (tài khoản chưa setup vẫn nhận nhắc trước hạn)
         và R9 (sự kiện trong seed hiện là tự động).
     - WP3-RECHECK-BC2: FIX REQUIRED (auditor opus mới).
       - RBC-01, RBC-02, test nhánh `sending` và H-Q1 (a) đều đúng; tài liệu khớp EN/VI;
         mảng B và C không có hồi quy.
       - WP3-RBC2-01 (Low, chỉ ở test): hai test hạn nộp nay dùng tài khoản chưa setup,
         nên cơ chế chặn quét theo F-4 và cơ chế loại trừ kỳ đã nhập không còn test nào
         kiểm tra. Cụ thể, các đột biến M4, M5, M5b vẫn qua toàn bộ test. Hành vi thật
         của ứng dụng vẫn đúng.
     - Vòng sửa 3 (quyết định điều phối 2026-10-05):
       1. WP3-FIX3, chỉ sửa test: khôi phục test cho hai cơ chế chặn đó, chứng minh bằng
          đột biến trong clone tạm, và thêm test cho các nhánh bỏ qua khác chưa được
          kiểm tra.
       2. WP3-FIX3-FREEZE.
       3. WP3-REGATE3.
       4. Một auditor mới làm cả WP3-RECHECK-BC3 và WP3-RECHECK-A lần 3 (gắn lại mảng A
          với digest mới).
       5. WP3-ACCREC và WP3-ACCEPT.
     - WP3-FIX3 đã xong (tác giả tự báo), chỉ sửa test.
       - Các test cơ chế chặn lại dùng tài khoản đã setup; công tắc tắt được lưu trước
         hạn.
       - Thêm 3 test quét các nhánh bỏ qua.
       - Các đột biến M4, M5, M5b và ba nhánh bỏ qua đều làm test fail; bản sạch đạt.
       - verify: 1420 test; digest c31c300c….
     - WP3-FIX3-FREEZE đã commit và push thành 49651c8, gồm 142 đường dẫn, kể cả chính
       brief của nó và brief WP3-FIX2-FREEZE. Mọi kiểm tra trả về 0; có sửa một dòng
       trống ở cuối tệp, việc brief cho phép.
     - WP3-REGATE3 lần 1 (verifier) trên 49651c8.
       - Mọi mục liên quan đến mã nguồn đều đạt: 1420 test; smoke 40; e2e 127 đạt; đua
         dữ liệu 20/20; migration sạch.
       - Đã nêu tên các test cơ chế chặn của vòng 3; các đột biến M4, M5, M5b đều làm
         test fail.
       - Phạm vi vòng 3 chỉ gồm tệp test.
       - Mục 12 chỉ fail trên cây làm việc hiện tại, do lỗ hổng bản ghi: tệp bằng chứng
         chưa track `WP3-FIX3-FREEZE/result.md` của committer thiếu bản `.vi.md`. Bản
         export đã commit vẫn đạt.
       - Gate tạm dừng cho đến khi sửa xong lỗ hổng bản ghi này.
     - WP3-RECFIX đã xong: tệp đó đã được đổi tên sang `.txt` bằng một lệnh di chuyển
       với đường dẫn cụ thể, không xóa gì; preflight trên cây làm việc giờ trả về 0.
     - WP3-REGATE3: PASS. Lần 2 chạy lại mục 12; cả ba validator trả về 0 trên board
       đang dùng. HEAD là 49651c8; digest chính thức của gate là c31c300c….
     - Chủ dự án trả lời H-Q3 bằng (a): giữ skill `readme-md` trong repo qua một vòng
       GOV. Thứ tự:
       1. Nghiệm thu WP3 trước, trên digest c31c300c…. WP3-ACCEPT không stage 3 tệp
          skill và kiểm tra digest dạng ls-tree.
       2. Sau đó GOV-SKILL-FREEZE, GOV-SKILL-GATE và GOV-SKILL-AUDIT bằng auditor mới;
          brief đã sẵn.
       3. WP4-PLAN có thể chạy song song với gate hoặc audit của GOV, nhưng không bao
          giờ chạy cùng lúc với bước freeze.
     - WP3-RECHECK-BC3 và WP3-RECHECK-A lần 3: cả hai PASS trên 49651c8, không có
       finding (một auditor opus mới).
       - Các đột biến M4, M5, M5b giờ đều làm test fail. Phép quét các cơ chế chặn đã
         được phủ test, trừ hai trường hợp chặn đơn lẻ, ghi lại là rủi ro.
       - Test có ý nghĩa thật.
       - Mảng B và C không có hồi quy; phần thay đổi ở mảng A chỉ là test.
       - Điều phối viên đã dừng shell nhàn rỗi của auditor và dừng agent sau khi nhận kết
         quả.
     - **Chuỗi review WP3 đã khép lại với PASS tại 49651c8, digest c31c300c….**
     - WP3-ACCREC đã xong.
       - Đã ghi biên bản nghiệm thu WP3_HANDOFF, bản EN và VI khớp nhau.
       - Đã sửa các số liệu: smoke 40, 1420 test, e2e 127 và danh sách các commit đóng
         băng.
       - Đã liệt kê R1–R9 và các việc mang sang WP4.
       - Preflight trả về 0.
     - STATE giờ ghi WP3 đã đạt, kèm các rủi ro mang theo. Gói đang làm vẫn để là WP3
       cho đến sau commit nghiệm thu, vì validator chỉ cho task đang chạy thuộc gói đang
       làm hoặc GOV. NEXT_ACTION (EN/VI) trỏ tới GOV-SKILL và WP4.
     - **WP3-ACCEPT đã commit và push thành b103923.** Commit gồm 92 đường dẫn handoff;
       digest dạng ls-tree c31c300c… khớp; mọi kiểm tra trả về 0. 3 tệp skill của chủ
       dự án vẫn để chưa track. **WP3 đã được nghiệm thu.**
     - Board và STATE giờ ghi gói đang làm là WP4 (pha wp4-planning-gov-skill). WP4-PLAN
       đang chờ.
     - GOV-SKILL-FREEZE đã commit và push thành 3bdffbe: 19 đường dẫn, gồm 3 tệp skill
       của chủ dự án. Digest mới, đã tính cả skill, là aab8b32c…; mọi kiểm tra đều trả
       về 0.
     - GOV-SKILL-GATE: PASS, đạt 7/7.
       - Phạm vi chỉ gồm 3 tệp skill; frontmatter hợp lệ.
       - Tệp sạch về định dạng; verify đạt 1420 test.
       - Các validator đều trả về 0.
       - Digest chính thức là aab8b32c…; so với c31c300c… chỉ thêm 3 tệp skill.
     - WP4-PLAN đã xong (opus) và được điều phối viên chấp nhận:
       - 14 task: T01–T07, WP4-DEC, T08–T13;
       - sau đó là WP4-GATE và hai audit theo mảng;
       - khoảng 33 lượt giao việc, hoặc 37–41 nếu có vòng sửa.

       Máy này có Docker 28.5.1, không có Podman.
     - Đang chờ chủ dự án trả lời các câu hỏi WP4-F-1..F-6; F-7 chỉ để nắm thông tin và
       thuộc WP5. T01–T06 không cần các câu trả lời này.
     - GOV-SKILL-AUDIT: FIX REQUIRED (auditor opus mới, 3bdffbe).
       - GOV-SKILL-01 (Medium): đường dẫn ghi tệp ở SKILL.md:267 trỏ ra ngoài repo.
       - GOV-SKILL-02 (Low): markdown.md:142 nêu sai quy tắc về vị trí README.
       - GOV-SKILL-03 (Medium): chưa ghi nguồn gốc và giấy phép (nhiều khả năng là
         LisaHQ/lisa-skills); skills-lock.json chưa có mục cho skill này.
       - GOV-SKILL-04 (Low): skill gợi ý dùng thuộc tính `align` đã lỗi thời.
       - N1 đề xuất thêm một dòng vào AGENTS.md.

       Vì skill là nội dung của chủ dự án, các finding này được hỏi chủ dự án dưới dạng
       Q1–Q4. Sau khi có câu trả lời sẽ chạy một vòng sửa GOV.
     - WP4-T01 đã xong (tác giả tự báo):
       - thay đổi: bộ xác định địa chỉ qua proxy tin cậy, cấu hình production bắt buộc
         đường dẫn tuyệt đối, `/api/ready` chỉ trả các khóa được phép, `.env.example`,
         smoke;
       - test: 23 đỏ → 83 xanh; phép thử đột biến làm 2 test fail;
       - e2e 127 đạt; verify 1449 test; digest 1c57dbae…;
       - sai lệch: thêm một dòng vào danh mục route trong sharing-matrix.
     - WP4-T01-FREEZE đã commit và push thành a1dc01b (50 đường dẫn; digest 1c57dbae…;
       mọi kiểm tra trả về 0).
     - WP4-T02 đã xong (tác giả tự báo):
       - migration 0007 thêm `via_share_id`, kèm trigger kiểm tra chiều chủ → người thao
         tác;
       - mọi thao tác ghi qua chia sẻ và audit tải PDF đều ghi dấu này;
       - request HEAD không còn ghi audit; các dòng cũ vẫn dùng cách suy luận như trước;
       - test: 23 đỏ → 136 xanh; 4 đột biến đều bị test phát hiện;
       - verify: 1469 test; digest d6f223a7….

       Sai lệch: worker sửa thêm `http/auth.ts` và `routes/api.ts`. docs/03 nên nhắc tới
       dấu mới này; việc đó chuyển sang WP4-DEC.
     - WP4-T02-FREEZE lần 1 không tạo commit. Điều phối viên viết brief WP4-T03 giữa lúc
       committer đang chạy và nhờ stage tệp đó; kiểm tra quyền đã từ chối lệnh `git add`
       gộp. Lệnh đó không được thử lại.
     - WP4-T02-FREEZE đã commit và push thành 37f1be2 (lần 2; 33 đường dẫn; mọi kiểm tra
       trả về 0; `WP4-T03.md` để chưa track, chờ lần đóng băng kế tiếp).
     - WP4-T03 đã xong (tác giả tự báo):
       - thay đổi: migration 0008, service bootstrap, lệnh CLI `bootstrap` kèm
         `--new-token`, setup GET và POST (mọi lần từ chối đều trả cùng một mã 403),
         màn hình Setup;
       - test: 24 test, đỏ rồi xanh; đột biến bị phát hiện; migration lên v8;
       - e2e 129 đạt; verify 1494 test; digest 8a316cc0….

       Việc còn lại: cập nhật docs/07, docs/03 và DEVELOPMENT.md, chuyển sang WP4-DEC và
       T13.
     - WP4-T03-FREEZE đã commit và push thành 199e792 (35 đường dẫn; mọi kiểm tra trả về
       0; ảnh chụp sạch, quét token không thấy gì).
     - WP4-T04 đã xong (tác giả tự báo).
       - Image: node:24.21.0-trixie-slim ghim theo digest; 105 MiB; UID 10001.
       - Drill bước 1: lên trạng thái healthy sau 5,4 giây, schema 8/8, root chỉ đọc; dữ
         liệu còn nguyên sau khi khởi động lại.
       - Kiểm tra: 0 tệp bị cấm; 0 dòng cảnh báo deprecation; verify 1494 test.
       - Digest: 6ec6549d….
       - Còn 2 image cục bộ (`:drill`, `:arm64-emulated`) để nguyên. Bản build arm64 chỉ
         chạy qua giả lập.
     - WP4-T04-FREEZE đã commit và push thành 3b2ddf2 (21 đường dẫn; mọi kiểm tra trả về
       0).
     - WP4-T05 đã xong (tác giả tự báo, opus).
       - Thiết kế: chỉ một bước online backup, không tạm dừng ghi; mọi tệp đều được tính
         hash và đối chiếu với hash đã ghi.
       - Test: 9 đỏ → 9 xanh; cả hai phép thử đột biến đều bị phát hiện.
       - Migration: lên v9.
       - Drill bước 2: sao lưu xong trong 348 ms khi dữ liệu vẫn đang được ghi; mọi hash
         đều khớp.
       - verify: 1503 test. Digest: 724d5cd8….
       - Trạng thái sao lưu chưa có trong phản hồi trạng thái cho admin; việc này chuyển
         sang T07.
     - WP4-T05-FREEZE đã commit và push thành 0c58130 (27 đường dẫn; mọi kiểm tra trả về
       0).
     - WP4-T06 lần 1 đã xong (opus).
       - Tạm dừng gửi, khôi phục và resume đều chạy được.
       - Test: 17 đỏ → 29 xanh; phép thử đột biến làm 4 test fail; AC-08 đạt 47/47.
       - Drill bước 1–3 đạt 90/0; verify đạt 1523 test.
       - Worker tự nêu một vấn đề: các job gửi đang xếp hàng trong bản sao lưu sẽ được
         gửi sau khi resume, trái với docs/07:30 và :32.
     - Quyết định điều phối: khi khôi phục, giữ lại các job gửi đó cho tới khi người vận
       hành chủ động release hoặc drop, có ghi audit.
     - WP4-T06 lần 2 đã xong.
       - Khi khôi phục, các job gửi đang xếp hàng hoặc đang giữ lease từ bản sao lưu đều
         bị giữ lại. Hai lệnh `outbound release` và `outbound drop` (chỉ áp dụng cho
         nhắc nhở) đều ghi audit, và phải có `--confirm` mới thực hiện; không có thì chỉ
         xem trước.
       - Test: 5 đỏ → 31 xanh; phép thử đột biến làm 4 test fail.
       - Drill: 105/0, có cả lần khôi phục thế hệ thứ hai.
       - verify: 1525 test; digest 15b7422e….
       - Rủi ro để audit xem: thư mà máy nguồn đã gửi rồi vẫn bị giữ lại, và chỉ có thể
         release hoặc để giữ nguyên.
     - WP4-T06-FREEZE đã commit và push thành 72ab2ed (39 đường dẫn; mọi kiểm tra trả về
       0).
     - Điều phối viên tách WP4-T07 vì F-3 và F-4 chưa có câu trả lời.
       - Cờ F-3 và việc giữ lịch sử job theo F-4 chuyển sang WP4-T07B, làm sau khi chủ
         dự án trả lời.
       - WP4-T07 đã xong (tác giả tự báo):
         - các trường trạng thái về sao lưu, dung lượng đĩa và gửi thư, có danh sách
           khóa được phép cố định;
         - lịch dọn tệp mồ côi hằng ngày, khóa theo ngày, chỉ xóa tệp không còn được
           tham chiếu và cũ hơn 24 giờ;
         - giao diện trạng thái dùng token E-8;
         - test: 13 đỏ → xanh; đột biến làm 2 test fail;
         - e2e: 131 đạt; verify: 1545 test; digest cc86af8a….

         Kỳ vọng về số job được nhận trong 3 test đã đổi để tính cả việc dọn tệp; audit
         sẽ đánh giá thay đổi này có làm test yếu đi không.
     - WP4-T07-FREEZE đã commit và push thành e1d97bd (31 đường dẫn; mọi kiểm tra trả về
       0).
     - Quyết định điều phối: T08 không phụ thuộc F-1..F-3, nên chạy trước WP4-DEC.
     - WP4-T08 đã xong (tác giả tự báo).
       - Thư viện: thêm 2 thư viện mới, không có cảnh báo deprecation.
       - Bộ đọc giới hạn theo dung lượng thật sau khi giải nén, và chặn DOCTYPE/ENTITY và
         macro.
       - Các lỗi đã ghi trong README đều được phát hiện.
       - Test: 28 test viết trước để thấy đỏ; 6 phép thử đột biến đều bị bắt.
       - Hash của template không đổi.
       - Verify: 1573 test. Digest: 6fcd692d….
     - WP4-T08-FREEZE lần 1 không tạo commit. `git diff --cached --check` báo một dòng
       trống ở cuối `src/server/import/xlsxReader.ts`; đây là tệp mã nguồn nên committer
       không được tự sửa.
     - WP4-T08 lần 2 đã xóa dòng trống ở cuối tệp; verify đạt 1573 test; digest mới là
       d70a03c2….
     - WP4-T08-FREEZE lần 2 đã commit và push thành dd1422f (25 đường dẫn; mọi kiểm tra
       trả về 0).
     - Quyết định điều phối: tách WP4-T12.
       - WP4-T12A chạy ngay: diễn tập bước 4–5 (nâng cấp DB v6 của bản WP3, bản cũ từ
         chối DB mới, khôi phục bản sao lưu đi cặp khi rollback mà không tự gửi lại) và
         test nâng cấp.
       - Bước 6 (nhập lại không đổi gì) và chạy lại toàn bộ diễn tập để ở WP4-T12, sau
         T09–T11.
     - WP4-T12A đã xong (tác giả tự báo).
       - Bước 4 nâng cấp một DB schema 6 của bản WP3 lên schema mới nhất, đúng một lần.
       - Bước 5: bản cũ từ chối DB đã nâng cấp. Lệnh mới
         `restore --keep-schema --confirm` khôi phục bản sao lưu đi cặp và giữ lại các
         lượt gửi có sẵn trong đó. Sau đó server cũ không thử gửi lần nào; bản đối chứng
         không giữ lại thì gửi đi.
       - Test: 10 + 6, viết trước để thấy đỏ; 3 phép thử đột biến đều bị bắt.
       - Diễn tập bước 1–5: 165 PASS. Verify: 1589 test. Digest: e6bb47fd….
       - Giới hạn còn lại, chuyển cho runbook T13 và audit: sau rollback, schema cũ không
         giữ được các job tạo về sau, nên bản cũ phải chạy với `JOB_RUNNER=off` cho đến
         khi đối soát xong.
     - WP4-T12A-FREEZE đã commit và push thành 0f989e4 (25 đường dẫn; mọi kiểm tra trả về
       0).
     - Mọi task WP4 không phụ thuộc F-1..F-6 đã xong và đã commit.
     - Ngày 2026-10-05 chủ dự án đã trả lời F-1..F-6, tất cả theo khuyến nghị; câu trả lời
       nằm trong `owner_decisions` của board.
     - Chủ dự án hỏi vì sao lại có việc sửa skill readme-md ở đây. Coordinator đã giải
       thích nguồn gốc (H-Q3 (a) và GOV-SKILL-AUDIT). Sau đó chủ dự án chọn B: gỡ skill
       khỏi repo, tức là đảo lại H-Q3 (a). Vòng GOV-SKILL-REMOVE làm sau
       WP4-DEC-FREEZE.
     - WP4-DEC đã xong (tác giả tự báo).
       - docs/03 có mục mới cho F-1..F-4.
       - docs/07 dòng 9, 26, 32 và 46 ghi F-6, F-5, việc giữ lại lượt gửi và
         `JOB_RUNNER=off`, và F-1..F-3.
       - docs/10 ghi các quyết định của chủ dự án và của coordinator.
       - Không có mâu thuẫn; các cặp dịch khớp nhau; preflight trả về 0. Digest:
         65247d70….
       - Sai lệch: worker chạy `npm run digest` qua cmd.exe. Lệnh bị treo, và
         coordinator đã dừng nó.
     - WP4-DEC-FREEZE đã commit và push thành e5576de (18 đường dẫn; mọi kiểm tra trả về
       0).
     - GOV-SKILL-REMOVE đã xong (tác giả tự báo).
       - Đã xóa 3 tệp của skill và hai thư mục rỗng.
       - Ngoài handoff/ không còn chỗ nào nhắc tới skill; preflight trả về 0.
       - Chưa tính được digest, vì index vẫn còn ghi các tệp đã xóa. Committer sẽ stage
         việc xóa trước, rồi mới tính digest.
     - GOV-SKILL-REMOVE-FREEZE đã commit và push thành a923351 (13 đường dẫn; 3 tệp bị
       xóa; digest fcd8fe1e…, 750 tệp; mọi kiểm tra trả về 0).
     - GOV-SKILL-REMOVE-GATE: PASS (7/7).
       - Đúng 3 tệp bị xóa; ngoài handoff/ không còn chỗ nào nhắc tới skill.
       - Verify trên bản export sạch: 1589 test, 0 dòng deprecation.
       - Các validator trả về 0.
       - Digest chính thức fcd8fe1e… (750 tệp), khớp con số committer báo.
     - GOV-SKILL-REMOVE-AUDIT: PASS, không có phát hiện (auditor opus mới; bản review
       GOV_SKILL_REMOVE_REVIEW.md).
       - GOV-SKILL-01..04 và N1 đã khép.
       - Ghi chú R1 cho chủ dự án: các tệp đã gỡ vẫn còn trong lịch sử công khai. Muốn
         xóa khỏi lịch sử thì phải viết lại lịch sử, điều mà docs/08 cấm.
       - Digest mã nguồn hiện tại trên board giờ là fcd8fe1e… (R3).
     - GOV-SKILL-REMOVE-ACCEPT đã commit và push thành c398cab (27 đường dẫn trong
       handoff; mọi kiểm tra trả về 0). Việc gỡ skill readme-md (GOV) đã khép.
     - WP4-T07B đã xong (tác giả tự báo).
       - F-3: `not_set_up` dùng lại điều kiện `hasSavedSettings` của H-Q1 (a); giao diện
         hiện một nhãn.
       - F-4: migration 0011 thêm một ngoại lệ hẹp cho trigger, chỉ mở được qua một
         bảng "cửa sổ" một dòng, và một job `job_retention` chạy mỗi ngày.
       - Test: 18 test mới; phép thử đột biến làm 2 test fail. e2e: 133 đạt. Verify:
         1613 test. Digest: 7fe65713….
       - Sai lệch: sửa các chỗ ghim số lượng và key một cách cơ học. Giới hạn số job
         trong automation.spec được nới (1 lên 2, 2 lên 4); audit sẽ đánh giá việc này.
     - WP4-T07B-FREEZE đã commit và push thành 641ca10 (41 đường dẫn; mọi kiểm tra trả
       về 0). Digest mã nguồn hiện tại trên board là 7fe65713….
     - WP4-T05B đã xong (tác giả tự báo).
       - Quy tắc: giữ theo 7 ngày UTC, 4 tuần ISO và 6 tháng UTC, cộng bản sao lưu mới
         nhất.
       - Chỉ thư mục do công cụ tạo, có manifest khớp, mới được xét để xóa.
       - Chỉ xóa sau khi bản sao lưu mới đã được kiểm; có chế độ chạy thử; nếu có thư
         mục trỏ ra ngoài đích thì từ chối cả lần chạy.
       - Test: 21; phép thử đột biến làm 1 test fail. Verify: 1625 test. Digest:
         57be8442….
       - Không ghi trạng thái lần xóa gần nhất, vì việc đó cần một migration.
     - WP4-T05B-FREEZE đã commit và push thành 6fecd88 (20 đường dẫn; mọi kiểm tra trả
       về 0). Digest mã nguồn hiện tại trên board là 57be8442….
     - WP4-T09 đã xong (tác giả tự báo, opus).
       - Migration 0012 thêm bảng `imports`.
       - Chỉ chủ workbook được nhập; xem trước và ghi dữ liệu đều chống trùng.
       - Chỉ nhập được kỳ mới, đã kết thúc và có trong lịch. Mỗi ngày được liệt kê đều
         cần một quyết định.
       - Kỳ đã nhập trả 409 khi ký, điều chỉnh hay sửa, và không bao giờ tự động hóa.
       - Test: 21; 5 phép thử đột biến đều bị bắt. Verify: 1646 test. Digest:
         65f38459….
       - Đã hỏi chủ dự án 3 lựa chọn còn mở, I-1..I-3; trong lúc chờ, các mặc định an
         toàn vẫn giữ.
       - Việc tiếp theo:
         - WP4-T09B: bản sao lưu chưa gồm các tệp workbook nguồn;
         - WP4-T10: từ chối ghi dùng nghỉ bù OT trong kỳ đã nhập;
         - WP4-T11: đưa `imported_unverified` ra cho client.
     - WP4-T09-FREEZE đã commit và push thành a679787 (32 đường dẫn; mọi kiểm tra trả về
       0). Digest mã nguồn hiện tại trên board là 65f38459….
     - WP4-T09B đã xong (tác giả tự báo).
       - Backup và restore giờ gồm cả tệp workbook nguồn, có kiểm hash và kích thước,
         khi có bảng `imports`.
       - Manifest cũ không có dòng imports vẫn khôi phục được. Nếu có dòng imports thì
         bị từ chối, và tệp nguồn bị sửa cũng bị từ chối.
       - Test: 6 đỏ, 57 xanh; phép thử đột biến làm 4 test fail. Verify: 1655 test.
         Digest: b8db09bd….
     - WP4-T09B-FREEZE đã commit và push thành 1b4d817 (21 đường dẫn; mọi kiểm tra trả về
       0). Digest mã nguồn hiện tại trên board là b8db09bd….
     - WP4-T10 đã xong (tác giả tự báo, opus).
       - Migration 0013 dựng lại `ot_ledger` với loại `opening_balance`, theo quy trình 12
         bước.
       - `migrate()` giờ tắt khóa ngoại trong lúc chạy transaction và chạy
         `foreign_key_check` trước COMMIT, vì chỉ dùng `defer_foreign_keys` thì lỗi.
         Audit phải đánh giá thay đổi này.
       - Các route GET, POST và PUT chỉ cho chủ tài khoản và chống ghi trùng; điều chỉnh
         cần có lý do.
       - Ghi dùng nghỉ bù OT trong kỳ đã nhập trả 409.
       - Test: 26 test viết trước để thấy đỏ; phép thử đột biến làm 4 test fail. Verify:
         1673 test. Digest: 260ca363….
       - Câu hỏi I-4 cho chủ dự án: hiện không cho điều chỉnh số dư về 0.
     - WP4-T10-FREEZE đã commit và push thành aff904a (34 đường dẫn; mọi kiểm tra trả về
       0). Digest mã nguồn hiện tại trên board là 260ca363….
     - WP4-T11 đã xong (tác giả tự báo).
       - Màn hình Import có tải lên, xem trước, quyết định từng ngày, xác nhận, và báo
         "đã nhập" khi nhập lại.
       - Kỳ đã nhập hiện "Imported, unverified" và các nút bị khóa.
       - Form số dư đầu kỳ có bước xác nhận và luồng điều chỉnh.
       - Read model thêm `imported_unverified`.
       - e2e: 145 đạt. Verify: 1707 test. Digest: 70561b0d….
       - Sai lệch: sửa thêm vài component client ngoài danh sách được giao, và cho
         `.shell-nav` xuống dòng.
     - WP4-T11-FREEZE đã commit và push thành 61bf524 (53 đường dẫn; mọi kiểm tra trả về
       0). Digest mã nguồn hiện tại trên board là 70561b0d….
     - WP4-T12 đã xong (tác giả tự báo).
       - Diễn tập với `--wp3` đạt cả bước 1–6: 205 PASS, 0 FAIL.
       - Bước 6 kiểm: nhập lại không làm đổi 8 bảng, chỉ có một số dư đầu kỳ, kỳ đã nhập
         trả 409, và người khác nhận 404.
       - Bước 2–4 giờ kiểm thêm: tệp nguồn có trong bản sao lưu, chạy thử xóa bớt bản
         sao lưu, bản khôi phục vẫn tạm dừng gửi, và nâng cấp từ schema 6 lên 13.
       - Verify: 1710 test. Digest: de0e215b….
       - Một lệnh thử chạy nền còn sót đã được dừng bằng TaskStop.
     - WP4-T12-FREEZE đã commit và push thành 0f6abdf (17 đường dẫn; mọi kiểm tra trả về
       0). Digest mã nguồn hiện tại trên board là de0e215b….
     - WP4-T13 đã xong (tác giả tự báo).
       - Mới: runbook docs/11 (EN/VI) và WP4_HANDOFF (EN/VI).
       - Cập nhật: DEVELOPMENT, README và một câu trong docs/03.
       - Đối chiếu lệnh: 13 lệnh gắn với các bước diễn tập; 5 lệnh là bước chủ dự án tự
         làm trên NAS, chưa kiểm.
       - Các cặp dịch khớp; preflight trả về 0. Digest: 1ed67f55….
     - Brief WP4-GATE, WP4-AUDIT-A và WP4-AUDIT-B đã sẵn.
     - WP4-T13-FREEZE đã commit và push thành 13a258d (26 đường dẫn; mọi kiểm tra trả về
       0). Đây là commit đóng băng cả package WP4; digest mã nguồn hiện tại trên board là
       1ed67f55….
     - WP4-GATE: PASS (13/13, theo verifier báo).
       - Digest chính thức là 1ed67f55… (774 tệp).
       - Verify: 1710 test. e2e: 145 đạt.
       - Diễn tập bước 1–6: 205 PASS.
       - Migration đạt; các test tranh chấp chạy đạt 60/60.
       - NAS: NOT VERIFIED.
       - Sự cố: một lần thử migrate thiếu `DATABASE_PATH` đã nâng cơ sở dữ liệu phát triển
         trên máy của chủ dự án từ schema 1 lên 13. Đó chỉ là dữ liệu dev, nằm ngoài
         repo. Đã báo chủ dự án.
     - WP4-AUDIT-B (dữ liệu): **FIX REQUIRED.**
       - WP4-B-01 (Medium): một tệp XML gây tốn công phân tích, dù vẫn trong giới hạn,
         làm server đứng khoảng 9 giây và ăn thêm khoảng 730 MiB bộ nhớ; báo cáo lưu lại
         thì phình không giới hạn.
       - WP4-B-02 (Low): 150.000 ô Holiday Dates gây tràn stack và lỗi HTTP 500.
       - Mọi phần khác của mảng B đều đạt.
       - Ghi chú rủi ro R1–R4: R3 cho biết một kỳ đã kết thúc nhưng chưa tới hạn vẫn nhập
         được, liên quan tới I-3. R4 cho biết bản xem trước được giữ mãi, không có hạn
         mức.
       - Sự cố: một REPL python của auditor chạy mãi (task nền b9vel2ldq) và ghi ra một
         tệp output nhiều GB. Coordinator đã dừng nó; chủ dự án xóa tệp đó.
     - WP4-AUDIT-A (vận hành): **FIX REQUIRED.**
       - WP4-A-01 (Low, phải sửa): image chứa 114 tệp source map, và bản production
         phục vụ source map của client.
       - WP4-A-02 (Low): `.env.example` mâu thuẫn với quy tắc `JOB_RUNNER=off` khi
         rollback.
       - WP4-A-03 (Low): hai câu trong runbook không chính xác.
       - WP4-A-04 (Info): smoke test dùng lại `DATA_DIR` của người gọi.
       - Rủi ro R-A1 đến R-A9. Phần còn lại của mảng A đều đạt: backup khi đang ghi và
         restore, bộ chạy migration, chặn junction thoát ra ngoài khi xóa bớt bản sao
         lưu, khởi tạo, proxy, xóa job cũ, quyền riêng tư và CLI gửi mail.
     - Vòng sửa:
       - WP4-FIXB đã xong (tác giả tự báo).
         - Giới hạn XML trả 422 ngay trước khi phân tích; danh sách cảnh báo được giới
           hạn.
         - Tệp bom 65 KB giờ bị từ chối sau 4 ms (422), thay vì làm server đứng 8,4
           giây và tốn thêm 740 MiB.
         - B-02 đã sửa; R3 thêm trạng thái `not_due` chỉ cho bỏ qua; R1 trả 409.
         - Verify: 1730 test. Digest: b119e1b5….
       - WP4-FIXA đã xong (tác giả tự báo).
         - Image không còn source map, và `/assets/*.map` trả 404; `app.ts` giờ trả
           404 khi thiếu tệp asset.
         - Đã sửa `.env.example`, runbook và smoke test.
         - Lệnh xóa bớt bản sao lưu từ chối khi đồng hồ bị lùi; diễn tập giải phóng
           hai job.
         - Đã đồng bộ docs.
         - Diễn tập: 208 PASS. Verify: 1734 test. Digest: dfe4541d….
       - WP4-FIX-FREEZE đã commit và push thành 0f7fba2 (149 đường dẫn; mọi kiểm tra trả về
         0). Digest mã nguồn hiện tại trên board là dfe4541d….
       - WP4-REGATE: PASS, đạt cả 13 hạng mục và mọi phần kiểm lỗi.
         - Digest chính thức: dfe4541d… (775 tệp).
         - Verify: 1734 test. e2e: 145 đạt. Diễn tập: 208 PASS.
         - Tệp bom 65 KB bị từ chối trong 5 ms, trong lúc đó health vẫn trả lời sau 2 ms.
         - Image không còn source map; các test tranh chấp đạt 60/60.
         - Phạm vi thay đổi: chỉ các đường dẫn của FIXA và FIXB.
         - Lưu ý: hai bản sao lưu trong cùng một giây thì được chọn theo tên; lần kiểm
           tra lại sẽ đánh giá điểm này.
       - WP4-RECHECK-B: **FIX REQUIRED**, phát hiện WP4-RB-01 (Medium). Lỗi này mở lại
         B-01:
         - thẻ bắt đầu bằng chữ số hoặc dấu cách, và các thuộc tính, lọt qua bộ đếm phần
           tử: bốn phần cỡ 26 KB tốn khoảng 3 giây và khoảng 1,4 GiB;
         - giá trị ô trong danh sách cảnh báo không bị giới hạn: một báo cáo 99,8 MiB bị
           lưu lại, còn báo cáo lớn hơn thì gây lỗi 500.
         - B-02, R3 và R1 đã khép, và không có hồi quy.
       - WP4-RECHECK-A: **PASS**, không có phát hiện.
         - A-01 đến A-04 đã khép; R-A1, R-A5 và R-A7 đúng; không có hồi quy.
         - Các rủi ro R-RA1 đến R-RA4 không chặn nghiệm thu.
         - Nếu mã nguồn thay đổi, phải kiểm tra lại phần chênh của mảng A (lần 2) trên
           digest mới.
       - WP4-FIXB2 đã xong (expert, opus; tác giả tự báo).
         - Một bộ quét XML dạng luồng, có giới hạn, thay cho fast-xml-parser. Nó đếm mọi
           dấu `<`, và giới hạn thuộc tính, độ dài thẻ và tên thẻ.
         - Văn bản bị cắt ở 200 ký tự, báo cáo tối đa 2 MiB. Lỗi khi dựng báo cáo trả
           422.
         - Mọi probe đều bị từ chối trong tối đa 57 ms. Gói được nhận nặng nhất tốn 180
           ms và thêm 107 MiB.
         - Test: 15 test viết trước để thấy đỏ, cộng một lượt quét 35 kiểu tệp; 10 phép
           thử đột biến đều bị bắt. Verify: 1.750 test. Digest: 9848e8d7….
       - WP4-DEPCLEAN đã xong: đã gỡ fast-xml-parser và 7 gói phụ thuộc kéo theo, không
         đổi thư viện nào khác. `npm ci` sạch; audit --omit=dev báo 0 lỗ hổng; verify đạt
         1.750 test. Digest: 96445de4….
       - Board đã sẵn sàng cho digest mới:
         - WP4-RECHECK-A chuyển sang lần 2 (đang chờ; kết quả PASS của lần 1 vẫn lưu
           trong lịch sử);
         - WP4-REGATE2 và WP4-RECHECK-B2 đang chờ.
       - WP4-FIXB2-FREEZE đã commit và push thành cc34e7f (127 đường dẫn; mọi kiểm tra trả
         về 0, sau một lần sửa dòng trống cuối tệp mà brief cho phép). Digest mã nguồn
         hiện tại trên board là 96445de4….
       - WP4-REGATE2: PASS.
         - Digest: 96445de4….
         - Verify: 1.750 test. e2e: 145 đạt. Diễn tập: 208 PASS.
         - Mọi probe RB-01 đều bị từ chối nhanh hoặc nằm trong ngân sách: tệ nhất 62 ms
           và +73 MiB. Health trả lời trong 1–3 ms, không request nào trả 500, báo cáo
           lớn nhất 0,57 MiB.
         - Phép đối chiếu với workbook bình thường cho kết quả giống hệt bộ đọc cũ đến
           từng byte.
       - WP4-RECHECK-A lần 2: **PASS** trên cc34e7f (digest 96445de4), không có phát
         hiện.
         - Phần chênh chỉ gồm các tệp của FIXB2 và DEPCLEAN.
         - Thay đổi trong lock chỉ gỡ fast-xml-parser.
         - Verify: 1.750 test. Diễn tập: 208 PASS. Không có source map.
         - Các kết luận của lần 1 vẫn đúng. Mới: R-RA5 (Info).
       - WP4-RECHECK-B2: **FIX REQUIRED**, phát hiện WP4-RB2-01 (Low).
         - Hai kiểu tệp vượt ngân sách đã công bố: khoảng 610 ms (thuộc tính `t` bị
           giải mã hai lần) và +158 MiB (slice giữ lại cả phần chuỗi hai byte).
         - Chi phí vẫn tăng tuyến tính, không có lỗi 500.
         - Mọi phần khác đều đạt:
           - bộ quét qua 49/49 trường hợp theo spec và từ chối DOCTYPE;
           - phép đối chiếu cho kết quả giống hệt;
           - 72 kiểu tệp mới đều nằm trong giới hạn;
           - báo cáo tối đa 1,61 MiB.
       - Quyết định của coordinator: sửa code thay vì nới con số ngân sách.
       - WP4-FIXB3 đã xong (expert; tác giả tự báo).
         - Giá trị được giữ lại chỉ giải mã một lần và lưu thành bản sao; thuộc tính bị
           giới hạn 255 ký tự; `decodeXml` chạy tuyến tính.
         - Giới hạn siết lại: 8 MiB XML và 150 nghìn thẻ mở.
         - Ca tệ nhất: 289 ms / +89 MiB, khoảng 60% ngân sách. E7 và Y7 bị từ chối.
         - Đã sửa R-B2-1 và R-B2-2.
         - Test: 89/89; phép đối chiếu cho kết quả giống hệt. Verify: 1.755 test. Digest:
           635f909d….
       - Board chuyển WP4-RECHECK-A sang lần 3 (đang chờ) và thêm WP4-REGATE3,
         WP4-RECHECK-B3 (đang chờ).
       - WP4-FIXB3-FREEZE đã commit và push thành 972ccda (148 đường dẫn; mọi kiểm tra trả
         về 0). Digest mã nguồn hiện tại trên board là 635f909d….
       - WP4-REGATE3: **PASS** (digest 635f909d…).
         - Verify: 1.755 test. e2e: 145 đạt. Diễn tập: 208 PASS.
         - Ca tệ nhất trong cả gate: 160 ms và +86 MiB.
         - E7 và Y7 bị từ chối hoặc nằm trong ngân sách.
         - R-B2-1 và R-B2-2 đạt.
         - Phép đối chiếu: 0 khác biệt, ngoài trường bổ sung `sourceCount` đã được
           chấp nhận.
         - Verifier để lại hai task python chạy nền đang chờ stdin; coordinator đã
           dừng chúng.
       - WP4-RECHECK-A lần 3: **PASS** trên 972ccda (digest 635f909d), không có phát
         hiện.
         - Phần chênh chỉ gồm FIXB3.
         - Verify: 1.755 test. Image không có source map.
         - Kết luận của lần 1 và lần 2 vẫn đúng.
       - WP4-RECHECK-B3: **FIX REQUIRED**, phát hiện WP4-RB3-01 (Low).
         - Nội dung không nén được (tệp tải lên 4–5 MB, vẫn trong mọi giới hạn) tốn
           508–611 ms và làm health đứng 640 ms, do bước giải nén theo từng khối 4 KiB.
         - Vì vậy con số ca tệ nhất khoảng 290 ms đã ghi là sai. Bộ nhớ vẫn tối đa
           +123 MiB, không có lỗi 5xx.
         - Tính đúng (75/75), R-B2-1, R-B2-2, phép đối chiếu và hồi quy đều đạt.
       - Quyết định của coordinator: khép cả lớp lỗi bằng tính toán chứ không bằng dò
         tìm. Nghĩa là giải nén tuyến tính, một công thức chi phí theo các giới hạn đang
         áp dụng, và hạ trần kích thước về mức thực tế (ví dụ 2 MiB) nếu cần.
       - WP4-FIXB4 đã xong (expert; tác giả tự báo).
         - Giải nén bằng zlib có sẵn của Node: từ 251 ms xuống 16 ms. Phần lớn hơn 512 KiB
           được giải mã theo từng đoạn.
         - Công thức giới hạn: t ≤ 40 ms + 14,8 ns·X + 339 ns·O và
           m ≤ 15 MiB + 13,3 B·X + 428 B·O.
         - Trần mới: 2 MiB cho tệp tải lên, 1 MiB mỗi phần, 3 MiB cả gói, và 100 nghìn
           thẻ mở. Theo công thức là khoảng 121 ms và +95 MiB. Đo thực tế tệ nhất:
           114 ms và +72 MiB.
         - Verify: 1.758 test. Digest: b0611629….
       - WP4-DEPCLEAN2 đã xong: fflate 0.8.3 giờ là dev dependency, lock không đổi gì
         khác; image runtime không cài nó; audit --omit=dev báo 0 lỗi. Verify: 1.758
         test. Digest: 26fcc969….
       - WP4-FIXB4-FREEZE lần 1 dừng đúng quy tắc, không có commit. Validator từ chối
         board vì coordinator để WP4-RECHECK-A ở trạng thái `done` khi chuyển sang lần 4.
         Coordinator đã sửa board.
       - WP4-FIXB4-FREEZE lần 2 đã commit và push 546cddaf (215 đường dẫn; digest
         26fcc969, 775 tệp; mọi kiểm tra trả 0).
       - WP4-REGATE4: **PASS** trên 546cdda (digest 26fcc969, 775 tệp). verify 1.758,
         e2e 145/bỏ qua 5, drill 208/0, races 10/10 x6. RB3 tệ nhất tại các trần là
         107 ms / +70 MiB, so với công thức khoảng 120 ms / +96 MiB; không có lỗi 5xx.
         Trần 2 MiB được áp dụng (vượt thì 413); phép đối chiếu giống hệt. Sự cố: có thể
         còn sót một tiến trình server Node từ thư mục tác vụ của nó; agent đã được
         TaskStop.
       - WP4-RECHECK-B4 (auditor opus mới): **PASS** trên 546cdda, digest 26fcc969 trước
         và sau, không có phát hiện. RB3-01 đã đóng. Tính lại công thức giới hạn một cách
         độc lập bằng LP cho 105,5 ms / +90,8 MiB (con số đã ghi là 121 ms / +95 MiB).
         Tệ nhất tại các trần: 89–90 ms. Đã ghi các rủi ro R-B4-1..4.
       - WP4-RECHECK-A lần 4 (auditor opus mới, kiểm phần chênh): **PASS** trên 546cdda,
         digest 26fcc969 trước và sau, không có phát hiện. 14 đường dẫn thay đổi đều
         thuộc FIXB4 và DEPCLEAN2; giới hạn của các route khác không đổi; bản production
         không còn fflate và điều này không ảnh hưởng mảng A. Hai rủi ro mới R-RA8 (Info)
         và R-RA9 (Low) nằm trong code cũ. Danh sách tiến trình của nó cho thấy server
         probe còn sót đã tắt.
       - WP4-ACCREC đã xong (light, sonnet): biên bản nghiệm thu trong WP4_HANDOFF (EN và
         VI) cho 546cdda. Preflight trả 0; precommit trả 0.
       - STATE ghi WP4 đã đạt kèm các rủi ro mang theo; NEXT_ACTION (EN và VI) trỏ sang
         WP5.
       - WP4-ACCEPT lần 1 dừng đúng quy tắc, không có commit. Validator thấy
         WP4-REGATE4 và WP4-RECHECK-B4 vẫn ở trạng thái `running`. Coordinator đã ghi kết
         quả của chúng nhưng quên đổi trạng thái, và nay đã sửa.
       - WP4-ACCEPT lần 2 đã commit và push e7fe514 (163 đường dẫn handoff; mọi kiểm
         tra trả 0). **WP4 đã được nghiệm thu.**
       - Board và STATE đã chuyển sang WP5.
       - WP5-PLAN đã xong (planner, opus; chỉ đọc).
         - Không chạy gate mới trước đợt đánh giá: WP4-REGATE4 đã đạt trên cùng commit
           đóng băng.
         - Hai auditor opus mới chạy song song trên 546cdda: A (quy trình tích hợp, nộp
           bảng công và quyền riêng tư) và B (bản phát hành dựng lại được, khôi phục đã
           kiểm chứng và vận hành).
         - Nó phác khung pilot packet, đặt các quyết định D-1..D-15 cho chủ dự án, và
           liệt kê các task tạm thời: sửa lỗi, REL, GATE, PILOT, FINAL-AUDIT, ACCREC,
           ACCEPT và GOV-RECOVERY.
       - Đã hỏi chủ dự án D-1..D-15 (`pending_owner_question` trên board; thay cho
         WP4-I-1..I-5).
       - WP5-ASSESS-A: **PASS** trên 546cdda (digest 26fcc969 trước và sau), không có
         phát hiện.
         - Kịch bản tích hợp AC-13 đạt 77/77, kịch bản lỗi gửi đạt 12/12.
         - verify 1.758, e2e 145/bỏ qua 5, các bộ test chọn lọc 747.
         - Rủi ro R-WA1..R-WA8; R-WA1..R-WA3 và R-WA8 chuyển cho chủ dự án và pilot
           packet.
       - WP5-ASSESS-B: **FIX REQUIRED** trên 546cdda (digest 26fcc969).
         - Bản phát hành dựng lại được: dist giống hệt từng byte, và dist trong image
           khớp bản dựng tại máy. Image không chạy bằng root, 0 file bị cấm.
         - Drill: 208 PASS. Lần khôi phục thêm (kỳ đã chốt, chỉnh sửa, OT đặt trước và
           dùng một phần) khớp hoàn toàn.
         - Phát hiện: WP5-B-01 (Medium), runbook chưa định nghĩa các biến Compose và
           `<image>`, nên bản khôi phục và bản rollback không có cách gắn đúng;
           WP5-B-02 (Low), không giữ bản sao file env được bảo vệ và thông tin phiên
           bản cùng với bản backup ở thiết bị khác.
         - Rủi ro R-B5-1..R-B5-7.
       - WP5-FIXB đã xong (worker, sonnet; tác giả tự báo).
         - Nó sửa docs/11 EN và VI, phần đầu `.env.example` và một dòng chú thích trong
           `compose.example.yaml`.
         - `docker compose config` trả 0 cho bản đang chạy, bản khôi phục và bản
           rollback. verify 1.758; precommit 0; preflight 0.
         - Digest ed604d0c (775 tệp); digest hiện tại trên board đã cập nhật.
       - WP5-ASSESS-A chuyển sang lần 2, trạng thái pending: kiểm phần chênh mảng A gắn
         digest trên một commit đóng băng WP5 sau này. Lần 1 được giữ trong lịch sử.
       - WP5-FIXB-FREEZE đã commit và push 85838b5 ở lần 3 (105 đường dẫn; mọi kiểm tra
         trả 0). Lần 1 và lần 2 dừng do lỗi board của coordinator: còn sót lý do đổi
         model, và một audit pending không phụ thuộc gate nào.
       - WP5-AC13 đã xong (worker-high, sonnet; tác giả tự báo).
         - Thêm `tests/integration/ac13-two-week.test.ts` và helper. Một kịch bản ổn
           định: 14 ngày, ký xác nhận (8:30, sổ OT ghi đúng một lần), crash và khởi
           động lại quanh lúc gửi, chỉnh sửa, tranh chấp dùng OT hai lần, cô lập người
           dùng và một lượt quá hạn.
         - Đạt dưới 3 múi giờ, và 3 lần chạy riêng đều đạt. 2 lỗi cố ý cài vào đều bị
           bắt. Không thấy lỗi sản phẩm.
         - lint 0; verify 77 tệp / 1.759 test. Digest 1e59ad31 (777 tệp).
       - WP5-AC13-FREEZE đã commit và push 8e99d2c (23 đường dẫn; mọi kiểm tra trả 0).
       - WP5-REL đã xong (worker, sonnet; tác giả tự báo).
         - Mới: ghi chú phát hành docs/12 và bản chụp hiện trạng trước gate WP5_HANDOFF
           (EN và VI).
         - docs/11 mục 13–16: bật pilot, tắt pilot, thẻ rollback và ghi chú cho người
           vận hành.
         - Một link tới docs/12 trong README.
         - D-1..D-15 được ghi theo khuyến nghị và đánh dấu chờ quyết. Mốc kích hoạt
           được đặt qua một lệnh gọi API admin, vì chưa có màn hình cho việc này.
         - Tìm thấy đủ 14 biến env; verify 1.759. Digest 0a64a75f (779 tệp).
       - WP5-REL-FREEZE đã commit và push 74d5bfe, commit đóng băng cuối của package:
         28 đường dẫn, digest 0a64a75f, mọi kiểm tra trả 0, và không thấy email hay
         host nào trong docs đã stage.
       - WP5-GATE: **PASS** trên 74d5bfe (digest 0a64a75f, 779 tệp; NAS chưa kiểm).
         - verify 1.759, không có dòng deprecation nào; e2e 145/bỏ qua 5.
         - AC-13 đạt cả 3 lần (mỗi lần khoảng 4,1 giây).
         - Drill: 208 PASS.
         - `docker compose config` trả 0 cho bản đang chạy, bản khôi phục và bản
           rollback.
         - Đủ biến env; audit 0; các validator PASS; phạm vi sạch; Docker sạch.
       - Đang chạy song song:
         - WP5-PILOT (worker, sonnet; chỉ ghi trong handoff, cổng 47780–47789);
         - WP5-ASSESS-A lần 2 (auditor opus mới; kiểm phần chênh của mảng A trên
           74d5bfe; cổng 47700–47719).
       - WP5-PILOT đã xong (worker, sonnet; tác giả tự báo).
         - `WP5_PILOT_PACKET` EN và VI: 8 thư giả lập đã bắt, 4 PDF và 4 ảnh
           `*-synthetic.png`, đã xem hết.
         - D-1..D-15 vẫn chờ quyết. Digest không đổi; precommit và preflight trả 0.
         - Sự cố: một heredoc `python -` chạy vòng lặp, sinh khoảng 1 GB output.
           Coordinator đã dừng tác vụ và agent. Đã nhờ chủ dự án xóa tệp output.
       - WP5-ASSESS-A lần 2: **FIX REQUIRED** trên 74d5bfe (digest 0a64a75f).
         - Phần mềm đạt mọi kiểm tra của mảng A. Không có thay đổi nào trong source
           ứng dụng.
         - Test AC-13 chặt chẽ và ổn định; các đột biến đều làm nó fail.
         - verify 1.759; e2e 145/bỏ qua 5 ở lần chạy lại, sau một lỗi
           `ERR_NO_BUFFER_SPACE` ở lần 1; probe 26/26.
         - Phát hiện, cả hai đều Low và chỉ trong docs/11:
           - WP5-A2-01: màn hình trạng thái không có trường "cờ";
           - WP5-A2-02: không thể kiểm deep link trong lần tự kiểm ở chế độ capture.
         - Rủi ro R-A2-1..5. Trong đó, các lần chạy TZ của WP5-AC13 thực ra không đổi
           múi giờ.
       - WP5-FINAL-AUDIT: **FIX REQUIRED** trên 74d5bfe (digest 0a64a75f).
         - B-01 và B-02 đã được giải quyết; bản khôi phục được khởi động thật, gắn đúng
           và ở trạng thái tạm dừng.
         - Mảng B: PASS. Bước kích hoạt qua console đã chạy thử trên Edge và an toàn.
         - Phát hiện, cả hai đều Low:
           - WP5-F-01: cùng lỗi "cờ" trên màn hình trạng thái, cộng thêm câu chữ về việc
             CLI từ chối chạy (trong runbook và packet);
           - WP5-F-02: mục 8 của packet nhắc tới một commit đóng băng đã diễn ra rồi.
         - Rủi ro R-F1..R-F7. O-1 (mức độ của B-01 ghi trong WP5_HANDOFF) đưa vào
           ACCREC.
       - WP5-FIXD đã xong (worker, sonnet; tác giả tự báo).
         - Đã sửa F-01, F-02, A2-01, A2-02, cùng R-A2-1, R-A2-2/R-F1, R-F4, R-F5 và
           R-F6.
         - Ngoài handoff/ chỉ docs/11 EN và VI thay đổi, cộng thêm packet.
         - Parity và Grep đều sạch; verify trả 0. Digest 1b8ceae4 (779 tệp).
       - WP5-FIXD-FREEZE đã commit và push 9bcdd88 (197 đường dẫn; Grep bí mật ra 0;
         mọi kiểm tra trả 0).
       - WP5-REGATE: **PASS** trên 9bcdd88 (digest 1b8ceae4).
         - verify 1.759; e2e 145/bỏ qua 5; drill 208.
         - AC-13 đạt dưới múi giờ thật Asia/Tokyo và America/New_York, theo đúng múi giờ
           mà tiến trình tự báo.
         - Image `bd17d061…`.
         - Các dòng đã sửa đều giữ đúng.
         - Ghi nhận (Low): docs/11 mục 11, dòng 274, vẫn nói màn hình hiện "cờ" gửi.
       - WP5-FIXD2 đã xong. Chỉ câu đó (EN và VI) bị trúng, và đã được sửa. Rà docs/05,
         07, 12, README và packet đều sạch. Digest 150420e7.
       - WP5-FIXD2-FREEZE đã commit và push 014bd47 (46 đường dẫn; mọi kiểm tra trả 0).
       - WP5-REGATE2: **PASS** trên 014bd47 (digest 150420e7, 779 tệp).
         - Kể từ 9bcdd88, ngoài handoff/ chỉ docs/11 thay đổi: mỗi bản EN và VI một
           dòng.
         - Cả 230 tệp dist đều giống hệt; verify 1.759; AC-13 đạt.
         - Câu nói về cờ trạng thái: 0.
       - WP5-PKTID đã xong (lần 2).
         - Mục 0 và 6 của packet giờ ghi 014bd47, 150420e7 và image dev bd17d061 của
           9bcdd88.
         - Mục 3 và 5 được ghi chú nguồn 74d5bfe/WP5-GATE và việc phần chênh chỉ là tài
           liệu.
       - WP5-RECHECK: **PASS** trên 014bd47 (digest 150420e7), không có phát hiện.
         - F-01, F-02, A2-01 và A2-02 đều được kiểm trên app chạy thật và đã được giải
           quyết.
         - Các bản sửa rủi ro nhỏ chính xác, thông tin phiên bản trong packet đúng.
         - Rủi ro R-RC-1..6 chỉ là mục Info tùy chọn.
         - **Độ sẵn sàng phần mềm WP5 đã được nghiệm thu; pilot còn chờ.**
       - WP5-ACCREC đã xong.
         - Biên bản nghiệm thu trong WP5_HANDOFF (EN và VI) đã điền: 014bd47, 150420e7.
         - Đã sửa O-1: B-01 được ghi là Medium.
         - Parity và preflight đều đạt.
       - STATE ghi WP5 đã đạt. NEXT_ACTION (EN và VI) trỏ tới GOV-RECOVERY và việc chủ
         dự án duyệt pilot.
       - WP5-ACCEPT đã commit và push dd0c7d1 (74 đường dẫn handoff; Grep bí mật ra 0;
         mọi kiểm tra trả 0; không tạo tag). **WP5 đã nghiệm thu. Độ sẵn sàng phần mềm
         WP1–WP5 đã hoàn tất.**
       - GOV-RECOVERY-FIX đã xong (lần 2).
         - Các board giả lập tự đặt trạng thái riêng.
         - Probe `software_ready` mới: 1 trường hợp chấp nhận và 4 trường hợp từ chối.
         - Biến môi trường ghi đè mặc định trỏ về tệp thật.
         - Số probe tăng từ 82 lên 87, và bộ kiểm tra chạy đạt trên bản copy
           `software_ready`.
         - Digest source không đổi.
       - GOV-RECOVERY-FREEZE đã commit và push 7f750e9 (12 đường dẫn; 87 probe; mọi kiểm
         tra trả 0).
       - GOV-RECOVERY-GATE: **PASS** trên 7f750e9.
         - Phạm vi: chỉ check_recovery.py.
         - 87 probe đều đạt trên board thật và trên bản copy `software_ready`.
         - validate() chấp nhận bản copy. Các validator, preflight và digest không đổi.
       - GOV-RECOVERY-AUDIT: **PASS** trên 7f750e9, không có phát hiện. Đã đóng
         GOV-E8-AUDIT R1.
         - Bộ kiểm tra cũ fail trên bản copy `software_ready`; bộ mới thì đạt.
         - Giữ nguyên cả 82 probe cũ, thêm 5 probe mới.
         - Các đột biến validator V1–V6 đều bị bắt.
         - Rủi ro tùy chọn R1–R4 chuyển vào backlog quản trị.
       - GOV-RECOVERY-ACCEPT đã commit và push fe67f94, commit chốt: 39 đường dẫn, 87
         probe, Grep bí mật ra 0, mọi kiểm tra trả 0, không tạo tag.
       - Board giờ ở trạng thái `software_ready`.
         - `next_task_id` để trống, và phase là `complete-pilot-pending`.
         - Không còn task nào đang chạy hay đang chờ.
         - Thay đổi cuối cùng này của board chưa được commit.
       - **Trạng thái mission: độ sẵn sàng phần mềm WP1–WP5 đã hoàn tất. Pilot packet cụ
         thể đang chờ chủ dự án.**
       - Sau đó: commit đóng băng, chạy lại gate cho phần docs thay đổi, WP5-PKTID,
         WP5-RECHECK (auditor opus mới), ACCREC và ACCEPT.
       - Sau đó:
         - commit đóng băng;
         - chạy lại gate, đặt TZ ngay trong tiến trình (R-A2-3);
         - cập nhật thông tin phiên bản trong packet;
         - một lượt kiểm tra lại bằng auditor mới;
         - ACCREC và ACCEPT.
       - Sau đó:
         - WP5-AC13, một test tích hợp được commit (worker-high, sonnet), và commit
           đóng băng của nó;
         - WP5-REL, ghi chú phát hành và cài đặt, cùng phần bật, tắt và rollback trong
           runbook; commit đóng băng của nó là commit đóng băng cuối của package;
         - WP5-GATE;
         - WP5-PILOT;
         - đợt audit cuối, gồm kiểm tra lại mảng B và kiểm phần chênh của mảng A.
     - Backlog: R-A2, R-A6, R-A8, B-R2.
     - Câu hỏi còn mở cho chủ dự án: WP4-I-1..I-5 (đang áp dụng mặc định an toàn), và
       R-A3 (cách rollback) trước pilot WP5.
     - Chủ dự án đã trả lời: F-1..F-6 (theo khuyến nghị) và GOV-SKILL phương án B (đã gỡ
       skill readme-md).
     - Đã soạn sẵn để dùng khi cả hai PASS: brief WP3-ACCREC (biên bản nghiệm thu trong
       HANDOFF) và brief WP4-PLAN. Brief commit WP3-ACCEPT, STATE và NEXT_ACTION sẽ làm
       sau khi WP3-ACCREC xong.
  4. Một commit đóng băng, chạy lại toàn bộ gate.
  5. Hai đợt kiểm tra lại song song bằng auditor mới: A có gắn digest, và B+C.

  Brief đã sẵn: WP3-FIXC, WP3-REGATE, WP3-RECHECK-A và WP3-RECHECK-BC. Brief của
  WP3-FIX-FREEZE sẽ viết sau WP3-FIXC.
- Bước tiếp:
  1. Chủ dự án: duyệt `handoff/delivery/WP5_PILOT_PACKET.vi.md` và trả lời D-1..D-15.
     D-1, D-7, D-8 và D-13 cần có trước khi kích hoạt. Làm các bước NAS của chủ dự án.
  2. Chỉ resume một phiên coordinator khi câu trả lời đòi hỏi một vòng sửa, hoặc cho
     pilot đã được cho phép. Gửi thật và kích hoạt do chủ dự án quyết.
- Vướng mắc: hiện không có (ổ B: đã có chỗ cho attempt 2 của T06-FREEZE; có thể đầy lại).
  Rủi ro: bộ phân loại có thể chặn `git add` của committer;
  coordinator không lách qua lệnh chặn mà hỏi chủ dự án (tin nhắn duyệt nêu rõ hành động
  và rủi ro, hoặc tự commit bằng `git add -A`).
- Ràng buộc không đổi: chỉ dùng dữ liệu giả lập và mail dry-run; không gửi hay triển khai
  thật; không đổi billing, cài đặt toàn cục hay cài đặt quyền; commit chỉ qua
  timesheet-committer, trên main cho đến bản release đầu tiên; không amend, force-push hay
  tạo tag.
- Prompt tương ứng: handoff/prompts/ORCHESTRATE.md (WP3 theo WP3_IMPLEMENT.md sau commit
  nghiệm thu).

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). Board commit cuối trong git là bản khôi
  phục; toàn bộ lịch sử WP2 (task, các lần chạy, quyết định) nằm ở đó và trong git.
- Process còn sống: chỉ WP4-FIXB4-FREEZE (lần 1).
- Thư mục làm việc tạm (theo chủ dự án, 2026-10-05): `D:\.claude-tmp\timesheet\<task>`,
  nằm ngoài Dropbox. Các bản ghi trước ngày đó dùng `D:\timesheet-tmp\<task>`.
- Usage/reset: không quan sát được.
