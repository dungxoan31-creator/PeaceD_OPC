# @peaced-opc/docs

Cổng tài liệu kỹ thuật và hướng dẫn sử dụng chính thức cho hệ sinh thái **PeaceD OPC**.

Dự án được xây dựng dưới dạng ứng dụng Next.js độc lập để hiển thị tài liệu hướng dẫn (`/docs`).

## Phát triển cục bộ (Local Development)

```bash
cd docs/site
pnpm --ignore-workspace install
pnpm --ignore-workspace dev
```

Truy cập: [http://localhost:3004/docs](http://localhost:3004/docs).

## Đóng gói sản phẩm (Production Build)

```bash
cd docs/site
pnpm --ignore-workspace install
pnpm --ignore-workspace build
pnpm --ignore-workspace start
```

---
**Chủ nhiệm đề án**: **Nguyễn Hữu Dũng** (MSV: 11235559) — Đề án Chuyên ngành Hệ Thống Thông Tin Quản Lý (MIS).
