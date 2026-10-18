# Kurio — NFT Marketplace

Implementação do desafio frontend da Jungle Gaming, com os fluxos de descoberta, compra e conta do colecionador. A interface usa a identidade visual Kurio dos arquivos fornecidos no desafio.

**[Acessar a demonstração](https://frontend-challenge-pi-six.vercel.app/)** · [Requisitos](CHALLENGE.md) · [Arquitetura](ARCHITECTURE.md) · [Relatório de testes e auditoria](DELIVERY_REPORT.md)

A aplicação funciona com APIs e eventos simulados na camada de rede. Não é necessário conectar uma carteira real, instalar extensões ou configurar um backend. Contas, saldos e transações são fictícios; os dados ficam no navegador e permanecem após atualizar a página.

## O que está implementado

- Catálogo com busca, filtros combinados, ordenação e paginação na URL.
- Detalhes do NFT, galeria, seleção de edição e quantidade, favoritos e disponibilidade.
- Cadastro, login, logout, expiração de sessão e retorno ao fluxo anterior.
- Carrinho persistente, incorporação dos itens do visitante ao fazer login e aplicação de cupons.
- Checkout com seleção de carteira e rede, cotação, revisão e confirmação do pedido.
- Recuperação de pedidos após timeout, refresh ou reconexão, sem criar outra compra.
- Perfil com edição de dados, avatar e senha, além de carteiras principal e secundária.
- Atualização de preço, estoque e pedido pelo cliente Socket.IO, com reconciliação via REST.

As telas têm estados de carregamento, vazio, erro e recuperação. Os layouts e testes cobrem 390, 768 e 1440 pixels.

## Rodando localmente

Requisitos: **Node.js 22.12 ou superior** e npm. A versão usada na validação foi Node 22.18.0.

```sh
git clone https://github.com/sergiocalazans/frontend-challenge.git
cd frontend-challenge
npm ci
npm run dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173). Os mocks já estão habilitados pelo arquivo `.env.demo`.

Para executar o build de produção localmente:

```sh
npm run build
npm run preview
```

O preview fica em [http://127.0.0.1:4173](http://127.0.0.1:4173). O build inclui a verificação de tipos e mantém os mocks da demonstração. O Service Worker precisa de localhost ou HTTPS.

## Testando a demonstração

Use uma das contas abaixo ou crie uma conta em `/register`.

| Conta | E-mail | Senha |
| --- | --- | --- |
| Ana | `ana@example.com` | `Collector123!` |
| Bruno | `bruno@example.com` | `Collector123!` |

Um caminho para conhecer os fluxos:

1. Busque um NFT no catálogo, combine filtros e navegue entre as páginas. A URL preserva a consulta ao atualizar ou voltar pelo histórico.
2. Abra o **Emerald Ape**, escolha uma edição e adicione ao carrinho. O cupom `KURIO10` aplica 10% de desconto; `EXPIRED` permite testar um cupom vencido.
3. Entre com uma conta e cadastre uma carteira em `/account/wallets`. Para testar Ethereum, use o endereço fictício `0x1111111111111111111111111111111111111111` e o provedor MetaMask.
4. Vá ao checkout, simule a conexão da carteira, confira a rede e os dados do colecionador. Revise os valores antes de confirmar.
5. Após a confirmação, atualize a página do pedido. O recibo deve manter os itens e valores da compra, mesmo que o catálogo mude depois.

Favoritos, checkout, perfil, carteiras e pedidos exigem login. A sessão dura 30 minutos e é recuperada após refresh. Ao sair ou trocar de conta, o cache privado e as assinaturas de eventos da sessão anterior são limpos.

Em `/account/profile`, é possível alterar dados, avatar e senha. O avatar aceita PNG, JPEG ou WebP de até 256 KiB e só é persistido ao salvar. A troca de senha encerra as outras sessões da conta. As senhas da simulação são armazenadas como hash PBKDF2 com salt.

## Tecnologias e organização

| Responsabilidade | Tecnologia |
| --- | --- |
| Interface e build | React, TypeScript strict e Vite |
| Rotas e estado na URL | TanStack Router |
| Consultas, mutations e cache | TanStack Query |
| Comunicação REST | Axios |
| Estilos e componentes | Tailwind CSS, shadcn/ui e Radix |
| APIs simuladas | MSW |
| Eventos | Socket.IO Client e `@mswjs/socket.io-binding` |
| Testes | Vitest e Playwright |
| Auditoria | Lighthouse |

```text
src/
  app/          # Rotas, providers e configuração do cache
  components/   # Componentes de interface, layouts e elementos compartilhados
  features/     # Catálogo, detalhes, autenticação, perfil e comércio
  lib/          # HTTP, ambiente, cálculos em ETH e ciclo de vida do socket
  mocks/        # Handlers REST, eventos, fixtures e persistência simulada
  styles/       # Tokens e estilos globais
tests/
  unit/         # Regras de negócio e integração com MSW/Socket.IO
  e2e/          # Fluxos completos e regressão visual
  deployment/   # Verificação do build local ou da URL publicada
design/         # SVGs originais, mapa dos frames e especificação visual
docs/           # Contratos, decisões e relatórios de execução
scripts/        # Build, extração de assets e auditorias
```

As chamadas saem dos módulos de cada funcionalidade, passam pelo Axios e chegam aos handlers MSW. O TanStack Query mantém o cache separado por consulta e usuário. Os componentes não contêm respostas fictícias.

REST é a fonte de verdade. Eventos Socket.IO invalidam as consultas afetadas; após reconectar, o cliente busca o estado atual pela API. O checkout usa uma chave de idempotência para recuperar a mesma tentativa após timeout e só exibe o recibo quando a API confirma o pedido. Valores em ETH trafegam como strings e são calculados com `bigint`.

O transporte Socket.IO é interceptado no navegador pelo MSW. O cliente usa o protocolo real, mas a demonstração não depende de um servidor de eventos externo. As decisões de sessão, cache, retries e reconciliação estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Variáveis de ambiente

A configuração padrão está em `.env.demo`. Use `.env.example` como referência e `.env.local` para ajustes locais.

| Variável | Valor padrão | Uso |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` no modo demo | Habilita MSW e os eventos simulados |
| `VITE_API_BASE_URL` | `/api` | Prefixo das chamadas REST |
| `VITE_SOCKET_URL` | Vazio | Usa a origem atual; não apontar para localhost no deploy |
| `VITE_MOCK_SCENARIO` | `default` | Cenário inicial de rede |

Variáveis `VITE_*` são expostas no navegador. Não coloque segredos nelas.

`npm run dev:api` e `npm run build:api` usam o modo de produção sem mocks por padrão e precisam de um backend compatível, que não faz parte deste repositório. Verifique os overrides em `.env.local` antes de usar esse modo.

## Cenários de falha e reset

A página `/design-system` oferece controles para alternar os cenários de rede e simular uma mudança de preço. Para testar casos específicos, abra o console do navegador com a aplicação carregada e use:

```js
const demo = async (path, payload = {}) => {
  const response = await fetch(`/api/demo/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Falha no cenário: ${response.status}`)
  return response.json()
}

await demo('scenario', { scenario: 'slow' })
```

Depois de definir o helper acima, execute o comando do cenário desejado:

| Cenário | Comando |
| --- | --- |
| Resposta vazia, erro ou lentidão | `await demo('scenario', { scenario: 'empty' })` — também aceita `default`, `error`, `slow`, `race`, `offline` e `flaky` |
| Sessão expirada | `await demo('auth', { action: 'expire' })` |
| Pagamento recusado | `await demo('commerce', { action: 'declined' })` |
| Timeout após criar o pedido | `await demo('commerce', { action: 'timeout' })` |
| Manter o pedido pendente | `await demo('commerce', { action: 'pending' })` |
| Concluir pedidos pendentes | `await demo('commerce', { action: 'settle' })` |
| Recusar conexão da carteira | `await demo('commerce', { action: 'reject-connection' })` |
| Expirar o cupom durante a revisão | `await demo('commerce', { action: 'expire-coupon' })` |
| Alterar o preço do Emerald Ape | `await demo('nfts/emerald-ape/update')` |
| Esgotar o NFT | `await demo('nfts/emerald-ape/update', { available: 0 })` |
| Interromper o Socket.IO | `await demo('realtime', { action: 'disconnect' })` |

Defina o modo de pagamento antes de confirmar a compra. No cenário `timeout`, o pedido é criado, mas a primeira resposta demora 11 segundos; o cliente HTTP encerra a espera em 10 segundos. A ação **Recuperar pedido** deve retornar a mesma compra, inclusive após refresh.

Para testar reconexão, configure `pending`, confirme a compra, interrompa o socket e execute `settle`. O pedido deve ser recuperado sem outro envio. Os testes em [commerce.spec.ts](tests/e2e/commerce.spec.ts) e [realtime.spec.ts](tests/e2e/realtime.spec.ts) mostram essas sequências e os casos de eventos duplicados ou antigos.

Para voltar ao estado inicial, termine a compra em andamento e execute, no mesmo console:

```js
await demo('commerce', { action: 'reset' })
await demo('details/reset')
await demo('auth', { action: 'reset' })
await demo('scenario', { scenario: 'default' })
location.reload()
```

O reset restaura as contas, senhas, perfis, carteiras, carrinhos e pedidos fictícios, além do catálogo e dos favoritos. O cenário de rede volta ao valor configurado no bootstrap ao recarregar; para observar um cenário selecionado pelo console, navegue pelos links da aplicação. Cada origem tem seu próprio armazenamento, portanto os dados de localhost não são compartilhados com a Vercel.

## Testes e comandos

Instale o Chromium antes de rodar os testes de navegador:

```sh
npx playwright install chromium
npm run verify
```

`verify` executa lint, testes unitários, build e Playwright, nessa ordem. Também é possível rodar cada etapa separadamente:

| Comando | O que executa |
| --- | --- |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | ESLint, sem tolerância a warnings |
| `npm test` | Testes unitários e de integração |
| `npm run build` | Typecheck e build de demonstração |
| `npm run test:e2e` | Fluxos E2E e comparações visuais |
| `npm run test:visual` | Somente os testes marcados como visuais |
| `npm run test:report` | Abre o relatório HTML do Playwright |
| `npm run audit:lighthouse` | Três medições de início e detalhe, em mobile e desktop |
| `npm run audit:check` | Confere as medianas e as metas do desafio |
| `npm run assets:extract` | Reproduz a extração dos assets dos SVGs |

O Playwright usa Chromium em três viewports, com um worker e sem retries locais. O relatório HTML fica em `playwright-report/`, o JSON em `reports/playwright/results.json` e os traces das falhas em `test-results/`. As baselines visuais representam a implementação e não uma comparação automática com o Figma.

Para o Lighthouse, gere o build primeiro e execute as medições sem rodar Playwright ao mesmo tempo:

```sh
npm run build
npm run audit:lighthouse
npm run audit:check
```

### Resultados registrados em 18/10/2026

| Verificação | Resultado |
| --- | --- |
| Typecheck, lint e build | Aprovados |
| Unitários e integração | 50/50 |
| Playwright completo local | 162/162 |
| Testes de deploy local | 12/12 |
| Testes na URL pública | 12/12 |

A suíte local completa foi executada no código `18addfc`. A URL pública foi validada na versão `58188fc`, com a mesma árvore de código. Os testes públicos cobriram deep links, refresh, worker MSW, persistência, checkout e recuperação Socket.IO. Não houve falhas, testes ignorados ou resultados instáveis nessas rodadas finais.

Medianas das três medições Lighthouse por página e perfil, feitas no build de produção local:

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Início | Mobile | 77 | 100 | 100 | 92 |
| Início | Desktop | 100 | 100 | 100 | 92 |
| Detalhe | Mobile | 84 | 100 | 100 | 92 |
| Detalhe | Desktop | 98 | 100 | 100 | 92 |

A meta de performance mobile é 90 e não foi atingida. Por isso, `audit:check` retornou erro nessa execução. Os relatórios, LCP/CLS/TBT, ambiente e análise dos gargalos estão em [DELIVERY_REPORT.md](DELIVERY_REPORT.md) e [docs/reports/delivery](docs/reports/delivery). Essas notas não são medições da rede da Vercel.

## Deploy na Vercel

O repositório já contém `vercel.json`. Configure o projeto com:

| Opção | Valor |
| --- | --- |
| Framework | Vite |
| Diretório raiz | `./` |
| Node.js | 22.x |
| Instalação | `npm ci` |
| Build | `npm run build:vercel` |
| Diretório de saída | `dist` |

Use as variáveis de demonstração descritas acima. O comando `build:vercel` força `VITE_ENABLE_MOCKS=true` e gera `build-info.json` com a SHA e o checksum do worker. As dependências de desenvolvimento também são necessárias durante o build.

O fallback SPA preserva o acesso direto e o refresh das rotas TanStack Router. Caminhos de API, assets, imagens, worker e metadados ficam fora da reescrita. O arquivo `public/mockServiceWorker.js` é servido na raiz com headers de cache próprios. A aplicação aguarda a ativação do worker antes de iniciar o Socket.IO.

Para conferir as regras de roteamento localmente:

```sh
npm run build:vercel
npm run preview:deployment
```

Em outro terminal PowerShell:

```powershell
$env:DEPLOYMENT_URL = 'http://127.0.0.1:4177'
$env:DEPLOYMENT_EXPECTED_SHA = git rev-parse HEAD
npm run test:deployment
```

Para testar uma publicação, troque `DEPLOYMENT_URL` pela URL HTTPS e `DEPLOYMENT_EXPECTED_SHA` pela SHA implantada. O comando testa a aplicação e grava HTML/JSON em `reports/deployment/`; ele não faz deploy. Repita essa verificação após atualizar a versão publicada. Mais detalhes em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Limitações conhecidas

- A composição de algumas telas, a navegação mobile e o footer diferem dos SVGs. A fonte usada é IBM Plex Mono, como substituta da família não identificada nos arquivos. O [mapa de frames](design/FRAME_MAP.md) e a [comparação visual](docs/reports/delivery/visual/README.md) registram essas diferenças.
- A performance mobile está abaixo da meta. O bootstrap e a execução de JavaScript, incluindo os mocks, ainda precisam de otimização; o build também aponta um chunk acima de 500 kB.
- A persistência é local ao navegador, sem garantia de sincronização ou transações entre abas. A simulação não substitui autenticação, pagamentos ou armazenamento de produção.
- Não foram feitas avaliações manuais com leitor de tela, zoom real do navegador ou uma instalação em clone limpo independente. O build público informou `gitDirty=true`; essa condição está registrada na auditoria.

## Documentação

- [CHALLENGE.md](CHALLENGE.md): escopo e critérios do desafio.
- [ARCHITECTURE.md](ARCHITECTURE.md): contratos, organização, cache, sessão e reconciliação.
- [DELIVERY_REPORT.md](DELIVERY_REPORT.md): requisitos verificados, resultados e pendências.
