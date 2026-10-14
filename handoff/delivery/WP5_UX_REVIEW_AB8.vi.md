# Thiết kế lại giao diện WP5, kiểm lại độc lập gộp vùng A và B (AB8) sau WP5-UX-FIX9

Bản dịch của [WP5_UX_REVIEW_AB8.md](WP5_UX_REVIEW_AB8.md); tiếng Anh là nguồn chuẩn.

- **Gói/ngày/reviewer và model/effort quan sát được:** vòng thay đổi giao diện theo yêu cầu chủ dự án WP5, task WP5-UX-AUDIT-AB8,
  attempt 1, 2026-10-14 02:03Z đến khoảng 03:18Z (2026-10-13 19:03 đến 20:18 giờ America/Los_Angeles). Reviewer tự báo model
  `claude-opus-5-5`, profile timesheet-auditor (effort do profile đặt, không quan sát được từ bên trong). Đây là một lần kiểm lại phần
  thay đổi, gộp vùng A và vùng B. Các review A đến A7 và B đến B7 được giữ nguyên.
- **Commit SHA và source digest đã kiểm chính xác; commit chưa push; source đủ hay không:** commit
  `3670a6c3c22ddcf75138927ed60f4cd9bf02078d` (bản freeze của WP5-UX-REGATE7). HEAD = origin/main = `dc70ba6` trước và sau; HEAD chỉ khác
  3670a6c trong `handoff/` (diff ngoài handoff rỗng). Digest `58b0deee5d0169f0211740de34953517500576baa2fd914d5a26059d5ba1dffd`, 795
  file, không tính `handoff/`. Digest được ghi đầu tiên (02:04:02Z, ngay sau `node --version`) và cuối cùng (03:10:50Z), mỗi lần ở ba
  dạng bằng nhau: `scripts/source-digest.mjs`, `git ls-tree` tại 3670a6c và tại HEAD. Bản export sạch bằng `git archive` của 3670a6c
  chứa đúng 795 path và blob của cây (cmp 0, trước và sau mọi lần chạy). Source đủ: `npm ci` exit 0 trong bản export.
- **Quyết định: FIX REQUIRED.**
  - **WP5-UX-B7-01 = WP5-UX-A7-01 đã đóng.** FIX9 chỉ sửa test. Spec isolation và shell đạt trong cửa sổ lỗi trên đồng hồ thật
    (2026-10-13, sau hạn 17:00), và mọi khẳng định isolation đều được chạy tới và đạt trên cả hai project. Spec chưa sửa của 255ba17
    vẫn lỗi vào cùng thời điểm.
  - **Sản phẩm không đổi kể từ 255ba17:** `dist/` giống nhau từng byte (230 file: 180 server, 46 domain, 4 client). Kết luận vùng A và
    vùng B của A7 và B7 được giữ nguyên.
  - Độ mạnh của test giữ được: `fixtures.ts` chỉ thêm, và thay đổi trong spec chỉ thay nguồn ngày seed. Không khẳng định nào bị bỏ
    hay làm yếu, và không thêm skip, fixme hay only. Trường hợp biên báo lỗi rõ ràng.
  - Quy tắc seed đúng. Tôi tự suy ra nó, và test tất định mới báo lỗi khi đưa lại cách chọn cũ.
  - **Toàn bộ e2e bắt buộc không đạt:** exit 1, 207 đạt, 3 lỗi, 26 bỏ qua. Ba lỗi là một lỗi phụ thuộc lịch có từ trước trong hai
    test hạn chót, **WP5-UX-AB8-01**: sau giờ hạn của kỳ đang hiển thị, các test không dựng được một hạn chót còn ở phía trước. Chúng
    lỗi y hệt trên 255ba17. Đây là cùng loại lỗi với B7-01, nên nó chặn theo cùng quy tắc.
  - Để báo mọi lỗi chặn ngay trong lượt này, tôi quét bộ test dưới đồng hồ giả lập. Cách làm đã được đối chứng với đồng hồ thật (xem
    bên dưới). Lượt quét tìm thêm ba lỗi cùng loại, đều chỉ ở test và có từ trước FIX9:
    - **AB8-02:** quỹ ngày trống cạn vào 2026-11-28 đến 11-30;
    - **AB8-03:** việc nhập ngày lễ đụng một timesheet đã chốt vào 2026-12-26 đến 12-31;
    - **AB8-04:** năm nhập mặc định lệch nhau từ 1 tháng 1 đến 30 tháng 9, nên test lỗi mỗi ngày kể từ 2027-01-01.
  - Typecheck, lint, `npm test` (83 file, 1827 test) và AC-13 đạt.

