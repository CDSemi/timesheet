# UX và settings

## Màn hình

| Màn hình | Hành vi |
|---|---|
| Khung ứng dụng | Desktop: thanh trên cùng gồm Timesheet, Overtime, History, Settings và, với admin, Admin, kèm tên người dùng và Sign out. Điện thoại: thanh trên gọn và thanh tab dưới gồm Timesheet, Overtime, History và More; More chứa Settings, Import, Admin (chỉ admin) và Sign out. Import (workbook và số dư đầu của chính người dùng) mở từ một liên kết trong Settings trên desktop và từ More trên điện thoại; địa chỉ cũ vẫn dùng được. Review thuộc mục Timesheet và không có mục riêng |
| Timesheet | Biểu mẫu quen thuộc từ workbook Excel và PDF (xem "Bảng Timesheet"): thanh kỳ, bảng đồng hồ, thanh công cụ (Open a day, Show details, Change several days), bảng timesheet, Overtime Total và các dòng chữ ký |
| Sửa ngày | Bảng bên cạnh bảng timesheet từ 1200px và bảng modal (bottom sheet trên điện thoại) dưới 1200px: ca thực, ngày kết thúc, nghỉ xác nhận, nhãn, phút nghỉ nhập theo giờ và phút kèm `leave_kind` (vacation, sick, ot), WFH, ghi chú, các số gốc/đủ điều kiện/ghi do server tính (xem "Sửa ngày (Day editor)") |
| Review | "What you sign": cùng bảng timesheet ở chế độ chỉ đọc với các dòng chi tiết luôn bật, cạnh checklist ba bước (ngày cần chú ý kèm xác nhận và lựa chọn trừ, email và PDF kèm người nhận, ký). Nội dung chính xác, OT dự kiến, bằng chứng thiếu, preview chữ ký, Sign off & Submit rõ |
| Sổ OT/phép (Overtime) | Số dư đã ghi/tạm/giữ/khả dụng, bằng chứng ngày, điều chỉnh; ghi cho phép, giữ chỗ, "ghi đã dùng" (record use: rõ ràng, idempotent, vào hoặc sau ngày nghỉ, cho phép một phần), hủy/đảo |
| Lịch sử | Revision/PDF bất biến, nguồn tay/tự động, lượt gửi, sửa có lý do và gửi lại rõ |
| Settings/admin | Quy tắc/template riêng và chia sẻ (cấp, đổi hoặc thu hồi theo từng mục); user, lễ năm, sender, quyền chia sẻ và trạng thái nộp/gửi từng người kèm người nhận, không có chi tiết timesheet |
| Timesheet được chia sẻ | Người được chia sẻ mở các mục được chia sẻ của chủ từ "Được chia sẻ với tôi" với thanh cố định ghi tên chủ và các mục; thao tác ngoài quyền bị ẩn và server từ chối |

Dùng giờ/phút, không dùng 1.30 để chỉ 1h30. Hiện múi giờ xem và ngày ghi sổ đã lưu. Luồng thường không đưa thuật ngữ DB/job. Không seed giờ thực từ lịch.

## Mặc định đề xuất

| Thiết lập | Mặc định |
|---|---|
| Lịch thường / múi giờ báo cáo | Thứ Hai–Sáu / America/Los_Angeles |
| Múi giờ hiển thị | Thiết bị/hiện tại; không ảnh hưởng phép tính |
| Tham chiếu / công cần | 08:00–17:00 / 480 phút |
| Nghỉ | Loại 15+30+15; gợi ý dịch theo ca, cần xác nhận |
| N / M | Vượt 30 nghiêm ngặt / 30 gần nhất, đúng giữa xuống |
| Giờ ngoài lịch thường | Tất cả đủ điều kiện, không B/N, cùng M |
| Thiếu giờ | ignore; tùy chọn auto_deduct hoặc choose_at_signoff |
| Payroll / hạn | Mốc 02/10/2026, mỗi 14 ngày; thứ Ba trước đó 17:00 |
| Nhắc trước | 24 giờ và 2 giờ |
| Tự nộp chưa ký | Bật tùy chọn sau setup sender; gửi thật vẫn tắt tới lúc kích hoạt |
| Ảnh ký tự động | Hỏi lúc tải ảnh chữ ký như một phép cho phép rõ ràng, có audit, chọn sẵn; nếu bỏ chọn thì tự nộp không có ảnh cho tới khi user cho phép sau trong Settings |
| Dòng ghi chú khi tự nộp | Tắt; khi bật, PDF và email hiện nội dung của user (mặc định "Automatic submission") |
| Hiện OT trên PDF | Bật; có thể ẩn mà không xóa sổ |
| Thông báo / outbound | Email, ntfy tùy chọn / ban đầu dry-run |

