import { Table, Relation, SqlDialect } from '../store/useSchemaStore';

const mapType = (type: string, isPk: boolean, dialect: SqlDialect): string => {
  const t = type.toLowerCase();
  if (dialect === 'postgresql') {
    if (t === 'uuid' && isPk) return 'UUID DEFAULT gen_random_uuid()';
    if (t === 'int' && isPk) return 'SERIAL';
    return type;
  }
  if (dialect === 'mysql') {
    if (t === 'uuid') return 'VARCHAR(36)';
    if (t === 'int' && isPk) return 'INT AUTO_INCREMENT';
    if (t === 'string' || t === 'varchar') return 'VARCHAR(255)';
    return type;
  }
  if (dialect === 'sqlite') {
    if (t === 'uuid') return 'TEXT';
    if (t === 'int' && isPk) return 'INTEGER PRIMARY KEY AUTOINCREMENT'; // SQLite specific
    if (t === 'varchar' || t === 'string') return 'TEXT';
    return type;
  }
  return type;
};

const getQuote = (dialect: SqlDialect) => {
  return dialect === 'mysql' ? '`' : '"';
}

export function generateTablesUp(tables: Table[], dialect: SqlDialect): string {
  const q = getQuote(dialect);
  let sql = '';
  tables.forEach(table => {
    sql += `CREATE TABLE ${q}${table.name}${q} (\n`;
    const cols = table.columns.map(col => {
      // In SQLite, INTEGER PRIMARY KEY AUTOINCREMENT must be defined inline and not in a separate PRIMARY KEY clause
      const mappedType = mapType(col.type, col.isPk, dialect);
      let colDef = `  ${q}${col.name}${q} ${mappedType}`;
      
      if (!col.isNullable && !col.isPk) {
        colDef += ' NOT NULL';
      }
      return colDef;
    });

    const pks = table.columns.filter(col => col.isPk).map(col => `${q}${col.name}${q}`);
    
    // Don't add a separate PRIMARY KEY constraint for SQLite if we already did INTEGER PRIMARY KEY
    const hasSqliteAutoinc = dialect === 'sqlite' && table.columns.some(c => c.isPk && c.type.toLowerCase() === 'int');
    
    if (pks.length > 0 && !hasSqliteAutoinc) {
      cols.push(`  PRIMARY KEY (${pks.join(', ')})`);
    }

    sql += cols.join(',\n');
    sql += `\n);\n\n`;
  });
  return sql;
}

export function generateTablesDown(tables: Table[], dialect: SqlDialect): string {
  const q = getQuote(dialect);
  let sql = '';
  
  // Drop tables in reverse order
  [...tables].reverse().forEach(table => {
    if (dialect === 'postgresql') {
      sql += `DROP TABLE IF EXISTS ${q}${table.name}${q} CASCADE;\n`;
    } else {
      sql += `DROP TABLE IF EXISTS ${q}${table.name}${q};\n`;
    }
  });
  return sql + '\n';
}

export function generateForeignKeysUp(tables: Table[], relations: Relation[], dialect: SqlDialect): string {
  if (dialect === 'sqlite') {
    return '-- SQLite does not support ALTER TABLE ADD CONSTRAINT for foreign keys.\n-- Foreign keys must be defined inline during CREATE TABLE in SQLite.\n';
  }
  
  const q = getQuote(dialect);
  let sql = '';
  relations.forEach(rel => {
    const sourceTable = tables.find(t => t.id === rel.sourceTable)?.name;
    const targetTable = tables.find(t => t.id === rel.targetTable)?.name;
    const sourceCol = tables.find(t => t.id === rel.sourceTable)?.columns.find(c => c.id === rel.sourceCol)?.name;
    const targetCol = tables.find(t => t.id === rel.targetTable)?.columns.find(c => c.id === rel.targetCol)?.name;

    if (sourceTable && targetTable && sourceCol && targetCol) {
      const constraintName = `fk_${sourceTable}_${sourceCol}_${targetTable}`;
      sql += `ALTER TABLE ${q}${sourceTable}${q} ADD CONSTRAINT ${q}${constraintName}${q} FOREIGN KEY (${q}${sourceCol}${q}) REFERENCES ${q}${targetTable}${q} (${q}${targetCol}${q});\n`;
    }
  });
  return sql ? sql + '\n' : '';
}

export function generateForeignKeysDown(tables: Table[], relations: Relation[], dialect: SqlDialect): string {
  if (dialect === 'sqlite') return '';
  
  const q = getQuote(dialect);
  let sql = '';
  relations.forEach(rel => {
    const sourceTable = tables.find(t => t.id === rel.sourceTable)?.name;
    const sourceCol = tables.find(t => t.id === rel.sourceTable)?.columns.find(c => c.id === rel.sourceCol)?.name;
    const targetTable = tables.find(t => t.id === rel.targetTable)?.name;

    if (sourceTable && targetTable && sourceCol) {
      const constraintName = `fk_${sourceTable}_${sourceCol}_${targetTable}`;
      if (dialect === 'mysql') {
        sql += `ALTER TABLE ${q}${sourceTable}${q} DROP FOREIGN KEY ${q}${constraintName}${q};\n`;
      } else {
        sql += `ALTER TABLE ${q}${sourceTable}${q} DROP CONSTRAINT IF EXISTS ${q}${constraintName}${q};\n`;
      }
    }
  });
  return sql ? sql + '\n' : '';
}

export function generateSql(tables: Table[], relations: Relation[], dialect: SqlDialect = 'postgresql'): { upSql: string, downSql: string } {
  const tablesUp = generateTablesUp(tables, dialect);
  const tablesDown = generateTablesDown(tables, dialect);

  const fkUp = generateForeignKeysUp(tables, relations, dialect);
  const fkDown = generateForeignKeysDown(tables, relations, dialect);

  const upSql = tablesUp + fkUp;
  const downSql = fkDown + tablesDown;

  return { upSql: upSql.trim(), downSql: downSql.trim() };
}
