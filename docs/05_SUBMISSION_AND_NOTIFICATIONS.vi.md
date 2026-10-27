# Nộp timesheet và thông báo

## Trạng thái độc lập

Theo dõi riêng revision (nháp/chốt), nhân viên xác nhận (chờ/đã ký), nguồn chốt (nhân viên/đến hạn), PDF (chờ/có/lỗi), gửi (xếp hàng/chuẩn bị/gửi/chấp nhận/lỗi/chưa rõ). Manager duyệt timesheet là tương lai; ghi nhận cho dùng OT không phải việc duyệt đó. Dịch vụ chấp nhận không chứng minh đã nhận/đọc. Ảnh ký không là sự kiện review.

## Luồng thủ công

Chuẩn bị payload review chính xác: loại ngày, bằng chứng/biến động OT, dữ liệu chưa đủ, quyết định thiếu, người nhận, email và ảnh chữ ký khi đã lưu. Preview không phải PDF nộp chính thức. Sign-off thủ công là hành động của chủ đang đăng nhập: nó ghi tên hiển thị của tài khoản (không gõ tên) và, khi đã lưu, cả ảnh chữ ký; chưa lưu ảnh thì chỉ ký bằng tên (quyết định của chủ F-5 b, 2026-10-21). Payload đã xem ràng buộc trạng thái ảnh, nên ảnh được lưu hoặc thay sau lúc xem làm yêu cầu thành xung đột review cũ. Sign-off rõ ràng gửi kèm phiên bản nháp kỳ vọng và hash đã xem.

Ký và gửi là hai hành động riêng (quyết định của chủ F-2 a, F-3 b và F-4, 2026-10-21; WP5-UX5-T01b). Sign-off kiểm chủ/phiên bản, chốt snapshot, ghi sign-off thật, ghi sổ và xếp job PDF trong một transaction; nó không gửi gì. Nội dung cũ trả xung đột. Sau đó chủ gửi revision đã ký: To, Cc, tiêu đề, nội dung và hai công tắc dòng PDF ("Dòng giờ trên PDF", "Dòng OT trên PDF") được chọn cho lần gửi đó, mặc định lấy từ Settings hiện tại. Mỗi lần gửi là một bản ghi bất biến riêng. Tạo mỗi biến thể PDF một lần từ snapshot, lưu/hash, rồi gửi đúng file đó với nội dung email riêng của lần gửi. Trạng thái gửi độc lập sign-off.

Giờ tùy chọn thiếu có thể để chờ sau xác nhận rõ; không bịa giờ. Sửa dữ liệu sai hoặc loại có audit.

## Đến hạn và phục hồi

Lưu due_at UTC từ quy tắc hạn theo múi giờ báo cáo. Runner không cần trình duyệt.

Một kỳ được tính là đã nộp khi bất kỳ revision nào của nó đã có một lần gửi (quyết định của chủ F-2 a ngày 2026-10-21 và H-1 a ngày 2026-10-22). Đến hạn, hệ thống nộp những gì chưa được nộp:

- Nháp chưa ký + bật: chốt loại ngày hợp lệ đã lưu—hoặc nhãn mặc định khi kỳ chưa lưu dữ liệu nào—là **tự động** (bản ghi giữ trạng thái chờ nhân viên xác nhận); chỉ ghi OT tính được/khoản trừ đã cho phép (ngày không có bản ghi không ghi OT và không tính thiếu); xếp PDF và gửi qua một bản ghi gửi có nguồn `deadline`, với phong bì và công tắc của Settings và không có lý do, trình bày như tài liệu 04.
- Revision đã ký nhưng chưa từng gửi + bật: gửi revision đã ký đúng như đã ký (một lần gửi `deadline` với phong bì và công tắc của Settings, không có lý do; audit `deadline.send_signed`). Không tạo revision mới và không đổi sổ.
- Tắt (nháp, hoặc revision đã ký chưa từng gửi): giữ nguyên, đánh dấu quá hạn và báo; không tự xuất/gửi.
- Đã nộp (một revision bất kỳ đã có lần gửi): tiếp tục các job hiện có, không chốt, ghi sổ hay gửi lại. Vì vậy một bản sửa hoặc review muộn sau đó không bao giờ được quét hạn gửi; chủ tự gửi.
- Race tay/đến hạn: chỉ một transaction thắng; bên kia tải lại. Không trùng revision, sổ hay gửi.

Ảnh ký tự động là một phép cho phép riêng, rõ ràng, có audit, cho một ảnh chữ ký đã lưu, được hỏi lúc tải ảnh chữ ký với tùy chọn chọn sẵn; user bỏ chọn thì tự nộp không có ảnh cho tới khi user cho phép sau trong Settings. PDF/email tự nộp gửi đi theo tài liệu 04 (không dấu hiệu tự động, dòng ghi chú tùy chọn). signed_at vẫn trống và không ghi sign-off; màn hình của chính nhân viên và thông báo kết quả luôn hiện là chờ xác nhận.