Đây là mặc định thiết kế được ghi rõ, không khẳng định tất cả đã được bạn xác nhận. Quy tắc/lịch cần ngày hiệu lực. Xem trước thay đổi mặc định tương lai/nháp, giữ override rõ và revision bất biến; cảnh báo thiếu lịch lễ năm tới.

## Bảng Timesheet

Trang Timesheet hiện biểu mẫu của workbook Excel và PDF. Khối đầu gồm công ty, tiêu đề, "Employee:", "Payroll Date:" và "Period:". Hai dải "WEEK 1" và "WEEK 2", mỗi dải chạy từ thứ Hai đến Chủ nhật với các dòng Day, Date, Label, Time, OT (h:mm) và Check. Check là dòng duy nhất biểu mẫu Excel không có: nó nêu trạng thái từng ngày bằng chữ và hình, không bao giờ chỉ bằng màu (Complete, Running, Open session, Confirm breaks, No times, Missing record, Upcoming, Calculation problem). "Show details" thêm hai dòng "Worked on a workday" và "Worked on a day off". Dưới các tuần là chú giải, ô "Overtime Total :" và các dòng chữ ký.

- Ô Label: nhãn của app (Worked, Off, Vacation, Sick, Holiday, Shutdown), tên ngày lễ cho Holiday, một dòng thứ hai cho làm việc tại nhà hoặc số phút nghỉ bằng OT, và dấu ghi chú. "Sick Day" và "Off Day (Overtime Used)" của Excel không được đưa lại: nghỉ bằng OT vẫn là phút nghỉ với `leave_kind` ot (tài liệu 10, E-2 ngày 2026-10-03). Ngày không có bản ghi không hiện chữ giữ chỗ; ô trống để trống.
- Mọi con số là trường do server trả về, hiển thị dạng h:mm. Client không tính phút nghiệp vụ. Ô OT theo quy tắc của PDF: phút được ghi của ngày đầy đủ, "pending" khi ngày chưa đủ hoặc nghỉ chưa xác nhận, để trống khi ngày không có bản ghi. "Overtime Total :" là tổng OT được ghi tạm tính của server cho cả 14 ngày, gồm hai Chủ nhật, kèm ghi chú khi còn ngày đang chờ; con số này bằng tổng trên PDF. Các công thức Excel mâu thuẫn với quy tắc chuẩn không được tái tạo (tài liệu 10, 2026-10-08).
- Định dạng giống PDF: ngày kiểu Mỹ (MM/DD trong ô, MM/DD/YYYY ở phần đầu và thanh kỳ), thời lượng dạng h:mm, giờ dạng khoảng 24 giờ như 08:00-17:00 theo múi giờ hiển thị, liệt kê nhiều ca và đánh dấu ca đang chạy. Ngày ghi sổ vẫn là ngày theo múi giờ báo cáo đã lưu.
- Ngày không làm việc (cuối tuần, ngày lễ và ngày đóng cửa từ lịch của server, không suy ra từ thứ trong tuần) có một nền nhạt kèm sọc chéo mảnh. Hôm nay có thanh nhấn phía trên và nhãn "Today". Ô cần nhập có nền hổ phách cùng chữ và hình trong dòng Check.
- Dòng chữ ký: "Employee Signature" hiện tên người ký khi đã ký, hoặc trạng thái chờ xác nhận, kèm ngày theo múi giờ báo cáo đã lưu và liên kết tới Review. "Manager Signature" hiện "Not used yet" với ô ngày trống. Ảnh chữ ký không bao giờ xuất hiện trên trang Timesheet. Các dòng này và liên kết không có trong chế độ xem chia sẻ và với kỳ đã nhập.
- Điện thoại (dưới 768px): mỗi tuần là một bảng bốn cột Day | Label | Time | OT, mỗi ngày một hàng cao ít nhất 54px, không cuộn ngang; trạng thái Check gộp vào ô Day và màu ô Time. Chạm cả hàng sẽ mở trình sửa ngày. Màn hình đầu hiện thẻ kỳ (với "<" và ">" cạnh tiêu đề), thẻ đồng hồ một hàng và các công cụ gọn, nên hàng ngày đầu tiên hiện đầy đủ phía trên thanh tab ở 390x844; tiêu đề trang và tiêu đề biểu mẫu chỉ dành cho trình đọc màn hình. Cả hai bố cục chỉ có đúng một phần tử cho mỗi ngày, đặt tên theo thứ và ngày, kèm một nút ngày có tên truy cập chứa đúng chữ hiển thị và giữ ngày kế toán (WCAG 2.2 SC 2.5.3): "Edit {MM/DD} ({date})" trên bảng timesheet, ví dụ "Edit 09/28 (2026-09-28)", và "Edit {weekday} {MM/DD} ({date})" trên điện thoại, ví dụ "Edit Mon 09/28 (2026-09-28)"; khi chỉ đọc thì "View" thay cho "Edit".
- Review dùng cùng bảng này. Trong chế độ xem chia sẻ, thanh chia sẻ vẫn nằm trên thanh kỳ và các điều khiển ngoài quyền chia sẻ bị ẩn.

