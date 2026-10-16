# Vòng đổi giao diện 3 của WP5, audit độc lập vùng B (tính toàn vẹn khi nhập giờ nghỉ và các hộp thoại) trên 7ce4e95 (WP5-UX3-AUDIT-B)

Bản dịch của [WP5_UX3_REVIEW_B.md](WP5_UX3_REVIEW_B.md); tiếng Anh là nguồn chuẩn.

- **Giai đoạn/ngày/reviewer và model/effort quan sát được:** vòng đổi giao diện 3 do chủ sở hữu yêu cầu của WP5, sau vòng
  sửa (WP5-UX3-FIX1 và WP5-UX3-FIX2) và regate WP5-UX3-REGATE đã đạt; task WP5-UX3-AUDIT-B, attempt 1, chỉ vùng B, ngày
  2026-10-16 từ 18:15Z đến khoảng 20:05Z (11:15 đến khoảng 13:05 giờ America/Los_Angeles, một ngày trong cửa sổ: kỳ current
  09/28-10/11, kỳ đang chạy 10/12-10/25). Reviewer tự báo model `claude-opus-5-5`, profile timesheet-auditor (effort do profile
  đặt, không quan sát được từ bên trong). Model mạnh nhất trong các tác giả của snapshot cũng là `claude-opus-5-5` (PLAN, PLAN2,
  T06, T08, FIX1, SWEEP; các slice khác là sonnet), nên reviewer không yếu hơn. Auditor vùng A chạy cùng máy, cùng lúc.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** `reviewed_commit`
  `7ce4e95a0c4477374e981132d93b11aedab2e384` (commit đóng băng WP5-UX3-FIX2, là `freeze_commit` của WP5-UX3-REGATE). HEAD =
  7ce4e95 trước và sau; `git status` ngoài `handoff/` rỗng trước và sau (chỉ các bản ghi của coordinator dưới `handoff/` bị sửa
  hoặc chưa track). Digest `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191`, 833 file, không tính `handoff/`,
  ghi đầu tiên và cuối cùng, mỗi lần theo ba dạng bằng nhau: export `git archive` sạch băm bằng
  `git hash-object --no-filters`, dạng `git ls-tree HEAD` (danh sách đã sắp xếp giống từng byte danh sách của export), và
  `npm run digest` trong repository. Source đủ: `npm ci` exit 0 ở mọi export.
- **Quyết định: FIX REQUIRED** (hai lỗi mức Low, F-UX3B-1 và F-UX3B-2; không có lỗi Medium hay cao hơn).
  - Tính toàn vẹn của request đạt: với cùng giá trị gõ vào, hộp thoại ca và hộp thoại Check out lưu đúng các thời điểm mà form
    của a643794 đã lưu, trong 25 trường hợp bắt từ cả hai giao diện (mục 2). Dòng không bị chạm gửi lại thời điểm đã lưu giống
    từng byte; giờ kết thúc là giờ bắt đầu cộng số phút theo thời gian UTC trôi qua; ngày ẩn của dòng đi theo ngày của ca.
  - Ngữ nghĩa xác nhận đạt theo R-02, D-02 và E-1, và bản tóm tắt cuối "Save this session?" nói đúng điều được gửi; Cancel,
    Discard, Go back, Back và Done của hộp thoại con không gửi gì (mục 3).
  - Điền sẵn đi theo `today_local` của server, không bao giờ theo đồng hồ thiết bị, ở hai múi giờ thiết bị và qua nửa đêm của
    múi giờ báo cáo; quy tắc viết lại trong docs/04 và docs/10 (EN và VI) đúng nguyên văn PLAN mục C (mục 4).
  - Số liệu không đổi: `dist/server` và `dist/domain` giống từng byte a643794, và các body gửi lại cho cùng số phút làm, tín chỉ
    OT, thiếu giờ, mục review và trạng thái sign-off trên cả hai server (mục 5).
  - Ngăn xếp hộp thoại, B3-01 qua 1360px, chia sẻ chỉ đọc, ô lý do, các dòng và chip trên điện thoại hoạt động như tài liệu
    (mục 6 và 7). Điểm cần audit số 8 đạt; số 9: N-2 được giữ.
  - Các mục vùng B của vòng sửa đạt: seed của FIX1 (không còn 409 chập chờn, vẫn chứng minh việc từ chối), FIX2 mục 2, 5, 8 và
    10 (mục 8).
  - Các kiểm tra bắt buộc đạt (mục 9). Mười ba mutant của tôi trên hành vi vùng B đều bị bắt (mục 10).
  - Phát hiện 12 của sweep được tái hiện và đánh giá là gây hiểu lầm (F-UX3B-1); "Confirm breaks" giữ quy tắc gợi ý "tất cả
    hoặc không" trong khi docs/04 mô tả quy tắc khác (F-UX3B-2).

## 1. Phạm vi thật đã xem và chạy

