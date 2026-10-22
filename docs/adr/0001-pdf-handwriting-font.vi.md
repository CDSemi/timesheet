# ADR 0001: font chữ viết tay cho ô loại ngày của PDF

Bản tiếng Anh là bản chuẩn. Trạng thái: đã chấp nhận (quyết định F-9 b của chủ dự án, 2026-10-21; WP5-UX5-T02 triển khai).

## Bối cảnh

- Workbook của chủ dự án in loại ngày (Worked, Off, Vacation, ...) bằng kiểu chữ viết tay. PDF phiếu chấm công thiết kế lại
  (docs/04 "Email and PDF", AC-10) tái hiện kiểu này; ngày 2026-10-21 chủ dự án trả lời F-9 b: dùng font viết tay nếu có thể
  commit và nhúng theo giấy phép cho phép, và đã duyệt Indie Flower.
- PDF được vẽ bằng pdf-lib và `@pdf-lib/fontkit` (docs/03). Trước đây font chỉ có DejaVu Sans và Sans Bold đọc từ gói npm
  `dejavu-fonts-ttf`; không có file font nhị phân nào được commit.
- Giao diện chỉ dùng font hệ thống, không có web font và không có `@font-face` (AGENTS.md mục "Frontend and UI/UX
  standards", chính sách bảo mật nội dung). Wordmark công ty được giao dưới dạng đường viền vector, không bao giờ là font
  (WP5-UX2-T06). `tests/client/wordmarkAsset.test.ts` bảo vệ cả hai và trước đây khẳng định không có file font nào được theo dõi.

## Quyết định

- Commit một file font, `assets/pdf-fonts/IndieFlower-Regular.ttf` (phiên bản 2.000, 108,196 byte, SHA-256
  `ccc94b22b156e9c5dfe50fd051f01b097600b252c24473e624bb43a143140a94`), cùng `OFL.txt` và một README ghi nguồn, phiên bản,
  kích thước, hash và giấy phép. Cả hai lấy từ kho Google Fonts chính thức, `github.com/google/fonts`, đường dẫn
  `ofl/indieflower/`: file font nguyên vẹn, còn `OFL.txt` là văn bản giấy phép gốc đã bỏ khoảng trắng cuối dòng.
- Giấy phép: SIL Open Font License 1.1, bản quyền "2010 The Indie Flower Authors (kimberlygeswein.com)", không có Reserved
  Font Name. OFL 1.1 cho phép đóng gói, nhúng vào tài liệu và phân phối cùng phần mềm; không được bán riêng font và văn bản
  giấy phép đi kèm file.
- Cách dùng: chỉ bộ dựng PDF (`src/server/pdf/fonts.ts`) đọc, nhúng một tập con và chỉ cho ô loại ngày của từng ngày. Font
  không được phục vụ qua HTTP và không dùng trong giao diện. Bộ dựng kiểm file với SHA-256 đã ghim trước khi dùng.
- Phương án thay: loại ngày có ký tự Indie Flower không có (font phủ Basic Latin, Latin-1 và tiếng Việt, không có Hy Lạp hay
  Cyrillic) được vẽ bằng DejaVu Serif Italic cho ô đó, không bao giờ thành "?".
- Mọi kiểu chữ còn lại vẫn từ gói DejaVu đã cài: Sans, Sans Bold, Serif Condensed Bold, Serif Italic.
- Image container chép `assets/pdf-fonts` vào stage runtime (và `.dockerignore` cho phép thư mục đó); container drill và smoke
  của server đã build dựng một PDF có nhúng tập con Indie Flower.
- Cổng kiểm: `tests/client/wordmarkAsset.test.ts` nay khẳng định đúng một file font được theo dõi, ở đúng đường dẫn đó, với
  đúng SHA-256 đó; các kiểm tra không có file font hay `@font-face` dưới `src/` được giữ.

## Hệ quả

- Thêm khoảng 108 KB vào kho và image; mỗi PDF lớn thêm bằng tập con font (khoảng 7 KB theo đo đạc).
- Byte PDF thay đổi (bố cục và font mới), nên PDF mẫu và hash của gói pilot được dựng lại (UX5-T06). Cùng đầu vào vẫn cho
  byte giống hệt.
- Phiên bản font mới là thay đổi có chủ đích: hash mới trong `fonts.ts`, README, ADR này và bài kiểm tra. File font thứ hai
  cần ADR mới và quyết định mới trong bài kiểm tra.
- OFL đi kèm font; README nêu giấy phép. Thông báo bên thứ ba đầy đủ mà không cần thêm văn bản.

## Phương án đã xét

- **DejaVu Serif Italic cho loại ngày** (không file mới, không giấy phép): bị loại làm mặc định vì chủ dự án yêu cầu kiểu chữ
  viết tay (F-9 b); giữ làm phương án thay theo từng ô.
- **Patrick Hand 1.003** (OFL 1.1, 214,772 byte, chỉ thiếu ký hiệu micro): gấp đôi kích thước, kiểu viết tay kém hơn.
- **Caveat và Kalam** (OFL 1.1): file biến thiên hoặc nhiều độ đậm và không có tập con tiếng Việt.
- **Gói font npm** (thêm dependency, WOFF2 chia theo dải Unicode): bị loại, không thêm dependency khi chưa có nhu cầu cụ thể
  (AGENTS.md Prime Directive).
