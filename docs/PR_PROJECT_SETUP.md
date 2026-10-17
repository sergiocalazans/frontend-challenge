## Descrição

Configura a base executável do Jungle Gaming NFT Marketplace e o design system Kurio a partir da análise dos SVGs. O catálogo demonstrativo e a biblioteca de componentes exercitam a stack antes das features de compra e conta.

## Alterações realizadas

- React + TypeScript strict + Vite; TanStack Router/Query, Axios, Tailwind e primitivas shadcn/ui/Radix.
- Tokens, fonte local provisória, quatro imagens extraídas dos SVGs, layout e navegação responsivos, componentes e estados acessíveis em `/design-system`.
- MSW em desenvolvimento/build demo; REST tipado e cliente Socket.IO real com versionamento de eventos, reconciliação e cleanup.
- Vitest, Playwright em 390/768/1440 px, seis baselines e Lighthouse.
- README, ARCHITECTURE, LEARNING e validação com relatórios versionados.

## Requisitos atendidos

- [x] Requisitos aplicáveis do CHALLENGE.md à configuração inicial e design system
- [ ] Fidelidade ao design original integral (identidade preservada; composições ainda simplificadas)
- [x] Responsividade da base em 390, 768 e 1440 px
- [x] Tratamento de loading, erro e vazio
- [x] Acessibilidade da base: labels, foco, teclado, modal e movimento reduzido

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| Instalação | `npm install`: sucesso |
| TypeScript | `npm run typecheck`: sucesso |
| ESLint | `npm run lint`: sucesso |
| Build | `npm run build`: sucesso; aviso de chunk de aproximadamente 534 kB |
| Integração | `npm test`: 4 aprovados, REST/MSW e Socket.IO real |
| Playwright | `npm run test:e2e`: 21 aprovados; sem atualizar baselines |
| Regressão visual | Seis baselines geradas, inspecionadas e comparadas |
| Lighthouse | 3 medições por perfil do início: mobile 93/100/100/92; desktop 100/100/100/92 |
| Whitespace | `git diff --check` e `git diff --cached --check`: sucesso |
| Testes manuais | Inspeção visual das capturas; interações verificadas por E2E |

Medianas na ordem performance/acessibilidade/boas práticas/SEO. Resultados completos, falhas iniciais e correções em [docs/VALIDATION.md](docs/VALIDATION.md).

## Evidências visuais

![Início desktop](https://raw.githubusercontent.com/sergiocalazans/frontend-challenge/feature/project-setup/tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-desktop-win32.png)

As outras cinco capturas estão em `tests/e2e/setup.spec.ts-snapshots/`. Relatórios HTML/JSON Lighthouse e relatório Playwright estão em `docs/reports/`.

## Decisões técnicas

- Marca KURIO preservada dos SVGs; IBM Plex Mono é substituição documentada, pois a fonte original não foi identificada.
- Mocks iniciam antes de importar o app/Socket.IO. Componentes não contêm fixtures de negócio.
- Query separa cache por busca e transmite AbortSignal ao Axios. Valores ETH permanecem strings.
- Vitest usa a distribuição real de navegador do Socket.IO para interceptação do WebSocket pelo MSW.
- Lighthouse inicia Chromium via Playwright, após falha do chrome-launcher no Windows.
- A branch e o trabalho local já existiam. O candidato autorizou incorporá-los. Após fetch, develop permaneceu sincronizada com origin/develop em 72138a3; a feature descende dela. O commit documental anterior foi preservado.

## Limitações conhecidas

Esta feature não entrega o desafio completo. Sessão, compra, detalhe funcional, carrinho, pedidos, favoritos, perfil e carteiras são próximos passos, com rotas de preparação explícitas. Não há autenticação ou pagamento aparentando sucesso. Cobertura dos 12 grupos e auditoria do detalhe permanecem pendentes e estão mapeadas na validação.

Hero, catálogo e footer são composições iniciais; baselines não certificam fidelidade integral ao Figma. Bundle acima de 500 kB, robots.txt ausente e otimização adicional de imagens/código estão documentados. Não houve deploy nem merge.

## Checklist

- [x] Código revisado
- [x] Sem erros conhecidos de tipagem
- [x] Testes aplicáveis executados
- [x] Documentação atualizada
- [x] Sem alterações não relacionadas à base e suas referências
- [x] Pronto para revisão da configuração inicial
