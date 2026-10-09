# Ghi chú phát hành

Các ghi chú này xác định bản ứng viên phát hành của ứng dụng Timesheet, nêu mỗi gói công việc đã giao gì và liệt kê các giới hạn cùng rủi ro còn mang theo mà người dùng pilot hay người vận hành phải biết. Tiếng Anh là nguồn chuẩn; [12_RELEASE_NOTES.md](12_RELEASE_NOTES.md) là bản gốc của bản dịch này. Ghi chú không lặp lại các quy tắc: mỗi dòng trỏ tới tài liệu hoặc bước sổ tay sở hữu quy tắc đó. Các quyết định của chủ sở hữu D-1 đến D-15 nằm ở [WP5-PLAN](../handoff/delivery/tasks/WP5-PLAN.md) mục D. **Tất cả vẫn đang mở.** Dòng nào bên dưới theo một khuyến nghị đều được gắn nhãn "recommended; owner decision pending (D-n)" và không phải là một quyết định.

## Định danh bản phát hành

- **Commit phát hành và source digest.** Bản phát hành là commit đóng băng cuối gói WP5. SHA, source digest (`npm run digest`, không tính `handoff/`) và số file của commit đó được ghi trong [bàn giao WP5](../handoff/delivery/WP5_HANDOFF.vi.md) và trong bản ghi của cổng kiểm. Chúng không được viết ở đây, vì một tài liệu không thể chứa digest của cây thư mục có chính nó. Trước khi thêm các ghi chú này, mã nguồn là commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` với digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` trên 777 file.
- **Phiên bản.** `package.json` ghi `0.1.0`, cùng giá trị với bản build WP3 trước đó. Phiên bản không xác định bản phát hành; commit và digest mới xác định (R-B5-1).
- **Image ID.** Ghi lại image ID khi image được build trên máy chủ: `docker image inspect --format '{{.Id}}' <image>` ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 1 bước 8). Trong lần review độc lập, build lại cùng mã nguồn cho image ID khác nhau dù các file ứng dụng giống hệt, nên tag `timesheet:<release-commit>` không bao giờ được dùng lại cho một lần build lại (R-B5-1).
- **Image nền.** Dockerfile ghim image nền Node theo digest của chỉ mục đa kiến trúc. Lần review thấy bản ghim chậm một lần build lại của Debian so với tag vào ngày 2026-10-06; hãy quyết định việc làm mới trước khi build cho pilot ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 9; R-B5-2).
- **Tuyên bố phát hành.** Chưa có bản phát hành nào được tuyên bố và chưa có tag. Bản phát hành đầu tiên được tuyên bố khi chủ sở hữu cho phép pilot; từ đó các bản sửa đi qua nhánh và pull request ([08 Quy trình AI](08_AI_WORKFLOW_AND_BUDGET.vi.md)). Recommended; owner decision pending (D-14). Agent không tạo tag.

## Phạm vi theo gói

