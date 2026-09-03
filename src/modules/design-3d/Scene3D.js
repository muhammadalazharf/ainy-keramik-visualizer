"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useDesignStore } from "@/stores/design-store";
import { getProductById, getNatHexById } from "@/lib/data/products";
import { getTrimById } from "@/lib/data/trims";
import { calculateStraightPattern } from "@/lib/math/tile-pattern";
import { makeProceduralTileTexture } from "@/lib/textures/proceduralTile";

const REAL_TEXTURE_CACHE = new Map();

function loadRealTexture(url) {
  if (REAL_TEXTURE_CACHE.has(url)) return REAL_TEXTURE_CACHE.get(url);
  const promise = new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 8;
        resolve(tex);
      },
      undefined,
      () => resolve(null),
    );
  });
  REAL_TEXTURE_CACHE.set(url, promise);
  return promise;
}

function useTileTexture(product, fallbackColor) {
  const [realTex, setRealTex] = useState(null);
  const textureUrl = product?.texture_url;

  useEffect(() => {
    if (!textureUrl) {
      setRealTex(null);
      return;
    }
    let cancelled = false;
    loadRealTexture(textureUrl).then((tex) => {
      if (!cancelled) setRealTex(tex);
    });
    return () => {
      cancelled = true;
    };
  }, [textureUrl]);

  const proceduralTex = useMemo(
    () => makeProceduralTileTexture(fallbackColor, 256),
    [fallbackColor],
  );

  return realTex ?? proceduralTex;
}

const TAG_COLOR = {
  cream: "#f5e8d0",
  beige: "#e8d5b0",
  red: "#c8825a",
  grey: "#a0a0a0",
  black: "#3a3a3a",
  white: "#f8f5f0",
  brown: "#8b6b4a",
};

function tileFillFromProduct(product) {
  if (!product) return "#e8d5b0";
  const matchedTag = product.tags?.find((t) => TAG_COLOR[t]);
  return TAG_COLOR[matchedTag] ?? "#e8d5b0";
}

const TILE_DEPTH_M = 0.008;
const NAT_DEPTH_M = 0.006;
const TRIM_DEPTH_M = 0.012;

function TrimFrame({ surface, areaW, areaH, trim }) {
  if (!trim) return null;
  const width_m = trim.width_cm / 100;
  const color = trim.hex ?? "#8a6a48";
  const isFloor = surface === "floor";

  const material = (
    <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
  );

  if (isFloor) {
    return (
      <group>
        <mesh position={[areaW / 2, TRIM_DEPTH_M / 2, -width_m / 2]} castShadow receiveShadow>
          <boxGeometry args={[areaW + 2 * width_m, TRIM_DEPTH_M, width_m]} />
          {material}
        </mesh>
        <mesh position={[areaW / 2, TRIM_DEPTH_M / 2, areaH + width_m / 2]} castShadow receiveShadow>
          <boxGeometry args={[areaW + 2 * width_m, TRIM_DEPTH_M, width_m]} />
          {material}
        </mesh>
        <mesh position={[-width_m / 2, TRIM_DEPTH_M / 2, areaH / 2]} castShadow receiveShadow>
          <boxGeometry args={[width_m, TRIM_DEPTH_M, areaH]} />
          {material}
        </mesh>
        <mesh position={[areaW + width_m / 2, TRIM_DEPTH_M / 2, areaH / 2]} castShadow receiveShadow>
          <boxGeometry args={[width_m, TRIM_DEPTH_M, areaH]} />
          {material}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[areaW / 2, areaH + width_m / 2, TRIM_DEPTH_M / 2]} castShadow receiveShadow>
        <boxGeometry args={[areaW + 2 * width_m, width_m, TRIM_DEPTH_M]} />
        {material}
      </mesh>
      <mesh position={[areaW / 2, -width_m / 2, TRIM_DEPTH_M / 2]} castShadow receiveShadow>
        <boxGeometry args={[areaW + 2 * width_m, width_m, TRIM_DEPTH_M]} />
        {material}
      </mesh>
      <mesh position={[-width_m / 2, areaH / 2, TRIM_DEPTH_M / 2]} castShadow receiveShadow>
        <boxGeometry args={[width_m, areaH, TRIM_DEPTH_M]} />
        {material}
      </mesh>
      <mesh position={[areaW + width_m / 2, areaH / 2, TRIM_DEPTH_M / 2]} castShadow receiveShadow>
        <boxGeometry args={[width_m, areaH, TRIM_DEPTH_M]} />
        {material}
      </mesh>
    </group>
  );
}

