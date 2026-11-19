import {
  expireClientSessionCookie,
  revokeClientSession,
} from '../../_lib/clientAccess'
import type { Environment } from '../../_lib/env'
import { apiError, json } from '../../_lib/http'

export const onRequestPost: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    await revokeClientSession(request, env)
    return json(
      { success: true },
      200,
      { 'Set-Cookie': expireClientSessionCookie(request) },
    )
  } catch (error) {
    return apiError(error)
  }
}
