import React from "react";
import { EditorContext } from "./useEditorContext";
import { useWidgetManager } from "./useWidgetManager";
import useUIManager from "./useUIManager";

/**
 * The full editor context type.
 */
export type EditorContextType = ReturnType<typeof useWidgetManager> &
  ReturnType<typeof useUIManager>;

/**
 * EditorProvider component.
 *
 * Wraps the application with a React context that provides:
 * - Widget management (creation, selection, property updates, PV binding)
 * - UI management (edit vs. runtime mode, property editor focus, widget selector state)
 *
 * This provider is required for any component that calls `useEditorContext`.
 *
 * @component
 */
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const widgetManager = useWidgetManager();
  const ui = useUIManager(
    widgetManager.editorWidgets,
    widgetManager.setSelectedWidgetIDs,
    widgetManager.updateWidgetProperties,
    widgetManager.loadWidgets
  );

  const value = React.useMemo<EditorContextType>(
    () => ({
      ...widgetManager,
      ...ui,
    }),
    [widgetManager, ui]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
