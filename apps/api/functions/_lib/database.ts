import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import type { Environment } from './env'
import { ConfigurationError } from './http'

export function getDatabase(env: Environment): NeonQueryFunction<false, false> {
  if (!env.DATABASE_URL) {
    throw new ConfigurationError('A variável DATABASE_URL não está configurada.')
  }

  return neon<false, false>(env.DATABASE_URL)
}

export function getScopedDatabase(env: Environment, userId: string): NeonQueryFunction<false, false> {
  const database = getDatabase(env)
  const scoped = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    database.transaction<false, false>((transaction) => [
      transaction`SELECT set_config('app.user_id', ${userId}, true)`,
      transaction(strings, ...values),
    ]).then(([, rows]) => rows)) as NeonQueryFunction<false, false>

  return scoped
}

export function getClientAuthDatabase(env: Environment): NeonQueryFunction<false, false> {
  const database = getDatabase(env)
  const scoped = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    database.transaction<false, false>((transaction) => [
      transaction`SELECT set_config('app.auth_context', 'client_auth', true)`,
      transaction(strings, ...values),
    ]).then(([, rows]) => rows)) as NeonQueryFunction<false, false>

  return scoped
}
