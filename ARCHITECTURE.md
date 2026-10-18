# Arquitetura da configuração inicial

## Escopo e fluxo

`main.tsx` carrega estilos/fontes locais → inicia MSW se configurado → importa `app/mount.tsx` → cria QueryClient e Router → renderiza o layout e a rota. A importação tardia é intencional: Socket.IO deve capturar o WebSocket já interceptado. Falha no bootstrap mostra mensagem acessível, sem iniciar uma demonstração parcialmente conectada.

Os componentes recebem dados e callbacks. `features/catalog/api.ts` concentra consultas via Axios e transmite AbortSignal do TanStack Query. As fixtures vivem exclusivamente em `mocks/`. O código funcional não busca respostas falsas dentro de componentes.

O roteamento é declarado em código, sem geração de arquivos, para manter a base pequena e compreensível. A tabela em `app/router.tsx` fornece links tipados, valida busca `q`, restauração de scroll, estado de erro e 404. Os fluxos privados ainda são placeholders sem dados privados; não existe proteção de sessão implementada nem sucesso de autenticação simulado.

## Contratos implementados

| Recurso | Contrato | Resposta |
| --- | --- | --- |
| Catálogo inicial | `GET /api/nfts?q=texto` | `{ items: Nft[] }`; busca por nome; 503 no cenário error |
| Controle de demonstração | `POST /api/demo/scenario` com `{ scenario }` | cenário aplicado; 400 para valor inválido; restaura fixtures |
| Evento de demonstração | `POST /api/demo/nfts/:id/update` | alterna preço de exemplo, incrementa versão, emite evento; 404 se inexistente |

Endpoints `/demo` existem apenas no MSW, carregado por configuração. Não são uma API de negócio nem devem ser enviados a um backend real. O catálogo inicial não implementa paginação/ordenação/filtros combinados da entrega final. Filtro de rede no laboratório é uma demonstração local do componente, não esse contrato futuro.

`Nft` contém `id`, `name`, `image`, `imageAlt`, `priceEth` como string decimal, `network`, `available` inteiro e `version`. ETH é exibido diretamente; nenhum total monetário usa `number`. Na feature de cotação será necessário um contrato de precisão adequado, por exemplo wei/BigInt ou biblioteca decimal. Typescript tipa o contrato, mas não valida um backend desconhecido em runtime; um schema de validação deve acompanhar a futura integração real.

## Cache e HTTP

- Uma instância Axios, base URL configurável, timeout de 10 segundos; cancelamento via signal.
- Chave `['catalog', 'list', q]`, separando termos de busca e evitando que respostas atrasadas sobrescrevam outro termo.
- Dados frescos por 30 segundos; descarte após 5 minutos sem observadores; refetch ao focar janela.
- No máximo um retry de consulta para erro de rede/5xx; 4xx não recebe retry; mutations não repetem automaticamente.
- Loading inicial apresenta skeletons; atualização em segundo plano mantém cards e informa atualização; erro tem retry; vazio possui mensagem própria.
- Ainda não há cache privado, autenticação ou atualização otimista de negócio. Na próxima etapa, chaves privadas deverão incluir usuário e ser removidas com subscriptions ao trocar/encerrar sessão. Rollback de interação otimista continua pendente do desafio.

## Realtime e mocks

`createMarketSocket` retorna instância sem conectar automaticamente, com transporte WebSocket, reconexão habilitada e cinco tentativas. `subscribeToCatalog` conecta e registra handlers; cada conexão/reconexão invalida o catálogo para reconciliar com REST. `nft.updated` carrega `eventId`, `nftId` e `version`; versões repetidas/antigas por NFT são ignoradas. Cleanup remove os handlers, desconecta e descarta versões. Isso permite o ciclo extra de effects do StrictMode sem listeners persistentes.

O binding `@mswjs/socket.io-binding` traduz mensagens no protocolo Socket.IO; os testes usam `socket.io-client`, não substitutos de callbacks da UI. A simulação atual opera somente com WebSocket, sem polling, rooms, namespaces ou backend externo. MSW normaliza o caminho de transporte `/socket.io/` para a origem no matching. O mock envia heartbeat Engine.IO a cada 20 segundos e libera o timer ao fechar a conexão. No reset do laboratório, os valores iniciais são restaurados, mas as versões permanecem crescentes enquanto há consumidores conectados; a consulta REST é refeita. Um novo bootstrap começa novamente na versão 1. O reset é uma ferramenta de cenário, não um evento de negócio.

