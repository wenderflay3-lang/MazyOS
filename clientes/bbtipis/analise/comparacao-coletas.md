# Comparação entre coletas — mesmo dia (2026-07-11)

| Campeonato | Coleta 1 (11:00) Topo/Meio/Fundo | Coleta 2 (15:34) Topo/Meio/Fundo |
|---|---|---|
| Copa | 47.5% / 31.3% / 5.0% | 55.0% / 41.4% / 28.0% |
| Euro | 57.5% / 50.0% / 41.4% | 57.5% / 50.0% / 41.4% |
| Express | 33.5% / 26.0% / 19.8% | 35.0% / 26.0% / 19.8% |
| Premier | 70.0% / 42.8% / 25.0% | 70.0% / 40.9% / 25.0% |
| Sul-Americana | 47.5% / 36.3% / 20.0% | 47.5% / 40.0% / 32.5% |

**Padrão Topo > Meio > Fundo se manteve nos 5 campeonatos**, nas duas coletas do mesmo dia — coerente, já que é o mesmo histórico acumulado sendo re-observado poucas horas depois (não é ainda uma validação entre dias diferentes).

## O que isso prova e o que não prova

- Prova que a extração é **estável e repetível** — o pipeline de coleta funciona.
- Prova que o padrão **não é ruído de uma única leitura pontual** — se repete dentro do mesmo dia.
- **Não prova ainda** que o padrão se mantém de um dia pro outro — isso só vem coletando em dias diferentes (ex: hoje vs amanhã vs depois de amanhã) e comparando.

## Próximo passo real pra validar de vez

Repetir essa coleta em pelo menos 2-3 dias diferentes e comparar se a mesma relação Topo > Fundo aparece consistentemente entre eles — aí sim dá pra confiar no padrão como regra prática.
