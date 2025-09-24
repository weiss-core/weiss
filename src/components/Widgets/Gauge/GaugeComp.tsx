import React from "react";
import { useEditorContext } from "../../../context/useEditorContext";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE } from "../../../constants/constants";
import Gauge from "ReactAutomationStudio/components/BaseComponents/Gauge";

const GaugeComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <Gauge
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      macros={macros}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      usePvMinMax={p.limitsFromPV?.value}
      min={p.min?.value}
      max={p.max?.value}
      alarmSensitive={p.alarmBorder?.value}
      ringWidth={p.ringWidth?.value}
      disableContextMenu={inEditMode}
      width={p.width?.value}
      height={p.height?.value}
    />
  );
};

export { GaugeComp };