## Phạm vi thật đã xem và chạy

1. **Phần thay đổi và sản phẩm.** Tôi đọc toàn bộ diff `255ba17..3670a6c` ngoài `handoff/`. Tôi export sạch 255ba17 và 3670a6c, chạy
   `npm ci` và `npm run build` ở mỗi bản, rồi so `dist/` từng file. Tôi build lại 3670a6c và so lại trước khi chạy toàn bộ e2e.
2. **Độ mạnh của test.** Numstat, các dòng spec bị bỏ và được thêm, quét skip/fixme/only trên các dòng thêm và trên cả cây `tests/`,
   và số `test(` và `expect(`.
3. **Quy tắc seed.**
   - Phép tính ngày của riêng tôi trên 2026-2027 (730 ngày), so với `currentPayPeriod`, `payPeriodContaining` và helper dùng chung.
   - Lịch lương đã seed và các ngày lễ tổng hợp, đọc từ `reference/examples/`.
   - Thứ Ba hạn chót lúc 16:59, 17:00 và 23:59, và nửa đêm trước và sau ngày trả lương, qua `zones.ts`.
   - Bảy đột biến của test hoặc helper, chỉ trong bản nháp.
   - Nơi client mở ra: `TimesheetScreen.tsx:157-160` mở `periods.current`, và server tính nó bằng `currentPayPeriod`
     (`api.ts:103-111`).
4. **AC-01** trên đồng hồ thật, trong cửa sổ. Một step reporter ghi mọi bước khẳng định kèm dòng spec của nó. Spec của 255ba17 chạy
   cùng thời điểm.
5. **Kiểm tra bắt buộc** tại 3670a6c: typecheck, lint, `npm test`, TOÀN BỘ e2e trên cả hai project (bật dò deprecation) và AC-13 một
   lần.
6. **Theo dõi lỗi.**
   - Tôi chạy lại hai spec lỗi trên 3670a6c và 255ba17, và đọc docs/05 dòng 26 về kích hoạt.
   - Lượt quét toàn bộ bộ test dưới đồng hồ giả lập chạy ở bảy thời điểm, cộng các lần tái hiện với một worker.
7. **Mục mang theo:** R-B7-1 đến R-B7-4, R1/R5/N5/N6/N7 của A7, R-10, R-11, R-13, R-14 và R-16 đến R-20 của B6.

**Đồng hồ giả lập và cách tôi đối chứng.** Một preload, `shiftclock.mjs`, được nạp qua `NODE_OPTIONS=--import`. Fixture khởi chạy CLI
và server đã build với `...process.env`, nên preload tới được Playwright runner, các worker của nó, CLI và server. Mỗi tiến trình đó
dời `Date` một độ lệch hằng số do wrapper tính một lần. Thời gian trôi vẫn là thật.

Trình duyệt không bị dời. `src/client` không bao giờ đọc đồng hồ trình duyệt: grep `Date.now`, `new Date(`, `Date()`, `.format()`,
`performance.now` và `setInterval` ra 0 dòng. Vì vậy trang chỉ hiện ngày của server. Không file source, test hay config nào đổi cho
cách này.

Các lần đối chứng tái hiện hành vi của đồng hồ thật ở cả hai phía của một giờ hạn:
- lúc 2026-10-27 13:00 PDT hai spec hạn chót đạt;
- lúc 18:00 PDT đúng ba test như trên đồng hồ thật hôm nay lỗi;
- toàn bộ bộ test lúc 13:00 cho 210 đạt, 0 lỗi, bằng số của REGATE7.

Server báo đúng `today_local` giả lập trong mọi lần chạy.

## Bảng bằng chứng

Mọi bằng chứng là text LF đã che trong `handoff/delivery/evidence/WP5-UX-AUDIT-AB8/` (mục lục `00-README.txt`).

