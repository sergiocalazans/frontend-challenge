# Nota de passagem — NFT Marketplace Jungle Gaming

Atualizada em 18/10/2026. [Demonstração pública](https://frontend-challenge-pi-six.vercel.app/). O projeto é uma simulação: contas, carteiras, pagamentos e transações são fictícios; o estado persiste no navegador, por origem.

## Estado verificado

Catálogo, detalhes/favoritos, autenticação/sessão, perfil/avatar/senha, carrinho/carteiras, checkout/pedidos e reconciliação Socket.IO estão implementados e integrados. Código auditado: develop `18addfc`; publicação testada: main `58188fc` (mesma árvore Git). O PR de entrega #13 foi mesclado externamente. O agente não realizou merge, deploy nem release.

Typecheck, lint e build passaram. Unitários: **50/50**. Playwright completo local: **162/162**. Testes de deploy: **12/12 locais e 12/12 públicos**, incluindo deep links/refresh, MSW, persistência e reconciliação de pedido interrompido sem compra duplicada. Não houve falhas/skip/flaky nas rodadas finais.

Lighthouse no build local, três medições por combinação: performance início **77 mobile / 100 desktop**; detalhe **84 / 98**. Acessibilidade e boas práticas **100**, SEO **92**, nas quatro combinações. Performance mobile está abaixo da meta 90. Fidelidade integral aos SVGs também está reprovada; baselines aprovadas representam a implementação, não equivalência ao Figma. **Entrega integral ainda não aprovada.**

## Como defender e continuar

O fluxo é ação/URL → TanStack Query → Axios → MSW → estado canônico persistido → resposta/cache por usuário → React. Socket.IO real recebe eventos pelo transporte interceptado no navegador e invalida consultas; REST determina o recibo confirmado. ETH usa strings no transporte e bigint nos cálculos. A chave idempotente recupera a mesma tentativa após timeout. Logout limpa cache privado e subscriptions.

Leia [DELIVERY_REPORT.md](DELIVERY_REPORT.md) para PASS/FAIL/NOT TESTED, critérios eliminatórios, SHAs, métricas e limitações; [README.md](README.md) para setup/credenciais/cenários/reset/deploy; [ARCHITECTURE.md](ARCHITECTURE.md) para contratos e decisões; [LEARNING.md](LEARNING.md) para perguntas de defesa. Evidências reais em docs/reports/delivery/, incluindo HTML/JSON e logs públicos.

Reprodução: `npm ci`, `npx playwright install chromium`, `npm run verify`, `npm run audit:lighthouse` e `npm run audit:check`, em sequência. Para a URL pública: definir DEPLOYMENT_URL e DEPLOYMENT_EXPECTED_SHA conforme README e rodar `npm run test:deployment`. Esse comando não faz deploy. Conferir a SHA atual antes de comparar resultados antigos.

Próximas prioridades: corrigir composição/tipografia conforme SVGs, reduzir custo de bootstrap/JavaScript sem retirar mocks, repetir as 12 medições; avaliar zoom real/leitor de tela e clone limpo independente. O build público informou gitDirty=true; sua origem não foi auditada. Persistência não fornece transações/sincronização entre abas. Repetir smoke público após mudanças e manter a URL acessível durante a avaliação. Novos merges, deploys e release dependem de autorização.
