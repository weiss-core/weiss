import { SliderComp } from "./SliderComp";
import { COMMON_PROPS, PROPERTY_SCHEMAS, TEXT_PROPS } from "../../../types/widgetProperties";
import type { Widget } from "../../../types/widgets";
import LinearScaleIcon from "@mui/icons-material/LinearScale";

export const Slider: Widget = {
  id: "__Slider__",
  component: SliderComp,
  widgetName: "Slider",
  widgetIcon: LinearScaleIcon,
  widgetLabel: "Slider",
  category: "Controls",
  editableProperties: {
    ...COMMON_PROPS,
    ...TEXT_PROPS,
    width: { ...PROPERTY_SCHEMAS.width, value: 500 },
    height: { ...PROPERTY_SCHEMAS.height, value: 80 },
    label: { ...PROPERTY_SCHEMAS.label, value: "Slider" },
    pvName: PROPERTY_SCHEMAS.pvName,
    disabled: PROPERTY_SCHEMAS.disabled,
    alarmBorder: PROPERTY_SCHEMAS.alarmBorder,
    stepSize: PROPERTY_SCHEMAS.stepSize,
  },
} as const;
