# Teste da hipótese "segura e solta" — sequência vermelho → verde

## Hipótese do cliente

Quando o mercado "segura" um jogo (sai vermelho/não bate Over 2.5) por um ou mais slots seguidos, o próximo slot tende a "soltar" e bater Over 2.5 (vir verde) — como se fosse uma compensação.

## Método

Usando a coleta de 2026-07-11 15:34 (`raw_2026-07-11_1534/`), percorri os slots de cada hora em ordem cronológica de minuto e comparei:
- **Baseline**: taxa geral de slots verdes no campeonato.
- **Após 1 vermelho**: taxa de verde no slot imediatamente seguinte a um vermelho.
- **Após 2 vermelhos seguidos**: taxa de verde no slot seguinte a dois vermelhos consecutivos.
- **Após 1 verde** (comparação): taxa de verde no slot seguinte a um verde, pra servir de contraste.

## Resultado — confirma em 2 de 5 campeonatos, sem efeito ou reverso nos outros 3

| Campeonato | Baseline | Após 1 vermelho | Após 2 vermelhos seguidos | Após 1 verde |
|---|---:|---:|---:|---:|
| Copa | 37.1% | 40.4% | 33.7% (caiu) | 34.5% |
| **Euro** | 46.4% | 51.2% | **67.8%** | 41.8% |
| Express | 23.2% | 22.5% | 22.6% (sem efeito) | 25.1% |
| Premier | 39.7% | 42.0% | 41.0% (neutro) | 38.5% |
| **Super** | 40.0% | 41.7% | **48.8%** | 38.7% |

## Leitura

- **Euro e Super mostram o padrão com força**: depois de 2 vermelhos seguidos, a chance de vir verde sobe bastante (Euro: +21 pontos vs baseline; Super: +9 pontos).
- **Copa e Express não confirmam** — em Copa o efeito até inverte (cai depois de 2 vermelhos), em Express não faz diferença nenhuma.
- **Premier fica neutro**, sem sinal claro.
- Comparado à hipótese "Topo/Fundo" (testada antes, que confirmou nos 5 campeonatos de forma consistente), essa hipótese de sequência é **mais fraca e mais específica de campeonato** — não é uma regra geral, parece ser um comportamento que só aparece em alguns mercados.

## Limitações

1. Mesma limitação de sempre: é uma única coleta (2026-07-11), amostra de "após 2 vermelhos" varia de 59 a 433 jogos dependendo do campeonato — Euro e Super com amostra menor (59-80) tornam o resultado mais sensível a sorte de amostra.
2. Não testamos "após 3 ou mais vermelhos seguidos" — pode ser que o efeito fique ainda mais forte (ou desapareça) com sequências maiores.
3. Não sabemos se isso é regra do mercado (o site ajusta odds pra forçar esse padrão) ou coincidência estatística do dia.

## Próximo passo

Se quiser aprofundar: testar sequências de 3+ vermelhos, e repetir esse teste em outro dia pra ver se Euro/Super continuam mostrando o efeito e se Copa/Express continuam sem.

## Caso ao vivo observado — Copa, hora 17 (2026-07-11, ~16h20-16h30)

Acompanhado minuto a minuto junto com o cliente, em tempo real, pra calibrar a leitura visual dele:

| Minuto | Resultado | Vermelhos seguidos antes |
|---|---|---|
| 01 | verde | 0 (abriu direto) |
| 04 | vermelho | — |
| 07 | verde | 1 vermelho seguraram antes |
| 10 | vermelho | — |
| 13 | vermelho | — |
| 16 | vermelho | — |
| 19 | vermelho | — |
| 22 | verde | 4 vermelhos seguraram antes |
| 25 | verde | 0 (emendou direto no verde anterior) |
| 28 | vermelho | — |
| 31 | verde | 1 vermelho segurou antes |
| 34 | vermelho | — |
| 37 | vermelho | — |
| 40 | verde | 2 vermelhos seguraram antes |
| 43 | vermelho | — |
| 46 | verde | 1 vermelho segurou antes |

**Observação importante pro aprendizado do padrão**: não é sempre "1 vermelho solta" nem sempre precisa acumular muitos vermelhos — nessa mesma hora vimos variações de 1, 2 e 4 vermelhos seguidos, todos soltando verde em seguida. Isso sugere que o padrão de "quantos vermelhos até soltar" **não tem número fixo** — é uma tendência estatística (mais vermelhos acumulados aumenta a chance do próximo vir verde, conforme o teste histórico mostrou), não uma regra determinística tipo "sempre segura X e solta".

**Resumo da hora 17 inteira até o minuto 46**: dos **5 momentos** em que o mercado "segurou" (teve 1+ vermelho seguido) e depois soltou, em **100% dos casos (5 de 5) veio um verde logo depois** — sem nenhuma exceção nessa hora inteira observada ao vivo, minuto a minuto, junto com o cliente. Blocos observados: 1 vermelho (04→07), 4 vermelhos (10-19→22), 1 vermelho (28→31), 2 vermelhos (34-37→40), 1 vermelho (43→46). É uma amostra pequena (5 casos, 1 única hora), mas é um resultado forte e consistente o suficiente pra justificar continuar testando em mais horas antes de formalizar como regra do futuro site.

**Nota de processo**: nessa sessão ao vivo, o assistente registrou errado os resultados dos minutos 28 e 31 numa primeira leitura (reportou os dois como verde por engano). O cliente corrigiu e o dado foi conferido de novo direto no site antes de salvar aqui. Lição: sempre reconferir no DOM antes de registrar um resultado ao vivo, não confiar só na leitura anterior.
