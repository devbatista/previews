(() => {
  const PHONE = "5531994443572";
  const wa = msg => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
  document.querySelectorAll("a.wa").forEach(a => a.href = wa(a.dataset.msg || "Oi Eduardo! Vim pelo site e queria um orçamento."));

  const CASES = {
    verde: { title: "Piscina verde tem jeito.", text: "Quase sempre é alga: o cloro acabou ou o pH saiu do lugar, e com o calor ela se espalha rápido. Faço o tratamento de choque, espero decantar e aspiro até a água aparecer.", link: "#agua-verde", service: "Recuperação de piscina verde", msg: "Oi Eduardo! Vim pelo site, minha piscina está verde. Pode me passar um orçamento?" },
    turva: { title: "Água turva é o aviso antes do verde.", text: "Costuma ser pH ou alcalinidade fora do ideal, pouco cloro ou o filtro saturado. Meço a água, corrijo e confiro o filtro. Quanto antes tratar, menos produto você gasta.", link: "#tratamento", service: "Análise e tratamento da água", msg: "Oi Eduardo! Vim pelo site, minha piscina está turva. Pode me passar um orçamento?" },
    fundo: { title: "Hora de uma aspiração caprichada.", text: "Folhas, terra e aquele \"tapete\" no fundo vêm do vento, da chuva e de alguns dias sem limpeza. Peneiro, escovo e aspiro o fundo inteiro.", link: "#limpeza", service: "Limpeza avulsa", msg: "Oi Eduardo! Vim pelo site, minha piscina está com sujeira no fundo. Pode me passar um orçamento?" },
    ok: { title: "Então é só manter assim.", text: "Manter sai mais em conta que recuperar. Com uma visita por semana, a água não chega a ficar verde e você recebe o resumo de cada visita no WhatsApp.", link: "#manutencao", service: "Manutenção semanal", msg: "Oi Eduardo! Vim pelo site e queria saber do plano mensal de manutenção." }
  };
  const $ = id => document.getElementById(id);
  function show(k) {
    const c = CASES[k];
    $("r-title").textContent = c.title; $("r-text").textContent = c.text;
    $("r-link").textContent = c.service; $("r-link").href = c.link;
    $("r-send").href = wa(c.msg);
  }
  document.querySelectorAll('input[name="pick"]').forEach(r => r.addEventListener("change", () => show(r.value)));
  show(document.querySelector('input[name="pick"]:checked').value);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.querySelectorAll("video").forEach(v => { v.removeAttribute("autoplay"); v.pause(); });
  const video = $("reel"), btn = $("reel-btn");
  const icons = { pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>', play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z"/></svg>' };
  const sync = () => { btn.innerHTML = video.paused ? icons.play : icons.pause; btn.setAttribute("aria-label", video.paused ? "Tocar vídeo" : "Pausar vídeo"); };
  btn.addEventListener("click", () => video.paused ? video.play().catch(() => {}) : video.pause());
  video.addEventListener("play", sync); video.addEventListener("pause", sync); sync();

  // Resultado com transição
  const result = $("result");
  document.querySelectorAll('input[name="pick"]').forEach(r => r.addEventListener("change", () => { result.classList.remove("flash"); void result.offsetWidth; result.classList.add("flash"); }));

  // Atalho ativo dos serviços
  const chips = [...document.querySelectorAll(".chips-nav a")];
  const targets = chips.map(a => document.querySelector(a.getAttribute("href")));
  const setOn = id => chips.forEach(a => { const on = a.getAttribute("href") === "#" + id; a.classList.toggle("on", on); if (on && a.scrollIntoView && innerWidth < 880) a.parentElement.scrollTo({ left: a.offsetLeft - 20, behavior: "smooth" }); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setOn(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(t => t && io.observe(t));
  }
  setOn("manutencao");

  // Botão flutuante depois da abertura
  const fab = $("fab"), hero = document.querySelector(".hero"), contact = $("contato");
  const toggleFab = () => {
    const past = hero.getBoundingClientRect().bottom < 0;
    const atContact = contact.getBoundingClientRect().top < innerHeight * .7 && contact.getBoundingClientRect().bottom > 0;
    fab.classList.toggle("show", past && !atContact);
  };
  addEventListener("scroll", toggleFab, { passive: true }); toggleFab();

  // Pontinhos do carrossel
  const track = document.querySelector(".cards"), dotsBox = $("dots");
  const cards = [...track.children];
  cards.forEach((c, i) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Avaliação " + (i + 1)); b.addEventListener("click", () => track.scrollTo({ left: c.offsetLeft - track.offsetLeft - 20, behavior: "smooth" })); dotsBox.append(b); });
  const syncDots = () => { const mid = track.scrollLeft + track.clientWidth / 2; let k = 0; cards.forEach((c, i) => { if (c.offsetLeft - track.offsetLeft <= mid) k = i; }); [...dotsBox.children].forEach((d, i) => d.classList.toggle("on", i === k)); };
  track.addEventListener("scroll", syncDots, { passive: true }); syncDots();
})();
