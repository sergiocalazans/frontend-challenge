## Descrição

Amplia a auditoria de regressão com fluxo de revisão/recibo por teclado, falha de conexão MSW, carteira preenchida e reflow. Corrige foco da revisão após commit do React e o link mobile autenticado. Adiciona relatório JSON e verificador estrito das medições/metas Lighthouse.

Branch `feature/e2e-tests`, nome corrigido conforme a solicitação mais recente do candidato, criada de develop b1ad9f1. Este PR é independente do [PR #9 de realtime](https://github.com/sergiocalazans/frontend-challenge/pull/9). Sua integração não foi executada nem presumida. Nenhum merge automático.

## Alterações realizadas

- E2E de teclado, rede e carteira nos três viewports; três baselines novas de carteiras e atualização intencional do rótulo Perfil na conta mobile.
- Ref/effect garantem foco na seção revisada após o DOM ser inserido, substituindo requestAnimationFrame no callback da mutation.
- Navegação mobile usa Perfil para sessão autenticada e Entrar para visitante.
- `npm run verify` encadeia lint, unitários, build/typecheck e Playwright com falha imediata.
- `audit:check` exige 12 medições e medianas consistentes, sem reduzir metas; resumo registra commit/dirty e hash do index construído.
- Preload do chunk principal antecipa download/compilação durante MSW startup, sem executá-lo antes do interceptor; HTML validado e JavaScript preservado.
- Matriz dos 12 grupos com lacunas explícitas, relatórios e LEARNING.

## Requisitos atendidos

- [x] E2E por contratos MSW e Socket.IO público existente
- [x] Regressão visual nos três viewports, sem flexibilizar comparações
- [x] Verificação de teclado, feedback de erro, reflow e persistência
- [x] Lighthouse com três medições por página/perfil e verificação de metas
- [ ] Cobertura integral do grupo 8 — perfil/avatar/senha não implementados
- [ ] Grupo 10 integrado — eventos privados e reconexão estão no PR #9
- [ ] Fidelidade integral ao SVG — adaptações anteriores documentadas

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| `npm run verify` antes do preload | Aprovado, exit 0: lint, unitários, build/typecheck e E2E em 3a88db1 |
| Unitários | 42/42, seis arquivos, 18,38 s |
| Build/typecheck | Aprovados, build 12,16 s; warning >500 kB preservado |
| Playwright completo antes do preload | 144/144, 10,8 min, 48 casos por viewport, zero skips/flaky/retries locais; baselines fixas |
| Após preload | Build/typecheck (18,14 s) e lint aprovados; 36/36 cenários relevantes, 139,17 s, zero skip/flaky/falhas |
| Novos cenários + composição visual de conta | 12/12, 55,5 s, três viewports |
| Verificador de orçamento | Reprovou relatório histórico 71/88; aprovou resumo válido e possui testes de entradas inválidas |
| Lighthouse antes do preload | 12 medições: performance início mobile/desktop 82/100, detalhe 78/97; audit:check reprovou corretamente; evidências preservadas |
| Lighthouse após preload | 12 medições: início mobile/desktop 67/85, detalhe 85/98; A11y/BP 100 e SEO 92. audit:check exit 1; metas de performance reprovadas |

A primeira rodada nova teve 8/9: falha real de foco no tablet. A implementação foi corrigida sem alterar a asserção ou aumentar timeout. [Matriz, falhas, condições e resultados](https://github.com/sergiocalazans/frontend-challenge/blob/feature/e2e-tests/docs/E2E_AUDIT.md).

## Evidências visuais

D09 original reinspecionado. Baselines de carteiras 390/768/1440 foram inspecionadas; alteração intencional de Perfil foi conferida no mobile. [Playwright HTML e capturas](https://github.com/sergiocalazans/frontend-challenge/tree/feature/e2e-tests/docs/reports/audits/playwright-final), [JSON da execução](https://github.com/sergiocalazans/frontend-challenge/blob/feature/e2e-tests/docs/reports/audits/playwright-results.json). Abra localmente com `npx playwright show-report docs/reports/audits/playwright-final`.

![Carteiras desktop](https://github.com/sergiocalazans/frontend-challenge/blob/e8c9e4f/tests/e2e/audits.spec.ts-snapshots/wallets-chromium-desktop-win32.png?raw=true)

![Carteiras mobile](https://github.com/sergiocalazans/frontend-challenge/blob/e8c9e4f/tests/e2e/audits.spec.ts-snapshots/wallets-chromium-mobile-win32.png?raw=true)

## Decisões técnicas

Eventos e negócios continuam na camada de rede existente. O teste de teclado observa foco e operação, sem timers artificiais. O verificador recalcula medianas e valida rodadas/métricas antes de comparar as metas originais; entradas sintéticas de seus unitários não são medições. SHA/hash identificam a versão medida. A matriz distingue cobertura parcial e integração pendente, sem testes ignorados para simular conclusão.

## Limitações conhecidas

- Perfil/avatar/senha e deploy público ainda pendentes; o desafio inteiro não está concluído.
- Realtime privado não foi incorporado; após ambos os merges, repetir a regressão integrada.
- Validação local Windows/Chromium; reflow de 320 px não comprova zoom real nem equivalência visual entre sistemas operacionais.
- Simulação local, uma rede por pedido e persistência entre abas não transacional permanecem.
- Warning de bundle >500 kB preservado; variação Lighthouse será reportada com todas as rodadas.

## Checklist

- [x] Código e baselines revisados
- [x] Verificações finais concluídas, com reprovações de performance explícitas
- [x] Evidências reais versionadas para publicação com o PR
- [x] LEARNING, README e arquitetura atualizados
- [x] Sem merge ou deploy
- [x] Pronto para revisão; não representa aprovação integral do desafio
