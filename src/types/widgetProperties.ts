import type { WidgetProperty, PropertyValue, WidgetProperties } from "./widgets";
import { COLORS } from "@src/constants/constants";

/**
 * Helper function to enforce proper typing of widget properties.
 * Returns the property object as-is but ensures TypeScript infers the correct type.
 * @param prop - A WidgetProperty object
 * @returns The same WidgetProperty object with type enforcement
 */
function defineProp<T extends PropertyValue>(prop: WidgetProperty<T>): WidgetProperty<T> {
  return prop;
}

/**
 * Master schema of all widget properties.
 * Each key defines a property, its type, default value, category, and optional options for select-type properties.
 * Used to standardize widget property definitions across the app.
 */
/* prettier-ignore */
export const PROPERTY_SCHEMAS = {
  // Shared Properties
  disabled:        defineProp({ selType: "boolean", label: "Disabled", value: false as boolean, category: "Other" }),
  macros:          defineProp({ selType: "strRecord", label: "Macro", value: {} as Record<string, string>, category: "EPICS" }),
  // Layout
  x:               defineProp({ selType: "number", label: "X", value: 100 as number, category: "Layout" }),
  y:               defineProp({ selType: "number", label: "Y", value: 100 as number, category: "Layout" }),
  width:           defineProp({ selType: "number", label: "Width", value: 100 as number, category: "Layout" }),
  height:          defineProp({ selType: "number", label: "Height", value: 40 as number, category: "Layout" }),
  label:           defineProp({ selType: "text", label: "Label", value: "" as string, category: "Layout" }),
  tooltip:         defineProp({ selType: "text", label: "Tooltip", value: "" as string, category: "Layout" }),
  visible:         defineProp({ selType: "boolean", label: "Visible", value: true as boolean, category: "Layout" }),
  // Style
  backgroundColor: defineProp({ selType: "colorSel", label: "Background Color", value: COLORS.backgroundColor, category: "Style" }),
  borderColor:     defineProp({ selType: "colorSel", label: "Border Color", value: COLORS.textColor, category: "Style" }),
  borderWidth:     defineProp({ selType: "number", label: "Border Width", value: 1 as number, category: "Style" }),
  borderRadius:    defineProp({ selType: "number", label: "Border Radius", value: 2 as number, category: "Style" }),
  borderStyle:     defineProp({ selType: "select", label: "Border Style", value: "none" as string, options: ["solid", "dashed", "dotted", "none"], category: "Style" }),
  // Font
  textColor:       defineProp({ selType: "colorSel", label: "Text Color", value: COLORS.textColor, category: "Font" }),
  fontSize:        defineProp({ selType: "number", label: "Font Size", value: 14 as number, category: "Font" }),
  fontFamily:      defineProp({ selType: "select", label: "Font Family", value: "sans-serif" as string, options: ["serif", "sans-serif", "monospace", "fantasy", "cursive"], category: "Font" }),
  fontBold:        defineProp({ selType: "boolean", label: "Bold text", value: false as boolean, category: "Font" }),
  fontItalic:      defineProp({ selType: "boolean", label: "Italic text", value: false as boolean, category: "Font" }),
  textHAlign:      defineProp({ selType: "select", label: "Text Horiz. Align", value: "left" as string, options: ["left", "center", "right"], category: "Font" }),
  textVAlign:      defineProp({ selType: "select", label: "Text Vert. Align", value: "middle" as string, options: ["top", "middle", "bottom"], category: "Font" }),
  // Grid options
  gridLineColor:   defineProp({ selType: "colorSel", label: "Grid Line Color", value: COLORS.gridLineColor, category: "Style" }),
  gridLineVisible: defineProp({ selType: "boolean", label: "Grid Visible", value: true as boolean, category: "Grid" }),
  gridSize:        defineProp({ selType: "number", label: "Grid Size", value: 20 as number, category: "Grid" }),
  snapToGrid:      defineProp({ selType: "boolean", label: "Snap items", value: true as boolean, category: "Grid" }),
  centerVisible:   defineProp({ selType: "boolean", label: "Center mark visible", value: true as boolean, category: "Grid" }),
  // EPICS
  pvName:          defineProp({ selType: "text", label: "PV Name", value: "" as string, category: "EPICS" }),
  pvNames:         defineProp({ selType: "strList", label: "PV Name", value: [] as string[], category: "EPICS" }),
  precisionFromPV: defineProp({ selType: "boolean", label: "Precision from PV", value: true as boolean, category: "EPICS" }),
  precision:       defineProp({ selType: "number", label: "Precision", value: -1 as number, category: "EPICS" }),
  unitsFromPV:     defineProp({ selType: "boolean", label: "Units from PV", value: true as boolean, category: "EPICS" }),
  units:           defineProp({ selType: "text", label: "Units", value: "" as string, category: "EPICS" }),
  alarmBorder:     defineProp({ selType: "boolean", label: "Alarm Border", value: true as boolean, category: "EPICS" }),
  labelFromPV:     defineProp({ selType: "boolean", label: "Label(s) from PV", value: true as boolean, category: "EPICS" }),
  actionValue:     defineProp({ selType: "text", label: "Action Value", value: 1 as number | string, category: "EPICS" }),
  // Specific Properties
  // BitIndicators
  orientation:     defineProp({ selType: "select", label: "Orientation", value: "Vertical" as string, options: ["Vertical", "Horizontal"], category: "Layout" }),
  nBits:           defineProp({ selType: "number", label: "Number of bits", value: 8 as number, category: "Layout" }),
  invertBitOrder:  defineProp({ selType: "boolean", label: "Invert bit order", value: false as boolean, category: "Layout" }),
  onColor:         defineProp({ selType: "colorSel", label: "On Color", value: COLORS.onColor, category: "Style" }),
  offColor:        defineProp({ selType: "colorSel", label: "Off Color", value: COLORS.offColor, category: "Style" }),
  spacing:         defineProp({ selType: "number", label: "Spacing", value: 1 as number, category: "Style" }),
  square:          defineProp({ selType: "boolean", label: "Square", value: false as boolean, category: "Style" }),
  useStringVal:    defineProp({ selType: "boolean", label: "Use string value", value: true as boolean, category: "Layout" }),
  offLabel:        defineProp({ selType: "text", label: "Off Label", value: "" as string, category: "Layout" }),
  onLabel:         defineProp({ selType: "text", label: "On Label", value: "" as string, category: "Layout" }),

  // Graph
  lineColors:      defineProp({ selType: "colorSelList", label: "Line Color", value: [COLORS.graphLineColor] as string[], category: "Style" }),
  plotTitle:       defineProp({ selType: "text", label: "Title", value: "Title" as string, category: "Layout" }),
  xAxisTitle:      defineProp({ selType: "text", label: "X axis title", value: "X axis" as string, category: "Layout" }),
  yAxisTitle:      defineProp({ selType: "text", label: "Y axis title", value: "Y axis" as string, category: "Layout" }),
  logscaleY:       defineProp({ selType: "boolean", label: "Apply log to Y", value: false as boolean, category: "Layout" }),
  showLegend:      defineProp({ selType: "boolean", label: "Show legend", value: true as boolean, category: "Layout" }),
  useTimestamp:    defineProp({ selType: "boolean", label: "Use timestamp", value: false as boolean, category: "Layout" }),
  plotBufferSize:  defineProp({ selType: "number", label: "Buffer size (if scalar PVs)", value: 80 as number, category: "Layout" }),
  plotLineStyle:   defineProp({ selType: "select", label: "Line style", value: "lines" as "lines+markers"|"lines"|"markers", options: ["lines+markers", "lines", "markers"], category: "Style" }),
  stepSize:        defineProp({ selType: "number", label: "Step size", value: 1 as number, category: "Layout" }),
  //Gauge
  ringWidth:       defineProp({ selType: "number", label: "Ring width", value: 40 as number, category: "Style" }),
  //Other
  valuePlcmnt:     defineProp({ selType: "select", label: "Value placement", value: "top" as string, options: ["top", "bottom", "end", "start", "middle"], category: "Layout" }),
  labelPlcmnt:     defineProp({ selType: "select", label: "Label placement", value: "end" as string, options: ["top", "bottom", "end", "start", "middle"], category: "Layout" }),
  limitsFromPV:    defineProp({ selType: "boolean", label: "Limits From PV", value: true as boolean, category: "EPICS" }),
  min:             defineProp({ selType: "number", label: "Minimum value", value: 0 as number, category: "EPICS" }),
  max:             defineProp({ selType: "number", label: "Maximum value", value: 0 as number, category: "EPICS" }),

};

