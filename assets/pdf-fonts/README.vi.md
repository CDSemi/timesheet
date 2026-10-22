# Font cho PDF

File font duy nhất được commit của dự án, chỉ dùng cho bộ dựng PDF phiếu chấm công (ADR 0001,
`docs/adr/0001-pdf-handwriting-font.md`). Bản tiếng Anh là bản chuẩn.

| Mục | Giá trị |
|---|---|
| File | `IndieFlower-Regular.ttf` |
| Họ font và phiên bản | Indie Flower, Version 2.000 |
| Kích thước | 108,196 byte |
| SHA-256 | `ccc94b22b156e9c5dfe50fd051f01b097600b252c24473e624bb43a143140a94` |
| Nguồn | `https://github.com/google/fonts/tree/main/ofl/indieflower` (`IndieFlower-Regular.ttf`) |
| Giấy phép | SIL Open Font License 1.1, không có Reserved Font Name; `OFL.txt` nguyên bản của thư mục nguồn nằm cạnh font |
| Bản quyền | 2010 The Indie Flower Authors (kimberlygeswein.com) |

OFL.txt is the upstream licence text with trailing whitespace removed.

## Cách dùng

- Chỉ `src/server/pdf/fonts.ts` đọc file này, và bộ dựng PDF nhúng một tập con của nó cho ô loại ngày của từng ngày. Bộ dựng
  từ chối file có SHA-256 khác giá trị ở trên.
- Font không được phục vụ qua HTTP và không dùng trong giao diện người dùng (giao diện chỉ dùng font hệ thống).
- Loại ngày có ký tự font không có sẽ được vẽ bằng DejaVu Serif Italic cho ô đó.
- Image container chép thư mục này vào `/app/assets/pdf-fonts`.

## Thay đổi

Đổi phiên bản font hoặc thêm file font thứ hai là thay đổi có chủ đích, cần một bản ghi quyết định mới: cập nhật đồng thời
hash trong `src/server/pdf/fonts.ts`, bảng này, ADR 0001 và `tests/client/wordmarkAsset.test.ts`.
