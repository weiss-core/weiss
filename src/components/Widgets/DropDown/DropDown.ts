import { DropDownComp } from "./DropDownComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export const DropDown: Widget = {
  id: "__Slider__",
  component: DropDownComp,
  widgetName: "DropDown",
  widgetIcon: ArrowDropDownIcon,
  widgetLabel: "Drop Down",
  category: "Controls",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 100 },
    height: { ...PROPERTY_SCHEMAS.height, value: 80 },
    label: { ...PROPERTY_SCHEMAS.label, value: "DropDown" },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    limitsFromPV: PROPERTY_SCHEMAS.limitsFromPV,
    min: PROPERTY_SCHEMAS.min,
    max: PROPERTY_SCHEMAS.max,
    showValue: PROPERTY_SCHEMAS.showValue,
  },
} as const;
