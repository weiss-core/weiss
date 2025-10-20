import { useState, useCallback, useRef, useMemo } from "react";
import type {
  Widget,
  WidgetProperties,
  PropertyKey,
  PropertyUpdates,
  MultiWidgetPropertyUpdates,
  GridPosition,
  ExportedWidget,
} from "@src/types/widgets";
import { GridZone } from "@components/GridZone";
import { GRID_ID, MAX_HISTORY } from "@src/constants/constants";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { v4 as uuidv4 } from "uuid";
import { PROPERTY_SCHEMAS } from "@src/types/widgetProperties";
export interface DOMRectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * Deep clone a list of widgets.
 * @param widgets Array of widgets to clone
 * @returns A deep-cloned array of widgets
 */
function deepCloneWidgetList(widgets: Widget[]): Widget[] {
  return widgets.map(deepCloneWidget);
}

function updateNestedWidgets(widgets: Widget[], updates: MultiWidgetPropertyUpdates): Widget[] {
  const updateOne = (w: Widget): Widget => {
    // Clone so we never mutate directly
    let newWidget = w;

    // Apply update if it exists for this widget ID
    const changes = updates[w.id];
    if (changes) {
      const updatedProps: WidgetProperties = { ...w.editableProperties };
      for (const [k, v] of Object.entries(changes)) {
        const propName = k as PropertyKey;
        if (!updatedProps[propName]) {
          console.warn(`Tried updating inexistent property ${propName} on ${w.id}`);
          continue;
        }
        updatedProps[propName].value = v;
      }
      newWidget = { ...newWidget, editableProperties: updatedProps };
    }

    // If there are children, search them too (recursively, but update only once)
    if (w.children?.length) {
      const updatedChildren = w.children.map(updateOne);
      // Only recreate if children changed
      if (updatedChildren.some((c, i) => c !== w.children![i])) {
        newWidget = { ...newWidget, children: updatedChildren };
      }
    }

    return newWidget;
  };

  return widgets.map(updateOne);
}

