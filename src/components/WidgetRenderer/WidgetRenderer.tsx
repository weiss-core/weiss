import React, { type ReactNode } from "react";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { useEditorContext } from "@src/context/useEditorContext";
import type { Widget, GridPosition, MultiWidgetPropertyUpdates } from "@src/types/widgets";
import { Rnd, type DraggableData, type RndDragEvent } from "react-rnd";
import { GRID_ID } from "@src/constants/constants";
import "./WidgetRenderer.css";

const DRAG_END_DELAY = 80; //ms

interface RendererProps {
  scale: number;
  ensureGridCoordinate: (coord: number) => number;
}

const WidgetRenderer: React.FC<RendererProps> = ({ scale, ensureGridCoordinate }) => {
  const {
    inEditMode,
    editorWidgets,
    selectedWidgetIDs,
    batchWidgetUpdate,
    selectionBounds,
    setIsDragging,
    isPanning,
  } = useEditorContext();

  /** Core widget content renderer */
  const renderWidgetContent = (w: Widget): ReactNode => {
    const Comp = WidgetRegistry[w.widgetName]?.component;
    return Comp ? <Comp data={w} /> : null;
  };

  /** Recursively apply delta for drag */
  const applyDelta = (
    widget: Widget,
    dx: number,
    dy: number,
    updates: MultiWidgetPropertyUpdates
  ) => {
    updates[widget.id] = {
      x: ensureGridCoordinate(widget.editableProperties.x!.value + dx),
      y: ensureGridCoordinate(widget.editableProperties.y!.value + dy),
    };
    widget.children?.forEach((child) => applyDelta(child, dx, dy, updates));
  };

  /** Recursively apply proportional resize for groups or selection */
  const applyResize = (
    widget: Widget,
    parentOldX: number,
    parentOldY: number,
    parentOldWidth: number,
    parentOldHeight: number,
    parentNewX: number,
    parentNewY: number,
    parentNewWidth: number,
    parentNewHeight: number,
    updates: MultiWidgetPropertyUpdates
  ) => {
    const { x, y, width, height } = widget.editableProperties;
    if (!x || !y || !width || !height) return;

    const scaleX = parentOldWidth === 0 ? 1 : parentNewWidth / parentOldWidth;
    const scaleY = parentOldHeight === 0 ? 1 : parentNewHeight / parentOldHeight;

    const newX = parentNewX + (x.value - parentOldX) * scaleX;
    const newY = parentNewY + (y.value - parentOldY) * scaleY;
    const newWidth = width.value * scaleX;
    const newHeight = height.value * scaleY;

    updates[widget.id] = {
      x: ensureGridCoordinate(newX),
      y: ensureGridCoordinate(newY),
      width: ensureGridCoordinate(newWidth),
      height: ensureGridCoordinate(newHeight),
    };

    widget.children?.forEach((child) =>
      applyResize(
        child,
        x.value,
        y.value,
        width.value,
        height.value,
        newX,
        newY,
        newWidth,
        newHeight,
        updates
      )
    );
  };

  const handleDragStop = (_e: RndDragEvent, d: DraggableData, w: Widget) => {
    const dx = d.x - w.editableProperties.x!.value;
    const dy = d.y - w.editableProperties.y!.value;
    if (dx === 0 && dy === 0) return;

    setTimeout(() => setIsDragging(false), DRAG_END_DELAY);

    const updates: MultiWidgetPropertyUpdates = {};
    applyDelta(w, dx, dy, updates);
    batchWidgetUpdate(updates);
  };

  const handleResizeStop = (ref: HTMLElement, position: GridPosition, w: Widget) => {
    setTimeout(() => setIsDragging(false), DRAG_END_DELAY);

    const oldX = w.editableProperties.x!.value;
    const oldY = w.editableProperties.y!.value;
    const oldWidth = w.editableProperties.width!.value;
    const oldHeight = w.editableProperties.height!.value;

    const newX = position.x;
    const newY = position.y;
    const newWidth = parseInt(ref.style.width);
    const newHeight = parseInt(ref.style.height);

    const updates: MultiWidgetPropertyUpdates = {};
    applyResize(w, oldX, oldY, oldWidth, oldHeight, newX, newY, newWidth, newHeight, updates);
    batchWidgetUpdate(updates);
  };

  const renderRecursive = (w: Widget, parentX = 0, parentY = 0, isChild = false): ReactNode => {
    if (w.id === GRID_ID) return null;
    const isSelected = selectedWidgetIDs.includes(w.id);
    if (isSelected && selectedWidgetIDs.length > 1) return null;

    const x = w.editableProperties.x!.value - parentX;
    const y = w.editableProperties.y!.value - parentY;
    const width = w.editableProperties.width!.value;
    const height = w.editableProperties.height!.value;

    const canDrag = inEditMode && !isPanning && !isChild;
    const canResize = inEditMode && !isPanning && !isChild;
    const isGroup = w.children?.length;

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

  /** Render selection group for multi-select */
  const renderSelectionGroup = () => {
    if (!selectionBounds || selectedWidgetIDs.length <= 1) return null;

    const selectedWidgets = editorWidgets.filter((w) => selectedWidgetIDs.includes(w.id));
    const canDrag = inEditMode && !isPanning;
    const canResize = inEditMode && !isPanning;

    const renderRecursiveForSelection = (w: Widget, parentX = 0, parentY = 0): ReactNode => {
      const x = w.editableProperties.x!.value - parentX;
      const y = w.editableProperties.y!.value - parentY;
      const width = w.editableProperties.width!.value;
      const height = w.editableProperties.height!.value;
      const isGroup = w.children?.length;

      return (
        <div
          key={w.id}
          className={`selectable ${isGroup ? "groupBox" : ""}`}
          style={{ position: "absolute", left: x, top: y, width, height }}
        >
          {renderWidgetContent(w)}
          {w.children?.map((child) =>
            renderRecursiveForSelection(
              child,
              w.editableProperties.x!.value,
              w.editableProperties.y!.value
            )
          )}
        </div>
      );
    };

    return (
      <Rnd
        bounds="window"
        className="selectionGroup"
        scale={scale}
        size={{ width: selectionBounds.width, height: selectionBounds.height }}
        position={{ x: selectionBounds.x, y: selectionBounds.y }}
        enableResizing={canResize}
        disableDragging={!canDrag}
        onDrag={() => setIsDragging(true)}
        onDragStop={(_e, d) => {
          const dx = d.x - selectionBounds.x;
          const dy = d.y - selectionBounds.y;
          const updates: MultiWidgetPropertyUpdates = {};
          selectedWidgets.forEach((w) => applyDelta(w, dx, dy, updates));
          batchWidgetUpdate(updates);
          setTimeout(() => setIsDragging(false), DRAG_END_DELAY);
        }}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={(_e, _dir, ref, _delta, pos) => {
          const oldWidth = selectionBounds.width;
          const oldHeight = selectionBounds.height;
          const updates: MultiWidgetPropertyUpdates = {};
          selectedWidgets.forEach((w) =>
            applyResize(
              w,
              selectionBounds.x,
              selectionBounds.y,
              oldWidth,
              oldHeight,
              pos.x,
              pos.y,
              ref.offsetWidth,
              ref.offsetHeight,
              updates
            )
          );
          batchWidgetUpdate(updates);
          setTimeout(() => setIsDragging(false), DRAG_END_DELAY);
        }}
      >
        {selectedWidgets.map((w) =>
          renderRecursiveForSelection(w, selectionBounds.x, selectionBounds.y)
        )}
      </Rnd>
    );
  };

  const topLevelWidgets = editorWidgets.filter((w) => w.id !== GRID_ID);

  return (
    <>
      {topLevelWidgets.map((w) => renderRecursive(w))}
      {renderSelectionGroup()}
    </>
  );
};

export default WidgetRenderer;
