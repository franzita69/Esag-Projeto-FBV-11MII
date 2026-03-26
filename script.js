const routes = {
  home: "view-home",
  motivos: "view-motivos",
  ideias: "view-ideias",
  pesquisa: "view-pesquisa",
  jogo: "view-jogo",
};

const state = {
  index: 0,
  autonomy: 0,
  order: 0,
  empathy: 0,
};

const questions = [
  {
    title: "Pergunta 1",
    text: "Como acreditas que o governo pode garantir que todos participam de forma justa na democracia?",
    choices: [
      {
        label: "Promovendo um ambiente de diálogo e escuta ativa, garantindo que as minorias sejam ouvidas.",
        trait: "empathy",
      },
      {
        label: "Permitindo que as pessoas escolham livremente os seus representantes, sem imposições.",
        trait: "autonomy",
      },
      {
        label: "Criando um sistema rígido de regras para que o processo seja organizado e sem falhas.",
        trait: "order",
      },
    ],
  },
  {
    title: "Pergunta 2",
    text: "Num sistema de saúde pública, qual é a melhor forma de garantir acesso a todos, especialmente aos mais vulneráveis?",
    choices: [
      {
        label: "Oferecendo programas de saúde específicos para responder às necessidades das populações em situação de vulnerabilidade.",
        trait: "empathy",
      },
      {
        label: "Permitindo que os cidadãos escolham os serviços de saúde que melhor respondem às suas necessidades.",
        trait: "autonomy",
      },
      {
        label: "Estabelecendo políticas de saúde que garantam uma distribuição equitativa e controlada dos recursos, de forma uniforme.",
        trait: "order",
      },
    ],
  },
  {
    title: "Pergunta 3",
    text: "O que pensas da intervenção do governo para regular a liberdade de expressão nos media?",
    choices: [
      {
        label: "O governo deve intervir para proteger grupos vulneráveis da desinformação e dos discursos de ódio.",
        trait: "empathy",
      },
      {
        label: "Os media devem ser livres para expressar qualquer opinião, sem limitações do governo.",
        trait: "autonomy",
      },
      {
        label: "O governo deve impor regras claras sobre o que pode ser publicado, para garantir a ordem pública.",
        trait: "order",
      },
    ],
  },
  {
    title: "Pergunta 4",
    text: "Numa democracia, como acreditas que o governo deve equilibrar a liberdade do cidadão com o bem-estar coletivo?",
    choices: [
      {
        label: "O governo deve ouvir as necessidades dos cidadãos e procurar soluções que respondam a todos, principalmente aos mais necessitados.",
        trait: "empathy",
      },
      {
        label: "O governo deve permitir a máxima liberdade possível, deixando que as pessoas tomem decisões por conta própria.",
        trait: "autonomy",
      },
      {
        label: "O governo deve garantir que existam leis claras e consistentes que mantenham a ordem e protejam o coletivo, mesmo que restrinjam algumas liberdades.",
        trait: "order",
      },
    ],
  },
];

const THEME_LOOP_START = 123;
const THEME_LOOP_END = 147;
const MUSIC_ENABLED_KEY = "decidimos_music_enabled";

const bodyEl = document.body;
const viewSections = Array.from(document.querySelectorAll(".view-section"));
const audioUnlockButtonEl = document.getElementById("audio-unlock");
const themeAudioEl = document.getElementById("theme-audio");
const gameAudioEl = document.getElementById("game-audio");
const endingBadAudioEl = document.getElementById("ending-bad-audio");
const endingGoodAudioEl = document.getElementById("ending-good-audio");
const endingMidAudioEl = document.getElementById("ending-mid-audio");
const bookInfoToggleEl = document.getElementById("book-info-toggle");
const bookInfoEl = document.getElementById("book-info");

