# Catálogo, busca, filtros e paginação

## Escopo

O início oferece busca por nome, categoria, rede, mínimo/máximo em ETH, ordenação e páginas de nove NFTs. Filtros são combináveis e executados no MSW, na camada REST. Cards navegam para `/nfts/$nftId`; a implementação do detalhe continua separada. Não foram adicionadas compras ou favoritos fictícios.

## URL e fluxo de dados

1. TanStack Router interpreta os parâmetros como texto; isso preserva ETH com até 18 casas decimais e buscas numéricas em links diretos.
2. `validateCatalogSearch` limita a busca a 120 caracteres e valida enums, preços e página. Valores inválidos da navegação recebem defaults seguros; limites de preço invertidos são descartados juntos. A URL original inválida não é reescrita automaticamente; a próxima interação escreve o estado validado.
3. Qualquer alteração de busca, filtro ou ordenação reinicia a página. Cada navegação entra no histórico; voltar/avançar e refresh restauram os controles. Os inputs de preço mantêm um rascunho até Aplicar; valores inválidos exibem erro associado aos campos, sem navegar.
4. `catalogOptions` cria uma chave Query com todos os parâmetros, incluindo tamanho da página, e os envia ao Axios. O AbortSignal cancela a consulta que deixou de ser observada. Chaves distintas impedem respostas antigas de substituir a busca atual.
5. O handler MSW valida o contrato, filtra, ordena com desempate estável, conta resultados e recorta a página. Não há filtro de negócio ou paginação sobre a lista no componente de catálogo.
6. A página apresenta skeletons, resultados, vazio, erro recuperável ou página fora do intervalo. Refetch em segundo plano preserva os dados da mesma consulta e informa atualização; falha nesse refetch mantém os cards com feedback de erro.

Exemplo: `/?network=Ethereum&category=art&minPrice=1.20&maxPrice=2.00&sort=price-desc` retorna Neon Vessel e Cosmic Bloom, nessa ordem. A busca por Cosmic restringe ainda mais essa combinação. Limpar filtros preserva busca/ordenação; Limpar busca e filtros volta à visão inicial.

## Contrato REST

`GET /api/nfts`

| Parâmetro | Regra/default |
| --- | --- |
| `q` | Busca por trecho do nome, sem distinção entre maiúsculas/minúsculas; até 120 caracteres |
| `network` | Ethereum, Polygon ou Solana; ausente = todas |
| `category` | art, photography, music, 3d, collectibles, generative, games, memberships, utility; ausente = todas |
| `minPrice`, `maxPrice` | Strings decimais não negativas: até 9 dígitos inteiros e 18 decimais; limites inclusivos |
| `sort` | featured (ordem determinística das fixtures), newest, price-asc ou price-desc |
| `page` | Inteiro de 1 a 100000, default 1 |
| `pageSize` | 4, 9 ou 18; default 9; laboratório usa 4 |

Resposta: `{ items: Nft[], total, page, pageSize, totalPages }`. `Nft` mantém os campos anteriores e acrescenta `category` e `listedAt` (ISO). `priceEth` continua string; nenhum cálculo/comparação monetária passa por Number. `ethToWei` converte strings validadas para BigInt para comparação. Não há BigInt no JSON.

Parâmetros REST inválidos, repetidos ou desconhecidos retornam 400 `INVALID_CATALOG_QUERY`. Filtro sem correspondência retorna 200 com `total: 0`, `totalPages: 0` e `items: []`. Página além da última retorna 200 com total preservado e itens vazios; a UI oferece retorno à primeira página preservando os filtros. Isso também cobre uma página que ficou vazia após mudança de dados.

Ordenação por preço usa wei e, em empate, ID. Ordenação por data usa timestamp ISO e, em empate, ID. A paginação ocorre depois da ordenação, sem repetição entre páginas no mesmo snapshot.

## Cache, eventos e cenários

A política herdada continua: 30 s de staleTime, 5 min de gcTime, refetch ao focar, um retry de consulta para rede/5xx e nenhum retry de mutation. A chave agora inclui a consulta completa. Ao mudar parâmetros, não se exibe o resultado anterior como se pertencesse à nova combinação.

