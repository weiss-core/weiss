import React, { useEffect, type ReactNode } from "react";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { useEditorContext } from "@src/context/useEditorContext";
import type { MultiWidgetPropertyUpdates, Widget } from "@src/types/widgets";
import { Rnd, type Position, type RndDragEvent, type DraggableData } from "react-rnd";
import { EDIT_MODE, FRONT_UI_ZIDX } from "@src/constants/constants";
import "./WidgetRenderer.css";

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
    groupBounds,
  } = useEditorContext();

  const isMultipleSelect = selectedWidgetIDs.length > 1;

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

  const handleGroupDragStop = (dx: number, dy: number) => {
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

  const handleGroupResizeStop = (ref: HTMLElement) => {
    setIsDragging(false);
    if (!groupBounds) return;
    const newGroupWidth = ref.offsetWidth;
    const newGroupHeight = ref.offsetHeight;

    const scaleX = newGroupWidth / groupBounds.width;
    const scaleY = newGroupHeight / groupBounds.height;

    const updates: MultiWidgetPropertyUpdates = {};

    selectedWidgets.forEach((w) => {
      const widthProp = w.editableProperties.width;
      const heightProp = w.editableProperties.height;
      const xProp = w.editableProperties.x;
      const yProp = w.editableProperties.y;

      if (!widthProp || !heightProp || !xProp || !yProp) return;

      const newWidth = ensureGridCoordinate(widthProp.value * scaleX);
      const newHeight = ensureGridCoordinate(heightProp.value * scaleY);

      const relativeX = xProp.value - groupBounds.x;
      const relativeY = yProp.value - groupBounds.y;

      const newX = ensureGridCoordinate(groupBounds.x + relativeX * scaleX);
      const newY = ensureGridCoordinate(groupBounds.y + relativeY * scaleY);

      updates[w.id] = { width: newWidth, height: newHeight, x: newX, y: newY };
    });

    batchWidgetUpdate(updates);
  };

  return (
    <>
      {isMultipleSelect && groupBounds && (
        <Rnd
          id="groupBox"
          bounds="window"
          scale={scale}
          disableDragging={mode != EDIT_MODE || isPanning}
          size={{ width: groupBounds.width, height: groupBounds.height }}
          position={{ x: groupBounds.x, y: groupBounds.y }}
          onDrag={() => setIsDragging(true)}
          onDragStop={(_e, d) => {
            const dx = d.x - groupBounds.x;
            const dy = d.y - groupBounds.y;
            handleGroupDragStop(dx, dy);
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onResize={() => setIsDragging(true)}
          onResizeStop={(_e, _direction, ref) => handleGroupResizeStop(ref)}
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
                style={{
                  width: w.editableProperties.width!.value,
                  height: w.editableProperties.height!.value,
                  left: w.editableProperties.x!.value - groupBounds.x,
                  top: w.editableProperties.y!.value - groupBounds.y,
                  pointerEvents: isPanning ? "none" : "auto",
                }}
              >
                {renderWidget(w)}
              </div>
            );
          })}
        </Rnd>
      )}
      {editorWidgets.map((w) => {
        const isInGroupBox = selectedWidgetIDs.includes(w.id) && isMultipleSelect;
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
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onResizeStop={(_e, _direction, ref, _delta, position) =>
              handleResizeStop(ref, position, w)
            }
          >
            {isInGroupBox ? null : renderWidget(w)}
          </Rnd>
        );
      })}
    </>
  );
};
export default WidgetRenderer;
