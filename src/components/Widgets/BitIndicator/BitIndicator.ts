import { BitIndicatorComp } from "./BitIndicatorComp";
import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import FlakyIcon from "@mui/icons-material/Flaky";
import type { PVData } from "@src/types/epicsWS";

const { borderRadius, backgroundColor, ...FILTERED_COMMON_PROPS } = COMMON_PROPS;

export const BitIndicator: Widget = {
  id: "__BitIndicator__",
  component: BitIndicatorComp,
  widgetName: "BitIndicator",
  widgetIcon: FlakyIcon,
  widgetLabel: "Bit Indicator",
  category: "Monitoring",
  pvData: {} as PVData,
  editableProperties: {
    ...FILTERED_COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 95 },
    height: { ...PROPERTY_SCHEMAS.height, value: 40 },
    onColor: PROPERTY_SCHEMAS.onColor,
    offColor: PROPERTY_SCHEMAS.offColor,
    square: PROPERTY_SCHEMAS.square,
    pvName: PROPERTY_SCHEMAS.pvName,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    labelFromPV: PROPERTY_SCHEMAS.labelFromPV,
    labelPlcmnt: PROPERTY_SCHEMAS.labelPlcmnt,
    useStringVal: PROPERTY_SCHEMAS.useStringVal,
    offLabel: PROPERTY_SCHEMAS.offLabel,
    onLabel: PROPERTY_SCHEMAS.onLabel,
    ...TEXT_PROPS,
  },
} as const;
