import { create } from 'zustand';

export type Column = {
  id: string;
  name: string;
  type: string;
  isPk: boolean;
  isNullable: boolean;
};

export type Table = {
  id: string;
  name: string;
  columns: Column[];
  position: { x: number; y: number };
};

export type Relation = {
  id: string;
  sourceTable: string;
  sourceCol: string;
  targetTable: string;
  targetCol: string;
};

export type SqlDialect = 'postgresql' | 'mysql' | 'sqlite';

interface SchemaState {
  tables: Table[];
  relations: Relation[];
  activeTableId: string | null;
  dialect: SqlDialect;
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (tableId: string, name: string) => void;
  removeTable: (tableId: string) => void;
  addColumn: (tableId: string, column: Omit<Column, 'id'>) => void;
  updateColumn: (tableId: string, columnId: string, column: Partial<Column>) => void;
  removeColumn: (tableId: string, columnId: string) => void;
  addRelation: (relation: Omit<Relation, 'id'>) => void;
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void;
  setActiveTable: (id: string | null) => void;
  setDialect: (dialect: SqlDialect) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useSchemaStore = create<SchemaState>((set) => ({
  tables: [],
  relations: [],
  activeTableId: null,
  dialect: 'postgresql',

  addTable: (table) =>
    set((state) => ({
      tables: [...state.tables, { ...table, id: generateId() }],
    })),

  updateTable: (tableId, name) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, name } : t
      ),
    })),

  removeTable: (tableId) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== tableId),
      relations: state.relations.filter(r => r.sourceTable !== tableId && r.targetTable !== tableId),
      activeTableId: state.activeTableId === tableId ? null : state.activeTableId
    })),

  addColumn: (tableId, column) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: [...t.columns, { ...column, id: generateId() }] }
          : t
      ),
    })),

  updateColumn: (tableId, columnId, updatedColumn) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns.map((c) =>
                c.id === columnId ? { ...c, ...updatedColumn } : c
              ),
            }
          : t
      ),
    })),

  removeColumn: (tableId, columnId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: t.columns.filter((c) => c.id !== columnId) }
          : t
      ),
      relations: state.relations.filter(r => !(r.sourceTable === tableId && r.sourceCol === columnId) && !(r.targetTable === tableId && r.targetCol === columnId))
    })),

  addRelation: (relation) =>
    set((state) => ({
      relations: [...state.relations, { ...relation, id: generateId() }],
    })),

  updateTablePosition: (tableId, position) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, position } : t
      ),
    })),
    
  setActiveTable: (id) => set({ activeTableId: id }),
  setDialect: (dialect) => set({ dialect })
}));
