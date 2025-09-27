import React from "react";
import { useEditorContext } from "../../../context/useEditorContext";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE } from "../../../constants/constants";
import ProgressBar from "ReactAutomationStudio/components/BaseComponents/ProgressBar";

const ProgressBarComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <ProgressBar
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
      alarmSensitive={p.alarmBorder?.value}
      disableContextMenu={inEditMode}
      backgroundColor={p.backgroundColor?.value}
    />
  );
};

export { ProgressBarComp };
