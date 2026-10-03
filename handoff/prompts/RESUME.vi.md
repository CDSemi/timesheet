# Tiếp tục nhiệm vụ đã lưu

Theo AGENTS.md, ORCHESTRATE.md và tài liệu 08. Giữ đăng nhập subscription hiện có.

1. Đọc ORCHESTRATION.json (bản previous hợp lệ nếu hỏng), CHECKPOINT quy trình mới,
   STATE và HANDOFF/REVIEW hiện tại. Kiểm file chưa commit thật.
2. Giao đối chiếu task running/interrupted và process còn chạy. Xác nhận writer
   cũ dừng trước tạo cái thay. Lệnh chưa rõ xong là unverified. Giữ việc không
   liên quan và giai đoạn đã đạt.
3. Tiếp subagent cũ trong phiên resume nếu ID còn dùng được. Nếu không, giữ task ID,
   tăng attempt, ghi agent/settings mới, giao đúng phần còn/evidence đã lưu.
4. Kiểm lại gate/audit nếu source đổi. PASS/checkpoint cũ không là nghiệm thu.
   Tiếp tối đa hai subagent, một writer source.
5. Lưu bảng và checkpoint từng task/giai đoạn song ngữ sau mỗi kết quả. Reset usage
   không tự chạy prompt; có thể cần Resume/Continue.

Main chỉ điều phối. Worker chạy giai đoạn có giới hạn, verifier gate, audit độc lập
context mới. Giữ dry-run/capture; không đổi billing, kích hoạt thật hoặc tự commit/push.
Không gán vai trò nhà cung cấp cứng hoặc bắt chọn lại model thủ công.
