import { describe, it, expect } from 'vitest';
import { List, createList, type ListItem } from './list';

describe('List', () => {
  const testItems: ListItem<string>[] = [
    { title: 'Item 1', value: 'one' },
    { title: 'Item 2', value: 'two' },
    { title: 'Item 3', value: 'three' },
    { title: 'Item 4', value: 'four' },
    { title: 'Item 5', value: 'five' },
  ];

  describe('createList', () => {
    it('should create with default options', () => {
      const list = createList();
      expect(list.items).toEqual([]);
      expect(list.selected).toBe(0);
      expect(list.wrap).toBe(true);
    });

    it('should create with items', () => {
      const list = createList({ items: testItems });
      expect(list.items).toEqual(testItems);
      expect(list.selected).toBe(0);
    });

    it('should create with initial selection', () => {
      const list = createList({ items: testItems, selected: 2 });
      expect(list.selected).toBe(2);
    });

    it('should clamp initial selection', () => {
      const list = createList({ items: testItems, selected: 10 });
      expect(list.selected).toBe(4);
    });
  });

  describe('setItems', () => {
    it('should set new items', () => {
      const list = createList({ items: testItems });
      const newItems = [{ title: 'New 1', value: 'new' }];
      const updated = List.setItems(list, newItems);
      expect(updated.items).toEqual(newItems);
      expect(updated.selected).toBe(0);
    });

    it('should clamp selection when items shrink', () => {
      let list = createList({ items: testItems, selected: 4 });
      list = List.setItems(list, [{ title: 'One', value: 'one' }]);
      expect(list.selected).toBe(0);
    });
  });

  describe('moveUp', () => {
    it('should move selection up', () => {
      let list = createList({ items: testItems, selected: 2 });
      list = List.moveUp(list);
      expect(list.selected).toBe(1);
    });

    it('should wrap to end when at top', () => {
      let list = createList({ items: testItems, selected: 0 });
      list = List.moveUp(list);
      expect(list.selected).toBe(4);
    });

    it('should not wrap when wrap is false', () => {
      let list = createList({ items: testItems, selected: 0, wrap: false });
      list = List.moveUp(list);
      expect(list.selected).toBe(0);
    });

    it('should skip disabled items', () => {
      const itemsWithDisabled: ListItem[] = [
        { title: 'Item 1' },
        { title: 'Item 2', disabled: true },
        { title: 'Item 3' },
      ];
      let list = createList({ items: itemsWithDisabled, selected: 2 });
      list = List.moveUp(list);
      expect(list.selected).toBe(0);
    });
  });

  describe('moveDown', () => {
    it('should move selection down', () => {
      let list = createList({ items: testItems, selected: 2 });
      list = List.moveDown(list);
      expect(list.selected).toBe(3);
    });

    it('should wrap to start when at end', () => {
      let list = createList({ items: testItems, selected: 4 });
      list = List.moveDown(list);
      expect(list.selected).toBe(0);
    });

    it('should not wrap when wrap is false', () => {
      let list = createList({ items: testItems, selected: 4, wrap: false });
      list = List.moveDown(list);
      expect(list.selected).toBe(4);
    });
  });

  describe('moveToStart/moveToEnd', () => {
    it('should move to start', () => {
      let list = createList({ items: testItems, selected: 3 });
      list = List.moveToStart(list);
      expect(list.selected).toBe(0);
    });

    it('should move to end', () => {
      let list = createList({ items: testItems, selected: 1 });
      list = List.moveToEnd(list);
      expect(list.selected).toBe(4);
    });
  });

  describe('moveByPage', () => {
    it('should move down by page', () => {
      let list = createList({ items: testItems, selected: 0, height: 3 });
      list = List.moveByPage(list, 'down');
      expect(list.selected).toBe(3);
    });

    it('should move up by page', () => {
      let list = createList({ items: testItems, selected: 4, height: 3 });
      list = List.moveByPage(list, 'up');
      expect(list.selected).toBe(1);
    });

    it('should clamp to bounds', () => {
      let list = createList({ items: testItems, selected: 3, height: 3 });
      list = List.moveByPage(list, 'down');
      expect(list.selected).toBe(4);
    });
  });

  describe('select', () => {
    it('should select by index', () => {
      let list = createList({ items: testItems });
      list = List.select(list, 2);
      expect(list.selected).toBe(2);
    });

    it('should not select out of range', () => {
      let list = createList({ items: testItems });
      list = List.select(list, 10);
      expect(list.selected).toBe(0);
    });

    it('should not select disabled items', () => {
      const itemsWithDisabled: ListItem[] = [
        { title: 'Item 1' },
        { title: 'Item 2', disabled: true },
      ];
      let list = createList({ items: itemsWithDisabled, selected: 0 });
      list = List.select(list, 1);
      expect(list.selected).toBe(0);
    });
  });

  describe('getSelected/getSelectedValue', () => {
    it('should get selected item', () => {
      const list = createList({ items: testItems, selected: 1 });
      const item = List.getSelected(list);
      expect(item?.title).toBe('Item 2');
    });

    it('should get selected value', () => {
      const list = createList({ items: testItems, selected: 2 });
      const value = List.getSelectedValue(list);
      expect(value).toBe('three');
    });

    it('should return undefined for empty list', () => {
      const list = createList();
      expect(List.getSelected(list)).toBeUndefined();
      expect(List.getSelectedValue(list)).toBeUndefined();
    });
  });

  describe('filter', () => {
    it('should filter items', () => {
      const list = createList({ items: testItems });
      const filtered = List.filter(list, item => item.title.includes('1'));
      expect(filtered.items).toHaveLength(1);
      expect(filtered.items[0].title).toBe('Item 1');
    });
  });

  describe('filterByTitle', () => {
    it('should filter by title case insensitive', () => {
      const list = createList({ items: testItems });
      const filtered = List.filterByTitle(list, 'item 2');
      expect(filtered.items).toHaveLength(1);
    });
  });

  describe('view', () => {
    it('should render list items', () => {
      const list = createList({ items: testItems });
      const view = List.view(list);
      expect(view).toContain('> Item 1');
      expect(view).toContain('  Item 2');
    });

    it('should show custom cursor', () => {
      const list = createList({ items: testItems, cursor: '→ ', uncursor: '  ' });
      const view = List.view(list);
      expect(view).toContain('→ Item 1');
    });

    it('should return empty string for empty list', () => {
      const list = createList();
      expect(List.view(list)).toBe('');
    });

    it('should show only visible items when height is set', () => {
      const list = createList({ items: testItems, height: 2 });
      const view = List.view(list);
      const lines = view.split('\n');
      expect(lines).toHaveLength(2);
    });
  });

  describe('viewWith', () => {
    it('should render with custom renderer', () => {
      const list = createList({ items: testItems });
      const view = List.viewWith(list, (item, isSelected) =>
        `${isSelected ? '[x]' : '[ ]'} ${item.title}`
      );
      expect(view).toContain('[x] Item 1');
      expect(view).toContain('[ ] Item 2');
    });
  });

  describe('scrolling', () => {
    it('should scroll to keep selection visible', () => {
      let list = createList({ items: testItems, height: 2 });
      expect(list.offset).toBe(0);

      list = List.select(list, 3);
      expect(list.offset).toBe(2); // Scrolled to show item 3
    });
  });
});
