Bản dịch của [AGENTS.md](AGENTS.md); tiếng Anh là nguồn chuẩn.

# Hướng dẫn AI

File này là điểm vào chuẩn của hướng dẫn AI cho dự án.\
Nếu bất kỳ hướng dẫn nào trong repository mâu thuẫn với file này, file này được ưu tiên,
trừ khi chủ dự án ghi đè rõ ràng trong task hiện tại.

## Quy tắc vận hành

- Giao tiếp bằng ngôn ngữ của người yêu cầu.
- Dùng tiếng Anh cho tài liệu chuẩn, code, comment, API công khai, định danh, tên file,
  commit message, tài liệu kỹ thuật và ví dụ lệnh, trừ khi dự án yêu cầu rõ ràng khác.
- Runbook vận hành có bản dịch tiếng Việt `.vi.md` tương ứng đặt cạnh tài liệu tiếng Anh; tiếng Anh là nguồn chuẩn.
- Với các đầu ra khác, theo ngôn ngữ được yêu cầu rõ ràng; nếu không, theo hợp đồng đầu ra
  của skill áp dụng.
- Giữ các bản dịch `.<lang>.md` hiện có đồng bộ khi chỉnh sửa. Dùng hướng dẫn chuẩn làm
  nguồn chân lý; tham khảo bản dịch khi chỉnh sửa hoặc kiểm tra chúng.
- Thẳng thắn, thực tế và hiểu kiến trúc. Không giải thích quá mức những chi tiết hiển nhiên.
- Chỉ giải thích đánh đổi khi chúng ảnh hưởng đáng kể đến tính đúng đắn, độ tin cậy, khả năng
  bảo trì, độ chính xác production, khả năng phục hồi hoặc ý định của người dùng.
- Trước khi sửa, đọc task và hướng dẫn README liên quan; kiểm tra branch hiện tại, các file
  liên quan và thay đổi đang có. Dùng trạng thái repository thực tế.
- Chọn skill liên quan theo mô tả hiện tại của chúng và đọc đầy đủ hướng dẫn trước khi dùng.
- Giữ trong phạm vi được yêu cầu và bảo toàn việc không liên quan.
- Yêu cầu rõ ràng của người dùng có thể sửa quy ước repository. Báo các mâu thuẫn đáng kể;
  cập nhật hướng dẫn chung khi thay đổi vĩnh viễn quy ước chung.
- Nêu kế hoạch ngắn gọn trước các thay đổi lớn, phá hủy, nhạy cảm về bảo mật hoặc không đơn giản.
- Chỉ hỏi khi thiếu một quyết định chặn tiến độ đúng đắn hoặc an toàn; nếu không, đưa ra giả
  định tối thiểu an toàn nhất và tiếp tục.
- KHÔNG BAO GIỜ nói một lệnh, build, test, kiểm tra host, triển khai, migration, xác nhận
  hoặc release đã thành công trừ khi nó thực sự đã chạy và hoàn tất thành công.

## Chỉ dẫn tối thượng

> **Không đi đến kết luận cho đến khi có thể biện minh đó là kết luận tốt nhất có thể
> trong các ràng buộc, bằng chứng và bối cảnh dự án đã biết.**

Trước khi thiết kế, review hoặc triển khai: hiểu điều được yêu cầu; kiểm chứng các giả định
quan trọng với tài liệu, code, test và bằng chứng đã ghi hiện tại; cân nhắc một phương án
thay thế có ý nghĩa khi có; thách thức câu trả lời về giả định sai, ràng buộc bị bỏ sót và
độ phức tạp không cần thiết; dừng điều tra khi bằng chứng đã đủ.

Thực hiện thay đổi hoàn chỉnh nhỏ nhất. Không over-engineer, mở rộng phạm vi, hay thêm một
khái niệm hoặc dependency nếu không có ADR và nhu cầu của một bên dùng được nêu tên. Tách
bạch rõ hành vi đã triển khai, năng lực đã lên kế hoạch và thiết kế đề xuất.

## Hướng dẫn dự án

