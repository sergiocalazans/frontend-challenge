## Descrição

Complementa o design system existente com tokens centralizados, layouts de conta/compra, campos acessíveis e estados reutilizáveis. O laboratório passa a carregar sob demanda, reduzindo o chunk principal de 536,14 kB para 465,76 kB.

Branch criada de `develop` atualizado em `d5cfb0d`, com working tree inicialmente limpo. Não realiza merge ou deploy.

## Alterações realizadas

- Separa tokens em `src/styles/tokens.css` e aplica medidas de D08/D04 aos layouts responsivos.
- Adiciona AccountLayout e PurchaseLayout; aplica navegação de conta às rotas de perfil/carteiras.
- Adiciona FormField com label, ajuda, erro e IDs associados; extrai drawer com altura/rolagem corretas e controle de foco Radix.
- Adiciona skeletons de detalhe/resumo com shimmer e movimento reduzido.
- Reutiliza Query, Axios, contratos, mocks MSW e Socket.IO existentes; mantém feedback de estados e considera a lista filtrada no estado vazio.
- Adiciona 15 execuções E2E aos 21 casos existentes, três baselines de conta e atualiza três do laboratório.
- Atualiza ARCHITECTURE.md, README e guias técnicos; preserva relatórios e trace da falha observada.

## Requisitos atendidos

- [x] Requisitos aplicáveis do CHALLENGE.md: base visual, estados e cobertura incremental dos grupos 11/12
- [ ] Fidelidade integral ao design original — cores e medidas de referência preservadas, páginas completas ainda pendentes
- [x] Responsividade: 390, 768 e 1440 px; reflow de conta também em 320 px
- [x] Tratamento de loading, erro e vazio; sucesso e atualização em segundo plano no laboratório
- [x] Acessibilidade dos componentes: labels/erros, foco, teclado e movimento reduzido

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| TypeScript | `npm run typecheck` aprovado; também executado pelo build final |
| ESLint | `npm run lint` aprovado |
| Build | `npm run build` aprovado, sem aviso de chunk acima de 500 kB |
| Integração | `npm test`: 4/4; handlers MSW e cliente Socket.IO real |
| Playwright | Build final: 36/36 em 59,2 s, com baselines fixas |
| Lighthouse | Três medições por perfil no build final: medianas mobile 95/100/100/92 e desktop 100/100/100/92 (performance/acessibilidade/boas práticas/SEO) |
| Testes manuais | Inspeção visual das seis capturas novas/alteradas e dos recortes D08/D04/M04; sem teste manual com tecnologia assistiva |

Uma rodada anterior de E2E teve 35/36, com timeout de bootstrap no catálogo mobile. Trace e captura preservados; duas execuções completas posteriores passaram, sem afrouxar testes. Vitest precisou de execução fora do sandbox após EPERM no cache.

Lighthouse anterior ao split: mediana mobile 67. Houve variação de CPU; a melhora não é atribuída exclusivamente ao split. Todas as medições permanecem disponíveis.

## Evidências visuais

[Laboratório desktop](https://github.com/sergiocalazans/frontend-challenge/blob/2540d85/tests/e2e/setup.spec.ts-snapshots/design-system-chromium-desktop-win32.png)
· [Laboratório mobile](https://github.com/sergiocalazans/frontend-challenge/blob/2540d85/tests/e2e/setup.spec.ts-snapshots/design-system-chromium-mobile-win32.png)
· [Conta desktop](https://github.com/sergiocalazans/frontend-challenge/blob/2540d85/tests/e2e/design-system.spec.ts-snapshots/account-layout-chromium-desktop-win32.png)

Resultados, demais capturas e relatórios: `docs/DESIGN_SYSTEM_VALIDATION.md` e `docs/reports/design-system/`.

## Decisões técnicas

Componentes recebem propriedades e callbacks; layouts não contêm regras de sessão, cotação ou pedidos. FormField associa a mensagem fornecida pelo chamador ao input. O laboratório consulta REST via Query/Axios/MSW; eventos Socket.IO invalidam a consulta, que recupera os dados pela API.

Sidebar de 310 px, gap de conta de 28 px e resumo de aproximadamente 405 px seguem os recortes originais. Empilhamento abaixo de 1024 px é decisão de adaptação. Nenhuma tela SVG substitui HTML funcional. A fonte IBM Plex Mono permanece substituição documentada.

## Limitações conhecidas

- Perfil/carteiras continuam com conteúdo explicitamente pendente; compra e autenticação não foram implementadas nesta feature.
- PurchaseLayout e skeletons específicos são demonstrados no laboratório; suas dimensões devem acompanhar o conteúdo final nas próximas features.
- Cobertura completa dos 12 grupos, auditoria do detalhe e regressões de carrinho/pagamento dependem dos respectivos fluxos.
- Intermitência de bootstrap observada uma vez; causa definitiva não estabelecida.
- Medianas Lighthouse referem-se somente à página inicial. Fontes, imagens e mocks não foram removidos para melhorar pontuação.
- Fidelidade completa, zoom real e tecnologias assistivas ainda precisam de validação; não houve deploy.

## Checklist

- [x] Código revisado
- [x] Sem erros conhecidos de tipagem
- [x] Testes aplicáveis executados
- [x] Documentação atualizada
- [x] Sem alterações não relacionadas
- [x] Pronto para revisão
