import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE, RUNTIME_MODE } from "../../../constants/constants";
import { useEditorContext } from "../../../context/useEditorContext";
import LightPanel from "ReactAutomationStudio/components/BaseComponents/LightPanel";

const LedIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const { mode, macros } = useEditorContext();

  if (!p.visible?.value) return null;

  return (
    <LightPanel
      pv={p.pvName?.value ?? ""}
      macros={macros}
      align="center"
      colors={{
        0: p.offColor?.value,
        1: p.onColor?.value,
      }}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      useStringValue={p.useStrValues?.value}
      muiTypographyProps={{
        sx: {
          p: 0,
          fontSize: p.fontSize?.value,
          fontFamily: p.fontFamily?.value,
          fontWeight: p.fontBold?.value ? "bold" : "normal",
          fontStyle: p.fontItalic?.value ? "italic" : "normal",
          color: p.showValues?.value ? p.textColor?.value : "transparent",
        },
      }}
    />
  );
};

export { LedIndicatorComp };
