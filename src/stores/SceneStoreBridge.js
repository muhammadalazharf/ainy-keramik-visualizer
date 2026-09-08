"use client";

import { useEffect } from "react";
import { useSceneStore } from "@/stores/scene-store";

/**
 * Dev bridge that exposes the scene-store on `window.__ainyScene` for browser
 * console inspection and MCP-driven acceptance tests. Mirrors the pattern used
 * by DevSceneBridge in Scene3D.js (STEP 1).
 *
 * Exposes:
 *   window.__ainyScene.get()       — current state snapshot
 *   window.__ainyScene.actions     — all store actions bound to the store
 *   window.__ainyScene.subscribe   — subscribe to raw state changes
 *   window.__ainyScene.summary()   — { roomId, templateId, tiledSurfaces }
 *
 * Cleanup on unmount removes the global so old bridges from a previous route
 * don't leak.
 */
export default function SceneStoreBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const api = {
      get: () => useSceneStore.getState(),
      actions: useSceneStore.getState(),
      subscribe: useSceneStore.subscribe,
      summary: () => {
        const s = useSceneStore.getState();
        return {
          roomId: s.roomId,
          templateId: s.templateId,
          dimensions: s.dimensions,
          tiledSurfaces: Object.entries(s.surfaces)
            .filter(([, surf]) => surf?.tileId)
            .map(([id, surf]) => ({
              id,
              tileId: surf.tileId,
              pattern: surf.pattern,
              groutMm: surf.groutMm,
              groutColorId: surf.groutColorId,
            })),
        };
      },
    };
    window.__ainyScene = api;
    return () => {
      if (window.__ainyScene === api) {
        delete window.__ainyScene;
      }
    };
  }, []);
  return null;
}
