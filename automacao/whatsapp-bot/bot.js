const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const { buscarResposta } = require('./respostas');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

client.on('qr', async (qr) => {
  const arquivo = path.resolve(__dirname, 'qrcode.png');
  await QRCode.toFile(arquivo, qr, { width: 500 });
  console.log('Novo QR code gerado em: ' + arquivo);
  qrcodeTerminal.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Bot conectado e pronto pra responder (modo respostas prontas, sem IA).');
});

client.on('message', async (msg) => {
  if (msg.fromMe || msg.isStatus) return;

  const chat = await msg.getChat();
  if (chat.isGroup) return;

  const texto = msg.body?.trim();
  if (!texto) return;

  const resposta = buscarResposta(texto);

  await chat.sendStateTyping();
  await client.sendMessage(msg.from, resposta);
});

client.initialize();
