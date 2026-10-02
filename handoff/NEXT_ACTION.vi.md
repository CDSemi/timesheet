# Bước tiếp theo: sửa F-01 của WP1, rồi review độc lập lại

**Hiện tại: WP1 đã review độc lập — FIX REQUIRED (2026-10-02); F-01 chưa sửa; WP2 chưa bắt đầu.** Đối chiếu [STATE](delivery/STATE.json), [DEVELOPMENT](../DEVELOPMENT.vi.md), [bàn giao WP1](delivery/WP1_HANDOFF.vi.md) và [review độc lập](delivery/WP1_REVIEW.vi.md). Bước tiếp theo của Claude là [FIX_FINDINGS](prompts/FIX_FINDINGS.md), chỉ sửa F-01: thay break đã lưu bằng bộ break thực tế được xác nhận lúc Clock out, thêm regression và chạy gate WP1 bắt buộc. Sau đó đưa source và handoff song ngữ cập nhật để review độc lập lại theo [WP1_REVIEW](prompts/WP1_REVIEW.md) tiếng Anh chuẩn. Chỉ bắt đầu WP2 sau khi lần kiểm lại trả PASS.

Dùng prompt này cho bước hiện tại:

~~~text
Đọc AGENTS.md, handoff/delivery/WP1_HANDOFF.md,
handoff/delivery/WP1_REVIEW.md và handoff/prompts/FIX_FINDINGS.md.
Chỉ tái hiện và sửa finding F-01 của WP1. Thêm regression có ý nghĩa,
chạy gate WP1 bắt buộc và cập nhật handoff WP1 song ngữ với bằng chứng
thực tế cùng một bước tiếp theo: review độc lập lại WP1. Trao đổi bằng
tiếng Việt. Giữ công việc không liên quan. Chưa triển khai WP2 hay commit/push.
~~~

Mục 1–4 giữ hướng dẫn khởi tạo lịch sử của gói docs r1.1 để tham khảo; không lặp lại trên repo đã triển khai. Từ ngày 30/09/2026, file này cùng `prompts/`, `templates/` và `delivery/` nằm trong `handoff/`, còn `fixtures/`, `examples/` và `inputs/` nằm trong `reference/`; các đường dẫn bên dưới theo bố cục đó, trừ danh sách kiểm tra khi giải nén r1.1 ở mục 1. **WP là work package**, một trong năm giai đoạn của lộ trình.

Ảnh bạn cung cấp xác nhận **Claude Max 20x**, thay cho giả định thận trọng 5x của bản trước. Giữ năm giai đoạn và ưu tiên usage trong gói; dự kiến sử dụng 2.500 credits ChatGPT dự trữ vẫn là 0. Ước lượng 16–23 phiên mô tả khối lượng, không phải quota hay yêu cầu mở từng ấy cuộc chat. Xem [tài liệu 08](../docs/08_AI_WORKFLOW_AND_BUDGET.vi.md).

## 1. Khởi tạo lịch sử: đặt tài liệu vào thư mục dự án

1. Giải nén TIMESHEET_WEB_DOCS_r1.zip vào một thư mục tạm.
2. Mở thư mục ngoài cùng TIMESHEET_WEB_DOCS_r1 vừa giải nén.
3. Copy **toàn bộ nội dung bên trong thư mục đó** vào thư mục gốc dự án, giữ các thư mục con và cả hai ngôn ngữ.
4. Kiểm tra các đường dẫn sau tồn tại:

~~~text
D:\DropBox\Work.CDsemi\timesheet\CLAUDE.md
D:\DropBox\Work.CDsemi\timesheet\AGENTS.md
D:\DropBox\Work.CDsemi\timesheet\NEXT_ACTION.vi.md
D:\DropBox\Work.CDsemi\timesheet\prompts\WP1_IMPLEMENT.md
~~~

Không cần thêm một lớp TIMESHEET_WEB_DOCS_r1 bên trong timesheet. Cách này đặt hướng dẫn dự án ngay tại thư mục Claude sẽ mở. Gói chứa đặc tả, prompt, ví dụ và workbook tham chiếu; Claude sẽ tạo source ứng dụng trong dự án này. Bạn đọc .vi.md để hiểu; AI dùng file .md tiếng Anh làm nguồn chuẩn.

Nếu đã giải nén bản trước nhưng chưa code, thay tài liệu bằng bản cập nhật này. Nếu đã triển khai, đối chiếu thay đổi tài liệu và giữ lại source, bàn giao hiện có.

