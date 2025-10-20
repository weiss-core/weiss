import { FRONT_UI_ZIDX, GRID_ID } from "@src/constants/constants";
import { useEditorContext } from "@src/context/useEditorContext";
import React, { useRef, useState, useEffect } from "react";

interface SelectionManagerProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pan: { x: number; y: number };
  enabled?: boolean;
}

const CLICK_THRESHOLD = 3;

const SelectionManager: React.FC<SelectionManagerProps> = ({ gridRef, zoom, pan }) => {
  const { editorWidgets, setSelectedWidgetIDs, isDragging } = useEditorContext();
  const [selection, setSelection] = useState<{
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }>({});
  const isSelecting = !!selection.start;

  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMouseDown = (e: MouseEvent) => {
      const id = (e.target as HTMLElement).getAttribute("id");
      if (id !== GRID_ID) return;

      const rect = grid.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setSelection({ start: { x, y }, end: { x, y } });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!selection.start) return;
      const rect = grid.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setSelection((prev) => (prev.start ? { ...prev, end: { x, y } } : prev));
    };

    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const id = target.getAttribute("id");
      const widgetEl = target.closest(".selectable");
      if (id !== GRID_ID && !widgetEl) return;
      // --- Ignore mouse up if dragging widgets
      if (isDragging) {
        setSelection({});
        return;
      }

      const rect = grid.getBoundingClientRect();
      const xEnd = (e.clientX - rect.left - pan.x) / zoom;
      const yEnd = (e.clientY - rect.top - pan.y) / zoom;

      // --- No active selection: interpret as click
      if (!selection.start) {
        const wId = widgetEl?.getAttribute("id");
        if (widgetEl && wId) {
          e.ctrlKey
            ? setSelectedWidgetIDs((prev) =>
                prev.includes(wId) ? prev.filter((pid) => pid !== wId) : [...prev, wId]
              )
            : setSelectedWidgetIDs([wId]);
        } else {
          setSelectedWidgetIDs([]);
        }
        return;
      }

      // --- Finish area selection
      const { start } = selection;
      const dx = Math.abs(xEnd - start.x);
      const dy = Math.abs(yEnd - start.y);

      // just a click (too small)
      if (dx < CLICK_THRESHOLD && dy < CLICK_THRESHOLD) {
        setSelection({});
        setSelectedWidgetIDs([]);
        return;
      }

      const selX = Math.min(start.x, xEnd);
      const selY = Math.min(start.y, yEnd);
      const selW = Math.abs(xEnd - start.x);
      const selH = Math.abs(yEnd - start.y);

      const selectedIds = editorWidgets
        .filter((w) => {
          if (w.id === GRID_ID) return false;
          const { x, y, width, height } = {
            x: w.editableProperties.x!.value,
            y: w.editableProperties.y!.value,
            width: w.editableProperties.width!.value,
            height: w.editableProperties.height!.value,
          };
          return x >= selX && y >= selY && x + width <= selX + selW && y + height <= selY + selH;
        })
        .map((w) => w.id);
      setSelectedWidgetIDs(selectedIds);
      setSelection({});
    };

    grid.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      grid.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [zoom, pan, gridRef, editorWidgets, setSelectedWidgetIDs, selection, isDragging]);

  if (!isSelecting || !selection.end) return null;
  const x = Math.min(selection.start!.x, selection.end.x) * zoom + pan.x;
  const y = Math.min(selection.start!.y, selection.end.y) * zoom + pan.y;
  const w = Math.abs(selection.end.x - selection.start!.x) * zoom;
  const h = Math.abs(selection.end.y - selection.start!.y) * zoom;

  return (
    <div
      ref={areaRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        border: "1px solid rgba(0, 128, 255, 0.8)",
        backgroundColor: "rgba(0, 128, 255, 0.2)",
        pointerEvents: "none",
        zIndex: FRONT_UI_ZIDX - 1,
        boxSizing: "border-box",
      }}
    />
  );
};

export default SelectionManager;
