import { bindings, defineConfig } from 'cf/config'
import * as entrypoint from './worker/index.ts' with { type: 'cf-worker' }

export default defineConfig({
  worker: {
    name: 'gestor',
    compatibilityDate: '2026-11-19',
    entrypoint,
    env: {
      DATABASE_URL: bindings.secret(),
      NEON_AUTH_JWKS_URL: bindings.secret(),
      ASSETS: bindings.assets(),
    },
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*'],
    },
    workersDev: true,
    previewUrls: false,
    placement: { region: 'aws:sa-east-1' },
    observability: {
      enabled: true,
      logs: { enabled: true, headSamplingRate: 0.1 },
      traces: { enabled: true, headSamplingRate: 0.1 },
    },
  },
})
