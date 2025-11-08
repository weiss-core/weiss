import React, { useEffect, useMemo, useState } from "react";
import { styled, type Theme, type CSSObject } from "@mui/material/styles";
import { Drawer as MuiDrawer } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ListSubheader from "@mui/material/ListSubheader";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { useEditorContext } from "@src/context/useEditorContext";
import type {
  WidgetProperties,
  PropertyValue,
  PropertyKey,
  WidgetProperty,
  MultiWidgetPropertyUpdates,
} from "@src/types/widgets";
import { PROPERTY_EDITOR_WIDTH, EDIT_MODE, FRONT_UI_ZIDX } from "@src/constants/constants";
import TextFieldProperty from "./TextFieldProperty";
import BooleanProperty from "./BooleanProperty";
import ColorProperty from "./ColorProperty";
import SelectProperty from "./SelectProperty";
import { CATEGORY_DISPLAY_ORDER } from "@src/types/widgetProperties";
import StrListProperty from "./StrListProperty";
import StrRecordProperty from "./StrRecordProperty";
import ColorListProperty from "./ColorListProperty";

const openedMixin = (theme: Theme): CSSObject => ({
  width: PROPERTY_EDITOR_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: 0,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  position: "fixed",
  right: 0,
  top: 0,
  height: "100vh",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      right: 0,
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      right: 0,
    },
  }),
}));

const ToggleButton = styled(IconButton)<{ open: boolean }>(({ theme, open }) => ({
  position: "fixed",
  top: (theme.mixins.toolbar.minHeight as number) + 16,
  right: open ? PROPERTY_EDITOR_WIDTH + 8 : 8,
  zIndex: theme.zIndex.drawer + 2,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  "&:hover": {
    background: theme.palette.background.default,
  },
}));

const getGroupedProperties = (properties: WidgetProperties) => {
  const groups: Record<string, Record<string, WidgetProperty>> = {};
  if (!properties) return groups;

  const presentCategories = new Set(Object.values(properties).map((prop) => prop.category));
  CATEGORY_DISPLAY_ORDER.filter((cat) => presentCategories.has(cat)).forEach((cat) => {
    groups[cat] = {};
  });
  // Add any other categories not in CATEGORY_DISPLAY_ORDER
  Array.from(presentCategories)
    .filter((cat) => !CATEGORY_DISPLAY_ORDER.includes(cat))
    .forEach((cat) => {
      groups[cat] = {};
    });

  for (const [propName, prop] of Object.entries(properties)) {
    const category = prop.category ?? "Other";
    groups[category][propName] = prop;
  }

  return groups;
};

/**
 * PropertyEditor renders the side panel that allows editing properties of the selected widget(s) in the editor.
 *
 * @features
 * - Automatically opens when a widget is selected.
 * - Shows either single widget properties or common properties across multiple selected widgets.
 * - Groups properties by category, allowing collapsible sections.
 * - Supports all PropertySelectorType definitions.
 * - Updates multiple widgets at once when properties are edited in batch.
 * - Toggle button to open/close the editor manually.
 * - Pin button to keep it open.
 *
 * @notes
 * - Only visible in EDIT_MODE.
 * - Width is defined by PROPERTY_EDITOR_WIDTH constant.
 * - Focus state is managed to coordinate with the editor context.
 */
