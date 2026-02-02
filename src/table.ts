/**
 * Table widget - tabular data display with optional selection
 */

/**
 * Column definition
 */
export interface TableColumn<T = Record<string, unknown>> {
  /** Column key/accessor */
  key: keyof T | string;
  /** Column header title */
  title: string;
  /** Fixed width (0 = auto) */
  width?: number;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom formatter */
  format?: (value: unknown, row: T) => string;
}

/**
 * Table border style
 */
export interface TableBorder {
  top: string;
  topLeft: string;
  topRight: string;
  topMid: string;
  bottom: string;
  bottomLeft: string;
  bottomRight: string;
  bottomMid: string;
  left: string;
  right: string;
  mid: string;
  midLeft: string;
  midRight: string;
  midMid: string;
  horizontal: string;
  vertical: string;
}

/**
 * Built-in border styles
 */
export const TableBorders = {
  none: {
    top: '', topLeft: '', topRight: '', topMid: '',
    bottom: '', bottomLeft: '', bottomRight: '', bottomMid: '',
    left: '', right: '', mid: '',
    midLeft: '', midRight: '', midMid: '',
    horizontal: '', vertical: ' ',
  },
  simple: {
    top: '-', topLeft: '', topRight: '', topMid: '',
    bottom: '-', bottomLeft: '', bottomRight: '', bottomMid: '',
    left: '', right: '', mid: '-',
    midLeft: '', midRight: '', midMid: '',
    horizontal: '-', vertical: ' | ',
  },
  rounded: {
    top: '─', topLeft: '╭', topRight: '╮', topMid: '┬',
    bottom: '─', bottomLeft: '╰', bottomRight: '╯', bottomMid: '┴',
    left: '│', right: '│', mid: '─',
    midLeft: '├', midRight: '┤', midMid: '┼',
    horizontal: '─', vertical: '│',
  },
  single: {
    top: '─', topLeft: '┌', topRight: '┐', topMid: '┬',
    bottom: '─', bottomLeft: '└', bottomRight: '┘', bottomMid: '┴',
    left: '│', right: '│', mid: '─',
    midLeft: '├', midRight: '┤', midMid: '┼',
    horizontal: '─', vertical: '│',
  },
  double: {
    top: '═', topLeft: '╔', topRight: '╗', topMid: '╦',
    bottom: '═', bottomLeft: '╚', bottomRight: '╝', bottomMid: '╩',
    left: '║', right: '║', mid: '═',
    midLeft: '╠', midRight: '╣', midMid: '╬',
    horizontal: '═', vertical: '║',
  },
  thick: {
    top: '━', topLeft: '┏', topRight: '┓', topMid: '┳',
    bottom: '━', bottomLeft: '┗', bottomRight: '┛', bottomMid: '┻',
    left: '┃', right: '┃', mid: '━',
    midLeft: '┣', midRight: '┫', midMid: '╋',
    horizontal: '━', vertical: '┃',
  },
} as const;

/**
 * Table border style name
 */
export type TableBorderName = keyof typeof TableBorders;

/**
 * Table options
 */
export interface TableOptions<T> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Table data rows */
  rows?: T[];
  /** Border style */
  border?: TableBorderName | TableBorder;
  /** Show header row */
  showHeader?: boolean;
  /** Show header separator */
  showHeaderSeparator?: boolean;
  /** Padding between cell content and border */
  padding?: number;
  /** Selected row index (-1 for none) */
  selected?: number;
  /** Selection indicator */
  cursor?: string;
  /** Enable row selection */
  selectable?: boolean;
}

/**
 * Table model
 */
export interface TableModel<T> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Table data rows */
  rows: T[];
  /** Border style */
  border: TableBorder;
  /** Show header */
  showHeader: boolean;
  /** Show header separator */
  showHeaderSeparator: boolean;
  /** Cell padding */
  padding: number;
  /** Selected row index */
  selected: number;
  /** Selection cursor */
  cursor: string;
  /** Selectable */
  selectable: boolean;
  /** Computed column widths */
  columnWidths: number[];
}

/**
 * Create a new table model
 */
export function createTable<T>(options: TableOptions<T>): TableModel<T> {
  const border = typeof options.border === 'string'
    ? TableBorders[options.border]
    : options.border ?? TableBorders.single;

  const rows = options.rows ?? [];
  const columns = options.columns;
  const padding = options.padding ?? 1;

  // Calculate column widths
  const columnWidths = columns.map((col, idx) => {
    // Start with title width
    let width = col.title.length;

    // Check all row values
    for (const row of rows) {
      const value = getValue(row, col);
      const formatted = col.format ? col.format(value, row) : String(value ?? '');
      width = Math.max(width, formatted.length);
    }

    // Apply constraints
    if (col.width) {
      width = col.width;
    } else {
      if (col.minWidth) width = Math.max(width, col.minWidth);
      if (col.maxWidth) width = Math.min(width, col.maxWidth);
    }

    return width;
  });

  return {
    columns,
    rows,
    border,
    showHeader: options.showHeader ?? true,
    showHeaderSeparator: options.showHeaderSeparator ?? true,
    padding,
    selected: options.selected ?? -1,
    cursor: options.cursor ?? '→',
    selectable: options.selectable ?? false,
    columnWidths,
  };
}

