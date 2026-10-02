# Review độc lập WP5 — Nghiệm thu độc lập và pilot

Người dùng chọn: **ChatGPT Work/Codex, GPT-6.1 Sol, High, tốc độ Standard**, subscription Business. Kiểm khả dụng/usage thật và dự phòng tài liệu 08. Cung cấp source đủ, baseline/commit, HANDOFF, bằng chứng test và docs này.

Review độc lập **WP5** theo [AGENTS](../../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Chạy luồng hai tuần tích hợp, sửa, dùng OT một phần đã duyệt, cách ly user thứ hai và quá hạn/restart. Kiểm bằng chứng cũ thay vì tin tóm tắt. Đưa lỗi ưu tiên và độ sẵn sàng pilot cụ thể; không thiết kế lại hay khẳng định nhận thật thiếu bằng chứng.

Gate bắt buộc: AC-13 và mọi gate bắt buộc còn lại; bản phát hành đầy đủ lặp được, restore đã kiểm, không lỗi chặn toàn vẹn/riêng tư/nộp. Tách sẵn sàng phần mềm khỏi phép chủ và kết quả pilot production thật.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao Claude bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP5_REVIEW.md](WP5_REVIEW.md); tiếng Anh là nguồn chuẩn.
