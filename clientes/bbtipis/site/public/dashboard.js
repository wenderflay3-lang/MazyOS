const INTERVALO_ATUALIZACAO_MS = 15000;
let campeonatoAtual = 'copa';

async function buscarDados(campeonato) {
  const resposta = await fetch(`/api/${campeonato}`);
  if (!resposta.ok) throw new Error(`Sem dados para ${campeonato}`);
  return resposta.json();
}

function renderResumo(dados) {
  const { heading } = dados;
  const el = document.getElementById('resumo');
  el.innerHTML = `
    <span class="badge verde">${heading.pct_verde}%</span>
    <span class="badge vermelho">${heading.pct_vermelho}%</span>
    <span class="badge neutro">Gols: ${heading.gols_totais}</span>
    <span class="badge neutro">Média Gols/Hora: ${heading.media_gols_hora}</span>
  `;
}

const NOMES_REGRAS = {
  inclinacao: 'Inclinação',
  topoFundo: 'Topo/Fundo',
  seguraSolta: 'Segura e solta',
  duasEntradas: 'Duas entradas',
  fimDeLinhaHoraFraca: 'Cuidado fim de linha',
};

function renderDestaques(dados) {
  const el = document.getElementById('destaques');
  const horaMaisRecente = dados.rows[0]?.hora;
  if (!horaMaisRecente || !dados.destaques) {
    el.innerHTML = '';
    return;
  }

  const cards = Object.entries(dados.destaques)
    .map(([regraId, porHora]) => {
      const info = porHora[horaMaisRecente];
      if (!info) return null;
      const forcaClasse = info.forca === 'alerta' ? 'alerta' : info.forca === 'alta' ? 'alta' : 'neutro';
      return `
        <div class="destaque-card ${forcaClasse}">
          <span class="destaque-titulo">${NOMES_REGRAS[regraId] || regraId}</span>
          <span class="destaque-motivo">${info.motivo}</span>
        </div>`;
    })
    .filter(Boolean);

  el.innerHTML = cards.length
    ? cards.join('')
    : '<div class="destaque-card neutro"><span class="destaque-motivo">Nenhum padrão ativo na hora atual.</span></div>';
}

function renderSinalEntrada(dados) {
  const el = document.getElementById('sinal-entrada');
  const sinal = dados.sinalEntrada;

  if (!sinal) {
    el.innerHTML = '';
    return;
  }

  const classe = sinal.entrar ? 'entrar' : 'aguardar';
  const titulo = sinal.entrar ? 'ENTRAR' : 'AGUARDAR';
  const minutosHtml = sinal.minutos.map((m) => `<span class="sinal-numero">${m}</span>`).join('<span class="sinal-separador">e</span>');

  el.innerHTML = `
    <div class="sinal-card ${classe}">
      <span class="sinal-titulo">${titulo}</span>
      <div class="sinal-momento">
        <div class="sinal-bloco">
          <span class="sinal-label">Hora</span>
          <span class="sinal-numero">${sinal.hora}</span>
        </div>
        <div class="sinal-bloco">
          <span class="sinal-label">Minuto</span>
          <div class="sinal-minutos">${minutosHtml}</div>
        </div>
      </div>
      <span class="sinal-motivo">${sinal.motivo}</span>
    </div>
  `;
}

function renderTabela(dados) {
  const corpo = document.getElementById('tabela-corpo');
  const rows = dados.rows;

  if (!rows || rows.length === 0) {
    corpo.innerHTML = '<tr><td colspan="3">Sem dados ainda.</td></tr>';
    return;
  }

  corpo.innerHTML = rows
    .map((row) => {
      const slotsHtml = row.slots
        .map((s) => {
          const titulo = `${row.hora}:${s.minuto} — ${s.placar ?? 'sem placar'} (${s.status})`;
          return `<div class="slot-celula ${s.status}" title="${titulo}">${s.minuto}</div>`;
        })
        .join('');
      const pct = row.pct_hora != null ? `${row.pct_hora}%` : '—';
      return `
        <tr>
          <td class="hora">${row.hora}h</td>
          <td class="pct">${pct}</td>
          <td><div class="slots-linha">${slotsHtml}</div></td>
        </tr>`;
    })
    .join('');
}

async function atualizar() {
  try {
    const dados = await buscarDados(campeonatoAtual);
    renderResumo(dados);
    renderSinalEntrada(dados);
    renderDestaques(dados);
    renderTabela(dados);
  } catch (erro) {
    console.error(erro);
  }
}

document.getElementById('abas').addEventListener('click', (ev) => {
  const btn = ev.target.closest('button[data-campeonato]');
  if (!btn) return;
  document.querySelectorAll('.aba').forEach((b) => b.classList.remove('ativa'));
  btn.classList.add('ativa');
  campeonatoAtual = btn.dataset.campeonato;
  atualizar();
});

atualizar();
setInterval(atualizar, INTERVALO_ATUALIZACAO_MS);
