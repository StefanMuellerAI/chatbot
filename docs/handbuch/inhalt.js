// Baut das Inhaltsverzeichnis aus den Teilen und Kapiteln (Seitenzahlen setzt erstellen.mjs über window.__PAGES)
// und trägt den Stand (Monat und Jahr) auf dem Deckblatt ein.
(function () {
  document.getElementById("stand").textContent = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date());
  const toc = document.getElementById("toc");
  const pages = window.__PAGES || {};
  const entry = (cls, id, num, text) => {
    const li = document.createElement("li");
    li.className = cls;
    li.innerHTML = `<span class="n">${num}</span><a href="#${id}">${text}</a><span class="fill"></span><span class="pg">${pages[id] ?? ""}</span>`;
    toc.appendChild(li);
  };
  for (const el of document.querySelectorAll("section.part, h2[id]")) {
    if (el.matches("section.part")) {
      entry("tp", el.id, el.querySelector(".kicker").textContent.replace("Teil ", ""), el.querySelector("h1").textContent);
    } else {
      const num = el.querySelector(".num").textContent;
      entry("tc", el.id, num, el.textContent.replace(num, "").trim());
    }
  }
  window.__TOC = [...document.querySelectorAll("section.part, h2[id]")].map((el) => ({
    id: el.id,
    text: el.matches("section.part") ? el.querySelector("h1").textContent : el.textContent.replace(el.querySelector(".num").textContent, "").trim(),
    num: el.matches("section.part") ? null : el.querySelector(".num").textContent,
  }));
})();
