import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { useEditorContext } from "../../../context/useEditorContext";
import AlarmBorder from "../../AlarmBorder/AlarmBorder";

const MultiBitIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const pvData = data.pvData;
  const { inEditMode } = useEditorContext();

  if (!p.visible?.value) return null;

  const bitsCount = p.nBits?.value ?? 1;
  const onColor = p.onColor?.value;
  const offColor = p.offColor?.value;
  const invertOrder = p.invertBitOrder?.value;
  const orientation = p.orientation?.value;
  const value = inEditMode ? 0 : Number(pvData?.value ?? 0);

  let bitIndexes = Array.from({ length: bitsCount }, (_, i) => i);
  if (invertOrder) {
    bitIndexes = bitIndexes.reverse();
  }
  const bits = bitIndexes.map((i) => {
    const bitOn = ((value >> i) & 1) === 1;
    return (
      <div
        key={i}
        style={{
          width: orientation === "Horizontal" ? `${100 / bitsCount}%` : "100%",
          height: orientation === "Vertical" ? `${100 / bitsCount}%` : "100%",
          display: "flex",
          borderRadius: p.square?.value ? 0 : "50%",
          boxSizing: "border-box",
          background: inEditMode
            ? `linear-gradient(-45deg, ${onColor} 50%,${offColor} 50%)`
            : bitOn
            ? onColor
            : offColor,
          borderStyle: p.borderStyle?.value,
          borderWidth: p.borderWidth?.value,
          borderColor: p.borderColor?.value,
        }}
      />
    );
  });

  return (
    <AlarmBorder alarmData={pvData?.alarm} enable={p.alarmBorder?.value}>
      <div
        title={p.tooltip?.value ?? ""}
        style={{
          width: p.width?.value,
          height: p.height?.value,
          display: "flex",
          gap: p.spacing?.value,
          flexDirection: orientation === "Horizontal" ? "row" : "column",
          justifyContent: "center",
          boxSizing: "border-box",
          alignItems: "center",
        }}
      >
        {bits}
      </div>
    </AlarmBorder>
  );
};

export { MultiBitIndicatorComp };
