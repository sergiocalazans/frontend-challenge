# Aprendizado e preparação para defesa

## Feature: project-setup

### 1. O que foi implementado

Configuração React/TypeScript strict/Vite, stack do desafio instalada, layout inicial responsivo, biblioteca visual interativa, quatro cards carregados por REST simulado, busca na URL, estados de rede e atualização através de Socket.IO. As rotas de negócio futuras informam que estão em desenvolvimento. Não há compra, login ou pagamento funcional nesta etapa.

### 2. Arquivos principais

- `src/main.tsx`: espera MSW antes de importar a aplicação.
- `src/app/mount.tsx`, `router.tsx`, `query-client.ts`: providers, rotas e cache.
- `src/features/catalog/contracts.ts`, `api.ts`, `catalog-page.tsx`: contrato → HTTP → interface.
- `src/lib/realtime.ts`: criação, assinatura, versões e encerramento do socket.
- `src/mocks/handlers.ts`, `socket.ts`, `state.ts`: comportamento simulado na rede.
- `src/components/ui/`: shadcn/ui; `shared/` e `layout/`: composições.
- `src/styles/globals.css`: paleta, medidas, tipografia provisória e movimento reduzido.
- `tests/unit/network.test.ts`, `tests/e2e/setup.spec.ts`: evidências executáveis.

### 3. Fluxo de execução

1. Vite entrega `index.html` e inicia `main.tsx`.
2. O modo demo registra MSW e interceptação WebSocket; só depois o app importa Socket.IO.
3. O router escolhe a tela. Query usa a chave com a busca; Axios envia GET à API.
4. O handler MSW seleciona fixtures ou devolve o cenário de erro/vazio/lentidão.
5. A UI renderiza o estado correspondente; não conhece a fixture nem força sucesso.
6. Uma alteração no laboratório chama REST; o mock altera a fonte de dados e emite Socket.IO.
7. O cliente verifica a versão e invalida Query; uma nova consulta lê o dado atualizado.
8. Ao desmontar a tela, listeners são removidos e o socket é desconectado.

### 4. Tecnologias utilizadas

React compõe a UI; TypeScript detecta incompatibilidades em tempo de compilação; Vite desenvolve e constrói. Router controla rotas/URL. Query controla dados remotos/cache. Axios transporta HTTP. MSW simula o servidor na rede. Socket.IO usa seu protocolo real sobre WebSocket. Tailwind aplica utilitários/tokens; shadcn fornece código editável sobre Radix para interação acessível. Vitest testa integração, Playwright observa o navegador e Lighthouse mede o build.

### 5. Decisões técnicas

Rotas em código reduzem a quantidade de conceitos iniciais. Fixtures são isoladas para não contaminar componentes. Preços são strings para evitar aritmética monetária imprecisa. Query evita retry automático de mutations porque isso pode duplicar operações. Cada assinatura possui cleanup para sobreviver ao StrictMode. Token de cor confirmado é diferente de breakpoint/fonte escolhidos para implementação: estes últimos estão documentados como decisões, sem alegação de fidelidade original.

O catálogo de quatro itens e o laboratório exercitam a arquitetura antes da implementação dos fluxos completos. Formulário de exemplo valida apenas formato local: não salva dados. A futura sessão precisa de isolamento por usuário; o tipo `OrderUpdated` sozinho não implementa essa segurança.

### 6. Como testar

Siga os comandos do README. Em `/`, busque Golden, recarregue e confira a URL. Em `/design-system`, tente validar e-mail vazio, aumentar quantidade até o limite, abrir modal com teclado, circular foco e fechar com Escape. Use filtros laterais, troque cenários de rede e simule preço: o card deve mudar após um evento real do cliente Socket.IO. Teste 390, 768 e 1440 px. Consulte [docs/VALIDATION.md](docs/VALIDATION.md) para resultados efetivamente obtidos e limitações.

### 7. Possíveis perguntas de defesa