`order.updated` possui tipo preliminar com `userId` e status, mas **não há consumidor de pedidos**, autorização de assinatura ou máquina de estados implementada. Isolamento de sessão, terminais de pedido, recuperação idempotente e reconexão durante checkout permanecem trabalho futuro. Os testes de setup não certificam esses fluxos.

## Design system e decisões visuais

Primitivas baseadas no shadcn/ui (estilo new-york, Radix): Button, Input, Label, Card, Badge, Skeleton, Separator, Dialog e Tabs. Os arquivos são código do projeto; não há dependência de um componente remoto em runtime. `cn` local combina `clsx` e `tailwind-merge`. Tailwind v4 usa `@tailwindcss/vite` e tokens CSS.

- Cores de fundo/superfícies/cobre/texto/bordas vêm de DESIGN_SPEC.md. Tokens semânticos são uma organização nossa, não variáveis recuperadas do Figma.
- `#F0805F`, originalmente encontrado em obrigatório, é reaproveitado para feedback de erro como decisão de implementação; erro também tem texto/ícone. Texto secundário usa `#CFB28C`; `#B39463` fica registrado para referência.
- Container máximo 1200 px e margem mobile 24 px vêm das medidas observadas. Botões comuns de 40 px, inputs desktop de 40 px, inputs mobile de 50 px, raio de imagem de 15 px e modal desktop de até 500 px seguem exemplos específicos dos frames.
- Controles de toque usam pelo menos 44 px onde necessário; tamanhos mínimos e foco visível são adaptações de acessibilidade.
- **IBM Plex Mono 400/500/600 local** é uma substituição provisória, não a fonte confirmada do Figma. Os arquivos vêm de `@fontsource/ibm-plex-mono`; sem dependência de Google Fonts em runtime. Comparação visual posterior e fonte original continuam pendentes.
- Breakpoints Tailwind (640/768/1024) e navegação mobile fixa são decisões de implementação; não foram extraídos do SVG. Verificação ocorre nos viewports exigidos 390/768/1440.
- Hero e catálogo desta etapa são uma composição inicial para validar a base; não reproduzem toda D01. A grade demonstrativa tem quatro cards; sidebar, filtros e conta são componentes avaliados em `/design-system`. Footer foi reduzido às rotas existentes, evitando ações que aparentem funcionar sem implementação.
- A marca KURIO foi mantida conforme SVG; a diferença com Jungle Gaming está explícita. Fontes, espaçamentos tipográficos e layouts ausentes exigem decisões documentadas, não declaração de fidelidade completa.
- As quatro imagens originais foram extraídas, reduzidas para 640 px e convertidas para WebP quality 85. Os SVGs originais são preservados. Lucide complementa a iconografia como substituição documentada; os seis SVGs de ícones originais continuam disponíveis para comparação posterior.

O Dialog fornece foco preso/restaurado, Escape, título e descrição, rolagem interna em telas baixas e botão de fechar com área de 44 px. A composição lateral reutiliza Dialog e o filtro controlado. Tabs são Radix e usam teclado. Skeleton shimmer respeita `prefers-reduced-motion` e acompanha as colunas da grade de destino. Campos têm label e associação de erro; busca e navegação possuem nomes acessíveis; há link de pular conteúdo e foco no main após mudar pathname.

## Qualidade e próximos passos

Vitest integra REST/MSW e Socket.IO; Playwright usa o build de demonstração e observa UI/URL, foco, validação, estados e atualização realtime. As baselines são da implementação inicial, não do Figma. Lighthouse executa o mesmo build com imagens/fontes/mocks carregados, três vezes por perfil; falta adicionar detalhe real e auditar os fluxos completos.

