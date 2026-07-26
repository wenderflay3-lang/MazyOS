# Teste: tendência de subida entre horas (não entre minutos)

## Hipótese do cliente

Assim como dentro de uma hora existe a sequência "segura e solta" entre minutos, entre **horas** também existe uma tendência: quando a % de acerto vem subindo hora a hora em sequência, isso indica que o aquecimento está em curso e a próxima hora tende a vir igual ou mais forte.

## Caso real observado (Copa, 2026-07-11)

O cliente identificou ao vivo essa sequência real na Copa: `13h:30% → 14h:35% → 15h:40% → 16h:45% → 17h:50%` — uma subida de 4-5 horas consecutivas.

Conferindo no snapshot completo do dia, essa foi a **única sequência de 4+ subidas seguidas** que apareceu na Copa naquele dia — as demais horas oscilam bastante (ex: 04h:45% → 05h:25% → 06h:35% → 07h:25%, sobe e desce sem padrão). Isso mostra que o cliente conseguiu identificar visualmente um evento raro acontecendo ao vivo, o que é valioso mesmo sem confirmação estatística ainda.

## Teste estatístico (histórico do dia, 5 campeonatos)

Testei se, de forma geral, uma hora que sobe em relação à anterior tende a ser seguida por outra hora igual ou mais forte que a média:

| Campeonato | Média geral de todas as horas | Média da hora seguinte após 1 subida | Média da hora seguinte após 2 subidas seguidas |
|---|---:|---:|---:|
| Copa | 37.3% | 37.0% (n=5) | 45.0% (n=1) |
| Euro | 46.5% | 45.0% (n=3) | sem amostra |
| Express | 23.5% | 22.0% (n=5) | 20.0% (n=1) |
| Premier | 39.5% | 38.8% (n=4) | 40.0% (n=2) |
| Super | 40.0% | 37.5% (n=4) | sem amostra |

## Leitura honesta

**Essa hipótese específica NÃO se confirma no teste geral** — a média da hora seguinte a uma subida fica igual ou até um pouco abaixo da média geral, na maioria dos campeonatos. Isso é bem diferente do padrão "segura e solta" entre minutos (que teve sinal forte e consistente).

Mas a amostra aqui é muito pequena (só 13 horas por campeonato num único dia, e menos ainda quando peço 2+ subidas seguidas) — não dá pra descartar de vez, só não posso confirmar como regra com o que temos agora.

**Distinção importante**: o caso real que o cliente identificou (13h→17h na Copa) foi um evento **raro e específico** daquele dia — não uma ocorrência comum que se repete toda hora. É possível que a tendência de subida entre horas exista, mas seja mais rara/sutil que a tendência entre minutos, e precise de mais dias de dados pra aparecer com clareza estatística.

## Próximo passo

Repetir a coleta em vários dias e juntar todas as sequências de horas (não só um dia) pra ter amostra suficiente de "sequências de 3+ subidas" e testar de novo com mais confiança. Também vale conferir se esse padrão aparece mais forte em horários específicos do dia (ex: tarde/noite vs madrugada).
