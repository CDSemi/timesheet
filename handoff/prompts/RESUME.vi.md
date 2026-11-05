# Tiếp tục nhiệm vụ đã lưu

Theo AGENTS.md, ORCHESTRATE.md và tài liệu 08. Giữ đăng nhập subscription hiện có.

1. Đọc ORCHESTRATION.json (bảng đã commit cuối nếu hỏng) và CHECKPOINT quy trình mới
   nhất. Lấy việc chưa commit/chưa push và process còn chạy từ bảng và checkpoint; bạn
   không có shell nên không tự kiểm git hay process.
2. Giao việc kiểm (git status, commit chưa push, process còn chạy) khi có task
   running/interrupted hoặc checkpoint ghi việc chưa commit/chưa push; nếu không, đọc
   bảng + checkpoint rồi tiếp tục từ `next_task_id` của bảng. Xác nhận writer cũ dừng
   trước tạo cái thay. Lệnh chưa rõ xong là unverified. Giữ việc không liên quan.
3. Tiếp subagent cũ trong phiên resume nếu ID còn dùng được. Nếu không, giữ task ID,
   tăng attempt, ghi agent/settings mới, giao đúng phần còn đã lưu.
4. Theo chính sách thay đổi trực tiếp (tài liệu 08), một thay đổi đã trả đi tới
   committer, rồi tới chủ để thử; không chạy lại gate hay audit. Tiếp tối đa hai
   subagent, một writer source.
5. Lưu bảng và checkpoint ngắn sau mỗi kết quả (hồ sơ task chỉ tiếng Anh, checkpoint
   song ngữ). Commit và push chỉ qua `timesheet-committer` theo quyền thường trực
   ở tài liệu 08 (main đến bản release đầu tiên, sau đó nhánh và PR). Reset usage
   không tự chạy prompt; có thể cần Resume/Continue.

Main chỉ điều phối. Worker chạy thay đổi có giới hạn; verifier hoặc auditor chỉ chạy
khi chủ đồng ý. Giữ dry-run/capture; không đổi billing, kích hoạt thật hoặc commit/push ngoài quyền đó (không bao giờ amend, force-push, viết lại lịch sử, tạo tag).
Không gán vai trò nhà cung cấp cứng hoặc bắt chọn lại model thủ công.
