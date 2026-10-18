# Arquitetura do NFT Marketplace

Estado auditado em 18/10/2026: develop 18addfc, com catálogo, detalhes, autenticação/favoritos, comércio e realtime integrados. Perfil/avatar/senha foram concluídos no PR #11 e a preparação Vercel integrada no #12. O merge externo #13 levou a mesma árvore a main 58188fc; essa SHA está publicada na [Vercel](https://frontend-challenge-pi-six.vercel.app/), com 12/12 testes de deploy aprovados. Resultados atuais e pendências: [DELIVERY_REPORT.md](DELIVERY_REPORT.md). Documentos de features registram evolução histórica; o estado atual descrito aqui prevalece sobre afirmações antigas de placeholders, polling de 1 s ou ausência de autenticação.

## Inicialização e responsabilidades

main.tsx carrega estilos/fontes locais, aguarda MSW por configuração e só então importa app/mount.tsx. Essa ordem permite que socket.io-client capture WebSocket interceptado. mount cria QueryClient, sessão e Router; falha de bootstrap apresenta erro acessível. A aplicação não usa respostas fictícias em componentes, hooks ou Axios.

- src/app: providers, políticas globais e rotas TanStack Router.
- src/features/catalog, nft-details, auth, profile e commerce: contratos, APIs Axios, queries/mutations e apresentação.
- src/components/ui: primitivas shadcn/ui adaptadas, base Radix; shared/layout: composições acessíveis.
- src/lib: instância HTTP, ambiente, precisão ETH e lifecycle Socket.IO.
- src/mocks: handlers REST/Socket.IO e regras da simulação, persistência e cenários.
- tests: integração MSW/cliente real e E2E; scripts: assets e Lighthouse.

As rotas privadas /checkout, /account/profile, /account/wallets e /orders/$orderId usam RequireSession. Enquanto verifica identidade, a guarda mantém skeleton; 401 retorna ao login com returnTo local seguro; 503 apresenta retry. /account/profile usa formulário funcional com persistência pela mesma fonte de contas da sessão. Rotas desconhecidas e NFTs/pedidos inexistentes apresentam estados próprios.

## Contratos REST

Prefixo /api por padrão. Todos os recursos são Axios → handlers MSW no modo demo. Contratos detalhados: [catálogo](docs/CATALOG.md), [detalhes](docs/NFT_DETAILS.md), [auth integrada](docs/AUTHENTICATION_INTEGRATION.md), [comércio](docs/CART_CHECKOUT.md).

| Recursos | Operações |
| --- | --- |
| Sessão | POST /users, POST/GET/DELETE /session; consulta e invalidação por token |
| NFTs | GET /nfts com busca/filtros/ordenação/paginação; GET /nfts/:id |
| Favoritos | GET /favorites, PUT/DELETE /favorites/:id |
| Carrinho | GET /cart, POST /cart/merge, POST/PATCH/DELETE /cart/items[/:id], PUT/DELETE /cart/coupon |
| Carteiras | GET /wallets, PUT /wallets/:slot, POST /wallets/:id/connection |
| Cotação | POST /quotes com walletId/network; snapshot com validade de 120 s |
| Pedido | POST /orders com quoteId/collector e Idempotency-Key; GET /orders/:id |
| Perfil/avatar/senha | GET/PATCH /profile, POST /profile/password; dados/avatar persistidos e senha com hash/salt novo |

Erros usam code/message e fields quando aplicável: formato 400, sessão 401, inexistente/alheio 404, conflito 409, cupom expirado 410, validação 422 e indisponibilidade 503. Tipos TypeScript não validam automaticamente respostas de um backend desconhecido; eventual integração externa exige validação de runtime e autenticação de servidor.

## Estado, sessão e cache

Catálogo guarda q/categoria/rede/faixa ETH/ordenação/página na URL. A normalização valida parâmetros, mudanças de filtro reiniciam página e a chave Query contém todos os parâmetros. Axios recebe AbortSignal; respostas antigas não sobrescrevem outra consulta. O detalhe preserva edição/quantidade na URL.

Política global: staleTime 30 s, gcTime 5 min, refetch em foco; no máximo um retry para falha de rede/5xx, sem retry de 4xx. Mutations não repetem automaticamente. Recursos privados de comércio usam stale imediato e reconciliam ao montar/focar. Sessão revalida periodicamente e em foco/montagem.

session-store.ts é a fonte única do mock para contas/sessões, com PBKDF2/salt e tokens opacos de 30 minutos. Ana e Bruno são fixtures fictícias. Persistência local não oferece proteção de servidor/HttpOnly e não deve conter dados reais.

