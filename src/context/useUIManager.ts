import { useState, useEffect, useRef, useCallback } from "react";
import { EDIT_MODE, GRID_ID, type Mode } from "@src/constants/constants";
import { useWidgetManager } from "./useWidgetManager";
import type { ExportedWidget } from "@src/types/widgets";

/**
 * Hook that manages global UI state for WEISS.
 *
 * Responsibilities:
 * - Tracks editor mode (`edit` vs `runtime`).
 * - Tracks UI states such as widget selector panel and property editor focus.
 * - Coordinates session lifecycle when switching modes.
 * - Handles localStorage persistence for widgets (load on startup, save in edit mode).
 *
 * @param editorWidgets Current list of widgets from the widget manager.
 * @param setSelectedWidgetIDs Function to update currently selected widgets.
 * @param updateWidgetProperties Function to update widget properties.
 * @param loadWidgets Function to load widgets into the editor (used for localStorage).
 * @returns An object containing UI state, setters, and mode updater.
 */
export default function useUIManager(
  editorWidgets: ReturnType<typeof useWidgetManager>["editorWidgets"],
  setSelectedWidgetIDs: ReturnType<typeof useWidgetManager>["setSelectedWidgetIDs"],
  updateWidgetProperties: ReturnType<typeof useWidgetManager>["updateWidgetProperties"],
  loadWidgets: ReturnType<typeof useWidgetManager>["loadWidgets"],
) {
  const [propertyEditorFocused, setPropertyEditorFocused] = useState(false);
  const [wdgSelectorOpen, setWdgSelectorOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(EDIT_MODE);
  const loadedRef = useRef(false);

  /**
   * Switch between edit and runtime modes.
   *
   * Edit mode:
   * - Closes WebSocket connection.
   * - Clears all PV values.
   *
   * Runtime mode:
   * - Clears widget selection.
   * - Closes widget selector.
   * - Starts a new PV session.
   *
   * Also updates the visibility of grid lines in the editor.
   *
   * @param newMode The mode to switch to ("edit" | "runtime").
   */
  const updateMode = useCallback(
    (newMode: Mode) => {
      const isEdit = newMode == EDIT_MODE;
      if (isEdit) {
        // connection to pv server is managed by RAS widgets directly
        // add actions on mode transition?
      } else {
        // connection to pv server is managed by RAS widgets directly
        setSelectedWidgetIDs([]);
        setWdgSelectorOpen(false);
      }
      updateWidgetProperties(GRID_ID, { gridLineVisible: isEdit }, false);
      setMode(newMode);
    },
    [updateWidgetProperties, setSelectedWidgetIDs],
  );

  /**
   * Load widgets from localStorage on component mount.
   * This runs only once and initializes the editor with saved layout if available.
   */
  useEffect(() => {
    if (!loadedRef.current) {
      const saved = localStorage.getItem("editorWidgets");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ExportedWidget[];
          if (parsed.length > 1) loadWidgets(parsed);
        } catch (err) {
          console.error("Failed to load widgets from localStorage:", err);
        }
      }
      loadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Save widgets to localStorage whenever they change.
   * Only writes while in edit mode to avoid saving runtime PV updates.
   */
  useEffect(() => {
    if (mode === EDIT_MODE) {
      try {
        const exportable = editorWidgets.map(
          (widget) =>
            ({
              id: widget.id,
              widgetName: widget.widgetName,
              properties: Object.fromEntries(
                Object.entries(widget.editableProperties).map(([key, def]) => [key, def.value]),
              ),
            }) as ExportedWidget,
        );
        localStorage.setItem("editorWidgets", JSON.stringify(exportable));
      } catch (err) {
        console.error("Failed to save widgets:", err);
      }
    }
  }, [editorWidgets, mode]);

  return {
    propertyEditorFocused,
    setPropertyEditorFocused,
    mode,
    updateMode,
    wdgSelectorOpen,
    setWdgSelectorOpen,
  };
}
