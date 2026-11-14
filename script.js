const catalog = document.getElementById("catalog");
const filtersEl = document.getElementById("filters");
const countEl = document.getElementById("result-count");

let activeFilter = "todos";

// "Ficção Científica" -> "ficcao-cientifica"
const slugify = (text) =>
    text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

// evita que texto dos dados quebre o HTML
const escapeHTML = (text) =>
    String(text).replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

// gera um tom (0-359) estável a partir do título, para o pôster de reserva
const hueFromTitle = (title) => [...title].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 360, 7);

// cria os botões de filtro a partir das categorias que existem na lista
function createFilters() {
    const categories = [...new Set(movieList.map((movie) => movie.category))];
    const options = [{ label: "Todos", value: "todos" }, ...categories.map((c) => ({ label: c, value: slugify(c) }))];

    filtersEl.innerHTML = options
        .map(
            (opt) =>
                `<button type="button" class="filter-btn" data-filter="${opt.value}" aria-pressed="${opt.value === activeFilter}">${escapeHTML(opt.label)}</button>`,
        )
        .join("");
}

// chamada pelos botões de filtro
function filterMovies(category) {
    activeFilter = category;
    filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.dataset.filter === category);
    });
    displayMovies(category);
}

// mostrar os filmes na tela
function displayMovies(category = "todos") {
    const movies = category === "todos" ? movieList : movieList.filter((movie) => slugify(movie.category) === category);

    catalog.innerHTML = "";

    if (movies.length === 0) {
        catalog.innerHTML = `<p class="empty">Nenhum filme nesta categoria ainda.</p>`;
        countEl.textContent = "";
        return;
    }

    movies.forEach((movie) => {
        const card = document.createElement("article");
        card.className = "movie-card";
        card.innerHTML = `
            <div class="poster" style="--hue: ${hueFromTitle(movie.title)}">
                <img src="${escapeHTML(movie.image)}" alt="Pôster de ${escapeHTML(movie.title)}" loading="lazy">
            </div>
            <div class="movie-info">
                <span class="tag">${escapeHTML(movie.category)}</span>
                <h2>${escapeHTML(movie.title)}</h2>
                <p class="description">${escapeHTML(movie.description)}</p>
                <dl class="details">
                    <div><dt>Ano</dt><dd>${movie.year}</dd></div>
                    <div><dt>Direção</dt><dd>${escapeHTML(movie.director)}</dd></div>
                    <div><dt>Elenco</dt><dd>${movie.actors.map(escapeHTML).join(", ")}</dd></div>
                </dl>
            </div>`;

        // se a imagem não carregar, mostra o título como pôster
        const img = card.querySelector("img");
        img.addEventListener("error", () => {
            const poster = img.parentElement;
            poster.classList.add("poster--fallback");
            poster.innerHTML = `<span>${escapeHTML(movie.title)}</span>`;
        });

        catalog.appendChild(card);
    });

    countEl.textContent = `${movies.length} de ${movieList.length} filmes`;
}

filtersEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".filter-btn");
    if (btn) filterMovies(btn.dataset.filter);
});

createFilters();
displayMovies();
