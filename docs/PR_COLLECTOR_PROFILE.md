## Descrição

Conclui o perfil obrigatório que ainda era placeholder: dados pessoais, avatar e alteração de senha passam por REST/MSW e persistem após refresh. Branch criada de develop f3a6390, com testes e realtime integrados. O candidato ampliou o escopo para concluir funcionalidades antes de preparar Vercel; nenhum merge ou deploy foi realizado pelo agente.

## Alterações realizadas

- GET/PATCH de perfil e POST de senha com sessão, validação, conflitos e proteção contra escrita após expiração.
- Fonte única de conta, nome/e-mail coerentes com sessão e apelido sincronizado com a carteira principal.
- Avatar PNG/JPEG/WebP até 256 KiB, preview, remoção e confirmação por API.
- Hash PBKDF2 compartilhado, salt novo e revogação de outras sessões ao trocar senha.
- Formulários acessíveis/responsivos, estados MSW, testes e três baselines de conta revisadas.

## Requisitos atendidos

- [x] Perfil/avatar/senha e grupo 8 aplicável, junto às carteiras já existentes
- [x] Persistência, validação e isolamento por usuário
- [x] Loading, avatar vazio, erro/retry e sucesso
- [x] Responsividade 390/768/1440 e estados acessíveis
- [ ] Fidelidade integral ao SVG — fonte/estrutura compartilhada e confirmações independentes são adaptações documentadas

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| TypeScript/lint | Aprovados |
| Build demo | Aprovado, 15,99 s; warning >500 kB preservado |
| Unitários completos | 50/50, oito arquivos, 19,87 s |
| Playwright perfil/layout | 24/24, 90,56 s, três viewports, baselines fixas, zero skips/flaky/retries locais |
| Inspeção visual | D08 e três capturas examinados |
| Lighthouse/publicação | Não executados nesta feature; auditoria integrada/deploy autorizado pendentes |

Falhas iniciais de setup/seletores estão registradas em [PROFILE.md](https://github.com/sergiocalazans/frontend-challenge/blob/feature/collector-profile/docs/PROFILE.md), com traces; não houve aumento de timeout nem enfraquecimento de asserções.

## Evidências visuais

[Playwright HTML/JSON](https://github.com/sergiocalazans/frontend-challenge/tree/feature/collector-profile/docs/reports/profile), [perfil desktop](https://github.com/sergiocalazans/frontend-challenge/blob/feature/collector-profile/tests/e2e/design-system.spec.ts-snapshots/account-layout-chromium-desktop-win32.png), [mobile](https://github.com/sergiocalazans/frontend-challenge/blob/feature/collector-profile/tests/e2e/design-system.spec.ts-snapshots/account-layout-chromium-mobile-win32.png).

## Decisões técnicas

Chave privada por userId, token capturado e revalidação após latência/hash. Avatar fica local ao formulário até confirmação. Senha atual deve conferir; a sessão atual permanece e outras são encerradas. Nome/e-mail usam a conta canônica. ENS é opcional; salvar perfil e senha são operações independentes, sem sugerir atomicidade.

## Limitações conhecidas

Simulação local, sem upload/backend de produção ou atomicidade entre abas. Native file picker depende do navegador. Fonte e navegação compartilhadas diferem do desenho. Auditoria completa, performance final e URL pública ainda precisam de validação; nenhum resultado anterior é apresentado como teste desta feature.

## Checklist

- [x] Código revisado e verificações aplicáveis concluídas
- [x] Baselines inspecionadas sem ampliar tolerâncias
- [x] LEARNING/README/arquitetura e contratos atualizados
- [x] Pronto para revisão, sem merge ou deploy
