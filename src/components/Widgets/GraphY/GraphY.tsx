import { GraphYComp } from "./GraphYComp";
import {
  COMMON_PROPS,
  PLOT_PROPS,
  PROPERTY_SCHEMAS,
  TEXT_PROPS,
} from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import ShowChartIcon from "@mui/icons-material/ShowChart";

export const GraphY: Widget = {
  id: "__GraphYComp__",
  component: GraphYComp,
  widgetName: "GraphY",
  widgetIcon: ShowChartIcon,
  widgetLabel: "Graph Y",
  category: "Monitoring",
  editableProperties: {
    ...COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 480 },
    height: { ...PROPERTY_SCHEMAS.height, value: 260 },
    ...TEXT_PROPS,
    pvNames: PROPERTY_SCHEMAS.pvNames,
    ...PLOT_PROPS,
  },
} as const;
