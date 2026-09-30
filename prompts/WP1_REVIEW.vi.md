# Review độc lập WP1 — Nền tảng và bộ tính giờ

Người dùng chọn: **ChatGPT Work/Codex, GPT-6.1 Sol, High, tốc độ Standard**, subscription Business. Kiểm khả dụng/usage thật và dự phòng tài liệu 08. Cung cấp source đủ, baseline/commit, HANDOFF, bằng chứng test và docs này.

Review độc lập **WP1** theo [AGENTS](../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [01_PRODUCT_REQUIREMENTS](../docs/01_PRODUCT_REQUIREMENTS.md)
- [02_TIME_AND_OT_RULES](../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../docs/03_ARCHITECTURE_AND_DATA.md)
- [06_TEST_AND_ACCEPTANCE](../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Tính độc lập dư 30/31, 45/46, 75/76; ngày nghỉ 15/16; vào linh hoạt; nhiều phiên; nửa đêm/DST. Truy lời gọi bộ tính production, quyền, phiên bản và lý do.

Gate bắt buộc: Type check/build, migration trên SQLite mới, toàn bộ fixture giờ/OT, cách ly hai user tại endpoint đã làm. Kiểm rõ 09:00–18:00, biên N/M, phút ngày nghỉ, DST, cộng giây và ca đêm hỗn hợp.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao Claude bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP1_REVIEW.md](WP1_REVIEW.md); tiếng Anh là nguồn chuẩn.
