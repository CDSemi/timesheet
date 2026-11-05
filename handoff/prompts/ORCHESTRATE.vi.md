# Nhiệm vụ một prompt, có thể tiếp tục

Làm main coordinator theo AGENTS.md và tài liệu 08 ("Direct change policy"). Giao việc
thực chất cho subagent; không tự implement hay chẩn đoán. Giữ app chạy và đổi theo yêu
cầu của chủ. Dừng trước triển khai/gửi thật, là việc của chủ. Không đổi billing. Commit
và push chỉ qua `timesheet-committer` theo quyền thường trực của chủ (tài liệu 08,
"Commit và push"): thẳng main đến bản release đầu tiên, sau đó nhánh phụ và PR; không
bao giờ amend, force-push, viết lại lịch sử hay tạo tag.

1. Đọc NEXT_ACTION, STATE.json, ORCHESTRATION.json (bảng đã commit cuối nếu hỏng) và
   checkpoint quy trình mới nhất. Chỉ giao kiểm checkout, việc chưa commit,
   client/profile khi có task running/interrupted hoặc checkpoint ghi việc chưa
   commit/chưa push. Xác nhận writer cũ không còn chạy.
2. Một thay đổi là yêu cầu của chủ, hoặc một bản sửa chủ yêu cầu. Đăng ký task với ID,
   dependency, path sở hữu chính xác và giao cho một worker (`timesheet-worker`, hoặc
   `timesheet-worker-high` nếu liên quan thời gian, ledger, ký duyệt, ownership hay
   concurrency). Chỉ dùng planner khi yêu cầu chưa rõ hoặc lỗi cần chẩn đoán; nếu không, worker đi
   thẳng vào code. Chọn
   profile, model, effort theo thang ở tài liệu 08 và ghi routing. Brief/kết quả trong
   `handoff/delivery/tasks/` chỉ bằng tiếng Anh. Lưu brief và running TRƯỚC khi gọi
   agent. Tối đa hai subagent, một writer source.
3. Worker triển khai, chứng minh hành vi đã đổi bằng test nhắm vào chức năng đó (hoặc
   chạy trực tiếp), giữ `npm run lint`, `npm run typecheck`, `npm test` và
   `npm run build` xanh, rồi ghi kết quả thật vào Results của brief. Với thay đổi về thời gian, OT hoặc ledger, ký duyệt hay gửi, worker chạy thêm các spec unit, integration, e2e của vùng đó và `npm run verify` (quy tắc 5 của AGENTS). Worker không chạy
   test trên chữ nghĩa của tài liệu, comment hay thông báo, nhưng khi một thay đổi làm đổi
   hành vi thì cập nhật các tài liệu mô tả nó (tiếng Anh và `.vi.md`) trong cùng task, đọc
   đối chiếu với code đã đổi và liệt kê tài liệu đã kiểm và đã sửa trong Results; đọc
   danh sách đó trước khi commit. Không có gate verifier, audit định kỳ,
   freeze, regate, duyệt kế hoạch hay duyệt tài liệu; khi bạn thấy thật sự cần audit,
   e2e đầy đủ, quét hay diễn tập, hỏi chủ trước và chỉ chạy khi chủ đồng ý. Committer
   giữ các quét riêng tư, kiểm tra precommit, `validate_orchestration.py` và
   `check_recovery.py`.
4. Sau mỗi kết quả, đối chiếu file, lưu bảng và checkpoint ngắn, báo tiến độ tiếng Việt
   ngắn. Giao `timesheet-committer` commit và push thay đổi, rồi báo chủ có thể thử. Chủ
   thử app đang chạy và yêu cầu sửa; mỗi bản sửa là một thay đổi mới.
5. Checkpoint trước task dài, compaction, cảnh báo usage thấy được và khi dừng; commit
   checkpoint trước khi dừng có kế hoạch nếu state chưa commit. Resume từ
   `next_task_id` của bảng và file thật, không chỉ trí nhớ. Tiếp agent đã ghi nếu còn; nếu
   không, giữ task ID, tăng attempt, giao phần còn. Lệnh chưa rõ xong là unverified;
   gián đoạn không là hoàn tất.

Dùng mẫu TASK và CHECKPOINT trong handoff/templates/. Chỉ coordinator ghi state chung;
worker ghi output được giao. Giao `python handoff/delivery/validate_orchestration.py`
sau đổi state/hợp đồng và trong task commit. Validator không chứng nhận nghiệm thu ứng
dụng. ORCHESTRATION.previous.json đã bỏ; sửa bảng bằng diff nhỏ.
