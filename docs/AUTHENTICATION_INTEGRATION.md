# Autenticação integrada a detalhes e favoritos

## Base e escopo

`feature/authentication` foi atualizada por fast-forward de sua base histórica até `origin/develop` em `5db74c5`. Working tree limpo após preservar o rascunho anterior em `.tmp`. Esta entrega reintroduz autenticação depois do revert #6, conforme autorização explícita, e integra detalhes do PR #5 já mesclado externamente. Não houve merge de PR pelo agente, force push, rebase compartilhado ou alteração de autoria.

## Implementação

- Cadastro, login, logout, recuperação no refresh, expiração e proteção de rotas restaurados. Estados de validação, envio, falha e sessão pendente usam componentes existentes.
- Fonte única `mocks/session-store.ts` para contas e sessões em browser e Node. Cadastro usa salt aleatório e PBKDF2 SHA-256/100.000 iterações; login não retorna hashes.
- Detalhes consome `useSession`, token e lifecycle compartilhados. Removidos fallback MSW de sessão e listeners duplicados. Cache privado isolado por usuário; operação tardia não recria estado da identidade anterior.
- Logout captura Authorization e só limpa sessão se seu token continuar atual, inclusive após cancelamento de consultas. A troca em outra aba mantém a rota protegida em skeleton enquanto verifica a identidade.
- Favoritar como visitante guarda a URL local em returnTo. Depois do login, a seleção é restaurada; o usuário confirma Favoritar. Refresh preserva o favorito; outro usuário não o recebe.

## Design e regressão visual

Referências D06/D07/M05/M06 (login/cadastro) e D02/M02 (detalhes) do SVG original, mapeadas em `design/FRAME_MAP.md`. Modal desktop sobre catálogo real e formulário mobile; nenhuma tela SVG serve como interface. IBM Plex Mono substitui a fonte original não identificada. Labels, radios e mensagens são adaptações de acessibilidade; fidelidade integral não é declarada.

Baselines de autenticação, conta e shell foram recuperadas da versão já validada. Três baselines de detalhe foram regeneradas para o novo texto do rodapé: “Ambiente de demonstração. Operações e transações são simuladas.” Capturas desktop/tablet/mobile foram inspecionadas. Limites, tolerâncias, máscaras e retries não foram ampliados.

## Verificações

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado, sem alterar regras.
- `npm run build`: aprovado; chunk mount 520,67 kB / 170,02 kB gzip. Warning >500 kB permanece.
- `npm run test`: 29/29 em quatro arquivos, 24,86 s. Inclui REST/MSW real, cliente Socket.IO e login/cadastro → favoritos → isolamento → logout.
- E2E focado de integração: 3/3, 59 s, nos três viewports.
- Captura das baselines de detalhe: 3/3, 54,3 s; não representa a regressão final com snapshots fixos.

Primeira regressão completa: **93/96**, 6,0 minutos. As três falhas foram do teste legado de checkout que ainda acessava `/checkout` como visitante e esperava o título de pagamento. O trace mostra login com returnTo=/checkout, comportamento correto da proteção. O setup foi corrigido com `loginViaApi`; asserções de pagamento, aviso de desenvolvimento e 404 foram mantidas. A alteração foi salva enquanto a rodada ainda executava os testes já carregados; por isso alguns contextos de erro exibem numeração/snippet do arquivo atualizado, mas a rodada usava a versão anterior. [Traces e capturas](reports/authentication-integration/initial-failure/) preservam as três ocorrências. Commit `3f6b804` registra a correção.

**Regressão final: 96/96**, 5,2 minutos, `npm run test:e2e`, Chromium em 390/768/1440 px, baselines fixas, retries locais 0. [Relatório HTML](reports/authentication-integration/playwright-final/index.html). Inclui o setup corrigido nas três larguras. Asserções, baselines e tolerâncias mantidas nesta rodada.

A auditoria integrada está registrada abaixo. Medições da correção isolada não substituem as deste conjunto.

## Ambiente e auditoria

Windows, Node 22.18.0, Vite 7.3.7, MSW 2.15.0, Playwright/Chromium distribuído por @playwright/test 1.64.1 e Lighthouse 12.6.1. Build demo otimizado com imagens, fontes e MSW habilitados, cenário padrão; `scripts/lighthouse.mjs` sobe preview em 4175 e mede `/` e `/nfts/emerald-ape`, três vezes por perfil mobile/desktop. E2E encerrado antes da auditoria, sem caminho especial ou remoção de assets. O script calcula medianas por categoria e métrica, preservando todas as execuções. Auditoria concluída em `2026-10-17T22:31:51.074Z`; 12/12 execuções. [Resumo JSON](reports/authentication-integration/lighthouse/summary.json), 12 pares HTML/JSON preservados.

| Página | Perfil | Performance | A11y | Boas práticas | SEO | LCP ms | CLS | TBT ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | mobile | 92 | 100 | 100 | 92 | 2394 | 0.000000 | 267.5 |
| home | desktop | 100 | 100 | 100 | 92 | 697 | 0.000093 | 12.3 |
| detail | mobile | 91 | 100 | 100 | 92 | 2747 | 0.003221 | 244.0 |
| detail | desktop | 98 | 100 | 100 | 92 | 871 | 0.074120 | 11.0 |

As medianas atendem às quatro metas do CHALLENGE para ambas as páginas/perfis. Há variação entre execuções: início mobile 80/93/92 e detalhe mobile 87/91/96. Isso não demonstra otimização nem elimina o risco de bootstrap/tarefas longas; todos os resultados, inclusive os menores, são mantidos. O chunk >500 kB permanece como oportunidade de melhoria. Não houve repetição seletiva de medições.


## Arquivos principais alterados

- `src/features/auth/{api,auth-page,contracts,register-page,session,token}`: contratos, formulários e sessão.
- `src/features/nft-details/{api,contracts,detail-page}`: consumo da autenticação compartilhada.
- `src/mocks/auth.ts`, `session-store.ts` (substitui `detail-session-bridge.ts`), `details.ts`, `handlers.ts`: REST, banco e cenários.
- `src/lib/http.ts`, `src/app/router.tsx`, `src/components/layout/app-shell.tsx`, `src/features/catalog/catalog-page.tsx`: headers, proteção, shell e fundo do modal.
- `tests/unit/{auth.test,details.test,setup}.ts`, `tests/e2e/{auth-helpers,auth.spec,design-system.spec,setup.spec}.ts` e snapshots: integração e regressão.
- `README.md`, `ARCHITECTURE.md`, `LEARNING.md`, documentos de autenticação/detalhes e `docs/reports/authentication-{session,integration}`: explicação e evidências (históricas e atuais separadas).

## Histórico separado

[Correção de sessão](AUTHENTICATION_SESSION_FIX.md) preserva reprodução da falha, traces e a validação isolada na base `cc30363`. [Validação original](AUTHENTICATION_VALIDATION.md) descreve o antigo PR #4. Esses resultados não substituem os desta integração.

## Limitações

Autenticação é simulada no browser, com tokens e banco em localStorage, sem autoridade de servidor ou cookie HttpOnly. Use somente dados fictícios. Persistência entre abas não é transacional. O atraso intermitente de bootstrap observado na correção anterior não foi otimizado; pré-condições explícitas melhoram sincronização dos testes, sem demonstrar ausência de flakiness. Compras, edição de perfil, carteiras e pedidos ainda são placeholders protegidos. Os 12 grupos do desafio completo não estão concluídos nesta feature. Deploy e auditoria final de todo o desafio continuam fora desta entrega parcial.
