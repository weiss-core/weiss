import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE, FLEX_ALIGN_MAP } from "../../../constants/constants";
import { useEditorContext } from "../../../context/useEditorContext";
import TextUpdate from "ReactAutomationStudio/components/BaseComponents/TextUpdate";

const TextUpdateComp: React.FC<WidgetUpdate> = ({ data }) => {
  const p = data.editableProperties;
  const { mode, macros } = useEditorContext();
  const isEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <div
      title={p.tooltip?.value ?? ""}
      className="textUpdate"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        paddingLeft: 5,
        paddingRight: 5,
        // justifyContent: FLEX_ALIGN_MAP[p.textHAlign?.value ?? "left"],
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
      <div style={{ width: "100%" }}>
        <TextUpdate
          key={mode}
          editMode={isEditMode}
          pv={p.pvName?.value}
          macros={macros}
          usePvPrecision={true}
          usePvUnits={true}
          alarmSensitive={true}
          align={p.textHAlign?.value ?? "left"}
          muiTypographyProps={{
            sx: {
              fontSize: p.fontSize?.value,
              fontFamily: p.fontFamily?.value,
              fontWeight: p.fontBold?.value ? "bold" : "normal",
              fontStyle: p.fontItalic?.value ? "italic" : "normal",
              color: p.textColor?.value,
            },
          }}
        />
      </div>
    </div>
  );
};

export { TextUpdateComp };
