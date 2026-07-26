// Cada função de regra recebe `rowsCronologicas` (mais antiga -> mais recente,
// já que dados.rows vem do coletor em ordem decrescente de hora) e devolve um
// mapa { hora: { destaque, motivo, forca } }. O servidor funde os resultados
// de todas as regras ativas antes de responder à API.

function regraInclinacao(rowsCronologicas, params) {
  const out = {};
  for (let i = 1; i < rowsCronologicas.length; i++) {
    const atual = rowsCronologicas[i];
    const anterior = rowsCronologicas[i - 1];
    if (atual.pct_hora == null || anterior.pct_hora == null) continue;

    const diferenca = atual.pct_hora - anterior.pct_hora;
    if (diferenca > params.limiarSubida) {
      out[atual.hora] = {
        destaque: true,
        motivo: `Inclinação: subindo (${anterior.pct_hora}% → ${atual.pct_hora}%) — sinal forte`,
        forca: 'alta',
      };
    }
  }
  return out;
}

function regraTopoFundo(rowsCronologicas, params) {
  const out = {};
  rowsCronologicas.forEach((row) => {
    if (row.pct_hora == null) return;
    if (row.pct_hora >= params.limiarTopo) {
      out[row.hora] = { destaque: true, motivo: `Topo (${row.pct_hora}%)`, forca: 'media' };
    } else if (row.pct_hora <= params.limiarFundo) {
      out[row.hora] = { destaque: true, motivo: `Fundo (${row.pct_hora}%)`, forca: 'baixa' };
    }
  });
  return out;
}

function regraSeguraSolta(rowsCronologicas, params) {
  const out = {};
  rowsCronologicas.forEach((row) => {
    let seguidos = 0;
    const gatilhos = [];
    row.slots.forEach((slot, idx) => {
      if (slot.status === 'red') {
        seguidos += 1;
      } else {
        if (slot.status === 'green' && seguidos >= params.minVermelhosSeguidos) {
          gatilhos.push({ minuto: slot.minuto, bloco: seguidos });
        }
        seguidos = 0;
      }
    });
    if (gatilhos.length > 0) {
      out[row.hora] = {
        destaque: true,
        motivo: `Segura e solta: ${gatilhos.length} gatilho(s) nesta hora`,
        forca: 'media',
        detalhes: gatilhos,
      };
    }
  });
  return out;
}

function regraDuasEntradas(rowsCronologicas) {
  const out = {};
  rowsCronologicas.forEach((row) => {
    let acertosDuplos = 0;
    let pares = 0;
    for (let i = 0; i < row.slots.length - 1; i++) {
      const a = row.slots[i];
      const b = row.slots[i + 1];
      if (a.status === 'sem_dados' || b.status === 'sem_dados') continue;
      pares += 1;
      if (a.status === 'green' || b.status === 'green') acertosDuplos += 1;
    }
    if (pares > 0) {
      out[row.hora] = {
        destaque: false,
        motivo: `Duas entradas: ${acertosDuplos}/${pares} pares com ao menos 1 green`,
        forca: 'info',
      };
    }
  });
  return out;
}

function regraFimDeLinhaHoraFraca(rowsCronologicas, params) {
  const out = {};
  rowsCronologicas.forEach((row) => {
    if (row.pct_hora == null || row.pct_hora > params.limiarHoraFraca) return;
    const totalSlots = row.slots.length;
    const inicioFim = Math.max(0, totalSlots - params.slotsFimDeLinha);
    const slotsFim = row.slots.slice(inicioFim);
    const temDadoNoFim = slotsFim.some((s) => s.status !== 'sem_dados');
    if (temDadoNoFim) {
      out[row.hora] = {
        destaque: true,
        motivo: `Cuidado: hora fraca (${row.pct_hora}%) nos últimos slots`,
        forca: 'alerta',
      };
    }
  });
  return out;
}

