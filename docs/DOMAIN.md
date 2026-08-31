# Tile/Ceramic Domain Knowledge

Source: master prompt Section 12. File ini adalah ringkasan operational untuk decision cepat saat coding.

## Product Categories

| Kategori | Water Absorption | Use Case | Ukuran Umum (cm) |
|----------|------------------|----------|------------------|
| Keramik Dinding | E > 10% (BIII) | Kamar mandi, dapur, dekorasi | 20×25, 25×40, 30×60 |
| Keramik Lantai | E ≤ 6% (BIIa) atau ≤ 3% (BIb) | Lantai residensial | 30×30, 40×40, 60×60 |
| Granit Tile | E ≤ 0.5% (Group I) | Lantai premium/commercial | 60×60, 60×120, 80×80 |

## Ukuran Standar Indonesia (mm)

- **200 × 250** — dinding kamar mandi kecil
- **250 × 400** — dinding dapur
- **300 × 300** — lantai basic
- **300 × 600** — dinding modern format long
- **400 × 400** — lantai medium
- **500 × 500** — lantai
- **600 × 600** — lantai umum, granit basic
- **600 × 1200** — granit tile besar

## Trim Types

| Type | Fungsi | Width Typical |
|------|--------|---------------|
| Lisbon Ulir | Border decorative dinding, pattern spiral | 5-10 cm |
| Lis Keramik | Border simple matching color | Variable |
| Plint | Border bawah lantai ke dinding | 5-10 cm tinggi |
| Semen Nat | Grout gap filler | 2/3/5/8 mm |

## Nat (Grout) Standard

- **Width:** 2mm (tile presisi), 3mm (standard), 5mm (rustic), 8mm (khusus)
- **Warna:** putih, hitam, abu, cream, coklat, custom

## Pattern Types (V1 = Straight only)

| Pattern | Complexity | V Target | Waste Factor |
|---------|-----------|----------|--------------|
| Straight (Grid) | Simple | V1 | +5% |
| Offset / Brick / Running Bond | Medium | V1 optional / V2 | +7-8% |
| Diagonal / Diamond | Complex | V3 backlog | +10-12% |
| Herringbone | Very complex | V3 backlog | +12-15% |

## Kalkulasi Kebutuhan (Formula)

```
effective_tile_width  = tile_width_cm  + (nat_width_mm / 10)
effective_tile_height = tile_height_cm + (nat_width_mm / 10)

full_columns = floor(area_width_cm  / effective_tile_width)
full_rows    = floor(area_height_cm / effective_tile_height)

total_tiles  = (full_columns × full_rows) + partial_tiles_at_edge

tiles_with_waste = ceil(total_tiles × (1 + waste_factor))
dus_needed       = ceil(tiles_with_waste / pieces_per_dus)
```

Sanity check: `dus_needed × coverage_per_dus_m2 >= area_m2`

## Brand Landscape

**Tier 1 (Premium):** Roman (Lyman Group, market leader), Mulia, Platinum
**Tier 2 (Mid-range):** KIA, Asia Tile, Ikad
**Tier 3 (Budget):** Brand lokal (kualitas variable)

## Pricing Structure

Satuan jual:
- **Per dus (box)** — paling umum di toko
- **Per m²** — untuk konsultasi customer
- **Per keping** — sample atau spot repair

Coverage per dus contoh:
- Roman Crema Marfil 60×60 → 4 keping/dus → 1.44 m²/dus
- Roman Onyx Beige 30×60 → 6 keping/dus → 1.08 m²/dus

## Data yang WAJIB di JSON Catalog

Setiap produk minimal harus include:
- `id` (unique slug)
- `brand` (Roman, Mulia, dll)
- `name` (full product name)
- `size_cm` (`{ width, height }`)
- `category` (wall / floor / granite)
- `pieces_per_dus`
- `coverage_per_dus_m2`
- `price_per_dus`
- `thumbnail_url` (path relative ke `/public/thumbnails/`)
- `texture_url` (path relative ke `/public/textures/`, high-res untuk render)
- `tags` (color, style, keyword filter)
