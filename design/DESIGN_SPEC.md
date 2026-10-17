# Especificação visual extraída dos SVGs

Análise de 17/10/2026, limitada aos arquivos locais. Foram lidos `../AGENTS.md` e `../CHALLENGE.md`; o desafio define os requisitos funcionais. [FRAME_MAP.md](FRAME_MAP.md) lista todos os SVGs, os 15 recortes e o mapeamento das nove telas. Nenhuma página foi implementada nesta etapa.

## Método e grau de certeza

- Parse XML dos sete SVGs: dimensões, elementos, atributos, cores, referências, imagens e definições.
- Renderização com Sharp 0.35.5 / libvips 8.18.7 / librsvg 2.63.2: overview a 25% e quinze recortes separados, desktop a 65% e mobile a 100%, preservando o `viewBox` original de cada área. Todos esses recortes foram inspecionados visualmente. PNGs são evidências temporárias, não assets da interface ou baselines de testes; foram mantidos fora do repositório, no diretório de visualizações da sessão.
- Decodificação e inspeção dos quatro PNGs embutidos, sem modificar os SVGs.
- **Confirmado** significa valor literal do XML ou composição visível. Papéis e nomes sugeridos de tokens/componentes são uma organização desta análise, não variáveis exportadas do Figma.
- Coordenadas de exemplos abaixo são globais na prancha, salvo quando indicadas como locais. Medidas SVG não equivalem automaticamente a uma regra CSS responsiva.

## Estrutura dos arquivos

A prancha tem `width=8000`, `height=7453`, `viewBox="0 0 8000 7453"`. Contém 539 rects, 180 grupos, 1301 paths, 29 círculos, 24 máscaras, 140 clipPaths, 79 patterns, 79 uses, 26 filtros, 22 gradientes lineares, 44 stops e 4 imagens. Há cinco elementos de link. Os filtros incluem desfoque, offset, composição, matriz de cor, mistura e morfologia.

Não há elementos `<text>`, `<tspan>`, `<style>`, declarações `font-family`, `font-size` ou `font-weight`. Letras e ícones foram convertidos em geometria. Grupos/paths não preservam uma árvore semântica de componentes. Retângulos brancos em clips/máscaras não devem virar superfícies brancas da interface.

O fundo `#1E1E1E` pertence à prancha de trabalho, fora dos frames. O fundo das telas é `#140D0A`. Não usar a prancha ou seus recortes como substituto de HTML funcional.

## Identidade e tipografia

A marca visível é **KURIO / Kurio**, inclusive no header, autenticação e copyright. `AGENTS.md` identifica o projeto como **Jungle Gaming NFT Marketplace**. A divergência está registrada; esta análise não renomeia a marca nem os assets.

A aparência dos textos é monoespaçada, com títulos mais fortes, mas **família, arquivo, peso numérico, font-size, line-height e letter-spacing originais não são recuperáveis com certeza** a partir dos contornos. Medir a caixa de um path não recupera o tamanho tipográfico original. Não se confirma aqui nenhuma fonte por semelhança visual.

Não foram encontrados arquivos `.woff`, `.woff2`, `.ttf` ou `.otf` no repositório. Os SVGs renderizam sem fontes porque usam curvas; uma interface com texto real ainda precisará da fonte original ou de substituição documentada e comparada. Não há URL de fonte externa nos SVGs.

## Tokens de cor confirmados

As contagens são ocorrências de atributos `fill`, `stroke` e `stop-color` na prancha; não são frequência de pixels, incluem definições ocultas e não contam cores internas dos PNGs. Os nomes da primeira coluna são sugestões para futura implementação. O papel foi confrontado com os previews.

| Nome sugerido | Valor literal | Ocorrências | Evidência / uso observado |
| --- | --- | ---: | --- |
| `background` | `#140D0A` | 142 | Fundos dos frames; também contornos de controles |
| `surface` | `#241612` | 102 | Cards, sidebars, modais e footer |
| `surface-raised` | `#2F1D15` | 32 | Superfícies e extremidade de gradientes mobile |
| `surface-band` | `#38220F` | 17 | Faixa de contato do footer e elementos auxiliares |
| `border` | `#3F2319` | 112 | Inputs, divisores e controles contornados |
| `border-accent-muted` | `#55321F` | 27 | Contorno de badges/elementos auxiliares |
| `primary` | `#D28A4C` | 307 | Botões primários, seleção, linhas de destaque e ícones |
| `accent` | `#E89B55` | 140 | Preços e textos destacados |
| `text-primary` | `#F5F1EB` | 428 | Textos claros e ícones |
| `text-secondary` | `#CFB28C` | 165 | Texto secundário e ícones mobile |
| `text-muted` | `#B39463` | 127 | Descrições, placeholders e lupa mobile |
| `required-mark` | `#F0805F` | 38 | Asteriscos de campos obrigatórios; não prova um token completo de erro |