O cliente Socket.IO permanece real. Conexão/reconexão invalida o catálogo e consulta REST; eventos `nft.updated` posteriores invalidam todas as chaves de catálogo, incluindo filtros/ordens que possam ser afetados pelo preço. O mock deixou de enviar um evento inicial por fixture: REST já fornece o snapshot na conexão, evitando 24 invalidações redundantes. Deduplicação/versionamento e cleanup permanecem testados.

Fixtures: 24 IDs estáveis, nove categorias, três redes, preços de 0.02 a 12.30 ETH, datas fixas e itens esgotados. Os quatro assets originais são reutilizados; categorias e novos nomes/datas são dados simulados, não uma afirmação de que o SVG contém 24 artes distintas.

Selecione os cenários em `/design-system` e navegue para Início pelos links internos, ou configure `VITE_MOCK_SCENARIO`:

- `default`: sucesso; `empty`: lista vazia; `error`: HTTP 503; `slow`: 1800 ms.
- `race`: busca exata Emerald espera 2400 ms; demais buscas 150 ms. O handler captura os dados antes de esperar, reproduzindo uma resposta antiga. A UI cancela a consulta anterior.
- `offline`: falha de conexão via `HttpResponse.error()`.
- `flaky`: as duas primeiras requisições de catálogo falham com 503; as seguintes passam. Com o retry atual, a interface mostra erro e permite nova tentativa. O contador pertence ao cenário, inclusive no laboratório.

O POST `/api/demo/scenario` restaura as fixtures e os contadores. Cenários/dados vivem na memória da sessão de demonstração; recarregar inicia o cenário configurado no ambiente. A URL do catálogo, por sua vez, sobrevive ao refresh. Persistência privada e sessão ainda são futuras features.

## Design e acessibilidade

Foram lidos o enunciado e os documentos de análise e renderizados/inspecionados D01 (catálogo desktop) e M01 (mobile) diretamente do SVG. Desktop usa sidebar de 310 px, gap de 48 px e três colunas com intervalos de 34 px; mobile usa busca antes do hero, duas colunas e filtros em drawer. Tablet usa três colunas, sem sidebar fixa. Preços, paleta cobre, fonte local provisória e imagens vêm da base existente.

O drawer reutiliza Dialog Radix, com foco preso, Escape, rolagem e retorno ao trigger. Filtros usam radio/select nativos e campos com label/erro. Paginação usa links reais com nomes acessíveis, estado ativo e controles desabilitados nas extremidades; áreas de toque são maiores que os 35 px desenhados. Cards mostram rede e disponibilidade em texto.

Desvios explícitos: preço usa dois campos acessíveis em vez do slider visual; as categorias não exibem contagens fictícias; o hero é conteúdo editorial estático, sem carousel sem função; abas Em alta, favoritos, promoções e áreas editoriais não implementadas foram omitidas. O footer continua simplificado e IBM Plex Mono é substituição, não a fonte original confirmada. Não se afirma fidelidade integral ao Figma.

## Arquivos principais e verificação

- `features/catalog/search.ts`: fronteira da URL e parâmetros.
- `features/catalog/contracts.ts` e `api.ts`: transporte tipado e Query.
- `catalog-page.tsx`, `catalog-search.tsx`, `catalog-filters.tsx`, `catalog-pagination.tsx`: composição e interações.
- `lib/eth.ts`: validação e comparação precisa.
- `mocks/catalog.ts`, `fixtures.ts`, `handlers.ts`, `state.ts`, `socket.ts`: simulação de rede e dados.
- `tests/unit/catalog.test.ts`, `tests/unit/network.test.ts`, `tests/e2e/catalog.spec.ts`: contratos, transporte real e comportamento da interface.

Execute typecheck, lint, build, `npm test`, `npm run test:e2e` e `npm run audit:lighthouse`. Resultados reais e limitações: [CATALOG_VALIDATION.md](CATALOG_VALIDATION.md).

Playwright usa um worker para limitar concorrência entre processos no ambiente local. Isso não altera as asserções, latências ou os cenários de requisições concorrentes, que ocorrem dentro de cada teste.
