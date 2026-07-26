# Identidade visual

> Como a marca aparece em tudo que o MazyOS gera.
> As skills de conteúdo, carrossel e post leem esse arquivo antes de criar qualquer visual.
> Edite quando a marca evoluir.

---

## Cores

- **Fundo principal:** `#0a0c0e` (dark)

- **Cor de destaque / CTA:** `#22e07a` (verde WClick)

- **Texto principal:** `#f2f4f6` (sobre fundo escuro) / `#0a0c0e` (sobre fundo verde ou claro)

- **Fundo alternativo / cards:** `#14181d` / `#101317`

- **Cor proibida:** cores neon fora da paleta (azul, roxo, laranja vibrante) — a marca é monocromática dark + verde

---

## Tipografia

- **Títulos e destaques:** Inter, pesos 700-900

- **Corpo, subtítulos e botões:** Inter, pesos 400-600

- **Mono (tags, contadores, preços):** JetBrains Mono, pesos 500-600

- **Peso do título:** 800-900, letter-spacing apertado (-0.03em a -0.04em)

---

## Estilo geral

Editorial, dark, técnico e direto — sem clip-art, sem emoji decorativo, sem gradiente arco-íris. Contraste entre eyebrows pequenos em mono uppercase (letter-spacing aberto) e títulos grandes com kerning apertado.

---

## Elementos-chave

- Bordas: `rgba(255,255,255,0.12)`, 1px
- Border-radius dos cards: 8-16px
- Botões: fundo verde `#22e07a`, texto escuro `#06130a`, radius 4-8px
- Sombras: sutis, ex: `0 8px 24px rgba(34, 224, 122, 0.35)` em elementos flutuantes (botão WhatsApp)

---

## O que NUNCA fazer

- Não usar mais de uma cor de destaque no mesmo layout
- Não usar emoji como ícone principal (usar SVG, ex: ícone oficial do WhatsApp)
- Não deixar título cortado atrás de mockup/foto — sempre checar largura máxima do texto

---

## Logo

- **Arquivo:** `clientes/wclick-ia/identidade/wclick-logo.png` (PNG fundo transparente)
- **Versão pra fundo escuro:** mesmo arquivo — texto branco + `.IA` em verde, já pensado pra fundo escuro
- **Onde usar:** slide final do carrossel (CTA), header de propostas, slides de apresentação
- **Tamanho sugerido:** largura entre 120-200px nos HTMLs
- **Alternativa tipográfica (sem arquivo):** `<span>WClick<span style="color:#22e07a">.IA</span></span>` em Inter 700-800 — usado no site e nos carrosséis até aqui

---

## Observações adicionais

Identidade herdada do site institucional em `clientes/wclick-ia/site/styles.css`. Qualquer mudança de cor/fonte deve ser refletida nos dois lugares (site + este guia) pra manter consistência entre site e conteúdo de redes sociais.
