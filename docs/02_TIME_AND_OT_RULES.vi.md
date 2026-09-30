# Quy tắc thời gian và OT

Tài liệu này phụ trách phép tính. Giữ đầu vào gốc, phiên bản quy tắc/lịch và biến động sổ giải thích được.

## R-01 — đơn vị và độ đầy đủ

Lưu thời điểm UTC tới giây, ngày ghi sổ thuần riêng và phút nguyên trong sổ. Khoảng nửa mở [start,end); kết thúc sau bắt đầu. Từ chối chồng lấn cùng user trên mọi ngày ghi sổ; nghỉ phải nằm trong ca và không chồng lấn. Ca mở/thiếu hoặc chưa biết nghỉ là chưa đủ, không phải không làm. Không tự ghi cộng/trừ từ đó.

Trừ nghỉ loại trừ đã xác nhận; cộng giây trước rồi lấy xuống phút hoàn chỉnh một lần cho mỗi tổng ngày thường/ngoài lịch. Giữ giây làm bằng chứng. Nhập phút lưu :00; clock trực tiếp giữ giây. Không làm tròn từng phiên.

## R-02 — lịch và giờ vào linh hoạt

Mặc định B=480 phút thực làm, lịch 08:00–17:00. Nghỉ bị loại: 10:00–10:15, 12:00–12:30, 14:30–14:45 (tổng 60 phút). Loại cả ba là diễn giải thiết kế rõ cho sổ nội bộ, không phải phân loại tính lương.

Mỗi nghỉ có vị trí, thời lượng và `counts_as_work`. Gợi ý mặc định dịch theo clock-in đầu: vào 09:00 thì nghỉ 11:00, 13:00 và 15:30. Xác nhận gợi ý, sửa thực tế hoặc xác nhận không nghỉ lúc lưu/Clock out/review. Chưa biết khác với xác nhận không nghỉ; không trừ nghỉ tương lai của ca ngắn/mở.

Giờ đủ công = giờ vào thật + giờ cần làm + nghỉ/gián đoạn bị loại. Với nghỉ 60 phút, vào 07:00/08:00/09:00 tương ứng ra 16:00/17:00/18:00. Chỉ sớm/muộn hơn giờ tham chiếu không tạo OT/thiếu. Kiểm nhất quán thời lượng lịch tham chiếu, phút cần làm và nghỉ.

## R-03 — ngày ghi sổ và điều kiện

Ca qua đêm thường thuộc `work_date` lúc bắt đầu theo múi giờ IANA báo cáo đã lưu (mặc định America/Los_Angeles). Nhiều phiên dùng chung một B/ngày. Đổi múi giờ trình duyệt hoặc qua nửa đêm không đặt lại mốc.

Chia giờ thực làm ròng tại ranh giới ngày theo múi giờ báo cáo. R = phút trong ngày làm theo lịch, loại lễ/đóng cửa công ty; O = phút ngoài lịch đó. Lễ/đóng cửa ưu tiên hơn thứ. Nhãn nghỉ/Off cá nhân không đổi loại lịch.

Ví dụ mặc định: thứ Sáu 22:00–thứ Bảy 02:00 không nghỉ cho R=120, O=120, OT=120, ghi vào thứ Sáu. Thứ Hai 22:00–thứ Ba 07:00 trừ nghỉ 60 cho R=480, O=0, OT=0. B/N/M dùng quy tắc hiệu lực ngày ghi sổ; phân loại lịch dùng phiên bản hiệu lực tại từng ngày của đoạn ca.

## R-04 — công thức theo ngày

Mặc định B=480, N=30, M=30; đều phút nguyên, B>0, N>=0, M>=1.

1. Phút dư E=max(0,R−B).
2. Phút thường đủ điều kiện A=E chỉ khi E>N; nếu không A=0.
3. Toàn bộ O đủ điều kiện; không áp dụng B hay N.
4. Tổng đủ điều kiện T=A+O.
5. Làm tròn T một lần/ngày ghi sổ tới bội M gần nhất; đúng giữa xuống. Với q=floor(T/M), r=T mod M, credit=M×(q+1 nếu 2r>M, nếu không là q).

N kích hoạt điều kiện, không phải khoản bị trừ. M áp dụng cả hai loại. Tách số gốc, đủ điều kiện và ghi sổ. Chỉ dùng JavaScript Math.round sẽ sai quy tắc đúng giữa.

