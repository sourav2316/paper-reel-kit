import React from "react";
import { Composition } from "remotion";
import { Video, totalSeconds, type VideoProps } from "./engine/Video";
import { W, H } from "./theme";
import demo from "../public/projects/demo/storyboard.json";
import type { Storyboard } from "./engine/types";
import { Thumb, type ThumbProps } from "./Thumb";
import renderDefaults from "./render-defaults.json";

export const Root: React.FC = () => (
  <>
  <Composition
    id="Reel"
    component={Video as unknown as React.FC<Record<string, unknown>>}
    width={W}
    height={H}
    fps={renderDefaults.finalFps}
    durationInFrames={300}
    defaultProps={{ storyboard: demo as unknown as Storyboard, base: "projects/demo", available: null } satisfies VideoProps}
    calculateMetadata={({ props }) => {
      const { storyboard, frameRate = renderDefaults.finalFps } = props as unknown as VideoProps;
      return { fps: frameRate, durationInFrames: Math.ceil(totalSeconds(storyboard) * frameRate) };
    }}
  />
  <Composition
    id="Thumb"
    component={Thumb as unknown as React.FC<Record<string, unknown>>}
    width={W}
    height={H}
    fps={renderDefaults.draftFps}
    durationInFrames={1}
    defaultProps={{ base: "projects/demo", available: null, at: 0, title: { l1: "THUMBNAIL", l2: "PREVIEW" }, scene: { id: "t", start: 0, end: 1, set: { builtin: "anatomy" } } } satisfies ThumbProps}
  />
  </>
);
