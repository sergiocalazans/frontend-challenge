# Socket.IO e reconciliação

Branch `feature/realtime`, de `develop` b1ad9f1, working tree inicialmente limpo; PR #8 integrado externamente. Auditoria será um PR independente de develop em `feature/e23-tests`, por escolha do candidato; sua integração com este PR é pendente até ambos os merges autorizados.

## Plano e arquivos

1. Contratos e assinaturas: `src/lib/realtime.ts`.
2. Servidor MSW/Socket.IO: `mocks/socket.ts`, `realtime-state.ts`, `orders.ts`.
3. Ciclo React/Query: `commerce/use-commerce.ts`, `api.ts`, `order-page.tsx`.
4. Testes de transporte, UI, documentação e evidências.

## Transporte e autenticação

Socket.IO Client usa WebSocket interceptado por MSW e @mswjs/socket.io-binding 0.2.0. O binding não autentica namespace/handshake; o cliente envia `orders.subscribe({token})` após cada conexão. O mock resolve o token na fonte única de sessão e revalida antes de cada envio e a cada tick. Nunca aceita userId enviado pelo cliente. Token inválido/expirado remove a assinatura privada e emite `session.expired`; o consumidor só encerra a sessão se o token capturado ainda for atual. Tokens não aparecem na URL.

`catalog.subscribe` permanece público. `nft.updated` contém eventId/nftId/version e invalida REST de catálogo, detalhe e carrinho. `order.updated` contém eventId/orderId/userId/version/status. O canal só transmite pedidos do proprietário autenticado. O consumidor filtra proprietário/recurso, versão inteira crescente, identidade atual e IDs repetidos; estados terminais não aceitam eventos posteriores. IDs vistos têm limite de 512 por assinatura.

## Fonte de verdade e recuperação

Eventos são sinais de invalidação: nenhuma confirmação, total ou recibo é fabricado pelo socket. Query invalida somente `['private',userId,'order',orderId]` e Axios recupera o pedido autenticado. O mock finaliza o pedido, persiste seus efeitos e só então publica a versão 2. Pending/confirmed/declined e reserva/liberação preservam as regras idempotentes do carrinho. GET também pode finalizar o pedido após refresh, inclusive sem conexão.

Cada conexão/reconexão faz uma leitura REST dos recursos ativos. Reconexão automática: 5 tentativas, delay 500–2000 ms, sem jitter para reprodução determinística; polling de segurança a cada 15 s enquanto pending, encerrado ao atingir estado terminal. O feedback informa conexão/reconexão. Efeitos React removem listeners e desconectam na troca de token/usuário/recurso ou desmontagem. O servidor limpa timers e assinaturas no fechamento.

O simulador usa tick de 250 ms enquanto há assinante privado válido. Uma interrupção impede novas conexões por 1500 ms; pedidos continuam persistidos e REST reconcilia readyAt na retomada. Isto não é um serviço de backend nem um transporte distribuído entre abas.

## Cenários e testes

POST `/api/demo/realtime` com `{action:'disconnect'}` interrompe o WebSocket real do cliente; `{action:'duplicate'|'stale',orderId}` envia mensagens pelo binding, sem setters da UI. POST `/api/demo/commerce` pending/settle/declined controla o processamento. Os endpoints demo existem apenas nos mocks.

Vitest exercita Socket.IO real, MSW, duas identidades, token inválido/expirado, descarte tardio, duplicatas, ordem e limpeza. Playwright usa processamento pendente controlado; confirma antes do intervalo de fallback (15 s), verifica leitura REST, ausência de nova criação, desconexão/reconexão e login com retorno ao pedido. Casos existentes de comércio verificam recusa e estoque; não foram enfraquecidos.

Referência visual D05 de confirmação, recortada do SVG original, foi reinspecionada. O recibo existente é preservado; feedback novo segue tokens tipográficos e status acessível. Estados pendente/erro/404 e recibo confirmado continuam responsivos. Não há frame específico de reconexão no SVG e não se declara fidelidade integral.

## Resultados

