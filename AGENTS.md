# Regras permanentes do repositório

## CONTEXTO

- Projeto: Jungle Gaming NFT Marketplace.
- Desafio técnico para Junior Frontend Developer.
- Prazo: domingo, 18/10/2026.
- `CHALLENGE.md` é a fonte de verdade dos requisitos.
- Os designs originais exportados do Figma estão em `design/svg/`.
- O candidato precisa compreender e defender o código.

## ARQUITETURA

- React, TypeScript strict e Vite.
- TanStack Router, TanStack Query, Axios e REST.
- Tailwind CSS, shadcn/ui.
- MSW e Socket.IO Client.
- Playwright e Lighthouse.
- Organização por funcionalidades, contratos tipados e responsabilidades separadas.
- Não criar APIs fictícias dentro de componentes.
- Não inventar funcionalidades nem resultados de testes.

## GIT FLOW

- `main`: branch estável.
- `develop`: branch de integração.
- Todas as features devem partir de `develop`.
- Usar `feature/<nome>` para funcionalidades e `fix/<nome>` para correções.
- Nunca fazer commits de funcionalidades diretamente em `main` ou `develop`.
- Nunca realizar force push, reset destrutivo ou rebase de branches compartilhadas.
- Nunca alterar autoria Git para ocultar uso de IA.
- Criar Pull Request para `develop` após concluir cada feature.
- Somente preparar o PR final de `develop` para `main` após auditoria.

## CONVENTIONAL COMMITS

- `feat(scope)`: funcionalidade
- `fix(scope)`: correção
- `test(scope)`: testes
- `refactor(scope)`: refatoração
- `style(scope)`: aparência
- `perf(scope)`: performance
- `docs(scope)`: documentação
- `chore(scope)`: configuração
- `ci(scope)`: integração contínua

Mensagens em inglês, no imperativo, com escopo específico.
Commits pequenos, coerentes e verificáveis.
Nunca criar commits vazios ou artificiais.

## PULL REQUESTS

- Título em Conventional Commits.
- Descrição em português brasileiro.
- Usar o template `.github/pull_request_template.md`.
- Incluir resumo, alterações, testes executados, screenshots quando aplicável, requisitos atendidos e limitações.
- Não declarar testes como aprovados sem executá-los.
- Preparar PRs reais usando GitHub CLI ou integração autorizada, quando disponível.
- Não fazer merge sem autorização do candidato.

## DESIGN

- Ler e inspecionar os SVGs originais.
- Preservar identidade visual, tipografia, cores, espaçamentos e proporções.
- Mapear SVGs para rotas e componentes.
- Implementar layouts responsivos em 390, 768 e 1440 pixels.
- Não utilizar um SVG de tela inteira como substituto da interface funcional.
- Não inventar fidelidade visual sem comparação com o design.

## TESTES

- Executar typecheck, lint e build.
- Criar Playwright E2E cobrindo os 12 grupos do `CHALLENGE.md`.
- Testar os handlers MSW e o cliente Socket.IO real.
- Gerar regressão visual e relatórios.
- Executar Lighthouse no build de produção.
- Registrar resultados reais e falhas.

## APRENDIZADO

Após cada feature, atualizar `LEARNING.md` em português:

1. O que foi implementado.
2. Arquivos principais.
3. Fluxo de execução.
4. Tecnologias utilizadas.
5. Decisões técnicas.
6. Como testar.
7. Possíveis perguntas de defesa.

## PROCESSO

1. Inspecionar o repositório.
2. Ler os requisitos aplicáveis.
3. Criar branch a partir de `develop`.
4. Implementar uma feature.
5. Executar verificações.
6. Corrigir falhas.
7. Documentar.
8. Criar commits coerentes.
9. Preparar Pull Request para `develop`.
10. Aguardar autorização para merge.

Não executar operações destrutivas ou publicação externa sem aprovação. Respeitar eventuais regras de uso de IA do processo seletivo.
