import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GridPosition, Widget, WidgetUpdate } from "@src/types/widgets";
import WidgetRegistry from "@components/WidgetRegistry/WidgetRegistry";
import { useEditorContext } from "@src/context/useEditorContext.tsx";
import { EDIT_MODE, MAX_ZOOM, MIN_ZOOM, RUNTIME_MODE } from "@src/constants/constants.ts";
import Selecto from "react-selecto";
import ContextMenu from "@components/ContextMenu/ContextMenu";
import "./GridZone.css";
import WidgetRenderer from "@components/WidgetRenderer/WidgetRenderer.tsx";
import ToolbarButtons from "@components/Toolbar/Toolbar.tsx";
import { v4 as uuidv4 } from "uuid";

/**
 * GridZoneComp renders the main editor canvas where widgets are displayed, moved, and interacted with.
 *
 * @features
 * - Drag and drop new widgets from the registry.
 * - Panning and zooming of the grid.
 * - Selection of multiple widgets using drag selection (via Selecto).
 * - Calls context menu actions like cut, copy, paste, z-order management.
 * - Monitors keyboard shortcuts.
 *
 * @param data WidgetUpdate object containing editable properties for the grid.
 *
 * @notes
 * - Zooming is constrained by MIN_ZOOM and MAX_ZOOM constants.
 * - Panning centers the grid on first load or when middle mouse button is used.
 */
