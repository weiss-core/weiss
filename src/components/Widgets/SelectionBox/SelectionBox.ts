import { SelectionBoxComp } from "./SelectionBoxComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import CustomDropdownIcon from "@src/components/CustomIcons/DropDownIcon";
import type { PVData } from "@src/types/epicsWS";

export const SelectionBox: Widget = {
  id: "__SelectionBox__",
  component: SelectionBoxComp,
  widgetName: "SelectionBox",
  widgetIcon: CustomDropdownIcon,
  widgetLabel: "Selection Box",
  category: "Controls",
  pvData: {} as PVData,
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    label: { ...PROPERTY_SCHEMAS.label, value: "Selection Box" },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: "transparent" },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    enumChoices: PROPERTY_SCHEMAS.enumChoices,
    labelFromPV: PROPERTY_SCHEMAS.labelFromPV,
  },
} as const;
