# Nhiệm vụ một prompt, có thể tiếp tục

Làm main coordinator theo AGENTS.md và tài liệu 08. Giao việc thực chất cho subagent;
không tự implement, chẩn đoán hoặc audit. Chạy WP1–WP5 tới sẵn sàng phần mềm đã kiểm
và pilot packet cụ thể. Dừng trước triển khai/gửi thật. Không commit/amend/push
hoặc đổi billing.

1. Đọc NEXT_ACTION, STATE.json, ORCHESTRATION.json (bản previous hợp lệ cuối nếu hỏng),
   checkpoint quy trình mới nhất, HANDOFF/REVIEW liên quan. Giao kiểm checkout, việc
   chưa commit, client/profile, bằng chứng thật. Xác nhận writer cũ không còn chạy.
2. Đối chiếu state. WP1 FIX REQUIRED, F-01 chưa sửa; WP2 chưa bắt đầu. Plan sửa F-01
   có giới hạn theo FIX_FINDINGS và WP1_REVIEW; không implement lại WP1. Bằng chứng
   review lịch sử áp dụng baseline gốc, không cho digest mới.
3. Giao plan có giới hạn. Đăng ký task ID/dependency, path sở hữu chính xác. Chọn
   profile theo độ khó/rủi ro. Lưu brief song ngữ và running TRƯỚC khi gọi agent.
   Tối đa hai subagent, một writer source; không writer khi gate/audit. Lưu kết quả
   sau mỗi bước liền mạch.
4. Giao implement/sửa, verifier gate rồi WPn_REVIEW độc lập context mới. Đóng băng
   snapshot đủ, ghi digest trước/sau. Auditor không được là tác giả thay đổi. Review
   path mới giữ bằng chứng lịch sử.
5. Sau mỗi kết quả, đối chiếu file/evidence, lưu bảng/checkpoint, báo tiến độ tiếng
   Việt ngắn. FIX REQUIRED tạo sửa + gate + audit lại; NOT VERIFIED bổ sung bằng
   chứng trước khi tiến. Không ép PASS.
6. Gate/audit PASS trên digest hiện tại cho phép cập nhật STATE/NEXT_ACTION và
   HANDOFF song ngữ. Tạo plan/task giai đoạn tiếp, tự tiến. WPn_IMPLEMENT của worker
   vẫn giới hạn giai đoạn của nó. WP5 bắt đầu nghiệm thu độc lập WP1–WP4, rồi
   sửa/recheck, chuẩn bị pilot.
7. Checkpoint trước task dài, compaction, cảnh báo usage thấy được và khi dừng.
   Resume file/evidence thật, không chỉ trí nhớ. Tiếp agent đã ghi nếu còn; nếu
   không, giữ task ID, tăng attempt, giao phần còn. Lệnh chưa rõ xong là unverified;
   gián đoạn không là hoàn tất.
8. Kết thúc bằng sẵn sàng phần mềm, gate/setup còn thiếu, pilot packet cụ thể và
   một hành động của chủ. Kích hoạt/nhận thật/theo dõi kỳ thật vẫn chờ riêng.

Dùng mẫu TASK, CHECKPOINT, HANDOFF, REVIEW trong handoff/templates/.
Chỉ coordinator ghi state chung; worker ghi output/evidence được giao.
Giao `python handoff/delivery/validate_orchestration.py` và preflight tài liệu sau đổi
state/hợp đồng. Validator không chứng nhận nghiệm thu ứng dụng.
