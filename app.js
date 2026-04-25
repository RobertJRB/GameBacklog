const API = "/api/games";

let currentFilters = { buscar: "", estado: "", genero: "", plataforma: "" };
let searchTimer = null;

const gameGrid = document.getElementById("gameGrid");
const emptyState = document.getElementById("emptyState");

const statTotal = document.getElementById("statTotal");
const statJugando = document.getElementById("statJugando");
const statTerminados = document.getElementById("statTerminados");
const statPorJugar = document.getElementById("statPorJugar");
const statPromedio = document.getElementById("statPromedio");

const searchInput = document.getElementById("searchInput");
const filterEstado = document.getElementById("filterEstado");
const filterGenero = document.getElementById("filterGenero");
const filterPlataforma = document.getElementById("filterPlataforma");

const gameModal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const gameForm = document.getElementById("gameForm");
const gameId = document.getElementById("gameId");

const fTitulo = document.getElementById("fTitulo");
const fAnio = document.getElementById("fAnio");
const fGenero = document.getElementById("fGenero");
const fPlataforma = document.getElementById("fPlataforma");
const fEstado = document.getElementById("fEstado");
const fCalificacion = document.getElementById("fCalificacion");
const fPortada = document.getElementById("fPortada");
const fNotas = document.getElementById("fNotas");

const deleteModal = document.getElementById("deleteModal");
const deleteGameName = document.getElementById("deleteGameName");
const deleteGameId = document.getElementById("deleteGameId");

const detailModal = document.getElementById("detailModal");
const detailTitle = document.getElementById("detailTitle");
const detailContent = document.getElementById("detailContent");

const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

