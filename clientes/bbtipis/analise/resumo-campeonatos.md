# Resumo por campeonato — filtro Over 2.5 (coleta 2026-07-11)

Dados estruturados (JSON) em `raw/*_over25_full.json`, um arquivo por campeonato, extraídos direto do DOM renderizado (preserva cor verde/vermelho de cada slot, placar e odd).

| Campeonato    | % verde | % vermelho | Gols totais | Média Gols/Hora |
|---------------|--------:|-----------:|------------:|-----------------:|
| Express       | 22.87%  | 77.13%     | 1192        | 91.69            |
| Copa          | 35.46%  | 64.54%     | 528         | 40.62            |
| Euro          | 45.16%  | 54.84%     | 586         | 45.08            |
| Super (Sul-Americana) | 39.59% | 60.41% | 574       | 44.15            |
| Premier       | 40.24%  | 59.76%     | 592         | 45.54            |

> A aba "Split" replica Copa/Euro/Sul-Americana/Premier em sub-abas — não é campeonato novo, é outra visualização dos mesmos 4. Não precisou coleta separada.
>
> Números mudam levemente a cada coleta (dado ao vivo, jogos completando em tempo real) — normal, não é inconsistência de captura.

## Estrutura confirmada dos dados (via inspeção visual + DOM)

- **Gráfico de linha no topo** = "temperatura" do jogo por horário, com zonas nomeadas: **Topo (mais alto, ~55)**, **Equilíbrio (~40)**, **Fundo (mais baixo, ~25)**. Eixo Y esquerdo é a métrica de temperatura; direito é 0-100 (%). Dropdown "Referência" define o mercado usado no gráfico (ex: Over 2.5).
- **Tabela "Jogos"**: linhas = hora do dia, colunas = minuto do jogo dentro da hora (de 3 em 3, 01 a 58/59 pra maioria; Express tem granularidade maior, 60 slots/hora). Cada célula tem:
  - `placar` (ex: "2-1")
  - `odd` (ex: "@2.30") — odd oferecida pra esse mercado/slot
  - `status`: **green** (bateu o filtro ativo, ex: Over 2.5), **red** (não bateu), **futuro** (jogo ainda não rolou, só mostra odd), **sem_dados** (sem jogo nesse slot)
- Coluna final "%" e "G" de cada linha = taxa de acerto e total de gols daquela hora.
- Cabeçalho de cada coluna (minuto) mostra gols acumulados históricos (⚽) e % histórico daquele minuto especificamente.
- Header da página (%verde / %vermelho) = % de slots com jogos que bateram vs não bateram o filtro ativo, sobre o total de jogos already-decided (não conta "futuro"/"sem_dados").

## Filtros testados e comportamento confirmado

- **Over Gols / Under Gols** (dropdowns 1.5/2.5/3.5): definem o critério de "bateu" (verde) vs "não bateu" (vermelho). Podem ficar ambos ativos ao mesmo tempo (Over E Under simultâneos) — não teste isso como filtro combinado sem necessidade, gera leitura confusa.
- **"% Linha"**: switch que não muda o header nem os dois percentuais (testado ligado/desligado, sem diferença visível no que capturamos) — função ainda não mapeada.
- Dropdown **"Referência"** (no gráfico) é separado dos filtros Over/Under Gols da lateral — define qual mercado o gráfico de linha usa, independente da tabela.

## Pendências reais antes de modelar o padrão

1. Definir com o cliente qual é o critério dele hoje pra saber que um jogo "vai bater" Over 2.5 (o que ele já observa/intui) — isso vira a hipótese a testar contra os dados.
2. Decidir se a análise é por campeonato separado (dados têm perfis bem diferentes — Express é um mercado muito mais quente que os demais) ou agregada.
3. Este é um snapshot único no tempo (histórico acumulado até 2026-07-11). Não sabemos se o padrão se mantém entre dias/rodadas — precisa decidir frequência de recoleta (diária? semanal?) pra validar estabilidade do padrão antes de confiar nele.
4. Ainda não exploramos "Tendência", "Máximas", "Ranking", "Confrontos" e "Horários Fixos" (botões vistos na barra de ferramentas) — podem ter visões já prontas que economizam trabalho de análise manual.
