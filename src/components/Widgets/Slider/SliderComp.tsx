import React from "react";
import { Slider } from "@mui/material";
import { useEditorContext } from "@src/context/useEditorContext";
import type { WidgetUpdate } from "@src/types/widgets";
import AlarmBorder from "@components/AlarmBorder/AlarmBorder";

const SliderComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { inEditMode, writePVValue } = useEditorContext();
  const p = data.editableProperties;
  const pvData = data.pvData;
  if (!p.visible?.value) return null;

  const runtimeMin = (p.limitsFromPV?.value ? pvData?.display?.limitLow : p.min?.value) ?? 0;
  const runtimeMax = (p.limitsFromPV?.value ? pvData?.display?.limitHigh : p.max?.value) ?? 1;
  const min = inEditMode ? 0 : runtimeMin;
  const max = inEditMode ? 1 : runtimeMax;
  const runtimeVal = typeof pvData?.value === "number" ? pvData.value : min;
  const step = p.stepSize?.value && p.stepSize?.value > max - min ? p.stepSize?.value : undefined;
  const value = inEditMode ? 0 : runtimeVal;
  const isHorizontal = p.horizontal?.value ?? true;
  const orientation = isHorizontal ? "horizontal" : "vertical";

  const handleChange = (_: Event | React.SyntheticEvent<Element, Event>, newValue: number) => {
    if (!inEditMode && p.pvName?.value && typeof newValue === "number") {
      writePVValue(p.pvName.value, newValue);
    }
  };

  return (
    <AlarmBorder alarmData={pvData?.alarm} enable={p.alarmBorder?.value}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <Slider
          orientation={orientation}
          min={min}
          max={max}
          value={value}
          step={step}
          marks={step !== undefined}
          disabled={p.disabled?.value}
          onChange={handleChange}
          sx={{
            color: p.backgroundColor?.value ?? "primary.main",
            width: isHorizontal ? "90%" : undefined,
            height: !isHorizontal ? "90%" : undefined,
            pointerEvents: inEditMode ? "none" : "auto",
            flexShrink: 0,
          }}
        />
      </div>
    </AlarmBorder>
  );
};
export { SliderComp };
