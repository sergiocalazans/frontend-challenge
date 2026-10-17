# Validação do catálogo

Data: 17/10/2026. Windows, Node 22.18.0, Playwright 1.64.1. Branch `feature/nft-catalog`, criada de `develop` atualizado por fast-forward para `adc798c` após fetch. Working tree inicial limpo; nenhum trabalho anterior foi descartado. Não houve merge desta feature.

## Verificações e ocorrências

- Typecheck aprovado após corrigir tipagem estrita de índices/uniões e dos parâmetros opcionais nos casos de teste; nenhuma regra de TypeScript foi relaxada.
- ESLint aprovado. Uma execução também leu os bundles minificados extraídos temporariamente do trace e reportou erros nesses arquivos gerados; a pasta temporária de inspeção foi removida e o lint repetido sem alterar suas regras. O trace original foi preservado.
- Build otimizado aprovado. Chunk principal: 514,43 kB / 168,01 kB gzip; permanece aviso acima de 500 kB. O novo drawer compartilha primitivas Radix com o catálogo; o laboratório continua carregado sob demanda. O limite de aviso não foi aumentado.
- Vitest: 18/18 aprovados no build final, 9,13 s. Cobertura de filtros combinados, paginação, ordem estável, precisão de 18 casas, 400, falha/recuperação, respostas fora de ordem e cliente Socket.IO real com duplicatas/antigos/cleanup.
- Primeira rodada Playwright com atualização intencional de snapshots: 53/54. Falhou o POST de configuração do cenário race, com `net::ERR_FAILED`, antes de testar cancelamento. O mesmo caso passou em tablet/mobile. Causa definitiva não estabelecida; [trace](reports/catalog/initial-failure/trace.zip) e [captura](reports/catalog/initial-failure/test-failed-1.png) preservados.
- Rodada seguinte com baselines fixas: 54/54 aprovados em 1,7 minuto; sem aumentar timeout, retries ou tolerância visual. Incluiu falha de conexão MSW e recuperação por retry.
- Após reforçar a verificação de página ativa única, uma rodada com dois workers teve 52/54: dois timeouts no carregamento inicial mobile. Uma captura já mostra dados após o timeout; outra ainda mostra bootstrap vazio. As evidências estão em `reports/catalog/parallel-failures/`. Isso não demonstrou erro de filtro/precisão; a causa definitiva da lentidão não foi estabelecida.

O runner passou a usar um worker por padrão para reduzir contenção entre processos Chromium no ambiente local. Todos os casos, viewports, timeouts, retries e critérios de screenshot foram mantidos. O teste de respostas concorrentes continua criando requisições sobrepostas no mesmo contexto; a mudança não serializa essas requisições de negócio.

**Execução final:** `npm run test:e2e`, 54/54 aprovados em 2,1 minutos com um worker e baselines fixas. Inclui a asserção de página ativa única. [Relatório HTML final](reports/catalog/playwright/index.html). Os resultados anteriores permanecem registrados; uma rodada aprovada não elimina o risco de intermitência do ambiente.

As execuções usaram permissão para iniciar preview/Chromium e acessar o cache temporário Vitest, conforme limitações do sandbox já encontradas nas features anteriores.

## Evidências visuais

Recortes D01 e M01 foram rasterizados com Sharp a partir da prancha SVG original e inspecionados, sem modificar os SVGs. As capturas do catálogo foram comparadas à referência quanto a paleta, imagens, sidebar e grade. As seis capturas atualizadas (início e laboratório nos três viewports) foram inspecionadas. O select de cenários do laboratório ficou mais largo para acomodar as novas opções; seu catálogo continua com quatro itens.

| Viewport | Catálogo | Laboratório |
| --- | --- | --- |
| 1440 px | [Captura](../tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-desktop-win32.png) | [Captura](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-desktop-win32.png) |
| 768 px | [Captura](../tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-tablet-win32.png) | [Captura](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-tablet-win32.png) |
| 390 px | [Captura](../tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-mobile-win32.png) | [Captura](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-mobile-win32.png) |

As capturas de página inteira mostram a navegação inferior fixa na posição do viewport inicial. Isso não representa um elemento no meio do documento durante a rolagem. Playwright verifica ausência de overflow horizontal. Os desvios de design e adaptações acessíveis constam em [CATALOG.md](CATALOG.md); não se declara fidelidade integral.

## Cobertura aplicável

- Grupo 1: busca, combinação categoria/rede/faixa, ordenação, página, refresh e histórico; testes REST confirmam filtros antes da paginação, desempate e ordem de conclusão de respostas.
- Grupo 11: controles nativos com labels, validação associada ao campo e navegação/foco do drawer via Radix; a suíte herdada cobre teclado e movimento reduzido.
- Grupo 12: skeletons com latência, resultado vazio, falha HTTP, falha de conexão e nova tentativa. Cancelamento de consulta anterior é observado no navegador.
- Tempo real no catálogo: POST de demonstração → MSW → Socket.IO Client → reconsulta REST. Um NFT sai do filtro quando o preço ultrapassa o máximo; não há setter de dados na UI.
- Navegação ao detalhe verifica somente o link/rota existente. Detalhe funcional, sessão, favoritos, carrinho, checkout e a cobertura dos demais grupos continuam pendentes. Lighthouse do detalhe também depende dessa feature.

## Lighthouse no build de produção

`npm run audit:lighthouse`: seis medições concluídas em 17/10/2026, resumo às 20:57:41 UTC, Lighthouse 12.6.1, início `/` com cenário padrão, fontes, imagens e mocks habilitados. O campo `scope` do script herdado ainda diz “Initial shell”; nesta execução a página medida já é o catálogo. Não representa auditoria de todas as telas.

| Mediana de três execuções | Mobile | Desktop |
| --- | --- | --- |
| Performance | **82** | 100 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 92 | 92 |
| LCP | 2.406 ms | 647 ms |
| CLS | 0 | 0,000093 |
| TBT | 588 ms | 19 ms |

Performance mobile foi 70/96/82: **a meta ≥90 do CHALLENGE.md não foi atingida na mediana**. A terceira execução atribui 800 ms à avaliação de scripts, 691 ms a estilo/layout e 291 ms a garbage collection; a maior tarefa do chunk de montagem dura 433 ms. O relatório também aponta aproximadamente 34 kB transferidos de JavaScript não utilizado no chunk MSW. Esses dados apontam trabalho de inicialização a otimizar, mas não isolam uma causa única para a variabilidade. Não foram removidos mocks nem escolhida apenas a execução mais rápida para melhorar a nota.

Otimização da inicialização e nova auditoria mobile permanecem pendentes; essa limitação deve ser considerada na revisão. [Resumo com todas as medições](reports/catalog/lighthouse/summary.json), [mobile 3](reports/catalog/lighthouse/mobile-3.html), [desktop 3](reports/catalog/lighthouse/desktop-3.html). Os seis pares HTML/JSON estão preservados. Apenas linhas em branco contendo espaços nos HTML foram normalizadas para `git diff --check`; métricas e JSON não foram alterados.
