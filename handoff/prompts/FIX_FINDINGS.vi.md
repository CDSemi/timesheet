# Sửa phát hiện review đã chấp nhận

Thực hiện: subagent sửa được giao; coordinator chọn profile/model/effort theo độ khó ở tài liệu 08. Nhà cung cấp hỗ trợ nào cũng nhận được vai trò này bằng subscription hiện có. Giao source đủ, baseline/digest đã review, REVIEW và HANDOFF. Lưu checkpoint từng task; trả coordinator để auditor độc lập context mới kiểm lại.

Khi review đã nêu file, hàm, repro, cách sửa và test thì không cần plan riêng: tái hiện trước. Audit sửa size S có thể gồm gate (`gate_included`).

Theo AGENTS.md. Tái hiện từng lỗi chấp nhận, gắn ID quy tắc/AC rồi sửa phần liền mạch nhỏ nhất. Giữ việc không liên quan, lịch sử bất biến, quyền và phạm vi đã đạt. Thêm regression có ý nghĩa cho lỗi, không test chỉ lặp cách code.

Chạy kiểm phần ảnh hưởng và gate giai đoạn. Không làm giai đoạn sau, thiết kế lại kiến trúc đã chốt, đổi phí hay gửi tin thật. Nếu bằng chứng phủ định phát hiện, giải thích thay vì lờ đi.

Cập nhật HANDOFF Anh và bản dịch Việt với xử lý từng lỗi, file/commit, lệnh/kết quả, phần chưa xác minh và một bước review tiếp. Lưu CHECKPOINT nếu gián đoạn. Không gọi sửa đã được chấp nhận độc lập trước khi reviewer kiểm lại.

Bản dịch của [FIX_FINDINGS.md](FIX_FINDINGS.md); tiếng Anh là nguồn chuẩn.
