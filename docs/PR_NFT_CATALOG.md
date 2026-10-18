## Descrição

Implementa catálogo com busca, filtros combinados, ordenação e paginação REST. A URL preserva o estado ao recarregar, compartilhar links e navegar pelo histórico. Branch `feature/nft-catalog`, criada do `develop` atualizado (`adc798c`).

## Alterações realizadas

- Contratos paginados, 24 fixtures determinísticas, validação REST e comparação exata de preços ETH.
- Sidebar desktop, drawer mobile, grade responsiva e estados de carregamento, vazio, erro, recuperação e sucesso.
- Cancelamento de requisições antigas e reconsulta após eventos do cliente Socket.IO real.
- Documentação técnica, aprendizado, testes e relatórios completos, incluindo falhas observadas.

## Requisitos atendidos

- [x] Requisitos funcionais aplicáveis do grupo 1 do CHALLENGE.md
- [ ] Fidelidade integral ao design original
- [x] Responsividade em 390, 768 e 1440 px
- [x] Tratamento de loading, erro e vazio
- [x] Controles acessíveis, validação e navegação por teclado

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado; também executado pelo build |
| `npm run lint` | Aprovado |
| `npm run build` | Aprovado; aviso de chunk principal 514,43 kB |
| `npm test` | 18/18 aprovados; MSW e Socket.IO real |
| `npm run test:e2e` | Execução final 54/54, 2,1 min, um worker, baselines fixas |
| `npm run audit:lighthouse` | 3 medições por perfil; performance mediana mobile 82 / desktop 100; acessibilidade 100, boas práticas 100 e SEO 92 em ambos |
| Inspeção visual | SVGs D01/M01 e seis screenshots inspecionados; não houve sessão manual interativa adicional |

Rodadas anteriores tiveram 53/54 (falha de transporte no setup), 54/54 e 52/54 (timeouts iniciais mobile). Traces preservados. O runner passou de dois para um worker; testes, timeouts, retries e tolerâncias foram mantidos. Causa definitiva da intermitência não estabelecida.

## Evidências visuais

- [Desktop 1440 px](https://github.com/sergiocalazans/frontend-challenge/blob/d51cf38/tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-desktop-win32.png)
- [Tablet 768 px](https://github.com/sergiocalazans/frontend-challenge/blob/d51cf38/tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-tablet-win32.png)
- [Mobile 390 px](https://github.com/sergiocalazans/frontend-challenge/blob/d51cf38/tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-mobile-win32.png)
- [Validação e relatórios](docs/CATALOG_VALIDATION.md), incluindo Lighthouse, HTML Playwright e traces das falhas.

## Decisões técnicas

URL → normalização tipada → chave TanStack Query → Axios com AbortSignal → handler MSW → filtros/ordenação/paginação → resposta tipada → componentes. Preços são strings decimais convertidas em BigInt para comparação; o parser de URL evita perda de precisão. Eventos Socket.IO invalidam consultas para que a API recalcule filtros e totais.

Campos de preço substituem o slider visual com validação acessível. Não são exibidas contagens de categoria sem contrato. A documentação detalha essas adaptações e o fluxo em `docs/CATALOG.md`.

## Limitações conhecidas

- **Performance mobile abaixo da meta ≥90:** mediana 82, LCP 2.406 ms e TBT 588 ms. Otimização da inicialização e nova auditoria pendentes; relatório registra 70/96/82, sem selecionar apenas a melhor execução.
- Chunk principal acima de 500 kB; mocks permanecem habilitados na auditoria.
- Fonte IBM Plex Mono substitui a fonte não identificada nos SVGs; não há declaração de fidelidade integral.
- Detalhe funcional, favoritos, sessão, carrinho, checkout e cobertura dos outros grupos ficam para suas features. O link ao detalhe usa a rota existente.
- Fixtures locais reutilizam quatro imagens; não há backend externo nesta entrega.
- Aprovação final de performance e auditoria do detalhe continuam pendentes. Nenhum merge autorizado ou executado.

## Checklist

- [x] Código revisado durante implementação
- [x] Sem erros conhecidos de tipagem
- [x] Testes aplicáveis executados
- [x] Documentação atualizada
- [x] Sem alterações não relacionadas
- [x] Pronto para revisão, com limitações explícitas
