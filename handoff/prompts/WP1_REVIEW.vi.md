# Review độc lập WP1 — Nền tảng và bộ tính giờ

Thực hiện: subagent audit độc lập context mới do coordinator giao; profile/model/effort theo tài liệu 08. Review ChatGPT/Codex tùy chọn cũng hợp lệ. Cung cấp source hiện tại đủ, baseline/digest, HANDOFF và bằng chứng. Auditor không được là tác giả thay đổi đang kiểm.

Review độc lập **WP1** theo [AGENTS](../../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [01_PRODUCT_REQUIREMENTS](../../docs/01_PRODUCT_REQUIREMENTS.md)
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Tính độc lập dư 30/31, 45/46, 75/76; ngày nghỉ 15/16; vào linh hoạt; nhiều phiên; nửa đêm/DST. Truy lời gọi bộ tính production, quyền, phiên bản và lý do.

Gate bắt buộc: Type check/build, migration trên SQLite mới, toàn bộ fixture giờ/OT, cách ly hai user tại endpoint đã làm. Kiểm rõ 09:00–18:00, biên N/M, phút ngày nghỉ, DST, cộng giây và ca đêm hỗn hợp.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao coordinator để worker sửa có giới hạn bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP1_REVIEW.md](WP1_REVIEW.md); tiếng Anh là nguồn chuẩn.

Ranh giới audit: đóng băng source; ghi digest trước/sau và tách reviewer/tác giả. Tự chạy gate bắt buộc. Chỉ ghi path review/evidence mới được giao; giữ report cũ, không sửa source đang kiểm.
