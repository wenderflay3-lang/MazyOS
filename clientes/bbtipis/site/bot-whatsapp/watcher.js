require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const config = require('./config');
const { enviarMensagem } = require('./enviar');
const { lerPlacar, registrarResultado } = require('./placar');

const NOMES = {
  express: 'Express',
  copa: 'Copa',
  euro: 'Euro',
  super: 'Super',
  premier: 'Premier',
};

// Guarda o último estado de entrar (true/false) por campeonato, pra só
// disparar mensagem na transição false -> true e não repetir a cada ciclo.
const ultimoEstado = {};

// Entradas disparadas aguardando o resultado real dos slots (pra mandar a
// confirmação ✅/❌ assim que os minutos apostados tiverem placar coletado).
// Formato: { campeonato: { hora, minutos: [...], nome } }
const entradasPendentes = {};

// Aviso de status quando fica muito tempo sem nenhum sinal disparar —
// pedido do cliente em 2026-07-12: sem isso, o grupo fica quieto e parece
// que o bot travou, quando na real ele só está sendo seletivo (esperando as
// 2 condições da B-Bets baterem juntas). Ajustado 15min -> 5min -> 15min de
// volta (2026-07-17), depois que a checagem de "só repete se mudou" já
// resolveu a poluição de mensagens repetidas.
const INTERVALO_AVISO_STATUS_MS = 15 * 60 * 1000;
let ultimoEnvioQualquerMensagem = Date.now();
const ultimoMotivoPorCampeonato = {};

// Guarda o texto do último aviso de status enviado — se nada mudou desde
// então, não repete a mesma mensagem (pedido do cliente em 2026-07-17: os
// avisos estavam saindo idênticos, um atrás do outro, sem necessidade).
let ultimoTextoStatusEnviado = null;

// Placar do dia (green/red) — pedido do cliente em 2026-07-18: mostrar no
// aviso de status quantas entradas bateram/não bateram "até o momento".
// Persistido em arquivo (placar.js) pra ser lido também pelo servidor de
// comandos (comando-servidor.js), que responde "placar" no grupo.
function registrarResultadoNoPlacar(bateu) {
  registrarResultado(bateu);
}

// Formato final acordado com o cliente (2026-07-12) — modelo de mensagem
// real que o bot deve reproduzir no grupo:
//
// 🤖 2,5 🤖
//
// 🏆 EURO 🏆
//
// ✔︎ Entradas ⬇️
//
// ⏰ 02:20 ➡️ Over 2.5
// ⏰ 02:23 ➡️ Over 2.5
// ⏰ 02:26 ➡️ Over 2.5
//
// 51 Greens Seguidos!
//
// 🎯 100.0% de Acerto
//
// TODO: `streak` (greens seguidos) e `taxaAcerto` ainda não são calculados
// pelas regras — aguardando a análise de mercado do cliente pra definir a
// lógica certa. Por ora ficam null e a mensagem omite essas duas linhas.
function formatarMensagem(campeonato, sinal, streak) {
  const nome = NOMES[campeonato] || campeonato;
  const linhasHorarios = sinal.minutos
    .map((minuto) => `⏰ ${sinal.hora}:${minuto} ➡️ Over 2.5`)
    .join('\n');

  let mensagem =
    `🤖 2,5 🤖\n\n` +
    `🏆 ${nome.toUpperCase()} 🏆\n\n` +
    `✔︎ Entradas ⬇️\n\n` +
    `${linhasHorarios}`;

  if (streak && streak.greensSeguidos != null) {
    mensagem += `\n\n${streak.greensSeguidos} Greens Seguidos!`;
  }
  if (streak && streak.taxaAcerto != null) {
    mensagem += `\n\n🎯 ${streak.taxaAcerto.toFixed(1)}% de Acerto`;
  }

  return mensagem;
}

