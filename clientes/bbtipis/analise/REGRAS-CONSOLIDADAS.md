# Regras consolidadas — bbtipis Over 2.5

> Ponto único de consulta, juntando os achados espalhados nos outros arquivos de `analise/`. Atualizado conforme mais dados forem coletados. Data-base: 2026-07-11.

## As 5 peças que já validamos

1. **Topo/Fundo da hora** (`teste-hipotese-topo-fundo.md`) — horas com % acumulada alta (Topo) batem Over 2.5 bem mais que horas com % baixa (Fundo). Confirmado nos 5 campeonatos, testado em 2 coletas do mesmo dia.
2. **Segura e solta** (`teste-hipotese-segura-solta.md`) — depois de um bloco de vermelhos seguidos, o próximo slot tende a soltar verde. Forte em Euro/Super no histórico; **ao vivo, bateu 5 de 5 vezes numa hora inteira de Copa** (blocos de 1, 1, 2 e 4 vermelhos, todos seguidos de verde).
3. **Duas entradas / recuperação** (`teste-duas-entradas.md`) — apostar em 2 slots seguidos (não só 1) eleva a taxa de "acertar pelo menos uma vez" de ~40% pra 62-74%, dependendo do campeonato.
4. **Cuidado com fim de linha em hora fraca** (`cuidado-fim-de-linha.md`) — nos últimos slots de uma hora que já está fraca (%≤40), a chance de vir verde despenca e a chance de "segurar de novo" (vermelho atrás de vermelho) sobe muito (65-79% em Copa/Premier/Express). O saldo de gols real também cai nesse cenário — não é só estatística, o jogo sai mais truncado mesmo. **Atenção**: já observamos um contra-exemplo ao vivo (hora real de 50%, mal classificada por engano de método) — essas regras são probabilidade, não certeza.
5. **Inclinação da linha (subindo vs descendo)** (`teste-inclinacao-grafico.md`) — quando a % da hora está subindo em relação à anterior (independente de estar em Topo, Meio ou Fundo), a taxa de acerto é maior. **É o padrão mais universal encontrado até agora — confirma nos 5 campeonatos, inclusive Express**, que não respondia bem a nenhum dos outros padrões (2, 3 e 4).

## Regra prática combinada (testada agora)

Testei juntar os critérios 2 e 4 numa regra só: **só confiar no gatilho "segura e solta" quando (a) ainda não está no fim da linha da hora E (b) a hora está com % > 40 (forte)**.

| Campeonato | Sem filtro (qualquer slot após vermelho) | Com filtro (não-fim + hora forte) |
|---|---:|---:|
| Copa | 40.4% | 45.7% (melhora) |
| **Premier** | 42.0% | **56.7%** (melhora forte) |
| Super | 41.7% | 41.7% (neutro) |
| Euro | 51.2% | 47.8% (piora um pouco) |
| Express | 22.5% | sem amostra suficiente |

**Leitura honesta**: a combinação ajuda bastante em Premier e um pouco em Copa, mas não é uma vitória clara em todos os campeonatos — em Euro ela até piora levemente, e as amostras (24-46 jogos) já ficam pequenas o suficiente pra qualquer conclusão aqui ser provisória. **Não tratar isso como regra fechada ainda** — é a melhor combinação que temos até agora, não uma certeza.

## Como aplicar isso na prática (resumo pro cliente)

1. **Primeiro filtro, o mais confiável**: veja se a linha está subindo (comparando a hora atual com a anterior). Isso sozinho já é o sinal mais universal que temos — funciona até em Express.
2. Olhe também a % acumulada da hora atual. Se estiver alta (Topo, tipicamente >50%) E subindo, o cenário é o mais favorável combinado (ainda não testamos essa combinação exata com número, mas é a leitura lógica de somar os dois sinais mais fortes).
3. Espere um bloco de vermelhos seguidos (1 já pode bastar, não precisa de número fixo) como gatilho de entrada.
4. Antes de entrar no próximo slot esperando o "solta": confira se **não** está nos últimos slots da hora, e se a hora ainda está com % acima de 40 — mas lembre que isso é tendência, não garantia (já vimos hora "no limite" pagar bem no fim mesmo assim).
5. Prefira entrada dupla (2 slots seguidos) em vez de single, pra aumentar a chance de acertar pelo menos uma vez — especialmente em Euro e Premier, que têm as melhores taxas combinadas.
6. **Express só responde bem ao sinal de inclinação (subindo/descendo)** — os outros padrões (segura-solta, fim-de-linha, duas entradas) não funcionam bem lá. Se for operar Express, usar só o critério de inclinação.

