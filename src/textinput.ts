/**
 * Text input widget - single-line text input with cursor
 */

/**
 * Text input options
 */
export interface TextInputOptions {
  /** Initial value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum length */
  maxLength?: number;
  /** Mask character for passwords */
  mask?: string;
  /** Character limit display */
  showCharCount?: boolean;
  /** Width of the input */
  width?: number;
  /** Prompt/prefix text */
  prompt?: string;
  /** Cursor character */
  cursor?: string;
}

/**
 * Text input model
 */
export interface TextInputModel {
  /** Current value */
  value: string;
  /** Cursor position */
  cursor: number;
  /** Placeholder text */
  placeholder: string;
  /** Maximum length (0 = unlimited) */
  maxLength: number;
  /** Mask character (null = no mask) */
  mask: string | null;
  /** Show character count */
  showCharCount: boolean;
  /** Width */
  width: number;
  /** Prompt text */
  prompt: string;
  /** Cursor character */
  cursorChar: string;
  /** Is focused */
  focused: boolean;
}

/**
 * Create a new text input model
 */
export function createTextInput(options: TextInputOptions = {}): TextInputModel {
  const value = options.value ?? '';
  return {
    value,
    cursor: value.length,
    placeholder: options.placeholder ?? '',
    maxLength: options.maxLength ?? 0,
    mask: options.mask ?? null,
    showCharCount: options.showCharCount ?? false,
    width: options.width ?? 0,
    prompt: options.prompt ?? '',
    cursorChar: options.cursor ?? '│',
    focused: true,
  };
}

/**
 * Set the input value
 */
export function setValue(model: TextInputModel, value: string): TextInputModel {
  let newValue = value;
  if (model.maxLength > 0 && newValue.length > model.maxLength) {
    newValue = newValue.slice(0, model.maxLength);
  }
  return {
    ...model,
    value: newValue,
    cursor: Math.min(model.cursor, newValue.length),
  };
}

/**
 * Set focus state
 */
export function focus(model: TextInputModel): TextInputModel {
  return { ...model, focused: true };
}

/**
 * Remove focus
 */
export function blur(model: TextInputModel): TextInputModel {
  return { ...model, focused: false };
}

/**
 * Move cursor to position
 */
export function setCursor(model: TextInputModel, position: number): TextInputModel {
  return {
    ...model,
    cursor: Math.max(0, Math.min(position, model.value.length)),
  };
}

/**
 * Move cursor left
 */
export function cursorLeft(model: TextInputModel): TextInputModel {
  return setCursor(model, model.cursor - 1);
}

/**
 * Move cursor right
 */
export function cursorRight(model: TextInputModel): TextInputModel {
  return setCursor(model, model.cursor + 1);
}

/**
 * Move cursor to start
 */
export function cursorStart(model: TextInputModel): TextInputModel {
  return setCursor(model, 0);
}

/**
 * Move cursor to end
 */
export function cursorEnd(model: TextInputModel): TextInputModel {
  return setCursor(model, model.value.length);
}

/**
 * Insert a character at cursor position
 */
export function insert(model: TextInputModel, char: string): TextInputModel {
  if (model.maxLength > 0 && model.value.length >= model.maxLength) {
    return model;
  }

  const before = model.value.slice(0, model.cursor);
  const after = model.value.slice(model.cursor);
  let newValue = before + char + after;

  if (model.maxLength > 0 && newValue.length > model.maxLength) {
    newValue = newValue.slice(0, model.maxLength);
  }

  return {
    ...model,
    value: newValue,
    cursor: model.cursor + char.length,
  };
}

/**
 * Delete character before cursor (backspace)
 */
export function backspace(model: TextInputModel): TextInputModel {
  if (model.cursor === 0) return model;

  const before = model.value.slice(0, model.cursor - 1);
  const after = model.value.slice(model.cursor);

  return {
    ...model,
    value: before + after,
    cursor: model.cursor - 1,
  };
}

/**
 * Delete character at cursor (delete key)
 */