// Regra "padrão dinâmico de sequência" (ensinada pelo cliente em 2026-07-12,
// B-Bets — versão 2, sem tamanho de bloco fixo). Não existe um número mágico
// de vermelhos: o padrão é "o tamanho de bloco vermelho que está se repetindo
// agora" (pode ser 1, 2, 3 ou mais). A regra:
// 1) lista todos os blocos de vermelhos-seguidos-de-um-verde já fechados na hora;
// 2) o PADRÃO VIGENTE é o tamanho do último bloco fechado (o mais recente);
// 3) QUEBROU quando o bloco em aberto (ainda sem green) não bate com esse
//    tamanho vigente uma vez que já passou do ponto onde o padrão anterior
//    teria soltado verde — nesse caso não há gatilho, só "aguardar nova tendência";
// 4) se o bloco em aberto tem o mesmo tamanho do padrão vigente, é candidato
//    a entrada no próximo slot (a tendência se mantém).
function regraPadraoDinamico(rowsCronologicas) {
  const out = {};
  rowsCronologicas.forEach((row) => {
    // Só considera slots já decididos (green/red) — slots 'futuro'/'sem_dados'
    // ainda não aconteceram e não podem fechar nem quebrar um bloco.
    const slotsDecididos = row.slots.filter((s) => s.status === 'green' || s.status === 'red');

    const blocosFechados = [];
    let seguidos = 0;
    slotsDecididos.forEach((slot) => {
      if (slot.status === 'red') {
        seguidos += 1;
      } else {
        if (seguidos > 0) {
          blocosFechados.push(seguidos);
        }
        seguidos = 0;
      }
    });
    const blocoAberto = seguidos > 0 ? seguidos : null;

    if (blocosFechados.length === 0) {
      // Sem histórico de blocos fechados nesta hora ainda — não dá pra
      // afirmar um padrão vigente, só observar.
      return;
    }

    const padraoVigente = blocosFechados[blocosFechados.length - 1];
    const quebrou = blocoAberto != null && blocoAberto > padraoVigente;
    // Afrouxado em 2026-07-26 (pedido do cliente: mais campeonatos entrando,
    // ex: Copa ficando de fora sem motivo aparente) — antes só contava
    // "em linha" quando o bloco aberto tinha EXATAMENTE o tamanho do padrão
    // vigente; agora conta a partir de 1 vermelho no bloco aberto, contanto
    // que ainda não tenha passado do padrão (não quebrou).
    const emLinhaComPadrao = blocoAberto != null && blocoAberto >= 1 && !quebrou;

    if (emLinhaComPadrao) {
      out[row.hora] = {
        destaque: true,
        motivo: `Padrão vigente: blocos de ${padraoVigente} vermelho(s) — sequência atual em linha, aguardando soltar`,
        forca: 'media',
        padraoVigente,
        quebrou: false,
      };
    } else if (quebrou) {
      out[row.hora] = {
        destaque: false,
        motivo: `Sequência quebrou: padrão era de ${padraoVigente}, bloco atual já tem ${blocoAberto} — aguardar nova tendência se formar`,
        forca: 'alerta',
        padraoVigente,
        quebrou: true,
      };
    } else {
      // Ainda dentro do padrão mas o bloco aberto é 0 (acabou de soltar verde)
      // — não é gatilho de entrada em si, só contexto informativo.
      out[row.hora] = {
        destaque: false,
        motivo: `Padrão vigente: blocos de ${padraoVigente} vermelho(s)`,
        forca: 'info',
        padraoVigente,
        quebrou: false,
      };
    }
  });
  return out;
}

// Regra "tendência de alta" (B-Bets, 2026-07-12) — exigia 2 SUBIDAS seguidas
// no pct_hora; afrouxada em 2026-07-17 a pedido do cliente pra capturar mais
// oportunidades (mais entradas, aceitando taxa de acerto um pouco menor).
// Agora basta 1 subida (hora atual > anterior) pra confirmar.
function regraTendenciaAlta(rowsCronologicas, params) {
  const out = {};
  for (let i = 1; i < rowsCronologicas.length; i++) {
    const h1 = rowsCronologicas[i];
    const h0 = rowsCronologicas[i - 1];
    if (h1.pct_hora == null || h0.pct_hora == null) continue;

    const subiu = h1.pct_hora - h0.pct_hora > (params.limiarSubida || 0);

    if (subiu) {
      out[h1.hora] = {
        destaque: true,
        motivo: `Tendência de alta: subindo (${h0.pct_hora}% → ${h1.pct_hora}%)`,
        forca: 'media',
      };
    }
  }
  return out;
}

const REGISTRO = {
  inclinacao: regraInclinacao,
  topoFundo: regraTopoFundo,
  seguraSolta: regraSeguraSolta,
  duasEntradas: regraDuasEntradas,
  fimDeLinhaHoraFraca: regraFimDeLinhaHoraFraca,
  padraoDinamico: regraPadraoDinamico,
  tendenciaAlta: regraTendenciaAlta,
};

function aplicarRegras(dados, config) {
  const rowsCronologicas = [...dados.rows].reverse();
  const resultadoPorRegra = {};

  config.regras.forEach((regraCfg) => {
    if (!regraCfg.ativa) return;
    const fn = REGISTRO[regraCfg.id];
    if (!fn) return;
    resultadoPorRegra[regraCfg.id] = fn(rowsCronologicas, regraCfg);
  });

  return resultadoPorRegra;
}

