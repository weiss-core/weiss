import React from "react";
import { useEditorContext } from "../../../context/useEditorContext";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE, FLEX_ALIGN_MAP } from "../../../constants/constants";
import ActionButton from "ReactAutomationStudio/components/BaseComponents/ActionButton";

const ActionButtonComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <ActionButton
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value}
      macros={macros}
      actionValue={p.actionValue?.value}
      actionString={p.label?.value}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      alarmSensitive={p.alarmBorder?.value}
      disableContextMenu={inEditMode}
      muiButtonProps={{
        sx: {
          width: "100%",
          height: "100%",
          display: "flex",
          textTransform: "none",
          justifyContent: FLEX_ALIGN_MAP[p.textHAlign?.value ?? "left"],
          alignItems: FLEX_ALIGN_MAP[p.textVAlign?.value ?? "middle"],
          backgroundColor: p.backgroundColor?.value,
          fontSize: p.fontSize?.value,
          fontFamily: p.fontFamily?.value,
          fontWeight: p.fontBold?.value ? "bold" : "normal",
          fontStyle: p.fontItalic?.value ? "italic" : "normal",
          color: p.textColor?.value,
          borderRadius: p.borderRadius?.value,
          borderStyle: p.borderStyle?.value,
          borderWidth: p.borderWidth?.value,
          borderColor: p.borderColor?.value,
        },
        disableRipple: mode == EDIT_MODE,
        disabled: p.disabled!.value,
        variant: "contained",
      }}
    />
  );
};

export { ActionButtonComp };