1. Đọc như tuyên bố, không như bằng chứng: các quyết định của chủ sở hữu trên board ngày 2026-10-15/16 (U-21..U-27 trong
   WP5-UX3-PLAN, G-3 a, G-4 biến thể của chủ, N-1, N-2, Q6 b, chip 24 giờ) và của coordinator (điều kiện G-4, các điểm cần audit
   8 và 9, cách xử lý phát hiện 12); WP5-UX3-PLAN B8 và C, PLAN2 mục 4-6, bản ghi các slice T06-T10, gate thất bại, FIX1, sweep,
   FIX2 với Addendum 1, regate; docs/02 R-01, R-02, R-07, docs/03 phần ca và giờ nghỉ, docs/04 dòng 7, 16, 25, 62-70, 77,
   docs/10 D-02, E-1 và các mục của vòng 3, docs/12 "Unconfirmed breaks", EN và VI.
2. Code đọc toàn bộ: `breakRowsModel.ts`, `breakChipModel.ts`, `SessionDialog.tsx`, `BreakRows.tsx`, `BreakSubDialog.tsx`,
   `BreakChip.tsx`, `ClockOutDialog.tsx`, `ClockProvider.tsx` (phần hộp thoại), `ConfirmDialog.tsx`, `SessionList.tsx`,
   `dayEditorModel.ts`, `DayEditor.tsx`, `sessionModel.ts`, `TimeProblemPrompt.tsx`; ở a643794 `SessionForm.tsx`,
   `BreaksEditor.tsx`, `ClockOutDialog.tsx`, `DayEditor.tsx`, `dayEditorModel.ts`; các hàm server `createSession`,
   `updateSession`, `clockOut` và `planBatch`. `git diff a643794..7ce4e95 -- src/server src/domain migrations
   src/client/api.ts src/client/components/sessionModel.ts`: rỗng.
3. Probe của tôi (chỉ trong thư mục task, Edge, người tổng hợp trên `example.invalid`; bản sao trong bằng chứng dạng
   `*.ts.txt`): bắt request trên cả hai bản build (`zz-audb-req`), số liệu của server cho các body đã bắt trên cả hai bản build
   (`zz-audb-figures`), ngăn xếp hộp thoại và kiểm tra không gửi gì (`zz-audb-dialogs`), điền sẵn dưới đồng hồ FIX10
   (`zz-audb-prefill`), bố cục điện thoại và "Confirm breaks" khi chỉ một phần gợi ý vừa (`zz-audb-phone`), phát hiện 12
   (`zz-audb-dialogs` phần F, `zz-audb-f12b`), seed của FIX1 (`aaa-audb-seed` cùng mutant test và server), mười ba mutant vùng B.
4. Các kiểm tra bắt buộc trên một export sạch của target (mục 9).

## 2. Tính toàn vẹn request so với a643794 (ma trận)

Cách làm: cùng các giá trị gõ vào form của a643794 và hộp thoại của target (desktop 1280x800, múi giờ thiết bị
Asia/Ho_Chi_Minh, mỗi bản build một người tổng hợp mới), bắt mọi POST/PUT kèm mã trạng thái, rồi đọc lại ca đã lưu từ
`/api/days/:date` (`40-req-base.jsonl.txt`, `41-req-target.jsonl.txt`, so sánh `42-req-compare.txt`).