const progressEl = document.getElementById("progress");
const traitsEl = document.getElementById("traits");
const questionTitleEl = document.getElementById("question-title");
const questionTextEl = document.getElementById("question-text");
const choiceButtons = [
  document.getElementById("choice-1"),
  document.getElementById("choice-2"),
  document.getElementById("choice-3"),
];
const progressDotsEl = Array.from(document.querySelectorAll(".progress-dot"));
const consequenceFigureEl = document.getElementById("consequence-figure");
const consequenceTextEl = document.getElementById("consequence-text");
const analysisBoxEl = document.getElementById("analysis-box");
const analysisTitleEl = document.getElementById("analysis-title");
const analysisTextEl = document.getElementById("analysis-text");
const endingVisionEl = document.getElementById("ending-vision");
const endingTextEl = document.getElementById("ending-text");
const restartButtonEl = document.getElementById("restart-game");

let audioUnlocked = window.sessionStorage.getItem(MUSIC_ENABLED_KEY) === "true";
let endingTimeoutId;

function setPageReady() {
  window.requestAnimationFrame(() => {
    bodyEl.classList.add("page-ready");
  });
}

function normaliseRoute(hashValue) {
  const route = (hashValue || "#home").replace("#", "").trim().toLowerCase();
  return routes[route] ? route : "home";
}

function stopEndingAudios() {
  [endingBadAudioEl, endingGoodAudioEl, endingMidAudioEl].forEach((audio) => {
    if (!audio) {
      return;
    }
    audio.pause();
    audio.currentTime = 0;
  });
}

function updateBodyMode(route) {
  bodyEl.classList.toggle("home-page", route === "home");
  bodyEl.classList.toggle("detail-page", route !== "home");
}

function syncAmbientAudio(route) {
  const onGame = route === "jogo";

  if (onGame) {
    if (themeAudioEl) {
      themeAudioEl.pause();
    }
    if (audioUnlocked && gameAudioEl) {
      gameAudioEl.volume = 0.12;
      gameAudioEl.play().catch(() => {});
    }
    return;
  }

  if (gameAudioEl) {
    gameAudioEl.pause();
    gameAudioEl.currentTime = 0;
  }

  if (!audioUnlocked || !themeAudioEl) {
    return;
  }

  themeAudioEl.volume = 0.14;

  const applyLoopStart = () => {
    if (themeAudioEl.currentTime < THEME_LOOP_START || themeAudioEl.currentTime > THEME_LOOP_END) {
      themeAudioEl.currentTime = THEME_LOOP_START;
    }
  };

  if (themeAudioEl.readyState >= 1) {
    applyLoopStart();
  } else {
    themeAudioEl.addEventListener("loadedmetadata", applyLoopStart, { once: true });
  }

  themeAudioEl.play().catch(() => {});
}

function showAudioButtonIfNeeded() {
  if (!audioUnlockButtonEl) {
    return;
  }
  audioUnlockButtonEl.classList.toggle("hidden", audioUnlocked);
}

function startAmbientAudio() {
  audioUnlocked = true;
  window.sessionStorage.setItem(MUSIC_ENABLED_KEY, "true");
  showAudioButtonIfNeeded();
  syncAmbientAudio(normaliseRoute(window.location.hash));
}

function enableAudio() {
  showAudioButtonIfNeeded();

  if (audioUnlocked) {
    syncAmbientAudio(normaliseRoute(window.location.hash));
  }

  const unlockAudio = () => {
    startAmbientAudio();
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };

  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  if (audioUnlockButtonEl) {
    audioUnlockButtonEl.addEventListener("click", startAmbientAudio);
  }
}

function enableThemeLoopLimit() {
  if (!themeAudioEl) {
    return;
  }

  themeAudioEl.addEventListener("timeupdate", () => {
    if (themeAudioEl.currentTime >= THEME_LOOP_END) {
      themeAudioEl.currentTime = THEME_LOOP_START;
      if (!themeAudioEl.paused) {
        themeAudioEl.play().catch(() => {});
      }
    }
  });
}

function updateGameTone() {
  bodyEl.classList.remove("tone-autonomy", "tone-order", "tone-empathy");

  if (normaliseRoute(window.location.hash) !== "jogo") {
    return;
  }

  if (state.autonomy >= state.order && state.autonomy >= state.empathy && state.autonomy > 0) {
    bodyEl.classList.add("tone-autonomy");
    return;
  }

  if (state.order >= state.autonomy && state.order >= state.empathy && state.order > 0) {
    bodyEl.classList.add("tone-order");
    return;
  }

  if (state.empathy > 0) {
    bodyEl.classList.add("tone-empathy");
  }
}

