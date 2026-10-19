# Vòng đổi giao diện 3 của WP5, kiểm lại vùng B (tính toàn vẹn khi nhập giờ nghỉ và các hộp thoại) sau WP5-UX3-FIX3, trên ceb86b6 (WP5-UX3-AUDIT-B2)

Bản dịch của [WP5_UX3_REVIEW_B2.md](WP5_UX3_REVIEW_B2.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng đổi giao diện 3 do chủ sở hữu yêu cầu của WP5, kiểm lại vùng B sau
  vòng sửa WP5-UX3-FIX3 và regate WP5-UX3-REGATE2 đã đạt; task WP5-UX3-AUDIT-B2, attempt 1, ngày 2026-10-19 từ 21:52Z đến khoảng
  23:10Z (14:52 đến khoảng 16:10 giờ America/Los_Angeles; kỳ đang hiển thị 10/12-10/25 chứa hôm nay). Reviewer tự báo model
  `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Model mạnh nhất trong các tác giả
  của snapshot là `claude-opus-5-5` (PLAN, PLAN2, T06, T08, FIX1, SWEEP; FIX3 và các slice khác là sonnet), nên reviewer không yếu hơn.
  Việc kiểm lại vùng A WP5-UX3-AUDIT-A2 chạy cùng máy, cùng lúc, với các lần chạy e2e đầy đủ của riêng nó (`90-load.txt`).
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (commit WP5-UX3-GOV2-FREEZE: bản đóng băng FIX3 a78ada5 cộng cặp AGENTS). HEAD =
  origin/main = ceb86b6 trước và sau; `git status` ngoài `handoff/` rỗng trước và sau. Digest
  `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 file, không tính `handoff/`, ghi đầu tiên và cuối cùng, mỗi lần
  theo ba dạng bằng nhau: export `git archive` sạch không có `.git` băm bằng `git hash-object --no-filters`, dạng `git ls-tree HEAD`
  (danh sách đã sắp xếp giống từng byte danh sách của export), và `npm run digest` trong repository. Source đủ: `npm ci` exit 0 ở mọi
  export.
- **Quyết định: FIX REQUIRED** (một lỗi mức Low về độ mạnh của test, F-UX3B2-1; không có lỗi sản phẩm, không có Medium hay cao hơn).
  - F-UX3B-1 đã đóng và lựa chọn hành vi của coordinator là hợp lý (mục 2): khi lúc đầu có dòng đã lưu và mọi dòng bị xóa khi ô chưa
    chọn, Check out gửi `breaks: []` chưa xác nhận, 200, không còn dòng, ngày `incomplete_breaks`, và hộp thoại nói rõ điều đó; khi không có
    dòng đã lưu thì danh sách vẫn bị bỏ qua (E-1); không có 422 trong mọi trường hợp của brief; ghi chú khớp với điều được ghi.
  - F-UX3B-2 đã đóng (mục 3): "Confirm breaks" liệt kê các gợi ý nằm trong ca (1, 2, 3 hoặc không có; các mốc vừa khít; qua đêm; hai ngày
    đổi giờ theo thời gian trôi qua; múi giờ nhập khác múi giờ báo cáo; ca đã kết thúc của hôm nay), được ghim y như phần điền sẵn của ca
    mới; khi nào gợi ý xuất hiện thì không đổi.
  - Không có hồi quy (mục 4): 24 trường hợp của ma trận lần đầu mà FIX3 không định đổi, 8 trường hợp Check out và 7 trường hợp "Confirm
    breaks" không đổi đều giống từng byte với 7ce4e95; server cùng `dist/server`, `dist/domain` không đổi; việc bỏ bốn test
    `quickBreaksOf` không làm yếu điều gì.
  - Tám mutant của tôi (mục 5): sáu bị bắt; M6a (ghi chú xóa dòng hiện khi không có dòng đã lưu) sống sót qua mọi test và là phát
    hiện; M5b (điều kiện ngày quá khứ trong `confirmBreaksRows`) sống sót và là rủi ro R-B2-1.
  - Các kiểm tra bắt buộc đạt (mục 7).

## 1. Phạm vi thật đã xem và chạy

1. Đọc như tuyên bố, không như bằng chứng: AGENTS.md trên đĩa ở ceb86b6 (quy tắc 7 và 8); mục "Gates and independent audit" của
   docs/08; review vùng B lần đầu `WP5_UX3_REVIEW_B.md` (F-UX3B-1, F-UX3B-2, R-UX3B-1..7, ma trận request) và bằng chứng của nó;
   `WP5-UX3-FIX3.md` (Results), `WP5-UX3-REGATE2.md` (Results); các quyết định của chủ sở hữu trên board ngày 2026-10-15/16 (yêu cầu
   U-01..U-27, G-1..G-5 với biến thể G-4 của chủ, N-1, N-2, Q6 b) cùng U-21..U-26 trong `WP5-UX3-PLAN.md`, và quyết định của
   coordinator ngày 2026-10-16 "WP5-UX3-AUDIT-A FIX REQUIRED" với hai lựa chọn hành vi; docs/02 R-02, docs/04 dòng 65, 66 và 70,
   docs/10 E-1 (dòng 101), D-02 (dòng 16), dòng 238 và 245, docs/12 dòng 71, EN và VI.
2. Đọc trọn mã của phần đã đổi: `ClockOutDialog.tsx`, `breakRowsModel.ts` (các chế độ lưu, `buildCheckOutDialogRequest`,
   `suggestionRows`, `confirmBreaksRows`), `SessionDialog.tsx` (bản nháp ban đầu), `ClockProvider.tsx` (cách hộp thoại nhận ca),
   `BreakRows.tsx` (các dòng gợi ý), `clockOut` của server (`timesheetCommands.ts:570-633`); diff của FIX3
   `git diff 7ce4e95..a78ada5 -- src tests docs` (20 file): toàn bộ phần `src`, toàn bộ các đoạn test của vùng B
   (`breakRowsModel.test.ts`, `dayEditorModel.test.ts`, `dayModel.test.ts`, `day-editor.spec.ts`) và các dòng docs đã đổi như bản đóng
   băng; các đoạn của vùng A (`styles.css`, các spec hover, shell, admin-status và theme) thuộc về WP5-UX3-AUDIT-A2.
3. Probe của tôi trên export sạch của target và của 7ce4e95 (cục bộ trong task, Edge, mỗi trường hợp một người tổng hợp mới trên
   `example.invalid`; bản sao trong bằng chứng dạng `*.spec.ts.txt`): ma trận request của lần đầu trên cả hai bản dựng
   (`zz-audb2-req`), mười hai trường hợp khởi đầu của Check out trên cả hai bản dựng và cả hai project (`zz-audb2-checkout`), mười sáu
   trường hợp "Confirm breaks" cùng các kiểm tra ghim và điều kiện hiện nút trên cả hai bản dựng (`zz-audb2-confirm`); tám mutant của tôi.
4. Các kiểm tra bắt buộc trong export sạch của target (mục 7).

## 2. F-UX3B-1: Check out sau khi xóa các dòng đã lưu (đã đóng)

Cách làm (`zz-audb2-checkout`, cả hai bản dựng, máy tính 1280x800 dạng dòng và điện thoại 390x844 dạng chip, múi giờ thiết bị
America/Los_Angeles): mỗi trường hợp một người tổng hợp mới nhận một ca đang chạy qua API (POST `/api/days/2026-10-19/sessions`, bắt
đầu 07:00, `end: null`, chưa xác nhận) với các dòng đã lưu A (08:00-08:15, nằm trong ca) và L (từ khoảng một đến bốn phút sau bây giờ,
nên kết thúc sau Check out); hộp thoại Check out được điều khiển qua giao diện; mọi POST `/api/clock/out` được bắt nguyên văn kèm mã
trạng thái; ca và phép tính của ngày được đọc lại. Kết quả như nhau trên cả hai project (`44-checkout-desktop-compare.txt`,
`44-checkout-mobile-compare.txt`).

| Trường hợp (target) | Hộp thoại trước Check out | Body gửi đi | Kết quả | So với 7ce4e95 |
|---|---|---|---|---|
| B1 xóa L, giữ A | "Check out with these breaks", không có ghi chú | `breaks: [A]` đã ghim, xác nhận | 200, 1 dòng, đã xác nhận, `complete` | giống từng byte |
| B2 xóa cả hai, ô chưa chọn | "No breaks listed.", "Check out, breaks unconfirmed", có ghi chú | `{"breaks":[],"breaks_confirmed":false,"expected_version":1}` | 200, 0 dòng, chưa xác nhận, `incomplete_breaks` | đổi đúng chủ đích (7ce4e95 bỏ qua danh sách: 422 `saved_break_after_clock_out`, hộp thoại vẫn mở) |
| B3 xóa cả hai, rồi chọn ô | ghi chú biến mất, "Check out, no breaks taken" | `breaks: []`, xác nhận | 200, 0 dòng, đã xác nhận, `complete` | giống từng byte |
| B4 xóa L, giữ A, thêm 09:00 trong 10 phút | "Check out with these breaks" | `[A, mới]`, xác nhận | 200, 2 dòng, đã xác nhận | giống từng byte |
| B4b xóa cả hai, thêm 09:00 trong 10 phút | như trên | `[mới]`, xác nhận | 200, 1 dòng, đã xác nhận | giống từng byte |
| B4c giữ A và L, thêm một dòng | như trên | `[A, L, mới]`, xác nhận | 422 `break_outside_session` (cảnh báo), ca vẫn chạy | giống từng byte (có từ trước, xem R-B2-3) |
| B5 không có dòng đã lưu | "No breaks listed.", nhãn chưa xác nhận, không có ghi chú | `{"breaks_confirmed":false,"expected_version":1}` (không có khóa `breaks`) | 200, 0 dòng, chưa xác nhận, `incomplete_breaks` | giống từng byte (E-1) |
| B5b không có dòng đã lưu, thêm một dòng rồi xóa | không có ghi chú | danh sách bị bỏ qua | 200, chưa xác nhận | giống từng byte |
| B6 xóa cả hai, thêm một dòng rồi xóa | có ghi chú | `breaks: []`, chưa xác nhận | 200, 0 dòng | đổi đúng chủ đích (7ce4e95: 422) |
| B7 chỉ có L, đã xóa | có ghi chú | `breaks: []`, chưa xác nhận | 200, không có 422 | đổi đúng chủ đích (7ce4e95: 422) |
| B8 xóa cả hai, Cancel, Discard | có ghi chú, rồi "Discard your changes?" | không gửi gì | ca vẫn chạy, giữ cả hai dòng | như nhau (không gửi gì) |
| B9 một dòng đã lưu trên ca đã xác nhận (chỉ qua API), đã xóa | có ghi chú | `breaks: []`, chưa xác nhận | 200, 0 dòng, chưa xác nhận | đổi đúng chủ đích (7ce4e95 bỏ qua danh sách: giữ dòng, chưa xác nhận); xem R-B2-2 |

- Không có 422 trong mọi trường hợp của brief: xóa một số (B1), xóa hết khi ô chưa chọn (B2, B6, B7), xóa hết rồi chọn ô (B3), thêm một
  dòng (B4, B4b), không có dòng đã lưu (B5, B5b). 422 duy nhất là B4c, khi người dùng vẫn để dòng muộn L trong danh sách; việc từ chối này
  giống hệt trên 7ce4e95 và nằm ngoài FIX3.
- Danh sách rỗng chưa xác nhận chỉ thay các dòng đã lưu khi hộp thoại mở ra với dòng đã lưu và mọi dòng đã bị xóa khi ô chưa chọn (B2,
  B6, B7, B9); khi lúc đầu không có dòng đã lưu thì danh sách được bỏ qua (B5, B5b; E-1). Điều kiện dựa trên ca mà hộp thoại được mở
  với: `ClockProvider.tsx` đặt nó một lần (`setDialogSession(found)`) và không thay khi hộp thoại đang mở, nên
  `session.breaks.length > 0` (`breakRowsModel.ts:464`, `ClockOutDialog.tsx:106`) nghĩa là "mở ra với dòng đã lưu".
- Ghi chú là một đoạn chữ `role="status"` dưới danh sách giờ nghỉ (`ClockOutDialog.tsx:279-283`,
  `audb2-checkout-removed-all-target-*-synthetic.png`): "The saved breaks you removed are deleted at Check out. Breaks stay unconfirmed
  and OT for the day stays pending." Nó khớp với điều được ghi trong B2, B6 và B7: không còn dòng, `breaks_confirmed` false, ngày
  `incomplete_breaks` (OT chờ). Nó ẩn khi ô được chọn (B3) và khi có dòng được liệt kê (B1, B4b).
- docs/04 dòng 70, docs/10 dòng 238 (VI 239) và dòng 101 (E-1, VI 102) nói đúng điều này; docs/12 dòng 71 thêm rằng xóa hết các dòng
  đã lưu khi ô chưa chọn sẽ xóa chúng. EN và VI có cùng token, số và chuỗi trích dẫn (`24-docs-parity.txt`).

**Đánh giá lựa chọn hành vi: hợp lý.** Lựa chọn này giữ được cả lời của chủ sở hữu lẫn các quy tắc chuẩn:
- U-24 yêu cầu phần giờ nghỉ cho phép thêm và xóa giờ nghỉ dễ dàng với người mới, và U-25 biến Save thành việc xác nhận. Với lựa chọn
  này, dòng đã xóa thì mất, còn nhãn Check out và ghi chú nói rằng không có gì được xác nhận, nên điều hộp thoại hiển thị là điều được
  ghi lại. Phương án bị loại (vẫn bỏ qua danh sách và nói điều đó) sẽ giữ các dòng người dùng đã xóa và vẫn từ chối một dòng muộn đã xóa
  bằng 422, điều mà hộp thoại khó giải thích.
- Body này chính là body mà hộp thoại ca gửi cho biến thể G-4 của chủ "Leave breaks unconfirmed for now" (`breaks: []`, chưa xác nhận),
  nên cả hai hộp thoại ghi "không còn dòng, giờ nghỉ chưa biết" theo cùng một cách.
- R-02 và D-02: chưa biết vẫn khác với xác nhận không nghỉ (`breaks_confirmed` false, OT chờ; B2 `incomplete_breaks`, B3 `complete`), và
  không giờ nghỉ tương lai nào bị giữ hay bị trừ (B7: dòng muộn bị xóa, không bị từ chối).
- E-1 đúng ở API (danh sách có mặt là tập đầy đủ và thay các dòng đã lưu; danh sách bị bỏ qua thì giữ chúng) và trong hộp thoại (chỉ
  bỏ qua danh sách khi không có gì để giữ). Server không đổi; hộp thoại chỉ dùng nhánh "danh sách có mặt" sẵn có. Các văn bản chuẩn
  (docs/10 E-1 dòng 101 và dòng 238, docs/04 dòng 70, docs/12 dòng 71) đã được cập nhật EN và VI, như quy tắc 8 của AGENTS yêu cầu với
  một quy tắc được làm rõ.
- Không có gì bị xóa âm thầm: ghi chú hiện trước Check out, Cancel hỏi "Discard your changes?" (B8), và mục audit
  `work_session.clock_out` của server giữ ca cùng các giờ nghỉ như trước khi đổi (`timesheetCommands.ts:628`, `sessionJson`).

## 3. F-UX3B-2: "Confirm breaks" liệt kê các gợi ý nằm trong ca (đã đóng)

Cách làm (`zz-audb2-confirm`, cả hai bản dựng, máy tính, múi giờ thiết bị America/Los_Angeles): một ca đã kết thúc, giờ nghỉ chưa xác
nhận và chưa có dòng đã lưu được tạo qua API; nhấn "Confirm breaks of ..."; đọc các dòng của hộp thoại; Save đi qua thông báo khi không
có gì được liệt kê, nếu không thì vào thẳng "Save this session?"; body PUT được bắt nguyên văn và ca được đọc lại
(`45-confirm-compare.txt`). Giờ nghỉ mặc định của chính sách: lệch 120 (15 phút), 240 (30) và 390 (15) phút sau giờ bắt đầu.

| Trường hợp (target) | Các dòng được liệt kê (giờ bắt đầu, số phút) | Save | So với 7ce4e95 |
|---|---|---|---|
| F01 09:00-12:00 | 11:00/15 | không có thông báo, "1 break (15 min)" | đổi đúng chủ đích (7ce4e95: không dòng nào, có thông báo) |
| F02 09:00-14:00 | 11:00/15, 13:00/30 | "2 breaks (15, 30 min)" | đổi đúng chủ đích |
| F03 09:00-18:00 | 11:00/15, 13:00/30, 15:30/15 | "3 breaks (15, 30, 15 min)" | giống từng byte |
| F04 09:00-10:30 | không có | thông báo "No breaks listed" hỏi; "Confirm no breaks taken" gửi `breaks: []` đã xác nhận | giống từng byte |
| F05 09:00-11:15 (giờ nghỉ đầu kết thúc đúng lúc ca kết thúc) | 11:00/15 | 1 giờ nghỉ | đổi đúng chủ đích |
| F06 09:00-11:14 (giờ nghỉ đầu kết thúc sau một phút) | không có | thông báo | giống từng byte |
| F07 09:00-15:45 (giờ nghỉ thứ ba kết thúc đúng lúc ca kết thúc) | 3 dòng | 3 giờ nghỉ | giống từng byte |
| F08 09:00-15:44 (giờ nghỉ thứ ba kết thúc sau một phút) | 2 dòng | 2 giờ nghỉ | đổi đúng chủ đích |
| F09 qua đêm 22:00-03:00+1 | 06/19 00:00/15, 06/19 02:00/30 (có trường ngày) | 2 giờ nghỉ | đổi đúng chủ đích |
| F10 qua đêm 22:00-06:00+1 | 00:00, 02:00, 04:30 ngày 06/20 | 3 giờ nghỉ | giống từng byte |
| F11 Sydney lùi giờ 2026-04-05 00:00-05:45 (5h45m trên đồng hồ, 6h45m trôi qua) | 02:00/15 (+11:00, 02:00 lần đầu), 03:00/30 (+10:00), 05:30/15 | 3 giờ nghỉ, giờ nghỉ thứ ba kết thúc đúng lúc ca kết thúc | giống từng byte |
| F12 cùng ngày 00:00-05:44 | 02:00, 03:00 | 2 giờ nghỉ | đổi đúng chủ đích |
| F13 Los Angeles tiến giờ 2026-03-08 00:00-07:45 (6h45m trôi qua) | 03:00/15, 05:00/30, 07:30/15 (đều -07:00) | 3 giờ nghỉ | giống từng byte |
| F14 cùng ngày 00:00-07:44 (7h44m trên đồng hồ, 6h44m trôi qua) | 03:00, 05:00 | 2 giờ nghỉ | đổi đúng chủ đích |
| F15 múi giờ nhập Asia/Ho_Chi_Minh 06/23 08:00-13:00 (Los Angeles 06/22 18:00-23:00) | 10:00/15, 12:00/30 ghim ở +07:00 | 2 giờ nghỉ, lưu 03:00Z và 05:00Z | đổi đúng chủ đích |
| F16 hôm nay 2026-10-19 07:00-12:00, đã kết thúc | 09:00/15, 11:00/30 | 2 giờ nghỉ | đổi đúng chủ đích (7ce4e95: không dòng nào, theo quy tắc "tất cả hoặc không") |

- Việc "vừa trong ca" được xét theo thời điểm, tính cả mốc cuối: F05 và F07 vừa khít, F06 và F08 trễ một phút thì không. F11 và F14 phân
  biệt thời gian trôi qua với giờ trên đồng hồ: một quy tắc theo giờ đồng hồ sẽ liệt kê hai dòng ở F11 và ba dòng ở F14.
- Quy tắc 7 của AGENTS được giữ: ở F15 ngày ghi sổ (2026-06-22 ở Los Angeles) khác ngày của các dòng theo múi giờ nhập (2026-06-23 ở Hồ
  Chí Minh); phép xét "vừa trong ca" chỉ so thời điểm, và các dòng được ghim kèm offset theo múi giờ nhập đã lưu của ca, không theo múi
  giờ thiết bị.
- Ghim (P01, 2026-06-24): "Confirm breaks" trên ca 09:00-14:00 và một ca mới gõ 09:00-14:00 trên cùng ngày quá khứ (các gợi ý điền sẵn đi
  theo giờ bắt đầu và kết thúc đã gõ) gửi mảng `breaks` giống từng byte và lưu cùng thời điểm (`breaksIdentical: true`,
  `storedBreaksIdentical: true`); mọi dòng được liệt kê đều có nhãn "suggested" và `data-origin="suggested"`.
- Khi nào gợi ý xuất hiện thì không đổi: `confirmBreaksRows` không cho gợi ý nào với ca đang chạy, ca đã xác nhận, ca có dòng đã lưu hoặc
  không có chính sách (unit test `breakRowsModel.test.ts:924-931`); thẻ không hiện "Confirm breaks" cho ca đã xác nhận hay ca đang chạy
  (G01, cả hai bản dựng); "Confirm breaks" không có quy tắc ngày quá khứ, như trước (F16 hôm nay trên target; T08B, quyết định của
  coordinator ngày 2026-10-15); phần điền sẵn của ca mới vẫn giữ quy tắc ngày quá khứ theo ngày của server (`pastDaySuggestedRows`,
  không đổi).
- docs/04 dòng 65 và docs/10 dòng 245 (VI 246) mô tả đúng điều này; EN và VI khớp nhau (`24-docs-parity.txt`).

## 4. Hồi quy từ diff của FIX3 (vùng B)

- **Body request.** Ma trận lần đầu (25 trường hợp: K01-K11, E12-E20, C20-C23) được chạy với các bước không đổi trên 7ce4e95 và trên
  target (`43-req-compare.txt`): 24 trường hợp mà FIX3 không định đổi giống từng byte (phương thức, đường dẫn, mã trạng thái, body
  nguyên văn) và lưu cùng một ca; chỉ C23 (Check out sau khi xóa một dòng đã lưu chưa xác nhận) khác, đúng chủ đích
  (`{"breaks_confirmed":false,...}` giữ dòng; `{"breaks":[],"breaks_confirmed":false,...}` xóa nó). Cộng thêm mục 2 (8 trường hợp
  Check out không đổi giống từng byte trên cả hai project) và mục 3 (7 trường hợp "Confirm breaks" không đổi giống từng byte).
- **Server không đổi.** `git diff a643794..a78ada5 -- src/server src/domain` và `git diff 7ce4e95..ceb86b6 -- src/server src/domain
  src/client/api.ts` đều rỗng; bản dựng sạch của tôi cho 7ce4e95 và target: `dist/server` 180 và `dist/domain` 46 file, 0 khác biệt hash
  (`23-dist-compare.txt`). Vì vậy số liệu không thể đổi: số phút làm, tín chỉ OT và cảnh báo review đến từ cùng một engine và cùng body
  request.
- **Diff phía client.** Vùng B: `ClockOutDialog.tsx` (+10/-2: ghi chú và điều kiện của nó), `breakRowsModel.ts` (+25/-5: `hadSavedRows`,
  `confirmBreaksRows`), `SessionDialog.tsx` (+7/-7: bản nháp ban đầu gọi `confirmBreaksRows`), `dayEditorModel.ts` (+4/-49:
  `quickBreaksOf`, kiểu và hàm phụ của nó bị bỏ), `dayModel.ts` ("categories"). `DayEditor.tsx`, `ClockProvider.tsx`, `BreakRows.tsx`,
  `BreakSubDialog.tsx`, `breakChipModel.ts`, `sessionModel.ts` và `SessionList.tsx` không đổi (`25-unchanged-files-stat.txt`).
- **Bốn unit test `quickBreaksOf` bị bỏ.** Ở 7ce4e95 chỗ dùng duy nhất trong production của `quickBreaksOf` là `.kind` trong
  `SessionDialog.tsx:245` (`22-quickbreaks-usage-7ce4e95.txt`); đầu ra `chips` và `rows` của nó không tới màn hình nào. Ánh xạ trong
  `WP5-UX3-FIX3.md` đúng: dịch theo giờ bắt đầu (09:00-18:00 cho 11:00, 13:00, 15:30) và ghim theo múi giờ nhập (cả Hồ Chí Minh) ở
  `breakRowsModel.test.ts:886-911`; dòng đã liệt kê không bị thay (trường hợp "có dòng đã lưu" ở `:924-931`, và bản nháp lấy từ ca đã
  lưu); không có gì khi nằm ngoài ca, không có chính sách hoặc chính sách không có giờ nghỉ (`:886-895`, `:924-931`); không có gì cho ca
  đang chạy hay đã xác nhận (`:924-931`). Loại 'none' trở thành "không dòng nào, Save hỏi" theo văn bản docs/04 đã căn theo chủ. Chỉ
  chuỗi chip theo múi giờ hiển thị là không có đối ứng, và không màn hình nào hiện chúng. Không phải làm yếu đi; các test mới mạnh hơn ở
  các mốc vừa khít.

## 5. Độ mạnh của test: mutant của tôi trên phần thay đổi vùng B của FIX3

Mỗi mutant được áp riêng trong một export nháp của target, dựng lại client, rồi chạy toàn bộ unit suite (2141 test) và
`day-editor.spec.ts` trên project desktop; sau đó trả file về và so là giống hệt export sạch (`60-mutants.txt`). Mutant nào sống sót được
chạy lại với mọi spec mở hộp thoại Check out hoặc hộp thoại ca (`day-editor`, `shell`, `today`, `timesheet`, `keyboard-access`,
`focus-ring`) trên cả hai project (`61-survivors.txt`).

| Id | Mutant | Unit suite | `day-editor.spec.ts` desktop | Kết quả |
|---|---|---|---|---|
| M1 | bỏ qua `hadSavedRows`: Check out với danh sách rỗng, ô chưa chọn luôn bỏ qua danh sách (`breakRowsModel.ts:393`, quy tắc trước FIX3) | 1 lỗi (`breakRowsModel.test.ts:551`) | 1 lỗi (`:1924`) | bị bắt |
| M2 | `hadSavedRows` luôn đúng: gửi `breaks: []` kể cả khi hộp thoại mở ra không có dòng đã lưu (`breakRowsModel.ts:464`) | 2 lỗi (`:512`, `:565`) | 1 lỗi (`:1866`) | bị bắt |
| M3 | cờ xác nhận trên danh sách rỗng: sau khi xóa hết dòng đã lưu, danh sách rỗng được gửi là đã xác nhận (`:393`) | 1 lỗi (`:551`) | 1 lỗi (`:1924`) | bị bắt |
| M4 | phép so sánh mốc cuối của bộ lọc "nằm trong ca" `<=` thành `<` (`breakRowsModel.ts:575`) | 2 lỗi (T08B "a break ending exactly at the end is inside"; FIX3 "09:00-11:15") | đạt (không test e2e nào có ca kết thúc đúng lúc một giờ nghỉ kết thúc) | bị bắt (unit) |
| M5a | điều kiện của `confirmBreaksRows`: bỏ điều kiện `breaks_confirmed` (`breakRowsModel.ts:587`) | 1 lỗi (`:924`) | đạt (thẻ không đưa "Confirm breaks" cho ca đã xác nhận) | bị bắt (unit) |
| M5b | thêm điều kiện ngày quá khứ vào `confirmBreaksRows` (đồng hồ thiết bị theo múi giờ nhập; `breakRowsModel.ts:587`) | đạt | đạt | **sống sót**: sáu spec có hộp thoại trên cả hai project cũng đạt (342 đạt, 60 bỏ qua, 0 lỗi); có tác dụng thật: probe trên bản dựng bị đột biến không liệt kê dòng nào cho ca đã kết thúc của hôm nay (F16) và liệt kê đúng các dòng và body như target cho mọi ngày quá khứ; R-B2-1 |
| M6a | điều kiện của ghi chú bỏ qua dòng đã lưu (`ClockOutDialog.tsx:106`): ghi chú xóa dòng hiện mỗi khi danh sách rỗng và ô chưa chọn | đạt (không unit test nào phủ thành phần này) | đạt | **sống sót**: `day-editor`, `shell`, `today`, `timesheet`, `keyboard-access` và `focus-ring` trên cả hai project cũng đạt (342 đạt, 60 bỏ qua, 0 lỗi); có tác dụng thật: probe trên bản dựng bị đột biến hiện ghi chú ngay khi hộp thoại mở ra mà không có dòng đã lưu (B5, B5b) trong khi mọi body không đổi; F-UX3B2-1 |
| M6b | điều kiện của ghi chú bỏ qua ô (`ClockOutDialog.tsx:106`): ghi chú vẫn hiện khi đã chọn "Confirm no breaks taken" | đạt | 1 lỗi (`:1924`: ghi chú phải ẩn khi ô được chọn) | bị bắt (e2e) |

Kết quả: 6 trên 8 bị bắt (M4 và M5a chỉ bởi unit suite, M6b chỉ bởi e2e). M5b và M6a sống sót qua toàn bộ unit suite và mọi spec
mở hộp thoại Check out hoặc hộp thoại ca, trên cả hai project; cả hai đều có tác dụng thật, không tương đương, như các probe cục bộ trên
bản dựng bị đột biến cho thấy:
- M6a: probe hiện "The saved breaks you removed are deleted at Check out." ngay khi hộp thoại mở ra mà không có dòng đã lưu (B5) và
  sau khi thêm rồi xóa một dòng (B5b), còn mọi body request không đổi (`46-M6a-live-compare.txt`). Đây là F-UX3B2-1: điều kiện của
  ghi chú là thay đổi của chính FIX3, và FIX3 mục 7 yêu cầu "the dialog text must say what will be recorded".
- M5b: probe không liệt kê dòng nào cho ca đã kết thúc của hôm nay (F16, khi đó Save hỏi qua thông báo) và liệt kê đúng các dòng và
  body như target cho mọi trường hợp ngày quá khứ (`47-M5b-live-compare.txt`). "Confirm breaks" trên ca của hôm nay là hành vi FIX3 giữ
  nguyên (đã chấp nhận ở T08B), không phải thay đổi của chính FIX3, nên được ghi là R-B2-1.

Mọi file bị đột biến đều được trả về và so là giống hệt export sạch, và client của export nháp được dựng lại sạch ở cuối
(`60-mutants.txt`, `61-survivors.txt`). Tám lần chạy unit của các mutant không có lần nào quá thời gian.

## 6. Đánh giá lại các rủi ro của lần đầu

- **R-UX3B-1** (tiêu điểm về tiêu đề editor sau khi đổi chế độ qua 1360px khi hộp thoại ca đang mở): `DayEditor.tsx` không đổi bởi FIX3
  (`25-unchanged-files-stat.txt`); không đo lại; vẫn là cải tiến tùy chọn như đã ghi.
- **R-UX3B-2** (trang để mở qua nửa đêm của múi giờ báo cáo giữ `today_local` cũ cho phần điền sẵn): mã không đổi; vẫn giữ (thận trọng:
  không bao giờ gợi ý cho hôm nay). "Confirm breaks" không phụ thuộc `today_local` (mục 3).
- **R-UX3B-3** (docs/12 dòng 71): đã đóng. Câu đầu nay nêu các lần từ chối bằng lời thường, `saved_break_after_clock_out` (giờ nghỉ đã
  lưu kết thúc sau giờ Check out, tái hiện trên 7ce4e95 ở B2, B6, B7 và qua API trong `day-editor.spec.ts:1907`) và `future_break`, và
  nói rằng giờ nghỉ chưa xác nhận nằm trong ca không chặn Check out (C23 trên 7ce4e95: danh sách bị bỏ qua giữ dòng, 200). Chi tiết còn
  lại ở R-B2-3.
- **R-UX3B-5** (offset ghim của phần điền sẵn được gửi khi giờ bắt đầu gõ vào trùng với nó; cùng thời điểm): không đổi; P01 cho thấy
  "Confirm breaks" ghim y như vậy.
- **R-UX3B-6** (integration test quá thời gian khi tải song song nặng): không xuất hiện trong lần kiểm lại này: cả hai lần chạy
  `npm test` bắt buộc đều đạt với 0 lần quá thời gian, và tám lần chạy unit của các mutant cũng 0 lần quá thời gian.
- **R-UX3B-7** (ô số phút đã điền chỉ hiện con số): `BreakRows.tsx` không đổi; vẫn giữ.

## 7. Các kiểm tra bắt buộc (export sạch của target; `10-main-exits.txt`)

| Lệnh | Kết quả | Bằng chứng |
|---|---|---|
| `npm run typecheck` | exit 0, 0 dòng deprecation | `10-typecheck.txt` |
| `npm run lint` | exit 0 | `10-lint.txt` |
| `npm test` (hai lần) | exit 0 cả hai; 94 file, 2141 test mỗi lần; 0 lần quá thời gian | `10-npmtest-1.txt`, `10-npmtest-2.txt` |
| `npm run build` | exit 0; gói chính `index-BJ9ZzqiL.js` 486.81 kB (gzip 143.10), không có cảnh báo kích thước chunk | `10-build.txt` |
| AC-13 (`vitest run tests/integration/ac13-two-week.test.ts`) | exit 0, 1/1 | `10-ac13.txt` |
| e2e ĐẦY ĐỦ, cả hai project, đồng hồ thật (22:01-22:19Z) | exit 0; 645 đạt, 67 bỏ qua, 0 lỗi (desktop 326/30, mobile 319/37), 18.0 phút, 0 dòng deprecation | `11-e2e-real.txt` |
| `day-editor.spec.ts` với đồng hồ FIX10 tại 2026-11-01T08:45:00Z (LA 01:45 PDT, giờ lặp) | exit 0; 118 đạt, 18 bỏ qua, 0 lỗi (desktop 67/1, mobile 51/17), 2.1 phút; kiểm tra preload: đồng hồ tiến trình 2026-11-01T08:45Z, Los Angeles CN 01:45 | `50-dst-20261101T0845.txt` |
| như trên tại 2027-03-14T10:30:00Z (LA 03:30 PDT, sau khoảng giờ bị bỏ) | exit 0; 118 đạt, 18 bỏ qua, 0 lỗi (desktop 67/1, mobile 51/17), 2.0 phút; kiểm tra preload: đồng hồ tiến trình 2027-03-14T10:30Z, Los Angeles CN 03:30 | `50-dst-20270314T1030.txt` |

Không lần chạy nào thất bại vì quá thời gian; không lần nào phải chạy lại. 0 dòng deprecation trong các log e2e và DST.

## Phát hiện

1. **F-UX3B2-1, Low (độ mạnh của test): điều kiện của ghi chú xóa dòng không được ghim cho lần Check out bắt đầu mà không có dòng đã
   lưu.** `src/client/components/ClockOutDialog.tsx:106` (`removedSaved = session.breaks.length > 0 && draft.rows.length === 0 &&
   !draft.noBreaks`); `tests/e2e/day-editor.spec.ts:1866-1899` (test E-1 không có dòng đã lưu kiểm body và kết quả, không kiểm ghi chú);
   `:1924-1980` chỉ kiểm ghi chú cho ca đã có dòng đã lưu; không unit test hay test thành phần nào phủ điều kiện này.
   - Tái hiện: mutant M6a (bỏ `session.breaks.length > 0 &&`). Mọi lần Check out với danh sách rỗng và ô chưa chọn, tức đường dùng phổ
     biến (Check in rồi Check out không có dòng nào), khi đó đều nói "The saved breaks you removed are deleted at Check out." dù không có gì
     được lưu hay bị xóa. Toàn bộ unit suite, `day-editor.spec.ts` trên project desktop, và `day-editor.spec.ts`, `shell.spec.ts`,
     `today.spec.ts`, `timesheet.spec.ts`, `keyboard-access.spec.ts` cùng `focus-ring.spec.ts` trên cả hai project (342 đạt, 60 bỏ qua, 0
     lỗi) đều đạt (`60-mutants.txt`, `61-survivors.txt`); probe trên bản dựng bị đột biến hiện ghi chú ngay khi hộp thoại mở ở B5 và B5b,
     còn mọi body request không đổi (`46-M6a-live-compare.txt`).
   - Mong đợi: FIX3 mục 7 yêu cầu "the dialog text must say what will be recorded"; phải có test thất bại khi hộp thoại báo một việc xóa
     không xảy ra. Sửa có giới hạn, chỉ test: trong `day-editor.spec.ts:1866` kiểm rằng ghi chú không có khi hộp thoại mở và trước khi
     Check out (có thể thêm sau khi thêm rồi xóa một dòng, như B5b). Không đổi sản phẩm.
   - Ảnh hưởng hiện nay: không có; điều kiện trong sản phẩm đúng (B5, B5b ở mục 2). Khoảng trống này cho phép chính loại lỗi của
     F-UX3B-1 (hộp thoại nói khác điều được ghi) quay lại mà không ai thấy trên đường dùng chính.

## Rủi ro và cải tiến tùy chọn (không phải lỗi đã chứng minh)

- **R-B2-1** "Confirm breaks" trên ca đã kết thúc của hôm nay liệt kê các gợi ý nằm trong ca (F16 trên target), như đã chấp nhận ở T08B
  (quyết định của coordinator ngày 2026-10-15) và không bị FIX3 đổi, nhưng không test nào ghim điều này: mutant M5b (thêm điều kiện ngày
  quá khứ vào `confirmBreaksRows`, `breakRowsModel.ts:587`) qua được toàn bộ unit suite, `day-editor.spec.ts` trên project desktop và
  sáu spec có hộp thoại trên cả hai project (342 đạt, 60 bỏ qua, 0 lỗi; `61-survivors.txt`), trong khi probe trên bản dựng bị đột biến
  không liệt kê dòng nào cho hôm nay (`47-M5b-live-compare.txt`, `61-M5b-probe-run.txt`, `obs-confirm-mut-M5b.jsonl.txt`). Mọi unit test
  và e2e test của "Confirm breaks" đều dùng một ngày quá khứ. Một kiểm tra với ca kết thúc hôm nay sẽ ghim được nó.
- **R-B2-2** Ghi chú xóa dòng nói "Breaks stay unconfirmed" kể cả khi các dòng bị xóa thuộc một ca đang chạy mà giờ nghỉ đã được xác nhận
  (B9; một trạng thái chỉ có qua API, vì hộp thoại ca không lưu được ca không có giờ kết thúc). Khi đó giờ nghỉ trở thành chưa xác nhận
  chứ không phải "vẫn" chưa xác nhận; nhãn "Check out, breaks unconfirmed" và kết quả được lưu thì khớp nhau.
- **R-B2-3** Một dòng đã lưu kết thúc sau bây giờ mà vẫn được giữ trong danh sách Check out bị từ chối bằng 422 `break_outside_session`
  dưới dạng cảnh báo chung ("Breaks must lie inside their work session") và không đánh dấu dòng nào, vì lần từ chối đó không có
  `break_index` (B4c, giống hệt trên 7ce4e95). docs/12 dòng 71 chỉ nêu `saved_break_after_clock_out` và `future_break`; qua hộp thoại,
  mã đầu tiên nay chỉ xảy ra khi danh sách bị bỏ qua, điều mà hộp thoại không còn làm khi có dòng đã lưu.
- **R-B2-4** Sau khi FIX3 bỏ `quickBreaksOf`, `suggestedRows` trong `src/client/components/sessionModel.ts:301` không còn nơi gọi nào trong
  production; nó chỉ còn là oracle cho test (`breakRowsModel.test.ts`, `sessionModel.test.ts`) mà không có chú thích "test-only" như
  quyết định của FIX2 (mục 10) yêu cầu. Không tốn dung lượng gói (bị tree-shake), chỉ là việc dọn dẹp.
- **R-B2-5** Ghi chú xóa dòng dùng kiểu chữ gợi ý mờ giống dòng gợi ý chung phía trên (`ClockOutDialog.tsx:280`), nên câu duy nhất báo
  một việc xóa trông như gợi ý thường lệ; người lỡ tay xóa dòng có thể đọc lướt qua. Nó vẫn được đọc lên (`role="status"`) và Cancel
  vẫn hỏi "Discard your changes?".

## Các cổng bắt buộc chưa chạy hoặc bị chặn

Không có mục nào của vùng B. Không lặp lại trong lần kiểm lại này: các mục vùng A (WP5-UX3-AUDIT-A2), ảnh cắt đường nối DPR 2, một
engine trình duyệt thứ hai (không có cài), các mục NAS.

## Xử lý các phát hiện trước đó

- **F-UX3B-1** (WP5-UX3-AUDIT-B, Low): đã đóng trên ceb86b6 (mục 2); lựa chọn hành vi của coordinator là hợp lý.
- **F-UX3B-2** (WP5-UX3-AUDIT-B, Low): đã đóng trên ceb86b6 (mục 3).
- R-UX3B-3 đã đóng (docs/12 dòng 71 được viết lại); R-UX3B-4 (vùng A) đã đóng bởi FIX3 mục 9 (`dayModel.ts:143` "categories", được ghim bởi
  `dayModel.test.ts:213`); R-UX3B-1, -2, -5, -7 vẫn là tùy chọn; R-UX3B-6 không xuất hiện trong lần kiểm lại này (mục 6).

## Mức sẵn sàng của phần mềm, quyền của chủ sở hữu và pilot

Mức sẵn sàng phần mềm của vòng 3 chờ việc sửa F-UX3B2-1 (một assertion trong test, không đổi sản phẩm) hoặc một quyết định của
coordinator được ghi lại về nó, rồi một gate do coordinator chọn cho thay đổi chỉ ở test và một lần kiểm vùng B mới cho assertion đó với
mutant M6a. Quyền của chủ sở hữu cho pilot và kết quả pilot là chuyện riêng và không bị ảnh hưởng.

## Một hành động tiếp theo

Coordinator: quyết định F-UX3B2-1 (kiểm trong `tests/e2e/day-editor.spec.ts:1866` rằng ghi chú xóa dòng không có khi hộp thoại Check
out mở ra mà không có dòng đã lưu; tùy chọn R-B2-1, một kiểm tra "Confirm breaks" trên ca đã kết thúc hôm nay); giao một việc sửa có giới
hạn chỉ ở test (`addresses_audit` WP5-UX3-AUDIT-B2), bản đóng băng của nó, một regate rút gọn (phạm vi diff, `dist` giống từng byte,
verify, spec đã đổi trên cả hai project) và một lần kiểm lại vùng B mới có áp mutant M6a (và M5b nếu nhận R-B2-1).

Không có phát hiện bịa đặt hay kết quả đạt chưa quan sát. Một review từng phần không phải là chấp nhận trọn vẹn.

## Nguồn gốc subagent độc lập

- Task/attempt review, ID reviewer và ID các tác giả được review: WP5-UX3-AUDIT-B2 attempt 1 (agent a342a5834865a6e27 trên board); tác
  giả của snapshot: các agent slice, sửa, governance và đóng băng của WP5-UX3 trên board (FIX3 a61d450ff073015d9, FIX3-FREEZE
  a8123f2b2b2c94bf5, và các agent trước đó liệt kê trong `WP5_UX3_REVIEW_B.md`). Auditor vùng B lần đầu là a5ec67dc3fe32bb69.
- Ngữ cảnh mới; reviewer không viết thay đổi nào của snapshot này và không sửa file source, test, docs, AGENTS, board hay STATE nào.
- Source digest trước và sau: `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48` (833 file), ba dạng mỗi lần
  (`01-digest-*-before.txt`, `01-digest-*-after.txt`); regate WP5-UX3-REGATE2 đã đạt trên cùng snapshot.
- Đường dẫn report mới; review lần đầu `WP5_UX3_REVIEW_B.md` và mọi file review trước đó không đổi.
- Kiểm tra gói: `validate_package.py --preflight` (Python của workflow) dừng ở bản nháp vùng A chạy song song `WP5_UX3_REVIEW_A2.md`,
  không phải ở cặp này; cùng các kiểm tra liên kết, ký tự, bản dịch và ID áp cho cặp này đều đạt (`97-preflight-final.txt`,
  `97-pair-check.txt`). Mọi file `.txt` bằng chứng, cặp này và brief đều dùng LF, có đúng một dòng mới cuối, không có khoảng trắng cuối
  dòng và không có địa chỉ e-mail hay đường dẫn profile (`98-check-evidence.txt`).
- Cách xử lý phát hiện và task tiếp theo của coordinator: ở trên.
- Vi phạm quy tắc (chỉ đọc, không ảnh hưởng kết quả nào; `96-slips.txt`): một lệnh tìm kiếm có pipe vào `head`; hai lần đọc log bằng
  `tail` trên file (không phải pipe; ghi ra cho minh bạch); một lệnh thừa `python -I -c "print(1)"` không làm gì (dạng `-c` bị cấm;
  không đọc gì từ stdin). Sửa probe (đã ghi, không phải lỗi sản phẩm): lần chạy đầu của probe "Confirm breaks" trên 7ce4e95 dùng
  2025-11-02, ngày không có phiên bản lịch (`calendar_missing`); đã thay bằng Sydney 2026-04-05 và chạy lại trên cả hai bản dựng. Không
  đưa gì vào trình thông dịch qua stdin, không xóa đệ quy, không kill tiến trình theo PID; không còn gì của audit này đang chạy.
