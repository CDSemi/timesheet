# Lộ trình triển khai

Năm giai đoạn theo thứ tự. Checkpoint nội bộ là điểm tiếp tục, không phải chia thêm giai đoạn. Claude triển khai/sửa; ChatGPT review độc lập; Huy quyết ngoại lệ nghiệp vụ, cấu hình và kích hoạt thật. ChatGPT dùng Standard; dự phòng model/ước lượng ở [phối hợp AI](08_AI_WORKFLOW_AND_BUDGET.vi.md).

| Giai đoạn | Claude model / effort | ChatGPT model / effort | Phiên (Claude + GPT) |
|---|---|---|---|
| WP1 — Nền tảng và bộ tính giờ | Sonnet 5.5 / High | GPT-6.1 Sol / High | 2 + 1 |
| WP2 — Không gian cá nhân và sổ OT | Sonnet 5.5 / Medium | GPT-6.1 Sol / Medium | 2–3 + 1 |
| WP3 — PDF, sign-off và tự nộp | Sonnet 5.5 / High | GPT-6.1 Sol / High | 2–3 + 1 |
| WP4 — Docker, nhập và phục hồi | Sonnet 5.5 / Medium | GPT-6.1 Sol / High | 1–2 + 1 |
| WP5 — Nghiệm thu độc lập và pilot | Sonnet 5.5 / Medium | GPT-6.1 Sol / High | 1–2 + 1–2 |

## WP1 — Nền tảng và bộ tính giờ

Điều kiện: docs/fixture chuẩn và thư mục riêng đã kiểm; giữ file không liên quan. 

Tạo khung TypeScript strict/Hono/React, migration SQLite, login/session/quyền nội bộ an toàn, lịch/quy tắc có phiên bản, tạo kỳ và bộ tính giờ/OT production thuần. Có kiểm khoảng giờ, tham chiếu quy tắc lịch sử và lý do sửa cũ/hiện tại. Giao seed giả và test chạy được; chưa cần PDF/email cuối.

Checkpoint: (1) Repo/schema/auth và bộ tính ngày; (2) khoảng giờ/múi giờ, tích hợp và bằng chứng.

Gate: Type check/build, migration trên SQLite mới, toàn bộ fixture giờ/OT, cách ly hai user tại endpoint đã làm. Kiểm rõ 09:00–18:00, biên N/M, phút ngày nghỉ, DST, cộng giây và ca đêm hỗn hợp.

Prompt: [Triển khai](../prompts/WP1_IMPLEMENT.vi.md) / [Review](../prompts/WP1_REVIEW.vi.md).

## WP2 — Không gian cá nhân và sổ OT

Điều kiện: bàn giao trước đã đạt và source hiện tại đầy đủ. 

Làm màn hình mobile/hai tuần, sửa clock/nhập tay/nghỉ thực, phép một phần/loại ngày hàng loạt/WFH, settings, CSV lễ preview/import, quản trị user, lịch sử/audit và CSV/báo cáo OT. Làm service sổ/chênh lệch/giữ chỗ nguyên tử, ghi cho phép, tiêu/hủy/đảo một phần và thiếu số dư. WP3 nối chốt; không mở endpoint cộng tùy ý.

Checkpoint: (1) Editor/settings/lịch; (2) sổ/phép/lịch sử/tích hợp; phiên thứ ba chỉ cho việc còn cụ thể.

Gate: Luồng browser chính; AC-01/03/04/05 cho service đã làm; giữ chỗ đồng thời; phép một phần; chênh lệch sửa; xuất bằng chứng an toàn; admin không xem mọi dữ liệu riêng.

Prompt: [Triển khai](../prompts/WP2_IMPLEMENT.vi.md) / [Review](../prompts/WP2_REVIEW.vi.md).

## WP3 — PDF, sign-off và tự nộp

Điều kiện: bàn giao trước đã đạt và source hiện tại đầy đủ. 

Làm snapshot/hash bất biến, review/sign-off rõ, chốt sổ/outbox nguyên tử, báo cáo pdf-lib và ảnh ký riêng, template/người nhận, job/nhắc bền vững, tự động đến hạn, adapter capture/provider và lịch sử gửi. Bao phủ OT thiếu, chọn khoản thiếu, mốc kích hoạt, review muộn/sửa/gửi lại và SMTP chưa rõ. Deep link có login bắt buộc; magic link giới hạn tùy chọn, nếu làm phải đủ bảo vệ.

