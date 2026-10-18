# Jungle Gaming NFT Marketplace · Kurio

Marketplace com dados simulados em React/TypeScript/Vite. A marca KURIO vem dos SVGs. Requisitos: [CHALLENGE.md](CHALLENGE.md); [arquitetura](ARCHITECTURE.md); [defesa técnica](LEARNING.md).

Catálogo, detalhes, favoritos, autenticação, carrinho, carteiras, checkout, pedidos, perfil/avatar/senha e Socket.IO estão implementados. **Ainda não há URL pública nem validação na Vercel.** Fidelidade integral ao SVG e metas finais de performance não estão certificadas. [Preparação de deploy e evidências](docs/DEPLOYMENT.md), [perfil](docs/PROFILE.md), [auditoria E2E anterior](docs/E2E_AUDIT.md).

## Setup e comandos

Requer Node >=22.12 (validado em 22.18.0) e npm; use Node 22.x no projeto Vercel. Instale pelo lockfile:

```sh
npm ci
npx playwright install chromium
npm run dev
```

Dev em http://127.0.0.1:5173; build otimizado em dist/. Service Worker exige localhost ou HTTPS. Não há dependência de backend privado, blockchain, extensão ou pagamento real. Use apenas dados fictícios.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
npm run verify
npm run test:e2e
npm run test:visual
npm run test:report
npm run audit:lighthouse
npm run audit:check
```

build inclui typecheck e modo demo com mocks; preview usa 4173. verify encadeia lint, unitários, build e Playwright. build:api/dev:api desativam mocks por padrão e exigem backend compatível não fornecido. Ferramentas/MSW são necessários para construir: não instale somente dependências de produção antes do build.

Playwright usa Chromium em 390/768/1440, um worker, zero retries locais, HTML em playwright-report/ e JSON em reports/playwright/results.json. Falhas/traces em test-results/. Baselines são da implementação, não do Figma; atualização requer revisão e repetição com baselines fixas. Lighthouse mede início/detalhe, mobile/desktop, três rodadas por combinação, com imagens/fontes/mocks; audit:check rejeita metas/medianas inválidas. Não execute Lighthouse junto aos E2E.

## Variáveis

.env.demo já ativa a demonstração. .env.example documenta as opções; .env.local pode substituir valores locais. Variáveis VITE_* são públicas, nunca segredos.

| Variável | Demonstração |
| --- | --- |
| VITE_ENABLE_MOCKS | true |
| VITE_API_BASE_URL | /api |
| VITE_SOCKET_URL | vazio: origem atual; não use localhost no deploy |
| VITE_MOCK_SCENARIO | default; também empty/error/slow/race/offline/flaky |

main.tsx aguarda worker.start antes de importar aplicação e Socket.IO. O worker está em public/mockServiceWorker.js e é copiado para dist/mockServiceWorker.js, registrado em /mockServiceWorker.js com scope / e updateViaCache none.

## Demonstração

Ana: ana@example.com; Bruno: bruno@example.com. Senha fictícia: Collector123!. Cadastro local em /register; sessão dura 30 minutos, sobrevive a refresh e Sair limpa cache privado/subscriptions. Senhas são persistidas como hash PBKDF2/salt.

Busque e filtre em /; URL preserva página/ordenação/histórico. Em /nfts/emerald-ape, escolha edição/quantidade, favorite ou compre. Visitante entra e retorna à seleção; confirme Favoritar após login. /cart persiste e é incorporado à conta uma vez; KURIO10 concede 10%, EXPIRED demonstra expiração.

Cadastre uma carteira em /account/wallets. Exemplo Ethereum fictício: 0x1111111111111111111111111111111111111111, MetaMask e demais identificações fictícias. No checkout, conecte, selecione a rede, preencha colecionador, revise e confirme. Cada pedido usa uma rede compatível com todos os itens. Totais vêm da cotação REST precisa em wei.

Pending é recuperado por Socket.IO/REST e polling de segurança de 15 s; só confirmed abre recibo snapshot. Declined preserva itens; timeout oferece recuperar a mesma tentativa/chave sem duplicar compra. Perfil em /account/profile salva dados, avatar PNG/JPEG/WebP até 256 KiB e senha em formulários independentes. Alterar senha encerra outras sessões, mantendo a atual. Avatar selecionado/removido só persiste ao salvar.

## Cenários e reset dos mocks

Em /design-system, Cenário MSW alterna sucesso/vazio/erro/lento; Simular alteração de preço passa pelo protocolo Socket.IO. Também é possível enviar POST no console da aplicação:

```js
await fetch('/api/demo/scenario', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({scenario: 'slow'})
})
```

| Endpoint POST | Payload |
| --- | --- |
| /api/demo/scenario | scenario: default, empty, error (503), slow (1800 ms), race, offline, flaky |
| /api/demo/auth | action: expire ou reset; reset restaura também perfis/senhas |
| /api/demo/details/reset | limpa favoritos e cenários de detalhe |
| /api/demo/commerce | action: confirmed, declined, timeout, pending, settle, reject-connection, disconnect, expire-quotes, expire-coupon, reset |
| /api/demo/nfts/emerald-ape/update | {} alterna preço; {available:0} esgota e emite nft.updated |
| /api/demo/realtime | {action:'disconnect'} interrompe 1500 ms; duplicate/stale com orderId reproduzem eventos |

Para timeout, configure antes de confirmar: o mock cria pedido e demora 11 s na primeira resposta (Axios limita 10 s). Use Recuperar pedido, inclusive após refresh. Para interrupção, configure pending, confirme, dispare disconnect e depois settle; deve recuperar o mesmo pedido. Sequências executáveis estão em tests/e2e/commerce.spec.ts e realtime.spec.ts.

Sem compra em andamento, reset conhecido: commerce reset → details/reset → auth reset → scenario default → refresh. Essa sequência apaga somente dados fictícios e restaura os recursos implementados; um contexto de navegador novo também é isolado. Cenário de rede volta ao valor configurado no bootstrap; para observá-lo, navegue por links sem recarregar. Storage é local ao navegador, sem transações entre abas.

## Vercel — executar somente após autorização

Importar o repositório na Vercel pode iniciar publicação automaticamente. Esta preparação não cria projeto remoto nem dispara deploy. Após autorização, escolha o commit/branch aprovado, root ./, preset Vite, Node 22.x, instalação npm ci, build npm run build:vercel e saída dist. Cadastre as variáveis de demonstração acima em Preview/Production. O script força VITE_ENABLE_MOCKS=true, mesmo se o ambiente tiver outro valor, e gera build-info.json com SHA, estado Git e checksum do worker. build:api continua separado.

vercel.json fornece fallback SPA para rotas da aplicação; exclui /api e assets/imagens/worker/metadados. Rotas reais futuras de API não são reescritas para HTML. Arquivos existentes têm precedência no filesystem. Worker recebe Cache-Control no-cache/no-store e Service-Worker-Allowed /. Sem API real neste repositório, requisição /api não interceptada deve falhar, não retornar index.html.

Ensaio local, sem publicação:

```sh
npm run build:vercel
npm run preview:deployment
```

Em outro PowerShell:

```powershell
$env:DEPLOYMENT_URL = 'http://127.0.0.1:4177'
$env:DEPLOYMENT_EXPECTED_SHA = git rev-parse HEAD
npm run test:deployment
```

O servidor local aplica o subconjunto de rewrites/headers usado aqui; não é Vercel CLI nem infraestrutura Vercel. O teste cobre worker/checksum/headers, deep links/refresh, perfil/carteiras/sessão/carrinho e compra com preço alterado, interrupção Socket.IO e recuperação, além de cenários determinísticos. Relatórios HTML/JSON em reports/deployment/; evidências versionadas em docs/reports/vercel/.

**Após deploy autorizado**, substitua DEPLOYMENT_URL pela URL HTTPS pública e DEPLOYMENT_EXPECTED_SHA pela SHA completa implantada, e execute o mesmo comando. Ele não faz deploy. Registre URL/SHA/data, resultados e traces; verifique acesso público sem proteção de preview. A versão publicada precisa corresponder ao código entregue. Até essa execução, worker/Socket.IO/refresh na Vercel permanecem NOT TESTED, mesmo com ensaio local aprovado.

## Design e materiais

[Mapa de frames](design/FRAME_MAP.md) e [especificação](design/DESIGN_SPEC.md) documentam os SVGs preservados. Assets são quatro imagens originais WebP e fonte local IBM Plex Mono substituta. Não há SVG de tela inteira no lugar de interface funcional. Fonte, composição mobile, navegação/footer e confirmações têm desvios documentados; baselines não certificam fidelidade integral. `npm run assets:extract` reproduz os assets individuais. Estrutura por funcionalidades em src/features/, componentes em src/components/, contratos/transporte separados de src/mocks/.
