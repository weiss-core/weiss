import React from "react";
import { useEditorContext } from "@src/context/useEditorContext";
import type { WidgetUpdate } from "@src/types/widgets";
import { EDIT_MODE } from "@src/constants/constants";
import CheckBox from "@ReactAutomationStudio/components/BaseComponents/CheckBox";

const CheckBoxComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <CheckBox
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      macros={macros}
      disableContextMenu={inEditMode}
      label={p.label?.value}
    />
  );
};

export { CheckBoxComp };
