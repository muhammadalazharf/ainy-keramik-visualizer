"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDesignStore } from "@/stores/design-store";
import { getProductById, getNatHexById } from "@/lib/data/products";
import { calculateStraightPattern } from "@/lib/math/tile-pattern";
import { makeProceduralTileTexture } from "@/lib/textures/proceduralTile";
import { getTemplateStyle } from "@/lib/data/room-styles";
import {
  SURFACE_ID,
  makeSurfaceUserData,
  collectSurfaceObjects,
  validateSurfaceCoverage,
} from "@/modules/engine-3d/SurfaceRegistry";

const NAT_BACKDROP_OFFSET = 0.0005;
const TILE_FRONT_OFFSET = 0.002;

/**
 * Dev-only bridge that publishes the current three.js scene root to
 * `window.__ainy3D` so tests (browser JS console / MCP javascript_tool) can
 * traverse the scene graph and verify surface registration.
 *
 * Removed automatically in production builds by dead-code elimination since
 * `process.env.NODE_ENV !== "development"` short-circuits the useEffect body.
 */
function DevSceneBridge() {
  const { scene } = useThree();
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__ainy3D = {
      scene,
      collectSurfaceObjects: () => collectSurfaceObjects(scene),
      validate: (expectedIds) => validateSurfaceCoverage(scene, expectedIds),
    };
    return () => {
      if (window.__ainy3D?.scene === scene) {
        delete window.__ainy3D;
      }
    };
  }, [scene]);
  return null;
}

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

function TileMesh({ x, y, w, h, uvW, uvH, texture, isFloor, surfaceId }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(w, h);
    if (uvW !== 1 || uvH !== 1) {
      const uvAttr = geo.attributes.uv;
      for (let i = 0; i < uvAttr.count; i++) {
        const u = uvAttr.getX(i);
        const v = uvAttr.getY(i);
        uvAttr.setXY(i, u * uvW, v * uvH);
      }
      uvAttr.needsUpdate = true;
    }
    return geo;
  }, [w, h, uvW, uvH]);

  const userData = useMemo(
    () => (surfaceId ? makeSurfaceUserData(surfaceId, "tile") : undefined),
    [surfaceId],
  );

  if (isFloor) {
    return (
      <mesh
        geometry={geometry}
        position={[x, TILE_FRONT_OFFSET, y]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        userData={userData}
        name={surfaceId ? `${surfaceId}__tile` : undefined}
      >
        <meshStandardMaterial
          map={texture}
          color="#ffffff"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
    );
  }

  return (
    <mesh
      geometry={geometry}
      position={[x, y, TILE_FRONT_OFFSET]}
      receiveShadow
      userData={userData}
      name={surfaceId ? `${surfaceId}__tile` : undefined}
    >
      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={0.35}
        metalness={0.05}
      />
    </mesh>
  );
}

