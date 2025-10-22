import { PROPERTY_SCHEMAS } from "@src/types/widgetProperties";
import type {
  MultiWidgetPropertyUpdates,
  Widget,
  WidgetProperties,
  PropertyKey,
  DOMRectLike,
} from "@src/types/widgets";

/**
 * Deep clone a single widget including its editable properties and children recursively.
 * @param widget Widget to clone
 * @returns Cloned widget
 */
export function deepCloneWidget(widget: Widget): Widget {
  return {
    ...widget,
    // clone editableProperties deeply
    editableProperties: Object.fromEntries(
      Object.entries(widget.editableProperties).map(([k, v]) => [k, { ...v }])
    ),
    // recursively clone children if any
    children: widget.children?.map((child) => deepCloneWidget(child)),
  };
}

/**
 * Deep clone a list of widgets.
 * @param widgets Array of widgets to clone
 * @returns A deep-cloned array of widgets
 */
export function deepCloneWidgetList(widgets: Widget[]): Widget[] {
  return widgets.map(deepCloneWidget);
}

export function updateWidgets(widgets: Widget[], updates: MultiWidgetPropertyUpdates): Widget[] {
  const updateOne = (w: Widget): Widget => {
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

export function getWidgetNested(widgets: Widget[], id: string): Widget | undefined {
  for (const w of widgets) {
    if (w.id === id) return w;
    if (w.children) {
      const found = getWidgetNested(w.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function getSelectedWidgets(widgets: Widget[], selectedIds: string[]): Widget[] {
  const result: Widget[] = [];
  for (const w of widgets) {
    if (selectedIds.includes(w.id)) result.push(w);
    if (w.children?.length) result.push(...getSelectedWidgets(w.children, selectedIds));
  }
  return result;
}

/**
 * Create a new group widget instance with optional children and bounds.
 */
export function createGroupWidget(
  id: string,
  children: Widget[] = [],
  bounds?: DOMRectLike
): Widget {
  return {
    id,
    widgetLabel: "Group",
    widgetName: "Group",
    category: "internal",
    component: () => null,
    children,
    editableProperties: {
      x: { ...PROPERTY_SCHEMAS.x, value: bounds?.x ?? 0 },
      y: { ...PROPERTY_SCHEMAS.y, value: bounds?.y ?? 0 },
      width: { ...PROPERTY_SCHEMAS.width, value: bounds?.width ?? 0 },
      height: { ...PROPERTY_SCHEMAS.height, value: bounds?.height ?? 0 },
    },
  };
}

export function getNestedMoveUpdates(
  widget: Widget,
  dx: number,
  dy: number,
  updates: MultiWidgetPropertyUpdates
) {
  const xProp = widget.editableProperties.x?.value ?? 0;
  const yProp = widget.editableProperties.y?.value ?? 0;

  updates[widget.id] = {
    x: xProp + dx,
    y: yProp + dy,
  };

  if (widget.children?.length) {
    widget.children.forEach((child) => getNestedMoveUpdates(child, dx, dy, updates));
  }
}
