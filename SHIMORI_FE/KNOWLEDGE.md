# SHIMORI — Project Knowledge Base

## Stack

- React 19 + Vite + Tailwind CSS 4
- `@google/model-viewer` ^4.2.0 — render GLB trong browser
- `react-router-dom` v7 — routing
- `import.meta.glob` với `{ eager: true, query: '?url', import: 'default' }` để load URL của GLB từ `src/assets/models/`

## Cấu trúc model

```
src/assets/models/
  settings/    ← các model nhẫn chính (GLB), được load vào DesignStudio
  bands/
  gems/
  materials/
  presets/
public/models/
  bands/diamond_ring_3d_print_ready.glb  ← 1.8MB, dùng cho trang chủ
```

Loader tập trung tại `src/models/index.js` — export `modelGroups` và `hasModels`.

---

## Pipeline tối ưu GLB nặng

### Công cụ: gltf-transform (không cần cài, chạy qua npx)

```bash
npx @gltf-transform/cli optimize <input.glb> <output.glb> --compress false
```

**Tại sao `--compress false`:**
`--compress meshopt` (default) tạo file rất nhỏ (~470KB) nhưng model-viewer cần fetch WASM decoder từ CDN lúc runtime — không hoạt động trong môi trường local dev.
Dùng `--compress false` vẫn chạy đầy đủ `dedup + join + weld + simplify`, giảm 80–87% mà GLB vẫn là format chuẩn, model-viewer load bình thường.

### Inspect model trước khi optimize

```bash
npx @gltf-transform/cli inspect <model.glb>
```

Chú ý: số mesh, số material, vertex count, có texture không.

### Kết quả đã đạt (tháng 5/2026)

| File | Trước | Sau | Giảm |
|------|-------|-----|------|
| settings/1.glb | 10.3 MB | 2.0 MB | -80% |
| settings/2.glb | 15.0 MB | 2.0 MB | -87% |

### Nguyên nhân gốc rễ model nặng

Model export từ `THREE.GLTFExporter` với 16 mesh riêng biệt và 16 material trùng lặp (đều là `/Silver-...`), không có vertex deduplication hay compression.
gltf-transform xử lý: `dedup` (16 material → 1) + `join` (16 mesh → 1) + `weld` + `simplify` + `prune`.

### Quy trình chuẩn khi thêm model mới

```bash
# 1. Backup
mv model.glb model-original.glb

# 2. Optimize
npx @gltf-transform/cli optimize model-original.glb model.glb --compress false

# 3. Kiểm tra kích thước
ls -lh model.glb

# 4. Verify trên browser, nếu OK thì xóa backup
rm model-original.glb
```

---

## Material color — DesignStudio

PBR colors định nghĩa tập trung tại `MATERIAL_CONFIGS` (module-level, `src/pages/DesignStudio.jsx`):

```js
const MATERIAL_CONFIGS = {
  'Titan':         { color: [0.20, 0.22, 0.27, 1], metallic: 1.0, roughness: 0.40, displayColor: 'from-[#374151] to-[#6b7280]' },
  'Bạc':           { color: [0.85, 0.85, 0.87, 1], metallic: 1.0, roughness: 0.05, displayColor: 'from-[#cbd5e1] to-[#f8fafc]' },
  'Sắt không gỉ': { color: [0.50, 0.50, 0.52, 1], metallic: 1.0, roughness: 0.20, displayColor: 'from-[#52525b] to-[#a1a1aa]' },
};
```

`fallbackMaterials` được derive từ `MATERIAL_CONFIGS` — single source of truth, tránh tên bị lệch nhau.

---

## model-viewer patterns

- Dùng `ref` + `useEffect` để apply PBR color sau khi model load
- Apply lên **tất cả** materials (`mats.forEach`), không chỉ `materials[0]`
- `key={settingModelUrl}` để force remount khi đổi model (tránh load tất cả model cùng lúc)
- `apply()` được gọi cả trong event `load` lẫn ngay sau attach listener (xử lý cached model)

---

## Các vấn đề đã gặp và fix

| Vấn đề | Nguyên nhân | Fix |
|--------|-------------|-----|
| Model không load (vùng tối đen) | `config.setting` default 'Prong' không khớp tên file '1', '2' | Dùng `settings[0]?.name` làm default |
| Load lag nặng | Render tất cả model-viewer cùng lúc, toggle opacity | Chỉ render 1 `<model-viewer key={url}>` |
| Chỉ đổi màu một phần model | `materials[0]` chỉ áp cho 1 material | `mats.forEach()` áp cho tất cả |
| GLB 10–15MB load chậm | 16 mesh/material trùng lặp, không nén | `gltf-transform optimize --compress false` |
| meshopt không load được | model-viewer cần CDN WASM decoder | Dùng `--compress false` thay thế |
