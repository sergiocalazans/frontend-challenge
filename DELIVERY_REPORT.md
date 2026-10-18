# Auditoria final de entrega — Jungle Gaming NFT Marketplace

Data: 18/10/2026. Fonte de requisitos: leitura integral de CHALLENGE.md e AGENTS.md. **Conclusão: FAIL — entrega ainda incompleta.** Este relatório não autoriza merge, release ou publicação.

## Como interpretar os resultados

- PASS: comportamento observado nos testes executados e/ou requisito estrutural confirmado no código citado; não certifica cenários não exercitados.
- FAIL: requisito ausente, divergência encontrada ou meta não atingida.
- NOT TESTED: falta ambiente, acesso ou evidência de execução. Não equivale a aprovação.

## Versão e integrações

Auditoria funcional executada no código de develop `18addfcd42b8f25635d463b6b9e85713a0775968`, identificado também nos logs e environment.json. As alterações de documentação são preparadas em uma branch própria criada dessa base, sem commits diretamente em develop/main.

Os PRs #1 (setup), #2 (tokens/layouts), #3 (catálogo), #5 (detalhes), #7 (autenticação integrada), #8 (comércio), #9 (realtime), #10 (E2E), #11 (perfil) e #12 (preparação Vercel) estão mesclados em develop. #4 foi revertido por #6; a restauração válida é #7. A verificação utiliza histórico Git remoto e estado dos PRs, não apenas os nomes das branches. Inventário com SHAs em `docs/reports/delivery/integrations.json`.