- **WP1, nền tảng và tính toán thời gian.** TypeScript nghiêm ngặt, Hono và React với migration SQLite, đăng nhập cục bộ có kiểm tra quyền sở hữu, lịch và chính sách có phiên bản, sinh kỳ công và một engine thời gian và OT duy nhất cho production (biên N/M, ngày nghỉ, giờ bắt đầu linh hoạt, qua đêm, DST). Quy tắc: [02 Thời gian và OT](02_TIME_AND_OT_RULES.vi.md).
- **WP2, không gian cá nhân và sổ OT.** Màn hình hai tuần, sửa chấm công, nhập tay và giờ nghỉ, nghỉ một phần, cài đặt, nhập ngày lễ, quản lý người dùng, lịch sử và audit, xuất bằng chứng OT, và sổ cái giao dịch với phép đã ghi, đặt trước, dùng một phần và hiệu chỉnh. Quy tắc: [01 Sản phẩm](01_PRODUCT_REQUIREMENTS.vi.md), [03 Kiến trúc](03_ARCHITECTURE_AND_DATA.vi.md).
- **WP3, ký xác nhận, PDF và nộp.** Snapshot bất biến, ký xác nhận rõ ràng kèm ảnh chữ ký, PDF, bộ chuyển mail capture và SMTP, job bền, nhắc việc, tự động nộp theo hạn với thời điểm kích hoạt, chia sẻ do chủ sở hữu cấp và trạng thái quản trị. Quy tắc: [05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md).
- **WP4, triển khai, phục hồi và nhập.** Image ghim chạy không phải root cùng ví dụ Compose, bootstrap production một lần, backup trực tuyến nhất quán có dọn, restore cô lập có tạm dừng gửi ra ngoài và đối soát, nâng cấp và rollback, nhập workbook chỉ cho chủ sở hữu với số dư mở đầu tường minh, và bản diễn tập vận hành. Quy tắc: [07 Vận hành](07_DEPLOYMENT_AND_OPERATIONS.vi.md); các bước: [11 Sổ tay](11_OPERATIONS_RUNBOOK.vi.md).
- **WP5, nghiệm thu độc lập và chuẩn bị pilot.** Đánh giá độc lập bản ứng viên WP1 đến WP4 (quy trình tích hợp; phát hành, restore và vận hành), hai bản sửa tài liệu sổ tay (ràng buộc Compose và bản sao file env), bài test hai tuần tích hợp (AC-13), và các ghi chú này cùng các mục kích hoạt pilot, hủy kích hoạt và thẻ rollback trong sổ tay (mục 13 đến 16). Biên bản nghiệm thu của WP5 nằm ở [bàn giao WP5](../handoff/delivery/WP5_HANDOFF.vi.md).
- **Vòng thay đổi WP5, thiết kế lại UI (yêu cầu của chủ sở hữu ngày 2026-10-08).** Các màn hình được thiết kế lại cho dễ dùng; quy tắc nghiệp vụ, PDF và phép tính của server không đổi. Vòng này cần cổng kiểm và audit độc lập mới của riêng nó trước khi kích hoạt pilot, nên định danh bản phát hành ở trên chỉ được làm mới sau đó. Điều người dùng thấy ([04 UX](04_UX_AND_SETTINGS.vi.md); quyết định của chủ ở [10 Quyết định](10_DECISIONS_AND_SOURCES.vi.md)):
  - **Timesheet theo biểu mẫu Excel.** Trang hiện bố cục của workbook Excel và PDF: phần đầu biểu mẫu, hai tuần từ thứ Hai đến Chủ nhật với các dòng Day, Date, Label, Time và OT, một dòng Check nêu trạng thái từng ngày bằng chữ và hình, các dòng "Show details", ô "Overtime Total :" và các dòng chữ ký (không có ảnh chữ ký). Cuối tuần, ngày lễ và ngày đóng cửa theo lịch công ty có nền nhạt kèm sọc, và hôm nay được đánh dấu. Ngày, thời lượng và giờ viết như trên PDF (ngày kiểu Mỹ, h:mm, 24 giờ). Trên điện thoại mỗi tuần là một bảng bốn cột gọn, không cuộn ngang.
  - **Điều hướng mới.** Thanh trên cùng trên desktop (Timesheet, Overtime, History, Settings, và Admin cho quản trị viên) và thanh tab dưới trên điện thoại với menu More (Settings, Import, Admin, Sign out). "OT" nay gọi là "Overtime"; Import mở từ Settings hoặc More.
  - **Thanh kỳ và đồng hồ.** Một thanh hiện kỳ, trạng thái duy nhất của kỳ, ngày payroll, hạn nộp bằng chữ và "Review & sign off". Một nút Clock in / Clock out cho biết bạn đang vào ca hay chưa. "Change several days" mở chế độ sửa nhiều ngày khi cần thay vì luôn hiện.
  - **Trình sửa ngày.** Bảng bên cạnh trên desktop và bottom sheet trên điện thoại, đặt giờ lên đầu, xác nhận giờ nghỉ gợi ý bằng một chạm, nghỉ nhập theo giờ và phút, và chọn nhãn trực tiếp trong ô của bảng. Lý do và xác nhận xung đột hoạt động như trước.
  - **Review.** "What you sign" hiện đúng bảng người dùng ký, với các dòng chi tiết bật, cạnh checklist ba bước (ngày cần chú ý, email và PDF, ký).
  - **Không tái tạo từ Excel.** Các công thức của workbook mâu thuẫn với quy tắc chuẩn (OT 8,5 giờ mỗi ngày, tổng không có Chủ nhật, giờ thập phân và các ngày lấy từ TODAY()) không được sao chép; app hiện giá trị của server.
  - **Vòng sau.** Overtime, History và Settings giữ bố cục hiện tại và sẽ được làm lại giao diện ở vòng sau (quyết định E-7 của chủ).

## Sẵn sàng phần mềm, phép của chủ sở hữu và kết quả pilot

Đây là các sự thật tách biệt ([06 Nghiệm thu](06_TEST_AND_ACCEPTANCE.vi.md)).

