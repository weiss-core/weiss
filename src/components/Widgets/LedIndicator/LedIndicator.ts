import { LedIndicatorComp } from "./LedIndicatorComp";
import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import FlakyIcon from "@mui/icons-material/Flaky";

const { borderRadius, backgroundColor, ...FILTERED_COMMON_PROPS } = COMMON_PROPS;

export const LedIndicator: Widget = {
  id: "__LedIndicator__",
  component: LedIndicatorComp,
  widgetName: "LedIndicator",
  widgetIcon: FlakyIcon,
  widgetLabel: "Led Indicator",
  category: "Monitoring",
  editableProperties: {
    ...FILTERED_COMMON_PROPS,
    ...TEXT_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 80 },
    height: { ...PROPERTY_SCHEMAS.height, value: 60 },
    onColor: PROPERTY_SCHEMAS.onColor,
    offColor: PROPERTY_SCHEMAS.offColor,
    pvName: PROPERTY_SCHEMAS.pvName,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    labelFromPV: PROPERTY_SCHEMAS.labelFromPV,
    showValue: PROPERTY_SCHEMAS.showValue,
    useStrValue: PROPERTY_SCHEMAS.useStrValue,
  },
} as const;
