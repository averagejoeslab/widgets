# @puppuccino/widgets

Terminal UI component library with reusable widgets.

## Installation

```bash
npm install @puppuccino/widgets
```

Or install from GitHub:

```bash
npm install github:averagejoeslab/widgets
```

## Features

- **Spinner** - Animated loading indicators with 40+ frame sets
- **Progress** - Progress bars with multiple styles
- **TextInput** - Single-line text input with cursor
- **List** - Selectable list with keyboard navigation
- **Viewport** - Scrollable content area
- **Table** - Tabular data display with borders
- **Help** - Key bindings display
- **Timer** - Countdown and stopwatch

## Widgets

### Spinner

Animated loading indicators with customizable frame sets.

```typescript
import { Spinner, SpinnerFrames } from '@puppuccino/widgets';

// Create spinner
const spinner = Spinner.create({ type: 'dot' });

// Advance frame (call on each tick)
const next = Spinner.tick(spinner);

// Render
console.log(Spinner.view(spinner));

// Available frame sets
Spinner.create({ type: 'line' });     // - \ | /
Spinner.create({ type: 'dot' });      // ⠋ ⠙ ⠹ ...
Spinner.create({ type: 'moon' });     // 🌑 🌒 🌓 ...
Spinner.create({ type: 'clock' });    // 🕛 🕐 🕑 ...

// Custom frames
Spinner.create({ frames: ['◐', '◓', '◑', '◒'] });
```

### Progress

Progress bars with multiple visual styles.

```typescript
import { Progress, ProgressStyles } from '@puppuccino/widgets';

// Create progress bar
const bar = Progress.create({ width: 40 });

// Update progress (0-1)
const updated = Progress.set(bar, 0.5);

// Or use percentage
const fromPercent = Progress.setPercent(bar, 75);

// Render
console.log(Progress.view(updated));
// ████████████████████░░░░░░░░░░░░░░░░░░░░ 50%

// Different styles
Progress.create({ style: 'ascii' });   // ##########----------
Progress.create({ style: 'dots' });    // ●●●●●●●●●●○○○○○○○○○○
Progress.create({ style: 'blocks' });  // ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░

// Quick render
console.log(Progress.render(0.75, { width: 20 }));
```

### TextInput

Single-line text input with cursor and editing.

```typescript
import { TextInput } from '@puppuccino/widgets';

// Create input
let input = TextInput.create({
  placeholder: 'Enter your name',
  prompt: '> ',
});

// Handle key events
input = TextInput.insert(input, 'H');
input = TextInput.insert(input, 'i');
input = TextInput.cursorLeft(input);
input = TextInput.backspace(input);

// Navigation
input = TextInput.cursorStart(input);  // Go to start
input = TextInput.cursorEnd(input);    // Go to end
input = TextInput.wordLeft(input);     // Previous word
input = TextInput.wordRight(input);    // Next word

// Deletion
input = TextInput.deleteWordBackward(input);
input = TextInput.deleteToEnd(input);
input = TextInput.clear(input);

// Password mode
const password = TextInput.create({ mask: '•' });

// Render
console.log(TextInput.view(input));
// > Hello│
```

### List

Selectable list with keyboard navigation.

```typescript
import { List } from '@puppuccino/widgets';

// Create list
let list = List.create({
  items: [
    { title: 'Option 1', value: 'one' },
    { title: 'Option 2', value: 'two' },
    { title: 'Option 3', value: 'three' },
  ],
  height: 5,  // Visible items
});

// Navigation
list = List.moveDown(list);
list = List.moveUp(list);
list = List.moveToStart(list);
list = List.moveToEnd(list);
list = List.moveByPage(list, 'down');

// Get selection
const selected = List.getSelected(list);      // { title, value }
const value = List.getSelectedValue(list);    // value only

// Filter items
list = List.filterByTitle(list, 'opt');

// Render
console.log(List.view(list));
// > Option 1
//   Option 2
//   Option 3

// Custom rendering
console.log(List.viewWith(list, (item, isSelected) =>
  `${isSelected ? '●' : '○'} ${item.title}`
));
```

### Viewport

Scrollable content area for long text.

```typescript
import { Viewport } from '@puppuccino/widgets';

// Create viewport
let viewport = Viewport.create({
  content: longText,
  height: 10,
  width: 80,
});

// Scrolling
viewport = Viewport.scrollDown(viewport);
viewport = Viewport.scrollUp(viewport);
viewport = Viewport.pageDown(viewport);
viewport = Viewport.pageUp(viewport);
viewport = Viewport.halfPageDown(viewport);
viewport = Viewport.scrollToTop(viewport);
viewport = Viewport.scrollToBottom(viewport);
viewport = Viewport.scrollToLine(viewport, 50);

// Check position
const atTop = Viewport.atTop(viewport);
const atBottom = Viewport.atBottom(viewport);
const percent = Viewport.getScrollPercent(viewport);

// Render
console.log(Viewport.view(viewport));

// With scroll indicator
console.log(Viewport.viewWithIndicators(viewport));
// ... content ...
// ↕ 45%
```

### Table

Tabular data display with borders and selection.

