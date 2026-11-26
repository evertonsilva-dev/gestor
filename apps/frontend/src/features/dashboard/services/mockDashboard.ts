import type { DashboardData } from '@/types/domain'

export const mockDashboardData: DashboardData = {
  organization: {
    id: 'mock-organization-001',
    name: 'Instituto Horizonte',
  },
  selectedPeriod: {
    id: 'mock-period-001',
    startDate: '2026-10-21',
    endDate: '2026-10-27',
    publishedAt: '2026-10-28T14:00:00.000Z',
  },
  updateInProgress: false,
  lastPublishedAt: '2026-10-28T14:00:00.000Z',
  metrics: {
    newsCount: 18,
    commentCount: 64,
  },
  sentimentByChannel: [
    { channelName: 'Instagram', positive: 14, neutral: 8, negative: 5 },
    { channelName: 'Facebook', positive: 10, neutral: 12, negative: 6 },
    { channelName: 'Portal de notícias', positive: 7, neutral: 4, negative: 3 },
  ],
  audience: [
    { profile: 'militante', count: 18, percentage: 28 },
    { profile: 'simpatizante', count: 31, percentage: 48 },
    { profile: 'detrator', count: 15, percentage: 24 },
  ],
  news: [
    {
      id: 'mock-news-001',
      title: 'Projeto local amplia atendimento comunitário',
      sourceUrl: 'https://example.com/noticia-1',
      channelName: 'Portal de notícias',
      sentiment: 'positive',
      publishedAt: '2026-10-22T12:00:00.000Z',
    },
    {
      id: 'mock-news-002',
      title: 'Moradores comentam mudanças no transporte',
      sourceUrl: null,
      channelName: 'Instagram',
      sentiment: 'neutral',
      publishedAt: '2026-10-25T15:30:00.000Z',
    },
  ],
  comments: [
    {
      id: 'mock-comment-001',
      content: 'A iniciativa trouxe melhorias importantes para o bairro.',
      channelName: 'Instagram',
      profile: 'simpatizante',
      sentiment: 'positive',
      commentedAt: '2026-10-23T16:00:00.000Z',
      newsTitle: null,
    },
    {
      id: 'mock-comment-002',
      content: 'Ainda falta divulgar melhor os horários de atendimento.',
      channelName: 'Facebook',
      profile: 'detrator',
      sentiment: 'negative',
      commentedAt: '2026-10-26T10:15:00.000Z',
      newsTitle: null,
    },
  ],
  recommendations: [
    { id: 'mock-recommendation-001', category: 'insight', content: 'O público reconhece os resultados, mas ainda pede informações mais acessíveis.' },
    { id: 'mock-recommendation-002', category: 'action', content: 'Publicar um calendário semanal com horários e locais de atendimento.' },
    { id: 'mock-recommendation-003', category: 'example', content: 'Usar depoimentos curtos de moradores para apresentar os serviços.' },
  ],
  availablePeriods: [
    {
      id: 'mock-period-001',
      startDate: '2026-10-21',
      endDate: '2026-10-27',
      publishedAt: '2026-10-28T14:00:00.000Z',
    },
  ],
}
