import { useState, useEffect, useRef, useCallback } from "react";
import { EDIT_MODE, type Mode } from "@src/constants/constants";
import { useWidgetManager } from "./useWidgetManager";
import type { ExportedWidget, Widget } from "@src/types/widgets";
import useEpicsWS from "./useEpicsWS";

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
 * @param loadWidgets Function to load widgets into the editor (used for localStorage).
 * @param formatWdgToExport Function to format (reduce) widgets to exporting format.
 * @returns An object containing UI state, setters, and mode updater.
 */
export default function useUIManager(
  ws: ReturnType<typeof useEpicsWS>["ws"],
  startNewSession: ReturnType<typeof useEpicsWS>["startNewSession"],
  editorWidgets: ReturnType<typeof useWidgetManager>["editorWidgets"],
  setSelectedWidgetIDs: ReturnType<typeof useWidgetManager>["setSelectedWidgetIDs"],
  loadWidgets: ReturnType<typeof useWidgetManager>["loadWidgets"],
  formatWdgToExport: ReturnType<typeof useWidgetManager>["formatWdgToExport"]
) {
  const [propertyEditorFocused, setPropertyEditorFocused] = useState(false);
  const [wdgPickerOpen, setWdgPickerOpen] = useState(false);
  const [pickedWidget, setPickedWidget] = useState<Widget | null>(null);
  const [mode, setMode] = useState<Mode>(EDIT_MODE);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const loadedRef = useRef(false);
  const inEditMode = mode === EDIT_MODE;

  /**
   * Switch between edit and runtime modes.
   *
   * Edit mode:
   * - Closes WebSocket connection.
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
        ws.current?.close();
        ws.current = null;
      } else {
        setSelectedWidgetIDs([]);
        setWdgPickerOpen(false);
        startNewSession();
      }
      setMode(newMode);
    },
    [setSelectedWidgetIDs, startNewSession, ws]
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
    if (inEditMode) {
      try {
        const exportable = editorWidgets.map(formatWdgToExport);
        localStorage.setItem("editorWidgets", JSON.stringify(exportable));
      } catch (err) {
        console.error("Failed to save widgets:", err);
      }
    }
  }, [editorWidgets, inEditMode, formatWdgToExport]);

  return {
    propertyEditorFocused,
    setPropertyEditorFocused,
    mode,
    updateMode,
    wdgPickerOpen,
    setWdgPickerOpen,
    pickedWidget,
    setPickedWidget,
    inEditMode,
    isDragging,
    setIsDragging,
    isPanning,
    setIsPanning,
  };
}
