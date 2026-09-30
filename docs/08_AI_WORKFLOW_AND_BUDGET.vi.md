# Phối hợp AI và ngân sách usage

## Ưu tiên subscription

Thông tin người dùng: **Claude Max 20x**, xác nhận qua ảnh gói dịch vụ người dùng cung cấp ngày **30/09/2026**, không mua thêm usage; ChatGPT Business **standard seat**, có **2.500 credits dự trữ**. Gói đã xác nhận thay cho giả định thận trọng 5x trước đây. Đây là ước lượng công việc, không bảo đảm quota hay báo giá credits.

Dùng đăng nhập subscription hiện có trong Claude Code và ChatGPT Work/Codex. API tính phí riêng. Không gắn API key hay bật overage để vượt hạn gói. Dự kiến dùng credits dự trữ: **0**.

Kiểm model/effort/tốc độ và dashboard usage thật trước mỗi phiên có phạm vi. Prompt không đổi model hay kiểm soát thanh toán. Credits mua có thể bị dùng theo điều khiển workspace; kiểm điều khiển thay vì cho rằng prompt ngăn phí. Lưu checkpoint tiếp tục được và đợi reset nếu thiếu allowance. Chủ hệ thống có thể cho phép riêng một việc có giới hạn dùng reserve.

## Phân công model

Tên/điều khiển chính thức kiểm lại ngày **30/09/2026**; không bảo đảm tài khoản/client có sẵn.

| Công việc | Model | Effort / tốc độ |
|---|---|---|
| Claude triển khai WP1, WP3 | Sonnet 5.5 | High |
| Claude triển khai WP2, WP4; WP5 sửa mục tiêu | Sonnet 5.5 | Medium; chỉ High cho lỗi toàn vẹn/phục hồi cụ thể |
| ChatGPT review WP1, WP3, WP4, WP5 | GPT-6.1 Sol | High, Standard |
| ChatGPT review WP2 | GPT-6.1 Sol | Medium, Standard |

Claude Code: chọn bằng /model và điều khiển effort được hỗ trợ (/effort nếu có). ID: claude-sonnet-5-5. Work/Codex chọn model/mức suy luận hiển thị; gpt-6.1-sol là tên khuyến nghị, không phải lệnh gọi API. Ghi setting thật nếu nhãn khác.

Dự phòng: Sonnet bản liền trước có sẵn và GPT-6 Sol với effort tương ứng được hỗ trợ. Kiểm picker/client; cập nhật client cũ nếu cần. Nếu thiếu cả hai nhóm, thống nhất model coding được hỗ trợ mà không âm thầm đổi thanh toán.

Sau hai lần thử có phạm vi thất bại ở cùng lỗi khó tái hiện được, chuẩn bị reproducer nhỏ cho **một** lần nâng: Claude Opus 5.5 Medium hoặc GPT-6 Astra Medium, chủ hệ thống chọn theo usage còn. Không mặc định agent song song, tăng tốc, Max/Ultra effort hay chạy cả hai. Effort các hãng không đo cùng lượng tính toán.

## Ước lượng

| Giai đoạn | Phiên Claude | Phiên ChatGPT | Chủ hệ thống |
|---|---:|---:|---:|
| WP1 | 2 | 1 | 1–2 giờ |
| WP2 | 2–3 | 1 | 1–2 giờ |
| WP3 | 2–3 | 1 | 1–2 giờ |
| WP4 | 1–2 | 1 | 2–3 giờ |
| WP5 | 1–2 | 1–2 | 1–2 giờ |
| Tổng cơ bản | **8–12** | **5–6** | **6–11 giờ** |

Dự trù 3–5 phiên sửa/kiểm lại mục tiêu: **tổng 16–23 phiên có phạm vi**, khoảng **2–4 tuần buổi tối**, gồm đợi reset và bạn kiểm tra. Một phiên là yêu cầu liền mạch kết thúc bằng code/test/bàn giao kiểm được, không phải một tin chat hay lượng token/năm giờ cố định. Setup phần cứng/email hoặc lỗi môi trường có thể kéo dài. Sau WP1 chỉnh ước lượng còn lại theo usage quan sát thật; không bịa token/credits nếu client không hiện.

Max 20x cho dư lịch hơn, không phải lý do tốn hơn mỗi việc. Context, model, tool, output ảnh hưởng usage; khoảng tin nhắn quảng bá không bảo đảm giai đoạn coding vừa cửa sổ. Mặc định Standard; tăng tốc có thể tốn allowance hơn.

Sau khi xác nhận Max 20x, giữ nguyên năm giai đoạn và ước lượng số phiên. Thời gian đợi reset thực tế có thể ngắn hơn; không suy ra ngày hoàn thành cố định hoặc usage còn lại từ tên gói. Xem [NEXT_ACTION](../NEXT_ACTION.vi.md) để đặt thư mục, chọn model bằng tay và copy prompt đầu tiên.

## Vòng làm việc

Chỉ đọc nguồn chuẩn trong prompt hiện tại và source cần. Một coding agent. Lưu quyết định/log chạy; chỉ nạp bản dịch/Excel khi cần.

Claude bàn giao source đầy đủ hoặc archive đầy đủ, baseline/commit, migration, test và HANDOFF. Patch thiếu base chưa đủ. ChatGPT truy hành vi, chạy kiểm có ý nghĩa, đưa lỗi tái hiện được thay vì làm lại/thiết kế lại. Claude sửa lỗi chấp nhận; ChatGPT kiểm phần ảnh hưởng và gate. Không mở lại kiến trúc đã chốt ở mọi phiên.

Gần hết hạn, hoàn tất phần sửa an toàn liền mạch, test tập trung rồi CHECKPOINT; dùng RESUME sau reset. Không biến gián đoạn thành “đạt” giả. Nguồn ở tài liệu 10; kiểm lại thông tin model có ngày khi bắt đầu sau thời gian dài.

Bản dịch của [08_AI_WORKFLOW_AND_BUDGET.md](08_AI_WORKFLOW_AND_BUDGET.md); tiếng Anh là nguồn chuẩn.
