import type { Environment } from '../_lib/env'
import { requireActor } from '../_lib/auth'
import { apiError, json } from '../_lib/http'

export const onRequestGet: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const actor = await requireActor(request, env)

    if (actor instanceof Response) {
      return actor
    }

    return json(actor)
  } catch (error) {
    return apiError(error)
  }
}
