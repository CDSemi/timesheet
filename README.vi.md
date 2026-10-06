# Timesheet Web — bộ tài liệu triển khai

Bản tài liệu gốc: **2026-09-30-r1.1**. Trạng thái repo: **WP1, WP2 và WP3 đã được chấp nhận độc lập; WP4 đã triển khai (T01–T12 và tác vụ tài liệu T13), đang chờ gate cuối gói WP4-GATE và các audit độc lập; chưa được chấp nhận**.

File `.md` tiếng Anh là nguồn chuẩn. Mỗi `.vi.md` là bản dịch của file tiếng Anh tương ứng. Khóa JSON và enum giữ tiếng Anh. Các manifest trong `handoff/delivery/` là snapshot lịch sử của gói docs r1.1, không chứng nhận repo hiện tại; xem [VALIDATION](handoff/delivery/VALIDATION.vi.md).

## Bắt đầu

1. Đọc [NEXT_ACTION](handoff/NEXT_ACTION.vi.md).
2. Đọc [yêu cầu](docs/01_PRODUCT_REQUIREMENTS.vi.md), [quy tắc giờ/OT](docs/02_TIME_AND_OT_RULES.vi.md) và [lộ trình](docs/09_IMPLEMENTATION_ROADMAP.vi.md).
3. Đọc [DEVELOPMENT](DEVELOPMENT.vi.md), [bàn giao WP1](handoff/delivery/WP1_HANDOFF.vi.md), [bàn giao WP2](handoff/delivery/WP2_HANDOFF.vi.md) [bàn giao WP3](handoff/delivery/WP3_HANDOFF.vi.md) và [bàn giao WP4](handoff/delivery/WP4_HANDOFF.vi.md); các tài liệu này mô tả source đầy đủ trong repo và cách kiểm chứng. Để cài đặt và vận hành ứng dụng trên NAS, đọc [sổ tay vận hành](docs/11_OPERATIONS_RUNBOOK.vi.md).
4. WP1 đã được chấp nhận sau lần kiểm lại F-01 ([review WP1](handoff/delivery/WP1_REVIEW.vi.md), [kiểm lại](handoff/delivery/WP1_RECHECK.vi.md)). WP2 và WP3 đã được chấp nhận sau gate và các audit độc lập (xem các bàn giao của chúng). Bước tiếp theo là gate cuối gói WP4 và các audit độc lập mới; không bắt đầu WP5 trước khi các bước đó đạt.

Giao Claude prompt đầu vào duy nhất trong NEXT_ACTION; coordinator resume [task đã lưu](handoff/delivery/ORCHESTRATION.json), chỉ tiến sau gate độc lập. Profile ở `.claude/agents/`, coordinator mặc định ở `.claude/settings.json`.

Mỗi prompt chỉ rõ phạm vi đọc. Không dán toàn bộ tài liệu vào mọi phiên. Dùng [RESUME](handoff/prompts/RESUME.vi.md) sau gián đoạn.

## Hướng đã chọn

- Node.js LTS + TypeScript + Hono + React/Vite + SQLite, đã có trong WP1; một container ứng dụng Docker là đích triển khai. WP3 đã thêm sign-off, chốt revision, PDF, các adapter mail capture/SMTP, bộ chạy job, tự động nộp theo hạn, nhắc hạn, chia sẻ do chủ sở hữu cấp và màn hình tình trạng cho admin. WP4 đã thêm image không root đã ghim kèm ví dụ Compose, kiểm tra sẵn sàng và xử lý proxy tin cậy, bootstrap production một lần, backup trực tuyến nhất quán kèm prune, restore cô lập với tạm dừng gửi ra ngoài và đối soát, restore rollback, nhập workbook chỉ dành cho chủ sở hữu với xem trước và commit idempotent, số dư OT mở đầu tường minh, và drill vận hành; bản thân đích NAS chưa được kiểm chứng.
- Tám giờ thực làm/ngày, giờ vào linh hoạt, nghỉ cấu hình được, quy tắc OT N/M theo ngày.
- Mọi giờ làm ngoài lịch ngày làm bình thường đủ điều kiện OT, không trừ tám giờ hay áp dụng N ngày thường; vẫn làm tròn theo M.
- Tách sign-off của nhân viên, tự nộp, ảnh chữ ký, dịch vụ chấp nhận email và sự cho phép của manager.
- Năm giai đoạn dưới một nhiệm vụ coordinator có thể resume. Subagent plan/implement/sửa/kiểm chứng/audit; vai trò nhà cung cấp là tùy chọn. Huy cung cấp setup và cho phép pilot thật.
- Ưu tiên usage trong gói; **dự kiến không dùng** 2.500 credits dự trữ.