```typescript
import { Table, TableBorders } from '@puppuccino/widgets';

// Define columns
const columns = [
  { key: 'name', title: 'Name', width: 20 },
  { key: 'age', title: 'Age', align: 'right' as const },
  { key: 'city', title: 'City' },
];

// Create table
let table = Table.create({
  columns,
  rows: [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
  ],
  border: 'rounded',
  selectable: true,
});

// Selection
table = Table.moveDown(table);
table = Table.moveUp(table);
const row = Table.getSelected(table);

// Render
console.log(Table.view(table));
// ╭──────────────────────┬─────┬─────────╮
// │ Name                 │ Age │ City    │
// ├──────────────────────┼─────┼─────────┤
// │ Alice                │  30 │ NYC     │
// │ Bob                  │  25 │ LA      │
// ╰──────────────────────┴─────┴─────────╯

// Border styles: 'none', 'simple', 'single', 'rounded', 'double', 'thick'
```

### Help

Display keyboard shortcuts and help text.

```typescript
import { Help } from '@puppuccino/widgets';

// Create help display
let help = Help.create({
  bindings: [
    { key: 'q', description: 'Quit' },
    { key: '↑/↓', description: 'Navigate' },
    { key: 'Enter', description: 'Select' },
  ],
});

// Grouped bindings
help = Help.create({
  groups: [
    {
      title: 'Navigation',
      bindings: [
        { key: '↑', description: 'Move up' },
        { key: '↓', description: 'Move down' },
      ],
    },
    {
      title: 'Actions',
      bindings: [
        { key: 'Enter', description: 'Confirm' },
        { key: 'Esc', description: 'Cancel' },
      ],
    },
  ],
});

// Render options
console.log(Help.view(help));           // Auto format
console.log(Help.viewSimple(help));     // Simple list
console.log(Help.viewGrouped(help));    // With group headers
console.log(Help.viewColumns(help));    // Multi-column
console.log(Help.viewShort(help));      // Single line
console.log(Help.viewBoxed(help));      // With border
```

### Timer

Countdown and stopwatch functionality.

```typescript
import { Timer } from '@puppuccino/widgets';

// Stopwatch
let stopwatch = Timer.createStopwatch();
stopwatch = Timer.start(stopwatch);

// Later...
console.log(Timer.view(stopwatch));  // "01:23"

// Countdown
let countdown = Timer.createCountdown(5 * 60 * 1000);  // 5 minutes
countdown = Timer.start(countdown);

// Control
countdown = Timer.pause(countdown);
countdown = Timer.resume(countdown);
countdown = Timer.toggle(countdown);  // Start/pause toggle
countdown = Timer.reset(countdown);

// On each tick
countdown = Timer.tick(countdown);

// Check state
const elapsed = Timer.getElapsed(countdown);
const remaining = Timer.getRemaining(countdown);
const progress = Timer.getProgress(countdown);  // 0-1
const finished = Timer.isFinished(countdown);

// Formatting
console.log(Timer.formatTime(elapsed));         // "02:30"
console.log(Timer.formatTime(elapsed, true));   // "02:30.45"
console.log(Timer.formatTimeCompact(elapsed));  // "2m 30s"

// Render with state indicator
console.log(Timer.viewWithState(countdown));
// ▶ 04:30  (running)
// ⏸ 04:30  (paused)
// ✓ 00:00  (finished)
```

## API Reference

### Spinner

- `Spinner.create(options?)` - Create spinner
- `Spinner.tick(model)` - Advance frame
- `Spinner.reset(model)` - Reset to first frame
- `Spinner.view(model)` - Render current frame

### Progress

- `Progress.create(options?)` - Create progress bar
- `Progress.set(model, value)` - Set progress (0-1)
- `Progress.setPercent(model, percent)` - Set by percentage
- `Progress.increment(model, amount?)` - Increase
- `Progress.decrement(model, amount?)` - Decrease
- `Progress.view(model)` - Render bar
- `Progress.render(value, options?)` - Quick render

### TextInput

- `TextInput.create(options?)` - Create input
- `TextInput.insert(model, char)` - Insert character
- `TextInput.backspace(model)` - Delete before cursor
- `TextInput.delete(model)` - Delete at cursor
- `TextInput.cursorLeft/Right/Start/End(model)` - Move cursor
- `TextInput.wordLeft/Right(model)` - Word navigation
- `TextInput.clear(model)` - Clear input
- `TextInput.view(model)` - Render input

### List

- `List.create(options?)` - Create list
- `List.moveUp/Down(model)` - Navigate
- `List.moveToStart/End(model)` - Jump to ends
- `List.moveByPage(model, direction)` - Page navigation
- `List.getSelected(model)` - Get selected item
- `List.filter(model, predicate)` - Filter items
- `List.view(model)` - Render list

### Viewport

- `Viewport.create(options?)` - Create viewport
- `Viewport.scrollUp/Down(model, lines?)` - Scroll
- `Viewport.pageUp/Down(model)` - Page scroll
- `Viewport.scrollToTop/Bottom(model)` - Jump to ends
- `Viewport.getScrollPercent(model)` - Get position
- `Viewport.view(model)` - Render content

### Table

- `Table.create(options)` - Create table
- `Table.setRows(model, rows)` - Update data
- `Table.moveUp/Down(model)` - Navigate selection
- `Table.getSelected(model)` - Get selected row
- `Table.view(model)` - Render table

### Help

- `Help.create(options?)` - Create help display
- `Help.addBinding(model, key, desc)` - Add binding
- `Help.view(model)` - Render (auto format)
- `Help.viewShort(model)` - Single line

### Timer

- `Timer.create(options?)` - Create timer
- `Timer.createStopwatch()` - Create stopwatch
- `Timer.createCountdown(ms)` - Create countdown
- `Timer.start/pause/resume/toggle(model)` - Control
- `Timer.tick(model)` - Update on tick
- `Timer.getElapsed/Remaining(model)` - Get times
- `Timer.view(model)` - Render time

## License

MIT
