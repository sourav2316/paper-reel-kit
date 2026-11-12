import type { Ambient, EnterKind } from "./anim";

/**
 * STORYBOARD SCHEMA — the only thing an AI agent writes for a new video.
 * All times are ABSOLUTE seconds on the voiceover timeline.
 * Positions: x / y are the CENTER of the element as a fraction of the frame (0..1). w = width as a fraction of frame width.
 * Paths: "assets/auto.png" is relative to the project folder (public/projects/<name>/); "/sfx/pop.mp3" is from public/.
 */
export type Storyboard = {
  title: string;
  audio?: string;            // voiceover, e.g. "vo.mp3"
  audioVolume?: number;      // default 1
  music?: string | false;    // background music; omitted = auto-picked from public/music/, false = none
  musicVolume?: number;      // default 0.065 (6.5%)
  endPadding?: number;       // seconds of hold after the last scene, default 0.5
  scenes: Scene[];
};

export type Tint = "normal" | "desaturate" | "night" | "sunset" | "calm" | "warm" | "dark";

export type Transition = "cut" | "fade" | "blur" | "scan" | "push" | "wipe-left";

export type SetSpec =
  | { builtin: BuiltinSet; options?: Record<string, unknown> }
  | { image: string; fit?: "cover" | "contain"; ambient?: Ambient;
      /** time-lapse with AI images: same picture at another time of day, crossfaded in at `at` (abs s) over `fade` s */
      variants?: { at: number; image: string; fade?: number }[] };

export type BuiltinSet =
  | "skyline"       // sky + paper clouds + apartment blocks + road with zebra crossing
  | "street"        // shop row with signboards + road + kerb + footpath
  | "balcony"       // sky, distant city, railing, ledge, clothesline
  | "anatomy"       // dark slate "Gray's Anatomy" board (add a "body" layer on top)
  | "room"          // wall, barred window, floor, striped rug, side table
  | "office"        // windows, wall with sticky notes, desk top
  | "kitchen"       // tiles, shelf, counter, window
  | "checker-room"  // cream wall, railing top, checker floor
  | "night-city"    // stars, moon, dark skyline
  | "sunrise"       // warm sky, sun, hills, path
  | "jungle"        // sky, trees, tall grass
  | "lab"           // pale-green plank wall + floor (data-viz backdrop)
  | "corkboard"     // plank wall + pinned corkboard
  | "wood-desk"     // top-down wooden desk (CTA)
  | "showroom"     // phone/electronics shop: shelves, swinging banner (options.banner, banner2), glass counter
  | "bank"         // bank hall: teller windows (options.windows), token board, fan, counter
  | "iceberg"      // sky + sea: small tip above water, huge hidden mass below (options.waterline)
  | "bedroom"      // night bedroom: window with sky time-lapse (options.sky, skyChanges), waving curtain, lamp, wall clock (options.clock), bed; options.light "phone"|"lamp"|"day"|"dark"
  | "library"      // bookshelves, desk lamp, desk — studies, books, research
  | "paper";        // plain paper

export type Camera = {
  zoomFrom?: number;   // default 1
  zoomTo?: number;     // default 1.04 (slow breathing push)
  focusX?: number;     // 0..1 zoom origin
  focusY?: number;
  pushAt?: number;     // absolute second to start an extra fast push-in
  pushTo?: number;     // zoom reached by the push
  shakeAt?: number[];  // absolute seconds for an impact shake
};

export type Headline = {
  at: number;          // when line 1 appears
  small?: string;      // line 1 (small, ink/cream)
  big?: string;        // line 2 (big, red) — slams in at bigAt
  bigAt?: number;      // default at + 0.35
  bigColor?: "red" | "blue" | "mustard" | "cream" | "ink";
  until?: number;      // default: next headline or scene end
  y?: number;          // override vertical position (fraction)
};

export type TintChange = { at: number; tint: Tint };

export type Scene = {
  id: string;
  start: number;
  end: number;
  set: SetSpec;
  tint?: Tint;
  tintChanges?: TintChange[];
  camera?: Camera;
  transitionIn?: Transition;     // how this scene arrives (default "blur")
  transitionDuration?: number;   // seconds, default 0.6 (scan 0.9)
  caption?: string;              // tiny mono caption top-right, e.g. "GRAY'S ANATOMY, 1918"
  dark?: boolean;                // light text + light rule (auto for anatomy/night-city)
  headlines?: Headline[];
  layers?: Layer[];
};

