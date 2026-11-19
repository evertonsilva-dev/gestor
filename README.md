# Gestor | Monitoramento

Plataforma multicliente para organizar a alimentação manual diária dos dados de comunicação e publicar relatórios isolados por organização.

## Arquitetura

- Monorepo npm com duas aplicações: `apps/frontend` (React, Vite, TypeScript, styled-components, react-select, react-chartjs-2/Chart.js e rc-picker) e `apps/api` (rotas HTTP e migrations).
- A API é same-origin e executa em Cloudflare Workers; os arquivos estáticos da SPA usam Workers Static Assets.
- Neon Auth para login administrativo por e-mail e senha; clientes entram com chaves de acesso próprias da aplicação.
- Neon Postgres acessado somente pelas funções com `@neondatabase/serverless`.
- A autorização de administradores usa `app_users`; a chave do cliente é armazenada como hash e vinculada a uma organização.
- Sessões de cliente usam cookie HttpOnly e são invalidadas quando a chave vinculada é revogada.
- As implementações das rotas ficam em `apps/api/functions`; o Worker carrega esses handlers diretamente.

### Organização do código

- Componentes React ficam em pastas com `index.tsx`; estilos e tipos específicos ficam em `styles.ts` e `types.ts`.
- Hooks ficam em `apps/frontend/src/hooks/<hook>/`, com `index.ts[x]` e arquivos auxiliares quando necessários.
- Componentes usam PascalCase (por exemplo, `AppShell`); pastas e arquivos seguem camelCase (por exemplo, `appShell` e `globalStyles.ts`).
- O `package.json` e o `package-lock.json` na raiz gerenciam os workspaces npm.

## Desenvolvimento local

Requer Node.js 22.22.2 ou superior e npm.

1. Instale as dependências na raiz com `npm install`.
2. Vincule o workspace ao projeto Neon com `neon link --project-id <project-id>` e selecione a branch `dev` com `neon checkout dev`. A branch `dev` já contém o schema inicial; migrations já aplicadas não devem ser reaplicadas.
3. Configure as variáveis locais do Worker com `neon env pull --env DATABASE_URL,NEON_AUTH_JWKS_URL --file .dev.vars`.
4. Configure `.env.local` com `VITE_NEON_AUTH_URL` igual à `NEON_AUTH_BASE_URL` da branch `dev` e mantenha `VITE_MOCK_AUTH=false` (padrão). Para obter a URL, use `neon env pull --env NEON_AUTH_BASE_URL --file .env.local`. Reinicie o Vite após alterar o arquivo.
5. Para trabalhar apenas na interface, inicie o front-end com `npm run dev`.
6. Para exercitar a aplicação completa, inicie `npm run dev`. O plugin do Cloudflare executa a SPA e o Worker juntos no runtime local e lê os valores de `.dev.vars`.

Neon Auth está habilitado na branch `dev`, separado de `main`. Configure os domínios de confiança necessários no Neon Auth; crie um usuário nessa branch e vincule seu ID a `app_users` antes do primeiro login. Desative o cadastro público se a operação for somente por convite.

O login administrativo usa e-mail e senha do Neon Auth; **Esqueceu a senha?** envia um link de recuperação. Os links expiram após uma hora. Clientes acessam `/client-login` com a chave emitida pela administradora.

### Primeiro acesso administrativo

Depois de habilitar o Neon Auth e criar a conta administrativa, obtenha o ID do usuário no Neon e execute uma única vez, substituindo os valores:

```sql
INSERT INTO app_users (auth_user_id, email, display_name, role)
VALUES ('<NEON_AUTH_USER_ID>', '<EMAIL_ADMIN>', '<NOME_ADMIN>', 'admin');
```

O índice `one_global_admin` impede a criação de um segundo perfil administrativo. Depois, a administradora cria organizações e gera uma chave para cada cliente pela tela **Organizações**. A chave completa é mostrada somente na criação; deve ser copiada e compartilhada com o cliente. A lista administrativa exibe apenas o prefixo, e a revogação encerra também as sessões existentes.

A migration `apps/api/migrations/0002_client_access_keys.sql` cria as tabelas e políticas RLS necessárias para chaves e sessões de clientes e já foi aplicada na branch Neon `dev`. Aplique-a uma única vez em cada ambiente novo antes de usar o fluxo.

A migration `apps/api/migrations/0003_client_key_prefixes.sql` normaliza os prefixos exibidos para as chaves já existentes e também foi aplicada em `dev`. Chaves já emitidas continuam válidas; clientes precisarão entrar novamente para receber o cookie de sessão com o novo nome.

## Build e verificações

```bash
npm run build
npm run typecheck:functions
npm run lint
npm test
```

## Cloudflare Workers

O projeto Worker fica em `apps/frontend` e é configurado por `cloudflare.config.ts`. A SPA é publicada como Workers Static Assets e `/api/*` é encaminhado ao Worker. `npm run build` valida o Worker; `npm run deploy:worker` publica somente o Worker com o `cf` CLI.

Defina `VITE_NEON_AUTH_URL` como variável pública de build. Configure `DATABASE_URL` (preferencialmente a URL pooled do Neon) e `NEON_AUTH_JWKS_URL` como secrets do Worker. Não comite valores reais.

No primeiro deploy, crie na raiz `.env.worker.production.local` com `DATABASE_URL` e `NEON_AUTH_JWKS_URL` de produção e envie o arquivo com `npm run deploy:worker -- --secrets-file ../../.env.worker.production.local`. O arquivo é ignorado pelo Git; não use os valores de desenvolvimento de `.dev.vars`. Após o primeiro deploy, ele pode ser removido: secrets não reenviados são preservados pelo Worker nas versões seguintes. Defina também `VITE_NEON_AUTH_URL` de produção no ambiente de build ou em `.env.production.local`.

### Preview do branch `develop`

Cada push em `develop` publica um Preview isolado do Worker `gestor`; não cria outro Worker nem altera a produção. O Preview usa uma URL própria, normalmente `https://develop-gestor.evertonsilvadev.workers.dev`. Em **Workers & Pages → `gestor` → Settings → Variables and Secrets → Previews Base**, configure os secrets `DATABASE_URL` e `NEON_AUTH_JWKS_URL` com os valores da branch Neon `dev`. Previews não herdam os secrets de produção. No GitHub, configure `CLOUDFLARE_API_TOKEN` (permissão Workers Editor), `CLOUDFLARE_ACCOUNT_ID` e a variável `DEVELOP_NEON_AUTH_URL` para o build. O deploy local pode ser feito com `npm run deploy:preview`; ele também usa a configuração Previews Base do Cloudflare.

## Fluxo diário

1. A administradora cria a organização, seus canais/assuntos e um período de monitoramento.
2. A administradora cadastra notícias, comentários e recomendações enquanto o período está em processamento.
3. Ao concluir e revisar a alimentação, publica o período.
4. Clientes consultam apenas períodos publicados da própria organização e exportam PDF/Excel. Um período em processamento não substitui o último publicado.

## Limites atuais

Captura automatizada e classificação por IA não fazem parte da primeira entrega. Fórmulas finais dos indicadores e conteúdo de exemplo devem ser validados com um relatório real antes de serem tratados como regras de negócio.
