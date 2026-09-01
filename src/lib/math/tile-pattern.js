/**
 * Straight grid pattern: tiles aligned in rows & columns, uniform nat gap.
 * All math in mm. Convert at the boundary (see Section 15.6 convention).
 *
 * Input:
 *   area:        { width_m, height_m }
 *   tile:        { width_cm, height_cm }
 *   natWidth_mm: gap between tiles (mm)
 *
 * Output:
 *   {
 *     tiles: [{ x_mm, y_mm, width_mm, height_mm }, ...],
 *     fullCols, fullRows, totalFull,
 *     remainderWidth_mm, remainderHeight_mm,
 *     areaWidth_mm, areaHeight_mm,
 *   }
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

  const tiles = [];
  for (let row = 0; row < fullRows; row++) {
    for (let col = 0; col < fullCols; col++) {
      tiles.push({
        x_mm: col * effTileWidth,
        y_mm: row * effTileHeight,
        width_mm: tileWidth_mm,
        height_mm: tileHeight_mm,
      });
    }
  }

  return {
    tiles,
    fullCols,
    fullRows,
    totalFull: fullCols * fullRows,
    remainderWidth_mm: areaWidth_mm - fullCols * effTileWidth,
    remainderHeight_mm: areaHeight_mm - fullRows * effTileHeight,
    areaWidth_mm,
    areaHeight_mm,
  };
}

/**
 * Estimate total pieces & dus needed based on tile count + waste factor.
 * Section 15.4 formula.
 */
export function estimateNeeded({ totalTiles, piecesPerDus, wasteFactor = 0.05 }) {
  const tilesWithWaste = Math.ceil(totalTiles * (1 + wasteFactor));
  const dusNeeded = Math.ceil(tilesWithWaste / piecesPerDus);
  return { tilesWithWaste, dusNeeded };
}
