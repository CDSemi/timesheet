# Yêu cầu sản phẩm

## Mục đích

Công cụ timesheet cá nhân, sẵn nền tảng tài khoản riêng cho đồng nghiệp sau này. Ghi loại ngày, giờ thực làm và OT nội bộ; tạo PDF C&D quen thuộc; yêu cầu sign-off; gửi email theo hạn cấu hình. OT là bằng chứng để trao đổi với manager, không phải bộ tính lương. Ban đầu Huy là nhân viên và quản trị. Portal manager thuộc tương lai.

| ID | Yêu cầu | Giai đoạn |
|---|---|---|
| FR-01 | Đăng nhập nội bộ, dữ liệu riêng, quản trị và vô hiệu hóa user | WP1/WP2 |
| FR-02 | Kỳ 14 ngày, mốc payroll và hạn nộp riêng | WP1 |
| FR-03 | Mặc định Worked ngày làm theo lịch, Holiday ngày lễ công ty, còn lại Off | WP2 |
| FR-04 | Sửa Worked/Off/Vacation/Sick/Holiday/Shutdown, nghỉ một phần và nhiều ngày | WP2 |
| FR-05 | Cấu hình giờ tham chiếu/nghỉ, mốc 480 phút, giờ vào linh hoạt | WP1/WP2 |
| FR-06 | Nhập tay, Clock in/out, nhiều phiên, UTC và qua đêm | WP1/WP2 |
| FR-07 | OT mỗi ngày, vượt N nghiêm ngặt, làm tròn M đúng giữa xuống, OT ngoài lịch | WP1 |
| FR-08 | Tùy chọn trừ giờ thiếu tự động hoặc khi sign-off; không trừ ngày nghỉ không làm | WP1/WP2 |
| FR-09 | Sổ OT truy vết, sửa chênh lệch, ghi manager cho phép, đổi phép một phần | WP2 |
| FR-10 | Sign-off rõ ràng gắn với revision bất biến | WP3 |
| FR-11 | PDF quen thuộc; sign-off tay cần tên và ảnh ký; ảnh tự động cấu hình được | WP3 |
| FR-12 | Người nhận/template, thông báo, công tắc đến hạn, luồng gửi bền vững | WP3 |
| FR-13 | Lịch lễ công ty hằng năm và phiên bản quy tắc theo hiệu lực | WP2 |
| FR-14 | Audit ai/lúc nào/trước-sau; lý do sửa kỳ cũ/đã chốt | WP1/WP2 |
| FR-15 | Docker, lưu bền vững, backup/restore và phục hồi vận hành | WP4 |
| FR-16 | Nhập Excel có kiểm soát và số dư OT đầu có bằng chứng | WP4 |
| FR-17 | Chủ chia sẻ timesheet của mình, thu hồi được, bật/tắt từng mục (xem, sửa, OT chỉ đọc, PDF đã chốt); admin xem tình trạng không có chi tiết timesheet | WP3 |

## Lịch và loại ngày

Workbook có payroll thứ Sáu mỗi 14 ngày. Với payroll P, kỳ từ P−18 tới P−5, tính cả hai đầu; hạn P−3 là thứ Ba. Mốc: payroll 02/10/2026, kỳ 14/09…27/09/2026. Giờ hạn đề xuất: 17:00 America/Los_Angeles, chỉnh được; workbook không xác lập giờ này. Ngoại lệ ngày payroll phải ghi rõ.

Dashboard ưu tiên kỳ chưa giải quyết cũ nhất nhưng không đổi nghĩa “hiện tại.” R-07 xác định hiện tại bằng payroll được cấu hình sớm nhất bằng/sau hôm nay theo múi giờ báo cáo. Kỳ cũ chưa gửi vẫn cần lý do sửa.

WFH là thuộc tính nơi làm, có thể hiển thị nhãn quen thuộc. Off/Vacation/Sick cá nhân không biến thứ Ba bình thường thành OT cuối tuần. Phép cả ngày/một phần dùng phút. Nhãn công dự kiến không phải giờ thực hay xác nhận của nhân viên. Bản tự nộp có thể trình bày chúng trong PDF gửi đi mà không có dấu hiệu tự động (tài liệu 04); hệ thống vẫn ghi chúng là chưa xác nhận. Thiếu clock không sinh giờ, OT hoặc khoản thiếu giả. Có thể nộp loại ngày trong khi bằng chứng OT tùy chọn còn chờ.

## Phạm vi bản đầu

Hai user test phải được cách ly trong toàn bộ bản đầu. Admin thấy tài khoản, cấu hình và tình trạng vận hành, gồm trạng thái nộp, gửi và người nhận của từng người, nhưng không bao giờ thấy chi tiết timesheet của ai (tài liệu 03 định nghĩa). Mỗi người có thể chia sẻ timesheet của chính mình cho một tài khoản khác theo từng mục—xem, sửa, xem sổ và tổng OT (chỉ đọc), tải PDF đã chốt—và đổi hoặc thu hồi; sign-off, file ảnh chữ ký, gửi và settings cá nhân vẫn chỉ thuộc chủ. Quyền manager tương lai cần gán rõ.

Có CSV lịch lễ, quản trị user cơ bản, email và xuất bằng chứng OT. ntfy tùy chọn có thể chưa bật. Hoãn: tính OT trả lương, đồng bộ HR, SMS, đăng ký công khai, app di động native, portal manager, tự thiết kế báo cáo và chạy nhiều node.

Workbook được theo dõi là [mẫu đã làm sạch](../reference/inputs/README.vi.md); không giữ bản gốc cá nhân. Nhập lịch sử với `imported_unverified`; không suy ra sign-off thật, đã gửi hay OT bằng không từ cache trống, công thức 8,5 giờ hoặc ngày ký động.

Bản dịch của [01_PRODUCT_REQUIREMENTS.md](01_PRODUCT_REQUIREMENTS.md); tiếng Anh là nguồn chuẩn.
