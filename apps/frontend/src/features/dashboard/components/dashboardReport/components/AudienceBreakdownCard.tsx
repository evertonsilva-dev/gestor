import { Card } from '@/components/card'
import type { DashboardData } from '@/types/domain'
import type { DashboardAudienceTone } from '../types'
import { AudienceCard, AudienceGrid } from '../styles'

const profileNames = {
  militante: 'Apoiadores',
  simpatizante: 'Simpatizantes',
  detrator: 'Opositores',
} as const

const profileTones = {
  militante: 'blue',
  simpatizante: 'gold',
  detrator: 'red',
} as const satisfies Record<keyof typeof profileNames, DashboardAudienceTone>

interface AudienceBreakdownCardProps {
  audience: DashboardData['audience']
}

export function AudienceBreakdownCard({ audience }: AudienceBreakdownCardProps) {
  return (
    <Card title="Categorização do público" subtitle="Distribuição dos comentários analisados">
      <AudienceGrid>
        {(['militante', 'simpatizante', 'detrator'] as const).map((profile) => {
          const item = audience.find((entry) => entry.profile === profile)
          const percentage = item?.percentage ?? 0
          return (
            <AudienceCard key={profile} $tone={profileTones[profile]} $width={percentage}>
              <span>{profileNames[profile]}</span>
              <strong>{percentage}%</strong>
              <div><i /></div>
              <span>{item?.count ?? 0} registros</span>
            </AudienceCard>
          )
        })}
      </AudienceGrid>
    </Card>
  )
}
