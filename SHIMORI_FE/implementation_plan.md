# Kế Hoạch Triển Khai - Mở Rộng Tính Năng SHIMORI 3D Customizer

Tài liệu này phác thảo các tính năng nâng cao sẽ được triển khai cho ứng dụng **SHIMORI 3D Jewelry Customizer** nhằm tạo nên một trải nghiệm thương mại điện tử trang sức xa xỉ, đầy đủ và tối ưu nhất.

---

## 1. Nâng Cấp Chất Liệu Đá Quý 3D & Khúc Xạ Thực Tế (Optics Upgrade)
- **Vấn đề hiện tại**: Đá quý (`diamond.glb`) hiện tại sử dụng chất liệu mặc định của file GLB, không đổi màu sắc hoặc có các tính chất quang học chân thực của từng loại đá khác nhau.
- **Giải pháp**:
  - Khai báo cấu hình `GEM_OPTICS_CONFIG` chứa các thông số vật lý của từng loại đá quý:
    - **Diamond**: Không màu, Chiết suất (IOR) = 2.417, Độ truyền sáng (Transmission) = 1.0, Roughness = 0.0, Metalness = 0.0.
    - **Sapphire**: Xanh dương đậm, IOR = 1.76, Transmission = 0.9, Roughness = 0.05.
    - **Ruby**: Đỏ sẫm, IOR = 1.76, Transmission = 0.9, Roughness = 0.05.
    - **Emerald**: Xanh lục bảo, IOR = 1.57, Transmission = 0.85, Roughness = 0.1.
    - **Amethyst**: Tím thạch anh, IOR = 1.54, Transmission = 0.9, Roughness = 0.05.
    - **Topaz**: Xanh cyan/lam sáng, IOR = 1.62, Transmission = 0.92, Roughness = 0.05.
  - Sử dụng `THREE.MeshPhysicalMaterial` để tạo các chất liệu trong suốt, khúc xạ ánh sáng thực tế trong React Three Fiber.
- **Thanh trượt kích cỡ Gemstone (Carat Slider)**:
  - Cho phép điều chỉnh Carat từ `0.5ct` đến `5.0ct`.
  - Tự động thay đổi tỷ lệ scale của Mesh đá quý trong không gian 3D.
  - Nhân giá đá quý theo hệ số Carat trong công thức tính tiền trực tiếp.

---

## 2. Tính Năng Cá Nhân Hóa Khắc Chữ (Band Engraving)
- **Giải pháp**:
  - Thêm khu vực nhập liệu **Step 06: Personal Engraving** trong sidebar của Customizer.
  - Người dùng có thể nhập tối đa 30 ký tự mong muốn khắc lên nhẫn.
  - Hỗ trợ lựa chọn 3 loại Font chữ nghệ thuật: *Elegant Script*, *Classic Serif*, *Modern Sans*.
  - Cộng thêm chi phí chế tác chữ khắc là **+$150** vào hóa đơn.
  - Hiển thị mô phỏng văn bản khắc cực kỳ tinh tế trong bảng tóm tắt cấu hình nhẫn.

---

## 3. Lựa Chọn Môi Trường Ánh Sáng (Studio Lighting Environments)
- **Giải pháp**:
  - Thêm tùy chọn **Step 07: Studio Lighting** trong sidebar để thay đổi môi trường ánh sáng chiếu vào nhẫn.
  - Cung cấp 4 môi trường ánh sáng từ thư viện `@react-three/drei`:
    - `studio` (Mặc định - Phòng studio chuyên nghiệp, phản chiếu sắc nét)
    - `sunset` (Ấm áp, phản chiếu ánh hoàng hôn vàng cam)
    - `warehouse` (Ánh sáng công nghiệp chân thực)
    - `dawn` (Dịu nhẹ, thanh lịch)
  - Thay đổi thuộc tính `preset` của `<Environment>` trong Canvas Three.js theo lựa chọn của người dùng trong thời gian thực.

---

## 4. Lưu Bộ Sưu Tập Cá Nhân & Chia Sẻ Qua URL (Collections & Sharing)
- **Bộ sưu tập cá nhân (Local Gallery)**:
  - Nút **"Save to Collection"** giúp lưu trạng thái nhẫn hiện tại (Setting, Material, Gemstone, Width, Carat, Engraving, Price) vào `localStorage`.
  - Tạo một Panel/Modal **"My Saved Designs"** để xem danh sách các nhẫn đã lưu, cho phép xóa hoặc bấm **"Load Design"** để khôi phục cấu hình đó vào Studio 3D ngay lập tức.
- **Chia sẻ cấu hình qua URL (URL Sharing)**:
  - Nút **"Share Design"** giúp tạo một liên kết chứa các Query Parameters đại diện cho cấu hình nhẫn (Ví dụ: `?setting=1&material=Bạc&gemstone=Sapphire&width=3.5&carat=3.2&engraving=Love`).
  - Tự động sao chép liên kết vào clipboard và hiển thị thông báo đẹp mắt.
  - Khi người dùng khác truy cập link này, Studio sẽ tự động đọc tham số URL trên để thiết lập cấu hình ban đầu.

---

## 5. Cửa Sổ Giỏ Hàng & Thanh Toán Sang Trọng (Cart & Checkout Drawer)
- **Giỏ Hàng Đa Trang (LocalStorage Cart)**:
  - Đồng bộ số lượng sản phẩm trong giỏ hàng hiển thị trên Navbar.
  - Bấm vào biểu tượng Shopping Bag ở Navbar hoặc nút **"Proceed to Purchase"** / **"Add to Bag"** sẽ mở Drawer giỏ hàng từ cạnh phải màn hình.
- **Luxury Checkout Drawer**:
  - **Màn hình Giỏ hàng**: Hiển thị danh sách sản phẩm cùng chi tiết cấu hình nhẫn tự thiết kế một cách chi tiết và sang trọng.
  - **Màn hình Nhập thông tin (Checkout)**: Trượt mượt mà sang form nhập thông tin thẻ, địa chỉ nhận hàng, phương thức vận chuyển.
  - **Màn hình Thành công (Order Confirmed)**: Màn hình hiển thị thông tin hóa đơn đẹp mắt, mã đơn hàng ngẫu nhiên cực kỳ chuyên nghiệp.

---

## Kế hoạch kiểm thử & Xác minh (Verification Plan)
1. **Kiểm tra đồ họa 3D**: Chuyển đổi qua lại giữa các loại đá quý, kiểm tra xem màu sắc và độ truyền sáng của đá có đổi theo đúng mô phỏng vật lý không.
2. **Kiểm tra Carat**: Di chuyển thanh trượt Carat và xác nhận đá quý to/nhỏ dần, giá nhẫn cập nhật tương ứng.
3. **Kiểm tra URL Query**: Truy cập `/design?gemstone=Sapphire&carat=4.0&engraving=Forever` xem các lựa chọn có được tự động điền sẵn không.
4. **Kiểm tra Giỏ hàng & Thanh toán**: Thêm nhẫn tự thiết kế vào giỏ hàng, mở Drawer, hoàn tất thanh toán giả lập và kiểm tra xem màn hình thành công hiển thị chính xác không.
