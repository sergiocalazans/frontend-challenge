# Tokens, componentes e layouts

Esta feature complementa a base integrada no PR de setup. Não recria as primitivas shadcn nem implementa autenticação e compra.

## Fonte visual e composição

Foram lidos `CHALLENGE.md`, `design/DESIGN_SPEC.md`, `design/FRAME_MAP.md` e a prancha SVG original. Os recortes D08 (perfil), D04 (pagamento) e M04 (pagamento mobile) foram renderizados com Sharp e inspecionados. Os PNGs de referência são temporários; nenhum recorte de tela é usado na interface.

| Fonte | Implementação | Limite |
| --- | --- | --- |
| D08/D09: sidebar de 310 px | `AccountLayout`, aplicado em perfil/carteiras e no laboratório | Conteúdo de conta continua explicitamente pendente |
| D08: conteúdo inicia em x local 458, após sidebar em 120–430 | Gap de conta de 28 px | Demais espaçamentos são decisões CSS |
| D04: resumo ocupa aproximadamente 405 px | `PurchaseLayout`, com slots de conteúdo e resumo | Exibido no laboratório; não contém cotação fictícia |
| D04/M04: desktop em colunas; mobile vertical | Colunas a partir de 1024 px; abaixo disso, conteúdo seguido do resumo | Breakpoint é decisão nossa; M04 representa uma etapa distinta do desktop |
| Paleta e raios documentados | `src/styles/tokens.css` | Tipografia IBM Plex Mono permanece substituição local |

O layout de conta mobile é uma adaptação: não existe frame original correspondente. Header, hero e footer herdados continuam simplificados. As capturas verificam regressão da implementação, não equivalência integral com Figma.

## Contratos dos componentes

- `AccountLayout({ children })`: navegação da conta e região de conteúdo. Não consulta sessão nem concede acesso a dados privados.
- `PurchaseLayout({ children, summary })`: região principal e `aside` com nome acessível. Não calcula ETH, não mantém carrinho nem envia pedidos.
- `FormField`: propriedades do Input, `label`, `hint` e `error`. Cria ID estável com `useId` quando não informado; une IDs de ajuda, erro e descrição externa. O chamador valida e fornece a mensagem. Erro usa texto, `role="alert"` e `aria-invalid`, além da cor.
- `FilterDrawer`: composição do Dialog Radix com controle de foco, Escape e retorno ao trigger; altura limitada ao viewport e rolagem interna. Nesta etapa contém o filtro demonstrativo de rede.
- `DetailSkeleton` e `SummarySkeleton`: estruturas de carregamento com nome acessível, geometria reservada e blocos decorativos ocultos de leitores de tela. O shimmer respeita movimento reduzido. As features futuras devem ajustar as dimensões ao conteúdo definitivo para verificar CLS.

## Tokens e uso

`globals.css` importa Tailwind e `tokens.css`. Tokens semânticos mapeiam variáveis CSS para utilitários como `bg-card`, `text-price` e `border-border`. O mesmo arquivo registra largura máxima, gutter, sidebar, gap de conta e resumo. Alterar um token modifica seus consumidores sem duplicar valores em cada layout.

Layout usa `minmax(0, 1fr)` e filhos `min-w-0` para permitir encolhimento; texto não é escondido com `overflow-x: hidden`. As rotas de conta mantêm navegação ativa via TanStack Router e foco no conteúdo após mudança de pathname.

## Dados e estados

No laboratório: TanStack Query → Axios → handlers MSW → contrato `Nft[]` → filtro demonstrativo controlado → `NftCard`. A condição de vazio considera a lista efetivamente exibida. Loading, erro recuperável, vazio, sucesso e atualização em segundo plano usam o estado da consulta existente. Os skeletons de detalhe/resumo são exemplos explicitamente identificados, sem consultas inventadas.

O formulário apenas verifica formato e informa que não enviou ou salvou dados. O evento demonstrativo continua passando por REST, MSW, Socket.IO Client e invalidação/reconsulta. Não foram alterados contratos de rede ou políticas de cache.

## Verificação

Execute `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` e `npm run test:e2e`. O arquivo `tests/e2e/design-system.spec.ts` cobre associação de erro/ajuda, recuperação do campo, drawer em tela baixa, foco, movimento reduzido, rotas de conta e regressão visual. A suíte existente mantém cobertura de rede, modal, quantidade e catálogo.

Evidências e resultados desta feature: [DESIGN_SYSTEM_VALIDATION.md](DESIGN_SYSTEM_VALIDATION.md).

## Carregamento do laboratório

A rota `/design-system` usa `lazyRouteComponent` do TanStack Router. O import dinâmico entrega a página e suas primitivas de demonstração em um chunk separado. Assim, a página inicial não precisa executar o código exclusivo do laboratório. Não há modo especial para Lighthouse: a mesma divisão vale em desenvolvimento, preview e distribuição. As consultas, mocks, fontes e imagens permanecem habilitados.