function updateTraits() {
  if (!traitsEl) {
    return;
  }
  traitsEl.textContent = `Resistência ${state.autonomy} | Ordem ${state.order} | Empatia ${state.empathy}`;
}

function updateProgressDots() {
  progressDotsEl.forEach((dot, index) => {
    dot.classList.remove("active", "done");

    if (index < state.index) {
      dot.classList.add("done");
      return;
    }

    if (index === state.index && state.index < questions.length) {
      dot.classList.add("active");
    }
  });
}

function updateConsequenceFigure() {
  if (!consequenceFigureEl || !consequenceTextEl) {
    return;
  }

  consequenceFigureEl.classList.remove("tone-neutral", "tone-autonomy", "tone-order", "tone-empathy");

  if (state.autonomy === 0 && state.order === 0 && state.empathy === 0) {
    consequenceFigureEl.classList.add("tone-neutral");
    consequenceTextEl.textContent = "Ainda sem danos.";
    return;
  }

  if (state.autonomy >= state.order && state.autonomy >= state.empathy) {
    consequenceFigureEl.classList.add("tone-autonomy");
    consequenceTextEl.textContent = "Fratura. Exposição. Sangue.";
    return;
  }

  if (state.order >= state.autonomy && state.order >= state.empathy) {
    consequenceFigureEl.classList.add("tone-order");
    consequenceTextEl.textContent = "Corpo preso. Garganta apertada.";
    return;
  }

  consequenceFigureEl.classList.add("tone-empathy");
  consequenceTextEl.textContent = "Ferida aberta. Exaustão.";
}

function renderQuestion() {
  if (!questionTitleEl || !questionTextEl) {
    return;
  }

  const question = questions[state.index];
  const choiceGridEl = document.querySelector(".choice-grid");

  progressEl.textContent = `Pergunta ${state.index + 1} de ${questions.length}`;
  questionTitleEl.textContent = question.title;
  questionTextEl.textContent = question.text;
  questionTextEl.classList.remove("final-message");
  analysisBoxEl.classList.add("hidden");

  if (endingVisionEl) {
    endingVisionEl.classList.add("hidden");
    endingVisionEl.classList.remove("ending-good", "ending-mid", "ending-bad");
  }

  if (choiceGridEl) {
    choiceGridEl.classList.remove("hidden");
  }

  choiceButtons.forEach((button, index) => {
    button.disabled = false;
    button.textContent = question.choices[index].label;
  });

  updateTraits();
  updateProgressDots();
  updateConsequenceFigure();
  updateGameTone();
}

function getAnalysis() {
  if (state.autonomy >= state.order && state.autonomy >= state.empathy) {
    return {
      ending: "good",
      endingText: "Ainda tens voz.",
      title: "Perfil: resistência crítica",
      text: "As tuas escolhas mostram tendência para defender a liberdade, o questionamento e a autonomia, mesmo em cenários de medo. Valorizas o direito de pensar antes de obedecer.",
    };
  }

  if (state.order >= state.autonomy && state.order >= state.empathy) {
    return {
      ending: "bad",
      endingText: "Já não decides. Só obedeces.",
      title: "Perfil: procura de ordem",
      text: "As tuas escolhas revelam preferência por estrutura, controlo e estabilidade em tempos de crise. Para ti, a segurança coletiva pode justificar limites mais fortes.",
    };
  }

  return {
    ending: "mid",
    endingText: "Salvaste algo. Perdeste outra parte.",
    title: "Perfil: cuidado social",
    text: "As tuas respostas mostram preocupação com a proteção humana e com o impacto coletivo. A tua tendência é decidir a partir das consequências para os mais vulneráveis.",
  };
}

function playEndingAudio(type) {
  const map = {
    bad: endingBadAudioEl,
    good: endingGoodAudioEl,
    mid: endingMidAudioEl,
  };
  const audio = map[type];

  if (!audio) {
    return;
  }

  if (gameAudioEl) {
    gameAudioEl.volume = 0.05;
  }

  audio.currentTime = 0;
  audio.volume = 0.72;
  audio.play().catch(() => {});
}

