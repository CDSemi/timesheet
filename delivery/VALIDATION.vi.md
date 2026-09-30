# Kiểm tra lịch sử gói docs r1.1

**Phạm vi lịch sử:** các số đếm, hash và tuyên bố chưa xây dựng ứng dụng bên dưới mô tả gói docs r1.1 ban đầu, không phải repo hiện tại. WP1 đã triển khai và chờ review độc lập; xem [STATE](STATE.json), [bàn giao WP1](WP1_HANDOFF.vi.md) và [DEVELOPMENT](../DEVELOPMENT.vi.md). Các log WP1 là bằng chứng của bên triển khai, chưa phải kết quả review độc lập.

**Repo hiện tại:** manifest r1.1 liệt kê 75 file và 33 cặp dịch; chưa gồm DEVELOPMENT, bàn giao WP1 và source ứng dụng, và nhiều tài liệu đã thay đổi từ đó (ví dụ AGENTS, README, NEXT_ACTION, STATE và ghi chú đầu vào). Workbook nay là mẫu công khai đã làm sạch nên hash khác snapshot. Dùng `python delivery/validate_package.py --preflight` cho repo hiện tại: lệnh bỏ qua các thư mục công cụ, dependency, build và skill agent (`.git`, `node_modules`, `dist`, `coverage`, `.agents`, `.claude`, `.idea`, `docs/agents`) và kiểm cặp dịch, link cục bộ, JSON, hash mẫu được theo dõi và toàn bộ số học fixture. Chế độ thường vẫn so với manifest lịch sử nên sẽ lỗi cho tới khi định nghĩa phạm vi manifest mới; không tạo lại hash lịch sử để che khác biệt.

Bản: 2026-09-30-r1.1. Bản r1.1 bổ sung hướng dẫn bắt đầu cụ thể và ghi nhận Claude Max 20x đã xác nhận. Quy tắc nghiệp vụ và fixture tham chiếu giữ nguyên. Tiếng Anh là nguồn chuẩn; bản dịch gắn theo path và SHA-256 trong [translation-map.json](translation-map.json).

Kiểm nội dung bao gồm:
- 33 cặp Markdown Anh/Việt, cùng ID yêu cầu/giai đoạn/tình huống ổn định.
- Link tài liệu cục bộ tồn tại và JSON hợp lệ; nguồn ngoài giữ ngày đã xem khi chuẩn bị.
- 91 tình huống duy nhất: 33 OT, 32 thời gian, 16 thiếu và 10 số học sổ.
- Tính lại độc lập kỳ vọng ngưỡng/làm tròn, thời gian trôi/lịch/DST và thiếu.
- Số học số dư/delta kỳ vọng; không test transaction đồng thời thật.
- Giữ chính xác dung lượng và SHA-256 workbook gốc.

Chạy từ thư mục gốc đã giải nén:

```sh
python3 delivery/validate_package.py
```

Cần Python 3.9+ và cơ sở múi giờ IANA. Trình kiểm chỉ đọc. Chế độ thường kiểm hash docs/bản dịch theo [package-manifest.json](package-manifest.json), liệt kê mọi file trừ chính nó. --preflight bỏ qua bước so manifest; dùng nó cho repo hiện tại (xem ở trên).

Đóng gói phát hành còn kiểm CRC ZIP, đường dẫn thành viên và byte giải nén khớp cây nguồn. Nếu chủ động sửa nguồn chuẩn, dịch file tương ứng và tạo lại manifest; không sửa hash chỉ để che không khớp.

## Chưa chứng nhận

Gói docs chưa xây dựng, triển khai hay test ứng dụng. Cách ly/đồng thời DB, render PDF thật, email/thử lại, tương thích NAS và backup/restore thật phải chứng minh ở gate lộ trình. Không gửi tin thật, không kích hoạt production. Model/quota tùy client; ước lượng công việc không bảo đảm quota.

Bản dịch của [VALIDATION.md](VALIDATION.md); tiếng Anh là nguồn chuẩn.
