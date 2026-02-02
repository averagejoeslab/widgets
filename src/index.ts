/**
 * @puppuccino/widgets - Terminal UI component library
 *
 * A collection of reusable terminal UI components built with the Elm Architecture.
 * Each widget provides a functional API for creating and manipulating UI state.
 */

// Spinner widget
export {
  Spinner,
  SpinnerFrames,
  createSpinner,
  type SpinnerType,
  type SpinnerOptions,
  type SpinnerModel,
} from './spinner';

// Progress bar widget
export {
  Progress,
  ProgressStyles,
  createProgress,
  type ProgressStyleName,
  type ProgressChars,
  type ProgressOptions,
  type ProgressModel,
} from './progress';

// Text input widget
export {
  TextInput,
  createTextInput,
  type TextInputOptions,
  type TextInputModel,
} from './textinput';

// List widget
export {
  List,
  createList,
  type ListItem,
  type ListOptions,
  type ListModel,
} from './list';

// Viewport widget
export {
  Viewport,
  createViewport,
  type ViewportOptions,
  type ViewportModel,
} from './viewport';

// Table widget
export {
  Table,
  TableBorders,
  createTable,
  type TableColumn,
  type TableBorder,
  type TableBorderName,
  type TableOptions,
  type TableModel,
} from './table';

// Help widget
export {
  Help,
  createHelp,
  type KeyBinding,
  type KeyBindingGroup,
  type HelpOptions,
  type HelpModel,
} from './help';

// Timer widget
export {
  Timer,
  createTimer,
  type TimerMode,
  type TimerState,
  type TimerOptions,
  type TimerModel,
} from './timer';