| Trường hợp | Thời điểm đã lưu | Body |
|---|---|---|
| K01 trong ngày, Los Angeles, ba giờ nghỉ gõ tay (kỳ current, không cần lý do) | bằng nhau | giờ kết thúc nghỉ mang offset tường minh (PLAN B8) |
| K01b gợi ý điền sẵn lưu nguyên so với a643794 "Suggest breaks" + "Confirm suggested breaks" | bằng nhau | giống từng byte |
| K02 qua đêm 22:00-06:00+1, nghỉ 23:50 trong 20 phút qua nửa đêm (kỳ cũ, có lý do) | bằng nhau | chỉ khác offset giờ kết thúc |
| K03 Sydney lùi giờ (fold), nghỉ 02:30 lần trước (+11:00) 45 phút (kết thúc 02:15 +10:00) | bằng nhau | chỉ khác offset giờ kết thúc; a643794 cần hai lần server hỏi, target một câu hỏi trên dòng |
| K04 như trên, lần sau (+10:00) | bằng nhau | chỉ khác offset giờ kết thúc |
| K05 Los Angeles nhảy giờ (gap), nghỉ 02:30, "Use 03:30 on 2026-03-08", 15 phút | bằng nhau | chỉ khác offset giờ kết thúc |
| K06 nghỉ 01:50 trong 20 phút qua khoảng nhảy (kết thúc 03:10 PDT) | bằng nhau | chỉ khác offset giờ kết thúc |
| K07 múi giờ nhập Asia/Ho_Chi_Minh, ca ở ngày địa phương kế tiếp (ngày ẩn của dòng đi theo) | bằng nhau | chỉ khác offset giờ kết thúc |
| K08 múi giờ nhập America/New_York, qua đêm, nghỉ 23:55 trong 10 phút qua nửa đêm | bằng nhau | chỉ khác offset giờ kết thúc |
| K09 "Confirm no breaks taken" so với "No breaks taken" | bằng nhau | giờ bắt đầu giữ offset điền sẵn (cùng thời điểm, R-UX3B-5) |
| K10 thông báo "Leave breaks unconfirmed for now" so với "Breaks not confirmed yet" | bằng nhau | như trên |
| K11 thông báo "Confirm no breaks taken" so với "No breaks taken" | bằng nhau | như trên |
| E12 sửa không đổi gì, giờ có giây | bằng nhau | giống từng byte |
| E13 chỉ sửa giờ kết thúc (dòng không chạm) | bằng nhau | giống từng byte |
| E14 dời ca sang ngày sau (Q6 b: ngày ẩn của dòng đi theo; a643794 phải gõ ngày giờ nghỉ) | bằng nhau | chỉ khác offset giờ kết thúc |
| E15 đổi múi giờ nhập từ Los Angeles sang Hồ Chí Minh (đọc lại giờ đồng hồ) | bằng nhau | chỉ khác offset giờ kết thúc |
| E16 đổi múi giờ đi rồi về LA, HCM, LA | bằng nhau | target ghim lại dòng không chạm (cùng thời điểm) |
| E17 "Confirm breaks" với dòng gợi ý so với một chạm "Confirm suggested breaks" | bằng nhau | giống từng byte |
| E18 "Confirm breaks" với dòng đã liệt kê so với "Confirm breaks as listed" | bằng nhau | giống từng byte |
| E19 "Confirm breaks", không gợi ý nào vừa, thông báo "Confirm no breaks taken" so với một chạm "No breaks taken" | bằng nhau | giống từng byte |
| E20 sửa không đổi gì vào ngày fold ở Sydney (nghỉ 02:30 +10:00) | bằng nhau | giống từng byte |
| C20 Check out với ô đã chọn so với "No breaks taken" | bằng nhau | giống từng byte `{breaks: [], breaks_confirmed: true, expected_version}` |
| C21 Check out với danh sách rỗng, ô chưa chọn | bằng nhau | giống từng byte `{breaks_confirmed: false, expected_version}` (bỏ danh sách theo E-1) |
| C22 Check out với một dòng gõ tay | bằng nhau | chỉ khác offset giờ kết thúc |
| C23 Check out sau khi xóa một dòng đã lưu chưa xác nhận (phát hiện 12) | bằng nhau | giống từng byte (cả hai đều bỏ danh sách) |

Kết quả: **ĐẠT** (25 trên 25 bằng nhau theo thời điểm đã lưu; mọi trường hợp không chạm giống từng byte). Giờ kết thúc là giờ
bắt đầu + số phút theo thời gian UTC trôi qua (K03: 45 phút qua giờ lùi; K06: 20 phút qua khoảng nhảy), gửi theo giờ địa
phương kèm offset. Ngày ẩn của dòng đi theo ngày của ca khi đổi ngày (E14, không hiện trường ngày) và giữ ngày đồng hồ đang
hiện khi đổi múi giờ (E15, E16).

## 3. Ngữ nghĩa xác nhận (R-02, D-02, E-1, thông báo G-4)

- Dòng đã liệt kê: `breaks_confirmed: true` (K01-K08, E14-E18, C22). Ô đã chọn: `breaks: []`, true (K09, C20). G-4 "Confirm no
  breaks taken": `[]`, true (K11, E19); "Leave breaks unconfirmed for now": `[]`, false, và ngày ở trạng thái
  `incomplete_breaks` với mục review `unconfirmed_breaks` (K10); "Go back and add breaks" và Escape trong thông báo: không gửi
  gì, focus về "Add break" (`43-dialogs-obs-run1.txt` D5). Check out (E-1): danh sách rỗng và ô chưa chọn bỏ `breaks` và vẫn
  chưa xác nhận (C21); thông báo và xác nhận cuối không dùng ở đó (O8).
- "Save this session?" liệt kê Day, Time (kèm múi giờ, `+1` và ngày bắt đầu khác) và Breaks đúng như được gửi: "3 breaks (15,
  30, 15 min)" với "Saving confirms these breaks as the breaks you took.", "No breaks taken" với cùng câu đó, và "Breaks not
  confirmed: OT for this day stays pending" với "Unconfirmed breaks keep OT for this day pending until you confirm them." (K01,
  K09-K11, D6, D7).
- Không gửi gì khi Cancel hoặc Discard (D2, D4, O7), Back hoặc Escape trong xác nhận cuối (D6, D7), Done và Cancel của hộp thoại
  con (P3, P4); lần ghi duy nhất là Save đã xác nhận (D9).
- Kết luận: R-02 ĐẠT (xác nhận gợi ý, giờ thật hoặc không nghỉ khi lưu và khi Check out; chưa biết khác với không), D-02 ĐẠT
  (chưa biết thì vẫn chờ), E-1 ĐẠT với hợp đồng API, thông báo G-4 ĐẠT (chỉ hiện khi không có dòng và ô chưa chọn). Phía giao
  diện của E-1 với dòng đã lưu trên ca đang chạy gây hiểu lầm: F-UX3B-1.

