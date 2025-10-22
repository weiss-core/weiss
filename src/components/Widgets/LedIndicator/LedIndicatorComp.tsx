import React from "react";
import type { WidgetUpdate } from "@src/types/widgets";
import { EDIT_MODE } from "@src/constants/constants";
import { useEditorContext } from "@src/context/useEditorContext";
import LightPanel from "@ReactAutomationStudio/components/BaseComponents/LightPanel";

const LedIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const { mode, macros } = useEditorContext();
  const inEditMode = mode === EDIT_MODE;

  if (!p.visible?.value) return null;

  return (
    <LightPanel
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      macros={macros}
      align="center"
      colors={{
        0: p.offColor?.value,
        1: p.onColor?.value,
      }}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      useStringValue={p.useStrValue?.value}
      alarmSensitive={p.alarmBorder?.value}
      disableContextMenu={inEditMode}
      muiTypographyProps={{
        sx: {
          p: 0,
          fontSize: p.fontSize?.value,
          fontFamily: p.fontFamily?.value,
          fontWeight: p.fontBold?.value ? "bold" : "normal",
          fontStyle: p.fontItalic?.value ? "italic" : "normal",
          color: p.showValue?.value ? p.textColor?.value : "transparent",
        },
      }}
    />
  );
};

export { LedIndicatorComp };