async function loadGames() {
  const params = new URLSearchParams();
  if (currentFilters.buscar) params.append("buscar", currentFilters.buscar);
  if (currentFilters.estado) params.append("estado", currentFilters.estado);
  if (currentFilters.genero) params.append("genero", currentFilters.genero);
  if (currentFilters.plataforma) params.append("plataforma", currentFilters.plataforma);

  try {
    const res = await fetch(`${API}?${params.toString()}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    renderStats(data.stats);
    renderGames(data.data);
  } catch (err) {
    showToast("Error al cargar los juegos: " + err.message, true);
  }
}

function renderStats(stats) {
  statTotal.textContent = stats.total;
  statJugando.textContent = stats.jugando;
  statTerminados.textContent = stats.terminados;
  statPorJugar.textContent = stats.porJugar;
  statPromedio.textContent = stats.promedio !== null ? stats.promedio : "—";
}

function renderGames(games) {
  gameGrid.innerHTML = "";

  if (games.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  games.forEach((game, i) => {
    const card = createCard(game, i);
    gameGrid.appendChild(card);
  });
}

function createCard(game, index) {
  const card = document.createElement("div");
  card.className = "game-card";
  card.style.setProperty("--card-accent", getEstadoColor(game.estado));
  card.style.animationDelay = `${index * 0.04}s`;

  const coverHTML = game.portada
    ? `<img src="${escapeHTML(game.portada)}" alt="${escapeHTML(game.titulo)}" class="card-cover" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
    : "";
  const placeholderHTML = `<div class="card-cover-placeholder" ${game.portada ? 'style="display:none"' : ""}>🎮</div>`;

  const ratingHTML = game.calificacion !== null
    ? `<span class="card-rating">★ ${game.calificacion}</span>`
    : "";

  const estadoBadgeClass = `badge-estado badge-${game.estado.toLowerCase().replace(" ", "-")}`;

  card.innerHTML = `
    ${coverHTML}${placeholderHTML}
    <div class="card-body">
      <div class="card-top">
        <span class="card-title">${escapeHTML(game.titulo)}</span>
        ${ratingHTML}
      </div>
      <div class="card-meta">
        <span class="badge badge-estado ${estadoBadgeClass}">${escapeHTML(game.estado)}</span>
        <span class="badge badge-genero">${escapeHTML(game.genero)}</span>
        <span class="badge badge-plataforma">${escapeHTML(game.plataforma)}</span>
      </div>
      <div class="card-actions">
        <button class="card-btn card-btn-edit" data-id="${game._id}">EDITAR</button>
        <button class="card-btn card-btn-delete" data-id="${game._id}" data-name="${escapeHTML(game.titulo)}">ELIMINAR</button>
      </div>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("card-btn")) {
      openDetailModal(game);
    }
  });

  card.querySelector(".card-btn-edit").addEventListener("click", (e) => {
    e.stopPropagation();
    openEditModal(game._id);
  });

  card.querySelector(".card-btn-delete").addEventListener("click", (e) => {
    e.stopPropagation();
    openDeleteModal(game._id, game.titulo);
  });

  return card;
}

function getEstadoColor(estado) {
  const map = {
    "Por jugar": "#ffd700",
    "Jugando": "#00d4ff",
    "Terminado": "#00ff88",
    "Abandonado": "#ff4444",
  };
  return map[estado] || "#1e3a5f";
}

document.getElementById("btnOpenModal").addEventListener("click", () => {
  openCreateModal();
});

function openCreateModal() {
  resetForm();
  modalTitle.textContent = "NUEVO JUEGO";
  gameModal.classList.remove("hidden");
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const game = data.data;
    resetForm();
    modalTitle.textContent = "EDITAR JUEGO";
    gameId.value = game._id;
    fTitulo.value = game.titulo;
    fAnio.value = game.anioLanzamiento || "";
    fGenero.value = game.genero;
    fPlataforma.value = game.plataforma;
    fEstado.value = game.estado;
    fCalificacion.value = game.calificacion !== null ? game.calificacion : "";
    fPortada.value = game.portada || "";
    fNotas.value = game.notas || "";
    gameModal.classList.remove("hidden");
  } catch (err) {
    showToast("Error al cargar el juego: " + err.message, true);
  }
}

function openDetailModal(game) {
  detailTitle.textContent = game.titulo.toUpperCase();

  const coverHTML = game.portada
    ? `<img src="${escapeHTML(game.portada)}" alt="${escapeHTML(game.titulo)}" class="detail-cover" onerror="this.style.display='none'">`
    : "";

  const estadoBadgeClass = `badge badge-estado badge-${game.estado.toLowerCase().replace(" ", "-")}`;

  detailContent.innerHTML = `
    ${coverHTML}
    <div class="detail-row">
      <span class="detail-key">ESTADO</span>
      <span class="${estadoBadgeClass}">${escapeHTML(game.estado)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">GÉNERO</span>
      <span class="detail-val">${escapeHTML(game.genero)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">PLATAFORMA</span>
      <span class="detail-val">${escapeHTML(game.plataforma)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">AÑO</span>
      <span class="detail-val">${game.anioLanzamiento || "—"}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">CALIFICACIÓN</span>
      <span class="detail-val" style="color:var(--yellow)">${game.calificacion !== null ? `★ ${game.calificacion} / 10` : "Sin calificar"}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">AGREGADO</span>
      <span class="detail-val">${new Date(game.createdAt).toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" })}</span>
    </div>
    ${game.notas ? `<div class="detail-notes">${escapeHTML(game.notas)}</div>` : ""}
  `;

  detailModal.classList.remove("hidden");
}

document.getElementById("btnCloseDetail").addEventListener("click", () => {
  detailModal.classList.add("hidden");
});

detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) detailModal.classList.add("hidden");
});

gameForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const payload = {
    titulo: fTitulo.value.trim(),
    genero: fGenero.value,
    plataforma: fPlataforma.value,
    estado: fEstado.value,
    calificacion: fCalificacion.value !== "" ? parseFloat(fCalificacion.value) : null,
    portada: fPortada.value.trim(),
    notas: fNotas.value.trim(),
    anioLanzamiento: fAnio.value !== "" ? parseInt(fAnio.value) : null,
  };

  const id = gameId.value;
  const isEdit = !!id;
  const url = isEdit ? `${API}/${id}` : API;
  const method = isEdit ? "PUT" : "POST";

  try {
    const btnSave = document.getElementById("btnSave");
    btnSave.textContent = "GUARDANDO...";
    btnSave.disabled = true;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    gameModal.classList.add("hidden");
    showToast(data.message);
    await loadGames();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    const btnSave = document.getElementById("btnSave");
    btnSave.textContent = "GUARDAR";
    btnSave.disabled = false;
  }
});

function validateForm() {
  let valid = true;

  clearErrors();

  if (!fTitulo.value.trim() || fTitulo.value.trim().length < 2) {
    showError("errTitulo", "El título debe tener al menos 2 caracteres");
    fTitulo.classList.add("error");
    valid = false;
  }

  if (!fGenero.value) {
    showError("errGenero", "Selecciona un género");
    fGenero.classList.add("error");
    valid = false;
  }

  if (!fPlataforma.value) {
    showError("errPlataforma", "Selecciona una plataforma");
    fPlataforma.classList.add("error");
    valid = false;
  }

  const cal = fCalificacion.value;
  if (cal !== "" && (parseFloat(cal) < 0 || parseFloat(cal) > 10)) {
    showToast("La calificación debe estar entre 0 y 10", true);
    valid = false;
  }

  return valid;
}

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".form-input.error").forEach((el) => el.classList.remove("error"));
}

function openDeleteModal(id, name) {
  deleteGameId.value = id;
  deleteGameName.textContent = name;
  deleteModal.classList.remove("hidden");
}

document.getElementById("btnCancelDelete").addEventListener("click", () => {
  deleteModal.classList.add("hidden");
});

deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) deleteModal.classList.add("hidden");
});

document.getElementById("btnConfirmDelete").addEventListener("click", async () => {
  const id = deleteGameId.value;
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    deleteModal.classList.add("hidden");
    showToast(data.message);
    await loadGames();
  } catch (err) {
    showToast("Error al eliminar: " + err.message, true);
  }
});

document.getElementById("btnCloseModal").addEventListener("click", () => {
  gameModal.classList.add("hidden");
});

document.getElementById("btnCancelForm").addEventListener("click", () => {
  gameModal.classList.add("hidden");
});

gameModal.addEventListener("click", (e) => {
  if (e.target === gameModal) gameModal.classList.add("hidden");
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentFilters.buscar = searchInput.value.trim();
    loadGames();
  }, 350);
});

filterEstado.addEventListener("change", () => {
  currentFilters.estado = filterEstado.value;
  loadGames();
});

filterGenero.addEventListener("change", () => {
  currentFilters.genero = filterGenero.value;
  loadGames();
});

filterPlataforma.addEventListener("change", () => {
  currentFilters.plataforma = filterPlataforma.value;
  loadGames();
});

document.getElementById("btnClearFilters").addEventListener("click", () => {
  currentFilters = { buscar: "", estado: "", genero: "", plataforma: "" };
  searchInput.value = "";
  filterEstado.value = "";
  filterGenero.value = "";
  filterPlataforma.value = "";
  loadGames();
});

let toastTimer = null;

function showToast(msg, isError = false) {
  toastMsg.textContent = msg;
  toast.className = "toast" + (isError ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3500);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resetForm() {
  gameForm.reset();
  gameId.value = "";
  clearErrors();
}

loadGames();
