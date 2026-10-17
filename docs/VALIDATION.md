# Validação da configuração inicial

Execução em 17/10/2026, Windows, Node 22.18.0 e npm 10.9.3. Escopo: configuração inicial e design system; não é certificação do marketplace completo.

## Git e preservação do trabalho

O working tree inicial **não estava limpo** e `feature/project-setup` já existia. O candidato autorizou revisar, completar e incorporar esses arquivos. Nenhuma alteração local foi descartada. `git fetch origin` foi executado; `develop` e `origin/develop` estavam no mesmo commit `72138a3`, ancestral da feature. Não foi necessário avançar develop. O commit anterior `4169cf0` contém regras e análise visual e foi preservado. Não houve merge, rebase, reset ou alteração de autoria.

## Comandos e resultados

| Comando | Resultado observado |
| --- | --- |
| `npm install` | Sucesso; lockfile existente resolvido, dependências atualizadas em disco |
| `npm run typecheck` | Sucesso, sem erros |
| `npm run lint` | Sucesso, sem avisos ESLint |
| `npm run build` | Sucesso, modo demo, imagens/fontes/MSW incluídos |
| `npm test` | 4 testes aprovados: REST/MSW e cliente Socket.IO real |
| `npx playwright install chromium` | Sucesso |
| `npm run test:e2e -- --update-snapshots` | 21 aprovados; criação das seis baselines |
| `npm run test:e2e` | 21 aprovados em 54,2 s, sem atualização de baselines |
| `npm run audit:lighthouse` | Sucesso após correção do launcher; seis medições da página inicial |
| `git diff --check` | Sucesso |
| `git diff --cached --check` | Sucesso antes dos commits |

O build informou um chunk da aplicação de aproximadamente 534 kB (173 kB gzip), acima do aviso padrão de 500 kB. Separação de rotas/componentes poderá reduzir o carregamento inicial; o limite não foi aumentado para esconder o aviso.

### Falhas encontradas e correções

- Primeira execução Vitest: EPERM ao renomear cache temporário no sandbox; repetida com permissão de execução apropriada.
- Execução seguinte: três testes REST passaram, mas Socket.IO não conectou porque o transporte Node usa `ws`. O alias de teste passou a carregar a distribuição real de navegador, interceptada pelo MSW. Os quatro testes passaram após a correção.
- Skeleton tinha colunas diferentes dos cards: corrigida a composição responsiva. Modal recebeu limite de altura, rolagem e área de fechar de 44 px.
- Primeiro Lighthouse: `spawn UNKNOWN` no chrome-launcher, antes de gerar métricas. O script foi adaptado para iniciar Chromium pelo Playwright.

## Evidências e comparação visual

Os sete SVGs foram lidos. A prancha original foi rasterizada em memória com o recorte D01, sem modificar o arquivo. As seis baselines foram inspecionadas visualmente, incluindo comparação da identidade com D01. Cores e imagens preservam a referência; hero, grade e footer são composições iniciais simplificadas. Não há alegação de fidelidade integral. A fonte IBM Plex Mono é substituição documentada.

- [Início desktop](../tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-desktop-win32.png)
- [Início tablet](../tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-tablet-win32.png)
- [Início mobile](../tests/e2e/setup.spec.ts-snapshots/catalog-shell-chromium-mobile-win32.png)
- [Componentes desktop](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-desktop-win32.png)
- [Componentes tablet](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-tablet-win32.png)
- [Componentes mobile](../tests/e2e/setup.spec.ts-snapshots/design-system-chromium-mobile-win32.png)

Playwright valida 1440, 768 e 390 px, ausência de overflow horizontal nas duas páginas, busca/refresh, navegação direta/404, foco do modal, drawer, campos, quantidade, estados de rede e alteração de preço via Socket.IO. Relatório HTML em `playwright-report/index.html`; traces são retidos em caso de falha. A barra mobile aparece na posição do viewport inicial nas capturas de página inteira por ser fixa; a página possui espaço inferior para permitir alcançar o conteúdo ao rolar.

## Cobertura dos grupos do desafio

| Grupo | Estado nesta feature |
| --- | --- |
| 1 — catálogo | Parcial: busca e refresh; filtros combinados, ordenação, paginação e histórico pendentes |
| 2 — detalhe | Pendente; rota de preparação não é detalhe funcional |
| 3 — sessão | Pendente |
| 4 — favoritos | Pendente |
| 5 — carrinho | Pendente; controle de quantidade testado apenas como componente |
| 6 — compra | Pendente |
| 7 — falhas/idempotência | Pendente |
| 8 — perfil/carteiras | Pendente; validação demonstrativa não salva conta |
| 9 — realtime no checkout | Parcial: atualização de catálogo real; checkout pendente |
| 10 — eventos/reconexão/pedido | Parcial: duplicatas, antigos e cleanup na integração; pedidos pendentes |
| 11 — teclado/foco/formulários | Parcial: modal, drawer e campo demonstrativo |
| 12 — carregamento/erro | Cobertura da base: slow, vazio, 503 e recuperação |

Os testes pendentes não foram criados como casos artificialmente aprovados ou ignorados. Devem acompanhar as features funcionais correspondentes. Deploy e auditoria do detalhe também permanecem fora desta etapa.

## Lighthouse no build otimizado

Três execuções sequenciais por perfil, cenário padrão MSW, sem testes E2E concorrentes. Lighthouse 12.6.1, Headless Chromium 156.0.8078.4, Windows 10.0.26200, AMD Ryzen 5 7520U, aproximadamente 6 GiB de RAM disponível ao sistema. Perfis padrão Lighthouse mobile e desktop; mobile com CPU simulada 4× e RTT de 150 ms. A URL auditada foi `http://127.0.0.1:4175/`. O launcher usa a porta de depuração 9223, que precisa estar livre.

| Mediana | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 93 | 100 | 100 | 92 | 2367 ms | 0 | 247 ms |
| Desktop | 100 | 100 | 100 | 92 | 616 ms | 0,000110 | 0 ms |

As metas foram atendidas **na página inicial desta etapa**. Não extrapolar para detalhe, checkout ou aplicação final. O relatório aponta oportunidades em JavaScript não utilizado, descoberta da imagem LCP e dimensionamento de imagens. SEO 92 inclui a ausência de um robots.txt válido (o fallback SPA responde HTML); publicação deverá definir essa política. Não foram removidos mocks, imagens ou fontes para melhorar a medição.

[Resumo com todas as execuções](reports/lighthouse/summary.json), [HTML mobile](reports/lighthouse/mobile-1.html), [HTML desktop](reports/lighthouse/desktop-1.html) e respectivos JSONs estão versionados em `docs/reports/lighthouse/`. [Relatório Playwright](reports/playwright/index.html) também está preservado. Execuções futuras continuam gerando relatórios nos diretórios ignorados `reports/` e `playwright-report/`, para não sobrescrever silenciosamente esta evidência.
