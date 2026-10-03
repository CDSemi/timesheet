# Nhiệm vụ một prompt, có thể tiếp tục

Làm main coordinator theo AGENTS.md và tài liệu 08. Giao việc thực chất cho subagent;
không tự implement, chẩn đoán hoặc audit. Chạy WP1–WP5 tới sẵn sàng phần mềm đã kiểm
và pilot packet cụ thể. Dừng trước triển khai/gửi thật. Không đổi billing. Commit và
push chỉ qua `timesheet-committer` theo quyền thường trực của chủ (tài liệu 08, "Commit và push"): thẳng main đến bản release đầu tiên, sau đó nhánh phụ và PR; không bao giờ amend, force-push, viết lại lịch sử hay tạo tag.

1. Đọc NEXT_ACTION, STATE.json, ORCHESTRATION.json (bảng đã commit cuối nếu hỏng),
   checkpoint quy trình mới nhất, HANDOFF/REVIEW liên quan. Chỉ giao kiểm checkout, việc
   chưa commit, client/profile, bằng chứng khi có task running/interrupted hoặc
   checkpoint ghi việc chưa commit/chưa push. Xác nhận writer cũ không còn chạy.
2. Đối chiếu state. WP1 FIX REQUIRED, F-01 chưa sửa; WP2 chưa bắt đầu. F-01 đã đặc tả
   đủ (file, hàm, repro, cách sửa, test) nên bỏ plan riêng: worker tái hiện trước, theo
   FIX_FINDINGS và WP1_REVIEW; không implement lại WP1. Bằng chứng review lịch sử áp
   dụng baseline gốc, không cho digest mới.
3. Chỉ giao plan có giới hạn khi việc chưa đặc tả đủ. Đăng ký task ID/dependency, path
   sở hữu chính xác. Chọn profile, model, effort theo thang ở tài liệu 08 (size, rủi ro,
   novelty) và ghi routing. Brief/kết quả trong `handoff/delivery/tasks/` chỉ bằng tiếng
   Anh. Lưu brief và running TRƯỚC khi gọi agent. Tối đa hai subagent, một writer
   source; không writer khi gate/audit. Lưu kết quả sau mỗi bước liền mạch.
4. Giao implement/sửa, rồi freeze commit (trước gate/audit; định danh được audit là
   reviewed_commit + source_digest), verifier gate, rồi WPn_REVIEW độc lập context mới
   trên cây sạch. Chỉ audit sửa S-size trung gian mới có thể gồm gate
   (`gate_included`); snapshot cuối giai đoạn, gồm cả recheck FIX REQUIRED mở khóa
   giai đoạn kế, và audit GOV giữ gate verifier riêng (tài liệu 08). Ghi digest
   trước/sau. Auditor không được là tác giả thay đổi. Review path mới giữ bằng chứng
   lịch sử.
5. Sau mỗi kết quả, đối chiếu file/evidence, lưu bảng/checkpoint, báo tiến độ tiếng
   Việt ngắn. FIX REQUIRED tạo sửa + gate + audit lại; NOT VERIFIED bổ sung bằng
   chứng trước khi tiến. Không ép PASS.
6. Gate/audit PASS trên digest hiện tại cho phép accept commit và push (evidence,
   review, state) cùng cập nhật STATE/NEXT_ACTION và HANDOFF song ngữ. Tạo plan/task giai đoạn tiếp, tự tiến. WPn_IMPLEMENT của worker
   vẫn giới hạn giai đoạn của nó. WP5 bắt đầu nghiệm thu độc lập WP1–WP4, rồi
   sửa/recheck, chuẩn bị pilot.
7. Checkpoint trước task dài, compaction, cảnh báo usage thấy được và khi dừng; commit
   checkpoint trước khi dừng có kế hoạch nếu state chưa commit.
   Resume file/evidence thật, không chỉ trí nhớ. Tiếp agent đã ghi nếu còn; nếu
   không, giữ task ID, tăng attempt, giao phần còn. Lệnh chưa rõ xong là unverified;
   gián đoạn không là hoàn tất.
8. Kết thúc bằng sẵn sàng phần mềm, gate/setup còn thiếu, pilot packet cụ thể và
   một hành động của chủ. Kích hoạt/nhận thật/theo dõi kỳ thật vẫn chờ riêng.

Dùng mẫu TASK, CHECKPOINT, HANDOFF, REVIEW trong handoff/templates/.
Chỉ coordinator ghi state chung; worker ghi output/evidence được giao.
Giao `python handoff/delivery/validate_orchestration.py` và preflight tài liệu sau đổi
state/hợp đồng và trong task commit. Validator không chứng nhận nghiệm thu ứng dụng.
ORCHESTRATION.previous.json đã bỏ; sửa bảng bằng diff nhỏ.