function FloorTileSurface({ width, depth, pattern, texture, natColorHex, surfaceId }) {
  const backdropUserData = useMemo(
    () => (surfaceId ? makeSurfaceUserData(surfaceId, "backdrop") : undefined),
    [surfaceId],
  );

  return (
    <group position={[-width / 2, 0, -depth / 2]} name={surfaceId ? `${surfaceId}__group` : undefined}>
      <mesh
        position={[width / 2, NAT_BACKDROP_OFFSET, depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        userData={backdropUserData}
        name={surfaceId ? `${surfaceId}__backdrop` : undefined}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={natColorHex} roughness={0.9} />
      </mesh>
      {pattern.tiles.map((t, i) => (
        <TileMesh
          key={i}
          x={(t.x_mm + t.width_mm / 2) / 1000}
          y={(t.y_mm + t.height_mm / 2) / 1000}
          w={t.width_mm / 1000}
          h={t.height_mm / 1000}
          uvW={t.uv_w}
          uvH={t.uv_h}
          texture={texture}
          isFloor
          surfaceId={surfaceId}
        />
      ))}
    </group>
  );
}

function WallTileSurface({ width, height, pattern, texture, natColorHex, surfaceId }) {
  const backdropUserData = useMemo(
    () => (surfaceId ? makeSurfaceUserData(surfaceId, "backdrop") : undefined),
    [surfaceId],
  );

  return (
    <group name={surfaceId ? `${surfaceId}__group` : undefined}>
      <mesh
        position={[width / 2, height / 2, NAT_BACKDROP_OFFSET]}
        receiveShadow
        userData={backdropUserData}
        name={surfaceId ? `${surfaceId}__backdrop` : undefined}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={natColorHex} roughness={0.9} />
      </mesh>
      {pattern.tiles.map((t, i) => (
        <TileMesh
          key={i}
          x={(t.x_mm + t.width_mm / 2) / 1000}
          y={(t.y_mm + t.height_mm / 2) / 1000}
          w={t.width_mm / 1000}
          h={t.height_mm / 1000}
          uvW={t.uv_w}
          uvH={t.uv_h}
          texture={texture}
          surfaceId={surfaceId}
        />
      ))}
    </group>
  );
}

function RoomShell({
  width,
  depth,
  ceiling,
  style,
  wallPatternBack,
  wallPatternSide,
  wallTexture,
  floorPattern,
  floorTexture,
  natColorHex,
}) {
  const wallMaterial = (
    <meshStandardMaterial color={style.wallColor} roughness={style.roughness} />
  );
  const ceilingMaterial = (
    <meshStandardMaterial color={style.ceilingColor} roughness={style.roughness} />
  );
  const floorMaterial = (
    <meshStandardMaterial color={style.accentColor} roughness={0.85} />
  );

  return (
    <group>
      {floorPattern ? (
        <FloorTileSurface
          width={width}
          depth={depth}
          pattern={floorPattern}
          texture={floorTexture}
          natColorHex={natColorHex}
          surfaceId={SURFACE_ID.FLOOR}
        />
      ) : (
        <mesh
          position={[0, -0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          userData={makeSurfaceUserData(SURFACE_ID.FLOOR, "backdrop")}
          name={`${SURFACE_ID.FLOOR}__backdrop`}
        >
          <planeGeometry args={[width, depth]} />
          {floorMaterial}
        </mesh>
      )}

      {wallPatternBack ? (
        <group
          position={[-width / 2, 0, -depth / 2]}
          name={`${SURFACE_ID.WALL_BACK}__anchor`}
        >
          <WallTileSurface
            width={width}
            height={ceiling}
            pattern={wallPatternBack}
            texture={wallTexture}
            natColorHex={natColorHex}
            surfaceId={SURFACE_ID.WALL_BACK}
          />
        </group>
      ) : (
        <mesh
          position={[0, ceiling / 2, -depth / 2]}
          receiveShadow
          userData={makeSurfaceUserData(SURFACE_ID.WALL_BACK, "backdrop")}
          name={`${SURFACE_ID.WALL_BACK}__backdrop`}
        >
          <planeGeometry args={[width, ceiling]} />
          {wallMaterial}
        </mesh>
      )}

      {wallPatternSide ? (
        <group
          position={[-width / 2, 0, depth / 2]}
          rotation={[0, Math.PI / 2, 0]}
          name={`${SURFACE_ID.WALL_LEFT}__anchor`}
        >
          <WallTileSurface
            width={depth}
            height={ceiling}
            pattern={wallPatternSide}
            texture={wallTexture}
            natColorHex={natColorHex}
            surfaceId={SURFACE_ID.WALL_LEFT}
          />
        </group>
      ) : (
        <mesh
          position={[-width / 2, ceiling / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
          userData={makeSurfaceUserData(SURFACE_ID.WALL_LEFT, "backdrop")}
          name={`${SURFACE_ID.WALL_LEFT}__backdrop`}
        >
          <planeGeometry args={[depth, ceiling]} />
          {wallMaterial}
        </mesh>
      )}

      {wallPatternSide ? (
        <group
          position={[width / 2, 0, -depth / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          name={`${SURFACE_ID.WALL_RIGHT}__anchor`}
        >
          <WallTileSurface
            width={depth}
            height={ceiling}
            pattern={wallPatternSide}
            texture={wallTexture}
            natColorHex={natColorHex}
            surfaceId={SURFACE_ID.WALL_RIGHT}
          />
        </group>
      ) : (
        <mesh
          position={[width / 2, ceiling / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
          userData={makeSurfaceUserData(SURFACE_ID.WALL_RIGHT, "backdrop")}
          name={`${SURFACE_ID.WALL_RIGHT}__backdrop`}
        >
          <planeGeometry args={[depth, ceiling]} />
          {wallMaterial}
        </mesh>
      )}

      <mesh
        position={[0, ceiling, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
        userData={makeSurfaceUserData(SURFACE_ID.CEILING, "backdrop")}
        name={`${SURFACE_ID.CEILING}__backdrop`}
      >
        <planeGeometry args={[width, depth]} />
        {ceilingMaterial}
      </mesh>
    </group>
  );
}

export default function Scene3D() {
  const dimensions = useDesignStore((s) => s.dimensions);
  const selectedTiles = useDesignStore((s) => s.selectedTiles);
  const natWidth_mm = useDesignStore((s) => s.natWidth_mm);
  const natColor = useDesignStore((s) => s.natColor);
  const currentTemplateId = useDesignStore((s) => s.currentTemplateId);

  const wallProduct = getProductById(selectedTiles.wall);
  const floorProduct = getProductById(selectedTiles.floor);
  const style = getTemplateStyle(currentTemplateId);
  const natColorHex = getNatHexById(natColor);

  const wallColor = tileFillFromProduct(wallProduct);
  const floorColor = tileFillFromProduct(floorProduct);
  const wallTexture = useTileTexture(wallProduct, wallColor);
  const floorTexture = useTileTexture(floorProduct, floorColor);

  const width_m = dimensions.width_m || 3;
  const depth_m = dimensions.height_m || 3;
  const ceiling_m = style.ceilingHeight_m;

  const wallPatternBack = useMemo(() => {
    if (!wallProduct) return null;
    return calculateStraightPattern({
      area: { width_m, height_m: ceiling_m },
      tile: {
        width_cm: wallProduct.size_cm.width,
        height_cm: wallProduct.size_cm.height,
      },
      natWidth_mm,
    });
  }, [wallProduct, width_m, ceiling_m, natWidth_mm]);

  const wallPatternSide = useMemo(() => {
    if (!wallProduct) return null;
    return calculateStraightPattern({
      area: { width_m: depth_m, height_m: ceiling_m },
      tile: {
        width_cm: wallProduct.size_cm.width,
        height_cm: wallProduct.size_cm.height,
      },
      natWidth_mm,
    });
  }, [wallProduct, depth_m, ceiling_m, natWidth_mm]);

  const floorPattern = useMemo(() => {
    if (!floorProduct) return null;
    return calculateStraightPattern({
      area: { width_m, height_m: depth_m },
      tile: {
        width_cm: floorProduct.size_cm.width,
        height_cm: floorProduct.size_cm.height,
      },
      natWidth_mm,
    });
  }, [floorProduct, width_m, depth_m, natWidth_mm]);

  const eyeLevel = Math.min(1.6, ceiling_m * 0.6);
  const cameraPos = [width_m * 0.28, eyeLevel, depth_m * 0.42];
  const targetPos = [-width_m * 0.15, ceiling_m * 0.35, -depth_m * 0.48];

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900">
      <Canvas
        shadows
        camera={{ position: cameraPos, fov: 55, near: 0.05, far: 100 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#111827"]} />
          <DevSceneBridge />

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
            wallPatternBack={wallPatternBack}
            wallPatternSide={wallPatternSide}
            wallTexture={wallTexture}
            floorPattern={floorPattern}
            floorTexture={floorTexture}
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
