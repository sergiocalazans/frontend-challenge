# Auditoria de E2E, regressão visual e Lighthouse

Registro histórico da branch independente. Os PRs #9 e #10 já foram integrados em develop; a auditoria conjunta, incluindo perfil e preparação Vercel, está em [DELIVERY_REPORT.md](../DELIVERY_REPORT.md). Os resultados abaixo continuam vinculados às versões indicadas neste documento.

## Base e plano

Branch `feature/e2e-tests`, nome corrigido conforme a solicitação mais recente do candidato, criada de `develop` b1ad9f1 com working tree limpo. O PR #8 já estava integrado. [PR #9 de realtime](https://github.com/sergiocalazans/frontend-challenge/pull/9) é independente e não foi incorporado aqui, por escolha explícita do candidato. Não houve merge pelo agente. Resultados desta branch não comprovam a integração futura dos dois PRs.

1. Acrescentar E2E de teclado, falha de conexão e carteira preenchida/reflow.
2. Versionar três baselines de carteira, mantendo as existentes e os critérios de comparação.
3. Exportar Playwright HTML/JSON e validar completude, medianas e metas Lighthouse por CLI.
4. Executar verificações, registrar falhas reais, matriz de cobertura e limitações.

## Novos testes e correções

`tests/e2e/audits.spec.ts` verifica revisão/confirmar/recibo por teclado, foco no título, Tab até continuar e retorno com Escape; carteira persistida e reflow de 320 px; falha de conexão MSW que preserva o carrinho e bloqueia checkout até retry. Setup reutiliza contratos MSW, login e carteiras existentes. Comparação visual usa fontes carregadas, motion desativado, dados determinísticos e screenshots completas, sem máscaras novas nem aumento de tolerância.

Referência D09 original reinspecionada e comparada às capturas funcionais. Desktop preserva sidebar e formulário em duas colunas; mobile usa uma coluna. Adaptações do SVG já documentadas permanecem: fonte substituta, links fora de escopo omitidos, ENS opcional e footer compartilhado. Não se declara fidelidade integral. O teste de 320 px é reflow, não comprovação de zoom real do navegador.

Rodada inicial dos 9 novos E2E: **8/9**, 51,9 s. No tablet, a seção revisada aparecia, mas não recebia foco. O callback da mutation chamava requestAnimationFrame antes de o React necessariamente ter inserido a seção. A correção usa ref e useEffect após commit, sem mudar o timeout ou a asserção. Trace/captura em `docs/reports/audits/initial-failure`. A inspeção de carteira também encontrou o rótulo Entrar na navegação mobile autenticada: agora usa Perfil e aponta para a rota de conta. O teste verifica o link; a baseline mobile correspondente é atualizada intencionalmente.

## Comandos e fontes de evidência

- `npm run verify`: lint → unitários → build (inclui typecheck) → Playwright; interrompe no primeiro comando que falhar. Não executa deploy ou merge.
- `npm run test:visual`: apenas casos @visual, com baselines fixas. Para mudar baseline, revisão visual explícita é necessária; não é parte de verify.
- `npm run test:e2e`: relatório HTML e JSON (`reports/playwright/results.json`), com traces e screenshots de falhas. Após a validação final, cópias são publicadas em `docs/reports/audits`.
- `npm run audit:lighthouse`: três medições por página/perfil no build demo com imagens/fontes/mocks. O resumo registra Git SHA/dirty e SHA-256 do index de dist para identificar o build, além de versões/ambiente.
- `npm run audit:check`: exige 12 medições, três rodadas distintas por grupo, quatro medianas, scores/métricas válidos e medianas consistentes. Falha com exit 1 abaixo de performance 90, acessibilidade 95, boas práticas 95 ou SEO 90. Aceita caminho opcional: `node scripts/check-lighthouse.mjs caminho/summary.json`.

O verificador foi exercitado contra os resultados históricos do carrinho (exit 1: 71/88 mobile) e contra o resumo válido de realtime (exit 0). São testes do verificador, não novas medições desta branch. Unitários adicionais usam entradas sintéticas explicitamente identificadas para conferir aprovação, reprovação, rodadas ausentes, medianas adulteradas e métricas inválidas; essas fixtures não são relatórios de performance.

