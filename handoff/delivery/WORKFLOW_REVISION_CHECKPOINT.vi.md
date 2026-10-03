# Checkpoint sửa quy trình

Theo [CHECKPOINT](../templates/CHECKPOINT.vi.md). Cập nhật 2026-10-03 UTC (2026-10-02
America/Los_Angeles).

- Package và vai trò: WP1 (ứng dụng), package quản trị GOV vừa nghiệm thu; coordinator.
  Model thật claude-opus-5-5 (chủ dự án chọn; profile inherit); effort không quan sát
  được. Session 44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: HEAD = origin/main = 6578df8f81e8c0ead5ec09444b7bd8fa081d1ff7 (đóng băng quản
  trị lần 3, đã audit độc lập). Chưa commit: record GOV (kết quả và bằng chứng
  WF-FREEZE3/WF-GATE3/WF-AUDIT3, WORKFLOW_RECHECK2, WORKFLOW_HANDOFF), board, STATE,
  NEXT_ACTION, checkpoint này, brief WF-ACCEPT và WP1-F01-FIX.
- Đã xong: bản sửa quy trình v2 đã nghiệm thu. WF-AUDIT3 cho PASS với `1a25275..6578df8`
  ([WORKFLOW_RECHECK2](WORKFLOW_RECHECK2.vi.md), [bàn giao](WORKFLOW_HANDOFF.vi.md)). Các
  vòng trước là FIX REQUIRED (WF-AUDIT, WF-AUDIT2); cả hai đã được WF-FIX1 và WF-FIX2 sửa,
  trong đó WF-FIX2 nâng lên opus.
- Kiểm chứng gần nhất: WF-GATE3 PASS, digest
  2f50be649666c785f9fd3db99f67c6d9115ad75b3dda089c36fbfb8d460af7b3; WF-AUDIT3 PASS trên cùng
  commit/digest.
- Đang chạy: WF-ACCEPT (committer): commit nghiệm thu chỉ gồm record, rồi push.
- Còn lại: WP1-F01-FIX → WP1-F01-FREEZE → WP1-F01-GATE (riêng, snapshot cuối package) →
  WP1-F01-AUDIT (opus mới) → WP1-F01-ACCEPT; chỉ PASS mới mở WP2; sau đó lộ trình WP2–WP5;
  pilot thật do chủ dự án quyết.
- Không đổi: WP1 FIX REQUIRED, F-01 chưa sửa, WP2 chưa bắt đầu; không gửi thật, triển
  khai, đổi billing, cài đặt toàn cục hay cài đặt quyền.
- Bước tiếp: ghi SHA WF-ACCEPT, rồi giao WP1-F01-FIX (worker-high, sonnet).

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); board commit cuối trong git là bản khôi
  phục; checkpoint này.
- Nếu bị ngắt: đánh dấu task đang chạy là interrupted, kiểm report/bằng chứng và path sở
  hữu, xác nhận không còn writer chạy (giao việc kiểm tra), giao lại phần còn lại với
  attempt kế tiếp.
- Không quan sát được usage/reset.
