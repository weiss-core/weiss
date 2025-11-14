import type { CSSProperties } from "react";

/**
 * Color palette used across the application.
 * Values are read dynamically from CSS variables.
 */
export const COLORS = {
  // Darker
  textColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color").trim(),
  titleBarColor: getComputedStyle(document.documentElement)
    .getPropertyValue("--title-bar-color")
    .trim(),
  graphLineColor: getComputedStyle(document.documentElement)
    .getPropertyValue("--graph-line-color")
    .trim(),
  midDarkBlue: getComputedStyle(document.documentElement)
    .getPropertyValue("--mid-dark-blue")
    .trim(),

  // Status / highlights
  highlighted: getComputedStyle(document.documentElement).getPropertyValue("--highlighted").trim(),
  onColor: getComputedStyle(document.documentElement).getPropertyValue("--on-color").trim(),
  offColor: getComputedStyle(document.documentElement).getPropertyValue("--off-color").trim(),
  minor: getComputedStyle(document.documentElement).getPropertyValue("--minor").trim(),
  major: getComputedStyle(document.documentElement).getPropertyValue("--major").trim(),
  invalid: getComputedStyle(document.documentElement).getPropertyValue("--invalid").trim(),
  disconnected: getComputedStyle(document.documentElement)
    .getPropertyValue("--disconnected")
    .trim(),

  // Neutrals / base
  backgroundColor: getComputedStyle(document.documentElement)
    .getPropertyValue("--background-color")
    .trim(),
  inputColor: getComputedStyle(document.documentElement).getPropertyValue("--input-color").trim(),
  readColor: getComputedStyle(document.documentElement).getPropertyValue("--read-color").trim(),
  lightGray: getComputedStyle(document.documentElement).getPropertyValue("--light-gray").trim(),
  gridLineColor: getComputedStyle(document.documentElement)
    .getPropertyValue("--grid-line-color")
    .trim(),
  buttonColor: getComputedStyle(document.documentElement).getPropertyValue("--button-color").trim(),
  labelColor: getComputedStyle(document.documentElement).getPropertyValue("--label-color").trim(),
};

/** z-index value for back layer of the UI (read from CSS variable) */
export const BACK_UI_ZIDX = parseInt(
  getComputedStyle(document.documentElement, null).getPropertyValue("--back-ui-zidx")
);

/** z-index value for front layer of the UI (read from CSS variable) */
export const FRONT_UI_ZIDX = parseInt(
  getComputedStyle(document.documentElement, null).getPropertyValue("--front-ui-zidx")
);

/** URL of the project source repository */
export const APP_SRC_URL = "https://github.com/weiss-core/weiss.git";

/** WebSocket server URL for PV communication */
export const WS_URL = "ws://localhost:8080";

/** Editor mode string (design time) */
export const EDIT_MODE = "edit";

/** Runtime mode string (connected to PVs) */
export const RUNTIME_MODE = "runtime";

/** Union type for valid app modes */
export type Mode = typeof EDIT_MODE | typeof RUNTIME_MODE;

/** Width of the widget selector panel in pixels */
export const WIDGET_SELECTOR_WIDTH = 230;

/** Width of the property editor panel in pixels */
export const PROPERTY_EDITOR_WIDTH = 320;

/** Reserved ID for the grid widget */
export const GRID_ID = "__grid__";

/** Maximum number of actions stored in undo/redo history */
export const MAX_HISTORY = 100;

/** Maximum allowed zoom level */
export const MAX_ZOOM = 100;

/** Minimum allowed zoom level */
export const MIN_ZOOM = 0.2;

/**
 * Mapping of widget alignment keywords to CSS `justifyContent` values.
 */
export const FLEX_ALIGN_MAP: Record<string, CSSProperties["justifyContent"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

/**
 * Mapping of widget alignment keywords to CSS `textAlign` values.
 */
export const INPUT_TEXT_ALIGN_MAP: Record<string, CSSProperties["textAlign"]> = {
  left: "left",
  center: "center",
  right: "right",
};
