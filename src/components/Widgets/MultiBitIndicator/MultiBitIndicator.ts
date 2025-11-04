import { MultiBitIndicatorComp } from "./MultiBitIndicatorComp";
import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import type { PVData } from "../../../types/epicsWS";
import CustomMultiBitIcon from "@src/components/CustomIcons/MultiBitIcon";

const { borderRadius, backgroundColor, ...FILTERED_COMMON_PROPS } = COMMON_PROPS;

export const MultiBitIndicator: Widget = {
  id: "__MultiBitIndicator__",
  component: MultiBitIndicatorComp,
  widgetName: "MultiBitIndicator",
  widgetIcon: CustomMultiBitIcon,
  widgetLabel: "Bit Indicator",
  category: "Monitoring",
  pvData: {} as PVData,
  editableProperties: {
    ...FILTERED_COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 40 },
    height: { ...PROPERTY_SCHEMAS.height, value: 300 },
    onColor: PROPERTY_SCHEMAS.onColor,
    offColor: PROPERTY_SCHEMAS.offColor,
    nBits: PROPERTY_SCHEMAS.nBits,
    square: PROPERTY_SCHEMAS.square,
    orientation: PROPERTY_SCHEMAS.orientation,
    invertBitOrder: PROPERTY_SCHEMAS.invertBitOrder,
    spacing: PROPERTY_SCHEMAS.spacing,
    pvName: PROPERTY_SCHEMAS.pvName,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    ...TEXT_PROPS,
  },
} as const;
