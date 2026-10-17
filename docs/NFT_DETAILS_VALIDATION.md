# Evidências de detalhes — 17/10/2026

Branch `feature/nft-details`, base `develop` atualizada por fetch/fast-forward em `4d87a9d`, working tree inicialmente limpo. PR independente de autenticação; nenhum merge executado.

## Verificações

Primeira verificação de tipos interrompeu o build por contrato de search obrigatório no link de carrinho e esquema de fixture de sessão que não declarava hash/salt. Ambos foram tipados explicitamente; TypeScript strict permaneceu ativo, sem casts para unknown ou alteração de regras.

Rodada intermediária: build aprovado, 23/23 unitários e 18/18 E2E específicos nos três viewports (2,2 min). Depois foram adicionados o teste de expiração durante mutation e ajustes visuais comparados aos SVGs: miniaturas sobre a imagem no mobile e remoção da navegação fixa que interferia no conteúdo. Segunda rodada: 24/24 unitários (10,50 s) e 21/21 E2E específicos (1,6 min), com atualização intencional das três baselines do detalhe. [Relatório específico](reports/nft-details/playwright-specific/index.html).

O cenário de expiração segura a resposta da mutation no MSW, espera a requisição HTTP ser observada, expira a sessão e libera a resposta. Verifica remoção do token, estado privado limpo e ausência de escrita tardia ao entrar de novo com a fixture. Não usa sleep arbitrário nem setters de Query para fingir resultado.

**Execução final:** `npm run lint`, `npm run build` (inclui typecheck) e `npm test` aprovados; 24/24 unitários em 8,61 s. `npm run test:e2e`: **75/75 em 3,5 minutos**, baselines fixas nos três viewports. [HTML completo](reports/nft-details/playwright-full/index.html). Nenhum timeout, retry ou tolerância visual foi ampliado; não houve falha E2E nesta feature. Chunk principal: 515,16 kB / 168,34 kB gzip; aviso acima de 500 kB mantido. Detalhe carregado sob demanda em chunk de 14,16 kB / 5,23 kB gzip.

## Lighthouse

`npm run audit:lighthouse`: 12 medições em 17/10/2026, resumo às 21:42:29 UTC. Lighthouse 12.6.1, Node 22.18.0, Windows, Chromium do Playwright 1.64.1. Build de demonstração com cenário padrão, imagens, fontes e mocks ativos; sem testes de navegador concorrentes durante a auditoria. Script versionado mede início e detalhe, três vezes em cada perfil.

| Mediana de três | Início mobile | Início desktop | Detalhe mobile | Detalhe desktop |
| --- | --- | --- | --- | --- |
| Performance | **82** | 99 | 91 | 97 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best Practices | 100 | 100 | 100 | 100 |
| SEO | 92 | 92 | 92 | 92 |
| LCP (ms) | 2.513 | 727 | 2.792 | 1.034 |
| CLS | 0 | 0,000093 | 0,003221 | 0,074120 |
| TBT (ms) | 572 | 90 | 238,5 | 39,5 |

Performance por execução: início mobile 67/93/82, desktop 100/99/87; detalhe mobile 91/92/84, desktop 98/96/97. **Início mobile não atinge a meta ≥90 na mediana**. Detalhe atinge todas as metas na mediana. Variação preservada integralmente, sem selecionar somente a execução mais rápida. Inicialização inclui bundle principal acima de 500 kB e MSW (~307 kB); avaliação de scripts e layout geram tarefas longas. Na segunda medição mobile do início, o relatório atribui 856 ms à avaliação de scripts, 379 ms a estilo/layout e uma tarefa de montagem de 245 ms. Isso identifica trabalho inicial a otimizar, mas não demonstra uma causa única da oscilação nem mede contenção do sistema operacional. Otimização da inicialização do início e nova auditoria permanecem pendentes.

[Resumo de todas as execuções](reports/nft-details/lighthouse/summary.json), [início mobile 3](reports/nft-details/lighthouse/home-mobile-3.html), [detalhe mobile 1](reports/nft-details/lighthouse/detail-mobile-1.html). Doze pares HTML/JSON preservados. Somente espaços em linhas vazias dos HTML foram normalizados para diff-check; JSON e métricas inalterados.

## Design e limites de cobertura

SVGs D02/M02 lidos/rasterizados e inspecionados. As três capturas do detalhe foram inspecionadas; tablet/mobile foram conferidos novamente após ajustes. Comparação limitada à composição, imagens, paleta, galeria e controles; fonte substituta, radios, miniaturas e mensagens acessíveis são adaptações documentadas. Não se declara fidelidade integral nem uma sessão manual interativa adicional.

Cobertura aplicável: grupo 2, grupo 4 e partes dos grupos 10/11/12. MSW recebe REST de detalhe/favoritos; Socket.IO Client real recebe nft.updated e provoca reconsulta REST. Duplicatas/antigos/cleanup seguem os testes herdados do helper de tempo real. Estoque total e edições são coerentes; quantidade, inexistente, loading, HTTP 503, retry, favorito otimista, rollback, persistência e isolamento têm testes.

Login é contrato/fixture nesta branch; **não foi executado teste integrado de login real seguido de favorito**, pendente dos merges independentes autorizados. Carrinho/checkout/compra não fazem parte desta entrega: Comprar apenas transmite a seleção ao placeholder, sem declarar inclusão ou transação. Não se afirma cobertura dos 12 grupos completos do desafio.