/** Common placement/animation fields for every layer. */
export type Base = {
  x?: number; y?: number; w?: number;
  z?: number;                  // stacking; default by order
  at?: number;                 // appear time (abs s). default scene start
  out?: number;                // disappear time (abs s)
  enter?: EnterKind;           // default "pop"
  exit?: "fade" | "pop" | "slide-down" | "slide-left" | "slide-right";
  ambient?: Ambient;
  ambientAmount?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
  move?: { toX?: number; toY?: number; toW?: number; at?: number; dur?: number; ease?: "linear" | "inOut" | "out" };
  parallax?: number;           // 0 = locked to camera, 1 = full camera zoom (default 1)
  shadow?: boolean;            // soft contact shadow under cutouts (default true for images)
  sfx?: string;                // sound played at `at`
  sfxVolume?: number;
  glow?: boolean;
};

export type Layer = Base & (
  | { type: "image"; src: string; blend?: "normal" | "multiply"; label?: string }
  | { type: "prop"; name: PropName; text?: string; color?: string; value?: number; ringing?: boolean }
  | { type: "cloud"; variant?: number }
  | { type: "birds"; count?: number }
  | { type: "steam" }
  | { type: "rain" }
  | { type: "flare" }
  | { type: "burst"; text: string }
  | { type: "bubble"; text?: string; check?: boolean; items?: string[] }
  | { type: "note"; text: string; sub?: string; stamp?: string }
  | { type: "notifications"; items: string[]; interval?: number }
  | { type: "stamp"; text: string; color?: string }
  | { type: "mark"; kind: "circle" | "check" | "cross" | "underline" | "squiggle" | "arrow"; color?: string; h?: number; dur?: number; hand?: boolean }
  | { type: "counter"; from?: number; to: number; digits?: number; suffix?: string; dur?: number }
  | { type: "isotype"; rows?: number; cols?: number; fill: number; fillColor?: string; baseColor?: string; dur?: number }
  | { type: "bars"; values: number[]; labels?: string[]; colors?: string[]; max?: number; dur?: number }
  | { type: "ecg"; dur?: number }
  | { type: "calendar"; month?: string; year?: string; crossed?: number; flipTo?: string[]; dur?: number }
  | { type: "body"; brain?: OrganState; lungs?: OrganState; heart?: OrganState; stomach?: OrganState; adrenals?: OrganState; kidneys?: OrganState;
      bell?: boolean; ringing?: boolean; switchState?: "off" | "on" | "broken" | "none"; particles?: boolean; gears?: boolean; calm?: boolean; zoom?: "full" | "head" | "torso" }
  | { type: "orbit"; items: string[]; rx?: number; ry?: number }
  | { type: "text"; text: string; size?: number; color?: string; font?: "display" | "mono" }
  | { type: "price"; value: string; old?: string; prefix?: string; style?: "tag" | "plain" | "card"; color?: string; scan?: boolean; countTo?: number; countAt?: number; countDur?: number; label?: string; markAt?: number; markFirstAt?: number; markLastAt?: number; markColor?: string; hand?: boolean }
  | { type: "listing"; title: string; price: string; old?: string; off?: string; rating?: number; img?: string; badge?: string; markAt?: number }
  | { type: "chat"; name?: string; messages: { from: "me" | "them"; text: string; at?: number }[]; interval?: number }
  | { type: "newspaper"; masthead?: string; date?: string; headline: string; sub?: string; markAt?: number }
  | { type: "balance"; left: { label: string; value: string; weight?: number }; right: { label: string; value: string; weight?: number }; rightAt?: number; leftColor?: string; rightColor?: string }
  | { type: "figure"; pose: "stand" | "walk" | "slump" | "stretch" | "sit-phone" | "sit-desk" | "lie-phone" | "sleep" | "lie-awake"; style?: "paper" | "silhouette"; skin?: string; hair?: string; shirt?: string; pants?: string; color?: string; rim?: string; blanket?: string }
  | { type: "reelfeed"; from?: number; to?: number; interval?: number; label?: string }
  | { type: "receipt"; title?: string; items: { label: string; price: number; at?: number }[]; budget?: number; interval?: number; stamp?: string; stampAt?: number; markTotalAt?: number; totalLabel?: string }
  | { type: "sfx" }
);

export type OrganState = "hidden" | "line" | "on" | "glow";

export type PropName =
  | "alarm-clock" | "phone" | "chai" | "battery" | "stopwatch" | "bell" | "switch" | "lightbulb"
  | "question" | "exclaim" | "heart-icon" | "moon" | "sun" | "shield" | "pen" | "coffee" | "glasses"
  | "ladder" | "paper" | "pole" | "plant" | "qr-stand" | "book" | "charger";
