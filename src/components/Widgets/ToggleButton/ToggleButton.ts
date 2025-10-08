import { ToggleButtonComp } from "./ToggleButtonComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "@src/types/widgetProperties";
import type { Widget } from "@src/types/widgets";
import { COLORS } from "@src/constants/constants";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

export const ToggleButton: Widget = {
  id: "__ToggleButton__",
  component: ToggleButtonComp,
  widgetName: "ToggleButton",
  widgetIcon: PowerSettingsNewIcon,
  widgetLabel: "Toggle Button",
  category: "Controls",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    label: { ...PROPERTY_SCHEMAS.label, value: "Toggle Button" },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.buttonColor },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    onColor: PROPERTY_SCHEMAS.onColor,
    offColor: PROPERTY_SCHEMAS.offColor,
  },
} as const;