export function deleteChar(model: TextInputModel): TextInputModel {
  if (model.cursor === model.value.length) return model;

  const before = model.value.slice(0, model.cursor);
  const after = model.value.slice(model.cursor + 1);

  return {
    ...model,
    value: before + after,
  };
}

/**
 * Delete word before cursor
 */
export function deleteWordBackward(model: TextInputModel): TextInputModel {
  if (model.cursor === 0) return model;

  const before = model.value.slice(0, model.cursor);
  const after = model.value.slice(model.cursor);

  // Find word boundary
  let i = before.length - 1;
  // Skip trailing whitespace
  while (i >= 0 && /\s/.test(before[i])) i--;
  // Skip word
  while (i >= 0 && !/\s/.test(before[i])) i--;

  return {
    ...model,
    value: before.slice(0, i + 1) + after,
    cursor: i + 1,
  };
}

/**
 * Delete from cursor to end of line
 */
export function deleteToEnd(model: TextInputModel): TextInputModel {
  return {
    ...model,
    value: model.value.slice(0, model.cursor),
  };
}

/**
 * Delete from cursor to start of line
 */
export function deleteToStart(model: TextInputModel): TextInputModel {
  return {
    ...model,
    value: model.value.slice(model.cursor),
    cursor: 0,
  };
}

/**
 * Clear the input
 */
export function clear(model: TextInputModel): TextInputModel {
  return {
    ...model,
    value: '',
    cursor: 0,
  };
}

/**
 * Move cursor to previous word
 */
export function wordLeft(model: TextInputModel): TextInputModel {
  if (model.cursor === 0) return model;

  let i = model.cursor - 1;
  // Skip whitespace
  while (i > 0 && /\s/.test(model.value[i])) i--;
  // Skip word
  while (i > 0 && !/\s/.test(model.value[i - 1])) i--;

  return setCursor(model, i);
}

/**
 * Move cursor to next word
 */
export function wordRight(model: TextInputModel): TextInputModel {
  if (model.cursor === model.value.length) return model;

  let i = model.cursor;
  // Skip current word
  while (i < model.value.length && !/\s/.test(model.value[i])) i++;
  // Skip whitespace
  while (i < model.value.length && /\s/.test(model.value[i])) i++;

  return setCursor(model, i);
}

/**
 * Render the text input
 */
export function view(model: TextInputModel): string {
  let displayValue = model.value;

  // Apply mask
  if (model.mask !== null) {
    displayValue = model.mask.repeat(model.value.length);
  }

  // Show placeholder if empty and not focused
  if (displayValue.length === 0 && model.placeholder && !model.focused) {
    displayValue = model.placeholder;
  }

  // Insert cursor if focused
  if (model.focused) {
    const before = model.mask
      ? model.mask.repeat(model.cursor)
      : displayValue.slice(0, model.cursor);
    const after = model.mask
      ? model.mask.repeat(model.value.length - model.cursor)
      : displayValue.slice(model.cursor);
    displayValue = before + model.cursorChar + after;
  }

  // Apply width
  if (model.width > 0) {
    if (displayValue.length > model.width) {
      // Scroll to keep cursor visible
      const cursorInDisplay = model.cursor + (model.focused ? 1 : 0);
      if (cursorInDisplay > model.width) {
        const offset = cursorInDisplay - model.width;
        displayValue = displayValue.slice(offset, offset + model.width);
      } else {
        displayValue = displayValue.slice(0, model.width);
      }
    } else {
      displayValue = displayValue.padEnd(model.width);
    }
  }

  // Add prompt
  let result = model.prompt + displayValue;

  // Add character count
  if (model.showCharCount && model.maxLength > 0) {
    result += ` ${model.value.length}/${model.maxLength}`;
  }

  return result;
}

/**
 * Text input widget namespace
 */
export const TextInput = {
  create: createTextInput,
  setValue,
  focus,
  blur,
  setCursor,
  cursorLeft,
  cursorRight,
  cursorStart,
  cursorEnd,
  insert,
  backspace,
  delete: deleteChar,
  deleteWordBackward,
  deleteToEnd,
  deleteToStart,
  clear,
  wordLeft,
  wordRight,
  view,
};
