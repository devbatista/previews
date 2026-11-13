/* Águas Cristalinas — prévia estática (dados de exemplo). DevBatista.
 *
 * Fonte única de dados: `clientes` (cadastro) e `c.hist` (registros de visita).
 * Todas as telas — Painel, Hoje, Calendário, Registrar, Resumo, Clientes e Mensalidades —
 * calculam o que mostram a partir dessas duas coisas; nada é escrito à mão em uma tela só.
 */
(function () {
  "use strict";

  /* ---------- Datas ---------- */
  var HOJE_DATA = new Date(2026, 10, 13); // "hoje" da prévia
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  var DIA_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  var DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]; // dias em que há visitas fixas
  var DIA_CURTO = { "Segunda": "Seg", "Terça": "Ter", "Quarta": "Qua", "Quinta": "Qui", "Sexta": "Sex", "Sábado": "Sáb" };
  var VENCIMENTO = 10; // dia do mês em que vence a mensalidade

  function pad2(n) { return String(n).padStart(2, "0"); }
  function chaveData(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function deChave(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ddmm(d) { if (typeof d === "string") d = deChave(d); return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1); }
  function addDias(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function dataLonga(d) { return DIA_SEMANA[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()]; }
  function maiusc(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var CHAVE_HOJE = chaveData(HOJE_DATA);
  var HOJE = DIA_SEMANA[HOJE_DATA.getDay()];
  var MES_ATUAL = MESES[HOJE_DATA.getMonth()];

  /* ---------- Catálogos ---------- */
  var TIPOS = ["Fibra", "Vinil", "Alvenaria"];
  var SERVICOS = ["Aspiração", "Escovação", "Peneira", "Limpeza do skimmer", "Retrolavagem do filtro", "Limpeza da borda"];
  var SERV_PADRAO = ["Aspiração", "Escovação", "Peneira", "Limpeza do skimmer"];
  var PRODUTOS = ["Cloro granulado", "Algicida", "Clarificante", "Barrilha", "Redutor de pH"];
  var FAIXAS = {
    cloro: { min: 1, max: 3, un: "ppm", nome: "Cloro livre", ideal: "1 a 3 ppm" },
    ph: { min: 7.2, max: 7.6, un: "", nome: "pH", ideal: "7,2 a 7,6" },
    alc: { min: 80, max: 120, un: "ppm", nome: "Alcalinidade", ideal: "80 a 120 ppm" }
  };

  /* ---------- Cadastro (mesmos campos do formulário de cliente) ---------- */
  function P(nome, volume, tipo) { return { nome: nome, volume: volume, tipo: tipo }; }
  // `ult`: leituras [cloro, pH] das 3 visitas anteriores a hoje, da mais recente para a mais antiga.
  var CADASTRO = [
    { id: "c1", nome: "Marta Ribeiro", primeiro: "Marta", tel: "(31) 98841-2207", bairro: "Cidade Nova", endereco: "Rua Itaguaí, 418", dia: "Sexta", janela: "08h00–08h40", piscinas: [P("Principal", 32, "Fibra")], mensal: 280, pago: true, desde: "2026-03-06", ult: [[2.1, 7.4], [1.8, 7.5], [2.4, 7.3]] },
    { id: "c2", nome: "Condomínio Jardim União", primeiro: "Sr. Paulo", tel: "(31) 99702-5518", bairro: "União", endereco: "Rua Ponte Nova, 1200", dia: "Sexta", janela: "09h00–09h50", piscinas: [P("Adulto", 70, "Alvenaria"), P("Infantil", 15, "Alvenaria")], mensal: 520, pago: true, desde: "2026-03-06", ult: [[1.6, 7.6], [1.2, 7.5], [2.0, 7.4]] },
    { id: "c3", nome: "Família Carvalho", primeiro: "Renata", tel: "(31) 98113-4470", bairro: "Cidade Nova", endereco: "Rua Jacuí, 2915", dia: "Sexta", janela: "10h30–11h00", piscinas: [P("Principal", 40, "Vinil")], mensal: 300, pago: false, desde: "2026-04-03", ult: [[2.6, 7.3], [2.2, 7.4], [0.8, 7.9]] },
    { id: "c4", nome: "Rogério Mendes", primeiro: "Rogério", tel: "(31) 99254-8031", bairro: "Ipiranga", endereco: "Rua Pirapetinga, 77", dia: "Sexta", janela: "13h30–14h10", piscinas: [P("Principal", 28, "Fibra")], mensal: 260, pago: true, desde: "2026-03-13", ult: [[1.9, 7.5], [2.3, 7.4], [2.0, 7.5]] },
    { id: "c5", nome: "Ana Paula Souza", primeiro: "Ana Paula", tel: "(31) 98630-1192", bairro: "Palmares", endereco: "Rua Aimorés, 540", dia: "Sexta", janela: "15h00–15h40", piscinas: [P("Principal", 36, "Vinil")], mensal: 280, pago: false, desde: "2026-05-08", ult: [[1.4, 7.6], [1.7, 7.5], [2.2, 7.3]] },
    { id: "c6", nome: "Clínica Bem Viver", primeiro: "Juliana", tel: "(31) 3427-6610", bairro: "Sagrada Família", endereco: "Rua Conselheiro Lafaiete, 1880", dia: "Segunda", janela: "08h30–09h20", piscinas: [P("Principal", 60, "Alvenaria")], mensal: 450, pago: true, desde: "2026-03-02", ult: [[2.0, 7.4], [1.9, 7.5], [2.1, 7.4]] },
    { id: "c7", nome: "Luiz Fernando Alves", primeiro: "Luiz", tel: "(31) 99418-3356", bairro: "Santa Inês", endereco: "Rua Ilacir Pereira Lima, 305", dia: "Segunda", janela: "10h00–10h40", piscinas: [P("Principal", 30, "Fibra")], mensal: 260, pago: true, desde: "2026-04-06", ult: [[2.5, 7.3], [2.2, 7.4], [1.8, 7.6]] },
    { id: "c8", nome: "Cristina Lopes", primeiro: "Cristina", tel: "(31) 98277-9024", bairro: "Silveira", endereco: "Rua Itapecerica, 92", dia: "Terça", janela: "09h00–09h40", piscinas: [P("Principal", 34, "Vinil")], mensal: 280, pago: true, desde: "2026-05-05", ult: [[1.7, 7.5], [2.0, 7.4], [2.3, 7.3]] },
    { id: "c9", nome: "Pousada Recanto Verde", primeiro: "Marcos", tel: "(31) 99135-6402", bairro: "Nova Floresta", endereco: "Rua Ituiutaba, 1450", dia: "Quarta", janela: "08h00–09h00", piscinas: [P("Principal", 95, "Alvenaria"), P("Infantil", 15, "Alvenaria")], mensal: 680, pago: false, desde: "2026-07-01", ult: [[1.1, 7.8], [1.5, 7.6], [2.0, 7.5]] },
    { id: "c10", nome: "Felipe e Camila Duarte", primeiro: "Camila", tel: "(31) 98564-2719", bairro: "São Paulo", endereco: "Rua Sapucaí, 610", dia: "Quarta", janela: "14h00–14h40", piscinas: [P("Principal", 26, "Fibra")], mensal: 250, pago: true, desde: "2026-08-05", ult: [[2.2, 7.4], [2.4, 7.4], [2.1, 7.5]] },
    { id: "c11", nome: "Sérgio Antunes", primeiro: "Sérgio", tel: "(31) 99871-0435", bairro: "Fernão Dias", endereco: "Rua Pitangui, 3388", dia: "Quinta", janela: "10h00–10h40", piscinas: [P("Principal", 38, "Vinil")], mensal: 290, pago: true, desde: "2026-09-10", ult: [[1.9, 7.5], [2.0, 7.4], [2.6, 7.2]] },
    { id: "c12", nome: "Helena Martins", primeiro: "Helena", tel: "(31) 98402-6687", bairro: "Ipiranga", endereco: "Rua Contria, 155", dia: "Quinta", janela: "15h30–16h10", piscinas: [P("Principal", 24, "Fibra")], mensal: 240, pago: false, desde: "2026-10-01", ult: [[1.3, 7.7], [1.8, 7.5], [2.0, 7.4]] }
  ];
  // Visitas já feitas hoje (o resto da rota de hoje está pendente). Uma entrada por piscina.
  var FEITAS_HOJE = {
    c1: [{ hora: "08h20", cloro: 2.0, ph: 7.4, alc: 100, obs: "Água cristalina." }],
    c2: [
      { hora: "09h20", piscina: "Infantil", cloro: 2.2, ph: 7.5, alc: 100, obs: "Infantil limpa e com cloro em dia." },
      { hora: "09h35", piscina: "Adulto", cloro: 1.8, ph: 7.4, alc: 95, serv: ["Aspiração", "Escovação", "Peneira", "Retrolavagem do filtro"],
        prod: ["Cloro granulado", "Clarificante"], obs: "Água cristalina. Filtro lavado, pressão normal." }
    ]
  };

  /* ---------- Registros de visita ---------- */
  var seqVisita = 0, visitaPorId = {};
  function novaVisita(c, o) {
    var v = {
      id: "v" + (++seqVisita), cid: c.id, data: o.data, hora: o.hora, piscina: o.piscina || c.piscinas[0].nome,
      cloro: o.cloro, ph: o.ph, alc: o.alc, serv: o.serv || SERV_PADRAO.slice(), prod: o.prod || ["Cloro granulado"],
      obs: o.obs || "", fotos: o.fotos || []
    };
    visitaPorId[v.id] = v; return v;
  }
  function ordenarHist(c) { c.hist.sort(function (a, b) { return a.data === b.data ? (a.hora < b.hora ? 1 : -1) : (a.data < b.data ? 1 : -1); }); }
  function rnd(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
  function horaMais(h, min) { var x = h.split("h"), t = (+x[0]) * 60 + (+x[1]) + min; return pad2(Math.floor(t / 60)) + "h" + pad2(t % 60); }
  function inicioJanela(c) { return c.janela.split("–")[0]; }
  // Gera uma visita por semana (um registro por piscina), do início do cliente até ontem.
  // Valores pseudoaleatórios estáveis: o histórico é o mesmo a cada carregamento.
  function gerarHistorico(c, ult) {
    var idx = DIA_SEMANA.indexOf(c.dia), d = deChave(c.desde), datas = [];
    while (d.getDay() !== idx) d = addDias(d, 1);
    for (; chaveData(d) < CHAVE_HOJE; d = addDias(d, 7)) datas.push(chaveData(d));
    datas.reverse();
    c.hist = [];
    datas.forEach(function (k, i) {
      c.piscinas.forEach(function (p, j) {
        var s = c.id + k + p.nome, r1 = rnd(s), r2 = rnd(k + s), r3 = rnd(s + "x");
        var serv = SERV_PADRAO.slice(); if (r1 > 0.6) serv.push("Retrolavagem do filtro");
        var prod = ["Cloro granulado"]; if (r3 > 0.78) prod.push("Clarificante"); else if (r3 < 0.12) prod.push("Algicida");
        var fixo = j === 0 && ult[i]; // as 3 últimas leituras da piscina principal são fixas
        c.hist.push(novaVisita(c, {
          data: k, hora: horaMais(inicioJanela(c), j * 20 + Math.round(r2 * 12)), piscina: p.nome,
          cloro: fixo ? ult[i][0] : Math.round((1.4 + r1 * 1.3) * 10) / 10,
          ph: fixo ? ult[i][1] : Math.round((7.3 + r2 * 0.25) * 10) / 10,
          alc: Math.round(85 + r3 * 30), serv: serv, prod: prod
        }));
      });
    });
    ordenarHist(c);
  }

  var clientes = CADASTRO.map(function (base) {
    var c = {}, ult = base.ult;
    Object.keys(base).forEach(function (k) { if (k !== "ult") c[k] = base[k]; });
    gerarHistorico(c, ult);
    (FEITAS_HOJE[c.id] || []).forEach(function (fh) {
      var o = { data: CHAVE_HOJE }; Object.keys(fh).forEach(function (k) { o[k] = fh[k]; }); c.hist.push(novaVisita(c, o));
    });
    ordenarHist(c);
    return c;
  });
  var porId = {};
  clientes.forEach(function (c) { porId[c.id] = c; });
  var seqCliente = clientes.length;

  /* ---------- Consultas (usadas por todas as telas) ---------- */
  function visitaEm(c, k) { for (var i = 0; i < c.hist.length; i++) { if (c.hist[i].data === k) return c.hist[i]; if (c.hist[i].data < k) break; } return null; }
  function agendadoEm(c, k) { return c.dia === DIA_SEMANA[deChave(k).getDay()] && k >= c.desde; }
  // Passado: o que foi registrado. Hoje: agenda fixa + o que foi registrado. Futuro: agenda fixa.
  function statusEm(c, k) {
    var rec = visitaEm(c, k), ag = agendadoEm(c, k);
    if (k < CHAVE_HOJE) return rec ? { c: c, rec: rec, st: "feita", extra: !ag } : null;
    if (k === CHAVE_HOJE) return rec || ag ? { c: c, rec: rec, st: rec ? "feita" : "pendente", extra: !ag } : null;
    return ag ? { c: c, rec: null, st: "agendada", extra: false } : null;
  }
  function horaItem(v) { return v.extra && v.rec ? v.rec.hora : inicioJanela(v.c); }
  function visitasDoDia(d) {
    var k = typeof d === "string" ? d : chaveData(d);
    return clientes.map(function (c) { return statusEm(c, k); }).filter(Boolean)
      .sort(function (a, b) { return horaItem(a) < horaItem(b) ? -1 : 1; });
  }
  function rotaHoje() { return visitasDoDia(CHAVE_HOJE); }
  function proximaData(c, apos) {
    var idx = DIA_SEMANA.indexOf(c.dia);
    for (var i = 1; i <= 7; i++) { var d = addDias(apos, i); if (d.getDay() === idx) return d; }
  }
  function proximaTxt(c, apos) { return c.dia + ", " + ddmm(proximaData(c, apos || HOJE_DATA)) + " · " + c.janela; }
  function diasDoMes(ano, mes) { var n = new Date(ano, mes + 1, 0).getDate(), l = []; for (var i = 1; i <= n; i++) l.push(chaveData(new Date(ano, mes, i))); return l; }
  function visitasNoMes(c) {
    var t = 0, f = 0;
    diasDoMes(HOJE_DATA.getFullYear(), HOJE_DATA.getMonth()).forEach(function (k) { var s = statusEm(c, k); if (s) { t++; if (s.st === "feita") f++; } });
    return { total: t, feitas: f };
  }
  function leituraOk(v) { return dentro("cloro", v.cloro) && dentro("ph", v.ph); }
  function registrosEm(c, k) { return c.hist.filter(function (h) { return h.data === k; }); }
  // Último dia com visita: todas as piscinas daquele dia.
  function ultimoDia(c) { return c.hist.length ? registrosEm(c, c.hist[0].data) : []; }
  function ultimaOk(c) { return ultimoDia(c).every(leituraOk); }
  function diasVisitados(c) { var s = {}; c.hist.forEach(function (h) { s[h.data] = 1; }); return Object.keys(s).length; }
  function leituraTxt(c, h) { return (c.piscinas.length > 1 ? esc(h.piscina) + ": " : "") + "Cloro " + n1(h.cloro) + " · pH " + n1(h.ph); }
  function vencimento(c) {
    var v = chaveData(new Date(HOJE_DATA.getFullYear(), HOJE_DATA.getMonth(), VENCIMENTO));
    return c.desde > v ? c.desde : v; // quem começou depois do dia 10 vence no dia em que começou
  }
  function vencTxt(c) {
    if (c.pago) return "Pago";
    var v = vencimento(c);
    if (v < CHAVE_HOJE) { var dias = Math.round((HOJE_DATA - deChave(v)) / 864e5); return "Venceu " + ddmm(v) + " · " + dias + (dias === 1 ? " dia" : " dias") + " de atraso"; }
    return v === CHAVE_HOJE ? "Vence hoje" : "Vence " + ddmm(v);
  }
  function numerosMes() {
    var soma = function (l) { return l.reduce(function (s, c) { return s + c.mensal; }, 0); };
    var pagosL = clientes.filter(function (c) { return c.pago; }), abertosL = clientes.filter(function (c) { return !c.pago; });
    return {
      total: clientes.length, pagos: pagosL.length, abertos: abertosL.length,
      vencidos: abertosL.filter(function (c) { return vencimento(c) < CHAVE_HOJE; }).length,
      recebido: soma(pagosL), aberto: soma(abertosL), abertosL: abertosL
    };
  }
  // Faturamento dos últimos 6 meses: meses passados = mensalidades dos clientes ativos naquele mês.
  function faturamento() {
    var l = [];
    for (var i = 5; i >= 0; i--) {
      var ini = new Date(HOJE_DATA.getFullYear(), HOJE_DATA.getMonth() - i, 1), fim = chaveData(new Date(ini.getFullYear(), ini.getMonth() + 1, 0));
      if (i === 0) { var m = numerosMes(); l.push({ rot: MESES_CURTO[ini.getMonth()], nome: MESES[ini.getMonth()], recebido: m.recebido, aberto: m.aberto, atual: true }); }
      else l.push({ rot: MESES_CURTO[ini.getMonth()], nome: MESES[ini.getMonth()], recebido: clientes.filter(function (c) { return c.desde <= fim; }).reduce(function (s, c) { return s + c.mensal; }, 0), aberto: 0 });
    }
    return l;
  }

  var estado = {
    calAno: HOJE_DATA.getFullYear(), calMes: HOJE_DATA.getMonth(), calDia: CHAVE_HOJE,
    clienteVisita: null, piscinaVisita: 0, fotos: [], resumoId: null, enviadaId: null,
    clienteAberto: null, busca: "", editando: null
  };

  /* ---------- Utilidades ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function brl(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function dec(v) { return String(v).replace(".", ","); }
  function n1(v) { return dec((+v).toFixed(1)); } // leituras de cloro e pH sempre com uma casa
  function nLeitura(chave, v) { return chave === "alc" ? String(Math.round(v)) : n1(v); }
  function dentro(chave, v) { var f = FAIXAS[chave]; return v >= f.min && v <= f.max; }
  function volTotal(c) { return c.piscinas.reduce(function (s, p) { return s + p.volume; }, 0); }
  function pisTxt(c) {
    if (c.piscinas.length === 1) return dec(c.piscinas[0].volume) + " m³ · " + esc(c.piscinas[0].tipo);
    return c.piscinas.length + " piscinas · " + dec(volTotal(c)) + " m³";
  }
  function parseNum(s) {
    s = String(s).trim();
    if (s.indexOf(",") >= 0) s = s.replace(/\./g, "").replace(",", ".");
    var v = parseFloat(s); return isNaN(v) ? null : v;
  }
  function marcarErro(el, erro) { if (erro) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
  function agoraHora() { var d = new Date(); return pad2(d.getHours()) + "h" + pad2(d.getMinutes()); }
  function minutos(janela) {
    var p = janela.split("–").map(function (h) { var x = h.split("h"); return (+x[0]) * 60 + (+x[1]); });
    return Math.max(0, p[1] - p[0]);
  }
  function horasTxt(min) { var h = Math.floor(min / 60), m = min % 60; return h ? h + "h" + (m ? pad2(m) : "") : m + " min"; }
  function milTxt(v) { return dec((v / 1000).toFixed(1)) + " mil"; }
  function plural(n, um, varios) { return n + " " + (n === 1 ? um : varios); }
  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  var POOL_SVG = '<svg class="pool-art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Foto de exemplo: piscina limpa">' +
    '<rect width="320" height="180" fill="#cfe3d2"/>' +
    '<rect x="18" y="22" width="284" height="136" rx="18" fill="#e9e3d6"/>' +
    '<rect x="30" y="34" width="260" height="112" rx="12" fill="#2fb3c0"/>' +
    '<path d="M30 70 Q70 60 110 72 T190 70 T290 66 V146 H30Z" fill="#1d97a6" opacity=".55"/>' +
    '<path d="M48 58 q14 -6 28 0 M140 96 q14 -6 28 0 M210 64 q14 -6 28 0 M80 118 q14 -6 28 0 M230 120 q14 -6 28 0" stroke="#ffffff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>' +
    '<rect x="262" y="40" width="6" height="40" rx="3" fill="#cfd8d8"/><rect x="276" y="40" width="6" height="40" rx="3" fill="#cfd8d8"/>' +
    '</svg>';

  /* ---------- Navegação ---------- */
  var ICON = {
    painel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="9" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.5"/></svg>',
    calendario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01" stroke-width="2.6"/></svg>',
    mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5.5 12h.01M12 12h.01M18.5 12h.01"/></svg>',
    hoje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    visita: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12l2 2 4-4"/></svg>',
    resumo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
    clientes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.6.1 4.6 1.7 5.3 4.4"/></svg>',
    mensalidades: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M15 9c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3.2 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.2-1.6M12 6v1.5M12 16.5V18"/></svg>'
  };
  var ROTAS = [
    ["painel", "Painel"], ["hoje", "Hoje"], ["calendario", "Calendário"], ["visita", "Registrar"], ["resumo", "Resumo"], ["clientes", "Clientes"], ["mensalidades", "Mensalidades"]
  ];
  // No celular, estas ficam na barra de baixo; as demais vão para o menu "Mais".
  var TAB_FIXAS = ["painel", "hoje", "calendario", "visita", "clientes"];
  function montarNav() {
    function link(r) { return '<a href="#' + r[0] + '" data-r="' + r[0] + '">' + ICON[r[0]] + "<span>" + r[1] + "</span></a>"; }
    $("#nav-side").innerHTML = ROTAS.map(link).join("");
    var fixas = ROTAS.filter(function (r) { return TAB_FIXAS.indexOf(r[0]) >= 0; });
    var outras = ROTAS.filter(function (r) { return TAB_FIXAS.indexOf(r[0]) < 0; });
    $("#nav-tab").innerHTML = fixas.map(link).join("") +
      '<button type="button" class="tab-more" data-mais aria-expanded="false" aria-controls="mais-menu">' + ICON.mais + "<span>Mais</span></button>" +
      '<div class="more-sheet" id="mais-menu" hidden>' + outras.map(link).join("") + "</div>";
  }
  function menuMais(abrir) {
    var s = $("#mais-menu"), b = $("[data-mais]");
    if (!s) return;
    s.hidden = !abrir; b.setAttribute("aria-expanded", String(abrir));
  }
  function marcarNav(r) {
    document.querySelectorAll(".nav a, .tabbar a").forEach(function (a) {
      if (a.dataset.r === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var mais = $("[data-mais]");
    if (mais) mais.classList.toggle("on", TAB_FIXAS.indexOf(r) < 0);
  }

  /* ---------- Tema (automático / claro / escuro) ---------- */
  var TEMAS = [
    ["auto", "Auto", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>'],
    ["claro", "Claro", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>'],
    ["escuro", "Escuro", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>']
  ];
  function temaSalvo() { try { return localStorage.getItem("ac-tema") || "auto"; } catch (e) { return "auto"; } }
  function aplicarTema(t) {
    var raiz = document.documentElement;
    if (t === "claro") raiz.dataset.theme = "light";
    else if (t === "escuro") raiz.dataset.theme = "dark";
    else delete raiz.dataset.theme;
    try { if (t === "auto") localStorage.removeItem("ac-tema"); else localStorage.setItem("ac-tema", t); } catch (e) {}
    document.querySelectorAll("[data-tema]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tema === t)); });
  }
  function montarTema() {
    var html = TEMAS.map(function (t) {
      return '<button type="button" data-tema="' + t[0] + '" aria-pressed="false" title="' + (t[0] === "auto" ? "Tema automático (segue o aparelho)" : "Tema " + t[1].toLowerCase()) + '">' + t[2] + "<span>" + t[1] + "</span></button>";
    }).join("");
    document.querySelectorAll("[data-tema-grupo]").forEach(function (g) { g.innerHTML = html; });
    aplicarTema(temaSalvo());
  }

  /* ---------- Hoje ---------- */
  function chipStatus(v) {
    if (v.st === "feita") return '<span class="chip ok">✓ Feita' + (v.rec ? " " + v.rec.hora : "") + "</span>";
    if (v.st === "pendente") return '<span class="chip warn">Pendente</span>';
    return '<span class="chip">Agendada</span>';
  }
  function telaHoje() {
    var rota = rotaHoje(), feitas = rota.filter(function (v) { return v.st === "feita"; }).length;
    var linhas = rota.map(function (v) {
      var c = v.c;
      var acao = v.rec
        ? '<button class="btn ghost" type="button" data-ver="' + v.rec.id + '">Ver resumo</button>'
        : '<button class="btn" type="button" data-registrar="' + c.id + '">Registrar visita</button>';
      return '<div class="stop' + (v.st === "feita" ? " done" : "") + '"><time class="num">' + horaItem(v) + "</time>" +
        '<div class="who"><b>' + esc(c.nome) + (v.extra ? ' <span class="chip pool">Visita extra</span>' : "") + "</b><span>" + esc(c.bairro) + " · " + pisTxt(c) + " · " + c.janela + "</span></div>" +
        '<div class="act" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' + chipStatus(v) + acao + "</div></div>";
    }).join("") || '<div class="stop"><span></span><div class="who"><b>Nenhuma visita hoje</b><span>Nenhum cliente tem ' + HOJE.toLowerCase() + " como dia fixo.</span></div></div>";
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Agenda fixa</div><h1>' + dataLonga(HOJE_DATA) + "</h1></div>" +
      '<button class="btn ghost" type="button" data-ir-dia="' + CHAVE_HOJE + '">Ver no calendário</button></div>' +
      '<div class="day-summary">' +
      '<div class="card stat"><span class="muted">Visitas hoje</span><b>' + rota.length + "</b></div>" +
      '<div class="card stat"><span class="muted">Feitas</span><b>' + feitas + "</b></div>" +
      '<div class="card stat"><span class="muted">Pendentes</span><b>' + (rota.length - feitas) + "</b></div></div>" +
      '<div class="card route">' + linhas + "</div>" +
      '<p class="muted" style="margin:0">A rota vem do dia e horário fixos de cada cliente — a mesma agenda do calendário.</p>' +
      "</section>";
  }

  /* ---------- Registrar visita ---------- */
  function checks(nome, lista, marcados) {
    return '<div class="checks">' + lista.map(function (item, i) {
      var id = nome + "-" + i;
      return '<label class="check" for="' + id + '"><input type="checkbox" id="' + id + '" name="' + nome + '" value="' + esc(item) + '"' + (marcados.indexOf(item) >= 0 ? " checked" : "") + "><span>" + esc(item) + "</span></label>";
    }).join("") + "</div>";
  }
  function clientePadraoVisita() {
    var rota = rotaHoje(), p = rota.filter(function (v) { return v.st === "pendente"; })[0] || rota[0];
    return p ? p.c.id : clientes[0].id;
  }
  function telaVisita() {
    if (!porId[estado.clienteVisita]) estado.clienteVisita = clientePadraoVisita();
    var c = porId[estado.clienteVisita], rota = rotaHoje();
    var naRota = rota.filter(function (v) { return v.c.id === c.id; })[0];
    var pendentes = rota.filter(function (v) { return v.st === "pendente"; }).length;
    var idsRota = rota.map(function (v) { return v.c.id; });
    function opt(x, txt) { return '<option value="' + x.id + '"' + (x.id === c.id ? " selected" : "") + ">" + txt + "</option>"; }
    var opcoes = '<optgroup label="Rota de hoje">' + rota.map(function (v) {
      return opt(v.c, esc(v.c.nome) + " · " + horaItem(v) + " · " + (v.st === "feita" ? "feita" : "pendente"));
    }).join("") + "</optgroup>" +
      '<optgroup label="Outros clientes (visita extra)">' + clientes.filter(function (x) { return idsRota.indexOf(x.id) < 0; }).map(function (x) {
        return opt(x, esc(x.nome) + " · fixo " + x.dia.toLowerCase());
      }).join("") + "</optgroup>";
    var fotos = estado.fotos.map(function (src, i) { return '<div class="photo"><img src="' + src + '" alt="Foto ' + (i + 1) + ' da visita"></div>'; }).join("");
    if (!estado.fotos.length) fotos = '<div class="photo">' + POOL_SVG + "</div>";
    var selPiscina = c.piscinas.length > 1
      ? '<div class="field"><label for="f-piscina">Piscina</label><select class="input" id="f-piscina">' + c.piscinas.map(function (p, i) {
          var feitaHoje = c.hist.some(function (h) { return h.data === CHAVE_HOJE && h.piscina === p.nome; });
          return '<option value="' + i + '"' + (i === estado.piscinaVisita ? " selected" : "") + ">" + esc(p.nome) + " · " + dec(p.volume) + " m³ · " + esc(p.tipo) + (feitaHoje ? " · já registrada hoje" : "") + "</option>";
        }).join("") + "</select></div>"
      : "";
    var situacao = naRota
      ? (naRota.st === "feita" ? '<span class="chip ok">Já registrada hoje às ' + naRota.rec.hora + "</span>" : '<span class="chip warn">Na rota de hoje · ' + inicioJanela(c) + "</span>")
      : '<span class="chip pool">Visita extra · dia fixo ' + c.dia.toLowerCase() + "</span>";
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Registrar visita · ' + dataLonga(HOJE_DATA) + "</div><h1>" + esc(c.nome) + "</h1>" +
      '<div class="muted">' + esc(c.bairro) + " · " + pisTxt(c) + " · " + c.dia + " " + c.janela + "</div></div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + situacao + (pendentes ? '<span class="chip warn">' + plural(pendentes, "pendente", "pendentes") + " hoje</span>" : "") + "</div></div>" +
      '<form class="card pad form" id="form-visita" novalidate>' +
      '<div class="field"><label for="f-cliente">Cliente</label><select class="input" id="f-cliente">' + opcoes + "</select></div>" +
      selPiscina +
      '<div class="field"><span class="legend">Fotos da piscina</span><div class="photos" id="fotos">' + fotos +
      '<label class="photo-add" for="f-foto">+ Adicionar foto<input type="file" id="f-foto" accept="image/*" multiple></label></div>' +
      '<span class="hint">A foto vai junto no resumo que o cliente recebe.</span></div>' +
      '<div class="row3">' +
      campoNum("cloro", "Cloro livre (ppm)", "2,0") +
      campoNum("ph", "pH", "7,4") +
      campoNum("alc", "Alcalinidade (ppm)", "100") + "</div>" +
      '<div class="field"><span class="legend">O que foi feito</span>' + checks("serv", SERVICOS, SERV_PADRAO) + "</div>" +
      '<div class="field"><span class="legend">Produtos aplicados</span>' + checks("prod", PRODUTOS, ["Cloro granulado"]) + "</div>" +
      '<div class="field"><label for="f-obs">Observação para o cliente</label><textarea class="input" id="f-obs" rows="3">Água cristalina. Recomendo manter a capa à noite por causa das folhas da árvore do vizinho.</textarea></div>' +
      '<button class="btn block" type="submit">Concluir e enviar resumo para ' + esc(c.primeiro) + "</button>" +
      "</form></section>";
  }
  function campoNum(chave, rotulo, valor) {
    var f = FAIXAS[chave];
    return '<div class="field"><label for="f-' + chave + '">' + rotulo + '</label>' +
      '<input class="input num" id="f-' + chave + '" inputmode="decimal" value="' + valor + '" data-faixa="' + chave + '">' +
      '<span class="hint" id="h-' + chave + '">Ideal: ' + f.ideal + "</span></div>";
  }
  function lerNum(id) { return parseNum($(id).value); }
  function atualizarDica(chave) {
    var v = lerNum("#f-" + chave), h = $("#h-" + chave), f = FAIXAS[chave];
    if (!h) return;
    if (v === null) { h.className = "hint"; h.textContent = "Ideal: " + f.ideal; return; }
    var ok = dentro(chave, v);
    h.className = "hint " + (ok ? "ok" : "warn");
    h.textContent = (ok ? "Dentro do ideal" : "Atenção: fora do ideal") + " (" + f.ideal + ")";
  }
  function salvarVisita() {
    var c = porId[estado.clienteVisita];
    var marc = function (n) { return Array.prototype.slice.call(document.querySelectorAll('input[name="' + n + '"]:checked')).map(function (i) { return i.value; }); };
    var pis = (c.piscinas[estado.piscinaVisita] || c.piscinas[0]).nome;
    // Uma visita por piscina por dia: registrar de novo substitui a anterior.
    c.hist = c.hist.filter(function (h) { return !(h.data === CHAVE_HOJE && h.piscina === pis); });
    var v = novaVisita(c, {
      data: CHAVE_HOJE, hora: agoraHora(), piscina: pis,
      cloro: lerNum("#f-cloro") || 0, ph: lerNum("#f-ph") || 0, alc: lerNum("#f-alc") || 0,
      serv: marc("serv"), prod: marc("prod"), obs: $("#f-obs").value.trim(), fotos: estado.fotos.slice()
    });
    c.hist.unshift(v); ordenarHist(c);
    estado.enviadaId = v.id; estado.resumoId = v.id; estado.fotos = [];
    toast("Resumo enviado para " + c.primeiro + " pelo WhatsApp");
    location.hash = "#resumo";
  }

  /* ---------- Resumo ---------- */
  function resumoPadrao() {
    if (estado.enviadaId && visitaPorId[estado.enviadaId]) return visitaPorId[estado.enviadaId];
    var hoje = rotaHoje().filter(function (v) { return v.rec; }).map(function (v) { return v.rec; });
    hoje.sort(function (a, b) { return a.hora < b.hora ? 1 : -1; });
    return hoje[0] || null;
  }
  function paramHtml(chave, v) {
    var f = FAIXAS[chave], ok = dentro(chave, v);
    return '<div class="param"><small>' + f.nome + '</small><b>' + nLeitura(chave, v) + (f.un ? " " + f.un : "") + "</b>" +
      '<span class="chip ' + (ok ? "ok" : "warn") + '">' + (ok ? "ok" : "atenção") + '</span><br><small>ideal ' + f.ideal + "</small></div>";
  }
  function telaResumo() {
    var v = (estado.resumoId && visitaPorId[estado.resumoId]) || resumoPadrao();
    if (!v) {
      return '<section class="view"><div class="view-head"><div><div class="eyebrow">Resumo da visita</div><h1>O que o cliente recebe</h1></div></div>' +
        '<div class="card pad" style="display:grid;gap:12px;justify-items:start"><p style="margin:0">Nenhuma visita registrada hoje ainda.</p>' +
        '<a class="btn" href="#visita">Registrar visita</a></div></section>';
    }
    var c = porId[v.cid], pis = c.piscinas.filter(function (p) { return p.nome === v.piscina; })[0] || c.piscinas[0];
    var dataV = deChave(v.data), ehHoje = v.data === CHAVE_HOJE;
    var foto = v.fotos.length ? '<img src="' + v.fotos[0] + '" alt="Foto da piscina na visita">' : POOL_SVG;
    var link = "aguascristalinas.app/v/" + c.id + v.data.replace(/-/g, "").slice(2);
    var proxima = proximaTxt(c, dataV);
    var chip = v.id === estado.enviadaId ? '<span class="chip ok">Enviado agora</span>'
      : '<span class="chip ok">Enviado ' + (ehHoje ? "hoje" : "em " + ddmm(v.data)) + " às " + v.hora + "</span>";
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Resumo da visita</div><h1>O que o cliente recebe</h1></div>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' + chip + '<button class="btn ghost sm" type="button" data-abrir-cliente="' + c.id + '">Ver cliente</button></div></div>' +
      '<div class="split">' +
      '<div class="phone" aria-label="Simulação do WhatsApp do cliente"><div class="phone-screen">' +
      '<div class="wa-head">Águas Cristalinas · Piscinas</div>' +
      '<div class="wa-body"><div class="bubble">Oi ' + esc(c.primeiro) + ", passei " + (ehHoje ? "hoje" : "no dia " + ddmm(v.data)) + " às " + v.hora + " na sua piscina" + (c.piscinas.length > 1 ? " (" + esc(pis.nome) + ")" : "") + ". Veja como ficou:<br><a href=\"#resumo\">" + link + "</a></div>" +
      '<div class="bubble">Próxima visita: ' + proxima + ". Qualquer coisa é só chamar aqui.</div></div></div></div>" +
      '<article class="card report">' +
      '<div class="report-hero"><span class="logo-box"><img src="assets/logo.jpg" alt="Águas Cristalinas" width="600" height="400"></span><span class="eyebrow" style="color:inherit;opacity:.85">Visita de ' + ddmm(v.data) + " às " + v.hora + "</span>" +
      "<h2>Piscina · " + esc(c.nome) + (c.piscinas.length > 1 ? " (" + esc(pis.nome) + ")" : "") + "</h2><span>" + dec(pis.volume) + " m³ · " + esc(pis.tipo) + " · " + esc(c.bairro) + "</span></div>" +
      '<div class="report-photo">' + foto + "</div>" +
      '<div class="pad" style="display:grid;gap:16px">' +
      '<div class="params">' + paramHtml("cloro", v.cloro) + paramHtml("ph", v.ph) + paramHtml("alc", v.alc) + "</div>" +
      '<div><div class="eyebrow">O que foi feito</div><ul class="done-list">' + v.serv.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" +
      (v.prod.length ? '<div><div class="eyebrow">Produtos aplicados</div><p style="margin:4px 0 0">' + v.prod.map(esc).join(", ") + "</p></div>" : "") +
      (v.obs ? '<div><div class="eyebrow">Observação</div><p style="margin:4px 0 0">' + esc(v.obs) + "</p></div>" : "") +
      '<div class="muted">Próxima visita: ' + proxima + "</div>" +
      '<div><b>Eduardo</b> · Águas Cristalinas</div>' +
      "</div></article></div></section>";
  }

  /* ---------- Clientes ---------- */
  function linhaHist(c, h) {
    var ok = leituraOk(h);
    return '<div><span><b>' + ddmm(h.data) + "</b> · " + h.hora + (c.piscinas.length > 1 ? " · " + esc(h.piscina) : "") + "</span>" +
      '<span class="num">Cloro ' + n1(h.cloro) + " ppm · pH " + n1(h.ph) + "</span>" +
      '<span style="display:flex;gap:8px;align-items:center"><span class="chip ' + (ok ? "ok" : "warn") + '">' + (ok ? "ok" : "atenção") + "</span>" +
      '<button class="link-btn pool" type="button" data-ver="' + h.id + '">Resumo</button></span></div>';
  }
  function telaClientes() {
    var termo = estado.busca.toLowerCase();
    var lista = clientes.filter(function (c) { return !termo || (c.nome + " " + c.bairro + " " + c.primeiro).toLowerCase().indexOf(termo) >= 0; });
    var linhas = lista.map(function (c) {
      var u = c.hist[0], uok = ultimaOk(c);
      return '<tr data-cliente="' + c.id + '" tabindex="0"><td><b>' + esc(c.nome) + "</b></td><td>" + esc(c.bairro) + "</td><td>" + c.dia + " · " + c.janela +
        '</td><td class="num">' + pisTxt(c) + "</td><td>" + (u ? ddmm(u.data) + ' <span class="chip ' + (uok ? "ok" : "warn") + '">' + (uok ? "ok" : "atenção") + "</span>" : '<span class="muted">—</span>') +
        '</td><td class="num">' + brl(c.mensal) + "</td><td>" +
        (c.pago ? '<span class="chip ok">Pago</span>' : '<span class="chip warn">Em aberto</span>') + "</td></tr>";
    }).join("") || '<tr><td colspan="7" class="muted">Nenhum cliente encontrado.</td></tr>';
    var detalhe = "";
    var a = estado.clienteAberto && porId[estado.clienteAberto];
    if (a) {
      var nm = visitasNoMes(a), inicio = deChave(a.desde);
      detalhe = '<div class="card pad client-detail" id="detalhe"><div class="view-head"><div><div class="eyebrow">Cliente desde ' + MESES[inicio.getMonth()] + " de " + inicio.getFullYear() + "</div><h2>" + esc(a.nome) + "</h2>" +
        '<div class="muted">' + esc(a.bairro) + " · " + a.dia + " " + a.janela + "</div></div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" type="button" data-registrar="' + a.id + '">Registrar visita</button>' +
        '<button class="btn ghost" type="button" data-editar="' + a.id + '">Editar</button>' +
        '<button class="btn ghost" type="button" data-fechar>Fechar</button></div></div>' +
        '<div class="params">' +
        '<div class="param"><small>Piscinas</small><b>' + a.piscinas.length + '</b><small>' + dec(volTotal(a)) + " m³ no total</small></div>" +
        '<div class="param"><small>Mensalidade</small><b>' + brl(a.mensal) + "</b><small>" + MES_ATUAL + ": " + vencTxt(a).toLowerCase() + "</small></div>" +
        '<div class="param"><small>Visitas em ' + MES_ATUAL + "</small><b>" + nm.total + "</b><small>" + plural(nm.feitas, "feita", "feitas") + "</small></div></div>" +
        '<dl class="dados">' +
        "<div><dt>Como chamar no WhatsApp</dt><dd>" + esc(a.primeiro) + "</dd></div>" +
        "<div><dt>WhatsApp</dt><dd>" + (a.tel ? esc(a.tel) : '<span class="muted">—</span>') + "</dd></div>" +
        "<div><dt>Endereço</dt><dd>" + (a.endereco ? esc(a.endereco) + " · " + esc(a.bairro) : esc(a.bairro)) + "</dd></div>" +
        "<div><dt>Visita fixa</dt><dd>" + a.dia + " · " + a.janela + "</dd></div>" +
        "<div><dt>Próxima visita</dt><dd>" + (statusEm(a, CHAVE_HOJE) && statusEm(a, CHAVE_HOJE).st === "pendente" ? "Hoje · " + a.janela : proximaTxt(a)) + "</dd></div>" +
        "<div><dt>Cliente desde</dt><dd>" + ddmm(a.desde) + "/" + inicio.getFullYear() + "</dd></div>" +
        "</dl>" +
        '<div><div class="eyebrow">Piscinas</div><div class="hist">' + a.piscinas.map(function (p, i) {
          return "<div><span><b>" + esc(p.nome) + '</b></span><span class="num">' + dec(p.volume) + " m³ · " + esc(p.tipo) + "</span>" +
            (a.piscinas.length > 1 ? '<button class="link-btn" type="button" data-rem-piscina="' + i + '">Remover</button>' : "") + "</div>";
        }).join("") + "</div>" +
        '<form class="pool-add" id="form-piscina" novalidate><span class="legend">Adicionar piscina</span>' +
        linhaPiscina({ nome: "" }, '<button class="btn sm" type="submit">Adicionar</button>') + "</form></div>" +
        '<div><div class="eyebrow">Últimas visitas</div><div class="hist">' + (a.hist.length ? a.hist.slice(0, 6).map(function (h) { return linhaHist(a, h); }).join("") : '<div class="muted">Nenhuma visita registrada ainda.</div>') +
        "</div>" + (a.hist.length ? '<span class="hint">' + plural(diasVisitados(a), "visita registrada", "visitas registradas") + " desde " + ddmm(a.desde) + "/" + inicio.getFullYear() +
          (a.piscinas.length > 1 ? " · um registro por piscina" : "") + ".</span>" : "") + "</div></div>";
    }
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Cadastro</div><h1>Clientes e piscinas</h1></div>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="chip">' + plural(clientes.length, "cliente", "clientes") + "</span>" +
      '<a class="btn" href="#novo-cliente">+ Novo cliente</a></div></div>' +
      '<div class="toolbar"><label for="f-busca" class="eyebrow" style="align-self:center">Buscar</label>' +
      '<input class="input" id="f-busca" type="search" placeholder="Nome, contato ou bairro" value="' + esc(estado.busca) + '"></div>' +
      detalhe +
      '<div class="card table-wrap"><table><thead><tr><th>Cliente</th><th>Bairro</th><th>Dia e horário</th><th>Piscina</th><th>Última visita</th><th>Mensalidade</th><th>' + maiusc(MES_ATUAL) + "</th></tr></thead><tbody>" + linhas + "</tbody></table></div>" +
      "</section>";
  }

  /* ---------- Cadastro / edição de cliente ---------- */
  var linhaSeq = 0;
  function linhaPiscina(p, ultimaCelula) {
    var k = ++linhaSeq;
    return '<div class="pool-row" data-pool-row>' +
      '<div class="field"><label for="pn-' + k + '">Nome da piscina</label><input class="input" id="pn-' + k + '" data-p="nome" value="' + esc(p.nome || "") + '" placeholder="Ex.: Infantil" maxlength="40"></div>' +
      '<div class="field"><label for="pv-' + k + '">Volume (m³)</label><input class="input num" id="pv-' + k + '" data-p="volume" inputmode="decimal" placeholder="32" value="' + (p.volume ? dec(p.volume) : "") + '"></div>' +
      '<div class="field"><label for="pt-' + k + '">Revestimento</label><select class="input" id="pt-' + k + '" data-p="tipo">' +
      TIPOS.map(function (t) { return "<option" + (t === p.tipo ? " selected" : "") + ">" + t + "</option>"; }).join("") + "</select></div>" +
      (ultimaCelula || "<span></span>") + "</div>";
  }
  var BTN_REM_LINHA = '<button class="btn ghost sm" type="button" data-rem-row>Remover</button>';
  // Lê as linhas de piscina dentro de `raiz`; devolve null se algum volume for inválido.
  function lerPiscinas(raiz, jaExistentes) {
    var ok = true;
    var lista = Array.prototype.slice.call(raiz.querySelectorAll("[data-pool-row]")).map(function (row, i) {
      var vEl = row.querySelector('[data-p="volume"]'), v = parseNum(vEl.value);
      var valido = v !== null && v > 0 && v <= 2000;
      marcarErro(vEl, !valido); if (!valido) ok = false;
      var n = jaExistentes + i;
      var nome = row.querySelector('[data-p="nome"]').value.trim() || (n === 0 ? "Principal" : "Piscina " + (n + 1));
      return P(nome, v, row.querySelector('[data-p="tipo"]').value);
    });
    return ok ? lista : null;
  }
  function telaFormCliente() {
    var c = estado.editando && porId[estado.editando];
    var val = function (s) { return ' value="' + esc(s || "") + '"'; };
    var ini = c ? c.janela.split("–")[0].replace("h", ":") : "", fim = c ? c.janela.split("–")[1].replace("h", ":") : "";
    var dias = '<option value="">Escolha o dia</option>' + DIAS.map(function (d) { return "<option" + (c && c.dia === d ? " selected" : "") + ">" + d + "</option>"; }).join("");
    var rows = c ? c.piscinas.map(function (p, i) { return linhaPiscina(p, i ? BTN_REM_LINHA : ""); }).join("") : linhaPiscina({ nome: "Principal" });
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Cadastro</div><h1>' + (c ? "Editar cliente" : "Novo cliente") + "</h1>" + (c ? '<div class="muted">' + esc(c.nome) + "</div>" : "") + "</div>" +
      (c ? '<button class="btn ghost" type="button" data-abrir-cliente="' + c.id + '">Voltar ao cliente</button>' : '<a class="btn ghost" href="#clientes">Voltar para clientes</a>') + "</div>" +
      '<form class="card pad form" id="form-cliente" novalidate>' +
      '<div class="form-sec"><h2>Cliente</h2>' +
      '<div class="row2">' +
      '<div class="field"><label for="f-nome">Nome do cliente ou local</label><input class="input" id="f-nome" autocomplete="off" placeholder="Ex.: Condomínio Jardim União" maxlength="80"' + val(c && c.nome) + "></div>" +
      '<div class="field"><label for="f-contato">Como chamar no WhatsApp</label><input class="input" id="f-contato" autocomplete="off" placeholder="Ex.: Sr. Paulo" maxlength="40"' + val(c && c.primeiro) + '><span class="hint">Se ficar vazio, uso o primeiro nome.</span></div>' +
      "</div>" +
      '<div class="row2">' +
      '<div class="field"><label for="f-tel">WhatsApp</label><input class="input" id="f-tel" type="tel" inputmode="tel" placeholder="(31) 9 9999-9999" maxlength="20"' + val(c && c.tel) + "></div>" +
      '<div class="field"><label for="f-bairro">Bairro</label><input class="input" id="f-bairro" autocomplete="off" placeholder="Ex.: Cidade Nova" maxlength="60"' + val(c && c.bairro) + "></div>" +
      "</div>" +
      '<div class="field"><label for="f-end">Endereço <span class="muted" style="font-weight:400">(opcional)</span></label><input class="input" id="f-end" autocomplete="off" placeholder="Rua, número, complemento" maxlength="120"' + val(c && c.endereco) + "></div>" +
      "</div>" +
      '<div class="form-sec"><h2>Visita fixa e mensalidade</h2>' +
      '<div class="row3 sched">' +
      '<div class="field"><label for="f-dia">Dia da semana</label><select class="input" id="f-dia">' + dias + "</select></div>" +
      '<div class="field"><label for="f-ini">Chega às</label><input class="input num" id="f-ini" type="time" step="300"' + val(ini) + "></div>" +
      '<div class="field"><label for="f-fim">Sai às</label><input class="input num" id="f-fim" type="time" step="300"' + val(fim) + "></div>" +
      "</div>" +
      '<div class="field" style="max-width:260px"><label for="f-mensal">Mensalidade (R$)</label><input class="input num" id="f-mensal" inputmode="decimal" placeholder="280,00"' + val(c && c.mensal.toFixed(2).replace(".", ",")) + "></div>" +
      (c ? '<span class="hint">Mudar o dia ou o horário vale a partir de hoje. As visitas já feitas continuam no histórico.</span>' : '<span class="hint">A primeira mensalidade vence hoje; as próximas, todo dia ' + VENCIMENTO + ".</span>") +
      "</div>" +
      '<div class="form-sec"><h2>Piscinas</h2>' +
      '<span class="hint" style="margin-top:-8px">Condomínio, pousada ou casa com piscina infantil? Adicione uma linha para cada piscina.</span>' +
      '<div class="pool-rows" id="pool-rows">' + rows + "</div>" +
      '<div><button class="btn ghost sm" type="button" data-add-row>+ Adicionar outra piscina</button></div>' +
      "</div>" +
      '<p class="form-err" id="form-err" role="alert" hidden></p>' +
      '<button class="btn block" type="submit">' + (c ? "Salvar alterações" : "Salvar cliente") + "</button>" +
      "</form></section>";
  }
  function salvarCliente(form) {
    var erros = [], primeiro = null;
    function req(id, valido, msg) { var el = $(id, form); marcarErro(el, !valido); if (!valido) { erros.push(msg); primeiro = primeiro || el; } return el.value.trim(); }
    var nome = req("#f-nome", !!$("#f-nome", form).value.trim(), "nome");
    var bairro = req("#f-bairro", !!$("#f-bairro", form).value.trim(), "bairro");
    var dia = req("#f-dia", !!$("#f-dia", form).value, "dia da visita");
    var ini = $("#f-ini", form).value, fim = $("#f-fim", form).value;
    req("#f-ini", !!ini, "horário de chegada");
    req("#f-fim", !!fim && (!ini || fim > ini), fim && ini && fim <= ini ? "saída depois da chegada" : "horário de saída");
    var mensal = parseNum($("#f-mensal", form).value);
    req("#f-mensal", mensal !== null && mensal > 0, "mensalidade");
    var piscinas = lerPiscinas($("#pool-rows", form), 0);
    if (!piscinas) { erros.push("volume da piscina"); primeiro = primeiro || $('#pool-rows [aria-invalid="true"]', form); }

    var errEl = $("#form-err", form);
    if (erros.length) {
      errEl.textContent = "Confira: " + erros.join(", ") + ".";
      errEl.hidden = false;
      if (primeiro) primeiro.focus();
      return;
    }
    var dados = {
      nome: nome, primeiro: $("#f-contato", form).value.trim() || nome.split(" ")[0],
      tel: $("#f-tel", form).value.trim(), endereco: $("#f-end", form).value.trim(),
      bairro: bairro, dia: dia, janela: ini.replace(":", "h") + "–" + fim.replace(":", "h"),
      piscinas: piscinas, mensal: mensal
    };
    var c = estado.editando && porId[estado.editando], msg;
    if (c) {
      Object.keys(dados).forEach(function (k) { c[k] = dados[k]; });
      msg = "Alterações de " + c.nome + " salvas";
    } else {
      c = dados; c.id = "c" + (++seqCliente); c.pago = false; c.hist = []; c.desde = CHAVE_HOJE;
      clientes.push(c); porId[c.id] = c;
      msg = c.nome + " cadastrado" + (dia === HOJE ? " e incluído na rota de hoje" : " · primeira visita " + proximaTxt(c).split(" · ")[0]);
    }
    estado.editando = null; estado.clienteAberto = c.id; estado.busca = "";
    toast(msg);
    location.hash = "#clientes";
  }

  /* ---------- Painel ---------- */
  // Escala "redonda" com no máximo 5 divisões (passos 1, 2, 2,5 ou 5 × 10ⁿ; nunca menor que 1).
  function escalaTopo(max) {
    var base = Math.pow(10, Math.floor(Math.log10(max)));
    var passos = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10].map(function (m) { return Math.max(1, m * base); });
    for (var i = 0; i < passos.length; i++) {
      if (Math.ceil(max / passos[i]) <= 5) return { passo: passos[i], topo: Math.ceil(max / passos[i]) * passos[i] };
    }
    return { passo: max, topo: max };
  }
  // Gráfico de colunas em HTML. cols: [{rot, segs:[{v, cls}], tip, label, destaque}]; fmt formata os ticks.
  function grafColunas(cols, fmt, rotulo) {
    var max = Math.max.apply(null, cols.map(function (c) { return c.segs.reduce(function (s, g) { return s + g.v; }, 0); }));
    var e = escalaTopo(max || 1), ticks = "";
    for (var t = 0; t <= e.topo + 1e-9; t += e.passo) {
      ticks += '<div class="tick" style="bottom:' + (t / e.topo * 100) + '%"><span>' + fmt(t) + "</span></div>";
    }
    var barras = cols.map(function (c) {
      var tot = c.segs.reduce(function (s, g) { return s + g.v; }, 0);
      var segs = c.segs.slice().reverse().filter(function (g) { return g.v > 0; }).map(function (g) {
        return '<i class="seg ' + g.cls + '" style="flex:' + g.v + ' 1 0"></i>';
      }).join("");
      return '<div class="col' + (c.destaque ? " hl" : "") + '" tabindex="0" data-tip="' + esc(c.tip) + '" aria-label="' + esc(c.tip.replace(/\n/g, ", ")) + '">' +
        '<div class="col-bar" style="height:' + (tot / e.topo * 100) + '%">' +
        (c.label ? '<span class="col-val">' + c.label + "</span>" : "") + segs + "</div></div>";
    }).join("");
    var eixo = cols.map(function (c) { return "<span" + (c.destaque ? ' class="hl"' : "") + ">" + c.rot + "</span>"; }).join("");
    return '<div class="chart" role="group" aria-label="' + esc(rotulo) + '"><div class="plot">' + ticks + '<div class="cols">' + barras + "</div></div>" +
      '<div class="x-axis">' + eixo + "</div></div>";
  }
  function tabelaDados(cab, linhas) {
    return '<details class="chart-table"><summary>Ver como tabela</summary><div class="table-wrap"><table><thead><tr>' +
      cab.map(function (h, i) { return "<th" + (i ? ' class="r"' : "") + ">" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      linhas.map(function (l) { return "<tr>" + l.map(function (v, i) { return "<td" + (i ? ' class="num r"' : "") + ">" + v + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div></details>";
  }
  function kpi(rotulo, valor, sub, href) {
    return '<a class="card stat kpi" href="' + href + '"><span class="muted">' + rotulo + "</span><b>" + valor + '</b><span class="kpi-sub">' + sub + "</span></a>";
  }
  function telaPainel() {
    var m = numerosMes(), previsto = m.recebido + m.aberto, pct = previsto ? Math.round(m.recebido / previsto * 100) : 0;
    var rota = rotaHoje(), feitas = rota.filter(function (v) { return v.st === "feita"; }).length;
    var pendentes = rota.filter(function (v) { return v.st === "pendente"; });
    var prox = pendentes[0];
    var nPisc = clientes.reduce(function (s, c) { return s + c.piscinas.length; }, 0);
    var m3 = clientes.reduce(function (s, c) { return s + volTotal(c); }, 0);

    // Semana: visitas fixas por dia (mesma agenda do calendário)
    var semana = DIAS.map(function (d) {
      var cs = clientes.filter(function (c) { return c.dia === d; });
      return { d: d, n: cs.length, min: cs.reduce(function (s, c) { return s + minutos(c.janela); }, 0), m3: cs.reduce(function (s, c) { return s + volTotal(c); }, 0) };
    });
    var livres = semana.filter(function (s) { return s.d !== "Sábado"; }).sort(function (a, b) { return a.min - b.min; })[0];
    var gSemana = grafColunas(semana.map(function (s) {
      return { rot: DIA_CURTO[s.d] + (s.d === HOJE ? " · hoje" : ""), destaque: s.d === HOJE, label: s.d === HOJE ? String(s.n) : "",
        segs: [{ v: s.n, cls: "s1" }],
        tip: s.d + "\n" + plural(s.n, "visita", "visitas") + " · " + horasTxt(s.min) + " em piscina\n" + dec(s.m3) + " m³ de água" };
    }), function (t) { return String(t); }, "Visitas por dia da semana");

    // Faturamento: calculado das mensalidades dos clientes ativos em cada mês
    var fat = faturamento(), anterior = fat[fat.length - 2];
    var gFat = grafColunas(fat.map(function (f) {
      var tot = f.recebido + f.aberto;
      return f.atual
        ? { rot: f.rot, destaque: true, label: milTxt(tot), segs: [{ v: f.recebido, cls: "s1" }, { v: f.aberto, cls: "s2" }],
            tip: maiusc(f.nome) + " (previsto " + brl(tot) + ")\nRecebido " + brl(f.recebido) + "\nA receber " + brl(f.aberto) }
        : { rot: f.rot, segs: [{ v: f.recebido, cls: "s1" }], tip: maiusc(f.nome) + "\nRecebido " + brl(f.recebido) };
    }), function (t) { return t ? milTxt(t).replace(",0", "") : "0"; }, "Faturamento por mês");
    var cresc = anterior.recebido ? Math.round((previsto / anterior.recebido - 1) * 100) : 0;
    var chipCresc = cresc === 0 ? '<span class="chip">= ' + anterior.nome + "</span>"
      : '<span class="chip ' + (cresc > 0 ? "ok" : "warn") + '">' + (cresc > 0 ? "▲ " : "▼ ") + Math.abs(cresc) + "% vs " + anterior.nome + "</span>";

    // Atenção na água: última visita fora do ideal
    var alertas = clientes.filter(function (c) { return c.hist.length && !ultimaOk(c); });
    var linhasAlerta = alertas.map(function (c) {
      var probs = [];
      ultimoDia(c).filter(function (h) { return !leituraOk(h); }).forEach(function (h) {
        var pre = c.piscinas.length > 1 ? esc(h.piscina) + ": " : "";
        if (!dentro("cloro", h.cloro)) probs.push(pre + "Cloro " + n1(h.cloro) + " ppm " + (h.cloro < FAIXAS.cloro.min ? "baixo" : "alto"));
        if (!dentro("ph", h.ph)) probs.push(pre + "pH " + n1(h.ph) + " " + (h.ph < FAIXAS.ph.min ? "baixo" : "alto"));
      });
      return '<div class="lrow"><div class="who"><b>' + esc(c.nome) + "</b><span>" + probs.join(" · ") + " · visita " + ddmm(c.hist[0].data) + " · próxima " + proximaTxt(c).split(" · ")[0].toLowerCase() + "</span></div>" +
        '<button class="btn ghost sm" type="button" data-abrir-cliente="' + c.id + '">Ver cliente</button></div>';
    }).join("") || '<p class="muted" style="margin:0">Tudo dentro do ideal nas últimas visitas.</p>';

    var linhasRota = pendentes.map(function (v) {
      var c = v.c;
      return '<div class="lrow"><time class="num">' + horaItem(v) + '</time><div class="who"><b>' + esc(c.nome) + "</b><span>" + esc(c.bairro) + " · " + pisTxt(c) + "</span></div>" +
        '<button class="btn sm" type="button" data-registrar="' + c.id + '">Registrar</button></div>';
    }).join("") || '<p class="muted" style="margin:0">Rota de hoje concluída.</p>';

    var linhasAberto = m.abertosL.slice().sort(function (a, b) { return b.mensal - a.mensal; }).slice(0, 5).map(function (c) {
      return '<div class="lrow"><div class="who"><b>' + esc(c.nome) + "</b><span>" + vencTxt(c) + '</span></div><span class="num">' + brl(c.mensal) + "</span>" +
        '<button class="btn ghost sm" type="button" data-pagar="' + c.id + '" title="Marcar como pago" aria-label="Marcar ' + esc(c.nome) + ' como pago">Pago</button></div>';
    }).join("") || '<p class="muted" style="margin:0">Nenhuma mensalidade em aberto.</p>';

    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Visão geral · ' + dataLonga(HOJE_DATA) + "</div><h1>Painel</h1></div><span class=\"chip pool\">" + maiusc(MES_ATUAL) + "</span></div>" +
      '<div class="kpis">' +
      kpi("Recebido em " + MES_ATUAL, brl(m.recebido), pct + "% do previsto · " + m.pagos + " de " + m.total + " pagos", "#mensalidades") +
      kpi("A receber", brl(m.aberto), plural(m.abertos, "mensalidade em aberto", "mensalidades em aberto") + (m.vencidos ? (m.vencidos === m.abertos ? " · " + (m.abertos === 1 ? "vencida" : "todas vencidas") : " · " + m.vencidos + " vencida" + (m.vencidos === 1 ? "" : "s")) : ""), "#mensalidades") +
      kpi("Visitas hoje", feitas + " de " + rota.length, prox ? "Próxima: " + horaItem(prox) + " · " + esc(prox.c.nome) : "Rota concluída", "#hoje") +
      kpi("Piscinas atendidas", String(nPisc), dec(m3) + " m³ de água · " + plural(clientes.length, "cliente", "clientes"), "#clientes") +
      "</div>" +
      '<div class="grid2">' +
      '<div class="card pad chart-card"><div class="card-head"><div><h2>Visitas por dia da semana</h2><span class="muted">Agenda fixa dos clientes</span></div></div>' + gSemana +
      '<p class="chart-note">Dia mais leve: <b>' + livres.d.toLowerCase() + "</b> (" + plural(livres.n, "visita", "visitas") + ", " + horasTxt(livres.min) + "). Bom dia para encaixar cliente novo.</p>" +
      tabelaDados(["Dia", "Visitas", "Tempo", "Água (m³)"], semana.map(function (s) { return [s.d, s.n, horasTxt(s.min), dec(s.m3)]; })) + "</div>" +
      '<div class="card pad chart-card"><div class="card-head"><div><h2>Faturamento por mês</h2><span class="muted">Mensalidades dos clientes ativos, últimos 6 meses</span></div>' + chipCresc + "</div>" + gFat +
      '<div class="legend"><span><i class="sw s1"></i>Recebido · <b class="num">' + brl(m.recebido) + '</b></span><span><i class="sw s2"></i>A receber em ' + MES_ATUAL + ' · <b class="num">' + brl(m.aberto) + "</b></span></div>" +
      tabelaDados(["Mês", "Recebido", "A receber"], fat.map(function (f) { return [maiusc(f.nome), brl(f.recebido), f.atual ? brl(f.aberto) : "—"]; })) + "</div>" +
      "</div>" +
      '<div class="grid3">' +
      '<div class="card pad list-card"><div class="card-head"><h2>Próximas paradas</h2><span class="chip warn">' + plural(pendentes.length, "pendente", "pendentes") + "</span></div>" + linhasRota + "</div>" +
      '<div class="card pad list-card"><div class="card-head"><h2>Atenção na água</h2>' + (alertas.length ? '<span class="chip warn">⚠ ' + alertas.length + " fora do ideal</span>" : '<span class="chip ok">✓ tudo ok</span>') + "</div>" + linhasAlerta + "</div>" +
      '<div class="card pad list-card"><div class="card-head"><h2>Em aberto</h2><a class="link" href="#mensalidades">Ver todas</a></div>' + linhasAberto + "</div>" +
      "</div></section>";
  }

  /* ---------- Calendário ---------- */
  function calCelula(d, noMes) {
    var k = chaveData(d);
    if (!noMes) return '<div class="cal-day fora" aria-hidden="true"><span class="cal-num">' + d.getDate() + "</span></div>";
    var vs = visitasDoDia(k), cls = "cal-day";
    if (k === CHAVE_HOJE) cls += " hoje";
    if (k < CHAVE_HOJE) cls += " passado";
    if (k === estado.calDia) cls += " sel";
    var evs = vs.slice(0, 3).map(function (v) {
      var t = horaItem(v) + " " + esc(v.c.nome);
      return '<span class="cal-ev ' + v.st + '" title="' + t + " · " + v.st + (v.extra ? " (extra)" : "") + '">' + t + "</span>";
    }).join("") + (vs.length > 3 ? '<span class="cal-more">+' + (vs.length - 3) + " mais</span>" : "");
    var venc = d.getDate() === VENCIMENTO;
    var rotulo = d.getDate() + " de " + MESES[d.getMonth()] + ", " + (vs.length ? plural(vs.length, "visita", "visitas") : "sem visitas") + (venc ? ", vencimento das mensalidades" : "");
    return '<button type="button" class="' + cls + '" data-dia="' + k + '" aria-pressed="' + (k === estado.calDia) + '" aria-label="' + rotulo + '">' +
      '<span class="cal-top"><span class="cal-num">' + d.getDate() + "</span>" + (venc ? '<span class="cal-flag" title="Vencimento das mensalidades">Venc.</span>' : "") + "</span>" +
      evs + (vs.length ? '<span class="cal-count">' + vs.length + "</span>" : "") + "</button>";
  }
  function painelDia(k) {
    var d = deChave(k), vs = visitasDoDia(k), m3 = 0, min = 0;
    vs.forEach(function (v) { m3 += volTotal(v.c); min += minutos(v.c.janela); });
    var chipDia = k === CHAVE_HOJE ? '<span class="chip pool">Hoje</span>' : k < CHAVE_HOJE ? '<span class="chip">Passado</span>' : "";
    var venc = "";
    if (d.getDate() === VENCIMENTO) {
      var m = numerosMes(), atual = d.getMonth() === HOJE_DATA.getMonth() && d.getFullYear() === HOJE_DATA.getFullYear();
      venc = '<div class="cal-venc"><b>Vencimento das mensalidades</b>' +
        (atual ? "<span>" + m.abertos + " em aberto · " + brl(m.aberto) + ' · <a class="link" href="#mensalidades">ver mensalidades</a></span>' : "<span>Todos os mensalistas vencem no dia " + VENCIMENTO + ".</span>") + "</div>";
    }
    var linhas = vs.map(function (v) {
      var c = v.c, det = esc(c.bairro) + " · " + pisTxt(c);
      if (v.rec) det += " · " + registrosEm(c, k).map(function (h) { return leituraTxt(c, h); }).join(" · ");
      if (v.extra) det += " · visita extra";
      var lado = v.st === "feita" ? '<span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">' + chipStatus(v) + '<button class="link-btn pool" type="button" data-ver="' + v.rec.id + '">Resumo</button></span>'
        : v.st === "pendente" ? '<button class="btn sm" type="button" data-registrar="' + c.id + '">Registrar</button>'
        : chipStatus(v);
      return '<div class="lrow"><time class="num">' + horaItem(v) + '</time><div class="who"><b>' + esc(c.nome) + "</b><span>" + det + "</span></div>" + lado + "</div>";
    }).join("") || '<p class="muted" style="margin:0">' + (d.getDay() === 0 ? "Domingo: sem visitas fixas." : k < CHAVE_HOJE ? "Nenhuma visita registrada neste dia." : "Nenhuma visita fixa neste dia.") + "</p>";
    return '<div class="card pad list-card cal-day-panel" id="cal-dia"><div class="card-head"><div><h2>' + dataLonga(d) + "</h2>" +
      '<span class="muted">' + (vs.length ? plural(vs.length, "visita", "visitas") + " · " + horasTxt(min) + " · " + dec(m3) + " m³" : "Dia livre") + "</span></div>" + chipDia + "</div>" +
      venc + linhas + "</div>";
  }
  function telaCalendario() {
    var ano = estado.calAno, mes = estado.calMes;
    var primeiro = new Date(ano, mes, 1), offset = (primeiro.getDay() + 6) % 7, dim = new Date(ano, mes + 1, 0).getDate();
    var total = Math.ceil((offset + dim) / 7) * 7, cel = "", nMes = 0;
    for (var i = 0; i < total; i++) {
      var d = new Date(ano, mes, 1 - offset + i), noMes = d.getMonth() === mes;
      if (noMes) nMes += visitasDoDia(chaveData(d)).length;
      cel += calCelula(d, noMes);
    }
    var cab = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(function (s) { return "<span>" + s + "</span>"; }).join("");
    var noMesAtual = ano === HOJE_DATA.getFullYear() && mes === HOJE_DATA.getMonth();
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Agenda fixa · ' + plural(nMes, "visita", "visitas") + " no mês</div><h1>" + maiusc(MESES[mes]) + " de " + ano + "</h1></div>" +
      '<div class="cal-nav"><button class="btn ghost sm" type="button" data-cal-mes="-1" aria-label="Mês anterior"><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="btn ghost sm" type="button" data-cal-hoje' + (noMesAtual && estado.calDia === CHAVE_HOJE ? " disabled" : "") + ">Hoje</button>" +
      '<button class="btn ghost sm" type="button" data-cal-mes="1" aria-label="Próximo mês"><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button></div></div>' +
      '<div class="cal-wrap"><div class="card cal"><div class="cal-head" aria-hidden="true">' + cab + '</div><div class="cal-grid">' + cel + "</div>" +
      '<div class="cal-legend"><span><i class="cal-dot feita"></i>Feita</span><span><i class="cal-dot pendente"></i>Pendente</span><span><i class="cal-dot agendada"></i>Agendada</span><span><b class="cal-flag">Venc.</b> mensalidades</span></div></div>' +
      painelDia(estado.calDia) + "</div>" +
      '<p class="muted" style="margin:0">Dias passados mostram as visitas registradas; hoje e os próximos dias seguem o dia e horário fixos de cada cliente.</p>' +
      "</section>";
  }

  /* ---------- Mensalidades ---------- */
  function telaMensalidades() {
    var nm = numerosMes(), pctP = nm.total ? Math.round(nm.pagos / nm.total * 100) : 0;
    var linhas = clientes.slice().sort(function (a, b) { return a.pago - b.pago || (a.nome < b.nome ? -1 : 1); }).map(function (c) {
      return '<div class="stop"><span class="chip ' + (c.pago ? "ok" : "warn") + '">' + (c.pago ? "Pago" : "Em aberto") + "</span>" +
        '<div class="who"><b>' + esc(c.nome) + "</b><span>" + esc(c.bairro) + " · " + (c.pago ? "vencimento dia " + VENCIMENTO : vencTxt(c)) + "</span></div>" +
        '<div class="act" style="display:flex;gap:10px;align-items:center"><span class="num">' + brl(c.mensal) + "</span>" +
        (c.pago ? "" : '<button class="btn ghost" type="button" data-pagar="' + c.id + '">Marcar como pago</button>') + "</div></div>";
    }).join("");
    return '<section class="view">' +
      '<div class="view-head"><div><div class="eyebrow">Mensalistas · vencimento todo dia ' + VENCIMENTO + "</div><h1>" + maiusc(MES_ATUAL) + "</h1></div><span class=\"chip\">" + plural(nm.total, "mensalista", "mensalistas") + "</span></div>" +
      '<div class="day-summary">' +
      '<div class="card stat"><span class="muted">Pagos</span><b>' + nm.pagos + "</b></div>" +
      '<div class="card stat"><span class="muted">Em aberto</span><b>' + nm.abertos + "</b></div>" +
      '<div class="card stat"><span class="muted">Mensalistas</span><b>' + nm.total + "</b></div></div>" +
      '<div class="card pad" style="display:grid;gap:10px">' +
      '<div class="bar" role="img" aria-label="' + pctP + '% pagos"><i style="width:' + pctP + '%"></i><i style="width:' + (100 - pctP) + '%"></i></div>' +
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><span>Recebido: <b class="num">' + brl(nm.recebido) + '</b></span><span>Em aberto: <b class="num">' + brl(nm.aberto) + "</b></span></div></div>" +
      '<div class="card route">' + linhas + "</div>" +
      '<p class="muted" style="margin:0">Os pagamentos podem ser marcados à mão ou, se fizer sentido, cobrados com lembrete e Pix.</p>' +
      "</section>";
  }

  /* ---------- Render e eventos ---------- */
  var TELAS = {
    painel: telaPainel, hoje: telaHoje, calendario: telaCalendario, visita: telaVisita, resumo: telaResumo,
    clientes: telaClientes, mensalidades: telaMensalidades, "novo-cliente": telaFormCliente, "editar-cliente": telaFormCliente
  };
  function resetarGuia(r) {
    if (r === "clientes") { estado.clienteAberto = null; estado.busca = ""; estado.editando = null; }
    if (r === "visita") { estado.clienteVisita = clientePadraoVisita(); estado.piscinaVisita = 0; estado.fotos = []; }
    if (r === "resumo") estado.resumoId = null;
    if (r === "calendario") { estado.calAno = HOJE_DATA.getFullYear(); estado.calMes = HOJE_DATA.getMonth(); estado.calDia = CHAVE_HOJE; }
  }
  function rotaAtual() {
    var h = location.hash.replace("#", "");
    if (h === "editar-cliente" && !porId[estado.editando]) return "clientes";
    return TELAS[h] ? h : "painel";
  }
  function render(foco) {
    var r = rotaAtual();
    if (r === "novo-cliente") estado.editando = null;
    $("#main").innerHTML = TELAS[r]();
    marcarNav(r === "novo-cliente" || r === "editar-cliente" ? "clientes" : r);
    if ((r === "novo-cliente" || r === "editar-cliente") && foco) { var n = $("#f-nome"); if (n) n.focus(); }
    if (r === "visita") ["cloro", "ph", "alc"].forEach(atualizarDica);
    if (foco) { window.scrollTo(0, 0); }
  }
  function irPara(hash) { if (location.hash === hash) render(true); else location.hash = hash; }

  document.addEventListener("click", function (e) {
    // Menu "Mais" do celular
    var bm = e.target.closest("[data-mais]");
    if (bm) { menuMais(bm.getAttribute("aria-expanded") !== "true"); return; }
    if (!e.target.closest("#mais-menu")) menuMais(false);
    else if (e.target.closest("a[data-r]")) menuMais(false);
    // Calendário
    var cd = e.target.closest("[data-dia]");
    if (cd) {
      estado.calDia = cd.dataset.dia; render();
      var pn = $("#cal-dia"); if (pn && window.innerWidth <= 1100) pn.scrollIntoView({ block: "nearest", behavior: "smooth" });
      var foco = $('[data-dia="' + estado.calDia + '"]'); if (foco) foco.focus({ preventScroll: true });
      return;
    }
    var cm = e.target.closest("[data-cal-mes]");
    if (cm) {
      var nd = new Date(estado.calAno, estado.calMes + (+cm.dataset.calMes), 1);
      estado.calAno = nd.getFullYear(); estado.calMes = nd.getMonth();
      estado.calDia = nd.getFullYear() === HOJE_DATA.getFullYear() && nd.getMonth() === HOJE_DATA.getMonth() ? CHAVE_HOJE : chaveData(nd);
      render(); return;
    }
    if (e.target.closest("[data-cal-hoje]")) { resetarGuia("calendario"); render(); return; }
    var id = e.target.closest("[data-ir-dia]");
    if (id) { var dd = deChave(id.dataset.irDia); estado.calAno = dd.getFullYear(); estado.calMes = dd.getMonth(); estado.calDia = id.dataset.irDia; irPara("#calendario"); return; }
    // Abrir cliente, editar, ver resumo de uma visita
    var ab = e.target.closest("[data-abrir-cliente]");
    if (ab) { estado.clienteAberto = ab.dataset.abrirCliente; estado.busca = ""; estado.editando = null; irPara("#clientes"); return; }
    var ed = e.target.closest("[data-editar]");
    if (ed) { estado.editando = ed.dataset.editar; irPara("#editar-cliente"); return; }
    var ver = e.target.closest("[data-ver]");
    if (ver) { estado.resumoId = ver.dataset.ver; irPara("#resumo"); return; }
    var tb = e.target.closest("[data-tema]");
    if (tb) { aplicarTema(tb.dataset.tema); return; }
    // Clicar numa guia do menu sempre abre a tela inicial dela, sem o que estava aberto antes.
    var guia = e.target.closest(".nav a[data-r], .tabbar a[data-r]");
    if (guia) {
      resetarGuia(guia.dataset.r);
      if (rotaAtual() === guia.dataset.r) { e.preventDefault(); render(true); }
      return;
    }
    // "Voltar para clientes" e "Fechar" no detalhe: lista de clientes.
    if (e.target.closest('a[href="#clientes"]') || e.target.closest("[data-fechar]")) {
      resetarGuia("clientes");
      if (rotaAtual() === "clientes") { e.preventDefault(); render(true); }
      return;
    }
    var b = e.target.closest("[data-registrar]");
    if (b) { estado.clienteVisita = b.dataset.registrar; estado.piscinaVisita = 0; estado.fotos = []; irPara("#visita"); return; }
    if (e.target.closest("[data-add-row]")) {
      var box = $("#pool-rows");
      box.insertAdjacentHTML("beforeend", linhaPiscina({ nome: "" }, BTN_REM_LINHA));
      box.lastElementChild.querySelector('[data-p="nome"]').focus();
      return;
    }
    var rr = e.target.closest("[data-rem-row]");
    if (rr) { rr.closest("[data-pool-row]").remove(); return; }
    var rp = e.target.closest("[data-rem-piscina]");
    if (rp) {
      var dono = porId[estado.clienteAberto], idx = +rp.dataset.remPiscina, alvo = dono.piscinas[idx];
      if (dono.piscinas.length > 1 && window.confirm("Remover a piscina \"" + alvo.nome + "\" de " + dono.nome + "?")) {
        dono.piscinas.splice(idx, 1); toast("Piscina " + alvo.nome + " removida"); render();
      }
      return;
    }
    var pg = e.target.closest("[data-pagar]");
    if (pg) { porId[pg.dataset.pagar].pago = true; toast("Pagamento de " + porId[pg.dataset.pagar].nome + " marcado"); render(); return; }
    var tr = e.target.closest("tr[data-cliente]");
    if (tr) { estado.clienteAberto = tr.dataset.cliente; render(); var d = $("#detalhe"); if (d) d.scrollIntoView({ block: "nearest" }); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("#mais-menu") && !$("#mais-menu").hidden) { menuMais(false); $("[data-mais]").focus(); return; }
    var tr = e.target.closest && e.target.closest("tr[data-cliente]");
    if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tr.click(); }
  });
  document.addEventListener("input", function (e) {
    if (e.target.dataset && e.target.dataset.faixa) atualizarDica(e.target.dataset.faixa);
    if (e.target.getAttribute && e.target.getAttribute("aria-invalid") === "true" && e.target.value) marcarErro(e.target, false);
    if (e.target.id === "f-busca") {
      estado.busca = e.target.value; var pos = e.target.selectionStart;
      render(); var i = $("#f-busca"); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (err) {} }
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "f-cliente") { estado.clienteVisita = e.target.value; estado.piscinaVisita = 0; estado.fotos = []; render(); }
    if (e.target.id === "f-piscina") estado.piscinaVisita = +e.target.value;
    if (e.target.getAttribute && e.target.getAttribute("aria-invalid") === "true" && e.target.value) marcarErro(e.target, false);
    if (e.target.id === "f-foto") {
      var files = Array.prototype.slice.call(e.target.files || []).slice(0, 6);
      var lidos = 0;
      files.forEach(function (f) {
        var rd = new FileReader();
        rd.onload = function () { estado.fotos.push(rd.result); lidos++; if (lidos === files.length) render(); };
        rd.readAsDataURL(f);
      });
    }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "form-cliente") { e.preventDefault(); salvarCliente(e.target); return; }
    if (e.target.id === "form-piscina") {
      e.preventDefault();
      var dono = porId[estado.clienteAberto], novas = lerPiscinas(e.target, dono.piscinas.length);
      if (!novas) { $('[aria-invalid="true"]', e.target).focus(); return; }
      dono.piscinas = dono.piscinas.concat(novas);
      toast("Piscina " + novas[0].nome + " adicionada a " + dono.nome); render();
      return;
    }
    if (e.target.id === "form-visita") { e.preventDefault(); salvarVisita(); }
  });
  window.addEventListener("hashchange", function () { esconderTip(); render(true); });

  /* ---------- Tooltip dos gráficos (mouse, toque e teclado) ---------- */
  var tip = document.createElement("div");
  tip.className = "tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  document.body.appendChild(tip);
  function mostrarTip(el) {
    tip.textContent = el.dataset.tip; tip.hidden = false;
    var r = el.querySelector(".col-bar") ? el.querySelector(".col-bar").getBoundingClientRect() : el.getBoundingClientRect();
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var y = r.top - h - 10; if (y < 8) y = r.bottom + 10;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function esconderTip() { tip.hidden = true; }
  document.addEventListener("mouseover", function (e) { var el = e.target.closest && e.target.closest("[data-tip]"); if (el) mostrarTip(el); });
  document.addEventListener("mouseout", function (e) { var el = e.target.closest && e.target.closest("[data-tip]"); if (el && !el.contains(e.relatedTarget)) esconderTip(); });
  document.addEventListener("focusin", function (e) { if (e.target.dataset && e.target.dataset.tip) mostrarTip(e.target); });
  document.addEventListener("focusout", function (e) { if (e.target.dataset && e.target.dataset.tip) esconderTip(); });
  window.addEventListener("scroll", esconderTip, { passive: true });

  montarNav();
  montarTema();
  render();
})();
