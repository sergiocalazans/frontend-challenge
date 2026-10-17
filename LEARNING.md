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