function finishGame() {
  const analysis = getAnalysis();
  const choiceGridEl = document.querySelector(".choice-grid");

  progressEl.textContent = "Escape concluído";
  questionTitleEl.textContent = "Saíste da sala";
  questionTextEl.textContent =
    "As portas abriram, mas ficou uma pergunta: até onde vai a tua liberdade quando a crise pede segurança, obediência ou proteção?";
  questionTextEl.classList.add("final-message");

  choiceButtons.forEach((button) => {
    button.disabled = true;
  });

  if (choiceGridEl) {
    choiceGridEl.classList.add("hidden");
  }

  progressDotsEl.forEach((dot) => {
    dot.classList.remove("active");
    dot.classList.add("done");
  });

  updateConsequenceFigure();
  updateGameTone();
  stopEndingAudios();

  if (endingVisionEl && endingTextEl) {
    endingVisionEl.classList.remove("hidden", "ending-good", "ending-mid", "ending-bad");
    endingVisionEl.classList.add(`ending-${analysis.ending}`);
    endingTextEl.textContent = analysis.endingText;
  }

  playEndingAudio(analysis.ending);

  endingTimeoutId = window.setTimeout(() => {
    stopEndingAudios();

    if (gameAudioEl) {
      gameAudioEl.volume = 0.12;
    }

    if (endingVisionEl) {
      endingVisionEl.classList.add("hidden");
      endingVisionEl.classList.remove("ending-good", "ending-mid", "ending-bad");
    }

    analysisTitleEl.textContent = analysis.title;
    analysisTextEl.textContent = analysis.text;
    analysisBoxEl.classList.remove("hidden");
  }, 2200);
}

function choose(trait) {
  state[trait] += 1;
  state.index += 1;

  if (state.index >= questions.length) {
    finishGame();
    return;
  }

  renderQuestion();
}

function restartGame() {
  if (endingTimeoutId) {
    window.clearTimeout(endingTimeoutId);
  }

  stopEndingAudios();

  if (gameAudioEl) {
    gameAudioEl.volume = 0.12;
  }

  state.index = 0;
  state.autonomy = 0;
  state.order = 0;
  state.empathy = 0;
  renderQuestion();
}

function enableGame() {
  if (!restartButtonEl || !choiceButtons.every(Boolean)) {
    return;
  }

  choiceButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const trait = questions[state.index].choices[index].trait;
      choose(trait);
    });
  });

  restartButtonEl.addEventListener("click", restartGame);
  renderQuestion();
}

function enableBookInfo() {
  if (!bookInfoToggleEl || !bookInfoEl) {
    return;
  }

  bookInfoToggleEl.addEventListener("click", () => {
    const isOpen = bookInfoEl.classList.contains("open");

    if (isOpen) {
      bookInfoEl.classList.remove("open");
      window.setTimeout(() => {
        if (!bookInfoEl.classList.contains("open")) {
          bookInfoEl.classList.add("hidden");
        }
      }, 350);
      bookInfoToggleEl.setAttribute("aria-expanded", "false");
      bookInfoToggleEl.textContent = "Saber mais";
      return;
    }

    bookInfoEl.classList.remove("hidden");
    window.requestAnimationFrame(() => {
      bookInfoEl.classList.add("open");
    });
    bookInfoToggleEl.setAttribute("aria-expanded", "true");
    bookInfoToggleEl.textContent = "Esconder";
  });
}

function showRoute(route) {
  viewSections.forEach((section) => {
    section.hidden = section.id !== routes[route];
  });

  updateBodyMode(route);
  syncAmbientAudio(route);

  if (route === "jogo") {
    updateGameTone();
  } else {
    bodyEl.classList.remove("tone-autonomy", "tone-order", "tone-empathy");
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function enableRouting() {
  const renderRoute = () => {
    showRoute(normaliseRoute(window.location.hash));
  };

  window.addEventListener("hashchange", renderRoute);

  if (!window.location.hash) {
    window.location.hash = "#home";
    return;
  }

  renderRoute();
}

setPageReady();
enableThemeLoopLimit();
enableAudio();
enableBookInfo();
enableGame();
enableRouting();
