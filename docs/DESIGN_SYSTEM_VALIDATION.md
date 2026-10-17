# Validação: tokens, componentes e layouts

Executada em 17/10/2026, Windows, Node 22.18.0. Branch `feature/design-system`, criada de `develop` atualizado por fast-forward até `d5cfb0d` após `git fetch origin`. Working tree inicial limpo. Não houve merge da feature.

## Verificações

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado, inclusive após adicionar os testes |
| `npm run build` | Aprovado; após divisão da rota, chunk principal 465,76 kB / 152,30 kB gzip e laboratório 71,69 kB / 23,01 kB gzip; sem aviso de tamanho |
| `npm test` | 4/4 aprovados; REST/MSW e cliente Socket.IO real |
| `npm run test:e2e -- --update-snapshots` | 36/36 aprovados; três capturas do laboratório atualizadas e três da conta criadas |
| `npm run test:e2e` — primeira verificação | 35/36 aprovados; timeout no bootstrap do catálogo no teste visual mobile |
| `npm run test:e2e` — repetição sem mudanças de testes | 36/36 aprovados, 1,3 minuto; sem atualizar baselines |
| `npm run test:e2e` — build final com rota sob demanda | 36/36 aprovados, 59,2 s; sem atualizar baselines |

O Vitest encontrou EPERM no cache temporário dentro do sandbox antes de executar testes. Foi repetido fora do sandbox com permissão e passou. Tentativas de Playwright no sandbox não disponibilizaram o preview e foram interrompidas; a execução efetiva usou permissão para preview e Chromium locais. Uma tentativa inicial de E2E também foi interrompida para aguardar o build terminar.

O timeout da primeira verificação com baselines fixas ocorreu antes de renderizar o catálogo. O trace mostra `mockServiceWorker.js` levando 3349 ms e o módulo `mount` ainda pendente quando o teste foi encerrado. Não houve mudança de timeout, retries, asserções ou tolerância visual para obter a execução seguinte. A causa definitiva não foi estabelecida; permanece risco de intermitência no bootstrap. [Trace preservado](reports/design-system/initial-failure/trace.zip) e [captura da falha](reports/design-system/initial-failure/screenshot.png).

## Evidências visuais e funcionais

As seis imagens novas/alteradas foram inspecionadas visualmente. Os recortes originais D08, D04 e M04 também foram renderizados e inspecionados. A comparação sustenta a paleta e as proporções-base; não comprova fidelidade integral das páginas, cujos fluxos continuam em preparação.

| Viewport | Laboratório | Conta |
| --- | --- | --- |
| 1440 px | [Captura](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-desktop-win32.png) | [Captura](../tests/e2e/design-system.spec.ts-snapshots/account-layout-chromium-desktop-win32.png) |
| 768 px | [Captura](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-tablet-win32.png) | [Captura](../tests/e2e/design-system.spec.ts-snapshots/account-layout-chromium-tablet-win32.png) |
| 390 px | [Captura](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-mobile-win32.png) | [Captura](../tests/e2e/design-system.spec.ts-snapshots/account-layout-chromium-mobile-win32.png) |

As três baselines da página inicial permaneceram inalteradas. A barra inferior fixa aparece na posição do viewport inicial nas capturas de página inteira; isso não representa uma barra no meio da página durante a rolagem.

Playwright verifica foco do modal/drawer, retorno ao trigger, dimensões do drawer em 390×500, associação label/ajuda/erro, recuperação do campo, shimmer com e sem movimento reduzido, navegação ativa de conta e foco no conteúdo. A conta também foi verificada em 320 px, sem overflow horizontal. A suíte herdada verifica os estados MSW, busca, quantidade e evento Socket.IO. [Relatório final HTML](reports/design-system/playwright/index.html).

Os grupos 11 e 12 do desafio recebem cobertura incremental. Os 12 grupos completos, compra/conta reais, auditoria do detalhe e regressões das telas finais continuam pendentes das features correspondentes. Testes de componentes não substituem esses fluxos. Zoom real do navegador e tecnologias assistivas não foram testados manualmente.

## Lighthouse e ajuste de carregamento

Executado `npm run audit:lighthouse` antes e depois de carregar o laboratório sob demanda. Cada rodada contém três medições por perfil da página inicial no build otimizado, cenário padrão MSW, fontes e imagens locais. Lighthouse 12.6.1, Playwright 1.64.1, Chromium headless do Playwright, Windows e Node 22.18.0. Configuração versionada em `scripts/lighthouse.mjs`: perfis padrão mobile/desktop, preview em 4175 e depuração em 9223. E2E não executou simultaneamente com Lighthouse.

| Mediana final | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 95 | 100 | 100 | 92 | 2230 ms | 0 | 205 ms |
| Desktop | 100 | 100 | 100 | 92 | 607 ms | 0,000110 | 0 ms |

As metas foram atingidas na página inicial. [Resumo final](reports/design-system/lighthouse/summary.json), [HTML mobile](reports/design-system/lighthouse/mobile-1.html) e [HTML desktop](reports/design-system/lighthouse/desktop-1.html), com os seis HTMLs e JSONs na mesma pasta.

A rodada anterior teve mediana mobile de 67, LCP 2968 ms e TBT 1595 ms; desktop 100. O relatório apontou custo de execução de scripts. A divisão real da rota reduziu o chunk principal de 536,14 kB para 465,76 kB, com laboratório separado de 71,69 kB. Não houve remoção de funcionalidades nem ajuste especial para auditoria. [Resumo anterior](reports/design-system/lighthouse-before-split/summary.json) e todos os relatórios anteriores foram preservados. Houve variação do benchmark de CPU entre medições; a diferença de pontuação não deve ser atribuída exclusivamente ao code splitting.

Permanecem oportunidades de reduzir JavaScript e o custo dos mocks. SEO 92 mantém a limitação de robots.txt da base. Não há medição do detalhe funcional, ainda não implementado. A auditoria não certifica o marketplace completo.
