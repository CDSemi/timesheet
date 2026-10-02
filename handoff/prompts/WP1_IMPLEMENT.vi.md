# Triển khai WP1 — Nền tảng và bộ tính giờ

Người dùng chọn: **Claude Code, Sonnet 5.5, High**, đăng nhập Max hiện có. Kiểm model/usage và dự phòng tài liệu 08. Prompt không cấu hình client.

Triển khai **chỉ WP1**. Theo [AGENTS](../../AGENTS.md). Kiểm repo thật và giữ file sẵn có không liên quan trước khi sửa. Trao đổi tiếng Việt; code/comment và docs chuẩn tiếng Anh, tài liệu cho người đọc có bản dịch Việt tương ứng.

Đọc:
- [01_PRODUCT_REQUIREMENTS](../../docs/01_PRODUCT_REQUIREMENTS.md)
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Chỉ đọc thêm source/docs khi có dependency cụ thể. Dùng fixture giờ/OT liên quan và bàn giao trước; không mặc định nạp mọi bản dịch hay binary workbook.

Phạm vi: Tạo khung TypeScript strict/Hono/React, migration SQLite, login/session/quyền nội bộ an toàn, lịch/quy tắc có phiên bản, tạo kỳ và bộ tính giờ/OT production thuần. Có kiểm khoảng giờ, tham chiếu quy tắc lịch sử và lý do sửa cũ/hiện tại. Giao seed giả và test chạy được; chưa cần PDF/email cuối.

Checkpoint gợi ý: (1) Repo/schema/auth và bộ tính ngày; (2) khoảng giờ/múi giờ, tích hợp và bằng chứng.

Gate bắt buộc: Type check/build, migration trên SQLite mới, toàn bộ fixture giờ/OT, cách ly hai user tại endpoint đã làm. Kiểm rõ 09:00–18:00, biên N/M, phút ngày nghỉ, DST, cộng giây và ca đêm hỗn hợp.

Thực hiện triển khai, không chỉ đề xuất. Gửi cục bộ ở dry-run/capture. Không đổi thanh toán, mua usage, chạy agent song song, mở host hay gửi tin thật. Tự quyết việc thường trong hợp đồng; báo mâu thuẫn yêu cầu thật.

Giao source/migration/test thay đổi đầy đủ, lệnh/kết quả đúng và [HANDOFF](../templates/HANDOFF.vi.md) có bản chuẩn Anh và .vi.md. Ghi baseline/commit, model/effort thật nếu thấy, path bằng chứng, hạn chế và một bước tiếp theo để review độc lập. Chưa chạy không là đạt. Nếu gián đoạn lưu [CHECKPOINT](../templates/CHECKPOINT.vi.md), tiếp tục giai đoạn này. Không bắt đầu WP2.

Bản dịch của [WP1_IMPLEMENT.md](WP1_IMPLEMENT.md); tiếng Anh là nguồn chuẩn.
