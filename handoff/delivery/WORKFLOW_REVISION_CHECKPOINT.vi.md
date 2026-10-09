# Checkpoint nhiệm vụ (WP3 đã nghiệm thu; vòng GOV-SKILL và lập kế hoạch WP4)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-05 UTC.

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
- Đang chạy: WP5-UX-T03-FREEZE (committer; digest sau khi stage) trên gốc 5edc548.
- Bước kế tiếp: khi có kết quả freeze, ghi commit/push rồi viết brief WP5-UX-T04 (panel
  sửa ngày và bottom sheet; worker-high, opus, novelty).

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
