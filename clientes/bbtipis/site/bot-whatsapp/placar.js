// Placar do dia (green/red), persistido em arquivo pra ser compartilhado
// entre o watcher.js (quem registra os resultados) e o comando-servidor.js
// (quem responde ao comando "placar" no grupo) — dois processos separados
// não podem compartilhar uma variável em memória.
const fs = require('fs');
const path = require('path');

const ARQUIVO_PLACAR = path.join(__dirname, 'placar.json');

function dataLocalHoje() {
  return new Date().toLocaleDateString('pt-BR');
}

function lerPlacar() {
  const hoje = dataLocalHoje();
  if (!fs.existsSync(ARQUIVO_PLACAR)) {
    return { data: hoje, green: 0, red: 0 };
  }
  const salvo = JSON.parse(fs.readFileSync(ARQUIVO_PLACAR, 'utf-8'));
  if (salvo.data !== hoje) {
    return { data: hoje, green: 0, red: 0 };
  }
  return salvo;
}

function registrarResultado(bateu) {
  const placar = lerPlacar();
  if (bateu) placar.green += 1;
  else placar.red += 1;
  fs.writeFileSync(ARQUIVO_PLACAR, JSON.stringify(placar, null, 2), 'utf-8');
  return placar;
}

module.exports = { lerPlacar, registrarResultado };
