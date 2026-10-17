# Mapa dos SVGs e frames

Análise de 17/10/2026. Fontes: `../CHALLENGE.md`, `../AGENTS.md` e os sete SVGs originais em `svg/`. Complemento: [DESIGN_SPEC.md](DESIGN_SPEC.md).

## Inventário completo

Dimensões são os atributos da raiz, em unidades SVG. Todos possuem `fill="none"` na raiz e namespace SVG. Os diretórios Desktop/Mobile contêm **ícones**, não arquivos individuais das telas.

| Arquivo relativo a design/ | Bytes | width × height | viewBox | Classificação | Conteúdo |
| --- | ---: | --- | --- | --- | --- |
| `svg/Frontend Challenge.svg` | 26.015.790 | 8000 × 7453 | `0 0 8000 7453` | Prancha com 15 frames | 9 desktop e 6 mobile; imagens e outros assets embutidos |
| `svg/Desktop/Arrow-Down.svg` | 485 | 20 × 20 | `0 0 20 20` | Asset | 1 path; seta para baixo; `#F5F1EB` |
| `svg/Desktop/Message.svg` | 1106 | 18 × 18 | `0 0 18 18` | Asset | 1 path; envelope; `#F5F1EB` |
| `svg/Desktop/X.svg` | 676 | 18 × 18 | `0 0 18 18` | Asset | 1 path; fechar; `#D28A4C` |
| `svg/Mobile/Search.svg` | 800 | 22 × 22 | `0 0 22 22` | Asset | 1 path; lupa; `#B39463` |
| `svg/Mobile/Shop.svg` | 1091 | 20 × 20 | `0 0 20 20` | Asset | 3 paths; carrinho; `#CFB28C` |
| `svg/Mobile/User.svg` | 673 | 20 × 20 | `0 0 20 20` | Asset | 2 paths; usuário; `#CFB28C` |

Os seis ícones não contêm imagens, links, fontes, filtros ou dependências externas. Não são variantes responsivas de páginas.

## Frames dentro da prancha

Os IDs abaixo foram atribuídos nesta análise; não são nomes de layers preservados do Figma. As coordenadas são globais na prancha original e foram confirmadas pelos retângulos de fundo, clips e inspeção dos PNGs. Cada linha define um recorte `viewBox="x y largura altura"`; não existe um `<svg>` independente para cada frame.

As rotas são **propostas de mapeamento**, não URLs extraídas do Figma ou uma implementação. Os parâmetros `nftId` e `orderId` ainda precisam de contratos.

| ID | Tela / estado observado | x | y | Largura | Altura | Rota proposta |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| D01 | Início: hero, catálogo, filtros, banners, editorial e footer | 0 | 6 | 1440 | 3668 | `/` |
| D02 | Detalhes do NFT: galeria, edição, quantidade e favoritos | 1640 | 6 | 1440 | 2246 | `/nfts/$nftId` |
| D03 | Carrinho: tabela, cupom, resumo e recomendações | 3280 | 6 | 1440 | 1754 | `/cart` |
| D04 | Pagamento: dados do colecionador, resumo e carteira/rede | 4920 | 6 | 1440 | 1657 | `/checkout` |
| D05 | Confirmação: recibo em modal, sobre fundo escuro | 6560 | 0 | 1440 | 1657 | `/orders/$orderId` |
| D06 | Login: modal aberto sobre o catálogo | 0 | 3906 | 1440 | 1981 | `/login` |
| D07 | Cadastro: modal aberto sobre o catálogo | 1640 | 3906 | 1440 | 1981 | `/register` |
| D08 | Perfil: sidebar, dados pessoais, avatar e senha | 3280 | 3906 | 1440 | 1080 | `/account/profile` |
| D09 | Carteiras: principal e seção de secundária vazia | 4920 | 3906 | 1440 | 1080 | `/account/wallets` |
| M01 | Início: busca, botão de filtros, hero, cards e navegação inferior | 0 | 6557 | 414 | 896 | `/` |
| M02 | Detalhe: imagem, informações, edição e compra | 554 | 6557 | 414 | 896 | `/nfts/$nftId` |
| M03 | Carrinho: quatro itens, cupom e resumo inferior | 1108 | 6557 | 414 | 896 | `/cart` |
| M04 | Pagamento: carteiras cadastradas e seleção de provedor | 1662 | 6557 | 414 | 896 | `/checkout` |
| M05 | Login: tela própria | 2216 | 6557 | 414 | 896 | `/login` |
| M06 | Cadastro: tela própria | 2770 | 6557 | 414 | 896 | `/register` |

D05 contém geometria de pagamento sob uma camada opaca e o recibo; isso não constitui um décimo frame desktop. Os fundos, máscaras e clips repetidos tampouco representam frames adicionais.

## Cobertura das telas obrigatórias

