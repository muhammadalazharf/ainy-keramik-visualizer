import * as THREE from "three";

const CANVAS_CACHE = new Map();

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a Three.js CanvasTexture with subtle noise + veining based on hex color.
 * Deterministic per hex color (cached).
 */
export function makeProceduralTileTexture(hexColor, size = 256) {
  const cacheKey = `${hexColor}-${size}`;
  if (CANVAS_CACHE.has(cacheKey)) return CANVAS_CACHE.get(cacheKey);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const base = hexToRgb(hexColor);

  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, size, size);

  const rng = mulberry32(
    (base.r << 16) ^ (base.g << 8) ^ base.b ^ size,
  );

  const noiseDensity = Math.floor(size * size * 0.4);
  for (let i = 0; i < noiseDensity; i++) {
    const x = Math.floor(rng() * size);
    const y = Math.floor(rng() * size);
    const delta = (rng() - 0.5) * 30;
    const r = Math.max(0, Math.min(255, base.r + delta));
    const g = Math.max(0, Math.min(255, base.g + delta));
    const b = Math.max(0, Math.min(255, base.b + delta));
    ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${0.4 + rng() * 0.4})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const veinCount = 6;
  for (let i = 0; i < veinCount; i++) {
    ctx.strokeStyle = `rgba(${(base.r * 0.7) | 0},${(base.g * 0.7) | 0},${(base.b * 0.7) | 0},${0.08 + rng() * 0.12})`;
    ctx.lineWidth = 0.5 + rng();
    ctx.beginPath();
    const x1 = rng() * size;
    const y1 = rng() * size;
    const x2 = rng() * size;
    const y2 = rng() * size;
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(
      x1 + (rng() - 0.5) * size,
      y1 + (rng() - 0.5) * size,
      x2 + (rng() - 0.5) * size,
      y2 + (rng() - 0.5) * size,
      x2,
      y2,
    );
    ctx.stroke();
  }

  const spots = 20;
  for (let i = 0; i < spots; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const radius = 2 + rng() * 8;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const dark = rng() > 0.5;
    const shade = dark ? 0.85 : 1.15;
    gradient.addColorStop(0, `rgba(${(base.r * shade) | 0},${(base.g * shade) | 0},${(base.b * shade) | 0},0.35)`);
    gradient.addColorStop(1, `rgba(${(base.r * shade) | 0},${(base.g * shade) | 0},${(base.b * shade) | 0},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  CANVAS_CACHE.set(cacheKey, texture);
  return texture;
}

/**
 * Try loading an image URL as texture. Returns null on failure.
 * Caller can fallback to procedural.
 */
export function loadImageTexture(url) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 8;
        resolve(texture);
      },
      undefined,
      () => resolve(null),
    );
  });
}
