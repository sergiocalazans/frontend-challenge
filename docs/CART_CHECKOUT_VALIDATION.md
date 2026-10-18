# Validação de carrinho e checkout

## Base e condições

Branch `feature/cart-checkout`, criada de develop em `1010726`, após fetch/fast-forward e working tree inicialmente limpo. O PR #7 já estava integrado externamente. As próximas branches aguardam merge autorizado deste PR, conforme escolha do candidato. Não houve merge pelo agente.

As rodadas iniciais ocorreram em 17/10/2026 e a tarefa foi retomada em 18/10/2026. O comando interrompido por indisponibilidade da revisão automática de aprovação não foi executado; foi repetido após o candidato pedir continuação. A falha da revisão informava limite de uso, sem classificar o comando como inseguro.

Ambiente: Windows, Node 22.18.0, Vite 7.3.7, TypeScript 5.9.3, MSW 2.15.0, Socket.IO Client 4.8.4, Playwright 1.64.1, Vitest 4.1.12 e Lighthouse 12.6.1. Chromium fornecido pelo Playwright; mocks, imagens e fontes reais da entrega habilitados. Playwright usa um worker, zero retries locais e viewports 1440×1000, 768×1024 e 390×844. Código funcional e testes em `0ccc56f`; o commit seguinte registra documentação/artefatos e a exclusão de relatórios gerados no lint.

## Verificações executadas durante implementação

- Typecheck, lint e build foram aprovados antes das rodadas de UI. Build intermediário: mount 521,51 kB / 170,38 kB gzip; warning >500 kB preservado. O resultado do build final será registrado separadamente.
- Primeira rodada unitária: 38/39; reset de cenário não restaurava preço porque o inventário persistido o sobrescrevia. Handler corrigido para restaurar preços mantendo reservas por edição, sem alterar a asserção existente.
- Rodada unitária seguinte: **39/39**, cinco arquivos, 18,39 s. Inclui precisão decimal, carrinho, cupom, merge, carteiras, recusa de conexão, cotação antiga, expiração, idempotência concorrente, estoque, recusa, timeout após criação e isolamento de pedidos. Repetição na versão retomada: **39/39**, cinco arquivos, 54,61 s. Depois da correção do registro inexistente, **39/39** novamente, 17,00 s.
- Erro de sintaxe em um novo teste de expiração foi encontrado por lint/typecheck e corrigido; regras e timeouts existentes não foram alterados.

## Falhas de UI e correções

Primeira rodada desktop de comércio: **3/7**, 1,7 min. Três falhas observavam o recibo: título visível, mas o ID personalizado que recebe foco não correspondia ao aria-labelledby do Radix. A associação explícita foi corrigida, preservando a asserção por nome acessível.

A quarta falha não enviou POST de carrinho. O trace mostra clique em Comprar em y=626,95; GET de favoritos terminou durante a sequência de clique e o botão ficou no limite inferior do ponto anterior. O feedback de favoritos passou a reservar altura mínima. Novo E2E segura a leitura por 1.800 ms, compara a posição do botão antes/depois e verifica inclusão real no carrinho. Não houve aumento de timeout para ocultar o deslocamento. [Traces/capturas iniciais](reports/cart-checkout/initial-failure/).

Rodada desktop seguinte: **9/10**, 1,7 min. Passaram compra completa, recibo imutável, recusa, timeout com mesma chave, preço via Socket.IO, expiração com rascunho e estabilidade de Comprar. A única falha foi a perda do motivo da API no erro de atualização em segundo plano: a UI mostrava aviso genérico. O feedback passou a incluir a mensagem da API e manter o estado anterior/retry. [Trace/captura](reports/cart-checkout/feedback-failure/). A asserção de indisponibilidade foi mantida.