- **Por que aguardar MSW antes de importar o app?** Para instalar os interceptores antes de Axios/Socket.IO iniciarem conexões, especialmente a referência a WebSocket.
- **Router e Query resolvem o mesmo problema?** Não. Router representa navegação e URL; Query representa ciclo de vida de dados remotos.
- **Como uma resposta antiga deixa de afetar outra busca?** Chaves diferentes por termo e AbortSignal; a UI observa apenas sua chave atual.
- **Por que não alterar o card diretamente ao receber socket?** O evento identifica a mudança; a reconciliação REST mantém uma fonte de dados consistente. Atualização direta pode ser uma otimização futura, com contrato/versionamento adequado.
- **Como evitar duplicatas?** Comparar versões por recurso para eventos; pedidos ainda precisarão de chave de idempotência no contrato, não apenas botão desabilitado.
- **Quais partes não estão prontas?** Sessão, compra, cotação, persistência, rotas funcionais privadas, cobertura dos 12 grupos e auditoria final.
- **shadcn/ui é só instalar uma biblioteca?** Não. Seus componentes foram gerados para o repositório, adaptados e passam a ser código que o candidato deve compreender e manter.
- **Por que a fonte é provisória?** SVGs com textos em curvas não preservam família/peso originais; a substituição está explicitamente registrada.
- **O que o teste visual comprova?** Regressão da baseline revisada desta implementação, não aderência automática ao Figma.
- **Como comprovar que tempo real é real?** Testar Socket.IO conectado através do binding MSW e observar atualização da UI após a mutation REST, sem setter direto no componente.
- **Por que há um alias Socket.IO no Vitest?** O ambiente Node escolhe o transporte `ws`; a aplicação usa WebSocket do navegador. O alias carrega a distribuição real de navegador para testar a mesma integração com MSW, sem substituir o cliente por callbacks falsos.
- **O que as métricas Lighthouse comprovam?** As seis medições cobrem apenas o início desta base. As medianas e os relatórios estão em `docs/VALIDATION.md`; os fluxos futuros precisarão de nova auditoria.

Revise o código e execute os exemplos antes de defender a solução. O candidato deve conseguir explicar e alterar cada decisão; esta documentação não substitui esse entendimento.

## Feature: tokens, componentes e layouts

1. **O que foi implementado:** tokens visuais isolados em `styles/tokens.css`, layouts reutilizáveis de conta e compra, campo acessível, drawer com limites corretos e skeletons de detalhe/resumo. A base de setup foi reaproveitada. Perfil/carteiras usam o layout, mas ainda não editam dados.
2. **Arquivos principais:** `components/layout/page-layouts.tsx`, `components/shared/form-field.tsx`, `filter-drawer.tsx`, `content-skeletons.tsx`, `features/design-system/design-system-page.tsx`, `app/router.tsx` e `tests/e2e/design-system.spec.ts`.
3. **Fluxo de execução:** Router escolhe a página; o layout organiza os filhos. No laboratório, Query chama Axios, MSW responde e os cards recebem o contrato tipado. O filtro deriva a lista visível; a consulta determina loading/erro/vazio/sucesso. Eventos Socket.IO invalidam a consulta e os dados retornam por REST. FormField recebe erro do formulário e conecta a mensagem ao input; não chama API.
4. **Tecnologias utilizadas:** React/useId, TypeScript, Tailwind v4, componentes shadcn/Radix, TanStack Router/Query, Axios, MSW, Socket.IO e Playwright. Não foi adicionada dependência.
5. **Decisões técnicas:** sidebar de 310 px e gap de 28 px baseados em D08; resumo de aproximadamente 405 px baseado em D04. Abaixo de 1024 px, empilhamento para preservar legibilidade. M04 tem outra composição de etapa; não se afirma réplica integral. Layouts não devem conhecer regras monetárias ou de sessão. A fonte original segue desconhecida.
6. **Como testar:** executar os comandos em `docs/DESIGN_SYSTEM.md`; testar `/design-system`, `/account/profile` e `/account/wallets`. Validar e-mail vazio e válido, abrir filtros, circular foco e fechar com Escape, trocar cenários MSW. Playwright verifica 390/768/1440 px e conta em largura adicional de 320 px; resultados reais em `docs/DESIGN_SYSTEM_VALIDATION.md`.
7. **Possíveis perguntas de defesa:**
   - Por que separar token de componente? O token expressa uma decisão visual compartilhada; o componente combina aparência, semântica e comportamento.
   - Por que o layout não busca a conta? Composição pode ser reutilizada sem acoplar sessão, cache e transporte. Proteção das futuras rotas privadas continua necessária.
   - Como um leitor de tela encontra o erro? O input referencia o ID da mensagem com aria-describedby, marca aria-invalid e a mensagem é anunciada como alerta.
   - Por que useId? Evita colisões entre campos quando o chamador não fornece um ID, mantendo associação label/input.
   - Skeleton garante CLS zero? Não. Reserva uma estrutura estimada; o conteúdo final precisa de comparação e medição reais.
   - Por que o drawer reutiliza Radix? Controle de foco, Escape e restauração são comportamentos complexos já fornecidos pela primitiva; o projeto ajusta dimensões e aparência.
   - O teste de 320 px comprova zoom de toda a aplicação? Não. Verifica reflow da conta nessa largura; zoom real e todos os fluxos finais exigem validação adicional.

