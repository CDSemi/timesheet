# Ví dụ cấu hình

[policy.example.json](policy.example.json) là ví dụ đặc tả, chưa phải cấu hình production nhập được. Triển khai form/API kiểm dữ liệu và ghi ánh xạ nếu khác. Mọi email dùng example.invalid; không có credential SMTP.

Tùy chọn tự nộp chưa ký là true nhưng gửi production false, outbound dry-run và kích hoạt null. Các điều khiển riêng này không cho phép gửi thật.

Vị trí nghỉ từ giờ vào là phút 120/240/390, dài 15/30/15. Vào 08:00 thì nghỉ 10:00/12:00/14:30; vào 09:00 thì 11:00/13:00/15:30. Xác nhận nghỉ thực hoặc không nghỉ; chưa biết để chờ.

[holidays.2026.example.json](holidays.2026.example.json) chép chín ngày công ty trong workbook mẫu tham chiếu, kèm dòng/hash nguồn. Không phải lịch pháp định hay bảo đảm năm sau. Tên Anh giữ nguồn; name_vi dịch chúng. Vẫn cần xem lại hằng năm.

Cấu hình sender/người nhận thật, tên, template và chữ ký riêng tư khi setup. Biến template lạ phải bị từ chối. Thư mẫu viết chung.

Bản dịch của [README.md](README.md); tiếng Anh là nguồn chuẩn.