// Verifica se a entrada pendente de um campeonato já tem resultado real nos
// dados (slot deixou de ser 'futuro'/'sem_dados') e manda a confirmação.
async function checarResultadoPendente(campeonato, dados) {
  const pendente = entradasPendentes[campeonato];
  if (!pendente) return;

  const row = dados.rows.find((r) => r.hora === pendente.hora);
  if (!row) return;

  const slots = pendente.minutos
    .map((minuto) => row.slots.find((s) => s.minuto === minuto))
    .filter(Boolean);

  // Só confirma quando TODOS os minutos apostados já saíram do estado
  // futuro/sem_dados — parcial não conta, evita mensagem incompleta.
  const todosResolvidos = slots.length === pendente.minutos.length &&
    slots.every((s) => s.status === 'green' || s.status === 'red');
  if (!todosResolvidos) return;

  const bateu = slots.some((s) => s.status === 'green');
  const emoji = bateu ? '✅' : '❌';
  const tituloResultado = bateu ? 'RESULTADO — BATEU' : 'RESULTADO — NÃO BATEU';

  // Repete campeonato + hora + cada minuto apostado com o placar real, no
  // mesmo formato da mensagem de entrada — assim fica claro a QUAL sinal
  // esse resultado se refere, mesmo com vários campeonatos ativos ao mesmo tempo.
  const linhasResultado = slots
    .map((s) => `⏰ ${pendente.hora}:${s.minuto} ➡️ ${s.placar ?? '?'} ${s.status === 'green' ? '✅' : '❌'}`)
    .join('\n');

  const texto =
    `${emoji} *${tituloResultado}*\n\n` +
    `🏆 ${pendente.nome.toUpperCase()} 🏆\n\n` +
    `${linhasResultado}`;

  console.log(`[watcher] resultado ${campeonato} ${pendente.hora}h: ${bateu ? 'GREEN' : 'RED'}`);
  await enviarMensagem(texto).catch((erro) => {
    console.error(`[watcher] falha ao enviar resultado (${campeonato}):`, erro.message);
  });
  registrarResultadoNoPlacar(bateu);
  ultimoEnvioQualquerMensagem = Date.now();

  delete entradasPendentes[campeonato];
}

async function checarCampeonato(campeonato) {
  const url = `${config.painelUrl}/api/${campeonato}`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    console.error(`[watcher] ${campeonato}: painel respondeu ${resposta.status}`);
    return;
  }

  const dados = await resposta.json();

  await checarResultadoPendente(campeonato, dados);

  const sinal = dados.sinalEntrada;
  if (!sinal) return;

  ultimoMotivoPorCampeonato[campeonato] = sinal;

  const chave = `${campeonato}:${sinal.hora}`;
  const estavaEntrando = ultimoEstado[campeonato];
  const chaveMudou = ultimoEstado[`${campeonato}_chave`] !== chave;

  if (sinal.entrar && (!estavaEntrando || chaveMudou)) {
    // streak/taxaAcerto: null até definirmos a lógica com a análise do cliente.
    const streak = { greensSeguidos: null, taxaAcerto: null };
    const texto = formatarMensagem(campeonato, sinal, streak);
    console.log(`[watcher] disparando entrada: ${campeonato} ${sinal.hora}h ${sinal.minutos}`);
    await enviarMensagem(texto).catch((erro) => {
      console.error(`[watcher] falha ao enviar mensagem (${campeonato}):`, erro.message);
    });
    entradasPendentes[campeonato] = {
      hora: sinal.hora,
      minutos: sinal.minutos,
      nome: NOMES[campeonato] || campeonato,
    };
    ultimoEnvioQualquerMensagem = Date.now();
  }

  ultimoEstado[campeonato] = sinal.entrar;
  ultimoEstado[`${campeonato}_chave`] = chave;
}

