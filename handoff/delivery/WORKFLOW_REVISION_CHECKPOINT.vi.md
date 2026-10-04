# Checkpoint nhiệm vụ (WP2 đã nghiệm thu, đang lập plan WP3)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-04 UTC.

- Package và vai trò: WP3 (lập plan); coordinator. Model thật claude-opus-5-5 (chủ dự án
  chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = c289375a8d80c78ea9f3a9e54ff55a795f99ec7b (WP3-T07-FREEZE).
    Commit nghiệm thu WP2 là 3ead61e; mã nguồn WP2 được nghiệm thu là
    5fafeaee72509c6110a907458643bf7582dad81a.
  - Digest chính thức của gate gần nhất
    e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df (WP2-GATE4). Digest
    hiện tại của WP3 là 3f4a016d… (T07, committer đã đối chiếu; WP3 chưa có gate).
  - Chưa commit (chỉ trong handoff): board, checkpoint này, kết quả attempt 2 của
    T07-FREEZE, brief WP3-T05. Các file này vào commit đóng băng kế tiếp.
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
- Đang chạy: WP3-T05-FREEZE (committer).
- Bước tiếp:
  1. Ghi kết quả commit đóng băng T05; sau đó WP3-T06 (brief đã sẵn: bản sửa với quy tắc
     ghi OT lần đầu, R1, duyệt muộn, gửi lại); WP3-DOC sau khi chủ dự án trả lời F-Q.
  2. Sau đó các task WP3 kèm commit đóng băng, gate cuối package và audit mới; WP4; WP5
     (bắt đầu bằng nghiệm thu độc lập); pilot packet cụ thể. Pilot thật do chủ dự án
     quyết.
- Vướng mắc: không có. Rủi ro: bộ phân loại có thể chặn `git add` của committer;
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
- Process còn sống: chỉ WP3-T05-FREEZE.
- Usage/reset: không quan sát được.
