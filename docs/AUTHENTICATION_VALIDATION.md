# Evidências de autenticação — 17/10/2026

Resultados originais do PR #4. A validação integrada atual está em [AUTHENTICATION_INTEGRATION.md](AUTHENTICATION_INTEGRATION.md). A correção posterior de concorrência entre abas e sua validação mais recente constam em [AUTHENTICATION_SESSION_FIX.md](AUTHENTICATION_SESSION_FIX.md).

Base `develop` atualizada por fetch/fast-forward para `4d87a9d`; working tree inicialmente limpo. Branch `feature/authentication`. Sem merge de features.

- `npm run typecheck`: aprovado, também integrado ao build final.
- `npm run lint`: aprovado. Primeira rodada encontrou export de hook junto de componentes e script temporário de renderização; hook movido para API e script temporário próprio removido. Regras mantidas.
- `npm run build`: aprovado; chunk principal 519,97 kB / 169,71 kB gzip. Aviso de 500 kB preservado.
- `npm test`: 21/21, 8,09 s. Primeira rodada 19/21 por URL relativa no ambiente Node; baseURL de teste corrigida, sem alterar API/browser.
- Testes específicos de autenticação: 15/15, 1,1 min nos três viewports. Primeira rodada interrompida após timeouts: seletores exatos não consideravam o asterisco do label e o guard perdia o destino ao rerenderizar durante a navegação. Seletores passaram a usar nome acessível/label correto; destino capturado por montagem do guard. [Trace inicial preservado](https://github.com/sergiocalazans/frontend-challenge/blob/7403362/docs/reports/authentication/initial-failure/trace.zip).
- Suíte completa final: **69/69 em 3,5 minutos**, com atualização intencional das novas telas e da conta autenticada/rodapé corrigido. [HTML completo](https://github.com/sergiocalazans/frontend-challenge/blob/7403362/docs/reports/authentication/playwright-full/index.html).
- Conferência visual seguinte, baselines fixas: **9/9 em 41,7 s**. [HTML visual](https://github.com/sergiocalazans/frontend-challenge/blob/7403362/docs/reports/authentication/playwright-visual/index.html). Nenhum timeout, retry ou tolerância visual foi ampliado.

SVGs D06/D07 e M05/M06 rasterizados e inspecionados, originais inalterados. As seis capturas de login/cadastro foram inspecionadas. Labels, explicação das ações auxiliares indisponíveis e botão de retorno são adaptações. Mobile sem header/footer/nav inferior nas telas de acesso; desktop com catálogo real sob Dialog. Capturas de página inteira mostram o overlay limitado ao viewport, conforme seu comportamento fixo; não indicam overlay no meio da página durante uso.

## Lighthouse

`npm run audit:lighthouse`, Lighthouse 12.6.1, Node 22.18.0, Windows, Chromium do Playwright 1.64.1. Build de demonstração com mocks/imagens/fontes ativos; três medições mobile e três desktop no início `/`, resumo às 21:24:23 UTC. Script herdado ainda rotula `scope` como initial shell, embora a página já seja o catálogo. Login não é página exigida na auditoria do desafio; detalhe será auditado na próxima branch.

| Mediana | Mobile | Desktop |
| --- | --- | --- |
| Performance | 94 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 92 | 92 |
| LCP | 2.328 ms | 659 ms |
| CLS | 0 | 0,000093 |
| TBT | 228 ms | 14 ms |

Notas de performance mobile: 94/93/94; desktop: 100/100/100. Todas as metas atingidas nesta execução. Não se atribui a diferença para o resultado anterior do catálogo a uma otimização específica: bundle cresceu e ambiente/tempos variam. [Todas as medições](https://github.com/sergiocalazans/frontend-challenge/blob/7403362/docs/reports/authentication/lighthouse/summary.json); seis pares HTML/JSON preservados. Somente espaços em linhas vazias dos HTML foram normalizados para diff-check.

Cobertura: grupo 3; partes dos grupos 11/12; catálogo e Socket.IO herdados permanecem exercitados. Não representa cobertura dos 12 grupos completos. Checkout, perfil, carteiras e pedidos ainda são placeholders protegidos; preservação de carrinho em login e autenticação junto de favoritos serão verificadas quando integradas às respectivas features. Dados privados futuros devem respeitar o contrato de cache/cleanup documentado.
