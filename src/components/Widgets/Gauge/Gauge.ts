import { GaugeComp } from "./GaugeComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import SpeedIcon from "@mui/icons-material/Speed";

export const Gauge: Widget = {
  id: "__Gauge__",
  component: GaugeComp,
  widgetName: "Gauge",
  widgetIcon: SpeedIcon,
  widgetLabel: "Gauge",
  category: "Monitoring",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 200 },
    height: { ...PROPERTY_SCHEMAS.height, value: 100 },
    label: { ...PROPERTY_SCHEMAS.label, value: "Gauge" },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    limitsFromPV: PROPERTY_SCHEMAS.limitsFromPV,
    min: PROPERTY_SCHEMAS.min,
    max: PROPERTY_SCHEMAS.max,
    ringWidth: PROPERTY_SCHEMAS.ringWidth,
  },
} as const;
