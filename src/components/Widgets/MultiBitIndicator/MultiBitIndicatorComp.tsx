import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE, RUNTIME_MODE } from "../../../constants/constants";
import { useEditorContext } from "../../../context/useEditorContext";
import LightPanel from "ReactAutomationStudio/components/BaseComponents/LightPanel";

const MultiBitIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const { mode, macros } = useEditorContext();

  if (!p.visible?.value) return null;

  return (
    <LightPanel
      pv={p.pvName?.value ?? ""}
      macros={macros}
      onColor={p.onColor?.value}
      offColor={p.offColor?.value}
      tooltip={p.tooltip?.value}
      showTooltip={true}
    />
  );
};

export { MultiBitIndicatorComp };
