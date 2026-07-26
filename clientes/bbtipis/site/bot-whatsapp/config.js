// Configuração do bot de WhatsApp — preencher quando o grupo e a Evolution API existirem.
module.exports = {
  // URL onde a Evolution API está rodando (self-hosted). Ex: 'http://localhost:8080'
  evolutionUrl: process.env.EVOLUTION_URL || '',

  // API Key da instância na Evolution API (gerada ao criar a instância).
  evolutionApiKey: process.env.EVOLUTION_API_KEY || '',

  // Nome da instância criada na Evolution API (ex: 'bbtipis').
  evolutionInstance: process.env.EVOLUTION_INSTANCE || 'bbtipis',

  // Nome do grupo de WhatsApp já criado (referência humana — a Evolution API
  // não manda mensagem pelo nome, precisa do ID técnico abaixo).
  grupoNome: 'Análise com IA',

  // ID do grupo de WhatsApp (formato: '123456789-987654321@g.us').
  // Ainda não preenchido — pra descobrir: com a instância conectada na
  // Evolution API, use o endpoint "Find Groups" (GET /group/fetchAllGroups)
  // pra listar os grupos e achar o remoteJid do grupo "Análise com IA".
  grupoId: process.env.GRUPO_WHATSAPP_ID || '',

  // Onde o servidor do painel (servidor.js) está rodando.
  painelUrl: process.env.PAINEL_URL || 'http://localhost:3000',

  // Campeonatos monitorados (mesmas chaves do coletor).
  // "express" removido a pedido do cliente em 2026-07-12 — fora do bot por enquanto.
  campeonatos: ['copa', 'euro', 'super', 'premier'],

  // Intervalo de checagem, em ms. Reduzido de 30s pra 10s em 2026-07-12 a
  // pedido do cliente — as entradas têm janela curta (slots de 3min) e ele
  // quer o aviso o mais cedo possível assim que o sinal aparece no painel.
  intervaloMs: 10 * 1000,
};
