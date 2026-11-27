# Arquea Tecnologia | Monitoramento

Plataforma multicliente da Arquea Tecnologia para organizar os dados de comunicação e publicar relatórios isolados por organização.

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
- A identidade da interface usa a paleta Arquea; o `logo.svg` atual é uma versão vetorial provisória baseada na referência visual e deve ser substituído pelo arquivo oficial quando disponibilizado.

## Desenvolvimento local

Requer Node.js 22.22.2 ou superior e npm.

1. Instale as dependências na raiz com `npm install`.
2. Vincule o workspace ao projeto Neon com `neon link --project-id <project-id>` e selecione a branch `dev` com `neon checkout dev`. A branch `dev` já contém o schema inicial; migrations já aplicadas não devem ser reaplicadas.
3. Configure as variáveis locais do Worker com `neon env pull --env DATABASE_URL,NEON_AUTH_JWKS_URL --file .dev.vars`.
4. Configure `.env.local` com `VITE_NEON_AUTH_URL` igual à `NEON_AUTH_BASE_URL` da branch `dev` e mantenha `VITE_MOCK_AUTH=false` (padrão). Para obter a URL, use `neon env pull --env NEON_AUTH_BASE_URL --file .env.local`. Reinicie o Vite após alterar o arquivo.
5. Para trabalhar apenas na interface, inicie o front-end com `npm run dev`.
6. Para exercitar a aplicação completa, inicie `npm run dev`. O plugin do Cloudflare executa a SPA e o Worker juntos no runtime local e lê os valores de `.dev.vars`.

Neon Auth está habilitado nas branches `dev` e `main`, com estado de autenticação separado. Em **Domains** no Neon Auth, cadastre `https://develop-gestor.evertonsilvadev.workers.dev` na branch `dev` e `https://gestor.evertonsilvadev.workers.dev` na branch `main`. Use somente a origem, sem caminho como `/login` ou barra final; cada ambiente deve apontar para o Neon Auth da própria branch. Na branch `dev`, crie um usuário e vincule seu ID a `app_users` antes do primeiro login. Desative o cadastro público se a operação for somente por convite.

O login administrativo usa e-mail e senha do Neon Auth; **Esqueceu a senha?** envia um link de recuperação. Os links expiram após uma hora. Clientes acessam `/client-login` com a chave emitida pela administradora.

### Primeiro acesso administrativo

Depois de habilitar o Neon Auth e criar a conta administrativa, obtenha o ID do usuário no Neon e execute uma única vez, substituindo os valores:

```sql
INSERT INTO app_users (auth_user_id, email, display_name, role)
VALUES ('<NEON_AUTH_USER_ID>', '<EMAIL_ADMIN>', '<NOME_ADMIN>', 'admin');
```

Administradores são perfis globais, sem vínculo com uma organização, e podem existir em conjunto após a migration `apps/api/migrations/0004_multiple_admins.sql`. Cada um precisa ter um usuário no Neon Auth da branch correspondente e um perfil ativo em `app_users`; o SQL acima mostra como associar o primeiro. Depois, a administradora cria organizações e gera uma chave para cada cliente pela tela **Organizações**. A chave completa é mostrada somente na criação; deve ser copiada e compartilhada com o cliente. A lista administrativa exibe apenas o prefixo, e a revogação encerra também as sessões existentes.

A migration `apps/api/migrations/0002_client_access_keys.sql` cria as tabelas e políticas RLS necessárias para chaves e sessões de clientes e já foi aplicada na branch Neon `dev`. Aplique-a uma única vez em cada ambiente novo antes de usar o fluxo.

A migration `apps/api/migrations/0003_client_key_prefixes.sql` normaliza os prefixos exibidos para as chaves já existentes e também foi aplicada em `dev`. Chaves já emitidas continuam válidas; clientes precisarão entrar novamente para receber o cookie de sessão com o novo nome.

A migration `apps/api/migrations/0006_contextual_source_pages.sql` adiciona páginas por canal, análise contextual de sentimento e revisão administrativa de afinidade por período. Ela já foi aplicada na branch Neon `dev`; aplique-a nos demais ambientes antes de publicar a versão que usa essas tabelas e colunas.

A migration `apps/api/migrations/0007_optional_comment_profile.sql` torna o perfil do público opcional para comentários novos e já foi aplicada na branch Neon `dev`. Aplique-a após as migrations anteriores nos demais ambientes antes de publicar a versão que cadastra comentários sem perfil.

## Build e verificações

```bash
npm run build
npm run typecheck:functions
npm run lint
npm test
```

## Cloudflare Workers

