import { describe, it, expect } from 'vitest';
import { TextInput, createTextInput } from './textinput';

describe('TextInput', () => {
  describe('createTextInput', () => {
    it('should create with default options', () => {
      const input = createTextInput();
      expect(input.value).toBe('');
      expect(input.cursor).toBe(0);
      expect(input.focused).toBe(true);
    });

    it('should create with initial value', () => {
      const input = createTextInput({ value: 'hello' });
      expect(input.value).toBe('hello');
      expect(input.cursor).toBe(5);
    });

    it('should create with options', () => {
      const input = createTextInput({
        placeholder: 'Enter text',
        maxLength: 10,
        mask: '*',
      });
      expect(input.placeholder).toBe('Enter text');
      expect(input.maxLength).toBe(10);
      expect(input.mask).toBe('*');
    });
  });

  describe('setValue', () => {
    it('should set value and adjust cursor', () => {
      const input = createTextInput();
      const updated = TextInput.setValue(input, 'hello');
      expect(updated.value).toBe('hello');
    });

    it('should respect maxLength', () => {
      const input = createTextInput({ maxLength: 5 });
      const updated = TextInput.setValue(input, 'hello world');
      expect(updated.value).toBe('hello');
    });
  });

  describe('focus/blur', () => {
    it('should set focus state', () => {
      let input = createTextInput();
      input = TextInput.blur(input);
      expect(input.focused).toBe(false);

      input = TextInput.focus(input);
      expect(input.focused).toBe(true);
    });
  });

  describe('cursor movement', () => {
    it('should move cursor left', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.cursorLeft(input);
      expect(input.cursor).toBe(4);
    });

    it('should not move cursor left past 0', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.setCursor(input, 0);
      input = TextInput.cursorLeft(input);
      expect(input.cursor).toBe(0);
    });

    it('should move cursor right', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.setCursor(input, 0);
      input = TextInput.cursorRight(input);
      expect(input.cursor).toBe(1);
    });

    it('should move cursor to start/end', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.cursorStart(input);
      expect(input.cursor).toBe(0);

      input = TextInput.cursorEnd(input);
      expect(input.cursor).toBe(5);
    });
  });

  describe('insert', () => {
    it('should insert character at cursor', () => {
      let input = createTextInput({ value: 'hllo' });
      input = TextInput.setCursor(input, 1);
      input = TextInput.insert(input, 'e');
      expect(input.value).toBe('hello');
      expect(input.cursor).toBe(2);
    });

    it('should respect maxLength on insert', () => {
      let input = createTextInput({ value: 'hell', maxLength: 5 });
      input = TextInput.insert(input, 'o');
      expect(input.value).toBe('hello');

      input = TextInput.insert(input, '!');
      expect(input.value).toBe('hello');
    });
  });

  describe('backspace', () => {
    it('should delete character before cursor', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.backspace(input);
      expect(input.value).toBe('hell');
      expect(input.cursor).toBe(4);
    });

    it('should do nothing at cursor 0', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.setCursor(input, 0);
      input = TextInput.backspace(input);
      expect(input.value).toBe('hello');
    });
  });

  describe('delete', () => {
    it('should delete character at cursor', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.setCursor(input, 0);
      input = TextInput.delete(input);
      expect(input.value).toBe('ello');
      expect(input.cursor).toBe(0);
    });

    it('should do nothing at end', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.delete(input);
      expect(input.value).toBe('hello');
    });
  });

  describe('deleteWordBackward', () => {
    it('should delete word before cursor', () => {
      let input = createTextInput({ value: 'hello world' });
      input = TextInput.deleteWordBackward(input);
      expect(input.value).toBe('hello ');
    });

    it('should handle multiple spaces', () => {
      let input = createTextInput({ value: 'hello   world' });
      input = TextInput.deleteWordBackward(input);
      expect(input.value).toBe('hello   ');
    });
  });

  describe('deleteToEnd/deleteToStart', () => {
    it('should delete to end of line', () => {
      let input = createTextInput({ value: 'hello world' });
      input = TextInput.setCursor(input, 5);
      input = TextInput.deleteToEnd(input);
      expect(input.value).toBe('hello');
    });

    it('should delete to start of line', () => {
      let input = createTextInput({ value: 'hello world' });
      input = TextInput.setCursor(input, 6);
      input = TextInput.deleteToStart(input);
      expect(input.value).toBe('world');
      expect(input.cursor).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear the input', () => {
      let input = createTextInput({ value: 'hello' });
      input = TextInput.clear(input);
      expect(input.value).toBe('');
      expect(input.cursor).toBe(0);
    });
  });

  describe('word navigation', () => {
    it('should move to previous word', () => {
      let input = createTextInput({ value: 'hello world test' });
      input = TextInput.wordLeft(input);
      expect(input.cursor).toBe(12);

      input = TextInput.wordLeft(input);
      expect(input.cursor).toBe(6);
    });

    it('should move to next word', () => {
      let input = createTextInput({ value: 'hello world test' });
      input = TextInput.setCursor(input, 0);
      input = TextInput.wordRight(input);
      expect(input.cursor).toBe(6);
    });
  });

  describe('view', () => {
    it('should render with cursor when focused', () => {
      const input = createTextInput({ value: 'hello' });
      const view = TextInput.view(input);
      expect(view).toContain('│');
    });

    it('should show placeholder when empty and not focused', () => {
      let input = createTextInput({ placeholder: 'Enter text' });
      input = TextInput.blur(input);
      const view = TextInput.view(input);
      expect(view).toBe('Enter text');
    });

    it('should mask characters', () => {
      const input = createTextInput({ value: 'secret', mask: '*' });
      const view = TextInput.view(input);
      expect(view).toContain('******');
      expect(view).not.toContain('secret');
    });

    it('should include prompt', () => {
      const input = createTextInput({ value: 'test', prompt: '> ' });
      const view = TextInput.view(input);
      expect(view.startsWith('> ')).toBe(true);
    });
  });
});
