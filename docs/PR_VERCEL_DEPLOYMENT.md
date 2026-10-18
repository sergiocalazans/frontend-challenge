## Descrição

Prepara a demonstração Vite/TanStack Router para Vercel com deep links/refresh, MSW explícito no build e teste posterior da URL publicada. Criada de develop e atualizada por fast-forward após o merge externo do perfil (#11). **Não cria projeto nem publica aplicação**; publicação depende da autorização do candidato.

## Alterações realizadas

- vercel.json com fallback SPA que preserva /api, assets, imagens, worker e metadados.
- Build cross-platform que força VITE_ENABLE_MOCKS=true, verifica o worker e gera SHA/checksum em build-info.json.
- Registro explícito de Service Worker na raiz, sem cache de atualização; headers de worker no host.
- Ensaio local das regras estáticas e Playwright reutilizável após deploy, em três viewports.
- README de setup/deploy/demonstração/reset, contratos de publicação, LEARNING e arquitetura.

## Requisitos atendidos

- [x] Configuração Vite/Router para deep links e refresh, sem reescrever /api para HTML
- [x] Worker original servido no build e ativação explícita dos mocks
- [x] Socket.IO real, persistência e cenários validados no ensaio local
- [x] Comando preparado para testar URL pública com SHA esperada
- [ ] Compatibilidade real na Vercel — NOT TESTED, ainda não há deploy autorizado/URL pública
- [ ] Fidelidade integral e aprovação final de performance — não certificadas por esta preparação

## Testes e validações

| Verificação | Resultado |
| --- | --- |
| TypeScript | Aprovado, inclusive via build |
| Lint | Aprovado |
| Build:vercel | Aprovado, 11,37 s, mesmo com VITE_ENABLE_MOCKS=false externo; wrapper forçou true |
| Metadados | commit 1e3a6d1, gitDirty false, worker checksum conferido via HTTP |
| Playwright local | 12/12, 66,13 s, 390/768/1440, zero skips/flaky/retries |
| URL pública/Vercel | NOT TESTED — sem publicação ou acesso remoto |

Testes conferem MIME/headers/checksum do worker, API/asset ausente 404 sem HTML da SPA, refresh privado, perfil/carteiras/carrinho persistidos, nova cotação após preço Socket.IO, interrupção/reconexão pending sem outra compra, recibo e cenários MSW. O ensaio estático não emula infraestrutura Vercel completa e não substitui o teste público.

## Evidências visuais

Sem alteração visual de componentes. [HTML/JSON e metadados locais](https://github.com/sergiocalazans/frontend-challenge/tree/feature/vercel-deployment/docs/reports/vercel/local), [procedimento e condições](https://github.com/sergiocalazans/frontend-challenge/blob/feature/vercel-deployment/docs/DEPLOYMENT.md). Nenhuma captura pública foi inventada.

## Decisões técnicas

Rewrites modernos com exclusão de caminhos reservados; filesystem tem precedência conforme documentação oficial. O worker inicia antes da importação do app/Socket.IO; não há servidor remoto inventado para simular sucesso. Build demo separado de build:api. Metadados permitem conferir versão/checksum após deploy autorizado. Testes externos recebem DEPLOYMENT_URL/DEPLOYMENT_EXPECTED_SHA e não fazem publicação.

## Limitações conhecidas

- Sem URL pública: HTTPS/roteamento/headers e transporte na Vercel permanecem NOT TESTED.
- Ensaio local aplica somente o subconjunto de regras utilizado; não é Vercel CLI.
- Simulação e storage locais, sem atomicidade entre abas ou backend de produção.
- Bundle >500 kB; Lighthouse final e desvios visuais devem ser avaliados na auditoria integrada.
- Importar repo na Vercel pode iniciar deploy: não foi executado sem autorização.

## Checklist

- [x] Código/configuração revisados e verificações aplicáveis executadas
- [x] Evidências locais reais e documentação completas
- [x] Pronto para revisão
- [x] Nenhum merge, deploy ou release executado pelo agente