O projeto Worker fica em `apps/frontend` e é configurado por `cloudflare.config.ts`. A SPA é publicada como Workers Static Assets e `/api/*` é encaminhado ao Worker. `npm run build` valida o Worker; `npm run deploy:worker` publica somente o Worker com o `cf` CLI.

Defina `VITE_NEON_AUTH_URL` como variável pública de build. Configure `DATABASE_URL` (preferencialmente a URL pooled do Neon) e `NEON_AUTH_JWKS_URL` como secrets do Worker. O binding `AI` do Workers AI é declarado em `cloudflare.config.ts`; não exige chave de API. A classificação envia títulos de notícias ou conteúdo de comentários junto ao nome da organização e seus assuntos/palavras-chave ativos; URLs, anotações e dados pessoais não são enviados. A análise e sua justificativa ficam disponíveis apenas na administração. Não comite valores reais.

No primeiro deploy, crie na raiz `.env.worker.production.local` com `DATABASE_URL` e `NEON_AUTH_JWKS_URL` de produção e envie o arquivo com `npm run deploy:worker -- --secrets-file ../../.env.worker.production.local`. O arquivo é ignorado pelo Git; não use os valores de desenvolvimento de `.dev.vars`. Após o primeiro deploy, ele pode ser removido: secrets não reenviados são preservados pelo Worker nas versões seguintes. Defina também `VITE_NEON_AUTH_URL` de produção no ambiente de build ou em `.env.production.local`.

### Preview do branch `develop`

Cada push em `develop` publica um Preview isolado do Worker `gestor`; não cria outro Worker nem altera a produção. O Preview usa uma URL própria, normalmente `https://develop-gestor.evertonsilvadev.workers.dev`. Em **Workers & Pages → `gestor` → Settings → Variables and Secrets → Previews Base**, configure os secrets `DATABASE_URL` e `NEON_AUTH_JWKS_URL` com os valores da branch Neon `dev`. Previews não herdam os secrets de produção. No GitHub, configure `CLOUDFLARE_API_TOKEN` (permissão Workers Editor), `CLOUDFLARE_ACCOUNT_ID` e a variável `DEVELOP_NEON_AUTH_URL` para o build. O deploy local pode ser feito com `npm run deploy:preview`, com `VITE_NEON_AUTH_URL` definido em `.env.local` ou no ambiente; os secrets de backend vêm da configuração Previews Base do Cloudflare.

## Fluxo diário

1. A administradora cria a organização, seus assuntos monitorados e palavras-chave, canais, páginas/fontes por canal e um período de monitoramento. O cadastro e a associação das páginas são manuais; não há scraping de redes sociais.
2. Enquanto o período está em processamento, a administradora cadastra publicações vinculadas a páginas e importa seus comentários individualmente ou em lote. Cada comentário novo herda canal e página da publicação selecionada e é classificado separadamente pelo Workers AI; sentimentos informados são preservados, e resultado, justificativa e palavras-chave identificadas podem ser revisados e corrigidos manualmente.
3. O intervalo definido para o período é a referência de datas apresentada no relatório; notícias e comentários não exigem data individual.
4. Para páginas com pelo menos três notícias associadas no período, a administração revisa a sugestão de afinidade (aliada, neutra ou crítica) com base na distribuição de sentimentos. Empates são sugeridos como neutros; a administração confirma ou corrige a sugestão.
5. Ao concluir e revisar a alimentação, publica o período. Administradores podem corrigir conteúdo publicado, com registro de auditoria.
6. Clientes consultam apenas períodos publicados da própria organização e exportam PDF/Excel; justificativas da IA e revisões de afinidade continuam restritas à administração. Um período em processamento não substitui o último publicado.

### Importar comentários por CSV manualmente

1. Na página da rede social, selecione e copie manualmente os comentários desejados. A extensão não acessa a página nem coleta conteúdo automaticamente.
2. No Chrome, abra `chrome://extensions`, ative **Modo do desenvolvedor**, clique em **Carregar sem compactação** e selecione a pasta `tools/comment-csv-helper` deste repositório.
3. Abra a extensão, cole os comentários e baixe o CSV. Use um comentário por linha; para preservar comentários com várias linhas, separe os blocos com uma linha em branco. O arquivo contém somente a coluna `content`, sem nomes de usuário.
4. No Gestor, abra **Importar em massa**, selecione **Comentários (texto ou CSV)**, carregue o CSV e gere a prévia. Associe os comentários à publicação correspondente e, se desejar, informe o sentimento; os campos vazios são classificados pela IA.

## Limites atuais

Comentários são inseridos manualmente ou colados/importados pela administração e precisam estar vinculados a uma publicação de página cadastrada no período. A coleta automática por APIs oficiais das redes sociais ainda não está implementada; não há scraping.
