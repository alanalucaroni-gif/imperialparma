function normalizarTexto(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(valor) {
  if (!valor) return "Não informado";
  const [ano, mes, dia] = String(valor).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : valor;
}

function agrupar(corridas, campo) {
  const grupos = new Map();
  corridas.forEach(corrida => {
    const nome = corrida[campo] || "Não informado";
    const atual = grupos.get(nome) ?? { nome, corridas: 0, total: 0 };
    atual.corridas += 1;
    atual.total += Number(corrida.valor || 0);
    grupos.set(nome, atual);
  });
  return [...grupos.values()].sort((a, b) => b.total - a.total);
}

function consolidar(corridas) {
  const grupos = new Map();
  corridas.forEach(corrida => {
    const bairro = corrida.bairro || "Não informado";
    const empresa = corrida.empresa || "Não informado";
    const entregador = corrida.entregador || "Não informado";
    const chave = `${bairro}|${empresa}|${entregador}`;
    const atual = grupos.get(chave) ?? {
      bairro,
      empresa,
      entregador,
      corridas: 0,
      recebidoCliente: 0,
      pagoMoto: 0,
    };
    atual.corridas += 1;
    atual.recebidoCliente += Number(corrida.taxaCliente || 0);
    atual.pagoMoto += Number(corrida.valor || 0);
    atual.saldo = atual.recebidoCliente - atual.pagoMoto;
    grupos.set(chave, atual);
  });
  return [...grupos.values()].sort((a, b) => b.pagoMoto - a.pagoMoto);
}

function montarBarras(itens, vazio) {
  if (!itens.length) return `<div class="empty">${normalizarTexto(vazio)}</div>`;
  const maximo = Math.max(...itens.map(item => item.total), 1);
  return itens.slice(0, 10).map(item => {
    const largura = Math.max(2, (item.total / maximo) * 100);
    return `
      <div class="bar-row">
        <div class="bar-heading">
          <span>${normalizarTexto(item.nome)}</span>
          <strong>${dinheiro(item.total)}</strong>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${largura.toFixed(2)}%"></div></div>
        <div class="bar-caption">${item.corridas} corrida(s) · média ${dinheiro(item.corridas ? item.total / item.corridas : 0)}</div>
      </div>
    `;
  }).join("");
}

function descreverFiltros(filtros) {
  const partes = [];
  if (filtros.inicio || filtros.fim) {
    partes.push(`Período: ${formatarData(filtros.inicio)} até ${formatarData(filtros.fim)}`);
  }
  if (filtros.bairro) partes.push(`Bairro: ${filtros.bairro}`);
  if (filtros.empresa) partes.push(`Empresa: ${filtros.empresa}`);
  if (filtros.entregador) partes.push(`Entregador: ${filtros.entregador}`);
  return partes.length ? partes.join(" · ") : "Todos os registros";
}

export function montarHtmlRelatorioMotos({ corridas = [], filtros = {} }) {
  const empresas = agrupar(corridas, "empresa");
  const entregadores = agrupar(corridas, "entregador");
  const linhas = consolidar(corridas);
  const totalPago = corridas.reduce((soma, corrida) => soma + Number(corrida.valor || 0), 0);
  const totalRecebido = corridas.reduce((soma, corrida) => soma + Number(corrida.taxaCliente || 0), 0);
  const saldoTaxas = totalRecebido - totalPago;
  const total = totalPago;
  const media = corridas.length ? totalPago / corridas.length : 0;
  const geradoEm = new Date().toLocaleString("pt-BR");
  const filtrosAplicados = descreverFiltros(filtros);

  const linhasTabela = linhas.length
    ? linhas.map(item => `
        <tr>
          <td>${normalizarTexto(item.bairro)}</td>
          <td>${normalizarTexto(item.empresa)}</td>
          <td>${normalizarTexto(item.entregador)}</td>
          <td class="number">${item.corridas}</td>
          <td class="number">${dinheiro(item.recebidoCliente)}</td>
          <td class="number strong">${dinheiro(item.pagoMoto)}</td>
          <td class="number strong">${dinheiro(item.saldo)}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="7" class="empty">Nenhuma corrida encontrada com os filtros selecionados.</td></tr>';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório de motos - Imperial ERP</title>
    <style>
      @page { size: A4 landscape; margin: 11mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #172033;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding: 0 0 12px;
        border-bottom: 3px solid #7a1420;
      }
      .brand { color: #7a1420; font-weight: 800; font-size: 13px; letter-spacing: .04em; }
      h1 { margin: 4px 0 3px; color: #172033; font-size: 22px; }
      .subtitle, .meta { color: #64748b; line-height: 1.45; }
      .meta { text-align: right; }
      .filters {
        margin-top: 10px;
        padding: 8px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        color: #475569;
      }
      .kpis {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 9px;
        margin-top: 11px;
      }
      .kpi {
        padding: 10px 11px;
        border: 1px solid #e2e8f0;
        border-radius: 9px;
        background: #fff;
      }
      .kpi-label { color: #64748b; font-size: 8px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .kpi-value { margin-top: 4px; color: #7a1420; font-size: 18px; font-weight: 800; }
      .kpi-detail { margin-top: 2px; color: #94a3b8; font-size: 8px; }
      .charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 11px;
        break-inside: avoid;
      }
      .panel {
        padding: 10px 11px;
        border: 1px solid #e2e8f0;
        border-radius: 9px;
      }
      .panel h2 { margin: 0 0 2px; font-size: 12px; }
      .panel-note { margin-bottom: 8px; color: #94a3b8; font-size: 8px; }
      .bar-row { margin-top: 6px; break-inside: avoid; }
      .bar-heading { display: flex; justify-content: space-between; gap: 12px; font-size: 8px; }
      .bar-heading span { overflow: hidden; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
      .bar-heading strong { color: #7a1420; white-space: nowrap; }
      .bar-track { height: 6px; margin-top: 3px; overflow: hidden; border-radius: 999px; background: #e2e8f0; }
      .bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #7a1420, #b42336); }
      .bar-caption { margin-top: 2px; color: #94a3b8; font-size: 7px; }
      .table-section { margin-top: 12px; }
      .table-title { margin: 0 0 6px; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }
      th {
        padding: 7px 8px;
        border: 1px solid #d7dee8;
        color: #fff;
        background: #7a1420;
        font-size: 8px;
        text-align: left;
        text-transform: uppercase;
      }
      td { padding: 6px 8px; border: 1px solid #e2e8f0; }
      tbody tr:nth-child(even) { background: #f8fafc; }
      .number { text-align: right; }
      .strong { font-weight: 800; }
      .total-row td { padding: 8px; color: #7a1420; background: #f7e9eb !important; font-weight: 800; }
      .empty { padding: 18px; color: #94a3b8; text-align: center; }
      .footer { margin-top: 9px; color: #94a3b8; font-size: 7px; text-align: right; }
    </style>
  </head>
  <body>
    <header class="header">
      <div>
        <div class="brand">IMPÉRIO DAS PARMEGIANAS · IMPERIAL ERP</div>
        <h1>Relatório de motos e entregas</h1>
        <div class="subtitle">Comparativo de gastos por empresa prestadora e entregador</div>
      </div>
      <div class="meta">
        <strong>Gerado em</strong><br />
        ${normalizarTexto(geradoEm)}
      </div>
    </header>

    <div class="filters"><strong>Filtros aplicados:</strong> ${normalizarTexto(filtrosAplicados)}</div>

    <section class="kpis">
      <div class="kpi"><div class="kpi-label">Total gasto</div><div class="kpi-value">${dinheiro(total)}</div><div class="kpi-detail">Soma das corridas filtradas</div></div>
      <div class="kpi"><div class="kpi-label">Corridas</div><div class="kpi-value">${corridas.length}</div><div class="kpi-detail">Entregas registradas</div></div>
      <div class="kpi"><div class="kpi-label">Recebido clientes</div><div class="kpi-value">${dinheiro(totalRecebido)}</div><div class="kpi-detail">Taxas de entrega cobradas</div></div>
      <div class="kpi"><div class="kpi-label">Saldo das taxas</div><div class="kpi-value">${dinheiro(saldoTaxas)}</div><div class="kpi-detail">Recebido menos pago</div></div>
      <div class="kpi"><div class="kpi-label">Custo médio</div><div class="kpi-value">${dinheiro(media)}</div><div class="kpi-detail">Média por corrida</div></div>
      <div class="kpi"><div class="kpi-label">Prestadoras</div><div class="kpi-value">${empresas.length}</div><div class="kpi-detail">Empresas no resultado</div></div>
    </section>

    <section class="charts">
      <div class="panel">
        <h2>Comparação por empresa prestadora</h2>
        <div class="panel-note">Até 10 empresas, ordenadas pelo maior gasto</div>
        ${montarBarras(empresas, "Nenhuma empresa no período.")}
      </div>
      <div class="panel">
        <h2>Comparação por entregador</h2>
        <div class="panel-note">Até 10 entregadores, ordenados pelo maior gasto</div>
        ${montarBarras(entregadores, "Nenhum entregador no período.")}
      </div>
    </section>

    <section class="table-section">
      <h2 class="table-title">Consolidado por bairro, empresa e entregador</h2>
      <table>
        <thead>
          <tr><th>Bairro</th><th>Empresa prestadora</th><th>Entregador</th><th class="number">Corridas</th><th class="number">Recebido cliente</th><th class="number">Pago moto</th><th class="number">Saldo</th></tr>
        </thead>
        <tbody>
          ${linhasTabela}
          ${linhas.length ? `<tr class="total-row"><td colspan="3">Total filtrado</td><td class="number">${corridas.length}</td><td class="number">${dinheiro(totalRecebido)}</td><td class="number">${dinheiro(totalPago)}</td><td class="number">${dinheiro(saldoTaxas)}</td></tr>` : ""}
        </tbody>
      </table>
    </section>

    <div class="footer">Imperial ERP · Relatório gerado a partir do histórico de motos e entregas.</div>
  </body>
</html>`;
}

export function abrirRelatorioMotosPdf({ corridas, filtros }) {
  if (!corridas.length) {
    return { tone: "red", text: "Não há corridas nos filtros atuais para gerar o PDF." };
  }
  const janela = window.open("", "_blank", "width=1280,height=820");
  if (!janela) {
    return { tone: "red", text: "O navegador bloqueou a janela do PDF. Permita pop-ups para este sistema e tente novamente." };
  }
  janela.document.open();
  janela.document.write(montarHtmlRelatorioMotos({ corridas, filtros }));
  janela.document.close();
  janela.focus();
  window.setTimeout(() => janela.print(), 450);
  return { tone: "green", text: "Relatório aberto. Na janela de impressão, escolha “Salvar como PDF”." };
}
