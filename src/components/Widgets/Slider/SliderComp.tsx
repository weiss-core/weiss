import React from "react";
import { useEditorContext } from "@src/context/useEditorContext";
import type { WidgetUpdate } from "@src/types/widgets";
import { EDIT_MODE } from "@src/constants/constants";
import Slider from "@ReactAutomationStudio/components/BaseComponents/Slider";

const SliderComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <Slider
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      macros={macros}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      showValue={p.showValue?.value}
      usePvMinMax={p.limitsFromPV?.value}
      min={p.min?.value}
      max={p.max?.value}
      step={p.stepSize?.value}
      alarmSensitive={p.alarmBorder?.value}
      disableContextMenu={inEditMode}
      vertical={!p.horizontal?.value}
      valuePlacement={p.valuePlcmnt?.value}
    />
  );
};

export { SliderComp };
