// Los crípticos de la leyenda (temporada-actual.html), para jugar. Cada uno es
// una frase con dos partes: la definición (un significado normal de la
// respuesta) y un juego de palabras que arma la misma respuesta con
// indicadores (esconde, revuelve, sin final…) y materiales (las palabras con
// las que se hace). Se responde en una casilla por letra, con pistas de
// significado, indicador, materiales y letras, la opción de rendirse y un
// resultado para compartir que no revela la palabra. Cada navegador recuerda
// cómo le fue (localStorage). Va antes de season-lore.js, que arma cada
// críptico con mountCipherGame().

const CIPHER_SHARE_URL = "https://eloctagono.online/temporada-actual.html";

// Solo letras de la A a la Z, en mayúscula y sin tildes ("ibízá " → "IBIZA").
function plainLetters(text) {
  return (text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
}

// Las pistas de texto, una vez cada una. Las de letra se piden aparte: ponen
// la siguiente letra desde el principio y paran una antes del final.
const CIPHER_TEXT_HINTS = [
  { key: "definition", label: "Significado", text: (c) => `La definición es «${c.definition}».` },
  { key: "indicator", label: "Indicador", text: (c) => c.indicator },
  { key: "materials", label: "Materiales", text: (c) => c.materials },
];

function readCipherState(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
}

function writeCipherState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Sin almacenamiento (ventana privada): se juega igual, solo no se recuerda.
  }
}

