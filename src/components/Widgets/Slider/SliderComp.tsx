import React, { useState, useEffect, useRef } from "react";
import { Slider } from "@mui/material";
import { useEditorContext } from "@src/context/useEditorContext";
import type { WidgetUpdate } from "@src/types/widgets";
import AlarmBorder from "@components/AlarmBorder/AlarmBorder";

const SliderComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { inEditMode, writePVValue } = useEditorContext();
  const p = data.editableProperties;
  const pvData = data.pvData;
  const min =
    (!inEditMode && p.limitsFromPV?.value ? pvData?.display?.limitLow : p.min?.value) ?? 0;
  const max =
    (!inEditMode && p.limitsFromPV?.value ? pvData?.display?.limitHigh : p.max?.value) ?? 100;
  const step = p.stepSize?.value && p.stepSize?.value > max - min ? p.stepSize?.value : undefined;
  const isHorizontal = p.horizontal?.value ?? true;
  const orientation = isHorizontal ? "horizontal" : "vertical";

  const pvValue = typeof pvData?.value === "number" ? pvData.value : min;
  const [localValue, setLocalValue] = useState<number>(pvValue);

  const throttleDelay = 10; // ms
  const lastSent = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local slider synced with PV updates (unless the user is moving it)
  useEffect(() => {
    if (!inEditMode) setLocalValue(pvValue);
  }, [pvValue, inEditMode]);

  const handleChange = (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
    if (typeof newValue !== "number") return;
    setLocalValue(newValue);
    const pv = p.pvName?.value;
    if (inEditMode || !pv) return;

    const now = Date.now();
    if (now - lastSent.current > throttleDelay) {
      lastSent.current = now;
      writePVValue(pv, newValue);
    } else {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        lastSent.current = Date.now();
        writePVValue(pv, newValue);
      }, throttleDelay);
    }
  };

  if (!p.visible?.value) return null;

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
          value={localValue}
          min={min}
          max={max}
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