**Ajuste após auditoria:** o laboratório passou a ser carregado sob demanda pela rota, com `lazyRouteComponent`. Isso separa seu código do carregamento inicial do catálogo sem retirar mocks ou funcionalidades. Pergunta de defesa: qual é o custo? A primeira visita ao laboratório precisa baixar seu chunk; o Router permite preload por intenção nos links. O navegador reutiliza o módulo nas visitas seguintes.

## Feature: catálogo, busca, filtros e paginação

1. **O que foi implementado:** busca por nome, filtros combináveis de categoria/rede/preço, quatro ordenações e paginação de nove itens, com estado na URL. Sidebar desktop, drawer mobile/tablet, erro recuperável, vazio, loading e página fora do intervalo. Os cards navegam para o detalhe ainda pendente.
2. **Arquivos principais:** `features/catalog/search.ts`, `api.ts`, `contracts.ts`, `catalog-page.tsx`, `catalog-search.tsx`, `catalog-filters.tsx`, `catalog-pagination.tsx`, `lib/eth.ts`, `mocks/catalog.ts`, `fixtures.ts`, `handlers.ts` e os testes de catálogo.
3. **Fluxo de execução:** interação → Router/URL → chave TanStack Query com todos os parâmetros → Axios com AbortSignal → MSW filtra/ordena/conta/pagina → resposta tipada → componentes. Voltar/avançar muda a URL, restaurando controles e consulta. Socket.IO invalida consultas quando o preço muda; REST recalcula quais itens ainda pertencem ao filtro.
4. **Tecnologias utilizadas:** React, TypeScript strict, TanStack Router/Query, Axios, Tailwind, componentes shadcn/Radix, MSW, Socket.IO Client, Playwright, Vitest e Lighthouse. Nenhuma dependência nova.
5. **Decisões técnicas:** busca por envio explícito; filtros combinados com AND; mudança de filtro/ordem reinicia a página. Valores ETH permanecem texto até conversão para wei/BigInt para comparação. URL plana preserva strings decimais; REST rejeita consulta inválida, enquanto navegação usa defaults seguros. Fixtures determinísticas reutilizam quatro imagens e têm 24 IDs. O socket envia mudanças posteriores, pois a conexão já reconcilia por REST.
6. **Como testar:** executar typecheck, lint, build, testes unitários e E2E; abrir o início, navegar à página 2, filtrar Ethereum/Arte digital, aplicar 1,20–2,00 ETH e ordenar por maior preço. Testar refresh e histórico. Pelo laboratório, selecionar slow/race/offline/flaky e voltar ao início sem recarregar. Ver `docs/CATALOG.md` e `docs/CATALOG_VALIDATION.md` para contratos e evidências reais.
7. **Possíveis perguntas de defesa:**
   - Por que não paginar no componente? O servidor precisa filtrar e ordenar o conjunto completo antes de recortá-lo; paginar uma lista parcial daria resultados incorretos.
   - Por que incluir filtros na queryKey? Cada combinação representa um recurso distinto em cache; uma resposta atrasada não deve sobrescrever outra combinação.
   - Cancelamento basta? Não é a única proteção. AbortSignal reduz trabalho; chaves distintas e a observação da chave atual impedem mistura de resultados.
   - Por que comparar ETH com BigInt? Number perde precisão; 1.190000000000000001 deve ser maior que 1.19. Multiplicar texto para wei preserva essa diferença sem usar float.
   - Por que alterar o parser do Router? O parser JSON padrão pode converter um preço numérico de link direto para Number antes da validação. Parâmetros planos como texto preservam a precisão.
   - Como garantir paginação estável? Ordenar antes do slice e desempatar por ID; a ordem de destaque segue fixtures determinísticas.
   - Por que a URL inválida não retorna 400 visual? O navegador recebe uma visão segura; o endpoint REST mantém validação estrita. São fronteiras distintas, explicitamente documentadas.
   - Como testar respostas fora de ordem sem timers arbitrários? O cenário de rede define latências; os testes aguardam respostas/cancelamento observáveis, e os de integração verificam a ordem efetiva de conclusão.
   - Preço alterado pode remover um card? Sim. Ao reconsultar, o servidor aplica novamente a faixa de preço e a ordenação; não basta trocar o texto dentro do card.
   - O catálogo implementa os 12 grupos completos? Não. Cobre o grupo 1 e amplia os grupos 11/12 e atualização de catálogo; conta, checkout e detalhe permanecem features próprias.

