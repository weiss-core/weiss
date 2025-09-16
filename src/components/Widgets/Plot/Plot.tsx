import { PlotComp } from "./PlotComp";
import { COMMON_PROPS, PLOT_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import TimelineIcon from "@mui/icons-material/Timeline";

export const YAxisPVLabel = "Y Axis PV";
export const XAxisPVLabel = "X Axis PV (optional)";

export const Plot: Widget = {
  id: "__PlotComp__",
  component: PlotComp,
  widgetName: "Plot",
  widgetIcon: TimelineIcon,
  widgetLabel: "Graphic Plot",
  category: "Monitoring",
  editableProperties: {
    ...COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 480 },
    height: { ...PROPERTY_SCHEMAS.height, value: 260 },
    ...TEXT_PROPS,
    pvNames: { ...PROPERTY_SCHEMAS.pvNames, value: { [YAxisPVLabel]: "", [XAxisPVLabel]: "" } },
    ...PLOT_PROPS,
  },
} as const;
