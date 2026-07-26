# bbtipis

> Projeto criado em 2026-07-11. Pasta dedicada — instruções aqui sobrescrevem as da raiz quando relevantes.

## Sobre

Análise de padrões estatísticos do site bbtips.br (mercado Over/Under de futebol) pra ajudar a identificar quando um jogo tende a bater Over 2.5 gols.

## Tipo

Cliente novo

## Entregas previstas

- Análise/previsão de padrão (olhar histórico e apontar tendências de Over 2.5)
- Objetivo final do cliente (definido em 2026-07-11): construir um **site próprio de análise ao vivo em tempo real** do padrão Over 2.5, baseado na leitura visual que o cliente já faz manualmente no bbtips. Ainda em fase de aprendizado/validação dos padrões antes de partir pra construção do site.

## Onde salvar o que

- Briefings e contexto: nessa pasta na raiz
- Credenciais de acesso: `acesso.md` (NÃO versionar — ver aviso de segurança no arquivo)
- Dados e análises: `analise/`

## Contexto que herda da raiz

Esse projeto herda automaticamente o tom de voz, marca e contexto do negócio definidos em `_memoria/` e `identidade/` da raiz. Não duplicar essas informações aqui.

## Específico desse projeto

- Fonte de dados: https://v1.bbtips.com.br/futebol/horarios (requer login — ver `acesso.md`)
- Método de coleta: automatizado via browser (Playwright), extraindo o DOM da tabela "Jogos" de cada aba/campeonato (Express, Copa, Euro, Super/Sul-Americana, Premier — "Split" é só outra visualização dos mesmos 4, não precisa coleta própria).
- Estrutura de dados e como extrair: ver `analise/resumo-campeonatos.md` (tem o passo a passo de quais tabelas do DOM pegar, como identificar cor verde/vermelho, cuidado com timing de carregamento ao trocar de aba).
- Hipótese testada em 2026-07-11: horas no "Topo" do gráfico de temperatura batem Over 2.5 bem mais que horas no "Fundo" — confirmado nos 5 campeonatos (ver `analise/teste-hipotese-topo-fundo.md`). Variante "virada" (saindo do fundo) testada e é mais fraca/inconsistente.
- Hipótese "segura e solta" testada em 2026-07-11 (ver `analise/teste-hipotese-segura-solta.md`): sequência de minutos vermelhos (não bate Over 2.5) seguidos tende a "soltar" um verde (bate) logo depois. No teste histórico: confirma com força em Euro e Super, neutro em Premier, inverte em Copa. **Porém, acompanhado ao vivo minuto a minuto numa hora inteira da Copa (17h), o padrão bateu 4 de 4 vezes** (blocos de 1, 1, 2 e 4 vermelhos seguidos, todos seguidos de um verde) — sugere que o teste histórico com médias pode estar escondendo um padrão mais forte na prática ao vivo do que a média sugere. Vale re-testar com mais horas ao vivo antes de decidir se Copa realmente é fraca pra esse padrão.
- Mais 3 padrões testados em 2026-07-11 — ver `analise/REGRAS-CONSOLIDADAS.md` como ponto único de consulta de tudo:
  - **Duas entradas/recuperação** (`analise/teste-duas-entradas.md`): apostar em 2 slots seguidos em vez de 1 eleva a taxa de "acertar pelo menos uma vez" de ~40% pra 62-74%.
  - **Cuidado fim de linha em hora fraca** (`analise/cuidado-fim-de-linha.md`): nos últimos slots de uma hora fraca (%≤40), risco sobe bastante (chance de segurar vermelho de novo chega a 65-79% em Copa/Premier/Express) e o saldo de gols real também cai. Mas já observamos ao vivo um contra-exemplo real (hora que parecia fraca mas pagou bem no fim) — é tendência, não garantia.
  - **Inclinação da linha, subindo vs descendo** (`analise/teste-inclinacao-grafico.md`): **o padrão mais universal encontrado até agora** — quando a % da hora está subindo vs a anterior (não importa se é Topo/Meio/Fundo), a chance de verde é maior. Único padrão que confirma até no Express, que não respondia bem aos outros. Confirmado também ao vivo (pico → descida → sequência de vermelhos logo em seguida).
- Formato definido para o produto final (2026-07-11): **site/painel próprio**, não apenas alertas no chat — mostrando a tabela ao vivo com os 5 padrões já destacados automaticamente.
- **O cliente está ensinando sua leitura visual manual do gráfico/tabela pra eu aprender os padrões como ele enxerga**, antes de formalizar regras — não é só pra prever um jogo pontual, é a base de conhecimento pro site de análise ao vivo futuro. Quando ele mandar prints com anotações (setas, círculos, cores destacadas), interpretar como ensino de padrão, não como pedido de previsão imediata.
- Decisão do cliente em 2026-07-11: continuar observando e acumulando mais casos ao vivo antes de formalizar qualquer regra final ou partir pra construção do site.
- Ainda não definido: frequência de recoleta pra validar se o padrão se mantém em outros dias, arquitetura do site de análise ao vivo (stack, fonte de dados em tempo real, como replicar o acesso ao bbtips de forma sustentável).
- Próximo passo natural: continuar observando padrões ao vivo com o cliente; depois repetir a coleta em dias diferentes pra validar estabilidade antes de desenhar o site.
- Decisão do cliente em 2026-07-26: o aviso de status "PLANTÃO DO NADA" no grupo (`site/bot-whatsapp/watcher.js`, função `zoarMotivo`) não pode mais revelar números, percentuais ou o nome do padrão técnico usado (sequência, bloco, topo/fundo, inclinação) — só frases zoeiras genéricas, mesmo no fallback. Motivo: o grupo pode ver que o bot está ativo, mas não pode dar pra reconstruir a estratégia a partir do aviso.
