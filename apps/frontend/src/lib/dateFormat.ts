const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Ainda não publicado'
  }

  const date = new Date(`${value.slice(0, 10)}T12:00:00`)

  return Number.isNaN(date.getTime()) ? 'Data indisponível' : dateFormatter.format(date)
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)

  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}
