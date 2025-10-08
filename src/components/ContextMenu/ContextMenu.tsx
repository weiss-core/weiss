import * as React from "react";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentCut from "@mui/icons-material/ContentCut";
import ContentPaste from "@mui/icons-material/ContentPaste";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import FlipToFront from "@mui/icons-material/FlipToFront";
import FlipToBack from "@mui/icons-material/FlipToBack";
import { useEditorContext } from "@src/context/useEditorContext";
import { EDIT_MODE, FRONT_UI_ZIDX } from "@src/constants/constants";
import type { GridPosition } from "@src/types/widgets";

export interface ContextMenuProps {
  pos: GridPosition;
  mousePos: GridPosition;
  visible: boolean;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  pos,
  mousePos,
  visible,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const {
    mode,
    bringToFront,
    sendToBack,
    stepForward,
    stepBackwards,
    copyWidget,
    pasteWidget,
    selectedWidgetIDs,
  } = useEditorContext();
  if (!visible) return null;
  if (mode !== EDIT_MODE) return null; // TODO: create context menu for RUNTIME
  const noSelection = selectedWidgetIDs.length === 0;
  const options = [
    {
      label: "Cut",
      icon: <ContentCut fontSize="small" />,
      shortcut: "Ctrl+X",
      action: () => console.log("Cut"),
      disabled: noSelection,
    },
    {
      label: "Copy",
      icon: <ContentCopy fontSize="small" />,
      shortcut: "Ctrl+C",
      action: () => copyWidget(),
      disabled: noSelection,
    },
    {
      label: "Paste",
      icon: <ContentPaste fontSize="small" />,
      shortcut: "Ctrl+V",
      action: () => pasteWidget(mousePos),
      disabled: false,
    },
    {
      label: "Step forward",
      icon: <KeyboardArrowUp fontSize="small" />,
      shortcut: "",
      action: () => stepForward(),
      disabled: noSelection,
    },
    {
      label: "Bring to front",
      icon: <FlipToFront fontSize="small" />,
      shortcut: "",
      action: () => bringToFront(),
      disabled: noSelection,
    },
    {
      label: "Step back",
      icon: <KeyboardArrowDown fontSize="small" />,
      shortcut: "",
      action: () => stepBackwards(),
      disabled: noSelection,
    },
    {
      label: "Send to back",
      icon: <FlipToBack fontSize="small" />,
      shortcut: "",
      action: () => sendToBack(),
      disabled: noSelection,
    },
  ];
  return (
    <Paper
      className="contextMenu"
      sx={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: FRONT_UI_ZIDX,
        width: 220,
        maxWidth: "100%",
        boxShadow: 3,
      }}
    >
      <MenuList dense sx={{ zIndex: FRONT_UI_ZIDX }}>
        {options.map((opt, index) => (
          <MenuItem
            sx={{ zIndex: FRONT_UI_ZIDX }}
            key={index}
            disabled={opt.disabled}
            onMouseEnter={() => onMouseEnter()}
            onMouseLeave={() => onMouseLeave()}
            onClick={(e) => {
              e.stopPropagation();
              opt.action();
              onClose();
            }}
          >
            {opt.icon && <ListItemIcon>{opt.icon}</ListItemIcon>}
            <ListItemText>{opt.label}</ListItemText>
            {opt.shortcut && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {opt.shortcut}
              </Typography>
            )}
          </MenuItem>
        ))}
      </MenuList>
    </Paper>
  );
};

export default ContextMenu;
