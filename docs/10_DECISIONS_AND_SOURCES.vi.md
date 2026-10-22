# Quyết định và nguồn

Yêu cầu rõ mới nhất của người dùng ưu tiên hơn đề xuất đã trích và công thức workbook. Tiếng Anh là nguồn chuẩn. Tài liệu 02 phụ trách phép tính, 03 bất biến dữ liệu, 05 nộp, 09 thứ tự. Sửa mâu thuẫn thật rõ ràng ở cả hai ngôn ngữ.

## Yêu cầu đã chốt

Tám giờ/ngày; chỉnh giờ vào/ra và N/M; vào linh hoạt; ví dụ đúng giữa xuống 75→60 và 76→90; tính ngày không bù tuần/kỳ; mọi giờ ngoài lịch đủ điều kiện OT; nghỉ không làm không trừ. Thiếu giờ tùy chọn, manager cho dùng OT đổi nghỉ, UTC/hiển thị múi giờ hiện tại, qua đêm, lý do sửa cũ và audit tự động. Sign-off cùng tự nộp chưa ký cấu hình được, setting email/template/thông báo/ảnh, dữ liệu riêng và manager tương lai. Docker Synology; PDF Excel quen thuộc. Docs song ngữ, prompt theo giai đoạn, ưu tiên subscription. Chia sẻ timesheet của chính mình theo từng mục do chủ cấp.

## Mặc định thiết kế

Đóng khoảng trống để không phải hỏi thêm; đây không phải xác nhận do người dùng nói mà bị bịa thêm.

| ID | Mặc định |
|---|---|
| D-01 | Hono/TypeScript + React/Vite + SQLite + pdf-lib; một container. C# và Next.js vẫn là phương án khả thi. |
| D-02 | Loại cả ba nghỉ trong ví dụ, dịch gợi ý theo giờ vào, xác nhận nghỉ thật/không nghỉ; chưa biết để chờ. |
| D-03 | N kích hoạt nghiêm ngặt, không là khoản trừ; M gần nhất, đúng nửa xuống. |
| D-04 | Mọi phút ngoài lịch bỏ B/N nhưng giữ M; hiện phút đủ điều kiện gốc dù làm tròn còn không. |
| D-05 | Qua đêm ở nhóm ngày bắt đầu; chia điều kiện tại ranh giới địa phương. Múi giờ báo cáo đã lưu phụ trách ghi sổ. |
| D-06 | Mặc định bỏ thiếu; trừ phút chính xác, không âm thầm quá số dư. Giờ qua đêm đáp ứng công; thiếu bản ghi/nghỉ cả ngày không làm không bị trừ. |
| D-07 | Ghi OT lúc chốt bất biến; tách tạm tính. Giữ phép đã duyệt, tiêu ngày nghỉ, tỷ lệ phút 1:1. |
| D-08 | Thứ Hai–Sáu, America/Los_Angeles, thứ Ba trước payroll 17:00; giờ/múi giờ là đề xuất, không do workbook xác lập. |
| D-09 | Bật tùy chọn tự nộp sau setup; dry-run tới kích hoạt; ảnh tự động chỉ khi user cho phép rõ, có audit (được hỏi, chọn sẵn, lúc tải ảnh chữ ký); bản ghi không bao giờ chứa sign-off giả (nguồn tự động, chờ xác nhận, signed_at trống); PDF/email tự nộp gửi đi theo quyết định của chủ ngày 2026-10-04. |
| D-10 | Email trước, ntfy tùy chọn, hoãn SMS; link review có login đủ ban đầu. |
| D-11 | Phiên bản lễ công ty hằng năm rõ; nghỉ cá nhân tách phân loại lịch. |
| D-12 | Hiện tại = payroll sớm nhất bằng/sau hôm nay theo múi giờ báo cáo; ưu tiên kỳ cũ chưa xử lý không làm nó thành hiện tại. |
| D-13 | UI đầu tiếng Anh được; docs song ngữ bắt buộc; portal manager sau. |
| D-14 | Đã xác nhận Max 20x; giữ kế hoạch công việc có phạm vi, dự kiến không dùng reserve/API phí. Khối lượng không là lời hứa quota. |

## Cập nhật bằng chứng tài khoản

Ngày 30/09/2026, người dùng cung cấp ảnh gói Max ghi usage gấp 20 lần Pro. Ảnh xác lập cấp gói Claude, không xác lập allowance còn lại hay settings usage trả thêm. Không sao chép thông tin thanh toán.

## Bằng chứng workbook

[Mẫu đã làm sạch](../reference/inputs/Timesheet_Rev8_2026.xlsx) hỗ trợ mẫu 14 ngày, payroll thứ Sáu/hạn thứ Ba. Không xác lập quy tắc lương pháp lý, ngày ký cũ thật, email đã gửi hoặc số dư OT đầu. [Ghi chú nguồn](../reference/inputs/README.vi.md) ghi những gì đã xóa, hash và lỗi công thức. Ngày 2026-09-30 chủ dự án xóa toàn bộ dữ liệu cá nhân (các sheet chấm công theo ngày, tên, chữ ký và metadata) và công khai mẫu này; không giữ bản gốc cá nhân.

Thay công thức/khoản trừ 8,5 giờ, cách nói tự ký, giả định scheduler chỉ trong RAM và shortcut backup chỉ file đang chạy của đề xuất trước. Không giả định SMTP thường gửi đúng một lần. Quyết định của chủ ngày 2026-10-04 quy định hình thức bản tự nộp gửi đi; nó không đưa lại sign-off tự động trong bản ghi.

## Nguồn chính thức

Đã xem khi chuẩn bị ngày **29/09/2026**; kiểm lại Claude Desktop/model/Max và điều khiển model ChatGPT ngày **30/09/2026**. Lựa chọn/mặc định/ước lượng là nhận định dự án; nguồn mô tả khả năng/giới hạn. Ghim dependency còn hỗ trợ lúc triển khai, không theo giả định thiếu ngày.