## Thanh kỳ, đồng hồ và chế độ nhiều ngày

- Thanh kỳ: một tiêu đề (ngày của kỳ và nhãn hiện tại, quá khứ hoặc tương lai), ngày payroll, hạn nộp bằng chữ kèm múi giờ báo cáo (ví dụ "Due Tue 12/08/2026, 17:00 (America/Los_Angeles)"), đúng một nhóm trạng thái (review và gửi) và "Review & sign off" (bị khóa kèm lý do với kỳ đã nhập). Thanh luôn nêu ngắn gọn múi giờ đang xem (ví dụ "Times in America/Los_Angeles"), kể cả khi trùng múi giờ báo cáo; mỗi ngày trong bảng giữ ngày ghi sổ đã lưu. Múi giờ báo cáo, múi giờ hiển thị, hạn theo giờ hiển thị và lời giải thích ngày ghi sổ so với giờ phiên chỉ hiện trong một ghi chú thêm khi múi giờ hiển thị khác múi giờ báo cáo. Một dòng báo khi sửa kỳ cần lý do.
- Bảng đồng hồ: một nút theo trạng thái. Khi chưa vào ca hiện "Clock in"; khi đang vào ca hiện "Clocked in since HH:MM" với chấm vòng tĩnh và "Clock out", nút mở bước xác nhận giờ nghỉ. Nút không có trong chế độ xem chia sẻ (đồng hồ của chủ vẫn là của chủ).
- Thanh công cụ: "Open a day" (mọi ngày, kể cả ngoài kỳ đang hiển thị), "Show details" và "Change several days". Chế độ nhiều ngày mặc định tắt: ô chọn, "Select all", "Clear", ô chọn loại ngày ("Category for selected days") và "Preview changes" chỉ hiện sau "Change several days" và mất khi bấm "Done". Đổi loại nhiều ngày vẫn xem trước xung đột với giờ đã ghi trước khi lưu. Khi không có quyền sửa (chia sẻ chỉ xem) và với kỳ đã nhập, các điều khiển này bị ẩn hoặc khóa kèm lý do.

## Sửa ngày (Day editor)

