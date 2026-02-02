import { describe, it, expect } from 'vitest';
import { Table, TableBorders, createTable } from './table';

interface User {
  name: string;
  age: number;
  city: string;
}

describe('Table', () => {
  const columns = [
    { key: 'name' as keyof User, title: 'Name' },
    { key: 'age' as keyof User, title: 'Age', align: 'right' as const },
    { key: 'city' as keyof User, title: 'City' },
  ];

  const rows: User[] = [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
  ];

  describe('createTable', () => {
    it('should create table with columns', () => {
      const table = createTable({ columns });
      expect(table.columns).toEqual(columns);
      expect(table.rows).toEqual([]);
    });

    it('should create table with rows', () => {
      const table = createTable({ columns, rows });
      expect(table.rows).toEqual(rows);
    });

    it('should calculate column widths', () => {
      const table = createTable({ columns, rows });
      expect(table.columnWidths[0]).toBeGreaterThanOrEqual(7); // "Charlie"
      expect(table.columnWidths[1]).toBeGreaterThanOrEqual(2); // "35"
    });

    it('should use custom border style', () => {
      const table = createTable({ columns, border: 'double' });
      expect(table.border).toBe(TableBorders.double);
    });
  });

  describe('setRows', () => {
    it('should set new rows', () => {
      const table = createTable({ columns });
      const updated = Table.setRows(table, rows);
      expect(updated.rows).toEqual(rows);
    });

    it('should recalculate column widths', () => {
      const table = createTable({ columns, rows: [{ name: 'A', age: 1, city: 'B' }] });
      const updated = Table.setRows(table, rows);
      expect(updated.columnWidths[0]).toBeGreaterThan(table.columnWidths[0]);
    });
  });

  describe('selection', () => {
    it('should select row', () => {
      const table = createTable({ columns, rows, selectable: true });
      const updated = Table.selectRow(table, 1);
      expect(updated.selected).toBe(1);
    });

    it('should move up/down', () => {
      let table = createTable({ columns, rows, selectable: true, selected: 1 });

      table = Table.moveUp(table);
      expect(table.selected).toBe(0);

      table = Table.moveDown(table);
      expect(table.selected).toBe(1);
    });

    it('should wrap at ends', () => {
      let table = createTable({ columns, rows, selectable: true, selected: 0 });
      table = Table.moveUp(table);
      expect(table.selected).toBe(2);

      table = Table.moveDown(table);
      expect(table.selected).toBe(0);
    });

    it('should not move if not selectable', () => {
      let table = createTable({ columns, rows, selectable: false });
      table = Table.moveDown(table);
      expect(table.selected).toBe(-1);
    });
  });

  describe('getSelected', () => {
    it('should get selected row', () => {
      const table = createTable({ columns, rows, selectable: true, selected: 1 });
      expect(Table.getSelected(table)).toEqual(rows[1]);
    });

    it('should return undefined when no selection', () => {
      const table = createTable({ columns, rows });
      expect(Table.getSelected(table)).toBeUndefined();
    });
  });

  describe('view', () => {
    it('should render table with borders', () => {
      const table = createTable({ columns, rows, border: 'single' });
      const view = Table.view(table);
      expect(view).toContain('┌');
      expect(view).toContain('└');
      expect(view).toContain('│');
    });

    it('should render header', () => {
      const table = createTable({ columns, rows });
      const view = Table.view(table);
      expect(view).toContain('Name');
      expect(view).toContain('Age');
      expect(view).toContain('City');
    });

    it('should render data', () => {
      const table = createTable({ columns, rows });
      const view = Table.view(table);
      expect(view).toContain('Alice');
      expect(view).toContain('Bob');
      expect(view).toContain('Chicago');
    });

    it('should hide header when showHeader is false', () => {
      const table = createTable({ columns, rows, showHeader: false });
      const view = Table.view(table);
      expect(view).not.toContain('Name');
    });

    it('should show selection cursor', () => {
      const table = createTable({ columns, rows, selectable: true, selected: 0, cursor: '→' });
      const view = Table.view(table);
      expect(view).toContain('→');
    });
  });

  describe('column formatting', () => {
    it('should use custom formatter', () => {
      const columnsWithFormat = [
        {
          key: 'age' as keyof User,
          title: 'Age',
          format: (value: unknown) => `${value} years`,
        },
      ];
      const table = createTable({ columns: columnsWithFormat, rows });
      const view = Table.view(table);
      expect(view).toContain('30 years');
    });
  });

  describe('TableBorders', () => {
    it('should have preset border styles', () => {
      expect(TableBorders.none).toBeDefined();
      expect(TableBorders.simple).toBeDefined();
      expect(TableBorders.single).toBeDefined();
      expect(TableBorders.double).toBeDefined();
      expect(TableBorders.rounded).toBeDefined();
      expect(TableBorders.thick).toBeDefined();
    });
  });
});
