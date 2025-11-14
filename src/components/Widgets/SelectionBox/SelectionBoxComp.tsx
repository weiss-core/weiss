import React from "react";
import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { useEditorContext } from "@src/context/useEditorContext";
import type { WidgetUpdate } from "@src/types/widgets";
import { FLEX_ALIGN_MAP } from "@src/constants/constants";
import AlarmBorder from "@components/AlarmBorder/AlarmBorder";

const SelectionBoxComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { inEditMode, writePVValue } = useEditorContext();
  const p = data.editableProperties;
  const pvData = data.pvData;

  if (!p.visible?.value) return null;

  const enumChoices: string[] =
    (p.labelFromPV?.value ? pvData?.enumChoices : p.enumChoices?.value) ?? [];

  // Compute current index based on PV value or default to 0
  const currentIndex =
    typeof pvData?.value === "number" && pvData.value >= 0 && pvData.value < enumChoices.length
      ? pvData.value
      : "";

  const handleChange = (e: SelectChangeEvent<string>) => {
    const newIndex = parseInt(e.target.value);
    if (!inEditMode && p.pvName?.value) {
      writePVValue(p.pvName.value, newIndex);
    }
  };

  return (
    <AlarmBorder alarmData={pvData?.alarm} enable={p.alarmBorder?.value}>
      <FormControl
        fullWidth
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: FLEX_ALIGN_MAP[p.textVAlign?.value ?? "middle"],
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
        <InputLabel
          sx={{
            color: p.textColor?.value,
            fontSize: p.fontSize?.value,
            fontFamily: p.fontFamily?.value,
            height: "100%",
          }}
        >
          {p.label?.value}
        </InputLabel>
        <Select
          value={String(currentIndex)}
          disabled={p.disabled?.value}
          label={p.label?.value}
          onChange={handleChange}
          size="small"
          sx={{
            backgroundColor: p.backgroundColor?.value,
            color: p.textColor?.value,
            height: "100%",
            pointerEvents: inEditMode ? "none" : "auto",
          }}
        >
          {enumChoices.map((choice, idx) => (
            <MenuItem key={idx} value={String(idx)}>
              {choice}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </AlarmBorder>
  );
};

export { SelectionBoxComp };
