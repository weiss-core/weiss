import { ActionButtonComp } from "./ActionButtonComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import SendIcon from "@mui/icons-material/Send";
import { COLORS } from "@src/constants/constants";
import type { PVData } from "@src/types/epicsWS";

export const ActionButton: Widget = {
  id: "__ActionButton__",
  component: ActionButtonComp,
  widgetName: "ActionButton",
  widgetIcon: SendIcon,
  widgetLabel: "Action Button",
  category: "Controls",
  pvData: {} as PVData,
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    label: { ...PROPERTY_SCHEMAS.label, value: "Action Button" },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.buttonColor },
    pvName: PROPERTY_SCHEMAS.pvName,
    actionValue: PROPERTY_SCHEMAS.actionValue,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
  },
} as const;
