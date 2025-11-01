import React from "react";
import type { WidgetUpdate } from "@src/types/widgets";
import { useEditorContext } from "@src/context/useEditorContext";
import AlarmBorder from "@components/AlarmBorder/AlarmBorder";

const BitIndicatorComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const pvData = data.pvData;
  const { inEditMode } = useEditorContext();

  if (!p.visible?.value) return null;

  const onColor = p.onColor?.value;
  const offColor = p.offColor?.value;
  const labelPlacement = p.labelPlcmnt?.value;
  const value = inEditMode ? 0 : Number(pvData?.value ?? 0);
  const bitOn = value === 1;
  const valueText = pvData?.valueText;
  const label = p.labelFromPV?.value ? (inEditMode ? "PV label" : valueText) : p.label?.value;

  const background = inEditMode
    ? `linear-gradient(-45deg, ${onColor} 50%, ${offColor} 50%)`
    : bitOn
    ? onColor
    : offColor;

  const isVertical = labelPlacement === "top" || labelPlacement === "bottom";
  const isLabelFirst = labelPlacement === "start" || labelPlacement === "top";
  const hasLabel = Boolean(label);

  // Layout direction and size balance
  const flexDirection = isVertical ? "column" : "row";
  const circleFlexBasis = hasLabel ? "70%" : "100%";
  const labelFlexBasis = hasLabel ? "auto" : "0";

  return (
    <AlarmBorder alarmData={pvData?.alarm} enable={p.alarmBorder?.value}>
      <div
        title={p.tooltip?.value ?? ""}
        style={{
          width: p.width?.value,
          height: p.height?.value,
          display: "flex",
          flexDirection,
          justifyContent: "center",
          alignItems: "center",
          gap: hasLabel ? 6 : 0,
          boxSizing: "border-box",
        }}
      >
        {isLabelFirst && hasLabel && (
          <span
            style={{
              flexBasis: labelFlexBasis,
              fontSize: p.fontSize?.value ?? 12,
              color: p.textColor?.value ?? "inherit",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        )}

        <div
          style={{
            flexBasis: circleFlexBasis,
            flexGrow: 1,
            flexShrink: 1,
            width: isVertical ? "100%" : undefined,
            height: isVertical ? undefined : "100%",
            borderRadius: p.square?.value ? 0 : "50%",
            background,
            borderStyle: p.borderStyle?.value,
            borderWidth: p.borderWidth?.value,
            borderColor: p.borderColor?.value,
            boxSizing: "border-box",
          }}
        />

        {!isLabelFirst && hasLabel && (
          <span
            style={{
              flexBasis: labelFlexBasis,
              fontSize: p.fontSize?.value ?? 12,
              color: p.textColor?.value ?? "inherit",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </AlarmBorder>
  );
};

export { BitIndicatorComp };
