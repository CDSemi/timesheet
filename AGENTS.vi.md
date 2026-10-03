Bản dịch của [AGENTS.md](AGENTS.md); tiếng Anh là nguồn chuẩn.

# Hướng dẫn dự án

1. Đọc prompt đang làm trong `handoff/prompts/` (`handoff/NEXT_ACTION.md` cho biết prompt nào) và các tài liệu tiếng Anh được chỉ định. Tiếng Anh là nguồn chuẩn; giữ bản dịch `.vi.md` tương ứng. Trao đổi (chat) bằng tiếng Việt. Code, comment và hợp đồng API dùng tiếng Anh.
2. Chỉ triển khai giai đoạn hiện tại. Nhiệm vụ điều phối đã được cho phép có thể tiến qua WP1–WP5 sau khi gate bắt buộc và audit độc lập của mỗi giai đoạn đạt; không bỏ qua gate. Kiểm repo trước khi sửa; giữ việc không liên quan. Dùng app nhỏ có module và một bộ tính production. Tự quyết chi tiết triển khai thường trong hợp đồng.
3. Dùng đăng nhập subscription. Coordinator được tự chọn model/effort được hỗ trợ cho subagent và mức song song có giới hạn theo tài liệu 08, không cần hỏi lại. Không bật overage, gắn API billing, mua credits hoặc đổi cấu hình toàn cục/tốc độ. Chỉ riêng prompt không cấu hình client.
4. Kiểm chủ sở hữu cho mọi thao tác dữ liệu/file. Giữ PDF, chữ ký và token riêng tư. Không công khai bí mật production, ảnh chữ ký hay dữ liệu chấm công cá nhân; workbook được theo dõi trong git là bản mẫu đã làm sạch mô tả ở `reference/inputs/README.md`.
5. Theo gate nghiệm thu bắt buộc. Ghi lệnh chạy được và kết quả thật; không bịa bằng chứng. Báo cáo kết quả không tự là bằng chứng độc lập.
6. Khi triển khai/review dùng dữ liệu giả và mail capture/dry-run. Chuẩn bị pilot cụ thể trước khi chủ hệ thống cho phép gửi/triển khai thật. Không xin credential qua chat.
7. Thời điểm UTC, ngày ghi sổ và múi giờ IANA báo cáo đã lưu là các giá trị khác nhau. Đổi múi giờ thiết bị không được chia lại timesheet.
8. Yêu cầu đã chốt ưu tiên hơn công thức kế thừa. Báo mâu thuẫn thật, cập nhật quy tắc chuẩn và bản dịch; không âm thầm đổi nghiệp vụ.
9. Trước khi dừng, lưu HANDOFF hoặc CHECKPOINT vào `handoff/delivery/` (mẫu ở `handoff/templates/`) có file/commit, bằng chứng, việc còn lại và một bước tiếp theo. Khi điều phối, lưu `handoff/delivery/ORCHESTRATION.json` trước khi giao task và sau mỗi kết quả, không chỉ khi có cảnh báo usage. Tiếp tục việc gián đoạn thay vì làm lại giai đoạn đã đạt.
10. File này hướng dẫn dự án, không phải skill cài đặt hay yêu cầu đổi cấu hình AI toàn cục.
11. Không dùng API, kiểu, tùy chọn hay gói đã deprecated của ngôn ngữ, runtime, thư viện hoặc công cụ; dùng phương án thay thế được tài liệu hóa. `npm run lint` (typescript-eslint `no-deprecated`) phải đạt, và cảnh báo deprecated từ toolchain hay runtime là lỗi cần sửa, không được che đi.
12. Sau khi thay đổi tệp, mọi phản hồi đều phải bao gồm một mô tả Commit ngắn gọn (sử dụng kỹ năng `commit-message`). Hãy để các thay đổi ở trạng thái chưa commit theo mặc định; KHÔNG BAO GIỜ tạo/sửa đổi (amend)/đẩy (push) một commit trừ khi người dùng yêu cầu rõ ràng.
13. Vai trò công việc không gắn với nhà cung cấp. Với nhiệm vụ giao một prompt, đọc `handoff/prompts/ORCHESTRATE.md` và `docs/08_AI_WORKFLOW_AND_BUDGET.md`: main agent điều phối và ghi trạng thái; subagent lập kế hoạch, triển khai, sửa, kiểm chứng và audit độc lập. Auditor mới không được là tác giả thay đổi đang kiểm. ChatGPT/Codex là tùy chọn; không bắt người dùng chuyển thủ công giữa nhà cung cấp để đạt gate.

## Skill dành cho agent

### Theo dõi issue

Issue được theo dõi trong GitHub Issues của `CDSemi/timesheet` qua CLI `gh`. Xem `docs/agents/issue-tracker.md`.

### Nhãn phân loại

Năm vai trò phân loại chuẩn có tên trùng với chuỗi nhãn (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Xem `docs/agents/triage-labels.md`.

### Tài liệu miền

Một context: một `GLOSSARY.md` và `docs/adr/` tại thư mục gốc repo. Xem `docs/agents/domain.md`.

### Tiêu chuẩn Giao diện & UI/UX Thống nhất (Tích hợp Bộ kỹ năng Taste Skills)
Bất cứ khi nào chỉnh sửa, tối ưu (refactor) hoặc tạo mới bất kỳ component hoặc giao diện UI nào cho C&D Semi, mày phải thực thi nghiêm ngặt sự kết hợp của ba skill: `stitch-design-taste`, `design-taste-frontend`, và `high-end-visual-design` theo quy trình thống nhất sau:

1. **Kiểm tra tính nhất quán đầu vào (Stitch Taste):** Trước khi viết bất kỳ dòng code nào, hãy chủ động quét file `tailwind.config.js`, các file CSS tổng và các component đã có sẵn. Đồng bộ chính xác mật độ khoảng cách (padding/margin), độ dày chữ và hệ màu sắc của doanh nghiệp. Tuyệt đối không tự chế phong cách lạ.
2. **Xây dựng khung xương & Bố cục (Frontend Taste):** Đảm bảo giao diện dạng lưới (Grid) với mật độ thông tin cao, phân cấp chữ nghiêm ngặt và responsive linh hoạt. Mọi thành phần phải có "khoảng thở" hợp lý và cấu trúc rõ ràng, phù hợp với giao diện thiết bị phần cứng bán dẫn B2B.
3. **Đánh bóng thẩm mỹ công nghiệp cao cấp (High-End Design):** Nâng tầm thị giác nhưng phải giữ nguyên sự nghiêm túc của ngành kỹ thuật:
  - **Hình khối:** Tránh các hình khối ngẫu hứng/vui nhộn. Giữ nguyên góc cạnh sắc nét bo nhẹ `4px / rounded` đã định nghĩa trong `brandkit`.
  - **Đổ bóng:** Đối với các thẻ sản phẩm hoặc nền tảng (Ví dụ: P8000, P9000), sử dụng hiệu ứng đổ bóng mịn nhiều lớp siêu mờ thay vì dùng đường viền thô cứng để tạo cảm giác máy móc công nghệ cao đắt tiền.
  - **Chuyển động:** Triển khai các tương tác vi mô mượt mà. Mọi trạng thái tương tác (`hover`, `active`, `focus`) của nút bấm và liên kết phải có hiệu ứng chuyển động mượt, không giật cục (`transition-all duration-300 ease-out`).
