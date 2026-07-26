const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { extrairDadosDaPagina } = require('./extrair');

const SESSAO_PATH = path.join(__dirname, 'sessao.json');
const DADOS_DIR = path.join(__dirname, '..', 'dados');
const URL_HORARIOS = 'https://v1.bbtips.com.br/futebol/horarios';

const CAMPEONATOS = {
  express: 'Express',
  copa: 'Copa',
  euro: 'Euro',
  super: 'Super',
  premier: 'Premier',
};

function lerSessao() {
  if (!fs.existsSync(SESSAO_PATH)) {
    throw new Error(
      `Não achei ${SESSAO_PATH}. Copie os itens "currentUser" e "access_token" do localStorage ` +
      'de uma sessão logada no bbtips (o site usa JWT em localStorage, não cookies) e salve nesse arquivo.'
    );
  }
  return JSON.parse(fs.readFileSync(SESSAO_PATH, 'utf-8'));
}

async function abrirComSessao(browser, sessao) {
  const page = await browser.newPage();

  // O bbtips guarda o login como JWT em localStorage (não cookie) e a home
  // passa por verificação Cloudflare quando não há sessão válida ainda.
  // addInitScript injeta o token ANTES de qualquer script da página rodar,
  // então quando o app carrega ele já se vê "logado" e pula a etapa de login/verificação.
  await page.addInitScript((dados) => {
    for (const [chave, valor] of Object.entries(dados)) {
      window.localStorage.setItem(chave, valor);
    }
  }, sessao);

  await page.goto(URL_HORARIOS, { waitUntil: 'domcontentloaded' });

  const logado = await page
    .locator('table.customTable')
    .first()
    .waitFor({ timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  if (!logado) {
    throw new Error(
      'Não encontrei a tabela de jogos após injetar a sessão — token pode ter expirado. ' +
      'Atualize clientes/bbtipis/site/coletor/sessao.json com um login novo.'
    );
  }

  return page;
}

async function selecionarCampeonatoEFiltro(page, nomeAba) {
  // "Over Gols" = "Over 2.5" já vem persistido de localStorage, aplicado
  // automaticamente ao trocar de aba. Nota: o campo "odd" de cada slot não
  // aparece no DOM por padrão (depende de um toggle "Prox.Odds" que não
  // conseguimos ativar via automação ainda) — não é usado por nenhuma das
  // 5 regras hoje, então seguimos sem ele por ora.
  await page.getByText(nomeAba, { exact: true }).first().click();
  await page.waitForTimeout(1500);
}

// Erro de página/browser fechado não é recuperável tentando o próximo
// campeonato — precisa propagar pra main() recriar o browser inteiro, senão
// o loop fica preso repetindo a mesma falha pra sempre (bug visto em
// 2026-07-12: browser fechado manualmente e o coletor nunca se recuperou).
function erroDeBrowserFechado(erro) {
  const msg = erro.message || '';
  return msg.includes('Target page, context or browser has been closed') ||
    msg.includes('Target closed') ||
    msg.includes('Browser has been closed');
}

async function coletarUmaVez(page) {
  const resultados = {};
  for (const [chave, nomeAba] of Object.entries(CAMPEONATOS)) {
    try {
      await selecionarCampeonatoEFiltro(page, nomeAba);
      const dados = await page.evaluate(extrairDadosDaPagina);
      resultados[chave] = dados;
      const destino = path.join(DADOS_DIR, `${chave}.json`);
      fs.writeFileSync(destino, JSON.stringify(dados, null, 2), 'utf-8');
      console.log(`[coletor] ${chave}: ${dados.rows.length} horas salvas em ${destino}`);
    } catch (erro) {
      if (erroDeBrowserFechado(erro)) throw erro;
      console.error(`[coletor] falha ao coletar ${chave}:`, erro.message);
    }
  }
  return resultados;
}

function agora() {
  return new Date().toLocaleString('pt-BR');
}

async function abrirNovoBrowser(sessao) {
  // headed por padrão (like local, pra acompanhar visualmente); em servidor
  // sem interface gráfica (sem X server, ex: VPS) precisa de headless=true,
  // configurado via COLETOR_HEADLESS=true no .env daquele ambiente.
  const headless = process.env.COLETOR_HEADLESS === 'true';

  // Proxy residencial opcional — necessário na VPS porque o Cloudflare do
  // bbtips bloqueia IPs de datacenter (página "Performing security
  // verification"). Configurar via env quando tiver um provedor contratado:
  // COLETOR_PROXY_SERVER (ex: http://host:porta), COLETOR_PROXY_USERNAME,
  // COLETOR_PROXY_PASSWORD. Sem essas variáveis, roda sem proxy (igual local).
  const proxy = process.env.COLETOR_PROXY_SERVER
    ? {
        server: process.env.COLETOR_PROXY_SERVER,
        username: process.env.COLETOR_PROXY_USERNAME,
        password: process.env.COLETOR_PROXY_PASSWORD,
      }
    : undefined;

  // Args que reduzem sinais óbvios de automação (o Cloudflare do bbtips
  // bloqueia o Playwright headless "cru" com a tela "Performing security
  // verification"). Sem proxy residencial, isso é best-effort — pode não
  // ser suficiente contra Cloudflare, mas é a tentativa sem custo.
  const browser = await chromium.launch({
    headless,
    proxy,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'pt-BR',
  });
  const page = await abrirComSessao(context, sessao);
  return { browser, page };
}

async function main() {
  const loop = process.argv.includes('--loop');
  const intervaloMin = 2.5;

  fs.mkdirSync(DADOS_DIR, { recursive: true });
  const sessao = lerSessao();

  let { browser, page } = await abrirNovoBrowser(sessao);
  console.log(`[coletor] ${agora()} sessão válida, tabela de jogos carregada.`);

  do {
    try {
      console.log(`[coletor] ${agora()} iniciando ciclo de coleta...`);
      await coletarUmaVez(page);
    } catch (erro) {
      // Falha no ciclo (ex: página travou, ou o browser inteiro foi fechado
      // manualmente/crashou) não deve derrubar o processo — registra o erro
      // e recria o browser do zero, já que isso pode rodar por horas sem
      // supervisão e o usuário pode fechar a janela sem querer.
      console.error(`[coletor] ${agora()} ciclo falhou, recriando browser:`, erro.message);
      try {
        await browser.close();
      } catch (_) {
        // ignora falha ao fechar browser já quebrado
      }
      ({ browser, page } = await abrirNovoBrowser(sessao));
    }

    if (loop) {
      console.log(`[coletor] ${agora()} aguardando ${intervaloMin} min até a próxima coleta...`);
      try {
        await page.waitForTimeout(intervaloMin * 60 * 1000);
      } catch (_) {
        // browser fechado durante a espera — o próximo ciclo detecta e recria.
      }
    }
  } while (loop);

  await browser.close();
}

main().catch((erro) => {
  console.error(`[coletor] ${agora()} erro fatal:`, erro);
  process.exit(1);
});
