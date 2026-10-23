# ADR 0002: manifest Ingat và image ứng dụng trên GHCR

Bản tiếng Anh là bản chuẩn. Trạng thái: đề xuất (nhánh phụ "Ingat deployability", mục T0 và T8; chưa có gì chạy trên GitHub hay trên máy đích).

## Bối cảnh

- Chủ dự án muốn Ingat, một công cụ dòng lệnh quản lý app Docker Compose trên một máy, cài, cập nhật, sao lưu, kiểm tra và
  khôi phục app. Ingat không bao giờ build image: CI của chính app build và đăng image (Ingat ADR-0026), còn app tự mô tả
  với Ingat bằng một manifest ở thư mục gốc kho (Ingat MANIFEST_SPEC).
- Đến nay kho này chưa có manifest, chưa có image trên registry và chưa có workflow CI. Docs/11 build image từ bản export sạch
  của commit release, và `compose.example.yaml` có `build: .`.
- Máy đích (NAS) chạy nhân Linux 4.4 và không có hạn mức CPU CFS. `compose.example.yaml` không đặt `cpus` hay giới hạn bộ
  nhớ, nên không gì trong manifest gửi `cpus` khác 0 xuống đó.
- Commit đi vào `main` và `git.release_declared` là false, nên chưa có tag release.

## Quyết định

- Thêm `ingat.toml` ở thư mục gốc kho (manifest schema 1, `requires_ingat = ">=0.1,<1"`, `release = "commit"`). File liệt
  kê `compose.example.yaml` giữ nguyên, các tham số, quy tắc môi trường, kho dữ liệu, probe ready và live, các mục install,
  backup, restore, rollback, drill và outbound-hold, cùng mười một task chạy lệnh `node dist/server/cli.js`. File không chứa
  giá trị của máy: cổng, URL, địa chỉ, đường dẫn và secret thuộc file instance riêng trên máy đích. Credential SMTP là
  secret trong env-file (app không hỗ trợ `*_FILE`); instance thử nghiệm đầu tiên chạy ở chế độ capture.
- Thêm `.github/workflows/ingat-validate.yml`: ở mỗi lần push lên `main` và mỗi pull request, chạy `ingat validate` bằng image
  Ingat công khai `ghcr.io/lisahq/ingat:0.1.0` được ghim theo digest
  (`sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`), chỉ đọc, không mạng, chỉ với
  `contents: read`.
- Thêm `.github/workflows/image.yml`: ở mỗi lần push lên `main`, build image cho `linux/amd64` và đăng
  `ghcr.io/cdsemi/timesheet:<SHA commit đầy đủ>` kèm nhãn OCI `org.opencontainers.image.version` (phiên bản trong
  `package.json`), `org.opencontainers.image.revision` (commit) và `org.opencontainers.image.source`. Tag đã tồn tại không
  bao giờ bị build lại hay dời. Attestation provenance và SBOM tắt, nên một tag trỏ tới đúng một image manifest thường. Job
  đọc lại image vừa đăng và thất bại nếu nền tảng, người dùng hoặc hai nhãn không khớp, rồi in
  `ghcr.io/cdsemi/timesheet@sha256:...`. Mọi action được ghim bằng SHA commit đầy đủ; `packages: write` chỉ do job publish
  yêu cầu.
- Dockerfile, `compose.example.yaml` và mọi file nguồn giữ nguyên. Đường build từ bản export của docs/11 vẫn dùng được.

## Sự thật cho chủ dự án

- `expect_labels` chỉ ràng buộc nhãn revision (`{commit}`). Với `release = "commit"`, `{release}` bằng commit, nên nhãn
  `version` kiểu semver chỉ mang tính thông tin và không thể ràng buộc.
- Ingat kéo `ghcr.io/cdsemi/timesheet:<commit>` theo tag, rồi ghim image đã kéo theo image ID và ghi lại repository digest.
  Ingat không kéo theo một digest viết sẵn trong manifest.
- Ingat 0.1.x không chạy được `log_snapshot`, prechecks, postchecks hoặc baseline khác rỗng ở bước deploy, hay tham số
  subnet để mặc cho cấp phát. Manifest bỏ các mục đó. `ingat validate` không phát hiện chúng, nên CI không bảo vệ được loại
  lỗi này; xem lại khi image Ingat được ghim đổi. `ingat validate` cũng kiểm chính sách Compose với giả định CPU CFS có sẵn,
  nên một `cpus` khác 0 thêm về sau vẫn qua CI dù máy đích từ chối nó; mọi giới hạn CPU phải giữ là tham số tùy chọn không
  gửi gì khi chưa đặt. File Compose có subnet cố định là một mục Ingat về sau, và đến lúc đó
  `TRUSTED_PROXY_ADDRESSES` được đặt sau lần cài đầu tiên.
- Manifest có `verify = []` vì app chưa có lệnh verify chỉ đọc; `min_free_memory` là ước đoán chưa đo.
- Spike S15 (Node.js trên nhân 4.4): image chạy Node.js v24.21.0 trên glibc (Debian 13). Dòng phát hành này liệt kê GNU/Linux
  x64 với glibc là Tier 1 từ nhân 4.18 (`BUILDING.md`, v24.x). Hỗ trợ chính thức cho nhân 4.4: không. Rủi ro thực tế:
  chưa kiểm chứng. Chưa chạy gì trên nhân 4.4. Runtime giữ nguyên cho đến khi chủ dự án quyết định, sau khi spike S15 của
  Ingat chạy image trên máy đích.
- Chưa có gì chạy trên GitHub hay trên máy đích: chưa có lần chạy workflow, chưa đăng image, chưa tạo hay công khai
  package, chưa chạy trên NAS và chưa có kết quả S15. Đó là các bước của chủ dự án (bật Actions, quyền workflow, chế độ hiển thị
  package và liên kết với kho) và spike của Ingat.

## Hệ quả

- Commit đầu mút của mỗi lần push lên `main` thêm một phiên bản package GHCR; job dọn dẹp là quyết định về sau. Commit được
  push cùng các commit sau nó không có image, nên Ingat chỉ triển khai được commit từng là đầu mút của một lần push; trước
  bản phát hành đầu tiên, kho này push sau mỗi commit (docs/08).
- Lần push đầu tạo package ở chế độ riêng tư; công khai package, điều máy đích cần để kéo ẩn danh, không thể hoàn tác. Chủ dự án
  làm việc này sau khi đọc lần chạy đầu.
- Tag đã đăng không bị build lại, nên image lỗi được sửa bằng commit mới, không phải chạy lại.
- Nâng image Ingat được ghim là thay đổi có chủ đích của digest và chú thích của nó trong workflow; khóa manifest có thể đổi
  trước khi schema 1 được đóng băng.
- Có thể bật attestation sau chỉ bằng một cờ, khi đã chứng minh máy Engine 24 kéo được index sạch.

## Phương án đã xét

- **Build image trên máy đích:** bị loại; Ingat không bao giờ build image (Ingat ADR-0026).
- **Bật attestation:** bị loại lúc này; việc Engine đích kéo index có attestation manifest chưa được kiểm chứng và chưa có gì
  dùng chúng.
- **Job build cho pull request:** bị loại; cần `packages: write` và không thêm gì mà bản build cục bộ chưa chứng minh.
- **Chỉ đăng ở tag release:** hoãn; chưa có tag release. Xem lại với `release = "tag"` khi có.
- **Đổi base image runtime cho nhân 4.4:** không đề xuất; chủ dự án quyết định sau S15.