function TileGrid({ surface, pattern, product, tileColor, natColorHex }) {
  const tiles = useMemo(() => pattern.tiles, [pattern]);
  const areaW = pattern.areaWidth_mm / 1000;
  const areaH = pattern.areaHeight_mm / 1000;

  const isFloor = surface === "floor";

  const tileTexture = useTileTexture(product, tileColor);

  return (
    <group>
      {isFloor ? (
        <mesh position={[areaW / 2, NAT_DEPTH_M / 2, areaH / 2]} receiveShadow>
          <boxGeometry args={[areaW, NAT_DEPTH_M, areaH]} />
          <meshStandardMaterial color={natColorHex} roughness={0.9} />
        </mesh>
      ) : (
        <mesh position={[areaW / 2, areaH / 2, NAT_DEPTH_M / 2]} receiveShadow>
          <boxGeometry args={[areaW, areaH, NAT_DEPTH_M]} />
          <meshStandardMaterial color={natColorHex} roughness={0.9} />
        </mesh>
      )}

      {tiles.map((t, i) => {
        const x = (t.x_mm + t.width_mm / 2) / 1000;
        const y = (t.y_mm + t.height_mm / 2) / 1000;
        const w = t.width_mm / 1000;
        const h = t.height_mm / 1000;

        if (isFloor) {
          return (
            <mesh
              key={i}
              position={[x, NAT_DEPTH_M + TILE_DEPTH_M / 2, y]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[w, TILE_DEPTH_M, h]} />
              <meshStandardMaterial
                map={tileTexture}
                color="#ffffff"
                roughness={0.35}
                metalness={0.05}
              />
            </mesh>
          );
        }
        return (
          <mesh
            key={i}
            position={[x, y, NAT_DEPTH_M + TILE_DEPTH_M / 2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w, h, TILE_DEPTH_M]} />
            <meshStandardMaterial
              map={tileTexture}
              color="#ffffff"
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Scene3D() {
  const surface = useDesignStore((s) => s.surface);
  const dimensions = useDesignStore((s) => s.dimensions);
  const selectedTileId = useDesignStore((s) => s.selectedTileId);
  const natWidth_mm = useDesignStore((s) => s.natWidth_mm);
  const natColor = useDesignStore((s) => s.natColor);
  const selectedTrimId = useDesignStore((s) => s.selectedTrimId);

  const product = getProductById(selectedTileId);
  const trim = getTrimById(selectedTrimId);

  const pattern = useMemo(() => {
    if (!product || !dimensions.width_m || !dimensions.height_m) return null;
    return calculateStraightPattern({
      area: dimensions,
      tile: {
        width_cm: product.size_cm.width,
        height_cm: product.size_cm.height,
      },
      natWidth_mm,
    });
  }, [product, dimensions, natWidth_mm]);

  if (!pattern) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-2xl border-2 border-current/20 flex items-center justify-center">
        <p className="opacity-60">Memuat 3D scene...</p>
      </div>
    );
  }

  const areaW = dimensions.width_m;
  const areaH = dimensions.height_m;
  const maxDim = Math.max(areaW, areaH);
  const camDist = maxDim * 1.5;

  const isFloor = surface === "floor";
  const cameraPos = isFloor
    ? [areaW / 2 + camDist * 0.6, camDist * 0.8, areaH / 2 + camDist * 0.6]
    : [areaW / 2 + camDist * 0.4, areaH / 2, camDist];
  const targetPos = isFloor
    ? [areaW / 2, 0, areaH / 2]
    : [areaW / 2, areaH / 2, 0];

  const tileColor = tileFillFromProduct(product);
  const natColorHex = getNatHexById(natColor);

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl border-2 border-current/20 overflow-hidden bg-slate-100 dark:bg-slate-800">
      <Canvas
        shadows
        camera={{ position: cameraPos, fov: 45 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <hemisphereLight args={["#ffffff", "#888888", 0.4]} />

          <TileGrid
            surface={surface}
            pattern={pattern}
            product={product}
            tileColor={tileColor}
            natColorHex={natColorHex}
          />
          <TrimFrame
            surface={surface}
            areaW={areaW}
            areaH={areaH}
            trim={trim}
          />

          {isFloor && (
            <Grid
              position={[areaW / 2, -0.001, areaH / 2]}
              args={[areaW * 3, areaH * 3]}
              cellSize={0.5}
              cellColor="#c0c0c0"
              sectionSize={1}
              sectionColor="#888888"
              fadeDistance={maxDim * 5}
              infiniteGrid
            />
          )}

          <OrbitControls
            target={targetPos}
            enablePan
            enableZoom
            enableRotate
            minDistance={maxDim * 0.3}
            maxDistance={maxDim * 5}
            maxPolarAngle={isFloor ? Math.PI / 2.1 : Math.PI}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
