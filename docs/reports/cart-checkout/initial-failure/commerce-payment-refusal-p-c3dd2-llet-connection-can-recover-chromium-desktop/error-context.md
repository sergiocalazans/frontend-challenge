# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: commerce.spec.ts >> payment refusal preserves items and a refused wallet connection can recover
- Location: tests\e2e\commerce.spec.ts:58:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('cart-item-emerald-ape-fifty')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('cart-item-emerald-ape-fifty') with timeout 5000ms
  - waiting for getByTestId('cart-item-emerald-ape-fifty')

```

```yaml
- link "Pular para conteúdo":
  - /url: "#main-content"
- banner:
  - link "Kurio — início":
    - /url: /
    - text: KURIO
  - navigation "Navegação principal":
    - link "Início":
      - /url: /
    - link "Componentes":
      - /url: /design-system
  - link "Abrir carrinho":
    - /url: /cart
  - link "Ana Colecionadora":
    - /url: /account/profile
  - button "Sair"
- main:
  - navigation "Caminho da página":
    - link "Voltar à coleção":
      - /url: /
      - text: Início / Mercado
    - text: "/ Emerald Ape #042"
  - group "Vistas da obra":
    - button "Obra completa" [pressed]
    - button "Detalhe superior"
    - button "Detalhe central"
  - img "Macaco com óculos redondos e jaqueta verde — Obra completa"
  - button "Ampliar obra"
  - 'region "Emerald Ape #042"':
    - 'heading "Emerald Ape #042" [level=1]'
    - paragraph: 1.19 ETH
    - heading "Sobre este NFT" [level=2]
    - paragraph: Um colecionável digital da coleção Kurio Editions na rede Ethereum, com arte para colecionadores.
    - group "Edição":
      - text: Edição
      - radio "1/1"
      - text: 1/1
      - radio "1/10"
      - text: 1/10
      - radio "1/50" [checked]
      - text: 1/50
      - radio "ABERTA · Esgotada"
      - text: ABERTA · Esgotada
    - status: 4 unidades disponíveis nesta edição.
    - group "Quantidade":
      - button "Diminuir quantidade" [disabled]
      - status: "1"
      - button "Aumentar quantidade"
    - button "Favoritar"
    - button "Comprar NFT"
    - term: "ID do token:"
    - definition: emerald-ape
    - term: "Coleção:"
    - definition: Kurio Apes
    - term: "Atributos:"
    - definition: Arte digital, Ethereum, Kurio Editions
    - term: "Rede:"
    - definition: Ethereum
  - status
  - status: Atualizações em tempo real conectadas.
  - tablist:
    - tab "Detalhes do NFT" [selected]
    - tab "Rede e propriedade"
  - tabpanel "Detalhes do NFT":
    - paragraph: Um colecionável digital da coleção Kurio Editions na rede Ethereum, com arte para colecionadores.
    - paragraph: Obra da coleção Kurio Apes. Os atributos e a disponibilidade são consultados na API de demonstração.
  - region "Mais desta coleção":
    - heading "Mais desta coleção" [level=2]
    - article:
      - 'link "Ver Sage Nomad #009"':
        - /url: /nfts/sage-nomad
        - img "Macaco cinza com chapéu verde e moletom roxo"
        - 'heading "Sage Nomad #009" [level=3]'
      - paragraph: 1.69 ETH
      - paragraph: Polygon
    - article:
      - 'link "Ver Neon Vessel #552"':
        - /url: /nfts/neon-vessel
        - img "Macaco de pelo escuro com casaco claro"
        - 'heading "Neon Vessel #552" [level=3]'
      - paragraph: 1.99 ETH
      - paragraph: Ethereum
    - article:
      - 'link "Ver Golden Beat #207"':
        - /url: /nfts/golden-beat
        - img "Macaco dourado com fones verdes"
        - 'heading "Golden Beat #207" [level=3]'
      - paragraph: 0.99 ETH
      - paragraph: Solana
    - article:
      - 'link "Ver Cosmic Bloom #100"':
        - /url: /nfts/cosmic-bloom
        - img "Macaco com óculos redondos e jaqueta verde"
        - 'heading "Cosmic Bloom #100" [level=3]'
      - paragraph: 1.29 ETH
      - paragraph: Ethereum
- contentinfo:
  - paragraph: KURIO
  - paragraph: Feito para colecionadores, criadores e cultura.
  - navigation "Links do rodapé":
    - link "Explorar coleções":
      - /url: /
    - link "Meu perfil":
      - /url: /account/profile
    - link "Carteiras":
      - /url: /account/wallets
  - paragraph: Uma nova forma de colecionar.
  - paragraph: Ambiente de demonstração. Operações e transações são simuladas.
  - paragraph: © 2026 Kurio · Jungle Gaming NFT Marketplace
```

# Test source

```ts
  1 | import { expect,type Page } from '@playwright/test'
  2 | import { loginViaApi } from './auth-helpers'
  3 | export const walletFixture = {slot:'primary',displayName:'Ana Colecionadora',nickname:'Principal',profileName:'Colecionadora',network:'Ethereum',address:`0x${'1'.repeat(40)}`,provider:'MetaMask',email:'ana@example.com',referral:'DEMO',ens:'ana.eth'}
  4 | export async function commercePost(page:Page,action:string) {await page.evaluate(async action => {const response = await fetch('/api/demo/commerce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});if(!response.ok) throw new Error('Scenario setup failed')},action)}
  5 | export async function seedWallet(page:Page) {await page.evaluate(async input => {const response = await fetch('/api/wallets/primary',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${localStorage.getItem('kurio.session-token')}`},body:JSON.stringify(input)});if(!response.ok) throw new Error('Wallet setup failed')},walletFixture)}
> 6 | export async function addFromDetail(page:Page,quantity=1) {await page.goto(`/nfts/emerald-ape?edition=fifty&quantity=${quantity}`);await page.getByRole('button',{name:'Comprar NFT',exact:true}).click();await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible()}
    |                                                                                                                                                                                                                                                                         ^ Error: expect(locator).toBeVisible() failed
  7 | export async function prepareCheckout(page:Page) {await loginViaApi(page);await seedWallet(page);await addFromDetail(page);await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await expect(page.getByRole('heading',{name:'Pagamento',exact:true})).toBeVisible();await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible()}
  8 | export async function reviewCheckout(page:Page) {await page.getByRole('button',{name:'Revisar compra',exact:true}).click();await expect(page.getByRole('region',{name:'Revisão da compra',exact:true})).toBeVisible()}
  9 |
```