// Configuração PM2 — mantém os 4 processos do bbtipis de pé, reiniciando
// automaticamente se algum cair. Uso:
//   pm2 start ecosystem.config.js   -> inicia tudo
//   pm2 status                       -> vê o estado de cada processo
//   pm2 logs <nome>                  -> acompanha o log de um processo
//   pm2 restart <nome>                -> reinicia um processo específico
//   pm2 save && pm2 startup           -> faz sobreviver a reinício do Windows
module.exports = {
  apps: [
    {
      // Aponta direto pro tsx (o que "npm start" chama por baixo) — no
      // Windows, script:'npm' faz o PM2 tentar executar o npm.cmd como se
      // fosse JS puro e quebra com SyntaxError.
      name: 'bbtipis-evolution-api',
      cwd: __dirname + '/evolution-api',
      script: 'node_modules/tsx/dist/cli.mjs',
      args: './src/main.ts',
      autorestart: true,
      watch: false,
    },
    {
      name: 'bbtipis-painel',
      cwd: __dirname,
      script: 'servidor/servidor.js',
      autorestart: true,
      watch: false,
    },
    {
      name: 'bbtipis-coletor',
      cwd: __dirname,
      script: 'coletor/coletar.js',
      args: '--loop',
      autorestart: true,
      watch: false,
    },
    {
      name: 'bbtipis-bot',
      cwd: __dirname,
      script: 'bot-whatsapp/watcher.js',
      autorestart: true,
      watch: false,
    },
    {
      name: 'bbtipis-comando-servidor',
      cwd: __dirname,
      script: 'bot-whatsapp/comando-servidor.js',
      autorestart: true,
      watch: false,
    },
  ],
};
