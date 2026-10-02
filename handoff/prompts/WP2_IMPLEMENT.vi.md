# Triển khai WP2 — Không gian cá nhân và sổ OT

Người dùng chọn: **Claude Code, Sonnet 5.5, Medium**, đăng nhập Max hiện có. Kiểm model/usage và dự phòng tài liệu 08. Prompt không cấu hình client.

Triển khai **chỉ WP2**. Theo [AGENTS](../../AGENTS.md). Kiểm repo thật và bàn giao trước đã đạt trước khi sửa. Trao đổi tiếng Việt; code/comment và docs chuẩn tiếng Anh, tài liệu cho người đọc có bản dịch Việt tương ứng.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Chỉ đọc thêm source/docs khi có dependency cụ thể. Dùng fixture giờ/OT liên quan và fixture sổ; bàn giao trước; không mặc định nạp mọi bản dịch hay binary workbook.

Phạm vi: Làm màn hình mobile/hai tuần, sửa clock/nhập tay/nghỉ thực, phép một phần/loại ngày hàng loạt/WFH, settings, CSV lễ preview/import, quản trị user, lịch sử/audit và CSV/báo cáo OT. Làm service sổ/chênh lệch/giữ chỗ nguyên tử, ghi cho phép, tiêu/hủy/đảo một phần và thiếu số dư. WP3 nối chốt; không mở endpoint cộng tùy ý.

Checkpoint gợi ý: (1) Editor/settings/lịch; (2) sổ/phép/lịch sử/tích hợp; phiên thứ ba chỉ cho việc còn cụ thể.

Gate bắt buộc: Luồng browser chính; AC-01/03/04/05 cho service đã làm; giữ chỗ đồng thời; phép một phần; chênh lệch sửa; xuất bằng chứng an toàn; admin không xem mọi dữ liệu riêng.

Thực hiện triển khai, không chỉ đề xuất. Gửi cục bộ ở dry-run/capture. Không đổi thanh toán, mua usage, chạy agent song song, mở host hay gửi tin thật. Tự quyết việc thường trong hợp đồng; báo mâu thuẫn yêu cầu thật.

Giao source/migration/test thay đổi đầy đủ, lệnh/kết quả đúng và [HANDOFF](../templates/HANDOFF.vi.md) có bản chuẩn Anh và .vi.md. Ghi baseline/commit, model/effort thật nếu thấy, path bằng chứng, hạn chế và một bước tiếp theo để review độc lập. Chưa chạy không là đạt. Nếu gián đoạn lưu [CHECKPOINT](../templates/CHECKPOINT.vi.md), tiếp tục giai đoạn này. Không bắt đầu WP3.

Bản dịch của [WP2_IMPLEMENT.md](WP2_IMPLEMENT.md); tiếng Anh là nguồn chuẩn.