// Aponta a HORA e o(s) MINUTO(S) em que entrar, combinando os destaques já
// calculados na ordem de prioridade descrita em
// clientes/bbtipis/analise/REGRAS-CONSOLIDADAS.md ("Como aplicar isso na
// prática"): 1) inclinação subindo, 2) topo, 3) segura-e-solta, com o alerta
// de fim-de-linha/hora-fraca podendo cancelar a entrada. Quando a regra
// "duas entradas" está ativa, sugere os 2 próximos slots em vez de só 1
// (eleva a taxa de "acertar pelo menos uma vez", ver teste-duas-entradas.md).
//
// Endurecido em 2026-07-26 (pedido do cliente: filtrar só as melhores
// entradas) — antes bastava QUALQUER UM dos 3 sinais confirmar; agora exige
// pelo menos 2 dos 3 confirmados ao mesmo tempo, reduzindo entradas em sinal
// único e fraco.
function calcularSinalEntrada(dados, destaques, config) {
  const horaAtual = dados.rows[0];
  if (!horaAtual) return null;

  const hora = horaAtual.hora;
  const proximosSlots = horaAtual.slots.filter((s) => s.status === 'futuro' || s.status === 'sem_dados');
  if (proximosSlots.length === 0) return null;

  const usarDuasEntradas = config.regras.some((r) => r.id === 'duasEntradas' && r.ativa);
  const qtd = usarDuasEntradas ? 2 : 1;
  const minutos = proximosSlots.slice(0, qtd).map((s) => s.minuto);

  const alerta = destaques.fimDeLinhaHoraFraca?.[hora];
  if (alerta) {
    return { entrar: false, hora, minutos, motivo: alerta.motivo };
  }

  const motivos = [];
  if (destaques.inclinacao?.[hora]) motivos.push(destaques.inclinacao[hora].motivo);
  if (destaques.topoFundo?.[hora]?.forca === 'media') motivos.push(destaques.topoFundo[hora].motivo);
  if (destaques.seguraSolta?.[hora]) motivos.push(destaques.seguraSolta[hora].motivo);

  const MIN_MOTIVOS_CONFIRMADOS = 2;
  if (motivos.length < MIN_MOTIVOS_CONFIRMADOS) {
    return {
      entrar: false,
      hora,
      minutos,
      motivo:
        motivos.length === 0
          ? 'Nenhum padrão forte confirmado agora — aguardar próximo slot.'
          : `Só 1 sinal confirmado (${motivos.join(', ')}) — aguardando confirmação de um segundo pra entrar.`,
    };
  }

  return { entrar: true, hora, minutos, motivo: motivos.join(' + ') };
}

// Sinal B-Bets (cliente, 2026-07-12 — versão 2, sem regra fixa de tamanho de
// bloco). Só libera entrada quando AMBAS as condições batem juntas (E, não
// OU) — diferente do sinal original acima, que libera com qualquer uma das
// regras confirmando:
// 1) tabela: o padrão de bloco vermelho vigente está em linha, não quebrou
//    (regraPadraoDinamico com destaque=true)
// 2) gráfico: 2 subidas seguidas no pct_hora (tendenciaAlta)
// Se a sequência quebrou, ou o gráfico não está em alta clara: SEM ENTRADA,
// aguardar nova tendência se formar — não é erro, é o comportamento esperado.
function calcularSinalEntradaV2(dados, destaques, config) {
  const horaAtual = dados.rows[0];
  if (!horaAtual) return null;

  const hora = horaAtual.hora;
  const proximosSlots = horaAtual.slots.filter((s) => s.status === 'futuro' || s.status === 'sem_dados');
  if (proximosSlots.length === 0) return null;

  const usarDuasEntradas = config.regras.some((r) => r.id === 'duasEntradas' && r.ativa);
  const qtd = usarDuasEntradas ? 2 : 1;
  const minutos = proximosSlots.slice(0, qtd).map((s) => s.minuto);

  const padrao = destaques.padraoDinamico?.[hora];
  const sequenciaOk = Boolean(padrao?.destaque);
  const sequenciaQuebrou = Boolean(padrao?.quebrou);
  const graficoOk = Boolean(destaques.tendenciaAlta?.[hora]);

  if (sequenciaOk && graficoOk) {
    return {
      entrar: true,
      hora,
      minutos,
      motivo: `${padrao.motivo} + ${destaques.tendenciaAlta[hora].motivo}`,
      sequencia: sequenciaOk,
      sequenciaQuebrou,
      grafico: graficoOk,
    };
  }

  const faltando = [];
  if (sequenciaQuebrou) {
    faltando.push(padrao.motivo);
  } else if (!sequenciaOk) {
    faltando.push('padrão de sequência ainda não definido — observando');
  }
  if (!graficoOk) faltando.push('gráfico sem tendência de alta (2 subidas seguidas)');

  return {
    entrar: false,
    hora,
    minutos,
    motivo: `Sem entrada — aguardar: ${faltando.join(' e ')}.`,
    sequencia: sequenciaOk,
    sequenciaQuebrou,
    grafico: graficoOk,
  };
}

module.exports = { aplicarRegras, calcularSinalEntrada, calcularSinalEntradaV2 };