- **Sẵn sàng phần mềm** nghĩa là các cổng kiểm và audit độc lập của các gói đã đạt trên dữ liệu tổng hợp ở chế độ capture trên máy trạm của nhà phát triển. Điều này ghi trong các bàn giao gói và không phải là tuyên bố về NAS.
- **Phép của chủ sở hữu** là sự cho phép rõ ràng của chủ sở hữu để gửi thật và kích hoạt. Phép này chưa được xin và chưa được cấp trong bản phát hành này; chưa có gì được triển khai và chưa gửi email thật.
- **Kết quả pilot** là điều chủ sở hữu quan sát được trong một kỳ thật khi vẫn còn workbook Excel. Hiện chưa có.
- **Nhà cung cấp chấp nhận và người nhận đã nhận** cũng là hai sự thật tách biệt: việc nhà cung cấp chấp nhận một thư không chứng minh có ai đã nhận hay đã đọc ([05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md)).
- Đích NAS CHƯA ĐƯỢC KIỂM CHỨNG cho tới khi chủ sở hữu đánh dấu danh sách ở [sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 2 (recommended; owner decision pending (D-13)). Nếu chưa, kết quả là "phần mềm sẵn sàng, pilot đang chờ".

## Giới hạn đã biết và rủi ro còn mang theo

Mỗi dòng nêu giới hạn và nơi có quy tắc hoặc bước. Không dòng nào là lỗi đã biết chặn pilot; lần đánh giá độc lập không thấy lỗi toàn vẹn, riêng tư hay nộp nào có tính chặn.

### Nộp và thư

- **Nhắc lặp lại sau sự cố ở SMTP thật (D-7).** Một lời nhắc có thể gửi hai lần nếu tiến trình dừng giữa lúc gửi (ít nhất một lần). Lời nhắc chỉ mang tính tư vấn. Khuyến nghị: chấp nhận; owner decision pending (D-7). [05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md) "Gửi bền vững".
- **Lỗi chứng chỉ TLS bị xếp là tạm thời (D-8).** Kiểm tra chứng chỉ thất bại đến bộ chuyển SMTP dưới dạng lỗi socket, nên việc gửi được thử lại rồi kết thúc ở bước can thiệp hiển thị thay vì thất bại ngay. Khuyến nghị: coi đó là lỗi cấu hình vĩnh viễn; owner decision pending (D-8). Trước đó, một lần gửi lỗi sau khi đổi chứng chỉ hoặc máy chủ là vấn đề cấu hình cần kiểm tra trước ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 13).
- **Gửi trước khi có PDF.** Lần gửi chạy trước khi PDF tồn tại được thử lại một lần sau khoảng một phút; đây là lần thử lại đã được ghi, không phải lỗi ([05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md)).
- **SMTP thật chưa được quan sát.** Chế độ capture không cho thấy hành vi thật của nhà cung cấp. Chỉ quan sát được trong kỳ đầu theo giai đoạn ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 13).
- **Tài khoản chưa từng cấu hình (WP3 R8, R-WA3).** Khi tự động nộp đã kích hoạt, tài khoản chưa từng lưu cài đặt nộp, kể cả tài khoản quản trị tạo bởi bootstrap, vẫn nhận lời nhắc trước hạn. Hãy lưu cài đặt của mọi tài khoản, hoặc chỉ dùng các tài khoản đã có, trước khi kích hoạt ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 16).
- **Hash của payload đã xem có chứa số dư OT (WP3 R4).** Một lần xem có thể cũ đi sau khi OT biến động; hãy tải lại và xem lại.
- **Cho phép ký xác nhận trước khi hết kỳ (WP3 R5).** Một cách hiểu đã được chấp nhận của [05 Nộp](05_SUBMISSION_AND_NOTIFICATIONS.vi.md).
- **Sự kiện seed hiện là tự động (WP3 R9).** Chỉ với dữ liệu seed tổng hợp; seed bị từ chối ở production.
- **Nhãn ngày lễ dài bị cắt bằng dấu ba chấm trong PDF (WP3 R1, R-WA6).** Chủ sở hữu đánh giá trên mẫu pilot.
- **Nghỉ một phần không hiện trên PDF (R-WA2).** Một ngày làm 4 giờ và nghỉ 4 giờ in ra như giờ làm kèm OT của nó; số phút nghỉ không xuất hiện. Chủ sở hữu quyết định bộ phận lương có cần chúng không.
- **Ngày không có bản ghi hiện "Worked" trên PDF tự động (R-WA8).** Đây là quyết định F-1 và F-Q1 của chủ sở hữu (không có dấu hiệu tự động, nhãn mặc định), xem [10 Quyết định](10_DECISIONS_AND_SOURCES.vi.md); mẫu pilot sẽ hiển thị điều này.
- **Thông báo kết quả sau khi phục hồi do ngừng chạy chưa chính xác (R-WA1).** Thông báo nói kỳ được nộp "tại hạn" dù bản nộp được phục hồi tạo ra muộn hơn; ngày trên PDF là đúng.
- **Giờ nghỉ chưa xác nhận.** Clock out bị từ chối với 422 khi còn dòng nghỉ chưa xác nhận, và dòng nghỉ tương lai trên phiên đang mở cũng bị từ chối; hãy xác nhận giờ nghỉ trước ([02 Thời gian và OT](02_TIME_AND_OT_RULES.vi.md)).