Checkpoint: (1) Snapshot/review/PDF/transaction sổ; (2) job/nhắc/adapter/phục hồi lỗi; (3) tích hợp/xem PDF còn lại nếu cần.

Gate: AC-06–AC-10 và AC-14; race đến hạn/tay, ảnh tự động bật/tắt, gửi gián đoạn/chưa rõ, job trùng, tải riêng và bằng chứng PDF gồm hai Chủ nhật. Mọi gửi ở dry-run/capture.

Prompt: [Triển khai](../prompts/WP3_IMPLEMENT.vi.md) / [Review](../prompts/WP3_REVIEW.vi.md).

## WP4 — Docker, nhập và phục hồi

Điều kiện: bàn giao trước đã đạt và source hiện tại đầy đủ. 

Giao Docker/Compose ghim phiên bản, ví dụ cấu hình an toàn, runtime non-root lưu bền, bootstrap/migration/health, backup/restore nhất quán và runbook nâng/hạ. Làm workbook preview/commit có nguồn ô, hash, chống trùng/xung đột và số dư đầu rõ. Preview workbook mẫu trong repo với các sheet có ngày giả. Kiểm kiến trúc đích khi có; nếu không ghi NAS chưa test và đưa bước setup cụ thể.

Checkpoint: (1) Image/cài dry-run và restore; (2) preview workbook/bàn giao vận hành nếu cần.

Gate: AC-11/12/15: cài mới, migration, restart giữ dữ liệu, backup lúc ghi, restore riêng đối chiếu hash/số dư, nhập lại không thêm và tắt outbound sau restore.

Prompt: [Triển khai](../prompts/WP4_IMPLEMENT.vi.md) / [Review](../prompts/WP4_REVIEW.vi.md).

## WP5 — Nghiệm thu độc lập và pilot

Điều kiện: bàn giao trước đã đạt và source hiện tại đầy đủ. **Bắt đầu bằng prompt ChatGPT review**, rồi dùng Claude sửa lỗi chấp nhận.

Bắt đầu từ bản ứng viên WP1–WP4 đã đạt và lỗi review WP5. Tái hiện/sửa lỗi chấp nhận với regression có phạm vi; giữ phạm vi/lịch sử đã đạt. Chuẩn bị ghi chú phát hành/setup song ngữ và pilot chính xác (URL, sender/người nhận, thư/PDF, settings, bằng chứng restore, rollback). Nếu chưa có đánh giá độc lập ghi đang chờ, không bịa đạt. Không triển khai/gửi thật nếu chưa có phép chủ.

Checkpoint: ChatGPT đánh giá trước; Claude sửa; ChatGPT kiểm lại; chủ hệ thống xem pilot cụ thể.

Gate: AC-13 và mọi gate bắt buộc còn lại; bản phát hành đầy đủ lặp được, restore đã kiểm, không lỗi chặn toàn vẹn/riêng tư/nộp. Tách sẵn sàng phần mềm khỏi phép chủ và kết quả pilot production thật.

Prompt: [Triển khai](../prompts/WP5_IMPLEMENT.vi.md) / [Review](../prompts/WP5_REVIEW.vi.md).

## Bàn giao và hoàn tất

Mỗi giai đoạn giao code/migration/test, lệnh lặp được, HANDOFF, lỗi review/cách xử lý và một bước tiếp theo. Lỗi chặn toàn vẹn/riêng tư giai đoạn hiện tại không cho đi tiếp. Docs yêu cầu/vận hành giữ song ngữ. Không log giả, TODO trên luồng bắt buộc, dữ liệu chấm công cá nhân, ảnh chữ ký hay secret trong git công khai.

Dùng [FIX_FINDINGS](../prompts/FIX_FINDINGS.vi.md) để sửa có phạm vi và [RESUME](../prompts/RESUME.vi.md) khi gián đoạn. Thiếu NAS nghĩa phần mềm sẵn sàng/pilot chờ, không phải production đạt. Hoàn tất cần gate, pilot được phép, cài đặt khôi phục được và quy trình hai tuần của chủ hệ thống. Theo dõi một kỳ thật sau kích hoạt.

Bản dịch của [09_IMPLEMENTATION_ROADMAP.md](09_IMPLEMENTATION_ROADMAP.md); tiếng Anh là nguồn chuẩn.
