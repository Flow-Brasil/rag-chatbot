interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

interface TableData {
  headers: TableColumn[];
  rows: Record<string, string | number>[];
}

// Tipos de tabelas suportados
const TABLE_TYPES = {
  CLASSIFICATION: {
    pattern: /Classificação.*Pontos/i,
    columns: [
      { key: 'pos', label: 'Pos' },
      { key: 'team', label: 'Time' },
      { key: 'points', label: 'Pontos', sortable: true }
    ]
  },
  MATCHES: {
    pattern: /Jogos|Partidas.*Placar/i,
    columns: [
      { key: 'date', label: 'Data' },
      { key: 'home', label: 'Casa' },
      { key: 'score', label: 'Placar' },
      { key: 'away', label: 'Visitante' }
    ]
  },
  STATS: {
    pattern: /Estatísticas|Stats/i,
    columns: [
      { key: 'metric', label: 'Métrica' },
      { key: 'value', label: 'Valor', sortable: true }
    ]
  }
};

// Detecta o tipo de tabela baseado no conteúdo
function detectTableType(input: string): TableColumn[] | null {
  for (const [type, config] of Object.entries(TABLE_TYPES)) {
    if (config.pattern.test(input)) {
      return config.columns;
    }
  }
  return null;
}

// Extrai dados da tabela baseado no tipo
function extractTableData(input: string, columns: TableColumn[]): TableData {
  const rows = input.split('\n')
    .filter(line => line.trim() && !line.includes('Classificação'))
    .map(line => {
      const values = line.split('|').map(v => v.trim()).filter(Boolean);
      const row: Record<string, string | number> = {};
      
      columns.forEach((col, index) => {
        let value = values[index] || '';
        
        // Converte valores numéricos
        if (col.sortable && !isNaN(Number(value))) {
          row[col.key] = Number(value);
        } else {
          row[col.key] = value;
        }
      });
      
      return row;
    })
    .filter(row => Object.keys(row).length === columns.length);

  return {
    headers: columns,
    rows
  };
}

// Ordena os dados da tabela
function sortTableData(data: TableData, column: string, direction: 'asc' | 'desc' = 'desc'): TableData {
  return {
    ...data,
    rows: [...data.rows].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    })
  };
}

// Pagina os dados da tabela
function paginateTableData(data: TableData, page: number = 1, pageSize: number = 10): TableData {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    ...data,
    rows: data.rows.slice(start, end)
  };
}

// Exporta dados para CSV
function exportToCSV(data: TableData): string {
  const headers = data.headers.map(h => h.label).join(',');
  const rows = data.rows.map(row => 
    data.headers.map(h => row[h.key]).join(',')
  ).join('\n');
  
  return `${headers}\n${rows}`;
}

// Formata dados em markdown
function formatMarkdownTable(data: TableData): string {
  // Cabeçalho
  let markdown = '| ' + data.headers.map(h => h.label).join(' | ') + ' |\n';
  markdown += '|' + data.headers.map(() => '---').join('|') + '|\n';
  
  // Linhas
  data.rows.forEach(row => {
    markdown += '| ' + data.headers.map(h => row[h.key]).join(' | ') + ' |\n';
  });
  
  return markdown;
}

export function formatTableData(input: string, options?: {
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}): string {
  // Detecta o tipo de tabela
  const columns = detectTableType(input);
  if (!columns) return input;

  // Extrai e processa os dados
  let tableData = extractTableData(input, columns);

  // Aplica ordenação se especificada
  if (options?.sortColumn) {
    tableData = sortTableData(tableData, options.sortColumn, options.sortDirection);
  }

  // Aplica paginação se especificada
  if (options?.page && options?.pageSize) {
    tableData = paginateTableData(tableData, options.page, options.pageSize);
  }

  // Retorna a tabela formatada em markdown
  return formatMarkdownTable(tableData);
}

export function exportTableData(input: string, format: 'csv' = 'csv'): string {
  const columns = detectTableType(input);
  if (!columns) return '';

  const tableData = extractTableData(input, columns);
  
  switch (format) {
    case 'csv':
      return exportToCSV(tableData);
    default:
      return '';
  }
} 