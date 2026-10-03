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
- WF-ACCEPT xong: commit nghiệm thu chỉ gồm record bfdc1a8bbfd0bcbd06511fd02212e111d300356d
  đã push (49 path trong handoff). Đang chạy: WP1-F01-FIX (worker-high, sonnet/high) trên
  baseline đó.
- Còn lại: WP1-F01-FIX → WP1-F01-FREEZE → WP1-F01-GATE (riêng, snapshot cuối package) →
  WP1-F01-AUDIT (opus mới) → WP1-F01-ACCEPT; chỉ PASS mới mở WP2; sau đó lộ trình WP2–WP5;
  pilot thật do chủ dự án quyết.
- Không đổi: WP1 FIX REQUIRED, F-01 chưa sửa, WP2 chưa bắt đầu; không gửi thật, triển
  khai, đổi billing, cài đặt toàn cục hay cài đặt quyền.
- WP1-F01-FIX xong (tác giả báo: 6 test hồi quy từ fail sang pass, verify 180/180, digest
  c6e24381…9c59 trước commit). WP1-F01-FREEZE (committer) đang chạy.
- WP1-F01-FREEZE xong ở attempt 2 (attempt 1 bị chặn vì dòng trống cuối file bằng chứng,
  tác giả đã chuẩn hóa): commit 68bbb31435543329b6c51f29703d9e2e7a4290bf đã push.
  WP1-F01-GATE (snapshot cuối package, export sạch) đang chạy.
- WP1-F01-GATE PASS trên 68bbb31 (export sạch): digest
  c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59 (= số worker trước
  commit); verify 180/180, fixtures 115/115, migration/cô lập 18/18, probe F-01A–D riêng đạt.
  WP1-F01-AUDIT (opus mới) đang chạy.
- WP1-F01-AUDIT (opus mới) PASS tại 68bbb31 / c6e24381: F-01 đã giải quyết (probe riêng
  68/68, 20 lỗi trên baseline trước khi sửa); phần Clock out chưa xác nhận chấp nhận được;
  ba rủi ro chuyển sang WP2 ([WP1_RECHECK](WP1_RECHECK.vi.md)). WP1 đã nghiệm thu: đã cập
  nhật STATE, NEXT_ACTION và ghi nhận nghiệm thu trong WP1_HANDOFF; WP1-F01-ACCEPT
  (committer) đang chạy.
- Bước tiếp: ghi SHA nghiệm thu WP1, chuyển package đang hoạt động sang WP2 và giao plan
  package WP2 (planner với override opus, lý do size_risk).

## Khôi phục điều phối

- Board: [ORCHESTRATION.json](ORCHESTRATION.json); board commit cuối trong git là bản khôi
  phục; checkpoint này.
- Nếu bị ngắt: đánh dấu task đang chạy là interrupted, kiểm report/bằng chứng và path sở
  hữu, xác nhận không còn writer chạy (giao việc kiểm tra), giao lại phần còn lại với
  attempt kế tiếp.
- Không quan sát được usage/reset.
