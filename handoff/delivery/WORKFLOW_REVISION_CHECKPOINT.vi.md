# Checkpoint nhiệm vụ (bản sửa quy trình v2 hoàn tất; đang lập plan WP2)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Package và vai trò: WP2 (lập plan); coordinator. Model thật claude-opus-5-5 (chủ dự án
  chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: HEAD = origin/main = f32978fcc7dec9429f0aa544c4ee4ee26c14f798 (commit nghiệm
  thu WP1). Chưa commit: board, STATE, checkpoint này, kết quả/bằng chứng WP1-F01-ACCEPT,
  brief WP2-PLAN.
- Đã xong:
  - Bản sửa quy trình v2 đã nghiệm thu (WF-AUDIT3 PASS, `1a25275..6578df8`;
    [bàn giao](WORKFLOW_HANDOFF.vi.md)).
  - WP1 đã nghiệm thu (WP1-F01-GATE PASS, WP1-F01-AUDIT PASS tại 68bbb31 / c6e24381;
    [WP1_RECHECK](WP1_RECHECK.vi.md); commit nghiệm thu f32978f).
- Commit đã push trong phiên: fd77a87, c219d79, 6578df8, bfdc1a8 (quản trị); 68bbb31,
  f32978f (WP1).
- WP2-PLAN xong (opus): 13 task T01–T13 có commit đóng băng, một gate cuối package, hai
  audit theo mảng bằng opus mới, commit nghiệm thu; đã áp dụng mặc định thường quy E-1,
  E-4..E-7, E-9..E-13 (`coordinator_decisions` trên board); chờ chủ dự án quyết E-2, E-3,
  E-8 (`pending_owner_question`), cần trước T03, T05 và T09.
- Đang chạy: WP2-T01 (worker-high, sonnet): siết hợp đồng giờ nghỉ/Clock out.
- Còn lại: task WP2 → các commit đóng băng → gate cuối package → audit mới → nghiệm thu;
  rồi WP3, WP4, WP5 (WP5 bắt đầu bằng nghiệm thu độc lập); pilot packet cụ thể; pilot thật
  do chủ dự án quyết.
- Ràng buộc không đổi: dữ liệu giả lập, mail dry-run, không gửi/triển khai thật, không đổi
  billing/cài đặt toàn cục/cài đặt quyền.
- Bước tiếp: đối chiếu WP2-PLAN; đăng ký task WP2 trên board; chỉ hỏi chủ dự án các quyết
  định mà plan đánh dấu là mâu thuẫn trong tài liệu chuẩn.

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); board commit cuối trong git là bản khôi
  phục; checkpoint này.
- Nếu bị ngắt: đánh dấu task đang chạy là interrupted, kiểm report/bằng chứng và path sở
  hữu, xác nhận không còn writer chạy (giao việc kiểm tra), giao lại phần còn lại với
  attempt kế tiếp.
- Không quan sát được usage/reset.
