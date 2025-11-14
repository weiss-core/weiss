import { COLORS } from "@src/constants/constants";
import type { Widget } from "@src/types/widgets";
import { PROPERTY_SCHEMAS, COMMON_PROPS } from "@src/types/widgetProperties";
import { RectangleComp } from "./RectangleComp";
import RectangleIcon from "@mui/icons-material/Rectangle";

export const Rectangle: Widget = {
  id: "__Rectangle__",
  component: RectangleComp,
  widgetName: "Rectangle",
  widgetIcon: RectangleIcon,
  widgetLabel: "Rectangle",
  category: "Basic",
  editableProperties: {
    ...COMMON_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 80 },
    height: { ...PROPERTY_SCHEMAS.height, value: 80 },
    backgroundColor: { ...PROPERTY_SCHEMAS.backgroundColor, value: COLORS.lightGray },
  },
} as const;
