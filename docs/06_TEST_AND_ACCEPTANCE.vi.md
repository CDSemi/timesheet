# Kế hoạch kiểm thử và nghiệm thu

Gói này là đặc tả, chưa có app chạy. Kiểm tra gói không chứng nhận hành vi ứng dụng. Chuyển [91 fixture](../fixtures/README.vi.md) thành test code production với kết quả kỳ vọng được xác lập độc lập.

## Gate bắt buộc

| ID | Bằng chứng cần | Giai đoạn |
|---|---|---|
| AC-01 | Hai user không xem/sửa giờ, sổ, PDF, chữ ký, token của nhau bằng đổi ID | WP1–WP3 |
| AC-02 | Fixture giờ/OT đạt: biên N/M, ngày nghỉ, vào linh hoạt, qua đêm, cộng giây, DST, khoảng sai | WP1 |
| AC-03 | Ghi/tiêu phép lặp và đồng thời không trùng sự kiện hay dùng trùng giữ chỗ | WP2/WP3 |
| AC-04 | Nháp hiện tại không lý do; cũ/đã chốt cần; giữ audit/lịch sử/quy tắc/PDF gốc | WP2/WP3 |
| AC-05 | Import lễ preview/kiểm ngày trùng/sai, giữ override và lịch sử đã chốt | WP2 |
| AC-06 | Sign-off cần tên/ảnh và gắn payload đã xem; sửa đồng thời gây xung đột | WP3 |
| AC-07 | Tự nộp bật/tắt, công bố chờ review và setting ảnh hoạt động đúng | WP3 |
| AC-08 | Restart trước/sau PDF và quanh lúc gửi giữ job; chưa rõ chấp nhận không tự gửi lại mù | WP3 |
| AC-09 | GET/scanner không ký; link auth và token nếu có từ chối cũ/lặp/sai chủ | WP3 |
| AC-10 | PDF đủ 14 ngày, tổng có hai Chủ nhật, ngày ký thật, Unicode, nhãn dài, ảnh vừa và ID revision | WP3 |
| AC-11 | Docker cài mới/restart/nâng cấp; backup nhất quán lúc ghi khôi phục DB/file/hash trong dry-run riêng | WP4 |
| AC-12 | Preview nhập workbook (mẫu trong repo điền sheet có ngày giả) báo lỗi nguồn; nhập lại giống hệt không thêm bản ghi/OT/sign-off/gửi | WP4 |
| AC-13 | Quy trình hai tuần đầu-cuối, sửa lịch sử, dùng OT một phần đã duyệt và quá hạn | WP5 |
| AC-14 | Lỗi sender/kênh hiện rõ, không lộ secret, capture đúng người nhận/nội dung/PDF | WP3/WP5 |
| AC-15 | Health/backup an toàn và rollback tương thích; bản restore tắt outbound | WP4/WP5 |

## Các lớp

Dùng test domain thuần, tích hợp SQLite thật, HTTP auth/version/CSRF và ít luồng browser có ý nghĩa. Test transaction sổ bằng binding đã chọn, không chỉ mock repo. Có đổi tám giờ chính xác (480), thiếu khác không giờ, nghỉ chưa biết, sửa lịch sử và hai ngày +20/+20 vẫn bằng không.

Dùng đồng hồ/múi giờ xác định, mail capture/chèn lỗi cục bộ. Tách từ chối, lỗi trước truyền, đã chấp nhận và chưa rõ. Giả lập hạn thay vì đợi ngày. Xem PDF cần render và kiểm trang; chỉ trích text chưa đủ. Mẫu giả phải có tên/lễ dài và giới hạn ảnh.

Bằng chứng vận hành gồm container mới chạy thật, migration, backup lúc có ghi, restore riêng và hash/số dư mẫu. Test NAS chưa có môi trường ghi chưa xác minh.

## Review và phát hành

Mỗi bàn giao có baseline/commit, lệnh, exit status, kết quả quan sát, đường dẫn bằng chứng và trường hợp chưa test. ChatGPT trả PASS / FIX REQUIRED / NOT VERIFIED cùng cách tái hiện và ID quy tắc/AC. Chặn đi tiếp nếu sai OT, lộ riêng tư, sổ trùng/mất, sign-off giả, mất revision, gửi lại mù sau chưa rõ hoặc không restore được. Kiểm lại phần ảnh hưởng và gate; không thêm test rộng trùng lặp khi không có rủi ro cụ thể.

WP5 chuẩn bị pilot cụ thể: URL/sender/người nhận thật, preview đúng thư/PDF, settings, kết quả backup/restore, điểm rollback. Chủ hệ thống cho phép mới gửi pilot/kích hoạt thật. Sẵn sàng phần mềm, phép của chủ, provider chấp nhận và người nhận thực nhận là các thông tin riêng. Thiếu môi trường thật thì ghi phần mềm sẵn sàng/pilot chờ. Sau pilot theo dõi một kỳ thật, có Excel để so.

Bản dịch của [06_TEST_AND_ACCEPTANCE.md](06_TEST_AND_ACCEPTANCE.md); tiếng Anh là nguồn chuẩn.
