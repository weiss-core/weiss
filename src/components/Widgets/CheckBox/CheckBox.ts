import { CheckBoxComp } from "./CheckBoxComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import { COLORS } from "../../../constants/constants";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export const CheckBox: Widget = {
  id: "__Checkbox__",
  component: CheckBoxComp,
  widgetName: "CheckBox",
  widgetIcon: CheckBoxIcon,
  widgetLabel: "CheckBox",
  category: "Controls",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 140 },
    height: { ...PROPERTY_SCHEMAS.height, value: 50 },
    label: { ...PROPERTY_SCHEMAS.label, value: "CheckBox" },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.buttonColor },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
  },
} as const;