Também foram adicionados cenários de redução de estoque durante revisão e validação de campos/rede. A rodada focada seguinte aprovou erro/retry e estoque (2/3), mas encontrou um locator incorreto no novo teste de campos: getByLabel exato incluía o marcador visual de obrigatório. O snapshot acessível mostrava textbox E-mail e combobox Rede de pagamento. O teste passou a localizar pelos papéis e nomes acessíveis exatos, mantendo a validação aria-invalid e o bloqueio de revisão. Timeout e asserções foram preservados. [Trace](reports/cart-checkout/locator-failure/). O teste focado seguinte passou: 1/1, 19,6 s de execução total.

O teste de recurso de pedido inexistente reproduziu **1/1 falha** (7,47 s): `/orders/constructor` acessava uma propriedade herdada do objeto e retornava 500. O handler passou a verificar a existência do registro de pedido antes de conferir o proprietário. A asserção de 404 permanece no teste de isolamento; não foi criada rota especial para o identificador.

Primeira regressão completa com baselines fixas: **134/135**, 9,9 min. A única falha foi o novo teste de posição de Comprar no mobile: o texto de loading alargava favoritos e forçava quebra de linha, deslocando a ação em 68 px. [Relatório completo anterior à correção](reports/cart-checkout/full-suite-before-wrap-fix/index.html) e [trace](reports/cart-checkout/mobile-wrap-failure/). A largura do feedback foi limitada; nova rodada focada passou desktop/tablet (2/3, 27,7 s), mas mostrou 4 px restantes de altura ([trace](reports/cart-checkout/mobile-height-failure/)). A reserva foi ajustada de 76 para 80 px. A comparação exata de posição permanece; não se aumentou tolerância ou timeout.

Após copiar o relatório completo, lint encontrou 3.365 erros nos scripts de terceiros do visualizador de traces. A configuração passou a excluir `docs/reports/**`, como já fazia com `reports/**` e `playwright-report/**`. Código e testes continuam sob as mesmas regras; lint seguinte aprovado. Isto não altera as evidências nem os testes.

Com largura e altura corrigidas, teste de posição: **3/3**, 23,9 s. Detalhe teve suas três baselines atualizadas pelos 4 px intencionais: **3/3**, 17,9 s; todas inspecionadas novamente. O teste de recibo também verifica rolagem até o total e visibilidade, anexando o estado inicial e o estado com os totais. As capturas de carteiras e recibo da primeira suíte completa foram inspecionadas nos três viewports; o recibo mobile usa rolagem interna para caber na altura disponível.

## Design e regressão visual

Referências D03/D04/D05/D09 e M03/M04 recortadas do SVG original e inspecionadas. Primeira geração: 6/6 testes visuais (carrinho/checkout e detalhe), 1,1 min. As nove imagens foram inspecionadas nos três viewports; a alteração do detalhe é intencional para o botão funcional e a altura reservada de favoritos. Comparação com o SVG levou à compactação do item e cupom mobile e da linha desktop. Nova geração somente do comércio: 3/3 testes, 39,4 s; três imagens de carrinho mudaram e checkout permaneceu igual. As três capturas finais de carrinho foram novamente inspecionadas em 390, 768 e 1440 px, sem corte dos controles. Baselines fixas são usadas na regressão completa. Não se declara fidelidade integral: fonte substituta, footer compartilhado e adaptações estão documentados em CART_CHECKOUT.md.

## Resultados finais

Typecheck, lint e build da versão retomada: aprovados. Build após a correção mobile: 28,38 s; mount 521,51 kB / 170,37 kB gzip, browser/MSW 323,41 kB / 105,79 kB gzip; warning >500 kB mantido. Unitários finais: **39/39**, cinco arquivos, 17,00 s. Regressão Playwright final: **135/135**, 9,9 min, 45 testes por viewport, sem retries locais, sem atualizar baselines. Inclui 39 execuções dos 13 novos cenários de comércio. [Relatório completo com capturas de carteiras e recibo](reports/cart-checkout/playwright-final/index.html). Para abrir localmente: `npx playwright show-report docs/reports/cart-checkout/playwright-final`. Nenhum resultado de autenticação anterior foi usado como se validasse esta feature.

## Lighthouse no build final

