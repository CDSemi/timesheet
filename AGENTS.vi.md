# Hướng dẫn dự án

1. Đọc prompt đang làm và các tài liệu tiếng Anh được chỉ định. Tiếng Anh là nguồn chuẩn; giữ bản dịch `.vi.md` tương ứng. Trao đổi với Huy bằng tiếng Việt. Code, comment và hợp đồng API dùng tiếng Anh.
2. Chỉ triển khai giai đoạn hiện tại. Kiểm repo trước khi sửa; giữ việc không liên quan. Dùng app nhỏ có module và một bộ tính production. Tự quyết chi tiết triển khai thường trong hợp đồng.
3. Dùng đăng nhập subscription. Không tự bật overage, gắn API billing, mua credits, đổi model/tốc độ/effort hoặc chạy agent song song. Prompt không cấu hình client.
4. Kiểm chủ sở hữu cho mọi thao tác dữ liệu/file. Giữ PDF, chữ ký và token riêng tư. Không công khai bí mật production, ảnh chữ ký hay dữ liệu chấm công cá nhân; workbook được theo dõi trong git là bản mẫu đã làm sạch mô tả ở `inputs/README.md`.
5. Theo gate nghiệm thu bắt buộc. Ghi lệnh chạy được và kết quả thật; không bịa bằng chứng. Báo cáo kết quả không tự là bằng chứng độc lập.
6. Khi triển khai/review dùng dữ liệu giả và mail capture/dry-run. Chuẩn bị pilot cụ thể trước khi chủ hệ thống cho phép gửi/triển khai thật. Không xin credential qua chat.
7. Thời điểm UTC, ngày ghi sổ và múi giờ IANA báo cáo đã lưu là các giá trị khác nhau. Đổi múi giờ thiết bị không được chia lại timesheet.
8. Yêu cầu đã chốt ưu tiên hơn công thức kế thừa. Báo mâu thuẫn thật, cập nhật quy tắc chuẩn và bản dịch; không âm thầm đổi nghiệp vụ.
9. Trước khi dừng, lưu HANDOFF hoặc CHECKPOINT có file/commit, bằng chứng, việc còn lại và một bước tiếp theo. Tiếp tục việc gián đoạn thay vì làm lại giai đoạn đã đạt.
10. File này hướng dẫn dự án, không phải skill cài đặt hay yêu cầu đổi cấu hình AI toàn cục.
11. Không dùng API, kiểu, tùy chọn hay gói đã deprecated của ngôn ngữ, runtime, thư viện hoặc công cụ; dùng phương án thay thế được tài liệu hóa. `npm run lint` (typescript-eslint `no-deprecated`) phải đạt, và cảnh báo deprecated từ toolchain hay runtime là lỗi cần sửa, không được che đi.

## Skill dành cho agent

### Theo dõi issue

Issue được theo dõi trong GitHub Issues của `CDSemi/timesheet` qua CLI `gh`. Xem `docs/agents/issue-tracker.md`.

### Nhãn phân loại

Năm vai trò phân loại chuẩn có tên trùng với chuỗi nhãn (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Xem `docs/agents/triage-labels.md`.

### Tài liệu miền

Một context: một `GLOSSARY.md` và `docs/adr/` tại thư mục gốc repo. Xem `docs/agents/domain.md`.

Bản dịch của [AGENTS.md](AGENTS.md); tiếng Anh là nguồn chuẩn.
