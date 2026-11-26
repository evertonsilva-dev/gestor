import { useEffect, useState, type FormEvent } from 'react'
import { buildPeriodItem } from '../../services/periodEntry'
import { useAdminMonitoring } from '@/hooks/useAdminMonitoring'
import type { Channel, SourcePage } from '@/hooks/useAdminMonitoring/types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { usePeriodItems } from '@/hooks/usePeriodItems'
import type { NewsPeriodItem } from '@/hooks/usePeriodItems/types'
import type { MonitoringPeriod } from '@/types/domain'
import type { MonitoringFeedback } from './types'
import { useSourcePageAffinity } from './useSourcePageAffinity'

export function useMonitoringPage() {
  const organizationsState = useOrganizations()
  const [organizationId, setOrganizationId] = useState('')
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [itemType, setItemType] = useState('news')
  const [itemChannelId, setItemChannelId] = useState('')
  const [sourcePageId, setSourcePageId] = useState('')
  const [newsItemId, setNewsItemId] = useState('')
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null)
  const [editingPeriodDates, setEditingPeriodDates] = useState<[Date | null, Date | null]>([null, null])
  const [periodDates, setPeriodDates] = useState<[Date | null, Date | null]>([null, null])
  const [feedback, setFeedback] = useState<MonitoringFeedback | null>(null)
  const [busy, setBusy] = useState(false)
  const monitoring = useAdminMonitoring(organizationId || null)
  const periodItems = usePeriodItems(selectedPeriodId || null)
  const sourcePageAffinity = useSourcePageAffinity(selectedPeriodId || null)
  const selectedPeriod = monitoring.periods.find((period) => period.id === selectedPeriodId)
  const activeOrganizations = organizationsState.organizations.filter((organization) => organization.active)
  const activeChannels = monitoring.channels.filter((channel) => channel.active)
  const relatedNewsItems = periodItems.items.filter((item): item is NewsPeriodItem => (
    item.type === 'news' && item.channelId === itemChannelId
  ))

  useEffect(() => {
    if (!organizationId) {
      const activeOrganization = organizationsState.organizations.find((organization) => organization.active)
      if (activeOrganization) setOrganizationId(activeOrganization.id)
    }
  }, [organizationsState.organizations, organizationId])

  useEffect(() => {
    if (!monitoring.periods.some((period) => period.id === selectedPeriodId)) {
      setSelectedPeriodId(
        monitoring.periods.find((period) => period.status === 'processing')?.id ?? '',
      )
    }
  }, [monitoring.periods, selectedPeriodId])

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setBusy(true)
    setFeedback(null)

    try {
      await action()
      setFeedback({ tone: 'success', message: successMessage })
    } catch (reason) {
      setFeedback({
        tone: 'error',
        message: reason instanceof Error ? reason.message : 'Não foi possível salvar as informações.',
      })
    } finally {
      setBusy(false)
    }
  }

  function showError(reason: unknown, fallback: string) {
    setFeedback({
      tone: 'error',
      message: reason instanceof Error ? reason.message : fallback,
    })
  }

  async function submitChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get('name'))
    await runAction(async () => {
      await monitoring.createChannel(name)
      form.reset()
    }, 'Canal cadastrado.')
  }

  async function submitSourcePage(event: FormEvent<HTMLFormElement>, channelId: string) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name') ?? '').trim()
    const url = String(values.get('url') ?? '').trim() || null

    await runAction(async () => {
      await monitoring.createSourcePage({ channelId, name, url })
      form.reset()
    }, 'Página cadastrada.')
  }

  async function submitPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const startDate = String(values.get('startDate') ?? '')
    const endDate = String(values.get('endDate') ?? '')

    if (!startDate || !endDate) {
      setFeedback({ tone: 'error', message: 'Selecione a data inicial e a data final do período.' })
      return
    }

    await runAction(async () => {
      await monitoring.createPeriod(startDate, endDate)
      form.reset()
      setPeriodDates([null, null])
    }, 'Período criado como processamento; ele só ficará visível após a publicação.')
  }

  async function submitPeriodEdit(event: FormEvent<HTMLFormElement>, periodId: string) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const startDate = String(values.get('startDate') ?? '')
    const endDate = String(values.get('endDate') ?? '')

    if (!startDate || !endDate) {
      setFeedback({ tone: 'error', message: 'Selecione as duas datas do período.' })
      return
    }

    await runAction(async () => {
      await monitoring.updatePeriod(periodId, { startDate, endDate })
      setEditingPeriodId(null)
    }, 'Intervalo do período atualizado.')
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    try {
      const item = buildPeriodItem(new FormData(form))
      await runAction(async () => {
        await monitoring.createItem(selectedPeriodId, item)
        await periodItems.refresh()
        form.reset()
        setItemType('news')
        setItemChannelId('')
        setSourcePageId('')
        setNewsItemId('')
      }, 'Registro adicionado ao período.')
    } catch (reason) {
      showError(reason, 'Confira os dados.')
    }
  }

  function selectOrganization(id: string) {
    setOrganizationId(id)
    setSelectedPeriodId('')
    setItemChannelId('')
    setSourcePageId('')
    setNewsItemId('')
  }

  function editPeriod(period: MonitoringPeriod) {
    setEditingPeriodId((current) => current === period.id ? null : period.id)
    setEditingPeriodDates([
      new Date(`${period.startDate}T00:00:00`),
      new Date(`${period.endDate}T00:00:00`),
    ])
  }

  function selectItemChannel(id: string) {
    setItemChannelId(id)
    setSourcePageId('')
    setNewsItemId('')
  }

  function setChannelActive(channel: Channel) {
    void runAction(
      () => monitoring.setChannelActive(channel.id, !channel.active),
      `Canal ${channel.active ? 'desativado' : 'ativado'}.`,
    )
  }

  function setSourcePageActive(page: SourcePage) {
    void runAction(
      () => monitoring.updateSourcePage(page.id, { active: !page.active }),
      `Página ${page.active ? 'desativada' : 'ativada'}.`,
    )
  }

  function publishPeriod(periodId: string) {
    void runAction(
      () => monitoring.publishPeriod(periodId),
      'Período publicado e disponível para consulta.',
    )
  }

  return {
    organizations: organizationsState.organizations,
    organizationsLoading: organizationsState.isLoading,
    organizationsError: organizationsState.error,
    activeOrganizations,
    organizationId,
    selectOrganization,
    selectedPeriodId,
    selectPeriod: setSelectedPeriodId,
    selectedPeriod,
    monitoring,
    sourcePages: monitoring.sourcePages,
    periodItems,
    sourcePageAffinity,
    activeChannels,
    relatedNewsItems,
    itemType,
    setItemType,
    itemChannelId,
    selectItemChannel,
    sourcePageId,
    setSourcePageId,
    newsItemId,
    setNewsItemId,
    editingPeriodId,
    editingPeriodDates,
    setEditingPeriodDates,
    periodDates,
    setPeriodDates,
    feedback,
    busy,
    submitChannel,
    submitSourcePage,
    submitPeriod,
    submitPeriodEdit,
    submitItem,
    editPeriod,
    setChannelActive,
    setSourcePageActive,
    publishPeriod,
  }
}
