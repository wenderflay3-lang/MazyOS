// Servidor HTTP que recebe o webhook de mensagens da Evolution API (evento
// MESSAGES_UPSERT) e responde comandos digitados no grupo — hoje só
// "placar", que devolve o placar do dia (green/red). Ligado em 2026-07-18
// a pedido do cliente. Separado do watcher.js porque esse escuta requisições
// HTTP (webhook) enquanto o watcher faz polling — são loops diferentes.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const config = require('./config');
const { enviarMensagem } = require('./enviar');
const { lerPlacar } = require('./placar');

const PORTA = 3001;
const app = express();
app.use(express.json());

// O WhatsApp dispara múltiplos eventos messages.upsert pra UMA ÚNICA
// mensagem (enviado, entregue, lido...), cada update de status reaciona o
// webhook. Guarda os últimos IDs já processados pra não responder de novo
// ao mesmo comando (bug visto em 2026-07-18: "placar" gerou 4 respostas).
const idsProcessados = new Set();
const LIMITE_IDS_GUARDADOS = 200;
function jaProcessado(id) {
  if (!id) return false;
  if (idsProcessados.has(id)) return true;
  idsProcessados.add(id);
  if (idsProcessados.size > LIMITE_IDS_GUARDADOS) {
    const primeiro = idsProcessados.values().next().value;
    idsProcessados.delete(primeiro);
  }
  return false;
}

function extrairTexto(mensagem) {
  return (
    mensagem?.message?.conversation ||
    mensagem?.message?.extendedTextMessage?.text ||
    ''
  ).trim().toLowerCase();
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // responde rápido, processa depois

  const evento = req.body;
  if (evento.event !== 'messages.upsert') return;

  const mensagem = evento.data;
  if (!mensagem) return;
  if (mensagem.key?.remoteJid !== config.grupoId) return; // só responde no grupo certo
  if (jaProcessado(mensagem.key?.id)) return; // ignora reenvio (status update) da mesma mensagem

  // O número do bot é o mesmo usado pelo cliente pra mandar mensagem no
  // grupo (não dá pra distinguir por fromMe), então aceitamos fromMe=true.
  // Não entra em loop porque só reage ao texto exato "placar" — as respostas
  // do próprio bot são frases longas, nunca batem com essa comparação.
  const texto = extrairTexto(mensagem);
  if (texto !== 'placar') return;

  const placar = lerPlacar();
  const resposta =
    placar.green === 0 && placar.red === 0
      ? '📊 Ainda não rolou nenhum resultado hoje — tá tudo quieto por aqui.'
      : `📊 *Placar de hoje:* ${placar.green} Green ✅ | ${placar.red} Red ❌`;

  console.log(`[comando] "placar" pedido no grupo — respondendo: ${placar.green}G/${placar.red}R`);
  await enviarMensagem(resposta).catch((erro) => {
    console.error('[comando] falha ao responder placar:', erro.message);
  });
});

app.listen(PORTA, () => {
  console.log(`[comando-servidor] rodando em http://localhost:${PORTA} — aguardando webhook da Evolution API`);
});
