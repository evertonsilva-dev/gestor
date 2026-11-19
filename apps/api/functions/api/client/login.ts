import { z } from 'zod'
import {
  createClientAccessSession,
  createClientSessionCookie,
} from '../../_lib/clientAccess'
import type { Environment } from '../../_lib/env'
import { apiError, json, readJson } from '../../_lib/http'

const loginSchema = z.object({
  accessKey: z.string().regex(/^[a-z][a-z0-9]*_client_[a-f0-9]{64}$/),
})

export const onRequestPost: PagesFunction<Environment> = async ({ request, env }) => {
  try {
    const parsed = loginSchema.safeParse(await readJson(request))
    if (!parsed.success) {
      return json({ error: 'Informe uma chave de acesso válida.' }, 400)
    }

    const session = await createClientAccessSession(parsed.data.accessKey, env)
    if (!session) {
      return json({ error: 'Chave inválida ou revogada.' }, 401)
    }

    return json(
      session.actor,
      200,
      { 'Set-Cookie': createClientSessionCookie(session.token, request) },
    )
  } catch (error) {
    return apiError(error)
  }
}
