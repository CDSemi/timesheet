# Review độc lập

Bản gốc tiếng Anh: [WP2_RECHECK_B.md](WP2_RECHECK_B.md).

- Giai đoạn/ngày/reviewer và model/effort quan sát được: WP2, kiểm lại vùng B (workspace, admin, UI và tích hợp) sau vòng sửa lỗi audit; 2026-10-04 (UTC); task WP2-AUDIT-B2 lần 1 (board ghi kind `audit`, profile timesheet-auditor). Model tự báo `claude-opus-5-5`; board yêu cầu effort xhigh, còn effort thực tế không quan sát được. Model tác giả mạnh nhất trong snapshot là `claude-opus-5-5` (WP2-T02 và WP2-T03, theo WP2_HANDOFF). Các tác giả bản sửa WP2-FIXA, WP2-FIXB và committer chạy `claude-sonnet-5-5`. Vì vậy model của reviewer không yếu hơn. WP2-AUDIT-A2 chạy cùng lúc trong bản clone riêng, không dùng chung file nào.
- Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:
  - Commit được kiểm: `f79413b77e7f745e1eff383f1ad748e7667533da`. Đây là `freeze_commit` của WP2-GATE2, trùng origin/main theo gate.
  - Source digest: `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` (611 file, không gồm handoff/). Giá trị này giống nhau trước và sau, ở thư mục dự án và trong bản clone scratch, và trùng phép đối chiếu `git ls-tree` cũng như digest của gate.
  - HEAD của dự án là commit được kiểm cả trước lẫn sau. Thay đổi trong working tree chỉ nằm dưới handoff/.
  - Source đủ: mọi lệnh chạy trong một bản git clone của commit đó trên ổ C: (ngoài Dropbox). Một bản clone thứ hai ở 8fae685 chỉ dùng để so computed style. Cả hai bản clone đã bị xóa sau khi xong.
- Quyết định: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED.**
  - Đã xác minh các bản sửa sản phẩm cho WP2-B-01 và WP2-B-02, cũng như phần bổ sung đổi múi giờ của FIXB và màn hình admin của WP2-FIXA. Gate F1 vẫn đóng; `npm run verify` và `npm run test:e2e` (cả hai project) đều đạt.
  - Có hai phát hiện mới:
    - WP2-B2-01 (mức trung bình): e2e mới cho R-07 viết cứng độ lệch giờ mùa hè của Los Angeles. Test sẽ chắc chắn hỏng vào mùa đông, bắt đầu khoảng 2026-11-03.
    - WP2-B2-02 (mức thấp): vẫn còn các kích thước viết cứng do WP2 đưa vào, nằm ngoài danh sách của WP2-B-02.
  - Cả hai chỉ cần sửa test hoặc style, không đổi hành vi sản phẩm.