| Dư ngày thường | Ghi sổ |
|---:|---:|
| 30 | 0 |
| 31 | 30 |
| 45 | 30 |
| 46 | 60 |
| 75 | 60 |
| 76 | 90 |

Ngày hoàn toàn ngoài lịch: làm 120 cộng 120; 15 đủ điều kiện nhưng tròn còn 0; 16 cộng 30. Hai ngày riêng dư 20 mỗi ngày đều cộng 0. Không bù trừ theo tuần/kỳ hai tuần.

## R-05 — thiếu giờ

Chỉ giờ thực đầy đủ/đã xác nhận trên ngày theo lịch có yêu cầu hiện diện mới tạo thiếu. L là phút phép đáp ứng công, tối đa B: cần=max(0,B−L); thiếu=max(0,cần−(R+O)). O qua đêm đáp ứng công đồng thời vẫn đủ điều kiện OT riêng. Phép không là thực làm và không giảm mốc OT thường B.

Off/Holiday/Vacation/Sick/Shutdown cả ngày không làm không cộng/trừ. Thiếu bản ghi vẫn là chưa đủ. Làm bốn giờ + nghỉ bốn giờ không thiếu và không OT.

Chế độ: `ignore` mặc định, `auto_deduct`, `choose_at_signoff`. Trừ đúng phút thiếu, không dùng N/M. Review tay hiện quyết định; tự nộp ở chế độ chọn để chờ, không trừ. Thiếu số dư khả dụng thì đề xuất trừ chờ, không âm thầm âm. Các khoản cộng đã biết vẫn có thể ghi.

## R-06 — sổ và nghỉ bằng OT

OT nháp là tạm tính. Chốt revision bất biến thủ công/tự động ghi khoản cộng tính được và khoản thiếu đã cho phép đúng một lần trong transaction, độc lập dịch vụ chấp nhận email. Nguồn tự động vẫn chưa xác nhận. Ngày chưa đủ không ghi; gửi thử lại không ghi lần nữa.

Đổi nhãn nghỉ không tiêu OT. Ghi manager cho phép rõ: tên/định danh, ngày, bằng chứng, do user ghi lại hay duyệt xác thực trong tương lai. Giữ chỗ phút đã duyệt, tiêu vào ngày nghỉ, hủy chưa dùng giải phóng, đảo đã dùng tạo khoản bù. Hỗ trợ một phần; mặc định 1:1, tám giờ trừ 480, không phải 510.

Số dư đã ghi=tổng delta; khả dụng=đã ghi−giữ chỗ hiệu lực. Chống dùng trùng đồng thời bằng transaction. Khóa nguồn duy nhất chống ghi trùng. Sửa khoản cộng bằng chênh lệch: cũ 60 → mới 90 chỉ +30. Liên kết revision gốc/sửa. Sửa đúng lịch sử có thể làm âm; giữ và báo đối chiếu, không xóa phép đã dùng.

## R-07 — lịch sử và múi giờ

Quy tắc/lịch có phiên bản và ngày hiệu lực; thay đổi áp dụng về sau, không âm thầm viết lại snapshot đã chốt. Sửa cũ giữ quy tắc lịch sử trừ khi chủ động chọn sửa quy tắc hồi tố có ghi nhận riêng.

Hiện tại là payroll được cấu hình sớm nhất bằng/sau hôm nay theo múi giờ báo cáo. Kỳ cũ chưa gửi vẫn là cũ. Nháp hiện tại/tương lai không cần lý do; kỳ cũ hoặc revision đã chốt đều cần. Luôn audit người sửa, UTC và trước/sau.

Dùng `signed_at` thật, không TODAY(). Nhập giờ tay phải hiện và dùng múi giờ nhập đã chọn, mặc định múi giờ hiển thị hiện tại; quy đổi phải giữ ngày ghi sổ đã lưu. Hiển thị thời điểm theo múi giờ người xem nhưng giữ ngày ghi sổ. PDF/hạn dùng múi giờ báo cáo đã lưu. Từ chối giờ DST không tồn tại; yêu cầu offset/fold rõ cho giờ mơ hồ. Thời lượng là thời gian UTC trôi qua.

Xem [hướng dẫn fixture](../fixtures/README.vi.md) cho kết quả mẫu độc lập.

Bản dịch của [02_TIME_AND_OT_RULES.md](02_TIME_AND_OT_RULES.md); tiếng Anh là nguồn chuẩn.
