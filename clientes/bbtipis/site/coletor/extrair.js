// Roda dentro do browser via page.evaluate() - sem acesso a Node aqui dentro.
function extrairDadosDaPagina() {
  function limparPct(texto) {
    if (!texto) return null;
    const n = parseFloat(texto.replace('%', '').trim());
    return Number.isNaN(n) ? null : n;
  }

  function limparNumero(texto) {
    if (!texto) return null;
    const n = parseFloat(texto.replace(/[^\d.]/g, ''));
    return Number.isNaN(n) ? null : n;
  }

  const headingEl = document.querySelector('.liga.justify-content-center.text-center');
  let heading = { pct_verde: null, pct_vermelho: null, gols_totais: null, media_gols_hora: null };
  if (headingEl) {
    const verdeEl = headingEl.querySelector('.badge-soft-success');
    const vermelhoEl = headingEl.querySelector('.badge-soft-danger');
    const golsEl = headingEl.querySelector('.bg-secondary');
    const mediaEl = headingEl.querySelector('.bg-info');
    heading = {
      pct_verde: limparPct(verdeEl && verdeEl.textContent),
      pct_vermelho: limparPct(vermelhoEl && vermelhoEl.textContent),
      gols_totais: limparNumero(golsEl && golsEl.textContent),
      media_gols_hora: limparNumero(mediaEl && mediaEl.textContent),
    };
  }

  const table = document.querySelector('table.customTable.justify-content-center');
  const rows = [];
  if (table) {
    // Os minutos reais de cada coluna vêm do cabeçalho (thead .rowMin), não
    // são fixos — o offset muda por campeonato/momento (Euro visto em
    // 02,05,08..., Copa em 01,04,07... no mesmo dia, 2026-07-12). Antes
    // inferíamos pela posição da coluna (idx*3-1) e isso ficava errado
    // sempre que o offset real era diferente do assumido.
    const linhaMinutos = table.querySelector('thead tr.rowMin');
    const minutosColunas = linhaMinutos
      ? Array.from(linhaMinutos.querySelectorAll('th'))
          .map((th) => th.textContent.trim())
          .filter((texto) => /^\d+$/.test(texto))
      : [];

    const trs = table.querySelectorAll('tbody tr');
    trs.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      if (cells.length < 4) return;

      const horaLabel = cells[0].querySelector('label');
      const hora = horaLabel ? horaLabel.textContent.trim() : null;
      if (hora === null || hora === '') return;

      const pctCell = cells[cells.length - 2];
      const golsCell = cells[cells.length - 1];
      const pct_hora = limparPct(pctCell ? pctCell.textContent : null);
      const gols_hora = limparNumero(golsCell ? golsCell.textContent : null);

      const slotCells = cells.slice(1, cells.length - 2);
      const slots = [];
      slotCells.forEach((td, idx) => {
        const resultadoEl = td.querySelector('.resultado');
        const placarTexto = resultadoEl ? resultadoEl.textContent.trim() : '';

        let status = 'sem_dados';
        const cls = td.className || '';
        if (cls.includes('SemDados')) status = 'sem_dados';
        else if (cls.includes('green')) status = 'green';
        else if (cls.includes('red')) status = 'red';
        else if (placarTexto !== '') status = 'futuro';

        // Minuto real lido do cabeçalho da tabela (thead .rowMin), na mesma
        // posição de coluna do slot. Fallback pro cálculo antigo só se o
        // cabeçalho não tiver minutos suficientes (não deveria acontecer).
        const minuto = minutosColunas[idx] != null
          ? minutosColunas[idx].padStart(2, '0')
          : String((idx + 1) * 3 - 1).padStart(2, '0');

        slots.push({
          minuto,
          placar: placarTexto === '' ? null : placarTexto,
          status,
        });
      });

      rows.push({ hora, pct_hora, gols_hora, slots });
    });
  }

  return { heading, rows, coletado_em: new Date().toISOString() };
}

module.exports = { extrairDadosDaPagina };