## Bản đồ tài liệu

| Thư mục | Phụ trách |
|---|---|
| `docs/` | Tài liệu đặc tả 01–10 và sổ tay vận hành 11 (bảng dưới); `docs/agents/` cấu hình skill cho agent |
| `src/`, `tests/`, `scripts/` | Source ứng dụng, test tự động và script phát triển; xem [DEVELOPMENT](DEVELOPMENT.vi.md) |
| `handoff/` | Quy trình làm việc giữa các agent: [NEXT_ACTION](handoff/NEXT_ACTION.vi.md) (trạng thái và bước tiếp theo), `prompts/` (hướng dẫn triển khai/review/sửa/tiếp tục), `templates/` (mẫu bàn giao/review/checkpoint) và `delivery/` (trạng thái, bàn giao, review, bằng chứng và kiểm tra gói tài liệu) |
| `reference/` | Dữ liệu tham chiếu: [fixture](reference/fixtures/README.vi.md) (91 tình huống tham chiếu mà test đọc), [ví dụ](reference/examples/README.vi.md) (cấu hình mẫu an toàn mà seed giả đọc) và [inputs](reference/inputs/README.vi.md) (workbook mẫu đã làm sạch) |
| `.agents/`, `.claude/` | Skill ghim bằng `skills-lock.json`; điều phối dự án ở `.claude/agents/` và `.claude/settings.json` |

| File | Phụ trách |
|---|---|
| [01 Sản phẩm](docs/01_PRODUCT_REQUIREMENTS.vi.md) | Phạm vi và yêu cầu |
| [02 Giờ và OT](docs/02_TIME_AND_OT_RULES.vi.md) | Quy tắc tính và ghi sổ chuẩn |
| [03 Kiến trúc](docs/03_ARCHITECTURE_AND_DATA.vi.md) | Thành phần, dữ liệu, bất biến |
| [04 UX](docs/04_UX_AND_SETTINGS.vi.md) | Màn hình, settings, mặc định |
| [05 Nộp](docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md) | Sign-off, PDF, email, nhắc hạn/phục hồi |
| [06 Nghiệm thu](docs/06_TEST_AND_ACCEPTANCE.vi.md) | Kiểm tra bắt buộc |
| [07 Vận hành](docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md) | Docker, nhập, backup và restore |
| [08 Phối hợp AI](docs/08_AI_WORKFLOW_AND_BUDGET.vi.md) | Phân công model/effort và ước lượng usage |
| [09 Lộ trình](docs/09_IMPLEMENTATION_ROADMAP.vi.md) | Năm giai đoạn và gate |
| [10 Quyết định](docs/10_DECISIONS_AND_SOURCES.vi.md) | Mặc định, nguồn gốc, nguồn chính thức |
| [11 Sổ tay vận hành](docs/11_OPERATIONS_RUNBOOK.vi.md) | Cài đặt trên NAS, bootstrap, backup, restore, đối soát, nâng cấp, rollback |

[Excel mẫu](reference/inputs/Timesheet_Rev8_2026.xlsx) là mẫu công khai: gồm biểu mẫu, sheet thông tin làm việc và ngày lễ của workbook gốc, đã xóa toàn bộ dữ liệu cá nhân (các sheet chấm công theo ngày, tên nhân viên, ảnh chữ ký, metadata tác giả và đường dẫn máy). Không giữ bản gốc cá nhân. Không đưa workbook vào image production; dùng dữ liệu giả để demo.

WP1, WP2 và WP3 đã được chấp nhận; source WP4 đã có cùng bằng chứng kiểm tra của bên triển khai và của từng tác vụ (WP4 chưa qua gate và audit độc lập); xem DEVELOPMENT và các bàn giao. Chưa triển khai production hay gửi email thật: mail đi ra chỉ là capture cho đến khi chủ sở hữu cho phép pilot, và cờ gửi production không bao giờ được đặt khi phát triển. Docs song ngữ không bắt buộc UI bản đầu song ngữ. Thông tin model được kiểm lại ngày 30/09/2026; khả dụng và usage thực tế cần xem trong client.

Bản dịch của [README.md](README.md); tiếng Anh là nguồn chuẩn.
