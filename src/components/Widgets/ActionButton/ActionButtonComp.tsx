import React from "react";
import { Button } from "@mui/material";
import { useEditorContext } from "../../../context/useEditorContext";
import type { WidgetUpdate } from "../../../types/widgets";
import { FLEX_ALIGN_MAP, RUNTIME_MODE } from "../../../constants/constants";
import AlarmBorder from "../../AlarmBorder/AlarmBorder";

const ActionButtonComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, writePVValue } = useEditorContext();
  const p = data.editableProperties;
  const pvData = data.pvData;

  const handleClick = (_e: React.MouseEvent) => {
    if (mode === RUNTIME_MODE) {
      if (p.pvName?.value && p.actionValue?.value !== undefined) {
        writePVValue(p.pvName.value, p.actionValue.value);
      }
    }
  };

  if (!p.visible?.value) return null;

  return (
    <AlarmBorder alarmData={pvData?.alarm} enable={p.alarmBorder?.value}>
      <Button
        title={p.tooltip?.value ?? ""}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
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
        disableRipple={mode !== RUNTIME_MODE}
        disabled={p.disabled!.value}
        variant="contained"
        onClick={(e) => handleClick(e)}
      >
        {p.label!.value}
      </Button>
    </AlarmBorder>
  );
};

export { ActionButtonComp };
