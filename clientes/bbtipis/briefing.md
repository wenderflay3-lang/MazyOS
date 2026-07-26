# Briefing — bbtipis

**Data:** 2026-07-11
**Tipo:** Cliente novo

## Objetivo

Criar uma ferramenta/análise que ajude a identificar padrões no site bbtips (mercado Over/Under de futebol) para prever quando um jogo tende a bater Over 2.5 gols, com base no histórico de resultados e no comportamento das odds ao longo do tempo (gráfico de "aquecimento"/oscilação por horário).

## Entrega

- Análise/previsão de padrão (não é site institucional nem dashboard visual por enquanto — foco é entender e antecipar o padrão de Over 2.5)

## Fonte de dados

- Site: https://v1.bbtips.com.br/futebol/horarios
- Acesso: requer login (credenciais em `acesso.md`, fora do controle de versão)
- Print de referência inicial mostra: gráfico de linha com oscilação de "temperatura" do jogo por horário (topo/fundo), tabela de jogos com placares, odds e percentuais (%, %L, G) por faixa de horário, abas por campeonato (Express, Copa, Euro, Super, Premier, Split)

## Em aberto (definir nas próximas conversas)

- Como será a coleta de dados: manual (prints/cópia) ou automatizada (scraping)?
- Frequência: análise pontual ou monitoramento contínuo?
- Formato da entrega final: relatório, planilha, dashboard, alerta em tempo real?
- Qual o critério/regra que já funciona na cabeça do cliente pra Over 2.5 bater (pra usar como ponto de partida da análise)?
