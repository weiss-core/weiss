import React from "react";
import { EditorContext } from "./useEditorContext";
import { useWidgetManager } from "./useWidgetManager";
import useEpicsWS from "./useEpicsWS";
import useUIManager from "./useUIManager";

/**
 * The full editor context type.
 */
export type EditorContextType = ReturnType<typeof useWidgetManager> &
  ReturnType<typeof useEpicsWS> &
  ReturnType<typeof useUIManager>;

/**
 * EditorProvider component.
 *
 * Wraps the application with a React context that provides:
 * - Widget management (creation, selection, property updates, PV binding)
 * - WebSocket connection to EPICS PVs (subscribe, write, lifecycle handling)
 * - UI management (edit vs. runtime mode, property editor focus, widget selector state)
 *
 * This provider is required for any component that calls `useEditorContext`.
 *
 * @component
 */
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const widgetManager = useWidgetManager();
  const ws = useEpicsWS(widgetManager.PVMap);
  const ui = useUIManager(
    ws,
    widgetManager.editorWidgets,
    widgetManager.setSelectedWidgetIDs,
    widgetManager.loadWidgets,
    widgetManager.formatWdgToExport
  );

  const value = React.useMemo<EditorContextType>(
    () => ({
      ...widgetManager,
      ...ws,
      ...ui,
    }),
    [widgetManager, ws, ui]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