## 4. Điền sẵn (G-3 a) theo ngày của server

Preload đồng hồ FIX10 (bản sao giống từng byte) ở 2026-10-27T06:58:00Z (Thứ hai 23:58 Los Angeles), đồng hồ trình duyệt cố
định cùng thời điểm, múi giờ thiết bị Asia/Ho_Chi_Minh và America/New_York (ngày thiết bị đã là 10/27; `44-prefill-obs.txt`):
- 10/25: giờ tham chiếu cùng 3 giờ nghỉ gợi ý; 10/26 (hôm nay của server, hôm qua của thiết bị): chỉ giờ tham chiếu; 10/27: chỉ
  giờ tham chiếu. Sau nửa đêm của múi giờ báo cáo: chưa đọc lại thì trang vẫn coi 10/26 là hôm nay (chỉ giờ; thận trọng,
  R-UX3B-2); sau khi tải lại, 10/26 có giờ nghỉ và 10/27 chỉ có giờ. Hai múi giờ cho kết quả như nhau.
- Giờ tham chiếu 08:00-17:00 ở Los Angeles hiện theo múi giờ nhập (22:00-07:00+1 ở Hồ Chí Minh, 11:00-20:00 ở New York), kèm
  ghi chú "Pre-filled from your reference hours (08:00-17:00 in America/Los_Angeles) and suggested breaks". Sửa ca không bao giờ
  được điền sẵn (`SessionDialog.tsx:233-248`).
- docs/04 dòng 16 EN và VI đúng nguyên văn PLAN mục C; mệnh đề ở docs/10 (EN dòng 182, VI 183) đã thay; chữ "not seeded" còn
  lại duy nhất là đoạn trích lịch sử ở docs/10 dòng 226. Kết luận: ĐẠT.

## 5. Số liệu không đổi

`git diff a643794..7ce4e95 -- src/server src/domain migrations` rỗng; build sạch của tôi: `dist/server` 180 và `dist/domain` 46
file, 0 khác biệt hash (`47-dist-compare.txt`). 20 body ca đã bắt (trường hợp K và E) của cả hai bản build được gửi lại cho người
mới trên cả hai server: tính toán ngày (trạng thái, giờ thường, ngoài lịch, đủ điều kiện, tín chỉ), thiếu giờ, ngày và tổng
của bảng, trạng thái timesheet, ngày trong payload review, `unresolved_inputs`, tổng, đề xuất OT và thiếu giờ giống nhau ở cả bốn
tổ hợp cho mọi trường hợp (`46-figures-compare.txt`; lần chạy đầu đọc sai khóa của mục chưa giải quyết và được giữ lại là
`45-figures-base-run1-wrong-key.jsonl.txt`). Kết luận: ĐẠT.

## 6. Các hộp thoại

- Ngăn xếp (1280, trình sửa nổi dạng modal): trình sửa > hộp thoại ca > thông báo hoặc xác nhận, mỗi lúc một modal ở trên; mỗi
  lần Escape chỉ đóng cái trên cùng; focus về "Add session", "Add break", "Save", "Delete session …" hoặc nút của ngày; sau
  Save về "Times" (D1-D11). Tám lần Escape liên tiếp luân phiên đúng giữa câu hỏi và hộp thoại (D3).
- B3-01 qua 1360px (`43-dialogs-obs-run2.txt` B1-B6): khi hộp thoại ca đang mở, 1440 xuống 1280 giữ trình sửa non-modal dưới
  hộp thoại modal, 1280 lên 1440 giữ nó modal; việc chuyển xảy ra sau khi hộp thoại đóng. Khi đó focus về tiêu đề trình sửa,
  không về nút đã mở (R-UX3B-1).
- Chia sẻ chỉ đọc: không có Add session, Edit, Delete, Confirm breaks hay Check in/out; có chip "View only"; không ghi gì (S1,
  S2).
- Lý do trong kỳ cũ: một ô trong panel và cùng trạng thái trong hộp thoại ca; Save bị tắt đến khi gõ lý do (B1, B2, B4).
- Câu hỏi bỏ thay đổi ở Check out: xem mục 8.

## 7. Điện thoại (N-1, N-2) và điểm cần audit số 9

