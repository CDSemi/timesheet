# Checkpoint nhiệm vụ (WP2 tạm dừng chờ chủ dự án quyết định)

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Package và vai trò: WP2 (đang implement, tạm dừng); coordinator. Model thật
  claude-opus-5-5 (chủ dự án chọn; profile inherit); effort không quan sát được. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: HEAD = origin/main = 8930efee064ac84256b3f82b87005717a489d1b7 (commit đóng
  băng WP2-T02). Checkpoint này được commit bởi WP2-CKPT1.
- Đã xong:
  - Bản sửa quy trình v2 đã nghiệm thu (WF-AUDIT3 PASS, `1a25275..6578df8`;
    [bàn giao](WORKFLOW_HANDOFF.vi.md)).
  - WP1 đã nghiệm thu (kiểm tra lại độc lập PASS tại 68bbb31 / c6e24381; commit nghiệm thu
    f32978f).
  - WP2-PLAN ([plan](tasks/WP2-PLAN.md), 13 task).
  - WP2-T01 hợp đồng Clock out (đóng băng 396b399) và WP2-T02 lõi sổ OT (đóng băng
    8930efe). Cả hai do tác giả tự kiểm; gate cuối package và audit diễn ra sau T13.
- Commit đã push trong phiên: fd77a87, c219d79, 6578df8, bfdc1a8 (quản trị); 68bbb31,
  f32978f (WP1); 396b399, 8930efe (WP2).
- Vướng mắc: chờ chủ dự án quyết E-2 (nghỉ bù OT so với nhãn ngày), E-3 (khi nào trừ quỹ
  nghỉ bù) và E-8 (mục UI trong AGENTS so với CSS hiện có của repo). Xem
  `pending_owner_question` trên board. WP2-T03 cần E-2(b) và E-3; T05 cần E-2(a)(c); T09
  cần E-8. Chủ dự án có thể trả lời từng câu, hoặc nhắn "dùng đề xuất" để áp dụng đề xuất
  trong plan.
- Quyết định thường quy đã áp dụng: E-1, E-4..E-7, E-9..E-13 (`coordinator_decisions` trên
  board).
- Còn lại: WP2-T03..T13 kèm các commit đóng băng → gate cuối package → hai audit theo mảng
  bằng opus mới → nghiệm thu; rồi WP3, WP4, WP5 (bắt đầu bằng nghiệm thu độc lập); pilot
  packet cụ thể; pilot thật do chủ dự án quyết.
- Ràng buộc không đổi: dữ liệu giả lập, mail dry-run, không gửi hay triển khai thật, không
  đổi billing, cài đặt toàn cục hay cài đặt quyền.
- Bước tiếp: khi chủ dự án trả lời, ghi vào `owner_decisions` và brief T03, rồi giao
  WP2-T03 (worker-high, override opus novelty).

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); board commit cuối trong git là bản khôi
  phục; checkpoint này.
- Sau WP2-CKPT1 không task nào chạy. WP2-T03 bị chặn bởi các quyết định của chủ dự án.
- Không quan sát được usage/reset.