No Vitest, um alias carrega a distribuição de navegador real de `socket.io-client`. O transporte padrão do pacote em Node usa `ws`, que não passa pelo WebSocket global interceptado pelo MSW. Não se substituem eventos ou callbacks por mocks do cliente. Referência: [limitação do transporte Node no binding](https://github.com/mswjs/socket.io-binding/issues/15).

As próximas features devem implementar contratos de sessão, catálogo completo, favoritos, carrinho/cotação, checkout/pedidos, perfil e carteiras, com seus estados e documentação. Os 12 grupos E2E e os relatórios finais de performance ainda não estão completos. Evidências da etapa: [docs/VALIDATION.md](docs/VALIDATION.md).

## Evolução: tokens, componentes e layouts

A base visual agora separa tokens de regras globais e oferece composições de conta/compra, FormField, drawer e skeletons específicos. Os contratos, fontes dos valores e limites estão em [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md). As rotas de perfil e carteiras compartilham a sidebar; seu conteúdo ainda é de preparação e não expõe dados privados. A composição de compra é demonstrada no laboratório, sem cotação ou pedido inventado. Resultados incrementais em [docs/DESIGN_SYSTEM_VALIDATION.md](docs/DESIGN_SYSTEM_VALIDATION.md).

A rota do laboratório é carregada sob demanda por `lazyRouteComponent`; a primeira visita baixa seu chunk separado. Isso retirou cerca de 70 kB do chunk principal nesta feature. A divisão não altera a ativação do MSW nem fornece um caminho especial de auditoria.

## Catálogo com URL e paginação

O contrato de listagem foi ampliado para `{ items, total, page, pageSize, totalPages }`, com busca, categoria, rede, faixa ETH e ordenação no servidor MSW. A chave Query contém todos os parâmetros; o parser de URL mantém texto decimal e o Axios consome AbortSignal. Eventos Socket.IO invalidam as listas, para reavaliar filtros e ordenação. O mock não emite mais um evento inicial por NFT, pois a conexão já reconcilia por REST.

Detalhes do contrato, decisões visuais, política de estado e cenários estão em [docs/CATALOG.md](docs/CATALOG.md); resultados reais em [docs/CATALOG_VALIDATION.md](docs/CATALOG_VALIDATION.md). A descrição antiga da chave apenas por `q` e do catálogo de quatro itens refere-se ao setup e foi substituída por esta evolução. O laboratório continua solicitando quatro itens para seus exemplos.
## Histórico: detalhes e favoritos independentes

`docs/NFT_DETAILS.md` define REST, edições, seleção na URL, favoritos otimistas e reconciliação do detalhe por Socket.IO. Na entrega original do PR #5, sessão era consumida por contrato em branch independente de autenticação por escolha do usuário. O bridge MSW então resolvia o mesmo formato de token/banco persistido e fornece fixtures; na integração, authHandlers devem preceder o fallback GET de sessão. Chaves privadas incluem userId, mutations atrasadas verificam identidade e 401 limpa cache. A ação de compra apenas transmite seleção ao carrinho ainda pendente; não há confirmação de inclusão ou compra. Essa implementação provisória foi substituída pela integração descrita a seguir.

## Autenticação e favoritos integrados

`session-store.ts` é a única fonte dos mocks para contas e sessões, em memória no Node e localStorage no browser. Auth e favoritos revalidam o token nessa fonte; componentes não acessam o banco simulado. `useSession`/`SessionLifecycle` centralizam recuperação e invalidação, e Axios preserva Authorization explícito. `['private', userId, 'favorites']` isola o cache; logout/troca/401 cancelam e removem dados privados. Mutations capturam o token e descartam resultados de identidades anteriores. Logout compara token antes e depois do cancelamento. A troca entre abas reseta a consulta de sessão, mantendo a proteção em skeleton durante a verificação.

## Comércio com cotação e pedidos

Contratos e regras em [docs/CART_CHECKOUT.md](docs/CART_CHECKOUT.md). Carrinho/carteiras/cotação/pedido passam por Axios/MSW. O mock persiste inventário por edição e dados por proprietário; o cliente usa cache privado e rascunho por usuário. A cotação é a referência do fechamento; o backend compara fingerprint e reserva estoque antes de registrar pending. Idempotência precede revalidação de cotação ao recuperar uma tentativa existente. GET de pedido reconcilia o resultado e produz recibo imutável. Valores usam bigint no mock e strings no transporte.

O stream público existente invalida carrinho/catálogo e informa mudanças. Polling recupera pedido nesta etapa; canais privados, order.updated e reconexão são a próxima feature. As branches serão sequenciais, aguardando merge autorizado entre elas. Nenhum resultado parcial equivale à conclusão dos 12 grupos do desafio.

## Eventos privados e recuperação

`docs/REALTIME.md` documenta autenticação de subscriptions e limitações do binding. O servidor simulado valida a sessão a cada envio e filtra o proprietário. O cliente filtra ID/versão/recurso/sessão e invalida REST em vez de aplicar status do evento ao recibo. Conexão e reconexão reconsultam o pedido ativo; polling de 15 s é fallback. Encerramento remove listeners, timers e conexão. O PR independente de auditorias não incorpora esta branch até integração autorizada.
