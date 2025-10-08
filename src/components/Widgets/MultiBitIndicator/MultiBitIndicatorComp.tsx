import React from "react";
import type { WidgetUpdate } from "@src/types/widgets";
import { EDIT_MODE } from "@src/constants/constants";
import { useEditorContext } from "@src/context/useEditorContext";
import BitIndicators from "@ReactAutomationStudio/components/BaseComponents/BitIndicators";
import GradientBitIcon from "@src/components/CustomIcons/BitStateIcon";

const MultiBitIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const { mode, macros } = useEditorContext();
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  const bitLabels = p.bitLabels?.value.length ? p.bitLabels?.value : undefined;

  return (
    <BitIndicators
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      macros={macros}
      onColor={p.onColor?.value}
      offColor={p.offColor?.value}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      numberOfBits={p.nBits?.value}
      horizontal={p.horizontal?.value}
      reverseBits={p.invertBitOrder?.value}
      usePvBitLabels={p.labelFromPV?.value}
      bitLabels={bitLabels}
      alarmSensitive={p.alarmBorder?.value}
      disableContextMenu={inEditMode}
    >
      {inEditMode ? (
        <GradientBitIcon onColor={p.onColor!.value} offColor={p.offColor!.value} />
      ) : undefined}
    </BitIndicators>
  );
};

export { MultiBitIndicatorComp };
