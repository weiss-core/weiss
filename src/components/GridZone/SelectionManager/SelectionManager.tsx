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

const SelectionManager: React.FC<SelectionManagerProps> = ({
  gridRef,
  zoom,
  pan,
  enabled = true,
}) => {
  const { editorWidgets, setSelectedWidgetIDs } = useEditorContext();
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });

  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !gridRef.current) return;
    const grid = gridRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = grid.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setStart({ x, y });
      setEnd({ x, y });
      setIsSelecting(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      const rect = grid.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setEnd({ x, y });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isSelecting) return;
      setIsSelecting(false);

      const rect = grid.getBoundingClientRect();
      const xEnd = (e.clientX - rect.left - pan.x) / zoom;
      const yEnd = (e.clientY - rect.top - pan.y) / zoom;

      const dx = Math.abs(xEnd - start.x);
      const dy = Math.abs(yEnd - start.y);

      // --- Single click
      if (dx < CLICK_THRESHOLD && dy < CLICK_THRESHOLD) {
        const groupEl = (e.target as HTMLElement)?.closest(".groupBox");
        const widgetEl = (e.target as HTMLElement)?.closest(".selectable");
        if (groupEl) {
          // Select all widgets with this groupId
          const groupId = groupEl.getAttribute("id");
          if (groupId) {
            const groupWidgetIds = editorWidgets
              .filter((w) => w.groupId === groupId)
              .map((w) => w.id);
            e.ctrlKey
              ? setSelectedWidgetIDs((prev) => Array.from(new Set([...prev, ...groupWidgetIds])))
              : setSelectedWidgetIDs(groupWidgetIds);
          }
        } else if (widgetEl) {
          const id = widgetEl.getAttribute("id");
          if (id) {
            e.ctrlKey ? setSelectedWidgetIDs((prev) => [...prev, id]) : setSelectedWidgetIDs([id]);
          }
        } else {
          // Clicked empty space
          setSelectedWidgetIDs([]);
        }
        return;
      }

      // --- Area selection
      const selX = Math.min(start.x, xEnd);
      const selY = Math.min(start.y, yEnd);
      const selWidth = Math.abs(xEnd - start.x);
      const selHeight = Math.abs(yEnd - start.y);

      const selectedIds = new Set<string>();

      // First select all fully contained widgets
      editorWidgets.forEach((w) => {
        if (w.id === GRID_ID) return;
        const x = w.editableProperties.x!.value;
        const y = w.editableProperties.y!.value;
        const width = w.editableProperties.width!.value;
        const height = w.editableProperties.height!.value;

        const inside =
          x >= selX && y >= selY && x + width <= selX + selWidth && y + height <= selY + selHeight;

        if (inside) {
          if (w.groupId) {
            // Add all widgets in the same group
            editorWidgets
              .filter((wg) => wg.groupId === w.groupId)
              .forEach((wg) => selectedIds.add(wg.id));
          } else {
            selectedIds.add(w.id);
          }
        }
      });

      setSelectedWidgetIDs(Array.from(selectedIds));
    };

    grid.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      grid.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [enabled, zoom, pan, gridRef, editorWidgets, start, setSelectedWidgetIDs]);

  if (!isSelecting) return null;
  const x = Math.min(start.x, end.x) * zoom + pan.x;
  const y = Math.min(start.y, end.y) * zoom + pan.y;
  const w = Math.abs(end.x - start.x) * zoom;
  const h = Math.abs(end.y - start.y) * zoom;

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
      }}
    />
  );
};

export default SelectionManager;
