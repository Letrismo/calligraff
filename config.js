const PILOT_PALETTES = {
  "Aurora": {
    background: "#080a12",
    compositeOperation: "lighter",
    colors: ["#2de2e6", "#6a4c93", "#ff4d6d", "#f9c74f"]
  },
  "Mineral": {
    background: "#f1eadf",
    compositeOperation: "multiply",
    colors: ["#122c34", "#2a9d8f", "#f4a261", "#e76f51"]
  },
  "Nocturno": {
    background: "#0d0d0d",
    compositeOperation: "screen",
    colors: ["#4cc9f0", "#b8f2e6", "#f72585", "#ffd166"]
  }
};

const PILOT_CONFIG = {
  canvas: {
    background: PILOT_PALETTES.Aurora.background
  },
  brush: {
    name: "Pilot",
    size: 32,
    pressureMinScale: 0.35,
    pressureMaxScale: 1.65,
    spacing: 0.1,
    curveStep: 0.12,
    curveSmoothing: 1,
    smoothingAmount: 0.24,
    simplificationAlgorithm: "visvalingam-whyatt",
    simplificationTolerance: 2.5,
    colorMode: "gradient",
    color: "#f2f2f0",
    palette: [...PILOT_PALETTES.Aurora.colors],
    compositeOperation: PILOT_PALETTES.Aurora.compositeOperation,
    alpha: 1
  }
};
