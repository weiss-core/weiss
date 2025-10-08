import * as React from "react";
import { WIDGET_SELECTOR_WIDTH, EDIT_MODE } from "@src/constants/constants";
import type { Widget } from "@src/types/widgets";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { useEditorContext } from "@src/context/useEditorContext";
import { styled } from "@mui/material/styles";
import type { Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import DrawerBase from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import ListSubheader from "@mui/material/ListSubheader";
import WidgetsIcon from "@mui/icons-material/Widgets";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Tooltip from "@mui/material/Tooltip";

const openedMixin = (theme: Theme): CSSObject => ({
  width: WIDGET_SELECTOR_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(DrawerBase, { shouldForwardProp: (prop) => prop !== "open" })<{
  open: boolean;
}>(({ theme, open }) => ({
  width: WIDGET_SELECTOR_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

interface DraggableItemProps {
  item: Widget;
  open: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, open }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <Tooltip title={item.widgetLabel} placement="right">
        <ListItemButton
          draggable
          onDragStart={handleDragStart}
          sx={{ minHeight: 30, justifyContent: open ? "initial" : "center" }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: open ? 2 : 0,
              height: 30,
            }}
          >
            {item.widgetIcon ? <item.widgetIcon /> : <WidgetsIcon />}
          </ListItemIcon>
          {open && <ListItemText primary={item.widgetLabel} />}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

/**
 * WidgetSelector renders the sidebar containing all available widgets for the editor.
 *
 * Features:
 * - Groups widgets by category and displays them in a collapsible drawer
 * - Allows widgets to be dragged from the selector into the grid/editor
 * - Shows icons and labels, with tooltips when collapsed
 * - Automatically hides when editor is not in EDIT_MODE
 *
 * Context:
 * - Relies on `useEditorContext` for editor mode and drawer open state
 * - Uses WidgetRegistry to dynamically fetch all available widget definitions
 */
const WidgetSelector: React.FC = () => {
  const { mode, wdgSelectorOpen, setWdgSelectorOpen } = useEditorContext();
  const palette: Record<string, Widget> = React.useMemo(
    () =>
      Object.fromEntries(Object.values(WidgetRegistry).map((w) => [w.widgetName, w])) as Record<
        string,
        Widget
      >,
    [],
  );

  const categories = React.useMemo(() => {
    const grouped: Record<string, Widget[]> = {};
    for (const entry of Object.values(palette)) {
      const category = entry.category || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(entry);
    }
    return grouped;
  }, [palette]);
  if (mode !== EDIT_MODE) return;
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" open={wdgSelectorOpen}>
        <DrawerHeader>
          <IconButton onClick={() => setWdgSelectorOpen((o) => !o)}>
            {wdgSelectorOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <List disablePadding>
          {Object.entries(categories).map(([category, items], index) => (
            <React.Fragment key={category}>
              {wdgSelectorOpen && (
                <ListSubheader component="div" sx={{ px: 2, lineHeight: "32px" }}>
                  {category}
                </ListSubheader>
              )}
              {items.map((item) => (
                <DraggableItem key={item.widgetName} item={item} open={wdgSelectorOpen} />
              ))}
              {index < Object.keys(categories).length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default WidgetSelector;
