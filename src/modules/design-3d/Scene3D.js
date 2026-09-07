"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDesignStore } from "@/stores/design-store";
import { getProductById, getNatHexById } from "@/lib/data/products";
import { calculateStraightPattern } from "@/lib/math/tile-pattern";
import { makeProceduralTileTexture } from "@/lib/textures/proceduralTile";
import { getTemplateStyle } from "@/lib/data/room-styles";

const TILE_DEPTH_M = 0.006;
const NAT_DEPTH_M = 0.004;

const TAG_COLOR = {
  cream: "#f5e8d0",
  beige: "#e8d5b0",
  red: "#c8825a",
  grey: "#a0a0a0",
  black: "#3a3a3a",
  white: "#f8f5f0",
  brown: "#8b6b4a",
  teal: "#4a8a8a",
  gold: "#c9a94a",
};

function tileFillFromProduct(product) {
  if (!product) return "#e8d5b0";
  const matchedTag = product.tags?.find((t) => TAG_COLOR[t]);
  return TAG_COLOR[matchedTag] ?? "#e8d5b0";
}

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

function TiledSurface({ orientation, width, height, pattern, tileTexture, natColorHex }) {
  const tiles = pattern.tiles;
  const tilesGeometry = useMemo(() => {
    return tiles.map((t) => ({
      x_m: (t.x_mm + t.width_mm / 2) / 1000,
      y_m: (t.y_mm + t.height_mm / 2) / 1000,
      w_m: t.width_mm / 1000,
      h_m: t.height_mm / 1000,
    }));
  }, [tiles]);

  return (
    <group>
      {orientation === "floor" ? (
        <>
          <mesh position={[width / 2, NAT_DEPTH_M / 2, height / 2]} receiveShadow>
            <boxGeometry args={[width, NAT_DEPTH_M, height]} />
            <meshStandardMaterial color={natColorHex} roughness={0.9} />
          </mesh>
          {tilesGeometry.map((t, i) => (
            <mesh
              key={i}
              position={[t.x_m, NAT_DEPTH_M + TILE_DEPTH_M / 2, t.y_m]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[t.w_m, TILE_DEPTH_M, t.h_m]} />
              <meshStandardMaterial
                map={tileTexture}
                color="#ffffff"
                roughness={0.35}
                metalness={0.05}
              />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh position={[width / 2, height / 2, NAT_DEPTH_M / 2]} receiveShadow>
            <boxGeometry args={[width, height, NAT_DEPTH_M]} />
            <meshStandardMaterial color={natColorHex} roughness={0.9} />
          </mesh>
          {tilesGeometry.map((t, i) => (
            <mesh
              key={i}
              position={[t.x_m, t.y_m, NAT_DEPTH_M + TILE_DEPTH_M / 2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[t.w_m, t.h_m, TILE_DEPTH_M]} />
              <meshStandardMaterial
                map={tileTexture}
                color="#ffffff"
                roughness={0.35}
                metalness={0.05}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function RoomShell({ width, depth, ceiling, style, surface, tilePattern, tileTexture, natColorHex }) {
  const wallMaterial = (
    <meshStandardMaterial color={style.wallColor} roughness={style.roughness} />
  );
  const ceilingMaterial = (
    <meshStandardMaterial color={style.ceilingColor} roughness={style.roughness} />
  );
  const floorMaterial = (
    <meshStandardMaterial color={style.accentColor} roughness={0.85} />
  );

  const showTileOnFloor = surface === "floor" && tilePattern;
  const showTileOnWall = surface === "wall" && tilePattern;

  return (
    <group>
      {/* Floor (plain if tile is on wall; tiled if tile is on floor) */}
      {showTileOnFloor ? (
        <group position={[-width / 2, 0, -depth / 2]}>
          <TiledSurface
            orientation="floor"
            width={width}
            height={depth}
            pattern={tilePattern}
            tileTexture={tileTexture}
            natColorHex={natColorHex}
          />
        </group>
      ) : (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          {floorMaterial}
        </mesh>
      )}

      {/* Back Wall (tile target when surface === "wall") */}
      {showTileOnWall ? (
        <group position={[-width / 2, 0, -depth / 2]}>
          <TiledSurface
            orientation="wall"
            width={width}
            height={ceiling}
            pattern={tilePattern}
            tileTexture={tileTexture}
            natColorHex={natColorHex}
          />
        </group>
      ) : (
        <mesh position={[0, ceiling / 2, -depth / 2]} receiveShadow>
          <planeGeometry args={[width, ceiling]} />
          {wallMaterial}
        </mesh>
      )}

      {/* Left Wall */}
      <mesh
        position={[-width / 2, ceiling / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[depth, ceiling]} />
        {wallMaterial}
      </mesh>

      {/* Right Wall */}
      <mesh
        position={[width / 2, ceiling / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[depth, ceiling]} />
        {wallMaterial}
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ceiling, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        {ceilingMaterial}
      </mesh>
    </group>
  );
}

export default function Scene3D() {
  const surface = useDesignStore((s) => s.surface);
  const dimensions = useDesignStore((s) => s.dimensions);
  const selectedTileId = useDesignStore((s) => s.selectedTileId);
  const natWidth_mm = useDesignStore((s) => s.natWidth_mm);
  const natColor = useDesignStore((s) => s.natColor);
  const currentTemplateId = useDesignStore((s) => s.currentTemplateId);

  const product = getProductById(selectedTileId);
  const style = getTemplateStyle(currentTemplateId);
  const tileColor = tileFillFromProduct(product);
  const tileTexture = useTileTexture(product, tileColor);
  const natColorHex = getNatHexById(natColor);

  const width_m = dimensions.width_m || 3;
  const depth_m = dimensions.height_m || 3;
  const ceiling_m = style.ceilingHeight_m;

  const targetPatternArea = useMemo(() => {
    if (surface === "wall") {
      return { width_m, height_m: ceiling_m };
    }
    return { width_m, height_m: depth_m };
  }, [surface, width_m, depth_m, ceiling_m]);

  const pattern = useMemo(() => {
    if (!product || !targetPatternArea.width_m || !targetPatternArea.height_m) return null;
    return calculateStraightPattern({
      area: targetPatternArea,
      tile: {
        width_cm: product.size_cm.width,
        height_cm: product.size_cm.height,
      },
      natWidth_mm,
    });
  }, [product, targetPatternArea, natWidth_mm]);

  const camDist = Math.max(width_m, depth_m) * 0.75;
  const cameraPos = [width_m * 0.4, ceiling_m * 0.65, depth_m / 2 + camDist];
  const targetPos = [0, ceiling_m * 0.4, -depth_m / 2];

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900">
      <Canvas
        shadows
        camera={{ position: cameraPos, fov: 55, near: 0.05, far: 100 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#111827"]} />

          <ambientLight intensity={style.ambientIntensity} />
          <directionalLight
            position={style.keyLight.position}
            intensity={style.keyLight.intensity}
            color={style.keyLight.color}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
          />
          <hemisphereLight
            args={[style.fillLight.color, "#333333", style.fillLight.intensity]}
          />

          <RoomShell
            width={width_m}
            depth={depth_m}
            ceiling={ceiling_m}
            style={style}
            surface={surface}
            tilePattern={pattern}
            tileTexture={tileTexture}
            natColorHex={natColorHex}
          />

          <OrbitControls
            target={targetPos}
            enablePan
            enableZoom
            enableRotate
            minDistance={0.5}
            maxDistance={Math.max(width_m, depth_m) * 3}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
