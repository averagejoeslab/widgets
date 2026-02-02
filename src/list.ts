/**
 * List widget - selectable list of items with keyboard navigation
 */

/**
 * List item
 */
export interface ListItem<T = unknown> {
  /** Display text */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional value associated with the item */
  value?: T;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * List options
 */
export interface ListOptions<T = unknown> {
  /** List items */
  items?: ListItem<T>[];
  /** Initially selected index */
  selected?: number;
  /** Visible height (0 = show all) */
  height?: number;
  /** Cursor character for selected item */
  cursor?: string;
  /** Character for unselected items */
  uncursor?: string;
  /** Show descriptions */
  showDescriptions?: boolean;
  /** Wrap around when reaching ends */
  wrap?: boolean;
}

/**
 * List model
 */
export interface ListModel<T = unknown> {
  /** List items */
  items: ListItem<T>[];
  /** Currently selected index */
  selected: number;
  /** Visible height (0 = show all) */
  height: number;
  /** Scroll offset */
  offset: number;
  /** Cursor character */
  cursor: string;
  /** Uncursor character */
  uncursor: string;
  /** Show descriptions */
  showDescriptions: boolean;
  /** Wrap navigation */
  wrap: boolean;
}

/**
 * Create a new list model
 */
export function createList<T = unknown>(options: ListOptions<T> = {}): ListModel<T> {
  const items = options.items ?? [];
  const selected = options.selected ?? 0;
  const height = options.height ?? 0;

  return {
    items,
    selected: Math.max(0, Math.min(selected, items.length - 1)),
    height,
    offset: 0,
    cursor: options.cursor ?? '> ',
    uncursor: options.uncursor ?? '  ',
    showDescriptions: options.showDescriptions ?? false,
    wrap: options.wrap ?? true,
  };
}

/**
 * Set the list items
 */
export function setItems<T>(model: ListModel<T>, items: ListItem<T>[]): ListModel<T> {
  return {
    ...model,
    items,
    selected: Math.min(model.selected, Math.max(0, items.length - 1)),
    offset: 0,
  };
}

/**
 * Move selection up
 */
export function moveUp<T>(model: ListModel<T>): ListModel<T> {
  if (model.items.length === 0) return model;

  let newSelected = model.selected - 1;

  if (newSelected < 0) {
    newSelected = model.wrap ? model.items.length - 1 : 0;
  }

  // Skip disabled items
  let attempts = 0;
  while (model.items[newSelected]?.disabled && attempts < model.items.length) {
    newSelected = newSelected - 1;
    if (newSelected < 0) {
      newSelected = model.wrap ? model.items.length - 1 : 0;
    }
    attempts++;
  }

  return updateOffset({ ...model, selected: newSelected });
}

/**
 * Move selection down
 */
export function moveDown<T>(model: ListModel<T>): ListModel<T> {
  if (model.items.length === 0) return model;

  let newSelected = model.selected + 1;

  if (newSelected >= model.items.length) {
    newSelected = model.wrap ? 0 : model.items.length - 1;
  }

  // Skip disabled items
  let attempts = 0;
  while (model.items[newSelected]?.disabled && attempts < model.items.length) {
    newSelected = newSelected + 1;
    if (newSelected >= model.items.length) {
      newSelected = model.wrap ? 0 : model.items.length - 1;
    }
    attempts++;
  }

  return updateOffset({ ...model, selected: newSelected });
}

/**
 * Move to first item
 */
export function moveToStart<T>(model: ListModel<T>): ListModel<T> {
  if (model.items.length === 0) return model;

  let newSelected = 0;

  // Skip disabled items
  while (model.items[newSelected]?.disabled && newSelected < model.items.length) {
    newSelected++;
  }

  return updateOffset({ ...model, selected: newSelected });
}

/**
 * Move to last item
 */
export function moveToEnd<T>(model: ListModel<T>): ListModel<T> {
  if (model.items.length === 0) return model;

  let newSelected = model.items.length - 1;

  // Skip disabled items
  while (model.items[newSelected]?.disabled && newSelected >= 0) {
    newSelected--;
  }

  return updateOffset({ ...model, selected: newSelected });
}

/**
 * Move by page (for page up/down)
 */
export function moveByPage<T>(model: ListModel<T>, direction: 'up' | 'down'): ListModel<T> {
  if (model.items.length === 0) return model;

  const pageSize = model.height > 0 ? model.height : 10;
  let newSelected = model.selected + (direction === 'up' ? -pageSize : pageSize);

  newSelected = Math.max(0, Math.min(newSelected, model.items.length - 1));

  // Skip disabled items
  while (model.items[newSelected]?.disabled) {
    newSelected += direction === 'up' ? -1 : 1;
    if (newSelected < 0 || newSelected >= model.items.length) {
      return model;
    }
  }

  return updateOffset({ ...model, selected: newSelected });
}

/**
 * Select a specific index
 */
export function select<T>(model: ListModel<T>, index: number): ListModel<T> {
  if (index < 0 || index >= model.items.length) return model;
  if (model.items[index]?.disabled) return model;

  return updateOffset({ ...model, selected: index });
}

/**
 * Get the currently selected item
 */
export function getSelected<T>(model: ListModel<T>): ListItem<T> | undefined {
  return model.items[model.selected];
}

/**
 * Get the currently selected value
 */
export function getSelectedValue<T>(model: ListModel<T>): T | undefined {
  return model.items[model.selected]?.value;
}

/**
 * Update offset to keep selection visible
 */
function updateOffset<T>(model: ListModel<T>): ListModel<T> {
  if (model.height === 0) {
    return { ...model, offset: 0 };
  }

  let newOffset = model.offset;

  // Scroll down if needed
  if (model.selected >= model.offset + model.height) {
    newOffset = model.selected - model.height + 1;
  }

  // Scroll up if needed
  if (model.selected < model.offset) {
    newOffset = model.selected;
  }

  return { ...model, offset: newOffset };
}

/**
 * Filter items by a predicate
 */
export function filter<T>(model: ListModel<T>, predicate: (item: ListItem<T>) => boolean): ListModel<T> {
  const filteredItems = model.items.filter(predicate);
  return setItems(model, filteredItems);
}

/**
 * Filter items by title (case insensitive)
 */
export function filterByTitle<T>(model: ListModel<T>, query: string): ListModel<T> {
  const lowerQuery = query.toLowerCase();
  return filter(model, item => item.title.toLowerCase().includes(lowerQuery));
}

/**
 * Render the list
 */
export function view<T>(model: ListModel<T>): string {
  if (model.items.length === 0) {
    return '';
  }

  const visibleStart = model.offset;
  const visibleEnd = model.height > 0
    ? Math.min(model.offset + model.height, model.items.length)
    : model.items.length;

  const lines: string[] = [];

  for (let i = visibleStart; i < visibleEnd; i++) {
    const item = model.items[i];
    const isSelected = i === model.selected;
    const cursor = isSelected ? model.cursor : model.uncursor;

    let line = cursor + item.title;

    if (item.disabled) {
      line += ' (disabled)';
    }

    lines.push(line);

    if (model.showDescriptions && item.description) {
      lines.push(model.uncursor + '  ' + item.description);
    }
  }

  return lines.join('\n');
}

/**
 * Render with custom item renderer
 */
export function viewWith<T>(
  model: ListModel<T>,
  renderItem: (item: ListItem<T>, isSelected: boolean, index: number) => string
): string {
  if (model.items.length === 0) {
    return '';
  }

  const visibleStart = model.offset;
  const visibleEnd = model.height > 0
    ? Math.min(model.offset + model.height, model.items.length)
    : model.items.length;

  const lines: string[] = [];

  for (let i = visibleStart; i < visibleEnd; i++) {
    const item = model.items[i];
    const isSelected = i === model.selected;
    lines.push(renderItem(item, isSelected, i));
  }

  return lines.join('\n');
}

/**
 * List widget namespace
 */
export const List = {
  create: createList,
  setItems,
  moveUp,
  moveDown,
  moveToStart,
  moveToEnd,
  moveByPage,
  select,
  getSelected,
  getSelectedValue,
  filter,
  filterByTitle,
  view,
  viewWith,
};
