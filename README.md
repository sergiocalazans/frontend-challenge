# Jungle Gaming NFT Marketplace · Kurio

Base inicial do desafio frontend. A marca **KURIO** foi preservada dos SVGs; o nome do projeto continua Jungle Gaming. Requisitos: [CHALLENGE.md](CHALLENGE.md). Referências: [especificação visual](design/DESIGN_SPEC.md) e [mapa de frames](design/FRAME_MAP.md).

## O que esta etapa entrega

Vite + React + TypeScript strict, TanStack Router/Query, Axios, Tailwind v4, componentes shadcn/ui adaptados, MSW, cliente Socket.IO real, Playwright, Vitest e infraestrutura Lighthouse. Há um catálogo de demonstração com quatro imagens originais e busca na URL, além de `/design-system` para experimentar os componentes, estados HTTP e eventos.

**Não é a entrega completa do desafio.** Compra, sessão, cadastro, perfil, manutenção de carteiras, favoritos, pedidos e detalhes têm rotas de preparação claramente identificadas. Não existem credenciais de login nesta etapa, contas reais, cobrança nem integração blockchain. As quatro obras são fixtures de demonstração.

## Executar

Requer Node.js 22.12+ e npm. Validado com Node 22.18.0 e npm 10.9.3. O lockfile está versionado.

```sh
npm install
npm run dev
```

Abra `http://127.0.0.1:5173`. O modo `demo` inicia o MSW antes de importar a aplicação e o Socket.IO. O navegador precisa suportar Service Worker; localhost e HTTPS são contextos válidos.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

O preview serve o build otimizado em `http://127.0.0.1:4173`. **`build` inclui mocks** para demonstração. `build:api` e `dev:api` usam modo production, com mocks desativados por padrão; não existe backend real fornecido. Configure a URL REST/realtime antes de utilizá-los. Não se deve instalar apenas dependências de produção antes de construir: ferramentas e MSW são necessários no build.

## Variáveis e cenários

Veja `.env.example`; não há segredos nas variáveis `VITE_*`, que são públicas no bundle.

| Variável | Padrão / finalidade |
| --- | --- |
| `VITE_ENABLE_MOCKS` | `true` em `.env.demo`; somente a string `true` ativa mocks |
| `VITE_API_BASE_URL` | `/api`; os handlers de demonstração usam o prefixo `/api` |
| `VITE_SOCKET_URL` | origem da página; servidor Socket.IO quando sem mocks |
| `VITE_MOCK_SCENARIO` | `default`, `empty`, `error` ou `slow`; aplicado no bootstrap |

Em `/design-system`, use **Cenário MSW** para alternar sucesso, vazio, falha 503 ou latência de 1800 ms. Voltar a Sucesso restaura os dados. **Simular alteração de preço** altera a fixture via REST, emite `nft.updated` pelo binding MSW/Socket.IO e deixa o cliente invalidar a consulta. Não há setter de preço no componente. Recarregar a página reinicia o cenário configurado; os mocks iniciais são em memória, sem persistência de conta/carrinho.

## Testes e relatórios

```sh
npx playwright install chromium
npm run build
npm run test:e2e
npm run test:report
npm run test:visual
npm run audit:lighthouse
```

Playwright inicia o preview automaticamente e testa Chromium em 390, 768 e 1440 px. Cada teste recebe contexto/worker MSW isolado. O relatório HTML fica em `playwright-report/`; screenshots e traces de falhas em `test-results/`. Baselines em `tests/e2e/` verificam regressões desta base, **não certificam fidelidade ao Figma**. Para atualizar intencionalmente: `npm run test:visual -- --update-snapshots`, seguido de revisão visual e nova execução sem atualização. Baselines produzidas em Windows podem diferir em outro SO.

Vitest testa REST pelos handlers MSW e o cliente Socket.IO real, incluindo versões antigas, duplicatas e cleanup. Os testes atuais não cobrem os 12 grupos completos do desafio: o escopo ainda é configuração/design system.

Lighthouse inicia outro preview em 4175, utiliza o Chromium do Playwright e gera três medições mobile + três desktop da página inicial em `reports/lighthouse/`, incluindo HTML, JSON e medianas. O detalhe real ainda não existe; sua auditoria será adicionada após implementação. Resultados e limites desta execução: [VALIDATION.md](docs/VALIDATION.md).

## Estrutura e materiais de defesa

- `src/app`: inicialização, providers, router e política de cache.
- `src/features`: catálogo e laboratório do design system, com contratos/API separados.
- `src/components/ui`: fonte gerada pelo shadcn/ui, adaptada aos tokens.
- `src/components/shared` e `layout`: composições reutilizáveis e layout.
- `src/lib`: HTTP, ambiente e ciclo de vida realtime.
- `src/mocks`: fixtures, estado, handlers REST e Socket.IO.
- `src/styles`: tokens confirmados e decisões responsivas.
- `tests`: integração e E2E; `scripts`: extração de assets e auditoria.

[ARCHITECTURE.md](ARCHITECTURE.md) explica contratos e decisões. [LEARNING.md](LEARNING.md) orienta a defesa técnica. `npm run assets:extract` reproduz as quatro imagens WebP individuais a partir da prancha original, sem modificá-la. Nenhum SVG de tela inteira é servido como interface.

## Publicação

Esta etapa não realiza deploy. Um futuro host estático deve servir `dist/`, permitir Service Workers e redirecionar rotas da SPA para `index.html`. O PR tem destino `develop`; merge e publicação dependem de autorização.

## Biblioteca de interface

Acesse `/design-system` para explorar componentes, validação, layouts e estados de rede. `/account/profile` e `/account/wallets` demonstram a navegação do layout de conta; edição e sessão continuam pendentes. Consulte [guia do design system](docs/DESIGN_SYSTEM.md) e [validação desta feature](docs/DESIGN_SYSTEM_VALIDATION.md) para contratos de componentes, decisões baseadas nos SVGs e evidências.

## Catálogo funcional

O início permite buscar por nome, combinar categoria/rede/faixa ETH, ordenar e paginar. A URL preserva essa combinação no refresh e no histórico. Existem 24 NFTs simulados, com nove itens por página e quatro imagens locais reutilizadas. Os cards navegam para a rota de detalhe, cujo fluxo ainda está pendente.

No laboratório, os cenários adicionais `race`, `offline` e `flaky` exercitam respostas fora de ordem, falha de conexão e recuperação. Selecione um cenário e volte ao início pelos links internos; refresh reinicia o cenário configurado em `VITE_MOCK_SCENARIO`. `race` atrasa a busca exata Emerald; `flaky` falha nas duas primeiras consultas do cenário. Consulte [guia do catálogo](docs/CATALOG.md) e [resultados desta feature](docs/CATALOG_VALIDATION.md).

O Playwright usa um worker por padrão para reduzir contenção entre processos Chromium. Os testes de concorrência continuam disparando requisições sobrepostas no navegador, sem alteração de timeout ou retries para esconder falhas.
# Detalhes e favoritos

Abra `/nfts/emerald-ape`; edições e quantidade podem ser preservadas por `?edition=fifty&quantity=4`. Galeria, estoque e favoritos usam REST/MSW; eventos de preço/estoque passam pelo Socket.IO real. Esta branch é independente do PR de autenticação: consulte [contrato de sessão, fixtures e limites de integração](docs/NFT_DETAILS.md). Comprar encaminha a seleção ao carrinho ainda em desenvolvimento. `npm run audit:lighthouse` agora mede início e detalhe, três vezes por perfil.
