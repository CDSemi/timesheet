# Review độc lập WP3 — PDF, sign-off và tự nộp

Thực hiện: subagent audit độc lập context mới do coordinator giao; profile/model/effort theo tài liệu 08. Review ChatGPT/Codex tùy chọn cũng hợp lệ. Cung cấp source hiện tại đủ, baseline/digest, HANDOFF và bằng chứng. Auditor không được là tác giả thay đổi đang kiểm.

Review độc lập **WP3** theo [AGENTS](../../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Kiểm ranh giới transaction và gắn hash đã xem. Chèn crash sau có thể chấp nhận; không gửi lại mù/ghi sổ trùng. Kiểm không bịa signed_at, ảnh, tổng Chủ nhật, Unicode, GET an toàn và review muộn không đổi có delta 0.

Gate bắt buộc: AC-06–AC-10 và AC-14; race đến hạn/tay, ảnh tự động bật/tắt, gửi gián đoạn/chưa rõ, job trùng, tải riêng và bằng chứng PDF gồm hai Chủ nhật; AC-16, dòng ghi chú và tùy chọn ảnh khi tự nộp, bản tự nộp gửi đi không dấu hiệu tự động, tự nộp kỳ chưa có dữ liệu và tình trạng admin không có chi tiết timesheet. Mọi gửi ở dry-run/capture.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao coordinator để worker sửa có giới hạn bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP3_REVIEW.md](WP3_REVIEW.md); tiếng Anh là nguồn chuẩn.

Ranh giới audit: đóng băng source; ghi digest trước/sau và tách reviewer/tác giả. Tự chạy gate bắt buộc. Chỉ ghi path review/evidence mới được giao; giữ report cũ, không sửa source đang kiểm.
