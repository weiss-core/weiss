import { BitIndicatorComp } from "./BitIndicatorComp";
import { PROPERTY_SCHEMAS, COMMON_PROPS } from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import FlakyIcon from "@mui/icons-material/Flaky";

const { borderRadius, backgroundColor, ...FILTERED_COMMON_PROPS } = COMMON_PROPS;

export const BitIndicator: Widget = {
  id: "__BitIndicator__",
  component: BitIndicatorComp,
  widgetName: "BitIndicator",
  widgetIcon: FlakyIcon,
  widgetLabel: "Bit Indicator",
  category: "Monitoring",
  editableProperties: {
    ...FILTERED_COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 40 },
    height: { ...PROPERTY_SCHEMAS.height, value: 40 },
    onColor: PROPERTY_SCHEMAS.onColor,
    offColor: PROPERTY_SCHEMAS.offColor,
    nBits: PROPERTY_SCHEMAS.nBits,
    square: PROPERTY_SCHEMAS.square,
    orientation: PROPERTY_SCHEMAS.orientation,
    invertBitOrder: PROPERTY_SCHEMAS.invertBitOrder,
    spacing: PROPERTY_SCHEMAS.spacing,
    pvName: PROPERTY_SCHEMAS.pvName,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
  },
} as const;
