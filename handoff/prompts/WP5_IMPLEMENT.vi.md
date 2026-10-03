# Triển khai WP5 — Nghiệm thu độc lập và pilot

Thực hiện: subagent triển khai/sửa được coordinator giao; chọn profile/model/effort theo độ khó task ở tài liệu 08. ChatGPT/Codex cũng có thể nhận vai trò này. Dùng đăng nhập subscription hiện có.

Triển khai **chỉ WP5**. Theo [AGENTS](../../AGENTS.md). Kiểm repo thật và bàn giao trước đã đạt trước khi sửa. Trao đổi tiếng Việt; code/comment và docs chuẩn tiếng Anh, tài liệu cho người đọc có bản dịch Việt tương ứng.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Chỉ đọc thêm source/docs khi có dependency cụ thể. Dùng fixture giờ/OT liên quan và fixture sổ; bàn giao trước; không mặc định nạp mọi bản dịch hay binary workbook.

Phạm vi: Bắt đầu từ bản ứng viên WP1–WP4 đã đạt và lỗi review WP5. Tái hiện/sửa lỗi chấp nhận với regression có phạm vi; giữ phạm vi/lịch sử đã đạt. Chuẩn bị ghi chú phát hành/setup song ngữ và pilot chính xác (URL, sender/người nhận, thư/PDF, settings, bằng chứng restore, rollback). Nếu chưa có đánh giá độc lập ghi đang chờ, không bịa đạt. Không triển khai/gửi thật nếu chưa có phép chủ.

Checkpoint gợi ý: Auditor mới đánh giá trước; worker được giao sửa; auditor độc lập kiểm lại; chủ hệ thống xem pilot cụ thể.

Gate bắt buộc: AC-13 và mọi gate bắt buộc còn lại; bản phát hành đầy đủ lặp được, restore đã kiểm, không lỗi chặn toàn vẹn/riêng tư/nộp. Tách sẵn sàng phần mềm khỏi phép chủ và kết quả pilot production thật.

Thực hiện triển khai, không chỉ đề xuất. Gửi cục bộ ở dry-run/capture. Không đổi thanh toán, mua usage, mở host hay gửi tin thật. Tự quyết việc thường trong hợp đồng; báo mâu thuẫn yêu cầu thật.

Giao source/migration/test thay đổi đầy đủ, lệnh/kết quả đúng và [HANDOFF](../templates/HANDOFF.vi.md) có bản chuẩn Anh và .vi.md. Ghi baseline/commit, model/effort thật nếu thấy, path bằng chứng, hạn chế và một bước tiếp theo để review độc lập. Chưa chạy không là đạt. Nếu gián đoạn lưu [CHECKPOINT](../templates/CHECKPOINT.vi.md), tiếp tục giai đoạn này. Sau nghiệm thu giao pilot cụ thể cho chủ hệ thống cho phép.

Bản dịch của [WP5_IMPLEMENT.md](WP5_IMPLEMENT.md); tiếng Anh là nguồn chuẩn.

Ranh giới task: chỉ coordinator giao agent và chuyển giai đoạn. Lưu kết quả/checkpoint được giao sau mỗi bước liền mạch; không ghi state chung hoặc audit thay đổi của mình.
