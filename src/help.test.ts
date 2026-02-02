import { describe, it, expect } from 'vitest';
import { Help, createHelp } from './help';

describe('Help', () => {
  const testBindings = [
    { key: 'q', description: 'Quit' },
    { key: 'h', description: 'Show help' },
    { key: 'Enter', description: 'Confirm selection' },
  ];

  describe('createHelp', () => {
    it('should create with default options', () => {
      const help = createHelp();
      expect(help.bindings).toEqual([]);
      expect(help.width).toBe(80);
    });

    it('should create with bindings', () => {
      const help = createHelp({ bindings: testBindings });
      expect(help.bindings).toEqual(testBindings);
    });

    it('should create with groups', () => {
      const help = createHelp({
        groups: [
          { title: 'Navigation', bindings: testBindings },
        ],
      });
      expect(help.groups).toHaveLength(1);
      expect(help.groups[0].title).toBe('Navigation');
    });
  });

  describe('addBinding', () => {
    it('should add a binding', () => {
      let help = createHelp();
      help = Help.addBinding(help, 'j', 'Move down');
      expect(help.bindings).toHaveLength(1);
      expect(help.bindings[0].key).toBe('j');
    });
  });

  describe('addBindings', () => {
    it('should add multiple bindings', () => {
      let help = createHelp();
      help = Help.addBindings(help, testBindings);
      expect(help.bindings).toHaveLength(3);
    });
  });

  describe('addGroup', () => {
    it('should add a group', () => {
      let help = createHelp();
      help = Help.addGroup(help, { title: 'Actions', bindings: testBindings });
      expect(help.groups).toHaveLength(1);
    });
  });

  describe('setBindings/setGroups', () => {
    it('should set bindings', () => {
      let help = createHelp({ bindings: testBindings });
      help = Help.setBindings(help, [{ key: 'x', description: 'Exit' }]);
      expect(help.bindings).toHaveLength(1);
    });

    it('should set groups', () => {
      let help = createHelp();
      help = Help.setGroups(help, [
        { title: 'Group 1', bindings: [{ key: 'a', description: 'Action A' }] },
        { title: 'Group 2', bindings: [{ key: 'b', description: 'Action B' }] },
      ]);
      expect(help.groups).toHaveLength(2);
      expect(help.bindings).toHaveLength(2);
    });
  });

  describe('viewSimple', () => {
    it('should render simple view', () => {
      const help = createHelp({ bindings: testBindings });
      const view = Help.viewSimple(help);
      expect(view).toContain('q');
      expect(view).toContain('Quit');
      expect(view).toContain('→');
    });

    it('should align keys', () => {
      const help = createHelp({ bindings: testBindings });
      const view = Help.viewSimple(help);
      const lines = view.split('\n');
      // All separator positions should be aligned
      const separatorPositions = lines.map(line => line.indexOf('→'));
      expect(new Set(separatorPositions).size).toBe(1);
    });
  });

  describe('viewGrouped', () => {
    it('should render grouped view', () => {
      const help = createHelp({
        groups: [
          { title: 'Navigation', bindings: [{ key: 'j', description: 'Down' }] },
          { title: 'Actions', bindings: [{ key: 'Enter', description: 'Select' }] },
        ],
      });
      const view = Help.viewGrouped(help);
      expect(view).toContain('Navigation');
      expect(view).toContain('Actions');
      expect(view).toContain('───');
    });
  });

  describe('viewColumns', () => {
    it('should render in columns', () => {
      const bindings = [
        { key: 'a', description: 'A' },
        { key: 'b', description: 'B' },
        { key: 'c', description: 'C' },
        { key: 'd', description: 'D' },
      ];
      const help = createHelp({ bindings, columns: 2 });
      const view = Help.viewColumns(help);
      const lines = view.split('\n');
      // With 4 items and 2 columns, should have 2 rows
      expect(lines).toHaveLength(2);
    });
  });

  describe('view', () => {
    it('should render grouped when groups have titles', () => {
      const help = createHelp({
        groups: [{ title: 'Test', bindings: testBindings }],
      });
      const view = Help.view(help);
      expect(view).toContain('Test');
    });

    it('should render columns when no groups', () => {
      const help = createHelp({ bindings: testBindings });
      const view = Help.view(help);
      expect(view).toBeDefined();
    });
  });

  describe('viewShort', () => {
    it('should render short help bar', () => {
      const help = createHelp({ bindings: testBindings });
      const view = Help.viewShort(help);
      expect(view).toContain('•');
      expect(view).toContain('q Quit');
    });

    it('should limit bindings', () => {
      const help = createHelp({ bindings: testBindings });
      const view = Help.viewShort(help, 2);
      expect(view).not.toContain('Enter');
    });
  });

  describe('viewBoxed', () => {
    it('should render with box', () => {
      const help = createHelp({ bindings: testBindings });
      const view = Help.viewBoxed(help);
      expect(view).toContain('┌');
      expect(view).toContain('└');
      expect(view).toContain('│');
    });
  });
});