**Execução de E2E:** após timeouts de bootstrap em rodadas com dois workers, o runner foi limitado a um processo de teste concorrente. Os casos, timeouts e baselines permanecem iguais; concorrência de requisições continua coberta dentro do teste. Isso é uma decisão de orçamento de execução, não uma garantia de que a causa de toda intermitência foi eliminada.
# Feature: login, cadastro e sessão (17/10/2026)

1. **Implementação:** login/cadastro por REST simulado, recuperação após refresh, logout, expiração, retorno ao contexto e proteção de rotas. Modais desktop e páginas mobile com erros por campo e feedback de envio.
2. **Arquivos principais:** `features/auth`, `mocks/auth.ts`, `lib/http.ts`, `app/router.tsx`, `components/layout/app-shell.tsx`, testes `auth.test.ts` e `auth.spec.ts`.
3. **Fluxo:** formulário valida → mutation envia Axios → MSW valida e compara hash → token opaco e usuário retornam → sessão entra no Query cache → Router retoma o destino local. 401 da sessão atual limpa token/cache privado e o guard preserva o destino no login.
4. **Tecnologias:** TanStack Query/Router, Axios, MSW, Web Crypto PBKDF2, localStorage e Radix Dialog, além de React/TypeScript e Playwright.
5. **Decisões:** token opaco por 30 minutos; hash com salt, sem senha em claro; cache privado com prefixo `private` e userId; não repetir mutations automaticamente; retorno somente local; login social sem contrato informado como indisponível. A simulação local não oferece segurança de backend real.
6. **Como testar:** duas credenciais fictícias em `docs/AUTHENTICATION.md`; login direto em rota privada, refresh, sair/trocar usuário, cadastrar e repetir e-mail, provocar `expire`, `slow` e `error`. Executar unitários e E2E.
7. **Defesa:** Por que localStorage não equivale a cookie HttpOnly? Como PBKDF2 difere de guardar senha? Por que cancelar consultas antes da troca de identidade? Por que 503 não deve significar sessão anônima? Como um 401 atrasado pode afetar uma sessão nova? Como retomar checkout sem fingir uma compra? Por que subscriptions privadas futuras precisam de cleanup próprio?
