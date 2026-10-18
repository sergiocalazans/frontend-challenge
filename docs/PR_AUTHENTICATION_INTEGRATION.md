## Descrição

Restaura login, cadastro e sessão após o revert #6, sobre `develop` em `5db74c5`, e integra a autenticação aos detalhes/favoritos já mesclados no PR #5. Reintrodução solicitada explicitamente pelo candidato. Corrige logout atrasado que podia apagar a sessão criada em outra aba.

Visitante em `/nfts/emerald-ape?edition=ten&quantity=2` clica Favoritar, entra pelo formulário e retorna à mesma seleção. Ao confirmar Favoritar, o estado persiste no refresh e fica isolado de outro usuário.

## Alterações realizadas

- Formulários responsivos, validação local/API, conflito de cadastro, estados de envio/falha e recuperação.
- Sessão persistente, proteção de rotas, expiração, logout e limpeza de cache privado. Logout usa token capturado e preserva sessão posterior; Authorization explícito não é sobrescrito pelo interceptor.
- Armazenamento MSW único para login/cadastro/favoritos, inclusive no Node. Detalhes usa `useSession`/lifecycle compartilhados; fallback de sessão e listeners duplicados removidos.
- Testes REST e E2E de login real → retorno → favorito → refresh → troca de usuário; documentação didática, baselines e evidências versionadas.

## Requisitos atendidos

- [x] Requisitos aplicáveis de conta/sessão/favoritos do CHALLENGE.md
- [ ] Fidelidade integral ao design original — referências inspecionadas, adaptações documentadas
- [x] Responsividade em 390, 768 e 1440 px
- [x] Tratamento de loading, erro, vazio/visitante e sucesso
- [x] Labels, feedback acessível e foco de diálogos cobertos por testes

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| TypeScript | `npm run typecheck`: aprovado |
| ESLint | `npm run lint`: aprovado |
| Build | `npm run build`: aprovado; warning de chunk >500 kB |
| REST/Socket.IO | `npm run test`: 29/29, quatro arquivos |
| Playwright | `npm run test:e2e`: 96/96 em 5,2 min; Chromium 390/768/1440; baselines fixas |
| Integração focada | 3/3: formulário real → retorno ao NFT → favoritos → refresh → outro usuário |
| Inspeção visual | Capturas de detalhe desktop/tablet/mobile revisadas; referências SVG mapeadas |

Primeira rodada completa: 93/96. As três falhas eram do teste legado que esperava checkout público; o setup agora autentica via MSW, mantendo asserções de pagamento/placeholder/404. Traces e capturas preservados. Nenhuma tolerância ou timeout ampliado. Resultados históricos de autenticação e da correção isolada estão identificados separadamente.

Lighthouse: 12 medições, três por página/perfil. Performance mediana: início 92 mobile / 100 desktop; detalhe 91 mobile / 98 desktop. Acessibilidade e boas práticas 100; SEO 92 em todos os perfis. As quatro metas são atendidas pelas medianas. Todas as medições HTML/JSON, LCP/CLS/TBT e variação constam no [resumo integrado](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/docs/AUTHENTICATION_INTEGRATION.md).

## Evidências visuais

Baselines versionadas em `tests/e2e/auth.spec.ts-snapshots` e `details.spec.ts-snapshots`. Detalhe desktop/tablet/mobile inspecionado; mudança intencional de rodapé informa operações simuladas. Os relatórios e limites estão em [AUTHENTICATION_INTEGRATION.md](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/docs/AUTHENTICATION_INTEGRATION.md).

- [Login desktop](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/tests/e2e/auth.spec.ts-snapshots/login-chromium-desktop-win32.png)
- [Cadastro mobile](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/tests/e2e/auth.spec.ts-snapshots/register-chromium-mobile-win32.png)
- [Detalhe mobile](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/tests/e2e/details.spec.ts-snapshots/nft-detail-chromium-mobile-win32.png)
- [Relatório Playwright final](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/docs/reports/authentication-integration/playwright-final/index.html)

## Decisões técnicas

`session-store.ts` evita bancos divergentes entre handlers. Chave privada contém userId; mutations capturam token e descartam respostas de sessões anteriores. Ao trocar token entre abas, Query reseta a consulta de sessão e mantém skeleton até validar a identidade. Favoritar não escreve automaticamente ao retornar de login: o usuário confirma a ação.

Hash PBKDF2 com salt preserva o requisito de não guardar senhas em claro. localStorage é persistência de uma simulação, sem autenticação de produção.

## Limitações conhecidas

- Compras, edição de perfil, carteiras e pedidos ainda são placeholders protegidos; esta feature não conclui os 12 grupos do desafio.
- Login social e recuperação de senha não implementados, informados na UI.
- Fonte substituta IBM Plex Mono e adaptações acessíveis documentadas; fidelidade integral não declarada.
- Persistência entre abas não transacional; usar somente dados fictícios.
- Warning de chunk >500 kB e bootstrap intermitente previamente observado continuam registrados. As medianas Lighthouse desta rodada atendem às metas, mas há variação entre execuções e o warning de bundle permanece.
- Nenhum merge de PR nem deploy realizado nesta entrega.

## Checklist

- [x] Código revisado
- [x] Sem erros conhecidos de tipagem
- [x] Testes aplicáveis executados e resultados finais registrados
- [x] Documentação técnica e LEARNING atualizados
- [x] Sem alterações não relacionadas
- [x] Pronto para revisão
