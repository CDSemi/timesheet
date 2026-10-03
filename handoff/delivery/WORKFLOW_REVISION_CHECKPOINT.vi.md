# Checkpoint nhiệm vụ (đang triển khai WP2)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Package và vai trò: WP2 (đang triển khai); coordinator. Model thật claude-opus-5-5
  (chủ dự án chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: nhánh main.
  - HEAD = origin/main = a0f06f5a3c9c6639bcd1ec79519d9bfc139bf8a6, commit đóng băng
    WP2-T07.
  - Digest mã nguồn 705d78fd06b9f0db85edb8f3545821cfa5481b745b3c6bd43ebf62994bf954c5
    (tác giả tự báo).
  - Chưa commit: WP2-T08 (digest mã nguồn
    95b5291b0a893312bab01791265739d2e094ffe8b61b0bab5cc423781de0b061, tác giả tự báo),
    bằng chứng của T07-FREEZE, brief CALFIX, board và checkpoint này. WP2-T08-FREEZE sẽ
    commit chúng.
  - Không có commit chưa push.
- Đã xong:
  - Quản trị:
    - Bản sửa quy trình v2 đã nghiệm thu (WF-AUDIT3 PASS, `1a25275..6578df8`;
      [bàn giao](WORKFLOW_HANDOFF.vi.md)).
    - GOV-E8 đã nghiệm thu (GOV-E8-AUDIT PASS trên ed92cb7;
      [báo cáo](GOV_E8_REVIEW.vi.md)).
  - WP1 đã nghiệm thu (kiểm tra lại PASS tại 68bbb31 / c6e24381; commit nghiệm thu
    f32978f).
  - Đã áp dụng quyết định E-2, E-3 và E-8 của chủ dự án ("dùng đề xuất"); commit quyết định
    393779d.
  - Các commit đóng băng WP2 đến nay:
    - T01: 396b399.
    - T02: 8930efe.
    - T03: 67c7e7a; đã chứng minh xử lý đồng thời.
    - T04: e92add0, kèm `.gitattributes` bỏ kiểm tra khoảng trắng cho bằng chứng.
  - Kiểm tra tư vấn sổ OT:
    - WP2-ADV-GATE PASS trên e92add0 (export sạch; chạy đồng thời x5).
    - WP2-ADV-REVIEW (opus mới): FINDINGS ADV-A-01..04 mức Low và ADV-A-05 mức Info
      ([báo cáo](WP2_ADV_LEDGER_REVIEW.vi.md)).
    - WP2-ADVFIX đã sửa ADV-A-01..04 (tác giả tự báo; verify 344 test).
  - WP2-T05 (không gian làm việc theo ngày) xong: migration 0003; tác giả tự báo verify
    387 test.
- Lần kiểm tra gần nhất: worker WP2-T05 chạy hai lệnh trên Node v24.21.0; cả hai là kết
  quả tác giả tự báo, chưa kiểm độc lập.
  - `npm run verify`: exit 0, 387 test.
  - `npm run digest`: exit 0.
- WP2-T06 (xem trước chính sách cá nhân) đã xong: tác giả tự báo verify 414 test.
  Committer đã đóng băng ở 1970536 mà không bị bộ phân loại chặn.
- WP2-T07 (quản trị người dùng) đã xong: tác giả tự báo verify 448 test, 5 mutation đều bị
  test phát hiện. Committer đã đóng băng ở a0f06f5.
- WP2-T08 (quản trị lịch) đã xong: tác giả tự báo verify 514 test, 11 mutation đều bị test
  phát hiện. Đang chạy WP2-T08-FREEZE (committer).
  - Phát hiện: việc admin đổi `calendar_id` (WP2-T07) làm gom lại kỳ nháp của người dùng,
    làm các bảng giờ hiện có bị mồ côi và che mất trạng thái đã chốt.
  - WP2-CALFIX sẽ từ chối việc đổi lịch khi người dùng đã có dữ liệu. Đây là quyết định
    của coordinator, chủ dự án có thể đảo lại; đổi lịch theo hướng chỉ áp dụng về sau là
    phương án để chủ dự án chọn sau.
- WP2-T05-FREEZE đã xong (hai commit của chủ dự án, e768b71 và a8a5890). Diễn biến của
  commit đóng băng:
  - Attempt 1 bị chặn. Bộ phân loại quyền của auto mode từ chối lệnh stage/kiểm tra với
    lý do "Credential Leakage". Không lệnh nào chạy và chưa có commit.
  - WP2-T05-PRIVSCAN (chỉ đọc) xác nhận bộ file sạch: không có thông tin đăng nhập hay dữ
    liệu cá nhân thật, không có dòng nào bị precommit chặn.
  - Chủ dự án đã xác nhận trực tiếp ngày 2026-10-03 (`owner_decisions` trên board).
    Attempt 2 trích nguyên văn lời xác nhận đó, nhưng bộ phân loại vẫn từ chối lệnh
    `git add` chạy riêng ("Credential Leakage"). Chưa có commit.
  - WF-CAPS2 (tra tài liệu, chỉ đọc) đã xong; kết quả nằm trong `auxiliary_lookups` trên
    board.
    - Tin nhắn của người dùng nêu rõ hành động và rủi ro cụ thể có thể gỡ một lần chặn.
    - Bộ phân loại chỉ đọc `autoMode` từ cài đặt người dùng hoặc cài đặt được quản lý,
      không đọc từ cài đặt của dự án.
  - Chủ dự án đã tự commit và push ("tôi đã commit xong, tiếp tục đi"). WP2-T05-RECON
    phát hiện commit e768b71c2a5e522bdfece8617599992f8f4a0abc (cha e92add0) chỉ chứa 23
    đường dẫn đã theo dõi có thay đổi.
    - Message của commit là Commit description trong chat của coordinator.
    - Mọi file mới vẫn chưa được theo dõi: migration 0003, dayEntries.ts, các test mới,
      báo cáo review tư vấn, brief và bằng chứng.
    - Vì vậy main đang tham chiếu tới các file chưa có trong git.
    - Digest khớp T05; validator và check_recovery exit 0.
  - Commit bổ sung a8a5890 của chủ dự án đã thêm các file mới. WP2-T05-RECON2 xác nhận:
    - hai commit cộng lại đúng bằng bộ file dự kiến;
    - cây HEAD có đủ các file mã nguồn và test mới;
    - không còn file nào sót;
    - digest khớp;
    - validator và check_recovery exit 0.
- Còn lại:
  - WP2-CALFIX, rồi WP2-T09..T13, mỗi task kèm commit đóng băng
    ([plan](tasks/WP2-PLAN.md)).
  - Gate cuối package: export sạch, nâng cấp WP1→WP2, chạy đồng thời 20 lần và các luồng
    trình duyệt.
  - Hai audit bằng opus mới:
    - AUDIT-A: sổ OT và quyền riêng tư, tập trung vào thay đổi từ sau lần review tư vấn.
    - AUDIT-B: không gian làm việc, quản trị, UI và tích hợp.
  - Nghiệm thu WP2.
  - Sau đó WP3, WP4 và WP5 (WP5 bắt đầu bằng nghiệm thu độc lập), rồi pilot packet cụ
    thể. Pilot thật do chủ dự án quyết.
- Vướng mắc: không có. Rủi ro: bộ phân loại có thể lại chặn `git add` của committer ở các
  commit đóng băng sau. Coordinator không đổi cài đặt quyền và không lách qua lệnh
  chặn. Các phương án: chủ dự án nhắn duyệt nêu rõ hành động và rủi ro, tự commit, hoặc tự
  cấu hình `autoMode` trong cài đặt người dùng. Có thể gộp các commit đóng băng để giảm số
  lần gián đoạn.
- Ghi chú chuyển tiếp:
  - WP3 phải xử lý biến thể 'pending' của `CorrectionResult` và lưu các khoản trừ đang chờ.
  - OT tạm tính chỉ tính cho ngày có phiên làm việc (T04/T05), và bước chốt sổ ở WP3 phải
    bỏ các số tạm tính.
  - WP2-T06 tạo một vòng import ở mức hàm giữa policies.ts và timesheets.ts. AUDIT-B nên
    đánh giá điểm này.
  - Đổi lịch của người dùng ở WP2-T07: WP2-T08 đã xác nhận là có lỗi, WP2-CALFIX sẽ
    sửa. AUDIT-B kiểm tra lại.
  - Ghi chú thiết kế của WP2-T08 cho AUDIT-B:
    - các bước từ chối khi lưu chạy trước bước so hash, nên một yêu cầu giống hệt gửi lại
      sau khi mốc đã dời sẽ nhận `retroactive_change`;
    - lịch chưa có phiên bản nào sẽ bị từ chối.
  - Backlog quản trị vẫn để gộp vào một đợt GOV sau: R1 (check_recovery thừa hưởng trạng
    thái thật; sửa trước software_ready), R2 (mục 2 của AGENTS.vi), giới hạn của
    precommit và ADV-A-05.
- Ràng buộc không đổi:
  - Chỉ dùng dữ liệu giả lập và mail dry-run. Không gửi hay triển khai thật, không đổi
    billing, cài đặt toàn cục hay cài đặt quyền.
  - Commit chỉ qua timesheet-committer, trên main cho đến bản release đầu tiên. Không
    amend, force-push hay tạo tag.
- Bước tiếp: ghi kết quả WP2-T08-FREEZE, rồi giao WP2-CALFIX (brief sẵn).
  - Committer chạy quy trình bình thường một lần.
  - Nếu bộ phân loại chặn, coordinator dừng và xin chủ dự án một tin nhắn duyệt nêu rõ
    hành động và rủi ro, hoặc một commit tay. Khi đó Commit description trong chat sẽ
    đúng là message dự định và nhấn mạnh các file mới.
- Prompt tương ứng: handoff/prompts/ORCHESTRATE.md (WP2 theo WP2_IMPLEMENT.md).

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). Board commit cuối trong git là bản khôi
  phục.
- Đang chạy: WP2-T08-FREEZE (committer). WP2-CALFIX chờ task này.
- Process còn sống: không biết có process nào ngoài committer. Các worker và committer
  trước đều báo không còn process nào.
- Digest gần nhất: 809215583… (tác giả tự báo). Chưa có audit package WP2 nào chạy.
- Usage/reset: không quan sát được.
