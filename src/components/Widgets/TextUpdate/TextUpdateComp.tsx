import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { FLEX_ALIGN_MAP, RUNTIME_MODE } from "../../../constants/constants";
import { useEditorContext } from "../../../context/useEditorContext";
import AlarmBorder from "../../AlarmBorder/AlarmBorder";

const TextUpdateComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const pvData = data.pvData;
  const { mode } = useEditorContext();

  if (!p.visible?.value) return null;

  const units = p.unitsFromPV?.value ? pvData?.display?.units : p.units?.value;
  const precision = p.precisionFromPV?.value ? pvData?.display?.precision : p.precision?.value;

  let displayValue = pvData?.value;

  if (mode === RUNTIME_MODE && typeof pvData?.value === "number") {
    if (typeof precision === "number" && precision > 0) {
      displayValue = pvData.value.toFixed(precision);
    }
  } else if (mode !== RUNTIME_MODE) {
    displayValue = p.pvName?.value ?? p.label?.value ?? "";
  }

  return (
    <AlarmBorder alarmData={pvData?.alarm} enable={p.alarmBorder?.value ?? true}>
      <div
        title={p.tooltip?.value ?? ""}
        className="textUpdate"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          paddingLeft: 5,
          paddingRight: 5,
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
        }}
      >
        {displayValue}
        {units && (
          <span
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              color: p.textColor?.value,
              fontSize: p.fontSize?.value,
              pointerEvents: "none",
            }}
          >
            {units}
          </span>
        )}
      </div>
    </AlarmBorder>
  );
};

export { TextUpdateComp };
