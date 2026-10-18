## Descrição

Implementa `order.updated` autenticado e reconciliação por REST, mantendo o recibo dependente do pedido confirmado pela API. Uma interrupção no transporte retoma o pedido existente sem enviar outra compra. Branch criada de develop b1ad9f1, após merge externo do PR #8. O PR de auditorias será independente, conforme escolha do candidato; nenhum merge automático.

## Alterações realizadas

- Subscriptions privadas com validação de token antes de cada envio e expiração explícita.
- Descarte de duplicatas, eventos antigos, recursos/usuários diferentes e resultados de sessão anterior; limpeza no encerramento.
- Reconsulta REST em conexão/reconexão, processamento simulado persistido, polling de segurança de 15 s e feedback acessível.
- Cenários MSW de interrupção e replay pelo protocolo Socket.IO; testes de cliente real e interface.

## Requisitos atendidos

- [x] `nft.updated` e `order.updated` com identidade e versão
- [x] Autenticação, isolamento e descarte de sessão antiga
- [x] Reconciliação REST e estados terminais sem reaplicar efeitos
- [x] Responsividade e feedback de conexão; recibo existente preservado
- [ ] Fidelidade integral ao design — adaptações anteriores permanecem

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| Typecheck/build | Aprovados; build final 28,55 s |
| Lint | Aprovado, zero warnings |
| Unitários | 43/43, 6 arquivos, 23,62 s |
| Playwright comércio + realtime | 48/48, 5,4 min, Chromium 1440/768/390; zero retries locais, baselines fixas |
| Lighthouse | 12 medições; medianas performance início mobile/desktop 95/100, detalhe 91/98; A11y e boas práticas 100, SEO 92 |

Primeira rodada E2E: 6/9; interrupção falhou nos três viewports por encerramento anterior ao handshake Engine.IO. Apenas adiar close não resolveu. Diagnóstico e leitura do Manager identificaram a espera pelo timeout de handshake; mock corrigido, sem aumentar timeouts E2E. Detalhes e resultados finais em [REALTIME.md](https://github.com/sergiocalazans/frontend-challenge/blob/feature/realtime/docs/REALTIME.md).

## Evidências visuais

Referência D05 original reinspecionada. Capturas de recibo inspecionadas nos três tamanhos. [Relatório final e capturas reais](https://github.com/sergiocalazans/frontend-challenge/tree/feature/realtime/docs/reports/realtime/playwright-final); abra localmente com `npx playwright show-report docs/reports/realtime/playwright-final`.

[Lighthouse: todos os HTML/JSON e resumo](https://github.com/sergiocalazans/frontend-challenge/tree/feature/realtime/docs/reports/realtime/lighthouse). Medianas atingiram as metas; início mobile variou de 50 a 95. Não houve otimização pública nesta feature nem repetição seletiva; a causa da variação não foi isolada.

![Recibo mobile após confirmação REST](https://github.com/sergiocalazans/frontend-challenge/blob/feature/realtime/docs/reports/realtime/playwright-final/data/061bfb55e86324bc0664cc68d6c2a4da66edbc28.png?raw=true)

## Decisões técnicas

Evento é sinal de invalidação; GET autenticado fornece o snapshot. Cada consumidor possui seu socket e valida token capturado antes de invalidar a chave privada. O binding MSW usa `orders.subscribe({token})` pois não implementa handshake autenticado de namespace. Cenários interrompem WebSocket/Engine.IO reais, sem setters do componente. Polling protege contra perda de eventos.

## Limitações conhecidas

- Simulação local; não há backend ou transporte entre abas e persistência não é transacional.
- Perfil/avatar/senha e deploy público continuam pendentes, fora desta feature.
- Bundle principal 522,44 kB / 170,71 kB gzip; warning >500 kB preservado.
- Integração com o PR independente de auditorias só após merges autorizados.

## Checklist

- [x] Código revisado e contratos documentados
- [x] Sem erros conhecidos de tipagem
- [x] Verificações finais concluídas e relatórios registrados
- [x] LEARNING e arquitetura atualizados
- [x] Sem merge ou deploy
- [x] Pronto para revisão