Outros literais encontrados: `#FBFBFB` (2), `#59C36A` (4), `#00A66C` (4), `#FFDA2D` (4), `#4086F4` (4), `#4175DF` (4), `#FF641A` (4), `#3B5999` (4), `#EDEDED` (1), `#E3A44E` (1), `#46A358` (2), `#DD9A5F` (2), `white` (161), `black` (15) e o fundo da prancha `#1E1E1E` (1). Há também `none` e referências `url(#...)`. Parte dessas cores pertence a logos, decoração, máscaras ou clips: não promovê-las automaticamente a tokens de sucesso, alerta, erro ou tema claro. Não há paleta semântica de estados completa confirmada.

## Geometria confirmada e candidatos a tokens

Usar estas medidas como referências locais, não como uma escala global inventada. `rx` é o atributo do retângulo específico. Em retângulos com stroke, as dimensões são da geometria central; por exemplo, 339 × 39 com stroke padrão de 1 ocupa aproximadamente 340 × 40 externamente.

| Elemento | Medida literal | Evidência |
| --- | --- | --- |
| Container desktop observado | 1200 de largura, margem de 120 em frame 1440 | D01: blocos do footer em x=120; D02 em x=1760, isto é, x local=120 |
| Sidebar de catálogo | 310 × 785 | D01 em `(120,653)`; D06/D07 repetem tamanho |
| Grade principal desktop | painéis de imagem 258 × 300; x=478,770,1062 | D01; intervalo horizontal entre painéis=34, derivado dessas coordenadas; o card inclui título/preço fora do painel |
| Separação sidebar/grade D01 | 48 | `478 - (120 + 310)`; medida local, não token universal |
| Imagem de card | 250 × 250, rx=15 em vários cards | D01, exemplo `(482,734)`; há exceção 224 × 286, rx=13 em `(498,1137)` |
| Sidebar de conta | 310 × 407 | D08 `(3400,4007)` e D09 `(5040,4007)` |
| Botão Entrar desktop | 100 × 35, rx=6 | D01 `(1220,30)`; repetido no header |
| CTA Explorar desktop | 140 × 40, rx=6 | D01 `(160,422)` |
| CTA Comprar desktop | 130 × 40, rx=6 | D02 `(2692,406.125)` |
| Botão autenticação desktop | 340 × 45, rx=5 | D06 `(550,4374)` e D07 `(2190,4448)` |
| Campo autenticação desktop | 339 × 39, rx=4.5, stroke 1 implícito | D06 `(550.5,4230.5)`; visual externo 340 × 40 |
| Campo checkout desktop | 368.5 × 39, rx=2.5, stroke 1 implícito | D04 `(5040.5,293.5)`; não generalizar largura a todos os campos |
| Modal login | 500 × 600 | D06 `(470,4066)`, posição local `(470,160)` |
| Modal cadastro | 500 × 656, rx=8 | D07 `(2110,4064)`, posição local `(470,158)` |
| Recibo de confirmação | 578 × 821 | D05 `(6991,166)`, posição local `(431,166)` |
| Faixa inferior de modais | altura 10 | D05, D06 e D07, preenchimento `#D28A4C` |
| Paginação | ativo 35 × 35, rx=4 | D01 `(1113,1991)`; inativos 34 × 34 com stroke 1 e rx=3.5 |
| Blocos footer | 1200 × 250; 1200 × 88; 1200 × 236 | D01 em y=3040,3290,3378; benefícios, contato e links respectivamente |
| Hero mobile | 366 × 190, rx=30 no retângulo pintado | M01 `(24,6658)`, x local=24; possui clipping próprio com outra geometria |
| Margens mobile observadas | 24 ou 28 conforme bloco | M01 hero x=24; M03 cupom x local=24, itens x local=28; M05/M06 inputs x local=28 |
| Item carrinho mobile | 358 × 100, rx=14 | M03 `(1136,6645)` e demais linhas |
| Campo autenticação mobile | 357 × 49, rx=9.5, stroke 1 | M05 `(2244.5,6869.5)`; externo 358 × 50 |
| CTA autenticação mobile | 358 × 60, rx=10 | M05 `(2244,7049)` e M06 `(2798,7145)` |
| CTA carrinho mobile | 366 × 60, rx=30 | M03 `(1132,7357)` |
| CTA checkout mobile | 358 × 60, rx=30 | M04 `(1690,7361)` |

