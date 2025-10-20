import React, { type ReactNode } from "react";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { useEditorContext } from "@src/context/useEditorContext";
import type { Widget, GridPosition, MultiWidgetPropertyUpdates } from "@src/types/widgets";
import { Rnd, type DraggableData, type RndDragEvent } from "react-rnd";
import { GRID_ID, FRONT_UI_ZIDX } from "@src/constants/constants";
import "./WidgetRenderer.css";

// add delay to set isDragging flag - needed because onDragStop fires before onMouseUp
const DRAG_END_DELAY = 80; //ms

interface RendererProps {
  scale: number;
  ensureGridCoordinate: (coord: number) => number;
  isPanning: boolean;
}

const WidgetRenderer: React.FC<RendererProps> = ({ scale, ensureGridCoordinate, isPanning }) => {
  const {
    inEditMode,
    editorWidgets,
    selectedWidgetIDs,
    updateWidgetProperties,
    batchWidgetUpdate,
    selectionBounds,
    setIsDragging,
  } = useEditorContext();

  /** --- Core widget rendering --- */
  const renderWidgetContent = (w: Widget): ReactNode => {
    const Comp = WidgetRegistry[w.widgetName]?.component;
    return Comp ? <Comp data={w} /> : null;
  };

  /** --- Handle dragging for individual widgets --- */
  const handleDragStop = (_e: RndDragEvent, d: DraggableData, w: Widget) => {
    const oldX = w.editableProperties.x!.value;
    const oldY = w.editableProperties.y!.value;
    if (oldX === d.x && oldY === d.y) return;

    setTimeout(() => setIsDragging(false), DRAG_END_DELAY);

    const deltaX = d.x - oldX;
    const deltaY = d.y - oldY;

    const updates: MultiWidgetPropertyUpdates = {};

    const collectUpdates = (widget: Widget, dx: number, dy: number) => {
      const xProp = widget.editableProperties.x?.value ?? 0;
      const yProp = widget.editableProperties.y?.value ?? 0;

      updates[widget.id] = {
        x: ensureGridCoordinate(xProp + dx),
        y: ensureGridCoordinate(yProp + dy),
      };

      if (widget.children?.length) {
        widget.children.forEach((child) => collectUpdates(child, dx, dy));
      }
    };

    collectUpdates(w, deltaX, deltaY);
    batchWidgetUpdate(updates);
  };

  /** --- Handle resize logic --- */
  const handleResizeStop = (ref: HTMLElement, position: GridPosition, w: Widget) => {
    setTimeout(() => setIsDragging(false), DRAG_END_DELAY);
    updateWidgetProperties(w.id, {
      width: ensureGridCoordinate(parseInt(ref.style.width)),
      height: ensureGridCoordinate(parseInt(ref.style.height)),
      x: ensureGridCoordinate(position.x),
      y: ensureGridCoordinate(position.y),
    });
  };

  /** --- Recursive renderer for nested widgets --- */
  const renderRecursive = (w: Widget, parentX = 0, parentY = 0, isChild = false): ReactNode => {
    if (w.id === GRID_ID) return null;
    // --- hide selected widgets if selection group is active ---
    const isSelected = selectedWidgetIDs.includes(w.id);
    if (isSelected && selectedWidgetIDs.length > 1) return null;
    const x = w.editableProperties.x!.value - parentX;
    const y = w.editableProperties.y!.value - parentY;
    const width = w.editableProperties.width!.value;
    const height = w.editableProperties.height!.value;

    const canDrag = inEditMode && !isPanning && !isChild;
    const canResize = inEditMode && !isPanning && !isChild;
    const isGroup = w.children && w.children.length > 0;

    return (
      <Rnd
        key={w.id}
        id={w.id}
        bounds="window"
        scale={scale}
        disableDragging={!canDrag}
        enableResizing={canResize}
        size={{ width, height }}
        position={{ x, y }}
        className={
          inEditMode ? `selectable ${isSelected ? "selected" : isGroup ? "groupBox" : ""}` : ""
        }
        onDrag={() => setIsDragging(true)}
        onDragStop={(e, d) => handleDragStop(e, d, w)}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={(_e, _dir, ref, _delta, pos) => handleResizeStop(ref, pos, w)}
      >
        {renderWidgetContent(w)}
        {w.children?.map((child) =>
          renderRecursive(child, w.editableProperties.x!.value, w.editableProperties.y!.value, true)
        )}
      </Rnd>
    );
  };

  /** --- Render top-level widgets --- */
  const topLevelWidgets = editorWidgets.filter((w) => w.id !== GRID_ID);

  /** --- Virtual selection group (for multi-select drag) --- */
  const renderSelectionGroup = () => {
    if (!selectionBounds || selectedWidgetIDs.length <= 1) return null;

    // Compute selected widgets and their positions relative to selection box
    const selectedWidgets = editorWidgets.filter((w) => selectedWidgetIDs.includes(w.id));
    const relativeWidgets = selectedWidgets.map((w) => {
      const relX = w.editableProperties.x!.value - selectionBounds.x;
      const relY = w.editableProperties.y!.value - selectionBounds.y;
      return { ...w, relX, relY };
    });

    return (
      <Rnd
        bounds="window"
        scale={scale}
        size={{ width: selectionBounds.width, height: selectionBounds.height }}
        position={{ x: selectionBounds.x, y: selectionBounds.y }}
        enableResizing={false}
        disableDragging={!inEditMode || isPanning}
        onDrag={() => setIsDragging(true)}
        onDragStop={(_e, d) => {
          // Commit final positions of all selected widgets
          const updates: MultiWidgetPropertyUpdates = {};
          relativeWidgets.forEach((w) => {
            updates[w.id] = {
              x: ensureGridCoordinate(d.x + w.relX),
              y: ensureGridCoordinate(d.y + w.relY),
            };
          });
          batchWidgetUpdate(updates);
          setTimeout(() => setIsDragging(false), DRAG_END_DELAY);
        }}
        style={{
          position: "absolute",
          outline: "2px dashed rgba(0, 128, 255, 0.8)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          zIndex: FRONT_UI_ZIDX,
          pointerEvents: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* Render widgets relative to group container */}
        {relativeWidgets.map((w) => (
          <div
            key={w.id}
            id={w.id}
            className="selectable selected"
            style={{
              position: "absolute",
              left: w.relX,
              top: w.relY,
              width: w.editableProperties.width!.value,
              height: w.editableProperties.height!.value,
            }}
          >
            {renderWidgetContent(w)}
          </div>
        ))}
      </Rnd>
    );
  };

  return (
    <>
      {topLevelWidgets.map((w) => renderRecursive(w))}
      {renderSelectionGroup()}
    </>
  );
};

export default WidgetRenderer;