const GridZoneComp: React.FC<WidgetUpdate> = ({ data }) => {
  const props = data.editableProperties;
  const {
    mode,
    addWidget,
    selectedWidgetIDs,
    setSelectedWidgetIDs,
    handleRedo,
    handleUndo,
    copyWidget,
    pasteWidget,
    downloadWidgets,
    deleteWidget,
    propertyEditorFocused,
    allWidgetIDs,
    pickedWidget,
  } = useEditorContext();

  const gridRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef<GridPosition>({ x: 0, y: 0 });
  const mousePosRef = useRef<GridPosition>({ x: 0, y: 0 });
  const selectoRef = useRef<Selecto>(null);
  const gridGrabbed = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<GridPosition>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<GridPosition>({ x: 0, y: 0 });
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [mouseOverMenu, setMouseOverMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shouldCenterPan, setShouldCenterPan] = useState(true);
  const [dragPreview, setDragPreview] = useState<{
    widget: Widget;
    x: number;
    y: number;
  } | null>(null);
  const disableSelecto = mouseOverMenu || isDragging || gridGrabbed.current || mode == RUNTIME_MODE;
  const gridSize = props.gridSize!.value;
  const snapToGrid = props.snapToGrid?.value;
  const gridLineVisible = props.gridLineVisible?.value;
  const inEditMode = mode === EDIT_MODE;

  const ensureGridCoordinate = useCallback(
    (coord: number) => {
      return snapToGrid ? Math.round(coord / gridSize) * gridSize : coord;
    },
    [snapToGrid, gridSize]
  );

  const centerScreen = () => {
    setZoom(1);
    setShouldCenterPan(true);
  };

  useEffect(() => {
    if (shouldCenterPan && zoom === 1) {
      const container = document.getElementById("gridContainer");

      if (container) {
        const containerBounds = container.getBoundingClientRect();

        const centerX = containerBounds.width / 2;
        const centerY = containerBounds.height / 2;

        setPan({ x: centerX, y: centerY });
        setShouldCenterPan(false);
      }
    }
  }, [shouldCenterPan, zoom, mode]);

  useEffect(() => {
    const handleClick = () => setContextMenuVisible(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!pickedWidget) return setDragPreview(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const userX = (e.clientX - rect.left - pan.x) / zoom;
    const userY = (e.clientY - rect.top - pan.y) / zoom;

    setDragPreview({
      widget: pickedWidget,
      x: ensureGridCoordinate(userX),
      y: ensureGridCoordinate(userY),
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) {
      console.warn("No data found in dropped widget");
      return;
    }
    const entry = JSON.parse(data) as Widget;
    const droppedComp = WidgetRegistry[entry.widgetName];
    if (!droppedComp) {
      console.warn(`Unknown component: ${entry.widgetName}`);
      return;
    }

    // Deep copy
    const editableProperties = Object.fromEntries(
      Object.entries(droppedComp.editableProperties).map(([k, v]) => [k, { ...v }])
    );

    // Drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const userX = (rawX - pan.x) / zoom;
    const userY = (rawY - pan.y) / zoom;

    if (editableProperties.x) editableProperties.x.value = ensureGridCoordinate(userX);
    if (editableProperties.y) editableProperties.y.value = ensureGridCoordinate(userY);

    const newWidget: Widget = {
      id: `${entry.widgetName}-${uuidv4()}`,
      widgetLabel: droppedComp.widgetLabel,
      component: droppedComp.component,
      widgetName: droppedComp.widgetName,
      category: droppedComp.category,
      editableProperties,
    };
    addWidget(newWidget);
    setDragPreview(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const scaleFactor = 1.1;
    const direction = e.deltaY < 0 ? 1 : -1;
    const z = zoom * (direction > 0 ? scaleFactor : 1 / scaleFactor);
    const newZoom = Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM); // keep between limits
    const container = gridRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const contentX = (mouseX - pan.x) / zoom;
    const contentY = (mouseY - pan.y) / zoom;

    const newPanX = mouseX - contentX * newZoom;
    const newPanY = mouseY - contentY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      gridGrabbed.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleClick = (_e: React.MouseEvent) => {
    setContextMenuVisible(false);
    setSelectedWidgetIDs([]);
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button !== 1) return;
    if (!isPanning) centerScreen();
    setIsPanning(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const userX = (rawX - pan.x) / zoom;
      const userY = (rawY - pan.y) / zoom;

      mousePosRef.current = {
        x: ensureGridCoordinate(userX),
        y: ensureGridCoordinate(userY),
      };
      if (gridGrabbed.current) {
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        // Only consider a pan if there is actual movement
        if (!isPanning && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          setIsPanning(true);
        }
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }
    };

    const handleMouseUp = () => {
      gridGrabbed.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [gridGrabbed, isPanning, setIsPanning, ensureGridCoordinate, pan, zoom, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (propertyEditorFocused) return;
      // centering should work in any mode
      if (e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        centerScreen();
        return;
      }
      if (!inEditMode) return;
      // shortcuts for edit mode only
      if (e.key.toLowerCase() === "delete" && selectedWidgetIDs.length > 0) {
        e.preventDefault();
        deleteWidget();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (
        (e.ctrlKey && e.key.toLowerCase() === "y") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copyWidget();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteWidget(mousePosRef.current);
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedWidgetIDs(allWidgetIDs);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    copyWidget,
    pasteWidget,
    downloadWidgets,
    mousePosRef,
    propertyEditorFocused,
  ]);

  return (
    <div
      ref={gridRef}
      id="gridZone"
      className="gridZone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      style={{
        cursor: gridGrabbed.current ? "grabbing" : "default",
        backgroundColor: props.backgroundColor?.value,
        backgroundImage: gridLineVisible
          ? `linear-gradient(${props.gridLineColor!.value} 1px, transparent 1px),
        linear-gradient(90deg, ${props.gridLineColor!.value} 1px, transparent 1px)`
          : "none",
        backgroundSize: `${props.gridSize!.value * zoom}px ${props.gridSize!.value * zoom}px`,
        backgroundPosition: `${pan.x % (props.gridSize!.value * zoom)}px ${
          pan.y % (props.gridSize!.value * zoom)
        }px`,
      }}
    >
      {dragPreview && (
        <div
          style={{
            position: "absolute",
            left: pan.x + dragPreview.x * zoom,
            top: pan.y + dragPreview.y * zoom,
            width: dragPreview.widget.editableProperties.width?.value ?? 100,
            height: dragPreview.widget.editableProperties.height?.value ?? 50,
            border: "2px dashed #00aaff",
            pointerEvents: "none",
            transform: `scale(${zoom})`,
            zIndex: 1000,
          }}
        />
      )}
      <div
        id="centerRef"
        className={`centerRef ${
          mode === EDIT_MODE && props.centerVisible?.value ? "centerMark" : ""
        }`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <WidgetRenderer
          scale={zoom}
          ensureGridCoordinate={ensureGridCoordinate}
          setIsDragging={setIsDragging}
          isPanning={isPanning}
        />
      </div>
      {!disableSelecto && (
        <Selecto
          ref={selectoRef}
          container={document.getElementById("gridContainer")}
          rootContainer={document.getElementById("gridContainer")}
          selectableTargets={[".selectable"]}
          hitRate={100}
          selectByClick
          preventDragFromInside
          preventRightClick={false}
          preventClickEventOnDragStart
          preventClickEventOnDrag
          toggleContinueSelect={["ctrl"]}
          onSelectEnd={(e) => {
            if (e.selected.length == 0) {
              setContextMenuVisible(false);
            }
            if (selectedWidgetIDs.length > 1 && e.inputEvent.button == 2) {
              return;
            }
            if (e.added.length === 0 && e.removed.length === 0) {
              selectoRef.current?.setSelectedTargets([]);
              setSelectedWidgetIDs([]);
            } else {
              const selectedIDs = e.selected.map((el) => el.id);
              setSelectedWidgetIDs(selectedIDs);
            }
          }}
        />
      )}
      <ToolbarButtons
        onMouseEnter={() => setMouseOverMenu(true)}
        onMouseLeave={() => setMouseOverMenu(false)}
      />
      <ContextMenu
        pos={contextMenuPos}
        mousePos={mousePosRef.current}
        visible={contextMenuVisible}
        onMouseEnter={() => setMouseOverMenu(true)}
        onMouseLeave={() => setMouseOverMenu(false)}
        onClose={() => {
          setContextMenuVisible(false);
          setMouseOverMenu(false);
        }}
      />
    </div>
  );
};

export { GridZoneComp };
