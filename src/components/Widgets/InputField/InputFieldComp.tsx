import React from "react";
import type { WidgetUpdate } from "../../../types/widgets";
import { useEditorContext } from "../../../context/useEditorContext";
import { EDIT_MODE } from "../../../constants/constants";
import TextInput from "ReactAutomationStudio/components/BaseComponents/TextInput";

const InputFieldComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();

  const p = data.editableProperties;
  const inEditMode = mode === EDIT_MODE;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <TextInput
        key={mode}
        editMode={inEditMode}
        pv={p.pvName?.value}
        macros={macros}
        alarmSensitive={p.alarmBorder?.value}
        usePvPrecision={p.precisionFromPV?.value}
        usePvUnits={p.unitsFromPV?.value}
        prec={p.precision?.value}
        muiTextFieldProps={{
          variant: "filled",
          placeholder: p.label?.value,
          fullWidth: true,
          inputProps: {
            style: {
              fontSize: p.fontSize?.value,
              fontFamily: p.fontFamily?.value,
              fontWeight: p.fontBold?.value ? "bold" : "normal",
              fontStyle: p.fontItalic?.value ? "italic" : "normal",
              color: p.textColor?.value,
            },
          },
          sx: {
            width: "100%",
            height: "100%",
            backgroundColor: p.backgroundColor?.value,
            "& .MuiInputBase-root": {
              height: "100%",
            },
            "& .MuiInputBase-input": {
              height: "100%",
              boxSizing: "border-box",
              padding: 0,
            },
          },
        }}
      />
    </div>
  );
};

export { InputFieldComp };
