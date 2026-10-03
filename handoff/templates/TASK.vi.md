# Brief và kết quả task bền vững

Coordinator ghi brief trước giao việc; worker thêm kết quả sau mỗi bước liền mạch.
Brief/kết quả task trong handoff/delivery/tasks/ chỉ bằng tiếng Anh (không có .vi.md).

- Mission/task ID; giai đoạn/loại; dependency; attempt:
- Prompt và danh sách tiếng Anh cần đọc:
- Baseline/commit, digest và thay đổi không liên quan cần giữ; freeze/reviewed commit:
- Routing {size S/M/L/XL, rủi ro L/M/H, novelty}:
- Profile (effort cố định); model yêu cầu; model_override_reason (size_risk|novelty|escalation|fallback_unavailable|owner|none); model/effort tự báo thật và nguồn; agent/session ID:
- Path được ghi chính xác; scope chỉ đọc; report/evidence riêng:
- Tiêu chí đạt, rule/AC và gate chạy được:
- Sửa/kiểm đã xong và trạng thái file:
- Bằng chứng: lệnh | môi trường | exit | kết quả thật | path log:
- Sửa dở; lệnh chưa rõ xong; process còn chạy:
- Phát hiện/quyết định, phần còn và blocker:
- Trạng thái: pending / running / interrupted / blocked / done / cancelled:
- Một bước tiếp và đầu vào resume:

Chỉ coordinator cập nhật state chung. Implement done không là nghiệm thu.
Auditor ghi tách biệt tác giả, digest review và quyết định độc lập.
