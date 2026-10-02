# Fixture nghiệm thu

Đây là ví dụ kỳ vọng độc lập để viết test code production, không phải app đang chạy.

| File | Tình huống có ID |
|---|---:|
| [overtime_cases.json](overtime_cases.json) | 33 |
| [time_cases.json](time_cases.json) | 32 |
| [ledger_cases.json](ledger_cases.json) | 26 (16 thiếu giờ + 10 sổ) |
| Tổng | **91** |

Gộp mặc định file với từng trường hợp; trường hợp ưu tiên. Đơn vị phút nguyên; UTC kết thúc Z. Null là chưa biết, không phải không giờ. Chuỗi lỗi là nhóm ý nghĩa; ánh xạ sang mã API có tài liệu nếu cần. Giữ ID trong test/bàn giao. Khóa/enum JSON Anh là hợp đồng máy; hướng dẫn đi cặp giải thích hai ngôn ngữ.

Đầu vào OT đã tổng hợp R/O. Đủ điều kiện là trước làm tròn; credit còn tạm tới chốt. OT-21 cộng đủ điều kiện 45+15 rồi tròn một lần thành 60. OT-22 không kích hoạt dư thường 20, chỉ còn 16 ngoài lịch, ghi 30. OT-29 chứng minh các ngày riêng không gộp để vượt N.

Thời gian trừ nghỉ loại trừ đã xác nhận. Trường hợp đầy đủ mặc định đã xác nhận nghỉ; danh sách rỗng nghĩa xác nhận không nghỉ. TM-32 ghi đè xác nhận và để chờ. TM-01 là 09:00–18:00. TM-07/TM-08 qua nửa đêm gồm nghỉ bị chia. TM-10 cộng 510 phút 80 giây thành 511 phút nguyên. TM-16 từ chối khoảng mất giờ DST, TM-17 cần chọn fold, TM-18/TM-19 xác định hai thời điểm. TM-20/TM-21 tính UTC trôi qua. TM-25–TM-28 phân biệt sửa cũ/hiện tại/đã chốt. TM-29 giữ thứ Ba Off cá nhân thuộc lịch thường.

Mặc định thiếu giờ là ngày thường đầy đủ. Debit là độ lớn dương, ghi delta âm. DF-11 chưa biết và không trừ. DF-12 tính 120 phút thường+120 ngoài lịch vào mốc công 480, vẫn giữ đủ điều kiện OT ngoài lịch.

Tình huống sổ bắt đầu từ số dư đã ghi chỉ định, chưa giữ chỗ. Số dư đầu là setup, ngoài new_deltas. Nguồn trùng có thể trả kết quả có sẵn hoặc lỗi trùng có kiểu, không ghi thêm. LG-07 cần chỉ một giữ chỗ đồng thời thành công, không chọn ai thắng. LG-08 cho phép số dư sửa âm đúng lịch sử, không âm thầm chi mới quá số dư. Duyệt giữ chỗ; dùng ghi sổ; đổi nhãn/gửi lại không làm hai việc đó.

Kiểm gói xác minh số học/thời gian/nhất quán fixture. Không chạy transaction, quyền, đồng thời hay email của ứng dụng; đó vẫn là gate triển khai.

Bản dịch của [README.md](README.md); tiếng Anh là nguồn chuẩn.
