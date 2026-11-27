import { useEffect, useState, type FormEvent } from 'react'
import { useOrganizationAccessKeys } from '@/hooks/useOrganizationAccessKeys'
import { useOrganizations } from '@/hooks/useOrganizations'
import { parseKeywords } from '@/services/admin/periodEntry'
import { useOrganizationTopics, type MonitoredTopic } from '@/hooks/useOrganizationTopics'

interface Feedback {
  error: string | null
  success: string | null
}

export function useOrganizationsPage() {
  const organizationsState = useOrganizations()
  const [organizationFeedback, setOrganizationFeedback] = useState<Feedback>({ error: null, success: null })
  const [accessKeyFeedback, setAccessKeyFeedback] = useState<Feedback>({ error: null, success: null })
  const [organizationsFeedback, setOrganizationsFeedback] = useState<Feedback>({ error: null, success: null })
  const [accessKeysFeedback, setAccessKeysFeedback] = useState<Feedback>({ error: null, success: null })
  const [topicsFeedback, setTopicsFeedback] = useState<Feedback>({ error: null, success: null })
  const [busy, setBusy] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const accessKeys = useOrganizationAccessKeys(selectedOrganization)
  const topics = useOrganizationTopics(selectedOrganization)

  useEffect(() => {
    if (!selectedOrganization && organizationsState.organizations.length > 0) {
      setSelectedOrganization(
        organizationsState.organizations.find((organization) => organization.active)?.id ?? '',
      )
    }
  }, [organizationsState.organizations, selectedOrganization])

  async function submitOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setOrganizationFeedback({ error: null, success: null })
    setBusy(true)
    const values = new FormData(form)

    try {
      await organizationsState.createOrganization(String(values.get('name')), String(values.get('slug')))
      form.reset()
      setOrganizationFeedback({ error: null, success: 'Organização cadastrada.' })
    } catch (reason) {
      setOrganizationFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível cadastrar a organização.',
        success: null,
      })
    } finally {
      setBusy(false)
    }
  }

  async function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setAccessKeyFeedback({ error: null, success: null })
    setCreatedKey(null)
    setBusy(true)
    const values = new FormData(form)

    try {
      const created = await accessKeys.createAccessKey(String(values.get('label')))
      setCreatedKey(created.accessKey)
      form.reset()
      setAccessKeyFeedback({
        error: null,
        success: 'Chave criada. Copie e compartilhe com o cliente; ela não será exibida novamente.',
      })
    } catch (reason) {
      setAccessKeyFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível criar a chave de acesso.',
        success: null,
      })
    } finally {
      setBusy(false)
    }
  }

  async function toggleOrganization(id: string, active: boolean) {
    setOrganizationsFeedback({ error: null, success: null })

    try {
      await organizationsState.updateOrganization(id, { active: !active })
      setOrganizationsFeedback({ error: null, success: 'Situação da organização atualizada.' })
    } catch (reason) {
      setOrganizationsFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível atualizar a organização.',
        success: null,
      })
    }
  }

  async function revokeClientAccessKey(id: string) {
    setAccessKeysFeedback({ error: null, success: null })

    try {
      await accessKeys.revokeAccessKey(id)
      setAccessKeysFeedback({
        error: null,
        success: 'Chave revogada. As sessões abertas por ela foram invalidadas.',
      })
    } catch (reason) {
      setAccessKeysFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível revogar a chave.',
        success: null,
      })
    }
  }

  async function submitTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setTopicsFeedback({ error: null, success: null })
    setBusy(true)

    try {
      await topics.createTopic(
        String(values.get('name') ?? '').trim(),
        parseKeywords(String(values.get('keywords') ?? '')),
      )
      form.reset()
      setTopicsFeedback({ error: null, success: 'Assunto monitorado cadastrado.' })
    } catch (reason) {
      setTopicsFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível cadastrar o assunto.',
        success: null,
      })
    } finally {
      setBusy(false)
    }
  }

  async function updateTopic(event: FormEvent<HTMLFormElement>, topicId: string) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setTopicsFeedback({ error: null, success: null })
    setBusy(true)

    try {
      await topics.updateTopic(topicId, {
        name: String(values.get('name') ?? '').trim(),
        keywords: parseKeywords(String(values.get('keywords') ?? '')),
      })
      setTopicsFeedback({ error: null, success: 'Assunto monitorado atualizado.' })
    } catch (reason) {
      setTopicsFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível atualizar o assunto.',
        success: null,
      })
    } finally {
      setBusy(false)
    }
  }

  async function toggleTopic(topic: MonitoredTopic) {
    setTopicsFeedback({ error: null, success: null })

    try {
      await topics.updateTopic(topic.id, { active: !topic.active })
      setTopicsFeedback({ error: null, success: 'Situação do assunto atualizada.' })
    } catch (reason) {
      setTopicsFeedback({
        error: reason instanceof Error ? reason.message : 'Não foi possível atualizar o assunto.',
        success: null,
      })
    }
  }

  function selectOrganization(id: string) {
    setSelectedOrganization(id)
    setCreatedKey(null)
    setAccessKeyFeedback({ error: null, success: null })
    setTopicsFeedback({ error: null, success: null })
  }

  return {
    organizationsState,
    organizationFeedback,
    accessKeyFeedback,
    organizationsFeedback,
    accessKeysFeedback,
    topics,
    topicsFeedback,
    busy,
    selectedOrganization,
    createdKey,
    accessKeys,
    submitOrganization,
    submitAccess,
    toggleOrganization,
    revokeClientAccessKey,
    submitTopic,
    updateTopic,
    toggleTopic,
    selectOrganization,
  }
}