Chaves incluem ['private',userId,...]; carrinho visitante usa ['guest',guestId,'cart']. Logout/expiração/troca cancelam/removem cache privado; mutations capturam token e descartam respostas de identidades anteriores. Logout atrasado não pode limpar sessão mais recente de outra aba. Storage event provoca nova verificação e mantém a guarda em loading. Favoritos usam atualização otimista, snapshot para rollback e invalidação; servidor revalida sessão após a latência simulada.

## Comércio e precisão

X-Cart-Id identifica carrinho visitante. API escolhe proprietário pelo token válido ou UUID visitante; token inválido não cai silenciosamente para visitante. Merge autenticado esvazia origem e preserva quantidades, sem duplicar repetição nem truncar excessos silenciosamente.

ETH trafega como strings decimais; ethToWei/weiToEth usam bigint. Totais são calculados no mock, incluindo desconto em wei e taxa da rede. A UI apresenta a cotação REST, sem recalcular preço usando ponto flutuante. Quantidades são inteiras e estoque é por edição.

Carrinho/carteiras/cotações/pedidos e índice idempotente persistem em kurio.mock-commerce.v1; inventário em kurio.mock-inventory.v1. O carrinho aceita múltiplas redes, mas cada pedido exige uma rede compatível com todos os NFTs e a carteira conectada. Taxa do carrinho é estimativa; cotação final é a referência.

Fingerprint da cotação inclui versões/estoque, revisão/cupom/expiração, carteira/conexão. Mudanças exigem nova revisão explícita e o servidor revalida antes de criar pedido. Rascunho e tentativa ficam em kurio.checkout-draft.<userId> e kurio.checkout-attempt.<userId>, isolados para retomada pela mesma identidade.

Antes do primeiro POST /orders, cliente persiste chave/payload. Mesma chave e conteúdo recuperam o mesmo pedido, mesmo com cotação vencida; conteúdo diferente gera 409. Timeout não gera automaticamente outra chave. Criação reserva estoque uma vez, estado pending evolui para confirmed/declined. Confirmação remove apenas quantidades compradas; recusa libera reserva e preserva itens/cupom. Recibo usa snapshot imutável, nunca preço atual do catálogo, e só abre após REST confirmed. Referências de transação são explicitamente simuladas.

## Socket.IO e reconciliação

[Contrato e diagnóstico de transporte](docs/REALTIME.md). createMarketSocket cria conexão por consumidor, autoConnect false, transporte WebSocket, reconexão com 5 tentativas e espera de 500–2000 ms sem jitter para reprodução determinística. MSW/@mswjs/socket.io-binding intercepta protocolo real; não há setter de negócio acionado por cenário na UI.

| Evento | Dados e processamento |
| --- | --- |
| nft.updated | eventId/nftId/version; versão crescente; invalida catálogo/detalhe/carrinho para GET REST |
| order.updated | eventId/orderId/userId/version/status; assinatura privada filtra identidade/recurso, duplicatas, versão antiga e regressão terminal |
| session.expired | revoga assinatura; só invalida a sessão se token capturado ainda for atual |
| orders.subscribe | cliente envia token após conectar; servidor resolve proprietário e revalida antes de cada envio |

O binding não implementa autenticação de namespace; orders.subscribe é adaptação explícita. Token não vai na URL. Cada conexão/reconexão reconcilia REST. Eventos são sinais, sem impor dados de recibo: a leitura autenticada continua fonte de verdade. Polling de 15 s protege pedido pending contra evento perdido e para nos terminais. Mock persiste efeitos antes de publicar versão 2, com tick de 250 ms durante assinatura privada válida; GET também pode finalizar após refresh.

Cleanup remove listeners/desconecta ao desmontar ou mudar token/usuário/pedido, e servidor remove timers. Cenário disconnect interrompe transporte real por 1500 ms; abertura Engine.IO controlada evita esperar o timeout de handshake durante as tentativas indisponíveis. Replay duplicate/stale atravessa binding Socket.IO. Sem rooms/namespaces autenticados de produção, long polling, backend remoto ou sincronização de transporte entre abas; persistência não é transacional entre abas.

## Mocks e cenários

.env.demo ativa MSW no build de demonstração. REST e eventos reutilizam fixtures e estado para UI, testes e demonstração. Cenários default/empty/slow/error/race/offline/flaky são configuráveis; controles demo também cobrem sessão, favoritos, cupom, estoque, timeout, pagamento e reconexão. O reset dos recursos implementados e a ordem de uso estão no README. Auth reset restaura também dados de perfil/avatar e senha; nome/e-mail compartilham a conta e o apelido acompanha a carteira principal.