`npm run audit:lighthouse` executado após terminar o Playwright, no preview 127.0.0.1:4175. Script versionado `scripts/lighthouse.mjs`: três medições por página/perfil, Chromium headless do Playwright, perfil mobile padrão Lighthouse e desktop oficial. Sem remover imagens, fontes, autenticação, mocks ou funcionalidades; sessão inicial visitante, cenário padrão. Resumo gerado em 18/10/2026 às 04:16:08 UTC. Não houve repetição seletiva para melhorar pontuação. [12 pares HTML/JSON e resumo](reports/cart-checkout/lighthouse/summary.json).

Medianas calculadas separadamente para cada coluna:

| Página/perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início mobile | **71** | 100 | 100 | 92 | 3047,21 | 0 | 1063,50 |
| Início desktop | 100 | 100 | 100 | 92 | 733,08 | 0,000093 | 37 |
| Detalhe mobile | **88** | 100 | 100 | 92 | 2984,27 | 0,003221 | 271 |
| Detalhe desktop | 97 | 100 | 100 | 92 | 1052,29 | 0,073403 | 49 |

As metas de performance ≥90 **não foram atingidas no mobile**; as demais categorias atingiram as metas. Rodadas de performance: início mobile 48/71/84, desktop 100/100/99; detalhe mobile 88/90/74, desktop 97/96/98. A variação é registrada, não descartada. Estes resultados não concluem a auditoria final do desafio.

Evidência do início mobile, rodada 2: TBT 1063,5 ms, Style/Layout 1643,22 ms e Script Evaluation 1233,54 ms. Bootup atribui 2161,43 ms ao mount e 648,33 ms ao browser/MSW; cerca de 39,7 kB de JavaScript MSW não usado são apontados. A imagem hero é LCP e o atraso até começar a carregá-la representa 70% do LCP. Detalhe mobile, rodada 1: imagem principal é LCP, 72% em load delay; bootup MSW 866,11 ms e mount 673,90 ms. O código de bootstrap aguarda o interceptor antes de importar/montar a aplicação; isso é consistente com descoberta tardia das imagens, mas não prova isoladamente a contribuição de cada módulo. Não se atribui a variação ao hardware sem medição específica.

Prioridades para a etapa de auditoria: reduzir custo inicial dos módulos/runtime mantendo os mocks funcionais, antecipar descoberta das imagens críticas sem removê-las e revisar a transição do skeleton no detalhe desktop (CLS 0,073403). Nenhuma otimização exclusiva para o auditor foi aplicada. O recibo mobile final teve seu estado inicial e seu total após rolagem inspecionados; ambos estão no relatório Playwright.

## Limites de cobertura

Pedidos pendentes usam polling REST nesta entrega. Canais privados, order.updated, reconexão e eventos fora de ordem serão tratados em feature/realtime, após merge autorizado. A auditoria final ficará em feature/e2e-tests. Perfil/avatar/senha continuam pendentes; não se declara cobertura integral do grupo 8 nem dos 12 grupos do CHALLENGE. Persistência MSW entre abas não é transacional e os dados são fictícios. Deploy não faz parte desta publicação de branch/relatórios.

## Mapa de cobertura desta etapa

| Grupo CHALLENGE | Situação |
| --- | --- |
| 1–4 | Catálogo, detalhe, sessão e favoritos existentes são incluídos na regressão completa |
| 5 | Novos testes de carrinho, quantidades, remoção, cupom e persistência/merge |
| 6 | Compra até recibo confirmado por REST, com snapshot preservado |
| 7 | Recusa, clique duplo e recuperação da mesma chave após timeout |
| 8 | Carteiras validadas/editadas; perfil/avatar/senha ainda pendentes |
| 9 | Preço e disponibilidade via Socket.IO invalidam revisão e cotação |
| 10 | Retomada REST de pedido pendente; eventos privados/duplicatas/reconexão aguardam realtime |
| 11 | Campos, foco/nome de diálogo, Escape e controles |
| 12 | Skeleton de resumo, vazio, erro HTTP e retry; demais estados existentes na regressão |

Este mapa não equivale à conclusão integral dos 12 grupos.
