# Checkpoint nhiệm vụ (WP2 đã nghiệm thu, đang lập plan WP3)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-04 UTC.

- Package và vai trò: WP3 (lập plan); coordinator. Model thật claude-opus-5-5 (chủ dự án
  chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = c3c35de41ee5c1afff0e602601bdb27bb0a19bc1 (WP3-T13B-FREEZE).
    Commit nghiệm thu WP2 là 3ead61e; mã nguồn WP2 được nghiệm thu là
    5fafeaee72509c6110a907458643bf7582dad81a.
  - Digest chính thức của gate gần nhất
    e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df (WP2-GATE4). Digest
    hiện tại của WP3 là f3df3b86… (T13B, committer đã đối chiếu; WP3 chưa có gate).
  - Chưa commit (chỉ trong handoff): board, checkpoint này, kết quả và bằng chứng của
    T13B-FREEZE.
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
- Đang chạy: WP3-T13C-FREEZE (committer).
- Bước tiếp:
  1. Ghi kết quả commit đóng băng T13C; rồi T14 (brief đã sẵn), T15 (brief đã sẵn),
     WP3-GATE và các audit.
  2. Sau đó các task WP3 kèm commit đóng băng, gate cuối package và audit mới; WP4; WP5
     (bắt đầu bằng nghiệm thu độc lập); pilot packet cụ thể. Pilot thật do chủ dự án
     quyết.
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
- Process còn sống: chỉ WP3-T13C-FREEZE.
- Usage/reset: không quan sát được.
