import { LoadingScreen } from '@/components/loadingScreen'
import { useOrganizationsPage } from './useOrganizationsPage'
import {
  CreateAccessKeyCard,
  CreateOrganizationCard,
  OrganizationAccessKeysCard,
  OrganizationTopicsCard,
  OrganizationsListCard,
} from './components'
import { Grid } from './styles'

export function OrganizationsPage() {
  const page = useOrganizationsPage()
  const { organizationsState, accessKeys } = page

  if (organizationsState.isLoading) {
    return <LoadingScreen label="Carregando organizações" />
  }

  return (
    <Grid>
      <div>
        <CreateOrganizationCard
          busy={page.busy}
          error={page.organizationFeedback.error}
          success={page.organizationFeedback.success}
          onSubmit={page.submitOrganization}
        />
        <CreateAccessKeyCard
          organizations={organizationsState.organizations}
          selectedOrganization={page.selectedOrganization}
          createdKey={page.createdKey}
          busy={page.busy}
          error={page.accessKeyFeedback.error}
          success={page.accessKeyFeedback.success}
          onOrganizationChange={page.selectOrganization}
          onSubmit={page.submitAccess}
        />
        <OrganizationAccessKeysCard
          organizations={organizationsState.organizations}
          selectedOrganization={page.selectedOrganization}
          keys={accessKeys.keys}
          isLoading={accessKeys.isLoading}
          error={accessKeys.error}
          actionError={page.accessKeysFeedback.error}
          actionSuccess={page.accessKeysFeedback.success}
          onOrganizationChange={page.selectOrganization}
          onRevoke={(id) => void page.revokeClientAccessKey(id)}
        />
        <OrganizationTopicsCard
          organizations={organizationsState.organizations}
          selectedOrganization={page.selectedOrganization}
          topics={page.topics.topics}
          isLoading={page.topics.isLoading}
          error={page.topics.error}
          actionError={page.topicsFeedback.error}
          actionSuccess={page.topicsFeedback.success}
          busy={page.busy}
          onOrganizationChange={page.selectOrganization}
          onCreate={page.submitTopic}
          onUpdate={page.updateTopic}
          onToggle={(topic) => void page.toggleTopic(topic)}
        />
      </div>
      <OrganizationsListCard
        organizations={organizationsState.organizations}
        error={organizationsState.error}
        actionError={page.organizationsFeedback.error}
        actionSuccess={page.organizationsFeedback.success}
        onToggle={(id, active) => void page.toggleOrganization(id, active)}
        onRefresh={() => void organizationsState.refresh()}
      />
    </Grid>
  )
}
