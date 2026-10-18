# Preparação da demonstração na Vercel

A auditoria posterior da versão integrada está em [DELIVERY_REPORT.md](../DELIVERY_REPORT.md). **Atualização de 18/10/2026:** o candidato forneceu [a URL pública](https://frontend-challenge-pi-six.vercel.app/), SHA 58188fc7078755f9a627c8c69bb9fa1f6d0d1954. Playwright público: **12/12, 82,52 s**, em três viewports, sem falha/skip/flaky/retry; headers/worker, deep links/refresh, persistência, MSW, cotação e recuperação Socket.IO passaram. HTML/JSON, metadados, HTTP e comparação de worker em docs/reports/delivery/deployment-public. O agente não fez deploy. gitDirty=true foi informado pelo build remoto; não certificamos checkout limpo. Os capítulos abaixo preservam o registro histórico original da preparação; o ensaio local sozinho não comprovava a plataforma.

Branch feature/vercel-deployment, criada de develop f3a6390 e atualizada por fast-forward para 1614b07 após o merge externo do PR #11. Nenhum PR foi mesclado pelo agente. Na entrega original dessa branch ainda não existia URL pública; a validação posterior está no aviso acima.

## Estrutura e decisões

Vite/React/TypeScript strict, TanStack Router no navegador, dist/ estático. Não existe diretório de Vercel Functions/api real. /api é atendido pelo MSW no browser; requisições não interceptadas não devem receber a SPA como falsa resposta REST.

vercel.json usa propriedades atuais de rewrite/header, com filesystem prioritário, fallback para index.html e exclusão de /api, /assets, /images, worker e build-info. Referências oficiais consultadas em 18/10/2026: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite) e [configuração/negative lookahead](https://vercel.com/docs/project-configuration/vercel-json#negative-lookahead). Não foi adicionado backend fictício para contornar o roteamento.

build:vercel executa build/typecheck com VITE_ENABLE_MOCKS=true por env do subprocesso, sem sintaxe de shell específica. Funciona com npm no Windows/Linux. O modo demo continua com todos os módulos/imagens/fontes. Gera build-info.json com commit (VERCEL_GIT_COMMIT_SHA ou Git local), gitDirty quando disponível e SHA-256 do worker copiado. Metadados de working tree sujo não comprovam correspondência integral a um commit; o ensaio desta feature usa código commitado e registra essa condição.

Worker é registrado na raiz, scope /, updateViaCache none. Configuração envia Cache-Control no-cache/no-store/must-revalidate e Service-Worker-Allowed /. O arquivo original do MSW é preservado. A aplicação só importa Socket.IO depois de worker.start; o preload apenas antecipa download/compilação. Transporte continua WebSocket interceptado pelo binding MSW, sem servidor Socket.IO remoto ou API fictícia em componente.

## Plano e verificações

1. Configurar fallback sem engolir API/arquivos e tornar ativação dos mocks explícita.
2. Construir com variável externa VITE_ENABLE_MOCKS=false para testar a precedência do script demo.
3. Aplicar as regras estáticas localmente e exercitar o build via Playwright.
4. Documentar publicação autorizada e o teste posterior obrigatório da URL pública.

scripts/preview-deployment.mjs é somente ensaio de arquivos estáticos com o subconjunto de rewrites/headers utilizado. Não emula a plataforma completa e não cria APIs. playwright.deployment.config.ts exige URL, aceita HTTPS público ou localhost e não dispara deploy. Testes HTTP conferem checksum/MIME/headers do worker e exclusão de API/asset ausente; testes browser usam MSW e Socket.IO reais, deep links, refresh/persistência e reconexão pending sem nova compra.

## Resultados reais

Typecheck e lint aprovados. Build:vercel aprovado em 11,37 s mesmo com VITE_ENABLE_MOCKS=false no ambiente do comando. Metadados: commit 1e3a6d1b0cb9eb38e45d1b00571043cb84f85edb, gitDirty false, mocksEnabled true, worker SHA-256 b2b0049f0e51b706f3e67d9385f389bfaec18f645d33ccb6aba61a55cdf9f676. Principal 520,93 kB / 170,15 kB gzip; MSW 329,15 / 107,38 kB, warning >500 kB preservado.

Playwright no ensaio local: **12/12**, 66,13 s, Chromium 1440/768/390, nenhum skip/flaky e zero retries. Cenários passaram pelo Service Worker e cliente Socket.IO reais. HTML/JSON, metadados e cópia de build-info estão em docs/reports/vercel/local; abrir com `npx playwright show-report docs/reports/vercel/local`. Não houve execução pública nem pontuação Lighthouse nova atribuída a esta preparação. A auditoria final integrada será separada.

## Publicação e validação posteriores

Somente após autorização: configurar projeto/branch aprovada, Node 22.x, npm ci, npm run build:vercel, dist e variáveis do README; importar repo/CLI já pode publicar. Garantir URL acessível ao avaliador, sem depender de preview protegido. Depois executar test:deployment com URL HTTPS e SHA esperada, guardar HTML/JSON/traces e registrar falhas. Até lá, ambiente público/HTTPS/Vercel/Socket.IO remoto simulado são NOT TESTED.

Mudar de origem/URL cria outro localStorage: dados fictícios de localhost/preview não são migrados para produção. Persistência deve ser conferida por refresh na mesma origem. Sem storage/Service Worker disponível, recuperação é limitada; não há garantia de sincronização transacional entre abas ou infraestrutura real. Registre problemas em vez de declarar compatibilidade por inferência.
