# Comparação visual da auditoria final

Referências rasterizadas anteriormente da prancha original preservada `design/svg/Frontend Challenge.svg`, SHA-256 `ea76523cc78c7e76edf71ab2349f99cbd69c485f5bd06051af3dce5c1091dd99`, conferido novamente nesta auditoria. Recortes e coordenadas estão em `design/FRAME_MAP.md`. Originais mobile têm largura 414; implementação é testada em 390. Não se trata de diff pixel a pixel.

As imagens `baseline-*` são as baselines versionadas da implementação, não screenshots novas de produção publicada. A suíte final compara essas baselines sem atualizá-las. O resultado dessa comparação é informado no DELIVERY_REPORT; aprovação de baseline não equivale a fidelidade ao SVG.

| Referência | Implementação examinada | Diferenças observadas |
| --- | --- | --- |
| reference-M01.png | baseline-home-390.png | Header extra, hero com uma imagem, tabs substituídas, grade alinhada, barra inferior e conteúdo mais longo |
| reference-M02.png | baseline-detail-390.png | Galeria com miniaturas, informações em painel separado, CTA menor/retangular e distribuição de edição/quantidade diferente |
| reference-M03.png | baseline-cart-390.png | Itens mais altos, controles maiores, resumo e CTA com forma diferente; fixture tem um item, não quatro; totais seguem API, não os números inconsistentes do desenho |
| reference-D04.png | baseline-checkout-1440.png | Hierarquia e campos reorganizados, carteira cadastrada selecionável, revisão explícita, resumo em painel e footer reduzido |
| reference-D08.png | baseline-profile-1440.png / 768 / 390 | Perfil funcional substitui o placeholder; dados e senha têm confirmações próprias, ENS opcional e seletor de arquivo nativo; fonte, sidebar reduzida e footer são adaptações. Referência rasterizada em escala 0,5; sem diff pixel a pixel |

Fidelidade integral: FAIL. Assets, cores e identidade parcial preservados não eliminam essas diferenças. Regressão visual e responsividade têm avaliação separada.