`48-phone-obs.txt`, project mobile: ca trong ngày hiện dòng ở 430/390/375/360/320 (danh sách 398/358/343/328/288px); ca qua
đêm hiện dòng ở 430 và chip từ 390 trở xuống; chữ trên chip theo 24 giờ (`Break 1 · 10/09/2026 10:00 → 10:15`, chỉ có ngày
khi qua đêm). Ca mới 390x844 với ba gợi ý: phần đầu 93px, chân cố định (775-844), ô đầu tiên trong tầm nhìn (271-315), phần
thân cuộn 297px khi là dòng và 259px khi là chip. Vùng chạm: mọi điều khiển cao 44px (ô "Confirm no breaks taken" nằm trong
label 44px); ô và nút của hộp thoại con 44px. Không cuộn ngang (trang và hộp thoại) ở mọi chiều rộng. Đánh giá N-2: được giữ;
khoảng cách đều, không quá thưa cũng không dính (`audb-phone-390x844-*-synthetic.png`), và việc cuộn là giới hạn do độ dài nội
dung đã ghi trong tài liệu (docs/10 dòng 246), phần đầu và chân luôn trong tầm nhìn.

## 8. Vòng sửa, vùng B

- **Seed của FIX1 (ĐẠT).** Khi một test trước đã để lại một mục ngày ở ngày được seed (`aaa-audb-seed`),
  `timesheet.spec.ts:452` đạt trên cả hai project; khi trả seed về phiên bản `null` thì test hỏng ngay ở bước seed với 409
  `stale_version` (lỗi chập chờn cũ); khi server chấp nhận phiên bản batch cũ thì test hỏng (không có cảnh báo nêu ngày), nên
  test vẫn chứng minh việc từ chối (`61-fix1-*.txt`).
- **FIX2 mục 2 (ĐẠT).** `day-editor.spec.ts:710` cố định đồng hồ trình duyệt ba ngày sau và một năm trước ngày của server và
  kiểm cả hai nhánh; mutant M18 của tôi (A09) làm test này hỏng: xem mục 10.
- **FIX2 mục 8 (ĐẠT).** Check out: Cancel và Escape khi chưa đổi gì đóng ngay, focus về "Check out"; sau khi thêm một dòng thì
  Cancel, Escape và `dialog.requestClose()` hỏi "Discard your changes?"; Keep editing giữ dòng và trả focus về Cancel; Escape
  trong câu hỏi là tiếp tục sửa; thay đổi đã hoàn tác thì đóng ngay; ô đã chọn cũng tính là thay đổi; Discard không gửi gì;
  Check out gửi ngay, không có hộp thoại cảnh báo nào (O1-O8). docs/04 dòng 70 và docs/10 dòng 238 (VI 239) nói đúng như vậy.
- **FIX2 mục 10 (ĐẠT).** Năm unit test bị xóa và bằng chứng của chúng: (1) body một chạm bằng body của form: giữ bởi
  `breakRowsModel.test.ts:181-202` (body của hộp thoại bằng JSON body form cũ, cùng các giá trị ghim) và E17 (giống từng byte
  trên giao diện); (2) không nghỉ, danh sách rỗng đã xác nhận, không có lý do: giữ bởi `:213-219` và E19; (3) bản nháp "Confirm
  breaks" lưu nguyên: giữ bởi `:181-202` và E17; (4) giữ các dòng đã liệt kê: giữ bởi `:204-212` cùng `:150-156` (đã xác
  nhận) và E18; (5) chọn sẵn "No breaks taken": đã bỏ theo thiết kế T08 được chấp nhận, giữ bởi test e2e
  `day-editor.spec.ts:3708` (ô chưa chọn, Save hỏi, danh sách rỗng đã xác nhận) và E19. Không gì bị làm yếu.
- **FIX2 mục 5 (ĐẠT, kèm R-UX3B-3).** docs/12 dòng 71 EN và VI nay giải quyết Check out bị từ chối ngay trong hộp thoại Check
  out (các dòng hoặc ô) và chỉ áp "Confirm breaks" cho ca đã kết thúc; đã tái hiện: lỗi 422 `saved_break_after_clock_out` được
  giải quyết bằng cách chọn ô (`49-f12b-obs.txt` G2-G3).
- **Phát hiện 12 của sweep (F-UX3B-1).** Khớp E-1 ở API và kết quả của a643794 sau khi xóa, nhưng hộp thoại gây hiểu lầm.

## 9. Kiểm tra bắt buộc (export sạch của target; `10-main-exits.txt`)

| Lệnh | Kết quả | Bằng chứng |
|---|---|---|
| `npm run typecheck` | exit 0, 0 dòng deprecation | `10-typecheck.txt` |
| `npm run lint` | exit 0 | `10-lint.txt` |
| `npm test` (hai lần) | exit 0 cả hai; mỗi lần 94 file, 2131 test | `10-npmtest-1.txt`, `10-npmtest-2.txt` |
| `npm run build` | exit 0; chunk chính `index-4YHzamSq.js` 487.17 kB, không có cảnh báo | `10-build.txt` |
| AC-13 (`vitest run tests/integration/ac13-two-week.test.ts`) | exit 0, 1/1 | `10-ac13.txt` |
| FULL e2e, cả hai project, đồng hồ thật (18:29-18:46Z) | exit 0; 627 đạt, 67 bỏ qua, 0 hỏng (desktop 317/30, mobile 310/37) | `11-e2e-real.txt` |
| `day-editor.spec.ts` dưới FIX10 ở 2026-11-01T08:45Z (LA 01:45, fold) | exit 0; 112 đạt, 18 bỏ qua (desktop 64, mobile 48) | `50-dst-20261101T0845.txt` |
| như trên ở 2027-03-14T10:30Z (LA 03:30, sau khoảng nhảy) | exit 0; 112 đạt, 18 bỏ qua | `50-dst-20270314T1030.txt` |

