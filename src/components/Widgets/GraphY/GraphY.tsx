import { GraphYComp } from "./GraphYComp";
import {
  COMMON_PROPS,
  PLOT_PROPS,
  PROPERTY_SCHEMAS,
  TEXT_PROPS,
} from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import TimelineIcon from "@mui/icons-material/Timeline";
import type { MultiPvData } from "../../../types/epicsWS";

export const YAxisPVLabel = "Y Axis PV";
export const XAxisPVLabel = "X Axis PV (optional)";

export const GraphY: Widget = {
  id: "__GraphYComp__",
  component: GraphYComp,
  widgetName: "GraphY",
  widgetIcon: TimelineIcon,
  widgetLabel: "Graphic GraphY",
  category: "Monitoring",
  multiPvData: {} as MultiPvData,
  editableProperties: {
    ...COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 480 },
    height: { ...PROPERTY_SCHEMAS.height, value: 260 },
    ...TEXT_PROPS,
    pvNames: { ...PROPERTY_SCHEMAS.pvNames },
    ...PLOT_PROPS,
  },
} as const;
