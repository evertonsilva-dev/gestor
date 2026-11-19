import type { Environment } from '../../api/functions/_lib/env'

type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
type HandlerExport = `onRequest${Capitalize<Lowercase<HttpMethod>>}`
type ApiModule = Partial<Record<HandlerExport, PagesFunction<Environment>>>

interface ApiRoute {
  modulePath: string
  segments: string[]
  handlers: ApiModule
}

const apiModules = import.meta.glob<ApiModule>('../../api/functions/api/**/*.ts', {
  eager: true,
})

const apiRoutes: ApiRoute[] = Object.entries(apiModules).map(([modulePath, handlers]) => {
  const apiPathIndex = modulePath.lastIndexOf('/functions/api/')
  if (apiPathIndex < 0) {
    throw new Error(`Unexpected API module path: ${modulePath}`)
  }

  const routePath = modulePath
    .slice(apiPathIndex + '/functions/api/'.length)
    .replace(/\.ts$/, '')

  return {
    modulePath,
    segments: ['api', ...routePath.split('/')],
    handlers,
  }
})

const methodHandlers: ReadonlyArray<[HttpMethod, HandlerExport]> = [
  ['GET', 'onRequestGet'],
  ['HEAD', 'onRequestHead'],
  ['POST', 'onRequestPost'],
  ['PUT', 'onRequestPut'],
  ['PATCH', 'onRequestPatch'],
  ['DELETE', 'onRequestDelete'],
  ['OPTIONS', 'onRequestOptions'],
]

function matchRoute(route: ApiRoute, pathname: string): Record<string, string> | null {
  const requestSegments = pathname.split('/').slice(1)
  if (requestSegments.at(-1) === '') requestSegments.pop()
  if (requestSegments.length !== route.segments.length) return null

  const params: Record<string, string> = {}
  for (const [index, templateSegment] of route.segments.entries()) {
    const requestSegment = requestSegments[index]
    if (requestSegment === undefined) return null

    if (templateSegment.startsWith('[') && templateSegment.endsWith(']')) {
      try {
        params[templateSegment.slice(1, -1)] = decodeURIComponent(requestSegment)
      } catch (error) {
        if (error instanceof URIError) return null
        throw error
      }
    } else if (templateSegment !== requestSegment) {
      return null
    }
  }

  return params
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request)

    for (const route of apiRoutes) {
      const params = matchRoute(route, pathname)
      if (!params) continue

      const method = request.method.toUpperCase()
      const handlerName = methodHandlers.find(([supportedMethod]) => supportedMethod === method)?.[1]
      const handler = handlerName ? route.handlers[handlerName] : undefined
      if (!handler) {
        const allowed = methodHandlers
          .filter(([, name]) => typeof route.handlers[name] === 'function')
          .map(([supportedMethod]) => supportedMethod)
          .join(', ')
        return new Response(null, { status: 405, headers: { Allow: allowed } })
      }

      const context = {
        request,
        functionPath: route.modulePath,
        waitUntil: (promise) => ctx.waitUntil(promise),
        passThroughOnException: () => ctx.passThroughOnException(),
        next: (input, init) => env.ASSETS.fetch(input ?? request, init),
        env,
        params,
        data: {},
      } satisfies Parameters<PagesFunction<Environment>>[0]

      return handler(context)
    }

    return Response.json({ error: 'Not found.' }, { status: 404 })
  },
} satisfies ExportedHandler<Env>
