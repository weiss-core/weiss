import { createContext, useContext } from "react";
import type { EditorContextType } from "./EditorProvider";

/**
 * Global context for the editor.
 *
 * Provides access to:
 * - Widget management (CRUD operations, property editing, PV tracking)
 * - WebSocket session for EPICS PVs
 * - UI state (edit mode, property editor, widget selector)
 *
 */
export const EditorContext = createContext<EditorContextType | undefined>(undefined);

/**
 * Hook to access the global editor context.
 *
 * Provides a strongly-typed interface to the shared editor state, which includes:
 * - Widget management (add/remove/update widgets, PV binding - see {@link useWidgetManager})
 * - WebSocket session for EPICS PVs (subscribe, write, lifecycle handling - see {@link useEpicsWS})
 * - UI state (edit vs. runtime mode, property editor focus - see {@link useUIManager})
 *
 * @throws {Error} If used outside of an `EditorProvider` component.
 *
 * @returns The full editor state and actions.
 *
 * @example
 * ```tsx
 * import { useEditorContext } from "./context/useEditorContext";
 *
 * export function PropertyPanel() {
 *   const { selectedWidgetIDs, updateWidgetProperties } = useEditorContext();
 *
 *   return (
 *     <div>
 *       Selected: {selectedWidgetIDs.join(", ")}
 *     </div>
 *   );
 * }
 * ```
 */
export const useEditorContext = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("EditorContext not found");
  return ctx;
};
