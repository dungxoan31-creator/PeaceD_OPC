# Hạ Tầng Điện Toán Đám Mây & Chuyển Tiếp Dữ Liệu — PeaceD OPC Cloud Infrastructure

## Phân Hệ Chuyển Tiếp Điều Khiển Di Động (PeaceD OPC Relay Network)

Phân hệ mạng chuyển tiếp (Relay Architecture) cho phép ứng dụng đồng hành trên di động (PeaceD OPC Mobile) giao tiếp an toàn với ứng dụng PeaceD OPC trên máy trạm (Desktop Host) mà không cần cấu hình mở cổng mạng (Port Forwarding) hoặc Dynamic DNS.

### Cơ Chế Hoạt Động Cốt Lõi:
1. **Thiết lập kết nối hai chiều bảo mật**: Cả máy trạm máy tính và điện thoại đều chủ động khởi tạo kết nối WebSocket ra ngoài (Outbound WebSocket) tới cụm chuyển tiếp (Relay Cluster).
2. **Ghép đôi phiên (Session Pairing) & Mã hóa E2EE**: Cụm chuyển tiếp xác thực danh tính bằng khóa mật mã X25519, ghép đôi phiên làm việc và ghép luồng dữ liệu (Frame Splicing) giữa hai đầu mút với tính toàn vẹn cao nhất.
3. **Điều phối tài nguyên (Director & Cells)**: Thành phần Director thực hiện phân bổ tải và phân luồng kết nối tới các Cell thực thi, đảm bảo độ trễ thấp và khả năng chịu lỗi cao.

---

## Cấu Trúc Các Gói Module (Packages)

- `packages/relay-contract`: Giao thức truyền thông chung giữa máy trạm, máy chủ chuyển tiếp và thiết bị di động (định dạng Frame, mã đóng kết nối, định mức tải, máy trạng thái ghép luồng).
- `apps/relay`: Máy chủ chuyển tiếp hiệu năng cao đảm nhiệm vai trò Director hoặc Cell.
- `apps/relay-ops`: Bảng điều khiển quản trị vận hành và giám sát sự cố hạ tầng chuyển tiếp.
- `apps/push` & `packages/push-contract`: Cổng thông báo đẩy di động hỗ trợ gửi thông báo tức thời qua APNs (iOS) và FCM (Android) khi Agent hoàn thành tác vụ.

---
**Tác giả & Nhà phát triển đề án**: **Nguyễn Hữu Dũng** (MSV: 11235559) — Chuyên ngành Hệ Thống Thông Tin Quản Lý (MIS).