1. Đọc prompt đang làm trong `handoff/prompts/` (`handoff/NEXT_ACTION.md` cho biết prompt nào) và các tài liệu tiếng Anh được chỉ định. Tiếng Anh là nguồn chuẩn; giữ bản dịch `.vi.md` tương ứng. Trao đổi (chat) bằng tiếng Việt. Code, comment và hợp đồng API dùng tiếng Anh. Brief/kết quả task trong `handoff/delivery/tasks/` chỉ tiếng Anh; tiếng Việt giữ cho tài liệu cho người, prompt, mẫu, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW và chat.
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
12. Sau khi thay đổi tệp, mọi phản hồi đều phải bao gồm một mô tả Commit ngắn gọn (sử dụng kỹ năng `commit-message`). Chủ đã cho phép thường trực (2026-10-02, xem `docs/08_AI_WORKFLOW_AND_BUDGET.md`): chỉ `timesheet-committer` commit và push, theo quy tắc ở đó. Ngoài phép này, để thay đổi chưa commit và KHÔNG BAO GIỜ tạo/sửa đổi (amend)/đẩy (push) một commit trừ khi người dùng yêu cầu rõ ràng.
13. Vai trò công việc không gắn với nhà cung cấp. Với nhiệm vụ giao một prompt, đọc `handoff/prompts/ORCHESTRATE.md` và `docs/08_AI_WORKFLOW_AND_BUDGET.md`: main agent điều phối và ghi trạng thái; subagent lập kế hoạch, triển khai, sửa, kiểm chứng và audit độc lập. Auditor mới không được là tác giả thay đổi đang kiểm. ChatGPT/Codex là tùy chọn; không bắt người dùng chuyển thủ công giữa nhà cung cấp để đạt gate.

## Skill dành cho agent

### Theo dõi issue

Issue được theo dõi trong GitHub Issues của `CDSemi/timesheet` qua CLI `gh`. Xem `docs/agents/issue-tracker.md`.

### Nhãn phân loại

Năm vai trò phân loại chuẩn có tên trùng với chuỗi nhãn (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Xem `docs/agents/triage-labels.md`.

### Tài liệu miền

Một context: một `GLOSSARY.md` và `docs/adr/` tại thư mục gốc repo. Xem `docs/agents/domain.md`.

### Tiêu chuẩn giao diện và UI/UX
Khi sửa, tái cấu trúc hoặc tạo mới component hay giao diện UI, tuân theo các quy tắc sau. Các skill `stitch-design-taste`, `design-taste-frontend` và `high-end-visual-design` chỉ là tài liệu tham khảo tùy chọn để trau chuốt thị giác; khi chúng mâu thuẫn với mục này, với chính sách bảo mật nội dung (CSP), khả năng tiếp cận hoặc tài liệu 04 thì mục này và tài liệu 04 được ưu tiên (chỉ dùng font hệ thống, không dùng thư viện icon hay animation, không có animation khi xuất hiện, khi cuộn hay lặp vô hạn).

1. **Kiểm tra tính nhất quán trước khi làm:** Trước khi viết code, đọc `src/client/styles.css` (CSS custom property trong bộ sáng và cả hai bộ tối) và các component đã có. Dùng lại token cho màu, khoảng cách, bo góc, độ nổi (elevation), chuyển động và chữ; giá trị mới chỉ được thêm dưới dạng CSS custom property, và màu mới phải có ở cả hai bộ tối.
2. **Phong cách hiện đại, thân thiện cho ứng dụng doanh nghiệp:** Phân cấp rõ ràng, khoảng cách thoải mái và mật độ dễ đọc cho một ứng dụng chấm công của nhóm nhỏ, ưu tiên điện thoại trước và co giãn theo màn hình. Các bề mặt nổi dần từ nền trang lên thẻ, bảng, panel và menu bằng bóng đổ mềm nhiều lớp và đường viền mảnh; bo góc theo thang bán kính ghi trong tài liệu 04; một màu nhấn của thương hiệu; mọi màu trạng thái luôn đi kèm chữ hoặc hình.
3. **Trạng thái dễ tiếp cận:** Mọi phần tử tương tác có trạng thái nghỉ, hover (chỉ trên thiết bị có hover), nhấn, focus-visible, đã chọn hoặc đã tick, và vô hiệu hóa ở cả hai giao diện, đạt WCAG 2.2 AA (chữ 4.5:1, chỉ báo trạng thái và đường biên thành phần 3:1, vòng focus dùng chung, vùng chạm 44px dưới 768px và với con trỏ thô). Trạng thái không bao giờ chỉ thể hiện bằng màu.
4. **Chuyển động:** Trạng thái tương tác thay đổi qua CSS custom property dùng chung `--transition` (ngắn, có easing, chỉ các thuộc tính được liệt kê, không dùng `all`); tôn trọng `prefers-reduced-motion`; không có animation trang trí hay lặp vô hạn.