| Lệnh | Kết quả / exit | Bằng chứng |
|---|---|---|
| digest ba dạng, đầu và cuối; HEAD; diff ngoài handoff 3670a6c..dc70ba6 | `58b0deee…1dffd`, 795 file mọi lần; HEAD = origin/main = dc70ba6; diff rỗng ngoài `handoff/`; bản export không đổi sau mọi lần chạy | `01-…`, `02-…`, `90-…` |
| `git diff --numstat 255ba17 3670a6c` ngoài `handoff/` | đúng 5 path test: `e2eSeedSelection.test.ts` 133/0, `displayedSeed.ts` 37/0, `fixtures.ts` 12/0, `isolation.spec.ts` 2/3, `shell.spec.ts` 2/3; 0 byte diff dưới `src/`, `docs/`, `scripts/`, file package hay config | `02-…`, `03-…` |
| `npm ci` + `npm run build`, cả hai bản export; so từng byte | exit 0 mỗi bản; `dist/` 230 file; danh sách sha256 từng file bằng nhau (cmp 0); `diff -r` exit 0 cho cả `dist/`, `dist/server` và `dist/client`; client `index-ZRY_mcb_.js` 483030 byte (sha256 `74d87ee4…`), CSS `index-B6Rp4E3V.css`; giống lại sau lần build lại | `04-…` |
| `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / exit 0 | `05-…` |
| `npm test` | exit 0; 83 file, 1827 test | `05-…` |
| test seed, chế độ verbose | 4/4 đạt | `05-…` |
| tự suy ra (`derive.ts.txt`) | 0 chỗ lệch giữa hàm kỳ lương của sản phẩm và phép tính của tôi trên 730 ngày. Kỳ hiển thị khác kỳ đang chạy đúng vào P-4..P (thứ Hai đến thứ Sáu). Cách chọn cũ rơi ra ngoài kỳ hiển thị vào P-3..P (4 ngày mỗi kỳ). Helper trùng quy tắc của tôi trên 730 ngày và không bao giờ ném lỗi với lịch đã seed (ít ngày làm thường đã qua nhất: 3, vào 2026-11-28) | `06-…` |
| đột biến trong bản nháp | M1 (cách chọn cũ qua helper) lỗi 2 trên 4, lần đầu vào 2026-09-15; M1b (`legacySeed` cũ) lỗi 3 trên 4; M2 ngày cũ nhất trước, M3 cho phép hôm nay, M4 im lặng thay vì ném lỗi, M5 bỏ qua loại ngày: đều bị bắt; **M6 bỏ qua phiên đã có: sống sót** (R-AB8-1) | `07-…` |
| AC-01: `isolation.spec.ts` + `shell.spec.ts`, cả hai project, 2026-10-13 19:12 PDT | exit 0, 13 đạt, 1 bỏ qua (test chỉ cho mobile, trên desktop); ngày seed 2026-10-09 trong kỳ hiển thị 09/28-10/11; 0 bước khẳng định lỗi | `08-…` |
| cùng các spec tại 255ba17, 19:13 PDT | exit 1, 6 lỗi tại `[data-day="2026-10-12"]`, vậy cách chọn cũ lỗi cả sau 17:00 | `09-…` |
| TOÀN BỘ e2e, cả hai project, 19:14-19:20 PDT | **exit 1: 207 đạt, 3 lỗi, 26 bỏ qua** (desktop 101/2/15, mobile 106/1/11). Lỗi: `automation.spec.ts:118` trên cả hai project, "the displayed period is not due yet"; `pdf-visual.spec.ts:187` (desktop), `finalized.revision` null tại `:117`. 0 dòng deprecation | `10-…` |
| hai spec hạn chót chạy lại tại 3670a6c và tại 255ba17 | 3 lỗi / 3 lỗi, y hệt: có từ trước, không do FIX9 | `11-…` |
| AC-13 `tests/integration/ac13-two-week.test.ts` một lần | exit 0, 1/1 | `05-…` |
| `npm audit --omit=dev` / `npm audit` | 0 lỗ hổng / 1 high (`source-map-js`, chỉ dev, GHSA-68fv-2mgg-jv7q): R1 không đổi | `05-…` |
| đối chứng giả lập (2026-10-27 13:00 và 18:00 PDT; toàn bộ bộ test lúc 13:00) | đạt / đúng 3 lỗi đó / 210 đạt, 0 lỗi | `12-…` |
| toàn bộ bộ test giả lập: 10-17 thứ Bảy, 10-26 thứ Hai (P-4), 11-02 thứ Hai (kỳ có đổi giờ DST) | mỗi lần 210 đạt, 0 lỗi | `13-…` |
| toàn bộ bộ test giả lập: 2026-11-28 thứ Bảy | 2 lỗi: `timesheet.spec.ts:403` trên cả hai project, "past free workdays in the displayed period: expected >= 1, received 0" (AB8-02) | `13-…`, `14-…` |
| toàn bộ bộ test giả lập: 2026-12-26 thứ Bảy | 1 lỗi: `admin.spec.ts:281` trên mobile, thiếu `[data-preview-can-commit="true"]`; trang báo "The change would alter days of a finalized timesheet: 2027-01-01" (AB8-03) | `13-…`, `14-…` |
| toàn bộ bộ test giả lập: 2027-01-11 thứ Hai | 2 lỗi: `admin.spec.ts:281` trên cả hai project, "Year of the dates" mong 2028, nhận 2027 (AB8-04) | `13-…`, `14-…` |
| tái hiện với một worker | shell + timesheet vào 11-28: `:403` lỗi trên 3670a6c và trên 255ba17, chạy riêng timesheet thì đạt; admin-status + admin vào 12-26: `:281` lỗi trên cả hai project, chạy riêng admin thì đạt | `14-…` |
| isolation và `shell.spec.ts:67` qua lần chạy thật, lần chạy đầy đủ thật và cả 7 lần chạy đầy đủ giả lập | mỗi lần 6/6 test isolation và 2/2 shell:67 đạt, 0 bước khẳng định isolation lỗi (hôm nay 10-13, 10-17, 10-26, 10-27, 11-02, 11-28, 12-26, 2027-01-11) | `08-…` |

## Sản phẩm không đổi (phạm vi 1)

Diff ngoài `handoff/` chỉ chạm `tests/`. Hai bản export build ra cùng một `dist/`, giống từng byte, hai lần. Vậy hành vi sản phẩm của
255ba17 chính là hành vi sản phẩm của 3670a6c. Cụ thể, những kết quả sau được giữ nguyên:
- kết quả vùng B của B7 (B6-01 đã đóng, bộ chuyển, vùng chạm, độ tương phản, quét token);
- kết quả vùng A của A7 (endpoint và body, A-01, AC-04, R-07, AC-16/AC-01, quyền riêng tư, PDF).

## Độ mạnh của test (phạm vi 2)

- `tests/e2e/fixtures.ts` +12/-0: một import `displayedPeriodSeedDay` và method mới `displayedSeedDay()`. Không dòng nào của helper có
  sẵn bị đổi.
- Mỗi spec bỏ cùng 3 dòng:
  - lời gọi `pastFreeWorkdays()` cũ;
  - điều kiện tiên quyết `expect(workDate, …).toBeDefined()`;
  - chốt chặn `undefined`. Trong `shell.spec.ts` chốt chặn đó là một `return`, là code chết sau một `expect` không mềm đã lỗi.

  Mỗi spec thêm một dòng chú thích và `const workDate = await ….displayedSeedDay();`. Điều kiện tiên quyết chuyển vào helper, nơi ném
  một lỗi có tên. Vậy `expect(` duy nhất mất đi (46→45 và 30→29) là điều kiện đó, nay được bảo đảm bằng lệnh ném lỗi.
- Mọi khẳng định isolation và shell không bị đụng. Các dòng thêm không chứa `skip`, `fixme` hay `only`. Cây `tests/` vẫn có 12 dòng
  skip và 0 only/fixme, như tại 255ba17.
- **Trường hợp biên:** `displayedPeriodSeedDay` ném "The displayed period (payroll X) has no past normal workday without a session on
  D; …". Cả hai nơi gọi đều await nó ngoài mọi try/catch (`isolation.spec.ts:53`, trước `try`; `shell.spec.ts:69`), nên test báo lỗi
  và không bao giờ bị bỏ qua. Unit test khẳng định thông báo này, và đột biến M4 (trả về im lặng) bị bắt.

## Quy tắc seed (phạm vi 3)

- **Quy tắc, suy ra từ `currentPayPeriod` (`periods.ts:149-164`):**
  - Trang mở ra kỳ có ngày trả lương sớm nhất vào hoặc sau ngày hôm nay của múi giờ báo cáo. Điều này chỉ phụ thuộc ngày; giờ hạn
    không có vai trò gì.
  - Với lịch đã seed (mốc 2026-10-02, chu kỳ 14, kỳ P-18..P-5, hạn P-3 17:00 America/Los_Angeles), kỳ đó khác kỳ chứa hôm nay vào
    P-4..P: thứ Hai đến thứ Sáu ngày trả lương, 5 ngày.
  - `pastFreeWorkdays()[0]` cũ nằm ngoài trang vào P-3..P (4 ngày; vào P-4 kỳ mới chưa có ngày nào đã qua). Trong chu kỳ này đó là
    2026-10-13 đến 10-16, vào bất kỳ giờ nào. Câu "trước 17:00" của B7 chưa chính xác: spec của 255ba17 vẫn lỗi lúc 19:13 PDT.
- **Test tất định** `tests/domain/e2eSeedSelection.test.ts`:
  - Nó bước 56 ngày từ 2026-09-14 (bốn kỳ trọn) lúc 00:30, 16:59, 17:00 và 23:59 giờ Los Angeles.
  - Phạm vi này gồm các thứ Ba hạn chót và các ngày trả lương.
  - Nó kiểm cửa sổ 20 ngày bằng hàm của sản phẩm, và kiểm rằng ngày seed luôn nằm trong kỳ hiển thị và trước hôm nay. Nó cũng kiểm
    phép đối chứng âm 16 ngày và các trường hợp ngày lễ và không có ngày làm.
  - Nó báo lỗi khi đưa lại cách chọn cũ (M1, M1b).
- **Một helper, không lệch nhau:** spec tới `displayedPeriodSeedDay` qua `SeedClient.displayedSeedDay()`, vốn import nó từ
  `tests/e2e/displayedSeed.ts`. Đó là module mà unit test import. Kỳ mà fixture đọc là `current.payroll_date` của
  `/api/periods/current`, trường mà client mở trước, do cùng `currentPayPeriod` tính.
  - Một bản sao có từ trước của cùng bộ lọc vẫn còn trong `displayedPeriodFreeWorkdays()` (`fixtures.ts:419-427`), được các spec
    khác dùng. FIX9 buộc chỉ được thêm, nên đây là tùy chọn (R-AB8-2).

## Bằng chứng AC-01 (phạm vi 4)

Lần chạy nằm **trong cửa sổ** trên đồng hồ thật: 2026-10-13 19:12 PDT (hôm nay 2026-10-13, kỳ hiển thị 09/28-10/11 với ngày trả lương
10/16, kỳ đang chạy 10/12-10/25), sau giờ hạn. Cả hai project: 13 đạt, 1 bỏ qua, exit 0. Với mỗi project, step report cho thấy các
dòng khẳng định sau đã được chạy tới và đạt:
- **nhân viên thứ hai** (`:93`): `:101`, `:105-108` (hàng hiện ra, không Complete, không dấu complete, không ghi chú);
- **đổi hash**: `:113` ×4, `:114` ×4, `:116`;
- **đổi id**: `:79`, `:89`, `:90` (GET/PUT/DELETE 404) và `:121`, `:123`, `:124`;
- route admin 403: `:127-131`;
- dữ liệu nhân viên 1 còn nguyên: `:136-138`;
- **màn hình admin** (`:144`): `:153-161`, `:168-169`, `:179` ×5, `:79`/`:89`/`:90`, `:185-188` và `:191-192`.

Thêm `:198` (`:202-209`) và `shell.spec.ts:67` (seed 2026-10-09).

Hôm nay không chạy được ngoài cửa sổ trên đồng hồ thật. Các lần chạy đầy đủ giả lập vào 10-17, 10-26, 11-02, 11-28, 12-26 và
2027-01-11 đều đạt cả 6 test isolation và cả hai lần `shell.spec.ts:67`.

## Lỗi

| ID | Mức | File / hàm | Tái hiện | Kỳ vọng / thực tế | Quy tắc / AC | Sửa có phạm vi |
|---|---|---|---|---|---|---|
| WP5-UX-AB8-01 | Thấp (chỉ test, có trước FIX9; chặn vì toàn bộ e2e bắt buộc lỗi) | `tests/e2e/automation.spec.ts:149-151` (test `:118`) đòi `periods.current.due_at_utc > Date.now() + 120 s`. `tests/e2e/pdf-visual.spec.ts:219-221` (test `:187`) ghi mốc kích hoạt lúc `Date.now() + 60 s` và chạy job lúc `current.due_at_utc + 5 phút` | Đồng hồ thật, 2026-10-13 19:14 PDT, sau hạn 17:00 của kỳ hiển thị: toàn bộ e2e có 3 lỗi (`10-…`). Chạy lại tại 3670a6c và tại 255ba17: đúng 3 lỗi đó (`11-…`). Giả lập 2026-10-27: lúc 13:00 đạt, lúc 18:00 đúng 3 lỗi đó (`12-…`) | Kỳ vọng: bộ test bắt buộc đạt vào bất kỳ ngày nào. Thực tế: từ khoảng 16:58 mỗi thứ Ba hạn chót (P-3) đến hết ngày trả lương P, khoảng 3 ngày 7 giờ trong mỗi 14 ngày, automation dừng ở điều kiện tiên quyết. pdf-visual không có bản sửa tự động, vì docs/05 dòng 26 đúng khi chỉ cho một kỳ đủ điều kiện nếu hạn của nó vào hoặc sau mốc kích hoạt | AGENTS.md quy tắc 5; docs/06 dòng 30 (đồng hồ tất định, "giả lập hạn chót thay vì chờ nhiều ngày"); toàn bộ e2e bắt buộc của audit này | Chạy kịch bản hạn chót trên một kỳ mà hạn còn ở phía trước: khi hạn của `current` nằm trong biên hoặc đã qua, dùng `in_progress` hoặc kỳ kế tiếp từ `/api/periods`, seed nó và khẳng định trên nó. Hoặc dùng đồng hồ tiêm được chỉ cho test. Giữ mọi khẳng định. Chứng minh tại P-3 13:00, P-3 18:00, P và P+1 (ví dụ bằng wrapper đồng hồ giả lập của audit này) |
| WP5-UX-AB8-02 | Thấp (chỉ test, có trước FIX9; chặn vào các ngày đó) | `tests/e2e/shell.spec.ts:67-70` và `tests/e2e/timesheet.spec.ts:189-201` seed ngày cho nhân viên dùng chung trong worker (một ngày trọn; một ngày trọn cộng một ngày có giờ nghỉ chưa xác nhận) và không bao giờ xóa. Sau đó `timesheet.spec.ts:403-408` cần thêm một ngày trống của kỳ hiển thị | Giả lập 2026-11-28 10:00 PST, toàn bộ bộ test: `timesheet.spec.ts:403` lỗi trên cả hai project với "expected >= 1, received 0". Một worker, shell + timesheet: lỗi trên 3670a6c và trên 255ba17; chạy riêng timesheet thì đạt (`13-…`, `14-…`) | Kỳ vọng: bộ test đạt vào bất kỳ ngày nào. Thực tế: vào 2026-11-28 đến 11-30, kỳ hiển thị 11/23-12/06 chỉ có 3 ngày làm thường đã qua (các ngày lễ tổng hợp 11-26 và 11-27), còn các spec của worker dùng 4 | AGENTS.md quy tắc 5; docs/06 dòng 30 | Trả lại mọi ngày đã seed (`clearSessions` trong `finally`) ở `shell.spec.ts:67` và `timesheet.spec.ts:189`, hoặc seed trên tài khoản riêng của từng test (`newPerson`). Rồi kiểm nhu cầu của mỗi worker so với quỹ nhỏ nhất (3) |
| WP5-UX-AB8-03 | Thấp (chỉ test; chặn vào các ngày đó) | `tests/e2e/admin.spec.ts:281` (CSV ngày lễ) nhập `${year}-01-01` có hiệu lực từ `periods.current.period_start` trên lịch dùng chung của worker | Giả lập 2026-12-26, toàn bộ bộ test: `:281` lỗi trên mobile tại `:338`, và trang báo "The change would alter days of a finalized timesheet: 2027-01-01". `admin-status.spec.ts` đã chốt một timesheet của kỳ đó trên cùng server. Một worker, admin-status + admin: cả hai project lỗi; chạy riêng admin thì đạt (`13-…`, `14-…`) | Kỳ vọng: bộ test đạt vào bất kỳ ngày nào. Thực tế: khi kỳ hiển thị vắt qua năm mới (2026-12-26 đến 12-31: kỳ 12/21-01/03), việc nhập chạm vào một ngày đã chốt, và sản phẩm từ chối là đúng | AGENTS.md quy tắc 5; docs/06 dòng 30 | Dùng ngày nhập nằm ngoài kỳ hiển thị, hoặc một lịch mà không test nào khác chốt (`seedSecondCalendar`). Giữ các khẳng định về hash cũ và không-thay-đổi |
| WP5-UX-AB8-04 | Thấp (chỉ test; lỗi lần đầu vào 2027-01-01) | `tests/e2e/admin.spec.ts:290` lùi về "năm nay + 1" khi không có cảnh báo năm sau. `defaultImportYear` của client (`src/client/components/adminModel.ts:93-95`) lùi về năm nay. Server chỉ cảnh báo từ 1 tháng 10 (`calendars.ts`, E-12) | Giả lập 2027-01-11, toàn bộ bộ test: `:281` lỗi trên cả hai project tại `:304`, "Year of the dates" mong 2028, nhận 2027 (`13-…`) | Kỳ vọng: test theo mặc định đã giao; docs/04 không định năm mặc định. Thực tế: lỗi mỗi ngày từ 1 tháng 1 đến 30 tháng 9, bắt đầu từ 2027-01-01 | AGENTS.md quy tắc 5; docs/06 dòng 30 | Tính năm mong đợi theo quy tắc của client (năm của cảnh báo, nếu không thì năm nay) hoặc import `defaultImportYear`. Giữ mọi khẳng định. Đặt mặc định là năm sau sẽ là thay đổi sản phẩm, cần chủ dự án quyết |

## Rủi ro và cải thiện tùy chọn (không phải lỗi)

- **R-AB8-1:** unit test seed không bao giờ đặt một phiên vào một ngày, nên helper bỏ qua phiên đã có (đột biến M6) vẫn đạt. Khi đó
  e2e sẽ lỗi ồn ào vì phiên chồng nhau, không im lặng. Sửa tùy chọn: thêm một trường hợp mà ngày làm đã qua gần nhất đã có phiên.
- **R-AB8-2:** `displayedPeriodFreeWorkdays()` (`fixtures.ts:419-427`, có từ trước, 12 file spec dùng) giữ bản sao riêng của bộ lọc
  trong helper. Sửa tùy chọn: cho nó gọi `freeWorkdaysOfDisplayedPeriod`.
- **R-AB8-3:** một lần chạy vắt qua nửa đêm địa phương đọc "hôm nay" ở hai thời điểm khác nhau: khi seed, rồi khi mở trang. Đây là rủi
  ro chập chờn, chưa quan sát thấy.
- **R-AB8-4:** lượt quét phủ 7 thời điểm của lịch đã seed. Các năm khác, ngoại lệ ngày trả lương và bộ ngày lễ khác chưa được chạy.
- **Mang theo, không đổi và không chặn:**
  - R-B7-1 đến R-B7-4. Sản phẩm giống từng byte và `sharing.spec.ts` không đổi, nên R-B7-2 vẫn đứng.
  - R1 của A7 (`npm audit --omit=dev` 0; một high chỉ trong dev), R5, N5, N6 và N7.
  - R-10, R-11, R-13, R-14 và R-16 đến R-20 của B6.

  Chúng vẫn là backlog cho vòng sửa pilot.

## Gate chưa chạy hoặc bị chặn, và lý do

- Không có gate chưa chạy. Toàn bộ e2e đã chạy trên cả hai project và chỉ lỗi do AB8-01, mà tôi đã tái hiện trên cả hai snapshot và
  lần ra nguyên nhân.
- AC-01 đã chạy trong cửa sổ trên đồng hồ thật. Ngoài cửa sổ, nó chỉ chạy dưới đồng hồ giả lập, vì không thể đổi ngày thật.
- AB8-02 đến AB8-04 được tái hiện dưới đồng hồ giả lập, mà các lần đối chứng đã kiểm chứng. Chúng chưa được tái hiện trên đồng hồ
  thật.

## Xử lý các phát hiện trước

- **WP5-UX-B7-01 = WP5-UX-A7-01: đã đóng.**
- WP5-UX-B6-01 vẫn đóng (B7), được giữ nhờ sản phẩm giống từng byte.
- WP5-UX-AB8-01 đến AB8-04 là mới và đang mở.
- Audit này không đạt, nên không thay thế WP5-UX-AUDIT-A6 hay audit cũ nào.

## Sẵn sàng phần mềm, phép của chủ dự án và kết quả pilot

- **Sẵn sàng phần mềm:** chưa. Lý do duy nhất là WP5-UX-AB8-01 đến AB8-04, đều là lỗi Thấp chỉ ở test, do bộ e2e phụ thuộc vào lịch.
  Hành vi sản phẩm của cả hai vùng đạt, không đổi kể từ 255ba17.
- **Phép của chủ dự án:** không xin và không được cấp. Không triển khai, không gửi mail thật, chỉ dữ liệu tổng hợp.
- **Kết quả pilot:** không có; chưa chạy pilot.

## Một bước tiếp theo

Coordinator: mở một task sửa chỉ ở test cho WP5-UX-AB8-01 đến AB8-04:
- chọn kỳ cho kịch bản hạn chót;
- trả lại các ngày đã seed hoặc dùng tài khoản riêng cho từng test;
- dùng ngày nhập ngày lễ ngoài kỳ hiển thị;
- dùng quy tắc năm mặc định của client.

Rồi chạy một freeze và một gate có toàn bộ e2e trên đồng hồ thật, cộng một lượt quét đồng hồ giả lập tại P-4, P-3 13:00, P-3 18:00, P,
P+1, 2026-11-28, 2026-12-26 và 2027-01-11. Sau đó chạy một lần kiểm lại gộp A+B cho phần thay đổi đó.

Không lỗi bịa hoặc đạt chưa quan sát. Review một phần không là nghiệm thu toàn bộ.

## Nguồn gốc subagent độc lập

- **Task/attempt review, reviewer ID và author ID đang kiểm:** WP5-UX-AUDIT-AB8, attempt 1.
  - Reviewer: tự báo `claude-opus-5-5`; một subagent mới, không thấy được agent ID từ bên trong.
  - Tác giả được kiểm: WP5-UX-FIX9 (`claude-sonnet-5-5`); bản freeze của FIX9 (committer) và WP5-UX-REGATE7 (verifier,
    `claude-sonnet-5-5`); các tác giả trước của vòng, mạnh nhất là `claude-opus-5-5`. Model của tôi không yếu hơn tác giả mạnh nhất.
- **Context mới; xác nhận reviewer không viết thay đổi:** đã xác nhận. Tôi không viết thay đổi nào được kiểm, và không chạy gate, bản
  sửa hay audit trước nào của vòng này. Tôi không sửa file source, test, doc, board hay STATE nào.
  - Bản export, bản build, đột biến nháp và mọi lần chạy đều nằm trong thư mục task.
  - Ghi chú quy trình ở `00-README.txt`: một file liệt kê lạc được ghi cạnh thư mục task và xóa ngay; một log được đọc bằng `tail`
    trên file (không pipe); một lượt che dữ liệu được làm lại.
- **Digest trước/sau; bằng chứng gate của snapshot đó:** `58b0deee…1dffd` trước và sau, ba dạng (`01-…`, `90-…`). Nó bằng digest
  ghi nhận của WP5-UX-REGATE7 (REGATE7 PASS, attempt 3).
- **Path report mới giữ lịch sử review trước:** `handoff/delivery/WP5_UX_REVIEW_AB8.md` và `.vi.md`, cả hai là file mới; mọi review
  trước không bị đụng.
- **Xử lý phát hiện và task sửa/kiểm lại tiếp của coordinator:** B7-01 = A7-01 đã đóng, và AB8-01 đến AB8-04 đang mở. Tiếp theo: bản
  sửa chỉ ở test nêu trên, rồi một freeze, một gate có lượt quét đồng hồ giả lập, và một lần kiểm lại gộp A+B.