## O que ainda falta pra essa análise ficar mais "certeira"

1. **Tudo isso é de um único dia** (2026-07-11). Nenhuma dessas regras foi testada em outro dia ainda — é o maior risco de tudo que está aqui. Precisa repetir a coleta e reteste em pelo menos 2-3 dias diferentes antes de confiar de verdade.
2. As amostras da regra combinada (item acima) são pequenas (24-46 casos por campeonato) — precisa de mais volume pra reduzir o risco de estar vendo sorte de amostra, não padrão real.
3. Não testamos ainda: sequências de 3+ vermelhos combinadas com o filtro de fim-de-linha; se o padrão muda dependendo do dia da semana ou horário do dia (madrugada vs tarde); retorno financeiro real considerando as odds de cada entrada (tudo até aqui foi taxa de acerto, não lucro).
4. Express continua sendo a maior incógnita — nenhum padrão testado até agora funciona bem lá, vale entender se é por causa do volume/velocidade diferente de jogos desse campeonato específico.

## Filtro endurecido — só as melhores entradas (2026-07-26)

Pedido do cliente: reduzir quantidade de entradas e priorizar qualidade,
mesmo que dispare com menos frequência. Mudanças aplicadas em
`site/servidor/regras.config.js` e `regras.js`:

1. **Limiar de Topo**: 55% → 65% (só conta como Topo quando a % está bem alta).
2. **Limiar de hora fraca**: 40% → 35% (só bloqueia entrada quando a hora está mesmo fraca).
3. **Sinal de entrada (V1)**: antes bastava 1 dos 3 sinais (inclinação, topo, segura-solta) confirmar; agora exige **pelo menos 2 dos 3 confirmados ao mesmo tempo**.

Efeito esperado: menos entradas no grupo, mas com taxa de acerto mais alta nas que saírem. Vale observar um período ao vivo pra confirmar que o filtro não ficou rígido demais (ex: quase nunca dispara).

**Acompanhamento ao vivo, já com o filtro novo:**
- 2026-07-26, Euro, hora 06h (slots 14 e 17): **bateu (green)**. Primeiro caso confirmado desde o endurecimento do filtro.

**Correção importante (2026-07-26, mesmo dia):** o filtro acima foi aplicado em
`calcularSinalEntrada` (V1), mas o servidor (`servidor.js`) na verdade usa
`calcularSinalEntradaV2` (regra B-Bets) — então esse endurecimento **nunca
teve efeito real** no bot em produção. O comportamento de verdade sempre foi
a V2: exige sequência de vermelhos "em linha" com o padrão vigente **E**
gráfico subindo, ao mesmo tempo.

## Afrouxamento da regra de sequência (2026-07-26)

Cliente notou que Copa não estava disparando entrada mesmo parecendo boa na
leitura visual — outros campeonatos (Euro, Premier) disparando normalmente.
Causa: em `regraPadraoDinamico` (`regras.js`), um bloco de vermelhos só
contava como "em linha com o padrão vigente" quando tinha **exatamente** o
mesmo tamanho do último bloco fechado — não contava enquanto o bloco ainda
estava se formando (ex: padrão de blocos-de-2, mas bloco atual só tem 1
vermelho ainda).

Ajuste: agora conta como "em linha" a partir de 1 vermelho no bloco aberto,
contanto que ainda não tenha passado do padrão vigente (não quebrou). Deve
aumentar a frequência de sinais em todos os campeonatos, Copa incluída.
Vale observar se a taxa de acerto se mantém com esse gatilho mais cedo.

## Próximo passo

Repetir toda essa bateria de testes em um dia diferente (ex: amanhã) e comparar linha a linha com os números aqui — só assim dá pra saber quais desses padrões são de verdade e quais foram sorte do dia 11/07.