// root: el contenedor .cipher-game de un críptico. word: la respuesta tal
// como se muestra ("Ibiza"). cryptic: { clue, definition, indicator,
// materials, solution } (ver CRYPTICS en season-lore.js). solvedText(word):
// el mensaje al acertar. shareTitle: el encabezado del resultado para
// compartir. storageKey: dónde recuerda este navegador.
function mountCipherGame(root, { word, cryptic, solvedText, shareTitle, storageKey }) {
  const answer = plainLetters(word);
  const n = answer.length;
  const maxLetters = n - 1;
  const textKeys = CIPHER_TEXT_HINTS.map((h) => h.key);
  const saved = readCipherState(storageKey) || {};
  const state = {
    status: saved.status || "open", // open | solved | gaveup
    // Las pistas pedidas, en orden: claves de CIPHER_TEXT_HINTS o "letter".
    used: (saved.used || []).filter((k) => k === "letter" || textKeys.includes(k)),
    letters: Array.from({ length: n }, (_, i) => plainLetters((saved.letters || [])[i]).slice(0, 1)),
  };

  root.innerHTML = `
    <p class="cipher-clue">${cryptic.clue} <span class="cipher-length">(${n})</span></p>
    <div class="cipher-grid" role="group" aria-label="Tu respuesta, ${n} letras">
      ${Array.from({ length: n }, (_, i) => `<input class="cipher-box" inputmode="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Letra ${i + 1} de ${n}" />`).join("")}
    </div>
    <p class="cipher-status" role="status"></p>
    <div class="cipher-play">
      <button type="button" class="btn btn-block" data-act="check">Comprobar</button>
      <p class="cipher-hints-title"></p>
      <div class="cipher-hint-btns" role="group" aria-label="Pistas">
        ${CIPHER_TEXT_HINTS.map((h) => `<button type="button" class="btn btn-ghost btn-sm" data-hint="${h.key}">${h.label}</button>`).join("")}
        <button type="button" class="btn btn-ghost btn-sm" data-hint="letter">Una letra</button>
      </div>
    </div>
    <ol class="cipher-hints" aria-live="polite"></ol>
    <div class="cipher-play cipher-giveup">
      <button type="button" class="btn-text" data-act="giveup"><i class="fa-solid fa-flag" aria-hidden="true"></i> Rendirme</button>
    </div>
    <div class="cipher-confirm" hidden>
      <p>¿Seguro? Se revela la palabra y esta transmisión se cierra.</p>
      <div class="cipher-tools">
        <button type="button" class="btn btn-ghost btn-sm" data-act="cancel">No, sigo intentando</button>
        <button type="button" class="btn btn-danger btn-sm" data-act="confirm">Sí, rendirme</button>
      </div>
    </div>
    <div class="cipher-done" hidden>
      <p class="cipher-breakdown"></p>
      <button type="button" class="btn btn-outline" data-act="share"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Compartir resultado</button>
    </div>
  `;

  const section = root.closest(".lore-cipher") || root;
  const grid = root.querySelector(".cipher-grid");
  const boxes = [...root.querySelectorAll(".cipher-box")];
  const hintsEl = root.querySelector(".cipher-hints");
  const statusEl = root.querySelector(".cipher-status");
  const playEls = [...root.querySelectorAll(".cipher-play")];
  const confirmEl = root.querySelector(".cipher-confirm");
  const doneEl = root.querySelector(".cipher-done");

  const givenCount = () => state.used.filter((k) => k === "letter").length;
  const isLocked = (i) => state.status !== "open" || i < givenCount();
  const save = () => writeCipherState(storageKey, state);
  const say = (text, kind = "") => {
    statusEl.textContent = text;
    statusEl.dataset.kind = kind;
  };
  const showPlay = (on) => playEls.forEach((el) => (el.hidden = !on));

  function paint() {
    const given = givenCount();
    boxes.forEach((box, i) => {
      box.value = state.letters[i];
      box.readOnly = isLocked(i);
      box.tabIndex = box.readOnly ? -1 : 0;
      box.classList.toggle("is-given", i < given);
    });

    let letterNo = 0;
    hintsEl.innerHTML = state.used
      .map((k) => {
        if (k === "letter") {
          letterNo += 1;
          return `<li><strong>Letra ${letterNo}.</strong> Es la ${answer[letterNo - 1]}, ya está en su casilla.</li>`;
        }
        const h = CIPHER_TEXT_HINTS.find((x) => x.key === k);
        return `<li><strong>${h.label}.</strong> ${h.text(cryptic)}</li>`;
      })
      .join("");
    CIPHER_TEXT_HINTS.forEach((h) => (root.querySelector(`[data-hint="${h.key}"]`).disabled = state.used.includes(h.key)));
    const letterBtn = root.querySelector('[data-hint="letter"]');
    letterBtn.disabled = given >= maxLetters;
    letterBtn.textContent = given ? "Otra letra" : "Una letra";
    const count = state.used.length;
    root.querySelector(".cipher-hints-title").textContent = count ? `Pistas · llevas ${count}` : "Pistas";

    const over = state.status !== "open";
    section.classList.toggle("is-solved", state.status === "solved");
    section.classList.toggle("is-gaveup", state.status === "gaveup");
    showPlay(!over);
    hintsEl.hidden = over; // al cerrar lo explica el desglose
    doneEl.hidden = !over;
    if (over) {
      confirmEl.hidden = true;
      root.querySelector(".cipher-breakdown").innerHTML = `<span><strong>Definición:</strong> ${cryptic.definition}.</span> <span><strong>Juego de palabras:</strong> ${cryptic.solution}</span>`;
      if (state.status === "solved") say(solvedText(word), "win");
      else say(`La respuesta era ${word}.`);
    }
  }

  // La casilla libre más cercana desde i, hacia adelante (step 1) o hacia atrás (-1).
  function freeFrom(i, step) {
    for (let j = i; j >= 0 && j < n; j += step) if (!isLocked(j)) return j;
    return -1;
  }

  function put(i, letter) {
    state.letters[i] = letter;
    boxes[i].value = letter;
    save();
  }

  function check() {
    if (state.status !== "open") return;
    const missing = state.letters.filter((l) => !l).length;
    if (missing) {
      say(missing === 1 ? "Falta una letra." : `Faltan ${missing} letras.`);
      return;
    }
    if (state.letters.join("") === answer) {
      state.status = "solved";
      save();
      paint();
      return;
    }
    say("No es esa. Vuelve a leer la frase o pide una pista.", "error");
    grid.classList.remove("is-wrong");
    void grid.offsetWidth; // reinicia la sacudida si se equivoca dos veces seguidas
    grid.classList.add("is-wrong");
  }

  function hint(key) {
    if (state.status !== "open") return;
    if (key === "letter") {
      const i = givenCount();
      if (i >= maxLetters) return;
      state.letters[i] = answer[i];
    } else if (state.used.includes(key)) return;
    state.used.push(key);
    save();
    paint();
    say("");
  }

  function giveUp() {
    state.status = "gaveup";
    state.letters = [...answer];
    save();
    paint();
  }

  async function share() {
    const given = givenCount();
    const squares = state.status === "gaveup" ? "⬛".repeat(n) : [...answer].map((_, i) => (i < given ? "⬜" : "🟪")).join("");
    const count = state.used.length;
    const how = state.status === "gaveup" ? "Me rendí" : count === 0 ? "Descifrada sin pistas" : `Descifrada con ${count} ${count === 1 ? "pista" : "pistas"}`;
    const text = `El Octágono · ${shareTitle}\n${squares}\n${how}\n${CIPHER_SHARE_URL}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      say("Resultado copiado. Pégalo en el grupo.", state.status === "solved" ? "win" : "");
    } catch {
      say("No se pudo copiar el resultado.");
    }
  }

  boxes.forEach((box, i) => {
    box.addEventListener("focus", () => {
      if (state.status !== "open") return;
      if (isLocked(i)) {
        const j = freeFrom(i, 1) !== -1 ? freeFrom(i, 1) : freeFrom(i, -1);
        if (j !== -1) boxes[j].focus();
        return;
      }
      box.select();
    });
    box.addEventListener("click", () => box.select());

    // La letra recién escrita es la que queda antes del cursor.
    const take = () => {
      if (isLocked(i)) return;
      const letter = plainLetters(box.value.slice(Math.max(0, box.selectionStart - 1), box.selectionStart) || box.value).slice(-1);
      put(i, letter);
      if (!letter) return;
      const next = freeFrom(i + 1, 1);
      if (next !== -1) boxes[next].focus();
    };
    box.addEventListener("input", (e) => {
      if (!e.isComposing) take();
    });
    box.addEventListener("compositionend", take);

    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      } else if (e.key === "Backspace" && !isLocked(i)) {
        e.preventDefault();
        if (state.letters[i]) put(i, "");
        else {
          const prev = freeFrom(i - 1, -1);
          if (prev !== -1) {
            put(prev, "");
            boxes[prev].focus();
          }
        }
      } else if (e.key === "Delete" && !isLocked(i)) {
        e.preventDefault();
        put(i, "");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const j = e.key === "ArrowLeft" ? freeFrom(i - 1, -1) : freeFrom(i + 1, 1);
        if (j !== -1) boxes[j].focus();
      }
    });

    // Pegar la palabra entera la reparte en las casillas libres desde acá.
    box.addEventListener("paste", (e) => {
      e.preventDefault();
      if (state.status !== "open") return;
      const letters = [...plainLetters(e.clipboardData && e.clipboardData.getData("text"))];
      let j = freeFrom(i, 1);
      let last = i;
      while (letters.length && j !== -1) {
        put(j, letters.shift());
        last = j;
        j = freeFrom(j + 1, 1);
      }
      boxes[j !== -1 ? j : last].focus();
    });
  });

  grid.addEventListener("animationend", () => grid.classList.remove("is-wrong"));
  root.querySelector('[data-act="check"]').addEventListener("click", check);
  root.querySelectorAll("[data-hint]").forEach((btn) => btn.addEventListener("click", () => hint(btn.dataset.hint)));
  root.querySelector('[data-act="share"]').addEventListener("click", share);
  root.querySelector('[data-act="giveup"]').addEventListener("click", () => {
    showPlay(false);
    confirmEl.hidden = false;
    root.querySelector('[data-act="cancel"]').focus();
  });
  root.querySelector('[data-act="cancel"]').addEventListener("click", () => {
    confirmEl.hidden = true;
    showPlay(true);
    root.querySelector('[data-act="giveup"]').focus();
  });
  root.querySelector('[data-act="confirm"]').addEventListener("click", giveUp);
  confirmEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") root.querySelector('[data-act="cancel"]').click();
  });

  paint();
}