### Tài khoản, nhập và số dư

- **Mật khẩu tạm (D-9).** Chưa có tự đổi mật khẩu. Pilot chỉ dành cho chủ sở hữu và mật khẩu tạm được đặt ngoài kênh; hãy thêm route đổi mật khẩu trước khi đưa người khác vào. Recommended; owner decision pending (D-9). [Sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 3 bước 5.
- **Số dư mở đầu và lịch sử (D-10).** Ghi một số dư mở đầu có bằng chứng, hoặc bắt đầu từ 0, và không nhập lịch sử cho pilot. Recommended; owner decision pending (D-10). [Sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 10.
- **Việc nhập từ chối workbook có hơn 64 sheet (R-B4-3).** Chỉ liên quan nếu nhập lịch sử.
- **Các lựa chọn còn mở của chủ sở hữu và mặc định an toàn hiện tại** (không mục nào dưới đây phụ thuộc câu trả lời):
  - D-2 (WP4-I-1): kỳ nháp không bao giờ nhận ngày nhập.
  - D-3 (WP4-I-2): "Off day (overtime used)" bị bỏ qua.
  - D-4 (WP4-I-3): kỳ chưa kết thúc hoặc chưa đến hạn chỉ cho phép bỏ qua.
  - D-5 (WP4-I-4): hiệu chỉnh số dư mở đầu về net bằng 0 bị từ chối.
  - D-6 (WP4-I-5): bản xem trước nhập chưa commit không có hạn mức.
  - D-15 (F-Q6): bản xem trước ngày lễ không giữ số đếm theo ngày.

### Vận hành

- **Phần dư của rollback (R-A3, D-1).** Job tạo sau khi rollback về schema cũ hơn không bị giữ: bản build cũ chạy với `JOB_RUNNER=off` cho tới khi đối soát. Recommended; owner decision pending (D-1). [Sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 8 và 15.
- **Nhiều tiến trình cùng mở CSDL mới (R-A2).** Hãy khởi động một instance và chờ nó khỏe trước khi tiến trình nào khác mở CSDL mới ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 16).
- **CLI quay về CSDL phát triển khi thiếu `DATABASE_PATH` (R-A8).** Production từ chối khi thiếu đường dẫn; hãy giữ cả hai đường dẫn tường minh khi dùng CLI trên máy chủ ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 16).
- **Dọn backup cùng ngày xóa backup trước nâng cấp đã ghép đôi (R-RA2, R-B5-5).** Hãy chép backup đó sang chỗ khác, hoặc dọn vào ngày khác ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 8 và 16).
- **Restore lên junction treo (R-RA9).** Hãy restore vào một thư mục thật mới ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 16).
- **Trạng thái backup sau restore (R-B5-4).** Instance đã restore báo backup là `never` cho tới backup đầu tiên của chính nó ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 7).
- **Khoảng trống của trạng thái.** Kết quả lần `--prune` gần nhất không được ghi, lần chạy retention chỉ có trong JSON, và một lần gửi đang bị giữ không thể bỏ (chỉ release hoặc để nguyên) ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 5, 7 và 12).
- **Định danh image và image nền (R-B5-1, R-B5-2).** Xem "Định danh bản phát hành".
- **NAS CHƯA ĐƯỢC KIỂM CHỨNG (D-13).** Xem "Sẵn sàng phần mềm, phép của chủ sở hữu và kết quả pilot".
- **Thời điểm kích hoạt không có màn hình.** Trạng thái quản trị hiển thị nó; ghi hoặc xóa nó là một lệnh gọi API ([sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 13).

## Tóm tắt cài đặt

Đây là chỉ dẫn, không phải bản sao. Hãy làm các bước theo thứ tự này và chỉ giữ giá trị thật trong bản riêng của chủ sở hữu ngoài git (recommended; owner decision pending (D-11)).

1. Kiểm tra NAS và cài đặt: [sổ tay](11_OPERATIONS_RUNBOOK.vi.md) mục 1; đánh dấu danh sách ở mục 2.
2. Bootstrap quản trị viên đầu tiên: mục 3. Cài đặt và trình tự thiết lập: [07 Vận hành](07_DEPLOYMENT_AND_OPERATIONS.vi.md) "Trình tự setup".
3. Lên lịch và thử backup, retention, restore cô lập và cảnh báo độc lập từ máy chủ: mục 4 đến 7 và 11.
4. Chuẩn bị gói pilot, rồi chỉ sau khi chủ sở hữu cho phép mới kích hoạt: mục 13 và 14; thẻ rollback là mục 15 và các ghi chú cho người vận hành là mục 16.
5. Nâng cấp và rollback: mục 8. Nhập: mục 10.
