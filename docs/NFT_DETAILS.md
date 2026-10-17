# Detalhes, edições e favoritos

Branch `feature/nft-details`, criada de `develop` atualizado em `4d87a9d`, com working tree limpo. Independente de `feature/authentication`, conforme escolha do usuário. “Edição” significa tiragem/variante da obra mostrada nos SVGs, não alteração dos metadados do NFT.

## Contratos e dados

| Método/recurso | Resposta/comportamento |
| --- | --- |
| GET `/api/nfts/:id` | NftDetail: Nft + description, collection, attributes, editions, related; inexistente 404 |
| GET `/api/favorites` | `{ ids: string[] }`, exige sessão |
| PUT `/api/favorites/:id` | Inclusão idempotente, retorna lista; 401/404/503 |
| DELETE `/api/favorites/:id` | Remoção idempotente, retorna lista; 401/404/503 |
| GET `/api/session` | Contrato compartilhado `{ user: {id,name,email} \| null }`; token inválido/expirado 401 |
| POST `/api/demo/favorites/fail-next` | Próxima mutation de favorito retorna 503 sem alterar dados |
| POST `/api/demo/details/reset` | Restaura favoritos e duas sessões de fixture conhecidas |
| POST `/api/demo/favorites/hold` | Segura a próxima escrita para exercitar expiração durante envio |
| POST `/api/demo/details/expire` | Expira sessões e libera escritas retidas, que devem retornar 401 |
| POST `/api/demo/details/session` | `{userId:'ana' \| 'bruno'}` → `{token,user}`: fixture de contrato para testar PR independente |
| POST `/api/demo/nfts/:id/update` | Sem corpo alterna preço; `{available: inteiro 0..10000}` altera estoque; emite nft.updated pelo Socket.IO |

NftDetail reutiliza os NFTs do catálogo. Preços continuam strings ETH; nenhuma conta em ponto flutuante. A disponibilidade total é distribuída deterministicamente entre 1/1 (até uma unidade), 1/10 (até três restantes) e 1/50 (saldo). ABERTA está indisponível na fixture. A soma por edição sempre coincide com o catálogo; essas regras são da simulação, não mintagem blockchain. Recomendações são calculadas no handler, excluem o próprio NFT e limitam a quatro da mesma categoria.

## Fluxo da página

Router lê nftId e valida edição/quantidade da URL → TanStack Query usa `['nft-detail',id]` → Axios com AbortSignal → MSW → componentes. Quantidade aceita somente inteiro positivo, é limitada ao estoque atual e reinicia em um ao trocar edição. Seleção indisponível permanece visível, informa esgotamento e bloqueia compra. Um estoque reduzido limita a quantidade efetiva e apresenta feedback.

Galeria usa a imagem original e dois recortes CSS identificados como detalhes; não inventa outras fotografias da obra. Dialog Radix amplia a imagem e gerencia foco/Escape. Tabs apresentam informações e rede; avaliações sem contrato não são inventadas. Loading usa o DetailSkeleton existente com shimmer e movimento reduzido; 404, HTTP/rede, retry, vazio de estoque/recomendações e atualização em segundo plano têm estados próprios.

Comprar NFT navega para `/cart?nftId=...&edition=...&quantity=...`, preservando a seleção como intenção. O carrinho ainda é placeholder nesta branch: nenhuma inclusão, cotação ou compra é declarada como concluída. Sua feature deverá consumir e validar essa intenção na API. A limitação é informada junto da ação.

## Favoritos e isolamento

Chave `['private',userId,'favorites']`; GET recebe token opaco no header Authorization. Favoritar altera o cache otimisticamente depois de cancelar leitura concorrente; falha restaura o snapshot e exibe mensagem. Em seguida a consulta revalida a fonte REST. O botão fica bloqueado enquanto envia. Inclusão/remoção idempotentes evitam duplicatas no servidor simulado.

Favoritos persistem por userId em `kurio.mock-favorites.v1`, no localStorage. Sessão é resolvida pelo contrato persistido `kurio.mock-auth.v1`, com token em `kurio.session-token`, prazo e usuário. A mutation revalida sessão também depois da latência, antes da escrita. Mutation atrasada da identidade anterior não recria cache; 401 limpa token/cache privado e a UI volta ao visitante. Storage events limpam dados privados ao trocar token em outra aba. Não há subscription privada nesta feature.

Sem sessão, Favoritar navega para `/login?returnTo=...` com edição e quantidade preservadas. Login ainda é placeholder nesta branch independente. O PR de autenticação implementa esse destino; **o fluxo integrado login → retorno → favorito não foi validado nem declarado pronto antes dos merges**.

### Integração pendente com autenticação

`detail-session-bridge.ts` só resolve o contrato de sessão persistido e oferece fixture de teste. Não implementa login/cadastro. O [PR de autenticação #4](https://github.com/sergiocalazans/frontend-challenge/pull/4) implementa esse fluxo. O fallback GET `/session` deve ficar **depois** de `authHandlers` na lista MSW ao integrar ambos os PRs; o handler de autenticação passa a responder em primeiro lugar. Ambos usam a mesma chave/formato de sessão, token e IDs de fixture. Campos hash/salt são preservados ao criar fixtures; senhas não são armazenadas em claro.

Os PRs alteram `src/app/router.tsx`, `src/mocks/handlers.ts`, `src/components/layout/app-shell.tsx` e documentação. A integração deverá combinar rotas/handlers de ambos, manter proteções da autenticação e as condições visuais de auth/detail no shell, depois executar testes completos e um E2E de login real seguido de favorito. Não houve merge automático para antecipar essa etapa. Endpoints `/demo` são controles locais de simulação, não autenticação de produção.

## Tempo real

O cliente Socket.IO real usa `subscribeToCatalog`: evento nft.updated válido invalida detalhe e catálogo; a API recalcula preço/estoque/edições. Reconexão reconcilia via REST. Duplicatas/versões antigas são descartadas no helper já testado. Listeners e conexão são liberados ao trocar NFT/desmontar. UI informa conexão e atualização. Nenhum callback de evento altera preço diretamente no componente.

## Design e arquivos principais

D02/M02 inspecionados a partir do SVG original. Desktop: miniaturas verticais, galeria e informações lado a lado; mobile: coluna, imagem dominante, vistas menores sobre a imagem e controles que quebram linha. Header e navegação inferior mobile são substituídos pelo retorno à coleção no detalhe, evitando cobertura dos controles. 390/768/1440 px. IBM Plex Mono substitui a fonte original não identificada. Radios visíveis, labels/feedback, preço em destaque, miniaturas nomeadas e ações fora do escopo explícitas são adaptações; não se declara fidelidade integral.

Arquivos: `features/nft-details/{contracts,api,detail-page,gallery,favorite-button}`, `mocks/{details,detail-session-bridge}`, router, handler de atualização, testes `details.*` e script Lighthouse com início/detalhe.

## Como testar

`npm run dev`, abrir `/nfts/emerald-ape?edition=fifty&quantity=4`; testar galeria, esgotada ABERTA, quantidade e `/nfts/unknown`. Para a sessão de fixture nesta branch, POST `/api/demo/details/session` com `{userId:'ana'}`, salve o token retornado em `kurio.session-token` e recarregue. Faça o mesmo com `bruno` para observar isolamento. Isso prepara o contrato no ambiente de demonstração; não substitui teste de login real após integrar autenticação. POST `fail-next` avalia rollback. Cenários `slow`, `error`, `offline` seguem `/api/demo/scenario`; navegue por links sem reload, pois bootstrap restaura o cenário configurado. Reset restaura favoritos/sessões e invalida tokens antigos.