Không lần chạy nào hỏng vì timeout; không lần nào phải chạy lại.

## 10. Độ mạnh của test: mutant của tôi

Mỗi mutant được áp riêng trong một export nháp, build lại client, rồi chạy toàn bộ unit và `day-editor.spec.ts` trên project
desktop; file được hoàn tác và kiểm là giống hệt.

| Id | Mutant (hành vi vùng B) | Bộ unit | `day-editor.spec.ts` desktop | Kết quả |
|---|---|---|---|---|
| A01 | hộp thoại ca luôn gửi `breaks_confirmed: true` ("Leave unconfirmed" sẽ thành xác nhận) | 1 test vùng B hỏng | 2 hỏng (:146, :752) | bị bắt |
| A02 | so sánh ngày quá khứ `<=` (hôm nay của server cũng có giờ nghỉ gợi ý) | 2 hỏng | 2 hỏng (:593, :710) | bị bắt |
| A03 | giờ kết thúc nghỉ gửi bằng giờ đồng hồ bắt đầu cộng số phút trên ngày bắt đầu, không offset (không theo thời gian trôi qua) | 9 hỏng | 2 hỏng (:848, :1556) | bị bắt |
| A04 | ngày ẩn của dòng đi theo ngày ca nhưng giữ ghim cũ | 1 hỏng | 1 hỏng (:1075) | bị bắt |
| A05 | thông báo G-4 không bao giờ mở (danh sách rỗng, ô chưa chọn bị từ chối) | đạt | 3 hỏng (:146, :752, :3708) | bị bắt (e2e) |
| A06 | `breaksPayload` báo "đã xác nhận" khi Check out bỏ danh sách | 1 hỏng | đạt | bị bắt (unit); bị che ở request, vì `buildCheckOutDialogRequest` ghi `false` ở nhánh đó |
| A13 | nhánh bỏ danh sách của `buildCheckOutDialogRequest` ghi `breaks_confirmed: true` | 1 hỏng | 1 hỏng (:1866) | bị bắt |
| A07 | Done của hộp thoại con trả lại dòng gốc | đạt | 4 hỏng (:1277, :1433, :1556, :1977) | bị bắt (e2e) |
| A08 | Escape trong hộp xác nhận là xác nhận (Escape lồng nhau) | đạt | 8 hỏng (:2052, :2492, :2603 x2, :3992 x2, :4058 x2) | bị bắt (e2e) |
| A09 | M18: quy tắc ngày quá khứ đọc ngày của thiết bị | đạt | 2 hỏng (:593, :710); trên cả hai project nữa (`63-m18.txt`) | bị bắt (e2e) |
| A10 | Check out gửi các dòng đã liệt kê là chưa xác nhận | 1 hỏng | 4 hỏng (:1771, :1901, :1977, :2144) | bị bắt |
| A11 | ca đã xác nhận không nghỉ mở ra với ô chưa chọn | 1 hỏng | 2 hỏng (:380, :500) | bị bắt |
| A12 | dòng ghim đã sửa vẫn gửi thời điểm ghim | 3 hỏng | 4 hỏng (:593, :1075, :1277, :1433) | bị bắt |

Kết quả: 13 trên 13 bị bắt. A09 (M18) lúc 19:48Z, ngoài khoảng 07:00-17:00 UTC, cũng làm test cũ `:593` hỏng; test của FIX2
`:710` bắt nó ở mọi giờ. Không liên quan đến mutant, năm test tích hợp bị timeout 30 giây trong hai lần chạy unit dưới tải
song song (A01: `backup-prune`, `backup`, `bootstrap`; A04: `deadline-race`), R-UX3B-6. Mọi file bị đổi đều được hoàn tác và so
khớp giống export sạch (`60-mutants.txt`).

## Lỗi