- Unitários: 43/43, 6 arquivos, 21,53 s.
- Lint aprovado. Typecheck inicial aprovado antes dos testes; o build seguinte detectou inferência UUID estreita no helper de token inválido. Helper corrigido para string; resultado final do build/E2E será registrado.
- Lighthouse desta versão está registrado ao final; os números do carrinho são históricos e não validam este commit.

## Limites

Persistência local e ausência de transações entre abas permanecem. Não há infraestrutura Socket.IO remota, namespaces autenticados ou entrega garantida; REST e polling recuperam perdas. Perfil/avatar/senha e deploy público continuam fora desta entrega. Auditoria dos 12 grupos será documentada com suas lacunas reais.

Falha inicial de E2E: 6/9 aprovados em 1,8 min. As três falhas ocorreram na reconexão depois do período simulado de interrupção. A hipótese inicial foi o fechamento anterior ao evento open: adiar o fechamento ao próximo ciclo foi tentado sem alterar asserções ou timeouts, mas não resolveu. Traces e capturas originais estão em `docs/reports/realtime/initial-failure`.

Diagnóstico: o adiamento do close sozinho não resolveu (0/3 no teste focado; diagnóstico desktop falhou). Os eventos do Manager mostraram parada em reconnect_attempt 1. O código local do Manager só observa open/error durante opening; um close sem handshake aguarda timeout. O cenário passou a entregar a abertura Engine.IO e fechar antes de confirmar o namespace Socket.IO. Assim o transporte cai sem aparentar assinatura privada conectada, e o Manager pode tentar novamente. Diagnóstico desktop seguinte: 1/1 aprovado em 11,8 s; unitários focados: 4/4 em 4,37 s, incluindo indisponibilidade de 1500 ms com limite de 4000 ms no novo teste. Timeouts e asserções E2E originais permanecem. Logs e arquivo temporário de diagnóstico foram removidos antes do build final.

Validação final funcional em 18/10/2026: typecheck e lint aprovados; build 28,55 s, mount 522,44 kB / 170,71 kB gzip e browser/MSW 325,26 kB / 106,34 kB gzip. Warning >500 kB preservado. Unitários finais 43/43 (6 arquivos, 23,62 s). Playwright `realtime.spec.ts commerce.spec.ts`: 48/48, 5,4 min, Chromium 1440/768/390, zero retries locais e baselines fixas. Inclui os 9 novos cenários de realtime e 39 de comércio. Relatório com capturas reais: `docs/reports/realtime/playwright-final`; abrir com `npx playwright show-report docs/reports/realtime/playwright-final`. A suíte inteira de catálogo/auth não foi repetida nesta branch; seus contratos unitários e os cenários de comércio afetados foram executados. A auditoria independente executará a regressão completa na base própria.

## Lighthouse final

`npm run audit:lighthouse`: 12 medições no build demo de produção, 3 por página/perfil, Chromium Playwright, Node 22.18.0, Windows, Lighthouse 12.6.1. MSW 2.15.0, binding 0.2.0 e Socket.IO Client 4.8.4; imagens e fontes habilitadas, sessão visitante, cenário padrão, após terminar o E2E. Resumo gerado em 18/10/2026 04:44:00 UTC. Arquivos HTML/JSON em `docs/reports/realtime/lighthouse`.

| Página/perfil | Perf. | A11y | Boas práticas | SEO | LCP ms | CLS | TBT ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início mobile | 95 | 100 | 100 | 92 | 2412,70 | 0 | 181,5 |
| Início desktop | 100 | 100 | 100 | 92 | 814,27 | 0,000093 | 32 |
| Detalhe mobile | 91 | 100 | 100 | 92 | 2802,80 | 0,003221 | 189 |
| Detalhe desktop | 98 | 100 | 100 | 92 | 878,83 | 0,073403 | 0 |

As medianas atingiram as metas, sem repetição seletiva de rodadas. Houve variação, incluindo início mobile 50 na primeira medição; todos os resultados foram preservados. Não se atribui melhora de pontuação ao realtime: esta feature não otimiza o carregamento público e a causa da variação de CPU não foi isolada. O bundle e a transição de skeleton no detalhe desktop continuam candidatos à análise. Medianas não substituem a auditoria completa do desafio nem comprovam integração com outro PR.