No Vitest, alias carrega distribuição browser real de socket.io-client: transporte ws padrão do Node não passa pelo WebSocket global interceptado por MSW. Não se substituem callbacks do cliente. Dois usuários e tokens inválidos/expirados são exercitados. Persistência de banco no Node usa memória, browser usa localStorage.

## Design, acessibilidade e limitações

Fontes, cores, proporções e componentes foram examinados nos SVGs originais, com mapa em design/FRAME_MAP.md. O SVG de prancha não é servido como tela. Quatro imagens originais viram assets WebP de 640 px; IBM Plex Mono local substitui família não identificada. Cobre/superfícies e margem desktop 120 px orientam tokens, mas não comprovam equivalência visual integral.

Diferenças confirmadas: hero e navegação mobile reorganizados, grid sem desencontro original, footer simplificado, cabeçalho com laboratório, formulário de checkout/revisão e carteiras adaptados; ENS é opcional. D08 é implementado com confirmações independentes de perfil e senha. Filtros de preço usam campos validados em vez de slider. Referências usam totais inconsistentes em alguns frames; cotação funcional tem prioridade sobre esses valores de exemplo.

Radix Dialog fornece foco preso/restaurado, Escape e semântica; campos associam labels/erros. Skeletons reservam dimensões e shimmer respeita reduced-motion. Alterações de rede/mutations têm feedback textual/roles. Layouts empilham em mobile e são testados em 390/768/1440. Reflow de 320 px não prova zoom real; não houve avaliação manual com leitor de tela.

Defeito de foco da revisão e rótulo mobile autenticado foram corrigidos no PR #10. Modulepreload inicia download/compilação sem executar o mount antes de worker.start. verify encadeia verificações funcionais; audit:check recalcula medianas e rejeita rodadas/métricas inválidas e metas não atingidas. Não se atribui melhora de performance ao preload: medições daquela branch não demonstraram melhora.

## Validação e entrega

E2E observa UI/URL e resultados REST, com baselines versionadas de início/detalhe/carrinho/checkout e auth; cliente Socket.IO real em integração e browser. Um worker reduz competição local, sem alterar timeouts/asserções nem tolerâncias. Chromium Windows é o ambiente medido, não garantia para outros navegadores/sistemas. Lighthouse audita build demo com imagens/fontes/mocks, início/detalhe × mobile/desktop × três rodadas, reportando todas as execuções e medianas.

DELIVERY_REPORT diferencia SHA de develop, evidências de PR independente e estados PASS/FAIL/NOT TESTED. A suíte completa local passou 162/162 e o smoke público 12/12, incluindo refresh e reconciliação. Lighthouse no build local encontrou performance mobile abaixo da meta; fidelidade integral continua FAIL. O relatório deve acompanhar a revisão antes de considerar entrega ou release aprovada.


## Perfil integrado à conta

A rota /account/profile agora usa ProfilePage lazy, GET/PATCH /profile e POST /profile/password. Dados adicionais ficam no usuário de session-store; nome/e-mail são compartilhados com sessão/login. O apelido do perfil acompanha a carteira principal. Query privada por userId, token capturado e revalidação após latência/hashing protegem gravações. PBKDF2 é compartilhado com auth; senha nova revoga outras sessões e mantém a atual. Avatar é data URL limitada/validada, sem upload externo. ENS opcional e formulários com confirmações independentes são decisões de UX. Detalhes em docs/PROFILE.md; descrições antigas de placeholder de perfil são históricas e foram substituídas por esta implementação.

## Preparação de deploy Vercel

vercel.json aplica fallback SPA excluindo API/arquivos reservados, com headers para o worker. build:vercel chama o build demo com mocks forçados e gera metadados de commit/checksum, mantendo build:api separado. Registro do worker é absoluto na raiz; Socket.IO só é importado após sua ativação. preview:deployment é um ensaio estático local das regras, não emulador da plataforma. test:deployment testa URL fornecida e nunca publica. Contratos, execução e limites estão em docs/DEPLOYMENT.md. A validação pública exercitou MSW e o cliente Socket.IO real com transporte interceptado no browser; isso não representa um servidor Socket.IO remoto. build-info público informa a SHA esperada e gitDirty=true, condição registrada sem certificar o ambiente de build como checkout limpo.
