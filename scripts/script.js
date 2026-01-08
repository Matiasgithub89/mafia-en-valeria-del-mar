document.addEventListener("DOMContentLoaded", () => {
  const imagesFolder = "./imagenes/";
  const body = document.body;

  // Si viene role=..., es VISTA JUGADOR
  const params = new URLSearchParams(window.location.search);
  const roleParam = (params.get("role") || "").trim().toLowerCase();

  const playerView = document.getElementById("player-view");
  const hostView = document.getElementById("host-view");

  // =========================
  // VISTA JUGADOR
  // =========================
  if (roleParam) {
    // En jugador NO queremos el fondo de portada
    body.classList.remove("start-background");

    renderPlayerView(roleParam, imagesFolder);
    playerView.classList.remove("hidden");
    hostView.classList.add("hidden");
    return;
  }

  // =========================
  // VISTA HOST (INICIO)
  // =========================
  hostView.classList.remove("hidden");
  playerView.classList.add("hidden");

  // Fondo de portada solo al inicio (setup)
  body.classList.add("start-background");

  // Host UI
  const setupPanel = document.getElementById("setup-panel");
  const dealingPanel = document.getElementById("dealing-panel");

  const playersCountInput = document.getElementById("playersCount");
  const startBtn = document.getElementById("startBtn");

  const currentPlayerEl = document.getElementById("currentPlayer");
  const totalPlayersEl = document.getElementById("totalPlayers");
  const qrImg = document.getElementById("qrImg");

  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");

  // Estado del reparto (solo en memoria)
  let rolesDeck = [];
  let totalPlayers = 0;
  let currentIndex = 0;

  startBtn.addEventListener("click", () => {
    const n = Number(playersCountInput.value);

    if (!Number.isFinite(n) || n < 4) {
      alert("La cantidad mínima es 4 jugadores.");
      return;
    }

    totalPlayers = n;
    rolesDeck = buildRolesDeck(totalPlayers);
    shuffleInPlace(rolesDeck);

    currentIndex = 0;

    // Al arrancar el reparto, sacamos el fondo para priorizar contraste del QR
    body.classList.remove("start-background");

    setupPanel.classList.add("hidden");
    dealingPanel.classList.remove("hidden");

    totalPlayersEl.textContent = String(totalPlayers);
    renderCurrentQR();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex += 1;

    if (currentIndex >= totalPlayers) {
      // Fin del reparto
      qrImg.removeAttribute("src");
      currentPlayerEl.textContent = String(totalPlayers);
      nextBtn.disabled = true;
      nextBtn.textContent = "Reparto terminado ✅";
      return;
    }

    renderCurrentQR();
  });

  restartBtn.addEventListener("click", () => {
    // reinicia UI y estado
    rolesDeck = [];
    totalPlayers = 0;
    currentIndex = 0;

    nextBtn.disabled = false;
    nextBtn.textContent = "Siguiente jugador";

    dealingPanel.classList.add("hidden");
    setupPanel.classList.remove("hidden");

    qrImg.removeAttribute("src");

    // Volvemos al inicio -> vuelve el fondo
    body.classList.add("start-background");
  });

  function renderCurrentQR() {
    const playerNumber = currentIndex + 1;
    currentPlayerEl.textContent = String(playerNumber);

    const role = rolesDeck[currentIndex]; // "mafia" | "doctor" | "detective" | "pueblo"

    // Construimos URL del jugador: misma página, con role=
    const url = new URL(window.location.href);

    // Limpia params viejos por las dudas (ej: si recargaste con cosas raras)
    url.searchParams.delete("role");
    url.searchParams.set("role", role);

    const qrUrl = buildQrApiUrl(url.toString(), 260);

    qrImg.src = qrUrl;
    qrImg.alt = `QR Jugador ${playerNumber}`;
  }
});

/**
 * Crea el mazo: 1 mafia, 1 doctor, 1 detective, resto pueblo.
 */
function buildRolesDeck(totalPlayers) {
  const deck = ["mafia", "doctor", "detective"];
  while (deck.length < totalPlayers) deck.push("pueblo");
  return deck;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Usa la misma API de QR que ya venías usando.
 */
function buildQrApiUrl(dataUrl, sizePx) {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    dataUrl
  )}&size=${sizePx}x${sizePx}`;
}

/**
 * Vista jugador: muestra imagen del rol.
 */
function renderPlayerView(role, imagesFolder) {
  const img = document.getElementById("player-role-img");
  const txt = document.getElementById("player-role-text");

  const roleMap = {
    mafia: { file: "mafia1.png", label: "Sos la Mafia 😈" },
    doctor: { file: "doctor.png", label: "Sos el Doctor 🩺" },
    detective: { file: "detective.png", label: "Sos el Detective 🔎" },
    pueblo: { file: "pueblo.png", label: "Sos del Pueblo 🙂" },
  };

  const found = roleMap[role];
  if (!found) {
    img.removeAttribute("src");
    img.alt = "Rol desconocido";
    txt.textContent = "Rol inválido.";
    return;
  }

  img.src = `${imagesFolder}${found.file}`;
  img.alt = found.label;
  txt.textContent = found.label;
}