const PropertyEditor: React.FC = () => {
  const { mode, selectedWidgetIDs, editingWidgets, batchWidgetUpdate, setPropertyEditorFocused } =
    useEditorContext();
  const isOnlyGridSelected = selectedWidgetIDs.length === 0;
  const singleWidget = editingWidgets.length === 1;
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const properties: WidgetProperties = useMemo(() => {
    if (editingWidgets.length === 0) return {};
    if (singleWidget) {
      return editingWidgets[0].editableProperties;
    }
    // Get only common properties
    const common: WidgetProperties = { ...editingWidgets[0].editableProperties };
    for (let i = 1; i < editingWidgets.length; i++) {
      const currentProps = editingWidgets[i].editableProperties;
      for (const key of Object.keys(common)) {
        const propName = key as PropertyKey;
        if (!(currentProps[propName] as WidgetProperty)) delete common[propName];
      }
    }

    return common;
  }, [editingWidgets, singleWidget]);

  useEffect(() => {
    if (!isOnlyGridSelected) {
      setOpen(true);
      return;
    }
    if (!pinned) setOpen(false);
  }, [pinned, isOnlyGridSelected]);

  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  const togglePin = () => {
    setPinned((prev) => !prev);
  };

  const toggleGroup = (category: string) => {
    setCollapsedGroups((prev) => {
      const current = prev[category] ?? true;
      return { ...prev, [category]: !current };
    });
  };

  const header = singleWidget
    ? `${editingWidgets[0].widgetLabel} properties`
    : "Common properties in selection";
  const groupedProperties = getGroupedProperties(properties);

  const handlePropChange = (propName: PropertyKey, newValue: PropertyValue) => {
    const updates: MultiWidgetPropertyUpdates = {};
    editingWidgets.forEach((w) => {
      updates[w.id] = { [propName]: newValue };
    });
    batchWidgetUpdate(updates);
  };

  const renderGroupedPropertyFields = () =>
    Object.entries(groupedProperties).map(([category, props]) => {
      const collapsed = collapsedGroups[category] ?? true;
      return (
        <React.Fragment key={category}>
          <Divider />
          <ListSubheader
            onClick={() => toggleGroup(category)}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <IconButton
              size="small"
              sx={{
                transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
                transition: "transform 0.2s",
                mr: 1,
              }}
            >
              <ChevronRightIcon fontSize="inherit" />
            </IconButton>
            {category}
          </ListSubheader>
          {!collapsed &&
            Object.entries(props).map(([propName, prop]) => {
              const { selType, label, value, options, limits } = prop;
              const commonProps = {
                propName: propName as PropertyKey,
                label,
                value,
                limits,
                onChange: handlePropChange,
              };
              switch (selType) {
                case "text":
                case "number":
                  return <TextFieldProperty key={propName} {...commonProps} selType={selType} />;
                case "strList":
                  return <StrListProperty key={propName} {...commonProps} />;
                case "strRecord":
                  return <StrRecordProperty key={propName} {...commonProps} />;
                case "boolean":
                  return <BooleanProperty key={propName} {...commonProps} />;
                case "colorSel":
                  return <ColorProperty key={propName} {...commonProps} />;
                case "colorSelList":
                  return <ColorListProperty key={propName} {...commonProps} />;
                case "select":
                  return <SelectProperty key={propName} {...commonProps} options={options ?? []} />;
                default:
                  return null;
              }
            })}
        </React.Fragment>
      );
    });
  if (mode !== EDIT_MODE) return null;
  return (
    <>
      {!open && (
        <Tooltip title="Show properties" placement="left">
          <ToggleButton color="primary" open={open} onClick={toggleDrawer} size="small">
            <ChevronLeftIcon />
          </ToggleButton>
        </Tooltip>
      )}
      <Drawer
        variant="permanent"
        anchor="right"
        open={open}
        onFocus={() => setPropertyEditorFocused(true)}
        onBlur={() => setPropertyEditorFocused(false)}
        sx={{ zIndex: FRONT_UI_ZIDX + 1 }}
      >
        <Toolbar />
        <List sx={{ width: "100%" }}>
          <ListItem
            secondaryAction={
              <>
                <Tooltip title={pinned ? "Unpin" : "Pin"}>
                  <IconButton edge="end" onClick={togglePin} size="small">
                    {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                  </IconButton>
                </Tooltip>
                <IconButton
                  edge="end"
                  onClick={toggleDrawer}
                  size="small"
                  sx={{ display: pinned ? "none" : "auto" }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={header} />
          </ListItem>
          {renderGroupedPropertyFields()}
        </List>
      </Drawer>
    </>
  );
};

export default PropertyEditor;
