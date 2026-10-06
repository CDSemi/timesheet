# Triển khai và vận hành

## Triển khai ban đầu

Reverse proxy Synology → một container app → /data bền vững cục bộ host. SMTP và ntfy tùy chọn là adapter. Ban đầu không Redis, DB server hay dịch vụ render trình duyệt.

Kiểm CPU NAS thật và khả năng Docker/Container Manager; không giả định mọi NAS đều hỗ trợ. Test SQLite native và font trên đích đã chọn. WP4 giao Dockerfile nhiều stage có ghim phiên bản, ví dụ Compose, .env.example không secret, migration, bootstrap admin một lần có hạn, seed giả, health, script backup/restore và runbook song ngữ.

Chạy non-root. Lưu DB, PDF, chữ ký, bằng chứng riêng tư. Không đưa workbook, file dev hay secret vào image. Cấu hình HTTPS URL, proxy tin cậy, data path, múi giờ báo cáo, outbound và SMTP TLS/credential. Không có bí mật session của ứng dụng; chỉ có credential SMTP. Người nhận/template từng user ở settings, không dùng một recipient chung trong env.

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

Mục tiêu ban đầu: backup mỗi đêm, điểm khôi phục 24 giờ và restore trong một giờ khi đủ điều kiện. Đây là mục tiêu cần test, chưa là bảo đảm đo được. Giữ backup (quyết định của chủ F-5, 2026-10-05): việc dọn giữ 7 bản ngày, 4 tuần, 6 tháng và chỉ tác động lên thư mục do công cụ backup tạo. Bản được bảo vệ trên thiết bị khác là bước setup của chủ (Synology Hyper Backup hoặc USB), không phải code ứng dụng.

Không chỉ copy file SQLite chính đang chạy mà bỏ WAL. Dùng online backup API hoặc cách nhất quán có tài liệu. Tạm dừng chốt/ghi file ngắn, chụp DB và manifest file bất biến được tham chiếu, copy file, tiếp tục. Có phiên bản app/schema, thời điểm, kiểm toàn vẹn và hash; giữ cấu hình bí mật cần thiết an toàn, không in ra.

Restore thư mục riêng, tắt gửi. Kiểm toàn vẹn/schema, user, số dư mẫu, revision, file/hash và PDF. Đối chiếu job chờ/chưa rõ trước khi bật. Không chạy đồng thời queue production cũ và đã restore.

Trước nâng cấp, kiểm backup và chạy migration có phiên bản một lần. Chỉ hạ binary khi schema tương thích; nếu không restore cặp DB/file. Đối chiếu gửi bên ngoài sau restore—thư đã chấp nhận không tự gửi lại. Restore giữ lại mọi job gửi và nhắc đang xếp hàng hoặc đang giữ lease từ backup cho đến khi có thao tác thả hoặc bỏ có ghi audit. Khi rollback restore một backup có schema chưa có tạm dừng gửi, bản build cũ phải chạy với job runner tắt (`JOB_RUNNER=off`) cho đến khi đối chiếu xong.

## Bảo trì

Health/readiness không lộ riêng tư. Màn hình admin hiện heartbeat runner, backup thành công, dung lượng, sender và backlog/lỗi/chưa rõ theo từng người và kỳ, kèm địa chỉ người nhận, không có chi tiết timesheet hay nội dung thư. Dùng báo host độc lập khi có; SMTP hỏng không thể đáng tin báo lỗi qua chính SMTP đó.

Xem lễ công ty năm tới trước kỳ đầu bị ảnh hưởng; preview/kiểm rồi xuất bản phiên bản hiệu lực mới. Giữ override/lịch sử. Không tự thay bằng lễ liên bang Mỹ. Xem certificate, dependency, retention và dung lượng.

## Nhập workbook

Preview/commit rõ, không tự nhập lúc startup. Đọc cell như dữ liệu, không chạy macro/link ngoài/công thức. Ánh xạ sheet ngày/nhãn; báo ô nguồn, nhãn lạ, ngày, trùng và xung đột. Cần quyết định xung đột rõ; giữ thông tin chưa ánh xạ trong nguồn/báo cáo.

Nguồn gốc có 11 sheet (8 kỳ có ngày và 3 sheet hỗ trợ/mẫu); mẫu trong repo giữ 3 sheet hỗ trợ/mẫu với lễ linh hoạt, công thức 8,5 giờ, tổng thiếu Chủ nhật và ngày ký TODAY. Các ô clock đã xem trong bản gốc đều trống. Không suy ra đã gửi, ngày ký thật hay số dư OT đầu bằng không. Nhập imported_unverified với SHA-256 nguồn/phiên bản ánh xạ và khóa đợt chống trùng.

Mỗi người chỉ nhập workbook của chính mình (quyết định của chủ F-1, 2026-10-05); admin không thể nhập thay ai. Kỳ đã nhập không ghi sự kiện sổ, không thể ký hay nộp (409 `imported_period`) và là lịch sử chỉ đọc (F-2). Số dư đầu cần phút có dấu khác không, ngày, lý do và bằng chứng rõ, mỗi user một khoản, chỉ đổi bằng sửa có lý do và lưu thành loại dòng sổ mới (F-3); đó là nguồn OT mang sang duy nhất. Không suy từ công thức lỗi. Lặp nguồn/sự kiện mở đầu không ghi lại. Lịch sử nhập không khởi động nhắc/tự gửi. WP4 preview mẫu trong repo được điền các sheet có ngày giả; không còn giữ workbook lịch sử cá nhân nào, và test thường dùng bản giả. Mặc định an toàn cho I-3 (quyết định của coordinator, đảo ngược được, tài liệu 10): một kỳ chỉ được nhập sau khi đã kết thúc và đã qua thời điểm đến hạn lương; kỳ đã kết thúc nhưng chưa đến hạn cũng chỉ được bỏ qua (`not_due`). Bộ đọc từ chối gói lớn hơn 4 MiB XML cho một phần hoặc 16 MiB cho cả gói, vượt giới hạn số phần tử, ô, dòng và chuỗi dùng chung, hoặc có hơn 2.000 dòng ngày lễ (422 `workbook_rejected`), và các phát hiện trả về bị giới hạn số lượng.

Bản dịch của [07_DEPLOYMENT_AND_OPERATIONS.md](07_DEPLOYMENT_AND_OPERATIONS.md); tiếng Anh là nguồn chuẩn.