- Phạm vi thật đã xem/chạy:
  1. Diff source 8fae685..f79413b ngoài handoff/ (11 file): DayEditor.tsx, SessionForm.tsx, sessionModel.ts, DayFigures.tsx, styles.css, api.ts, HolidayImport.tsx, holidayImport.ts và ba file test. Đã đối chiếu các thay đổi với R-07, quy tắc 7 và 8 của AGENTS và pre-flight UI của AGENTS.
  2. WP2-B-01, bằng probe riêng. Múi giờ trình duyệt là Asia/Tokyo (không có DST) và Europe/Berlin (có DST), cả hai khác múi giờ báo cáo và khác múi giờ của máy. Instant kỳ vọng lấy từ một oracle Intl độc lập với bộ chuyển đổi của app. Đã kiểm:
     - múi giờ nhập mặc định và datalist;
     - instant được lưu khi nhập giờ ở múi giờ mặc định;
     - việc chọn Los Angeles một cách tường minh;
     - giờ về dự kiến: hiện theo múi giờ hiển thị, có nhãn "(derived)", có ghi chú chỉ để hiển thị, server không có trường này, và khi xem không phát sinh request ghi nào;
     - đổi múi giờ của một phiên đã lưu: giờ đồng hồ đã gõ được đọc lại, kể cả giờ nghỉ, và ngày kế toán không đổi;
     - hỏi lại DST sau khi đổi múi giờ: giờ lặp (Los Angeles sang Sydney, chọn instant muộn hơn) và giờ không tồn tại (London sang Los Angeles, dời sang giờ hợp lệ đầu tiên); trong lúc hỏi không có gì được lưu;
     - gõ từng phím một múi giờ mới, không có lỗi trang.
  3. Chạy lại nguyên probe của lần 1: múi giờ nhập mặc định, F1, inline style theo CSP của mọi màn hình, transition, radius, tràn ngang, vùng chạm 44 px và dark mode.
  4. WP2-B-02 được kiểm bằng hai cách độc lập:
     - kiểm tĩnh: thay 12 token mới bằng giá trị gốc trong styles.css rồi so từng dòng với 8fae685;
     - probe computed style trên màn hình thật ở cả hai commit, cùng dữ liệu tổng hợp. Các màn hình gồm đăng nhập, timesheet, hộp thoại sửa hàng loạt, day editor, OT có một dòng nghỉ, lịch sử, cài đặt, hộp thoại Clock out và admin. Probe bao 11 selector mục tiêu cùng chữ ký style của mọi phần tử hiển thị.
  5. Hồi quy vùng B:
     - toàn bộ bộ e2e trên cả hai project;
     - xem trực tiếp 13 ảnh chụp: day editor (mặc định múi giờ hiển thị, đổi múi giờ, nghỉ 09:00–18:00), xem trước ngày lễ (FIXA), OT sau khi ghi dùng, xung đột sửa hàng loạt, Clock out, F1 và các ảnh của probe;
     - hợp đồng client và server của WP2-FIXA (bỏ các số đếm, `finalized_conflicts` chỉ còn ngày).
  6. Kiểm các test mới có phụ thuộc môi trường hay ngày chạy không. Một config tạm kiểm múi giờ máy, một phép tính cửa sổ bằng Intl kiểm ngày chạy, và một lần chạy lại các bước của test đã commit trên một ngày PST.
- Bảng bằng chứng: lệnh | kết quả/exit | bằng chứng (tất cả trong `handoff/delivery/evidence/WP2-AUDIT-B2/`, đã che, LF; Node v24.21.0 portable gọi bằng đường dẫn đầy đủ; kênh Edge; không tải trình duyệt; TEMP/TMP và ảnh chụp nằm trong thư mục làm việc riêng của auditor trên ổ C:):

