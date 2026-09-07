/**
 * Straight grid pattern with partial (cut) tiles at edges so the target
 * surface is fully covered (no empty space).
 *
 * Input:
 *   area:        { width_m, height_m }
 *   tile:        { width_cm, height_cm }
 *   natWidth_mm: gap between tiles (mm)
 *
 * Output:
 *   {
 *     tiles: [{ x_mm, y_mm, width_mm, height_mm, partial, uv_w, uv_h }, ...],
 *     fullCols, fullRows, totalFull, totalPartial,
 *     remainderWidth_mm, remainderHeight_mm,
 *     areaWidth_mm, areaHeight_mm,
 *   }
 *
 * uv_w / uv_h express the fraction of the tile texture that should map onto
 * the mesh face — full tiles get 1.0, partial tiles get <1.0 so texture
 * does not stretch across cut edges.
 */
export function calculateStraightPattern({ area, tile, natWidth_mm }) {
  const areaWidth_mm = area.width_m * 1000;
  const areaHeight_mm = area.height_m * 1000;
  const tileWidth_mm = tile.width_cm * 10;
  const tileHeight_mm = tile.height_cm * 10;

  const effTileWidth = tileWidth_mm + natWidth_mm;
  const effTileHeight = tileHeight_mm + natWidth_mm;

  const fullCols = Math.floor(areaWidth_mm / effTileWidth);
  const fullRows = Math.floor(areaHeight_mm / effTileHeight);

  const usedWidth = fullCols * effTileWidth;
  const usedHeight = fullRows * effTileHeight;
  const remainderWidth_mm = Math.max(0, areaWidth_mm - usedWidth - natWidth_mm);
  const remainderHeight_mm = Math.max(0, areaHeight_mm - usedHeight - natWidth_mm);

  const tiles = [];

  for (let row = 0; row < fullRows; row++) {
    for (let col = 0; col < fullCols; col++) {
      tiles.push({
        x_mm: col * effTileWidth,
        y_mm: row * effTileHeight,
        width_mm: tileWidth_mm,
        height_mm: tileHeight_mm,
        uv_w: 1,
        uv_h: 1,
        partial: false,
      });
    }
  }

  if (remainderWidth_mm > 0) {
    for (let row = 0; row < fullRows; row++) {
      tiles.push({
        x_mm: fullCols * effTileWidth,
        y_mm: row * effTileHeight,
        width_mm: remainderWidth_mm,
        height_mm: tileHeight_mm,
        uv_w: remainderWidth_mm / tileWidth_mm,
        uv_h: 1,
        partial: true,
      });
    }
  }

  if (remainderHeight_mm > 0) {
    for (let col = 0; col < fullCols; col++) {
      tiles.push({
        x_mm: col * effTileWidth,
        y_mm: fullRows * effTileHeight,
        width_mm: tileWidth_mm,
        height_mm: remainderHeight_mm,
        uv_w: 1,
        uv_h: remainderHeight_mm / tileHeight_mm,
        partial: true,
      });
    }
  }

  if (remainderWidth_mm > 0 && remainderHeight_mm > 0) {
    tiles.push({
      x_mm: fullCols * effTileWidth,
      y_mm: fullRows * effTileHeight,
      width_mm: remainderWidth_mm,
      height_mm: remainderHeight_mm,
      uv_w: remainderWidth_mm / tileWidth_mm,
      uv_h: remainderHeight_mm / tileHeight_mm,
      partial: true,
    });
  }

  const totalFull = fullCols * fullRows;
  const totalPartial = tiles.length - totalFull;

  return {
    tiles,
    fullCols,
    fullRows,
    totalFull,
    totalPartial,
    remainderWidth_mm,
    remainderHeight_mm,
    areaWidth_mm,
    areaHeight_mm,
  };
}

export function estimateNeeded({ totalTiles, piecesPerDus, wasteFactor = 0.05 }) {
  const tilesWithWaste = Math.ceil(totalTiles * (1 + wasteFactor));
  const dusNeeded = Math.ceil(tilesWithWaste / piecesPerDus);
  return { tilesWithWaste, dusNeeded };
}
