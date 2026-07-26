const config = require('./config');

// Envia uma mensagem de texto pro grupo configurado via Evolution API.
// Doc do endpoint: POST /message/sendText/{instance}
async function enviarMensagem(texto) {
  if (!config.evolutionUrl || !config.evolutionApiKey || !config.grupoId) {
    console.log('[bot] config incompleta (evolutionUrl/apiKey/grupoId) — mensagem não enviada:');
    console.log(texto);
    return;
  }

  const url = `${config.evolutionUrl}/message/sendText/${config.evolutionInstance}`;
  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.evolutionApiKey,
    },
    body: JSON.stringify({
      number: config.grupoId,
      text: texto,
    }),
  });

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => '');
    throw new Error(`Evolution API respondeu ${resposta.status}: ${corpo}`);
  }
}

module.exports = { enviarMensagem };