- Từ 1200px: bảng bên không chặn trang, nằm trong cột riêng cạnh bảng timesheet nên bảng timesheet vẫn thấy được và dùng được. Từ 768 đến 1199px: bảng bên dạng modal ở mép phải, trang phía sau bị vô hiệu (tiêu điểm ở lại trong bảng) nên bảng không bao giờ che một điều khiển còn nhận được tiêu điểm. Điện thoại (dưới 768px): bottom sheet dạng modal cao tối đa 86% màn hình. Tiêu điểm chuyển tới tiêu đề của bảng khi mở; Escape đóng bảng dù tiêu điểm đang ở đâu (hộp thoại lồng bên trong nhận Escape trước), Close cũng vậy, và tiêu điểm trở về nút ngày của ngày đó.
- Thứ tự: dòng trạng thái, các thông báo cũ/thông tin/lỗi và ô lý do (kỳ cũ hoặc đã chốt), "Times" (các ca với Edit và Delete, xác nhận giờ nghỉ một chạm, Add session), "Label and leave", và "Figures (computed by the server)". Ngày kết thúc rõ ràng, trường "Input zone" nhìn thấy được và các nút lưu riêng ("Save session", "Save day fields") vẫn giữ.
- Giờ nghỉ một chạm: ca có giờ nghỉ chưa xác nhận hiện "Confirm suggested breaks" (hoặc "Confirm breaks as listed" cho dòng đã lưu) và "No breaks taken"; mỗi nút gửi đúng lệnh cập nhật ca mà biểu mẫu gửi và bị khóa tới khi nhập lý do bắt buộc. Gợi ý chỉ được đưa ra khi mọi giờ nghỉ gợi ý nằm trong ca đã lưu.
- Nghỉ nhập theo "Leave hours" cộng "Leave minutes" với "Leave kind"; trang đổi chúng về đúng `leave_minutes` nguyên (0 đến 1440) và từ chối số lẻ hoặc ngoài khoảng bằng thông báo trên trang.
- Nhãn ngay trong ô: trên bảng sửa được, ô Label là bộ chọn (Worked, Off, Vacation, Sick, Holiday, Shutdown và "Work from home" = Worked kèm WFH) dùng được bằng chuột hoặc bàn phím. Lựa chọn trước hết được gửi như một preview batch một mục và chỉ lưu ngay khi preview không cần lý do và không xung đột với giờ đã ghi; nếu không, hộp thoại có sẵn ("Review label change for {date}") yêu cầu xác nhận hoặc lý do. Bộ chọn không có trong chia sẻ chỉ xem, trong chế độ nhiều ngày và với kỳ đã nhập.

## Sửa và review

Clock out/lưu xác nhận gợi ý/nghỉ thật/không nghỉ. Chưa biết nghỉ hoặc ca mở để OT chờ. Hiện rõ ngày ra khi qua đêm. Sửa nhiều loại ngày phải hiện xung đột giờ đã ghi và không âm thầm xóa. Làm ngày lễ giữ cả phân loại lễ và ca thực.

Sửa nháp hiện tại/tương lai tự audit không lý do; cũ/đã chốt cần lý do. Review đánh dấu giả định công, OT chưa đủ và thiếu dự kiến. Nhân viên có thể xác nhận OT tùy chọn còn thiếu và nộp loại ngày. Dữ liệu sai phải sửa hoặc loại bằng thao tác có audit. Tự nộp dùng loại ngày hợp lệ đã lưu; kỳ chưa lưu dữ liệu nào thì dùng nhãn mặc định (FR-03). Ngày không có bản ghi không được tính OT và không tính thiếu giờ; ngày chưa đủ giữ OT ở trạng thái chờ. Nhân viên có thể bổ sung bản ghi sau và sửa kỳ (tài liệu 05).

Nghỉ: màn Sửa ngày hiện cảnh báo không chặn khi số phút nghỉ loại `ot` của ngày khác số phút đã tiêu của yêu cầu nghỉ liên kết. Cảnh báo không bao giờ tiêu hay giải phóng OT. Cách duy nhất để tiêu OT nghỉ đã giữ là thao tác "Record use" của nhân viên; giữ chỗ chưa dùng vẫn hiện là đang giữ.

## Chuẩn hình ảnh

