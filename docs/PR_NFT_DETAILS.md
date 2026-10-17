## Descrição

Substitui o placeholder de NFT por detalhe funcional com galeria, seleção de edição, quantidade limitada pelo estoque e favoritos persistidos por usuário. Eventos Socket.IO reconsultam preço e disponibilidade. Branch independente de autenticação, criada de `develop` em `4d87a9d`, conforme escolha do usuário.

## Alterações realizadas

- Contratos REST de detalhe/favoritos e fixture do contrato de sessão; reaproveitamento dos NFTs e assets do catálogo.
- Galeria ampliável, edições/estoque na URL, recomendações, loading/404/erro/esgotamento e feedback acessível.
- Favoritos com atualização otimista, rollback, revalidação, isolamento por usuário e proteção contra gravação após expiração.
- Testes de rede e navegador, regressão visual e auditoria Lighthouse de início e detalhe.

## Requisitos atendidos

- [x] Detalhe direto, inexistente, edição indisponível e limite de quantidade
- [x] Favoritos via API simulada, persistência por usuário e rollback
- [ ] Fluxo integrado login → retorno → favorito (pendente dos merges independentes)
- [ ] Fidelidade integral ao design original
- [x] Responsividade em 390, 768 e 1440 px
- [x] Loading, erro, vazio/esgotamento, retry e sucesso
- [x] Labels, foco de diálogo, teclado e feedback de atualizações

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| TypeScript | `npm run typecheck` e build aprovados |
| ESLint | `npm run lint` aprovado |
| Build | Aprovado; chunk principal 515,16 kB, aviso de 500 kB preservado |
| Unitários | `npm test`: 24/24, MSW e Socket.IO real |
| Playwright | 75/75 em 3,5 min, três viewports e baselines fixas |
| Lighthouse | 12 medições; performance mediana início mobile/desktop 82/99 e detalhe 91/97; acessibilidade/boas práticas 100 e SEO 92 em todos os perfis |
| Inspeção visual | SVGs D02/M02 e três capturas inspecionados; sem sessão manual interativa adicional |

## Evidências visuais

- [Desktop](https://github.com/sergiocalazans/frontend-challenge/blob/1fdd2d8/tests/e2e/details.spec.ts-snapshots/nft-detail-chromium-desktop-win32.png)
- [Tablet](https://github.com/sergiocalazans/frontend-challenge/blob/1fdd2d8/tests/e2e/details.spec.ts-snapshots/nft-detail-chromium-tablet-win32.png)
- [Mobile](https://github.com/sergiocalazans/frontend-challenge/blob/1fdd2d8/tests/e2e/details.spec.ts-snapshots/nft-detail-chromium-mobile-win32.png)
- [Relatórios e condições de execução](https://github.com/sergiocalazans/frontend-challenge/blob/feature/nft-details/docs/NFT_DETAILS_VALIDATION.md)

## Decisões técnicas

URL → Query por NFT → Axios → handler MSW → edições/estoque e interface. Favoritos usam `['private',userId,'favorites']`, cancelam consultas concorrentes, guardam snapshot para rollback e revalidam REST. O mock revalida a sessão depois da latência; expiração durante envio é testada com resposta retida/liberada por MSW. Eventos Socket.IO invalidam o detalhe para que a API recalcule estoque e preço; não há setter de preço disparado pela UI.

## Limitações conhecidas

- Autenticação é outro PR independente. O bridge apenas consome o contrato persistido e fornece sessões de fixture; login nesta branch ainda é placeholder. Após integrar, authHandlers precisam preceder o fallback GET de sessão e deve ser testado login real seguido de favorito.
- Router, handlers, AppShell e documentação exigirão combinação das alterações de ambos os PRs, preservando proteções e layouts de cada feature. Nenhum merge realizado.
- Comprar NFT transmite a seleção na URL ao carrinho ainda em desenvolvimento. Não adiciona item nem conclui compra; a limitação aparece junto da ação.
- Miniaturas mostram recortes da mesma imagem; fonte substituta IBM Plex Mono e adaptações acessíveis documentadas. Avaliações/compartilhamento sem contrato não simulam sucesso.
- Persistência local de demonstração, sem segurança de servidor; usar apenas dados fictícios. Stock de edições é uma regra determinística do mock, não blockchain.
- **Performance do início mobile abaixo da meta ≥90:** mediana 82; LCP 2.513 ms, TBT 572 ms. Avaliação de scripts/layout e inicialização dos bundles são trabalho a otimizar; resultados completos preservados. Detalhe atinge metas na mediana (91 mobile / 97 desktop), mas há variação entre execuções.
- Chunk principal acima de 500 kB; nenhuma simplificação exclusiva para auditoria.

## Checklist

- [x] Código revisado durante implementação
- [x] Sem erros conhecidos de tipagem
- [x] Testes finais e auditoria concluídos, com meta mobile do início pendente
- [x] Documentação técnica e aprendizado atualizados
- [x] Sem alterações não relacionadas
- [x] Pronto para revisão com limitações explícitas