function findWidgetRecursive(widgets: Widget[], id: string): Widget | undefined {
  for (const w of widgets) {
    if (w.id === id) return w;
    if (w.children) {
      const found = findWidgetRecursive(w.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Deep clone a single widget including its editable properties.
 * @param widget Widget to clone
 * @returns Cloned widget
 */
function deepCloneWidget(widget: Widget): Widget {
  return {
    ...widget,
    editableProperties: Object.fromEntries(
      Object.entries(widget.editableProperties).map(([k, v]) => [k, { ...v }])
    ),
  };
}

/**
 * Hook to manage the editor's widgets and their state.
 *
 * Provides functionality for:
 * - Selection management
 * - Undo/redo history
 * - Copy/paste of widgets
 * - Alignment and distribution
 * - Updating widget properties and PV data
 * - Import/export of widget configurations
 */
export function useWidgetManager() {
  const [undoStack, setUndoStack] = useState<Widget[][]>([]);
  const [redoStack, setRedoStack] = useState<Widget[][]>([]);
  const [editorWidgets, setEditorWidgets] = useState<Widget[]>([GridZone]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedWidgetIDs, setSelectedWidgetIDs] = useState<string[]>([]);
  const [widgetGroups, setWidgetGroups] = useState<
    Record<string, { id: string; widgetIds: string[] }>
  >({});
  const clipboard = useRef<Widget[]>([]);
  const copiedSelectionBounds = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const allWidgetIDs = useMemo(
    () => editorWidgets.map((w) => w.id).filter((id) => id !== GRID_ID),
    [editorWidgets]
  );

  const selectedWidgets = useMemo(
    () => editorWidgets.filter((w) => selectedWidgetIDs.includes(w.id)),
    [editorWidgets, selectedWidgetIDs]
  );

  const editingWidgets = useMemo(() => {
    return selectedWidgets.length > 0
      ? selectedWidgets
      : [editorWidgets.find((w) => w.id === GRID_ID) ?? editorWidgets[0]];
  }, [selectedWidgets, editorWidgets]);

  function computeGroupBounds(widgetIds: string[]): DOMRectLike | null {
    const widgets = editorWidgets.filter((w) => widgetIds.includes(w.id));
    if (!widgets.length) return null;

    const xs = widgets.map((w) => w.editableProperties.x!.value);
    const ys = widgets.map((w) => w.editableProperties.y!.value);
    const ws = widgets.map((w) => w.editableProperties.width!.value);
    const hs = widgets.map((w) => w.editableProperties.height!.value);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs.map((x, i) => x + ws[i]));
    const maxY = Math.max(...ys.map((y, i) => y + hs[i]));
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  const selectionBounds = useMemo(
    () => computeGroupBounds(selectedWidgetIDs),
    [selectedWidgetIDs, editorWidgets]
  );

  /**
   * Update the full widget list.
   * Optionally records undo history.
   * @param newWidgets New widget list or updater function
   * @param keepHistory Whether to store this change in undo stack
   */
  const updateEditorWidgetList = useCallback(
    (newWidgets: Widget[] | ((prev: Widget[]) => Widget[]), keepHistory = true) => {
      const currentState = deepCloneWidgetList(editorWidgets);
      if (keepHistory) {
        setUndoStack((prevUndo) => {
          const updated = [...prevUndo, currentState];
          return updated.length > MAX_HISTORY ? updated.slice(1) : updated;
        });
        setRedoStack([]);
      }
      setEditorWidgets((prev) => {
        return typeof newWidgets === "function" ? newWidgets(prev) : newWidgets;
      });
    },
    [editorWidgets]
  );

  /**
   * Apply multiple property updates to widgets.
   * @param updates Object mapping widget IDs to property updates
   * @param keepHistory Whether to store this change in undo stack
   */
  const batchWidgetUpdate = useCallback(
    (updates: MultiWidgetPropertyUpdates, keepHistory = true) => {
      updateEditorWidgetList((prev) => updateNestedWidgets(prev, updates), keepHistory);
    },
    [updateEditorWidgetList]
  );

  /**
   * Get a widget by its ID.
   * @param id Widget ID
   * @returns Widget object or undefined
   */
  const getWidget = useCallback(
    (id: string) => findWidgetRecursive(editorWidgets, id),
    [editorWidgets]
  );

  /**
   * Add a new widget to the editor.
   * @param newWidget Widget to add
   */
  const addWidget = (newWidget: Widget) => {
    updateEditorWidgetList((prev) => [...prev, newWidget]);
  };

  /**
   * Delete currently selected widgets.
   */
  const deleteWidget = useCallback(() => {
    updateEditorWidgetList((prev) => prev.filter((w) => !selectedWidgetIDs.includes(w.id)));
    setSelectedWidgetIDs([]);
  }, [selectedWidgetIDs]);

  function groupSelected() {
    if (selectedWidgetIDs.length < 2 || !selectionBounds) return;
    const selectedWidgets = editorWidgets.filter((w) => selectedWidgetIDs.includes(w.id));
    const groupID = uuidv4();
    // Create the new group widget and attach selected widgets as children
    const groupWidget: Widget = {
      id: groupID,
      widgetLabel: "Group",
      widgetName: "Group",
      category: "internal",
      component: () => null,
      children: selectedWidgets,
      editableProperties: {
        x: { ...PROPERTY_SCHEMAS.x, value: selectionBounds.x },
        y: { ...PROPERTY_SCHEMAS.y, value: selectionBounds.y },
        width: { ...PROPERTY_SCHEMAS.width, value: selectionBounds.width },
        height: { ...PROPERTY_SCHEMAS.height, value: selectionBounds.height },
      },
    };

    setEditorWidgets((prev) => {
      // Remove selected widgets from top-level array
      const remainingWidgets = prev.filter((w) => !selectedWidgetIDs.includes(w.id));
      return [...remainingWidgets, groupWidget];
    });

    setSelectedWidgetIDs([groupID]);
  }

  function ungroupSelected() {
    setEditorWidgets((prev) => {
      const newWidgets: Widget[] = [];

      prev.forEach((w) => {
        if (selectedWidgetIDs.includes(w.id) && w.children) {
          newWidgets.push(...w.children);
        } else {
          newWidgets.push(w);
        }
      });

      return newWidgets;
    });

    setSelectedWidgetIDs([]);
  }

  /**
   * Update properties of a single widget.
   * @param id Widget ID
   * @param changes Object mapping property keys to new values
   * @param keepHistory Whether to store this change in undo stack
   */
  const updateWidgetProperties = useCallback(
    (id: string, changes: PropertyUpdates, keepHistory = true) => {
      const updates: MultiWidgetPropertyUpdates = { [id]: changes };
      batchWidgetUpdate(updates, keepHistory);
    },
    [batchWidgetUpdate]
  );

  type ReorderDirection = "forward" | "backward" | "front" | "back";

  /**
   * Move selected widgets one step in the selected diretion on the z-axis.
   *  @param direction "forward" | "backward" | "front" | "back"
   */
  const reorderWidgets = useCallback(
    (direction: ReorderDirection) => {
      if (selectedWidgetIDs.length === 0) return;

      updateEditorWidgetList((prev) => {
        const [gridZone, ...widgets] = prev;
        const others = widgets.filter((w) => !selectedWidgetIDs.includes(w.id));
        const moving = widgets.filter((w) => selectedWidgetIDs.includes(w.id));

        if (moving.length === 0) return prev;

        let newWidgets: Widget[] = [];

        switch (direction) {
          case "forward": {
            const maxIdx = Math.max(...moving.map((w) => widgets.findIndex((p) => p.id === w.id)));
            const insertPos = Math.min(maxIdx + 1, others.length);
            const before = others.slice(0, insertPos);
            const after = others.slice(insertPos);
            newWidgets = [...before, ...moving, ...after];
            break;
          }
          case "backward": {
            const minIdx = Math.min(...moving.map((w) => widgets.findIndex((p) => p.id === w.id)));
            const insertPos = Math.max(minIdx - 1, 0);
            const before = others.slice(0, insertPos);
            const after = others.slice(insertPos);
            newWidgets = [...before, ...moving, ...after];
            break;
          }
          case "front":
            newWidgets = [...others, ...moving];
            break;
          case "back":
            newWidgets = [...moving, ...others];
            break;
        }

        return [gridZone, ...newWidgets];
      });
    },
    [selectedWidgetIDs, updateEditorWidgetList]
  );

  const stepForward = useCallback(() => {
    reorderWidgets("forward");
  }, [reorderWidgets]);

  const stepBackwards = useCallback(() => {
    reorderWidgets("backward");
  }, [reorderWidgets]);

  const bringToFront = useCallback(() => {
    reorderWidgets("front");
  }, [reorderWidgets]);

  const sendToBack = useCallback(() => {
    reorderWidgets("back");
  }, [reorderWidgets]);

  /**
   * Align selected widgets by the left margin.
   */
  const alignLeft = useCallback(() => {
    if (selectedWidgets.length < 2) return;
    const leftX = Math.min(...selectedWidgets.map((w) => w.editableProperties.x?.value ?? 0));
    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((w) => {
      updates[w.id] = { x: leftX };
    });
    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Align selected widgets by the right margin.
   */
  const alignRight = useCallback(() => {
    if (selectedWidgets.length < 2) return;
    const rightX = Math.max(
      ...selectedWidgets.map(
        (w) => (w.editableProperties.x?.value ?? 0) + (w.editableProperties.width?.value ?? 0)
      )
    );
    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((w) => {
      if (!w.editableProperties.x || !w.editableProperties.width) return;
      updates[w.id] = { x: rightX - w.editableProperties.width.value };
    });
    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Align selected widgets by the top margin.
   */
  const alignTop = useCallback(() => {
    if (selectedWidgets.length < 2) return;
    const topY = Math.min(...selectedWidgets.map((w) => w.editableProperties.y?.value ?? 0));
    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((w) => {
      updates[w.id] = { y: topY };
    });
    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Align selected widgets by the bottom margin.
   */
  const alignBottom = useCallback(() => {
    if (selectedWidgets.length < 2) return;
    const bottomY = Math.max(
      ...selectedWidgets.map(
        (w) => (w.editableProperties.y?.value ?? 0) + (w.editableProperties.height?.value ?? 0)
      )
    );
    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((w) => {
      if (!w.editableProperties.y || !w.editableProperties.height) return;
      updates[w.id] = { y: bottomY - w.editableProperties.height.value };
    });
    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Align selected widgets by the horizontal center.
   */
  const alignHorizontalCenter = useCallback(() => {
    if (selectedWidgets.length < 2) return;
    const minX = Math.min(...selectedWidgets.map((w) => w.editableProperties.x?.value ?? 0));
    const maxX = Math.max(
      ...selectedWidgets.map(
        (w) => (w.editableProperties.x?.value ?? 0) + (w.editableProperties.width?.value ?? 0)
      )
    );
    const centerX = (minX + maxX) / 2;

    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((w) => {
      if (!w.editableProperties.x || !w.editableProperties.width) return;
      updates[w.id] = { x: centerX - w.editableProperties.width.value / 2 };
    });
    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Align selected widgets by the vertical center.
   */
  const alignVerticalCenter = useCallback(() => {
    if (selectedWidgets.length < 2) return;
    const minY = Math.min(...selectedWidgets.map((w) => w.editableProperties.y?.value ?? 0));
    const maxY = Math.max(
      ...selectedWidgets.map(
        (w) => (w.editableProperties.y?.value ?? 0) + (w.editableProperties.height?.value ?? 0)
      )
    );
    const centerY = (minY + maxY) / 2;

    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((w) => {
      if (!w.editableProperties.y || !w.editableProperties.height) return;
      updates[w.id] = { y: centerY - w.editableProperties.height.value / 2 };
    });
    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Distribute selected widgets (3 or more) horizontally.
   * @warning Functionality not tested yet!
   */

  const distributeHorizontal = useCallback(() => {
    if (selectedWidgets.length < 3) return;

    const sorted = [...selectedWidgets].sort(
      (a, b) => (a.editableProperties.x?.value ?? 0) - (b.editableProperties.x?.value ?? 0)
    );

    const leftX = sorted[0].editableProperties.x?.value ?? 0;
    const rightX =
      (sorted[sorted.length - 1].editableProperties.x?.value ?? 0) +
      (sorted[sorted.length - 1].editableProperties.width?.value ?? 0);

    const totalWidth = sorted.reduce((sum, w) => sum + (w.editableProperties.width?.value ?? 0), 0);
    const spacing = (rightX - leftX - totalWidth) / (sorted.length - 1);

    let currentX = leftX;
    const updates: MultiWidgetPropertyUpdates = {};

    sorted.forEach((w, idx) => {
      if (idx === 0 || idx === sorted.length - 1) return; // skip first and last
      if (!w.editableProperties.x) return;
      currentX += (sorted[idx - 1].editableProperties.width?.value ?? 0) + spacing;
      updates[w.id] = { x: currentX };
    });

    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Distribute selected widgets (3 or more) vertically.
   * @warning Functionality not tested yet!
   */
  const distributeVertical = useCallback(() => {
    if (selectedWidgets.length < 3) return;

    const sorted = [...selectedWidgets].sort(
      (a, b) => (a.editableProperties.y?.value ?? 0) - (b.editableProperties.y?.value ?? 0)
    );

    const topY = sorted[0].editableProperties.y?.value ?? 0;
    const bottomY =
      (sorted[sorted.length - 1].editableProperties.y?.value ?? 0) +
      (sorted[sorted.length - 1].editableProperties.height?.value ?? 0);

    const totalHeight = sorted.reduce(
      (sum, w) => sum + (w.editableProperties.height?.value ?? 0),
      0
    );
    const spacing = (bottomY - topY - totalHeight) / (sorted.length - 1);

    let currentY = topY;
    const updates: MultiWidgetPropertyUpdates = {};

    sorted.forEach((w, idx) => {
      if (idx === 0 || idx === sorted.length - 1) return; // skip first and last
      if (!w.editableProperties.y) return;
      currentY += (sorted[idx - 1].editableProperties.height?.value ?? 0) + spacing;
      updates[w.id] = { y: currentY };
    });

    batchWidgetUpdate(updates);
  }, [selectedWidgets, batchWidgetUpdate]);

  /**
   * Undo the last editor state change.
   */
  const handleUndo = useCallback(() => {
    const currentState = deepCloneWidgetList(editorWidgets);
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      const previousState = prevUndo[prevUndo.length - 1];
      setEditorWidgets(previousState);
      return prevUndo.slice(0, -1);
    });
    setRedoStack((prevRedo) => {
      if (undoStack.length === 0) return prevRedo;
      const updatedRedo = [...prevRedo, currentState];
      return updatedRedo.length > MAX_HISTORY ? updatedRedo.slice(1) : updatedRedo;
    });
  }, [editorWidgets, undoStack]);

  /**
   * Redo the last editor state change.
   */
  const handleRedo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const nextState = prevRedo[prevRedo.length - 1];
      setEditorWidgets(nextState);
      return prevRedo.slice(0, -1);
    });
    setUndoStack((prevUndo) => {
      if (redoStack.length == 0) return prevUndo;
      const updatedUndo = [...prevUndo, deepCloneWidgetList(editorWidgets)];
      return updatedUndo.length > MAX_HISTORY ? updatedUndo.slice(1) : updatedUndo;
    });
  }, [editorWidgets, redoStack]);

  /**
   * Copy currently selected widgets to clipboard.
   * @note the widget clipboard is managed internally. The actual system clipboard is not used here.
   */
  const copyWidget = useCallback(() => {
    if (selectedWidgets.length === 0) return;
    if (selectedWidgets.length > 1 && selectionBounds) {
      copiedSelectionBounds.current = selectionBounds;
    }
    clipboard.current = selectedWidgets
      .filter((w) => w !== undefined)
      .map((w) => {
        return deepCloneWidget(w);
      });
  }, [selectedWidgets, selectionBounds]);

  /**
   * Paste widgets from clipboard at a specified grid position.
   * @param pos Position to paste widgets at
   */
  const pasteWidget = useCallback(
    (pos: GridPosition) => {
      if (clipboard.current.length === 0) return;

      const pastingGroup = clipboard.current.length > 1;
      const baseX = pastingGroup
        ? copiedSelectionBounds.current.x
        : clipboard.current[0].editableProperties.x!.value;
      const baseY = pastingGroup
        ? copiedSelectionBounds.current.y
        : clipboard.current[0].editableProperties.y!.value;

      const dx = pos.x - baseX;
      const dy = pos.y - baseY;

      const newWidgets = clipboard.current.map((w) => {
        const clone = deepCloneWidget(w);
        const id = `${w.widgetName}-${uuidv4()}`;
        return {
          ...clone,
          id,
          editableProperties: {
            ...w.editableProperties,
            x: w.editableProperties.x
              ? { ...w.editableProperties.x, value: w.editableProperties.x.value + dx }
              : undefined,
            y: w.editableProperties.y
              ? { ...w.editableProperties.y, value: w.editableProperties.y.value + dy }
              : undefined,
          },
        };
      });

      updateEditorWidgetList((prev) => [...prev, ...newWidgets]);
      setSelectedWidgetIDs(newWidgets.map((w) => w.id));
    },
    [updateEditorWidgetList, copiedSelectionBounds]
  );

  /**
   * Export current widgets to JSON file.
   */
  const downloadWidgets = useCallback(async () => {
    const defaultName = "weiss-opi.json";
    const simplified = editorWidgets.map(
      (widget) =>
        ({
          id: widget.id,
          parentId: widget.children,
          widgetName: widget.widgetName,
          properties: Object.fromEntries(
            Object.entries(widget.editableProperties).map(([key, def]) => [key, def.value])
          ),
        } as ExportedWidget)
    );

    const dataStr = JSON.stringify(simplified, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    // Extend the Window type locally with File System Access API
    interface FileSystemWindow extends Window {
      showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
    const fsWindow = window as FileSystemWindow;

    if (fsWindow.showSaveFilePicker) {
      try {
        const handle = await fsWindow.showSaveFilePicker({
          suggestedName: defaultName,
          types: [
            {
              description: "JSON Files",
              accept: { "application/json": [".json"] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        if ((err as DOMException).name === "AbortError") {
          return;
        }
        console.error("Failed to save via File System Access API", err);
      }
    }

    // Fallback for browsers that dont support file system interaction
    const filename = prompt("Enter filename:", defaultName) ?? defaultName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editorWidgets]);

  /**
   * Load widgets from JSON or ExportedWidget array.
   * @param widgetsData JSON string or array of ExportedWidget
   */
  const loadWidgets = useCallback(
    (widgetsData: string | ExportedWidget[]) => {
      try {
        let parsed: ExportedWidget[];
        if (typeof widgetsData === "string") {
          parsed = JSON.parse(widgetsData);
        } else {
          parsed = widgetsData;
        }

        const imported = parsed
          .map((raw, idx) => {
            let baseWdg;
            if (idx == 0) {
              if (raw.id !== GRID_ID) {
                throw new Error(
                  "Missing or invalid grid properties. Did you move the grid from first position?"
                );
              }
              baseWdg = GridZone;
            } else {
              baseWdg = WidgetRegistry[raw.widgetName];
            }
            if (!baseWdg && raw.widgetName != "Group") {
              //TODO: actually handle group loading properly
              console.warn(`Unknown widget type: ${raw.widgetName}`);
              return null;
            }

            const instance = deepCloneWidget(baseWdg);
            instance.id = raw.id;
            instance.children = raw.children;

            // overlay values from the file
            for (const [key, val] of Object.entries(raw.properties ?? {})) {
              const propName = key as PropertyKey;
              if (instance.editableProperties[propName]) {
                instance.editableProperties[propName].value = val;
              }
            }

            return instance;
          })
          .filter(Boolean) as Widget[];
        updateEditorWidgetList(imported);
        setSelectedWidgetIDs([]);
      } catch (err) {
        console.error("Failed to load widgets:", err);
      }
    },
    [updateEditorWidgetList]
  );

  /**
   * List of all PVs held by widgets.
   */
  const PVList = useMemo(() => {
    const set = new Set<string>();
    for (const w of editorWidgets) {
      if (w.editableProperties?.pvName?.value) {
        set.add(w.editableProperties.pvName.value);
      }
      const multiPV = w.editableProperties?.pvNames?.value;
      if (multiPV) {
        Object.values(multiPV).forEach((pv) => {
          if (pv) set.add(pv);
        });
      }
    }
    return Array.from(set);
  }, [editorWidgets]);

  /**
   * Macros to be substituted on pv names.
   */
  const macros = getWidget(GRID_ID)?.editableProperties.macros?.value;

  return {
    editorWidgets,
    setEditorWidgets,
    selectedWidgetIDs,
    editingWidgets,
    selectionBounds,
    undoStack,
    redoStack,
    setSelectedWidgetIDs,
    selectedWidgets,
    updateEditorWidgetList,
    batchWidgetUpdate,
    getWidget,
    addWidget,
    deleteWidget,
    widgetGroups,
    setWidgetGroups,
    computeGroupBounds,
    groupSelected,
    ungroupSelected,
    copyWidget,
    pasteWidget,
    updateWidgetProperties,
    stepForward,
    stepBackwards,
    bringToFront,
    sendToBack,
    handleRedo,
    handleUndo,
    alignLeft,
    alignRight,
    alignTop,
    alignBottom,
    alignHorizontalCenter,
    alignVerticalCenter,
    distributeHorizontal,
    distributeVertical,
    downloadWidgets,
    loadWidgets,
    PVList,
    macros,
    allWidgetIDs,
    isDragging,
    setIsDragging,
  };
}