Ghi một automation_active_from cho toàn hệ thống khi chủ kích hoạt (trống cho tới lúc đó, nên không có gì tự chốt trước). Một kỳ chỉ đủ điều kiện khi due_at bằng/sau cả thời điểm đó và thời điểm hiệu lực tự nộp của user; loại lịch sử nhập. Sau downtime, xử lý hạn đủ điều kiện đã lỡ theo thứ tự với số lượng giới hạn. Đổi setting mặc định chỉ cho kỳ tương lai; áp dụng nháp đã quá hạn cần lựa chọn rõ. Thiếu sender/người nhận chặn gửi và báo lỗi, không ghi “đã gửi.”

Giới hạn theo tài khoản đối với tự nộp (cả hai chỉ thu hẹp những gì được nộp; không đổi đường nộp tay):

- Lúc tạo tài khoản (WP3-B-01; nguồn: quyết định của coordinator ngày 2026-10-05, phát hiện WP3-B-01, chủ có thể đảo ngược): tự nộp không bao giờ chốt kỳ có hạn đã qua trước khi tài khoản tồn tại (`users.created_at`). Giới hạn này cũng chặn cả lựa chọn áp dụng cho kỳ quá hạn nêu bên dưới. Kỳ mà tài khoản được tạo trong đó vẫn được nộp đúng hạn.
- Setting đã lưu (quyết định của chủ H-Q1 (a), 2026-10-05, tài liệu 10): tự nộp chỉ áp dụng cho tài khoản đã lưu setting nộp bài với tự nộp bật. Tài khoản chưa từng lưu thì không bao giờ được tự chốt, không ghi trạng thái quá hạn và không có lần gửi nào. Mặc định, kỳ có hạn đã qua trước khi lưu setting không được tự nộp; lựa chọn áp dụng cho kỳ quá hạn mà user chọn rõ khi lưu (vẫn bị chặn bởi lúc tạo tài khoản) là cách duy nhất để gồm các kỳ đó. Tắt tự nộp giữ nguyên nháp như quy tắc tắt ở trên.

## Nhắc và link review

Mặc định: trước hạn 24h, 2h; báo quá hạn nếu tắt tự nộp; báo kết quả sau tự nộp. Chống trùng theo user/kỳ/lần nhắc; ngừng nhắc thường khi kỳ đã nộp, tức là ở lần gửi đầu tiên (quyết định của chủ F-2 a ngày 2026-10-21 và H-1 a ngày 2026-10-22): một kỳ đã ký mà chưa gửi vẫn được nhắc, với lời "đã ký, chưa gửi". Gộp các nhắc trước hạn bị lỡ thành một thông báo hiện tại hữu ích.

Lời nhắc là ít nhất một lần (quyết định của chủ D-7 a, 2026-10-20). Job nhắc chạy lại sau sự cố thấy thư đã được ghi vào thư mục capture và coi như đã gửi; trên SMTP thật không có bản ghi như vậy, nên nếu tiến trình dừng sau khi máy chủ thư đã nhận thư và trước khi job được ghi là đã gửi thì lời nhắc có thể đến hai lần. Điều này được chấp nhận: lời nhắc chỉ mang tính tư vấn, và mất một lời nhắc có thể gây lỡ hạn. Lần gửi bài nộp không phải lời nhắc và giữ quy tắc kết quả không chắc chắn ở bảng gửi bên dưới.

Email bắt buộc; ntfy bảo vệ là tùy chọn; hoãn SMS. Thử lại kênh không đồng nghĩa đã review. Deep link yêu cầu login đủ cho bản đầu.

Nếu làm magic link: token ngẫu nhiên ngắn hạn, giới hạn hành động, lưu hash, gắn user/kỳ/revision, tiêu thụ một lần nguyên tử. GET—kể cả scanner—không ký/nộp/tiêu token. POST rõ cần origin/CSRF. Không cho toàn quyền tài khoản, không credential dùng lại hay dữ liệu riêng trong URL/log. Link cũ/hết hạn dẫn tới review/login mới.

## Gửi bền vững

Lưu job, khóa nghiệp vụ duy nhất, lượt thử, lease/gia hạn, giờ thử lại và phản hồi provider đã che nhạy cảm. Gợi ý 1, 5, 15, 60 phút rồi hiện can thiệp. Mục tiêu phát hiện trong một phút khi host khỏe; không hứa gửi đúng từng giây.

