import { PROPERTY_SCHEMAS, COMMON_PROPS, TEXT_PROPS } from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import { TextLabelComp } from "./TextLabelComp";
import TextFieldsIcon from "@mui/icons-material/TextFields";

export const TextLabel: Widget = {
  id: "__TextLabel__",
  component: TextLabelComp,
  widgetName: "TextLabel",
  widgetIcon: TextFieldsIcon,
  widgetLabel: "Text Label",
  category: "Basic",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    label: { ...PROPERTY_SCHEMAS.label, value: "Text Label" },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: "transparent" },
  },
} as const;
