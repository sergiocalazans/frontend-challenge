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
