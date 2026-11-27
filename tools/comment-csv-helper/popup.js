import { commentCsvFilename, createCommentCsv, splitCommentText } from './csv.js'

const commentsInput = document.querySelector('#comments')
const count = document.querySelector('#count')
const exportButton = document.querySelector('#export')
const status = document.querySelector('#status')

function updatePreview() {
  const comments = splitCommentText(commentsInput.value)
  count.textContent = comments.length
    ? `${comments.length} comentário(s) serão incluídos no CSV.`
    : 'Nenhum comentário pronto.'
  exportButton.disabled = comments.length === 0
  status.textContent = ''
  status.removeAttribute('data-error')
  status.removeAttribute('data-success')
}

commentsInput.addEventListener('input', updatePreview)

exportButton.addEventListener('click', () => {
  const comments = splitCommentText(commentsInput.value)
  if (comments.length === 0) {
    status.textContent = 'Cole pelo menos um comentário antes de exportar.'
    status.dataset.error = 'true'
    return
  }

  const blob = new Blob([createCommentCsv(comments)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = commentCsvFilename()
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)

  status.textContent = 'CSV baixado. Selecione a publicação correspondente ao importar no Gestor.'
  status.dataset.success = 'true'
})

updatePreview()
