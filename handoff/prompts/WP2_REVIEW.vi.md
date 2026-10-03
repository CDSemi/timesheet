# Review độc lập WP2 — Không gian cá nhân và sổ OT

Thực hiện: subagent audit độc lập context mới do coordinator giao; profile/model/effort theo tài liệu 08. Review ChatGPT/Codex tùy chọn cũng hợp lệ. Cung cấp source hiện tại đủ, baseline/digest, HANDOFF và bằng chứng. Auditor không được là tác giả thay đổi đang kiểm.

Review độc lập **WP2** theo [AGENTS](../../AGENTS.md). Trao đổi tiếng Việt; tạo REVIEW tiếng Anh kèm bản dịch Việt. Không tin báo đạt thiếu bằng chứng, làm lại giai đoạn hay mở lại kiến trúc đã chốt.

Đọc:
- [02_TIME_AND_OT_RULES](../../docs/02_TIME_AND_OT_RULES.md)
- [03_ARCHITECTURE_AND_DATA](../../docs/03_ARCHITECTURE_AND_DATA.md)
- [04_UX_AND_SETTINGS](../../docs/04_UX_AND_SETTINGS.md)
- [06_TEST_AND_ACCEPTANCE](../../docs/06_TEST_AND_ACCEPTANCE.md)
- [09_IMPLEMENTATION_ROADMAP](../../docs/09_IMPLEMENTATION_ROADMAP.md)

Trọng tâm: Truy số gốc/tạm/đã ghi/giữ/khả dụng. Kiểm đổi phép 480 phút, đổi nhãn không tiêu, không giữ/tiêu trùng, chênh lệch sửa, lý do và giữ override lễ.

Gate bắt buộc: Luồng browser chính; AC-01/03/04/05 cho service đã làm; giữ chỗ đồng thời; phép một phần; chênh lệch sửa; xuất bằng chứng an toàn; admin không xem mọi dữ liệu riêng.

Kiểm trạng thái repo/bàn giao, truy hành vi quan trọng qua code production/lưu trữ thật, chạy kiểm có ý nghĩa bằng dữ liệu giả/capture cục bộ. Ghi lệnh, exit status, kết quả và phần chặn/chưa chạy. Thiếu source/base hoặc môi trường chạy là NOT VERIFIED, không phải đạt.

Trả [REVIEW](../templates/REVIEW.vi.md): PASS / FIX REQUIRED / NOT VERIFIED, baseline đã kiểm chính xác, lỗi ưu tiên, file/hàm, cách tái hiện, kỳ vọng/thực tế, ID quy tắc/AC và sửa có phạm vi. Tách lỗi quan sát được với rủi ro/đề xuất tùy chọn. Không bịa lỗi cho đủ số lượng.

Không sửa production, gửi email, đổi thanh toán hay làm giai đoạn sau. Lỗi giao coordinator để worker sửa có giới hạn bằng [FIX_FINDINGS](FIX_FINDINGS.vi.md); nếu đạt chỉ bước lộ trình tiếp theo. Khi nghiệm thu cuối, tách sẵn sàng phần mềm, phép chủ và kết quả pilot thật.

Bản dịch của [WP2_REVIEW.md](WP2_REVIEW.md); tiếng Anh là nguồn chuẩn.

Ranh giới audit: đóng băng source; ghi digest trước/sau và tách reviewer/tác giả. Tự chạy gate bắt buộc. Chỉ ghi path review/evidence mới được giao; giữ report cũ, không sửa source đang kiểm.
