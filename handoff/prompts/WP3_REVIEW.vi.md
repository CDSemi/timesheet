# Review độc lập WP3 — PDF, sign-off và tự nộp

Người dùng chọn: **ChatGPT Work/Codex, GPT-6.1 Sol, High, tốc độ Standard**, subscription Business. Kiểm khả dụng/usage thật và dự phòng tài liệu 08. Cung cấp source đủ, baseline/commit, HANDOFF, bằng chứng test và docs này.

Review độc lập **WP3** theo [AGENTS](../../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Kiểm ranh giới transaction và gắn hash đã xem. Chèn crash sau có thể chấp nhận; không gửi lại mù/ghi sổ trùng. Kiểm không bịa signed_at, ảnh, tổng Chủ nhật, Unicode, GET an toàn và review muộn không đổi có delta 0.

Gate bắt buộc: AC-06–AC-10 và AC-14; race đến hạn/tay, ảnh tự động bật/tắt, gửi gián đoạn/chưa rõ, job trùng, tải riêng và bằng chứng PDF gồm hai Chủ nhật. Mọi gửi ở dry-run/capture.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao Claude bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP3_REVIEW.md](WP3_REVIEW.md); tiếng Anh là nguồn chuẩn.
