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
- WF-FREEZE xong: commit fd77a8717da9a1b2ea9ce13520d59b9df60f4716 đã push lên
  origin/main (60 path; precommit 0 chặn, 12 cảnh báo path hồ sơ người dùng). WF-GATE đang
  chạy trên commit này.
- WF-GATE PASS trên fd77a87: source digest
  03d4a6f986c93423903ea94ded9f58a7ca127c64dc6bcca1342f38a8b24f491b (trước = sau);
  verify 174 test, preflight 91 kịch bản, probe precommit chặn sáu đầu vào xấu.
  WF-AUDIT (auditor mới, profile opus/xhigh) đang chạy trên cùng commit/digest.
- WF-AUDIT (opus) FIX REQUIRED trên fd77a87: 3 Medium (mâu thuẫn sức mạnh auditor, task
  quản trị bị "stale" khi nằm dưới WP1, lỗ hổng precommit) và 7 Low; báo cáo
  [WORKFLOW_REVIEW](WORKFLOW_REVIEW.vi.md). WF-FIX1 (worker-high) đang chạy theo quyết định
  ràng buộc, gồm package GOV cho việc quản trị quy trình.
- WF-FIX1 xong (tác giả báo kiểm tra đạt; coordinator quyết định cho phép đúng địa chỉ
  `noreply@anthropic.com`). Task WF-* đã chuyển nhãn sang package GOV; chuỗi WP1-F01 lập
  lại (FIX → FREEZE → GATE → AUDIT → ACCEPT, record task tiếng Anh). WF-FREEZE2
  (committer) đang chạy.
- Bước tiếp: ghi SHA WF-FREEZE2; giao WF-GATE2, rồi WF-AUDIT2 mới.

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); bản khôi phục = board trong ffbf8f0
  (`git show HEAD:handoff/delivery/ORCHESTRATION.json`) cộng checkpoint này.
- Nếu bị ngắt: đánh dấu task đang chạy là interrupted, kiểm report/bằng chứng và path sở
  hữu, xác nhận không còn writer chạy, rồi giao lại phần còn lại với attempt kế tiếp.
  Effort của task pending trên board đã đặt sẵn theo profile mới.
- Không quan sát được usage/reset.
