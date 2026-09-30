# Review độc lập WP4 — Docker, nhập và phục hồi

Người dùng chọn: **ChatGPT Work/Codex, GPT-6.1 Sol, High, tốc độ Standard**, subscription Business. Kiểm khả dụng/usage thật và dự phòng tài liệu 08. Cung cấp source đủ, baseline/commit, HANDOFF, bằng chứng test và docs này.

Review độc lập **WP4** theo [AGENTS](../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [03_ARCHITECTURE_AND_DATA](../docs/03_ARCHITECTURE_AND_DATA.md)
- [05_SUBMISSION_AND_NOTIFICATIONS](../docs/05_SUBMISSION_AND_NOTIFICATIONS.md)
- [06_TEST_AND_ACCEPTANCE](../docs/06_TEST_AND_ACCEPTANCE.md)
- [07_DEPLOYMENT_AND_OPERATIONS](../docs/07_DEPLOYMENT_AND_OPERATIONS.md)
- [09_IMPLEMENTATION_ROADMAP](../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Kiểm volume/quyền/secret thật, backup nhất quán WAL, tương thích migration và restore riêng. Công thức/TODAY/lịch sử trống không thành số dư/sign-off/đã gửi có thẩm quyền; kỳ nhập không tự gửi.

Gate bắt buộc: AC-11/12/15: cài mới, migration, restart giữ dữ liệu, backup lúc ghi, restore riêng đối chiếu hash/số dư, nhập lại không thêm và tắt outbound sau restore.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao Claude bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP4_REVIEW.md](WP4_REVIEW.md); tiếng Anh là nguồn chuẩn.
