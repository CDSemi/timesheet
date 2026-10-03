# Quyết định và nguồn

Yêu cầu rõ mới nhất của người dùng ưu tiên hơn đề xuất đã trích và công thức workbook. Tiếng Anh là nguồn chuẩn. Tài liệu 02 phụ trách phép tính, 03 bất biến dữ liệu, 05 nộp, 09 thứ tự. Sửa mâu thuẫn thật rõ ràng ở cả hai ngôn ngữ.

## Yêu cầu đã chốt

Tám giờ/ngày; chỉnh giờ vào/ra và N/M; vào linh hoạt; ví dụ đúng giữa xuống 75→60 và 76→90; tính ngày không bù tuần/kỳ; mọi giờ ngoài lịch đủ điều kiện OT; nghỉ không làm không trừ. Thiếu giờ tùy chọn, manager cho dùng OT đổi nghỉ, UTC/hiển thị múi giờ hiện tại, qua đêm, lý do sửa cũ và audit tự động. Sign-off cùng tự nộp chưa ký cấu hình được, setting email/template/thông báo/ảnh, dữ liệu riêng và manager tương lai. Docker Synology; PDF Excel quen thuộc. Docs song ngữ, prompt theo giai đoạn, ưu tiên subscription.

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
| D-09 | Bật tùy chọn tự nộp sau setup; dry-run tới kích hoạt; ảnh tự động tắt; không sign-off giả. |
| D-10 | Email trước, ntfy tùy chọn, hoãn SMS; link review có login đủ ban đầu. |
| D-11 | Phiên bản lễ công ty hằng năm rõ; nghỉ cá nhân tách phân loại lịch. |
| D-12 | Hiện tại = payroll sớm nhất bằng/sau hôm nay theo múi giờ báo cáo; ưu tiên kỳ cũ chưa xử lý không làm nó thành hiện tại. |
| D-13 | UI đầu tiếng Anh được; docs song ngữ bắt buộc; portal manager sau. |
| D-14 | Đã xác nhận Max 20x; giữ kế hoạch công việc có phạm vi, dự kiến không dùng reserve/API phí. Khối lượng không là lời hứa quota. |

## Cập nhật bằng chứng tài khoản

Ngày 30/09/2026, người dùng cung cấp ảnh gói Max ghi usage gấp 20 lần Pro. Ảnh xác lập cấp gói Claude, không xác lập allowance còn lại hay settings usage trả thêm. Không sao chép thông tin thanh toán.

## Bằng chứng workbook

[Mẫu đã làm sạch](../reference/inputs/Timesheet_Rev8_2026.xlsx) hỗ trợ mẫu 14 ngày, payroll thứ Sáu/hạn thứ Ba. Không xác lập quy tắc lương pháp lý, ngày ký cũ thật, email đã gửi hoặc số dư OT đầu. [Ghi chú nguồn](../reference/inputs/README.vi.md) ghi những gì đã xóa, hash và lỗi công thức. Ngày 2026-09-30 chủ dự án xóa toàn bộ dữ liệu cá nhân (các sheet chấm công theo ngày, tên, chữ ký và metadata) và công khai mẫu này; không giữ bản gốc cá nhân.

Thay công thức/khoản trừ 8,5 giờ, cách nói tự ký, giả định scheduler chỉ trong RAM và shortcut backup chỉ file đang chạy của đề xuất trước. Không giả định SMTP thường gửi đúng một lần.

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

- E-1: tại Clock out, danh sách nghỉ hiện có là tập đầy đủ và thay các dòng đã lưu; bỏ trống thì giữ dòng đã lưu (chỉ ngày chưa xác nhận).
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

## Quyết định của coordinator — phát hiện đổi lịch của WP2-T08 (2026-10-03, đảo ngược được; chủ có thể phủ quyết)

- Đổi lịch qua `PATCH /api/admin/users/:id` bị từ chối bằng 409 `calendar_in_use` khi user có bất kỳ timesheet, ngày, phiên làm việc, dòng sổ cái hay yêu cầu nghỉ nào. Lần sửa bị từ chối không ghi gì (PATCH gộp không áp dụng trường nào) và không tạo audit event. Chỉ đổi lịch được cho tài khoản chưa có dữ liệu đó. Sửa tên hiển thị và vai trò không bị ảnh hưởng.
- Lý do: probe WP2-T08 cho thấy gán lại lịch cho user đã có dữ liệu làm kỳ nháp bị nhóm lại, nhãn mặc định đổi và tính lại, timesheet đã lưu bị mồ côi, timesheet đã chốt bị che và cho phép tạo timesheet chồng kỳ, trong khi ngày của phiên đã lưu không đổi (AGENTS quy tắc 7, R-07). Không văn bản chuẩn nào yêu cầu đổi lịch của user đã có dữ liệu hay áp dụng đổi lịch cho kỳ đã có.
- Lựa chọn cho chủ (ngoài WP2): gán lại lịch có hiệu lực từ ngày trong tương lai cần schema và thiết kế tra cứu kỳ riêng.
- Nguồn: phát hiện chỉ-báo-cáo của WP2-T08, task WP2-CALFIX.
