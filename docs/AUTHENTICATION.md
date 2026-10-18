# Login, cadastro e sessão

Autenticação restaurada em `feature/authentication` sobre `develop` em `5db74c5`, após revert #6 e merge externo de detalhes #5. Nenhum merge de PR foi realizado pelo agente. A correção isolada antecedente está documentada separadamente; a validação atual está em [AUTHENTICATION_INTEGRATION.md](AUTHENTICATION_INTEGRATION.md).

## Contratos REST

| Método/recurso | Entrada | Resposta |
| --- | --- | --- |
| GET `/api/session` | Authorization opcional | `{ user: { id, name, email } \| null }`; token expirado: 401 |
| POST `/api/session` | email, password | `{ token, user }`; credenciais inválidas: 401 |
| POST `/api/users` | name, email, password, confirmPassword | `{ token, user }`; validação 422, e-mail existente 409 |
| DELETE `/api/session` | Bearer token | 204, revoga a sessão no mock |
| POST `/api/demo/auth` | `{ action }` | `reset`, `expire`, `slow`, `error`, `default` |

Erros: `{ code, message, fields? }`. Toda operação passa por Axios e handlers MSW. Os formulários não contêm respostas simuladas. Cadastro autentica o novo usuário automaticamente. Respostas de login/cadastro não incluem senha, hash nem salt.

## Persistência e segurança da simulação

Credenciais fictícias: `ana@example.com` e `bruno@example.com`, senha `Collector123!`. Novas contas usam PBKDF2 SHA-256, 100.000 iterações, salt UUID aleatório e derivação de 256 bits. As duas fixtures já contêm hashes pré-calculados. Senhas não são salvas em claro.

Token opaco UUID em `kurio.session-token`, no localStorage; banco simulado `kurio.mock-auth.v1`, também localStorage, contém usuários com hash/salt e sessões com prazo de 30 minutos. Essas escolhas sustentam refresh e permitem inspeção didática. Não constituem autenticação segura de produção: o “servidor” roda no próprio navegador, não há cookie HttpOnly, rate limiting ou autoridade externa. Use somente dados fictícios.

O mock recarrega o banco antes das operações para compartilhar dados entre abas. Cadastro verifica conflito novamente depois do hashing. A persistência entre abas não é transacional: dois cadastros simultâneos em abas diferentes ainda podem competir. Storage indisponível permite sessão em memória, mas perde persistência no refresh.

## Fluxo e cache

Formulário → validação → mutation TanStack Query → Axios → MSW → token + usuário → cache de sessão → navegação TanStack Router para `returnTo`. O retorno aceita somente caminhos locais e bloqueia ciclos de login/cadastro e destinos externos.

`GET /session` não faz retry automático, revalida em montagens/foco e a cada 30 segundos. Uma resposta 401 da identidade atual dispara limpeza do token e do cache privado. Respostas 401 de um token anterior não encerram uma sessão nova. Falha de rede/503 na verificação exibe retry; não é tratada como sessão anônima.

Rotas perfil, carteiras, checkout e pedidos usam `RequireSession`; enquanto consulta, exibem skeleton. Sem sessão, redirecionam ao login preservando path, query e hash. Expiração mantém esse contexto para reautenticação. Carteiras, checkout e pedidos usam os contratos REST/MSW de [CART_CHECKOUT.md](CART_CHECKOUT.md); rascunhos e tentativas são isolados por usuário e permitem retomada após expiração. Perfil continua pendente.

Dados privados devem usar chaves `['private', userId, recurso, ...]`. Antes de substituir identidade ou após logout/expiração, consultas privadas são canceladas e removidas. A troca de token em outra aba também limpa o cache privado e reconsulta sessão. Logout só confirma após 204; em falha, mantém contexto e oferece nova tentativa. Mutations não têm retry automático; o botão é bloqueado enquanto envia.

Nenhuma subscription privada existe nesta branch. Socket.IO do catálogo contém apenas dados públicos. Features com subscriptions privadas devem vinculá-las ao userId e liberar listeners quando a sessão mudar; a limpeza do Query cache não substitui cleanup de sockets.

### Correção de concorrência entre abas

Na troca de token em outra aba, `resetQueries` coloca a sessão em verificação (skeleton) e consulta a identidade nova. Isso evita interpretar a transição como logout e perder a rota protegida. Uma resposta de logout só limpa token/cache se ainda corresponder ao token que iniciou a operação, inclusive depois de aguardar o cancelamento de queries. O servidor continua revogando somente o token enviado na requisição.

O cenário de rede oferece `hold-logout` e `release-logout` no POST `/api/demo/auth`: segura a resposta de logout e a libera depois de outra aba autenticar. O teste usa duas páginas no mesmo contexto, troca de storage nativa e login REST via MSW; não dispara callbacks de sessão manualmente.

## Design e arquivos

SVGs D06/D07 e M05/M06 inspecionados: modal desktop sobre catálogo e páginas mobile. Radix controla foco, Escape e fechamento. Um listener de media query alterna os layouts ao redimensionar. Labels visíveis foram acrescentados aos campos; erros têm associação acessível. Google/Facebook e recuperação de senha são informados como indisponíveis, sem botões que aparentem sucesso. Fonte substituta IBM Plex Mono herdada; fidelidade integral não é declarada.

Arquivos principais: `src/features/auth/{contracts,token,api,session,auth-page,register-page}`, `src/mocks/auth.ts`, `src/lib/http.ts`, `src/app/router.tsx` e `src/components/layout/app-shell.tsx`. Catálogo aceita busca fora da rota inicial para compor o fundo real do modal, sem screenshot de tela inteira.

## Como reproduzir

Execute `npm run dev`. Acesse `/account/profile?tab=details`, faça login e confira o retorno. Recarregue, saia e entre com o segundo usuário. Em `/register`, tente senhas divergentes e e-mail já cadastrado. Via console/fetch, POST `/api/demo/auth` com `action: 'expire'` e retorne a uma rota privada ou aguarde a revalidação; `slow` mostra envio bloqueado; `error` permite avaliar recuperação. `reset` apaga contas/sessões simuladas: remova também `kurio.session-token` ou aguarde o 401.

Testes REST usam MSW; E2E usa Chromium nos três viewports. Os helpers de setup fazem login pela API, sem escrever respostas no Query cache. A integração com detalhes/favoritos utiliza sessão compartilhada e armazenamento único em `mocks/session-store.ts`, sem fallback de GET /session. O E2E usa login real pela interface e verifica favoritos após refresh e troca de usuário.
