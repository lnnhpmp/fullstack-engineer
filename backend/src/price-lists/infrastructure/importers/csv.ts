export type CsvRow = Record<string, string>

/** Minimal CSV reader: quotes, escaped quotes, CRLF and a trailing newline. */
export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  const source = text.replace(/^\uFEFF/, '')

  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  if (!header) return []
  return body
    .filter((values) => values.some((value) => value !== ''))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])))
}
