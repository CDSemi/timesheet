# Triển khai WP4 — Docker, nhập và phục hồi

Người dùng chọn: **Claude Code, Sonnet 5.5, Medium**, đăng nhập Max hiện có. Kiểm model/usage và dự phòng tài liệu 08. Prompt không cấu hình client.

Triển khai **chỉ WP4**. Theo [AGENTS](../../AGENTS.md). Kiểm repo thật và bàn giao trước đã đạt trước khi sửa. Trao đổi tiếng Việt; code/comment và docs chuẩn tiếng Anh, tài liệu cho người đọc có bản dịch Việt tương ứng.

Đọc:
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Chỉ đọc thêm source/docs khi có dependency cụ thể. Dùng fixture giờ/OT liên quan và fixture sổ; bàn giao trước; không mặc định nạp mọi bản dịch hay binary workbook.

Phạm vi: Giao Docker/Compose ghim phiên bản, ví dụ cấu hình an toàn, runtime non-root lưu bền, bootstrap/migration/health, backup/restore nhất quán và runbook nâng/hạ. Làm workbook preview/commit có nguồn ô, hash, chống trùng/xung đột và số dư đầu rõ. Preview workbook mẫu trong repo với các sheet có ngày giả. Kiểm kiến trúc đích khi có; nếu không ghi NAS chưa test và đưa bước setup cụ thể.

Checkpoint gợi ý: (1) Image/cài dry-run và restore; (2) preview workbook/bàn giao vận hành nếu cần.

Gate bắt buộc: AC-11/12/15: cài mới, migration, restart giữ dữ liệu, backup lúc ghi, restore riêng đối chiếu hash/số dư, nhập lại không thêm và tắt outbound sau restore.

Thực hiện triển khai, không chỉ đề xuất. Gửi cục bộ ở dry-run/capture. Không đổi thanh toán, mua usage, chạy agent song song, mở host hay gửi tin thật. Tự quyết việc thường trong hợp đồng; báo mâu thuẫn yêu cầu thật.

Giao source/migration/test thay đổi đầy đủ, lệnh/kết quả đúng và [HANDOFF](../templates/HANDOFF.vi.md) có bản chuẩn Anh và .vi.md. Ghi baseline/commit, model/effort thật nếu thấy, path bằng chứng, hạn chế và một bước tiếp theo để review độc lập. Chưa chạy không là đạt. Nếu gián đoạn lưu [CHECKPOINT](../templates/CHECKPOINT.vi.md), tiếp tục giai đoạn này. Không bắt đầu WP5.

Bản dịch của [WP4_IMPLEMENT.md](WP4_IMPLEMENT.md); tiếng Anh là nguồn chuẩn.
