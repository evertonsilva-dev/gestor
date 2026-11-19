import { getClientSessionActor } from '../../_lib/clientAccess'
import type { Environment } from '../../_lib/env'
import { apiError, json } from '../../_lib/http'

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await getClientSessionActor(request, env)

    return actor ? json(actor) : json({ error: 'Autenticação necessária.' }, 401)
  } catch (error) {
    return apiError(error)
  }
}
