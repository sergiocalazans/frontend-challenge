## Descrição

Implementa carrinho, carteiras, checkout e pedidos simulados sobre develop com autenticação integrada. Comprar adiciona a edição escolhida, o carrinho visitante é incorporado ao login e a confirmação depende de uma cotação revalidada. Uma tentativa após timeout recupera o mesmo pedido; somente confirmed abre recibo.

Esta é a primeira das três entregas sequenciais escolhidas pelo candidato. feature/realtime e feature/e2e-tests aguardam merge autorizado; nenhum merge é automático.

## Alterações realizadas

- Carrinho persistente por proprietário, quantidades/estoque por edição, remoção, cupom e totais precisos em wei.
- Cadastro/edição de carteiras principal e secundária; conexão, recusa e desconexão simuladas, com validação de rede e endereço.
- Revisão de cotação, chave idempotente persistida, reserva/liberação de estoque, pedido pendente/confirmado/recusado e recibo imutável.
- Rascunho e retomada após expiração; cache privado isolado por usuário; stream público Socket.IO revalida carrinho e impede usar revisão antiga.
- Testes MSW/Playwright, baselines, documentação técnica e LEARNING.

## Requisitos atendidos

- [x] Contratos de carrinho/cotação/carteiras/pedidos e proteção de sessão
- [ ] Fidelidade integral ao design original — adaptações serão documentadas
- [x] Interfaces responsivas baseadas nos SVGs
- [x] Tratamento de loading, erro, vazio e sucesso
- [x] Feedback acessível, campos associados, foco e nome do recibo

## Testes e validações

| Verificação | Resultado real |
| --- | --- |
| `npm run typecheck` | Aprovado, também executado pelo build final |
| `npm run lint` | Aprovado, zero warnings; relatórios gerados excluídos da análise |
| `npm run build` | Aprovado, 28,38 s; warning de chunk >500 kB registrado |
| `npm run test` | 39/39, cinco arquivos, 17,00 s |
| `npm run test:e2e` | 135/135, 9,9 min; Chromium 1440/768/390, zero retries locais, baselines fixas |
| `npm run audit:lighthouse` | 12 medições concluídas; performance início mobile/desktop 71/100, detalhe 88/97; A11y e boas práticas 100, SEO 92. Meta mobile pendente |
| Inspeção visual | SVGs D03/D04/D05/D09/M03/M04; capturas finais de carrinho, checkout, detalhe, carteiras e recibo nos três viewports |

A primeira suíte completa teve 134/135 por deslocamento do botão Comprar no mobile. O problema foi corrigido sem flexibilizar a asserção e a suíte inteira passou na repetição. Histórico, traces e condições em [validação](https://github.com/sergiocalazans/frontend-challenge/blob/feature/cart-checkout/docs/CART_CHECKOUT_VALIDATION.md).

## Evidências visuais

[Relatório Playwright final](https://github.com/sergiocalazans/frontend-challenge/tree/feature/cart-checkout/docs/reports/cart-checkout/playwright-final), incluindo carteiras e recibos reais. Abra localmente com `npx playwright show-report docs/reports/cart-checkout/playwright-final`.

[Relatórios Lighthouse HTML/JSON e medianas](https://github.com/sergiocalazans/frontend-challenge/tree/feature/cart-checkout/docs/reports/cart-checkout/lighthouse). Resultados abaixo da meta, causas observadas e variação entre rodadas estão descritos no documento de validação.

![Carrinho desktop](https://github.com/sergiocalazans/frontend-challenge/blob/0ccc56f/tests/e2e/commerce.spec.ts-snapshots/cart-chromium-desktop-win32.png?raw=true)

![Pagamento mobile](https://github.com/sergiocalazans/frontend-challenge/blob/0ccc56f/tests/e2e/commerce.spec.ts-snapshots/checkout-chromium-mobile-win32.png?raw=true)

![Recibo mobile com totais](https://github.com/sergiocalazans/frontend-challenge/blob/feature/cart-checkout/docs/reports/cart-checkout/playwright-final/data/061bfb55e86324bc0664cc68d6c2a4da66edbc28.png?raw=true)

## Decisões técnicas

Strings decimais no transporte e bigint nos cálculos. Fingerprint da cotação inclui versões, estoque, cupom, carteira e conexão. Idempotência consulta a tentativa existente antes de rejeitar uma cotação já expirada. Recibo usa snapshot; confirmações removem somente quantidades das linhas compradas. Polling recupera o pedido; canais privados de realtime serão a próxima feature. [Contratos e fluxo](https://github.com/sergiocalazans/frontend-challenge/blob/feature/cart-checkout/docs/CART_CHECKOUT.md).

## Limitações conhecidas

- Simulação local, sem blockchain, extensão, cobrança ou autenticação de produção; somente dados fictícios.
- Persistência entre abas não transacional; recuperação após refresh exige storage funcional.
- Um pedido usa uma rede: itens de redes diferentes precisam ser separados.
- Fonte substituta e adaptações de acessibilidade já documentadas; fidelidade integral não declarada.
- Perfil/avatar/senha, realtime privado e auditoria final dos 12 grupos ainda pendentes.
- Bundle principal 521,51 kB (170,37 gzip), com warning preservado. Performance mobile abaixo de 90 (início 71, detalhe 88): tempo de bloqueio, execução de scripts/layout e descoberta tardia da imagem LCP observados; otimização permanece pendente para a etapa de auditoria.
- Nenhum merge ou deploy realizado nesta entrega.

## Checklist

- [x] Código revisado; verificações funcionais e regressão concluídas
- [x] Sem erros conhecidos de tipagem
- [x] Testes aplicáveis executados e evidências registradas
- [x] Documentação e LEARNING atualizados
- [x] Sem alterações não relacionadas
- [x] Pronto para revisão, com metas mobile e escopo pendente explicitados
