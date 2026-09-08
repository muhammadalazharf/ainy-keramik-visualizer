/**
 * Surface Registry — central authority for the semantic identity of every
 * paint-able surface in a room.
 *
 * A "surface" is any 3D face that a customer can apply a tile/material to:
 * floor, walls, ceiling (later: countertops, backsplashes, etc).
 *
 * Every mesh that represents a paintable surface (or is part of a tile pattern
 * applied to one) must carry the surface's identity via `userData.surfaceId`.
 * This allows the interaction layer (raycasting for drag-drop / hover / click)
 * to resolve "the customer's pointer is over surface X" reliably.
 *
 * STEP 1 scope (this file):
 *   - Define the canonical set of surface IDs.
 *   - Provide a `SURFACE_META` map with human-readable name + type + expected
 *     dimension keys (used later by the material scaler).
 *   - Provide traversal helpers so tests / debug code can enumerate all
 *     surface-owned meshes in a scene.
 *
 * Out of scope for STEP 1:
 *   - Raycasting / hit detection (STEP 6).
 *   - Drag-drop resolution (STEP 7).
 *   - Per-surface state read/write (STEP 2 rebuilds the store around this).
 */

export const SURFACE_ID = Object.freeze({
  FLOOR:      "floor",
  WALL_BACK:  "wall_back",
  WALL_LEFT:  "wall_left",
  WALL_RIGHT: "wall_right",
  CEILING:    "ceiling",
});

export const SURFACE_TYPE = Object.freeze({
  FLOOR:   "floor",
  WALL:    "wall",
  CEILING: "ceiling",
});

/**
 * Immutable metadata per surface. Consumers should treat this as a lookup table.
 * `orientationAxis` describes which room dimension maps to the surface's width
 * axis when computing physical UV scaling (STEP 4).
 */
export const SURFACE_META = Object.freeze({
  [SURFACE_ID.FLOOR]: {
    id: SURFACE_ID.FLOOR,
    type: SURFACE_TYPE.FLOOR,
    label: "Lantai",
    /** width × depth of the room */
    dimensionKeys: ["width_m", "depth_m"],
    /** floor is horizontal, normal pointing up */
    normalDirection: [0, 1, 0],
  },
  [SURFACE_ID.WALL_BACK]: {
    id: SURFACE_ID.WALL_BACK,
    type: SURFACE_TYPE.WALL,
    label: "Dinding Belakang",
    /** width of room × ceiling height */
    dimensionKeys: ["width_m", "ceiling_m"],
    /** wall_back faces +Z (toward camera) */
    normalDirection: [0, 0, 1],
  },
  [SURFACE_ID.WALL_LEFT]: {
    id: SURFACE_ID.WALL_LEFT,
    type: SURFACE_TYPE.WALL,
    label: "Dinding Kiri",
    dimensionKeys: ["depth_m", "ceiling_m"],
    normalDirection: [1, 0, 0],
  },
  [SURFACE_ID.WALL_RIGHT]: {
    id: SURFACE_ID.WALL_RIGHT,
    type: SURFACE_TYPE.WALL,
    label: "Dinding Kanan",
    dimensionKeys: ["depth_m", "ceiling_m"],
    normalDirection: [-1, 0, 0],
  },
  [SURFACE_ID.CEILING]: {
    id: SURFACE_ID.CEILING,
    type: SURFACE_TYPE.CEILING,
    label: "Langit-langit",
    dimensionKeys: ["width_m", "depth_m"],
    normalDirection: [0, -1, 0],
  },
});

export const ALL_SURFACE_IDS = Object.freeze(Object.values(SURFACE_ID));

export function isKnownSurfaceId(id) {
  return typeof id === "string" && id in SURFACE_META;
}

export function getSurfaceMeta(id) {
  return SURFACE_META[id] ?? null;
}

/**
 * `userData` payload every mesh belonging to a surface must carry.
 *
 * `role` distinguishes:
 *   "backdrop" — the plane that acts as the physical surface itself (nat/grout
 *                  layer or plain colored plane). Preferred raycast target.
 *   "tile"     — one tile mesh applied on top of the backdrop. Raycasters
 *                  hitting a tile should walk up to backdrop / use surfaceId
 *                  as-is (both share the same surfaceId).
 *   "detail"   — decorative elements that belong to the surface but should not
 *                  be swap-targets on their own (reserved for future).
 */
export function makeSurfaceUserData(surfaceId, role = "backdrop") {
  if (!isKnownSurfaceId(surfaceId)) {
    throw new Error(`SurfaceRegistry: unknown surfaceId "${surfaceId}"`);
  }
  return {
    __ainy: true,
    surfaceId,
    role,
  };
}

/**
 * Walk a Three.js scene root and collect every object that carries a
 * `userData.__ainy` marker set by `makeSurfaceUserData`.
 *
 * Returns an array of { object, surfaceId, role } entries. Useful for
 * debugging (verify all expected surfaces are registered) and later for
 * raycast target list generation.
 */
export function collectSurfaceObjects(root) {
  const found = [];
  if (!root || typeof root.traverse !== "function") return found;
  root.traverse((obj) => {
    const ud = obj.userData;
    if (ud && ud.__ainy && isKnownSurfaceId(ud.surfaceId)) {
      found.push({
        object: obj,
        surfaceId: ud.surfaceId,
        role: ud.role ?? "backdrop",
      });
    }
  });
  return found;
}

/**
 * Group a `collectSurfaceObjects` result by surfaceId. Returns:
 *   { [surfaceId]: { backdrop: object | null, tiles: object[], details: object[] } }
 */
export function groupBySurface(entries) {
  const grouped = {};
  for (const entry of entries) {
    if (!grouped[entry.surfaceId]) {
      grouped[entry.surfaceId] = { backdrop: null, tiles: [], details: [] };
    }
    if (entry.role === "backdrop") grouped[entry.surfaceId].backdrop = entry.object;
    else if (entry.role === "tile") grouped[entry.surfaceId].tiles.push(entry.object);
    else grouped[entry.surfaceId].details.push(entry.object);
  }
  return grouped;
}

/**
 * Development-only sanity check. Given a scene root and the list of surface IDs
 * the caller expects to see (based on room type), verify each has at least one
 * registered mesh. Returns { ok, missing, extra }.
 *
 * STEP 1 acceptance test:
 *   const report = validateSurfaceCoverage(scene, ALL_SURFACE_IDS);
 *   expect(report.ok).toBe(true);
 */
export function validateSurfaceCoverage(root, expectedIds = ALL_SURFACE_IDS) {
  const entries = collectSurfaceObjects(root);
  const found = new Set(entries.map((e) => e.surfaceId));
  const missing = expectedIds.filter((id) => !found.has(id));
  const extra = [...found].filter((id) => !expectedIds.includes(id));
  return {
    ok: missing.length === 0,
    missing,
    extra,
    count: entries.length,
    found: [...found],
  };
}
