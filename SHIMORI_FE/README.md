# SHIMORI — Custom Jewelry, Designed by You

> *Craft a piece as unique as your journey.*

---

## Giới thiệu

**SHIMORI** là nền tảng thiết kế trang sức trực tuyến thế hệ mới — nơi bạn không chỉ mua trang sức, mà còn **tự tay tạo ra nó**.

Với studio 3D tương tác theo thời gian thực, khách hàng có thể tùy chỉnh từng chi tiết: chất liệu kim loại quý, đá quý, bề mặt, kích thước nhẫn — và xem trực tiếp tác phẩm của mình trước khi đặt hàng. Không cần biết thiết kế, không cần ra tiệm. Chỉ cần trí tưởng tượng.

---

## Tính năng nổi bật

### 3D Design Studio
- Xem trang sức dạng mô hình 3D chất lượng cao, xoay 360°
- Tùy chỉnh **chất liệu kim loại**: Vàng 18K, Bạch Kim, Bạc 925, Rose Gold
- Lựa chọn **đá quý**: Kim cương, Ngọc lục bảo, Hồng ngọc, Sapphire
- Điều chỉnh **bề mặt**: Bóng gương, Mờ satin, Chải xước
- Chọn **kích thước nhẫn** theo tiêu chuẩn quốc tế
- Xem **giá thời gian thực** theo thị trường bạc/vàng hiện hành

### Trải nghiệm người dùng
- Giao diện tối giản, sang trọng — lấy cảm hứng từ các nhà mốt cao cấp
- Responsive hoàn toàn trên mọi thiết bị
- Hiệu ứng animation mượt mà, chuyên nghiệp
- Bộ sưu tập Featured Collection được chọn lọc kỹ càng

---

## Quy trình 4 bước

```
Select  →  Customize  →  Preview  →  Order
```

1. **Select** — Chọn kim loại nền và loại đá quý
2. **Customize** — Điều chỉnh thiết kế trong studio 3D
3. **Preview** — Xem tác phẩm ở độ phân giải siêu nét
4. **Order** — Thợ kim hoàn thủ công hoàn thiện và giao tận tay

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18 + Vite |
| 3D Rendering | Three.js / React Three Fiber |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| Data | JSON Server (mock API) |

---

## Chạy dự án

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Chạy mock API (db.json)
npx json-server --watch db.json --port 3001
```

Mở trình duyệt tại `http://localhost:5173`

---

## Cấu trúc thư mục

```
src/
├── assets/models/      # GLB models (gems, settings, bands)
├── components/         # Navbar, JewelryViewer, ...
├── data/               # products.js, static data
├── pages/              # Home, DesignStudio, Login, ProductDetail
└── index.css           # Global styles
```

---

## Nhóm phát triển

Dự án được phát triển trong khuôn khổ **Project III** — môn học Kỹ thuật phần mềm.

---

*SHIMORI — Where Every Detail Tells Your Story.*
