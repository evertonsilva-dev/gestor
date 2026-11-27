export function splitCommentText(input) {
  const normalized = input.replace(/\r\n?/g, '\n').trim()
  if (!normalized) return []

  const separator = /\n[ \t]*\n/.test(normalized) ? /\n[ \t]*\n+/ : /\n/
  return normalized
    .split(separator)
    .map((comment) => comment.trim())
    .filter(Boolean)
}

export function createCommentCsv(comments) {
  const rows = comments.map((comment) => `"${comment.replace(/"/g, '""')}"`)
  return `\uFEFFcontent\r\n${rows.join('\r\n')}\r\n`
}

export function commentCsvFilename(date = new Date()) {
  return `comentarios-instagram-${date.toISOString().slice(0, 10)}.csv`
}