/**
 * Defines the preferred order for displaying property categories in the UI.
 */
export const CATEGORY_DISPLAY_ORDER = [
  "EPICS",
  "Grid",
  "Layout",
  "Style",
  "Font",
  "General",
  "Window",
  "Other",
];

/**
 * Common set of widget properties shared across most widgets.
 */
export const COMMON_PROPS: WidgetProperties = {
  x: PROPERTY_SCHEMAS.x,
  y: PROPERTY_SCHEMAS.y,
  width: PROPERTY_SCHEMAS.width,
  height: PROPERTY_SCHEMAS.height,
  backgroundColor: PROPERTY_SCHEMAS.backgroundColor,
  borderColor: PROPERTY_SCHEMAS.borderColor,
  borderStyle: PROPERTY_SCHEMAS.borderStyle,
  borderWidth: PROPERTY_SCHEMAS.borderWidth,
  borderRadius: PROPERTY_SCHEMAS.borderRadius,
  visible: PROPERTY_SCHEMAS.visible,
  tooltip: PROPERTY_SCHEMAS.tooltip,
};

/**
 * Common text-related properties for widgets displaying text.
 */
export const TEXT_PROPS: WidgetProperties = {
  fontSize: PROPERTY_SCHEMAS.fontSize,
  fontFamily: PROPERTY_SCHEMAS.fontFamily,
  fontBold: PROPERTY_SCHEMAS.fontBold,
  fontItalic: PROPERTY_SCHEMAS.fontItalic,
  textColor: PROPERTY_SCHEMAS.textColor,
  textVAlign: PROPERTY_SCHEMAS.textVAlign,
  textHAlign: PROPERTY_SCHEMAS.textHAlign,
};

/**
 * Properties commonly used for plot widgets.
 */
export const PLOT_PROPS: WidgetProperties = {
  backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: "white" },
  lineColors: PROPERTY_SCHEMAS.lineColors,
  plotTitle: PROPERTY_SCHEMAS.plotTitle,
  xAxisTitle: PROPERTY_SCHEMAS.xAxisTitle,
  yAxisTitle: PROPERTY_SCHEMAS.yAxisTitle,
  logscaleY: PROPERTY_SCHEMAS.logscaleY,
  plotBufferSize: PROPERTY_SCHEMAS.plotBufferSize,
  showLegend: PROPERTY_SCHEMAS.showLegend,
  useTimestamp: PROPERTY_SCHEMAS.useTimestamp,
};
