// Config editável das regras/padrões aplicados ao gráfico ao vivo.
// Baseado em clientes/bbtipis/analise/REGRAS-CONSOLIDADAS.md — os parâmetros
// aqui mudam com frequência conforme o cliente refina a leitura ao vivo.
module.exports = {
  regras: [
    {
      id: 'inclinacao',
      ativa: true,
      // Diferença mínima de pct_hora vs a hora anterior para considerar "subindo".
      limiarSubida: 0,
    },
    {
      id: 'topoFundo',
      ativa: true,
      // Endurecido 55 -> 65 em 2026-07-26 (pedido do cliente: filtrar só as
      // melhores entradas) — só conta como "Topo" quando a % está bem alta,
      // reduzindo sinais fracos que antes contavam como Topo "de raspão".
      limiarTopo: 65,
      limiarFundo: 25,
    },
    {
      id: 'seguraSolta',
      ativa: true,
      // Quantos "red" seguidos (no mínimo) já configuram o gatilho.
      minVermelhosSeguidos: 1,
    },
    {
      id: 'duasEntradas',
      ativa: true,
    },
    {
      id: 'fimDeLinhaHoraFraca',
      ativa: true,
      // Endurecido 40 -> 35 em 2026-07-26 (pedido do cliente: filtrar só as
      // melhores entradas) — só bloqueia entrada quando a hora está mesmo
      // fraca, não numa faixa intermediária.
      limiarHoraFraca: 35,
      // Últimos N slots da hora contam como "fim de linha".
      slotsFimDeLinha: 6,
    },
    {
      // Regra B-Bets (cliente, 2026-07-12, v2): padrão dinâmico de bloco
      // vermelho — sem tamanho fixo, acompanha o que estiver se repetindo agora.
      id: 'padraoDinamico',
      ativa: true,
    },
    {
      // Regra B-Bets (cliente, 2026-07-12): 2 subidas seguidas no pct_hora.
      id: 'tendenciaAlta',
      ativa: true,
      limiarSubida: 0,
    },
  ],
};
