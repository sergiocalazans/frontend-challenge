# Carrinho, carteiras, checkout e pedidos

## Escopo e base

Branch `feature/cart-checkout` criada de `develop` atualizado por fast-forward em `1010726` (PR #7 de autenticação integrado externamente). Working tree inicialmente limpo. O candidato escolheu PRs sequenciais: esta entrega precede `feature/realtime` e `feature/e2e-tests`, que só avançam após merge autorizado pelo candidato. Nenhum merge de PR será feito pelo agente.

Esta feature torna funcionais carrinho, manutenção de carteiras, checkout, pedidos e recibo. Perfil/avatar/senha continuam fora desta etapa. O stream público Socket.IO existente revalida o carrinho; pedidos usam polling REST. Canais privados, eventos de pedidos, desconexão/reconexão e auditoria final dos 12 grupos pertencem às etapas seguintes.

## Contratos REST

Todas as chamadas passam por Axios e handlers MSW. Tokens são capturados no início da operação. `X-Cart-Id` é um UUID opaco persistido como `kurio.guest-cart`; o servidor escolhe o proprietário pelo token válido ou pelo identificador de visitante. Um token inválido retorna 401, nunca cai silenciosamente no carrinho visitante.

| Método/recurso | Operação |
| --- | --- |
| GET `/cart` | Cart com linhas, edição, estoque livre, versão, cupom, revisão, totais e purchasable |
| POST `/cart/merge` | Autenticado; transfere linhas do visitante para o usuário e esvazia origem; repetição não duplica |
| POST `/cart/items` | `{ nftId, edition, quantity }`; Idempotency-Key evita repetir a inclusão |
| PATCH `/cart/items/:id` | `{ quantity }`, valida inteiro positivo e estoque por edição |
| DELETE `/cart/items/:id` | Remove linha do próprio carrinho |
| PUT/DELETE `/cart/coupon` | Aplica `{ code }` ou remove cupom; KURIO10 concede 10%, EXPIRED retorna 410 e demais códigos 422 |
| GET `/wallets` | Carteiras do usuário e conexão simulada |
| PUT `/wallets/:slot` | Cadastro/edição de primary ou secondary; valida campos, rede, endereço e conflito |
| POST `/wallets/:id/connection` | `{ action: connect ou disconnect }`; conexão validada pelo servidor simulado |
| POST `/quotes` | `{ walletId, network }`; snapshot com id, itens/totais, carteira/rede e validade de 120 s |
| POST `/orders` | `{ quoteId, collector }` com Idempotency-Key; revalida cotação e reserva estoque antes de responder |
| GET `/orders/:id` | Pedido próprio com estado, versão e snapshot; recurso alheio/inexistente retorna 404 |

Erros `{ code, message, fields? }`: 400 formato/chave, 401 sessão, 404 recurso, 409 estoque/conexão/rede/cotação/idempotência, 410 cupom expirado, 422 validação, 503 indisponibilidade. Componentes não fabricam respostas de negócio.

## Precisão, estoque e cotação

ETH trafega como string decimal. `ethToWei`/`weiToEth` usam bigint; subtotal, desconto e taxas são calculados exclusivamente no mock. Desconto de 10% arredonda para baixo em wei. A interface apresenta Totals retornados pela API. Taxa Ethereum 0.0016 ETH, Polygon 0.0001 ETH e Solana 0.00005 ETH, valores fictícios fixos da demonstração.

Edições têm contadores próprios persistidos em `kurio.mock-inventory.v1`, mantendo a distribuição inicial do detalhe. A reserva decrementa a edição escolhida e o total do catálogo; recusa devolve exatamente as unidades reservadas. Atualizações incrementam versão e passam pelo cliente Socket.IO existente. Hidratação restaura estoque após refresh. Alterações explícitas de disponibilidade via endpoint demo redistribuem o estoque livre; alteração só de preço preserva os contadores por edição.

O carrinho pode conter redes diferentes, mas cada pedido usa uma única rede: antes de pagar, separe os itens por rede. Carteira, conexão e rede devem corresponder aos NFTs. Não existe ponte blockchain simulada. O resumo do carrinho estima a taxa Ethereum; a cotação final usa a rede selecionada.

A cotação guarda fingerprint de itens, versões, disponibilidade, revisão/cupom/expiração, carteira e conexão. Mudança ou expiração exige nova revisão e confirmação; o backend verifica mesmo que a UI ainda não tenha recebido atualização. A UI compara o snapshot revisado com o carrinho, carteira e formulário atuais. O stream público invalida REST e informa atualização ao usuário.

## Persistência, cache e sessão

`kurio.mock-commerce.v1` guarda carrinhos por proprietário, carteiras, cotações, pedidos e índice idempotente. `session-store.ts` continua sendo a única fonte de sessão. Logout desconecta somente as carteiras daquele usuário. Nenhuma senha de carteira ou seed phrase é solicitada.

Chaves Query: `['guest', guestId, 'cart']` para visitante; `['private', userId, 'cart'|'wallets']` e `['private', userId, 'order', orderId]` para dados privados. Sessão é verificada antes de consultar. Queries recebem AbortSignal; mutations cancelam leituras concorrentes e só atualizam cache se o token capturado ainda for o atual. O lifecycle existente cancela/remove dados privados ao sair, expirar ou trocar de usuário. A incorporação do visitante é idempotente e não trunca quantidades silenciosamente: excesso após merge exige ajuste explícito.

O rascunho do checkout e a tentativa enviada ficam em `kurio.checkout-draft.<userId>` e `kurio.checkout-attempt.<userId>`. São dados locais da apresentação, separados da fonte REST. Após expiração/login, o mesmo usuário retoma campos, seleção e tentativa; outro usuário não recebe esse conteúdo pela UI. Sem storage funcional, a recuperação fica limitada à memória e perde o refresh. A persistência local entre abas não é transacional; isto não substitui backend/autenticação de produção.

Consultas de carrinho/carteiras/pedido são stale imediatamente e reconciliam ao montar/focar. GET pode repetir uma vez em falha transitória conforme política Query existente. Mutations não têm retry automático. Pedidos pendentes são consultados a cada 1 s; a simulação aplica o resultado ao consultar depois de readyAt. Estado terminal não é reprocessado e para de fazer polling.

## Idempotência e recibo

Antes do primeiro envio, o cliente persiste chave e payload. Em erro de rede/timeout sem confirmação, só oferece recuperar essa tentativa. Mesma chave e conteúdo devolvem o mesmo pedido, inclusive depois de a cotação expirar; chave reutilizada com conteúdo diferente retorna 409. Erros definitivos de validação/cotação liberam uma nova revisão; 401 preserva a tentativa para reautenticação.

A criação reserva estoque uma vez e registra pending. Somente resposta REST confirmed abre o recibo. Recusa preserva linhas/cupom e libera estoque; confirmação desconta apenas quantidades das linhas compradas, preservando inclusões posteriores. O recibo usa cópias dos itens, totais, carteira e colecionador, sem consultar preço atual. Referência `sim-<id>` não corresponde a transação blockchain e não gera link de explorador real.

## Cenários e reprodução

Use `npm run dev`, credenciais Ana/Bruno documentadas no README. Adicione uma edição disponível no detalhe. Em Carteiras, use endereço fictício Ethereum `0x1111111111111111111111111111111111111111`, provedor MetaMask, demais campos de identificação e indicação fictícios. Conecte no checkout, revise e confirme.

`POST /api/demo/commerce` com `{ action }` permite `reset`, `confirmed`, `declined`, `timeout`, `pending`, `settle`, `reject-connection`, `disconnect`, `expire-quotes` e `expire-coupon`. `timeout` registra pedido e espera 11 s antes da primeira resposta, excedendo o timeout Axios de 10 s; repetição da chave retorna imediatamente o pedido já registrado. `pending` aguarda `settle`; a leitura seguinte aplica o resultado. Cenários de pagamento ficam em memória para novas criações; pedidos existentes preservam outcome/readyAt no storage e continuam recuperáveis após refresh.

`POST /api/demo/scenario` controla slow/error/offline conforme contrato existente. A troca de cenário restaura preços de fixture mantendo reservas de estoque; o reset de comércio restaura banco e inventário. A inicialização da página restaura o cenário de rede configurado, portanto simule falhas e navegue por links sem reload. `POST /api/demo/favorites/read-delay` com `{milliseconds:1800}` permite verificar estabilidade do botão de compra enquanto favoritos carregam.

## Design e acessibilidade

D03/D04/D05/D09 e M03/M04 foram recortados do SVG original e inspecionados. Reuso de PurchaseLayout, AccountLayout, QuantityInput, FormField, skeletons e Radix Dialog. Desktop preserva tabela/resumo e formulário em duas colunas. Mobile usa cards compactos de itens, cupom com botão na mesma linha e, no pagamento, carteiras/resumo antes dos campos do colecionador. Os campos desktop não são omitidos no mobile. Navegação inferior/header mobile cedem espaço ao retorno e título; rodapé fica no desktop do fluxo de compra.

Dialog de recibo tem nome acessível, foco no título e retorno ao gatilho com Escape. Endereços/IDs quebram linha. Feedback por texto e roles; estados de carregamento reservam dimensões. O slot de favoritos mantém altura mínima para evitar deslocar Comprar durante uma resposta concorrente. ENS é opcional para não exigir um nome Ethereum de carteiras sem ENS, inclusive Solana; os demais campos obrigatórios são validados. IBM Plex Mono e footer compartilhado seguem adaptações já documentadas; não se declara fidelidade integral ao SVG.

## Validação

Resultados reais, capturas, falhas e limitações de cobertura serão registrados em `CART_CHECKOUT_VALIDATION.md`. A feature seguinte deverá substituir/complementar o polling por eventos privados de pedido e testar reconexão/duplicatas. Edição de perfil/avatar/senha ainda impede declarar os 12 grupos do desafio inteiramente concluídos.
