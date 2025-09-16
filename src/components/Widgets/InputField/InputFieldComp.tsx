import React, { useState, useEffect } from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { useEditorContext } from "../../../context/useEditorContext";
import { EDIT_MODE, RUNTIME_MODE } from "../../../constants/constants";

const InputFieldComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode } = useEditorContext();
  const [inputValue, setInputValue] = useState<string>("");

  const p = data.editableProperties;
  const isEditMode = mode === EDIT_MODE;

  useEffect(() => {
    if (isEditMode) setInputValue("");
  }, [isEditMode]);

  if (!p.visible?.value) return null;

  const handleWrite = (value: number | string) => {
    if (mode !== RUNTIME_MODE) return;
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <input
        title={p.tooltip?.value ?? ""}
        readOnly={isEditMode}
        style={{
          width: "100%",
          height: "100%",
          margin: "auto",
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
          boxSizing: "border-box",
          padding: "4px 8px",
          pointerEvents: isEditMode ? "none" : "auto",
        }}
        disabled={p.disabled?.value}
        placeholder={isEditMode ? p.pvName?.value : p.label?.value}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleWrite(inputValue);
          }
        }}
      />
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
  );
};

export { InputFieldComp };