1. **F-UX3B-1, Low (phát hiện 12 của sweep): hộp thoại Check out hiện danh sách rỗng trong khi server giữ các dòng đã lưu mà
   người dùng đã xóa.** `src/client/components/breakRowsModel.ts:389-391` (danh sách rỗng, ô chưa chọn thì bỏ `breaks` khi
   Check out), `src/client/components/ClockOutDialog.tsx:103` (nhãn "Check out, breaks unconfirmed") và
   `src/client/components/BreakRows.tsx:289-292` (dòng gợi ý không nói gì về các dòng đã lưu).
   - Tái hiện (`43-dialogs-obs-run2.txt` F1-F4, `audb-f12-*-synthetic.png`; `49-f12b-obs.txt`): qua API tạo một ca đang chạy có
     một giờ nghỉ chưa xác nhận (POST `/api/days/{today}/sessions` với `end: null`); hộp thoại mở với dòng đó và "Check out with
     these breaks"; Remove break 1: danh sách ghi "No breaks listed." và nút "Check out, breaks unconfirmed"; Check out gửi
     `{breaks_confirmed: false, expected_version}`; thẻ ca sau đó hiện lại giờ nghỉ đã xóa (22:00, 15 phút) là "Breaks not
     confirmed". Khi dòng đã lưu kết thúc sau bây giờ, cùng các bước cho lỗi 422 "A saved break ends after this Check out;
     resubmit the complete list of breaks to replace it" về một giờ nghỉ mà hộp thoại không còn hiện.
   - Kỳ vọng: điều hộp thoại hiện là điều Check out ghi lại (U-24, U-25), và E-1 vẫn hoạt động: khi hộp thoại bắt đầu với các
     dòng đã lưu và người dùng xóa hết với ô chưa chọn, hoặc gửi danh sách rỗng chưa xác nhận (`breaks: []`,
     `breaks_confirmed: false`, server nhận đây là tập đầy đủ chưa xác nhận và thay các dòng), hoặc vẫn bỏ danh sách nhưng nói
     trong hộp thoại rằng các giờ nghỉ đã lưu được giữ và chưa xác nhận. Khớp E-1 ở API và kết quả của a643794 sau khi xóa (chế
     độ pending của nó cũng bỏ danh sách), nhưng a643794 không mặc định xác nhận các dòng này, còn hộp thoại vòng 3 làm danh sách
     trông như đã đầy đủ.
   - Phạm vi và ảnh hưởng: hiện chỉ đạt được qua API (không đường giao diện nào lưu dòng nghỉ cho ca đang chạy); không số liệu
     nào đổi (giờ nghỉ vẫn chưa xác nhận, OT chờ). Sửa có phạm vi: nhánh Check out của `breaksPayload`/
     `buildCheckOutDialogRequest` hoặc chữ trong hộp thoại, một test e2e, và docs/04 dòng 70 cùng docs/10 (EN và VI) nếu hành vi
     đổi.
