# Timesheet Web — bộ tài liệu triển khai

Bản tài liệu gốc: **2026-09-30-r1.1**. Trạng thái repo: **WP1 đã review độc lập — FIX REQUIRED; F-01 chưa sửa; WP2 chưa bắt đầu**.

File `.md` tiếng Anh là nguồn chuẩn. Mỗi `.vi.md` là bản dịch của file tiếng Anh tương ứng. Khóa JSON và enum giữ tiếng Anh. Các manifest trong `handoff/delivery/` là snapshot lịch sử của gói docs r1.1, không chứng nhận repo hiện tại; xem [VALIDATION](handoff/delivery/VALIDATION.vi.md).

## Bắt đầu

1. Đọc [NEXT_ACTION](handoff/NEXT_ACTION.vi.md).
2. Đọc [yêu cầu](docs/01_PRODUCT_REQUIREMENTS.vi.md), [quy tắc giờ/OT](docs/02_TIME_AND_OT_RULES.vi.md) và [lộ trình](docs/09_IMPLEMENTATION_ROADMAP.vi.md).
3. Đọc [DEVELOPMENT](DEVELOPMENT.vi.md) và [bàn giao WP1](handoff/delivery/WP1_HANDOFF.vi.md); hai tài liệu này mô tả source đầy đủ trong repo và cách kiểm chứng.
4. Đọc [review độc lập WP1](handoff/delivery/WP1_REVIEW.vi.md). Bước tiếp theo là sửa có giới hạn F-01 theo [FIX_FINDINGS](handoff/prompts/FIX_FINDINGS.vi.md), rồi review độc lập lại WP1. Không làm lại triển khai WP1 hay bắt đầu WP2 trước khi lần kiểm lại đạt.

Mỗi prompt chỉ rõ phạm vi đọc. Không dán toàn bộ tài liệu vào mọi phiên. Dùng [RESUME](handoff/prompts/RESUME.vi.md) sau gián đoạn.

## Hướng đã chọn

- Node.js LTS + TypeScript + Hono + React/Vite + SQLite, đã có trong WP1; một container ứng dụng Docker là đích WP4, chưa được bàn giao.
- Tám giờ thực làm/ngày, giờ vào linh hoạt, nghỉ cấu hình được, quy tắc OT N/M theo ngày.
- Mọi giờ làm ngoài lịch ngày làm bình thường đủ điều kiện OT, không trừ tám giờ hay áp dụng N ngày thường; vẫn làm tròn theo M.
- Tách sign-off của nhân viên, tự nộp, ảnh chữ ký, dịch vụ chấp nhận email và sự cho phép của manager.
- Năm giai đoạn. Claude triển khai; ChatGPT review độc lập; Huy cung cấp cấu hình triển khai và cho phép pilot thật.
- Ưu tiên usage trong gói; **dự kiến không dùng** 2.500 credits dự trữ.

## Bản đồ tài liệu

| Thư mục | Phụ trách |
|---|---|
| `docs/` | Tài liệu đặc tả 01–10 (bảng dưới); `docs/agents/` cấu hình skill cho agent |
| `src/`, `tests/`, `scripts/` | Source ứng dụng, test tự động và script phát triển; xem [DEVELOPMENT](DEVELOPMENT.vi.md) |
| `handoff/` | Quy trình làm việc giữa các agent: [NEXT_ACTION](handoff/NEXT_ACTION.vi.md) (trạng thái và bước tiếp theo), `prompts/` (hướng dẫn triển khai/review/sửa/tiếp tục), `templates/` (mẫu bàn giao/review/checkpoint) và `delivery/` (trạng thái, bàn giao, review, bằng chứng và kiểm tra gói tài liệu) |
| `reference/` | Dữ liệu tham chiếu: [fixture](reference/fixtures/README.vi.md) (91 tình huống tham chiếu mà test đọc), [ví dụ](reference/examples/README.vi.md) (cấu hình mẫu an toàn mà seed giả đọc) và [inputs](reference/inputs/README.vi.md) (workbook mẫu đã làm sạch) |
| `.agents/`, `.claude/` | Skill đã cài cho agent, khóa phiên bản bằng `skills-lock.json` |

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

[Excel mẫu](reference/inputs/Timesheet_Rev8_2026.xlsx) là mẫu công khai: gồm biểu mẫu, sheet thông tin làm việc và ngày lễ của workbook gốc, đã xóa toàn bộ dữ liệu cá nhân (các sheet chấm công theo ngày, tên nhân viên, ảnh chữ ký, metadata tác giả và đường dẫn máy). Không giữ bản gốc cá nhân. Không đưa workbook vào image production; dùng dữ liệu giả để demo.

Nền tảng WP1 đã có source và bằng chứng kiểm tra của bên triển khai; xem DEVELOPMENT và bàn giao. Chưa triển khai production hay gửi email thật. Docs song ngữ không bắt buộc UI bản đầu song ngữ. Thông tin model được kiểm lại ngày 30/09/2026; khả dụng và usage thực tế cần xem trong client.

Bản dịch của [README.md](README.md); tiếng Anh là nguồn chuẩn.
