import { ProgressBarComp } from "./ProgressBarComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import PercentIcon from "@mui/icons-material/Percent";

export const ProgressBar: Widget = {
  id: "__Slider__",
  component: ProgressBarComp,
  widgetName: "ProgressBar",
  widgetIcon: PercentIcon,
  widgetLabel: "ProgressBar",
  category: "Monitoring",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 500 },
    height: { ...PROPERTY_SCHEMAS.height, value: 80 },
    label: { ...PROPERTY_SCHEMAS.label, value: "ProgressBar" },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    limitsFromPV: PROPERTY_SCHEMAS.limitsFromPV,
    min: PROPERTY_SCHEMAS.min,
    max: PROPERTY_SCHEMAS.max,
    showValue: PROPERTY_SCHEMAS.showValue,
  },
} as const;