2. **F-UX3B-2, Low (tài liệu và code lệch nhau): "Confirm breaks" không liệt kê gợi ý nào trừ khi mọi giờ nghỉ gợi ý đều vừa,
   nhưng docs/04 mô tả việc liệt kê các gợi ý nằm trong ca.** `docs/04_UX_AND_SETTINGS.md:65` và `.vi.md:65` so với
   `src/client/components/SessionDialog.tsx:243-247` và `src/client/components/dayEditorModel.ts:73` (quy tắc cũ "tất cả hoặc
   không" của `quickBreaksOf`).
   - Tái hiện (`48-phone-obs.txt`, các dòng C): ca chưa xác nhận 09:00-12:00 và 09:00-14:00 không có dòng: "Confirm breaks" mở
     hộp thoại với 0 dòng; "Suggest breaks" trong cùng hộp thoại sau đó liệt kê 1 và 2 dòng nằm trong ca; ca 09:00-18:00 mở với
     3 dòng.
   - Kỳ vọng: tài liệu và code khớp nhau. docs/04 dòng 64 của a643794 ghi "only when every suggested break lies inside the saved
     session"; dòng 65 của vòng 3 ghi "the suggested breaks that lie inside the session; if none fits, Save asks". Hoặc đưa lại
     "every" vào docs/04 dòng 65 (EN và VI) và docs/10 dòng 245 (VI 246), hoặc liệt kê các gợi ý vừa (một lựa chọn hành vi cho
     coordinator, nhất quán với việc điền sẵn ca mới, vốn giữ các gợi ý nằm trong ca).
   - Ảnh hưởng: không rủi ro dữ liệu (Save luôn hỏi hoặc xác nhận đúng những gì đã liệt kê); văn bản UX chuẩn mô tả sai lối vào
     này.

## Rủi ro và đề xuất tùy chọn (không phải lỗi đã chứng minh)

- **R-UX3B-1** Sau khi chuyển chế độ qua 1360px lúc hộp thoại ca đang mở, trình sửa hiện lại khi hộp thoại đóng và lấy focus về
  tiêu đề của nó thay vì trả focus về "Add session" hay Edit (docs/04 dòng 68). Đích focus xác định; tình huống hiếm.
- **R-UX3B-2** Khi để trang mở qua nửa đêm của múi giờ báo cáo (không đổi focus hay hiển thị), hộp thoại ca giữ `today_local`
  cũ đến khi đọc lại các kỳ: ngày hôm qua mới chỉ có giờ tham chiếu. Thận trọng (không bao giờ gợi ý cho hôm nay).
- **R-UX3B-3** Câu đầu của docs/12 dòng 71 (không đổi từ trước vòng 3) nói Check out bị từ chối "while a break row is
  unconfirmed"; Check out với một dòng đã lưu chưa xác nhận nằm trong ca và bỏ danh sách vẫn thành công (C23). Các trường hợp
  bị từ chối là `saved_break_after_clock_out` và `future_break`.
- **R-UX3B-4** (vùng A, cho AUDIT-A/INT) `src/client/components/dayModel.ts:143`, cảnh báo phiên bản batch cũ, vẫn ghi "review
  the new labels" (G-2 a: "category"); thấy trong probe FIX1.
- **R-UX3B-5** Khi giờ bắt đầu gõ vào trùng giờ điền sẵn, offset ghim của phần điền sẵn được gửi (K09-K11): cùng thời điểm; với
  giờ tham chiếu nằm trong fold DST thì thời điểm sớm hơn được chọn mà không hỏi, đúng như tài liệu nói về giờ trong lịch.
- **R-UX3B-6** Dưới tải song song nặng, các test tích hợp `backup-prune`, `backup`, `bootstrap` và `deadline-race` bị timeout
  30 giây trong hai lần chạy unit của mutant (không thuộc vùng B; cả hai lần `npm test` bắt buộc đều đạt).
- **R-UX3B-7** Ô số phút đã điền chỉ hiện con số (placeholder "total mins" biến mất; tên "Break n minutes" là chữ ẩn); "ends
  10:15" bên cạnh cho ngữ cảnh.

## Gate chưa chạy hoặc bị chặn

Không có mục nào của vùng B. Audit này không lặp lại: ảnh cắt đường nối DPR 2 và hai lần timeout trên mobile của regate (vùng A
theo quyết định của coordinator); trình duyệt thứ hai (máy không cài).

## Xử lý phát hiện trước

- WP5-UX3-GATE attempt 1, seed chập chờn: đã đóng (mục 8). Các phát hiện vùng B của sweep: 2 đóng (A09), 5 đóng, 8 đóng, 10
  đóng; 12 được tái hiện và nêu thành F-UX3B-1 (coordinator đã chấp nhận là hành vi E-1 có tài liệu; audit này đánh giá hộp
  thoại gây hiểu lầm).

## Sẵn sàng phần mềm, phép của chủ và kết quả pilot

Sẵn sàng phần mềm của vòng 3 chờ việc sửa F-UX3B-1 và F-UX3B-2 (hoặc một quyết định có ghi lại của coordinator hay chủ cho từng
lỗi), một regate và một lần kiểm lại mới. Phép của chủ cho pilot và kết quả pilot là việc riêng, không bị ảnh hưởng.

## Một bước tiếp

Coordinator: quyết định F-UX3B-1 (gửi danh sách rỗng chưa xác nhận, hoặc nói trong hộp thoại rằng giờ nghỉ đã lưu được giữ) và
F-UX3B-2 (đưa lại "every" vào docs/04 dòng 65 và docs/10 dòng 245, VI 246, cả EN và VI, hoặc liệt kê các gợi ý vừa); giao một lần sửa có
phạm vi (`addresses_audit` WP5-UX3-AUDIT-B), freeze của nó, một regate docs-delta hoặc có mục tiêu, và một lần kiểm lại vùng B
mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm: WP5-UX3-AUDIT-B attempt 1 (agent a5ec67dc3fe32bb69 trên board); tác
  giả của snapshot: các agent slice, sửa và freeze của WP5-UX3 ghi trên board (T06 aeba6338447954b75, T07 a87232fc0935fad79, T08
  a0a4fd9361c7d74ea, T08B aba507cf0ab52b865, T09 a37c4616fc5da2e56, T10 aaffa913996c18d12, FIX1 a96e41f7ee27175f4, FIX2
  a457a761b24922fa2, và các agent khác).
- Context mới; reviewer không viết thay đổi nào của snapshot này và không sửa file source, test, docs, board hay STATE nào.
- Digest trước và sau: `262138e0c94c90dc0287e6de87e69f2aabfa68d3bd7bdb6262322c1e2b8f0191` (833 file), mỗi lần ba dạng
  (`01-digest-*-before.txt`, `01-digest-*-after.txt`); PASS của regate là trên cùng snapshot.
- Path report mới; chưa có review vùng B nào của vòng 3; mọi file review trước không đổi.
- Xử lý phát hiện và task tiếp của coordinator: như trên.
- Lỗi quy tắc (chỉ đọc, không ảnh hưởng): một lệnh liệt kê pipe vào `head`, một lần đọc tiến độ và một lần đọc `od -c` các byte
  cuối của brief pipe vào `tail`, một vòng chờ
  có `grep` đẩy đầu ra lỗi vào thiết bị null, và một lệnh thừa `python -c "print(1)"` ghi vào một file task. Sửa probe (có
  ghi lại, không phải lỗi sản phẩm): lần bắt request đầu trên a643794 chờ sai chữ xác nhận (ba trường hợp một chạm); lần chạy
  hộp thoại đầu có race trong probe Check out, giả định sai về thay đổi và cách mở ngày trong chế độ chia sẻ; lần chạy số liệu
  đầu đọc sai khóa. Không đưa gì vào trình thông dịch qua stdin, không xóa đệ quy, không dừng tiến trình nào.