Dropbox có thể chứa tài liệu và source. Đặt SQLite đang chạy và dữ liệu container đang hoạt động trên volume Docker/NAS cục bộ ngoài thư mục đồng bộ; xem tài liệu 07 về backup.

## 2. Khởi tạo lịch sử: mở Claude Code và chọn thiết lập

Cách khuyến nghị: tab **Code** trong Claude Desktop, đăng nhập tài khoản Max của bạn.

1. Tạo phiên, chọn **Local**, rồi chọn thư mục timesheet.
2. Chọn **Sonnet 5.5** và **High**. Phím tắt Windows mở menu model và effort: **Ctrl+Shift+I** và **Ctrl+Shift+E**.
3. Chọn **Accept edits** để triển khai. **Plan** là chế độ quyền riêng dành cho lập kế hoạch.

Xem [Claude Code Desktop](https://code.claude.com/docs/en/desktop). Kiểm tra thiết lập hiển thị. Nếu thiếu điều khiển/model, cập nhật client hoặc dùng phương án dự phòng ở tài liệu 08. Dùng đăng nhập subscription thay vì gắn thanh toán API.

**Bạn chọn model và effort trong client.** Prompt của bộ tài liệu chỉ đề xuất thiết lập, không tự cấu hình. Chọn khi bắt đầu giai đoạn hoặc phiên mới; không cần đặt lại trước mỗi tin nhắn tiếp theo nếu thiết lập hiển thị vẫn đúng. Effort điều khiển suy luận, không phải quyền sửa file. AI tự quyết chi tiết triển khai trong đặc tả, không quyết thiết lập thanh toán của bạn.

Nếu đã dùng Claude Code qua terminal, câu lệnh PowerShell sau là cách thay thế cho Desktop:

~~~powershell
Set-Location 'D:\DropBox\Work.CDsemi\timesheet'
claude --model claude-sonnet-5-5 --effort high
~~~

Đó là tham số khởi chạy, không phải nội dung prompt; xem [cấu hình model](https://code.claude.com/docs/en/model-config). Chọn một cách, tránh sửa đồng thời từ cả hai.

## 3. Khởi tạo lịch sử: prompt triển khai đầu tiên

Khi Claude Code đã mở đúng thư mục, dán đoạn sau vào ô giao việc. Không cần upload từng tài liệu hoặc tự copy toàn bộ prompt triển khai.

~~~text
Đây là thư mục gốc dự án Timesheet. Đọc CLAUDE.md và AGENTS.md, sau đó đọc
handoff/prompts/WP1_IMPLEMENT.md cùng các tài liệu tiếng Anh được chỉ định trong đó.

Hãy triển khai WP1 ngay, đúng phạm vi prompt. Giữ lại công việc đã có.
Trao đổi bằng tiếng Việt. Đặc tả tiếng Anh là nguồn chuẩn;
khi sửa tài liệu, cập nhật bản dịch .vi.md tương ứng.

Chạy các kiểm tra bắt buộc của WP1 và báo cáo kết quả thực tế. Lưu bàn giao
vào handoff/delivery/WP1_HANDOFF.md và handoff/delivery/WP1_HANDOFF.vi.md theo mẫu HANDOFF.
Nếu bị gián đoạn, lưu handoff/delivery/WP1_CHECKPOINT.md và bản dịch .vi.md,
ghi rõ một bước tiếp theo. Chưa bắt đầu WP2.
~~~

Claude cần kiểm tra dự án, viết code, chạy các kiểm tra thực hiện được và lưu bàn giao. Nếu thiếu công cụ phát triển trên máy, yêu cầu chỉ rõ thành phần đó và cách chuẩn bị. Quyền truy cập NAS, thông tin email thật và người nhận production là đầu vào setup sau này.

WP1 gồm khung ứng dụng, nền tảng database/đăng nhập và bộ tính giờ/OT. Luồng PDF/email hoàn chỉnh thuộc WP3, nên cuối WP1 chưa có phần này là đúng kế hoạch.

## 4. Khởi tạo lịch sử: bàn giao và gián đoạn

Cần có source, migration, test chạy được, câu lệnh/kết quả thực tế và hai file WP1_HANDOFF. Bàn giao phải nêu phần chưa test hoặc bị chặn. Chỉ nói hoàn thành là chưa đủ.

Nếu usage làm gián đoạn, tiếp tục cùng giai đoạn sau reset. Trong phiên cũ, yêu cầu Claude tiếp tục từ checkpoint đã lưu. Trong phiên mới, dùng [RESUME](prompts/RESUME.md) và chỉ rõ handoff/delivery/WP1_CHECKPOINT.md. Giữ nguyên thư mục dự án; không giải nén lại hay làm lại phần đã chấp nhận.

## 5. Chuyển WP1 cho ChatGPT Work/Codex review

Chọn **GPT-6.1 Sol / High / tốc độ Standard** nếu có; tài liệu 08 quy định phương án dự phòng. Trong ChatGPT Work, **Advanced** cho phép chọn riêng model/effort/tốc độ ở client hỗ trợ. Xem [hướng dẫn model chính thức](https://learn.chatgpt.com/docs/models).

Cung cấp source đã hoàn thành cho bên review:

- **Client lập trình cục bộ có quyền đọc thư mục:** mở cùng dự án, sau khi Claude đã ngừng sửa.
- **Chat không có quyền đọc thư mục Windows:** đính kèm ZIP source đầy đủ gồm code, manifest/lockfile dependency, migration, test, docs, bàn giao, bằng chứng test và revision/baseline source đã ghi nhận. Gõ đường dẫn D: không cấp quyền truy cập. Có thể nhờ Claude chuẩn bị ZIP review; loại thông tin bí mật, database thật, cache dependency/build và ảnh chữ ký riêng tư. Chỉ ZIP tài liệu ban đầu hoặc file bàn giao là chưa đủ.

Gửi:

~~~text
Đọc AGENTS.md, handoff/delivery/WP1_HANDOFF.md và handoff/prompts/WP1_REVIEW.md.
Review độc lập WP1 theo các đặc tả tiếng Anh được chỉ định.
Kiểm tra source được cung cấp và chạy các kiểm tra bắt buộc khi môi trường
cho phép. Phân biệt kết quả đã chạy với phần bị chặn hoặc chưa chạy.
Lưu handoff/delivery/WP1_REVIEW.md và handoff/delivery/WP1_REVIEW.vi.md theo mẫu REVIEW.
Trao đổi bằng tiếng Việt. Chưa triển khai WP2.
~~~

- **PASS:** tiếp tục WP2.
- **FIX REQUIRED:** giao Claude báo cáo review cùng [FIX_FINDINGS](prompts/FIX_FINDINGS.md), rồi nhờ bên review kiểm lại phần sửa.
- **NOT VERIFIED:** giải quyết phần thiếu source, môi trường hoặc bằng chứng trước. Bên review không có môi trường thực thi không thể chứng nhận test chưa chạy.

Nếu review trong môi trường chat riêng, tải các file review vào thư mục `handoff/delivery/` của dự án cục bộ trước khi giao Claude sửa. File tạo bên đó không tự xuất hiện trên máy Windows của bạn.

## 6. Lặp lại cho những giai đoạn sau

| Giai đoạn | Công việc chính | Claude | ChatGPT Work/Codex |
|---|---|---|---|
| WP1 | Nền tảng, quyền dữ liệu, bộ tính giờ/OT | Sonnet 5.5 / High | GPT-6.1 Sol / High / Standard |
| WP2 | UI lịch, settings, sổ OT | Sonnet 5.5 / Medium | GPT-6.1 Sol / Medium / Standard |
| WP3 | PDF, sign-off, thông báo/email theo lịch | Sonnet 5.5 / High | GPT-6.1 Sol / High / Standard |
| WP4 | Chuẩn bị Docker/NAS, import, backup/restore | Sonnet 5.5 / Medium | GPT-6.1 Sol / High / Standard |
| WP5 | Nghiệm thu, sửa mục tiêu, chủ hệ thống pilot | Sonnet 5.5 / Medium để sửa | GPT-6.1 Sol / High / Standard; review trước |

Dùng đúng handoff/prompts/WPn_IMPLEMENT.md và handoff/prompts/WPn_REVIEW.md. WP5 bắt đầu bằng review như [lộ trình](../docs/09_IMPLEMENTATION_ROADMAP.vi.md) quy định. Bắt đầu giai đoạn mới sau khi đạt điều kiện bắt buộc của giai đoạn trước; một giai đoạn có thể cần nhiều phiên. Ghi thiết lập thực tế nếu nhãn client khác.

Max 20x không đòi hỏi Opus cho mọi việc. Giữ một tác vụ coding đang hoạt động, xem usage còn lại và lưu checkpoint. Prompt không bật/tắt overage có phí; điều khiển thanh toán nằm trong settings tài khoản/workspace.

Bản dịch của [NEXT_ACTION.md](NEXT_ACTION.md); tiếng Anh là nguồn chuẩn.
