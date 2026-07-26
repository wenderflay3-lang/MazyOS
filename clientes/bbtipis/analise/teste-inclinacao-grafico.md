# Teste: inclinação da linha (subindo vs descendo)

## Hipótese do cliente

Não é só o valor absoluto da linha (Topo/Fundo) que importa — a **direção/inclinação** conta: quando a linha do gráfico está subindo (não importa se vem do fundo, do meio ou já perto do topo), a chance de vir verde é maior do que quando está descendo.

## Método

Para cada hora, comparei sua % acumulada (`pct_hora`) com a da hora cronologicamente anterior. Se subiu, classifiquei os slots dessa hora como "hora subindo"; se caiu, "hora descendo"; se igual, "estável". Depois medi a taxa real de verde dentro de cada grupo.

## Resultado — confirma nos 5 campeonatos, inclusive Express

| Campeonato | Taxa verde (hora SUBINDO) | Taxa verde (hora DESCENDO) | Diferença |
|---|---:|---:|---:|
| Copa | 42.3% | 27.5% | +14.8 |
| **Euro** | 53.3% | 42.9% | +10.4 |
| Express | 27.8% | 20.0% | +7.8 |
| Premier | 44.6% | 33.3% | +11.3 |
| Super | 45.0% | 35.7% | +9.3 |

## Leitura

- **Esse é o padrão mais universal encontrado até agora** — os outros (segura-solta, fim-de-linha) falhavam ou eram fracos em Express e/ou Copa; este confirma nos 5, com diferença de pelo menos +7.8 pontos em todos.
- Isso é diferente e complementar ao padrão "Topo/Fundo" (valor absoluto): uma hora pode estar "no meio" (nem topo nem fundo) mas se está **subindo**, já carrega uma vantagem estatística. É a direção do movimento que importa, não só a posição.
- Faz sentido combinar com Topo/Fundo: a situação ideal seria uma hora que está subindo E já em posição de Topo — provavelmente o cenário de maior chance combinada (ainda não testado).

## Limitações

1. Mesma ressalva de sempre: dados de um único dia.
2. Aqui comparei hora vs hora anterior (nível hora-a-hora) — não testei a inclinação minuto-a-minuto dentro da própria hora (mais parecido com o que aparece visualmente no gráfico de linha real). Isso é uma aproximação, pode não capturar exatamente a leitura visual que o cliente faz olhando o gráfico direto.
3. Não sabemos ainda se "subindo" 1 hora é suficiente, ou se sequências mais longas de subida (2+, 3+ horas) reforçam ainda mais o efeito — testar isso é próximo passo natural.

## Próximo passo

1. Testar a combinação Topo + Subindo (a situação que teoricamente deveria ser a mais forte).
2. Tentar aproximar a leitura minuto-a-minuto da inclinação real do gráfico, não só hora-a-hora, pra ficar mais fiel ao que o cliente enxerga visualmente.

## Caso ao vivo observado — Copa, pico e descida (2026-07-11, ~17h58-18h10)

O cliente mostrou o gráfico ao vivo: a linha bateu o pico (Topo, 50) por volta das 17h10-17h58, e ao começar a descer, apontou que o mercado tende a "segurar" mais vermelho nessa fase — reforçando o padrão de inclinação (descendo = menos chance de verde).

Conferido ao vivo: assim que a hora virou para 18h (logo após o pico e início da descida), a sequência observada foi **01❌ 04❌ 07❌ 10✅** — 3 vermelhos seguidos logo no início dessa nova hora pós-pico, consistente com a leitura do cliente de que a fase de descida tende a segurar mais vermelho antes de soltar.