/**
 * Get value from row by column key
 */
function getValue<T>(row: T, col: TableColumn<T>): unknown {
  if (typeof row === 'object' && row !== null) {
    return (row as Record<string, unknown>)[col.key as string];
  }
  return undefined;
}

/**
 * Set the table rows
 */
export function setRows<T>(model: TableModel<T>, rows: T[]): TableModel<T> {
  // Recalculate column widths
  const columnWidths = model.columns.map((col, idx) => {
    let width = col.title.length;
    for (const row of rows) {
      const value = getValue(row, col);
      const formatted = col.format ? col.format(value, row) : String(value ?? '');
      width = Math.max(width, formatted.length);
    }
    if (col.width) width = col.width;
    else {
      if (col.minWidth) width = Math.max(width, col.minWidth);
      if (col.maxWidth) width = Math.min(width, col.maxWidth);
    }
    return width;
  });

  return {
    ...model,
    rows,
    columnWidths,
    selected: Math.min(model.selected, rows.length - 1),
  };
}

/**
 * Select a row
 */
export function selectRow<T>(model: TableModel<T>, index: number): TableModel<T> {
  if (index < -1 || index >= model.rows.length) return model;
  return { ...model, selected: index };
}

/**
 * Move selection up
 */
export function moveUp<T>(model: TableModel<T>): TableModel<T> {
  if (!model.selectable || model.rows.length === 0) return model;
  const newSelected = model.selected <= 0 ? model.rows.length - 1 : model.selected - 1;
  return { ...model, selected: newSelected };
}

/**
 * Move selection down
 */
export function moveDown<T>(model: TableModel<T>): TableModel<T> {
  if (!model.selectable || model.rows.length === 0) return model;
  const newSelected = model.selected >= model.rows.length - 1 ? 0 : model.selected + 1;
  return { ...model, selected: newSelected };
}

/**
 * Get selected row
 */
export function getSelected<T>(model: TableModel<T>): T | undefined {
  if (model.selected < 0 || model.selected >= model.rows.length) return undefined;
  return model.rows[model.selected];
}

/**
 * Pad string based on alignment
 */
function padCell(text: string, width: number, align: 'left' | 'center' | 'right'): string {
  if (text.length >= width) return text.slice(0, width);

  switch (align) {
    case 'right':
      return text.padStart(width);
    case 'center':
      const leftPad = Math.floor((width - text.length) / 2);
      return text.padStart(leftPad + text.length).padEnd(width);
    default:
      return text.padEnd(width);
  }
}

/**
 * Render a horizontal border line
 */
function renderBorderLine(
  model: TableModel<unknown>,
  left: string,
  mid: string,
  right: string,
  horizontal: string
): string {
  if (!horizontal) return '';

  const segments = model.columnWidths.map(w => horizontal.repeat(w + model.padding * 2));
  return left + segments.join(mid) + right;
}

/**
 * Render a data row
 */
function renderRow<T>(
  model: TableModel<T>,
  cells: string[],
  isSelected: boolean
): string {
  const { border, padding, cursor, selectable } = model;
  const paddingStr = ' '.repeat(padding);

  const cellStrs = cells.map((cell, i) => {
    const align = model.columns[i].align ?? 'left';
    return paddingStr + padCell(cell, model.columnWidths[i], align) + paddingStr;
  });

  let line = border.left + cellStrs.join(border.vertical) + border.right;

  if (selectable) {
    const prefix = isSelected ? cursor + ' ' : '  ';
    line = prefix + line;
  }

  return line;
}

/**
 * Render the table
 */
export function view<T>(model: TableModel<T>): string {
  const lines: string[] = [];
  const { border, showHeader, showHeaderSeparator } = model;

  // Top border
  const topLine = renderBorderLine(model as TableModel<unknown>, border.topLeft, border.topMid, border.topRight, border.top);
  if (topLine) lines.push(topLine);

  // Header row
  if (showHeader) {
    const headerCells = model.columns.map(col => col.title);
    lines.push(renderRow(model, headerCells, false));

    // Header separator
    if (showHeaderSeparator) {
      const sepLine = renderBorderLine(model as TableModel<unknown>, border.midLeft, border.midMid, border.midRight, border.mid);
      if (sepLine) lines.push(sepLine);
    }
  }

  // Data rows
  model.rows.forEach((row, rowIndex) => {
    const cells = model.columns.map(col => {
      const value = getValue(row, col);
      return col.format ? col.format(value, row) : String(value ?? '');
    });
    const isSelected = rowIndex === model.selected;
    lines.push(renderRow(model, cells, isSelected));
  });

  // Bottom border
  const bottomLine = renderBorderLine(model as TableModel<unknown>, border.bottomLeft, border.bottomMid, border.bottomRight, border.bottom);
  if (bottomLine) lines.push(bottomLine);

  return lines.join('\n');
}

/**
 * Table widget namespace
 */
export const Table = {
  create: createTable,
  setRows,
  selectRow,
  moveUp,
  moveDown,
  getSelected,
  view,
  Borders: TableBorders,
};
