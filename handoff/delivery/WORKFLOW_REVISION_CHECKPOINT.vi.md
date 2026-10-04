# Checkpoint nhiệm vụ (WP2 đã nghiệm thu, đang lập plan WP3)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-04 UTC.

- Package và vai trò: WP3 (lập plan); coordinator. Model thật claude-opus-5-5 (chủ dự án
  chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = ac5d0babf4e10d823f54a74db9248ddb84994958 (WP3-T01-FREEZE).
    Commit nghiệm thu WP2 là 3ead61e; mã nguồn WP2 được nghiệm thu là
    5fafeaee72509c6110a907458643bf7582dad81a.
  - Digest chính thức của gate gần nhất
    e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df (WP2-GATE4). Digest
    hiện tại của WP3 là 3c6a10c1… (T01, tác giả tự báo; WP3 chưa có gate).
  - Chưa commit (chỉ trong handoff): board, checkpoint này, kết quả và bằng chứng của
    T01-FREEZE. Các file này vào commit đóng băng kế tiếp.
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
- Đang chạy: WP3-T02-FREEZE (committer).
- Bước tiếp:
  1. Ghi kết quả commit đóng băng T02; sau đó WP3-T03 (cài đặt nộp, người nhận, mẫu
     email; brief đã sẵn).
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
- Process còn sống: chỉ WP3-T02-FREEZE.
- Usage/reset: không quan sát được.
