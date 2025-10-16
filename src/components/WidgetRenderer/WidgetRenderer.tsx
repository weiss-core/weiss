import React, { type ReactNode } from "react";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { useEditorContext } from "@src/context/useEditorContext";
import type { MultiWidgetPropertyUpdates, Widget } from "@src/types/widgets";
import { Rnd, type Position, type RndDragEvent, type DraggableData } from "react-rnd";
import { EDIT_MODE, FRONT_UI_ZIDX } from "@src/constants/constants";
import "./WidgetRenderer.css";
import type { DOMRectLike } from "@src/context/useWidgetManager";

interface RendererProps {
  scale: number;
  ensureGridCoordinate: (coord: number) => number;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isPanning: boolean;
}

/**
 * WidgetRenderer is responsible for rendering all editor widgets and handling their interactions.
 *
 * @features
 * - Rendering individual widgets from the WidgetRegistry
 * - Supporting multi-selection and group manipulation
 * - Dragging and resizing widgets with snapping to grid
 * - Updating widget properties in the editor context
 *
 * @param scale Current zoom level of the grid
 * @param ensureGridCoordinate Function to snap items to grid (if snap activated)
 * @param setIsDragging Callback to indicate dragging state
 */
const WidgetRenderer: React.FC<RendererProps> = ({
  scale,
  ensureGridCoordinate,
  setIsDragging,
  isPanning,
}) => {
  const {
    mode,
    editorWidgets,
    updateWidgetProperties,
    batchWidgetUpdate,
    selectedWidgetIDs,
    selectedWidgets,
    selectionBounds,
    widgetGroups,
    computeGroupBounds,
    setSelectedWidgetIDs,
  } = useEditorContext();

  const isMultipleSelect = selectedWidgetIDs.length > 1;
  const selectedWidgetIdsSet = new Set(selectedWidgetIDs);

  const groupedWidgetIds = new Set<string>();
  Object.values(widgetGroups).forEach((group) => {
    group.widgetIds.forEach((id) => groupedWidgetIds.add(id));
  });

  function renderWidget(widget: Widget): ReactNode {
    const Comp = WidgetRegistry[widget.widgetName]?.component;
    return Comp ? <Comp data={widget} /> : <div>Unknown widget</div>;
  }

  const handleDragStop = (_e: RndDragEvent, d: DraggableData, w: Widget) => {
    if (w.editableProperties.x?.value == d.x && w.editableProperties.y?.value == d.y) return;
    setIsDragging(false);
    updateWidgetProperties(w.id, {
      x: ensureGridCoordinate(d.x),
      y: ensureGridCoordinate(d.y),
    });
  };

  const handleResizeStop = (ref: HTMLElement, position: Position, w: Widget) => {
    setIsDragging(false);
    const newWidth = ensureGridCoordinate(parseInt(ref.style.width));
    const newHeight = ensureGridCoordinate(parseInt(ref.style.height));
    if (
      w.editableProperties.width?.value == newWidth &&
      w.editableProperties.height?.value == newHeight
    )
      return;
    const newX = ensureGridCoordinate(position.x);
    const newY = ensureGridCoordinate(position.y);
    updateWidgetProperties(w.id, { width: newWidth, height: newHeight, x: newX, y: newY });
  };

  const handleSelGroupDragStop = (dx: number, dy: number) => {
    setIsDragging(false);

    const updates: MultiWidgetPropertyUpdates = {};
    selectedWidgets.forEach((widget) => {
      const xProp = widget.editableProperties.x;
      const yProp = widget.editableProperties.y;
      if (!xProp || !yProp) return;

      const newX = ensureGridCoordinate(xProp.value + dx);
      const newY = ensureGridCoordinate(yProp.value + dy);

      updates[widget.id] = { x: newX, y: newY };
    });

    batchWidgetUpdate(updates);
  };

  const handleGroupDragStop = (dx: number, dy: number, widgets: Widget[]) => {
    setIsDragging(false);
    const updates: MultiWidgetPropertyUpdates = {};
    widgets.forEach((w) => {
      const x = w.editableProperties.x!.value + dx;
      const y = w.editableProperties.y!.value + dy;
      updates[w.id] = { x: ensureGridCoordinate(x), y: ensureGridCoordinate(y) };
    });
    batchWidgetUpdate(updates);
  };

  const handleSelGroupResizeStop = (ref: HTMLElement) => {
    setIsDragging(false);
    if (!selectionBounds) return;
    const newGroupWidth = ref.offsetWidth;
    const newGroupHeight = ref.offsetHeight;

    const scaleX = newGroupWidth / selectionBounds.width;
    const scaleY = newGroupHeight / selectionBounds.height;

    const updates: MultiWidgetPropertyUpdates = {};

    selectedWidgets.forEach((w) => {
      const widthProp = w.editableProperties.width;
      const heightProp = w.editableProperties.height;
      const xProp = w.editableProperties.x;
      const yProp = w.editableProperties.y;

      if (!widthProp || !heightProp || !xProp || !yProp) return;

      const newWidth = ensureGridCoordinate(widthProp.value * scaleX);
      const newHeight = ensureGridCoordinate(heightProp.value * scaleY);

      const relativeX = xProp.value - selectionBounds.x;
      const relativeY = yProp.value - selectionBounds.y;

      const newX = ensureGridCoordinate(selectionBounds.x + relativeX * scaleX);
      const newY = ensureGridCoordinate(selectionBounds.y + relativeY * scaleY);

      updates[w.id] = { width: newWidth, height: newHeight, x: newX, y: newY };
    });

    batchWidgetUpdate(updates);
  };

  const handleGroupResizeStop = (ref: HTMLElement, bounds: DOMRectLike, widgets: Widget[]) => {
    setIsDragging(false);
    const newGroupWidth = ref.offsetWidth;
    const newGroupHeight = ref.offsetHeight;
    const scaleX = newGroupWidth / bounds.width;
    const scaleY = newGroupHeight / bounds.height;
    const updates: MultiWidgetPropertyUpdates = {};

    widgets.forEach((w) => {
      const { width, height, x, y } = {
        width: w.editableProperties.width!.value,
        height: w.editableProperties.height!.value,
        x: w.editableProperties.x!.value,
        y: w.editableProperties.y!.value,
      };
      const relativeX = x - bounds.x;
      const relativeY = y - bounds.y;
      updates[w.id] = {
        width: ensureGridCoordinate(width * scaleX),
        height: ensureGridCoordinate(height * scaleY),
        x: ensureGridCoordinate(bounds.x + relativeX * scaleX),
        y: ensureGridCoordinate(bounds.y + relativeY * scaleY),
      };
    });

    batchWidgetUpdate(updates);
  };

  const handleWidgetRightClick = (e: React.MouseEvent, w: Widget) => {
    if (mode !== EDIT_MODE) return;
    e.stopPropagation();
    if (e.ctrlKey) {
      setSelectedWidgetIDs((prev) => [...prev, w.id]);
    } else {
      setSelectedWidgetIDs([w.id]);
    }
  };

  const handleWidgetLeftClick = (_e: React.MouseEvent, w: Widget) => {
    if (mode !== EDIT_MODE) return;
    setSelectedWidgetIDs([w.id]);
  };

  return (
    <>
      {isMultipleSelect && selectionBounds && (
        <Rnd
          className="groupBox"
          bounds="window"
          scale={scale}
          disableDragging={mode != EDIT_MODE || isPanning}
          size={{ width: selectionBounds.width, height: selectionBounds.height }}
          position={{ x: selectionBounds.x, y: selectionBounds.y }}
          onDrag={() => setIsDragging(true)}
          onDragStop={(_e, d) => {
            const dx = d.x - selectionBounds.x;
            const dy = d.y - selectionBounds.y;
            handleSelGroupDragStop(dx, dy);
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onResize={() => setIsDragging(true)}
          onResizeStop={(_e, _direction, ref) => handleSelGroupResizeStop(ref)}
          style={{
            outline: `${selectedWidgetIDs.length > 1 ? "1px dashed" : "none"}`,
            zIndex: FRONT_UI_ZIDX - 1,
          }}
        >
          {selectedWidgets.map((w) => {
            return (
              <div
                key={w.id}
                className="selectable selected"
                onClick={(e) => handleWidgetRightClick(e, w)}
                onContextMenu={(e) => handleWidgetLeftClick(e, w)}
                style={{
                  width: w.editableProperties.width!.value,
                  height: w.editableProperties.height!.value,
                  left: w.editableProperties.x!.value - selectionBounds.x,
                  top: w.editableProperties.y!.value - selectionBounds.y,
                  pointerEvents: isPanning ? "none" : "auto",
                }}
              >
                {renderWidget(w)}
              </div>
            );
          })}
        </Rnd>
      )}
      {Object.values(widgetGroups).map((group) => {
        const bounds = computeGroupBounds(group.widgetIds);
        if (!bounds) return null;
        const widgets = editorWidgets.filter((w) => group.widgetIds.includes(w.id));
        // Skip group if all its widgets are in the selection box
        if (group.widgetIds.every((id) => selectedWidgetIdsSet.has(id))) return null;
        return (
          <Rnd
            key={group.id}
            id={`group-${group.id}`}
            className="groupBox"
            bounds="window"
            scale={scale}
            disableDragging={mode !== EDIT_MODE || isPanning}
            size={{ width: bounds.width, height: bounds.height }}
            position={{ x: bounds.x, y: bounds.y }}
            onDrag={() => setIsDragging(true)}
            style={{
              outline: "1px dashed rgba(255,255,255,0.25)",
              zIndex: FRONT_UI_ZIDX - 2,
            }}
            onDragStop={(_e, d) => {
              const dx = d.x - bounds.x;
              const dy = d.y - bounds.y;
              handleGroupDragStop(dx, dy, widgets);
            }}
            onResizeStop={(_e, _dir, ref) => handleGroupResizeStop(ref, bounds, widgets)}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedWidgetIDs(group.widgetIds);
            }}
          >
            {widgets.map((w) => (
              <div
                key={w.id}
                className="selectable"
                style={{
                  position: "absolute",
                  width: w.editableProperties.width!.value,
                  height: w.editableProperties.height!.value,
                  left: w.editableProperties.x!.value - bounds.x,
                  top: w.editableProperties.y!.value - bounds.y,
                }}
                onClick={(e) => handleWidgetRightClick(e, w)}
                onContextMenu={(e) => handleWidgetLeftClick(e, w)}
              >
                {renderWidget(w)}
              </div>
            ))}
          </Rnd>
        );
      })}
      {editorWidgets.map((w) => {
        const isInGroup =
          (selectedWidgetIDs.includes(w.id) && isMultipleSelect) || groupedWidgetIds.has(w.id);
        const isOnlySelected = selectedWidgetIDs.includes(w.id) && !isMultipleSelect;
        return (
          <Rnd
            key={w.id}
            size={{
              width: w.editableProperties.width?.value ?? 0,
              height: w.editableProperties.height?.value ?? 0,
            }}
            position={{
              x: w.editableProperties.x?.value ?? 0,
              y: w.editableProperties.y?.value ?? 0,
            }}
            bounds="window"
            scale={scale}
            id={w.id}
            className={`selectable ${isOnlySelected ? "selected" : ""}`}
            disableDragging={mode != EDIT_MODE || isPanning}
            enableResizing={mode == EDIT_MODE && !isPanning}
            onDrag={() => setIsDragging(true)}
            onDragStop={(_e, d) => handleDragStop(_e, d, w)}
            onResizeStart={() => setIsDragging(true)}
            onClick={(e: React.MouseEvent) => handleWidgetRightClick(e, w)}
            onContextMenu={(e) => handleWidgetLeftClick(e, w)}
            onResizeStop={(_e, _direction, ref, _delta, position) =>
              handleResizeStop(ref, position, w)
            }
          >
            {isInGroup ? null : renderWidget(w)}
          </Rnd>
        );
      })}
    </>
  );
};
export default WidgetRenderer;
