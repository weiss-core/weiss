import React from "react";
import { useEditorContext } from "../../../context/useEditorContext";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE } from "../../../constants/constants";
import Slider from "ReactAutomationStudio/components/BaseComponents/Slider";

const SliderComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const isEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <Slider
      key={mode}
      editMode={isEditMode}
      pv={p.pvName?.value ?? ""}
      macros={macros}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      usePvMinMax={true}
      step={p.stepSize?.value}
    />
  );
};

export { SliderComp };
