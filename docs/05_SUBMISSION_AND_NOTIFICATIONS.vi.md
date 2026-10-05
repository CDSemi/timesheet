# Nộp timesheet và thông báo

## Trạng thái độc lập

Theo dõi riêng revision (nháp/chốt), nhân viên xác nhận (chờ/đã ký), nguồn chốt (nhân viên/đến hạn), PDF (chờ/có/lỗi), gửi (xếp hàng/chuẩn bị/gửi/chấp nhận/lỗi/chưa rõ). Manager duyệt timesheet là tương lai; ghi nhận cho dùng OT không phải việc duyệt đó. Dịch vụ chấp nhận không chứng minh đã nhận/đọc. Ảnh ký không là sự kiện review.

## Luồng thủ công

Chuẩn bị payload review chính xác: loại ngày, bằng chứng/biến động OT, dữ liệu chưa đủ, quyết định thiếu, người nhận, email và ảnh chữ ký. Preview không phải PDF nộp chính thức. Sign-off thủ công cần tên nhân viên và ảnh chữ ký tải lên. Sign off & Submit rõ ràng gửi kèm phiên bản nháp kỳ vọng và hash đã xem.

Kiểm chủ/phiên bản, chốt snapshot, ghi sign-off thật, sổ và job trong một transaction. Nội dung cũ trả xung đột. Tạo PDF riêng từ snapshot, lưu/hash, rồi gửi đúng file và email đã đóng băng. Trạng thái gửi độc lập sign-off.

Giờ tùy chọn thiếu có thể để chờ sau xác nhận rõ; không bịa giờ. Sửa dữ liệu sai hoặc loại có audit.

## Đến hạn và phục hồi

Lưu due_at UTC từ quy tắc hạn theo múi giờ báo cáo. Runner không cần trình duyệt.

- Nháp chưa ký + bật: chốt loại ngày hợp lệ đã lưu—hoặc nhãn mặc định khi kỳ chưa lưu dữ liệu nào—là **tự động** (bản ghi giữ trạng thái chờ nhân viên xác nhận); chỉ ghi OT tính được/khoản trừ đã cho phép (ngày không có bản ghi không ghi OT và không tính thiếu); xếp PDF/email, trình bày như tài liệu 04.
- Tắt: giữ nháp, đánh dấu quá hạn và báo; không tự xuất/gửi.
- Đã chốt: tiếp tục job hiện có, không chốt/ghi sổ lại.
- Race tay/đến hạn: chỉ một transaction thắng; bên kia tải lại. Không trùng revision, sổ hay gửi.

Ảnh ký tự động là một phép cho phép riêng, rõ ràng, có audit, cho một ảnh chữ ký đã lưu, được hỏi lúc tải ảnh chữ ký với tùy chọn chọn sẵn; user bỏ chọn thì tự nộp không có ảnh cho tới khi user cho phép sau trong Settings. PDF/email tự nộp gửi đi theo tài liệu 04 (không dấu hiệu tự động, dòng ghi chú tùy chọn). signed_at vẫn trống và không ghi sign-off; màn hình của chính nhân viên và thông báo kết quả luôn hiện là chờ xác nhận.

Ghi một automation_active_from cho toàn hệ thống khi chủ kích hoạt (trống cho tới lúc đó, nên không có gì tự chốt trước). Một kỳ chỉ đủ điều kiện khi due_at bằng/sau cả thời điểm đó và thời điểm hiệu lực tự nộp của user; loại lịch sử nhập. Sau downtime, xử lý hạn đủ điều kiện đã lỡ theo thứ tự với số lượng giới hạn. Đổi setting mặc định chỉ cho kỳ tương lai; áp dụng nháp đã quá hạn cần lựa chọn rõ. Thiếu sender/người nhận chặn gửi và báo lỗi, không ghi “đã gửi.”

Giới hạn theo tài khoản đối với tự nộp (cả hai chỉ thu hẹp những gì được nộp; không đổi đường nộp tay):

