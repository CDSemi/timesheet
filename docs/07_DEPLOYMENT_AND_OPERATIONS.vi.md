# Triển khai và vận hành

## Triển khai ban đầu

Reverse proxy Synology → một container app → /data bền vững cục bộ host. SMTP và ntfy tùy chọn là adapter. Ban đầu không Redis, DB server hay dịch vụ render trình duyệt.

Kiểm CPU NAS thật và khả năng Docker/Container Manager; không giả định mọi NAS đều hỗ trợ. Test SQLite native và font trên đích đã chọn. WP4 giao Dockerfile nhiều stage có ghim phiên bản, ví dụ Compose, .env.example không secret, migration, bootstrap admin một lần có hạn, seed giả, health, script backup/restore và runbook song ngữ.

Chạy non-root. Lưu DB, PDF, chữ ký, bằng chứng riêng tư. Không đưa workbook, file dev hay secret vào image. Cấu hình HTTPS URL, proxy tin cậy, data path, bí mật session/token, múi giờ báo cáo, outbound và SMTP TLS/credential. Người nhận/template từng user ở settings, không dùng một recipient chung trong env.

Dùng file secret/env được bảo vệ trên host; không đưa credential vào git, chat, ảnh hay log. Có HTTPS, cookie an toàn, hạn chế truy cập nội bộ và đồng bộ giờ host.

## Trình tự setup

1. Kiểm kiến trúc/lưu trữ và ghi path host thật.
2. Khởi động dry-run, migration một lần có khóa riêng, hoàn tất bootstrap admin rồi tắt.
3. Tạo hai tài khoản giả; kiểm cách ly.
4. Cấu hình payroll/lễ/quy tắc/người nhận/template và xem tổng hợp.
5. Capture bản nộp giả cục bộ, xem PDF, backup và restore riêng.
6. Chuẩn bị pilot chính xác ở WP5. Sau phép chủ hệ thống, bật gửi và ghi giờ kích hoạt. Kiểm kết quả pilot đã duyệt và theo dõi kỳ đầu.

Chuẩn bị cài đặt không phải triển khai thật hay gửi email. Thiếu credential/phần cứng là đầu vào setup sau, không phải lý do ngừng việc cục bộ đã được phép.

## Backup, restore và nâng cấp

Mục tiêu ban đầu: backup mỗi đêm, điểm khôi phục 24 giờ và restore trong một giờ khi đủ điều kiện. Đây là mục tiêu cần test, chưa là bảo đảm đo được. Gợi ý giữ 7 ngày, 4 tuần, 6 tháng, có bản trên thiết bị khác được bảo vệ.

Không chỉ copy file SQLite chính đang chạy mà bỏ WAL. Dùng online backup API hoặc cách nhất quán có tài liệu. Tạm dừng chốt/ghi file ngắn, chụp DB và manifest file bất biến được tham chiếu, copy file, tiếp tục. Có phiên bản app/schema, thời điểm, kiểm toàn vẹn và hash; giữ cấu hình bí mật cần thiết an toàn, không in ra.

Restore thư mục riêng, tắt gửi. Kiểm toàn vẹn/schema, user, số dư mẫu, revision, file/hash và PDF. Đối chiếu job chờ/chưa rõ trước khi bật. Không chạy đồng thời queue production cũ và đã restore.

Trước nâng cấp, kiểm backup và chạy migration có phiên bản một lần. Chỉ hạ binary khi schema tương thích; nếu không restore cặp DB/file. Đối chiếu gửi bên ngoài sau restore—thư đã chấp nhận không tự gửi lại.

## Bảo trì

Health/readiness không lộ riêng tư. Màn hình có auth hiện heartbeat runner, backup thành công, dung lượng, backlog/lỗi/chưa rõ và sender. Dùng báo host độc lập khi có; SMTP hỏng không thể đáng tin báo lỗi qua chính SMTP đó.

Xem lễ công ty năm tới trước kỳ đầu bị ảnh hưởng; preview/kiểm rồi xuất bản phiên bản hiệu lực mới. Giữ override/lịch sử. Không tự thay bằng lễ liên bang Mỹ. Xem certificate, dependency, retention và dung lượng.

## Nhập workbook

Preview/commit rõ, không tự nhập lúc startup. Đọc cell như dữ liệu, không chạy macro/link ngoài/công thức. Ánh xạ sheet ngày/nhãn; báo ô nguồn, nhãn lạ, ngày, trùng và xung đột. Cần quyết định xung đột rõ; giữ thông tin chưa ánh xạ trong nguồn/báo cáo.

Nguồn gốc có 11 sheet (8 kỳ có ngày và 3 sheet hỗ trợ/mẫu); mẫu trong repo giữ 3 sheet hỗ trợ/mẫu với lễ linh hoạt, công thức 8,5 giờ, tổng thiếu Chủ nhật và ngày ký TODAY. Các ô clock đã xem trong bản gốc đều trống. Không suy ra đã gửi, ngày ký thật hay số dư OT đầu bằng không. Nhập imported_unverified với SHA-256 nguồn/phiên bản ánh xạ và khóa đợt chống trùng.

Số dư đầu cần phút, ngày, lý do và bằng chứng rõ; không suy từ công thức lỗi. Lặp nguồn/sự kiện mở đầu không ghi lại. Lịch sử nhập không khởi động nhắc/tự gửi. WP4 preview mẫu trong repo được điền các sheet có ngày giả; không còn giữ workbook lịch sử cá nhân nào, và test thường dùng bản giả.

Bản dịch của [07_DEPLOYMENT_AND_OPERATIONS.md](07_DEPLOYMENT_AND_OPERATIONS.md); tiếng Anh là nguồn chuẩn.