Mỗi lần gửi là một bản ghi bất biến với đúng một send job (WP5-UX5-T01b). Send job dựng thư chỉ từ bản ghi đó (phong bì, tiêu đề, nội dung và biến thể PDF của nó), không bao giờ từ phong bì trong snapshot hay setting hiện tại. Nó chờ tới khi PDF của biến thể đó sẵn sàng. Mỗi lượt thử đóng băng phong bì, digest nội dung và hash PDF. Yêu cầu gửi mang khóa chống lặp của chủ: cùng yêu cầu thì replay, nội dung khác dưới cùng khóa thì bị từ chối.

| Điểm lỗi | Xử lý |
|---|---|
| PDF trước gửi | Thử lại cùng snapshot, không ghi sổ |
| Chắc chắn trước truyền thư | Thử lại lỗi tạm; hiện lỗi cấu hình lâu dài |
| Từ chối rõ | Phân loại tạm/lâu dài |
| Xác nhận chấp nhận | Ghi xác nhận/ID/thời điểm |
| Mất tiến trình/kết nối sau khi có thể đã chấp nhận | Đánh dấu chưa rõ; hỏi trạng thái nếu provider hỗ trợ hoặc cần quyết định gửi lại rõ |

SMTP không bảo đảm gửi đúng một lần. Message-ID ổn định hỗ trợ đối chiếu nhưng không bảo đảm chống trùng. Lượt sending hết lease chưa rõ kết quả không được tự gửi lại mù. Chốt/sổ vẫn phải chống lặp dù kết quả bên ngoài chưa rõ.

## Sửa và gửi lại

Sửa cũ/đã chốt cần lý do và nháp sửa, giữ snapshot/PDF/sign-off/lượt gửi gốc. Chốt revision mới chỉ ghi chênh lệch sổ. Sửa không tự gửi lại: bản sửa và review muộn ký giống như sign-off và không bao giờ tự gửi.

Review muộn bản tự động tạo revision ký thật mới; tính không đổi thì delta bằng không. Nhân viên chọn rõ có gửi bản đã review hay không. Gửi cùng revision tạo một bản ghi gửi và lượt khác, không biến động sổ; `/resend` là lần gửi đó với giá trị của lần gửi trước. Đổi nội dung báo cáo cần revision bất biến mới được review; phong bì, tiêu đề, nội dung và công tắc dòng PDF được chọn cho từng lần gửi (quyết định của chủ F-4). Sau khi tự nộp, nhân viên có thể bổ sung bản ghi cho ngày chưa được tính OT rồi chốt bản sửa có lý do; ngày chưa có khoản cộng trước đó ghi khoản cộng đầu tiên, ngày khác chỉ ghi chênh lệch.

Gửi thêm một bản cần xác nhận và lý do gõ tay (quyết định của chủ F-4, 2026-10-21; kế hoạch B-A2):
- Một bản của kỳ được tính là đã gửi khi bất kỳ lượt gửi nào của bất kỳ revision nào của kỳ đã `accepted` hoặc `uncertain`, bất kể quyết định sau đó (thư có thể đã tới). Một lần gửi mà mọi lượt đều kết thúc `failed_permanent` thì không được tính, nên thử lại một lần gửi đầu thất bại không cần lý do.
- Khi đã có bản được tính, lần gửi cần lý do: 2-500 ký tự sau khi cắt khoảng trắng, NFC, không ký tự điều khiển trừ xuống dòng. Nếu không, lần gửi bị từ chối (422 `reason_required`) và không ghi gì. Quyết định "gửi lại" rõ ràng cho một lượt không chắc chắn cũng cần lý do.
- Lý do được lưu trên lần gửi và trong sự kiện audit của nó. Nó không bao giờ được thêm vào email.
- Việc kiểm tra chạy trong transaction gửi, nên hai lần gửi đồng thời không thể cùng bỏ qua nó. Một lần gửi đang chạy, hoặc một send job của bất kỳ revision nào của kỳ còn đang chờ, chặn lần gửi khác (409), nên bản gửi của revision cũ không thể đến sau bản của lần sửa. Một send job bị giữ sau khôi phục theo cùng quy tắc khi người vận hành giải phóng nó: việc giải phóng bị từ chối (`superseded_by_later_send`) chừng nào còn bất kỳ lần gửi nào muộn hơn của kỳ ([11 Operations runbook](11_OPERATIONS_RUNBOOK.md) mục 7).
- Các đường tự động không bao giờ cần lý do: chúng chỉ chạy cho kỳ chưa có lần gửi nào.

Tải lưu trữ cần quyền chủ hoặc quyền chia sẻ bật mục PDF (PDF có thể chứa ảnh chữ ký); file ảnh chữ ký không bao giờ được chia sẻ. Báo cáo OT riêng có ca gốc, nghỉ, quy tắc, số đủ điều kiện/ghi mỗi ngày, điều chỉnh và quyền dùng phép; không tự kèm email payroll.

Bản dịch của [05_SUBMISSION_AND_NOTIFICATIONS.md](05_SUBMISSION_AND_NOTIFICATIONS.md); tiếng Anh là nguồn chuẩn.