- Lúc tạo tài khoản (WP3-B-01; nguồn: quyết định của coordinator ngày 2026-10-05, phát hiện WP3-B-01, chủ có thể đảo ngược): tự nộp không bao giờ chốt kỳ có hạn đã qua trước khi tài khoản tồn tại (`users.created_at`). Giới hạn này cũng chặn cả lựa chọn áp dụng cho kỳ quá hạn nêu bên dưới. Kỳ mà tài khoản được tạo trong đó vẫn được nộp đúng hạn.
- Setting đã lưu (quyết định của chủ H-Q1 (a), 2026-10-05, tài liệu 10): tự nộp chỉ áp dụng cho tài khoản đã lưu setting nộp bài với tự nộp bật. Tài khoản chưa từng lưu thì không bao giờ được tự chốt, không ghi trạng thái quá hạn và không có lần gửi nào. Mặc định, kỳ có hạn đã qua trước khi lưu setting không được tự nộp; lựa chọn áp dụng cho kỳ quá hạn mà user chọn rõ khi lưu (vẫn bị chặn bởi lúc tạo tài khoản) là cách duy nhất để gồm các kỳ đó. Tắt tự nộp giữ nguyên nháp như quy tắc tắt ở trên.

## Nhắc và link review

Mặc định: trước hạn 24h, 2h; báo quá hạn nếu tắt tự nộp; báo kết quả sau tự nộp. Chống trùng theo user/kỳ/lần nhắc; ngừng nhắc thường khi đã chốt. Gộp các nhắc trước hạn bị lỡ thành một thông báo hiện tại hữu ích.

Email bắt buộc; ntfy bảo vệ là tùy chọn; hoãn SMS. Thử lại kênh không đồng nghĩa đã review. Deep link yêu cầu login đủ cho bản đầu.

Nếu làm magic link: token ngẫu nhiên ngắn hạn, giới hạn hành động, lưu hash, gắn user/kỳ/revision, tiêu thụ một lần nguyên tử. GET—kể cả scanner—không ký/nộp/tiêu token. POST rõ cần origin/CSRF. Không cho toàn quyền tài khoản, không credential dùng lại hay dữ liệu riêng trong URL/log. Link cũ/hết hạn dẫn tới review/login mới.

## Gửi bền vững

Lưu job, khóa nghiệp vụ duy nhất, lượt thử, lease/gia hạn, giờ thử lại và phản hồi provider đã che nhạy cảm. Gợi ý 1, 5, 15, 60 phút rồi hiện can thiệp. Mục tiêu phát hiện trong một phút khi host khỏe; không hứa gửi đúng từng giây.

| Điểm lỗi | Xử lý |
|---|---|
| PDF trước gửi | Thử lại cùng snapshot, không ghi sổ |
| Chắc chắn trước truyền thư | Thử lại lỗi tạm; hiện lỗi cấu hình lâu dài |
| Từ chối rõ | Phân loại tạm/lâu dài |
| Xác nhận chấp nhận | Ghi xác nhận/ID/thời điểm |
| Mất tiến trình/kết nối sau khi có thể đã chấp nhận | Đánh dấu chưa rõ; hỏi trạng thái nếu provider hỗ trợ hoặc cần quyết định gửi lại rõ |

SMTP không bảo đảm gửi đúng một lần. Message-ID ổn định hỗ trợ đối chiếu nhưng không bảo đảm chống trùng. Lượt sending hết lease chưa rõ kết quả không được tự gửi lại mù. Chốt/sổ vẫn phải chống lặp dù kết quả bên ngoài chưa rõ.

## Sửa và gửi lại

Sửa cũ/đã chốt cần lý do và nháp sửa, giữ snapshot/PDF/sign-off/lượt gửi gốc. Chốt revision mới chỉ ghi chênh lệch sổ. Sửa không tự gửi lại.

Review muộn bản tự động tạo revision ký thật mới; tính không đổi thì delta bằng không. Nhân viên chọn rõ có email bản đã review hay không. Gửi lại PDF không đổi tạo lượt khác trên cùng revision, không biến động sổ. Đổi nội dung báo cáo hoặc phong bì người nhận cần revision bất biến mới được review. Sau khi tự nộp, nhân viên có thể bổ sung bản ghi cho ngày chưa được tính OT rồi chốt bản sửa có lý do; ngày chưa có khoản cộng trước đó ghi khoản cộng đầu tiên, ngày khác chỉ ghi chênh lệch.

Tải lưu trữ cần quyền chủ hoặc quyền chia sẻ bật mục PDF (PDF có thể chứa ảnh chữ ký); file ảnh chữ ký không bao giờ được chia sẻ. Báo cáo OT riêng có ca gốc, nghỉ, quy tắc, số đủ điều kiện/ghi mỗi ngày, điều chỉnh và quyền dùng phép; không tự kèm email payroll.

Bản dịch của [05_SUBMISSION_AND_NOTIFICATIONS.md](05_SUBMISSION_AND_NOTIFICATIONS.md); tiếng Anh là nguồn chuẩn.
