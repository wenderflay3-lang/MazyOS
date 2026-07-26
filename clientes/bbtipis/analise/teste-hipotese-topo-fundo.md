# Teste da hipótese "Topo/Fundo" — coleta 2026-07-11

## Hipótese do cliente

Quando a linha de "temperatura" do horário está no **Topo** (ou saindo do **Fundo**), o jogo tende a bater Over 2.5.

## Método

A métrica de temperatura do gráfico é a mesma coluna "% (acerto da hora)" já presente na tabela de jogos — não precisou extrair o gráfico separadamente. Para cada campeonato:
- Classifiquei as horas do dia em **Topo** (25% superior da faixa de % observada), **Fundo** (25% inferior) e **Meio**.
- Comparei a taxa média de acerto (% de slots verdes = bateram Over 2.5) entre esses três grupos.

## Resultado — a hipótese se confirma nos 5 campeonatos

| Campeonato | Média % Topo | Média % Meio | Média % Fundo |
|---|---:|---:|---:|
| Copa | 47.5% | 31.3% | 5.0% |
| Euro | 57.5% | 50.0% | 41.4% |
| Express | 33.5% | 26.0% | 19.8% |
| Premier | 70.0% | 42.8% | 25.0% |
| Sul-Americana (Super) | 47.5% | 36.3% | 20.0% |

Em todo campeonato, horas classificadas como "Topo" bateram Over 2.5 significativamente mais que horas "Fundo" — a diferença varia de ~14 pontos (Euro) a mais de 40 pontos (Copa, Premier).

## Leitura

- O padrão que você já sentia intuitivamente aparece nos dados de forma consistente, em campeonatos com perfis bem diferentes (Express é um mercado "mais quente" no geral; Copa é mais "frio").
- Premier teve a diferença mais forte (70% vs 25%), mas é baseado em poucas horas (1 hora no grupo Topo) — vale confirmar com mais dias de coleta antes de tratar como regra sólida.
- Euro teve a diferença mais fraca (57.5% vs 41.4%) — ainda favorece a hipótese, mas com menos força de sinal.

## Limitações importantes

1. **Amostra de um único dia/momento** — isso é a "foto" de agora (2026-07-11), com poucas horas em cada grupo Topo/Fundo (1 a 8 horas por campeonato). Não temos ainda validação de que o padrão se repete em outros dias.
2. A classificação Topo/Fundo usada aqui (25%/25% da faixa observada no momento da coleta) é uma aproximação minha — não sabemos se corresponde exatamente ao que você enxerga visualmente no gráfico como "Topo" e "Fundo" (o gráfico tem linhas de referência fixas: Topo, Equilíbrio ~40, Fundo, que podem não ser relativas ao dia, e sim fixas no sistema).
3. Não testamos ainda se "saindo do Fundo" (a subida, não o valor absoluto) tem sinal mais forte que estar parado no Topo — isso pede olhar a sequência de horas, não só o valor pontual.

## Teste da variante "virada" (saindo do Fundo, subindo) — resultado mais fraco

Testei também se o momento em que a hora anterior estava no Fundo e a hora atual sobe (a "virada") tem taxa de acerto maior que as demais horas. Resultado, por campeonato:

| Campeonato | Horas de "virada" | Média % nessas horas | Média % demais horas |
|---|---:|---:|---:|
| Copa | 0 (nenhuma virada nesse dia) | — | 33.3% |
| Euro | 2 | 50.0% | 45.5% |
| Express | 6 | 27.8% | 19.7% |
| Premier | 3 | 40.0% | 40.0% (empate) |
| Sul-Americana | 0 (nenhuma virada nesse dia) | — | 37.5% |

**Essa variante é bem mais fraca e inconsistente** que o teste de valor absoluto acima: só Express mostrou vantagem clara, Euro teve sinal fraco, Premier não teve diferença nenhuma, e dois campeonatos nem tiveram uma "virada" pra testar nesse dia (amostra pequena — só 12-13 horas por campeonato).

**Conclusão preliminar**: com os dados de hoje, "estar no Topo" (valor absoluto da hora) é um sinal bem mais forte e consistente do que "estar saindo do Fundo" (a subida). Mas com só 1 dia de amostra e poucas viradas observadas, isso não é definitivo — precisa repetir em mais dias antes de descartar a hipótese da virada.

## Minuto específico dentro da hora — testado, sem sinal confiável ainda

Tentamos ir além e apontar não só a hora, mas o **minuto exato** dentro da hora com maior taxa de acerto (ex: "minuto 19 bate 76% no Super"). Dois testes:

1. **Minuto isolado, cruzando todas as horas**: amostras de 6-13 jogos por minuto — já frágil, mas com algum volume.
2. **Minuto dentro só das horas "Topo"** (o recorte mais promissor, cruzando os dois sinais): amostra cai pra **1-4 jogos por minuto**. Resultado: vários minutos aparecem com "100% de acerto", mas são 2 jogos de 2 — pura coincidência estatística, não padrão real.

**Conclusão: não dá pra confiar em minuto específico com o volume de dados de hoje.** Qualquer "minuto campeão" apontado agora seria ruído, não sinal. Decisão tomada com o cliente (2026-07-11): **usar só o padrão por hora (Topo/Fundo) como critério prático por enquanto**, e não perseguir minuto específico até acumular muito mais jogos por slot (ordem de grandeza: 30+ jogos por minuto, o que exige múltiplas coletas em dias diferentes acumuladas).

## Observações ao vivo (casos pontuais)

- **2026-07-26, Euro, hora 05h (slots 53 e 56):** gráfico estava no Topo no momento do sinal — bot disparou entrada Over 2.5 nos dois minutos. Cliente avaliou como **entrada arriscada**: Topo não "limpo", já dando sinal de perto de virar/cair — não é a mesma força de um Topo estável. **Resultado: bateu (green)** — risco pagou o que tinha que pagar. Sugere que mesmo um Topo "arriscado" (prestes a virar) ainda pode ser sinal válido, não necessariamente motivo pra descartar a entrada — vale acumular mais casos desse tipo antes de tratar "Topo arriscado" como sinal mais fraco.

## Regra de trajetória ensinada pelo cliente (2026-07-26)

Refinamento sobre o padrão Topo/Fundo, na leitura visual do cliente:

- **Subindo** (saindo do Fundo em direção ao Topo): tende a **bater** Over 2.5 (green) — é o momento em que o gráfico "vai pagar".
- **Chegando no Topo e começando a descer**: tende a **segurar** (não bater, red) — o Topo em si não é o sinal, é a subida até ele. Depois que vira e desce, o Over 2.5 fica seguro.

Isso é consistente com o padrão "Inclinação da linha" já registrado em `teste-inclinacao-grafico.md` (subindo = mais chance de verde) — essa observação reforça que a fase de descida do Topo é especificamente onde o risco de segurar aumenta, não só "estar no Topo" garante o green (ver caso de 05:53/05:56 acima, que era Topo mas "arriscado").

## Próximo passo natural

Repetir essa mesma coleta em dias diferentes pra ver se o padrão Topo>Fundo (o mais forte até agora) se mantém, e coletar mais amostras de "viradas" antes de decidir se essa variante tem sinal real ou é ruído do dia. Se depois de várias coletas o volume por minuto crescer o suficiente, revisitar a pergunta do minuto específico.