// Traduz o motivo técnico pra uma versão zoeira, SEM revelar números,
// percentuais ou o nome do padrão usado internamente — pedido do cliente em
// 2026-07-26: o grupo pode saber que o bot está ativo e sendo seletivo, mas
// não pode dar pra reconstruir a estratégia a partir do aviso. Por isso a
// detecção é por palavra-chave (não pela frase inteira) e qualquer motivo
// que não bata em nenhuma categoria cai numa frase genérica — nunca no texto
// técnico original.
function zoarMotivo(motivoOriginal) {
  const motivo = motivoOriginal.replace(/^Sem entrada — aguardar:\s*/i, '').replace(/\.$/, '');

  const FRASES_GENERICAS = [
    'ainda decidindo se quer aparecer ou não, cara de paisagem',
    'de boa no canto, esperando a hora certa',
    'só de olho, ainda sem coragem de entrar',
    'meio enrolado, mas nada travado',
    'quietinho por enquanto, sem novidade',
  ];

  if (/sequência quebrou/i.test(motivo)) {
    return 'tomou um esporro e sumiu no mato';
  }
  if (/sem tendência de alta|parado/i.test(motivo)) {
    return 'parado que nem estátua, sem gás pra subir';
  }
  if (/padrão vigente|padrão de sequência/i.test(motivo)) {
    return 'ainda decidindo se quer aparecer ou não, cara de paisagem';
  }
  if (/nenhum padrão forte/i.test(motivo)) {
    return 'nada de forte rolando, só sinal fraquinho';
  }

  // Fallback: nunca devolver o motivo técnico cru — escolhe uma frase
  // genérica de forma estável (mesmo motivo -> mesma frase), evitando que a
  // mensagem varie sem necessidade a cada ciclo.
  let hash = 0;
  for (let i = 0; i < motivo.length; i++) hash = (hash * 31 + motivo.charCodeAt(i)) >>> 0;
  return FRASES_GENERICAS[hash % FRASES_GENERICAS.length];
}

// A cada INTERVALO_AVISO_STATUS_MS sem nenhuma mensagem enviada (nem entrada
// nem resultado), manda um resumo do motivo de cada campeonato pra deixar
// claro que o bot está ativo e só sendo seletivo, não travado.
async function checarAvisoDeStatus() {
  const semMensagemHaMuitoTempo = Date.now() - ultimoEnvioQualquerMensagem >= INTERVALO_AVISO_STATUS_MS;
  if (!semMensagemHaMuitoTempo) return;

  const linhas = config.campeonatos.map((campeonato) => {
    const sinal = ultimoMotivoPorCampeonato[campeonato];
    const nome = NOMES[campeonato] || campeonato;
    if (!sinal) return `🏆 ${nome}: sem dados ainda`;
    return `🏆 ${nome}: ${zoarMotivo(sinal.motivo)}`;
  });

  // Placar do dia — só mostra se já teve pelo menos 1 resultado hoje.
  const placarAtual = lerPlacar();
  const temPlacarHoje = placarAtual.green > 0 || placarAtual.red > 0;
  const linhaPlacar = temPlacarHoje
    ? `\n\n📊 *Placar de hoje:* ${placarAtual.green} Green ✅ | ${placarAtual.red} Red ❌ (tá on, calma)`
    : '';

  const texto =
    `🚨 *PLANTÃO DO NADA — ninguém bateu nada ainda* 🚨\n\n` +
    linhas.join('\n') +
    linhaPlacar +
    `\n\n🤖 Eu aqui suando a camisa, checando a cada ${config.intervaloMs / 1000}s. Prometo gritar assim que sair fumaça verde 💨`;

  // Se nada mudou desde o último aviso, só reseta o timer (evita mensagem
  // repetida) sem gastar uma mensagem nova no grupo.
  if (texto === ultimoTextoStatusEnviado) {
    console.log('[watcher] status sem mudança — não repetindo aviso');
    ultimoEnvioQualquerMensagem = Date.now();
    return;
  }

  console.log('[watcher] enviando aviso de status (sem sinal há tempo, motivo mudou)');
  await enviarMensagem(texto).catch((erro) => {
    console.error('[watcher] falha ao enviar aviso de status:', erro.message);
  });

  ultimoTextoStatusEnviado = texto;
  ultimoEnvioQualquerMensagem = Date.now();
}

async function cicloDeChecagem() {
  for (const campeonato of config.campeonatos) {
    await checarCampeonato(campeonato).catch((erro) => {
      console.error(`[watcher] erro ao checar ${campeonato}:`, erro.message);
    });
  }
  await checarAvisoDeStatus().catch((erro) => {
    console.error('[watcher] erro ao checar aviso de status:', erro.message);
  });
}

async function main() {
  console.log(`[watcher] iniciado — checando painel a cada ${config.intervaloMs / 1000}s`);
  console.log(`[watcher] painel: ${config.painelUrl}`);
  if (!config.grupoId) {
    console.log('[watcher] aviso: GRUPO_WHATSAPP_ID não configurado — só vai logar as entradas no console.');
  }

  await cicloDeChecagem();
  setInterval(cicloDeChecagem, config.intervaloMs);
}

main();
