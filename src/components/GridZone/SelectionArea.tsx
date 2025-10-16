import { FRONT_UI_ZIDX } from "@src/constants/constants";
import React, { useRef, useState, useEffect } from "react";

interface SelectionAreaProps {
  gridRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  pan: { x: number; y: number };
  enabled?: boolean;
  onSelectArea?: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

const SelectionArea: React.FC<SelectionAreaProps> = ({
  gridRef,
  zoom,
  pan,
  enabled = true,
  onSelectArea,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });

  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !gridRef.current) return;

    const grid = gridRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target !== grid) return;
      e.stopPropagation();
      e.preventDefault();

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

    const handleMouseUp = () => {
      if (!isSelecting) return;
      setIsSelecting(false);

      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);

      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      onSelectArea?.({ x, y, width, height });
    };

    grid.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      grid.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [enabled, zoom, pan, gridRef, start, end, isSelecting, onSelectArea]);

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

export default SelectionArea;
