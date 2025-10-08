import React from "react";
import { useEditorContext } from "@src/context/useEditorContext";
import type { WidgetUpdate } from "@src/types/widgets";
import { EDIT_MODE } from "@src/constants/constants";
import SelectionInput from "@ReactAutomationStudio/components/BaseComponents/SelectionInput";

const DropDownComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <SelectionInput
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      macros={macros}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      alarmSensitive={p.alarmBorder?.value}
      disableContextMenu={inEditMode}
      backgroundColor={p.backgroundColor?.value}
    />
  );
};

export { DropDownComp };
