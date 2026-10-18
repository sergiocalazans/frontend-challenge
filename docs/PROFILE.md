# Perfil, avatar e alteração de senha

Branch feature/collector-profile, criada de develop f3a6390 com working tree limpo após preservar a auditoria em andamento. Escopo ampliado pelo candidato para concluir as funcionalidades restantes. Referência D08 do SVG original reinspecionada: sidebar de conta, campos em duas colunas, avatar e senha abaixo; adaptação mobile em uma coluna.

## Plano e contratos

1. Compartilhar a fonte de contas e o hash de senha existente.
2. Criar contratos REST privados e validação dos dados/avatar/senha.
3. Substituir o placeholder por formulário funcional com loading, erro, retry, vazio de avatar e sucesso.
4. Cobrir persistência, conflito, isolamento, expiração e credenciais com MSW/Playwright.

| Operação | Contrato |
| --- | --- |
| GET /api/profile | Perfil próprio: id, name, username, email, ens, walletNickname, avatar |
| PATCH /api/profile | Campos do perfil; proprietário vem do token, não do corpo; retorna perfil canônico |
| POST /api/profile/password | currentPassword, newPassword, confirmPassword; 204 somente após validar e persistir novo hash |

400 para formato inválido; 401 para sessão expirada; 409 para e-mail/username já usado ou alteração concorrente de senha; 422 com fields para validação; 503/offline nos cenários MSW. Token é revalidado após latência e após o hashing assíncrono. Username usa 3–30 caracteres; e-mail é único entre contas. Nome/apelido têm 2–80 caracteres. ENS é opcional, validado quando informado, por consistência com carteiras sem ENS.

## Estado e isolamento

session-store.ts guarda os dados adicionais do perfil no próprio usuário. Atualizar nome/e-mail altera a mesma conta consultada por login e sessão. Se há carteira principal, seu apelido é a referência do perfil; editar pelo perfil atualiza essa carteira e incrementa sua versão. Sem carteira cadastrada, o apelido é guardado no perfil. Alteração do perfil invalida a consulta privada de carteiras.

Query usa ['private',userId,'profile'], AbortSignal e stale imediato. Mutations capturam token; callbacks ignoram identidades anteriores. Logout/401 e troca de usuário usam o lifecycle de sessão já existente. Formulário não acessa o banco simulado. Um refresh recupera somente dados confirmados na API; arquivo selecionado antes de salvar é apenas preview local.

Avatar aceita PNG/JPEG/WebP até 256 KiB. Browser valida tipo/tamanho e decodifica a imagem; mock confere limite, data URL e assinatura do formato. Remoção exige Salvar perfil. SVG não é aceito. Data URL é persistida só na simulação local, sem serviço de upload externo.

Senha usa PBKDF2/SHA-256, 100 mil iterações e salt novo. Hashing foi extraído para mocks/password.ts e compartilhado com cadastro/login. O mock compara a versão anterior das credenciais antes de gravar e revoga outras sessões da mesma conta; a sessão atual permanece válida. Campos são limpos após sucesso, não vão para storage/cache. Nunca se persiste senha em claro. Auth reset restaura contas, senhas e perfis conhecidos.

## Design e acessibilidade

AccountLayout, FormField, Button, Skeleton e estados existentes são reutilizados. Labels/erros são associados aos campos; forms têm nomes próprios; loading com shimmer respeita movimento reduzido; feedback usa status/alert. Avatar vazio é explícito e os campos não somem no mobile. Baselines de conta são atualizadas intencionalmente para substituir o placeholder e aguardam o perfil real antes da captura. Não se aumenta tolerância ou timeout.

Os dois formulários têm confirmações independentes para evitar sugerir atomicidade entre atualização de dados e senha. Fonte substituta, navegação e footer compartilhados permanecem adaptações documentadas. Não se declara fidelidade integral ao SVG. Persistência local não é backend/autenticação de produção e depende de storage disponível.

## Validação

Unitários iniciais tiveram 4 falhas de setup (URL relativa no transporte Node). O cliente de teste passou a usar origem absoluta, como os outros testes MSW, e 4/4 passaram em 8,52 s. Primeira rodada E2E foi interrompida após identificar três falhas no desktop: seletores exatos de labels não consideravam o asterisco de obrigatório. Seletores foram corrigidos com prefixos ancorados, mantendo campos, asserções e timeouts. Traces originais ficam em docs/reports/profile/initial-failure. Resultados finais serão preenchidos após execução.

A auditoria integrada anterior em develop f3a6390 passou nos 153 E2E/46 unitários antes desta funcionalidade; isso é histórico e não valida o perfil novo. A nova feature precisa de suas próprias verificações e da auditoria integrada posterior.

Validação final desta feature: typecheck e lint aprovados; build 15,99 s, principal 520,93 kB / 170,16 kB gzip, MSW 329,15 kB / 107,38 kB gzip, warning >500 kB preservado. Unitários completos **50/50** em 19,87 s (oito arquivos). E2E perfil + design system: **24/24**, primeiro com atualização intencional das três baselines de conta (92,22 s), depois **24/24 com baselines fixas** (90,56 s), nenhum skip/flaky e zero retries locais. As três capturas foram inspecionadas e comparadas ao D08.

HTML/JSON final em docs/reports/profile/playwright-final e playwright-results.json; abrir com `npx playwright show-report docs/reports/profile/playwright-final`. Não foi repetida a suíte completa de comércio/catalog/auth nesta branch: será executada na auditoria integrada. Lighthouse e ambiente público também aguardam essa etapa e o deploy autorizado, respectivamente.