| Tela do CHALLENGE.md | Desktop | Mobile | Lacunas relevantes |
| --- | --- | --- | --- |
| Início | D01 | M01 | Drawer de filtros, ordenação expandida e resultados de busca não desenhados; M01 é um recorte de viewport, não toda a página longa |
| Detalhes do NFT | D02 | M02 | Sem frame de NFT inexistente, edição indisponível, erro ou galeria ampliada |
| Carrinho de NFTs | D03 | M03 | Sem vazio, cupom inválido, conflito de estoque ou aviso de preço alterado |
| Pagamento | D04 | M04 | M04 não mostra os campos do colecionador de D04; não implica que possam ser omitidos do fluxo mobile |
| Confirmação de pedido | D05 | Ausente | Adaptar mobile; sem estados pendente/recusado nem recuperação desenhada |
| Login | D06 | M05 | Modal desktop e página mobile; expiração, erros e retorno ao fluxo não desenhados |
| Cadastro | D07 | M06 | Sem conflito de cadastro ou mensagens de validação |
| Perfil do colecionador | D08 | Ausente | Adaptar mobile; seleção de arquivo e feedback de avatar/senha não desenhados |
| Carteiras | D09 | Ausente | Adaptar mobile; secundária preenchida e adição/edição não têm frames próprios; M04 é checkout, não manutenção de carteiras |

Os frames mobile possuem bordas externas com `rx=40`. Não há evidência de que o site inteiro deva ter cantos arredondados em um navegador; podem ser a apresentação do frame. As alturas são dimensões de arte, não obrigação de altura fixa da aplicação. Não há frame tablet. Os viewports de teste 390, 768 e 1440 vêm do desafio; não são breakpoints dedutíveis destes arquivos.

## Componentes compartilhados e evidências

Os nomes abaixo descrevem possíveis responsabilidades de componentes. Não são componentes já implementados nem nomes originais do Figma.

| Componente | Evidência nos frames | Composição / variação |
| --- | --- | --- |
| Header desktop | D01–D04, D06–D09 | Marca KURIO, Início/Mercado/Criadores/Aprenda, busca, carrinho com badge, Entrar; item ativo em destaque |
| Barra superior mobile | M01–M04 | Busca e filtros em M01; voltar, título e/ou favorito nos demais; não é um header desktop reduzido |
| Sidebar de catálogo | D01, D06, D07 | Coleções e contagens, faixa de preço com dois marcadores, Aplicar, redes; destaque separado abaixo em D01 |
| Sidebar de conta | D08, D09 | Dados do perfil, Carteiras e ações auxiliares; seleção com faixa lateral; Sair separado |
| Card NFT | D01–D03, D06, D07, M01 | Imagem, nome e preço; exemplos com preço anterior, selo RARO e ações; mobile com duas colunas desencontradas |
| Galeria | D02, M02 | Miniaturas verticais e imagem grande no desktop; imagem dominante no mobile; ampliar no desktop |
| Botões | Todos | Primário preenchido em cobre; secundário contornado; botão de ícone; pílulas maiores no fluxo mobile |
| Campos e seletores | D01, D03, D04, D06–D09, M01, M03–M06 | Labels, obrigatório, placeholder, password com olho, select com seta, textarea, opção circular e cupom com Aplicar |
| Tabs e filtros | D01, D02, D06, D07, M01, M02 | Todos os NFTs/Novos lançamentos/Em alta; detalhes/avaliações; Entrar/Criar conta; opções de edição; painel mobile de filtros não visível |
| Controle de quantidade | D02, D03, M02, M03 | Menos, número, mais; remoção por lixeira no carrinho; aparências diferentes entre desktop e mobile |
| Linha de item / resumo de pedido | D03–D05, M03 | Thumbnail, nome, edição/ID, quantidade, valor; subtotal, desconto, taxa e total; recibo usa snapshot confirmado conforme desafio |
| Seletor de carteira | D04, M04, D09 | Provedores e rede no checkout; M04 distingue carteiras cadastradas de provedores; D09 contém formulário de manutenção |
| Modal de autenticação | D06, D07 | Duas abas, fechar, campos e CTA, separador e botões Google/Facebook; telas equivalentes M05/M06 |
| Modal de confirmação | D05 | Ícone, mensagem, metadados, itens, taxa, total, fechar e link de exploração |
| Navegação | D01–D04, D06–D09, M01–M04 | Header, breadcrumbs, tabs, paginação e voltar; barra inferior em M01 com ação central destacada, cuja finalidade não é definida no SVG |
| Carrossel / recomendações | D01–D03, M01 | Pontos de posição no hero/recomendações; não há dados sobre autoplay, gestos ou duração |
| Footer desktop | D01–D04 | Benefícios e newsletter; faixa de contato; quatro colunas de links, redes sociais, carteiras e copyright; estrutura também existe sob a camada de D05 |

Não há footer mobile desenhado nem garantia de navegação inferior fixa: posição estática não confirma `sticky`/`fixed`. Cards com ações aparentes não demonstram que essas ações sejam exclusivas de hover.

## Limites de escopo

Preservar a composição dos frames não autoriza criar páginas editoriais, suporte, atividade, ofertas ou downloads, excluídas pelo desafio. Newsletter, autenticação social, recuperação de senha, compartilhamento e links de exploração aparecem visualmente, mas o SVG não fornece contratos nem autoriza integrações externas reais. Ações auxiliares devem ter comportamento coerente e não simular sucesso de funcionalidade inexistente.

Login/cadastro precisam de acesso direto e retorno ao contexto; o formato de modal desktop não resolve sozinho o roteamento. Confirmação só pode aparecer após confirmação efetiva da simulação. Os estados adicionais exigidos pelo desafio devem ser projetados usando a identidade observada, com decisões explicitamente documentadas.