CSS custom properties thuần trong `src/client/styles.css`; chỉ dùng bộ font hệ thống (chính sách bảo mật nội dung không cho web font), số, giờ và OT dùng bộ font monospace. Giá trị mới được thêm dưới dạng custom property, không dùng giá trị tùy tiện.

- Hình dạng và độ sâu: bo góc 4px (`--radius`); panel và card dùng bóng đổ mềm nhiều lớp, khuếch tán (`--shadow-panel`, `--shadow-overlay`) thay cho viền cứng.
- Chuyển động: một token transition dùng chung (`--transition`, 300 ms ease-out) cho trạng thái hover, active và focus của nút và liên kết; nút đang nhấn dịch một khoảng nhỏ theo token. Không có animation khi vào hay cuộn; tôn trọng tùy chọn giảm chuyển động và chấm ca đang chạy là tĩnh.
- Nút: primary (nền màu nhấn), secondary (card viền màu nhấn) và quiet (chữ màu nhấn), mỗi loại có vòng focus nhìn thấy được (một token dùng chung: vòng màu nhấn đặc với khe màu card, độ tương phản tối thiểu 3:1 trên mọi bề mặt ở cả hai giao diện).
- Chạm: điều khiển cao ít nhất 44px (`--tap-min`) dưới 768px và với con trỏ thô.
- Các vai trò màu theo trạng thái ngày (đường kẻ và đầu bảng, nền ngày không làm việc kèm sọc, hôm nay, cần nhập, đang chọn, đang chạy) có giá trị sáng và tối. Trạng thái không bao giờ chỉ bằng màu: luôn có chữ hoặc hình.
- Bố cục mật độ cao, ưu tiên mobile; giao diện sáng và tối theo thiết bị.

## Email và PDF

Biến: {EmployeeName}, {PeriodStart}, {PeriodEnd}, {PayrollDate}, {SignOffStatus}, {SubmissionId}, {Revision}. Từ chối biến lạ; escape HTML và kiểm người nhận. Có preview lúc setup/review. Email thường không tự kèm ghi chú OT riêng hay bằng chứng duyệt. {SignOffStatus} hiển thị "Submitted" cho mọi lần nộp, hoặc nội dung dòng ghi chú khi bản tự nộp bật dòng ghi chú.

PDF: header công ty, tiêu đề salaried-exempt timesheet, nhân viên, payroll, hai khối thứ Hai–Chủ nhật, ngày/loại, dòng giờ/OT tùy chọn, tổng OT được ghi dạng h:mm của cả 14 ngày, gồm hai Chủ nhật (ẩn cùng dòng OT khi tắt Hiện OT trên PDF), tên/ảnh/ngày ký nhân viên và chữ ký/ngày manager trống nếu chưa có duyệt thật tương lai. Dùng Letter dọc, font Unicode nhúng, nhãn dài đọc được, ảnh ký có giới hạn. Bỏ header năm cũ. Có mã nộp/revision và tên file an toàn.

Sign-off thủ công cần cả tên nhân viên và ảnh chữ ký tải lên đã kiểm hợp lệ. Thiết lập ảnh khi tự nộp chưa ký là riêng.

PDF và email gửi đi của bản tự nộp không có dấu hiệu tự động: khối chữ ký in tên nhân viên và ngày tự nộp theo múi giờ báo cáo đã lưu; ảnh chữ ký chỉ xuất hiện khi user đã cho phép dùng ảnh tự động; dòng ghi chú chỉ xuất hiện khi user bật (mặc định tắt; user sửa nội dung, mặc định "Automatic submission"). Hệ thống vẫn ghi revision là tự động, chờ nhân viên xác nhận, signed_at trống và không có sign-off, và màn hình của chính nhân viên hiện điều đó. Ảnh ký được cho phép trước vẫn không tạo signed_at hay sign-off thật. Có thể xuất báo cáo bằng chứng OT riêng khi user chọn.

Bản dịch của [04_UX_AND_SETTINGS.md](04_UX_AND_SETTINGS.md); tiếng Anh là nguồn chuẩn.