## Matriz dos 12 grupos do CHALLENGE

| Grupo | Evidência na base desta branch | Situação |
| --- | --- | --- |
| 1 Busca/filtros/ordenação/paginação/histórico | catalog.spec.ts: URL, filtros combinados, precisão e respostas fora de ordem | Coberto |
| 2 Detalhe direto/inexistente | details.spec.ts: seleção, limites, galeria e 404 | Coberto |
| 3 Cadastro/login/expiração/logout/troca | auth.spec.ts: formulários reais, refresh, contexto e outra identidade | Coberto |
| 4 Favoritos/rollback | details.spec.ts e auth.spec.ts: otimismo, falha, persistência e isolamento | Coberto |
| 5 Carrinho/cupom/persistência/merge | commerce.spec.ts: visitante, login real, quantidades, remoção, cupom e outra conta | Coberto |
| 6 Compra completa | commerce.spec.ts: catálogo/detalhe → carrinho → checkout → REST confirmed → recibo | Coberto |
| 7 Recusa/clique duplo/timeout | commerce.spec.ts e unit/commerce.test.ts: mesma chave, reserva/liberação e recibo imutável | Coberto |
| 8 Perfil/avatar/senha/carteiras | commerce.spec.ts e audits.spec.ts: carteiras validadas/editadas e persistidas; perfil/avatar/senha sem implementação | **Parcial** |
| 9 Preço/disponibilidade em checkout | commerce.spec.ts: Socket.IO público invalida revisão e bloqueia estoque insuficiente | Coberto |
| 10 Duplicatas/ordem/desconexão/pedido | network.test.ts: versões NFT; commerce.spec.ts: pending/refresh por REST. Canais privados e interrupção estão no PR #9 | **Integração pendente** |
| 11 Teclado/foco/formulários | audits.spec.ts, design-system.spec.ts, details.spec.ts e commerce.spec.ts | Coberto nos fluxos executados |
| 12 Loading/erro/retry | setup/catalog/details/commerce/audits.spec.ts: slow, erro HTTP e falha de conexão MSW | Coberto |

A matriz é uma avaliação de cobertura, não uma alegação de que todos os requisitos do desafio foram concluídos. Não foram criados testes ignorados nem asserções de placeholder para fingir cobertura de perfil. O PR #9 foi integrado externamente em develop (`eff91e3`), mas esta branch preserva a base independente e seus resultados não comprovam essa integração. A auditoria final será executada separadamente em develop. O candidato confirmou que não existe deploy público; o PR final deve permanecer rascunho, com pendências explícitas.

## Resultados desta branch

Ambiente: Windows, Node 22.18.0, Vite 7.3.7, TypeScript 5.9.3, Vitest 4.1.12, Playwright 1.64.1, Lighthouse 12.6.1, MSW 2.15.0 e Socket.IO Client 4.8.4. Chromium instalado pelo Playwright; um worker, zero retries locais, viewports 1440×1000/768×1024/390×844. Regressão completa em `e8c9e4f`/`3a88db1`; preload posterior em `5abc922`, com verificações adicionais descritas abaixo. O último commit registra documentação e evidências.

Após a correção: 12/12 cenários focados, 55,5 s. As três novas capturas de carteiras foram inspecionadas; a atualização de navegação alterou somente wallet mobile e a composição de conta mobile existente. Nenhuma máscara, tolerância ou retry foi adicionado. Na execução de `npm run verify`, lint aprovado, unitários **42/42** em 18,38 s (seis arquivos), build/typecheck aprovados em 12,16 s. Bundle principal 521,59 kB / 170,42 kB gzip; MSW 323,41 kB / 105,79 kB gzip. Warning >500 kB preservado.

`npm run verify` terminou com exit 0: Playwright final **144/144**, 10,8 min, 48 casos por viewport, zero retries locais e baselines fixas. Inclui os 9 novos casos de auditoria. Nenhum teste ignorado ou flaky. Relatório HTML completo em `docs/reports/audits/playwright-final`, JSON em `docs/reports/audits/playwright-results.json`; abra com `npx playwright show-report docs/reports/audits/playwright-final`. Lighthouse antes/depois do ajuste de carregamento está registrado a seguir.

## Correção de carregamento após a auditoria

