import { MultiBitIndicatorComp } from "./MultiBitIndicatorComp";
import { PROPERTY_SCHEMAS, COMMON_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import CustomMultiBitIcon from "@components/CustomIcons/MultiBitIcon";

const { borderRadius, backgroundColor, ...FILTERED_COMMON_PROPS } = COMMON_PROPS;

export const MultiBitIndicator: Widget = {
  id: "__BitIndicator__",
  component: MultiBitIndicatorComp,
  widgetName: "MultiBitIndicator",
  widgetIcon: CustomMultiBitIcon,
  widgetLabel: "Multi-Bit Indicator",
  category: "Monitoring",
  editableProperties: {
    ...FILTERED_COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 80 },
    height: { ...PROPERTY_SCHEMAS.height, value: 220 },
    onColor: PROPERTY_SCHEMAS.onColor,
    offColor: PROPERTY_SCHEMAS.offColor,
    nBits: PROPERTY_SCHEMAS.nBits,
    horizontal: PROPERTY_SCHEMAS.horizontal,
    invertBitOrder: PROPERTY_SCHEMAS.invertBitOrder,
    pvName: PROPERTY_SCHEMAS.pvName,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    labelFromPV: { ...PROPERTY_SCHEMAS.labelFromPV, value: false },
    bitLabelPlcmnt: PROPERTY_SCHEMAS.bitLabelPlcmnt,
    bitLabels: PROPERTY_SCHEMAS.bitLabels,
  },
} as const;
