import { TextUpdateComp } from "./TextUpdateComp";
import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "../../../types/widgetProperties";
import { COLORS } from "../../../constants/constants";
import type { Widget } from "../../../types/widgets";
import TextsmsIcon from "@mui/icons-material/Textsms";
import type { PVData } from "../../../types/epicsWS";

export const TextUpdate: Widget = {
  id: "__TextUpdate__",
  component: TextUpdateComp,
  widgetName: "TextUpdate",
  widgetIcon: TextsmsIcon,
  widgetLabel: "Text Update",
  category: "Monitoring",
  pvData: {} as PVData,
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    label: { ...PROPERTY_SCHEMAS.label, value: "Text Update" },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.readColor },
    pvName: PROPERTY_SCHEMAS.pvName,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    unitsFromPV: PROPERTY_SCHEMAS.unitsFromPV,
    units: PROPERTY_SCHEMAS.units,
    precisionFromPV: PROPERTY_SCHEMAS.precisionFromPV,
    precision: PROPERTY_SCHEMAS.precision,
  },
} as const;