| Nguồn | Dùng cho |
|---|---|
| [Hono on Node](https://hono.dev/docs/getting-started/nodejs) | Nền tảng app Node |
| [SQLite WAL](https://www.sqlite.org/wal.html) | Giới hạn cục bộ host/WAL |
| [SQLite backup](https://www.sqlite.org/backup.html) | Backup nhất quán |
| [pdf-lib](https://pdf-lib.js.org/) | Tạo/nhúng PDF |
| [ntfy configuration](https://docs.ntfy.sh/config/) | Adapter thông báo tùy chọn |
| [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Phương án thay thế được xem xét |
| [ChatGPT models](https://learn.chatgpt.com/docs/models) | Model và điều khiển Work/Codex |
| [ChatGPT pricing/usage](https://learn.chatgpt.com/docs/pricing) | Usage trong gói và phân biệt credits/tốc độ |
| [Workspace usage limits](https://learn.chatgpt.com/docs/enterprise/usage-limits) | Điều khiển workspace; kiểm UI Business thật |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop) | Chọn dự án cục bộ, menu model/effort và chế độ quyền |
| [Claude model configuration](https://code.claude.com/docs/en/model-config) | Tên model, bộ chọn và effort |
| [Claude Max](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) | Các mức Max |
| [Claude usage practices](https://support.claude.com/en/articles/9797557-usage-limit-best-practices) | Dashboard usage và dự trù allowance |

Kiểm nguồn công khai không xem quota, điều khiển phí thật, kiến trúc NAS, credential hay người nhận. Kiểm trong client/setup thật. Khả dụng có thể đổi; danh sách model có ngày không là quyền truy cập vĩnh viễn.

Bản dịch của [10_DECISIONS_AND_SOURCES.md](10_DECISIONS_AND_SOURCES.md); tiếng Anh là nguồn chuẩn.

## Thay đổi điều phối đã chốt — 2026-10-02
Chủ yêu cầu một prompt Claude, vai trò không gắn nhà cung cấp, main chỉ coordinator,
chọn subagent theo độ khó để plan/chẩn đoán/implement/sửa/kiểm chứng/audit độc lập,
và recovery bền vững sau reset usage.
Tài liệu 08 và ORCHESTRATE thay phân chia nhà cung cấp, chính sách cấm subagent/đổi model
trước đây. Không đổi nghiệp vụ, gate WP1–WP5, billing subscription hoặc quyền kích hoạt
thật của chủ. Độc lập nghĩa context tác giả/reviewer riêng và bằng chứng chạy trên source
hiện tại, không nhất thiết khác nhà cung cấp.
Khả năng subagent/model/resume/checkpoint chính thức kiểm ngày 2026-10-02; sửa docs này
chưa thử client/account Claude thật tại máy. Không cấu hình scheduler reset tự động.

## Quyết định của chủ — 2026-10-02 (commit và routing)

- Quyền commit/push (quyết định thường trực của chủ, xác nhận trực tiếp trong phiên chính): chỉ `timesheet-committer` commit và push; thẳng `main` và push sau mỗi commit đến bản release đầu tiên, sau đó nhánh phụ và PR; không amend, force-push, viết lại lịch sử hay tag; không secret, chữ ký, dữ liệu cá nhân. Quy tắc ở tài liệu 08, mục "Commit và push".
- Routing thích ứng: chủ ủy quyền coordinator chọn model cho từng lần giao việc theo thang ở tài liệu 08 (size, rủi ro, novelty). Profile cố định vai trò và effort. Fable/best/opusplan, effort max và đổi tốc độ vẫn cần quyết định của chủ.
- Quyết định của coordinator (đảo ngược được): brief/kết quả task trong `handoff/delivery/tasks/` chỉ bằng tiếng Anh; tiếng Việt dành cho tài liệu cho người đọc, prompt, template, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW và chat.

## Quyết định của coordinator — sửa lỗi workflow sau audit (2026-10-02 America/Los_Angeles, finding WF-A-01..WF-A-10 của WF-AUDIT)

Quyết định đảo ngược được của coordinator cho task WF-FIX1; không quyết định nào đổi quy tắc nghiệp vụ.

- Phạm vi quản trị (WF-A-02): task quy trình dùng giai đoạn `GOV`, ngoài `authorized_scope` (WP1–WP5). Task GOV được miễn kiểm tra đang chạy theo giai đoạn hoạt động, và audit GOV đã xong cần `reviewed_commit`. PASS của GOV được định danh bằng reviewed commit và chỉ bị thay thế khi một path quản trị (liệt kê ở tài liệu 08) đổi. State và hồ sơ (NEXT_ACTION, STATE, bảng, checkpoint, tài liệu này) không phải path quản trị.
- Cổng riêng tư (WF-A-03, WF-A-09): `scripts/precommit-check.mjs` nay chặn secret YAML/INI không có nháy, file PDF/ảnh/chữ ký mà tên file không chứa `synthetic` (`reference/fixtures/` và `reference/examples/` vẫn được phép) và path hồ sơ người dùng cụ thể. Hoãn: evidence đã commit (một số log chứa tên tài khoản Windows) không bị viết lại; không viết lại lịch sử và không có commit che hồi tố. Evidence mới được che bằng `<user>`; committer được che log evidence đã stage theo quy tắc ở tài liệu 08.
- Effort `max` (WF-A-04): đã bỏ khỏi các effort validator cho phép. Thêm lại cần quyết định của chủ, khớp tài liệu 08.
- Snapshot cuối giai đoạn (WF-A-10): tài liệu 08 định nghĩa là snapshot mà audit PASS sẽ nghiệm thu giai đoạn, gồm cả recheck FIX REQUIRED mở khóa giai đoạn kế. Nó giữ gate verifier riêng; `gate_included` chỉ cho sửa S-size trung gian. Coordinator lập lại kế hoạch chuỗi F-01 trên bảng theo đó.

## Quyết định của chủ — 2026-10-03 (WP2, trả lời "dùng đề xuất")

Chủ chấp nhận các đề xuất ở mục E của WP2-PLAN.

- E-2: nghỉ-bằng-OT không phải loại ngày. Ngày mang số phút nghỉ kèm `leave_kind` vacation | sick | ot. L cho thiếu giờ (R-05) là số phút nghỉ do nhân viên nhập. UI cảnh báo khi số phút nghỉ loại ot của ngày khác số phút đã tiêu của yêu cầu nghỉ. OT không bao giờ tự tiêu.
- E-3: OT nghỉ chỉ được tiêu bằng thao tác "record use" rõ ràng, idempotent của nhân viên vào hoặc sau ngày nghỉ; cho phép dùng một phần. Giữ chỗ chưa tiêu vẫn bị giữ đến khi dùng hoặc hủy, và review WP3 đánh dấu. WP2 không cần job runner.
- E-8: giữ CSS thuần; chuẩn hình ảnh là CSS custom properties, bo góc 4px và transition 300 ms ease-out cho trạng thái tương tác (tài liệu 04). Mục UI của AGENTS.md được sửa bởi task quản trị riêng.

## Quyết định của coordinator — mặc định thường lệ WP2 (2026-10-03, đảo ngược được; chủ có thể phủ quyết)

Cơ sở: mục E của WP2-PLAN; không quyết định nào đổi yêu cầu đã xác nhận.

- E-1: tại Check out, danh sách nghỉ hiện có là tập đầy đủ và thay các dòng đã lưu; bỏ trống thì giữ dòng đã lưu (chỉ ngày chưa xác nhận). Hộp thoại Check out chỉ bỏ qua danh sách khi nó mở ra mà không có dòng đã lưu; khi người dùng đã xóa hết các dòng đã lưu, nó gửi danh sách rỗng chưa xác nhận (`breaks: []`, chưa xác nhận), danh sách này thay các dòng đó, và hộp thoại nói rõ điều này (WP5-UX3-FIX3, quyết định của coordinator về F-UX3B-1).
- E-4: nhập ngày lễ giữ nhãn rõ và ngày lịch nhập tay.
- E-5: số dư khả dụng không đủ lúc giữ chỗ trả 409 và không tạo gì.
- E-6: số dư tạm = phút được ghi của ngày đầy đủ trong kỳ chưa chốt.
- E-7: bằng chứng cho phép là tham chiếu văn bản cho đến khi có kho file WP3.
- E-9: thêm `@playwright/test` với script `test:e2e` riêng.
- E-10: làm mới dòng payroll của kỳ chưa chốt; từ chối kỳ đã chốt.
- E-11: admin đặt mật khẩu tạm ngoài hệ thống.
- E-12: cảnh báo từ 1 tháng 10 khi thiếu ngày lịch năm tới.
- E-13: lịch sử WP2 là audit trail cùng phiên bản quy tắc/lịch.

## Quyết định của coordinator — phát hiện ADV-A-02 của WP2-ADV-REVIEW (2026-10-03, đảo ngược được; chủ có thể phủ quyết)

- Áp dụng R-05 cho khoản sửa: sửa làm tăng một khoản trừ thiếu giờ là một khoản trừ mới bằng phần tăng. Phần tăng được kiểm với số dư khả dụng (`canDebit`); nếu số dư không đủ thì phần tăng ở trạng thái chờ, không ghi dòng sổ nào (không âm thầm âm). Sửa giảm một khoản cộng đã bị tiêu vẫn được giữ và đánh dấu đối chiếu (R-06, LG-08) vì nó nêu một sự thật lịch sử. Đây là áp dụng R-05 và R-06 hiện có, không đổi yêu cầu đã xác nhận. Nguồn: WP2-ADV-REVIEW (ADV-A-02), task WP2-ADVFIX.

## Quyết định của chủ — 2026-10-15 (vòng chỉnh UI thứ 3, phong cách)

- U-01 và G-1 (b): phong cách doanh nghiệp hiện đại, thân thiện thay cho hướng công nghiệp, và bảng tuần có góc vuông. Hệ token vòng 3 trong tài liệu 04 ("Chuẩn hình ảnh") thay các giá trị bo góc và chuyển động của E-8: bo góc 4px thành thang bo góc (6px, 8px, 12px, nhãn tròn; bảng tuần và chân bảng 0; cột được nâng 4px) và transition 300 ms ease-out cho mọi thuộc tính thành một token transition với 180 ms, easing chuẩn, chỉ trên các thuộc tính được liệt kê (không bao giờ `all`). E-8 giữ lại làm lịch sử, và nửa còn lại của nó vẫn hiệu lực: CSS thuần và custom property, không framework. Mục "Frontend and UI/UX standards" của AGENTS.md (task WP5-UX3-GOV) mang quy tắc cho các agent. Nguồn: WP5-UX3-PLAN, task WP5-UX3-T01. Bản ghi đầy đủ của vòng 3 nằm ở cuối tài liệu này.

## Quyết định của coordinator — phát hiện đổi lịch của WP2-T08 (2026-10-03, đảo ngược được; chủ có thể phủ quyết)

- Đổi lịch qua `PATCH /api/admin/users/:id` bị từ chối bằng 409 `calendar_in_use` khi user có bất kỳ timesheet, ngày, phiên làm việc, dòng sổ cái hay yêu cầu nghỉ nào. Lần sửa bị từ chối không ghi gì (PATCH gộp không áp dụng trường nào) và không tạo audit event. Chỉ đổi lịch được cho tài khoản chưa có dữ liệu đó. Sửa tên hiển thị và vai trò không bị ảnh hưởng.
- Lý do: probe WP2-T08 cho thấy gán lại lịch cho user đã có dữ liệu làm kỳ nháp bị nhóm lại, nhãn mặc định đổi và tính lại, timesheet đã lưu bị mồ côi, timesheet đã chốt bị che và cho phép tạo timesheet chồng kỳ, trong khi ngày của phiên đã lưu không đổi (AGENTS quy tắc 7, R-07). Không văn bản chuẩn nào yêu cầu đổi lịch của user đã có dữ liệu hay áp dụng đổi lịch cho kỳ đã có.
- Lựa chọn cho chủ (ngoài WP2): gán lại lịch có hiệu lực từ ngày trong tương lai cần schema và thiết kế tra cứu kỳ riêng.
- Nguồn: phát hiện chỉ-báo-cáo của WP2-T08, task WP2-CALFIX.

## Quyết định của chủ — 2026-10-04 (WP3-PLAN F-1..F-5, WP3-REQ F-Q1..F-Q6 và WP3-REQ2 G-Q1..G-Q2)

Nguồn: các câu trả lời trực tiếp của chủ ghi trong bảng task, 2026-10-04.

- F-1: đến hạn, kỳ chưa lưu dữ liệu nào vẫn được tự nộp theo nhãn mặc định. Ngày không có bản ghi không được tính OT (nhân viên có thể bổ sung bản ghi và sửa sau) và không tính thiếu giờ.
- F-Q1, F-Q2: bản tự nộp gửi đi không có dấu hiệu tự động, theo quyết định rõ ràng của chủ; cách nói của D-09 và R-07 được đổi tương ứng. Khối chữ ký trên PDF in tên nhân viên và ngày tự nộp theo múi giờ báo cáo đã lưu; ảnh chữ ký chỉ xuất hiện khi user cho phép dùng ảnh rõ ràng; dòng ghi chú tùy chọn (user sửa được, mặc định "Automatic submission", mặc định tắt) áp dụng cho mọi lần tự nộp khi bật. Chỉ hệ thống theo dõi nguồn tự động: revision giữ nguồn tự động, chờ xác nhận, signed_at trống và không sign-off, và màn hình cùng thông báo kết quả của chính nhân viên hiện là chờ xác nhận. Điều này thay quy tắc cũ "vẫn hiện chờ xác nhận" cho bản gửi đi.
- G-Q1, G-Q2: khi user tải ảnh chữ ký lên, app hỏi phép dùng ảnh tự động với tùy chọn chọn sẵn; xác nhận vẫn là một thao tác cho phép rõ ràng, có audit, và user bỏ chọn thì tự nộp không có ảnh cho tới khi user cho phép sau trong Settings. {SignOffStatus} hiển thị "Submitted" cho cả bản nộp tay và tự nộp, hoặc nội dung ghi chú của user cho bản tự nộp bật dòng ghi chú.
- F-2: khoản trừ thiếu giờ đang chờ là một dòng chờ được ghi của revision đó, hiện trên màn review và OT, chỉ được đánh giá lại bởi một revision chốt sau; không ghi nền.
- F-3, F-Q3: admin thấy mọi thứ trừ chi tiết timesheet của từng người (tài liệu 03), gồm địa chỉ người nhận nhưng không gồm template hay nội dung thư.
- F-3, F-Q4, F-Q5: cá nhân có thể chia sẻ timesheet của mình cho một tài khoản khác theo từng mục (xem, sửa, xem sổ và tổng OT chỉ đọc, tải PDF đã chốt). Quyền sửa gồm sửa tay ngày, phiên, nghỉ và sửa hàng loạt (kỳ cũ cần lý do), không bao giờ Check in/out thay chủ, sign-off hay gửi. Quyền chia sẻ thu hồi được, có audit, không chia sẻ tiếp; admin xem danh sách và thu hồi được nhưng không tạo được.
- F-4: một thời điểm kích hoạt toàn hệ thống (trống tới pilot của chủ) kết hợp thời điểm hiệu lực tự nộp của từng user.
- F-5: tổng trên PDF là tổng OT được ghi dạng h:mm của cả 14 ngày, ẩn khi tắt Hiện OT trên PDF.
- Tạm thời không đổi: việc WP2 đã bỏ số đếm suy từ dữ liệu nhân viên trong preview lịch lễ (WP2-A-01); F-Q6 được hỏi lại.

## Quyết định của chủ — 2026-10-05 (WP3-FIX2, câu hỏi H-Q1)

Nguồn: câu trả lời trực tiếp của chủ ghi trong bảng task, 2026-10-05.

- H-Q1 (a): tự nộp chỉ áp dụng cho tài khoản đã lưu setting nộp bài với tự nộp bật. Tài khoản chưa từng lưu thì không bao giờ được tự chốt và không có lần gửi nào. Mặc định, kỳ có hạn đã qua trước khi lưu setting không được tự nộp, cùng loại giới hạn với giới hạn lúc tạo tài khoản (docs/05 "Đến hạn và phục hồi"). Lựa chọn áp dụng cho kỳ quá hạn mà user chọn rõ khi lưu setting giữ nguyên như đã cài: đó là việc của chính user và vẫn bị chặn bởi lúc tạo tài khoản. Tắt tự nộp giữ nguyên hành vi. Điều này hiểu D-09 "Bật tùy chọn tự nộp sau setup" là: không tự động trước khi setup.

## Quyết định của chủ — 2026-10-05 (F-1..F-6 của WP4-PLAN)

Nguồn: câu trả lời trực tiếp trong chat của chủ ngày 2026-10-05, ghi nguyên văn trong bảng task (`F-1:a`, `F-2:a`, `F-3:a`, `F-4:a`, `F-5:OK`, `F-6:OK`). Mỗi câu trả lời chấp nhận đề xuất ở mục F của WP4-PLAN. Các quy tắc là yêu cầu; code cho chúng sẽ có ở các task WP4 sau.

- F-1 (a): mỗi người chỉ nhập workbook của chính mình, nên người thực hiện là chủ; admin không thể nhập thay ai. Điều này giải quyết "users/import" của tài liệu 03 với quy tắc riêng tư của admin. Quy tắc ở tài liệu 03 và 07.
- F-2 (a): kỳ đã nhập không ghi sự kiện sổ, không thể ký hay nộp (409 `imported_period`) và là lịch sử chỉ đọc; số dư đầu rõ ràng là nguồn OT mang sang duy nhất.
- F-3 (a): số dư đầu là phút có dấu khác không, mỗi user một khoản, chỉ đổi bằng sửa có lý do và lưu thành loại dòng sổ mới. Tài khoản chưa từng cấu hình hiện cho admin cờ "chưa thiết lập" và nhân viên không nhận cảnh báo quá hạn; khớp với quy tắc H-Q1 (a) ở tài liệu 05.
- F-4 (a): chỉ xóa dòng job `deadline_scan` và `reminder_scan` đã thành công và cũ hơn 30 ngày, qua ngoại lệ gắn với migration cho trigger; không bao giờ xóa dòng gửi, PDF hay delivery.
- F-5: việc dọn backup giữ 7 bản ngày, 4 tuần, 6 tháng và chỉ tác động lên thư mục do công cụ tạo; bản trên thiết bị khác (Synology Hyper Backup hoặc USB) là bước setup của chủ.
- F-6: tài liệu 07 ghi "không có bí mật session của ứng dụng; chỉ có credential SMTP".

## Quyết định của coordinator — restore và rollback của WP4 (2026-10-05, đảo ngược được; chủ có thể phủ quyết)

Không quyết định nào đổi yêu cầu đã chốt.

- Giữ job gửi sau restore (WP4-T06): restore giữ mọi job `send_email` và `send_reminder` đang xếp hàng hoặc giữ lease từ backup. Mỗi job chỉ được thả hoặc bỏ bằng thao tác rõ ràng của người vận hành, có ghi audit; job tạo sau restore không bị giữ. Lý do: thư chưa rõ kết quả hoặc đã được chấp nhận không được gửi lại sau khi tiếp tục.
- Chế độ rollback restore (WP4-T12A): `--keep-schema --confirm` restore backup vào schema mới hơn. Giới hạn còn lại: schema đã restore không có tạm dừng gửi nên không chặn được job tạo sau đó, vì vậy bản build cũ chạy với `JOB_RUNNER=off` cho đến khi đối chiếu. Chỉ bản build hiện tại mới thả được job bị giữ, nên rollback dài cần nâng cấp lần hai để đối chiếu. Lựa chọn của chủ: xóa giờ kích hoạt tự động khi `--confirm` (thay đổi trạng thái nghiệp vụ có audit, chưa làm) hoặc chấp nhận quy tắc `JOB_RUNNER=off`.

## Quyết định của coordinator — nhập workbook của WP4 (2026-10-06, đảo ngược được; chủ có thể phủ quyết)

Không quyết định nào đổi yêu cầu đã chốt.

- Mặc định an toàn cho I-3 (R3 của WP4-AUDIT-B, WP4-FIXB): I-3 (a) của chủ nói kỳ chưa kết thúc không nhập được. Coordinator cũng coi kỳ đã kết thúc nhưng chưa qua thời điểm đến hạn lương là chỉ-bỏ-qua (`not_due`, lý do `period_not_due`); chính thời điểm đến hạn được tính là đã đến hạn, như lần quét hạn chót. Đây là mặc định thận trọng: chủ có thể đảo ngược, khi đó kỳ đã kết thúc nhưng chưa đến hạn được phép nhập. Quy tắc nằm ở tài liệu 07.

## Quyết định của chủ — 2026-10-08 (thiết kế lại UI, E-1..E-7 của WP5-UX-PLAN)

Nguồn: các yêu cầu trực tiếp trong chat của chủ ngày 2026-10-08, ghi nguyên văn trong bảng task (`owner_decisions`). Yêu cầu: UI hiện tại khó hiểu và khó dùng; chủ muốn thiết kế đẹp và thân thiện hơn, và trang Timesheet có bố cục giống timesheet trong workbook Excel mẫu để người quen bản Excel không bỡ ngỡ. Các câu hỏi ở mục E của người lập kế hoạch được trả lời "OK theo khuyến nghị": mọi đề xuất đều được chấp nhận. Vòng thay đổi chỉ chạm client; không quy tắc nghiệp vụ, nội dung request hay phép tính của server nào đổi. Tài liệu 04 mô tả kết quả.

- E-1 (a): bảng hiện các dòng Excel Day, Date, Label, Time và OT cộng một dòng trạng thái Check. Các dòng chi tiết (worked on a workday, worked on a day off) nằm sau "Show details" trên Timesheet và luôn bật trên Review.
- E-2 (a): mọi ngày không làm việc theo lịch của server (cuối tuần, ngày lễ, ngày đóng cửa) có một nền nhạt kèm sọc chéo mảnh, và tên ngày lễ được viết trong ô Label. Cách gọi nhãn giữ các loại của app (Worked, Off, Vacation, Sick, Holiday, Shutdown) với "Work from home" là lối tắt trong bộ chọn cho Worked kèm WFH; "Sick Day" và "Off Day (Overtime Used)" của Excel không được đưa lại (E-2 ngày 2026-10-03 vẫn giữ).
- E-3 (a): sửa trong bảng bên trên desktop và bottom sheet trên điện thoại, và chọn nhãn trực tiếp trong ô như dropdown của Excel. Không áp dụng việc gõ giờ trực tiếp vào ô.
- E-4: bảng dùng ngày kiểu Mỹ, thời lượng dạng h:mm và giờ 24 giờ, giống PDF người dùng ký.
- E-5 (a): điều hướng gồm Timesheet, Overtime, History, Settings (cùng Admin); "OT" đổi tên thành "Overtime"; Import mở từ Settings và từ More trên điện thoại.
- E-6 (a): hiện dòng chữ ký manager trống, có nhãn ("Not used yet") như trên biểu mẫu Excel và PDF.
- E-7 (a): vòng này gồm khung ứng dụng và token, trang Timesheet, trình sửa ngày và Review. Làm lại giao diện Overtime, History và Settings là vòng sau khi vòng này được chấp nhận.
- Công thức Excel không được tái tạo: các công thức của workbook mâu thuẫn với quy tắc chuẩn không được sao chép (WP5-UX-PLAN mục B); app hiện các giá trị do server tính, như trên PDF. Đó là công thức OT 8,5 giờ mỗi ngày (chuẩn: tài liệu 02 và 10, ghi theo M gần nhất với giờ nghỉ và quy tắc ngoài lịch), tổng OT kỳ bỏ Chủ nhật và tính theo giờ thập phân (chuẩn: h:mm của cả 14 ngày), ngày payroll lấy từ TODAY() (chuẩn: kỳ đang chọn và quan hệ do server tính, D-12), ngày ký lấy từ TODAY() (chuẩn: ngày sign-off hoặc tự nộp đã lưu theo múi giờ báo cáo) và giờ cuối tuần mặc định ẩn (chuẩn: giờ thực không bao giờ được lưu từ lịch mẫu; hộp thoại thêm phiên làm việc có thể điền sẵn giờ tham chiếu dưới dạng giá trị được đánh dấu, sửa được, xem tài liệu 04).
- Hệ quả cho audit: thiết kế lại thay đổi mã nguồn WP5 đã nghiệm thu, nên cần cổng kiểm mới và audit độc lập mới trước khi kích hoạt pilot (tài liệu 08, "Changed source identity invalidates an old audit pass").

## Quyết định của chủ — 2026-10-14 (vòng thay đổi UI thứ hai)

Nguồn: các yêu cầu và câu trả lời trực tiếp trong chat của chủ ngày 2026-10-14, ghi nguyên văn (bằng tiếng Việt) trong bảng task (`owner_decisions`, 2026-10-14); danh sách này nêu từng mục bằng tiếng Anh, theo thứ tự. Vòng này đổi trang Timesheet và khung ứng dụng trước khi kích hoạt pilot. Không quy tắc nghiệp vụ, phép tính, nội dung request hay PDF nào đổi; thay đổi duy nhất ở server là cách diễn đạt của ba thông báo lỗi (xem các quyết định của coordinator bên dưới). Tài liệu 04 mô tả kết quả, và vòng này cần cổng kiểm riêng cùng audit độc lập mới trước khi định danh bản phát hành được làm mới.

- UX2-1 (yêu cầu): trên trang Timesheet, (1) tô sáng cả cột ngày có Day editor đang mở; (2) bộ chọn Label có kiểu lựa chọn nhẹ hơn, thanh thoát hơn nhưng vẫn dễ nhận ra, thay cho viền dày; (3) thêm nút chuyển giao diện tối/sáng vào thanh điều hướng chính; (4) làm màu hover của các nút chuyển (toggle) rõ hơn; (5) thêm nút "Today" tường minh để quay về ngày hoặc kỳ hiện tại sau "Open a day" hoặc khi đổi kỳ; (6) đổi "Show details" thành nút trượt (công tắc).
- WP5-UX2-Q1 (câu trả lời cho câu hỏi về Today): "Today" mở kỳ chứa ngày hôm nay (hiện cột hôm nay, và Day editor đang mở chuyển theo sang hôm nay). Một nút thứ hai, tên tạm "Current Period" (hoặc tên chính xác hơn), quay về kỳ mà trang mở ra, kỳ hiện tại của R-07, mà trong năm ngày sau khi một kỳ kết thúc là kỳ vừa kết thúc, được giữ để review và ký. Quy tắc kỳ mở trang R-07 và D-12 không đổi. Tên hiển thị là "Current period".
- UX2-2 (yêu cầu): (1) logo C&D đính kèm thay cho chữ "C&D CDsemi" ở góc trên bên trái, và chữ "CDSemi" bên cạnh chỉ hiện khi đủ chỗ; (2) trên điện thoại điều khiển check in/out chuyển lên thanh tiêu đề trên cùng, và "Today", "Current period" và "Review & sign off" chung một hàng, trong đó "Review & sign off" có thể xuống hai dòng hoặc rút gọn thành "Sign off"; (3) cách gọi "Clock in/out" đổi thành "Check in/out".
- UX2-3 (yêu cầu): (1) chữ "CDSemi" bên cạnh logo trở thành chữ thương hiệu hai dòng của ảnh đính kèm ("SEMICONDUCTOR" trên "SERVICES, INC."), theo màu của ảnh và theo file font của công ty đã cung cấp, logo ở bên trái và hai dòng chữ ở bên phải; (2) dòng "C&D Semiconductor Services, Inc." được bỏ khỏi timesheet trên màn hình, vì thanh trên cùng đã hiện tên công ty.
- WP5-UX2-Q2 (câu trả lời cho câu hỏi về chữ thương hiệu): công ty có quyền dùng font (VNI-Revue Bold) cho logo và chữ thương hiệu, nên chữ thương hiệu được vẽ bằng đường viền vector của các glyph; bản thân file font không bao giờ được commit. Ở giao diện tối chữ thương hiệu dùng các sắc nhạt hơn của xanh và xám thương hiệu để vẫn đọc được; giao diện sáng giữ đúng màu thương hiệu.
- UX2-4 (yêu cầu): (1) trên điện thoại "Review & sign off" rút gọn thành "Sign off" thay vì xuống dòng, và giữ nguyên chữ đầy đủ khi đủ chỗ; (2) trên màn hình lớn menu cách thương hiệu (logo và chữ) xa hơn một chút cho hài hòa; (3) điều khiển "Dark mode" trên desktop trở thành nút chuyển Dark/Light kèm biểu tượng tương ứng thay cho nút bật/tắt "Dark mode" cố định; (4) chữ "Due" trong dòng hạn nộp lấy kiểu của các nhãn khác (như "Payroll date"); (5) chữ "to" trong khoảng kỳ đổi thành mũi tên, dấu gạch hoặc chữ kiểu nhãn, do coordinator chọn.

## Quyết định của coordinator — vòng thay đổi UI thứ hai (2026-10-14, đảo ngược được; chủ có thể phủ quyết)

Không quyết định nào đổi yêu cầu đã chốt hay quy tắc nghiệp vụ.

- Lưu giao diện: lựa chọn được lưu theo từng thiết bị trong trình duyệt (khóa `timesheet.theme`), hai trạng thái; khi chưa có giá trị lưu thì trang theo thiết bị và lựa chọn được áp dụng trước lần vẽ đầu tiên. Không có thiết lập trên server. Điều khiển là nhóm radio "Theme" hai lựa chọn (Light với mặt trời, Dark với mặt trăng, biểu tượng inline, không dùng thư viện biểu tượng) trong thanh desktop và trong bảng More trên điện thoại.
- Today và Current period (WP5-UX2-Q1): Today dùng `today_local` của server theo múi giờ báo cáo đã lưu của timesheet, không bao giờ theo múi giờ thiết bị (AGENTS quy tắc 7), và không hoạt động (`aria-disabled`) khi đã ở đó; nút chuyển Day editor đang mở sang hôm nay (mặc định F-2). Current period chỉ hiện trong năm ngày từ thứ Hai sau khi một kỳ kết thúc đến thứ Sáu payroll và chỉ khi đang ở ngoài kỳ mở trang, và chỉ điều hướng. Mỗi lần nhảy được thông báo trong một vùng trạng thái ẩn, mức polite. Thứ tự là Previous, Next, Today, Current period, Review & sign off.
- Hover: một token hover dùng chung toàn app (`--hover-fill`) cho nút secondary và quiet, liên kết điều hướng, tab, mục More, công tắc và lựa chọn trong bộ chọn, kèm viền nhấn khi hover và nền nhấn đặc cho trạng thái đang nhấn; hiệu ứng hover chỉ áp dụng trên thiết bị có hover. Tiêu chí đo được nằm ở tài liệu 04.
- Dấu ngày đang mở: ngày đang mở trong Day editor được đánh dấu cả cột (hàng được khung lại trên điện thoại) và nút ngày của nó mang `aria-current`; thanh Today phía trên mà tài liệu đã hứa được sửa để hiện đè lên đầu cột.
- Chữ thương hiệu: đường viền vector sinh từ font của chủ bằng thư viện font PDF đã cài; không có file font trong repository và một test tĩnh bảo vệ điều đó. Màu lấy mẫu từ ảnh của chủ (`#006eba` và `#4c4f57`); sắc tối dùng lại màu nhấn và màu mờ của giao diện tối. Chữ thương hiệu hiện từ 1440px vì thanh có bộ chuyển "Shared with me" và tên người dùng dài cần 1376 đến 1440px trên một hàng (kế hoạch là 1280px); khoảng cách từ thương hiệu đến menu là 24px dưới 1440px và 32px từ đó.
- Dòng tên công ty: chỉ bỏ khỏi bảng Timesheet và Review trên màn hình; PDF vẫn giữ phần đầu có tên công ty, vì đó là tài liệu được nộp và là đầu ra của server.
- Liên kết Review trên điện thoại: luôn một dòng cao 44px; nhãn đầy đủ khi vừa chỗ, nếu không thì "Sign off" cho "Review & sign off" và "Review" cho "Review now" và "Review or correct"; trên điện thoại hẹp nhất (dưới khoảng 330px), khi Current period hiện, liên kết có hàng riêng với nhãn đầy đủ; tên truy cập là nhãn đầy đủ (WCAG 2.2 SC 2.5.3).
- Dấu ngăn khoảng kỳ: mũi tên "→" màu nhãn, `aria-hidden`, kèm chữ " to " ẩn trực quan để trình đọc màn hình vẫn đọc "to"; các văn bản vùng live và PDF giữ chữ "to". "Due" giữ nguyên chữ và lấy kiểu nhãn.
- Check in/out trên điện thoại: một provider trong khung ứng dụng phục vụ cả nhóm ở thanh trên cùng và thẻ desktop; thanh cao 60px, hoặc 112px khi có hàng bộ chuyển. Không có trong mọi chế độ xem chia sẻ (người được chia sẻ không bao giờ có vẻ check in thay chủ, F-Q5).
- Ba thông báo của server: cách diễn đạt của ba thông báo lỗi hiện ra màn hình đổi theo tên mới ("Check out of the running session first", "There is no running session to check out of", "A saved break ends after this Check out; resubmit the complete list of breaks to replace it"). Mã lỗi, đường dẫn API và hành vi không đổi. Quy tắc cổng kiểm: `dist/server` so với bản build đã nghiệm thu chỉ khác ở các chuỗi này (và một comment mà bản build giữ lại).
- Thuật ngữ: giao diện ghi "Check in/out". Đường dẫn API (`/api/clock/in`, `/api/clock/out`), loại sự kiện, giá trị nguồn, mã lỗi và định danh giữ chữ "clock". Vòng này cũng viết lại các mục cũ E-1 và F-Q5 ở trên và các tài liệu 01, 02, 04, 12 và DEVELOPMENT theo thuật ngữ mới; không quy tắc nào trong đó đổi.

## Quyết định của chủ — 2026-10-09 (mang sang vòng thay đổi UI thứ hai)

Nguồn: các câu trả lời trực tiếp "a" và "a" của chủ, ghi nguyên văn trong bảng task (`owner_decisions`, 2026-10-09). Quyết định của coordinator ngày 2026-10-09 giữ mục này ngoài mã nguồn đã nghiệm thu lúc đó và mang nó sang vòng thay đổi mã nguồn kế tiếp, tức là vòng này.

- WP5-UX-Q1 (a): sửa cả hai phát hiện khu vực B của WP5-UX-AUDIT-B4 trong một vòng nhỏ: token vòng focus dùng chung mạnh hơn, đạt ít nhất 3:1 so với mọi bề mặt liền kề ở cả hai giao diện cùng kiểm tra tương phản tự động (tài liệu 04, "Chuẩn hình ảnh"), và giờ đến hạn theo múi giờ hiển thị viết theo định dạng ngày kiểu Mỹ trong ghi chú múi giờ.
- WP5-UX-Q2 (a): chạy một lượt rà soát khả năng truy cập chỉ-đọc (quét tự động và đi bàn phím đầy đủ mọi màn hình trên desktop và điện thoại, sáng và tối) để liệt kê mọi mục WCAG 2.2 AA còn lại, rồi một vòng sửa cho tất cả, rồi cổng kiểm mới và kiểm tra lại độc lập. Hệ quả đã nằm trong tài liệu 04 (vòng focus, định dạng ghi chú múi giờ, tên truy cập của nút ngày).

## Quyết định của chủ — 2026-10-15 (vòng chỉnh UI thứ 3)

Nguồn: yêu cầu và các câu trả lời trực tiếp của chủ ngày 2026-10-15, ghi nguyên văn (tiếng Việt) trong bảng task (`owner_decisions`, 2026-10-15); danh sách này nêu từng mục bằng tiếng Việt. Vòng này thay đổi khung ứng dụng, trang Timesheet, Day editor và việc nhập giờ nghỉ trước khi kích hoạt pilot. Không đổi phép tính, nội dung request, PDF hay mã server. Hành vi nghiệp vụ chỉ đổi ở chỗ lời chủ yêu cầu: Save trong hộp thoại ca xác nhận các giờ nghỉ đã liệt kê, và hộp thoại ca mới điền sẵn giờ tham chiếu (đổi quy tắc bên dưới, AGENTS quy tắc 8). Tài liệu 04 mô tả kết quả; vòng này cần cổng kiểm riêng và kiểm toán độc lập mới trước khi làm mới danh tính bản phát hành. Các mục U-01 đến U-27 là danh sách của planner trong WP5-UX3-PLAN.

- Yêu cầu (U-01 đến U-27), theo nhóm. Phong cách và bề mặt (U-01, U-02): dùng phong cách hiện đại thay cho chuẩn công nghiệp; tăng tương phản giữa nền trang, card, panel và bảng; làm bảng tuần nổi bằng bóng đổ. Thanh trên cùng (U-03 đến U-06): tên, email và avatar của người dùng thành khối danh tính canh phải (tên hiển thị in đậm trên dòng email chữ nhỏ màu tối, rồi avatar) mở ra menu có nút Light/Dark, Profile, Settings và Sign out; hai mục Settings và Admin ở menu chính chuyển vào đó và Administration thành trang hoặc tab trong Settings; chữ thương hiệu phải thấy được trên màn hình lớn. Trang Timesheet (U-07 đến U-18): Check in/out kèm giờ bắt đầu ở hàng tiêu đề trang, canh phải; bỏ tên người dùng dưới tiêu đề; nhãn "old", "current", "future" phân biệt được ở giao diện sáng (old và current giữ tông màu, future màu hồng); ngày payroll, hạn nộp và múi giờ trên một hàng có xuống dòng; "Open a day" cùng hàng với ô chọn ngày; có khoảng cách giữa "Show details" và "Change several days"; cột đang mở được đánh dấu bằng ô Day tô nền và thanh khác màu với cột chọn nhiều ngày; cột chọn nhiều ngày và cột đang mở được nâng bằng bóng nhẹ, cột đang mở có thêm viền xanh mảnh; hỏi xem "Label" và "Check" có phải từ đúng không; trên màn hình hẹp dùng "Current" khi ba nút không vừa và ẩn chữ "Open a day" khi hàng không đủ chỗ. Day editor (U-19 đến U-27): ghi chú múi giờ ngắn hoặc bỏ; header panel nổi bật hơn; New/Edit session trong hộp thoại riêng, panel chỉ hiện giờ và bảng giờ nghỉ (ngày bắt đầu, giờ bắt đầu, số phút nghỉ); xác nhận xóa rõ ràng; tự điền giờ bắt đầu/kết thúc theo Settings và, với ngày quá khứ, cả giờ nghỉ gợi ý; vùng nghỉ đơn giản hơn (một ô "Confirm no breaks taken", mỗi giờ nghỉ một dòng, "Suggest breaks", "Add break"); Save tương đương confirm, có xác nhận trước khi Save và trước khi Cancel khi đã sửa; ô WFH cùng hàng với dòng Label.
- G-1 (b) duyệt mockup và hướng hiện đại kèm ba điều kiện về hình dạng: bảng tuần không bo góc; cột chọn (nhiều ngày và đang sửa) chỉ bo nhẹ 4px; các cột được nâng liền nhau không đổ bóng đè lên nhau. Và một quy tắc nổi: các cột bảng không bao giờ bị thu hẹp đến mức nội dung chồng lên nhau khi hiện Day editor; khi màn hình không đủ chỗ cho bảng tuần và panel cạnh nhau thì panel chuyển sang dạng nổi. Đo được: cạnh panel các cột rộng 89.4px và chữ bị ngắt giữa ô, dù không phần tử nào chồng lên phần tử khác; cột tối thiểu nay là 108px và panel nổi dưới 1360px (tài liệu 04).
- G-2 (a): "Category" thay "Label", và "Status" thay "Check" (đề xuất của chính chủ cho dòng chỉ hiển thị).
- G-3 (a): hộp thoại ca mới điền sẵn giờ tham chiếu và, với ngày quá khứ, các giờ nghỉ gợi ý, có đánh dấu và sửa được. Điều này mâu thuẫn với câu "Không seed giờ thực từ lịch" (tài liệu 04, đoạn ngay sau bảng Screens, dòng 16 trước vòng 3) và mệnh đề kết của danh sách ngày 2026-10-08 ở trên; yêu cầu rõ ràng của chủ được ưu tiên (AGENTS quy tắc 8) nên cả hai được viết lại, không bị bỏ qua. Văn bản chuẩn mới (tài liệu 04): "Giờ thực không bao giờ được lưu từ lịch mẫu: một giờ chỉ trở thành giờ thực khi người dùng lưu nó. Hộp thoại thêm phiên làm việc điền sẵn giờ bắt đầu và kết thúc theo giờ tham chiếu của quy tắc có hiệu lực vào ngày đó (giờ đồng hồ vào ngày ghi sổ theo múi giờ báo cáo đã lưu, hiển thị theo múi giờ nhập) và, với ngày trước hôm nay theo múi giờ báo cáo (ngày của server), điền sẵn các giờ nghỉ gợi ý nằm trong khoảng đó; giá trị điền sẵn được đánh dấu, sửa được, và nút Save luôn hỏi xác nhận trước." Mệnh đề ngày 2026-10-08 nay ghi rằng chuẩn là giờ thực không bao giờ được lưu từ lịch mẫu và hộp thoại có thể điền sẵn giờ tham chiếu dưới dạng giá trị được đánh dấu, sửa được. Ý của quy tắc cũ được giữ (không lưu gì mà người dùng chưa nhập hoặc xác nhận; giờ cuối tuần mặc định ẩn của Excel không được sao chép). Tác động: phút làm việc, OT được ghi, cảnh báo review và sign-off không đổi với mọi dữ liệu đã lưu và server nhận cùng dạng request; rủi ro mới duy nhất là người dùng lưu giá trị điền sẵn mà không kiểm tra, được giảm bằng ghi chú điền sẵn, nhãn "suggested" và bản tóm tắt "Save this session?" bắt buộc. Tài liệu 02 và 03 không cần đổi (R-02 và R-07 đã cho phép).
- G-4 (biến thể của chủ): khi nhấn Save mà chưa liệt kê giờ nghỉ nào và ô "Confirm no breaks taken" chưa chọn, một hộp thông báo cho ba lựa chọn: xác nhận không nghỉ, tạm chưa xác nhận giờ nghỉ, hoặc quay lại để thêm giờ nghỉ; nếu người dùng tiếp tục thì hộp xác nhận lưu cuối cùng vẫn hiện sau đó.
- G-5 (b): kỳ chứa hôm nay hiện nhãn "in progress" trong năm ngày khi một kỳ khác vẫn là kỳ hiện tại. Điều này cũng trả lời câu hỏi tùy chọn WP5-UX2-Q3 về nhãn "future" của kỳ đó.
- N-1 (yêu cầu thêm): trên màn hình hẹp trong hộp thoại ca, nhãn "Break n" nằm trên một dòng riêng phía trên ô chọn ngày, còn ô chọn ngày và giờ, ô số phút và nút xóa chung một hàng; nếu vẫn không đủ chỗ thì mỗi giờ nghỉ là một chip chữ như "Break 1: 10/12/2026 10:00 -> 10:15" mở hộp thoại con để sửa ba giá trị đó.
- N-2 (yêu cầu thêm): chỉnh lại khoảng cách của hộp thoại ca trên màn hình hẹp, không quá thưa cũng không dính chùm.
- Q6 (b) (WP5-UX3-Q6, câu trả lời cho câu hỏi dòng giờ nghỉ trên điện thoại được hỏi lại): trường ngày của giờ nghỉ chỉ hiện khi ca qua nửa đêm địa phương (hoặc chưa đặt giờ kết thúc); ngoài ra ngày của giờ nghỉ là ngày của ca và không có trường ngày, nên bố cục một hàng vừa với điện thoại thông thường còn chip kèm hộp thoại con chỉ dành cho độ rộng rất hẹp.
- Giờ trên chip: chip giờ nghỉ hiện giờ theo định dạng 24 giờ (E-4), không dùng AM/PM.

## Quyết định của coordinator — vòng chỉnh UI thứ 3 (2026-10-15, có thể đảo ngược; chủ có thể phủ quyết)

Không quyết định nào đổi một yêu cầu đã xác nhận ngoài các câu trả lời của chủ ở trên.

- Điều kiện của G-4: thông báo chỉ hiện khi nhấn Save mà chưa liệt kê giờ nghỉ nào và ô chưa chọn; khi đã có dòng thì Save xác nhận chúng. Ba lựa chọn ánh xạ lên mô hình giờ nghỉ hiện có mà không đổi ("Confirm no breaks taken" chọn ô; "Leave breaks unconfirmed for now" lưu với giờ nghỉ chưa biết và OT chờ; "Go back" quay lại "Add break"). Khi Check out không dùng thông báo này và không có xác nhận cuối; E-1 và các nhãn nút rõ ràng giữ nguyên (khi hộp thoại mở ra với các dòng đã lưu và người dùng đã xóa hết, nó gửi danh sách rỗng chưa xác nhận và nói rõ rằng các dòng đã xóa sẽ bị xóa). Rời hộp thoại Check out (Cancel, Escape) hỏi "Discard your changes?" khi các dòng hoặc ô của nó đã đổi, như hộp thoại ca (U-26), và đóng ngay khi không có gì đổi.
- Panel nổi: nổi nghĩa là panel bên dạng modal hiện có dưới 1360px, đặt xa cột đang sửa, kèm lớp nền mờ nhạt; panel không modal phủ lên sẽ che các ô và nút nhận được tiêu điểm (WCAG 2.4.11), còn panel modal giữ thứ tự Escape, việc trả tiêu điểm, đệm cuộn AX-01 và việc chuyển chế độ trì hoãn. Ngưỡng tăng từ 1200px lên 1360px vì bảng (850px với cột 108px), panel (400px), các khoảng cách và lề trang cần khoảng 1347px.
- Tách mã thay vì nâng giới hạn: gói client đạt 502.77 kB và Vite in cảnh báo 500 kB; nâng giới hạn chỉ hoãn chi phí còn nhân viên vẫn tải mã chỉ dành cho admin. Màn Administration và Import nay tải khi cần (gói chính 487.01 kB ở bản dựng sau WP5-UX3-FIX4, dưới ngưỡng cảnh báo 500 kB; Administration 31.6 kB, Import 23.8 kB, các chunk cùng nguồn, chính sách bảo mật nội dung không đổi). Khi chunk tải lỗi, thông báo có nút "Try again" tải lại trang, vì thử lại tại chỗ không hoạt động trong trình duyệt.
- Mẫu menu tài khoản: bảng disclosure với một nút (`aria-expanded`, `aria-controls`), không phải ARIA menu, nên các liên kết, nhóm radio Theme và Sign out giữ ngữ nghĩa và thứ tự Tab riêng; bảng More trên điện thoại mang cùng nội dung. Chữ thương hiệu hiện từ 1024px và chỉ bị ẩn từ 1024 đến 1279px khi bộ chuyển "Shared with me" có trên thanh (thanh cần khoảng 1252px với bộ chuyển và tên dài); trong khoảng đó khoảng cách thanh và đệm liên kết menu chặt hơn để thanh giữ một hàng.
- Profile chỉ đọc: tên hiển thị, email, vai trò và múi giờ báo cáo, kèm ghi chú rằng admin là người đổi tên hiển thị. Không đổi server; sửa tên hay mật khẩu vẫn ngoài phạm vi (D-9 không đổi). Các trang con của Settings là route phía client có tiêu đề riêng; `#/admin` đưa admin sang `#/settings/admin`; phân quyền không đổi và do server thực thi.
- "Status" thay "Check": dòng này chỉ hiển thị trạng thái, nên từ chủ đề xuất được dùng trong mọi phương án của câu hỏi.
- Giờ: mọi giờ hiển thị vẫn là 24 giờ (E-4, như trên PDF), kể cả chip giờ nghỉ. Ô ngày và giờ vẫn là input gốc của trình duyệt, định dạng 12/24 giờ và thứ tự ngày theo ngôn ngữ trình duyệt, nên trình duyệt en-US hiện mm/dd/yyyy và AM/PM trong ô còn chữ của chính app vẫn 24 giờ.
- Các mặc định khác đã nhận: "Confirm breaks" trên thẻ ca thay các nút một chạm; "Change several days" là nút có viền; "No times" là vòng tròn có vạch chéo để không gì trên bảng trông như ô tick; hộp thoại Check out dùng lại các dòng giờ nghỉ với ngữ nghĩa E-1 (trường ngày luôn hiện ở đó vì ca đang chạy chưa có giờ kết thúc, khác với Q6 (b) cho các ca xác định được); "Confirm breaks" liệt kê các giờ nghỉ gợi ý nằm trong ca (mỗi giờ nghỉ vừa trong ca đều được liệt kê, không phải tất cả hoặc không gì, như phần điền sẵn của ca mới; mã đã được căn theo văn bản này ở WP5-UX3-FIX3) và, khi không có gợi ý nào vừa, hỏi qua thông báo G-4 thay vì tự chọn sẵn "No breaks taken"; từ 768 đến 899px card tuần tự cuộn ngang vì bảy cột 108px không vừa trang.
- Giới hạn vừa màn hình đã biết: trên điện thoại 390x844 hộp thoại ca mới với ba giờ nghỉ gợi ý phải cuộn (khoảng 259 đến 297px) trong khi phần đầu và hai nút 44px luôn thấy được, nên N-2 của chủ được đáp ứng bằng khoảng cách đã đo chứ không bằng việc bỏ chữ.

## Quyết định của chủ — 2026-10-20 (các quyết định pilot có đổi mã, phần server của WP5-UX4)

Nguồn: câu trả lời trực tiếp trong chat của chủ ngày 2026-10-20 cho các quyết định pilot D-1..D-15 và các câu hỏi F-1..F-5 của WP5-UX4-PLAN, ghi nguyên văn (tiếng Việt) trong bảng nhiệm vụ (`owner_decisions`, 2026-10-20). Mục này ghi các câu trả lời làm đổi mã hoặc một quy tắc chuẩn; khi một câu trả lời mâu thuẫn với quy tắc cũ thì quy tắc được viết lại (AGENTS quy tắc 8), không bị bỏ qua. Các câu trả lời chỉ về tài liệu được ghi ở mục kế tiếp.

- F-1 (i) (WP5-OWN-Q1, câu trả lời D-10 "OT đầu kỳ mặc định là 0, cho phép sửa bất cứ lúc nào, không cần bằng chứng"): số dư đầu bằng 0 và không có dòng nào cho đến khi chủ đặt nó; chỉ chủ của timesheet đặt hoặc đổi nó (admin không bao giờ thấy số dư cá nhân), bất cứ lúc nào. Giá trị đầu tiên là một dòng có dấu, khác không, kèm ngày hiệu lực (mặc định là ngày đặt) và một lý do ngắn; mọi giá trị sau là một lần sửa có lý do. Tham chiếu bằng chứng trở thành tùy chọn: nếu để trống thì lưu trên dòng số dư đầu bằng chữ cố định "not provided", nên schema không đổi và không cần migration; một lần sửa thì lưu null. Điều này viết lại quy tắc F-3 (a) ngày 2026-10-05 ở trên ("phút có dấu, khác không ... kèm ngày hiệu lực, lý do và bằng chứng") và tài liệu 03. Pilot không dùng nhập workbook lịch sử; bản production vẫn giữ tính năng nhập.
- D-5 (a): một lần sửa có thể đưa số dư đầu về 0. Nó ghi một dòng sửa bằng âm giá trị hiện tại; số dư đã bằng 0 thì không ghi gì (`unchanged`). Chỉ lần sửa mới được nhắm tới 0; giá trị đầu tiên vẫn khác không. Lịch sử được giữ: dòng gốc và mọi lần sửa vẫn nằm trong sổ.
- D-6 (a): mỗi người có tối đa 20 bản xem trước workbook chưa commit. Một lần tải lên mới khi đã tới giới hạn bị từ chối với 409 `import_preview_limit` ("Commit or finish one of your 20 open previews first") và không lưu gì; cùng file đó tải lại vẫn mở bản xem trước đã có. Bản xem trước bất biến và không xóa được, nên commit một bản (có thể bỏ qua mọi ngày) là cách duy nhất để giải phóng một chỗ.
- D-9 (b): tự đổi mật khẩu, `POST /api/auth/password`, chỉ cho chính user đang đăng nhập (không bao giờ qua quyền chia sẻ), với mật khẩu hiện tại, một mật khẩu mới 12 đến 256 ký tự khác mật khẩu cũ, và kiểm tra origin. Sai mật khẩu hiện tại trả 403 `current_password_incorrect` và được đếm vào bộ giới hạn đăng nhập theo user và địa chỉ client dưới khóa riêng `password:<user id>` (429 kèm Retry-After); khóa đăng nhập mang tiền tố `login:` nên không dữ liệu đăng nhập nào chạm được vào bucket đó (F-UX4B-1, kiểm toán vòng 4 khu B), còn bucket theo địa chỉ vẫn dùng chung với đăng nhập. Hash mới, việc thu hồi các phiên khác của user (phiên này vẫn đăng nhập) và sự kiện audit `auth.password_change` (không có bí mật) nằm trong một transaction. Trang Profile có thêm thẻ "Change password", nên không còn chỉ đọc. Mật khẩu tạm của admin cho tài khoản mới (E-11) không đổi. Điều này thay câu "D-9 không đổi" trong các quyết định coordinator của vòng 3 ở trên.
- F-2 (b) (câu trả lời D-15): bản xem trước nhập ngày lễ của admin lại hiện số đếm chính xác theo từng ngày: với mỗi ngày thay đổi, số ngày của nhân viên trong timesheet chưa chốt theo nhãn mặc định, số nhãn tự chọn mà bản nhập giữ lại, và số timesheet đã chốt, không có danh tính. Điều này đảo lại việc gỡ bỏ ở WP2-A-01 mà mục 2026-10-04 ở trên đã giữ ("Không đổi trong lúc chờ") và được ghi vào tài liệu 03 thành một ngoại lệ rõ ràng của quy tắc "admin không thấy chi tiết timesheet". Vì số 1 trong một nhóm nhỏ có thể chỉ ra các ngày đã ghi của một đồng nghiệp cụ thể, mỗi lần xem trước ghi một sự kiện audit `calendar.holiday_preview` (người thực hiện, lịch, khoảng ngày, số ngày có số đếm; không tên, không CSV).
- Chặn chấm công qua chia sẻ (thực thi F-Q5 ngày 2026-10-04, không đổi quy tắc): qua quyền chia sẻ, một thao tác sửa ca làm bắt đầu hoặc kết thúc một ca đang chạy chính là Check in hay out thay chủ bằng đường khác và bị từ chối với 409 `shared_clock_action`: thêm giờ kết thúc cho ca đang chạy, tạo một ca mới đang mở, hoặc mở lại một ca đã kết thúc. Các thao tác sửa qua chia sẻ giữ ca đã kết thúc vẫn kết thúc, hoặc giữ ca đang chạy vẫn chạy (sửa giờ bắt đầu), và mọi thao tác của chủ đều không đổi.

## Quyết định của chủ — 2026-10-20 (các câu trả lời chỉ về tài liệu, WP5-UX4-T06)

Nguồn: cùng các câu trả lời trực tiếp trong chat ngày 2026-10-20 (`owner_decisions`). Các câu trả lời này không đổi mã và không đổi quy tắc chuẩn nào; chúng được ghi ở đây, trong ghi chú phát hành, sổ tay vận hành và gói pilot. D-5 a, D-6 a, D-9 b, D-10 (là F-1 (i)) và D-15 b nằm ở mục ngay trên.

- D-1 (a): job tạo sau khi rollback về schema cũ không bị giữ lại; bản build cũ chạy với `JOB_RUNNER=off` cho đến khi đối chiếu xong (sổ tay vận hành mục 8 và 15). Pilot là lần cài đặt đầu tiên nên chưa có schema production cũ nào.
- D-2 (a), D-3 (a), D-4 (a): giữ mặc định nhập hiện tại: kỳ nháp không bao giờ nhận ngày nhập; "Off day (overtime used)" bị bỏ qua; kỳ chưa kết thúc hoặc chưa đến hạn chỉ được bỏ qua. Chúng chỉ có ý nghĩa nếu nhập lịch sử, mà pilot không nhập.
- D-7 (a): lời nhắc là ít nhất một lần. Sau sự cố ở SMTP thật, một lời nhắc có thể đến hai lần; mất một lời nhắc có thể gây lỡ hạn (tài liệu 05).
- D-8 (a): lỗi chứng chỉ TLS (không tin cậy, hết hạn hoặc sai tên máy) vẫn là tạm thời ở cả hai chế độ TLS: tổng cộng năm lần thử, rồi can thiệp, hiện là `smtp_unavailable`; `smtp_tls_failed` chỉ xuất hiện khi máy chủ từ chối STARTTLS. Giữ nguyên và ghi tài liệu; lần kiểm tra đầu tiên sau khi đổi chứng chỉ hoặc máy chủ nằm ở sổ tay vận hành, mục 13.
- D-11 (a): gói pilot được theo dõi chứa placeholder; giá trị thật nằm ở bản sao riêng của chủ, ngoài git (repo là công khai).
- D-12 (a): lần kích hoạt thật đầu tiên theo giai đoạn: kỳ đầu ký tay, tự nộp tắt, không đặt thời điểm kích hoạt và lần gửi thật đầu tiên đến địa chỉ của chính chủ; tự động hóa bắt đầu từ kỳ kế tiếp.
- D-13 (a): máy chủ pilot là NAS; NAS vẫn CHƯA ĐƯỢC KIỂM CHỨNG cho đến khi chủ đánh dấu danh sách ở mục 2 của sổ tay vận hành.
- D-14 (b): bản phát hành đầu tiên được tuyên bố sau thời gian pilot, không phải lúc cho phép pilot. Cho đến lúc đó các commit vẫn ở `main` theo quy tắc ở tài liệu 08; `git.release_declared` vẫn là false. Agent không tạo tag.

## Quyết định của coordinator — vòng chỉnh UI thứ 4, ngăn kéo của trình sửa ngày (2026-10-20, WP5-UX4-T02; có thể đảo ngược, chủ có thể phủ quyết)

Căn cứ: yêu cầu vòng 4 của chủ ngày 2026-10-20 (ba yêu cầu, nguyên văn tiếng Việt trong bảng nhiệm vụ `owner_decisions`: bấm đổi cột hoặc bỏ chọn cột khi panel chi tiết đang hiện, "panel hiện bên nào thì các góc phía sát biên của phía đó không được bo tròn", và "chỉ floating panel khi chiều rộng không đủ chỗ hiển thị week sheets và detail panel cạnh nhau mà nội dung các cột bị chồng lên nhau") và câu trả lời F-5 cùng ngày, duyệt mockup (hình B5 và B6) "hầu hết như đã vẽ" với các thay đổi không liên quan tới những mục này.

- Panel nổi không modal (thay thế mục "Panel nổi" ngày 2026-10-15 ở trên): nổi không còn nghĩa là panel bên dạng modal phủ lên trang bị vô hiệu. Từ 768px trình sửa ngày là một ngăn kéo không modal ở cả hai cách bố trí (`show()`, không lớp nền, không `inert`, không `aria-modal`); chỉ bottom sheet trên điện thoại (dưới 768px) vẫn là modal. Lý do của lựa chọn cũ, WCAG 2.2 SC 2.4.11 (Focus Not Obscured), được giữ bằng cơ chế khác: khi một điều khiển phía sau ngăn kéo nổi nhận tiêu điểm và hộp của nó nằm hoàn toàn dưới ngăn kéo, ngăn kéo chuyển sang mép cửa sổ bên kia (`dockAwayFrom` khi `focusin`), nên điều khiển đang có tiêu điểm không bao giờ bị che hẳn; test đi bàn phím quét bảng timesheet từ 768 đến 1329px. Thứ tự Escape, việc trả tiêu điểm, đệm cuộn AX-01 và quy tắc đặt xa cột đang sửa được giữ; việc chuyển chế độ trì hoãn nay chỉ còn liên quan đến mốc 768px.
- Chuyển ngày, bỏ chọn và câu hỏi hủy thay đổi: nút ngày của cột khác (hoặc bất kỳ chỗ nào trên cột đó) chuyển ngăn kéo sang ngày ấy mà không cần đóng trước; nút của chính ngày đang mở đóng ngăn kéo, tiêu điểm được giữ và một trạng thái lịch sự đọc "Day editor closed". Chỉnh sửa chưa lưu của biểu mẫu các trường ngày hoặc của lý do (lý do mà chưa lần lưu nào dùng) không bao giờ bị bỏ âm thầm: mọi thao tác làm đổi ngày đang mở, đóng trình sửa hoặc chuyển bảng timesheet sang kỳ khác đều trước hết hỏi "Discard your changes?" (Keep editing, Discard) qua hộp thoại xác nhận có sẵn, và chỉ khi có gì chưa lưu. Các đường đó là: nút ngày hoặc cột ngày, nút của chính ngày đang mở (bỏ chọn), "Open a day", "Today", "Previous period" và "Next period", "Current period", nút Close của trình sửa và Escape. Keep editing không đổi gì, kể cả kỳ đang hiển thị; Discard thì tiếp tục (bước sang kỳ khác hoặc "Current period" để trình sửa mở nguyên và bắt đầu lại từ ngày đã lưu). Hộp thoại modal lồng bên trong vẫn nhận Escape trước. Không có bước hỏi: liên kết rời khỏi trang Timesheet (thanh trên cùng, "Review & sign off") và việc trình sửa tải lại ngày sau khi một lần ghi nhãn hoặc ghi nhiều ngày làm đổi chính ngày đó.
- Hình học ngăn kéo: một hình học chung cho cả hai cách bố trí, một cột cố định sát một mép cửa sổ từ dưới thanh trên cùng tới đáy cửa sổ; hai góc sát mép là góc vuông và hai góc hướng về bảng timesheet là `--radius-lg` (đặt bên phải: `--radius-lg 0 0 --radius-lg`). Chế độ cạnh bảng đẩy trang: trang chừa `--editor-width + --editor-gap` bên phải và trang Timesheet không còn nới rộng tới `--page-max-editor` (trang Review giữ token đó cho checklist của nó). Ghi chú "khung chỉ được khẳng định khi nằm cạnh bảng" trong tài liệu 04 bị bỏ, vì không còn lớp nền nào phủ lên khung.
- Quy tắc bố trí theo nội dung (thay cho con số cố định 1360px của mục 2026-10-15 nói trên): trình sửa chỉ nổi khi `viewportWidth - pagePadding - editorWidth - gap < sheetMinWidth`, một hàm thuần của chiều rộng cửa sổ và các token (`editorLayout` trong `editorLayoutModel.ts`; `viewportWidth` từng là `document.documentElement.clientWidth`, nên thanh cuộn chiếm chỗ được tính; từ 2026-10-21 nó là `window.innerWidth` trừ chiều rộng thanh cuộn chiếm chỗ đã đo, xem "Quyết định của chủ sở hữu - 2026-10-21" bên dưới). Phần tử gốc từng giữ rãnh thanh cuộn dạng chiếm chỗ ở mọi chiều cao trang (`html { overflow-y: scroll }`, F-UX4A-1 của kiểm toán vòng 4 khu A, nay đã bỏ lại theo R5 b): nếu không, chiều rộng phụ thuộc việc trang có cao hơn cửa sổ hay không, bố cục làm đổi chiều cao trang, và trình sửa nhấp nháy giữa cạnh bảng và nổi khoảng 60 lần mỗi giây ở chiều rộng cửa sổ 1335 đến 1344px (đã đo `scrollbar-gutter: stable` không giữ chỗ cho rãnh của viewport trong Chromium). Với lề tờ giấy 16px, mức cần là 1330px khi thanh cuộn dạng phủ và 1345px chiều rộng cửa sổ khi có thanh cuộn chiếm chỗ 15px (ước lượng khoảng 1347px của 2026-10-15, làm tròn lên thành con số 1360px, được thay bằng con số tính từ các token). Mã nguồn không còn con số bố trí cố định nào.

## Quyết định của coordinator — vòng chỉnh UI thứ 4, hộp thoại ca (2026-10-20, WP5-UX4-T03; có thể đảo ngược, chủ có thể phủ quyết)

Căn cứ: các mục U4-11 và U4-15 của kế hoạch vòng 4 và câu trả lời F-5 của chủ ngày 2026-10-20 (mockup B7, B8 và B11 được duyệt, với "Today" và "Now" căn phải theo ô nhập của chúng).

- Sửa ca đang chạy (U4-11), chỉ phía client: Edit trên ca đang chạy của hôm nay mở hộp thoại ca không có giờ kết thúc, và Save gửi `end: null`, `breaks_confirmed: false` cùng `expected_version` đã tải tới `PUT /api/sessions/:id` không đổi; hợp đồng server, phép tính và chốt chặn chấm công qua chia sẻ của mục trên không bị chạm tới. Giờ nghỉ của ca đang chạy không bao giờ được xác nhận từ hộp thoại này (hộp thoại ẩn "Confirm no breaks taken" và không hỏi "No breaks listed"): người dùng xác nhận chúng khi Check out, vẫn theo E-1, nên số phút làm việc vẫn tính từ giờ bắt đầu đã lưu khi Check out (phép thử tích hợp trong `clock-out-breaks.test.ts`). "Set an end instead" chuyển sang luồng ca đã kết thúc, cách đóng một lần quên check out, và không có trong màn hình chia sẻ vì người được chia sẻ không bao giờ check out thay chủ (F-Q5).
- Check out dùng lại hộp thoại cảnh báo (U4-15): kế hoạch khuyến nghị dùng lại "This session was not saved" trong hộp thoại Check out chỉ khi coordinator đồng ý. Đã đồng ý: hộp thoại Check out dùng chung các dòng giờ nghỉ, và cùng những lỗi lưu (chồng lấn, một giờ nghỉ bị từ chối, mất mạng) có thể nằm dưới nếp gập ở đó. Hộp thoại cảnh báo là `AlertDialog` mới một nút; `ConfirmDialog` và chốt chặn hủy thay đổi giữ nguyên hai nút. Version cũ vẫn giữ bảng Reload ở cả hai hộp thoại.

## Quyết định của coordinator — vòng chỉnh UI thứ 4, xuất và nhập cài đặt (2026-10-21, WP5-UX4-T05; có thể đảo ngược, chủ có thể phủ quyết)

Căn cứ: mục U4-01 của kế hoạch vòng 4 và các câu trả lời F-3 (a) và F-4 (a) của chủ ngày 2026-10-20 (một tệp cài đặt cá nhân cùng một tệp lịch công ty riêng cho admin; nhập luôn xem trước với "Now / In the file" và một lần xác nhận, mỗi nhóm trở thành một version mới qua các route đã có, quy tắc làm việc áp dụng từ một ngày được chọn, và tự động nộp chỉ được bật bằng một ô tick riêng).

- Tệp phía client, không đổi server (F-3 (a), F-4 (a)): hai tệp được tạo và đọc trong trình duyệt từ các route đã có và ghi ngược lại qua chính chúng (`GET/POST /api/policies` và bản xem trước của nó, `GET/POST /api/settings/submission`, `GET /api/calendar`, xem trước và commit nhập ngày lễ, `POST /api/admin/payroll-exceptions`); không thêm route, schema hay sự kiện audit nào, và các sự kiện audit theo từng route cùng ghi chú chính sách "Imported from settings file <name>" ghi lại một lần nhập. Tệp chỉ chứa một danh sách khóa cố định cho mỗi phạm vi (tài liệu 04, "Xuất và nhập cài đặt") và không bao giờ chứa ảnh chữ ký hay quyền dùng nó, bí mật, dữ liệu timesheet, danh tính một người hay `apply_to_overdue_drafts`; format, schema version hay khóa lạ bị từ chối trước mọi bước xem trước. Tự động nộp không bao giờ được bật chỉ bởi một tệp: chỉ ô tick riêng, mặc định không tick, mới bật nó. Chỗ nào kế hoạch và mockup khác các câu trả lời này thì câu trả lời thắng: thẻ "Export and import settings" nằm trong Settings, Personal, như một thẻ chứ không phải một trang Settings mới (thanh điều hướng các mục không đổi), và tệp công ty là một thẻ trong Administration.
- Các giới hạn xuất phát từ route đã có (quy tắc phía client, không phải quyết định của chủ): tệp công ty áp dụng cho lịch của chính admin, lịch duy nhất mà `GET /api/calendar` đọc, và bị từ chối nếu các ngày làm việc trong tuần khác lịch đó (không route nào đổi được chúng); mỗi lần nhập một năm ngày lễ qua quy tắc gộp nhập ngày lễ không đổi; một ngoại lệ ngày trả lương đã có với giá trị khác thì được giữ, vì ngoại lệ không sửa được. Phiên bản app ghi trong tệp là một hằng số ở client (`APP_VERSION`) mà một unit test so với `package.json`, vì client không có nguồn nào khác cho nó.

## Quyết định của chủ sở hữu — 2026-10-21 (WP5-UX4-FIX3)

- R2 a, chốt chặn đồng hồ qua chia sẻ bao gồm cả Delete: người được cấp quyền sửa không được xóa ca đang chạy của chủ sở hữu. Xóa nó sẽ kết thúc đồng hồ của chủ sở hữu bằng một đường khác, điều mà F-Q5 đã từ chối với một chỉnh sửa hay một ca mới đang mở. `DELETE /api/shared/:ownerId/sessions/:id` trên ca chưa có giờ kết thúc trả 409 `shared_clock_action` và không ghi gì; người được cấp quyền vẫn xóa được ca đã kết thúc, thao tác xóa của chính chủ sở hữu không đổi, và khung nhìn chia sẻ có quyền sửa không hiện Delete trên thẻ ca đang chạy (tài liệu 04). Không thêm route nào.
- R5 b, không ép thanh cuộn ở phần tử gốc: chủ sở hữu chọn bỏ `html { overflow-y: scroll }` (F-UX4A-1 của kiểm toán vòng 4 khu A). Bố cục trình sửa ngày đọc chiều rộng cửa sổ trừ chiều rộng thanh cuộn chiếm chỗ, đo bằng một hộp `overflow: scroll` ngoài màn hình, nên không bao giờ phụ thuộc việc trang có đang vẽ rãnh cuộn hay không. Trang thấp hơn cửa sổ lại không vẽ rãnh cuộn dọc; điểm chuyển giữ nguyên ở 1330px với thanh cuộn dạng phủ và 1345px với thanh cuộn chiếm chỗ 15px.

## Quyết định của chủ sở hữu — 2026-10-21 (WP5-UX5, người ký và ảnh chữ ký của sign-off)

Nguồn: câu trả lời F-5 b của chủ sở hữu ngày 2026-10-21 cho câu hỏi về chữ ký trong WP5-UX5-PLAN, ghi nguyên văn (tiếng Việt) trong bảng nhiệm vụ (`owner_decisions`, 2026-10-21): có ảnh thì ký bằng ảnh và tên; không có ảnh thì ký bằng tên; ảnh chữ ký là không bắt buộc.

- F-5 b, người ký là người đang đăng nhập và ảnh là tùy chọn (nhiệm vụ WP5-UX5-T01a; chỉ đảo ngược bằng một quyết định mới của chủ). Sign-off thủ công, bản sửa và late review ghi tên hiển thị của tài khoản và, khi đã lưu, cả ảnh chữ ký; chưa lưu ảnh thì ghi riêng tên và PDF chỉ in tên. Không có tên gõ vào: `signer_name` vẫn là khóa được chấp nhận và bỏ qua của ba thân request để caller cũ chạy tiếp (các mã 422 `signer_name_required`, `invalid_signer_name` và `signature_required` không còn, và tên gõ vào không còn quyết định một lần gửi lại có phải là replay giống hệt hay không). Ảnh đã lưu không thể bỏ ra: payload review có `signature` khác ảnh đang lưu lúc yêu cầu là 409 `stale_review`.
- Dữ liệu: migration 0014 dựng lại `signoffs` với `signature_attachment_id` có thể rỗng (quy trình mười hai bước của migration 0013); các dòng được chép nguyên, trigger kiểm loại ảnh chỉ áp dụng cho ảnh có mặt, và sign-off vẫn chỉ-thêm. Việc ủy quyền ảnh tự động không đổi: nó được hỏi lúc tải lên và chỉ chi phối các lần tự nộp.
- Quy tắc được viết lại theo quy tắc AGENTS 8, kèm bản dịch: tài liệu 03 (bản ghi và ranh giới API), tài liệu 04 ("Email và PDF"), tài liệu 05 ("Luồng thủ công") và AC-06 trong tài liệu 06. Ký và gửi vẫn là một hành động ("Sign off & Submit") cho đến nhiệm vụ UX5-T01b.

## Quyết định của chủ sở hữu — 2026-10-21 (WP5-UX5, tách sign-off và gửi, F-2 a, F-3 b, F-4)

Nguồn: các câu trả lời của chủ sở hữu ngày 2026-10-21 cho WP5-UX5-PLAN, ghi nguyên văn (tiếng Việt) trong bảng nhiệm vụ (`owner_decisions`, 2026-10-21, mục bắt đầu bằng "F1.a"): F-2 a như đề xuất; F-3 b, công tắc PDF đổi được ở mỗi lần gửi, đồng thời Settings cũng có chỗ chỉ định làm giá trị mặc định; F-4, phong bì sửa được riêng cho từng lần gửi, và nếu đã từng gửi đi một bản thì phải hiện xác nhận và yêu cầu gõ lý do trước khi gửi thêm bản mới. Thực hiện bởi nhiệm vụ WP5-UX5-T01b; chỉ đảo ngược bằng một quyết định mới của chủ.

- Ký và gửi là hai hành động riêng. Sign-off, bản sửa và late review tạo revision đã ký, sign-off và các bút toán sổ, và chỉ xếp PDF; `send_requested` giữ nghĩa "được yêu cầu lúc chốt" và bằng 0 cho chúng. Một lần gửi là một bản ghi bất biến riêng (`revision_sends`): To, Cc, tiêu đề, nội dung và hai công tắc dòng PDF được chọn cho lần gửi đó, mặc định lấy từ Settings hiện tại (F-4, F-3 b). Send job dựng thư chỉ từ bản ghi đó.
- Biến thể PDF (F-3 b): dòng giờ và dòng OT (kèm tổng OT) được in hoặc bỏ theo từng lần gửi. Mỗi biến thể là một góc nhìn tất định, một trang, của cùng snapshot đã ký, render một lần và được giữ. "PDF đã ký" giờ nghĩa là bất kỳ bản render nào của revision đã ký; mọi biến thể có cùng ngày, tổng, chữ ký và ngày ký. Biến thể lúc sign-off (có dòng giờ, dòng OT theo snapshot) là bản người được chia sẻ tải về trước mọi lần gửi. Settings có thêm mặc định "Dòng giờ trên PDF" (`show_time_on_pdf`, bật).
- Hạn và lời nhắc (F-2 a): một kỳ được tính là đã nộp khi bất kỳ revision nào của nó có một lần gửi. Lời nhắc trước hạn tiếp tục tới lúc đó, với lời "đã ký, chưa gửi" khi đã ký. Đến hạn mà bật tự nộp thì nháp được chốt tự động và gửi, còn revision đã ký nhưng chưa từng gửi được gửi đúng như đã ký (audit `deadline.send_signed`, không revision mới, không đổi sổ); tắt thì ghi quá hạn và cảnh báo. Kỳ đã có lần gửi không bao giờ được quét hạn gửi, nên bản sửa hay review muộn sau đó chỉ do chủ gửi.
- Quy tắc lý do của chủ (F-4, kế hoạch B-A2). Một bản được tính là đã gửi khi bất kỳ lượt nào của bất kỳ revision nào của kỳ đã `accepted` hoặc `uncertain`; một lần gửi mà mọi lượt đều thất bại vĩnh viễn thì không được tính. Khi đã có bản được tính, lần gửi khác, và quyết định "gửi lại" cho một lượt không chắc chắn, cần lý do 2-500 ký tự (đã cắt khoảng trắng, NFC, không ký tự điều khiển trừ xuống dòng), nếu không là 422 `reason_required`. Lý do được lưu trên lần gửi và trong sự kiện audit của nó và không bao giờ được thêm vào email. Việc kiểm tra chạy trong transaction gửi. Việc lý do không vào email, lần gửi đầu thất bại không cần lý do, và gửi lại lượt không chắc chắn cần lý do là các mặc định có thể đảo ngược của người lập kế hoạch (kế hoạch Addendum 1, E sửa đổi).
- Dữ liệu: migration 0015 dựng lại `revision_files` với `variant` (dòng có sẵn là `t1o1`, hoặc `t1o0` khi snapshot ẩn dòng OT), thêm `revision_sends` với bản ghi backfill cho mọi send job đã có (để revision đã gửi trước khi nâng cấp được tính là đã gửi), và thêm `submission_settings.show_time_on_pdf`.
- Quy tắc được viết lại theo quy tắc AGENTS 8, kèm bản dịch: FR-11 trong tài liệu 01 (sign-off tay không còn cần ảnh, F-5 b, phần còn lại từ WP5-UX5-T01a; các dòng được chọn theo lần gửi), tài liệu 03 (bản ghi, tính nguyên tử và ranh giới API), tài liệu 05 ("Luồng thủ công", "Đến hạn và phục hồi", "Nhắc và link review", "Gửi bền vững", "Sửa và gửi lại"), và AC-06, AC-07, AC-10 và AC-14 trong tài liệu 06. Tài liệu 04 và gói pilot theo sau trong WP5-UX5-T06.
