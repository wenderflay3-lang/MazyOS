# Teste da estratégia "duas entradas" (recuperação)

## Lógica do cliente

Não apostar só em 1 minuto isolado — entrar em 2 minutos seguidos (ex: 46 e depois 49). Se o primeiro não bater (vier vermelho), a segunda entrada serve como recuperação. O que importa é a chance de bater em **pelo menos uma** das duas tentativas.

## Método

Nos dados da coleta de 2026-07-11 15:34, para cada par de slots consecutivos (em ordem cronológica de minuto) dentro da mesma hora, calculei:
- Taxa de acerto apostando só no 1º slot (1 tentativa)
- Taxa de "pelo menos 1 dos 2 bater" (a estratégia de duas entradas)
- Taxa de recuperação pura (1º errou, 2º acertou)
- Taxa de errar os dois seguidos (risco residual da estratégia)

## Resultado — reduz bastante o risco nos 5 campeonatos

| Campeonato | 1 tentativa | 2 tentativas (≥1 bater) | Erra os 2 seguidos |
|---|---:|---:|---:|
| Copa | 36.6% | 62.2% | 37.8% |
| **Euro** | 46.4% | **73.8%** | 26.2% |
| Express | 23.1% | 40.4% | 59.6% |
| Premier | 40.2% | 65.3% | 34.7% |
| Super | 39.2% | 64.6% | 35.4% |

## Leitura

- A estratégia de 2 entradas quase **dobra** a taxa de sucesso em todos os campeonatos (efeito esperado de matemática de probabilidade combinada, não é descoberta nova de padrão — mas confirma que a prática do cliente é sólida).
- **Euro é o melhor caso**: 73.8% de chance de bater em pelo menos uma das duas entradas, só 26.2% de risco de errar as duas.
- **Express continua sendo o mais arriscado**, mesmo com 2 entradas — quase 60% de chance de errar as duas seguidas. Não é um bom campeonato pra essa estratégia.
- Copa, Premier e Super ficam numa faixa intermediária, todos em torno de 62-65% de acerto combinado.

## Limitações

1. Mesma limitação de sempre: coleta de um único dia — não sabemos se essas taxas se mantêm em outros dias.
2. Isso assume que as duas entradas têm o mesmo "peso"/stake — não avaliamos aqui o retorno financeiro real considerando as odds de cada slot (uma entrada com odd baixa e outra com odd alta mudam o cálculo de lucro esperado, não só taxa de acerto).
3. Não testamos ainda se combinar isso com o padrão "segura e solta" (ex: só fazer a dupla entrada depois de já ter visto 2+ vermelhos seguidos) melhora ainda mais a taxa — vale testar como próximo passo.

## Próximo passo

Cruzar essa estratégia de duas entradas com o gatilho "segura e solta" (só entrar em par depois de uma sequência de vermelhos) pra ver se a taxa de acerto sobe ainda mais do que os 62-74% gerais.
