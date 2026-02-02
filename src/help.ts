/**
 * Help widget - displays keyboard shortcuts and help text
 */

/**
 * Key binding definition
 */
export interface KeyBinding {
  /** Key or key combination */
  key: string;
  /** Description of what the key does */
  description: string;
}

/**
 * Key binding group
 */
export interface KeyBindingGroup {
  /** Group title */
  title?: string;
  /** Bindings in this group */
  bindings: KeyBinding[];
}

/**
 * Help options
 */
export interface HelpOptions {
  /** Key bindings to display */
  bindings?: KeyBinding[];
  /** Grouped key bindings */
  groups?: KeyBindingGroup[];
  /** Width of the help display */
  width?: number;
  /** Separator between key and description */
  separator?: string;
  /** Gap between columns */
  columnGap?: number;
  /** Number of columns (0 = auto) */
  columns?: number;
  /** Show in full screen mode */
  fullScreen?: boolean;
}

/**
 * Help model
 */
export interface HelpModel {
  /** Flat list of bindings */
  bindings: KeyBinding[];
  /** Grouped bindings */
  groups: KeyBindingGroup[];
  /** Display width */
  width: number;
  /** Key-description separator */
  separator: string;
  /** Column gap */
  columnGap: number;
  /** Number of columns */
  columns: number;
  /** Full screen mode */
  fullScreen: boolean;
}

/**
 * Create a new help model
 */
export function createHelp(options: HelpOptions = {}): HelpModel {
  const bindings = options.bindings ?? [];
  const groups = options.groups ?? (bindings.length > 0 ? [{ bindings }] : []);

  return {
    bindings,
    groups,
    width: options.width ?? 80,
    separator: options.separator ?? ' → ',
    columnGap: options.columnGap ?? 4,
    columns: options.columns ?? 0,
    fullScreen: options.fullScreen ?? false,
  };
}

/**
 * Add a binding
 */
export function addBinding(model: HelpModel, key: string, description: string): HelpModel {
  return {
    ...model,
    bindings: [...model.bindings, { key, description }],
    groups: model.groups.length === 0
      ? [{ bindings: [...model.bindings, { key, description }] }]
      : model.groups,
  };
}

/**
 * Add multiple bindings
 */
export function addBindings(model: HelpModel, bindings: KeyBinding[]): HelpModel {
  return {
    ...model,
    bindings: [...model.bindings, ...bindings],
  };
}

/**
 * Add a group of bindings
 */
export function addGroup(model: HelpModel, group: KeyBindingGroup): HelpModel {
  return {
    ...model,
    groups: [...model.groups, group],
  };
}

/**
 * Set bindings
 */
export function setBindings(model: HelpModel, bindings: KeyBinding[]): HelpModel {
  return {
    ...model,
    bindings,
    groups: [{ bindings }],
  };
}

/**
 * Set groups
 */
export function setGroups(model: HelpModel, groups: KeyBindingGroup[]): HelpModel {
  return {
    ...model,
    groups,
    bindings: groups.flatMap(g => g.bindings),
  };
}

/**
 * Calculate the max key width
 */
function getMaxKeyWidth(bindings: KeyBinding[]): number {
  return bindings.reduce((max, b) => Math.max(max, b.key.length), 0);
}

/**
 * Render a single binding
 */
function renderBinding(binding: KeyBinding, keyWidth: number, separator: string): string {
  return binding.key.padEnd(keyWidth) + separator + binding.description;
}

/**
 * Render bindings in columns
 */
function renderBindingsInColumns(
  bindings: KeyBinding[],
  columns: number,
  width: number,
  separator: string,
  columnGap: number
): string[] {
  if (bindings.length === 0) return [];

  const keyWidth = getMaxKeyWidth(bindings);
  const itemWidth = keyWidth + separator.length + 20; // estimate
  const actualColumns = columns > 0 ? columns : Math.max(1, Math.floor(width / (itemWidth + columnGap)));

  const lines: string[] = [];
  const rowCount = Math.ceil(bindings.length / actualColumns);

  for (let row = 0; row < rowCount; row++) {
    const rowItems: string[] = [];

    for (let col = 0; col < actualColumns; col++) {
      const index = row + col * rowCount;
      if (index < bindings.length) {
        const binding = bindings[index];
        const rendered = renderBinding(binding, keyWidth, separator);
        rowItems.push(rendered);
      }
    }

    lines.push(rowItems.join(' '.repeat(columnGap)));
  }

  return lines;
}

/**
 * Render the help view in a simple format
 */
export function viewSimple(model: HelpModel): string {
  const lines: string[] = [];
  const keyWidth = getMaxKeyWidth(model.bindings);

  for (const binding of model.bindings) {
    lines.push(renderBinding(binding, keyWidth, model.separator));
  }

  return lines.join('\n');
}

/**
 * Render the help view with groups
 */
export function viewGrouped(model: HelpModel): string {
  const lines: string[] = [];

  for (let i = 0; i < model.groups.length; i++) {
    const group = model.groups[i];

    // Add spacing between groups
    if (i > 0) {
      lines.push('');
    }

    // Group title
    if (group.title) {
      lines.push(group.title);
      lines.push('─'.repeat(group.title.length));
    }

    // Bindings
    const keyWidth = getMaxKeyWidth(group.bindings);
    for (const binding of group.bindings) {
      lines.push(renderBinding(binding, keyWidth, model.separator));
    }
  }

  return lines.join('\n');
}

/**
 * Render the help view in columns
 */
export function viewColumns(model: HelpModel): string {
  const allBindings = model.groups.flatMap(g => g.bindings);
  const lines = renderBindingsInColumns(
    allBindings,
    model.columns,
    model.width,
    model.separator,
    model.columnGap
  );

  return lines.join('\n');
}

/**
 * Render the help view
 */
export function view(model: HelpModel): string {
  if (model.groups.length > 1 || model.groups.some(g => g.title)) {
    return viewGrouped(model);
  }

  if (model.columns !== 1) {
    return viewColumns(model);
  }

  return viewSimple(model);
}

/**
 * Render a short help bar (single line)
 */
export function viewShort(model: HelpModel, maxBindings: number = 5): string {
  const bindings = model.bindings.slice(0, maxBindings);
  return bindings.map(b => `${b.key} ${b.description}`).join('  •  ');
}

/**
 * Render with a box around it
 */
export function viewBoxed(model: HelpModel): string {
  const content = view(model);
  const lines = content.split('\n');
  const maxWidth = lines.reduce((max, line) => Math.max(max, line.length), 0);

  const boxed: string[] = [];
  boxed.push('┌' + '─'.repeat(maxWidth + 2) + '┐');

  for (const line of lines) {
    boxed.push('│ ' + line.padEnd(maxWidth) + ' │');
  }

  boxed.push('└' + '─'.repeat(maxWidth + 2) + '┘');

  return boxed.join('\n');
}

/**
 * Help widget namespace
 */
export const Help = {
  create: createHelp,
  addBinding,
  addBindings,
  addGroup,
  setBindings,
  setGroups,
  view,
  viewSimple,
  viewGrouped,
  viewColumns,
  viewShort,
  viewBoxed,
};
