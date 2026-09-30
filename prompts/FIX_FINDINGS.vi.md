# Sửa phát hiện review đã chấp nhận

Người dùng chọn Claude Code, model/effort cùng giai đoạn theo tài liệu 08, subscription hiện có. Giao source đầy đủ hiện tại, baseline đã review, REVIEW và HANDOFF.

Theo AGENTS.md. Tái hiện từng lỗi chấp nhận, gắn ID quy tắc/AC rồi sửa phần liền mạch nhỏ nhất. Giữ việc không liên quan, lịch sử bất biến, quyền và phạm vi đã đạt. Thêm regression có ý nghĩa cho lỗi, không test chỉ lặp cách code.

Chạy kiểm phần ảnh hưởng và gate giai đoạn. Không làm giai đoạn sau, thiết kế lại kiến trúc đã chốt, đổi phí hay gửi tin thật. Nếu bằng chứng phủ định phát hiện, giải thích thay vì lờ đi.

Cập nhật HANDOFF Anh và bản dịch Việt với xử lý từng lỗi, file/commit, lệnh/kết quả, phần chưa xác minh và một bước review tiếp. Lưu CHECKPOINT nếu gián đoạn. Không gọi sửa đã được chấp nhận độc lập trước khi reviewer kiểm lại.

Bản dịch của [FIX_FINDINGS.md](FIX_FINDINGS.md); tiếng Anh là nguồn chuẩn.
