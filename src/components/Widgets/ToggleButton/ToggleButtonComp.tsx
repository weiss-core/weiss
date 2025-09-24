import React from "react";
import { useEditorContext } from "../../../context/useEditorContext";
import type { WidgetUpdate } from "../../../types/widgets";
import { EDIT_MODE, FLEX_ALIGN_MAP } from "../../../constants/constants";
import ToggleButton from "ReactAutomationStudio/components/BaseComponents/ToggleButton";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const ToggleButtonComp: React.FC<WidgetUpdate> = ({ data }) => {
  const { mode, macros } = useEditorContext();
  const p = data.editableProperties;
  const inEditMode = mode == EDIT_MODE;
  if (!p.visible?.value) return null;

  return (
    <ToggleButton
      key={mode}
      editMode={inEditMode}
      pv={p.pvName?.value ?? ""}
      tooltip={p.tooltip?.value}
      showTooltip={true}
      macros={macros}
      disableContextMenu={inEditMode}
      // for now those only accept MUI keywords like primary/secondary etc
      // onColor={p.onColor?.value}
      // offColor={p.offColor?.value}
      muiButtonProps={{
        startIcon: <PowerSettingsNewIcon />,
        sx: {
          width: "100%",
          height: "100%",
          display: "flex",
          textTransform: "none",
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
        },
        disableRipple: inEditMode,
        disabled: p.disabled?.value,
        variant: "contained",
      }}
    />
  );
};

export { ToggleButtonComp };
