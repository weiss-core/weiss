import { InputFieldComp } from "./InputFieldComp";
import { COLORS } from "@src/constants/constants";
import type { Widget } from "@src/types/widgets";
import InputIcon from "@mui/icons-material/Input";
import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { PVData } from "@src/types/epicsWS";

export const InputField: Widget = {
  id: "__InputField__",
  component: InputFieldComp,
  widgetName: "InputField",
  widgetIcon: InputIcon,
  widgetLabel: "Input Field",
  category: "Controls",
  pvData: {} as PVData,
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.inputColor },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    units: PROPERTY_SCHEMAS.units,
    unitsFromPV: PROPERTY_SCHEMAS.unitsFromPV,
  },
} as const;
