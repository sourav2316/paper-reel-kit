import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";

export const { fontFamily: DISPLAY_FONT } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: MONO_FONT } = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

// The look lives here. Change colours only here so every video stays consistent.
export const C = {
  sky: "#A9C4C9",
  skyTop: "#9DBBC2",
  paper: "#EFE6D2",
  paperDark: "#DCCFB2",
  cloud: "#F3EBDA",
  red: "#C0392B",
  redDeep: "#9E2B20",
  mustard: "#E3B23C",
  slate: "#1F2A2C",
  slateLight: "#2E3B3D",
  ink: "#2B2B2B",
  cream: "#F1E7D0",
  blue: "#8FB3D9",
  green: "#6E8B3D",
  sage: "#B9C6A3",
  wood: "#A8743F",
  road: "#4A4744",
  brick: "#A9553A",
  glow: "#F2A65A",
};

export const W = 1080;
export const H = 1920;