Há muitos outros raios no XML, inclusive valores fracionários para strokes. Não existe evidência de escala universal de espaçamento de 4/8 pixels. Também não há breakpoint, max-width fluido, grid CSS, constraints de Auto Layout ou regras de interpolação exportados.

### Gradientes e sombras

- `paint0_linear_0_1`: cobre `#D28A4C`, opacidade 0.10 → 0.03, eixo vertical `(155,0)` → `(155,470)`; destaque lateral desktop.
- `paint8_linear_0_1`: `#241612` → `#2F1D15`, vetor `(3.88505,6875.25)` → `(208.353,7115.05)`; painel mobile. Outros cards repetem essas cores com coordenadas próprias.
- `paint13_linear_0_1`: mesmas cores, vetor `(506.414,6494.38)` → `(1028.08,7066.48)`; fundo superior de M02.
- `paint20_linear_0_1`: `#D28A4C` opacidade 1 → 0.8, vetor `(1120.8,7345)` → `(1556.64,7493.88)`; CTA de M03.
- `paint21_linear_0_1`: mesmo par de opacidades, vetor `(1679.04,7349)` → `(2107.29,7492.09)`; CTA de M04.
- `filter0_d_0_1`: exemplo de sombra em área do footer, `feOffset` sem deslocamento explícito, `feGaussianBlur stdDeviation=10`, matriz de cor RGB aproximado `(10,6,4)` e alpha 0.45. Existem 26 filtros; isso não define uma única sombra global. Conversão para CSS exige comparar o resultado, não copiar `stdDeviation` como blur CSS sem validação.

## Imagens, referências e assets ausentes

As quatro imagens são PNG RGB válidos, **1254 × 1254**, embutidos em `data:image/png;base64,...` dentro de `<defs>`, com `preserveAspectRatio="none"`. Não há solicitação HTTP para carregá-las. Patterns/usages fazem recortes e transformações; não assumir que cada card tem um arquivo único.

| ID original | Conteúdo visual | Referências `<use>` |
| --- | --- | ---: |
| `image0_0_1` | Macaco marrom, óculos redondos, jaqueta verde | 24 |
| `image1_0_1` | Macaco cinza, chapéu verde, moletom roxo | 21 |
| `image2_0_1` | Macaco escuro, casaco claro, gola verde | 17 |
| `image3_0_1` | Macaco dourado, fones verdes, roupa clara | 17 |

Os 79 patterns referenciam essas quatro imagens por 79 uses. Todas as referências internas `url(#id)` e `href="#id"` dos SVGs foram resolvidas; nenhuma imagem interna ausente foi encontrada. As cinco referências externas são links `mailto:contato@email.com`, não imagens. Nenhuma imagem HTTP, arquivo local referenciado inexistente ou fonte remota foi detectada.

Não há arquivos raster separados versionados encontrados na inspeção; as imagens necessárias à arte estão incorporadas e podem ser extraídas futuramente sem redesenho. Isso é diferente de estarem ausentes. Marca, ícones de provedores e redes sociais aparecem como vetores internos; além dos seis ícones listados, não estão entregues como assets individuais nomeados. Metadados de licença/autoria das imagens/fontes não são demonstrados pelo SVG.

## Inconsistências e decisões pendentes

