# Triển khai WP3 — PDF, sign-off và tự nộp

Thực hiện: subagent triển khai/sửa được coordinator giao; chọn profile/model/effort theo độ khó task ở tài liệu 08. ChatGPT/Codex cũng có thể nhận vai trò này. Dùng đăng nhập subscription hiện có.

Triển khai **chỉ WP3**. Theo [AGENTS](../../AGENTS.md). Kiểm repo thật và bàn giao trước đã đạt trước khi sửa. Trao đổi tiếng Việt; code/comment và docs chuẩn tiếng Anh, tài liệu cho người đọc có bản dịch Việt tương ứng.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Chỉ đọc thêm source/docs khi có dependency cụ thể. Dùng fixture giờ/OT liên quan và fixture sổ; bàn giao trước; không mặc định nạp mọi bản dịch hay binary workbook.

Phạm vi: Làm snapshot/hash bất biến, review/sign-off rõ, chốt sổ/outbox nguyên tử, báo cáo pdf-lib và ảnh ký riêng, template/người nhận, job/nhắc bền vững, tự động đến hạn, adapter capture/provider và lịch sử gửi. Bao phủ OT thiếu, chọn khoản thiếu, mốc kích hoạt, review muộn/sửa/gửi lại và SMTP chưa rõ. Deep link có login bắt buộc; magic link giới hạn tùy chọn, nếu làm phải đủ bảo vệ. Thêm chia sẻ timesheet do chủ cấp, bật/tắt từng mục, và ranh giới tình trạng cho admin.

Checkpoint gợi ý: (1) Snapshot/review/PDF/transaction sổ; (2) job/nhắc/adapter/phục hồi lỗi; (3) tích hợp/xem PDF còn lại nếu cần.

Gate bắt buộc: AC-06–AC-10 và AC-14; race đến hạn/tay, ảnh tự động bật/tắt, gửi gián đoạn/chưa rõ, job trùng, tải riêng và bằng chứng PDF gồm hai Chủ nhật; AC-16, dòng ghi chú và tùy chọn ảnh khi tự nộp, bản tự nộp gửi đi không dấu hiệu tự động, tự nộp kỳ chưa có dữ liệu và tình trạng admin không có chi tiết timesheet. Mọi gửi ở dry-run/capture.

Thực hiện triển khai, không chỉ đề xuất. Gửi cục bộ ở dry-run/capture. Không đổi thanh toán, mua usage, mở host hay gửi tin thật. Tự quyết việc thường trong hợp đồng; báo mâu thuẫn yêu cầu thật.

Giao source/migration/test thay đổi đầy đủ, lệnh/kết quả đúng và [HANDOFF](../templates/HANDOFF.vi.md) có bản chuẩn Anh và .vi.md. Ghi baseline/commit, model/effort thật nếu thấy, path bằng chứng, hạn chế và một bước tiếp theo để review độc lập. Chưa chạy không là đạt. Nếu gián đoạn lưu [CHECKPOINT](../templates/CHECKPOINT.vi.md), tiếp tục giai đoạn này. Không bắt đầu WP4.

Bản dịch của [WP3_IMPLEMENT.md](WP3_IMPLEMENT.md); tiếng Anh là nguồn chuẩn.

Ranh giới task: chỉ coordinator giao agent và chuyển giai đoạn. Lưu kết quả/checkpoint được giao sau mỗi bước liền mạch; không ghi state chung hoặc audit thay đổi của mình.
