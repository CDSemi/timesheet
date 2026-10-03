# Checkpoint sửa quy trình

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Ngày: 2026-10-02.

- Package và vai trò: package WP1 trên board, phase workflow-revision-implement;
  coordinator. Model thật claude-opus-5-5 (chủ dự án chọn; profile yêu cầu
  sonnet/medium); effort không quan sát được. Session 44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: HEAD ffbf8f0e1c4289ae4edc78ef9b5d3051f29384ed = origin/main. Thiết kế điều
  phối trước đã được commit và push trong ffbf8f0 (chưa từng audit độc lập). Chưa commit:
  board, checkpoint này, brief/report task WF.
- Quyết định chủ dự án 2026-10-02: coordinator tự chọn model/effort theo việc thật; tự
  commit/push thẳng main đến release đầu, sau đó dùng nhánh.
- Quyết định coordinator (`coordinator_decisions` trên board): định tuyến lai (profile =
  vai trò + effort, model chọn từng lần giao có lý do; expert/auditor opus/xhigh,
  verifier sonnet/medium, coordinator inherit; không fable/best/opusplan);
  timesheet-committer là người commit duy nhất, commit đóng băng/nghiệm thu và push sau
  mỗi commit; record task chỉ tiếng Anh; hủy WP1-F01-PLAN; audit sửa cỡ S có thể gộp gate.
- Đã xong: WF-REVIEW (planner, report A–F); WF-CAPS (tra cứu tài liệu);
  WF-IMPL-TOOLING (validator, 48 probe khôi phục, script precommit, chín profile; tác
  giả báo các kiểm tra đạt).
- BỊ CHẶN: WF-IMPL-DOCS attempt 1 đã sửa quy tắc 1 và 12 trong AGENTS.md/.vi.md, rồi bộ
  phân loại quyền auto-mode của client từ chối ghi quyền commit/push thường trực vào
  docs/08 ("Instruction Poisoning"). Task đã dừng; không lách. Chờ chủ dự án xác nhận
  trực tiếp trong chat (`pending_owner_question` trên board). Không task nào đang chạy;
  chưa có commit.
- Còn lại: WF-IMPL-DOCS → WF-GATE → WF-AUDIT (mới; tích lũy 1a25275..hiện tại) →
  committer commit nghiệm thu + push (khởi động lại trước nếu profile mới chưa được nhận)
  → WP1-F01-FIX → commit đóng băng → audit (gộp gate) → commit nghiệm thu.
- Không đổi: WP1 FIX REQUIRED, F-01 chưa sửa, WP2 chưa bắt đầu; không gửi thật, triển
  khai, đổi billing, cài đặt toàn cục hay cài đặt quyền.
- Chủ dự án đã xác nhận trực tiếp trong chat (nguyên văn ở `owner_decisions` trên board),
  kèm đồng ý dự phòng cho coordinator tự ghi các dòng quyền commit nếu vẫn bị chặn.
  WF-IMPL-DOCS attempt 2 đang chạy (writer duy nhất).
- WF-IMPL-DOCS attempt 2 xong (không bị chặn; kiểm tra của tác giả exit 0). WF-FREEZE
  (committer) đang chạy: commit đóng băng bản sửa v2 trên main và push; sau đó WF-GATE,
  WF-AUDIT.
- Bước tiếp: ghi SHA đóng băng/kết quả push; giao WF-GATE trên SHA đó.

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); bản khôi phục = board trong ffbf8f0
  (`git show HEAD:handoff/delivery/ORCHESTRATION.json`) cộng checkpoint này.
- Nếu bị ngắt: đánh dấu task đang chạy là interrupted, kiểm report/bằng chứng và path sở
  hữu, xác nhận không còn writer chạy, rồi giao lại phần còn lại với attempt kế tiếp.
  Effort của task pending trên board đã đặt sẵn theo profile mới.
- Không quan sát được usage/reset.
