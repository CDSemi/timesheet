# Checkpoint nhiệm vụ (nghiệm thu WP2, tiếp theo WP3)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-04 UTC.

- Package và vai trò: WP2 (nghiệm thu); coordinator. Model thật claude-opus-5-5 (chủ dự án
  chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = 5fafeaee72509c6110a907458643bf7582dad81a (WP2-FIXB3-FREEZE, mã
    nguồn WP2 được nghiệm thu).
  - Digest mã nguồn chính thức e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df
    (WP2-GATE4).
  - Chưa commit (chỉ trong handoff): board, STATE, NEXT_ACTION, checkpoint này, các record
    WP2-GATE4, WP2-AUDIT-A2 (lần 3), WP2-AUDIT-B4 và WP2-ACCREC, báo cáo
    WP2_RECHECK_A4/B4 cùng bằng chứng, và record nghiệm thu trong WP2_HANDOFF. Task commit
    WP2-ACCEPT sẽ đóng băng các file này.
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
- Đang chạy: WP2-ACCEPT (committer) commit các record nghiệm thu.
- Bước tiếp:
  1. Ghi kết quả WP2-ACCEPT (SHA commit, push).
  2. Chuyển board sang WP3 và giao lập plan package WP3 (planner opus) từ
     [lộ trình](../../docs/09_IMPLEMENTATION_ROADMAP.vi.md) và
     [WP3_IMPLEMENT](../prompts/WP3_IMPLEMENT.vi.md), kèm các mục chuyển tiếp ở trên.
  3. Sau đó các task WP3 kèm commit đóng băng, gate cuối package và audit mới; WP4; WP5
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
- Process còn sống: chỉ WP2-ACCEPT.
- Usage/reset: không quan sát được.
