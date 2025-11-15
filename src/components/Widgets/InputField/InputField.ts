import { InputFieldComp } from "./InputFieldComp";
import { COLORS } from "@src/constants/constants";
import type { Widget } from "@src/types/widgets";
import InputIcon from "@mui/icons-material/Input";
import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { PVData } from "@src/types/epicsWS";

const { textVAlign, textHAlign, ...FILTERED_TEXT_PROPS } = TEXT_PROPS;

export const InputField: Widget = {
  id: "__InputField__",
  component: InputFieldComp,
  widgetName: "InputField",
  widgetIcon: InputIcon,
  widgetLabel: "Input Field",
  category: "Controls",
  pvData: {} as PVData,
  editableProperties: {
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.inputColor },
    pvName: PROPERTY_SCHEMAS.pvName,
    unitsFromPV: PROPERTY_SCHEMAS.unitsFromPV,
    units: PROPERTY_SCHEMAS.units,
    disabled: PROPERTY_SCHEMAS.disabled,
    ...COMMON_PROPS,
    ...FILTERED_TEXT_PROPS,
  },
} as const;
