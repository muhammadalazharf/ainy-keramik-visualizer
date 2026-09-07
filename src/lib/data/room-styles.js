export const TEMPLATE_STYLES = {
  modern: {
    id: "modern",
    ceilingHeight_m: 2.8,
    wallColor: "#EAEAEA",
    ceilingColor: "#F5F5F5",
    accentColor: "#2C2C2C",
    ambientIntensity: 0.55,
    keyLight: {
      position: [3, 4, 3],
      intensity: 1.0,
      color: "#FFFFFF",
    },
    fillLight: {
      color: "#FFFFFF",
      intensity: 0.35,
    },
    roughness: 0.6,
  },
  classic: {
    id: "classic",
    ceilingHeight_m: 3.0,
    wallColor: "#E8DCC4",
    ceilingColor: "#F0E6D2",
    accentColor: "#8B6F47",
    ambientIntensity: 0.55,
    keyLight: {
      position: [2.5, 3.5, 3],
      intensity: 0.95,
      color: "#FFF0D0",
    },
    fillLight: {
      color: "#FFE0B0",
      intensity: 0.4,
    },
    roughness: 0.75,
  },
  minimalist: {
    id: "minimalist",
    ceilingHeight_m: 2.7,
    wallColor: "#FFFFFF",
    ceilingColor: "#F8F8F8",
    accentColor: "#DDDDDD",
    ambientIntensity: 0.75,
    keyLight: {
      position: [3, 5, 2],
      intensity: 0.85,
      color: "#FFFFFF",
    },
    fillLight: {
      color: "#FFFFFF",
      intensity: 0.6,
    },
    roughness: 0.7,
  },
  industrial: {
    id: "industrial",
    ceilingHeight_m: 3.2,
    wallColor: "#575757",
    ceilingColor: "#3A3A3A",
    accentColor: "#B87730",
    ambientIntensity: 0.3,
    keyLight: {
      position: [2, 4, 2],
      intensity: 1.4,
      color: "#FFD8A8",
    },
    fillLight: {
      color: "#7A88A0",
      intensity: 0.25,
    },
    roughness: 0.85,
  },
  rustic: {
    id: "rustic",
    ceilingHeight_m: 2.7,
    wallColor: "#B08D64",
    ceilingColor: "#8A6942",
    accentColor: "#5C3A1E",
    ambientIntensity: 0.5,
    keyLight: {
      position: [2.5, 3.5, 3],
      intensity: 1.0,
      color: "#FFDC96",
    },
    fillLight: {
      color: "#FFCA80",
      intensity: 0.4,
    },
    roughness: 0.9,
  },
};

export function getTemplateStyle(id) {
  return TEMPLATE_STYLES[id] ?? TEMPLATE_STYLES.modern;
}
