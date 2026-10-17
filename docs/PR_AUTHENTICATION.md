## Descrição

Implementa login, cadastro e sessão recuperável após refresh. O acesso a perfil, carteiras, checkout e pedidos exige sessão e retorna ao contexto anterior após autenticar. PR independente de detalhes/favoritos, conforme organização solicitada; base `develop` em `4d87a9d`.

## Alterações realizadas

- Contratos REST e handlers MSW com duas contas fictícias, hash PBKDF2/salt, token opaco e expiração de 30 minutos.
- Formulários responsivos, modal desktop com Radix, validação por campo, conflito de cadastro, falha de conexão/503 e bloqueio de envio duplicado.
- Proteção de rotas, retorno local seguro, logout, limpeza de cache privado e troca de identidade/aba.
- Documentação de aprendizado, contratos e evidências reais.

## Requisitos atendidos

- [x] Login, cadastro, logout e recuperação de sessão; grupo 3 aplicável
- [ ] Fidelidade integral ao design original
- [x] Responsividade em 390, 768 e 1440 px
- [x] Loading, erro, recuperação e sucesso por navegação
- [x] Labels, validação acessível, foco e modal por teclado

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| TypeScript | `npm run typecheck` e build aprovados |
| ESLint | `npm run lint` aprovado |
| Build | Aprovado; aviso de chunk 519,97 kB |
| Unitários | `npm test`: 21/21 |
| Playwright | 69/69, 3,5 min; conferência visual fixa seguinte 9/9, 41,7 s |
| Lighthouse início | Medianas mobile/desktop: performance 94/100; acessibilidade 100/100; boas práticas 100/100; SEO 92/92 |
| Inspeção visual | SVGs D06/D07/M05/M06 e seis capturas inspecionados; sem sessão manual interativa adicional |

Falhas iniciais de setup/seletores e destino de retorno foram corrigidas e registradas. Nenhum critério foi enfraquecido.

## Evidências visuais

- [Login desktop](https://github.com/sergiocalazans/frontend-challenge/blob/2acc625/tests/e2e/auth.spec.ts-snapshots/login-chromium-desktop-win32.png)
- [Cadastro mobile](https://github.com/sergiocalazans/frontend-challenge/blob/2acc625/tests/e2e/auth.spec.ts-snapshots/register-chromium-mobile-win32.png)
- [Relatórios, métricas e ocorrências](https://github.com/sergiocalazans/frontend-challenge/blob/feature/authentication/docs/AUTHENTICATION_VALIDATION.md)

## Decisões técnicas

Formulário → mutation Query → Axios → MSW → token/usuário → cache de sessão → Router. Consulta de sessão revalida a cada 30 s e em foco/montagem. 401 da identidade atual limpa token/cache privado; 503 mantém erro recuperável. Retorno aceita apenas caminho local. Senhas não são persistidas em claro.

## Limitações conhecidas

- Autenticação inteiramente simulada no navegador, com token e banco em localStorage; não oferece segurança de servidor/cookie HttpOnly. Usar somente dados fictícios.
- Sem login social nem recuperação de senha; indisponibilidade explicitada.
- Perfil/carteiras/checkout/pedidos ainda não implementam operações de negócio. Carrinho e favoritos serão integrados em suas features; PR de detalhes permanece independente até o merge.
- Cache privado exige prefixo `private` com userId; subscriptions privadas futuras precisam de cleanup próprio. Atualmente só há Socket.IO público do catálogo.
- Fonte substituta documentada; persistência entre abas não é transacional; bundle acima de 500 kB.

## Checklist

- [x] Código revisado durante implementação
- [x] Sem erros conhecidos de tipagem
- [x] Testes aplicáveis executados
- [x] Documentação atualizada
- [x] Sem alterações não relacionadas
- [x] Pronto para revisão; nenhum merge realizado