O PR de entrega [#13](https://github.com/sergiocalazans/frontend-challenge/pull/13), título `chore(release): prepare NFT marketplace submission`, foi publicado como rascunho a pedido do candidato durante a auditoria. Foi então mesclado externamente em main em 18/10/2026 às 14:14:49 UTC, merge `58188fc7078755f9a627c8c69bb9fa1f6d0d1954`. A auditoria ainda estava em execução; o merge não representa aprovação dos critérios abaixo. O agente não realizou esse merge.

O PR #10 de feature/e2e-tests foi integrado externamente durante a auditoria. A execução anterior em eff91e3 foi interrompida após 65 aprovações, sem falha observada; não é apresentada como suíte concluída (log em docs/reports/delivery/pre-integration). A rodada integrada em f3a6390 concluiu 153/153 E2E (624,32 s) e 46/46 unitários; evidências em playwright-base-f3 e verify-base-f3.log. Depois o candidato ampliou o escopo: perfil foi implementado e integrado pelo PR #11, preparação Vercel pelo #12. A auditoria final foi reiniciada na SHA 18addfc com todos esses recursos juntos. As medições anteriores da branch independente permanecem em docs/E2E_AUDIT.md e não substituem a auditoria integrada.

## Requisitos funcionais e cobertura real

| Requisito / grupo | Status | Código e evidência |
| --- | --- | --- |
| 1 Busca, filtros combinados, ordenação, paginação, URL/refresh/histórico | PASS | features/catalog, mocks/catalog.ts, e2e/catalog.spec.ts; parâmetros fazem parte da chave Query; AbortSignal e cenário race |
| 2 Detalhe direto, NFT inexistente, galeria, edição e limite de quantidade | PASS | nft-details, mocks/details.ts, e2e/details.spec.ts |
| 3 Cadastro/login/logout, expiração e troca de usuário | PASS | auth, mocks/auth.ts e session-store.ts; e2e/auth.spec.ts, unit/auth.test.ts; refresh e logout concorrente entre abas |
| 4 Favoritos persistidos, otimismo, rollback e isolamento | PASS | favorite-button.tsx, mocks/details.ts; e2e/details/auth e unit/details |
| 5 Carrinho: quantidade, remoção, cupom, refresh e incorporação ao login | PASS | commerce/cart-page, mocks/cart; e2e/commerce e unit/commerce; totais REST precisos em wei |
| 6 Compra completa com revisão e recibo confirmado | PASS | checkout/order-page, mocks/orders; e2e/commerce; confirmed da API precede recibo |
| 7 Recusa, cliques repetidos, timeout e idempotência | PASS | e2e/commerce e unit/commerce: mesmo pedido/chave, conflito 409 para conteúdo diferente, estoque reservado/liberado uma vez, falha preserva itens |
| 8 Carteiras principal/secundária, cadastro/edição e validação | PASS | wallet-form/wallets-page, mocks/wallets; e2e/commerce e unit/commerce |
| 8 Perfil, avatar e alteração de senha | PASS | features/profile e mocks/profile; profile.test.ts/profile.spec.ts: validação, avatar válido/inválido/remoção, persistência, conflitos, expiração e credenciais novas |
| 9 Preço/estoque durante checkout, nova revisão obrigatória | PASS | cliente Socket.IO público real → invalidação → GET/cotação; e2e/commerce impede confirmação desatualizada |
| 10 Duplicatas, eventos antigos, desconexão e recuperação pending | PASS | lib/realtime, mocks/socket e realtime-state; unit/realtime/network e e2e/realtime; sessão capturada, versões, terminais, GET após reconexão, nenhuma nova compra |
| 11 Teclado, diálogos e validação | PASS | labels, foco visível, trap/retorno de diálogos e revisão/recibo por teclado em audits.spec.ts e design-system.spec.ts; correção de foco do PR #10 integrada nesta base |
| 12 Loading com shimmer, vazio, erro e retry | PASS | shared/content-skeletons, CSS reduced-motion; setup/catalog/details/commerce E2E; cenários slow/error/offline na camada MSW |

PASS de uma linha representa os cenários citados. Grupo 8 inclui testes próprios de perfil/avatar/senha e os testes existentes de carteiras, sem tratar o formulário de carteira como cobertura de perfil.

## Integração, contratos e mocking

| Requisito | Status | Verificação |
| --- | --- | --- |
| React/TypeScript strict/Vite, Router/Query/Axios/REST | PASS | tsconfig, app/mount/router/query-client e APIs por feature; build/typecheck executados |
| Tailwind/shadcn, MSW e socket.io-client efetivos | PASS | tokens/UI Radix, handlers e binding Socket.IO; testes usam o transporte real |
| Contratos sessão/NFT/favoritos/carrinho/cotação/pedidos/carteiras | PASS | contratos tipados por feature e docs de autenticação/comércio/realtime; 400/401/404/409/410/422/503 exercitados conforme testes |
| Contratos REST de perfil/avatar/senha | PASS | GET/PATCH /profile, POST /profile/password, token/validação/conflitos; dados compartilhados com sessão e apelido da carteira principal |
| Cache, retries, cancelamento e isolamento por parâmetros/usuário | PASS | Query: stale 30s/gc 5min, até 1 retry de consulta rede/5xx, mutations sem retry automático; private+userId, token capturado, limpeza ao logout/401 e descarte de resultados obsoletos |
| Sessão após refresh, proteção de rota e retomada | PASS | RequireSession e SessionLifecycle; expiração no checkout/pedido e retorno seguro testados |
| Sem persistência de senha em claro | PASS | PBKDF2/salt no mock; fixtures contêm hashes; credencial fictícia no README é dado de demonstração |
| Precisão ETH e quantidades inteiras | PASS | lib/eth.ts bigint, strings decimais no transporte, testes de totais/limites |
| Recibo snapshot e remoção apenas de itens/quantidades comprados | PASS | unit/commerce e fluxo de pedido; preço posterior não muda recibo |
| Cenários reproduzíveis: duas contas, vazio, lentidão, race, falha, expiração, conflito, cupom, estoque, timeout, recusa | PASS | handlers compartilhados entre demo/testes; controles /api/demo documentados |
| Estado consistente e reset dos recursos implementados | PASS | perfil faz parte de session-store e auth reset; resets de auth/details/commerce/scenario são combinados conforme README e no setup de integração; fonte canônica e testes de persistência/isolamento |
| Mocks no build demo e ativação por configuração | PASS | .env.demo, lib/env, main aguarda worker.start antes de importar app; build:api desativa mocks |
| Contrato nft.updated/order.updated, versão e identidade estável | PASS | contratos e lib/realtime; REST permanece fonte de verdade; subscriptions autenticadas e cleanup |
| Transporte entre abas, atomicidade entre abas | NOT TESTED | não garantidos pela simulação local; limites documentados; não equivale a backend real |

## Critérios eliminatórios — validação individual

As linhas formulam o requisito positivo necessário para evitar cada eliminação.

| Critério | Status | Evidência e limite |
| --- | --- | --- |
| Uso efetivo de toda a stack obrigatória | PASS | imports/configuração e fluxos de rede executados, não só dependências instaladas |
| Fluxos principais funcionais, além de telas estáticas | PASS | catálogo/detalhe/compra/conta são formulários e operações reais via MSW; perfil/avatar/senha foram concluídos e testados no PR #11, sem placeholder |
| Confirmar compra somente após resposta da simulação | PASS | e2e/commerce observa pending/confirmed, recusa sem recibo; OrderPage só abre confirmação para confirmed recuperado via REST |
| Ausência de exposição entre usuários nos cenários exercitados | PASS | troca de identidade, favoritos/carrinho privados e pedido alheio 404; socket/token antigo descartados. Não é auditoria de segurança de produção |
| Eventos simulados atravessam cliente Socket.IO real | PASS | binding MSW/Engine.IO/WebSocket + socket.io-client nos testes; eventos invalidam REST, não chamam setters da UI |
| Testes E2E executáveis | PASS | execução completa registrada abaixo, mocks e Chromium locais; lacunas de cobertura explicitadas |

## Visual, responsividade e acessibilidade

| Verificação | Status | Evidência |
| --- | --- | --- |
| SVGs originais preservados e assets locais | PASS | prancha de 15 frames + 6 ícones; mapa em design/FRAME_MAP.md; imagens extraídas individualmente em WebP; fontes locais |
| Fidelidade integral aos SVGs | FAIL | comparação de referências e capturas: hero/composição mobile e navegação diferentes, grade sem o desencontro original, fonte IBM Plex Mono substituta, footer simplificado e formulário/resumo de checkout reorganizados; D08 adaptado com formulários separados |
| Funcionamento em 390/768/1440 | PASS | três projetos Chromium, screenshots e asserções de viewport/overflow dos E2E; layouts não usam SVG de tela inteira |
| Regressão visual início/detalhe/carrinho/pagamento | PASS | snapshots fixos versionados comparados na suíte completa; são baselines da implementação, não do design |
| Fidelidade pixel a pixel de todos os frames | NOT TESTED | sem métrica automatizada contra Figma, sem fonte original identificada; não alegada |
| Zoom real do navegador e leitor de tela | NOT TESTED | reflow 320 px não substitui zoom; teclado/semântica e Lighthouse não substituem avaliação assistiva manual |

## Execuções e Lighthouse

### Verificações funcionais finais

| Comando / verificação | Status | Resultado na SHA 18addfc |
| --- | --- | --- |
| npm run lint | PASS | ESLint sem erros, max-warnings 0 |
| npm run test | PASS | 50/50 unitários/integração, oito arquivos, 22,27 s; handlers MSW e cliente Socket.IO real |
| npm run typecheck | PASS | tsc --noEmit executado pelo build:vercel → build |
| npm run build:vercel | PASS | Vite produção/demo, 12,84 s; mocks forçados, worker e build-info gerados |
| npm run test:e2e | PASS | 162/162, 669,16 s; 54 casos por viewport 390/768/1440, zero falhas/ignorados/flaky, um worker, sem retries locais |
| Regressão visual | PASS | Comparações da suíte acima com baselines fixas, sem atualização de snapshots; não certifica fidelidade ao Figma |
| npm run test:deployment | PASS local | 12/12, 70,08 s, três viewports, zero falhas/ignorados/flaky; DEPLOYMENT_URL=http://127.0.0.1:4177 e DEPLOYMENT_EXPECTED_SHA=18addfcd42b8f25635d463b6b9e85713a0775968 |
| npm run test:deployment na URL pública | PASS | 12/12, 82,52 s, três viewports, zero falhas/ignorados/flaky/retries; https://frontend-challenge-pi-six.vercel.app e DEPLOYMENT_EXPECTED_SHA=58188fc7078755f9a627c8c69bb9fa1f6d0d1954 |

Logs em [verify.log](docs/reports/delivery/verify.log) e [deployment-local.log](docs/reports/delivery/deployment-local.log). Relatórios Playwright [HTML completo](docs/reports/delivery/playwright/index.html), [JSON completo](docs/reports/delivery/playwright-results.json) e [HTML do ensaio local](docs/reports/delivery/deployment-local/index.html), com seu results.json e anexos de metadados. Não houve falhas nesta rodada final; traces das falhas encontradas durante a implementação permanecem nas evidências das features, sem serem apresentados como falhas desta SHA.

O build foi produzido com Git limpo: [build-info.json](docs/reports/delivery/build-info.json), mocksEnabled=true, commit 18addfc e checksum do worker. Depois foram alterados apenas documentos/relatórios. Bundle principal: 520,93 kB (170,15 kB gzip); warning de chunk acima de 500 kB preservado, não suprimido. Ambiente/versões/hashes completos: [environment.json](docs/reports/delivery/environment.json). Windows x64, Node 22.18.0, Chromium do Playwright 1.64.1; mesma máquina e distribuição para os três viewports. Nenhum deploy remoto foi realizado pelo comando test:deployment.

### Lighthouse

`npm run audit:lighthouse`: PASS de execução, 12 relatórios completos. `npm run audit:check`: **FAIL (exit 1)** por performance mobile nas duas páginas. Lighthouse 12.6.1, perfis padrão mobile e desktop, três rodadas por página/perfil, build de produção servido por Vite preview local, cenário padrão completo, sem concorrência com E2E. Imagens/fontes/mocks mantidos. As pontuações abaixo não foram medidas na URL pública.

| Página / perfil | Performance: três rodadas → mediana | Accessibility | Best Practices | SEO | LCP mediano (ms) | CLS mediano | TBT mediano (ms) | Metas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Início mobile | 72 / 83 / 77 → **77** | 100 | 100 | 92 | 3196,63 | 0 | 501,27 | FAIL: P < 90 |
| Início desktop | 100 / 100 / 100 → **100** | 100 | 100 | 92 | 655,05 | 0,00009309 | 0,50 | PASS |
| Detalhe mobile | 86 / 83 / 84 → **84** | 100 | 100 | 92 | 3516,86 | 0,00322052 | 193,00 | FAIL: P < 90 |
| Detalhe desktop | 98 / 97 / 98 → **98** | 100 | 100 | 92 | 942,93 | 0,07340303 | 0 | PASS |

Todas as rodadas tiveram A=100/BP=100/SEO=92. Metas: P≥90, A≥95, BP≥95, SEO≥90. Cada métrica/categoria tem sua própria mediana de três valores, não a métrica da rodada com score mediano. [summary.json](docs/reports/delivery/lighthouse/summary.json) preserva os 12 resultados e quatro medianas; a mesma pasta contém os 12 pares HTML/JSON. [Saída do verificador](docs/reports/delivery/lighthouse-check.log) e [exit code/data](docs/reports/delivery/lighthouse-check-status.json). O summary identifica commit 18addfc e dirty=true porque documentos/relatórios foram editados depois do build limpo; indexSha256 coincide com environment.json. Nenhum código de produto/teste mudou entre build, E2E e Lighthouse.

Diagnóstico observado nos relatórios brutos, sem atribuir as notas apenas ao hardware: em home-mobile-2, `mainthread-work-breakdown` registra 1967 ms, sendo 1294 ms de avaliação de scripts; `bootup-time` aponta principalmente mount (601 ms de avaliação) e módulo MSW browser (574 ms). O LCP é a imagem emerald-ape, com 53% de Load Delay nessa rodada. Em detail-mobile-2, scripts consomem 1217 ms e o LCP da imagem tem 73% de Load Delay. O bootstrap aguarda worker.start e execução/renderização do cliente antes de descobrir o conteúdo; isso é compatível com o atraso observado, mas não isola causalidade por módulo. O relatório também aponta aproximadamente 108–110 KiB de JavaScript não utilizado nessas navegações. O bundle e o custo obrigatório dos mocks são oportunidades concretas de divisão/otimização futura; remover MSW, imagens ou funcionalidades só na auditoria não seria uma correção válida. O preload existente não demonstrou melhora garantida. CLS do detalhe desktop permanece abaixo de 0,1, mas difere do mobile; não se afirma ausência total de deslocamentos.

## Publicação e reprodução

| Requisito | Status | Evidência |
| --- | --- | --- |
| Código, lockfile, assets, mocks, testes e configuração de auditoria | PASS | arquivos versionados; instalação usa Node >=22.12 e npm |
| URL pública obrigatória | PASS | [Demonstração Vercel](https://frontend-challenge-pi-six.vercel.app/), fornecida pelo candidato após a resposta inicial de que só havia repositório; acessível via HTTPS sem login da plataforma em 18/10/2026 |
| Configuração Vercel, exclusões /api e assets, worker e mocks demo | PASS local | vercel.json/build:vercel e ensaio local com 12/12; API inexistente não recebe HTML da SPA; checksum/headers do worker e metadados conferidos |
| Aplicação publicada, fluxos, mocks, Socket.IO e refresh de rotas | PASS nos cenários executados | 12/12 Playwright públicos: worker/checksum/headers, rotas reservadas, deep links, sessão/perfil/carteiras/carrinho após refresh, preço/cotação, pedido interrompido recuperado e recibo persistido, slow/empty/error/reset |
| SHA publicada e árvore de código entregue | PASS com ressalva | build-info público informa main 58188fc; árvores Git main/develop idênticas (bd2c526ae4b049ea94324fcfb001ec076931acdb). Worker público é byte a byte igual ao blob versionado. Host informa gitDirty=true: não certifica build de checkout limpo nem equivalência de todos os artefatos |
| Lighthouse na URL pública | NOT TESTED | 12 medições Lighthouse são do build otimizado local; não foram apresentadas como métricas de rede da Vercel |
| Execução a partir de clone limpo independente | NOT TESTED | comandos executados no workspace existente com lockfile, sem backend privado; não foi feita instalação em máquina/clone separado |

Evidências públicas: [HTML](docs/reports/delivery/deployment-public/index.html), [JSON](docs/reports/delivery/deployment-public/results.json), [log](docs/reports/delivery/deployment-public.log), [metadados](docs/reports/delivery/deployment-public/build-info.json), [respostas HTTP](docs/reports/delivery/deployment-public/http-checks.json) e [comparação do worker](docs/reports/delivery/deployment-public/worker-comparison.json). Rodada iniciada em 18/10/2026 às 14:23:11 UTC. O worker público tem checksum 26171599d94d5445297303f3a1f1cedec26835ea3d0057dcfa92ec520cb35cca, igual ao blob Git/instalação MSW; a cópia local de trabalho usa CRLF e tem hash diferente, sem diferença de conteúdo normalizado. Package version 2.15.0 e integrity checksum iguais. Nenhuma falha funcional foi encontrada nesses 12 casos públicos. Eles não substituem os 162 E2E locais nem comprovam todos os cenários em outros navegadores. Deploy e merge foram realizados externamente; o agente apenas testou a URL fornecida. Persistência e eventos continuam simulados no navegador, sem servidor blockchain/Socket.IO real remoto.

## Pendências para entregar

1. Revisar a matriz e manter a evidência vinculada à SHA auditada; novas alterações exigem verificar fluxos afetados.
2. Revisar e integrar a documentação desta auditoria mediante autorização; repetir verificações afetadas se o código mudar.
3. Corrigir desvios visuais prioritários e otimizar performance mobile, preservando funcionalidades/mocks e repetindo as 12 medições.
4. Manter a URL pública acessível, repetir o smoke após cada novo deploy/SHA e investigar o gitDirty informado no ambiente remoto antes de alegar build de checkout limpo.
5. Revisar as pendências antes de considerar a entrega aprovada, mesmo com o PR #13 já mesclado externamente. Nenhum merge de PR, deploy ou release foi realizado pelo agente; integrações foram executadas externamente pelo candidato.

## Fluxo de dados

URL/ação → validação tipada → TanStack Query → Axios → handlers MSW → estado persistido da simulação → resposta → cache por parâmetros/usuário → React. Favoritos aplicam otimismo e rollback. ETH é string no transporte e bigint nos cálculos. Checkout recebe cotação, revisa, envia a chave idempotente e recupera o mesmo pedido; recibo usa snapshot REST confirmado. Socket.IO transporta identidade/versão, descarta duplicatas/antigos e invalida consultas; reconexão consulta REST. Logout/expiração limpam cache privado e encerram subscriptions antigas.
