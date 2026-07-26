# Cuidado: fim de linha com hora já fraca (< mínimo ~40%)

## Alerta do cliente

Cuidado ao aplicar a estratégia de entrada (simples ou dupla) perto do final da hora: se a hora já "soltou" a maior parte do verde que tinha pra dar e a % acumulada da linha já está no mínimo (em torno de 40%, a linha de Equilíbrio do gráfico), pode não sobrar verde suficiente pros últimos minutos — a entrada fica mais arriscada nesse momento.

## Teste

Nos dados de 2026-07-11 15:34, separei cada hora em "2/3 iniciais" vs "último 1/3" (fim da linha), e dentro do fim, separei entre horas que terminaram **fracas** (pct_hora final ≤ 40%) vs **fortes** (pct_hora final > 40%).

## Resultado — confirma o alerta com força em 4 de 5 campeonatos

| Campeonato | Fim da hora, hora FRACA (≤40%) | Fim da hora, hora FORTE (>40%) |
|---|---:|---:|
| **Copa** | 32.1% | **65.6%** |
| Premier | 28.3% | 48.6% |
| Super | 30.0% | 46.4% |
| Euro | 45.7% | 52.8% (diferença mais leve) |
| Express | 23.8% | (sem amostra de hora forte no fim) |

## Leitura

- **O alerta do cliente está certo e é forte**: em Copa, Premier e Super, os minutos finais de uma hora "fraca" batem verde **quase metade da taxa** dos minutos finais de uma hora "forte".
- **Regra prática pro futuro site/monitoramento**: antes de fazer uma entrada (simples ou dupla) nos últimos minutos da hora (ex: 52 em diante), checar a % acumulada da hora até aquele ponto. Se já estiver baixa/perto do mínimo, tratar como sinal de cautela — a "munição" de verde da hora já pode estar esgotada.
- Isso complementa (não contradiz) o padrão "Topo/Fundo": uma hora que começou fraca e continua fraca até o fim tem menos chance geral; uma hora que estava fraca mas "virou" pro forte no meio já teria mais verde disponível pro fim.

## Limitações

1. Coleta de um único dia — mesma ressalva de sempre.
2. "Fim da hora" foi definido aqui como o último 1/3 dos slots decididos — não necessariamente os últimos minutos cronológicos exatos (05x, 58x) se algum jogo específico não tiver saído ainda.
3. Não testamos ainda o inverso: hora que está forte no início mas "murcha" no fim — vale investigar se isso também é um padrão de risco a evitar.

## Aprofundamento: chance de "segurar de novo" no fim de linha fraca

O cliente perguntou especificamente: no fim de linha, depois de já ter vindo 1 vermelho, qual a chance de vir **outro vermelho** (continuar segurando) em vez de soltar o verde? Separei essa chance comparando fim de hora fraca (≤40%) vs forte (>40%):

| Campeonato | Chance de segurar de novo — hora FRACA no fim | Chance de segurar de novo — hora FORTE no fim |
|---|---:|---:|
| **Copa** | **65.8%** (amostra 38) | 9.1% (amostra 11) |
| **Premier** | **78.9%** (amostra 38) | 46.7% (amostra 15) |
| **Express** | **76.2%** (amostra 193) | sem amostra suficiente |
| Super | 67.4% (amostra 43) | 52.9% (amostra 17) |
| Euro | 47.1% (amostra 17) | 40.0% (amostra 25) |

**Confirma com força o alerta do cliente**: no fim de uma hora já fraca, depois de um vermelho a chance de vir **outro vermelho** é muito alta (65-79% em Copa/Premier/Express) — bem diferente do padrão "segura e solta" que vimos funcionar bem no meio/início da hora. Isso quer dizer que a estratégia de entrada (simples ou dupla) baseada em "segura e solta" **perde força justamente no cenário mais perigoso**: fim de linha + hora já fraca. O mercado tende a continuar travado em vermelho ali, não a soltar.

**Regra prática combinada pro futuro site**: o gatilho de entrada "segura e solta" deve ser filtrado por duas condições, não uma só — (1) ainda não estar no fim da linha da hora, e (2) a hora ainda estar "forte" (>40% acumulado) no momento da entrada. Sem esse filtro, entrar no fim de uma hora fraca é o pior cenário: alta chance de continuar segurando.

## Saldo de gols no fim de linha (não só a % de acerto)

O cliente pediu pra olhar também o **saldo de gols real** (não só se bateu Over 2.5) no fim de linha. Calculei a média de gols por jogo (soma do placar, ex: "2-1" = 3 gols) comparando fim de hora fraca vs forte:

| Campeonato | Fim, hora FRACA | Fim, hora FORTE | Diferença |
|---|---:|---:|---:|
| Premier | 2.13 gols | **2.91 gols** | +0.78 |
| Copa | 2.18 gols | **2.72 gols** | +0.54 |
| Euro | 2.23 gols | 2.55 gols | +0.32 |
| Super | 1.90 gols | 2.22 gols | +0.32 |
| Express | 1.69 gols | sem amostra forte | — |

**Confirma e reforça o alerta**: não é só que a taxa de "bater Over 2.5" cai no fim de hora fraca — os jogos **literalmente saem com menos gols de verdade** nesse cenário. Em quase todos os casos de "fim de hora fraca", a média de gols fica abaixo ou bem perto de 2.5 (a própria linha de corte do mercado), o que explica matematicamente por que a chance de bater Over cai tanto ali. Isso não é coincidência de contagem — é o jogo real produzindo menos gols nesse momento específico.

## Contra-exemplo real observado ao vivo — Copa, hora 17 completa (2026-07-11, ~17h00)

A hora 17 da Copa fechou com o **header da página mostrando 38.33%** — mas esse número é o acumulado histórico geral do campeonato (todas as horas juntas), não a taxa daquela hora isolada. Contando os 20 slots reais dessa hora específica:

`01✅ 04❌ 07✅ 10❌13❌16❌19❌ 22✅ 25✅ 28❌ 31✅ 34❌37❌ 40✅ 43❌ 46✅ 49✅ 52✅ 55❌ 58✅`

**Resultado real da hora: 10 verdes e 10 vermelhos = 50% de acerto** — bem no equilíbrio, nem fraca nem forte. **Correção de método**: pra classificar se uma hora está "fraca" ou "forte" (pra aplicar a regra de cuidado no fim de linha), o certo é usar o `pct_hora` daquela linha específica (a coluna "%" da tabela, ex: "45%" que aparecia na hora 17 antes dela fechar), e não o header geral da página — os dois números são métricas diferentes e não podem ser trocados um pelo outro.

**A hora veio pagando o jogo inteiro** — não foi só um fim de linha "surpreendente" isolado, a hora toda teve bom volume de verde (10 de 20, distribuídos ao longo de toda a hora, incluindo o fim). Isso é consistente com uma hora de força mediana/equilíbrio, não uma hora fraca — então esse caso, corrigido o erro de métrica, **não é necessariamente uma exceção à regra**: é possível que uma hora de 50% simplesmente não se enquadre no cenário de risco descrito acima (que era especificamente pra horas **abaixo** de 40%).

**Lição de processo**: cuidado ao classificar "hora fraca vs forte" em tempo real — usar sempre o % da linha específica da hora, nunca o header acumulado geral da página, que mede outra coisa.

## Próximo passo

Cruzar esse alerta com a estratégia de duas entradas: testar se restringir as entradas duplas para quando a hora ainda está "forte" (>40% acumulado) no momento da entrada melhora ainda mais a taxa de acerto do que os 62-74% gerais já encontrados.