| Lệnh | Kết quả/exit | Bằng chứng |
|---|---|---|
| `git rev-parse HEAD`; `node scripts/source-digest.mjs`; `git ls-tree … \| sha256sum` (trước; dự án và clone) | HEAD f79413b; 4c2bd7ef…3528 (611 file); exit 0 | `digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone và clone gốc); `npm run build` (clone gốc) | mỗi bên 144 gói; exit 0 / 0 / 0 | `npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` (clone) | typecheck, lint (`no-deprecated`), 31 file / 606 test, build, smoke 28 PASS; 0 dòng deprecation; exit 0 | `verify.txt` |
| cùng NODE_OPTIONS, `npm run test:e2e` (clone; desktop và mobile) | 74 đạt, 2 bỏ qua (test chỉ cho mobile, chạy trên desktop); exit 0 | `e2e.txt` |
| `node css-substitute.mjs <css 8fae685> <css f79413b>` | 12 token, thay 12 chỗ dùng, 0 dòng khác trên 1017 dòng; exit 0 | `css-substitute.txt`, `css-substitute.mjs.txt` |
| `playwright test zz-audit-b2-style` ở 8fae685 và ở f79413b, rồi `node style-compare.mjs` | hai lần chạy exit 0/0; 11 selector mục tiêu giống hệt trên cả hai project; khác biệt phần tử duy nhất là đoạn ghi chú giờ về dự kiến mới `p.hint.muted`. Một cặp chạy trước với thời gian chờ 0,3 s cũng exit 0/0 và chỉ cho thấy mẫu lấy giữa transition; đã chạy lại với 1,2 s | `style-runs.txt`, `style-compare.txt`, `style-targets-*.json`, `zz-audit-b2-style.spec.ts.txt`, `style-compare.mjs.txt` |
| `playwright test zz-audit-b2-probe` (B-01, Tokyo và Berlin) | lần 1: 6 đạt, 2 hỏng (lỗi của probe: phiên thứ hai do probe tạo chồng lên phiên thứ nhất; sản phẩm từ chối đúng, `overlapping_user_intervals`); lần 2 sau khi sửa probe: 8 đạt; exit 1 / 0 | `probe-b01-run1.txt`, `probe-b01.txt`, `audit-b2-input-zone-*.json`, `audit-b2-zone-change-*.json`, `audit-b2-*-synthetic.png`, `zz-audit-b2-probe.spec.ts.txt` |
| chạy lại nguyên probe lần 1 `zz-audit-b-probe` | 8 đạt; múi giờ nhập mặc định Asia/Saigon = múi giờ hiển thị (lần 1: America/Los_Angeles); thông báo F1 và số dư không đổi; 0 inline style, 0 tràn ngang, 0 vùng chạm nhỏ trên mobile; exit 0 | `probe-attempt1.txt`, `audit-b-input-zone-*.json`, `audit-b-f1-*.json`, `audit-b-screens-*.json`, `input-zone-default-*-synthetic.png`, `insufficient-balance-viewport-*-synthetic.png` |
| `playwright test zz-audit-b2-typing` | gõ từng phím múi giờ: không lỗi trang, không lưu gì trước khi Save, sau đó là instant theo London; 2 đạt; exit 0 | `typing-probe.txt`, `audit-b2-typing-*.json` |
| `AUDIT_TZ=<zone> playwright test -c zz-audit-b2-tz.config.ts day-editor.spec.ts -g "defaults its input zone…"` (Hồ Chí Minh, Tokyo, Berlin) | mỗi lần 2 đạt; exit 0 ×3: `timezoneId` ghim ở cấp file làm test không phụ thuộc múi giờ máy | `tz-dependence.txt` |
| `node season-window.mjs` | assertion đã commit hỏng với mọi ngày từ 2026-11-01 đến 2027-03-13 (133 ngày; ra 07:00 thay vì 08:00); exit 0 | `season-window.txt`, `season-window.mjs.txt` |
| `playwright test zz-audit-b2-season` (chạy lại các bước của test đã commit trên ngày 2026-01-14) | lưu 22:00 Asia/Saigon = 15:00Z = 07:00 Los Angeles (sản phẩm đúng; test đã commit kỳ vọng 08:00); 2 đạt; exit 0 | `season-probe.txt`, `audit-b2-season-*.json`, `zz-audit-b2-season.spec.ts.txt` |
| digest sau (đã bỏ file probe; clone, clone gốc, dự án), cộng một lần kiểm lại dự án sau khi dọn file `nul` | clone sạch, 4c2bd7ef…3528 theo hai cách; clone gốc sạch; dự án HEAD f79413b, 4c2bd7ef…3528, không có gì ngoài handoff/ (lúc 10:32Z và lại lúc 10:36Z); exit 0 | `digest-after.txt` |
| `node scripts/precommit-check.mjs` trên một index tạm chứa output của audit này (index thật không bị đụng tới); `validate_package.py --preflight` (Python của workflow, thư mục dự án, sau khi viết cặp report này) | quyền riêng tư PASS, 61 file, 0 phát hiện; preflight PASS, 54 cặp bản dịch, 905 link nội bộ, 91 kịch bản; exit 0 / 0 | `preflight-privacy.txt` |

  Lần chạy probe bị hỏng vẫn được ghi vì nó đã xảy ra. Lỗi nằm trong code probe do auditor viết, và sản phẩm không đổi giữa các lần chạy. Các spec probe và config tạm chỉ tồn tại trong các bản clone và đã được bỏ trước khi đo digest sau. Log được che bằng `export-evidence.mjs.txt`. Các bản clone, cơ sở dữ liệu tạm và output e2e đã bị xóa, và không còn tiến trình nào chạy.

  Sự cố file lạc: lúc 10:33:58Z, một lệnh xuất bằng chứng của tôi lấy `/dev/null` làm đích. Git Bash chuyển nó cho Node thành đường dẫn native `nul`, và Node tạo một file thật chưa track tên `./nul` ở gốc dự án. Nội dung là bản sao đã che của spec probe lần 1, chỉ có dữ liệu tổng hợp. Coordinator báo, và tôi đã xóa file. Lần kiểm lại dự án lúc 10:36Z cho thấy file đã mất, không có gì ngoài handoff/ và digest không đổi. Không file được track nào bị đụng tới, và file xuất hiện sau lần đo digest sau lúc 10:32Z.

- Lỗi: mức | file/hàm | tái hiện | kỳ vọng/thực tế | quy tắc/AC | sửa có phạm vi:

  **WP2-B2-01 — Trung bình — e2e mới cho R-07 viết cứng độ lệch giờ mùa hè Thái Bình Dương (PDT) nên sẽ hỏng mỗi mùa đông.**
  - File: `tests/e2e/day-editor.spec.ts:222-223`, cùng chú thích ở dòng 209. Đó là test "manual entry defaults its input zone to the display zone and stores the instant typed there (R-07)" (dòng 187).
  - Tái hiện:
    - Spec ghim múi giờ trình duyệt là Asia/Ho_Chi_Minh (+07:00, không DST; dòng 16). Nó lấy `date` theo đồng hồ thật: ngày làm việc trống gần nhất trong quá khứ của kỳ đang hiện (dòng 193).
    - Test gõ 22:00–23:30 rồi assert `dateTimeIn(start, LA) === "<date> 08:00"` và `"<date> 09:30"`. Điều này chỉ đúng khi Los Angeles ở −07:00.
    - `season-window.txt`: với mọi ngày từ 2026-11-01 đến 2027-03-13, phép chuyển cho ra 07:00. Test sẽ hỏng ở mọi lần chạy mà ngày làm việc trống gần nhất rơi vào khoảng đó, tức từ khoảng 2026-11-03 đến 2027-03-15 (theo ngày Los Angeles), và lặp lại mỗi mùa đông.
    - `season-probe.txt` chạy lại các bước đã commit trên ngày 2026-01-14. Sản phẩm lưu đúng giờ đã gõ theo múi giờ hiển thị (15:00Z = 07:00 PST), còn assertion đã commit sẽ kỳ vọng 08:00.
    - Test không phụ thuộc múi giờ máy (`tz-dependence.txt`); chỉ ngày chạy là quan trọng.
  - Kỳ vọng/thực tế:
    - Kỳ vọng: một test hồi quy R-07 đúng với mọi ngày chạy.
    - Thực tế: một gate e2e bắt buộc (từ WP3 trở đi) sẽ chuyển đỏ trong khoảng một tháng nữa dù sản phẩm không đổi. Điều đó dễ bị hiểu nhầm là sản phẩm hồi quy, hoặc dẫn tới một bản "sửa" sai.
  - Quy tắc/AC: quy tắc 5 của AGENTS (bằng chứng thực thi tái hiện được); quy tắc 7 của AGENTS (tách instant và múi giờ trong oracle); gate e2e của docs/06.
  - Sửa có phạm vi (chỉ test):
    - Suy ra kỳ vọng theo Los Angeles từ chính ngày chạy thay vì viết cứng. Ví dụ: tính bằng Intl instant của `<date>T22:00` ở múi giờ hiển thị, assert giờ bắt đầu đã lưu bằng instant đó, rồi assert `dateTimeIn(stored, LA)` bằng `dateTimeIn(expected, LA)` và vẫn cùng ngày lịch. Cách khác là dùng một ngày cố định trong quá khứ kèm lý do.
    - Sửa chú thích dòng 209 cho khớp.
    - Kiểm lại: chạy test đó trên cả hai project, cộng một lần chạy lại trên một ngày PST.

  **WP2-B2-02 — Thấp — vẫn còn các kích thước viết cứng do WP2 đưa vào, nằm ngoài danh sách WP2-B-02.**
  - File: `src/client/styles.css`:
    - dòng 241-242: `width/height: 1.25rem`, checkbox và radio (WP2-T09A, 717db3e);
    - dòng 473-474: `0.7rem`, dấu trạng thái `.shape` (WP2-T09B, 9c36a7e);
    - dòng 629: `max-height: 90dvh`, `.dialog` (WP2-T09B);
    - dòng 706, 884 và 1000: `font-size: 1rem`, `.dialog h3`, `.ot-leave-head h3` và `.user-head h3` (WP2-T10; 55d3bb8 của T11; da0ffc4 của T12).
  - Không giá trị nào trong số này có trong stylesheet của WP1 (f32978f). Padding 6px và 14px dùng lại giá trị của WP1, còn đường kẻ 1–2 px và breakpoint 767/768 px đã được chấp nhận ở lần 1.
  - Kỳ vọng/thực tế: bước 1 trong "Unified Frontend & UI/UX Standards" của AGENTS ghi "introduce new values only as CSS custom properties". Lần 1 liệt kê mười giá trị viết cứng; WP2-FIXB đã token hóa đúng mười giá trị đó, còn sáu khai báo này bị danh sách lần 1 bỏ sót.
  - Quy tắc: pre-flight UI của AGENTS (chuẩn hình ảnh E-8).
  - Sửa có phạm vi:
    - Thêm token vào `:root`, ví dụ `--control-check-size`, `--shape-size`, `--dialog-max-height` và `--font-size-base`, rồi tham chiếu chúng, không thay đổi hình ảnh.
    - Kiểm lại: phép kiểm thay thế tĩnh cộng phép so computed style với f79413b, `npm run verify` và bộ e2e.

- Rủi ro/đề xuất tùy chọn, tách lỗi chứng minh được:
  1. Trình duyệt có thể báo tên múi giờ cũ, ví dụ Edge báo `Asia/Saigon` thay cho `Asia/Ho_Chi_Minh`. Tên này được lưu làm múi giờ nhập của phiên (server chấp nhận), và datalist khi đó liệt kê cả hai cách viết. Tùy chọn: chuẩn hóa hoặc bỏ trùng khi hiển thị.
  2. `changeZone` bỏ offset đã ghim ngay ở phím gõ đầu tiên. Vì vậy gõ trở lại múi giờ ban đầu sẽ đọc lại giờ đồng hồ, và giờ lặp sẽ được hỏi lại. Điều này chấp nhận được và đã ghi trong code; không có gì được lưu cho tới khi Save.
  3. Không có test đã commit nào ghim các giá trị computed của WP2-B-02 (probe của FIXB là tạm). Phép so trên màn hình thật của audit này đã bao phủ điều đó; một hồi quy sau này sẽ chỉ lộ ra qua ảnh chụp.
  4. Các rủi ro 1, 3, 4 và 6–10 của lần 1 (tên trường thô ở màn hình History, legend DST, số đếm ngày lễ, `leave_kind` của WP1 và các mục khác) không được đánh giá lại. Rủi ro 4 nay không còn: WP2-FIXA đã bỏ các số đếm.
- Gate chưa chạy/bị chặn và lý do: không gate nào của vùng B bị chặn.
  - Không chạy theo thiết kế: chốt sổ, revision, PDF và email của WP3; Linux và NAS; kênh Chrome/Chromium (chỉ Edge).
  - Vùng A (WP2-AUDIT-A2) chịu trách nhiệm đánh giá sổ cái, đồng thời và quyền riêng tư của bản xem trước ngày lễ. Bộ test (606 test, gồm LG và DF) đã đạt trong `npm run verify`.
- Xử lý phát hiện trước:
  - WP2-B-01 (Trung bình): **đã sửa, đã xác minh.**
    - Phiên nhập tay mới mặc định theo múi giờ hiển thị hiện tại ở cả hai múi giờ trình duyệt, và múi giờ báo cáo vẫn chọn được tường minh.
    - Giờ gõ ở múi giờ mặc định được lưu đúng instant mà oracle Intl cho ra với múi giờ đó; chọn Los Angeles tường minh thì lưu giờ đồng hồ Los Angeles.
    - Giờ về dự kiến hiện theo múi giờ hiển thị, có nhãn "(derived)" và ghi chú chỉ để hiển thị. Server không trả trường này, và xem nó không gửi request ghi nào.
    - Đổi múi giờ của phiên đã lưu thì giờ đồng hồ được đọc lại, kể cả giờ nghỉ, ngày kế toán giữ nguyên, và giờ lặp hoặc giờ không tồn tại do DST được hỏi lại.
    - Probe lần 1 nay ghi nhận múi giờ hiển thị là mặc định.
  - Quan sát liên quan (giờ về dự kiến theo múi giờ hiển thị): đã sửa, đã xác minh (như trên).
  - WP2-B-02 (Thấp): **đã sửa cho mười giá trị đã liệt kê, đã xác minh.**
    - Sau khi thay thế, stylesheet giống hệt 8fae685.
    - Giá trị computed của cả 11 selector mục tiêu trên màn hình thật giống hệt trên desktop và mobile.
    - Các giá trị viết cứng còn lại của WP2 được ghi thành phát hiện mới WP2-B2-02.
  - Phần bổ sung của WP2-FIXB (đổi múi giờ của phiên đã lưu): đã xác minh, kể cả gõ từng phím.
  - WP2-GATE F1: **vẫn đóng**. Luồng thiếu số dư đạt trên cả hai project với thông báo "Not enough available OT balance. 1h 00m available, 1h 01m needed. Nothing was reserved.", và số dư cùng danh sách nghỉ không đổi (`audit-b-f1-*.json`, `insufficient-balance-viewport-*-synthetic.png`).
  - WP2-A-01 (vùng A): chỉ kiểm phía vùng B. Màn hình nhập ngày lễ của admin không còn hiện số đếm nhân viên, nêu quy tắc giữ nguyên, và hiện `finalized_conflicts` dưới dạng ngày. Kiểu dữ liệu client khớp server, e2e admin đạt, và đã xem ảnh chụp. Kết luận về quyền riêng tư thuộc WP2-AUDIT-A2.
- Tách sẵn sàng phần mềm, phép chủ và kết quả pilot:
  - Sẵn sàng phần mềm của WP2: chưa nghiệm thu. Vùng B là FIX REQUIRED (WP2-B2-01 mức trung bình, WP2-B2-02 mức thấp); WP2-AUDIT-A2 báo cáo riêng.
  - Phép của chủ: chưa xin; không triển khai, không gửi email.
  - Kết quả pilot: chưa có (WP5).
- Một bước/prompt tiếp: coordinator giao một task sửa có phạm vi với `addresses_audit: WP2-AUDIT-B2` qua [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), gồm WP2-B2-01 (chỉ test) và WP2-B2-02 (token trong styles.css, giá trị computed không đổi). Tiếp theo là freeze, một gate WP2 mới và kiểm lại vùng B trên digest mới.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- Task/attempt review, reviewer ID và author ID đang kiểm:
  - Review: WP2-AUDIT-B2 lần 1. Agent ID của reviewer trên board là `a9e5f7844199fa574`, theo board ghi; ID này không thấy được từ bên trong phiên.
  - Tác giả vòng sửa trên board: WP2-FIXA `aa3af6ddfb57e0a19`, WP2-FIXB `afdfdb7208db48436`, freeze/commit WP2-FIX-FREEZE `a478b6cc23befba3d`, gate WP2-GATE2 `a44cc217fb0ba6b27`.
  - Các tác giả WP2 trước đó được liệt kê trong [WP2_REVIEW_B](WP2_REVIEW_B.vi.md).
- Context mới; xác nhận reviewer không viết thay đổi:
  - Context mới. Reviewer này không viết gì trong WP2 và không đổi source.
  - Chỉ ghi report này, bản dịch, phần kết quả trong brief và `evidence/WP2-AUDIT-B2/`. Ngoại lệ duy nhất là file chưa track `./nul` tạo nhầm, đã xóa như mô tả dưới bảng bằng chứng.
  - Các spec probe và config tạm chỉ tồn tại trong các bản clone scratch và đã được bỏ trước khi đo digest sau.
- Digest trước/sau; bằng chứng gate snapshot đó: `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` trước và sau. Giá trị này trùng digest của WP2-GATE2 (`evidence/WP2-GATE2/digest-*.txt`) cho cùng commit f79413b.
- Path report mới giữ lịch sử review trước: `handoff/delivery/WP2_RECHECK_B.md` và `.vi.md` (mới). [WP2_REVIEW_B](WP2_REVIEW_B.vi.md) và bằng chứng của nó giữ nguyên.
- Xử lý phát hiện và task sửa/recheck tiếp của coordinator:
  - WP2-B-01 và WP2-B-02: đóng vì đã xác minh; các giá trị viết cứng còn lại được chuyển thành WP2-B2-02.
  - Còn mở: WP2-B2-01 (Trung bình) và WP2-B2-02 (Thấp), sửa được trong một task test/style có phạm vi, không đổi server hay hành vi.
  - Sau đó là freeze, một gate WP2 mới và kiểm lại WP2-AUDIT-B trên digest mới, giữ nguyên report này.