Primeira auditoria final (código 3a88db1): medianas performance início mobile/desktop 82/100, detalhe 78/97; A11y e boas práticas 100, SEO 92. `npm run audit:check` reprovou corretamente com exit 1. Todos os 12 HTML/JSON e o resumo estão em `docs/reports/audits/lighthouse-before-preload`.

Início mobile, rodada 2: bootup atribuiu 952,29 ms ao mount e 723,01 ms ao browser/MSW; 60% do LCP da imagem hero foi espera para iniciar o carregamento. Não se atribui toda a variação ao código ou hardware sem controle experimental. A aplicação só começava a baixar o mount depois de concluir worker.start. O plugin Vite preload-application adiciona modulepreload do chunk de entrada construído para antecipar download/compilação durante essa espera. A execução continua depois de ativar MSW; Socket.IO não pode capturar WebSocket antes do interceptor. O hint vale para todas as rotas/builds, sem caminho especial para Lighthouse, sem remover módulos, dados, fontes ou imagens.

A mudança exige nova validação do cliente Socket.IO, interfaces e medições completas. O relatório anterior permanece como histórico, sem substituir números nem selecionar rodadas favoráveis.

A inspeção do primeiro HTML mostrou que facadeModuleId não identificava o mount: o hint não foi inserido. A rodada curta foi interrompida após 4 aprovações, sem falha de asserção, antes de medir esse ajuste sem efeito. A seleção passou a usar os módulos do chunk; o build falha se não encontrar a entrada. HTML final contém modulepreload para mount-CZR8u0j7.js e passou de 0,60 para 0,68 kB; hashes e conteúdo dos chunks JS permaneceram iguais. Build/typecheck após o hint efetivo: aprovado em 18,14 s. Após essa mudança apenas de HTML, a validação adicional cobre todos os snapshots, clientes Socket.IO e fluxo de teclado/rede; a suíte completa de 144 anterior permanece preservada e não é apresentada como repetida depois do preload.

## Resultados finais após preload

Playwright selecionado (`--grep "Socket.IO|@visual|keyboard review|MSW connection failure"`): **36/36**, 139,17 s, nenhum skip/flaky/falha, zero retries locais. Inclui todas as baselines, clientes Socket.IO públicos e fluxo de teclado/recibo/erro de rede. HTML em `docs/reports/audits/playwright-after-preload`; JSON em `playwright-after-preload-results.json`. O HTML completo de 144 casos anterior permanece separado.

Lighthouse 12.6.1, 12 medições concluídas em 18/10/2026 às 13:21:29 UTC, código `5abc922`, dirty somente por documentação/evidências; index SHA-256 `0be870c90a6b2d7eaa6898a42534aed35397c9843a45cf36d1a59a74f4da1856`. Relatórios HTML/JSON e resumo em `docs/reports/audits/lighthouse-after-preload`.

| Página/perfil | Performance (rodadas) | Mediana P/A/BP/SEO | LCP ms | CLS | TBT ms |
| --- | --- | --- | ---: | ---: | ---: |
| Início mobile | 50/85/67 | 67/100/100/92 | 3212,47 | 0 | 1052,79 |
| Início desktop | 85/30/88 | 85/100/100/92 | 1189,03 | 0,000093 | 268,50 |
| Detalhe mobile | 85/85/83 | 85/100/100/92 | 3510,46 | 0,003221 | 197,50 |
| Detalhe desktop | 98/98/97 | 98/100/100/92 | 932,74 | 0,073403 | 0 |

**FAIL de performance** em três combinações. `npm run audit:check` retornou exit 1 corretamente. O preload não demonstrou melhora nesta rodada; não se atribui melhora ao ajuste nem se substituem os números pela auditoria histórica de realtime. Alto TBT no início e descoberta/carregamento da imagem LCP continuam afetando o resultado; variabilidade do ambiente não foi isolada experimentalmente. Otimização adicional e nova medição ficam pendentes, sem reduzir as metas ou executar rodadas seletivas. Acessibilidade/boas práticas/SEO atingem as metas nas quatro medianas.

Não existe deploy público, conforme confirmação do candidato. A auditoria final e o PR develop→main solicitados em seguida devem informar essa lacuna e o perfil ausente; este PR de testes pode ser revisado independentemente, mas não certifica a entrega integral.