- Marca KURIO versus nome Jungle Gaming no contexto do projeto: não alterar silenciosamente.
- Imagens associadas aos mesmos nomes diferem entre D01 e o catálogo sob D06/D07. Identificadores também variam: o item Violet Nomad #314 tem ID #0089 em D03 e #0314 no recibo D05. Fixtures devem ter contratos consistentes, não reproduzir contradições.
- M02 mostra as duas primeiras opções de edição com rótulo `1/10`; D02 mostra `1/1` e `1/10`. Não inferir uma regra de negócio desse conflito.
- M03 exibe linhas de 1.19, 1.39, 3.58 e 1.98 ETH, cuja soma é **8.14 ETH**; o subtotal desenhado é **8.92 ETH** e o total **8.936 ETH**. Não copiar totais inconsistentes: a cotação REST é a referência exigida pelo desafio.
- D01 contém um card da última linha sem título/preço visíveis. Isso não autoriza omitir informações do catálogo funcional.
- D04 e M04 mostram etapas/conteúdos diferentes do pagamento. O SVG não define como chegar do formulário à seleção de carteiras no mobile.
- Google/Facebook, newsletter, avaliações, recuperação de senha e outras ações auxiliares não possuem fluxos completos definidos. Não ampliar o escopo automaticamente.
- Textos do recibo sobre transferência em blockchain são conteúdo de exemplo. O desafio exige simulação, não conexão ou pagamento real.

## O que os SVGs não permitem inferir

Não se confirmam família/pesos/tamanhos tipográficos; breakpoints; comportamento entre 414 e 1440; layouts específicos em 390/768; layouts mobile de perfil/carteiras/recibo; posição fixa ou sticky; overflow e scroll; foco e ordem de tabulação; semântica acessível; nomes acessíveis; hover/pressed/disabled; mensagens de erro; skeletons/shimmer; estados vazio, carregamento, reconexão ou pedido pendente/recusado; animações, timings, gestos, autoplay; abertura/fechamento de drawers e modais; validações, APIs, persistência, idempotência, autenticação ou regras de cálculo.

Esses pontos devem vir do `CHALLENGE.md` e de decisões documentadas. Bordas laranja em alguns campos comprovam uma variação visual, mas não identificam com certeza se ela significa foco, seleção ou outro estado. Posição estática e aparência de um botão não demonstram comportamento funcional. Os SVGs também não comprovam contraste aprovado, fidelidade da futura implementação, performance ou acessibilidade.

## Validação desta análise

- Sete arquivos XML lidos com sucesso; todos inventariados em FRAME_MAP.md.
- Quinze frames localizados por geometria e conferidos visualmente; nove telas obrigatórias mapeadas, com lacunas mobile explícitas.
- Quatro PNGs base64 decodificados e inspecionados; dimensões reais conferem com as declaradas.
- Referências internas conferidas; nenhuma pendência de imagem referenciada.
- Tokens numéricos baseados nos atributos, sem atribuir uma fonte ou breakpoint por suposição.
- SHA-256 dos sete originais comparado antes/depois: todos inalterados. Valores registrados abaixo.
- Quinze PNGs de frames validados quanto à integridade; recortes dentro dos limites da prancha; links locais entre os documentos verificados; `git diff --no-index --check` de ambos os documentos sem erros de whitespace.
- Typecheck, lint, build, Playwright e Lighthouse **não executados**: esta etapa é documental e o repositório inspecionado não contém aplicação ou comandos de projeto para essas verificações. Não houve teste funcional nem medição de fidelidade da aplicação.

| Arquivo em svg/ | SHA-256 |
| --- | --- |
| `Frontend Challenge.svg` | `ea76523cc78c7e76edf71ab2349f99cbd69c485f5bd06051af3dce5c1091dd99` |
| `Desktop/Arrow-Down.svg` | `d760c9c2f9dd52897d403203161b2913043ce15f59cca12ab4d03cf84895ecf6` |
| `Desktop/Message.svg` | `20d9437ad3a4200f186ff7c5c8a55d7bf823078b7be38b7b36f98898119e0cee` |
| `Desktop/X.svg` | `f1ccade6925ea4c78394237c86955d1a48c06abab16c04451f1d7a8cd4b338e1` |
| `Mobile/Search.svg` | `f5e374cf1163f4deedea16f7ae0924ccb9563ee9efc403ed2c58778959af9d29` |
| `Mobile/Shop.svg` | `934861c7c2b6f1309970e1f3bbd0168b2869f046c2a6098f7fdf2edbf69233b9` |
| `Mobile/User.svg` | `339fce12381dfa9c71360bfc741d9cce916424f12d0d1c12f8daa182d6321fca` |

Para reproduzir previews, ler uma cópia em memória de `svg/Frontend Challenge.svg`, substituir apenas width/height e viewBox da raiz pelo recorte de FRAME_MAP.md, conservar defs/namespaces e rasterizar com Sharp. Escala 0.65 para desktop e 1 para mobile. Não salvar essa alteração no original e não retirar filtros dos previews usados como referência visual.
