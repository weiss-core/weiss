import { useState, useEffect, useRef } from "react";
import type { WidgetUpdate } from "@src/types/widgets";
import { useEditorContext } from "@src/context/useEditorContext";
import { FLEX_ALIGN_MAP, INPUT_TEXT_ALIGN_MAP } from "@src/constants/constants";

const TextLabelComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { inEditMode, updateWidgetProperties } = useEditorContext();
  const p = data.editableProperties;

  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!p.visible?.value) return null;

  const showEditableInput = inEditMode && editing;

  return (
    <div
      className="textInputWrapper"
      title={p.tooltip?.value ?? ""}
      style={{
        display: "flex",
        justifyContent: FLEX_ALIGN_MAP[p.textHAlign?.value ?? "left"],
        alignItems: FLEX_ALIGN_MAP[p.textVAlign?.value ?? "middle"],
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        backgroundColor: p.backgroundColor?.value,
        borderRadius: p.borderRadius?.value,
        borderStyle: p.borderStyle?.value,
        borderWidth: p.borderWidth?.value,
        borderColor: p.borderColor?.value,
      }}
    >
      <input
        className="textLabelInput"
        ref={inputRef}
        value={p.label?.value}
        readOnly={!showEditableInput}
        onDoubleClick={() => {
          if (inEditMode) setEditing(true);
        }}
        onBlur={() => setEditing(false)}
        onChange={(e) => updateWidgetProperties(data.id, { label: e.target.value })}
        style={{
          textAlign: INPUT_TEXT_ALIGN_MAP[p.textHAlign?.value ?? "left"],
          pointerEvents: inEditMode ? "auto" : "none",
          fontSize: p.fontSize?.value,
          fontFamily: p.fontFamily?.value,
          fontWeight: p.fontBold?.value ? "bold" : "normal",
          fontStyle: p.fontItalic?.value ? "italic" : "normal",
          textDecoration: p.fontUnderlined?.value ? "underline" : "none",
          color: p.textColor?.value,
          padding: 0,
          outline: "none",
          backgroundColor: "transparent",
          border: "none",
        }}
      />
    </div>
  );
};

export { TextLabelComp };
