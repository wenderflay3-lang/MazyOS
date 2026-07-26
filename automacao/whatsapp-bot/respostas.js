// Cada entrada tem palavras-chave (gatilhos) e a resposta enviada quando alguma bater no texto do cliente.
// A primeira regra que bater na mensagem (de cima pra baixo) é a que responde.

const REGRAS = [
  {
    gatilhos: ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'menu'],
    resposta:
      'Oi! Aqui é o atendimento automático da WClick IA. 👋\n\n' +
      'Digite o número ou palavra do que você quer saber:\n' +
      '1 - Planos e preços\n' +
      '2 - Horário de atendimento\n' +
      '3 - Portfólio / exemplos\n' +
      '4 - Falar com um atendente\n\n' +
      'Ou já manda sua dúvida que a gente te responde assim que possível.',
  },
  {
    gatilhos: ['1', 'plano', 'planos', 'preço', 'preco', 'precos', 'preços', 'valor', 'valores', 'quanto custa'],
    resposta:
      '*Nossos planos:*\n\n' +
      '1) *Site Profissional* — R$ 1.500\n' +
      'Site institucional completo, copy estratégico, design responsivo, SEO básico, formulário de contato.\n\n' +
      '2) *Página Estratégica* — sob consulta\n' +
      'Landing page de alta conversão pra uma oferta ou campanha específica.\n\n' +
      '3) *WClick.IA (automação)* — sob consulta\n' +
      'Site + organização de processos + automação de rotinas com IA.\n\n' +
      'Quer que a gente te chame pra entender qual plano faz mais sentido? Digite *4*.',
  },
  {
    gatilhos: ['2', 'horario', 'horário', 'atendimento', 'funciona', 'aberto'],
    resposta: 'Atendemos de segunda a sábado, das 9h às 18h. Fora desse horário, deixa sua mensagem que respondemos assim que abrir. 🕘',
  },
  {
    gatilhos: ['3', 'portfolio', 'portfólio', 'exemplo', 'exemplos', 'case', 'cases', 'site pronto'],
    resposta:
      'Você pode ver exemplos de projetos que já fizemos direto no nosso site, na seção Projetos: veja em wclick.ia (link no nosso Instagram @wclick.ia). Se quiser, te mandamos alguns direto por aqui — é só pedir!',
  },
  {
    gatilhos: ['4', 'atendente', 'humano', 'pessoa', 'falar com alguem', 'falar com alguém'],
    resposta: 'Combinado, já te chamamos por aqui pra continuar a conversa direitinho. Enquanto isso, se quiser adiantar, me conta um pouco do que você precisa. 🙂',
  },
  {
    gatilhos: ['instagram', 'insta'],
    resposta: 'Nosso Instagram é @wclick.ia — segue lá que a gente posta os projetos novos por lá!',
  },
  {
    gatilhos: ['email', 'e-mail'],
    resposta: 'Nosso e-mail é contatowclickia@gmail.com',
  },
];

const RESPOSTA_PADRAO =
  'Recebemos sua mensagem! Nosso atendimento é de segunda a sábado, 9h às 18h, e já vamos te responder pessoalmente. ' +
  'Se quiser ver os planos, digite *1*, ou o horário, digite *2*.';

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function buscarResposta(textoRecebido) {
  const texto = normalizar(textoRecebido);

  for (const regra of REGRAS) {
    const bateu = regra.gatilhos.some((gatilho) => {
      const g = normalizar(gatilho);
      return texto === g || texto.includes(g);
    });
    if (bateu) return regra.resposta;
  }

  return RESPOSTA_PADRAO;
}

module.exports = { buscarResposta };
