const fs = require('fs');
const path = require('path');
const express = require('express');
const { aplicarRegras, calcularSinalEntradaV2 } = require('./regras');

const DADOS_DIR = path.join(__dirname, '..', 'dados');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORTA = 3000;

const app = express();
app.use(express.static(PUBLIC_DIR));

app.get('/api/:campeonato', (req, res) => {
  const { campeonato } = req.params;
  const arquivo = path.join(DADOS_DIR, `${campeonato}.json`);

  if (!fs.existsSync(arquivo)) {
    res.status(404).json({ erro: `Sem dados para "${campeonato}" ainda.` });
    return;
  }

  const dados = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));
  // regras.config.js é lido a cada request (não fica em cache) para que
  // ajustes de parâmetro no arquivo apareçam sem precisar reiniciar o servidor.
  delete require.cache[require.resolve('./regras.config')];
  const configAtual = require('./regras.config');
  const destaques = aplicarRegras(dados, configAtual);
  const sinalEntrada = calcularSinalEntradaV2(dados, destaques, configAtual);

  res.json({ ...dados, destaques, sinalEntrada });
});

app.listen(PORTA, () => {
  console.log(`[servidor] rodando em http://localhost:${PORTA}`);
});
