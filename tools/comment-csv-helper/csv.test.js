import assert from 'node:assert/strict'
import test from 'node:test'
import { commentCsvFilename, createCommentCsv, splitCommentText } from './csv.js'

test('splits one-comment-per-line input and ignores blank lines', () => {
  assert.deepEqual(splitCommentText('Primeiro comentário\n\nSegundo comentário\n'), [
    'Primeiro comentário',
    'Segundo comentário',
  ])
})

test('preserves multiline comments separated by blank lines', () => {
  assert.deepEqual(splitCommentText('Comentário em\nmais de uma linha\n\nOutro comentário'), [
    'Comentário em\nmais de uma linha',
    'Outro comentário',
  ])
})

test('writes escaped UTF-8 CSV with a content header', () => {
  assert.equal(
    createCommentCsv(['Comentário, com "aspas" 👏']),
    '\uFEFFcontent\r\n"Comentário, com ""aspas"" 👏"\r\n',
  )
})

test('creates a date-stamped filename', () => {
  assert.equal(commentCsvFilename(new Date('2026-11-27T00:00:00.000Z')), 'comentarios-instagram-2026-11-27.csv')
})
