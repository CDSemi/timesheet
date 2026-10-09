# Review độc lập: thiết kế lại UI WP5, vùng A

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP5, vùng A (tính toàn vẹn nghiệp vụ, múi
  giờ, đường sửa, chia sẻ, cô lập, riêng tư, PDF); 2026-10-09; task WP5-UX-AUDIT-A lần 1 (lần bàn
  giao đầu, rồi tiếp tục theo chỉ thị của coordinator); model tự báo claude-opus-5-5, không yếu hơn
  tác giả mạnh nhất (claude-opus-5-5); effort theo lệnh giao.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không: 831f760838950a59f0e5c880f0bbefda15fe0c61,
  digest 3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 (789 file, không tính
  `handoff/`). HEAD = origin/main = 5beae2f (chỉ bản ghi handoff); không có commit chưa push. Bản
  export sạch bằng `git archive` của 831f760 có đúng 789 file của cây.
- Quyết định: **FIX REQUIRED**
- Phạm vi thật đã xem/chạy: diff 014bd47..831f760 của `src` và `tests`; mọi đường ghi phía client đã
  đổi và body của chúng; các model hiển thị mới (`sheetModel`, `periodBarModel`, `dayEditorModel`,
  `labelPickerModel`, `leaveInputModel`, `reviewModel`) và các component sheet; các kiểm tra bắt
  buộc; probe Playwright của tôi cho R-07, AC-04, AC-16/AC-01, riêng tư và ô nhập nghỉ trên 831f760,
  và probe nhập nghỉ trên bản build sạch của 014bd47.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (đều trong `handoff/delivery/evidence/WP5-UX-AUDIT-A/`):

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest lúc bắt đầu, lúc bàn giao đầu, lúc tiếp tục và lúc kết thúc | luôn là 3d274c9e (ls-tree, export sạch, repository) | `00-digest.txt`, `11-digest-continuation.txt` |
| `npm ci` (Node v24.21.0) | exit 0; "1 high severity vulnerability" (giải thích bên dưới) | `01-npm-ci.txt` |
| `npm test` | exit 0; 82 file, 1817 test đạt | `02-npm-test.txt` |
| `npm run build` | exit 0 | `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual trên cả hai project | exit 0; 94 test: 90 đạt, 4 bỏ qua theo spec (desktop 2 test chỉ cho mobile, mobile 2 test pdf-visual), 0 lỗi | `04-e2e.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit`, `npm audit --omit=dev`, `npm ls`/`npm explain source-map-js` | toàn bộ: exit 1, một mức cao (`source-map-js` chỉ dev); bỏ dev: exit 0, 0 | `06-npm-audit.txt` |
| diff phạm vi và diff chỗ gọi API phía client | server và PDF không đổi; domain chỉ thêm `formatHoursMinutes`; hai chỗ gọi mới phía client trên endpoint có sẵn với dạng body có sẵn | `10-scope.txt` |
| probe của tôi R-07, AC-04, AC-16/AC-01, riêng tư (cả hai project) | 8 đạt | `42-audit-a-probe-run.txt`, `r07-*`, `ac04-*`, `sharing-*`, `privacy-*` |
| probe nhập nghỉ của tôi trên 831f760 (cả hai project) và 014bd47 (desktop) | tái hiện WP5-UX-A-01 | `40-leave-probe-runs.txt`, `leave-*.json.txt` |

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:

| ID | Mức | File:dòng | Tái hiện / bằng chứng | Kỳ vọng / thực tế | Quy tắc | Sửa bắt buộc |
|---|---|---|---|---|---|---|
| WP5-UX-A-01 | Trung bình | `src/client/components/DayFieldsForm.tsx:60-61` (`noValidate`) cùng `src/client/components/leaveInputModel.ts:29-33` (chuỗi rỗng tính là 0) | Trình sửa ngày, cùng phím gõ trên hai commit: 831f760 gõ giờ "2-", phút 30 -> "Day fields saved.", PUT `leave_minutes` 30, lưu 30; giờ 4, phút "3-" -> lưu 240; giờ "2-", phút 0 -> lưu 0 và mất loại nghỉ (desktop và điện thoại). 014bd47 với "2-", "150-", "e" -> form không hợp lệ (`badInput`), không gửi PUT, không lưu gì | Kỳ vọng: giá trị nhập sai bị từ chối kèm thông báo như ở 014bd47. Thực tế: ô nhập sai bị đọc thành 0 và một giá trị nghỉ khác được lưu | brief mục 2 ("giữ nguyên kiểm tra hiện có"); docs/04 dòng 62; AGENTS quy tắc 8 | Coi `validity.badInput` là không hợp lệ (đưa cờ vào draft để `parseLeaveInput`/`buildDayEntryRequest` trả về `LEAVE_INPUT_MESSAGE`, hoặc giữ kiểm tra gốc của trình duyệt cho hai ô này); thêm unit test và bước e2e gõ giá trị sai, kiểm tra có thông báo và không có PUT; sau đó freeze, gate và re-audit mới cho vùng A |

- Đã đạt trong vùng A (tôi tự tái hiện, ngoài các kiểm tra bắt buộc):
  1. Không đổi hành vi nghiệp vụ: `src/server` (kể cả PDF) không có diff; thay đổi domain là một hàm
     định dạng hiển thị bằng với hàm của PDF; `api.ts` không đổi; hai đường ghi mới phía client là
     `POST /days/batch` một mục của bộ chọn nhãn (xem trước, rồi body commit của batch) và
     `PUT /sessions/:id` một chạm, dựng bằng chính hàm dựng của form session; body gửi review không đổi.
  2. Client không tự tính phút nghiệp vụ; Overtime Total là tổng của server. Phép đổi giờ + phút đúng
     với dữ liệu nhập hợp lệ (lỗi ở trên là với dữ liệu nhập sai).
  3. R-07: năm múi giờ trình duyệt (LA, Tokyo, Kiritimati +14, Pago Pago -11, Hồ Chí Minh) cho cùng 14
     ngày kế toán, cùng cách nhóm session, cùng ô OT và tổng; giờ khớp oracle Intl và có dấu ngày bắt
     đầu theo giờ địa phương; thanh kỳ luôn ghi múi giờ đang xem; trang Review giữ giờ LA.
  4. AC-04 qua bộ chọn nhãn, panel bên (desktop) và bottom sheet (điện thoại): hỏi lý do trước mọi lần
     ghi và gửi lý do kèm lần ghi (cả hai có trong lịch sử); phiên bản cũ dừng việc ghi với thông báo
     tải lại; xung đột cần xác nhận rõ ràng; DST và qua đêm qua lượt e2e đã chạy.
  5. AC-16/AC-01: người được chia sẻ chỉ xem không có điều khiển sửa, chấm công, batch, bộ chọn nhãn
     hay Open a day và chỉ gọi route chia sẻ; người được sửa sửa qua `/api/shared/<owner>/` và được ghi
     tên trong lịch sử của chủ; người thứ ba không thấy gì và nhận 404 khi đổi id.
  6. Riêng tư và PDF: không có ảnh chữ ký hay request `/api/signatures` trên trang Timesheet trước và
     sau sign-off; một ảnh trên trang Review, nằm ngoài sheet; code PDF không đổi và pdf-visual đạt;
     hash payload review và luồng sign-off không đổi (e2e review và submission đạt).
- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được: (R1, Thông tin) cảnh báo GHSA-68fv-2mgg-jv7q của
  `source-map-js` chỉ thuộc dev (vite -> postcss), có từ trước vòng này (lock không đổi từ 014bd47) và
  `--omit=dev` sạch; một lần cập nhật dependency định kỳ có thể xử lý. (R2, Thông tin) ngày ký trên
  sheet dùng `reporting_zone` hiện tại của timesheet, còn PDF dùng của snapshot; chỉ khác nhau nếu múi
  giờ báo cáo đã lưu thay đổi sau khi ký.
- Gate chưa chạy/bị chặn và lý do: không còn với vùng A. Lịch sử: lần bàn giao đầu dừng ở NOT VERIFIED
  sau khi lệnh xóa một file lạc do tôi tạo (`D:\raw-r07.txt`, để lại cho chủ) bị từ chối; coordinator
  yêu cầu tôi tiếp tục cùng audit.
- Xử lý phát hiện trước: không có trong vòng này; WP5-RECHECK (014bd47) vẫn bị thay thế.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot: vùng A chưa chấp nhận 831f760 cho đến khi
  WP5-UX-A-01 được sửa và audit lại; không liên quan phép chủ hay pilot.
- Một bước/prompt tiếp: mở task sửa có phạm vi cho WP5-UX-A-01, rồi freeze, gate và re-audit mới cho
  vùng A trên digest mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

Bản dịch của [WP5_UX_REVIEW_A.md](WP5_UX_REVIEW_A.md); tiếng Anh là nguồn chuẩn.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX-AUDIT-A lần 1; reviewer agent
  acb592d06034e4ad5 (board); tác giả WP5-UX-PLAN aec5a290490907629, T01 a36bd4ddef59632b6, T02
  aa193ddfa339be714, T03 a17b600b361941a31, T04 a3bfe6137bc9d9ced, T05 a9d2389529c8b59e9, T06
  a0db965135fda0d4e, FIX1 ab2b3b4a8cdf437b2.
- Context mới; xác nhận reviewer không viết thay đổi: đúng; reviewer chỉ viết review này, bản dịch,
  Results của task và `evidence/WP5-UX-AUDIT-A/`; probe chạy từ thư mục task.
- Digest trước/sau; bằng chứng gate snapshot đó: 3d274c9e trước và sau; WP5-UX-GATE PASS trên cùng
  freeze commit.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP5_UX_REVIEW_A.md` (mới trong vòng
  này; kết quả NOT VERIFIED của lần bàn giao đầu vẫn nằm trong Results của task).
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator: WP5-UX-A-01 còn mở -> sửa, freeze, gate,
  re-audit mới cho vùng A.
